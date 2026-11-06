const { chromium } = require('playwright');
const OUT = './revision-chatgpt/ronda-25/imagenes/';
async function recorrido(b, base, tag, w, h, full) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }), p = await c.newPage(); p.on('dialog', d => d.accept().catch(() => {}));
  const snap = async n => { await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}${tag}-${n}-${w}.png` }); };
  await p.goto(base); await p.waitForSelector('#entrada-vacia'); await p.waitForTimeout(600); await snap('01-portada');
  if (tag === 'despues') { await p.evaluate(() => { const r = document.querySelector('#preview-peso'); r.value = 30; r.dispatchEvent(new Event('input', { bubbles: true })); }); await p.locator('#prev').scrollIntoViewIfNeeded(); await snap('02-portada-ejemplo-JNJ30'); }
  await p.evaluate(() => scrollTo(0, 0));
  await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 6); await snap('03-distribucion');
  await p.evaluate(() => document.querySelector('.js-revisar').click()); await p.waitForTimeout(900); await snap('04-revision');
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  await p.click('#vz-probar'); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'KO'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res .lab-res'); await p.waitForTimeout(500);
  await p.waitForTimeout(600); await p.evaluate(() => { const e = document.querySelector('#lab-res .lab-res'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 12); }); await snap('05-laboratorio-resultado');
  await c.close();
}
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844], [320, 780]]) { await recorrido(b, 'http://localhost:8796/', 'antes', w, h); await recorrido(b, 'http://localhost:8795/', 'despues', w, h); }
  await b.close(); })().catch(e => { console.error(e); process.exit(1); });
