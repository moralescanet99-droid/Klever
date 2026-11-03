import { json, readJson } from '../_lib.js';

// Registro por email. El token se guarda en el navegador (sin contraseña en la beta).
export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const email = String(body?.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: 'Email no válido' }, 400);
  const token = crypto.randomUUID() + crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO usuarios (email, token) VALUES (?, ?)').bind(email, token).run();
  } catch {
    return json({ error: 'Ese email ya está registrado en la beta' }, 409);
  }
  return json({ token });
}
