// Ronda 15: privacidad y recuperación del almacén de radar (public/js/almacen.js), con API y almacenamiento SIMULADOS y carreras deterministas.
// Hallazgos de la revisión de la ronda 14: (1) la migración del radar local seguía escribiendo bajo OTRA cuenta; (2) un GET retrasado dejaba el radar vacío tras
// guardar; (3) el borrado de la última fila podía fallar en silencio. Uso: node tests/ronda15/unit-almacen.mjs [ruta-del-almacen.js]
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-ALMACEN.json');
const ruta = process.argv[2] || '../../public/js/almacen.js';
const { crearAlmacen, ERR_LECTURA, ERR_ESCRITURA } = await import(new URL(ruta, import.meta.url).href);
const J = JSON.stringify;
const puerta = () => { let abre; const p = new Promise(r => { abre = r; }); return { p, abre }; };
// almacenamiento simulado con fallos a voluntad
function nuevoStore(inicial = {}) {
  const d = { ...inicial }, f = { leer: false, escribir: false, borrar: false };
  return { d, f, store: { ok: true, getItem: k => d[k] ?? null, setItem: (k, v) => { d[k] = v; }, removeItem: k => { delete d[k]; },
    getItemEstricto: k => { if (f.leer) throw new Error('bloqueado'); return d[k] ?? null; }, setItemEstricto: (k, v) => { if (f.escribir) throw new Error('lleno'); d[k] = v; },
    removeItemEstricto: k => { if (f.borrar) throw new Error('no se puede borrar'); delete d[k]; } } };
}
const activos = () => ({ JNJ: { nombre: 'J&J', sector: 'Salud', tipo: 'accion' }, KO: { nombre: 'Coca', sector: 'Consumo', tipo: 'accion' } });
const LOCAL = { klever_radar_local: J({ JNJ: { nota: 'nota JNJ de A', t: 'x' }, KO: { nota: 'nota KO de A', t: 'x' } }) };

