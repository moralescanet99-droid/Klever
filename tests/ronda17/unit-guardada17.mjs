// Ronda 17 · nota guardada (coherencia, versión, límites, texto), vínculo editorial con catálogo (referencias inexistentes, históricas inválidas, reformulación,
// concurrencia) y aislamiento con revocación del token. Servidor real sobre SQLite real, por HTTP de manejadores. Uso: node tests/ronda17/unit-guardada17.mjs
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import * as LO from '../../functions/api/logout.js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
import { validarResumen, resumenNota, evaluar, MAX_MOTIVO } from '../../public/js/nota.js';
import { htmlEvaluacionGuardada } from '../../public/js/nota-ui.js';
import { estadoSeguimiento, similitudPregunta, UMBRAL_PARECIDO } from '../../public/js/contenido.js';
import { CATALOGO_PREGUNTAS, refExiste } from '../../public/js/catalogo.js';
import { readFileSync } from 'node:fs';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-GUARD17.json');
const J = JSON.stringify, esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(2,'otra@example.com')").run(); env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,2)').run(await sha256('token-de-b'));
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const llama = async (env, f, m, body, params = {}, token = 'token-de-prueba') => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, txt: await r.clone().text(), j: await r.json().catch(() => ({})) }; };
const cuerpo = (o = {}) => ({ clave: 'intento-0001', nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...o });
let env = await montar(), n = 0;
const intentar = extra => llama(env, ES.onRequestPost, 'POST', cuerpo({ clave: 'intento-' + String(++n).padStart(4, '0'), ...extra }));
const leer = (id, tok) => llama(env, EI.onRequestGet, 'GET', undefined, { id: String(id) }, tok);

// ---- nota guardada coherente: construida con el MISMO módulo que la interfaz
const emp = i => ({ nombre: 'S' + i, tipo: 'accion', sector: 'S1', actividad: 'A' + (i % 4), emisor: 'e' + i, cap: 1e9 * (i + 1), imp: 1e6 * (i + 1), sesiones: 60, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04',
  ej: [2020, 2021, 2022, 2023, 2024].map((y, k) => ({ p: 'FY' + y, f: 'prueba', d: '2026-11-04', ing: 100 * (1 + k * .1) * (i + 1), ni: 10 * (i + 1), op: 12, ebitda: 20 * (i + 1), deuda: (i + 1) * 20 * (.5 + i / 40), fcf: 5 * (i + 1), roic: .02 + i * .005 })) });
