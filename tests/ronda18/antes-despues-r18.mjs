// Ronda 18: ANTES/DESPUÉS de los contraejemplos EXACTOS de la revisión de la ronda 17. Uso: node tests/ronda18/antes-despues-r18.mjs <raíz-del-código> [etiqueta]
// «Antes» = la ronda 17 (commit fd424f8) en un árbol de trabajo aparte; «después» = el código actual. Módulo y servidor (SQLite real), NO navegador.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { crearEnv, sembrar } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const raiz = path.resolve(process.argv[2] || '.'), et = process.argv[3] || raiz, im = p => import(pathToFileURL(path.join(raiz, p)).href);
const [UN, ES, EI, N, C] = await Promise.all([im('functions/api/universo.js'), im('functions/api/escenarios/index.js'), im('functions/api/escenarios/[id].js'), im('public/js/nota.js'), im('public/js/contenido.js')]);
const SEMILLA = readFileSync(new URL('../../data/seed-prueba.sql', import.meta.url), 'utf8'), KP = [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], out = {};
const caso = async sql => { const e = crearEnv(path.join(raiz, 'schema.sql')); e.sql.exec(SEMILLA); if (sql) e.sql.exec(sql); const u = await (await UN.onRequestGet({ env: e })).json(), ev = N.evaluar(KP, u); return { origen: u.origen, publicada: ev.publicada, nota: ev.nota }; };
// I2: la fecha admite cualquier sufijo
out.I2_sufijoBasura = await caso("UPDATE mercado SET fecha='2026-11-04basura' WHERE ticker='KO'");
out.I2_horaImposible = await caso("UPDATE mercado SET fecha='2026-11-04 25:00:00' WHERE ticker='KO'");
out.I2_marcaSQLite = await caso("UPDATE mercado SET fecha='2026-11-04 10:00:00' WHERE ticker='KO'");
// I4: comparables ajenos alterados con el evaluador directo y origen sintético
const e0 = crearEnv(path.join(raiz, 'schema.sql')); e0.sql.exec(SEMILLA); const base = await (await UN.onRequestGet({ env: e0 })).json();
const ajeno = Object.entries(base.empresas).find(([k, e]) => e.sector === 'Consumo básico' && !e.ficticia && !['KO', 'PG'].includes(k))[0];
const dir = mut => { const u = structuredClone(base); mut(u); const ev = N.evaluar(KP, u); return { publicada: ev.publicada, nota: ev.nota }; };
out.I4_comparableAjenoFechaAyer = dir(u => { u.empresas[ajeno].fechaMercado = 'ayer'; });
out.I4_comparablesSinFuente = dir(u => { for (const [k, e] of Object.entries(u.empresas)) if (e.sector === 'Consumo básico' && !['KO', 'PG'].includes(k)) e.ej = e.ej.map(r => ({ ...r, f: null })); });
const U0 = structuredClone(base), a1 = N.evaluar(KP, U0), a2 = N.evaluar(KP, { ...U0, origen: 'real', habilitada: true });
out.I4_cacheMismoObjeto = { sintetico: a1.nota, realHabilitado: { publicada: a2.publicada, poblacion: a2.poblacion?.empresas ?? 'sin dato' } };
// I1, M1: servidor
const env = crearEnv(path.join(raiz, 'schema.sql')); await sembrar(env);
for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`);
let n = 0; const post = async extra => (await ES.onRequestPost({ request: new Request('http://x', { method: 'POST', headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: JSON.stringify({ clave: 'intento-' + String(++n).padStart(4, '0'), nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...extra }) }), env, params: {} })).status;
const pend = { version: 'estructura-v1', fecha: '2026-11-04', publicada: false, nota: null, motivo: null, cobertura: 50, bloques: null, fortaleza: null, limitacion: null };
const res = (nota, b) => { const IDS = ['empresas', 'sectores', 'tamano', 'deuda', 'rentabilidad'], P = { empresas: 20, sectores: 20, tamano: 15, deuda: 25, rentabilidad: 20 }, bl = Object.fromEntries(IDS.map((k, i) => [k, b[i]])), perd = k => P[k] * (10 - bl[k]) / 100, f = IDS.reduce((a, k) => bl[k] > bl[a] ? k : a), l = IDS.reduce((a, k) => perd(k) > perd(a) ? k : a); return { version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota, motivo: null, cobertura: 100, bloques: bl, fortaleza: f, limitacion: { bloque: l, perdida: perd(l) } }; };
out.I1_decimaImposible = await post({ evaluacion: { antes: res(5.5, [5.44, 5.44, 5.47, 5.44, 5.44]), despues: pend } });
out.I1_compatible = await post({ evaluacion: { antes: res(5.4, [5.44, 5.44, 5.47, 5.44, 5.44]), despues: pend } });
out.M1_parDiscordante = C.estadoSeguimiento({ historia: 'otra-historia', pregunta_ref: 'hidrogeno-norte:1', pregunta: 'x' }).tipo;
console.log(`${et}: ${JSON.stringify(out)}`);
