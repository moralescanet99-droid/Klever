// Ronda 18 · los contraejemplos EXACTOS de la revisión de la ronda 17, por API (manejadores con SQLite real) y por módulo:
//  I1 nota guardada con una décima imposible; I2 fecha con sufijo; I4 comparables ajenos y caché; M1 par historia/referencia histórico; M2 propiedad propia y ancho cero;
//  M3 fecha en la explicación; M4 título del ejemplo bancario. Uso: node tests/ronda18/unit-integridad18.mjs
import { readFileSync } from 'node:fs';
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import { onRequestGet as universoGet } from '../../functions/api/universo.js';
import { crearEnv, sembrar, RAIZ, registro } from '../lib/d1-sqlite.mjs';
import { validarResumen, normalizarFecha, evaluar, PESOS } from '../../public/js/nota.js';
import { htmlNotaEstructura } from '../../public/js/nota-ui.js';
import { estadoSeguimiento, CARTERA_EJEMPLO_INCOMPLETA } from '../../public/js/contenido.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-INT18.json');
const J = JSON.stringify, esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), visible = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const SEMILLA = readFileSync(RAIZ + '/data/seed-prueba.sql', 'utf8'), KP = [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }];
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const llama = async (env, f, m, body, params = {}) => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
let env = await montar(), n = 0;
const post = extra => llama(env, ES.onRequestPost, 'POST', { clave: 'intento-' + String(++n).padStart(4, '0'), nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...extra });
const IDS = ['empresas', 'sectores', 'tamano', 'deuda', 'rentabilidad'];
// resumen publicado con bloques dados: fortaleza = mejor bloque; limitación = la que más resta (exacta, sin redondear)
const resumen = (nota, b, o = {}) => { const bl = Object.fromEntries(IDS.map((k, i) => [k, b[i]])), perd = k => PESOS[k] * (10 - bl[k]) / 100, fort = IDS.reduce((a, k) => bl[k] > bl[a] ? k : a, IDS[0]), lim = IDS.reduce((a, k) => perd(k) > perd(a) ? k : a, IDS[0]);
  return { version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota, motivo: null, cobertura: 100, bloques: bl, fortaleza: fort, limitacion: { bloque: lim, perdida: perd(lim) }, ...o }; };
const pend = { version: 'estructura-v1', fecha: '2026-11-04', publicada: false, nota: null, motivo: null, cobertura: 50, bloques: null, fortaleza: null, limitacion: null };
const guardar = r => post({ evaluacion: { antes: r, despues: pend } });

