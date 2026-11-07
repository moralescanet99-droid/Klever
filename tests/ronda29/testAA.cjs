// Batería AA (ronda 29, fase 2.5): arranque guiado, huella de empresa y «Tu semana» con retos. Servidor real, datos ficticios, 1440 / 390 / 320 px.
//   AA1 portada → «Empieza en 1 minuto» → «Que crezca a largo plazo» → «Todavía no»: abre la cartera de EJEMPLO (Crecimiento) ya en la revisión, con una señal visible
//   AA2 «Sí, quiero copiarla aquí» abre el editor vacío con el buscador listo para pegar · «Prefiero empezar de cero» también abre el editor vacío
//   AA3 huella en Explorar (una por empresa visible) y grande en la ficha, con texto accesible
//   AA4 «Tu semana» en Mis carteras: señal de cada cartera, ideas de la semana y retos con su avance; cambia «desde tu última visita» al día siguiente
//   AA0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    // ---- AA1
    await p.goto(B + '#inicio'); await p.waitForSelector('.hero'); await p.click('#probar'); await p.waitForSelector('#vista-empezar:not([hidden])'); await mira('empezar');
    const paso1 = await p.evaluate(() => ({ h1: document.querySelector('#onb-1 h1').textContent, ops: document.querySelectorAll('#onb-1 .onb-op').length, sello: document.querySelector('#vista-empezar .sello-b')?.textContent, foco: document.activeElement?.classList.contains('onb-op') }));
    await p.click('[data-interes="riesgo"]'); await p.waitForSelector('#onb-2:not([hidden])');
    await p.click('[data-tiene="no"]'); await p.waitForSelector('#vista-cartera[data-paso="3"]', { timeout: 10000 }); await p.waitForSelector('#nota-cuerpo .senal'); await p.waitForTimeout(300);
    const aa1 = await p.evaluate(() => ({ nombre: document.querySelector('#nombre').value, n: document.querySelectorAll('.peso-in').length, senal: document.querySelector('#nota-cuerpo .senal')?.textContent.trim(), indicadores: document.querySelectorAll('#nota-cuerpo .ind').length }));
    ev('AA1-' + w, `Arranque guiado (${w} px): dos preguntas y la cartera de ejemplo ya revisada`, 'pregunta 1 con 4 opciones y el sello «no es una recomendación»; tras «crecer» + «todavía no»: «Ejemplo simulado: crecimiento» con 6 posiciones, en la revisión, con señal e indicadores',
      J({ paso1, aa1 }), /Qué te interesa/.test(paso1.h1) && paso1.ops === 4 && /no es una recomendación/.test(paso1.sello) && /Ejemplo simulado: crecimiento/i.test(aa1.nombre) && aa1.n >= 6 && !!aa1.senal && aa1.indicadores === 3); await mira('revisión');
    // ---- AA2
    await p.evaluate(() => { localStorage.removeItem('klever_borrador'); location.hash = '#empezar'; }); await p.waitForSelector('#vista-empezar:not([hidden])'); await p.waitForTimeout(200);
    await p.click('[data-interes="dividendos"]'); await p.click('[data-tiene="si"]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(700);
    const copiar = await p.evaluate(() => ({ n: document.querySelectorAll('.peso-in').length, foco: document.activeElement?.id, pista: !!document.querySelector('.combo-pista') }));
    await p.evaluate(() => { location.hash = '#empezar'; }); await p.waitForSelector('#vista-empezar:not([hidden])'); await p.click('#onb-cero'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(300);
    const cero = await p.evaluate(() => document.querySelectorAll('.peso-in').length);
    ev('AA2-' + w, `Ya tengo cartera / empezar de cero (${w} px)`, '«Sí, quiero copiarla» → editor vacío con el foco en el buscador y la pista de pegar; «Prefiero empezar de cero» → editor vacío', J({ copiar, cero }), copiar.n === 0 && copiar.foco === 'buscar-activo' && copiar.pista && cero === 0);
    // ---- AA3 huella
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(500);
    const lista = await p.evaluate(() => { const h = [...document.querySelectorAll('#empresas-lista .huella, #empresas-cards .huella')].filter(x => x.getBoundingClientRect().width > 0); return { n: h.length, filas: [...document.querySelectorAll('#empresas-lista tr, #empresas-cards li.emp-card')].filter(x => x.getBoundingClientRect().width > 0).length, oculta: h[0]?.getAttribute('aria-hidden') }; });
    await p.locator('.ver-ficha[data-t="KO"] >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open] .ficha-huella'); await p.waitForTimeout(200);
    const ficha = await p.evaluate(() => { const s = document.querySelector('.ficha-huella svg'); return { label: s.getAttribute('aria-label'), sup: s.dataset.superadas, ancho: Math.round(s.getBoundingClientRect().width) }; });
    await p.click('#dlg-ficha [data-cerrar]');
    ev('AA3-' + w, `Huella de empresa (${w} px)`, 'una huella decorativa por empresa visible en la lista; en la ficha, grande y con texto accesible que dice cuántas supera', J({ lista, ficha }),
      lista.n === lista.filas && lista.n > 10 && lista.oculta === 'true' && /Huella de .*Coca.*de 5 comprobaciones superadas/.test(ficha.label) && Number(ficha.sup) >= 0 && ficha.ancho >= 120); await mira('explorar');
    // ---- AA4 Tu semana (con cuenta)
    await entrarCon(p, mail('AA' + w));
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Concentrada AA', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }] })).j, cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    await api(p, 'POST', '/escenarios', { clave: 'aa-' + w + '-' + Date.now(), nombre: 'Idea AA', cartera_id: c.id, base_revision: cart.revision, ticker: 'NVDA', peso: 20, financiacion: 'proporcional', propuesta: [{ ticker: 'NVDA', peso: 20 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }], revisar_en: iso(new Date()) });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#tu-semana:not([hidden]) .reto'); await p.waitForTimeout(300);
    const sem = await p.evaluate(() => ({ cart: [...document.querySelectorAll('.sem-cart')].map(a => a.textContent.replace(/\s+/g, ' ').trim()), tocan: document.querySelector('.sem-tocan')?.textContent.replace(/\s+/g, ' ').trim(), retos: document.querySelector('.retos-n').textContent, hechos: [...document.querySelectorAll('.reto.hecho b')].map(b => b.textContent), barra: document.querySelector('.retos-barra').getAttribute('aria-valuenow') }));
    await p.screenshot({ path: require('path').resolve(__dirname, '..', '..', process.env.RONDA || 'ronda29', 'evidencias', `AA4-semana-${w}.png`) }).catch(() => {});
    // «desde tu última visita»: se simula una instantánea de ayer con la señal de concentración por posición, y se baja NVDA
    await p.evaluate(() => { const g = JSON.parse(localStorage.getItem('klever_semana')); const d = new Date(Date.now() - 864e5); g.fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; delete g.anterior; localStorage.setItem('klever_semana', JSON.stringify(g)); });
    await api(p, 'PUT', '/portfolios/' + c.id, { nombre: 'Concentrada AA', tesis: '', posiciones: [{ ticker: 'NVDA', peso: 20 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }], revision: cart.revision });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#tu-semana:not([hidden]) .reto'); await p.waitForTimeout(300);
    const desde = await p.evaluate(() => ({ desde: document.querySelector('.sem-desde')?.textContent, cambios: [...document.querySelectorAll('.sem-cambios li')].map(l => l.textContent.replace(/\s+/g, ' ').trim()) }));
    ev('AA4-' + w, `«Tu semana» en Mis carteras (${w} px)`, 'la cartera con su señal; «1 idea para revisar esta semana · 1 hoy»; retos «1 de 5» (la idea guardada) y la barra a 1; al volver «al día siguiente» tras bajar NVDA, «Desde el …» con «✓ Ya no: NVDA pesa el 40 %»',
      J({ sem, desde }), sem.cart.some(t => /Concentrada AA/.test(t) && /Exposición alta: Tecnología|NVDA pesa/.test(t)) && /1 idea para revisar esta semana · 1 hoy/.test(sem.tocan) && sem.retos === '1 de 5' && sem.barra === '1' && sem.hechos.length === 1 && /alternativa/.test(sem.hechos[0])
      && /^Desde el/.test(desde.desde || '') && desde.cambios.some(t => /Ya no: NVDA pesa el 40 %/.test(t))); await mira('mis carteras');
    ev('AA0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún pageerror; ninguna vista más ancha que la ventana', J({ errs, desb }), errs.length === 0 && desb.length === 0);
    await p.ctx.close();
  }
  await b.close(); await fin('evidencias-AA29');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-AA29'); });
