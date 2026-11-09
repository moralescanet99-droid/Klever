// Adaptador MÍNIMO de D1 sobre SQLite real (node:sqlite, Node >= 22.13) para probar RepoD1 y el enrutador sin Cloudflare.
// Idea tomada de tests/lib/d1-sqlite.mjs (app antigua): batch() = una transacción (todo o nada), como documenta Cloudflare.
// En JavaScript (con su .d.ts) para no necesitar los tipos de Node en el proyecto.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const RAIZ_APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const devuelveFilas = sql => /^\s*(SELECT|WITH)/i.test(sql) || /\bRETURNING\b/i.test(sql);
const limpiar = a => a.map(x => (x === undefined ? null : typeof x === 'boolean' ? (x ? 1 : 0) : x));

export function crearD1(esquema = path.join(RAIZ_APP, 'schema.sql')) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON'); db.exec(readFileSync(esquema, 'utf8'));
  class Sentencia {
    constructor(sql) { this.sql = sql; this.a = []; }
    bind(...a) { this.a = limpiar(a); return this; }
    ejecutar() {
      const st = db.prepare(this.sql);
      if (devuelveFilas(this.sql)) { const filas = st.all(...this.a); return { results: filas, success: true, meta: { changes: /^\s*SELECT/i.test(this.sql) ? 0 : filas.length } }; }
      const r = st.run(...this.a); return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    }
    async first(col) { const f = this.ejecutar().results[0] ?? null; return col && f ? f[col] : f; }
    async all() { return this.ejecutar(); }
    async run() { return this.ejecutar(); }
    async raw() { return this.ejecutar().results.map(f => Object.values(f)); }
  }
  const DB = {
    prepare: sql => new Sentencia(sql),
    async batch(ss) {
      db.exec('BEGIN');
      try { const out = ss.map(s => s.ejecutar()); db.exec('COMMIT'); return out; }
      catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    async exec(sql) { db.exec(sql); return { count: 0, duration: 0 }; },
  };
  return { DB, sql: db };
}
