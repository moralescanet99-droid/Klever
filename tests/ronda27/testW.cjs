// Batería W (ronda 27): el INTENTO INCIERTO de «Registrar revisión» sobrevive a recargar, cerrar la pestaña y caducar la sesión, y NO duplica la anotación.
// Antes (limitación conocida de R23/R24): tras un envío incierto, una recarga o un nuevo acceso perdían la clave del intento y el reenvío creaba una SEGUNDA anotación igual.
//   W1 el servidor guardó pero la respuesta se perdió + RECARGA → «Reintentar el mismo envío» usa LA MISMA clave → 1 sola anotación («ya estaba registrada»)
//   W2 la petición no llegó + CERRAR la pestaña y abrir otra → el reenvío la registra UNA vez con la clave original
//   W3 incierto + SESIÓN caducada (revocada en el servidor) + volver con la MISMA cuenta → misma clave → 1 sola anotación
//   W4 texto nuevo escrito tras recargar: se envía el intento original; lo nuevo queda en el formulario SIN enviar
//   W5 OTRA cuenta en el mismo dispositivo: no ve el intento (404, sin formulario) y se purga al cargar su Cuaderno; la clave nunca se envía con su sesión
// Servidor real (D1 local), datos ficticios, 1440 y 390 px. Uso: node tests/ronda27/testW.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body, token) => p.evaluate(async ([m, ruta, body, token]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (token || localStorage.getItem('klever_token')) }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body, token]);
  const entrarCon = async (p, email, abierto = false) => { if (!abierto) { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); } await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const filas = async (p, id) => { const t = await p.evaluate(() => localStorage.getItem('klever_token')); const r = await p.context().request.get(B + 'api/escenarios/' + id, { headers: { authorization: 'Bearer ' + t } }); return ((await r.json()).revisiones || []).map(x => x.observacion); };
  const abrirFicha = async (p, id) => { await p.evaluate(i => { location.hash = '#escenario-' + i; }, id); await p.waitForSelector('#rev-form', { state: 'attached', timeout: 15000 }); if (!(await p.evaluate(() => document.querySelector('#rev-det').open))) await p.locator('#rev-det > summary').click(); await p.waitForSelector('#rev-obs', { state: 'visible' }); };
  const estado = p => p.evaluate(() => ({ boton: document.querySelector('#rev-btn')?.textContent.trim(), msg: document.querySelector('#rev-estado')?.textContent.replace(/\s+/g, ' ').trim() || '', obs: document.querySelector('#rev-obs')?.value }));
  const dialogo = d => { if (d.type() === 'beforeunload') d.accept().catch(() => {}); else d.dismiss().catch(() => {}); };

  for (const [w, h] of [[1440, 900], [390, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo);
    const posts = [], vigilar = pg => pg.on('request', r => { if (r.method() === 'POST' && /\/revisiones$/.test(r.url())) posts.push({ clave: JSON.parse(r.postData()).clave, obs: JSON.parse(r.postData()).observacion, tok: (r.headers().authorization || '').slice(-8) }); });
    vigilar(p);
    const correo = mail('W' + w); await entrarCon(p, correo);
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Cartera W', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j, cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    let cur = p; const crea = async n => (await api(cur, 'POST', '/escenarios', { clave: `w-${n}-${w}-${Date.now()}`, nombre: 'Idea ' + n, cartera_id: c.id, base_revision: cart.revision, ticker: 'JNJ', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'JNJ', peso: 10 }], pregunta: '¿Aporta JNJ?', revisar_en: '2026-01-01' })).j;
    // modo 'perder': el servidor lo guarda y la respuesta se pierde · 'cortar': la petición no llega
    let modo = null; const ruta = async (pg, id) => pg.route(`**/api/escenarios/${id}/revisiones`, async r => { if (r.request().method() === 'POST' && modo) { const m = modo; modo = null; if (m === 'perder') { await r.fetch(); return r.abort('failed'); } return r.abort('failed'); } return r.continue(); });
    const incierto = async (pg, id, texto, m) => { await abrirFicha(pg, id); await pg.fill('#rev-obs', texto); modo = m; await pg.click('#rev-btn'); await pg.waitForFunction(() => /Reintentar el mismo envío/.test(document.querySelector('#rev-btn')?.textContent || ''), null, { timeout: 15000 }); await pg.waitForTimeout(300); };

    // ---- W1 respuesta perdida + recarga
    const E1 = await crea('a'); await ruta(p, E1.id); posts.length = 0;
    await incierto(p, E1.id, 'Revisión W1', 'perder');
    const tras1 = await filas(p, E1.id);
    await p.reload(); await abrirFicha(p, E1.id); const rec1 = await estado(p);
    await p.click('#rev-btn'); await p.waitForFunction(() => /Registrar revisión/.test(document.querySelector('#rev-btn')?.textContent || ''), null, { timeout: 15000 }); await p.waitForTimeout(300);
    const fin1 = { filas: await filas(p, E1.id), est: await estado(p), claves: posts.map(x => x.clave) };
    ev('W1-' + w, `Respuesta perdida y RECARGA (${w} px): el reenvío usa la misma clave y no duplica`, 'antes de reenviar ya hay 1 anotación en el servidor; tras recargar el botón dice «Reintentar el mismo envío» con el aviso de envío sin confirmar; al pulsarlo se envía la MISMA clave; sigue habiendo 1 anotación y se avisa de que ya estaba',
      J({ tras1, rec1, fin1 }), tras1.length === 1 && /Reintentar el mismo envío/.test(rec1.boton) && /sin confirmar/.test(rec1.msg) && rec1.obs === 'Revisión W1' && fin1.claves.length === 2 && fin1.claves[0] === fin1.claves[1] && J(fin1.filas) === J(['Revisión W1']) && /ya estaba registrada/.test(fin1.est.msg));

    // ---- W2 la petición no llegó + cerrar la pestaña y abrir otra
    const E2 = await crea('b'); await ruta(p, E2.id); posts.length = 0;
    await incierto(p, E2.id, 'Revisión W2', 'cortar'); const tras2 = await filas(p, E2.id);
    const p2 = await p.context().newPage(); p2.on('pageerror', e => errs.push(e.message)); p2.on('dialog', dialogo); vigilar(p2); cur = p2; await p.close();
    await p2.goto(B); await p2.waitForTimeout(800); await abrirFicha(p2, E2.id); const rec2 = await estado(p2);
    await p2.click('#rev-btn'); await p2.waitForFunction(() => /Registrar revisión/.test(document.querySelector('#rev-btn')?.textContent || ''), null, { timeout: 15000 }); await p2.waitForTimeout(300);
    const fin2 = { filas: await filas(p2, E2.id), est: await estado(p2), claves: posts.map(x => x.clave) };
    ev('W2-' + w, `Petición perdida y pestaña CERRADA (${w} px): en otra pestaña se reintenta el mismo intento y se registra una vez`, 'antes: 0 anotaciones; en la pestaña nueva, «Reintentar el mismo envío»; misma clave en los dos envíos; después: exactamente 1 anotación; el formulario queda vacío',
      J({ tras2, rec2, fin2 }), tras2.length === 0 && /Reintentar el mismo envío/.test(rec2.boton) && fin2.claves.length === 2 && fin2.claves[0] === fin2.claves[1] && J(fin2.filas) === J(['Revisión W2']) && fin2.est.obs === '');
    const q = p2;

    // ---- W3 incierto + sesión revocada + misma cuenta
    const E3 = await crea('c'); await ruta(q, E3.id); posts.length = 0;
    await incierto(q, E3.id, 'Revisión W3', 'perder');
    const tk = await q.evaluate(() => localStorage.getItem('klever_token')); await api(q, 'POST', '/logout', undefined, tk);           // el servidor revoca la sesión (como una caducidad)
    await q.reload(); await q.waitForTimeout(800);
    await q.evaluate(i => { location.hash = '#escenario-' + i; }, E3.id); await q.waitForTimeout(800);
    if (!(await q.locator('#dlg-acceso[open]').count())) { await q.click('#entrar').catch(() => {}); await q.waitForSelector('#dlg-acceso[open]', { timeout: 15000 }); }
    await entrarCon(q, correo, true); await abrirFicha(q, E3.id); const rec3 = await estado(q);
    await q.click('#rev-btn'); await q.waitForFunction(() => /Registrar revisión/.test(document.querySelector('#rev-btn')?.textContent || ''), null, { timeout: 15000 }); await q.waitForTimeout(300);
    const fin3 = { filas: await filas(q, E3.id), est: await estado(q), envios: posts.map(x => ({ clave: x.clave, tok: x.tok })) };
    ev('W3-' + w, `Incierto + SESIÓN caducada + misma cuenta (${w} px): el intento vuelve y no duplica`, 'tras volver a entrar, «Reintentar el mismo envío»; el reenvío va con OTRA sesión pero la MISMA clave; 1 sola anotación',
      J({ rec3, fin3 }), /Reintentar el mismo envío/.test(rec3.boton) && rec3.obs === 'Revisión W3' && fin3.envios.length === 2 && fin3.envios[0].clave === fin3.envios[1].clave && fin3.envios[0].tok !== fin3.envios[1].tok && J(fin3.filas) === J(['Revisión W3']));

    // ---- W4 texto nuevo tras recargar
    const E4 = await crea('d'); await ruta(q, E4.id); posts.length = 0;
    await incierto(q, E4.id, 'Revisión W4 original', 'cortar');
    await q.reload(); await abrirFicha(q, E4.id); await q.fill('#rev-obs', 'Texto nuevo tras recargar');
    await q.click('#rev-btn'); await q.waitForFunction(() => /Registrar revisión/.test(document.querySelector('#rev-btn')?.textContent || ''), null, { timeout: 15000 }); await q.waitForTimeout(300);
    const fin4 = { filas: await filas(q, E4.id), est: await estado(q), envios: posts.map(x => [x.clave, x.obs]) };
    ev('W4-' + w, `Texto nuevo escrito tras recargar (${w} px): se envía el intento original y lo nuevo NO se envía`, 'en el servidor solo «Revisión W4 original»; los dos envíos con la misma clave y el texto original; el formulario conserva «Texto nuevo tras recargar» y el aviso dice que NO se ha enviado',
      J(fin4), J(fin4.filas) === J(['Revisión W4 original']) && fin4.envios.length === 2 && fin4.envios.every(x => x[0] === fin4.envios[0][0] && x[1] === 'Revisión W4 original') && fin4.est.obs === 'Texto nuevo tras recargar' && /NO se ha enviado/.test(fin4.est.msg));

    // ---- W5 otra cuenta en el mismo dispositivo
    const E5 = await crea('e'); await ruta(q, E5.id); await incierto(q, E5.id, 'Revisión W5 privada', 'cortar');
    const tk5 = await q.evaluate(() => localStorage.getItem('klever_token')); await api(q, 'POST', '/logout', undefined, tk5); await q.reload(); await q.waitForTimeout(800);
    const antes5 = await q.evaluate(i => !!localStorage.getItem('klever_rev_' + i), E5.id); posts.length = 0;
    await q.click('#entrar').catch(() => {}); await q.waitForSelector('#dlg-acceso[open]', { timeout: 15000 }).catch(() => {}); await entrarCon(q, mail('WO' + w), true);
    await q.evaluate(i => { location.hash = '#escenario-' + i; }, E5.id); await q.waitForTimeout(1500);
    const vista5 = await q.evaluate(() => ({ form: !!document.querySelector('#rev-form'), texto: /Revisión W5 privada/.test(document.body.textContent) }));
    await q.evaluate(() => { location.hash = '#seguimiento'; }); await q.waitForFunction(() => /Aún no has guardado ningún escenario/.test(document.querySelector('#seg-escenarios')?.textContent || ''), null, { timeout: 15000 });
    const despues5 = await q.evaluate(i => !!localStorage.getItem('klever_rev_' + i), E5.id);
    ev('W5-' + w, `Otra cuenta (${w} px): no ve ni envía el intento ajeno y se purga al cargar su Cuaderno`, 'el intento estaba guardado; la otra cuenta no ve formulario ni texto; ningún POST de revisión; tras su Cuaderno ya no está en el dispositivo',
      J({ antes5, vista5, posts: posts.length, despues5 }), antes5 && !vista5.form && !vista5.texto && posts.length === 0 && !despues5);

    ev('W0-' + w, `Sin errores de JavaScript (${w} px)`, 'ningún pageerror', J(errs), errs.length === 0);
    await q.context().close();
  }
  await b.close(); await fin('evidencias-W27');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-W27'); });
