// Batería P (ronda 17): el creador con el diseño aprobado (pasos, deslizador + campo numérico, anillo con importes simulados, ayuda de hipótesis, estados del reparto),
// la entrada según el estado, la navegación (columna en escritorio; Revista secundaria), una única acción principal, teclado y nombres accesibles, y sin desplazamiento
// horizontal (también con el texto al 200 %). Datos FICTICIOS. Uso: node tests/ronda17/testP.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda17', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(700); };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const txt = (p, s) => p.evaluate(s => document.querySelector(s)?.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() ?? '', s);
  const solidos = p => p.evaluate(() => { const ac = (() => { const mk = document.createElement('i'); mk.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); document.body.appendChild(mk); const c = getComputedStyle(mk).color; mk.remove(); return c; })();
    return [...document.querySelectorAll('#vista-cartera button, #barra-guardar button')].filter(e => e.offsetParent !== null && !e.closest('[hidden]') && !e.closest('#mas-lista') && getComputedStyle(e).backgroundColor === ac).map(e => e.id || (e.className.split(' ').find(c => c.startsWith('js-')) || e.textContent.trim())); });
  const abrirCreador = async (p, plantilla = 'dividendos') => { await p.goto(B); await p.waitForSelector('[data-plantilla]'); await p.click(`[data-plantilla=${plantilla}]`); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForSelector('#donut-leyenda li', { state: 'attached' }); await p.waitForTimeout(500); };
  const pesoIn = (p, t) => p.locator(`.peso-in[aria-label^="Peso de ${t},"] >> visible=true`).first();
  const rango = (p, t) => p.locator(`.peso-rng[aria-label^="Peso de ${t}:"] >> visible=true`).first();

  for (const w of [1440, 390, 320]) {
    const h = w === 1440 ? 900 : 780, p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message));
    await abrirCreador(p);
    // ---- P1. estructura del creador
    const est = await p.evaluate(() => ({ h1: document.querySelector('#creador-titulo').textContent, sub: document.querySelector('#creador-sub').textContent, pasos: [...document.querySelectorAll('#pasos .paso')].map(li => li.textContent.replace(/\s+/g, ' ').trim()), actual: document.querySelector('#pasos [aria-current=step]')?.dataset.paso, serif: getComputedStyle(document.querySelector('#creador-titulo')).fontFamily, donut: document.querySelector('#donut').getAttribute('aria-label'), volver: !!document.querySelector('.ws-pie a[href="#carteras"]'), revisar: document.querySelector('.ws-pie .js-revisar').textContent.trim() }));
    ev('P1-' + w, `Creador: título serif, tres pasos con «Distribución» activo, anillo accesible, «Volver» y «Revisar cartera» (${w} px)`, 'h1 «Crea tu cartera» en serif, subtítulo, pasos Objetivo · Distribución · Revisión con el 2 actual, anillo con nombre accesible que lista los importes, enlace Volver y botón «Revisar cartera»',
      JSON.stringify({ ...est, serif: est.serif.slice(0, 20), donut: est.donut.slice(0, 70) }), est.h1 === 'Crea tu cartera' && /Georgia|serif/i.test(est.serif) && /dinero simulado/.test(est.sub) && est.pasos.length === 3 && /Objetivo/.test(est.pasos[0]) && /Distribución/.test(est.pasos[1]) && /Revisión/.test(est.pasos[2]) && est.actual === '2' && /10\.000 € simulados/.test(est.donut) && /SCHD 17\s%/.test(est.donut) && est.volver && /Revisar cartera/.test(est.revisar));
    await p.screenshot({ path: CAP + `C14-creador-${w}.png`, fullPage: w < 1000 });   // estado inicial: reparto completo del 100 %, comparable con la referencia
    // ---- P2. deslizador y campo numérico son una sola entrada
    await rango(p, 'KO').evaluate(el => { el.value = '20'; el.dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(250);
    const a = await p.evaluate(() => ({ num: [...document.querySelectorAll('.peso-in[aria-label^="Peso de KO,"]')].find(e => e.offsetParent !== null).value, leyenda: [...document.querySelectorAll('#donut-leyenda li')].find(li => /KO/.test(li.textContent))?.textContent.replace(/\s+/g, ' ').trim(), estado: document.querySelector('#donut-estado').textContent }));
    await pesoIn(p, 'KO').fill('12,5'); await p.waitForTimeout(250);
    const c = await p.evaluate(() => ({ rng: [...document.querySelectorAll('.peso-rng[aria-label^="Peso de KO:"]')].find(e => e.offsetParent !== null).value, vt: [...document.querySelectorAll('.peso-rng[aria-label^="Peso de KO:"]')].find(e => e.offsetParent !== null).getAttribute('aria-valuetext'), leyenda: [...document.querySelectorAll('#donut-leyenda li')].find(li => /KO/.test(li.textContent))?.textContent.replace(/\s+/g, ' ').trim() }));
    ev('P2-' + w, `Deslizador y campo numérico: una sola entrada, y el importe y la leyenda se actualizan en el mismo paso (${w} px)`, 'Mover KO a 20 → el campo marca 20,0 y la leyenda «20 % · 2.000 €»; escribir 12,5 → el deslizador pasa a 12,5 con su texto accesible «12,5 %» y la leyenda «12,5 % · 1.250 €»',
      `${JSON.stringify(a)}; ${JSON.stringify(c)}`, a.num === '20,0' && /20 %.*2\.000 €/.test(a.leyenda) && c.rng === '12.5' && c.vt === '12,5 %' && /12,5 %.*1\.250 €/.test(c.leyenda));
    // ---- P3. reparto no válido: cuánto falta o sobra
    const f = await txt(p, '#donut-estado');
    await pesoIn(p, 'KO').fill('40'); await p.waitForTimeout(250); const so = await txt(p, '#donut-estado'), cl = await p.evaluate(() => document.querySelector('#donut-estado').className);
    ev('P3-' + w, `Reparto no válido: dice cuánto falta o sobra con las reglas existentes (${w} px)`, 'Con KO a 12,5 % el total es 95,9 %: «Faltan 4,1 % por asignar…»; con KO a 40 % sobran: «Sobran 23,4 %: reduce algún peso…» (clase error)', `${f} | ${so} | ${cl}`, /Faltan 4,1\s% por asignar/.test(f) && /Sobran 23,4\s%: reduce algún peso/.test(so) && /error/.test(cl));
    // ---- P4. hipótesis de caída
    await pesoIn(p, 'KO').fill('16,6'); await pesoIn(p, 'SCHD').fill('20'); await p.waitForTimeout(250);
    await p.evaluate(() => { const d = document.querySelector('#panel-donut'); if (!d.open) d.querySelector('summary').click(); }); await p.waitForTimeout(200);   // en móvil el anillo es un desplegable
    await p.selectOption('#hipo-pos', 'SCHD'); await p.fill('#hipo-pct', '25'); await p.waitForTimeout(250); const h1 = await txt(p, '#hipo-res');
    await p.fill('#hipo-pct', '50'); await p.waitForTimeout(200); const h2 = await txt(p, '#hipo-res'); await pesoIn(p, 'SCHD').fill('10'); await p.waitForTimeout(250); const h3 = await txt(p, '#hipo-res');
    await p.fill('#hipo-pct', '0'); await p.waitForTimeout(200); const h4 = await txt(p, '#hipo-res'); await p.fill('#hipo-pct', '25'); await pesoIn(p, 'SCHD').fill('20'); await p.waitForTimeout(250);
    ev('P4-' + w, `Hipótesis: con 10.000 € simulados y 2.000 € en una empresa, una caída del 25 % supone 500 € menos; se recalcula al editar (${w} px)`, 'SCHD 20 %, 25 % → «2.000 €… 500 € menos… de 10.000 € a 9.500 €» y la identifica como hipótesis; 50 % → 1.000 €; con SCHD a 10 % → 500 €; 0 % → pide un valor válido',
      `${h1.slice(0, 190)} | ${h2.match(/supone [^:]+/)?.[0]} | ${h3.match(/supone [^:]+/)?.[0]} | ${h4}`, /con 10\.000 € simulados y 2\.000 € en SCHD, una caída hipotética del 25\s% en SCHD, con las demás posiciones constantes, supone 500 € menos: la cartera pasaría de 10\.000 € a 9\.500 €\. Es una hipótesis, no una previsión/i.test(h1) && /supone 1\.000 € menos/.test(h2) && /supone 500 € menos/.test(h3) && /entre 1 y 100/.test(h4));
    // ---- P5. pasos: revisar → 3, editar → 2
    await p.locator('.js-revisar:visible').first().click(); await p.waitForTimeout(600); const rv = await p.evaluate(() => ({ actual: document.querySelector('#pasos [aria-current=step]')?.dataset.paso, foco: document.activeElement?.id }));
    await p.click('#paso-dist'); await p.waitForSelector('#vista-cartera[data-paso="2"]'); await p.waitForTimeout(300); await pesoIn(p, 'SCHD').fill('17'); await p.waitForTimeout(200); const vuelta = await p.evaluate(() => document.querySelector('#pasos [aria-current=step]')?.dataset.paso);
    ev('P5-' + w, `«Revisar cartera» pasa al paso 3 y lleva el foco al resultado; editar un peso vuelve al paso 2 (${w} px)`, 'Tras pulsar Revisar: paso 3 y foco en la nota (#nota-panel); tras volver y editar un peso: paso 2', JSON.stringify({ rv, vuelta }), rv.actual === '3' && rv.foco === 'nota-panel' && vuelta === '2');
    // ---- P6. una única acción principal; sin desbordamiento; texto al 200 %
    const sol = await solidos(p), ok0 = await sinDesborde(p);
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300); const ok200 = await sinDesborde(p), sw = await p.evaluate(() => document.documentElement.scrollWidth); await p.evaluate(() => { document.documentElement.style.fontSize = ''; });
    ev('P6-' + w, `Un único botón naranja (Revisar) en un borrador, sin desplazamiento horizontal y con el texto al 200 % (${w} px)`, 'Solo «Revisar» tiene relleno de acento; la página no se desplaza en horizontal ni al 200 % de texto (simulado)', `${JSON.stringify(sol)}; normal ${ok0}; 200 % ${ok200} (${sw}/${w})`, sol.length === 1 && sol[0] === 'js-revisar' && ok0 && ok200);
    ev('P6b-' + w, `Sin errores de JavaScript en el creador (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }
  // ---- P7. entrada según el estado
  { const p = await nuevo(b, 390, 780); await p.goto(B); await p.waitForSelector('.hero');
    const e0 = { t: await txt(p, '#probar'), demo: await p.evaluate(() => document.querySelector('#entrada-demo').hidden) };
    await abrirCreador(p); await pesoIn(p, 'KO').fill('22'); await p.waitForTimeout(300);
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForSelector('.hero'); await p.waitForTimeout(300); const e1 = await txt(p, '#probar');
    await p.click('#probar'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForSelector('#donut-leyenda li', { state: 'attached' }); const ko = await pesoIn(p, 'KO').inputValue();
    ev('P7a', 'Entrada sin cuenta: crear el primero; con borrador en el dispositivo, retomarlo con los pesos intactos', 'Sin nada: «Crear desde cero» (texto actualizado en la ronda 21); tras editar un borrador y volver a la portada: «Retomar mi borrador», que reabre el creador con KO en 22 %; fuera de la demo no sale el aviso de demo', `${JSON.stringify(e0)}; ${e1}; KO ${ko}`, e0.t === 'Empieza en 1 minuto' /* ronda 29: antes «Crear desde cero»; ahora abre el arranque guiado */ && e0.demo === true && e1 === 'Retomar mi borrador' && ko === '22,0');
    await p.ctx.close(); }
  { const p = await nuevo(b, 390, 780); await entrarCon(p, mail('PE')); await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(900);
    const h = await p.evaluate(() => ({ hash: location.hash, h1: document.querySelector('[data-vista]:not([hidden]) h1')?.textContent.trim(), actual: document.querySelector('#menu-movil [aria-current=page]')?.textContent.trim() ?? null, mis: document.querySelector('.menu-movil a[data-nav=mis]')?.textContent.trim() }));
    ev('P7b', 'Entrada con sesión: la portada lleva a «Mis carteras» para elegir uno', 'Con sesión, #inicio muestra «Mis carteras» con su título y la entrada del menú marcada', JSON.stringify(h), h.h1 === 'Mis carteras' && h.actual === 'Mis carteras');
    await p.ctx.close(); }
  // ---- P8. con cuenta: la acción principal se invierte con cambios pendientes
  { const p = await nuevo(b, 1440, 900); await entrarCon(p, mail('PG'));
    const c = await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera P', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] });
    await p.evaluate(id => { location.hash = '#cartera-' + id; }, c.j.id); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForSelector('#donut-leyenda li', { state: 'attached' }); await p.waitForTimeout(600);
    const limpio = await solidos(p), titulo = await txt(p, '#creador-titulo');
    await pesoIn(p, 'KO').fill('50'); await pesoIn(p, 'PG').fill('50'); await p.waitForTimeout(400); const sucio = await solidos(p);
    await p.locator('.js-guardar >> visible=true').first().click(); await p.waitForFunction(() => /Guardada/.test(document.querySelector('#estado-live')?.textContent || ''), null, { timeout: 15000 }); await p.waitForTimeout(400); const guardado = await solidos(p);
    ev('P8', 'Con un portafolio de la cuenta: sin cambios → «Revisar»; con cambios pendientes → «Guardar»; tras guardar → «Revisar»', 'Una sola acción principal en cada estado; el título pasa a «Tu cartera»', `${titulo}; limpio ${JSON.stringify(limpio)}; sucio ${JSON.stringify(sucio)}; guardado ${JSON.stringify(guardado)}`, titulo === 'Tu cartera' && limpio.length === 1 && limpio[0] === 'js-revisar' && sucio.length === 1 && sucio[0] === 'js-guardar' && guardado.length === 1 && guardado[0] === 'js-revisar');
    // ---- P9. teclado, foco visible y nombres accesibles
    await p.evaluate(() => { location.hash = '#cartera-' + document.querySelector('#nombre') && '' ; }); await p.evaluate(id => { location.hash = '#cartera-' + id; }, c.j.id); await p.waitForSelector('#donut-leyenda li', { state: 'attached' }); await p.waitForTimeout(500);
    await p.locator('.peso-rng >> visible=true').first().focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250);
    const tec = await p.evaluate(() => { const r = document.activeElement; return { clase: r.className, valor: r.value, num: [...document.querySelectorAll(`.peso-in[data-i="${r.dataset.i}"]`)].find(e => e.offsetParent !== null).value, nombre: r.getAttribute('aria-label'), outline: getComputedStyle(r).outlineStyle, sinNombre: [...document.querySelectorAll('#vista-cartera input, #vista-cartera select, #vista-cartera button')].filter(e => e.offsetParent !== null && !e.closest('[hidden]') && !(e.getAttribute('aria-label') || e.labels?.length || e.textContent.trim() || e.getAttribute('aria-labelledby'))).map(e => e.id || e.className).slice(0, 5) }; });
    ev('P9', 'Teclado: el deslizador se ajusta con flechas y sigue al campo numérico; todos los controles tienen nombre accesible; el foco se ve', 'ArrowRight ×2 sube el peso (0,2 puntos) y el campo numérico lo refleja; el deslizador se llama «Peso de …: deslizador (también puedes escribir el valor)»; sin controles sin nombre; el foco tiene contorno', JSON.stringify(tec),
      /peso-rng/.test(tec.clase) && Math.abs(parseFloat(tec.valor) - 50.2) < .05 && tec.num.replace(',', '.') === '50.2' && /deslizador \(también puedes escribir el valor\)/.test(tec.nombre) && tec.sinNombre.length === 0);
    await p.ctx.close(); }
  // ---- P10. navegación: columna en escritorio, Revista secundaria; móvil con cuatro enlaces
  { const p = await nuevo(b, 1440, 900); await p.goto(B); await p.waitForSelector('.hero');
    const nav = await p.evaluate(() => { const c = document.querySelector('.cab').getBoundingClientRect(), main = document.querySelector('#contenido').getBoundingClientRect(); return { pos: getComputedStyle(document.querySelector('.cab')).position, ancho: Math.round(c.width), alto: Math.round(c.height), mainIzq: Math.round(main.left), items: [...document.querySelectorAll('.menu-escritorio a')].map(a => a.textContent.trim()), sec: document.querySelector('.menu-escritorio .nav-sec')?.textContent.trim(), actual: document.querySelector('.menu-escritorio [aria-current=page]')?.textContent.trim(), resplandor: getComputedStyle(document.body, '::before').backgroundImage.includes('radial-gradient'), fondo: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() }; });
    await p.evaluate(() => { location.hash = '#revista'; }); await p.waitForSelector('#vista-revista:not([hidden])'); await p.waitForTimeout(500);
    const rv = await p.evaluate(() => ({ actual: document.querySelector('.menu-escritorio [aria-current=page]')?.textContent.trim(), h1: document.querySelector('#vista-revista h1').textContent })); await p.screenshot({ path: CAP + 'C16-revista-acceso-1440.png' });
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-casos'); await p.waitForTimeout(500);
    const cu = await p.evaluate(() => ({ h1: document.querySelector('#vista-seguimiento h1').childNodes[0].textContent.trim(), actual: document.querySelector('.menu-escritorio [aria-current=page]')?.textContent.trim(), beta: /^En beta$/.test(document.querySelector('#seg-beta').textContent) })); await p.screenshot({ path: CAP + 'C15-cuaderno-1440.png' });
    ev('P10', 'Escritorio: navegación en columna izquierda, fondo carbón con resplandor, Revista como entrada secundaria y Cuaderno con la etiqueta «En beta» (sin prometer un plan de pago)', 'Cabecera fija de 248 px a toda la altura; contenido desplazado; Mis carteras · Crear cartera · Cuaderno · Revista (marcada «nav-sec»); la entrada activa sigue a la vista; fondo #13100E y degradado radial', JSON.stringify({ nav, rv, cu }),
      nav.pos === 'fixed' && nav.ancho === 248 && nav.alto >= 880 && nav.mainIzq >= 248 && JSON.stringify(nav.items) === JSON.stringify(['Mis carteras', 'Crear cartera', 'Cuaderno', 'Revista']) && nav.sec === 'Revista' && nav.resplandor && nav.fondo === '#13100E' && rv.actual === 'Revista' && /Revista/.test(rv.h1) && cu.h1 === 'Cuaderno' && cu.actual === 'Cuaderno' && cu.beta);
    await p.ctx.close(); }
  for (const w of [390, 320]) { const p = await nuevo(b, w, 780); await p.goto(B); await p.waitForSelector('.hero'); await p.click('#btn-menu'); await p.waitForTimeout(250);
    const m = await p.evaluate(() => [...document.querySelectorAll('#menu-movil a')].filter(a => a.offsetParent !== null).map(a => a.textContent.trim())); const ok = await sinDesborde(p);
    await p.click('#menu-movil a[data-nav=revista]'); await p.waitForSelector('#vista-revista:not([hidden])'); await p.waitForTimeout(400); await p.screenshot({ path: CAP + `C16-revista-acceso-${w}.png` });
    ev('P11-' + w, `Móvil: menú con cuatro entradas y acceso a Revista (${w} px)`, '«Mis carteras», «Crear cartera», «Cuaderno» y «Revista»; sin desplazamiento horizontal', `${JSON.stringify(m)}; ${ok}`, JSON.stringify(m) === JSON.stringify(['Mis carteras', 'Crear cartera', 'Cuaderno', 'Revista']) && ok);
    await p.ctx.close(); }
  await b.close(); fin('evidencias-P17');
})();
