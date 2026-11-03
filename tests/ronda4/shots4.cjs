// Uso: node shots4.cjs antes|despues  (sitio local en :8788). Mismos recorridos en ambas versiones.
const { chromium } = require('playwright');
const V = process.argv[2], OUT = '/home/user/Klever/ronda4/' + V, B = 'http://localhost:8788/';
const SIZES = [['360', 360, 780], ['390', 390, 844], ['768', 768, 1024], ['1440', 1440, 900]];
let n = 0;
(async () => {
  const b = await chromium.launch();
  for (const scheme of ['light', 'dark']) for (const [name, w, h] of SIZES) {
    const tema = scheme === 'light' ? 'claro' : 'oscuro', f = x => `${OUT}/${x}-${name}-${tema}.png`;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: w >= 1440 ? 1 : 2 });
    const p = await ctx.newPage(); await p.route(/tradingview\.com/, r => r.abort());
    await p.goto(B); await p.waitForSelector('.plantilla'); await p.waitForTimeout(500);
    await p.screenshot({ path: f('01-portada'), fullPage: true });
    // plantilla → guardar → acceso → entrar (cartera válida guardada en cuenta)
    await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])');
    await p.click('.js-guardar >> visible=true'); await p.fill('#acc-email', `r4-${V}-${name}-${tema}-${Date.now()}@example.com`); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); const link = await p.getAttribute('#acc-dev a', 'href');
    await p.goto(link); await p.waitForFunction(() => (document.querySelector('#estado-live')||document.querySelector('#estado')).textContent.includes('Guard')); await p.waitForTimeout(1200);
    await p.screenshot({ path: f('02-editor-valido') });
    if (V === 'antes' ? w >= 768 : w >= 900) await p.screenshot({ path: f('02b-editor-valido-completo'), fullPage: true });
    else { await p.evaluate(() => { const bb = document.querySelector('#barra-guardar'); if (bb) bb.style.position = 'static'; }); await p.screenshot({ path: f('02b-editor-valido-completo'), fullPage: true }); await p.evaluate(() => { const bb = document.querySelector('#barra-guardar'); if (bb) bb.style.position = ''; }); }
    // composición inválida (103 %)
    await p.locator('.peso-in >> visible=true').first().fill('20'); await p.waitForTimeout(300);
    await p.evaluate(() => { const d = document.querySelector('#det-pub'); if (d) d.open = true; });
    await p.screenshot({ path: f('03-editor-invalido') });
    if (V === 'antes' ? w >= 768 : w >= 900) await p.screenshot({ path: f('03b-editor-invalido-completo'), fullPage: true });
    else if (w >= 768) { await p.evaluate(() => { const bb = document.querySelector('#barra-guardar'); if (bb) bb.style.position = 'static'; }); await p.screenshot({ path: f('03b-editor-invalido-completo'), fullPage: true }); await p.evaluate(() => { const bb = document.querySelector('#barra-guardar'); if (bb) bb.style.position = ''; }); }
    // Mis carteras
    await p.locator('.peso-in >> visible=true').first().fill('17'); await p.waitForTimeout(200);
    await p.click('.js-guardar >> visible=true'); await p.waitForTimeout(700);
    await p.goto(B + '#carteras'); await p.waitForSelector('#mis-lista .tarjeta'); await p.waitForTimeout(300);
    await p.screenshot({ path: f('04-mis-carteras') });
    // Explorar empresas
    await p.goto(B + '#empresas'); await p.waitForSelector('[data-t]'); await p.waitForTimeout(400);
    await p.screenshot({ path: f('05-explorar-empresas') });
    await p.locator('[data-t]').nth(2).click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(400);
    await p.screenshot({ path: f('06-ficha') });
    await ctx.close(); n++;
  }
  await b.close(); console.log('hecho', V, n, 'combinaciones');
})();
