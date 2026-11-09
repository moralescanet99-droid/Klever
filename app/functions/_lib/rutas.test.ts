// Enrutador de la Api contra SQLite real (sin Cloudflare): acceso, alta, sesión, administración, límites, Origin y Brevo.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { crearD1 } from '../../scripts/pruebas/d1-sqlite.mjs';
import { manejar } from './rutas';
import type { Env } from './util';

const O = 'https://klever.pages.dev';
function cliente(env: Env, reloj: { t: number }) {
  let cookie = '';
  const pedir = async (metodo: string, ruta: string, cuerpo?: unknown, cab: Record<string, string> = {}) => {
    const h: Record<string, string> = { ...(cookie ? { cookie } : {}), ...(metodo !== 'GET' ? { origin: O } : {}), ...cab };
    if (cuerpo !== undefined) h['content-type'] = 'application/json';
    const r = await manejar(new Request(O + ruta, { method: metodo, headers: h, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo), redirect: 'manual' }), env, () => new Date(reloj.t));
    const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0].endsWith('=') ? '' : sc.split(';')[0];
    const texto = await r.text();
    return { s: r.status, j: texto ? JSON.parse(texto) : null, r, sc };
  };
  return { pedir, get cookie() { return cookie; } };
}
const entorno = (extra: Partial<Env> = {}): Env => ({ DB: crearD1().DB, ADMIN_EMAIL: 'Admin@Ejemplo.invalid', ...extra });
async function entrarConEnlace(c: ReturnType<typeof cliente>, email: string, invitacion?: string) {
  const a = await c.pedir('POST', '/api/acceso', { email, invitacion });
  expect(a.s, JSON.stringify(a.j)).toBe(200);
  const v = await c.pedir('GET', new URL(a.j.enlacePruebas).pathname + new URL(a.j.enlacePruebas).search);
  return { a, v };
}