const U = { fecha: '2026-11-04', origen: 'sintetico', empresas: Object.fromEntries(Array.from({ length: 24 }, (_, i) => ['S' + i, emp(i)])) };
const real = resumenNota(evaluar([{ ticker: 'S3', peso: 60 }, { ticker: 'S9', peso: 40 }], U)), pend = resumenNota(evaluar([{ ticker: 'S3', peso: 50 }], U));
const guardar = (a, d) => intentar({ evaluacion: { antes: a, despues: d } });
let r = await guardar(real, pend);
t('G0', 'La evaluación REAL calculada por el módulo se acepta', 'HTTP 201 y vuelve idéntica (cifra, fecha, cobertura, versión)', `HTTP ${r.s}; ${real.nota} (${real.version}, ${real.fecha}, ${real.cobertura})`, r.s === 201 && r.j.evaluacion.antes.nota === real.nota && r.j.evaluacion.antes.version === real.version && r.j.evaluacion.antes.fecha === real.fecha);
const id0 = r.j.id;
const mut = (o, cambios) => ({ ...JSON.parse(J(o)), ...cambios });
r = await guardar(mut(real, { nota: 10 }), pend);
t('G1', 'Cambiar SOLO la nota (de la calculada a 10) conservando todos los bloques', 'HTTP 400: la nota no cuadra con sus bloques', `HTTP ${r.s}: ${r.j.error}`, r.s === 400 && /no cuadra con sus bloques/.test(r.j.error));
r = await guardar(mut(real, { version: 'foo' }), pend);
t('G2', 'Cambiar SOLO la versión a «foo»', 'HTTP 400: versión no conocida', `HTTP ${r.s}: ${r.j.error}`, r.s === 400 && /no es una versión conocida/.test(r.j.error));
const bloques = v => ({ empresas: v, sectores: v, tamano: v, deuda: v, rentabilidad: v });
const sint = (nota, v, extra = {}) => ({ version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota, motivo: null, cobertura: 100, bloques: bloques(v), fortaleza: 'empresas', limitacion: { bloque: 'deuda', perdida: Math.round(25 * (10 - v)) / 100 }, ...extra });
const validos = [['límite inferior (1,0 con todos los bloques a 1)', sint(1, 1)], ['límite superior (10 con todos a 10)', sint(10, 10, { limitacion: { bloque: 'deuda', perdida: 0 } })], ['redondeo: bloques de 2 decimales y total de 1 (5,43 → 5,4)', sint(5.4, 5.43)], ['redondeo hacia arriba (5,45 → 5,5 con bloques 5,45)', sint(5.5, 5.45)], ['cobertura exacta del 90 %', sint(6, 6, { cobertura: 90 })]];
let todoOk = true, det = [];
for (const [k, v] of validos) { const x = validarResumen(v, { guardar: true }); if (!x.ok) { todoOk = false; det.push(`${k}: ${x.motivo}`); } }
t('G3', 'Redondeos válidos y límites', 'Se aceptan: 1,0; 10; 5,4 con bloques de 5,43; 5,5 con 5,45; cobertura del 90 % exacta', todoOk ? 'todos aceptados' : J(det), todoOk);
const malos = [['redondeo: 5,5 con bloques 5,43 (fuera de tolerancia)', sint(5.5, 5.43)], ['cobertura 89,9 %', sint(6, 6, { cobertura: 89.9 })], ['nota 10,1', sint(10.1, 10)], ['nota 0,9', sint(.9, 1)], ['fortaleza que no es el mejor bloque', { ...sint(6, 6), bloques: { empresas: 5, sectores: 7, tamano: 6, deuda: 6, rentabilidad: 6 }, nota: 6, fortaleza: 'empresas' }], ['limitación que no cuadra', sint(6, 6, { limitacion: { bloque: 'deuda', perdida: 2 } })]];
let malOk = true, det2 = [];
for (const [k, v] of malos) { const x = validarResumen(v, { guardar: true }); if (x.ok) { malOk = false; det2.push(k); } }
t('G4', 'Resúmenes incoherentes o fuera de rango', 'Todos se rechazan (nota fuera de la tolerancia de redondeo, cobertura < 90, fuera de 1–10, fortaleza y limitación incoherentes)', malOk ? 'todos rechazados' : `aceptados: ${J(det2)}`, malOk);
// texto: entidades, bidi, longitud, propiedades
const pend2 = (motivo, extra = {}) => ({ version: 'estructura-v1', fecha: '2026-11-04', publicada: false, nota: null, motivo, cobertura: 50, bloques: null, fortaleza: null, limitacion: null, ...extra });
const ent = pend2('Texto con &lt;img src=x onerror=alert(1)&gt; escapado'), html = htmlEvaluacionGuardada(esc, { evaluacion: { antes: ent, despues: ent }, evaluacion_invalida: false });
t('G5', 'Entidad escapada en el motivo (texto «&lt;img…&gt;»)', 'Se acepta como TEXTO y al pintar sigue siendo texto: el HTML generado no contiene ninguna etiqueta <img>', `acepta ${validarResumen(ent, { guardar: true }).ok}; etiquetas img en el HTML ${/<img/i.test(html)}; texto visible «${html.replace(/<[^>]+>/g, '').match(/&amp;lt;img[^ ]*/)?.[0]}»`, validarResumen(ent, { guardar: true }).ok && !/<img/i.test(html) && /&amp;lt;img/.test(html));
const bidi = pend2('Motivo con ‮gnirts‬ invertido');
t('G6', 'Controles de dirección bidireccionales (U+202E) en el motivo', 'Se rechazan al guardar', `acepta ${validarResumen(bidi, { guardar: true }).ok}`, !validarResumen(bidi, { guardar: true }).ok && !validarResumen(pend2('x⁦y'), { guardar: true }).ok && !validarResumen(pend2('x‎y'), { guardar: true }).ok);
const m700 = pend2('a'.repeat(MAX_MOTIVO)), m701 = pend2('a'.repeat(MAX_MOTIVO + 1));
const r700 = await guardar(real, m700), r701 = await guardar(real, m701);
t('G7', `Límite del motivo: ${MAX_MOTIVO} caracteres sí, ${MAX_MOTIVO + 1} no (por HTTP)`, '700 → 201; 701 → 400', `${r700.s} / ${r701.s}`, r700.s === 201 && r701.s === 400);
const proto = JSON.parse('{"version":"estructura-v1","fecha":"2026-11-04","publicada":false,"nota":null,"motivo":null,"cobertura":null,"bloques":null,"fortaleza":null,"limitacion":null,"__proto__":{"x":1}}');
const heredada = Object.create({ version: 'estructura-v1', publicada: false, fecha: null, nota: null, motivo: null, cobertura: null, bloques: null, fortaleza: null, limitacion: null });
t('G8', 'Clave JSON propia «__proto__» y propiedades HEREDADAS', 'La clave __proto__ propia es un campo extra (rechazada); un objeto que solo hereda sus campos no vale', `__proto__: ${validarResumen(proto).ok}; heredada: ${validarResumen(heredada).ok}; -0 en un bloque: ${validarResumen(sint(6, -0)).ok}`, !validarResumen(proto).ok && !validarResumen(heredada).ok && !validarResumen({ ...sint(6, 6), bloques: bloques(-0) }).ok);
// filas antiguas en la base (según lo verificable)
env.sql.prepare('UPDATE escenarios SET nota_json=? WHERE id=?').run(J({ antes: mut(real, { nota: 10 }), despues: pend }), id0); let le = await leer(id0);
t('G9', 'Fila antigua con la nota cambiada a 10 directamente en la base', 'No se entrega (evaluacion nula, evaluacion_invalida) y no se presenta como comprobada', `invalida ${le.j.evaluacion_invalida}; evaluacion ${le.j.evaluacion}`, le.j.evaluacion === null && le.j.evaluacion_invalida === true);
env.sql.prepare('UPDATE escenarios SET nota_json=? WHERE id=?').run(J({ antes: mut(real, { version: 'estructura-v9' }), despues: mut(pend, { version: 'estructura-v9' }) }), id0); le = await leer(id0);
const htmlV9 = htmlEvaluacionGuardada(esc, le.j);
t('G10', 'Fila antigua de una versión que esta pantalla no sabe comprobar («estructura-v9»), bien formada', 'Se entrega marcada «sin comprobar» y la pantalla la presenta como «valor guardado por el cliente», no como verificada', `sin_comprobar ${le.j.evaluacion_sin_comprobar}; «${htmlV9.replace(/<[^>]+>/g, '').slice(0, 130)}»`, le.j.evaluacion_sin_comprobar === true && /valor guardado por el cliente/i.test(htmlV9) && /no sabe comprobar/.test(htmlV9));

