import { json, sha256 } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const t = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (t) await env.DB.prepare('DELETE FROM sesiones WHERE hash = ?').bind(await sha256(t)).run();
  return json({ ok: true });
}