describe('Api · acceso y cuenta', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('arranque de administración, modo pruebas, alta, invitación y segundo usuario', async () => {
    const env = entorno(), reloj = { t: Date.parse('2026-11-11T10:00:00Z') }, adm = cliente(env, reloj);
    expect((await adm.pedir('GET', '/api/sesion')).j).toEqual({ usuario: null, necesitaAlta: false, modoPruebas: true, demo: false });
    // un correo cualquiera sin invitación: beta privada
    const no = await adm.pedir('POST', '/api/acceso', { email: 'nadie@ejemplo.invalid' });
    expect(no.s).toBe(403); expect(no.j.codigo).toBe('invitacion'); expect(typeof no.j.mensaje).toBe('string');
    expect((await adm.pedir('POST', '/api/acceso', { email: 'malo' })).j.codigo).toBe('email');
    // la administración entra sin invitación (arranque)
    const { a, v } = await entrarConEnlace(adm, 'admin@ejemplo.invalid');
    expect(a.j.enviado).toBe(false); expect(a.j.enlacePruebas).toMatch(/^https:\/\/klever\.pages\.dev\/api\/verificar\?t=[0-9a-f]{64}$/);
    expect(v.s).toBe(302); expect(v.r.headers.get('location')).toBe('/#/alta');
    expect(v.sc).toMatch(/HttpOnly/); expect(v.sc).toMatch(/Secure/); expect(v.sc).toMatch(/SameSite=Lax/); expect(v.sc).toMatch(/Max-Age=2592000/);
    // el token se guarda solo como hash
    const token = new URL(a.j.enlacePruebas).searchParams.get('t')!;
    // el enlace es de un solo uso
    const otra = cliente(env, reloj); const re = await otra.pedir('GET', '/api/verificar?t=' + token);
    expect(re.r.headers.get('location')).toBe('/#/entrar?error=enlace'); expect(re.sc).toBeNull();
    expect((await adm.pedir('GET', '/api/sesion')).j).toMatchObject({ usuario: null, necesitaAlta: true });
    expect((await adm.pedir('GET', '/api/carteras')).s).toBe(401);
    // alta: mayor de 18 obligatorio y apodo válido
    expect((await adm.pedir('POST', '/api/alta', { apodo: 'Admin', mayor18: false })).j.codigo).toBe('mayor18');
    expect((await adm.pedir('POST', '/api/alta', { apodo: 'x', mayor18: true })).j.codigo).toBe('apodo');
    const al = await adm.pedir('POST', '/api/alta', { apodo: 'Javi', mayor18: true });
    expect(al.s).toBe(200); expect(al.j).toMatchObject({ apodo: 'Javi', esAdmin: true });
    expect((await adm.pedir('POST', '/api/alta', { apodo: 'Otro', mayor18: true })).s).toBe(409);
    const ses = (await adm.pedir('GET', '/api/sesion')).j; expect(ses.usuario).toMatchObject({ apodo: 'Javi', esAdmin: true }); expect(ses.necesitaAlta).toBe(false);
    // panel de administración
    const inv = await adm.pedir('POST', '/api/admin/invitaciones', { usosMax: 2, nota: 'Amigos' });
    expect(inv.j).toMatchObject({ usos: 0, usosMax: 2, nota: 'Amigos' }); expect(inv.j.codigo).toMatch(/^[A-Z0-9]{8}$/);
    expect((await adm.pedir('GET', '/api/admin/invitaciones')).j.length).toBe(1);
    for (let k = 0; k < 6; k++) expect((await adm.pedir('POST', '/api/invitaciones', { nota: 'n' + k })).s).toBe(200); // admin: sin límite de 5

    // segundo usuario con la invitación
    reloj.t += 1000; const bea = cliente(env, reloj);
    expect((await bea.pedir('POST', '/api/acceso', { email: 'bea@ejemplo.invalid', invitacion: 'NOVALE22' })).j.codigo).toBe('invitacion');
    const e2 = await entrarConEnlace(bea, 'Bea@Ejemplo.invalid', inv.j.codigo.toLowerCase());
    expect(e2.v.r.headers.get('location')).toBe('/#/alta');
    expect((await bea.pedir('POST', '/api/alta', { apodo: 'javi', mayor18: true })).j.codigo).toBe('apodo_ocupado');
    const ab = await bea.pedir('POST', '/api/alta', { apodo: 'Bea', mayor18: true }); expect(ab.j).toMatchObject({ apodo: 'Bea', esAdmin: false });
    expect((await bea.pedir('GET', '/api/admin/invitaciones')).s).toBe(403);
    expect((await adm.pedir('GET', '/api/admin/invitaciones')).j[0].usos).toBe(1);
    // usuarios normales: hasta 5 invitaciones
    for (let k = 0; k < 5; k++) expect((await bea.pedir('POST', '/api/invitaciones', {})).s).toBe(200);
    const sexta = await bea.pedir('POST', '/api/invitaciones', {}); expect(sexta.s).toBe(400); expect(sexta.j.codigo).toBe('max_invitaciones');
    expect((await bea.pedir('GET', '/api/invitaciones')).j.length).toBe(5);

    // una cuenta existente vuelve a entrar sin invitación y va a su cartera; límite de 1 por minuto
    reloj.t += 61_000;
    const de_nuevo = cliente(env, reloj); const e3 = await entrarConEnlace(de_nuevo, 'bea@ejemplo.invalid');
    expect(e3.v.r.headers.get('location')).toBe('/#/cartera');
    const pronto = await de_nuevo.pedir('POST', '/api/acceso', { email: 'bea@ejemplo.invalid' }); expect(pronto.s).toBe(429); expect(pronto.j.codigo).toBe('espera');
    for (let k = 0; k < 3; k++) { reloj.t += 61_000; expect((await de_nuevo.pedir('POST', '/api/acceso', { email: 'bea@ejemplo.invalid' })).s).toBe(200); }
    reloj.t += 61_000; const dia = await de_nuevo.pedir('POST', '/api/acceso', { email: 'bea@ejemplo.invalid' }); expect(dia.s).toBe(429); expect(dia.j.codigo).toBe('limite');

    // salir borra la sesión
    expect((await bea.pedir('POST', '/api/salir')).s).toBe(204);
    expect((await bea.pedir('GET', '/api/sesion')).j.usuario).toBeNull();
  });

  it('carteras, ligas y unión con otro usuario por la Api', async () => {
    const env = entorno(), reloj = { t: Date.parse('2026-11-11T10:00:00Z') }, a = cliente(env, reloj), b = cliente(env, reloj);
    await entrarConEnlace(a, 'admin@ejemplo.invalid'); await a.pedir('POST', '/api/alta', { apodo: 'Ana', mayor18: true });
    const inv = (await a.pedir('POST', '/api/invitaciones', { nota: 'Bea' })).j.codigo;
    await entrarConEnlace(b, 'b@ejemplo.invalid', inv); await b.pedir('POST', '/api/alta', { apodo: 'Bea', mayor18: true });
    const c = await a.pedir('POST', '/api/carteras', { nombre: 'Mía', posiciones: [{ ticker: 'NUBE', decimas: 600 }, { ticker: 'VITA', decimas: 400 }] });
    expect(c.s).toBe(200); expect(c.j.principal).toBe(true);
    expect((await a.pedir('PUT', `/api/carteras/${c.j.id}`, { posiciones: [{ ticker: 'NUBE', decimas: 1000 }] })).j.posiciones).toEqual([{ ticker: 'NUBE', decimas: 1000 }]);
    expect((await b.pedir('PUT', `/api/carteras/${c.j.id}`, { posiciones: [] })).s).toBe(404); // no es suya
    expect((await a.pedir('POST', '/api/carteras', { nombre: 'X', posiciones: [{ ticker: 'NOEX', decimas: 10 }] })).j.codigo).toBe('ticker');
    const l = await a.pedir('POST', '/api/ligas', { nombre: 'Facultad', tipo: 'clasica', reglas: { maxPorEmpresa: 30 } });
    expect(l.s).toBe(200);
    expect((await b.pedir('POST', '/api/ligas/unirse', { codigo: l.j.codigo.toLowerCase() })).j.id).toBe(l.j.id);
    const d = await b.pedir('GET', `/api/ligas/${l.j.id}`); expect(d.s).toBe(200); expect(d.j.clasificacion.length).toBe(2);
    expect((await a.pedir('GET', '/api/ligas/abc')).s).toBe(404);
    expect((await a.pedir('GET', '/api/temporada')).j.semanas.length).toBe(12);
    expect((await a.pedir('GET', `/api/carteras/${c.j.id}/historial`)).j.versiones.length).toBe(2);
    expect((await a.pedir('POST', '/api/revision', { ticker: 'NUBE' })).s).toBe(204);
    expect((await a.pedir('POST', '/api/evento', { nombre: 'abrir_app' })).s).toBe(204);
    expect((await a.pedir('DELETE', `/api/carteras/${c.j.id}`)).j.codigo).toBe('inscrita');
  });

  it('seguridad: Origin, métodos, rutas y JSON', async () => {
    const env = entorno(), reloj = { t: Date.now() }, c = cliente(env, reloj);
    const sinOrigen = await c.pedir('POST', '/api/acceso', { email: 'admin@ejemplo.invalid' }, { origin: 'https://malo.example' });
    expect(sinOrigen.s).toBe(403); expect(sinOrigen.j.codigo).toBe('origen');
    expect((await c.pedir('DELETE', '/api/sesion')).s).toBe(405);
    expect((await c.pedir('GET', '/api/nada')).j).toEqual({ codigo: 'ruta', mensaje: 'Esa dirección no existe.' });
    const r = await manejar(new Request(O + '/api/acceso', { method: 'POST', headers: { origin: O }, body: '{roto' }), env); expect(r.status).toBe(400);
    expect((await c.pedir('GET', '/api/verificar?t=zzz')).r.headers.get('location')).toBe('/#/entrar?error=enlace');
    const r2 = await manejar(new Request(O + '/api/sesion', { headers: { cookie: 'klever_sesion=' + 'a'.repeat(64) } }), env);
    expect(((await r2.json()) as { usuario: unknown }).usuario).toBeNull();
  });

  it('con Brevo envía el correo (y no devuelve el enlace en pantalla)', async () => {
    const env = entorno({ BREVO_API_KEY: 'clave-falsa', BREVO_SENDER: 'acceso@ejemplo.invalid' }), reloj = { t: Date.now() }, c = cliente(env, reloj);
    const envio = vi.fn(async (_url: string, _init: RequestInit) => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', envio);
    const a = await c.pedir('POST', '/api/acceso', { email: 'admin@ejemplo.invalid' });
    expect(a.j).toEqual({ enviado: true });
    expect(envio).toHaveBeenCalledOnce();
    const [url, init] = envio.mock.calls[0]; const cuerpo = JSON.parse(String(init.body));
    expect(url).toBe('https://api.brevo.com/v3/smtp/email'); expect((init.headers as Record<string, string>)['api-key']).toBe('clave-falsa');
    expect(cuerpo.to).toEqual([{ email: 'admin@ejemplo.invalid' }]); expect(cuerpo.sender.email).toBe('acceso@ejemplo.invalid'); expect(cuerpo.htmlContent).toMatch(/\/api\/verificar\?t=[0-9a-f]{64}/);
    expect((await c.pedir('GET', '/api/sesion')).j.modoPruebas).toBe(false);
    envio.mockImplementationOnce(async () => new Response('no', { status: 500 })); reloj.t += 61_000;
    const fallo = await c.pedir('POST', '/api/acceso', { email: 'admin@ejemplo.invalid' }); expect(fallo.s).toBe(502); expect(fallo.j.codigo).toBe('correo');
  });
});
