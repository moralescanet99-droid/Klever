// Ronda 19: ANTES/DESPUÉS de dos cambios, a nivel de módulo (SQLite real, sin navegador). Uso: node tests/ronda19/antes-despues-r19.mjs <raíz-del-código> [etiqueta]
// «Antes» = la ronda 18 (commit 51d9523) en un árbol aparte; «después» = el código actual. 1) frontera del redondeo: bloques 5,44/5,44/5,44/5,46/5,44 con nota 5,5; 2) texto de la revisión sin nota para la plantilla mixta (ETF).
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { crearEnv } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const raiz = path.resolve(process.argv[2] || '.'), et = process.argv[3] || raiz, im = p => import(pathToFileURL(path.join(raiz, p)).href);
const [UN, N, UI] = await Promise.all([im('functions/api/universo.js'), im('public/js/nota.js'), im('public/js/nota-ui.js')]);
const SEMILLA = readFileSync(new URL('../../data/seed-prueba.sql', import.meta.url), 'utf8'), IDS = ['empresas', 'sectores', 'tamano', 'deuda', 'rentabilidad'], out = {};
const resumen = (nota, b) => { const bl = Object.fromEntries(IDS.map((k, i) => [k, b[i]])), perd = k => N.PESOS[k] * (10 - bl[k]) / 100, f = IDS.reduce((a, k) => bl[k] > bl[a] ? k : a, IDS[0]), l = IDS.reduce((a, k) => perd(k) > perd(a) ? k : a, IDS[0]);
  return { version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota, motivo: null, cobertura: 100, bloques: bl, fortaleza: f, limitacion: { bloque: l, perdida: perd(l) } }; };
const acepta = (nota, b) => { const r = N.validarResumen(JSON.parse(JSON.stringify(resumen(nota, b))), { guardar: true }); return r.ok ? 'ACEPTADO' : 'RECHAZADO'; };
out['5,44/5,44/5,44/5,46/5,44 · nota 5,5 (el contraejemplo de la revisión)'] = acepta(5.5, [5.44, 5.44, 5.44, 5.46, 5.44]);
out['mismos bloques · nota 5,4 (la que sí corresponde: el total real máximo es 5,4499…)'] = acepta(5.4, [5.44, 5.44, 5.44, 5.46, 5.44]);
out['frontera legítima 5,45 en todos · nota 5,5'] = acepta(5.5, [5.45, 5.45, 5.45, 5.45, 5.45]);
const e = crearEnv(path.join(raiz, 'schema.sql')); e.sql.exec(SEMILLA); const u = await (await UN.onRequestGet({ env: e })).json();
const MIXTA = [['SCHD', 17], ['VYM', 16.6], ['KO', 16.6], ['PG', 16.6], ['JNJ', 16.6], ['XOM', 16.6]].map(([ticker, peso]) => ({ ticker, peso })), ev = N.evaluar(MIXTA, u);
out['plantilla mixta · nota publicada'] = ev.publicada; out['plantilla mixta · explicación breve'] = UI.explicarNota(ev);
console.log(`# ${et}`); for (const [k, v] of Object.entries(out)) console.log(`${k}: ${v}`);
