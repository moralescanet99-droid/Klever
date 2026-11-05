// Batería U (ronda 23): la PROTECCIÓN DEL BORRADOR de una revisión en el NAVEGADOR (la lógica del formulario real, no solo el módulo de envío). Casos de la revisión de la ronda 22:
//   primer envío lento y edición durante la espera · reintento lento y edición durante la espera · conflicto con lectura posterior fallida (solo se reintenta la LECTURA) · lectura recuperada ·
//   sesión caducada y regreso con la MISMA cuenta · otra cuenta nunca ve el borrador · recorrido principal con la base inalterada. En 1440, 390 y 320 px. Datos FICTICIOS. Uso: node tests/ronda23/testU.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', process.env.RONDA || 'ronda23', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
const esperar = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const DLGMAL = [];
  const dialogo = d => { if (d.type() === 'beforeunload') d.accept().catch(() => {}); else { DLGMAL.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); } };
  const api = (p, m, ruta, body, token) => p.evaluate(async ([m, ruta, body, token]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (token || localStorage.getItem('klever_token')) }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body, token]);
  const entrarCon = async (p, email, abierto = false) => { if (!abierto) { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); } await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  // lectura DEL SERVIDOR por fuera de la página (las rutas inyectadas de la página no la afectan)
  const filas = async (p, id) => { const t = await p.evaluate(() => localStorage.getItem('klever_token')); const r = await p.ctx.request.get(B + 'api/escenarios/' + id, { headers: { authorization: 'Bearer ' + t } }); return (await r.json()).revisiones || []; };
  const abrirFicha = async (p, id) => { await p.evaluate(i => { location.hash = '#escenario-' + i; }, id); await p.waitForSelector('#rev-form', { state: 'attached' }); if (!(await p.evaluate(() => document.querySelector('#rev-det').open))) await p.locator('#rev-det > summary').click(); await p.waitForSelector('#rev-obs', { state: 'visible' }); };
  const msg = p => p.evaluate(() => document.querySelector('#rev-estado')?.textContent.replace(/\s+/g, ' ').trim() || '');
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const guardadoLocal = p => p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('klever_rev_')).map(k => ({ k, obs: JSON.parse(localStorage.getItem(k)).obs })));

  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo);
    const posts = []; p.on('request', r => { if (r.method() === 'POST' && /\/revisiones$/.test(r.url())) posts.push(JSON.parse(r.postData())); });
    const correo = mail('U' + w); await entrarCon(p, correo);
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera U', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j, cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    const crea = (clave, extra) => api(p, 'POST', '/escenarios', { clave, nombre: 'Idea ' + clave.slice(-3), cartera_id: c.id, base_revision: cart.revision, ticker: 'JNJ', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'JNJ', peso: 10 }], pregunta: '¿Aporta JNJ?', ...extra });
    const baseAntes = J(cart.posiciones.map(x => [x.ticker, x.peso]));
    let modo = null, demora = 1800;
    const preparaRuta = async id => { await p.route(`**/api/escenarios/${id}/revisiones`, async route => { if (route.request().method() === 'POST' && modo) { const m = modo; modo = null; if (m === 'perder') { await route.fetch(); return route.abort('failed'); } const r = await route.fetch(); await esperar(demora); if (m === 'perder-lento') return route.abort('failed'); return route.fulfill({ response: r }); } return route.continue(); }); };

    // ---- U1. PRIMER envío lento y edición durante la espera
    const E1 = (await crea('u-lento-' + w + '-aaa', { revisar_en: '2026-01-01' })).j; await preparaRuta(E1.id); await abrirFicha(p, E1.id);
    await p.fill('#rev-obs', 'Texto A (el que se envía)'); posts.length = 0; modo = 'lento'; await p.click('#rev-btn'); await p.waitForTimeout(400);
    await p.fill('#rev-obs', 'Texto B escrito mientras se guarda'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1, null, { timeout: 15000 }); await p.waitForTimeout(300);
    const u1 = { msg: await msg(p), obs: await p.inputValue('#rev-obs'), items: await p.evaluate(() => [...document.querySelectorAll('.esc-rev-lista > li')].map(l => l.textContent.replace(/\s+/g, ' '))), filas: (await filas(p, E1.id)).map(x => x.observacion), posts: posts.length, local: await guardadoLocal(p) };
    await p.screenshot({ path: CAP + `U1-primer-envio-lento-${w}-viewport.png` });
    ev('U1-' + w, `Primer envío lento y edición durante la espera (${w} px)`, 'Solo se registra el intento original (texto A); el texto escrito durante la espera (B) NO se borra: sigue en el formulario, se guarda en el dispositivo y el aviso dice que NO se ha enviado; 1 POST', J(u1),
      u1.filas.length === 1 && u1.filas[0] === 'Texto A (el que se envía)' && u1.obs === 'Texto B escrito mientras se guarda' && /NO se ha enviado/.test(u1.msg) && u1.items.length === 1 && /Texto A/.test(u1.items[0]) && !/Texto B/.test(u1.items[0]) && u1.posts === 1 && u1.local.some(x => x.obs === 'Texto B escrito mientras se guarda'));

    // ---- U2. REINTENTO lento y edición durante la espera (misma clave y contenido)
    const E2 = (await crea('u-reint-' + w + '-bbb', { revisar_en: '2026-01-01' })).j; await preparaRuta(E2.id); await abrirFicha(p, E2.id);
    await p.fill('#rev-obs', 'Texto A2 (el intento)'); posts.length = 0; modo = 'perder'; await p.click('#rev-btn'); await p.waitForSelector('#rev-estado .rev-aviso'); const incierto = await msg(p);
    // el formulario sigue IGUAL que el intento: solo se escribe durante la espera del reintento (con la lógica de la ronda 22 eso borraba el texto)
    modo = 'lento'; await p.click('#rev-btn'); await p.waitForTimeout(400); await p.fill('#rev-obs', 'Texto C2 durante el reintento lento'); const durante2 = await p.inputValue('#rev-obs'), boton2 = await p.textContent('#rev-btn'); await p.waitForTimeout(700); const durante2b = await p.inputValue('#rev-obs');
    await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1, null, { timeout: 15000 }); await p.waitForTimeout(300);
    const u2 = { durante2, boton2, durante2b, incierto: /No hemos podido confirmar/.test(incierto), msg: await msg(p), obs: await p.inputValue('#rev-obs'), filas: (await filas(p, E2.id)).map(x => x.observacion), posts: posts.map(x => [x.clave, x.observacion]) };
    ev('U2-' + w, `Reintento lento y edición durante la espera (${w} px)`, 'El reintento envía EL INTENTO (misma clave y mismo contenido que el primero); en el servidor solo existe «Texto A2»; el texto C2 escrito durante el reintento sigue en el formulario sin enviar y el aviso lo dice', J(u2),
      u2.incierto && u2.filas.length === 1 && u2.filas[0] === 'Texto A2 (el intento)' && u2.posts.length === 2 && u2.posts[0][0] === u2.posts[1][0] && u2.posts.every(x => x[1] === 'Texto A2 (el intento)') && u2.obs === 'Texto C2 durante el reintento lento' && /NO se ha enviado/.test(u2.msg));

    // ---- U3. conflicto + lectura posterior fallida: solo se reintenta la LECTURA; sin POST accidental ni «recarga la página»
    const E3 = (await crea('u-confl-' + w + '-ccc', { revisar_en: '2026-01-01' })).j; await abrirFicha(p, E3.id);
    const p2 = await p.ctx.newPage(); await p2.goto(B + '#escenario-' + E3.id); await p2.waitForSelector('#rev-form', { state: 'attached' }); if (!(await p2.evaluate(() => document.querySelector('#rev-det').open))) await p2.locator('#rev-det > summary').click();
    await p2.fill('#rev-obs', 'Desde la otra pestaña'); await p2.click('#rev-btn'); await p2.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1); await p2.close();
    let leerMal = true; await p.route(`**/api/escenarios/${E3.id}`, route => (leerMal && route.request().method() === 'GET') ? route.abort('failed') : route.continue());
    await p.fill('#rev-obs', 'Mi texto desde la pestaña antigua'); posts.length = 0; await p.click('#rev-btn'); await p.waitForSelector('#rev-estado .rev-aviso'); await p.waitForTimeout(300);
    const c1 = { msg: await msg(p), boton: await p.textContent('#rev-btn'), obs: await p.inputValue('#rev-obs'), posts: posts.length };
    await p.screenshot({ path: CAP + `U3-conflicto-sin-lectura-${w}-viewport.png` });
    await p.click('#rev-btn'); await p.waitForTimeout(500);
    const c2 = { msg: await msg(p), boton: await p.textContent('#rev-btn'), obs: await p.inputValue('#rev-obs'), posts: posts.length, filas: (await filas(p, E3.id)).length };
    leerMal = false; await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1); await p.waitForTimeout(300);
    const c3 = { msg: await msg(p), boton: await p.textContent('#rev-btn'), obs: await p.inputValue('#rev-obs'), posts: posts.length, items: await p.evaluate(() => [...document.querySelectorAll('.esc-rev-lista > li')].map(l => l.textContent.replace(/\s+/g, ' '))) };
    await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 2); await p.waitForTimeout(300);
    const c4 = { filas: (await filas(p, E3.id)).map(x => x.observacion), posts: posts.length };
    ev('U3-' + w, `Conflicto y lectura posterior fallida (${w} px)`, 'Tras el 409 y una lectura fallida el aviso NO dice «recarga» y ofrece «Reintentar la lectura»; mientras la lectura sigue fallando no hay ningún POST más y el texto se conserva; al recuperarla se ve la versión actual (la revisión de la otra pestaña) sin perder el texto; entonces registrar añade la mía: dos revisiones y solo 2 POST en total (el del 409 y el final)', J({ c1, c2, c3, c4 }),
      !/recarga/i.test(c1.msg) && /Reintentar la lectura/.test(c1.boton) && c1.obs === 'Mi texto desde la pestaña antigua' && c1.posts === 1 && c2.posts === 1 && /Reintentar la lectura/.test(c2.boton) && c2.obs === c1.obs && c2.filas === 1
      && /versión actual/.test(c3.msg) && /Registrar revisión/.test(c3.boton) && c3.obs === c1.obs && c3.posts === 1 && c3.items.length === 1 && /Desde la otra pestaña/.test(c3.items[0]) && c4.filas.length === 2 && c4.filas.includes('Mi texto desde la pestaña antigua') && c4.posts === 2);

    // ---- U4. sesión caducada (M102): el borrador vuelve con la MISMA cuenta
    const E4 = (await crea('u-sesion-' + w + '-ddd', { revisar_en: '2026-01-01' })).j; await abrirFicha(p, E4.id); await p.fill('#rev-obs', 'Borrador antes de que caduque la sesión'); await p.waitForTimeout(300);
    const token = await p.evaluate(() => localStorage.getItem('klever_token')); await api(p, 'POST', '/logout', undefined, token);                       // el servidor revoca la sesión (como una caducidad)
    posts.length = 0; await p.click('#rev-btn'); await p.waitForSelector('#dlg-acceso[open]', { timeout: 15000 }); await p.waitForTimeout(300);
    const trasCaducar = { local: await guardadoLocal(p), posts: posts.length };
    await entrarCon(p, correo, true); await abrirFicha(p, E4.id); await p.waitForTimeout(300);
    const vuelve = { obs: await p.inputValue('#rev-obs'), filas: (await filas(p, E4.id)).length };
    await p.screenshot({ path: CAP + `U4-sesion-caducada-regreso-${w}-viewport.png` });
    ev('U4-' + w, `Sesión caducada y regreso con la misma cuenta (${w} px)`, 'Al caducar, el envío (401) abre el acceso y NO registra nada; el borrador sigue guardado en el dispositivo; al volver a entrar con la misma cuenta y abrir la idea, el texto está en el formulario', J({ trasCaducar, vuelve }),
      trasCaducar.local.some(x => x.obs === 'Borrador antes de que caduque la sesión') && vuelve.obs === 'Borrador antes de que caduque la sesión' && vuelve.filas === 0);

    // ---- U5. otra cuenta NUNCA ve el borrador (caducidad y acceso con otra cuenta; y cierre de sesión a propósito)
    const token2 = await p.evaluate(() => localStorage.getItem('klever_token')); await api(p, 'POST', '/logout', undefined, token2); await p.click('#rev-btn').catch(() => {}); await p.waitForSelector('#dlg-acceso[open]', { timeout: 15000 }).catch(() => {});
    const antesOtra = await guardadoLocal(p); await entrarCon(p, mail('UO' + w), true);
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForFunction(() => /Aún no has guardado ningún escenario/.test(document.querySelector('#seg-escenarios')?.textContent || ''), null, { timeout: 15000 });
    const trasCuaderno = (await guardadoLocal(p)).map(x => x.k);
    await p.evaluate(i => { location.hash = '#escenario-' + i; }, E4.id); await p.waitForTimeout(1200);
    const restantes = await guardadoLocal(p), otra = { antes: antesOtra.length, trasEntrar: restantes.length, restantes: restantes.map(x => x.k), trasCuaderno, form: await p.evaluate(() => !!document.querySelector('#rev-form')), texto: await p.evaluate(() => /Borrador antes de que caduque/.test(document.body.textContent)), api: (await api(p, 'GET', '/escenarios/' + E4.id)).s };
    ev('U5-' + w, `Otra cuenta no ve el borrador (${w} px)`, 'El borrador existía al entrar con otra cuenta, pero esa cuenta no lo ve (404 al abrir la idea, sin formulario ni texto en pantalla) y se purga del dispositivo al cargar su Cuaderno', J(otra), otra.antes >= 1 && otra.trasEntrar === 0 && !otra.form && !otra.texto && otra.api === 404);
    // cierre de sesión a propósito: se borran los borradores
    const correo2 = mail('UC' + w); await p.evaluate(() => { localStorage.setItem('klever_rev_999999', JSON.stringify({ esc: 999999, obs: 'residuo', dec: 'mantener', t: Date.now() })); });
    if (await p.locator('#salir').isVisible().catch(() => false)) await p.click('#salir'); else { await p.click('#btn-menu'); await p.click('#salir-m'); } await p.waitForTimeout(600);
    const sal = p.locator('#salir-descartar'); if (await sal.isVisible().catch(() => false)) await sal.click(); await p.waitForTimeout(500);
    const tras = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('klever_rev_')).length);
    ev('U5b-' + w, `Cerrar sesión a propósito borra los borradores de revisión (${w} px)`, 'Tras salir no queda ninguna clave klever_rev_ en el dispositivo', J({ tras }), tras === 0);

    // ---- U6. recorrido principal con la base inalterada
    await entrarCon(p, correo); const base = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    ev('U6-' + w, `Base inalterada tras todos los casos (${w} px)`, 'La cartera conserva posiciones y revisión', J({ rev: base.revision, antes: cart.revision }), J(base.posiciones.map(x => [x.ticker, x.peso])) === baseAntes && base.revision === cart.revision);
    ev('U0-' + w, `Sin errores de JavaScript ni diálogos inesperados (${w} px)`, 'Ningún pageerror; sin diálogos inesperados', `errores ${J(errs)}; inesperados ${J(DLGMAL)}`, errs.length === 0 && DLGMAL.length === 0 && await sinDesborde(p));
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-U23');
})();
