// Batería AD (fase 1, ronda 33): el embudo anónimo desde el navegador y la hoja de estilo única. Servidor real.
//   AD1 primera visita del día: un único aviso «visita» (y nada con datos de la persona); al recargar el mismo día, ninguno
//   AD2 si la primera visita de este dispositivo fue hace 8 días: «visita» + «vuelve_7d»
//   AD3 la página carga una sola hoja de estilo y sus tokens se aplican (fondo carbón, fuente propia)
const { chromium, B, ev, nuevo, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch(), p = await nuevo(b, 390, 844), env = [];
  p.on('request', r => { if (/\/api\/evento$/.test(r.url())) env.push(r.postData()); });
  await p.goto(B); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  const primera = [...env]; env.length = 0; await p.reload(); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  ev('AD1', 'Primera visita del día y recarga', 'un solo POST {"evento":"visita"} sin más campos; al recargar el mismo día, ninguno', J({ primera, recarga: [...env] }), J(primera) === J(['{"evento":"visita"}']) && env.length === 0);
  env.length = 0; await p.evaluate(() => { const d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10); localStorage.setItem('klever_primera', d(8)); localStorage.setItem('klever_visita', d(1)); });
  await p.reload(); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  ev('AD2', 'Vuelve a los 7 días', '«visita» y «vuelve_7d»', J(env), J(env.map(x => JSON.parse(x).evento).sort()) === J(['visita', 'vuelve_7d']));
  const css = await p.evaluate(() => ({ hojas: [...document.styleSheets].filter(s => s.href).map(s => s.href.split('/').pop()), bg: [document.documentElement, document.body].map(e => getComputedStyle(e).backgroundColor).find(c => c !== 'rgba(0, 0, 0, 0)'), fuente: getComputedStyle(document.body).fontFamily.split(',')[0] }));
  ev('AD3', 'Hoja de estilo única con los tokens aplicados', 'solo klever.css; fondo carbón rgb(19, 16, 14); fuente «Inter Klever»', J(css), J(css.hojas) === J(['klever.css']) && css.bg === 'rgb(19, 16, 14)' && /Inter Klever/.test(css.fuente));
  await b.close(); fin('evidencias-AD33');
})();