// ---- I1: la décima imposible
const B1 = [5.44, 5.44, 5.47, 5.44, 5.44];
const malo = resumen(5.5, B1), r1 = await guardar(malo);
t('I1a', 'Contraejemplo exacto de la revisión: bloques 5,44 / 5,44 / 5,47 / 5,44 / 5,44 (suma 5,4445) con nota 5,5', 'POST → 400 («no puede salir de sus bloques»): para llegar a 5,5 habría que alcanzar 5,45 y el máximo posible es 5,4495', `HTTP ${r1.s}: ${r1.j.error}; fortaleza ${malo.fortaleza}, limitación ${malo.limitacion.bloque} ${malo.limitacion.perdida}`, r1.s === 400 && /no puede salir de sus bloques/.test(r1.j.error) && malo.fortaleza === 'tamano' && malo.limitacion.bloque === 'deuda');
const vecinos = [['mismo bloques con nota 5,4 (compatible)', resumen(5.4, B1)], ['bloques 5,45 con nota 5,5 (extremo inferior del intervalo)', resumen(5.5, [5.45, 5.45, 5.45, 5.45, 5.45])], ['bloques 5,44 con nota 5,4', resumen(5.4, [5.44, 5.44, 5.44, 5.44, 5.44])], ['bloques 5,44/5,44/5,47/5,44/5,45 con nota 5,5 (suma 5,4465: compatible solo con 5,4)', resumen(5.4, [5.44, 5.44, 5.47, 5.44, 5.45])], ['extremo 1,0', resumen(1, [1, 1, 1, 1, 1], { limitacion: { bloque: 'deuda', perdida: 2.25 } })], ['extremo 10', resumen(10, [10, 10, 10, 10, 10], { limitacion: { bloque: 'deuda', perdida: 0 } })]];
const res = []; for (const [k, v] of vecinos) { const r = await guardar(v); res.push(`${k}: ${r.s}`); }
t('I1b', 'Vecinos válidos y extremos por POST', 'Los compatibles se aceptan (201): 5,4 con esos bloques; 5,45 → 5,5; 5,44 → 5,4; los extremos 1 y 10', res.join(' | '), res.every(x => /: 201$/.test(x)));
const vecinosMalos = [['nota 5,5 con bloques 5,44 (suma 5,44 → máximo 5,445)', resumen(5.5, [5.44, 5.44, 5.44, 5.44, 5.44])], ['nota 5,3 con bloques 5,44', resumen(5.3, [5.44, 5.44, 5.44, 5.44, 5.44])], ['un bloque con tres decimales (5,443)', resumen(5.4, [5.443, 5.44, 5.44, 5.44, 5.44])], ['nota con dos decimales (5,45)', resumen(5.45, [5.45, 5.45, 5.45, 5.45, 5.45])]];
const rm = []; for (const [k, v] of vecinosMalos) { const r = await guardar(v); rm.push(`${k}: ${r.s}`); }
t('I1c', 'Vecinos inválidos', 'Nota fuera del intervalo, bloques con más de dos decimales y nota de dos decimales → 400', rm.join(' | '), rm.every(x => /: 400$/.test(x)));
const ok0 = await guardar(resumen(5.4, B1)); env.sql.prepare('UPDATE escenarios SET nota_json=? WHERE id=?').run(J({ antes: malo, despues: pend }), ok0.j.id);
const hist = await llama(env, EI.onRequestGet, 'GET', undefined, { id: String(ok0.j.id) });
t('I1d', 'Fila HISTÓRICA equivalente (el resumen de I1 ya guardado en la base)', 'La lectura la identifica como inválida (`evaluacion_invalida`) y no entrega la cifra; las filas legítimas siguen abriéndose', `invalida ${hist.j.evaluacion_invalida}; evaluacion ${hist.j.evaluacion}`, hist.j.evaluacion === null && hist.j.evaluacion_invalida === true);
// compatibilidad con registros antiguos: todo lo que produce el módulo cumple el intervalo (aunque se guardara con la tolerancia anterior)
const emp = i => ({ nombre: 'S' + i, tipo: 'accion', sector: 'S1', actividad: 'A' + (i % 4), emisor: 'e' + i, cap: 1e9 * (i + 1), imp: 1e6 * (i + 1), sesiones: 60, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04',
  ej: [2020, 2021, 2022, 2023, 2024].map((y, k) => ({ p: 'FY' + y, f: 'prueba', d: '2026-11-04', ing: 100 * (1 + k * .1) * (i + 1), ni: 10 * (i + 1), op: 12, ebitda: 20 * (i + 1), deuda: (i + 1) * 20 * (.5 + i / 40), fcf: 5 * (i + 1), roic: .02 + i * .005 })) });
const U = { fecha: '2026-11-04', origen: 'sintetico', empresas: Object.fromEntries(Array.from({ length: 30 }, (_, i) => ['S' + i, emp(i)])) };
let todas = true, probadas = 0, ejemplo = '';
const { resumenNota } = await import('../../public/js/nota.js');
for (let a = 0; a < 30; a += 3) for (let c = 1; c < 30; c += 4) { if (a === c) continue; const ev = evaluar([{ ticker: 'S' + a, peso: 30 }, { ticker: 'S' + c, peso: 70 }], U); if (!ev.publicada) continue; probadas++; const v = validarResumen(JSON.parse(J(resumenNota(ev))), { guardar: true }); if (!v.ok) { todas = false; ejemplo = v.motivo; } }
t('I1e', 'Compatibilidad: toda nota que calcula el propio módulo cumple la regla exacta', `${probadas} carteras calculadas por el módulo se aceptan con la validación estricta (no se rechaza nada legítimo)`, `${probadas} probadas; ${todas ? 'todas aceptadas' : ejemplo}`, probadas >= 20 && todas);

