import { json, readJson, sha256, newToken, sendMail } from '../_lib.js';

// Pide un enlace mágico. Responde siempre igual para no revelar si el email existe.
export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: 'Email no válido' }, 400);
  if (body?.acepto !== true) return json({ error: 'Debes aceptar el aviso legal y la privacidad' }, 400);

  // Límites: 1 envío por minuto y 5 al día por email.
  const rec = await env.DB.prepare(
    `SELECT SUM(creado_en > datetime('now','-60 seconds')) AS ult, COUNT(*) AS dia
     FROM enlaces WHERE email = ? AND creado_en > datetime('now','-1 day')`).bind(email).first();
  if (rec.ult > 0) return json({ error: 'Espera un minuto antes de pedir otro enlace' }, 429);
  if (rec.dia >= 5) return json({ error: 'Demasiados intentos hoy; inténtalo mañana' }, 429);

  const token = newToken();
  await env.DB.prepare(`INSERT INTO enlaces (hash, email, expira) VALUES (?, ?, datetime('now','+15 minutes'))`)
    .bind(await sha256(token), email).run();
  const link = `${new URL(request.url).origin}/?login=${token}`;

  // Solo para desarrollo local (.dev.vars): devuelve el enlace en vez de enviarlo.
  if (env.DEV_RETURN_LINK === '1') return json({ ok: true, dev_link: link });

  try {
    await sendMail(env, email, 'Tu enlace para entrar en Klever',
      `<p>Pulsa para entrar (caduca en 15 minutos, un solo uso):</p><p><a href="${link}">Entrar en Klever</a></p><p>Si no lo pediste, ignora este mensaje.</p>`);
  } catch { return json({ error: 'No se pudo enviar el email; inténtalo más tarde' }, 502); }
  return json({ ok: true });
}
