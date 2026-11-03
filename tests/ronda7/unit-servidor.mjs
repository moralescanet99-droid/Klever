// Pruebas del SERVIDOR REAL (los manejadores de functions/api/portfolios/*) sobre SQLite real (node:sqlite) con un adaptador mínimo de D1.
// Comprueban atomicidad, control de revisión y ausencia de guardados parciales. Uso: node tests/ronda7/unit-servidor.mjs
import * as P from '../../functions/api/portfolios/[id].js';
import * as L from '../../functions/api/portfolios/index.js';
import { crearEnv, sembrar, req, llamar, estado, RAIZ } from '../lib/d1-sqlite.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
process.removeAllListeners('warning');
const A = [{ ticker: 'GLD', peso: 60 }, { ticker: 'IAU', peso: 40 }], B = [{ ticker: 'GDX', peso: 70 }, { ticker: 'NEM', peso: 30 }];
let ok = 0, fallos = [], ev = [];
const t = (id, esc, esperado, obs, cond) => { cond ? ok++ : fallos.push(`${id} ${esc} → ${obs}`); console.log((cond ? 'OK   ' : 'FALLA') + ` [${id}] ${esc}${cond ? '' : '  [' + obs + ']'}`); ev.push({ id, escenario: esc, esperado, observado: obs, resultado: cond ? 'OK' : 'FALLA', evidencia: 'tests/ronda7/unit-servidor.mjs' }); };

async function nuevo() { const env = crearEnv(); await sembrar(env); const r = await L.onRequestPost({ ...req('POST', { nombre: 'Prueba', plantilla: 'oro', posiciones: A }, 0), env }); return { env, id: (await r.json()).id }; }

