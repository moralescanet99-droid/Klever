// Klever v1 · ENRUTADOR de la Api (lo usa functions/api/[[ruta]].ts). Implementa las rutas anotadas en src/lib/api/contrato.ts
// sobre `Servicio` + `RepoD1`. Errores: {codigo, mensaje} con su estado HTTP. Sesión: cookie HttpOnly con token aleatorio
// (en la base solo su SHA-256), 30 días. Métodos que modifican: exigen cabecera Origin del mismo sitio.
import { ErrorApi, type Sesion } from '../../src/lib/api/contrato';
import { Servicio } from '../../src/lib/servicio/servicio';
import { RepoD1 } from './repo-d1';
import {
  type Env, COOKIE, DIAS_SESION, MIN_ENLACE, cookieBorrada, cookieSesion, emailValido, enviarEnlace, esCorreoAdmin, hayBrevo,
  json, leerCookie, redirigir, sha256, sinContenido, tokenNuevo,
} from './util';

const err = (c: string, m: string, e = 400) => new ErrorApi(c, m, e);
const MAX_CUERPO = 64 * 1024;
interface Identidad { hash: string; usuarioId: number | null; email: string; invitacion: string | null }
interface Ctx { req: Request; env: Env; url: URL; srv: Servicio; ahora: () => Date; params: string[]; cuerpo: () => Promise<Record<string, unknown>>; quien: () => Promise<Identidad | null> }
type Manejador = (c: Ctx) => Promise<Response | unknown>;

const masMinutos = (d: Date, m: number) => new Date(d.getTime() + m * 60_000).toISOString();
const id = (s: string) => { if (!/^\d{1,12}$/.test(s)) throw err('id', 'Identificador no válido.', 404); return Number(s); };

async function identidad(req: Request, env: Env, ahora: Date): Promise<Identidad | null> {
  const t = leerCookie(req, COOKIE); if (!t || !/^[0-9a-f]{64}$/.test(t)) return null;
  const hash = await sha256(t);
  const r = await env.DB.prepare('SELECT usuario_id, email, invitacion FROM sesiones WHERE hash = ? AND expira > ?').bind(hash, ahora.toISOString()).first<Record<string, unknown>>();
  return r ? { hash, usuarioId: r.usuario_id == null ? null : Number(r.usuario_id), email: String(r.email), invitacion: (r.invitacion as string) ?? null } : null;
}

/** Usuario identificado y dado de alta (si no, 401). */
async function yo(c: Ctx): Promise<{ uid: number; email: string; admin: boolean }> {
  const q = await c.quien();
  if (!q) throw err('sesion', 'Entra para continuar.', 401);
  if (q.usuarioId == null) throw err('alta', 'Termina el alta para continuar.', 401);
  return { uid: q.usuarioId, email: q.email, admin: esCorreoAdmin(c.env, q.email) };
}
async function admin(c: Ctx) { const u = await yo(c); if (!u.admin) throw err('admin', 'Solo para la administración.', 403); return u; }

// ── Acceso ──────────────────────────────────────────────────────────────
async function sesion(c: Ctx): Promise<Sesion> {
  const q = await c.quien(), modoPruebas = !hayBrevo(c.env);
  if (!q) return { usuario: null, necesitaAlta: false, modoPruebas, demo: false };
  if (q.usuarioId == null) return { usuario: null, necesitaAlta: true, modoPruebas, demo: false };
  const u = await c.srv.usuario(q.usuarioId).catch(() => null);
  if (!u) return { usuario: null, necesitaAlta: false, modoPruebas, demo: false };
  await c.srv.visita(u.id);
  return { usuario: { ...u, esAdmin: esCorreoAdmin(c.env, q.email) }, necesitaAlta: false, modoPruebas, demo: false };
}

