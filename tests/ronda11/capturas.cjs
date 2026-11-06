// Capturas COMPARABLES antes/después del editor de cartera (ronda 11). Uso: node tests/ronda11/capturas.cjs antes|despues → ronda11/capturas/<fase>-<estado>-<ancho>.png
// Estados: normal, pendiente de guardar, error de guardado, pública con cambios privados, texto ampliado (SIMULADO: font-size del documento).
const { chromium, B, nuevo, entrar, peso } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const FASE = process.argv[2] || 'antes', OUT = path.resolve(__dirname, '..', '..', 'ronda11', 'capturas') + path.sep; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); let n = 0;
  const G = p => p.locator('.js-guardar >> visible=true');
  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 760;
    const shot = async (p, id, full = false) => { await p.waitForTimeout(250); await p.screenshot({ path: OUT + `${FASE}-${id}-${w}.png`, fullPage: full }); n++; };
    const alto = async p => { await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(350); };
    let p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'A' + w); await p.waitForTimeout(4700); await p.evaluate(() => window.scrollTo(0, 0));
    await shot(p, '1-normal'); await shot(p, '1-normal-pagina', true);
    await alto(p); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, '5-texto-ampliado'); await p.evaluate(() => window.scrollTo(0, 700)); await shot(p, '5-texto-ampliado-desplazado');
    await p.evaluate(() => { document.documentElement.style.fontSize = ''; window.scrollTo(0, 0); });
    await peso(p).fill('12'); await p.waitForTimeout(600); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, '2-pendiente');
    await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error'); await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue());
    await G(p).click(); await p.waitForTimeout(900); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, '3-error-guardado');
    await p.ctx.close();
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'B' + w); await p.waitForTimeout(4700);
    await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Cartera de oro para el ejemplo'); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(4700);
    await peso(p).fill('20'); await p.waitForTimeout(600); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, '4-publica-con-cambios-privados');
    await p.ctx.close();
  }
  console.log(FASE + ': ' + n + ' capturas'); await b.close();
})();