// ---- I2: la fecha se valida ENTERA
const fechas = [['2026-11-04', true], ['2026-11-04 10:00:00', true], ['2026-11-04T10:00:00Z', true], ['2026-11-04T10:00:00.123Z', true], ['2026-11-04basura', false], ['2026-11-04 25:00:00', false], ['2026-11-04 10:61:00', false], ['2026-11-04 10:00', false], [' 2026-11-04', false], ['2026-11-04 ', false], ['2026-02-31', false], ['2026-11-04T10:00:00+02:00', false], ['ayer', false], ['', false], [null, false]];
const malF = fechas.filter(([s, ok]) => (normalizarFecha(s) !== null) !== ok).map(([s]) => s);
t('I2a', 'normalizarFecha: fecha sola, marca de SQLite, ISO con Z y fracción sí; sufijo, hora imposible, espacios, zona con desfase y texto no', `${fechas.length} entradas`, malF.length ? 'fallan: ' + J(malF) : 'todas correctas', malF.length === 0);
const caso = async sql => { const e = crearEnv(); e.sql.exec(SEMILLA); if (sql) e.sql.exec(sql); const u = await (await universoGet({ env: e })).json(), ev = evaluar(KP, u); return { u, ev, txt: visible(htmlNotaEstructura(esc, ev, null)) }; };
const filasF = []; let okF = true;
for (const [f, ok] of [['2026-11-04', true], ['2026-11-04 10:00:00', true], ['2026-11-04T10:00:00Z', true], ['2026-11-04basura', false], ['2026-11-04 25:00:00', false]]) {
  for (const [donde, sql] of [['mercado', `UPDATE mercado SET fecha='${f}' WHERE ticker='KO'`], ['ejercicio', `UPDATE fundamentales SET actualizado_en='${f}' WHERE ticker='KO' AND periodo='FY2024'`]]) {
    const c = await caso(sql), bien = ok ? (c.u.origen === 'sintetico' && c.ev.nota === 4.4) : (c.u.origen === 'incompleto' && !c.ev.publicada && /no es una fecha válida/.test(c.txt)); filasF.push(`${donde} «${f}» → ${c.u.origen}/${c.ev.nota}`); if (!bien) okF = false; } }
t('I2b', 'Desde SQLite: el sufijo basura y la hora imposible dejan la nota pendiente; la fecha sola y las marcas admitidas conservan el 4,4', 'Mercado y ejercicio: «2026-11-04basura» y «2026-11-04 25:00:00» → incompleto y la pantalla dice que la fecha no es válida; «2026-11-04», «… 10:00:00» y «…T10:00:00Z» → 4,4', filasF.join('; '), okF);
const cinst = await caso("UPDATE mercado SET fecha='2026-11-04basura' WHERE ticker='AAPL'");
t('I2c', 'La instantánea del universo no adopta una fecha con sufijo', 'Con «2026-11-04basura» solo en AAPL, el universo es incompleto y la instantánea sigue siendo 2026-11-04', `${cinst.u.origen}; ${cinst.u.instantanea}`, cinst.u.origen === 'incompleto' && cinst.u.instantanea === '2026-11-04');

