// Validación ASISTIDA del acceso con correo real y de la persistencia entre sesiones, contra un despliegue de PRUEBA aislado.
// NO forma parte de run-all.sh (necesita correo real y esperas). Uso:
//   BASE_URL=https://klever-prueba.pages.dev TEST_EMAIL=tu-buzon-de-pruebas@ejemplo.com node tests/ronda10/validar-acceso-real.mjs
//   (opcional) CADUCIDAD=1 espera 16 min para comprobar la caducidad real del enlace.
// El script pide el enlace; tú lo copias del correo que llega al buzón de pruebas y lo pegas. Sin MODO_DEV, si el despliegue DEVUELVE el enlace en la respuesta, lo marca como FALLO de seguridad.
// MODO_DEV=1 (solo en local, servidor con DEV_RETURN_LINK=1) usa el enlace de la respuesta para probar el propio script: NO valida correo real.
import readline from 'node:readline/promises';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = (process.env.BASE_URL || '').replace(/\/$/, ''), EMAIL = process.env.TEST_EMAIL, DEV = process.env.MODO_DEV === '1';
if (!BASE || !EMAIL) { console.log('Faltan BASE_URL y TEST_EMAIL (buzón de pruebas que puedas leer).'); process.exit(2); }
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const res = []; const t = (id, esc, cond, obs) => { res.push({ id, escenario: esc, resultado: cond ? 'OK' : 'FALLA', observado: obs }); console.log((cond ? 'OK   ' : 'FALLA') + ` [${id}] ${esc}  ${obs}`); };
const api = async (m, p, b, tok) => { const r = await fetch(BASE + '/api' + p, { method: m, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}) }, body: b && JSON.stringify(b) }); let j = {}; try { j = await r.json(); } catch {} return { s: r.status, j }; };
const espera = s => new Promise(r => setTimeout(r, s * 1000));
let primero = true;
async function sesion(etq) { // pide un enlace, lo canjea y devuelve el token de sesión
  if (!primero) { console.log(`   (límite de envío: esperando 62 s antes de pedir otro enlace para «${etq}»)`); await espera(62); } primero = false;
  const l = await api('POST', '/login', { email: EMAIL, acepto: true });
  let enlace;
  if (l.j.dev_link) { if (!DEV) { t('SEG', 'El despliegue NO debe devolver el enlace en la respuesta', false, 'la respuesta incluye dev_link: no es la configuración de la beta pública'); process.exit(1); } enlace = l.j.dev_link; }
  else if (l.s === 200) enlace = (await rl.question(`   Correo enviado a ${EMAIL}. Pega aquí el enlace de «${etq}» (o solo el valor de login=…): `)).trim();
  else { t('ACC', 'Pedir acceso', false, `HTTP ${l.s} ${JSON.stringify(l.j)}`); process.exit(1); }
  const token = enlace.includes('login=') ? new URL(enlace, BASE).searchParams.get('login') : enlace;
  const v = await api('POST', '/verify', { token }); return { token, sesion: v.j.token, v, l };
}
const s1 = await sesion('sesión 1');
t('R1', 'Acceso con enlace recibido por correo', !!s1.sesion, DEV ? 'MODO_DEV: enlace de la respuesta (no es correo real)' : `HTTP ${s1.l.s}; la respuesta del servidor solo traía ${JSON.stringify(s1.l.j)}`);
const otra = await api('POST', '/verify', { token: s1.token });
t('R2', 'El enlace es de un solo uso', otra.s === 400, `segundo canje HTTP ${otra.s}`);
const c = await api('POST', '/portfolios', { nombre: 'Validación real', plantilla: 'oro', posiciones: [{ ticker: 'GLD', peso: 60 }, { ticker: 'IAU', peso: 40 }], tesis: 'Cartera ficticia de validación' }, s1.sesion);
const g1 = await api('GET', '/portfolios/' + c.j.id, undefined, s1.sesion);
t('R3', 'Persistencia al recargar (misma sesión, lectura nueva)', c.s === 201 && g1.j.nombre === 'Validación real' && g1.j.posiciones.length === 2, `HTTP ${c.s}/${g1.s}`);
const lo = await api('POST', '/logout', undefined, s1.sesion), trasSalir = await api('GET', '/portfolios', undefined, s1.sesion);
t('R4', 'Cerrar sesión invalida la sesión', lo.s === 200 && trasSalir.s === 401, `logout HTTP ${lo.s}; usar la sesión cerrada HTTP ${trasSalir.s}`);
const s2 = await sesion('sesión 2 (volver a entrar)'); const g2 = await api('GET', '/portfolios/' + c.j.id, undefined, s2.sesion);
t('R5', 'Persistencia tras cerrar sesión y volver a entrar', !!s2.sesion && g2.j.nombre === 'Validación real', `HTTP ${g2.s}; revisión ${g2.j.revision}`);
const s3 = await sesion('sesión 3 (segunda sesión independiente)'); const rev = g2.j.revision;
const a = await api('PUT', '/portfolios/' + c.j.id, { posiciones: [{ ticker: 'GLD', peso: 70 }, { ticker: 'IAU', peso: 30 }], revision: rev }, s2.sesion);
const b = await api('PUT', '/portfolios/' + c.j.id, { posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 50 }], revision: rev }, s3.sesion);
const fin = await api('GET', '/portfolios/' + c.j.id, undefined, s3.sesion);
t('R6', 'Conflicto entre dos sesiones independientes (misma revisión)', a.s === 200 && b.s === 409 && fin.j.posiciones.some(x => x.ticker === 'GLD' && x.peso === 70), `sesión 2 HTTP ${a.s}; sesión 3 HTTP ${b.s}; cuenta final ${fin.j.posiciones.map(x => x.ticker + ':' + x.peso).join(',')}`);
const mal = await api('PUT', '/portfolios/' + c.j.id, { posiciones: [{ ticker: 'GLD', peso: 80 }, { ticker: 'ZZZZ', peso: 20 }], revision: fin.j.revision }, s3.sesion), tras = await api('GET', '/portfolios/' + c.j.id, undefined, s3.sesion);
const ok = await api('PUT', '/portfolios/' + c.j.id, { posiciones: [{ ticker: 'GLD', peso: 80 }, { ticker: 'IAU', peso: 20 }], revision: tras.j.revision }, s3.sesion);
t('R7', 'Fallo de guardado (ticker inexistente) sin cambios y recuperación al reintentar', mal.s === 400 && tras.j.revision === fin.j.revision && ok.s === 200, `fallo HTTP ${mal.s} sin cambiar la revisión (${tras.j.revision}); reintento HTTP ${ok.s}`);
const priv = await api('GET', '/public/' + c.j.id), pub = await api('PATCH', '/portfolios/' + c.j.id, { publico: true, revision: ok.j.revision }, s3.sesion), publica = await api('GET', '/public/' + c.j.id), cuerpo = JSON.stringify(publica.j);
const des = await api('PATCH', '/portfolios/' + c.j.id, { publico: false, revision: pub.j.revision }, s3.sesion), otraVez = await api('GET', '/public/' + c.j.id);
t('R8', 'Separación público / privado', priv.s === 404 && pub.s === 200 && publica.s === 200 && !cuerpo.includes('@') && !/email|usuario_id|revision/.test(cuerpo) && des.s === 200 && otraVez.s === 404, `privada→HTTP ${priv.s}; pública→HTTP ${publica.s} sin email/usuario/revisión; despublicada→HTTP ${otraVez.s}`);
if (process.env.CADUCIDAD === '1') {
  console.log('   Comprobando caducidad real: se pide un enlace y se espera 16 minutos sin usarlo…'); await espera(62);
  const l = await api('POST', '/login', { email: EMAIL, acepto: true }); const e = l.j.dev_link || (await rl.question('   Pega el enlace recibido (NO lo abras): ')).trim(); const tk = e.includes('login=') ? new URL(e, BASE).searchParams.get('login') : e;
  await espera(16 * 60); const v = await api('POST', '/verify', { token: tk });
  t('R9', 'El enlace caduca a los 15 minutos', v.s === 400, `canje a los 16 min: HTTP ${v.s} «${v.j.error}»`);
}
await api('DELETE', '/portfolios/' + c.j.id, undefined, s3.sesion);
rl.close(); mkdirSync('ronda10', { recursive: true }); writeFileSync(process.env.SALIDA || 'ronda10/resultado-validacion-acceso.json', JSON.stringify({ base: BASE, modoDev: DEV, resultados: res }, null, 1));
const mal2 = res.filter(r => r.resultado !== 'OK'); console.log(`\nRESULTADO: ${res.length - mal2.length} correctas, ${mal2.length} fallos${DEV ? '\n(MODO_DEV: prueba del propio script; NO es validación con correo real)' : ''}`); process.exit(mal2.length ? 1 : 0);
