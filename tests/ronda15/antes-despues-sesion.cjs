// Demostración ANTES/DESPUÉS de los dos fallos de sesión de la revisión de la ronda 14, en el navegador y contra cualquier servidor:
//   (1) Salir mientras el detalle de la cartera de A sigue en vuelo: la respuesta tardía NO debe volver a asignar el estado de A.
//   (2) Un 401 retrasado de A llega cuando B ya tiene la sesión: NO debe desconectar a B.
//   BASE_URL=http://localhost:8795/ node tests/ronda15/antes-despues-sesion.cjs   (código antiguo)   |   BASE_URL=http://localhost:8788/ (código nuevo)
const { chromium, B, nuevo, mail } = require('../ronda5/h.cjs');
const CAR = 'CARTERA-SECRETA-A-5520';
(async () => {
  const b = await chromium.launch();
  const login = async (p, tag) => { await p.goto(B); await p.click('#entrar'); await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(600); };
  { const p = await nuevo(b, 1440, 900); await login(p, 'ADS');
    const id = await p.evaluate(async n => (await (await fetch('/api/portfolios', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ nombre: n, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] }) })).json()).id, CAR);
    await p.reload(); await p.waitForSelector('.cartera-item');
    await p.route(new RegExp('/api/portfolios/' + id + '$'), async r => { if (r.request().method() === 'GET') await new Promise(res => setTimeout(res, 2500)); return r.continue(); });
    await p.locator('.cartera-item').first().click(); await p.waitForTimeout(300); await p.click('#salir'); await p.waitForTimeout(3600);
    const t = await p.evaluate(() => document.documentElement.outerHTML + ' ' + [...document.querySelectorAll('input,textarea')].map(e => e.value).join(' '));
    await p.evaluate(() => { location.hash = '#cartera'; }); await p.waitForTimeout(800);   // ¿el estado de A sigue en memoria? Si es así, el editor se abre con su cartera
    const t2 = await p.evaluate(() => document.documentElement.outerHTML + ' ' + [...document.querySelectorAll('input,textarea')].map(e => e.value).join(' ')), vista = await p.evaluate(() => [...document.querySelectorAll('[data-vista]')].find(s => !s.hidden)?.dataset.vista);
    console.log(`(1) Salir con el detalle de A en vuelo (llega 2,5 s después): HTML/campos con la cartera de A justo tras llegar: ${t.includes(CAR)}; y al abrir #cartera después: vista «${vista}», contiene la cartera de A: ${t2.includes(CAR)}`); await p.ctx.close(); }
  { const pb = await nuevo(b, 1440, 900); await login(pb, 'BDS'); const tokenB = await pb.evaluate(() => localStorage.getItem('klever_token'));
    const p = await nuevo(b, 1440, 900); await login(p, 'ADT'); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForTimeout(500);
    await p.route(/\/api\/(escenarios|portfolios)$/, async r => { if (r.request().method() === 'GET' && /escenarios/.test(r.request().url())) { await new Promise(res => setTimeout(res, 1800)); return r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"No autorizado"}' }); } return r.continue(); });
    await p.evaluate(() => { const s = document.querySelector('#seg-filtro'); s.value = 'todos'; s.dispatchEvent(new Event('change')); }); await p.waitForTimeout(300);
    await p.evaluate(t => localStorage.setItem('klever_token', t), tokenB); await p.waitForTimeout(2600);
    const tk = await p.evaluate(() => localStorage.getItem('klever_token'));
    console.log(`(2) 401 retrasado de A con B ya dentro → la sesión de B sigue: ${tk === tokenB} (token ${tk === null ? 'BORRADO' : tk === tokenB ? 'de B conservado' : 'otro'})`); await p.ctx.close(); await pb.ctx.close(); }
  await b.close();
})();
