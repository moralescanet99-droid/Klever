export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function auth(request, env) {
  const t = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!t) return null;
  return await env.DB.prepare('SELECT id, email FROM usuarios WHERE token = ?').bind(t).first();
}

export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
