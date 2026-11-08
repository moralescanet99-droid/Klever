// Ronda 10: seguridad del acceso por HTTP contra un servidor SIN DEV_RETURN_LINK (como la beta pública). Uso (lo lanza run-all.sh con SIN_ENLACE_DEV=1):
//   BASE_URL=http://localhost:8788 node tests/ronda10/seguridad-http.mjs
// Aquí NO se envía ningún correo: sin claves de Brevo el envío falla (502). Comprueba que ese fallo no filtra enlaces y que lo público no expone datos personales.
const BASE = (process.env.BASE_URL || 'http://localhost:8788').replace(/\/$/, '');
let ok = 0; const fallos = [];
const t = (id, esc, cond, obs) => { cond ? ok++ : fallos.push(`${id} ${esc} → ${obs}`); console.log((cond ? 'OK   ' : 'FALLA') + ` [${id}] ${esc}  ${obs}`); };
const j = async (m, p, b, h = {}) => { const r = await fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...h }, body: b && JSON.stringify(b) }); const txt = await r.text(); return { s: r.status, txt, h: r.headers }; };
const email = `seguridad-${Date.now()}@example.com`;
const l = await j('POST', '/api/login', { email, acepto: true });
t('S1', 'Pedir acceso sin enlace de desarrollo ni correo configurado', l.s === 502 && !/dev_link|login=|[0-9a-f]{64}|"token"/.test(l.txt), `HTTP ${l.s}; cuerpo ${l.txt.slice(0, 120)}`);
const l2 = await j('POST', '/api/login', { email: 'no-es-un-email', acepto: true }), l3 = await j('POST', '/api/login', { email, acepto: false });
t('S2', 'Validación del acceso (email no válido; sin aceptar el aviso legal)', l2.s === 400 && l3.s === 400, `HTTP ${l2.s} y ${l3.s}`);
const v = await j('POST', '/api/verify', { token: 'a'.repeat(64) }), v2 = await j('POST', '/api/verify', { token: 'xyz' });
t('S3', 'Canjear un enlace inventado o mal formado', v.s === 400 && v2.s === 400 && !/"token"/.test(v.txt + v2.txt), `HTTP ${v.s} y ${v2.s}`);
const p1 = await j('GET', '/api/portfolios'), p2 = await j('GET', '/api/portfolios', undefined, { authorization: 'Bearer ' + 'b'.repeat(64) });
t('S4', 'Mis carteras exige sesión válida', p1.s === 401 && p2.s === 401, `sin sesión HTTP ${p1.s}; con sesión inventada HTTP ${p2.s}`);
const lista = await j('GET', '/api/public'); const ids = JSON.parse(lista.txt).map(x => x.id);
const detalles = await Promise.all(ids.slice(0, 5).map(id => j('GET', '/api/public/' + id)));
const publico = lista.txt + detalles.map(d => d.txt).join('');
t('S5', 'Lo público no expone datos personales', ids.length > 0 && !/@|email|usuario_id|token_escritura|revision/.test(publico), `${ids.length} carteras públicas, ${detalles.length} detalles; contiene «@», email, usuario_id, token_escritura o revisión=${/@|email|usuario_id|token_escritura|revision/.test(publico)}`);
const estaticos = await Promise.all(['/', '/app.js', '/index.html', '/klever.css'].map(p => j('GET', p)));
t('S6', 'Los ficheros públicos no contienen claves ni el valor de DEV_RETURN_LINK', estaticos.every(e => e.s === 200 && !/BREVO_API_KEY\s*[:=]|api-key|xkeysib|DEV_RETURN_LINK/i.test(e.txt)), `estados ${estaticos.map(e => e.s).join(',')}`);
console.log(`\nRESULTADO: ${ok} correctas, ${fallos.length} fallos${fallos.length ? '\nFALLOS:\n- ' + fallos.join('\n- ') : ''}`);
process.exit(fallos.length ? 1 : 0);