// ---- vínculo editorial con catálogo
env = await montar(); n = 0;
const REF = 'hidrogeno-norte:1', TXT = CATALOGO_PREGUNTAS[REF].texto;
const inex = await intentar({ historia: 'hidrogeno-norte', pregunta: 'x', pregunta_ref: 'hidrogeno-norte:99' }), ajena = await intentar({ historia: 'hidrogeno-norte', pregunta: 'x', pregunta_ref: 'otra-historia:1' }), buena = await intentar({ historia: 'hidrogeno-norte', pregunta: 'Mi forma de preguntarlo', pregunta_ref: 'hidrogeno-norte:2' });
t('V1', 'Referencias nuevas: inexistente (hidrogeno-norte:99), de otra historia y válida (hidrogeno-norte:2)', 'Inexistente y de otra historia → 400; la válida → 201 (el catálogo es compartido por cliente y servidor)', `${inex.s}/${ajena.s}/${buena.s}; catálogo ${J(Object.keys(CATALOGO_PREGUNTAS))}`, inex.s === 400 && ajena.s === 400 && buena.s === 201 && refExiste('hidrogeno-norte:2') && !refExiste('hidrogeno-norte:99'));
const ref1 = await intentar({ historia: 'hidrogeno-norte', pregunta: TXT, pregunta_ref: REF }); const pat = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: '¿Al final firmaron C y D?', revision: ref1.j.revision }, { id: String(ref1.j.id) });
t('V2', 'La reformulación legítima conserva el vínculo', 'Tras reescribir con otras palabras el vínculo sigue y el seguimiento dice «responde» (avisando de que son palabras distintas)', `ref ${pat.j.pregunta_ref}; ${estadoSeguimiento(pat.j).tipo}; distinta ${estadoSeguimiento(pat.j).distinta}`, pat.j.pregunta_ref === REF && estadoSeguimiento(pat.j).tipo === 'responde' && estadoSeguimiento(pat.j).distinta === true);
// histórica inválida (escrita por la versión anterior): se identifica
env.sql.prepare("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json,pregunta,historia,pregunta_ref) VALUES (1,'historica-0099','Antigua','proporcional',1,'X',0,'C',10,'[]','[]','¿Cuánto sube el alquiler?','hidrogeno-norte','hidrogeno-norte:99')").run();
const hist = (await llama(env, ES.onRequestGet, 'GET')).j.find(x => x.clave === 'historica-0099'), eh = estadoSeguimiento(hist);
t('V3', 'Vínculo histórico inválido (escrito por la ronda 16: hidrogeno-norte:99)', 'La lectura lo identifica (`pregunta_ref_invalida`) y el seguimiento lo trata como pregunta propia («otra») avisando de que el vínculo ya no existe', `invalida ${hist.pregunta_ref_invalida}; estado ${eh.tipo}; refInvalida ${eh.refInvalida}`, hist.pregunta_ref_invalida === true && eh.tipo === 'otra' && eh.refInvalida === true);
const p1 = await llama(env, EI.onRequestPatch, 'PATCH', { nombre: 'Renombrada', revision: hist.revision }, { id: String(hist.id) }), p2 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: 'hidrogeno-norte:98', revision: p1.j.revision }, { id: String(hist.id) }), p3 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: p1.j.revision }, { id: String(hist.id) });
t('V4', 'Editar un escenario con vínculo histórico inválido', 'Renombrarlo no falla (el vínculo no cambia); cambiarlo a otro inexistente → 400; desvincularlo expresamente → 200 y desaparece la marca', `${p1.s}/${p2.s}/${p3.s}; ref ${p3.j.pregunta_ref}; inválida ${p3.j.pregunta_ref_invalida}`, p1.s === 200 && p2.s === 400 && p3.s === 200 && p3.j.pregunta_ref === null && p3.j.pregunta_ref_invalida === false);
const c1 = await intentar({ historia: 'hidrogeno-norte', pregunta: TXT, pregunta_ref: REF }), rev = c1.j.revision;
const a1 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: 'Edición de la pestaña 1', revision: rev }, { id: String(c1.j.id) }), a2 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: 'Edición de la pestaña 2', revision: rev }, { id: String(c1.j.id) });
const fin1 = await leer(c1.j.id);
t('V5', 'Edición concurrente (dos pestañas con la misma revisión)', 'La primera gana (200); la segunda recibe 409 con conflicto y no pisa nada; el vínculo sigue', `${a1.s}/${a2.s}; «${fin1.j.pregunta}»; ref ${fin1.j.pregunta_ref}`, a1.s === 200 && a2.s === 409 && a2.j.conflicto === true && fin1.j.pregunta === 'Edición de la pestaña 1' && fin1.j.pregunta_ref === REF);
const mig = readFileSync(new URL('../../migrations/0011_pregunta_estable.sql', import.meta.url), 'utf8');
t('V6', 'La migración 0011 usa exactamente los textos del catálogo', 'Cada texto literal del SQL coincide con el del catálogo compartido (si se cambia uno, esta prueba falla)', Object.entries(CATALOGO_PREGUNTAS).map(([k, v]) => `${k}: ${mig.includes(`pregunta_ref = '${k}'`) && mig.includes(v.texto)}`).join('; '), Object.entries(CATALOGO_PREGUNTAS).every(([k, v]) => mig.includes(`pregunta_ref = '${k}'`) && mig.includes(`pregunta = '${v.texto}'`)));
const sim = [similitudPregunta(TXT, '¿Al final firmaron C y D?'), similitudPregunta(TXT, '¿Cuánto sube el alquiler?'), similitudPregunta(TXT, TXT + '  ')];
t('V7', 'Aviso de que una reformulación parece tratar otro asunto', `Un texto sobre otro asunto queda por debajo del umbral (${UMBRAL_PARECIDO}); el mismo texto con espacios, en 1`, J(sim.map(x => Math.round(x * 100) / 100)), sim[1] < UMBRAL_PARECIDO && sim[2] === 1);

