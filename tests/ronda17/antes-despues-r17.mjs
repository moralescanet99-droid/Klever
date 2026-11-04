// Ronda 17: ANTES/DESPUÉS con el mismo guion, desde SQLite hasta el resultado. Uso: node tests/ronda17/antes-despues-r17.mjs <raíz-del-código> [etiqueta]
// «Antes» = la ronda 16 (commit 0aea105) en un árbol de trabajo aparte; «después» = el código actual. Módulo y servidor (SQLite real), NO navegador.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { crearEnv, sembrar } from '../lib/d1-sqlite.mjs';
import { sha256 } from '../../functions/_lib.js';
process.removeAllListeners('warning');
const raiz = path.resolve(process.argv[2] || '.'), et = process.argv[3] || raiz, im = p => import(pathToFileURL(path.join(raiz, p)).href);
const [UN, ES, EI, N] = await Promise.all([im('functions/api/universo.js'), im('functions/api/escenarios/index.js'), im('functions/api/escenarios/[id].js'), im('public/js/nota.js')]);
const SEMILLA = readFileSync(new URL('../../data/seed-prueba.sql', import.meta.url), 'utf8'), KP = [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }];
const out = {};
const nota = async sql => { const env = crearEnv(path.join(raiz, 'schema.sql')); env.sql.exec(SEMILLA); if (sql) env.sql.exec(sql); const u = await (await UN.onRequestGet({ env })).json(), ev = N.evaluar(KP, u); return { origen: u.origen, publicada: ev.publicada, nota: ev.nota }; };
out.semilla = await nota('');
out.fuenteNULL = await nota("UPDATE fundamentales SET fuente=NULL WHERE ticker='KO'");
out.fechaAyerMercado = await nota("UPDATE mercado SET fecha='ayer' WHERE ticker='KO'");
out.fechaImposible = await nota("UPDATE fundamentales SET actualizado_en='2026-02-31' WHERE ticker='KO' AND periodo='FY2024'");
out.mixto = await nota("UPDATE fundamentales SET fuente='sec' WHERE ticker='PG'");
// nota guardada y vínculo editorial
const env = crearEnv(path.join(raiz, 'schema.sql')); await sembrar(env);
for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`);
let n = 0;
const post = async extra => { const r = await ES.onRequestPost({ request: new Request('http://x', { method: 'POST', headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: JSON.stringify({ clave: 'intento-' + String(++n).padStart(4, '0'), nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], ...extra }) }), env, params: {} }); return r.status; };
const bl = v => ({ empresas: v, sectores: v, tamano: v, deuda: v, rentabilidad: v });
const res = (o = {}) => ({ version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota: 6, motivo: null, cobertura: 100, bloques: bl(6), fortaleza: 'empresas', limitacion: { bloque: 'deuda', perdida: 1 }, ...o });
const pend = { version: 'estructura-v1', fecha: '2026-11-04', publicada: false, nota: null, motivo: null, cobertura: 50, bloques: null, fortaleza: null, limitacion: null };
out.notaGuardada = { nota6a10: await post({ evaluacion: { antes: res({ nota: 10 }), despues: pend } }), versionFoo: await post({ evaluacion: { antes: res({ version: 'foo' }), despues: pend } }), bidi: await post({ evaluacion: { antes: pend, despues: { ...pend, motivo: 'a‮b' } } }), coherente: await post({ evaluacion: { antes: res(), despues: pend } }) };
out.vinculo = { refInexistente99: await post({ historia: 'hidrogeno-norte', pregunta: 'x', pregunta_ref: 'hidrogeno-norte:99' }), refValida: await post({ historia: 'hidrogeno-norte', pregunta: 'x', pregunta_ref: 'hidrogeno-norte:1' }) };
console.log(`${et}: ${JSON.stringify(out)}`);
