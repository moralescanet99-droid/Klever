// Capturas COMPARABLES antes/después del pulido visual de la ronda 10. Uso: node tests/ronda10/capturas.cjs antes|despues
// Misma batería en ambas fases; ficheros ronda10/capturas/<fase>-<id>-<ancho>.png. Zoom y teclado son SIMULACIONES (tamaño de texto / ventana reducida).
const { chromium, B, nuevo, entrar, peso } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const FASE = process.argv[2] || 'antes', OUT = path.resolve(__dirname, '..', '..', 'ronda10', 'capturas') + path.sep; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const lista = [];
  const shot = async (p, id, w, extra = {}) => { const f = `${FASE}-${id}-${w}.png`; await p.screenshot({ path: OUT + f, ...extra }); lista.push(f); };
  const G = p => p.locator('.js-guardar >> visible=true');
  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 720;
    // ---- 1. Notificación de guardado, en el editor: a mitad de animación, completa y tras desplazarse
    let p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'V' + w);
    await peso(p).fill('15'); await p.waitForTimeout(150); await G(p).click(); await p.waitForSelector('#toast.on', { timeout: 5000 });
    await p.waitForTimeout(60); await shot(p, 'N1-guardado-inicio', w); await p.waitForTimeout(500); await shot(p, 'N2-guardado-completo', w);
    await p.waitForTimeout(4500);
    await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(150); await peso(p).fill('14'); await p.waitForTimeout(150);
    await G(p).click(); await p.waitForSelector('#toast.on', { timeout: 5000 }); await p.waitForTimeout(700); await shot(p, 'N3-guardado-desplazado', w);
    await p.ctx.close();
    // ---- 2. Notificación sobre «Mis carteras» (la preferencia de cookies del pie dispara un aviso corto)
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'W' + w); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item');
    await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); await p.waitForTimeout(700); await shot(p, 'N4-mis-carteras', w);
    await p.ctx.close();
    // ---- 3. Errores: guardado fallido (estado persistente) y ficha que no carga (aviso)
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'X' + w); await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error');
    await peso(p).fill('20'); await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue()); await p.waitForTimeout(150);
    await G(p).click(); await p.waitForTimeout(900); await shot(p, 'E1-guardado-fallido-titulo-largo', w);
    await p.waitForTimeout(5200); await shot(p, 'E2-guardado-fallido-5s-despues', w);
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort());
    await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForTimeout(900); await shot(p, 'E3-ficha-no-carga', w);
    await p.waitForTimeout(5200); await shot(p, 'E4-ficha-no-carga-5s-despues', w);
    await p.ctx.close();
    // ---- 4. Resumen de ROIC y cobertura (editor)
    p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'Y' + w);
    await p.evaluate(() => document.querySelector('#res-detalle').scrollIntoView({ block: 'start' })); await p.waitForTimeout(250); await shot(p, 'R1-resumen-roic', w);
    await p.locator('#res-detalle').screenshot({ path: OUT + `${FASE}-R2-resumen-roic-completo-${w}.png` }); lista.push(`${FASE}-R2-resumen-roic-completo-${w}.png`);
    await p.ctx.close();
    // ---- 5. Móvil/escritorio: editor entero y pie
    p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'Z' + w);
    await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'M1-editor-arriba', w);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(200); await shot(p, 'M2-editor-abajo-pie', w);
    await p.screenshot({ path: OUT + `${FASE}-M3-editor-pagina-completa-${w}.png`, fullPage: true }); lista.push(`${FASE}-M3-editor-pagina-completa-${w}.png`);
    await p.ctx.close();
  }
  console.log(FASE + ': ' + lista.length + ' capturas en ronda10/capturas/'); await b.close();
})();
