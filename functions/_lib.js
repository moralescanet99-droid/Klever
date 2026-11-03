export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const newToken = () => [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');

const SESSION_DAYS = 30;

export async function auth(request, env) {
  const t = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!t) return null;
  const hash = await sha256(t);
  const user = await env.DB.prepare(
    `SELECT u.id, u.email FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.hash = ? AND s.creado_en > datetime('now', ?)`).bind(hash, `-${SESSION_DAYS} days`).first();
  if (user) // registra el último acceso (máx. 1 escritura por hora y sesión)
    await env.DB.prepare(`UPDATE sesiones SET ultimo_acceso = datetime('now')
      WHERE hash = ? AND (ultimo_acceso IS NULL OR ultimo_acceso < datetime('now','-1 hour'))`).bind(hash).run();
  return user;
}

// Envío de email (Brevo). Aislado aquí para poder cambiar de proveedor.
export async function sendMail(env, to, subject, html) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ sender: { email: env.MAIL_FROM, name: 'Klever' }, to: [{ email: to }], subject, htmlContent: html }),
  });
  if (!r.ok) throw new Error('mail ' + r.status);
}