{ // U1 creación atómica
  const env = crearEnv(); await sembrar(env);
  const ok1 = await llamar(L.onRequestPost, env, 'POST', { nombre: 'C', plantilla: 'oro', posiciones: A, tesis: 'T' }, 0);
  t('U1a', 'POST con posiciones: una sola operación', 'Cartera con sus 2 posiciones y revisión 0', `HTTP ${ok1.s}; ${estado(env)}`, ok1.s === 201 && ok1.j.revision === 0 && estado(env).includes('GLD:60,IAU:40'));
  const mal = await llamar(L.onRequestPost, env, 'POST', { nombre: 'D', plantilla: 'oro', posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'ZZZZ', peso: 50 }] }, 0);
  const n = env.sql.prepare('SELECT COUNT(*) c FROM portafolios').get().c;
  t('U1b', 'POST con un ticker desconocido: no queda una cartera a medias', 'HTTP 400 y sigue habiendo 1 cartera (la anterior)', `HTTP ${mal.s}; carteras=${n}`, mal.s === 400 && n === 1);
}
{ // U2 guardado único y revisión que cambia en cada escritura
  const { env, id } = await nuevo();
  const g1 = await llamar(P.onRequestPut, env, 'PUT', { posiciones: B, nombre: 'Nuevo', tesis: 'Tesis', revision: 0 });
  t('U2a', 'PUT único guarda posiciones, nombre y tesis y sube la revisión', 'HTTP 200, revisión 1, todo guardado', `HTTP ${g1.s}; ${estado(env)}`, g1.s === 200 && g1.j.revision === 1 && estado(env) === JSON.stringify({ nombre: 'Nuevo', tesis: 'Tesis', publico: 0, revision: 1, pos: 'GDX:70,NEM:30' }));
  const antes = estado(env);
  const g2 = await llamar(P.onRequestPut, env, 'PUT', { posiciones: A, nombre: 'Otro', tesis: 'x', revision: 0 });
  t('U2b', 'Dos escrituras en el mismo segundo con la misma revisión: la segunda se rechaza', 'HTTP 409 y nada cambia (con la fecha de un segundo habrían pasado las dos)', `HTTP ${g2.s}; sin cambios=${estado(env) === antes}`, g2.s === 409 && g2.j.conflicto === true && estado(env) === antes);
  const g3 = await llamar(P.onRequestPut, env, 'PUT', { posiciones: A });
  t('U2c', 'PUT sin revisión: se rechaza', 'HTTP 400, nada cambia', `HTTP ${g3.s}; ${g3.j.error}`, g3.s === 400 && estado(env) === antes);
  const p1 = await llamar(P.onRequestPatch, env, 'PATCH', { publico: true, revision: 1 });
  t('U2d', 'PATCH (publicar) también sube la revisión', 'HTTP 200, publico 1, revisión 2', `HTTP ${p1.s}; ${estado(env)}`, p1.s === 200 && p1.j.revision === 2 && estado(env).includes('"publico":1'));
  const p2 = await llamar(P.onRequestPatch, env, 'PATCH', { publico: false, revision: 1 });
  t('U2e', 'PATCH con revisión caducada: 409 y la publicación no cambia', 'HTTP 409, sigue público', `HTTP ${p2.s}; ${estado(env)}`, p2.s === 409 && estado(env).includes('"publico":1'));
}
{ // U3 barrera atómica: otra escritura se cuela entre la lectura y el guardado
  const { env } = await nuevo();
  env.tras(/^SELECT \* FROM portafolios WHERE id/, db => { db.exec("UPDATE portafolios SET nombre='AJENO', revision=revision+1 WHERE id=1; DELETE FROM posiciones WHERE portafolio_id=1; INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES(1,'NEM',100)"); });
  const r = await llamar(P.onRequestPut, env, 'PUT', { posiciones: B, nombre: 'Mío', tesis: '', revision: 0 });
  t('U3', 'Escritura ajena entre la lectura y la escritura (carrera simulada de forma determinista)', 'HTTP 409; NO se sobrescribe lo ajeno ni se mezclan posiciones', `HTTP ${r.s}; ${estado(env)}`, r.s === 409 && estado(env) === JSON.stringify({ nombre: 'AJENO', tesis: null, publico: 0, revision: 1, pos: 'NEM:100' }));
}
{ // U4 ticker desconocido: validación previa (no es un fallo a mitad de transacción; el rollback ante un error interno es R4a)
  const { env } = await nuevo(); const antes = estado(env);
  const r = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 50 }, { ticker: 'ZZZZ', peso: 50 }], nombre: 'Cambiado', tesis: 'T', revision: 0 });
  t('U4', 'Ticker desconocido con nombre y tesis cambiados: se rechaza ANTES del lote (validación previa, no a mitad de transacción)', 'HTTP 400 por validación y no cambia nada: ni nombre, ni tesis, ni posiciones, ni revisión (el rollback ante un error interno es la evidencia R4a)', `HTTP ${r.s}; sin cambios=${estado(env) === antes}`, r.s === 400 && estado(env) === antes);
}
{ // U5 cartera pública: reglas y atomicidad
  const { env } = await nuevo(); env.sql.prepare("UPDATE portafolios SET tesis='T0', publico=1 WHERE id=1").run(); const antes = estado(env);
  const inc = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GLD', peso: 50 }], nombre: 'X', tesis: 'T1', revision: 0 });
  t('U5a', 'Cartera pública: un reparto incompleto no se guarda (ni siquiera el nombre o la tesis)', 'HTTP 400, sin cambios', `HTTP ${inc.s}`, inc.s === 400 && estado(env) === antes);
  const val = await llamar(P.onRequestPut, env, 'PUT', { posiciones: B, nombre: 'Y', tesis: 'T2', revision: 0 });
  t('U5b', 'Cartera pública: un reparto válido actualiza todo a la vez', 'HTTP 200; posiciones, nombre y tesis nuevos juntos', `HTTP ${val.s}; ${estado(env)}`, val.s === 200 && estado(env) === JSON.stringify({ nombre: 'Y', tesis: 'T2', publico: 1, revision: 1, pos: 'GDX:70,NEM:30' }));
}
console.log(`\nRESULTADO: ${ok} correctas, ${fallos.length} fallos` + (fallos.length ? '\nFALLOS:\n- ' + fallos.join('\n- ') : ''));
const R = process.env.RONDA || 'ronda9'; mkdirSync(path.resolve(RAIZ, R), { recursive: true }); writeFileSync(path.resolve(RAIZ, R, 'evidencias-U.json'), JSON.stringify(ev, null, 1));
process.exit(fallos.length ? 1 : 0);
