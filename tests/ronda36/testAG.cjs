// Batería AG (ronda 36, plan de marketing): tarjeta para compartir desde «Hoy» y casilla de mayores de 18. Servidor real, 390 y 1440 px.
//   AG1 la casilla de aceptación dice «Tengo 18 años o más»; sin marcarla, el servidor rechaza con ese motivo
//   AG2 «Compartir» en «Hoy» genera una imagen PNG 1080×1350 (formato historia) y cuenta «compartir» en el embudo; sin pantallazos de datos personales: solo nombre de la cartera
//   AG0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const fs = require('fs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }), p = await c.newPage(); await p.route(/tradingview\.com/, r => r.abort());
    const errs = [], env = []; p.on('pageerror', e => errs.push(e.message)); p.on('request', r => { if (/\/api\/evento$/.test(r.url())) env.push(JSON.parse(r.postData()).evento); });
    await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar');
    const etiqueta = await p.evaluate(() => document.querySelector('label[for="acc-acepto"]').textContent.replace(/\s+/g, ' ').trim());
    const sin = await p.evaluate(async () => { const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'x' + Date.now() + '@example.com', acepto: false }) }); return { s: r.status, j: await r.json() }; });
    ev('AG1-' + w, `Solo mayores de 18 (${w} px)`, 'la casilla dice «Tengo 18 años o más…»; sin aceptarla, HTTP 400 con el motivo de la edad', J({ etiqueta, sin }), /^Tengo 18 años o más y he leído el aviso legal y la privacidad$/.test(etiqueta) && sin.s === 400 && /18 años/.test(sin.j.error));
    await p.fill('#acc-email', mail('AG' + w)); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForTimeout(800);
    await p.evaluate(async () => { await fetch('/api/portfolios', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ nombre: 'Cartera AG', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'KO', peso: 30 }, { ticker: 'JNJ', peso: 30 }] }) }); });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('[data-hoy-compartir]');
    env.length = 0; const [d] = await Promise.all([p.waitForEvent('download'), p.click('[data-hoy-compartir]')]); const ruta = await d.path(); const buf = fs.readFileSync(ruta); await p.waitForTimeout(400);
    const png = { firma: buf.slice(1, 4).toString(), ancho: buf.readUInt32BE(16), alto: buf.readUInt32BE(20), nombre: d.suggestedFilename(), kb: Math.round(buf.length / 1024) };
    ev('AG2-' + w, `Tarjeta para compartir (${w} px)`, 'PNG de 1080×1350 «mi-cartera-klever.png» (sin el menú de compartir del sistema, se descarga) y un aviso «compartir» al embudo', J({ png, env }), png.firma === 'PNG' && png.ancho === 1080 && png.alto === 1350 && png.nombre === 'mi-cartera-klever.png' && png.kb > 20 && J(env) === J(['compartir']));
    ev('AG0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún error; ancho = ventana', J(errs), !errs.length && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await c.close();
  }
  await b.close(); fin('evidencias-AG36');
})();