// ---- I4: comparables ajenos a la cartera
const base = (await caso('')).u, ajeno = Object.entries(base.empresas).find(([k, e]) => e.sector === 'Consumo básico' && !e.ficticia && !['KO', 'PG'].includes(k))[0];
const clon = () => structuredClone(base);
const directo = (mut, o = {}) => { const u = clon(); mut(u); return evaluar(KP, { ...u, ...o }); };
const dA = directo(u => { u.empresas[ajeno].fechaMercado = 'ayer'; }), dB = directo(u => { for (const [k, e] of Object.entries(u.empresas)) if (e.sector === 'Consumo básico' && !['KO', 'PG'].includes(k)) e.ej = e.ej.map(r => ({ ...r, f: null })); }), dC = directo(u => { u.empresas[ajeno].fuenteMercado = null; });
t('I4a', `Evaluador DIRECTO con origen sintético: un comparable ajeno a la cartera (${ajeno}) con fecha «ayer», sin fuente de mercado, o todos los de su sector sin fuente en los ejercicios`, 'Pendiente en los tres casos y la causa nombra al comparable; antes la verificación solo recorría las posiciones y daba 4,4', `${dA.publicada}/${dB.publicada}/${dC.publicada}; «${dA.motivo.slice(0, 120)}»`, !dA.publicada && !dB.publicada && !dC.publicada && new RegExp(ajeno + ' \\(comparable\\)').test(dA.motivo) && /\(comparable\)/.test(dB.motivo));
const cAPI = await caso(`UPDATE mercado SET fuente=NULL WHERE ticker='${ajeno}'`), cAPI2 = await caso(`UPDATE fundamentales SET actualizado_en='2026-02-31' WHERE ticker='${ajeno}' AND periodo='FY2022'`);
t('I4b', 'Ruta de API: un comparable ajeno con la fuente de mercado a NULL o una fecha imposible en un ejercicio', 'Origen «incompleto» y nota pendiente (la API protege el conjunto de comparación)', `${cAPI.u.origen}/${cAPI.ev.publicada}; ${cAPI2.u.origen}/${cAPI2.ev.publicada}`, cAPI.u.origen === 'incompleto' && !cAPI.ev.publicada && cAPI2.u.origen === 'incompleto' && !cAPI2.ev.publicada);
// caché: mismo objeto `empresas`, distinto origen
const U0 = clon(), s1 = evaluar(KP, U0), r1c = evaluar(KP, { ...U0, origen: 'real', habilitada: true }), s2 = evaluar(KP, U0), copia = evaluar(KP, { ...structuredClone(U0), origen: 'real', habilitada: true });
t('I4c', 'Caché: el MISMO objeto `empresas` evaluado como sintético, luego como real habilitado, luego otra vez como sintético, y una copia nueva', 'Sintético: 126 empresas de comparación (21 ficticias) y 4,4; real con el mismo objeto: solo las 105 reales (pendiente: 10 comparables en el sector); de nuevo sintético: otra vez 4,4; la copia nueva coincide con el real', `${s1.poblacion.empresas}/${s1.nota}; ${r1c.poblacion.empresas}/${r1c.publicada}; ${s2.poblacion.empresas}/${s2.nota}; copia ${copia.poblacion.empresas}/${copia.publicada}`,
  s1.nota === 4.4 && s1.poblacion.ficticias === 21 && s1.poblacion.empresas === 126 && !r1c.publicada && r1c.poblacion.empresas === 105 && s2.nota === 4.4 && s2.poblacion.empresas === s1.poblacion.empresas && copia.poblacion.empresas === r1c.poblacion.empresas && !copia.publicada);

// ---- M1: par historia/referencia histórico
env = await montar(); n = 0; const TXT = '¿Se han firmado los dos contratos anunciados?';
const ins = (clave, historia, ref) => env.sql.prepare("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json,pregunta,historia,pregunta_ref) VALUES (1,?,'Antiguo','proporcional',1,'X',0,'C',10,'[]','[]',?,?,?)").run(clave, TXT, historia, ref);
ins('discordante-001', 'otra-historia', 'hidrogeno-norte:1'); ins('correcto-000001', 'hidrogeno-norte', 'hidrogeno-norte:1');
const lista = (await llama(env, ES.onRequestGet, 'GET')).j, dis = lista.find(x => x.clave === 'discordante-001'), cor = lista.find(x => x.clave === 'correcto-000001');
t('M1a', 'Vínculo histórico DISCORDANTE (historia «otra-historia» con la referencia hidrogeno-norte:1)', 'La lectura lo marca inválido (par, no solo identificador) y el seguimiento NO lo trata como «responde»; el correcto sigue «responde»', `discordante inválido ${dis.pregunta_ref_invalida}, estado ${estadoSeguimiento(dis).tipo}/${estadoSeguimiento(dis).refInvalida}; correcto inválido ${cor.pregunta_ref_invalida}, estado ${estadoSeguimiento(cor).tipo}`, dis.pregunta_ref_invalida === true && estadoSeguimiento(dis).tipo !== 'responde' && estadoSeguimiento(dis).refInvalida === true && cor.pregunta_ref_invalida === false && estadoSeguimiento(cor).tipo === 'responde');
const p1 = await llama(env, EI.onRequestPatch, 'PATCH', { nombre: 'Renombrado', revision: dis.revision }, { id: String(dis.id) }), p2 = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: p1.j.revision }, { id: String(dis.id) });
t('M1b', 'PATCH sobre un vínculo discordante', 'Renombrar conserva el vínculo discordante sin fallar (200); desvincularlo expresamente lo quita (200) y conserva el texto personal', `${p1.s}(${p1.j.pregunta_ref}) / ${p2.s}(${p2.j.pregunta_ref}, «${p2.j.pregunta.slice(0, 25)}»)`, p1.s === 200 && p1.j.pregunta_ref === 'hidrogeno-norte:1' && p2.s === 200 && p2.j.pregunta_ref === null && p2.j.pregunta === TXT && p2.j.pregunta_ref_invalida === false);
const respondida = (await llama(env, ES.onRequestGet, 'GET')).j.find(x => x.clave === 'correcto-000001'), viejo = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: respondida.revision + 5 }, { id: String(respondida.id) }), des = await llama(env, EI.onRequestPatch, 'PATCH', { pregunta_ref: null, revision: respondida.revision }, { id: String(respondida.id) });
t('M1c', 'Desvincular una pregunta RESPONDIDA', 'Con una revisión obsoleta → 409 y nada cambia; con la vigente → 200: se elimina la asociación editorial, el texto personal se conserva y el seguimiento pasa a «otra pregunta»', `${viejo.s}; ${des.s}; ref ${des.j.pregunta_ref}; «${des.j.pregunta.slice(0, 20)}»; ${estadoSeguimiento(des.j).tipo}`, viejo.s === 400 || viejo.s === 409 ? des.s === 200 && des.j.pregunta_ref === null && des.j.pregunta === TXT && estadoSeguimiento(des.j).tipo === 'otra' : false);

