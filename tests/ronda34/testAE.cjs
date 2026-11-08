// Batería AE (fase 2, ronda 34): pantalla «Hoy». Servidor real, 1440 / 390 / 320 px.
//   AE1 tras entrar, «Hoy» muestra la cartera principal (la última tocada con posiciones) en grande: anillo, dos semáforos, señal y UNA acción principal
//   AE2 «Ver qué cambiaría» abre el laboratorio con la hipótesis ya simulada
//   AE3 la pestaña / el menú se llaman «Hoy»; debajo siguen «Tu semana» y «Tus carteras»
//   AE4 al salir, la tarjeta de «Hoy» desaparece (es privada)
//   AE0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, ruta, body]);
  for (const [w, h] of [[1440, 900], [390, 844], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', mail('AE' + w)); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForTimeout(800);
    await api(p, 'POST', '/portfolios', { nombre: 'Repartida AE', plantilla: 'riesgo', posiciones: [{ ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }, { ticker: 'NVDA', peso: 20 }, { ticker: 'JPM', peso: 20 }] });
    await p.waitForTimeout(1100);   // la segunda se crea después: es la última tocada
    await api(p, 'POST', '/portfolios', { nombre: 'Concentrada AE', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }] });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#hoy-hero:not([hidden]) .hoy-anillo'); await p.waitForTimeout(400);
    const hoy = await p.evaluate(() => { const e = document.querySelector('#hoy-hero'); return { nombre: e.querySelector('.hoy-nombre').textContent, tramos: e.querySelectorAll('.hoy-anillo g circle').length - 1, ind: [...e.querySelectorAll('.hoy-i')].map(i => i.textContent.replace(/\s+/g, ' ').trim()), senal: e.querySelector('.hoy-senal')?.textContent.trim(), primarios: e.querySelectorAll('.btn-primario').length, accion: e.querySelector('.btn-primario')?.textContent.trim(), orden: [...document.querySelectorAll('#vista-carteras > section, #vista-carteras > h2, #vista-carteras > ul')].map(x => x.id).filter(Boolean) }; });
    ev('AE1-' + w, `«Hoy»: la cartera principal en grande (${w} px)`, '«Concentrada AE» (la última tocada); anillo de 4 tramos; Concentración y Variedad; señal; UN botón principal «Ver qué cambiaría»', J(hoy),
      hoy.nombre === 'Concentrada AE' && hoy.tramos === 4 && hoy.ind.length === 2 && /Concentración/.test(hoy.ind[0]) && !!hoy.senal && hoy.primarios === 1 && /Ver qué cambiaría/.test(hoy.accion));
    await mira('hoy');
    const nav = await p.evaluate(() => ({ h1: document.querySelector('#vista-carteras h1').textContent, menu: [...document.querySelectorAll('.menu-escritorio a, #menu-movil a')].map(a => a.textContent.trim()).filter(t => t === 'Hoy').length, tab: document.querySelector('.tabbar a[data-tab="mis"]').textContent.trim(), semana: !document.querySelector('#tu-semana').hidden, lista: document.querySelector('#hoy-lista-t')?.textContent, items: document.querySelectorAll('.cartera-item').length, titulo: document.title }));
    ev('AE3-' + w, `Nombre «Hoy» y lo que hay debajo (${w} px)`, 'título «Hoy», menú y pestaña «Hoy», título de la página «Klever · Hoy»; «Tu semana» y «Tus carteras» (2) debajo', J(nav), nav.h1 === 'Hoy' && nav.menu === 2 && nav.tab === 'Hoy' && nav.semana && nav.lista === 'Tus carteras' && nav.items === 2 && nav.titulo === 'Klever · Hoy');
    await p.click('#hoy-hero .btn-primario'); await p.waitForSelector('#lab-res', { timeout: 10000 }); await p.waitForTimeout(800);
    const lab = await p.evaluate(() => ({ hash: location.hash, ticker: document.querySelector('#lab-ticker')?.value, peso: document.querySelector('#lab-peso')?.value, res: !!document.querySelector('#lab-res .delta-grid, #lab-res table') }));
    ev('AE2-' + w, `«Ver qué cambiaría» abre el laboratorio ya simulado (${w} px)`, '#laboratorio con NVDA y un peso menor que 40, y el resultado a la vista', J(lab), lab.hash === '#laboratorio' && lab.ticker === 'NVDA' && Number(lab.peso) < 40 && lab.res);
    await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#hoy-hero:not([hidden])');
    await p.evaluate(() => (document.querySelector('#salir:not([hidden])') || document.querySelector('#salir-m')).click()); await p.waitForTimeout(800);
    const tras = await p.evaluate(() => ({ oculta: document.querySelector('#hoy-hero').hidden, vacia: !document.querySelector('#hoy-hero').textContent.trim(), nombre: document.body.innerText.includes('Concentrada AE') }));
    ev('AE4-' + w, `Al salir, «Hoy» se vacía (${w} px)`, 'oculta y vacía; sin el nombre de la cartera en la página', J(tras), tras.oculta && tras.vacia && !tras.nombre);
    ev('AE0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún error; ancho = ventana', J({ errs, desb }), !errs.length && !desb.length);
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-AE34');
})();
