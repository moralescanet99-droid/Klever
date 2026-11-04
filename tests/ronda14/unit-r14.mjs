// Ronda 14: integridad de escenarios (precisión, símbolos únicos, campos de seguimiento), concurrencia (revisión, topes atómicos, reintentos) y
// compatibilidad con escenarios anteriores. Servidor real sobre SQLite real. Uso: node tests/ronda14/unit-r14.mjs
import * as RT from '../../functions/api/radar/[ticker].js';
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-R14.json');
const J = JSON.stringify;
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const llama = async (env, f, m, body, params = {}) => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, j: await r.json() }; };
const cuerpo = (o = {}) => ({ clave: 'intento-0001', nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...o });
const n = (env, tabla) => env.sql.prepare(`SELECT COUNT(*) c FROM ${tabla}`).get().c;

// ---- precisión y símbolos únicos (el fallo de la ronda 13)
let env = await montar(), r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ peso: 10.04, propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }] }));
t('Q1', 'Peso de 10,04 %', 'HTTP 400 (una decimal como mucho); no se guarda un objetivo de 10,04 con una posición de 10', `HTTP ${r.s}: ${r.j.error}; filas ${n(env, 'escenarios')}`, r.s === 400 && /un decimal/.test(r.j.error) && n(env, 'escenarios') === 0);
r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0002', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 5 }, { ticker: 'C', peso: 5 }] }));
t('Q2', 'Propuesta con un símbolo duplicado (C dos veces, 5 + 5)', 'HTTP 400: no se normaliza antes de comparar; nada guardado', `HTTP ${r.s}: ${r.j.error}; filas ${n(env, 'escenarios')}`, r.s === 400 && /repite/.test(r.j.error) && n(env, 'escenarios') === 0);
r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0003', propuesta: [{ ticker: 'A', peso: 54.04 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 9.96 }] }));
t('Q3', 'Propuesta con pesos de más de una decimal', 'HTTP 400', `HTTP ${r.s}: ${r.j.error}`, r.s === 400 && n(env, 'escenarios') === 0);
r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0004', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }, { ticker: 'C', peso: 10 }] }));
t('Q3b', 'Propuesta con una fila de más (misma posición repetida)', 'HTTP 400', `HTTP ${r.s}`, r.s === 400 && n(env, 'escenarios') === 0);
r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0005', peso: 10.5, propuesta: [{ ticker: 'A', peso: 53.7 }, { ticker: 'B', peso: 35.8 }, { ticker: 'C', peso: 10.5 }] }));
t('Q3c', 'Un decimal SÍ se acepta (10,5 %)', 'HTTP 201 con A 53,7 · B 35,8 · C 10,5', `HTTP ${r.s}: ${J(r.j.propuesta)}`, r.s === 201 && J(r.j.propuesta) === J([{ ticker: 'A', peso: 53.7 }, { ticker: 'B', peso: 35.8 }, { ticker: 'C', peso: 10.5 }]));

