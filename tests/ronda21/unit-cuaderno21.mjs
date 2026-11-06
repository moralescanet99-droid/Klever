// Ronda 21 · CUADERNO: «qué me haría cambiar de opinión» y el historial mínimo de revisiones. Servidor real sobre SQLite real. Se comprueba COMPORTAMIENTO y persistencia (no frases literales): guardado con invalidación, revisión
// atómica (añade el registro y actualiza estado/fecha en una sola operación), idempotencia por clave, conflicto entre pestañas sin pisar nada, aislamiento entre cuentas, validación en servidor, que la hipótesis original y las
// composiciones base/propuesta no se reescriben, y que cambiar o borrar la cartera original no pierde la comparación histórica. Uso: node tests/ronda21/unit-cuaderno21.mjs
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import * as RV from '../../functions/api/escenarios/[id]/revisiones.js';
import * as PI from '../../functions/api/portfolios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-CUA21.json');
const J = JSON.stringify;
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(2,'otra@example.com')").run(); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,2)').run(await sha256('token-de-b'));
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const llama = async (env, f, m, body, params = {}, token = 'token-de-prueba') => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: body === undefined ? undefined : J(body) }), env, params }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const cuerpo = (o = {}) => ({ clave: 'intento-0001', nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...o });
const env = await montar(); let n = 0;
const crear = async extra => (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-' + String(++n).padStart(4, '0'), ...extra })));
const rev = (id, o, token) => llama(env, RV.onRequestPost, 'POST', { clave: 'rev-' + String(++n).padStart(6, '0'), fecha: '2026-11-10', decision: 'mantener', ...o }, { id: String(id) }, token);
const escen = async id => (await llama(env, EI.onRequestGet, 'GET', undefined, { id: String(id) })).j;
const nRev = id => env.sql.prepare('SELECT COUNT(*) c FROM revisiones_escenario WHERE escenario_id=?').get(id).c;

// ---- 1. guardar con invalidación
const e1 = await crear({ pregunta: '¿Y si C pesara un 10 %?', nota: 'Quiero ver qué cambia', invalidacion: 'Si C pierde un cliente grande, lo descarto', revisar_en: '2026-11-07' });
t('K1', 'Guardar una comparación con pregunta, motivo, «qué me haría cambiar de opinión» y fecha', '201; los cuatro campos se conservan y se devuelven; sin revisiones aún', `HTTP ${e1.s}; ${J({ p: e1.j.pregunta, n: e1.j.nota, i: e1.j.invalidacion, f: e1.j.revisar_en, nr: e1.j.n_revisiones })}`,
  e1.s === 201 && e1.j.pregunta === '¿Y si C pesara un 10 %?' && e1.j.nota === 'Quiero ver qué cambia' && e1.j.invalidacion === 'Si C pierde un cliente grande, lo descarto' && e1.j.revisar_en === '2026-11-07' && e1.j.n_revisiones === 0);
const sinCampos = await crear({});
t('K2', 'No se exige rellenar todo: solo con nombre y comparación', '201; pregunta, nota e invalidación vacías; sin fecha', `HTTP ${sinCampos.s}; ${J({ p: sinCampos.j.pregunta, i: sinCampos.j.invalidacion, f: sinCampos.j.revisar_en })}`, sinCampos.s === 201 && sinCampos.j.pregunta === '' && sinCampos.j.invalidacion === '' && sinCampos.j.revisar_en === null);
const larga = await crear({ invalidacion: 'x'.repeat(601) });
t('K3', 'Límite explícito en servidor: 601 caracteres de invalidación', '400 y no se guarda nada', `HTTP ${larga.s}; filas ${env.sql.prepare('SELECT COUNT(*) c FROM escenarios').get().c}`, larga.s === 400 && env.sql.prepare('SELECT COUNT(*) c FROM escenarios').get().c === 2);
const ed = await llama(env, EI.onRequestPatch, 'PATCH', { invalidacion: 'Si el dividendo baja', revision: e1.j.revision }, { id: String(e1.j.id) });
t('K4', 'Editar la invalidación con control de revisión (PATCH)', '200; revisión +1; resto intacto', `HTTP ${ed.s}; ${J({ i: ed.j.invalidacion, r: ed.j.revision, p: ed.j.pregunta })}`, ed.s === 200 && ed.j.invalidacion === 'Si el dividendo baja' && ed.j.revision === e1.j.revision + 1 && ed.j.pregunta === '¿Y si C pesara un 10 %?');

// ---- 2. registrar revisión: atómica, historial, la hipótesis original se conserva
const antes = await escen(e1.j.id), base0 = J(antes.base), prop0 = J(antes.propuesta);
const r1 = await rev(e1.j.id, { revision: antes.revision, fecha: '2026-11-08', observacion: 'C anunció un contrato', aprendizaje: 'Me fijo más en los clientes', decision: 'reprogramar', proxima_fecha: '2026-12-01' });
const d1 = await escen(e1.j.id);
t('K5', 'Registrar una revisión que reprograma', '201; el historial tiene 1 registro; el escenario sube de revisión y pasa a revisarse el 2026-12-01; pregunta, nota, invalidación, base y propuesta SIN cambios', `HTTP ${r1.s}; revisiones ${d1.revisiones?.length}; revisar_en ${d1.revisar_en}; revisión ${antes.revision}→${d1.revision}`,
  r1.s === 201 && d1.revisiones.length === 1 && d1.revisiones[0].observacion === 'C anunció un contrato' && d1.revisiones[0].aprendizaje === 'Me fijo más en los clientes' && d1.revisiones[0].decision === 'reprogramar' && d1.revisiones[0].proxima_fecha === '2026-12-01'
  && d1.revisar_en === '2026-12-01' && d1.revision === antes.revision + 1 && d1.pregunta === antes.pregunta && d1.nota === antes.nota && d1.invalidacion === antes.invalidacion && J(d1.base) === base0 && J(d1.propuesta) === prop0 && d1.n_revisiones === 1);
const r2 = await rev(e1.j.id, { revision: d1.revision, fecha: '2026-12-02', observacion: 'Sigue igual', decision: 'mantener' });
const d2 = await escen(e1.j.id);
t('K6', 'Mantener sin nueva fecha', '201; el historial conserva la revisión anterior y suma esta (2 registros, la más reciente primero); el escenario queda en estudio sin fecha', `HTTP ${r2.s}; ${J(d2.revisiones.map(x => [x.fecha, x.decision]))}; estado ${d2.estado}; revisar_en ${d2.revisar_en}`,
  r2.s === 201 && d2.revisiones.length === 2 && d2.revisiones[0].fecha === '2026-12-02' && d2.revisiones[1].decision === 'reprogramar' && d2.estado === 'en_estudio' && d2.revisar_en === null);
const r3 = await rev(e1.j.id, { revision: d2.revision, fecha: '2026-12-20', observacion: 'Perdió el cliente', aprendizaje: 'Mi condición se cumplió', decision: 'descartar' });
const d3 = await escen(e1.j.id);
t('K7', 'Descartar tras revisar', '201; estado «descartado» y sin fecha; el historial (3) y la hipótesis original se conservan; descartar no es borrar', `HTTP ${r3.s}; estado ${d3.estado}; revisiones ${d3.revisiones.length}; existe ${!!d3.id}`, r3.s === 201 && d3.estado === 'descartado' && d3.revisar_en === null && d3.revisiones.length === 3 && d3.pregunta === antes.pregunta && J(d3.base) === base0);

// ---- 3. idempotencia, conflicto, límites
const e2 = (await crear({ pregunta: 'Otra' })).j, clave = 'rev-idempot-0001';
const a = await llama(env, RV.onRequestPost, 'POST', { clave, fecha: '2026-11-10', decision: 'mantener', observacion: 'una vez', revision: e2.revision }, { id: String(e2.id) });
const b = await llama(env, RV.onRequestPost, 'POST', { clave, fecha: '2026-11-10', decision: 'mantener', observacion: 'una vez', revision: e2.revision }, { id: String(e2.id) });
const d4 = await escen(e2.id);
t('K8', 'Reintento con la MISMA clave (corte de red)', 'La primera 201 y la segunda 200 con duplicado; un solo registro y la revisión del escenario sube UNA vez', `HTTP ${a.s}/${b.s}; registros ${nRev(e2.id)}; revisión ${e2.revision}→${d4.revision}; duplicado ${b.j.duplicado}`, a.s === 201 && b.s === 200 && b.j.duplicado === true && nRev(e2.id) === 1 && d4.revision === e2.revision + 1);
const e3 = (await crear({})).j, clave3 = 'rev-carrera-0001';
const par = await Promise.all([1, 2].map(() => llama(env, RV.onRequestPost, 'POST', { clave: clave3, fecha: '2026-11-10', decision: 'mantener', revision: e3.revision }, { id: String(e3.id) })));
const d5 = await escen(e3.id);
t('K9', 'Dos envíos SIMULTÁNEOS con la misma clave', 'Un solo registro; la revisión sube una vez; ninguno falla con 500', `HTTP ${par.map(x => x.s).join('/')}; registros ${nRev(e3.id)}; revisión ${e3.revision}→${d5.revision}`, par.every(x => x.s < 500) && nRev(e3.id) === 1 && d5.revision === e3.revision + 1);
const e4 = (await crear({})).j;
const x1 = await rev(e4.id, { revision: e4.revision, observacion: 'pestaña 1' }), x2 = await rev(e4.id, { revision: e4.revision, observacion: 'pestaña 2' });
t('K10', 'Conflicto entre dos pestañas: la segunda lleva una revisión antigua', 'La primera 201; la segunda 409 con «conflicto» y la revisión actual; solo 1 registro y la edición de la primera NO se pisa', `HTTP ${x1.s}/${x2.s}; registros ${nRev(e4.id)}; conflicto ${x2.j.conflicto}; revisión actual ${x2.j.revision}`, x1.s === 201 && x2.s === 409 && x2.j.conflicto === true && x2.j.revision === e4.revision + 1 && nRev(e4.id) === 1);
const pat = await llama(env, EI.onRequestPatch, 'PATCH', { nota: 'edición vieja', revision: e4.revision }, { id: String(e4.id) });
t('K11', 'Editar el escenario con la revisión anterior a una revisión registrada', '409: la edición no pisa lo registrado', `HTTP ${pat.s}`, pat.s === 409);
const val = async (nombre, o, esp) => { const r = await rev(e4.id, { revision: (await escen(e4.id)).revision, ...o }); return [nombre, r.s, esp]; };
const casos = [await val('decisión desconocida', { decision: 'borrar' }, 400), await val('fecha imposible 2026-02-31', { fecha: '2026-02-31' }, 400), await val('reprogramar sin fecha', { decision: 'reprogramar' }, 400), await val('descartar con fecha', { decision: 'descartar', proxima_fecha: '2026-12-01' }, 400),
  await val('observación de 601', { observacion: 'x'.repeat(601) }, 400), await val('próxima fecha inválida', { proxima_fecha: 'mañana' }, 400), await val('clave corta', { clave: 'abc' }, 400)];
t('K12', 'Validación en servidor de la revisión', 'Todas las entradas inválidas devuelven 400 y no añaden registros', casos.map(c => `${c[0]}:${c[1]}`).join(' · ') + `; registros ${nRev(e4.id)}`, casos.every(c => c[1] === c[2]) && nRev(e4.id) === 1);
const MARCA = '<img src=x onerror=window.__pwn=1>';
const m = await rev(e4.id, { revision: (await escen(e4.id)).revision, observacion: MARCA });
t('K13', 'El texto se guarda tal cual (se escapa al MOSTRAR, no al guardar) y se devuelve como dato', '201; la observación vuelve idéntica como cadena JSON', `HTTP ${m.s}; ${J((await escen(e4.id)).revisiones[0].observacion)}`, m.s === 201 && (await escen(e4.id)).revisiones[0].observacion === MARCA);
// ---- 4. aislamiento
const aj = await llama(env, RV.onRequestPost, 'POST', { clave: 'rev-ajena-0001', fecha: '2026-11-10', decision: 'mantener', revision: 0 }, { id: String(e1.j.id) }, 'token-de-b');
const lee = await llama(env, RV.onRequestGet, 'GET', undefined, { id: String(e1.j.id) }, 'token-de-b'), leeEsc = await llama(env, EI.onRequestGet, 'GET', undefined, { id: String(e1.j.id) }, 'token-de-b');
const sinTok = await llama(env, RV.onRequestPost, 'POST', { clave: 'rev-sintok-0001', fecha: '2026-11-10', decision: 'mantener', revision: 0 }, { id: String(e1.j.id) }, 'nada');
const propias = await llama(env, RV.onRequestGet, 'GET', undefined, { id: String(e1.j.id) });
t('K14', 'Otra cuenta (autenticada) y una sesión inválida', 'Otra cuenta: 404 al leer y al registrar (no se distingue «no existe» de «es de otro»); sin sesión: 401; el dueño sigue viendo sus 3 revisiones', `HTTP ${aj.s}/${lee.s}/${leeEsc.s}; sin sesión ${sinTok.s}; propias ${propias.j.length}`, aj.s === 404 && lee.s === 404 && leeEsc.s === 404 && sinTok.s === 401 && propias.j.length === 3);
const otraClave = await llama(env, RV.onRequestPost, 'POST', { clave: 'rev-idempot-0001', fecha: '2026-11-10', decision: 'mantener', revision: (await escen(e1.j.id)).revision }, { id: String(e1.j.id) });
t('K15', 'Una clave de intento ya usada en OTRO escenario de la misma cuenta', '409; no se registra nada', `HTTP ${otraClave.s}; registros del escenario ${nRev(e1.j.id)}`, otraClave.s === 409 && nRev(e1.j.id) === 3);
// ---- 5. la cartera original cambia o se borra: la comparación histórica se conserva
const e5 = (await crear({ pregunta: 'Histórica' })).j, hist = J({ b: (await escen(e5.id)).base, p: (await escen(e5.id)).propuesta });
const put = await llama(env, PI.onRequestPut, 'PUT', { posiciones: [{ ticker: 'A', peso: 50 }, { ticker: 'B', peso: 50 }], nombre: 'Base', tesis: null, revision: 0 }, { id: '1' });
const dpost = await escen(e5.id);
t('K16', 'Cambiar la cartera original después de guardar la comparación', 'La copia base/propuesta NO cambia; se avisa de que hay una versión posterior de la cartera; no se recalcula', `PUT HTTP ${put.s}; igual=${J({ b: dpost.base, p: dpost.propuesta }) === hist}; hay_version_posterior=${dpost.hay_version_posterior}`, put.s === 200 && J({ b: dpost.base, p: dpost.propuesta }) === hist && dpost.hay_version_posterior === true);
const rr = await rev(e5.id, { revision: dpost.revision, observacion: 'tras cambiar la cartera' });
env.sql.exec('DELETE FROM posiciones WHERE portafolio_id=1; DELETE FROM portafolios WHERE id=1');
const dborr = await escen(e5.id);
t('K17', 'Borrar la cartera original: la comparación y su historial siguen', 'El escenario se lee; base/propuesta intactas; «la cartera ya no existe»; la revisión registrada sigue', `revisión HTTP ${rr.s}; cartera_existe=${dborr.cartera_existe}; igual=${J({ b: dborr.base, p: dborr.propuesta }) === hist}; revisiones ${dborr.revisiones?.length}`, rr.s === 201 && dborr.cartera_existe === false && J({ b: dborr.base, p: dborr.propuesta }) === hist && dborr.revisiones.length === 1);
const del = await llama(env, EI.onRequestDelete, 'DELETE', undefined, { id: String(e5.id) });
t('K18', 'Eliminar el escenario elimina su historial (no quedan filas huérfanas)', '200 y 0 revisiones de ese escenario', `HTTP ${del.s}; huérfanas ${nRev(e5.id)}`, del.s === 200 && nRev(e5.id) === 0);
// ---- 6. tope de revisiones
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`);   // la cartera borrada en K17 se vuelve a crear
const e6 = (await crear({})).j; let r6 = 0, ult;
for (let i = 0; i < 201; i++) { const act = await escen(e6.id); ult = await rev(e6.id, { revision: act.revision, fecha: '2026-11-10' }); if (ult.s === 201) r6++ }
t('K19', 'Tope de 200 revisiones por escenario', 'Se aceptan 200 y la 201 devuelve 400 con mensaje', `aceptadas ${r6}; última HTTP ${ult.s}`, r6 === 200 && ult.s === 400);
// ---- 7. REGRESIÓN real de esta ronda: la columna nueva `portafolios.origen` hacía que el ORDER BY de las carteras públicas (alias `origen`) ordenara por la COLUMNA y los ejemplos de Klever dejaran de ir primero
import * as PU from '../../functions/api/public/index.js';
import { DEMO_EMAIL } from '../../functions/_lib.js';
env.sql.prepare('INSERT INTO usuarios(id,email) VALUES(9,?)').run(DEMO_EMAIL);
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (50,9,'Ejemplo de Klever','oro',1,NULL),(51,1,'De una persona','oro',1,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (50,'B',100),(51,'A',100)`);
const pub = await (await PU.onRequestGet({ env })).json();
t('K20', 'Carteras públicas: los ejemplos de Klever van primero aunque `portafolios` tenga ahora una columna `origen`', 'La primera es la del usuario de ejemplo (origen «ejemplo») y la segunda la de la persona, aunque su id sea MENOR (sin el orden por origen saldría la de la persona, id 51, primero)', J(pub.map(x => [x.id, x.origen])), pub.length === 2 && pub[0].id === 50 && pub[0].origen === 'ejemplo' && pub[1].origen === 'usuario');
await fin();
