// Batería AF (fase 2, ronda 35): RUEDA DE ESFERAS en la portada y RUEDA DE LA TEMPORADA + frase con iconos en «Hoy». Servidor real, 1440 / 390 / 320 px.
//   AF1 portada: rueda con 9 empresas conocidas; la del centro muestra «N/5» (comprobaciones superadas, no rentabilidad) y una frase corta
//   AF2 se maneja con el teclado: flechas cambian la del centro; Intro abre la hoja de cristal con la huella; Escape la cierra
//   AF3 «Probar en una cartera» desde la hoja abre el laboratorio con esa empresa
//   AF4 «Hoy»: frase con iconos y rueda de la temporada (una esfera por semana con foto)
//   AF5 «reducir movimiento»: la rueda no transforma sus esferas (es una lista quieta)
//   AF0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    await p.goto(B); await p.waitForSelector('#rueda-portada .rueda-item'); await p.waitForTimeout(1800);
    const r1 = await p.evaluate(() => ({ n: document.querySelectorAll('#rueda-portada .orbe').length, centro: document.querySelector('#rueda-portada .rueda-item.centro .orbe-et')?.textContent, cifra: document.querySelector('#rueda-portada .rd-cifra').textContent, frase: document.querySelector('#rueda-portada .rd-frase').textContent, eti: document.querySelector('#rueda-portada .rd-eti').textContent, aria: document.querySelector('#rueda-portada .rueda-pista').getAttribute('aria-activedescendant') }));
    ev('AF1-' + w, `Portada: rueda de esferas (${w} px)`, '9 esferas; la del centro con «N/5», el nombre y sector y una frase; sin «%» ni «rentabilidad»', J(r1),
      r1.n === 9 && /^[0-5]\/5$/.test(r1.cifra) && !!r1.centro && /·/.test(r1.eti) && !!r1.frase && !/%|rentab/i.test(r1.cifra + r1.frase) && /-o\d$/.test(r1.aria || ''));
    await mira('portada');
    await p.focus('#rueda-portada .rueda-pista'); const antes = r1.centro;
    await p.keyboard.press('ArrowDown'); await p.waitForTimeout(700);
    const tras = await p.evaluate(() => document.querySelector('#rueda-portada .rueda-item.centro .orbe-et')?.textContent);
    await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    const hoja = await p.evaluate(() => { const hj = document.querySelector('#rueda-portada .rueda-hoja'); return { abierta: !hj.hidden, huella: !!hj.querySelector('svg.huella[role="img"]'), t: hj.querySelector('.rh-t')?.textContent }; });
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    const cerrada = await p.evaluate(() => document.querySelector('#rueda-portada .rueda-hoja').hidden);
    ev('AF2-' + w, `La rueda con el teclado (${w} px)`, 'flecha abajo cambia la del centro; Intro abre la hoja con la huella accesible; Escape la cierra', J({ antes, tras, hoja, cerrada }), tras && tras !== antes && hoja.abierta && hoja.huella && hoja.t.includes(tras) && cerrada);
    await p.keyboard.press('Enter'); await p.waitForTimeout(400); await p.click('#rueda-portada [data-probar-emp]'); await p.waitForSelector('#lab-ticker', { timeout: 10000 }); await p.waitForTimeout(400);
    const lab = await p.evaluate(() => ({ hash: location.hash, t: document.querySelector('#lab-ticker').value }));
    ev('AF3-' + w, `«Probar en una cartera» desde la rueda (${w} px)`, `laboratorio con ${tras}`, J(lab), lab.hash === '#laboratorio' && lab.t === tras);
    // «Hoy»
    await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', mail('AF' + w)); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForTimeout(800);
    await p.evaluate(async () => { await fetch('/api/portfolios', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ nombre: 'Cartera AF', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'KO', peso: 30 }, { ticker: 'JNJ', peso: 30 }] }) }); });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#hoy-temporada:not([hidden]) .rueda-item', { timeout: 15000 }); await p.waitForTimeout(600);
    const hoy = await p.evaluate(() => ({ frase: document.querySelector('#hoy-frase').textContent.replace(/\s+/g, ' ').trim(), iconos: document.querySelectorAll('#hoy-frase svg.ico').length, esferas: document.querySelectorAll('#hoy-temporada .orbe').length, cifra: document.querySelector('#hoy-temporada .rd-cifra').textContent }));
    ev('AF4-' + w, `«Hoy»: frase con iconos y rueda de la temporada (${w} px)`, '«Tu cartera reparte en 3 categorías y estrena su temporada esta semana» con 2 iconos; una esfera (esta semana) con su nivel de concentración', J(hoy),
      /^Tu cartera reparte en 3 categorías y estrena su temporada esta semana\.$/.test(hoy.frase) && hoy.iconos === 2 && hoy.esferas === 1 && /^(Baja|Media|Alta)$/.test(hoy.cifra));
    await mira('hoy');
    ev('AF0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún error; ancho = ventana', J({ errs, desb }), !errs.length && !desb.length);
    await p.ctx.close();
  }
  { const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }), p = await c.newPage(); await p.route(/tradingview\.com/, r => r.abort());
    await p.goto(B); await p.waitForSelector('#rueda-portada .rueda-item'); await p.waitForTimeout(800);
    const q = await p.evaluate(() => ({ trans: [...document.querySelectorAll('#rueda-portada .rueda-item')].filter(li => li.style.transform).length, anims: document.getAnimations().filter(a => a.playState === 'running').length }));
    ev('AF5', '«Reducir movimiento»: la rueda queda quieta', 'ninguna esfera transformada ni animaciones en marcha', J(q), q.trans === 0 && q.anims === 0); await c.close(); }
  await b.close(); fin('evidencias-AF35');
})();
