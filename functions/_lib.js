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

// ---------- reglas de composición (una sola fuente para guardar y publicar) ----------
export const DEMO_EMAIL = 'demo@klever.invalid';
const r1 = v => Math.round(v * 10) / 10;
const coma = v => String(v).replace('.', ',');

// Guardar: cada peso > 0 y <= 100, sin repetidos, total <= 100 %. Por debajo de 100 % es un reparto incompleto (no hay efectivo implícito).
export function validarComposicion(pos) {
  if (!Array.isArray(pos) || pos.length > 50) return { ok: false, error: 'Posiciones no válidas' };
  const seen = new Set(); let suma = 0;
  for (const x of pos) {
    const peso = Number(x?.peso);
    if (!/^[A-Z.]{1,6}$/.test(x?.ticker) || seen.has(x.ticker) || !(peso > 0 && peso <= 100)) return { ok: false, error: 'Posición no válida: ' + x?.ticker };
    seen.add(x.ticker); suma += peso;
  }
  const total = r1(suma);
  if (total > 100) return { ok: false, error: `Los pesos suman más de 100 % (exceso de asignación: ${coma(r1(total - 100))} %)`, total };
  return { ok: true, total, completa: total === 100 };
}

// Publicar: además de ser válida, la composición debe estar completa (100 %) y llevar tesis.
export function puedePublicar({ total, n, tesis }) {
  if (!n) return 'Para publicar, añade al menos una posición.';
  if (r1(total) !== 100) return `Para publicar, la cartera debe tener el 100 % asignado (ahora tiene ${coma(r1(total))} %).`;
  if (!tesis) return 'Para publicar, escribe una tesis.';
  return null;
}

// Validación previa (HTTP 400): ¿están todos los tickers en el universo? Así un fallo del lote es un error interno (500), no «ticker desconocido».
export async function tickersDesconocidos(env, pos) {
  if (!pos.length) return [];
  const { results } = await env.DB.prepare(`SELECT ticker FROM activos WHERE ticker IN (${pos.map(() => '?').join(',')})`).bind(...pos.map(x => x.ticker)).all();
  const ok = new Set(results.map(r => r.ticker)); return pos.map(x => x.ticker).filter(t => !ok.has(t));
}
export const ERROR_INTERNO = 'No se pudo guardar por un error del servidor. Inténtalo de nuevo.';

