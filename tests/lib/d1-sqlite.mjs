// Adaptador MÍNIMO de D1 sobre SQLite real (node:sqlite, Node >= 22.13) para probar los manejadores de functions/ sin Cloudflare.
// Modela lo que Cloudflare documenta: batch() = una transacción (todo o nada). Para provocar carreras de forma DETERMINISTA:
//   env.tras(/regex/, fn)  → tras ejecutar la sentencia que case, corre fn(db) UNA vez (otra escritura «ajena» intercalada).
//                            Dentro de un batch se aplaza hasta después del COMMIT (no puede colarse dentro de una transacción).
//   env.fallarEnSentencia = n → la sentencia n (desde 0) de cualquier batch lanza un error de «infraestructura» (se revierte el lote).
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sha256 } from '../../functions/_lib.js';
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lecturas = sql => /^\s*SELECT/i.test(sql) || /RETURNING/i.test(sql);

export function crearEnv(esquema = path.join(RAIZ, 'schema.sql')) {
  const db = new DatabaseSync(':memory:'); db.exec('PRAGMA foreign_keys = ON'); db.exec(readFileSync(esquema, 'utf8'));
  const env = { sql: db, hooks: [], fallarEnSentencia: null };
  env.tras = (re, fn) => env.hooks.push({ re, fn });
  const disparar = sql => { for (const h of [...env.hooks]) if (h.re.test(sql)) { env.hooks.splice(env.hooks.indexOf(h), 1); h.fn(db); } };
  const ejecutar = s => { const st = db.prepare(s.sql);
    if (lecturas(s.sql)) { const rows = st.all(...s.a); return { results: rows, meta: { changes: /^\s*SELECT/i.test(s.sql) ? 0 : rows.length } }; }
    const r = st.run(...s.a); return { results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; };
  class S { constructor(sql) { this.sql = sql; this.a = []; } bind(...a) { this.a = a; return this; }
    first() { const r = ejecutar(this).results[0] ?? null; disparar(this.sql); return r; }
    all() { const r = ejecutar(this); disparar(this.sql); return { results: r.results }; }
    run() { const r = ejecutar(this); disparar(this.sql); return { meta: r.meta, results: r.results }; } }
  env.DB = { prepare: sql => new S(sql),
    async batch(ss) { db.exec('BEGIN'); let out;
      try { out = ss.map((s, i) => { if (env.fallarEnSentencia === i) throw new Error('fallo simulado de infraestructura'); return ejecutar(s); }); db.exec('COMMIT'); }
      catch (e) { db.exec('ROLLBACK'); throw e; }
      for (const s of ss) disparar(s.sql);   // las escrituras ajenas intercaladas llegan DESPUÉS del commit
      return out; } };
  return env;
}
export const TOKEN = 'token-de-prueba';
export async function sembrar(env) {
  for (const t of ['GLD', 'IAU', 'GDX', 'NEM']) env.sql.prepare('INSERT INTO activos(ticker,nombre,tipo,sector) VALUES(?,?,?,?)').run(t, t, 'etf', 'Materias primas');
  env.sql.prepare("INSERT INTO usuarios(id,email) VALUES(1,'u@example.com')").run();
  env.sql.prepare('INSERT INTO sesiones(hash,usuario_id) VALUES(?,1)').run(await sha256(TOKEN));
}
export const req = (m, body, id = 1) => ({ request: new Request('http://x/api/portfolios/' + id, { method: m, headers: { authorization: 'Bearer ' + TOKEN, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), params: { id: String(id) } });
export const llamar = async (f, env, m, body, id) => { const r = await f({ ...req(m, body, id), env }); return { s: r.status, j: await r.json() }; };
export const estado = env => { const c = env.sql.prepare('SELECT nombre, tesis, publico, revision FROM portafolios WHERE id=1').get(); const ps = env.sql.prepare('SELECT ticker, peso FROM posiciones WHERE portafolio_id=1 ORDER BY ticker').all(); return JSON.stringify({ ...c, pos: ps.map(x => x.ticker + ':' + x.peso).join(',') }); };
export function registro(salida) { let ok = 0; const fallos = [], ev = [];
  const t = (id, esc, esperado, obs, cond) => { cond ? ok++ : fallos.push(`${id} ${esc} → ${obs}`); console.log((cond ? 'OK   ' : 'FALLA') + ` [${id}] ${esc}${cond ? '' : '  [' + obs + ']'}`); ev.push({ id, escenario: esc, esperado, observado: obs, resultado: cond ? 'OK' : 'FALLA', evidencia: '' }); };
  const fin = async () => { const fs = await import('node:fs'); console.log(`\nRESULTADO: ${ok} correctas, ${fallos.length} fallos` + (fallos.length ? '\nFALLOS:\n- ' + fallos.join('\n- ') : ''));
    fs.mkdirSync(path.resolve(RAIZ, process.env.RONDA || 'ronda9'), { recursive: true }); fs.writeFileSync(path.resolve(RAIZ, process.env.RONDA || 'ronda9', salida), JSON.stringify(ev, null, 1)); process.exit(fallos.length ? 1 : 0); };
  return { t, fin }; }
