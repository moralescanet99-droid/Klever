const { chromium, B, nuevo, entrar, peso } = require('./h.cjs');
const OUT = '/home/user/Klever/ronda5/despues/';
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h] of [['1440', 1440, 900], ['390', 390, 844]]) {
    const p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'P5' + name);
    await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Fondos de dividendos y empresas de consumo, salud y energía.');
    await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
    await peso(p).fill('25'); await p.waitForTimeout(250); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(250);
    await p.screenshot({ path: `${OUT}07-publica-edicion-invalida-${name}-claro.png` });
    await p.ctx.close();
  }
  await b.close();
})();