// ---- campos de seguimiento
env = await montar(); r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ pregunta: '¿Se han firmado los dos contratos anunciados?', revisar_en: '2026-12-15', historia: 'hidrogeno-norte' }));
const id = r.j.id;
t('Q4', 'Pregunta, fecha de revisión e historia vinculada', '201 y los tres campos se devuelven', J([r.s, r.j.pregunta, r.j.revisar_en, r.j.historia]), r.s === 201 && r.j.pregunta === '¿Se han firmado los dos contratos anunciados?' && r.j.revisar_en === '2026-12-15' && r.j.historia === 'hidrogeno-norte');
t('Q4b', 'Campos no válidos', '400 con fecha inexistente (2026-02-31), pregunta de 201 caracteres e historia con mayúsculas/espacios',
  J([(await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0010', revisar_en: '2026-02-31' }))).s, (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0011', pregunta: 'x'.repeat(201) }))).s, (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0012', historia: 'Mala Historia' }))).s]),
  (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0010', revisar_en: '2026-02-31' }))).s === 400 && (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0011', pregunta: 'x'.repeat(201) }))).s === 400 && (await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0012', historia: 'Mala Historia' }))).s === 400 && n(env, 'escenarios') === 1);
r = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: 'Otra pregunta', revisar_en: null, revision: 0 }, { id });
t('Q4c', 'Editar la pregunta y quitar la fecha (revisión 0 → 1)', '200; pregunta nueva; fecha null; base y propuesta intactas', J([r.s, r.j.pregunta, r.j.revisar_en, r.j.revision, r.j.base.length, r.j.propuesta.length]), r.s === 200 && r.j.pregunta === 'Otra pregunta' && r.j.revisar_en === null && r.j.revision === 1 && r.j.base.length === 2 && r.j.propuesta.length === 3);
// ---- escenarios anteriores (sin los campos nuevos) siguen abriendo
env = await montar();
env.sql.exec(`INSERT INTO escenarios(usuario_id,clave,nombre,nota,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json) VALUES (1,'antiguo-0001','Escenario de la ronda 13','nota vieja','proporcional',1,'Base',0,'C',10,'[{"ticker":"A","peso":60},{"ticker":"B","peso":40}]','[{"ticker":"A","peso":54},{"ticker":"B","peso":36},{"ticker":"C","peso":10}]')`);
r = await llama(env, EI.onRequestGet, 'GET', undefined, { id: 1 }); const lista = await llama(env, ES.onRequestGet, 'GET');
t('Q5', 'Un escenario anterior (sin los campos nuevos) se abre y se lista', 'pregunta vacía, sin fecha ni historia; base y propuesta intactas', J([r.s, r.j.pregunta, r.j.revisar_en, r.j.historia, lista.j.length]), r.s === 200 && r.j.pregunta === '' && r.j.revisar_en === null && r.j.historia === null && lista.j.length === 1 && r.j.propuesta[0].peso === 54);
// ---- «Marcar como descartado» conserva; «Eliminar» borra
env = await montar(); r = await llama(env, ES.onRequestPost, 'POST', cuerpo());
const d1 = await llama(env, EI.onRequestPatch, 'PATCH', { estado: 'descartado', revision: 0 }, { id: r.j.id });
t('Q6', '«Marcar como descartado» conserva la historia; «Eliminar» la borra del todo', 'Tras descartar sigue en la lista con estado descartado y su base; tras eliminar no queda nada', J([d1.j.estado, n(env, 'escenarios')]), d1.s === 200 && d1.j.estado === 'descartado' && n(env, 'escenarios') === 1 && J(d1.j.base) === J([{ ticker: 'A', peso: 60 }, { ticker: 'B', peso: 40 }]) && (await llama(env, EI.onRequestDelete, 'DELETE', undefined, { id: r.j.id })).s === 200 && n(env, 'escenarios') === 0);
// ---- dos pestañas: una revisión antigua no borra una edición más reciente
env = await montar(); r = await llama(env, ES.onRequestPost, 'POST', cuerpo()); const idE = r.j.id;
env.tras(/^SELECT \* FROM escenarios WHERE id/, db => db.exec("UPDATE escenarios SET nota='Edición de la OTRA pestaña', revision = revision + 1 WHERE id=1"));
const vieja = await llama(env, EI.onRequestPatch, 'PATCH', { nota: 'Edición antigua', revision: 0 }, { id: idE });
t('Q7', 'Dos pestañas: otra escritura se cuela entre la lectura y la actualización', 'La edición con la revisión antigua recibe 409 y la nota más reciente se conserva', `HTTP ${vieja.s}; nota «${env.sql.prepare('SELECT nota FROM escenarios WHERE id=1').get().nota}»`, vieja.s === 409 && env.sql.prepare('SELECT nota FROM escenarios WHERE id=1').get().nota === 'Edición de la OTRA pestaña');
// ---- reintento concurrente con la misma clave
env = await montar();
env.tras(/clave = \?/, db => { if (!db.prepare("SELECT 1 FROM escenarios WHERE clave='intento-0001'").get()) db.exec(`INSERT INTO escenarios(usuario_id,clave,nombre,nota,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json) VALUES (1,'intento-0001','Añadir C','','proporcional',1,'Base',0,'C',10,'[{"ticker":"A","peso":60},{"ticker":"B","peso":40}]','[{"ticker":"A","peso":54},{"ticker":"B","peso":36},{"ticker":"C","peso":10}]')`); });
r = await llama(env, ES.onRequestPost, 'POST', cuerpo());
t('Q8', 'Dos reintentos con la misma clave a la vez (el otro escribe entre la comprobación y el INSERT)', 'Una sola fila; la respuesta es el escenario ya guardado (duplicado)', `HTTP ${r.s}; duplicado ${r.j.duplicado}; filas ${n(env, 'escenarios')}`, r.s === 200 && r.j.duplicado === true && n(env, 'escenarios') === 1);
// ---- tope de escenarios atómico (100)
env = await montar();
const relleno = (db, desde, hasta) => { for (let i = desde; i < hasta; i++) db.exec(`INSERT INTO escenarios(usuario_id,clave,nombre,nota,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json) VALUES (1,'relleno-${String(i).padStart(4, '0')}','R${i}','','proporcional',1,'Base',0,'C',10,'[]','[]')`); };
relleno(env.sql, 0, 99);
env.tras(/clave = \?/, db => relleno(db, 99, 100));                     // otra petición ocupa el hueco 100 justo antes de nuestro INSERT
r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-0099' }));
t('Q9', 'Tope de 100 escenarios con una escritura simultánea', 'El INSERT comprueba el tope en la propia sentencia: se rechaza (400) y no se pasa de 100', `HTTP ${r.s}: ${r.j.error}; filas ${n(env, 'escenarios')}`, r.s === 400 && /hasta 100/.test(r.j.error) && n(env, 'escenarios') === 100);
// ---- tope de radar atómico (200)
env = await montar();
for (let i = 0; i < 202; i++) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run('T' + String.fromCharCode(65 + Math.floor(i / 26)) + String.fromCharCode(65 + i % 26), 'x', 'accion', 's');
for (let i = 0; i < 199; i++) env.sql.prepare('INSERT INTO radar(usuario_id,ticker) VALUES(1,?)').run('T' + String.fromCharCode(65 + Math.floor(i / 26)) + String.fromCharCode(65 + i % 26));
env.tras(/^SELECT 1 x FROM radar/, db => db.prepare('INSERT INTO radar(usuario_id,ticker) VALUES(1,?)').run('TH' + 'X'.slice(0, 0) + 'A'.replace('A', 'X')));
const activoNuevo = 'TK' + 'Z'; env.sql.prepare('INSERT OR IGNORE INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run('TZZ', 'x', 'accion', 's'); env.sql.prepare('INSERT OR IGNORE INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run('THX', 'x', 'accion', 's');
r = await llama(env, RT.onRequestPut, 'PUT', { nota: 'a' }, { ticker: 'TZZ' });
const actualiza = await llama(env, RT.onRequestPut, 'PUT', { nota: 'nueva nota' }, { ticker: 'TAA' });
t('Q10', 'Tope de 200 en el radar con una escritura simultánea', 'Una fila NUEVA se rechaza (400) cuando el hueco lo ocupó otra petición; actualizar la nota de una EXISTENTE sigue permitido; no se pasa de 200', `nueva HTTP ${r.s}; actualizar HTTP ${actualiza.s}; filas ${n(env, 'radar')}`, r.s === 400 && actualiza.s === 200 && n(env, 'radar') === 200);
await fin();
