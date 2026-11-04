// Ronda 16: (1) las notas guardadas con un escenario se validan al guardar Y al leer (marcado, números, fechas, cobertura, versión); (3) el vínculo con la pregunta de la
// historia es un identificador estable, no el texto. Servidor real sobre SQLite real. Uso: node tests/ronda16/unit-escenarios16.mjs
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
import { evaluar, resumenNota, validarResumen, VERSION_NOTA } from '../../public/js/nota.js';
import { estadoSeguimiento, refPregunta } from '../../public/js/contenido.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-R16.json');
const J = JSON.stringify, MARCA = '<img src=x onerror=window.__pwn=1>';
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(2,'otra@example.com')").run(); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,2)').run(await sha256('token-de-b'));
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const llama = async (env, f, m, body, params = {}, token = 'token-de-prueba') => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, txt: await r.clone().text(), j: await r.json().catch(() => ({})) }; };
const cuerpo = (o = {}) => ({ clave: 'intento-0001', nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...o });
const bl = (v = 6) => ({ empresas: v, sectores: v, tamano: v, deuda: v, rentabilidad: v });
const res = (o = {}) => ({ version: VERSION_NOTA, fecha: '2026-11-04', publicada: true, nota: 6, motivo: null, cobertura: 100, bloques: bl(), fortaleza: 'empresas', limitacion: { bloque: 'deuda', perdida: 1 }, ...o });
const ev = (a = {}, d = {}) => ({ evaluacion: { antes: res(a), despues: res(d) } });
let env = await montar(), n = 0;
const intentar = async (nombre, extra) => { const r = await llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-' + String(++n).padStart(4, '0'), ...extra })); return r; };
const filas = () => env.sql.prepare('SELECT COUNT(*) c FROM escenarios').get().c;

// ---- 1. validación al guardar
const malos = { 'marcado en el motivo': ev({}, { publicada: false, nota: null, motivo: MARCA, cobertura: 50, bloques: null, fortaleza: null, limitacion: null }), 'texto en la nota': ev({ nota: MARCA }), 'nota fuera de rango (11)': ev({ nota: 11 }), 'nota 0': ev({ nota: 0 }), 'nota con dos decimales': ev({ nota: 6.45 }),
  'nota como cadena numérica': ev({ nota: '6.4' }), 'versión con marcado': ev({ version: MARCA }), 'fecha inexistente': ev({ fecha: '2026-02-31' }), 'fecha con marcado': ev({ fecha: MARCA }), 'cobertura 80 con nota publicada': ev({ cobertura: 80 }), 'cobertura texto': ev({ cobertura: '100' }),
  'bloque con texto': ev({ bloques: { ...bl(), deuda: MARCA } }), 'bloque fuera de rango': ev({ bloques: { ...bl(), deuda: 12 } }), 'bloque desconocido': ev({ bloques: { ...bl(), otro: 5 } }), 'fortaleza desconocida': ev({ fortaleza: MARCA }), 'limitación con marcado': ev({ limitacion: { bloque: MARCA, perdida: 1 } }),
  'campo extra': ev({ extra: MARCA }), 'nota en una publicada pendiente': ev({ publicada: false, nota: 6.4 }) };
let ok1 = true, detalle = [];
for (const [k, v] of Object.entries(malos)) { const r = await intentar(k, v); if (r.s !== 400) { ok1 = false; detalle.push(`${k}:${r.s}`); } }
t('P1', `${Object.keys(malos).length} evaluaciones adjuntas MALAS (marcado en motivo, nota, versión, fecha o bloque; números fuera de rango; fecha inexistente; cobertura insuficiente; campos extra)`, 'Todas se rechazan con HTTP 400 y no se guarda ninguna fila', `fallos: ${J(detalle)}; filas ${filas()}`, ok1 && filas() === 0);

// ---- 2. un escenario válido conserva cifra, fecha, cobertura y versión al reabrirlo
const U = (() => { const emp = {}; for (let i = 0; i < 24; i++) emp['S' + i] = { nombre: 'S' + i, tipo: 'accion', sector: 'S1', actividad: 'A' + (i % 4), emisor: 'e' + i, cap: 1e9 * (i + 1), imp: 1e6 * (i + 1), sesiones: 60, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04',
  ej: [2020, 2021, 2022, 2023, 2024].map((y, k) => ({ p: 'FY' + y, f: 'prueba', d: '2026-11-04', ing: 100 * (1 + k * .1) * (i + 1), ni: 10 * (i + 1), op: 12, ebitda: 20 * (i + 1), deuda: (i + 1) * 20 * (.5 + i / 40), fcf: 5 * (i + 1), roic: .02 + i * .005 })) }; return { fecha: '2026-11-04', origen: 'sintetico', empresas: emp }; })();
const real = resumenNota(evaluar([{ ticker: 'S3', peso: 60 }, { ticker: 'S9', peso: 40 }], U)), pend = resumenNota(evaluar([{ ticker: 'S3', peso: 50 }], U));
let r = await intentar('válido', { evaluacion: { antes: real, despues: pend } });
const rid = r.j.id, leer = (id, tok) => llama(env, EI.onRequestGet, 'GET', undefined, { id: String(id) }, tok);
const re = await leer(rid);
t('P2', 'Un escenario VÁLIDO (nota calculada → nota pendiente) se guarda y se reabre', 'HTTP 201; al reabrirlo conserva cifra, fecha, cobertura y versión, y declara que el servidor NO la ha recalculado (`evaluacion_verificada` = false)', `HTTP ${r.s}; ${J(re.j.evaluacion?.antes && { n: re.j.evaluacion.antes.nota, f: re.j.evaluacion.antes.fecha, c: re.j.evaluacion.antes.cobertura, v: re.j.evaluacion.antes.version })}; verificada ${re.j.evaluacion_verificada}`,
  r.s === 201 && re.j.evaluacion.antes.nota === real.nota && re.j.evaluacion.antes.fecha === '2026-11-04' && re.j.evaluacion.antes.cobertura === real.cobertura && re.j.evaluacion.antes.version === VERSION_NOTA && re.j.evaluacion.despues.publicada === false && re.j.evaluacion_verificada === false);

// ---- 3. una fila ANTIGUA manipulada se entrega sin contenido
env.sql.prepare("UPDATE escenarios SET nota_json = ? WHERE id = ?").run(J({ antes: res({ nota: MARCA }), despues: res() }), rid);
const man = await leer(rid), lista = await llama(env, ES.onRequestGet, 'GET');
t('P3', 'Fila antigua con una nota manipulada (marcado dentro del campo nota) ya guardada en la base', 'La lectura NO entrega esa evaluación (`evaluacion` nulo, `evaluacion_invalida`), ni el detalle ni la lista contienen el marcador', `HTTP ${man.s}; invalida ${man.j.evaluacion_invalida}; marcador en detalle ${man.txt.includes('onerror')}; en lista ${lista.txt.includes('onerror')}`, man.s === 200 && man.j.evaluacion === null && man.j.evaluacion_invalida === true && !man.txt.includes('onerror') && !lista.txt.includes('onerror'));
env.sql.prepare("UPDATE escenarios SET nota_json = '{no es json' WHERE id = ?").run(rid); const corr = await leer(rid);
t('P3b', 'Fila con JSON corrupto', 'Se lee sin error 500 y sin contenido', `HTTP ${corr.s}; invalida ${corr.j.evaluacion_invalida}`, corr.s === 200 && corr.j.evaluacion === null && corr.j.evaluacion_invalida === true);
t('P3c', 'validarResumen no deja pasar nada que no reconstruya', 'La copia «limpia» no comparte referencias ni campos con la entrada', J(Object.keys(validarResumen(res()).limpio)), (() => { const e = res(); const v = validarResumen(e); return v.ok && v.limpio !== e && v.limpio.bloques !== e.bloques; })());

// ---- 4. vínculo estable con la pregunta de la historia
const REF = refPregunta('hidrogeno-norte', 1), TXT = '¿Se han firmado los dos contratos anunciados?';
env = await montar(); n = 0;
const orig = await intentar('original', { historia: 'hidrogeno-norte', pregunta: TXT, pregunta_ref: REF, revisar_en: '2026-12-01' });
const refor = await intentar('reformulación', { historia: 'hidrogeno-norte', pregunta: '¿Al final firmaron C y D?', pregunta_ref: REF });
const nueva = await intentar('nueva', { historia: 'hidrogeno-norte', pregunta: '¿Y si pierden al cliente principal?', pregunta_ref: null });
t('P4', 'Tres escenarios de la MISMA empresa: texto original, reformulación que conserva el vínculo y pregunta nueva sin vínculo', 'Los tres se guardan; el vínculo es el identificador, no el texto', `${orig.s}/${refor.s}/${nueva.s}; refs ${J([orig.j.pregunta_ref, refor.j.pregunta_ref, nueva.j.pregunta_ref])}`, orig.s === 201 && refor.s === 201 && nueva.s === 201 && orig.j.pregunta_ref === REF && refor.j.pregunta_ref === REF && nueva.j.pregunta_ref === null);
const est = e => estadoSeguimiento(e).tipo;
t('P5', 'Lo que dice el seguimiento de cada caso', 'original → responde; reformulación → responde (y avisa de que las palabras son otras); pregunta nueva → «otra pregunta»: sigue pendiente y se ofrece ver la revisión', `${est(orig.j)}/${est(refor.j)}/${est(nueva.j)}; reformulación distinta ${estadoSeguimiento(refor.j).distinta}`, est(orig.j) === 'responde' && est(refor.j) === 'responde' && estadoSeguimiento(refor.j).distinta === true && estadoSeguimiento(orig.j).distinta === false && est(nueva.j) === 'otra');
const sp = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: TXT + '  ', revision: orig.j.revision }, { id: String(orig.j.id) });
t('P6', 'Editar la pregunta (un espacio de más) NO rompe el vínculo', 'El PATCH conserva `pregunta_ref`; el módulo sigue diciendo «responde» (en el módulo, un espacio dejaba la revisión sin vínculo)', `HTTP ${sp.s}; ref ${sp.j.pregunta_ref}; ${est(sp.j)}`, sp.s === 200 && sp.j.pregunta_ref === REF && est(sp.j) === 'responde' && estadoSeguimiento({ historia: 'hidrogeno-norte', pregunta_ref: REF, pregunta: TXT + ' ' }).tipo === 'responde');
const re2 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: 'Me pregunto otra cosa distinta', revision: sp.j.revision }, { id: String(orig.j.id) });
const quita = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: re2.j.revision }, { id: String(orig.j.id) });
t('P7', 'Reescribir la pregunta mantiene el vínculo; quitarlo explícitamente la convierte en «otra pregunta»', 'tras reescribir: vinculado; tras desmarcar: sin vínculo y «otra»', `${re2.j.pregunta_ref}/${quita.j.pregunta_ref}; ${est(re2.j)}/${est(quita.j)}`, re2.j.pregunta_ref === REF && est(re2.j) === 'responde' && quita.j.pregunta_ref === null && est(quita.j) === 'otra');
const ajeno = await intentar('otra historia', { historia: 'hidrogeno-norte', pregunta: 'x', pregunta_ref: 'otra-historia:1' }), sinH = await intentar('sin historia', { pregunta: 'x', pregunta_ref: REF }), forma = await intentar('forma', { historia: 'hidrogeno-norte', pregunta_ref: '<b>:1' });
t('P8', 'Vínculo de otra historia, sin historia o con una forma no válida', 'HTTP 400 en los tres', `${ajeno.s}/${sinH.s}/${forma.s}`, ajeno.s === 400 && sinH.s === 400 && forma.s === 400);
// ---- 5. cerrar sesión y volver con la misma cuenta; aislamiento con otra cuenta
env.sql.prepare('DELETE FROM sesiones WHERE usuario_id = 1').run(); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,1)').run(await sha256('token-de-vuelta'));
const vuelta = await llama(env, ES.onRequestGet, 'GET', undefined, {}, 'token-de-vuelta'), mia = vuelta.j.find(x => x.id === refor.j.id);
const deB = await llama(env, ES.onRequestGet, 'GET', undefined, {}, 'token-de-b'), detB = await leer(refor.j.id, 'token-de-b'), patB = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: 0 }, { id: String(refor.j.id) }, 'token-de-b');
t('P9', 'Cierro sesión y vuelvo con la misma cuenta; después miro con otra', 'Con la misma cuenta se conservan texto, vínculo y evaluación; la otra cuenta no ve ninguno de los tres (lista vacía, 404 al abrir y al editar) y no cambia nada', `vuelta: ${mia?.pregunta}/${mia?.pregunta_ref}; B lista ${deB.j.length}, detalle ${detB.s}, patch ${patB.s}; ref intacta ${env.sql.prepare('SELECT pregunta_ref FROM escenarios WHERE id=?').get(refor.j.id).pregunta_ref}`, vuelta.j.length === 3 && mia.pregunta === '¿Al final firmaron C y D?' && mia.pregunta_ref === REF && deB.j.length === 0 && detB.s === 404 && patB.s === 404 && env.sql.prepare('SELECT pregunta_ref FROM escenarios WHERE id=?').get(refor.j.id).pregunta_ref === REF);
await fin();
