// Klever v1 · utilidades del servidor (sin dependencias). Ideas de la app antigua (functions/_lib.js): hash SHA-256 de tokens y Brevo aislado.
import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  ADMIN_EMAIL?: string;      // secreto: correo de la administración
  BREVO_API_KEY?: string;    // secreto: si falta (o falta BREVO_SENDER) → MODO PRUEBAS (enlace en pantalla)
  BREVO_SENDER?: string;     // remitente verificado en Brevo (p. ej. acceso@tudominio.es)
}

export const COOKIE = 'klever_sesion';
export const DIAS_SESION = 30;
export const MIN_ENLACE = 15;

export function json(datos: unknown, estado = 200, cabeceras: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(datos), { status: estado, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...cabeceras } });
}
export const sinContenido = (cabeceras: Record<string, string> = {}) => new Response(null, { status: 204, headers: { 'cache-control': 'no-store', ...cabeceras } });
export const redirigir = (destino: string, cabeceras: Record<string, string> = {}) => new Response(null, { status: 302, headers: { location: destino, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', ...cabeceras } });

export async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const tokenNuevo = () => [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');

export function leerCookie(req: Request, nombre: string): string | null {
  for (const parte of (req.headers.get('cookie') || '').split(';')) {
    const i = parte.indexOf('='); if (i < 0) continue;
    if (parte.slice(0, i).trim() === nombre) return parte.slice(i + 1).trim();
  }
  return null;
}
/** Cookie de sesión: HttpOnly (no la lee JavaScript), Secure, SameSite=Lax (llega al volver del correo). */
export const cookieSesion = (token: string) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DIAS_SESION * 86400}`;
export const cookieBorrada = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export const emailValido = (e: string) => e.length <= 200 && /^[^@\s<>"']+@[^@\s<>"']+\.[^@\s<>"']+$/.test(e);
export const esCorreoAdmin = (env: Env, email: string) => !!env.ADMIN_EMAIL && env.ADMIN_EMAIL.trim().toLowerCase() === email.trim().toLowerCase();
export const hayBrevo = (env: Env) => !!(env.BREVO_API_KEY && env.BREVO_SENDER);

/** Envío del enlace con Brevo (API v3, smtp/email). Aislado aquí para poder cambiar de proveedor. */
export async function enviarEnlace(env: Env, para: string, enlace: string): Promise<void> {
  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#13203b">
<p>Hola:</p><p>Pulsa el botón para entrar en <strong>Klever</strong>. El enlace caduca en ${MIN_ENLACE} minutos y solo sirve una vez.</p>
<p><a href="${enlace}" style="display:inline-block;background:#13203b;color:#fffdfa;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Entrar en Klever</a></p>
<p style="color:#56607c;font-size:14px">Si no lo has pedido tú, ignora este correo. Klever es una simulación educativa: sin dinero real y sin recomendaciones.</p></div>`;
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { email: env.BREVO_SENDER, name: 'Klever' }, to: [{ email: para }], subject: 'Tu enlace para entrar en Klever', htmlContent: html, textContent: `Entra en Klever con este enlace (caduca en ${MIN_ENLACE} minutos, un solo uso): ${enlace}` }),
  });
  if (!r.ok) throw new Error('brevo ' + r.status);
}
