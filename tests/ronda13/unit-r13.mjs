// Ronda 13: servidor real (radar, escenarios, límite personal, origen de datos) sobre SQLite real. Aislamiento entre usuarios, atomicidad,
// reintentos sin duplicados y fallos de guardado. Uso: node tests/ronda13/unit-r13.mjs
import * as RA from '../../functions/api/radar/index.js';
import * as RT from '../../functions/api/radar/[ticker].js';
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import * as LI from '../../functions/api/portfolios/[id]/limite.js';
import * as PO from '../../functions/api/portfolios/[id].js';
import * as PL from '../../functions/api/portfolios/index.js';
import * as PU from '../../functions/api/public/[id].js';
import * as DA from '../../functions/api/datos.js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-R13.json');
const env = crearEnv(); await sembrar(env);
for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(2,'otra@example.com')").run();
env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,2)').run(await sha256('token-2'));
const T = { 1: 'token-de-prueba', 2: 'token-2', 0: null };
const llama = async (f, u, m, body, params = {}) => { const h = { 'content-type': 'application/json' }; if (T[u]) h.authorization = 'Bearer ' + T[u];
  const r = await f({ request: new Request('http://x/api', { method: m, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, j: await r.json() }; };
const n = tabla => env.sql.prepare(`SELECT COUNT(*) c FROM ${tabla}`).get().c;
// carteras: la 1 (usuario 1, pública), la 2 (usuario 2)
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Mi cartera','oro',1,'Tesis'),(2,2,'De otra persona','oro',0,NULL);
  INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40),(2,'GLD',100)`);

// ---------- radar
let r = await llama(RA.onRequestGet, 0, 'GET');
t('R1a', 'Radar sin sesión', 'HTTP 401', 'HTTP ' + r.s, r.s === 401);
r = await llama(RT.onRequestPut, 1, 'PUT', { nota: 'Me interesa por su caja' }, { ticker: 'A' });
const r2 = await llama(RT.onRequestPut, 1, 'PUT', { nota: 'Me interesa por su caja' }, { ticker: 'A' });
t('R1b', 'Guardar en el radar es idempotente', 'La primera vez es nuevo; la segunda no duplica (1 fila)', `nuevo ${r.j.nuevo}/${r2.j.nuevo}; filas ${n('radar')}`, r.s === 200 && r.j.nuevo === true && r2.j.nuevo === false && n('radar') === 1);
r = await llama(RT.onRequestPut, 1, 'PUT', {}, { ticker: 'A' });
t('R1c', 'Sin «nota» en el cuerpo se conserva la nota', 'La nota sigue siendo la anterior', r.j.nota, r.j.nota === 'Me interesa por su caja');
r = await llama(RT.onRequestPut, 1, 'PUT', { nota: 'Revisar deuda' }, { ticker: 'A' });
t('R1d', 'Actualizar la nota', 'Nota nueva y sigue habiendo 1 fila', `${r.j.nota}; filas ${n('radar')}`, r.j.nota === 'Revisar deuda' && n('radar') === 1);
t('R1e', 'Ticker desconocido, mal formado o nota demasiado larga', 'HTTP 400 los tres', [(await llama(RT.onRequestPut, 1, 'PUT', {}, { ticker: 'ZZZ' })).s, (await llama(RT.onRequestPut, 1, 'PUT', {}, { ticker: 'a;b' })).s, (await llama(RT.onRequestPut, 1, 'PUT', { nota: 'x'.repeat(501) }, { ticker: 'B' })).s].join(','),
  (await llama(RT.onRequestPut, 1, 'PUT', {}, { ticker: 'ZZZ' })).s === 400 && (await llama(RT.onRequestPut, 1, 'PUT', {}, { ticker: 'a;b' })).s === 400 && (await llama(RT.onRequestPut, 1, 'PUT', { nota: 'x'.repeat(501) }, { ticker: 'B' })).s === 400 && n('radar') === 1);
// aislamiento
await llama(RT.onRequestPut, 2, 'PUT', { nota: 'Nota de la otra persona' }, { ticker: 'A' });
const g1 = await llama(RA.onRequestGet, 1, 'GET'), g2 = await llama(RA.onRequestGet, 2, 'GET');
t('R2a', 'Aislamiento: cada usuario solo ve su radar (mismo activo, notas distintas)', 'Usuario 1: «Revisar deuda»; usuario 2: «Nota de la otra persona»', `${g1.j.map(x => x.nota)} / ${g2.j.map(x => x.nota)}`, g1.j.length === 1 && g1.j[0].nota === 'Revisar deuda' && g2.j.length === 1 && g2.j[0].nota === 'Nota de la otra persona');
await llama(RT.onRequestDelete, 2, 'DELETE', undefined, { ticker: 'A' });
t('R2b', 'Quitar de MI radar no afecta al de otro usuario', 'Usuario 1 conserva A', n('radar') + ' fila(s)', n('radar') === 1 && (await llama(RA.onRequestGet, 1, 'GET')).j.length === 1);
t('R1f', 'Quitar algo que no estaba es idempotente', 'HTTP 200', 'HTTP ' + (await llama(RT.onRequestDelete, 2, 'DELETE', undefined, { ticker: 'C' })).s, (await llama(RT.onRequestDelete, 2, 'DELETE', undefined, { ticker: 'C' })).s === 200);

// ---------- límite personal
const cartera = () => env.sql.prepare('SELECT revision, publico, limite_peso, nombre FROM portafolios WHERE id=1').get();
const rev0 = cartera().revision;
r = await llama(LI.onRequestPut, 1, 'PUT', { limite: 20 }, { id: 1 });
t('R3a', 'Definir un límite personal', 'limite_peso 20 y la revisión NO cambia (no es composición)', `${J(cartera())}`, r.s === 200 && cartera().limite_peso === 20 && cartera().revision === rev0);
t('R3b', 'Límites no válidos', 'HTTP 400 con 0, 101, «abc»', [0, 101, 'abc'].map(async () => 0) && [(await llama(LI.onRequestPut, 1, 'PUT', { limite: 0 }, { id: 1 })).s, (await llama(LI.onRequestPut, 1, 'PUT', { limite: 101 }, { id: 1 })).s, (await llama(LI.onRequestPut, 1, 'PUT', { limite: 'abc' }, { id: 1 })).s].join(','),
  (await llama(LI.onRequestPut, 1, 'PUT', { limite: 0 }, { id: 1 })).s === 400 && (await llama(LI.onRequestPut, 1, 'PUT', { limite: 101 }, { id: 1 })).s === 400 && (await llama(LI.onRequestPut, 1, 'PUT', { limite: 'abc' }, { id: 1 })).s === 400 && cartera().limite_peso === 20);
const ajeno = await llama(LI.onRequestPut, 2, 'PUT', { limite: 5 }, { id: 1 });
t('R3c', 'Aislamiento: otro usuario no puede poner límite a mi cartera', 'HTTP 404 y el límite sigue en 20', `HTTP ${ajeno.s}; ${cartera().limite_peso}`, ajeno.s === 404 && cartera().limite_peso === 20);
const gc = await llama(PO.onRequestGet, 1, 'GET', undefined, { id: 1 }), lista = await llama(PL.onRequestGet, 1, 'GET'), pub = await llama(PU.onRequestGet, 0, 'GET', undefined, { id: 1 });
t('R3d', 'El límite es privado: lo ve su dueño, no la vista pública', 'GET cartera y lista lo incluyen; GET público no', `cartera ${gc.j.limite_peso}; lista ${lista.j[0].limite_peso}; público ${'limite_peso' in pub.j}`, gc.j.limite_peso === 20 && lista.j[0].limite_peso === 20 && !('limite_peso' in pub.j) && !JSON.stringify(pub.j).includes('limite'));
r = await llama(LI.onRequestPut, 1, 'PUT', { limite: null }, { id: 1 });
t('R3e', 'Quitar el límite', 'limite_peso null', J(cartera()), r.s === 200 && cartera().limite_peso === null);

// ---------- escenarios
const clave = 'intento-0001', cuerpo = (o = {}) => ({ clave, nombre: 'Añadir C', nota: 'Probar C al 10 %', cartera_id: 1, base_revision: rev0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...o });
const snap = () => J({ c: env.sql.prepare('SELECT nombre, publico, tesis, revision, actualizado_en FROM portafolios WHERE id=1').get(), p: env.sql.prepare('SELECT ticker, peso FROM posiciones WHERE portafolio_id=1 ORDER BY ticker').all() });
const antes = snap();
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo());
t('R4a', 'Guardar un escenario válido', '201; copia de la base y propuesta; método; estado «en_estudio»; revisión de origen', `HTTP ${r.s}; ${J({ b: r.j.base, p: r.j.propuesta, m: r.j.metodo, e: r.j.estado, br: r.j.base_revision })}`,
  r.s === 201 && J(r.j.base) === J([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 40 }]) && J(r.j.propuesta) === J([{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }]) && r.j.estado === 'en_estudio' && r.j.base_revision === rev0 && r.j.metodo === 'proporcional');
const id1 = r.j.id;
t('R4b', 'Guardar un escenario NO modifica la cartera base ni su versión pública', 'Cartera, posiciones, publicación y revisión idénticas', antes === snap() ? 'idénticas' : 'cambió', antes === snap() && (await llama(PU.onRequestGet, 0, 'GET', undefined, { id: 1 })).j.posiciones.length === 2);
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo());
t('R4c', 'Reintento con la misma clave: no duplica', '200 con «duplicado»; 1 escenario', `HTTP ${r.s}; duplicado ${r.j.duplicado}; filas ${n('escenarios')}`, r.s === 200 && r.j.duplicado === true && n('escenarios') === 1 && r.j.id === id1);
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0002', propuesta: [{ ticker: 'A', peso: 55 }, { ticker: 'B', peso: 35 }, { ticker: 'C', peso: 10 }] }));
t('R4d', 'Propuesta manipulada (cifras distintas a las del método)', 'HTTP 400 y nada guardado', `HTTP ${r.s}; ${r.j.error}; filas ${n('escenarios')}`, r.s === 400 && n('escenarios') === 1);
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0003', base_revision: rev0 + 5 }));
t('R4e', 'Base que ya no es la vigente al guardar', 'HTTP 409', `HTTP ${r.s}`, r.s === 409 && n('escenarios') === 1);
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0004', financiacion: 'sin_asignar', propuesta: [] }));
t('R4f', 'Simulación inviable (cartera completa, financiar con lo sin asignar)', 'HTTP 400 con el motivo', `HTTP ${r.s}; ${r.j.error}`, r.s === 400 && /No hay suficiente porcentaje sin asignar/.test(r.j.error));
t('R4g', 'Datos inválidos (nombre vacío, clave corta, ticker raro)', 'HTTP 400 los tres', [(await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0005', nombre: ' ' }))).s, (await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'x' }))).s, (await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0006', ticker: '??' }))).s].join(','),
  (await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0005', nombre: ' ' }))).s === 400 && (await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'x' }))).s === 400 && (await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0006', ticker: '??' }))).s === 400 && n('escenarios') === 1);
// aislamiento
r = await llama(ES.onRequestPost, 2, 'POST', cuerpo({ clave: 'intento-0007' }));
t('R5a', 'Aislamiento: otro usuario no puede crear un escenario sobre MI cartera', 'HTTP 404; sin filas nuevas', `HTTP ${r.s}; filas ${n('escenarios')}`, r.s === 404 && n('escenarios') === 1);
const l2 = await llama(ES.onRequestGet, 2, 'GET'), g = await llama(EI.onRequestGet, 2, 'GET', undefined, { id: id1 }), p = await llama(EI.onRequestPatch, 2, 'PATCH', { nota: 'hackeada', revision: 0 }, { id: id1 }), d = await llama(EI.onRequestDelete, 2, 'DELETE', undefined, { id: id1 });
t('R5b', 'Aislamiento: otro usuario no lista, lee, edita ni borra mi escenario', 'Lista vacía; GET/PATCH/DELETE → 404; el escenario intacto', `lista ${l2.j.length}; ${g.s}/${p.s}/${d.s}`, l2.j.length === 0 && g.s === 404 && p.s === 404 && d.s === 404 && n('escenarios') === 1 && env.sql.prepare('SELECT nota FROM escenarios WHERE id=?').get(id1).nota === 'Probar C al 10 %');
t('R5c', 'Sin sesión no hay escenarios', 'HTTP 401', 'HTTP ' + (await llama(ES.onRequestGet, 0, 'GET')).s, (await llama(ES.onRequestGet, 0, 'GET')).s === 401);
// edición con revisión
r = await llama(EI.onRequestPatch, 1, 'PATCH', { nota: 'Falta comprobar la deuda', estado: 'en_estudio', revision: 0 }, { id: id1 });
const vieja = await llama(EI.onRequestPatch, 1, 'PATCH', { nota: 'otra pestaña', revision: 0 }, { id: id1 });
t('R6a', 'Editar la nota con revisión; la revisión sube y una pestaña vieja recibe 409', 'HTTP 200, revisión 1; la edición con revisión 0 → 409 y la nota no se pisa', `${r.s}/${r.j.revision}; ${vieja.s}; nota «${env.sql.prepare('SELECT nota FROM escenarios WHERE id=?').get(id1).nota}»`, r.s === 200 && r.j.revision === 1 && vieja.s === 409 && env.sql.prepare('SELECT nota FROM escenarios WHERE id=?').get(id1).nota === 'Falta comprobar la deuda');
t('R6b', 'Estado no válido y base/propuesta inmutables', '400 con «borrado»; un PATCH con base_json la ignora', `${(await llama(EI.onRequestPatch, 1, 'PATCH', { estado: 'borrado', revision: 1 }, { id: id1 })).s}`, (await llama(EI.onRequestPatch, 1, 'PATCH', { estado: 'borrado', revision: 1 }, { id: id1 })).s === 400 && (await llama(EI.onRequestPatch, 1, 'PATCH', { base: [], propuesta: [], estado: 'archivado', revision: 1 }, { id: id1 })).j.base.length === 2);
// la cartera cambia: el escenario conserva su base y avisa
await llama(PO.onRequestPut, 1, 'PUT', { posiciones: [{ ticker: 'A', peso: 50 }, { ticker: 'B', peso: 50 }], nombre: 'Mi cartera', tesis: 'Tesis', revision: rev0 }, { id: 1 });
r = await llama(EI.onRequestGet, 1, 'GET', undefined, { id: id1 });
t('R7a', 'Si cambia la cartera original, el escenario conserva su base y avisa de la versión posterior', 'base 60/40 y propuesta 54/36/10 intactas; hay_version_posterior; revisión actual 1', J({ b: r.j.base, p: r.j.propuesta, post: r.j.hay_version_posterior, rev: r.j.revision_actual }), r.j.hay_version_posterior === true && r.j.revision_actual === 1 && r.j.base[0].peso === 60 && r.j.propuesta[0].peso === 54);
env.sql.exec('DELETE FROM posiciones WHERE portafolio_id=1; DELETE FROM portafolios WHERE id=1');
r = await llama(EI.onRequestGet, 1, 'GET', undefined, { id: id1 });
t('R7b', 'Si se borra la cartera, el escenario sigue y lo dice', 'cartera_existe=false, nombre y base conservados', J({ ex: r.j.cartera_existe, n: r.j.cartera_nombre, b: r.j.base.length }), r.s === 200 && r.j.cartera_existe === false && r.j.cartera_nombre === 'Mi cartera' && r.j.base.length === 2);
// fallo de guardado y reintento
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis,revision) VALUES (3,1,'Otra mía','oro',0,NULL,0); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (3,'A',60),(3,'B',40)`);
const filas = n('escenarios'); env.fallarEnSentencia = 0;
r = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0008', cartera_id: 3 })); env.fallarEnSentencia = null;
const tras = n('escenarios');
const r8 = await llama(ES.onRequestPost, 1, 'POST', cuerpo({ clave: 'intento-0008', cartera_id: 3 }));
t('R8', 'Fallo de infraestructura al guardar y reintento', 'El fallo da 500 sin dejar filas; el reintento con la misma clave guarda UNA', `fallo HTTP ${r.s}, filas ${filas}→${tras}; reintento HTTP ${r8.s}, filas ${n('escenarios')}`, r.s === 500 && tras === filas && r8.s === 201 && n('escenarios') === filas + 1);
r = await llama(EI.onRequestDelete, 1, 'DELETE', undefined, { id: r8.j.id });
t('R9', 'Descartar un escenario lo borra sin tocar la cartera', 'HTTP 200; la cartera 3 intacta', `HTTP ${r.s}; ${env.sql.prepare('SELECT COUNT(*) c FROM posiciones WHERE portafolio_id=3').get().c} posiciones`, r.s === 200 && env.sql.prepare('SELECT COUNT(*) c FROM posiciones WHERE portafolio_id=3').get().c === 2);
// origen de los datos
r = await llama(DA.onRequestGet, 0, 'GET');
const sinFila = r.j.origen;
env.sql.exec("INSERT INTO datos_meta(clave,valor) VALUES('origen','prueba')"); const conFila = (await llama(DA.onRequestGet, 0, 'GET')).j;
t('R10', 'Origen de los datos', 'Sin fila: origen null (no se atribuye); con «prueba»: «prueba»', `${sinFila} / ${conFila.origen}`, sinFila === null && conFila.origen === 'prueba');
function J(x) { return JSON.stringify(x); }
await fin();
