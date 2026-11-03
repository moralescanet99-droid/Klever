// Mediciones comparables antes/después (px y caracteres). Uso: node tests/ronda10/medir.cjs antes|despues  → ronda10/medidas-<fase>.json
const { chromium, B, nuevo, entrar, peso } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const FASE = process.argv[2] || 'antes', OUT = path.resolve(__dirname, '..', '..', 'ronda10');
(async () => {
  const b = await chromium.launch(); const r = {};
  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 720; const m = r[w] = {};
    let p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'M' + w); await p.waitForTimeout(4600);
    Object.assign(m, await p.evaluate(() => { const txt = s => (document.querySelector(s)?.innerText || '').replace(/\s+/g, ' ').trim(), alto = s => Math.round(document.querySelector(s)?.getBoundingClientRect().height || 0);
      return { paginaEditor: Math.round(document.documentElement.scrollHeight), resumenAlto: alto('#res-detalle'), resumenTextoVisible: txt('#res-detalle').length, pieAlto: alto('.pie'), pieTextoVisible: txt('.pie').length, barraAlto: alto('#barra-guardar') }; }));
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300);
    Object.assign(m, await p.evaluate(() => ({ barraAlto200: Math.round(document.querySelector('#barra-guardar').getBoundingClientRect().height), vh: innerHeight })));
    await p.ctx.close();
    // solape del aviso con cabecera y controles (aviso tras pulsar la preferencia de cookies en «Mis carteras»)
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'N' + w); await p.waitForTimeout(4600); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item');
    await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); await p.waitForTimeout(600);
    Object.assign(m, await p.evaluate(() => { const t = document.querySelector('#toast').getBoundingClientRect(); const sol = [...document.querySelectorAll('.cab,.marca,h1,#btn-nueva,#btn-menu,#entrar,#salir,.menu a')].filter(e => e.offsetParent !== null).map(e => [e.id || e.className || e.tagName, e.getBoundingClientRect()]).filter(([n, q]) => q.width && q.height && q.left < t.right && q.right > t.left && q.top < t.bottom && q.bottom > t.top).map(([n]) => String(n).slice(0, 24));
      return { avisoTop: Math.round(t.top), avisoPosicion: getComputedStyle(document.querySelector('#toast')).position, avisoTapaControles: sol.length, avisoTapa: sol.join(',') }; }));
    await p.ctx.close();
  }
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, `medidas-${FASE}.json`), JSON.stringify(r, null, 1)); console.log(FASE, JSON.stringify(r)); await b.close();
})();
