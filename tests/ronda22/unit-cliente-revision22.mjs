// Ronda 22 · el CLIENTE del registro de revisiones (`public/js/revisiones.js`) contra el SERVIDOR REAL (SQLite real), con fallos inyectados en el camino de red. No prueba solo el endpoint: prueba lo que el cliente hace con cada
// resultado (la ronda 21 daba por «no registrada» una revisión que sí estaba guardada tras un GET fallido y reintentaba con otra clave). Casos de la revisión de la ronda 21 (tabla D):
//   POST confirmado + lectura posterior fallida · POST persistido con la respuesta perdida · texto modificado con un intento incierto · dos pestañas con versión antigua · rechazo del servidor · fallo de infraestructura.
// Uso: node tests/ronda22/unit-cliente-revision22.mjs
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import * as RV from '../../functions/api/escenarios/[id]/revisiones.js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { nuevoIntento, enviarIntento, actualizarVista, mismoContenido } from '../../public/js/revisiones.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-CLI22.json');
const J = JSON.stringify;
const env = crearEnv(); await sembrar(env);
for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`);
const llama = async (f, m, body, params = {}) => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: body === undefined ? undefined : J(body) }), env, params }); return { ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }; };
const falla = r => { const e = new Error(r.j.error || 'Error ' + r.status); e.status = r.status; e.data = r.j; return e; };
// almacén de escenarios del cliente sobre los manejadores REALES; `fallos` inyecta los cortes de red (se consumen)
const fallos = { perderRespuesta: 0, caerAntes: 0, caerLeer: 0, http500: 0 };
let claves = 0; const enviadas = [];
const alm = {
  nuevaClave: () => 'cliente-rev-' + String(++claves).padStart(6, '0'),
  async revisar(id, cuerpo) {
    enviadas.push(J(cuerpo));
    if (fallos.caerAntes > 0) { fallos.caerAntes--; throw new Error('Sin conexión con el servidor. Inténtalo de nuevo.'); }       // la petición NO llega
    if (fallos.http500 > 0) { fallos.http500--; const e = new Error('Error 500'); e.status = 500; throw e; }
    const r = await llama(RV.onRequestPost, 'POST', cuerpo, { id: String(id) });                                                       // llega y SE GUARDA
    if (fallos.perderRespuesta > 0) { fallos.perderRespuesta--; throw new Error('Sin conexión con el servidor. Inténtalo de nuevo.'); }  // …pero la respuesta se pierde
    if (!r.ok) throw falla(r); return r.j;
  },
  async leer(id) { if (fallos.caerLeer > 0) { fallos.caerLeer--; throw new Error('Sin conexión con el servidor. Inténtalo de nuevo.'); } const r = await llama(EI.onRequestGet, 'GET', undefined, { id: String(id) }); if (!r.ok) throw falla(r); return r.j; },
};
let n = 0;
const nuevoEsc = async () => (await llama(ES.onRequestPost, 'POST', { clave: 'esc-cli-' + String(++n).padStart(6, '0'), nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }] })).j;
const filas = id => env.sql.prepare('SELECT clave, observacion, decision FROM revisiones_escenario WHERE escenario_id = ? ORDER BY id').all(id);
const B = (o = {}) => ({ fecha: '2026-11-10', observacion: 'Observación A', aprendizaje: '', decision: 'mantener', proxima_fecha: null, ...o });

// ---- 1. camino normal: el propio POST trae el escenario actualizado y no hace falta releer
let e = await nuevoEsc(), i = nuevoIntento(alm, e, B()), r = await enviarIntento(alm, i, e);
t('C1', 'Camino normal: el POST confirma y trae el escenario actualizado', 'tipo «confirmada», vista «actualizada» SIN lectura adicional; el historial del escenario devuelto tiene la revisión; 1 fila', `${r.tipo}/${r.vista}; revisiones ${r.escenario?.revisiones?.length}; filas ${filas(e.id).length}`,
  r.tipo === 'confirmada' && r.vista === 'actualizada' && r.escenario.revisiones.length === 1 && r.escenario.n_revisiones === 1 && filas(e.id).length === 1);

// ---- 2. POST confirmado + lectura posterior fallida (el caso I1): se ofrece recuperar la vista y NO se reenvía ni se genera otra clave
e = await nuevoEsc(); i = nuevoIntento(alm, e, B({ observacion: 'I1' })); enviadas.length = 0; claves = 100;
const antes2 = claves; fallos.perderRespuesta = 0;
// el servidor responde 200 «duplicado» (sin escenario) cuando el intento ya existía: se fuerza guardando primero con la misma clave y lanzando la lectura fallida después
await llama(RV.onRequestPost, 'POST', { clave: i.clave, revision: i.revision, ...i.cuerpo }, { id: String(e.id) });   // el intento ya está guardado (p. ej. un primer envío cuya respuesta se perdió)
fallos.caerLeer = 1;
r = await enviarIntento(alm, i, e);
const v1 = await actualizarVista(alm, e.id), nEnvios = enviadas.length;
t('C2', 'POST confirmado y lectura posterior FALLIDA (la ronda 21 decía «no se ha registrado nada»)', 'tipo «confirmada» con vista «pendiente»; recuperar la vista lee y NO escribe (1 solo envío en total); sigue habiendo 1 fila; la clave del intento no cambia; tras recuperar, el escenario trae la revisión', `${r.tipo}/${r.vista}; envíos ${nEnvios}; filas ${filas(e.id).length}; vista ok ${v1.ok}; revisiones ${v1.escenario?.revisiones?.length}; claves nuevas ${claves - antes2}`,
  r.tipo === 'confirmada' && r.vista === 'pendiente' && nEnvios === 1 && filas(e.id).length === 1 && v1.ok && v1.escenario.revisiones.length === 1 && claves === antes2);

// ---- 3. POST persistido y respuesta perdida: reintentar EL MISMO intento = una sola revisión
e = await nuevoEsc(); i = nuevoIntento(alm, e, B({ observacion: 'Respuesta perdida' })); enviadas.length = 0; fallos.perderRespuesta = 1;
const r1 = await enviarIntento(alm, i, e), tras1 = filas(e.id).length, r2 = await enviarIntento(alm, i, e);
t('C3', 'POST persistido con la respuesta PERDIDA; se reintenta el mismo intento', 'Primer resultado «incierto» (no se afirma «no guardado»); el reintento con la MISMA clave devuelve «confirmada» (duplicado) y queda UNA fila; las dos peticiones llevan la misma clave y el mismo contenido', `${r1.tipo} → ${r2.tipo}${r2.duplicado ? ' (duplicado)' : ''}; filas tras el 1.º ${tras1}, final ${filas(e.id).length}; mismas peticiones ${enviadas[0] === enviadas[1]}; mensaje «${r1.mensaje?.slice(0, 60)}»`,
  r1.tipo === 'incierto' && !/no se ha registrado/i.test(r1.mensaje) && tras1 === 1 && r2.tipo === 'confirmada' && r2.duplicado === true && r2.vista === 'actualizada' && filas(e.id).length === 1 && enviadas.length === 2 && enviadas[0] === enviadas[1]);

// ---- 4. el texto cambia mientras hay un intento incierto: ningún texto nuevo se presenta como guardado
e = await nuevoEsc(); const A = B({ observacion: 'Texto A (el del intento)' }), Bn = B({ observacion: 'Texto B (escrito después)' }); i = nuevoIntento(alm, e, A); enviadas.length = 0; fallos.caerAntes = 1;
const q1 = await enviarIntento(alm, i, e), distinto = !mismoContenido(i, Bn), mismo = mismoContenido(i, A);
const q2 = await enviarIntento(alm, i, e), guardado = filas(e.id).map(f => f.observacion);
t('C4', 'El texto se modifica con un intento incierto pendiente', 'Se detecta que el borrador es distinto; el reintento envía EL INTENTO (texto A), no el formulario; en el servidor solo existe el texto A; el texto B no se da por guardado', `incierto ${q1.tipo}; distinto ${distinto}; mismo ${mismo}; guardado ${J(guardado)}; envíos ${enviadas.map(x => JSON.parse(x).observacion).join(' | ')}`,
  q1.tipo === 'incierto' && distinto && mismo && q2.tipo === 'confirmada' && guardado.length === 1 && guardado[0] === 'Texto A (el del intento)' && enviadas.every(x => JSON.parse(x).observacion === 'Texto A (el del intento)'));

// ---- 5. dos pestañas, versión antigua: conflicto SIN afirmar «no guardado» cuando no se sabe, y sin pisar la otra revisión
e = await nuevoEsc(); const pestana1 = nuevoIntento(alm, e, B({ observacion: 'Pestaña 1' })), pestana2 = nuevoIntento(alm, e, B({ observacion: 'Pestaña 2' }));
const p1 = await enviarIntento(alm, pestana1, e), p2 = await enviarIntento(alm, pestana2, e);
const actual = await actualizarVista(alm, e.id), rehecho = nuevoIntento(alm, actual.escenario, B({ observacion: 'Pestaña 2' })), p3 = await enviarIntento(alm, rehecho, actual.escenario);
t('C5', 'Dos pestañas: la segunda lleva una versión antigua', 'La 1.ª confirmada; la 2.ª «conflicto» (no se registró NADA de la 2.ª); se recupera la versión actual y el mismo texto se envía de nuevo con la revisión nueva: quedan las DOS revisiones, ninguna pisada', `${p1.tipo} / ${p2.tipo} / ${p3.tipo}; filas ${J(filas(e.id).map(f => f.observacion))}`,
  p1.tipo === 'confirmada' && p2.tipo === 'conflicto' && /tu texto sigue aquí/.test(p2.mensaje) && p3.tipo === 'confirmada' && filas(e.id).length === 2 && p3.escenario.revisiones.length === 2);

// ---- 6. rechazo del servidor y fallo de infraestructura
e = await nuevoEsc(); const mala = nuevoIntento(alm, e, B({ decision: 'reprogramar', proxima_fecha: null })), rj = await enviarIntento(alm, mala, e);
fallos.http500 = 1; const buena = nuevoIntento(alm, e, B({ observacion: '500' })), r5 = await enviarIntento(alm, buena, e), r5b = await enviarIntento(alm, buena, e);
t('C6', 'Validación rechazada (400) y fallo de infraestructura (500)', 'El 400 es «rechazada» (certeza de que no se guardó, con el motivo del servidor); el 500 es «incierto» y, reintentado, una sola fila', `${rj.tipo}: «${rj.mensaje}»; 500 → ${r5.tipo}; reintento ${r5b.tipo}; filas ${filas(e.id).length}`, rj.tipo === 'rechazada' && /fecha de la próxima revisión/.test(rj.mensaje) && r5.tipo === 'incierto' && r5b.tipo === 'confirmada' && filas(e.id).length === 1);

// ---- 7. la base no se toca
const base = env.sql.prepare('SELECT revision FROM portafolios WHERE id = 1').get().revision, pos = env.sql.prepare('SELECT ticker, peso FROM posiciones WHERE portafolio_id = 1 ORDER BY ticker').all();
t('C7', 'Registrar revisiones no modifica la cartera base', 'La revisión de la cartera sigue en 0 y las posiciones en 60/40', `revisión ${base}; ${J(pos)}`, base === 0 && J(pos) === J([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 40 }]));
// ---- 8. RÉPLICA de la lógica de la ronda 21 (lab.js:613-626: la clave se borraba tras el POST y la lectura posterior fallida caía en el mismo `catch`): demuestra que esta batería detecta el defecto que se corrigió
const r21 = async (esc, cuerpo) => { let claveR21 = alm.nuevaClave(); let aviso = null;
  try { await alm.revisar(esc.id, { clave: claveR21, revision: esc.revision, ...cuerpo }); claveR21 = null; await alm.leer(esc.id); }      // POST bien, lectura mal → catch
  catch (er) { aviso = er.status === 409 ? 'no se ha registrado nada' : er.message; }
  return aviso; };
e = await nuevoEsc(); fallos.caerLeer = 1; const m1 = await r21(e, B({ observacion: 'R21 1' }));      // la vista queda con la revisión antigua: el escenario `e` no cambia
const m2 = await r21(e, B({ observacion: 'R21 2' }));                                                      // «reintento»: otra clave y la versión antigua
t('C8', 'Réplica de la lógica de la ronda 21: se reproduce el defecto (el mensaje falso) y la nueva lógica no lo produce', 'Con la lógica antigua, tras guardar y fallar la lectura el reintento da 409 y afirma «no se ha registrado nada» aunque hay filas; con la nueva (C2) eso no ocurre', `antigua: «${m1}» → «${m2}»; filas ${filas(e.id).length}`, /Sin conexión/.test(m1) && m2 === 'no se ha registrado nada' && filas(e.id).length === 1);
await fin();
