import { json, readJson, sha256, newToken } from '../_lib.js';

// Canjea el enlace (POST, para que los previsualizadores de email no lo consuman).
export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const token = String(body?.token || '');
  if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: 'Enlace no válido' }, 400);
  const hash = await sha256(token);
  // Borrado atómico: solo uno puede canjearlo.
  const row = await env.DB.prepare(`DELETE FROM enlaces WHERE hash = ? AND expira > datetime('now') RETURNING email, con_borrador`).bind(hash).first();
  if (!row) return json({ error: 'El enlace ha caducado o ya se usó' }, 400);
  await env.DB.prepare(`INSERT OR IGNORE INTO usuarios (email, acepto_en) VALUES (?, datetime('now'))`).bind(row.email).run();
  const user = await env.DB.prepare('SELECT id FROM usuarios WHERE email = ?').bind(row.email).first();
  const session = newToken();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sesiones (hash, usuario_id, ultimo_acceso) VALUES (?, ?, datetime('now'))`).bind(await sha256(session), user.id),
    env.DB.prepare(`DELETE FROM enlaces WHERE expira < datetime('now','-1 day')`),
  ]);
  return json({ token: session, con_borrador: !!row.con_borrador });
}