// ---- M2: propiedad propia y ancho cero
const base0 = { version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota: 6, motivo: null, cobertura: 100, bloques: Object.fromEntries(IDS.map(k => [k, 6])), fortaleza: 'empresas' };
const hered = { ...base0, limitacion: Object.assign(Object.create({ perdida: 1 }), { bloque: 'deuda' }) }, propia = { ...base0, limitacion: { bloque: 'deuda', perdida: 1 } };
const pm = x => validarResumen({ version: 'estructura-v1', fecha: null, publicada: false, nota: null, motivo: x, cobertura: null, bloques: null, fortaleza: null, limitacion: null }).ok;
t('M2a', '`limitacion.perdida` heredada (objeto JS directo) frente a propia', 'La heredada se rechaza; la propia, aceptada', `heredada ${validarResumen(hered).ok}; propia ${validarResumen(propia).ok}`, !validarResumen(hered).ok && validarResumen(propia).ok);
t('M2b', 'Texto visible: ancho cero fuera, escritura legítima dentro', 'Se rechazan U+200B, U+2060 y U+FEFF; se aceptan el ZWJ de un emoji compuesto, el ZWNJ del persa, ñ, tildes y «»; los controles bidireccionales siguen fuera', J({ zwsp: pm('a​b'), wj: pm('a⁠b'), bom: pm('﻿ab'), zwj: pm('Familia 👨‍👩‍👧'), zwnj: pm('می‌خواهم'), es: pm('Señal «ñandú» — ¿qué?'), bidi: pm('a‮b') }), !pm('a​b') && !pm('a⁠b') && !pm('﻿ab') && pm('Familia 👨‍👩‍👧') && pm('می‌خواهم') && pm('Señal «ñandú» — ¿qué?') && !pm('a‮b'));

// ---- M3 y M4
const c3 = await caso(''), txt3 = c3.txt;
t('M3', 'La explicación no atribuye una fecha común a todos los fundamentales', 'Dice «Instantánea del 4 nov 2026; ejercicios hasta FY2024» y no «fundamentales observados el»; el detalle da la fecha de carga y la fuente de cada empresa', `${txt3.match(/Instantánea del[^;]*;[^.]*\./)?.[0]}; ${txt3.match(/KO: ejercicios hasta[^.]*\./)?.[0]}; observados ${/observados el/.test(txt3)}`, /Instantánea del 4 nov\.? 2026; ejercicios hasta FY2024/.test(txt3) && !/observados el/.test(txt3) && /KO: ejercicios hasta FY2024, cargado el 2026-11-04 \(prueba\)/.test(txt3));
t('M4', 'Título del ejemplo bancario', 'Se llama «Ejemplo con evaluación parcial» (límite del método), no «datos incompletos»', CARTERA_EJEMPLO_INCOMPLETA.nombre, /evaluación parcial/.test(CARTERA_EJEMPLO_INCOMPLETA.nombre) && !/incompletos/.test(CARTERA_EJEMPLO_INCOMPLETA.nombre));
await fin();
