// Ronda 19 · frontera del redondeo de la nota guardada. Contrato decimal (intervalos SEMIABIERTOS): bloques de dos decimales con el extremo superior excluido y nota = redondeo half-up a un decimal.
// 1) el contraejemplo EXACTO de la revisión de la ronda 18 y sus vecinos a ambos lados de la frontera (por validador, por POST y por lectura de una fila histórica);
// 2) un ORÁCULO independiente (fuerza bruta en millonésimas) contra el validador en miles de resúmenes cerca de la frontera;
// 3) una barrida de carteras calculadas por el EVALUADOR: ninguna salida legítima puede rechazarse (no se tolera ningún empate binario). Uso: node tests/ronda19/unit-redondeo19.mjs
import * as ES from '../../functions/api/escenarios/index.js';
import * as EI from '../../functions/api/escenarios/[id].js';
import { crearEnv, sembrar, registro } from '../lib/d1-sqlite.mjs';
import { validarResumen, evaluar, resumenNota, PESOS } from '../../public/js/nota.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-RED19.json');
const J = JSON.stringify, IDS = ['empresas', 'sectores', 'tamano', 'deuda', 'rentabilidad'];
const montar = async () => { const env = crearEnv(); await sembrar(env);
  for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
  env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`); return env; };
const env = await montar(); let n = 0;
const llama = async (f, m, body, params = {}) => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const post = extra => llama(ES.onRequestPost, 'POST', { clave: 'intento-' + String(++n).padStart(4, '0'), nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...extra });
const pend = { version: 'estructura-v1', fecha: '2026-11-04', publicada: false, nota: null, motivo: null, cobertura: 50, bloques: null, fortaleza: null, limitacion: null };
// resumen publicado: fortaleza = mejor bloque; limitación = la que más resta (exacta)
const resumen = (nota, b) => { const bl = Object.fromEntries(IDS.map((k, i) => [k, b[i]])), perd = k => PESOS[k] * (10 - bl[k]) / 100, f = IDS.reduce((a, k) => bl[k] > bl[a] ? k : a, IDS[0]), l = IDS.reduce((a, k) => perd(k) > perd(a) ? k : a, IDS[0]);
  return { version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota, motivo: null, cobertura: 100, bloques: bl, fortaleza: f, limitacion: { bloque: l, perdida: perd(l) } }; };
const ok = r => validarResumen(JSON.parse(J(r)), { guardar: true }).ok;
// ORÁCULO independiente: ¿existe un total T (en millonésimas, [S6−5000, S6+5000)) cuyo redondeo half-up a un decimal sea la nota? Fuerza bruta, sin la fórmula de intervalos.
const oraculo = (nota, b) => { const S6 = IDS.reduce((s, k, i) => s + PESOS[k] * Math.round(b[i] * 100), 0) * 100, n10 = Math.round(nota * 10); for (let T = S6 - 5000; T < S6 + 5000; T++) if (Math.floor((T + 50000) / 100000) === n10) return true; return false; };

// ---- 1. el contraejemplo exacto y sus vecinos
const B0 = [5.44, 5.44, 5.44, 5.46, 5.44], malo = resumen(5.5, B0), r0 = await post({ evaluacion: { antes: malo, despues: pend } });
t('R1', 'Contraejemplo EXACTO de la revisión: bloques 5,44 / 5,44 / 5,44 / 5,46 (deuda) / 5,44 con nota 5,5 (suma 5,445; la nota 5,5 necesita llegar a 5,450 y el extremo superior de 5,445 es 5,450 EXCLUIDO)', 'El validador lo rechaza y el POST devuelve 400 («no puede salir de sus bloques»); fortaleza = deuda y pérdida 1,135 como en la revisión', `validador ${ok(malo)}; HTTP ${r0.s}: ${r0.j.error}; ${malo.fortaleza} ${malo.limitacion.perdida}`, !ok(malo) && r0.s === 400 && /no puede salir de sus bloques/.test(r0.j.error) && malo.fortaleza === 'deuda' && Math.abs(malo.limitacion.perdida - 1.135) < 1e-12);
const vecinos = [['mismos bloques con nota 5,4 (compatible)', resumen(5.4, B0), true], ['una unidad de peso más (5,43 en empresas y 5,47 en deuda: S = 5,4455) con nota 5,5', resumen(5.5, [5.43, 5.44, 5.44, 5.47, 5.44]), true], ['una unidad menos (5,45 en empresas y 5,45 en deuda: S = 5,4475… 5,4425) con nota 5,5', resumen(5.5, [5.45, 5.44, 5.44, 5.45, 5.44]), false],
  ['deuda 5,50 (S = 5,455) con nota 5,4: contacto por el otro lado', resumen(5.4, [5.44, 5.44, 5.44, 5.50, 5.44]), false], ['deuda 5,50 con nota 5,5 (compatible)', resumen(5.5, [5.44, 5.44, 5.44, 5.50, 5.44]), true]];
const filas = []; let vok = true; for (const [k, r, esp] of vecinos) { const p = await post({ evaluacion: { antes: r, despues: pend } }), o = oraculo(r.nota, IDS.map(x => r.bloques[x])), acepta = p.s === 201; filas.push(`${k}: validador ${ok(r)} POST ${p.s} oráculo ${o}`); if (acepta !== esp || ok(r) !== esp || o !== esp) vok = false; }
t('R2', 'Vecinos a ambos lados de la frontera por validador, POST y oráculo independiente', 'Coinciden los tres con lo esperado: compatibles → 201; incompatibles → 400', filas.join(' | '), vok);
const ext = [['extremo 1,0', resumen(1, [1, 1, 1, 1, 1])], ['extremo 10', resumen(10, [10, 10, 10, 10, 10])], ['nota 1,0 con bloques 1,04 (T < 1,045 → redondea a 1,0)', resumen(1, [1.04, 1.04, 1.04, 1.04, 1.04])]];
const rx = []; for (const [k, r] of ext) { const p = await post({ evaluacion: { antes: r, despues: pend } }); rx.push(`${k}: ${p.s}`); }
t('R3', 'Extremos 1 y 10 por POST', 'Se aceptan (201)', rx.join(' | '), rx.every(x => /: 201$/.test(x)));
// lectura de una fila histórica en la frontera
const base = await post({ evaluacion: { antes: resumen(5.4, B0), despues: pend } });
env.sql.prepare('UPDATE escenarios SET nota_json=? WHERE id=?').run(J({ antes: malo, despues: pend }), base.j.id); const l1 = await llama(EI.onRequestGet, 'GET', undefined, { id: String(base.j.id) });
env.sql.prepare('UPDATE escenarios SET nota_json=? WHERE id=?').run(J({ antes: resumen(5.4, B0), despues: pend }), base.j.id); const l2 = await llama(EI.onRequestGet, 'GET', undefined, { id: String(base.j.id) });
t('R4', 'Lectura de una fila histórica: la del contraejemplo y la de su vecino compatible', 'La del contraejemplo se identifica como inválida (sin recalcular nada en silencio); la compatible se entrega tal cual', `contraejemplo: invalida ${l1.j.evaluacion_invalida}, evaluacion ${l1.j.evaluacion}; vecino: invalida ${l2.j.evaluacion_invalida}, nota ${l2.j.evaluacion?.antes?.nota}`, l1.j.evaluacion === null && l1.j.evaluacion_invalida === true && l2.j.evaluacion?.antes?.nota === 5.4 && !l2.j.evaluacion_invalida);

// ---- 2. oráculo contra validador en miles de resúmenes cerca de la frontera (semilla fija: reproducible)
let sem = 12345; const alea = () => (sem = (sem * 1664525 + 1013904223) % 4294967296) / 4294967296;
let total = 0, difs = [], enFrontera = 0;
for (let i = 0; i < 6000; i++) { const b = IDS.map(() => Math.round((5.40 + alea() * 0.10) * 100) / 100), S4 = IDS.reduce((s, k, j) => s + PESOS[k] * Math.round(b[j] * 100), 0);
  for (const nota of [5.4, 5.5]) { total++; const r = resumen(nota, b), a = ok(r), o = oraculo(nota, b); if (Math.abs(S4 - (nota * 10000 - 500 - 50)) <= 5 || Math.abs(S4 - (nota * 10000 + 500 + 50)) <= 5) enFrontera++; if (a !== o) difs.push(`${J(b)} ${nota}: validador ${a} oráculo ${o}`); } }
t('R5', 'Oráculo de fuerza bruta frente al validador en 12 000 resúmenes (6 000 combinaciones de bloques entre 5,40 y 5,50, con notas 5,4 y 5,5)', 'Ninguna discrepancia, y entre ellos hay casos EN la frontera exacta', `${total} resúmenes; ${enFrontera} en la frontera (±0,0005); discrepancias ${difs.length}${difs.length ? ' p. ej. ' + difs[0] : ''}`, difs.length === 0 && enFrontera > 50);

// ---- 3. salidas LEGÍTIMAS del evaluador: ninguna se rechaza (no se tolera un empate binario)
const emp = (i, r) => ({ nombre: 'S' + i, tipo: 'accion', sector: 'S1', actividad: 'A' + (i % 4), emisor: 'e' + i, cap: 1e9 * (1 + r() * 30), imp: 1e6 * (1 + r() * 30), sesiones: 60, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04',
  ej: [2020, 2021, 2022, 2023, 2024].map((y, k) => ({ p: 'FY' + y, f: 'prueba', d: '2026-11-04', ing: 100 * (1 + k * .1 * r()) * (1 + r() * 9), ni: 10 * (r() * 3 - .5) * (i + 1), op: 12, ebitda: 20 * (1 + r() * 9), deuda: (r() * 3 - .3) * 20 * (1 + r() * 9), fcf: (r() * 4 - 1) * 5, roic: .02 + r() * 0.25 })) });
let probadas = 0, rechazadas = [], cerca = 0;
for (let u = 0; u < 12; u++) { const emps = Object.fromEntries(Array.from({ length: 30 }, (_, i) => ['S' + i, emp(i, alea)])), U = { fecha: '2026-11-04', origen: 'sintetico', empresas: emps };
  for (let c = 0; c < 400; c++) { const m = 2 + Math.floor(alea() * 4), tk = new Set(); while (tk.size < m) tk.add('S' + Math.floor(alea() * 30)); const lista = [...tk]; let resto = 1000; const pesos = lista.map((_, i) => { if (i === m - 1) return resto; const v = 1 + Math.floor(alea() * (resto - (m - 1 - i))); resto -= v; return v; });
    const ev = evaluar(lista.map((x, i) => ({ ticker: x, peso: pesos[i] / 10 })), U); if (!ev.publicada) continue; probadas++;
    const r = JSON.parse(J(resumenNota(ev))), v = validarResumen(r, { guardar: true }); if (!v.ok) rechazadas.push(`${J(r.bloques)} ${r.nota}: ${v.motivo}`);
    const S4 = IDS.reduce((s, k) => s + PESOS[k] * Math.round(r.bloques[k] * 100), 0), d = Math.min(Math.abs(S4 + 50 - (Math.round(r.nota * 10) * 1000 - 500)), Math.abs(S4 - 50 - (Math.round(r.nota * 10) * 1000 + 500))); if (d <= 10) cerca++; } }
t('R6', 'Barrida de carteras calculadas por el EVALUADOR (12 universos aleatorios × 400 carteras de 2 a 5 posiciones, semilla fija)', 'Toda nota publicada por el evaluador se acepta con el contrato estricto: 0 rechazos (no hace falta tolerar empates binarios)', `${probadas} notas publicadas; ${cerca} a ≤ 0,001 de la frontera; rechazadas ${rechazadas.length}${rechazadas.length ? ' p. ej. ' + rechazadas[0] : ''}`, probadas > 1500 && rechazadas.length === 0);
await fin();