async function acceso(c: Ctx) {
  const b = await c.cuerpo(), email = String(b.email || '').trim().toLowerCase(), inv = String(b.invitacion || '').trim().toUpperCase() || null;
  if (!emailValido(email)) throw err('email', 'Escribe un correo válido.');
  const repo = new RepoD1(c.env.DB), cuenta = await repo.usuarioPorEmail(email);
  // Beta privada: una cuenta nueva necesita invitación válida. La administración (ADMIN_EMAIL) entra sin ella (arranque).
  let invitacion: string | null = null;
  if (!cuenta && !esCorreoAdmin(c.env, email)) {
    if (!inv) throw err('invitacion', 'Klever está en beta privada: necesitas un código de invitación.', 403);
    if (!(await c.srv.invitacionValida(inv))) throw err('invitacion', 'Ese código de invitación no existe o ya se ha usado.', 403);
    invitacion = inv;
  }
  // Límites por correo: 1 enlace por minuto y 5 al día.
  const ahora = c.ahora();
  const r = await c.env.DB.prepare('SELECT SUM(creado > ?) AS minuto, COUNT(*) AS dia FROM enlaces WHERE email = ? AND creado > ?')
    .bind(masMinutos(ahora, -1), email, masMinutos(ahora, -1440)).first<Record<string, number | null>>();
  if (Number(r?.minuto || 0) > 0) throw err('espera', 'Espera un minuto antes de pedir otro enlace.', 429);
  if (Number(r?.dia || 0) >= 5) throw err('limite', 'Has pedido demasiados enlaces hoy. Inténtalo mañana.', 429);

  const token = tokenNuevo();
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO enlaces (hash, email, invitacion, creado, expira) VALUES (?, ?, ?, ?, ?)').bind(await sha256(token), email, invitacion, ahora.toISOString(), masMinutos(ahora, MIN_ENLACE)),
    c.env.DB.prepare('DELETE FROM enlaces WHERE creado < ?').bind(masMinutos(ahora, -2 * 1440)),
  ]);
  const enlace = `${c.url.origin}/api/verificar?t=${token}`;
  if (!hayBrevo(c.env)) return { enviado: false, enlacePruebas: enlace }; // MODO PRUEBAS: solo llega aquí una cuenta invitada o existente
  try { await enviarEnlace(c.env, email, enlace); }
  catch (e) { console.error('Brevo', e); throw err('correo', 'No he podido enviar el correo. Inténtalo dentro de un rato.', 502); }
  return { enviado: true };
}

async function verificar(c: Ctx): Promise<Response> {
  const t = c.url.searchParams.get('t') || '';
  if (!/^[0-9a-f]{64}$/.test(t)) return redirigir('/#/entrar?error=enlace');
  const ahora = c.ahora(), iso = ahora.toISOString();
  // Canje atómico: solo la primera petición marca el enlace como usado.
  const e = await c.env.DB.prepare('UPDATE enlaces SET usado = ? WHERE hash = ? AND usado IS NULL AND expira > ? RETURNING email, invitacion')
    .bind(iso, await sha256(t), iso).first<Record<string, unknown>>();
  if (!e) return redirigir('/#/entrar?error=enlace');
  const email = String(e.email), u = await new RepoD1(c.env.DB).usuarioPorEmail(email), sesionT = tokenNuevo();
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO sesiones (hash, usuario_id, email, invitacion, creada, expira) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(await sha256(sesionT), u?.id ?? null, email, (e.invitacion as string) ?? null, iso, masMinutos(ahora, DIAS_SESION * 1440)),
    c.env.DB.prepare('DELETE FROM sesiones WHERE expira < ?').bind(iso),
  ]);
  return redirigir(u ? '/#/cartera' : '/#/alta', { 'set-cookie': cookieSesion(sesionT) });
}

