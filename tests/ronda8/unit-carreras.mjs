// Ronda 8: carreras de LECTURA y de RESPUESTA que no cubría la ronda 7, más errores internos frente a validación.
// Manejadores reales de functions/api/portfolios/* sobre SQLite real. Uso: node tests/ronda8/unit-carreras.mjs
import * as P from '../../functions/api/portfolios/[id].js';
import * as L from '../../functions/api/portfolios/index.js';
import * as PUB from '../../functions/api/public/[id].js';
import { crearEnv, sembrar, llamar, estado, registro } from '../lib/d1-sqlite.mjs';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-R.json');
const A = [{ ticker: 'GLD', peso: 60 }, { ticker: 'IAU', peso: 40 }];
async function nuevo() { const env = crearEnv(); await sembrar(env); const r = await llamar(L.onRequestPost, env, 'POST', { nombre: 'Prueba', plantilla: 'oro', posiciones: A }, 0); return { env, id: r.j.id }; }
const ajena = db => db.exec("UPDATE portafolios SET nombre='B', revision=revision+1 WHERE id=1; DELETE FROM posiciones WHERE portafolio_id=1; INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES(1,'NEM',100)");

{ // R1: escritura ajena entre el commit del PUT y su respuesta
  const { env } = await nuevo(); env.tras(/^UPDATE portafolios SET nombre = \?, tesis = \?, revision = revision \+ 1/, ajena);
  const a = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 100 }], nombre: 'A', revision: 0 });
  const sig = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 100 }], nombre: 'A2', revision: a.j.revision });
  t('R1', 'PUT: una escritura ajena llega entre el commit y la respuesta', 'A recibe SU revisión (1), no la de B (2); su siguiente guardado con esa revisión es 409 y no pisa a B', `HTTP ${a.s}, revisión devuelta ${a.j.revision}; siguiente guardado HTTP ${sig.s}; estado ${estado(env)}`, a.s === 200 && a.j.revision === 1 && sig.s === 409 && estado(env).includes('"nombre":"B"'));
}
{ // R2: lo mismo con PATCH
  const { env } = await nuevo(); env.tras(/^UPDATE portafolios SET nombre = \?, tesis = \?, publico = \?/, ajena);
  const a = await llamar(P.onRequestPatch, env, 'PATCH', { nombre: 'A', revision: 0 });
  const sig = await llamar(P.onRequestPatch, env, 'PATCH', { nombre: 'A2', revision: a.j.revision });
  t('R2', 'PATCH: una escritura ajena llega entre el commit y la respuesta', 'A recibe SU revisión (1); su siguiente cambio con esa revisión es 409', `HTTP ${a.s}, revisión devuelta ${a.j.revision}; siguiente HTTP ${sig.s}; estado ${estado(env)}`, a.s === 200 && a.j.revision === 1 && sig.s === 409 && estado(env).includes('"nombre":"B"'));
}
{ // R3: lectura que no mezcla versiones
  const { env } = await nuevo(); env.tras(/^SELECT \* FROM portafolios WHERE id/, ajena);
  const g = await llamar(P.onRequestGet, env, 'GET', undefined, 1);
  const pos = (g.j.posiciones || []).map(x => x.ticker + ':' + x.peso).sort().join(',');
  const coherente = (g.j.nombre === 'Prueba' && g.j.revision === 0 && pos === 'GLD:60,IAU:40') || (g.j.nombre === 'B' && g.j.revision === 1 && pos === 'NEM:100');
  const ahoraB = estado(env).includes('"nombre":"B"');
  t('R3', 'GET: una escritura ajena llega entre la lectura de la cartera y la de sus posiciones', 'La respuesta es UNA versión que existió (nombre, revisión y posiciones a juego), nunca una mezcla', `nombre «${g.j.nombre}», revisión ${g.j.revision}, posiciones ${pos}; la escritura ajena sí se aplicó=${ahoraB}`, ahoraB && coherente);
}
{ // R4: error interno a mitad del lote ≠ validación
  const { env } = await nuevo(); const antes = estado(env); const log = []; const e0 = console.error; console.error = (...a) => log.push(a.join(' '));
  env.fallarEnSentencia = 2;
  const r = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 50 }, { ticker: 'NEM', peso: 50 }], nombre: 'Cambiado', tesis: 'T', revision: 0 }); console.error = e0;
  t('R4a', 'Rollback ante un error interno de infraestructura a mitad del lote (PUT)', 'HTTP 500 con mensaje de reintento (no «ticker desconocido»), nada queda a medias y el detalle técnico se registra en el servidor', `HTTP ${r.s}; «${r.j.error}»; sin cambios=${estado(env) === antes}; registrado=${log.length > 0}`, r.s === 500 && !/ticker/i.test(r.j.error) && /Inténtalo de nuevo/.test(r.j.error) && estado(env) === antes && log.length > 0);
  env.fallarEnSentencia = null;
  const v = await llamar(P.onRequestPut, env, 'PUT', { posiciones: [{ ticker: 'GDX', peso: 50 }, { ticker: 'ZZZZ', peso: 50 }], nombre: 'X', revision: 0 });
  t('R4b', 'Ticker desconocido (validación)', 'HTTP 400 «Algún ticker no está en el universo» y nada cambia', `HTTP ${v.s}; «${v.j.error}»; sin cambios=${estado(env) === antes}`, v.s === 400 && /universo/.test(v.j.error) && estado(env) === antes);
}
{ // R5: POST con error interno
  const env = crearEnv(); await sembrar(env); env.fallarEnSentencia = 1; const e0 = console.error; console.error = () => {};
  const r = await llamar(L.onRequestPost, env, 'POST', { nombre: 'N', plantilla: 'oro', posiciones: A }, 0); console.error = e0;
  const n = env.sql.prepare('SELECT COUNT(*) c FROM portafolios').get().c;
  t('R5', 'POST: error interno a mitad del lote', 'HTTP 500 y no queda ninguna cartera', `HTTP ${r.s}; carteras=${n}`, r.s === 500 && n === 0);
}
{ // R6: GET público: visibilidad, metadatos y posiciones de UNA instantánea (ronda 9)
  const publica = async () => { const { env, id } = await nuevo(); env.sql.prepare("UPDATE portafolios SET tesis='Tesis pública', publico=1 WHERE id=1").run(); return env; };
  const pedir = env => PUB.onRequestGet({ env, params: { id: '1' }, request: new Request('http://x/api/public/1') }).then(async r => ({ s: r.status, j: await r.json() }));
  const privatizar = db => db.exec("UPDATE portafolios SET publico=0, nombre='PRIVADA', tesis='secreta', revision=revision+1 WHERE id=1; DELETE FROM posiciones WHERE portafolio_id=1; INSERT INTO posiciones(portafolio_id,ticker,peso) VALUES(1,'NEM',100)");
  const env = await publica(); env.tras(/^SELECT p\.id, p\.nombre, p\.plantilla, p\.tesis/, privatizar);   // se despublica y cambian las posiciones entre las lecturas originales
  const g = await pedir(env);
  const pos = (g.j.posiciones || []).map(x => x.ticker + ':' + x.peso).sort().join(',');
  const versionPublica = g.s === 200 && g.j.nombre === 'Prueba' && g.j.tesis === 'Tesis pública' && pos === 'GLD:60,IAU:40';
  const sinFuga = !JSON.stringify(g.j).includes('NEM') && !JSON.stringify(g.j).includes('PRIVADA') && !JSON.stringify(g.j).includes('secreta');
  const aplicada = env.sql.prepare('SELECT publico FROM portafolios WHERE id=1').get().publico === 0;
  t('R6a', 'GET público: la cartera se despublica y cambian sus posiciones entre las lecturas originales', 'La respuesta es la versión pública anterior COMPLETA (o 404); nunca posiciones, nombre o tesis de una versión que no fue pública', `HTTP ${g.s}; nombre «${g.j.nombre}», tesis «${g.j.tesis}», posiciones ${pos}; la despublicación sí se aplicó=${aplicada}; fuga de datos privados=${!sinFuga}`, aplicada && sinFuga && (versionPublica || g.s === 404));
  const env2 = await publica(); env2.sql.exec("UPDATE portafolios SET publico=0 WHERE id=1");
  const g2 = await pedir(env2);
  t('R6b', 'GET público de una cartera ya privada', 'HTTP 404, sin posiciones', `HTTP ${g2.s}; posiciones en la respuesta=${'posiciones' in g2.j}`, g2.s === 404 && !('posiciones' in g2.j));
}
await fin();
