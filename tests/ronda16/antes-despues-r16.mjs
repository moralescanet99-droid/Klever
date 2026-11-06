// Ronda 16: ANTES/DESPUÉS de los tres fallos con el mismo guion. Uso: node tests/ronda16/antes-despues-r16.mjs <raíz-del-código> [etiqueta]
// La raíz «antes» es la ronda 15 (commit 8dc5003) en un árbol de trabajo aparte; la «después» es el código actual.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { crearEnv, sembrar } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const raiz = path.resolve(process.argv[2] || '.'), et = process.argv[3] || raiz, im = p => import(pathToFileURL(path.join(raiz, p)).href);
const [ES, EI, N, C] = await Promise.all([im('functions/api/escenarios/index.js'), im('functions/api/escenarios/[id].js'), im('public/js/nota.js'), im('public/js/contenido.js')]);
const out = {};
// 1. marcador HTML dentro del campo nota de la evaluación
const env = crearEnv(); await sembrar(env);
for (const k of ['A', 'B', 'C']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(k, 'Empresa ' + k, 'accion', 'Sector ' + k);
env.sql.exec(`INSERT INTO portafolios(id,usuario_id,nombre,plantilla,publico,tesis) VALUES (1,1,'Base','oro',0,NULL); INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES (1,'A',60),(1,'B',40)`);
const llama = async (f, m, body, params = {}) => { const r = await f({ request: new Request('http://x/api', { method: m, headers: { authorization: 'Bearer token-de-prueba', 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env, params }); return { s: r.status, txt: await r.text() }; };
const bl = { empresas: 6, sectores: 6, tamano: 6, deuda: 6, rentabilidad: 6 };
const res = o => ({ version: 'estructura-v1', fecha: '2026-11-04', publicada: true, nota: 6, motivo: null, cobertura: 100, bloques: bl, fortaleza: 'empresas', limitacion: { bloque: 'deuda', perdida: 1 }, ...o });
const MARCA = '<img src=x onerror=window.__pwn=1>';
const post = await llama(ES.onRequestPost, 'POST', { clave: 'intento-0001', nombre: 'Añadir C', cartera_id: 1, base_revision: 0, ticker: 'C', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'A', peso: 54 }, { ticker: 'B', peso: 36 }, { ticker: 'C', peso: 10 }], evaluacion: { antes: res({ nota: MARCA }), despues: res({}) } });
out.marcador = { guardar: post.s, devuelveMarcador: post.txt.includes('onerror') };
if (post.s === 201) { const id = JSON.parse(post.txt).id; const g = await llama(EI.onRequestGet, 'GET', undefined, { id: String(id) }); out.marcador.leerDespues = g.s; out.marcador.laLecturaDevuelveMarcador = g.txt.includes('onerror'); }
// fila antigua equivalente (ya guardada en la base)
env.sql.prepare("INSERT INTO escenarios(usuario_id,clave,nombre,metodo,cartera_id,cartera_nombre,base_revision,ticker,peso_objetivo,base_json,propuesta_json,nota_json) VALUES (1,'antigua-0001','Antigua','proporcional',1,'X',0,'C',10,'[]','[]',?)").run(JSON.stringify({ antes: res({ nota: MARCA }), despues: res({}) }));
const l = await llama(ES.onRequestGet, 'GET'); out.marcador.filaAntiguaEnLaLista = l.txt.includes('onerror');
// 2. EBITDA ausente con una posición al 100 % y una sola sesión de negociación
const emp = { nombre: 'Z', tipo: 'accion', sector: 'S1', actividad: 'A', emisor: 'z', cap: 1e9, imp: 1e6, sesiones: 1, moneda: 'USD', fuenteMercado: 'prueba', fechaMercado: '2026-11-04', ej: [2020, 2021, 2022, 2023, 2024].map((y, k) => ({ p: 'FY' + y, f: 'prueba', d: '2026-11-04', ing: 100 + k, ni: 10, op: 12, ebitda: null, deuda: 50, fcf: 5, roic: .05 })) };
const U = { fecha: '2026-11-04', origen: 'sintetico', empresas: {} }; for (let i = 0; i < 24; i++) U.empresas['S' + i] = { ...emp, nombre: 'S' + i, emisor: 'e' + i, cap: 1e9 * (i + 1), imp: 1e6 * (i + 1), ej: emp.ej.map(x => ({ ...x, ebitda: 20 * (i + 1), deuda: 20 * (i + 1) * (.5 + i / 40) })) };
U.empresas.Z1 = { ...emp };
const e = N.evaluar([{ ticker: 'Z1', peso: 100 }], U);
out.ebitdaAusente = { publicada: e.publicada, nota: e.nota, cobertura: e.cobertura && Math.round(e.cobertura.minima * 1000) / 10, deuda: e.bloques?.deuda?.puntuacion ?? null };
// 3. espacio de más en la pregunta
const TXT = '¿Se han firmado los dos contratos anunciados?';
out.vinculo = C.estadoSeguimiento ? { exacto: C.estadoSeguimiento({ historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', pregunta: TXT }).tipo, espacioDeMas: C.estadoSeguimiento({ historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', pregunta: TXT + ' ' }).tipo, reformulada: C.estadoSeguimiento({ historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', pregunta: '¿Al final firmaron C y D?' }).tipo }
  : { exacto: !!C.casoSeguimiento('hidrogeno-norte', TXT) ? 'responde' : 'sin vínculo', espacioDeMas: !!C.casoSeguimiento('hidrogeno-norte', TXT + ' ') ? 'responde' : 'sin vínculo', reformulada: !!C.casoSeguimiento('hidrogeno-norte', '¿Al final firmaron C y D?') ? 'responde' : 'sin vínculo' };
console.log(`${et}: ${JSON.stringify(out)}`);