async function alta(c: Ctx) {
  const q = await c.quien(); if (!q) throw err('sesion', 'Tu enlace ha caducado. Vuelve a pedirlo.', 401);
  if (q.usuarioId != null) throw err('ya_alta', 'Tu cuenta ya está creada.', 409);
  const b = await c.cuerpo();
  if (b.mayor18 !== true) throw err('mayor18', 'Para usar Klever tienes que tener 18 años o más.');
  const sinInvitacion = esCorreoAdmin(c.env, q.email);
  if (!sinInvitacion && !q.invitacion) throw err('invitacion', 'Necesitas un código de invitación.', 403);
  const u = await c.srv.darDeAlta(q.email, String(b.apodo || ''), sinInvitacion ? null : q.invitacion);
  await c.env.DB.prepare('UPDATE sesiones SET usuario_id = ?, invitacion = NULL WHERE email = ?').bind(u.id, q.email).run();
  return { ...u, esAdmin: sinInvitacion };
}

async function salir(c: Ctx) {
  const q = await c.quien(); if (q) await c.env.DB.prepare('DELETE FROM sesiones WHERE hash = ?').bind(q.hash).run();
  return sinContenido({ 'set-cookie': cookieBorrada() });
}

// ── Tabla de rutas ──────────────────────────────────────────────────────
const num = (x: unknown) => Number(x);
const RUTAS: [string, RegExp, Manejador][] = [
  ['GET', /^sesion$/, sesion],
  ['POST', /^acceso$/, acceso],
  ['GET', /^verificar$/, verificar],
  ['POST', /^alta$/, alta],
  ['POST', /^salir$/, salir],

  ['GET', /^carteras$/, async c => c.srv.carteras((await yo(c)).uid)],
  ['POST', /^carteras$/, async c => { const b = await c.cuerpo(); return c.srv.crearCartera((await yo(c)).uid, String(b.nombre ?? ''), b.posiciones as never); }],
  ['PUT', /^carteras\/([^/]+)$/, async c => { const b = await c.cuerpo(); return c.srv.guardarCartera((await yo(c)).uid, id(c.params[0]), b.posiciones as never, b.nombre === undefined || b.nombre === null ? undefined : String(b.nombre)); }],
  ['DELETE', /^carteras\/([^/]+)$/, async c => { await c.srv.borrarCartera((await yo(c)).uid, id(c.params[0])); }],
  ['POST', /^carteras\/([^/]+)\/principal$/, async c => { await c.srv.marcarPrincipal((await yo(c)).uid, id(c.params[0])); }],
  ['GET', /^carteras\/([^/]+)\/historial$/, async c => c.srv.historial((await yo(c)).uid, id(c.params[0]))],
  ['POST', /^revision$/, async c => { const b = await c.cuerpo(); await c.srv.revisarEmpresa((await yo(c)).uid, String(b.ticker || '')); }],

  ['GET', /^temporada$/, async c => c.srv.temporadaActual()],
  ['GET', /^ligas$/, async c => c.srv.misLigas((await yo(c)).uid)],
  ['POST', /^ligas$/, async c => { const b = await c.cuerpo(); return c.srv.crearLiga((await yo(c)).uid, String(b.nombre || ''), b.tipo as never, (b.reglas || {}) as never); }],
  ['POST', /^ligas\/unirse$/, async c => { const b = await c.cuerpo(); return c.srv.unirseLiga((await yo(c)).uid, String(b.codigo || '')); }],
  ['POST', /^ligas\/general$/, async c => c.srv.unirseGeneral((await yo(c)).uid)],
  ['POST', /^ligas\/([^/]+)\/salir$/, async c => { await c.srv.salirLiga((await yo(c)).uid, id(c.params[0])); }],
  ['GET', /^ligas\/([^/]+)$/, async c => c.srv.detalleLiga((await yo(c)).uid, id(c.params[0]))],
  ['POST', /^ligas\/([^/]+)\/cartera$/, async c => { const b = await c.cuerpo(); await c.srv.inscribirCartera((await yo(c)).uid, id(c.params[0]), num(b.carteraId)); }],
  ['POST', /^ligas\/([^/]+)\/draft\/empezar$/, async c => { await c.srv.empezarDraft((await yo(c)).uid, id(c.params[0])); }],
  ['POST', /^ligas\/([^/]+)\/draft\/elegir$/, async c => { const b = await c.cuerpo(); await c.srv.elegirDraft((await yo(c)).uid, id(c.params[0]), String(b.ticker || '')); }],
  ['POST', /^ligas\/([^/]+)\/draft\/cambio$/, async c => { const b = await c.cuerpo(); await c.srv.cambioDraft((await yo(c)).uid, id(c.params[0]), String(b.sale || ''), String(b.entra || '')); }],
  ['GET', /^ligas\/([^/]+)\/resumen$/, async c => c.srv.resumen((await yo(c)).uid, id(c.params[0]))],

  ['GET', /^invitaciones$/, async c => c.srv.misInvitaciones((await yo(c)).uid)],
  ['POST', /^invitaciones$/, async c => { const u = await yo(c), b = await c.cuerpo(); return c.srv.crearInvitacion(u.uid, String(b.nota ?? ''), 1, u.admin); }],
  ['GET', /^admin\/invitaciones$/, async c => { await admin(c); return c.srv.todasInvitaciones(); }],
  ['POST', /^admin\/invitaciones$/, async c => { await admin(c); const b = await c.cuerpo(); return c.srv.crearInvitacion(null, String(b.nota ?? ''), Number(b.usosMax) || 1); }],

  ['POST', /^evento$/, async c => { const b = await c.cuerpo(); await c.srv.evento(String(b.nombre || '')); }],
];

