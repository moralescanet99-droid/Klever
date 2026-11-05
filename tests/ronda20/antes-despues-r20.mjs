// Ronda 20: ANTES/DESPUÉS corto de los dos defectos de la revisión de la ronda 19. Uso: node tests/ronda20/antes-despues-r20.mjs <raíz-del-código> [etiqueta]
// «Antes» = la ronda 19 (commit 9a1e272) en un árbol aparte; «después» = el código actual. 1) causas de una evaluación incompleta (los tres casos exactos de la revisión + el conjunto); 2) código de salida del ayudante de pruebas
// tras una aserción fallida (el ejemplo literal de la revisión). Módulo y servidor con SQLite real y subprocesos de Node; SIN navegador de interacción.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { crearEnv } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const raiz = path.resolve(process.argv[2] || '.'), et = process.argv[3] || raiz, im = p => import(pathToFileURL(path.join(raiz, p)).href);
const [UN, N, UI] = await Promise.all([im('functions/api/universo.js'), im('public/js/nota.js'), im('public/js/nota-ui.js')]);
const SEMILLA = readFileSync(new URL('../../data/seed-prueba.sql', import.meta.url), 'utf8'), P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const run = async (n, c, sql) => { const e = crearEnv(path.join(raiz, 'schema.sql')); e.sql.exec(SEMILLA); if (sql) e.sql.exec(sql); const u = await (await UN.onRequestGet({ env: e })).json(), ev = N.evaluar(c, u);
  console.log(`${n}\n    estado: ${UI.estadoNota ? UI.estadoNota(ev) : '«Nota pendiente» (único encabezado)'}\n    texto: ${UI.explicarNota(ev)}`); };
console.log(`# ${et}`);
await run('1. JPM 50 % + KO 50 %, KO sin EBITDA', P(['JPM', 50], ['KO', 50]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
await run('2. SCHD 1 % + AAPL 99 %', P(['SCHD', 1], ['AAPL', 99]));
await run('3. JPM 50 % + PG 50 %, JPM sin capitalización', P(['JPM', 50], ['PG', 50]), "UPDATE mercado SET capitalizacion=NULL WHERE ticker='JPM'");
await run('4. SCHD 20 % + JPM 40 % + KO 40 %, KO sin EBITDA', P(['SCHD', 20], ['JPM', 40], ['KO', 40]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
await run('5. Plantilla mixta (con ETF)', P(['SCHD', 17], ['VYM', 16.6], ['KO', 16.6], ['PG', 16.6], ['JNJ', 16.6], ['XOM', 16.6]));
const r = spawnSync('node', ['-e', "const h=require('./tests/ronda5/h.cjs'); h.ok('fallo intencionado',false); h.fin();"], { cwd: raiz, encoding: 'utf8', timeout: 60000 });
console.log(`6. Ayudante de pruebas con UNA aserción fallida (el ejemplo literal de la revisión)\n    salida: ${(r.stdout || '').split('\n').find(l => /RESULTADO/.test(l))}\n    código de salida: ${r.status}`);
