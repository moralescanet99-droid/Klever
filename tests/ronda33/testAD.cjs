// Batería AD (fase 1, ronda 33): el embudo anónimo desde el navegador y la hoja de estilo única. Servidor real.
//   AD1 cada carga avisa una «visita» y no se guarda nada en el dispositivo (ronda 36)
//   AD2 llegar con ?ref=compartir avisa también «visita_enlace» (ronda 36)
//   AD3 la página carga una sola hoja de estilo y sus tokens se aplican (fondo carbón, fuente propia)
const { chromium, B, ev, nuevo, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch(), p = await nuevo(b, 390, 844), env = [];
  p.on('request', r => { if (/\/api\/evento$/.test(r.url())) env.push(r.postData()); });
  // ronda 36: el embudo ya NO guarda fechas en el dispositivo (LSSI art. 22.2): «visita» en cada carga; «vuelve_7d» se calcula en el servidor
  await p.goto(B); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  const primera = [...env]; env.length = 0; await p.reload(); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  const guardado = await p.evaluate(() => [localStorage.getItem('klever_visita'), localStorage.getItem('klever_primera')]);
  ev('AD1', 'Cada carga avisa una «visita» y no se guarda nada en el dispositivo', 'un POST {"evento":"visita"} por carga (sin más campos); ni «klever_visita» ni «klever_primera» en el almacenamiento', J({ primera, recarga: [...env], guardado }), J(primera) === J(['{"evento":"visita"}']) && J(env) === J(['{"evento":"visita"}']) && guardado.every(x => x === null));
  env.length = 0; await p.goto(B + '?ref=compartir'); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
  ev('AD2', 'Llegar desde un enlace compartido', '«visita» y «visita_enlace»', J(env), J(env.map(x => JSON.parse(x).evento).sort()) === J(['visita', 'visita_enlace']));
  const css = await p.evaluate(() => ({ hojas: [...document.styleSheets].filter(s => s.href).map(s => s.href.split('/').pop()), bg: [document.documentElement, document.body].map(e => getComputedStyle(e).backgroundColor).find(c => c !== 'rgba(0, 0, 0, 0)'), fuente: getComputedStyle(document.body).fontFamily.split(',')[0] }));
  ev('AD3', 'Hoja de estilo única con los tokens aplicados', 'solo klever.css; fondo carbón rgb(19, 16, 14); fuente «Inter Klever»', J(css), J(css.hojas) === J(['klever.css']) && css.bg === 'rgb(19, 16, 14)' && /Inter Klever/.test(css.fuente));
  await b.close(); fin('evidencias-AD33');
})();