const MODIFICAN = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export async function manejar(req: Request, env: Env, ahora: () => Date = () => new Date()): Promise<Response> {
  const url = new URL(req.url), camino = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  try {
    if (!env.DB) throw err('config', 'Falta la base de datos (D1) en la configuración del servidor.', 500);
    let encontrada: { m: Manejador; params: string[] } | null = null, otroMetodo = false;
    for (const [metodo, re, m] of RUTAS) {
      const x = re.exec(camino); if (!x) continue;
      if (metodo === req.method) { encontrada = { m, params: x.slice(1) }; break; }
      otroMetodo = true;
    }
    if (!encontrada) throw otroMetodo ? err('metodo', 'Método no permitido.', 405) : err('ruta', 'Esa dirección no existe.', 404);
    if (MODIFICAN.has(req.method) && req.headers.get('origin') !== url.origin) throw err('origen', 'Petición rechazada por seguridad (origen distinto).', 403);

    let quien: Promise<Identidad | null> | null = null, cuerpo: Promise<Record<string, unknown>> | null = null;
    const ctx: Ctx = {
      req, env, url, ahora, params: encontrada.params, srv: new Servicio(new RepoD1(env.DB), ahora),
      quien: () => (quien ??= identidad(req, env, ahora())),
      cuerpo: () => (cuerpo ??= (async () => {
        if (Number(req.headers.get('content-length') || 0) > MAX_CUERPO) throw err('cuerpo', 'Petición demasiado grande.', 413);
        const t = await req.text(); if (t.length > MAX_CUERPO) throw err('cuerpo', 'Petición demasiado grande.', 413);
        if (!t) return {};
        try { const j = JSON.parse(t); return j && typeof j === 'object' && !Array.isArray(j) ? j : {}; } catch { throw err('json', 'Formato de petición no válido.'); }
      })()),
    };
    const r = await encontrada.m(ctx);
    if (r instanceof Response) return r;
    return r === undefined ? sinContenido() : json(r);
  } catch (e) {
    if (e instanceof ErrorApi) return json({ codigo: e.codigo, mensaje: e.message }, e.estado || 400);
    console.error('Error interno', e);
    return json({ codigo: 'interno', mensaje: 'Algo ha fallado en el servidor. Vuelve a intentarlo.' }, 500);
  }
}