// ---- 1. migración atada a la sesión: se cambia de cuenta mientras la lectura está retrasada
{
  const { d, store } = nuevoStore(LOCAL), llamadas = [], g = puerta(); let sesion = 'A';
  const api = async (ruta, o = {}) => { llamadas.push(`${sesion}:${o.method || 'GET'} ${ruta}`); if (!o.method) { await g.p; return []; } return { ok: true, nota: o.body?.nota ?? '' }; };
  const a = crearAlmacen({ api, logged: () => true, store, activos, idSesion: () => sesion });
  const m = a.radar.migrarLocal(); await Promise.resolve();
  a.reiniciar(); sesion = 'B'; g.abre(); const n = await m;
  t('A1', 'La migración empieza bajo A, se retrasa la lectura, se reinicia el módulo y se pasa a B', 'Ningún PUT (ni bajo A ni bajo B) y el radar local de A NO se borra', `${J(llamadas)}; migrados ${n}; local conservado ${d.klever_radar_local !== undefined}`, !llamadas.some(x => x.includes('PUT')) && n === 0 && d.klever_radar_local !== undefined);
}
// ---- 2. interrupción ENTRE las dos escrituras
{
  const { d, store } = nuevoStore(LOCAL), llamadas = [], g = puerta(); let sesion = 'A', puts = 0;
  const api = async (ruta, o = {}) => { llamadas.push(`${sesion}:${o.method || 'GET'} ${ruta}`); if (!o.method) return []; puts++; if (puts === 1) await g.p; return { ok: true, nota: o.body?.nota ?? '' }; };
  const a = crearAlmacen({ api, logged: () => true, store, activos, idSesion: () => sesion });
  const m = a.radar.migrarLocal(); await new Promise(r => setTimeout(r, 5));
  a.reiniciar(); sesion = 'B'; g.abre(); const n = await m;
  t('A2', 'Se cambia de cuenta entre la primera y la segunda escritura', 'Solo se envió el primer PUT (bajo A); el segundo no sale; el original local no se borra', `${J(llamadas)}; local conservado ${d.klever_radar_local !== undefined}`, llamadas.filter(x => x.includes('PUT')).length === 1 && llamadas.filter(x => x.startsWith('B:')).length === 0 && d.klever_radar_local !== undefined);
}
// ---- 3. sin interrupciones: migra y borra el original solo al terminar
{
  const { d, store } = nuevoStore(LOCAL), llamadas = [];
  const api = async (ruta, o = {}) => { llamadas.push(`${o.method || 'GET'} ${ruta}`); return o.method ? { ok: true, nota: o.body?.nota ?? '' } : []; };
  const a = crearAlmacen({ api, logged: () => true, store, activos, idSesion: () => 'A' }), n = await a.radar.migrarLocal();
  t('A3', 'Migración sin interrupciones', 'Migra las dos empresas y solo entonces borra el original local', `migrados ${n}; ${J(llamadas)}; local ${d.klever_radar_local}`, n === 2 && d.klever_radar_local === undefined);
}
// ---- 4. lectura anterior a una escritura: no pisa el resultado
{
  const { store } = nuevoStore(), g = puerta(); let lectura = 0;
  const api = async (ruta, o = {}) => { if (!o.method) { lectura++; await g.p; return []; } return { ok: true, nota: o.body?.nota ?? '', creado_en: 'x', actualizado_en: 'x' }; };
  const a = crearAlmacen({ api, logged: () => true, store, activos, idSesion: () => 'A' });
  const c = a.radar.cargar(); await Promise.resolve();
  await a.radar.guardar('JNJ', 'nota guardada correctamente'); g.abre(); await c;
  t('A4', 'Un GET retrasado que devuelve «vacío» llega DESPUÉS de guardar una nota', 'La copia en memoria conserva la nota (la lectura es anterior a la escritura y no se aplica)', `«${a.radar.nota('JNJ')}»; empresas ${a.radar.todos().length}`, a.radar.nota('JNJ') === 'nota guardada correctamente' && a.radar.todos().length === 1);
}
// ---- 5. almacenamiento bloqueado desde el inicio
{
  const { store, f } = nuevoStore(); f.leer = true; f.escribir = true;
  const a = crearAlmacen({ api: async () => ({}), logged: () => false, store, activos });
  let l = '', e = '';
  try { await a.radar.cargar(); } catch (er) { l = er.tipo; } try { await a.radar.guardar('JNJ', 'x'); } catch (er) { e = er.tipo; }
  t('A5', 'Almacenamiento bloqueado desde el inicio (lectura y escritura fallan)', 'Leer lanza error de LECTURA (no «radar vacío») y guardar también (no se escribe sin poder leer); nada queda en memoria', `${l} / ${e}; empresas ${a.radar.todos().length}`, l === ERR_LECTURA && e === ERR_LECTURA && a.radar.todos().length === 0);
  { const { store: s2, f: f2 } = nuevoStore(); f2.escribir = true; const b = crearAlmacen({ api: async () => ({}), logged: () => false, store: s2, activos }); let e2 = ''; try { await b.radar.guardar('JNJ', 'x'); } catch (er) { e2 = er.tipo; }
    t('A5b', 'Se puede leer pero NO escribir (cuota llena)', 'Guardar lanza error de ESCRITURA y la memoria no cambia', `${e2}; empresas ${b.radar.todos().length}`, e2 === ERR_ESCRITURA && b.radar.todos().length === 0); }
}
// ---- 6. el último borrado falla: no se finge que se borró
{
  const { d, store, f } = nuevoStore(), a = crearAlmacen({ api: async () => ({}), logged: () => false, store, activos });
  await a.radar.guardar('JNJ', 'una sola'); f.borrar = true; let e = '';
  try { await a.radar.quitar('JNJ'); } catch (er) { e = er.tipo; }
  t('A6', 'El borrado de la ÚLTIMA fila falla', 'Lanza error de escritura; el dato sigue en el almacenamiento y en memoria (no se oculta el fallo)', `${e}; en disco «${d.klever_radar_local}»; memoria ${a.radar.todos().length}`, e === ERR_ESCRITURA && d.klever_radar_local !== undefined && a.radar.todos().length === 1);
  f.borrar = false; await a.radar.quitar('JNJ');
  t('A6b', 'Recuperado el almacenamiento, el borrado funciona y sobrevive a «recargar»', 'Sin radar en disco ni en una instancia nueva', `disco ${d.klever_radar_local}; nueva ${(await crearAlmacen({ api: async () => ({}), logged: () => false, store, activos }).radar.cargar()).length}`, d.klever_radar_local === undefined);
}
// ---- 7. datos dañados ≠ vacío
{
  const { d, store } = nuevoStore({ klever_radar_local: '{dañado' }), a = crearAlmacen({ api: async () => ({}), logged: () => false, store, activos });
  let e = ''; try { await a.radar.cargar(); } catch (er) { e = er.tipo; } let w = ''; try { await a.radar.guardar('KO', 'no debe pisar'); } catch (er) { w = er.tipo; }
  t('A7', 'Datos locales dañados', 'Leer y guardar lanzan error de lectura; el valor dañado NO se sobrescribe', `${e} / ${w}; disco «${d.klever_radar_local}»`, e === ERR_LECTURA && w === ERR_LECTURA && d.klever_radar_local === '{dañado');
}
await fin();