// ---- aislamiento con revocación del token
env = await montar(); n = 0;
const mi = await intentar({ historia: 'hidrogeno-norte', pregunta: TXT, pregunta_ref: REF, evaluacion: { antes: real, despues: pend } });
const listaB = await llama(env, ES.onRequestGet, 'GET', undefined, {}, 'token-de-b'), detB = await leer(mi.j.id, 'token-de-b'), patB = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta: 'x', revision: 0 }, { id: String(mi.j.id) }, 'token-de-b');
t('V8', 'Otra cuenta con sesión VÁLIDA', 'Autenticada (200) con lista VACÍA; 404 al abrir el ID concreto de la otra cuenta y 404 al editarlo; nada cambia', `lista ${listaB.s}/${listaB.j.length}; detalle ${detB.s}; patch ${patB.s}; pregunta intacta «${env.sql.prepare('SELECT pregunta FROM escenarios WHERE id=?').get(mi.j.id).pregunta.slice(0, 30)}»`, listaB.s === 200 && Array.isArray(listaB.j) && listaB.j.length === 0 && detB.s === 404 && patB.s === 404 && env.sql.prepare('SELECT pregunta FROM escenarios WHERE id=?').get(mi.j.id).pregunta === TXT);
const antes = (await leer(mi.j.id)).j, salida = await llama(env, LO.onRequestPost, 'POST'), tras = await leer(mi.j.id), nueva = await (async () => { env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,1)').run(await sha256('token-nuevo')); return leer(mi.j.id, 'token-nuevo'); })();
t('V9', 'Cerrar sesión por la API revoca el token antiguo; volver con la misma cuenta recupera lo mismo', 'El token antiguo da 401; con una sesión nueva de la misma cuenta, texto, vínculo, fecha y evaluación son idénticos a los de antes', `logout ${salida.s}; token antiguo ${tras.s}; sesión nueva ${nueva.s}; igual ${J(nueva.j.evaluacion) === J(antes.evaluacion) && nueva.j.pregunta_ref === antes.pregunta_ref && nueva.j.pregunta === antes.pregunta}`, salida.s === 200 && tras.s === 401 && nueva.s === 200 && J(nueva.j.evaluacion) === J(antes.evaluacion) && nueva.j.pregunta_ref === REF && nueva.j.pregunta === TXT && nueva.j.evaluacion.antes.nota === real.nota);
await fin();
