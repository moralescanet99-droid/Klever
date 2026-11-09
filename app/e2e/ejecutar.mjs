// Klever v1 · PRUEBA DE PUNTA A PUNTA con el servidor real en local (wrangler pages dev + D1 local, MODO PRUEBAS sin Brevo).
// Recorre: arranque de administración → entrar (enlace en pantalla) → alta → panel admin (código) → crear cartera → crear liga
//          → otra persona entra con la invitación → alta → se une a la liga → detalle con las 2 personas.
// Uso (desde app/):  node e2e/ejecutar.mjs        Variables: E2E_PUERTO (8797), SIN_BUILD=1, CAPTURAS=<carpeta> (por defecto e2e/salida)
// Sale con código 0 solo si TODO pasa. Nunca toca wrangler.toml (usa --persist-to con el marcador de database_id).
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = path.join(APP, 'e2e', 'salida'), ESTADO = path.join(SALIDA, 'estado');
const CAPTURAS = path.resolve(process.env.CAPTURAS || SALIDA);
const PUERTO = Number(process.env.E2E_PUERTO || 8797), BASE = `http://localhost:${PUERTO}`;
const ADMIN = 'admin@ejemplo.invalid';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire(path.join(spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout.trim(), 'x'))('playwright')); }

let ok = 0; const fallos = [];
const comprobar = (nombre, cond, detalle = '') => { if (cond) { ok++; console.log('OK    ' + nombre); } else { fallos.push(nombre); console.log('FALLA ' + nombre + (detalle ? '  [' + detalle + ']' : '')); } };
const paso = t => console.log('\n── ' + t);
const libre = p => new Promise(r => { const s = net.createServer().once('error', () => r(false)).once('listening', () => s.close(() => r(true))).listen(p, '127.0.0.1'); });
const esperar = ms => new Promise(r => setTimeout(r, ms));
const wrangler = path.join(APP, 'node_modules', '.bin', 'wrangler');
const entornoW = { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' };

let servidor = null;
function parar() { if (servidor && servidor.exitCode === null) { try { process.kill(-servidor.pid, 'SIGTERM'); } catch { /* ya terminó */ } } }
process.on('exit', parar); process.on('SIGINT', () => { parar(); process.exit(130); });

async function main() {
  mkdirSync(CAPTURAS, { recursive: true });
  if (!(await libre(PUERTO))) throw new Error(`El puerto ${PUERTO} está ocupado (¿otro servidor?). Usa E2E_PUERTO=otro.`);

  if (!process.env.SIN_BUILD) {
    paso('Construir (vite build)');
    const b = spawnSync('npx', ['vite', 'build'], { cwd: APP, stdio: 'inherit' }); if (b.status !== 0) throw new Error('vite build falló');
  }
  if (!existsSync(path.join(APP, 'dist', 'index.html'))) throw new Error('No existe dist/index.html');

  paso('Base D1 local nueva + esquema');
  rmSync(ESTADO, { recursive: true, force: true }); mkdirSync(ESTADO, { recursive: true });
  const d1 = spawnSync(wrangler, ['d1', 'execute', 'klever', '--local', '--persist-to', ESTADO, '--file=schema.sql'], { cwd: APP, encoding: 'utf8', env: entornoW });
  if (d1.status !== 0) throw new Error('No se pudo aplicar schema.sql:\n' + d1.stdout + d1.stderr);
  comprobar('schema.sql se aplica en D1 local', true);

  paso(`Servidor: wrangler pages dev dist en ${BASE} (sin Brevo = modo pruebas)`);
  servidor = spawn(wrangler, ['pages', 'dev', 'dist', '--port', String(PUERTO), '--ip', '127.0.0.1', '--persist-to', ESTADO, '--binding', `ADMIN_EMAIL=${ADMIN}`, '--log-level', 'warn'],
    { cwd: APP, env: entornoW, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let registro = ''; servidor.stdout.on('data', d => (registro += d)); servidor.stderr.on('data', d => (registro += d));
  let listo = false;
  for (let i = 0; i < 120 && !listo; i++) { await esperar(500); if (servidor.exitCode !== null) break; try { listo = (await fetch(BASE + '/api/sesion')).ok; } catch { /* aún no */ } }
  if (!listo) throw new Error('El servidor no arrancó:\n' + registro.slice(-3000));
  comprobar('el servidor responde /api/sesion', true);

  // Cabeceras de seguridad (_headers) y de la Api
  const h = await fetch(BASE + '/'); const csp = h.headers.get('content-security-policy') || '';
  comprobar('CSP estricta en la página', csp.includes("script-src 'self'") && csp.includes("default-src 'self'") && !/https?:/.test(csp), csp);
  comprobar('X-Frame-Options DENY', h.headers.get('x-frame-options') === 'DENY');
  const man = await fetch(BASE + '/manifest.webmanifest'); comprobar('manifest servido', man.ok && (await man.json()).icons.length >= 3);
  const ico = await fetch(BASE + '/icono-512.png'); comprobar('icono PNG 512', ico.ok && ico.headers.get('content-type')?.includes('png'));
  const sinOrigen = await fetch(BASE + '/api/acceso', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: ADMIN }) });
  comprobar('POST sin Origin → 403', sinOrigen.status === 403);

  const navegador = await chromium.launch();
  const errores = [];
  async function contexto(nombre) {
    const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    // Las respuestas 400/403 que provocamos a propósito (apodo ocupado, sin permiso) salen como «Failed to load resource»: no cuentan.
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: .*status of 40[03]/.test(m.text())) errores.push(`[${nombre}] consola: ${m.text()}`); });
    p.on('pageerror', e => errores.push(`[${nombre}] página: ${e.message}`));
    return { ctx, p };
  }
  const api = (p, metodo, ruta, cuerpo) => p.evaluate(async ([m, r, c]) => {
    const res = await fetch(r, { method: m, credentials: 'same-origin', headers: c ? { 'content-type': 'application/json' } : {}, body: c ? JSON.stringify(c) : undefined });
    return { s: res.status, j: res.status === 204 ? null : await res.json().catch(() => null) };
  }, [metodo, ruta, cuerpo]);
  const foto = (p, n) => p.screenshot({ path: path.join(CAPTURAS, `sv-e2e-${n}.png`), fullPage: true });
  const sinScroll = async (p, n) => { const w = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); comprobar(`${n}: sin scroll horizontal`, w[0] <= w[1], w.join(' > ')); };

  // ── Persona A: administración (arranque sin invitación) ──
  paso('Administración entra sin invitación (arranque)');
  const A = await contexto('admin');
  await A.p.goto(BASE + '/#/entrar');
  await A.p.getByLabel('Tu correo').fill(ADMIN);
  await foto(A.p, '01-entrar'); await sinScroll(A.p, 'Entrar');
  await A.p.getByRole('button', { name: 'Enviarme el enlace' }).click();
  const entrarA = A.p.getByRole('link', { name: 'Entrar ahora' });
  await entrarA.waitFor({ timeout: 10000 });
  comprobar('modo pruebas: el enlace sale en pantalla', /\/api\/verificar\?t=[0-9a-f]{64}$/.test(await entrarA.getAttribute('href')));
  await foto(A.p, '02-modo-pruebas');
  await entrarA.click();
  await A.p.getByRole('button', { name: 'Entrar en Klever' }).click(); // página de confirmación (protege de los previsualizadores de correo)
  await A.p.waitForURL(/#\/alta$/, { timeout: 10000 });
  await A.p.getByLabel('Apodo').waitFor();
  comprobar('verificar redirige a #/alta (cuenta nueva)', true);
  const cookies = await A.ctx.cookies(); const ck = cookies.find(c => c.name === 'klever_sesion');
  comprobar('cookie de sesión HttpOnly + SameSite=Lax', !!ck && ck.httpOnly && ck.sameSite === 'Lax' && ck.secure, JSON.stringify(ck));
  await A.p.getByLabel('Apodo').fill('Javi_admin');
  const crearCuenta = A.p.getByRole('button', { name: 'Crear mi cuenta' });
  comprobar('alta: botón desactivado sin la casilla de 18 años', await crearCuenta.isDisabled());
  await A.p.getByText('Tengo 18 años o más').click();
  await A.p.getByRole('checkbox', { name: /Acepto las condiciones/ }).check();
  await foto(A.p, '03-alta'); await sinScroll(A.p, 'Alta');
  await crearCuenta.click();
  await A.p.waitForURL(/#\/cartera$/, { timeout: 10000 });
  await A.p.waitForFunction(() => !!document.querySelector('a.avatar'), null, { timeout: 10000 });
  const sesA = await api(A.p, 'GET', '/api/sesion');
  comprobar('sesión: admin dada de alta (esAdmin)', sesA.j?.usuario?.apodo === 'Javi_admin' && sesA.j.usuario.esAdmin === true && sesA.j.modoPruebas === true, JSON.stringify(sesA.j));

  paso('Panel de administración: crear código');
  await A.p.goto(BASE + '/#/admin');
  await A.p.getByLabel('Usos').fill('3'); await A.p.getByLabel('Nota').fill('Amigos de la facultad');
  await A.p.getByRole('button', { name: 'Crear código' }).click();
  const codigoEl = A.p.locator('.codigo').first(); await codigoEl.waitFor();
  const CODIGO = (await codigoEl.textContent()).trim();
  comprobar('código de invitación creado', /^[A-Z0-9]{8}$/.test(CODIGO), CODIGO);
  await foto(A.p, '04-admin'); await sinScroll(A.p, 'Admin');

  paso('Cuenta: tema y mis invitaciones');
  await A.p.goto(BASE + '/#/cuenta');
  await A.p.getByRole('radio', { name: 'Oscuro' }).click();
  comprobar('tema oscuro aplicado', (await A.p.evaluate(() => document.documentElement.dataset.tema)) === 'oscuro');
  await A.p.getByRole('button', { name: 'Crear invitación' }).click();
  await A.p.getByRole('button', { name: /Copiar enlace de la invitación/ }).first().waitFor();
  await foto(A.p, '05-cuenta-oscuro'); await sinScroll(A.p, 'Cuenta');
  await A.p.getByRole('radio', { name: 'Claro' }).click();

  paso('Crear cartera y liga (Api desde el navegador)');
  const cart = await api(A.p, 'POST', '/api/carteras', { nombre: 'Mi cartera', posiciones: [{ ticker: 'NUBE', decimas: 300 }, { ticker: 'VITA', decimas: 250 }, { ticker: 'SOLR', decimas: 250 }, { ticker: 'FARO', decimas: 200 }] });
  comprobar('cartera creada y principal', cart.s === 200 && cart.j.principal === true && cart.j.posiciones.length === 4, JSON.stringify(cart));
  const liga = await api(A.p, 'POST', '/api/ligas', { nombre: 'Facultad Eco 25', tipo: 'clasica', reglas: { maxPorEmpresa: 30, minSectores: 3 } });
  comprobar('liga creada', liga.s === 200 && /^[A-Z0-9]{6}$/.test(liga.j.codigo), JSON.stringify(liga));

  // ── Persona B: entra con la invitación (enlace ?invitacion=) ──
  paso('Otra persona entra con la invitación');
  const B = await contexto('invitada');
  await B.p.goto(`${BASE}/#/entrar?invitacion=${CODIGO}`);
  comprobar('el código llega desde la URL', (await B.p.getByLabel('Código de invitación').inputValue()) === CODIGO);
  await B.p.getByLabel('Tu correo').fill('bea@ejemplo.invalid');
  await B.p.getByRole('button', { name: 'Enviarme el enlace' }).click();
  await B.p.getByRole('link', { name: 'Entrar ahora' }).click();
  await B.p.getByRole('button', { name: 'Entrar en Klever' }).click();
  await B.p.waitForURL(/#\/alta$/);
  await B.p.getByLabel('Apodo').fill('javi_ADMIN');
  await B.p.getByText('Tengo 18 años o más').click();
  await B.p.getByRole('checkbox', { name: /Acepto las condiciones/ }).check();
  await B.p.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await B.p.getByRole('alert').filter({ hasText: 'cogido' }).waitFor();
  comprobar('apodo ocupado (sin distinguir mayúsculas) se avisa', true);
  await B.p.getByLabel('Apodo').fill('Bea');
  await B.p.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await B.p.waitForURL(/#\/cartera$/);
  const sesB = await api(B.p, 'GET', '/api/sesion');
  comprobar('sesión de la invitada (no admin)', sesB.j?.usuario?.apodo === 'Bea' && sesB.j.usuario.esAdmin === false, JSON.stringify(sesB.j));
  comprobar('la invitada no ve la administración', (await api(B.p, 'GET', '/api/admin/invitaciones')).s === 403);
  const sinInv = await B.p.evaluate(async () => (await fetch('/api/acceso', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'otra@ejemplo.invalid' }) })).status);
  comprobar('correo nuevo sin invitación → 403', sinInv === 403);

  paso('Unirse a la liga y ver el detalle');
  await api(B.p, 'POST', '/api/carteras', { nombre: 'La de Bea', posiciones: [{ ticker: 'SILI', decimas: 500 }, { ticker: 'GENO', decimas: 500 }] });
  const union = await api(B.p, 'POST', '/api/ligas/unirse', { codigo: liga.j.codigo });
  comprobar('se une a la liga con el código', union.s === 200 && union.j.id === liga.j.id && union.j.miembros === 2, JSON.stringify(union));
  const det = await api(B.p, 'GET', `/api/ligas/${liga.j.id}`);
  comprobar('detalle: clasificación con las 2 personas', det.s === 200 && det.j.clasificacion.map(f => f.apodo).sort().join(',') === 'Bea,Javi_admin', JSON.stringify(det.j?.clasificacion));
  comprobar('detalle: cartera inscrita de Bea', det.j?.carteraInscrita?.nombre === 'La de Bea');
  await B.p.goto(`${BASE}/#/liga/${liga.j.id}`); await esperar(1200); await foto(B.p, '06-liga-detalle');
  const adminInvs = await api(A.p, 'GET', '/api/admin/invitaciones');
  comprobar('el código consta como usado 1 vez', adminInvs.j.find(i => i.codigo === CODIGO)?.usos === 1);

  paso('Salir');
  await B.p.goto(BASE + '/#/cuenta'); await B.p.getByRole('button', { name: 'Salir' }).click();
  await B.p.getByLabel('Tu correo').waitFor();
  comprobar('tras salir vuelve a Entrar', (await api(B.p, 'GET', '/api/sesion')).j.usuario === null);
  await B.p.goto(BASE + '/#/legal/condiciones'); await B.p.getByText('Borrador').first().waitFor(); await foto(B.p, '07-legal');
  comprobar('legal visible sin sesión', await B.p.getByRole('heading', { name: 'Condiciones de uso' }).isVisible());

  comprobar('0 errores de consola o de página (incluida la CSP)', errores.length === 0, errores.join(' | '));
  await navegador.close();
}

main().catch(e => { fallos.push('excepción: ' + (e?.message || e)); console.error(e); }).finally(() => {
  parar();
  console.log(`\nRESULTADO: ${ok} correctas, ${fallos.length} fallos` + (fallos.length ? '\n- ' + fallos.join('\n- ') : ''));
  process.exitCode = fallos.length ? 1 : 0;
  setTimeout(() => process.exit(process.exitCode), 1500).unref();
});
