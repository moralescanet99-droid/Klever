// Batería V (ronda 26): la EVOLUCIÓN VISUAL E INTERACTIVA sobre el servidor real (D1 local, datos ficticios). Se comprueba comportamiento, no frases largas:
//   V1 portada: propuesta «antes de invertir», recorrido de 5 pasos y el ejemplo interactivo ANTES de las tres entradas en móvil · V2 revisión: exposición por categoría y señales
//   (detalle al pulsar) · V3 «Ver qué cambiaría» abre el laboratorio con la comparación YA calculada sobre un activo que ya está, sin tocar la cartera · V4 el deslizador recalcula al instante
//   sin mover el foco y el hueco liberado se ve como «libre» · V5 «Descubre otras categorías» lleva a Explorar con ese filtro (sin elegir empresa) · V6 Cuaderno con resumen de cifras
//   leídas · V7 «Mis portafolios» con la señal principal · V0 sin errores ni desbordes. En 1440, 390 y 320 px. Uso: node tests/ronda26/testV.cjs
const { chromium, B, ev, nuevo, mail, fin, revision } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', process.env.RONDA || 'ronda26', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify, N = s => (s || '').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
    // ---- V1 portada
    await p.goto(B + '#inicio'); await p.waitForSelector('.hero'); await p.waitForSelector('#prev .prev'); await p.waitForTimeout(300);
    const port = await p.evaluate(() => { const top = s => document.querySelector(s).getBoundingClientRect().top;
      return { lead: document.querySelector('.hero .lead').textContent, pasos: [...document.querySelectorAll('.recorrido li')].map(l => l.textContent.trim()), prevAntes: top('#prev') < top('.entradas'), desb: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    await p.screenshot({ path: CAP + `V1-portada-${w}.png` });
    ev('V1-' + w, `Portada (${w} px): propuesta «compara… antes de invertir» con «sin dinero real», recorrido Cartera→Descubre→Compara→Decide→Revisa y, en móvil, el ejemplo interactivo antes de las tres entradas`, 'lead con «antes de invertir» y «sin dinero real»; 5 pasos en orden; en < 960 px #prev queda por encima de .entradas; sin desborde', J(port),
      /antes de invertir/.test(port.lead) && /sin dinero real/.test(port.lead) && J(port.pasos) === J(['Cartera', 'Descubre', 'Compara', 'Decide', 'Revisa']) && (w >= 960 || port.prevAntes) && port.desb);

    // ---- cuenta con una cartera concentrada (Tecnología 60 %, NVDA 40 %) y otra repartida
    await entrarCon(p, mail('V' + w));
    const conc = (await api(p, 'POST', '/portfolios', { nombre: 'Concentrada V', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'AMZN', peso: 15 }, { ticker: 'KO', peso: 15 }, { ticker: 'JNJ', peso: 10 }] })).j;
    const antes = J((await api(p, 'GET', '/portfolios/' + conc.id)).j.posiciones.map(x => [x.ticker, x.peso]).sort());
    await p.evaluate(i => { location.hash = '#cartera-' + i; }, conc.id); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 5); await p.waitForTimeout(400);
    await revision(p); await p.waitForSelector('#nota-cuerpo .senal'); await p.waitForTimeout(300);
    const rv = await p.evaluate(() => ({ senales: [...document.querySelectorAll('#nota-cuerpo .senal')].map(s => [s.textContent.trim(), s.className.match(/senal-(\w+)/)[1], s.getAttribute('aria-pressed')]), barra: document.querySelectorAll('.vz-expo-barra i').length, ley: (document.querySelector('.vz-expo-ley')?.textContent || '').replace(/\s+/g, ' '), det: getComputedStyle(document.querySelector('.senal-det')).display, hipo: document.querySelector('.vz-hipo')?.textContent }))
      .catch(e => ({ error: e.message }));
    await p.screenshot({ path: CAP + `V2-revision-${w}.png` });
    // la explicación de la señal aparece al pulsarla (información progresiva; así el resultado de la nota sigue a la vista al abrir la revisión)
    await p.click('#nota-cuerpo .senal >> nth=1'); await p.waitForTimeout(200);
    const tras = await p.evaluate(() => ({ pulsada: document.querySelector('#nota-cuerpo .senal[aria-pressed="true"]')?.textContent.trim(), det: document.querySelector('.senal-det')?.textContent, visible: getComputedStyle(document.querySelector('.senal-det')).display !== 'none', foco: document.activeElement?.dataset?.senal, hipo: document.querySelector('.vz-hipo')?.textContent }));
    ev('V2-' + w, `Revisión (${w} px): exposición por categoría en una barra y señales breves; el detalle aparece al pulsar una señal`, 'detalle oculto hasta pulsar; 4 tramos (Tecnología, Consumo básico, Consumo discrecional, Salud); señales «Exposición alta: Tecnología» (alerta) y «NVDA pesa el 40 %» (alerta); al pulsar la segunda queda marcada, conserva el foco y su detalle se ve', J({ rv, tras }),
      rv.barra === 4 && /Tecnología 60 %/.test(rv.ley) && J(rv.senales.map(s => s[0])) === J(['Exposición alta: Tecnología', 'NVDA pesa el 40 %']) && rv.senales.every(s => s[1] === 'alerta') && rv.det === 'none'
      && tras.pulsada === 'NVDA pesa el 40 %' && tras.visible && /25 %/.test(tras.det) && tras.foco === 'posicion' && /NVDA pesara menos/.test(tras.hipo));

    // ---- V3 «Ver qué cambiaría» → comparación calculada
    await p.click('#vz-probar'); await p.waitForSelector('#lab-res .lab-res', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(400);
    const lab = await p.evaluate(() => ({ t: document.querySelector('#lab-ticker')?.value, peso: document.querySelector('#lab-peso')?.value, fin: document.querySelector('input[name=lab-fin]:checked')?.value, res: !!document.querySelector('#lab-res .lab-res:not(.inviable)'),
      kpis: [...document.querySelectorAll('.lab-kpis .kpi')].map(k => k.textContent.replace(/\s+/g, ' ').trim()), alt: document.querySelector('.esp-alt .esp-barra')?.getAttribute('aria-label'), libre: document.querySelector('.esp-alt i.libre')?.textContent, enVista: (() => { const r = document.querySelector('.lab-lado').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })() }));
    await p.screenshot({ path: CAP + `V3-laboratorio-${w}.png` });
    const despues = J((await api(p, 'GET', '/portfolios/' + conc.id)).j.posiciones.map(x => [x.ticker, x.peso]).sort());
    ev('V3-' + w, `«Ver qué cambiaría» (${w} px): el laboratorio abre con la hipótesis de la señal (NVDA 40 % → 20 %, proporcional) YA simulada y a la vista, sin pulsar «Simular»; la cartera guardada no cambia`, 'ticker NVDA, peso 20, proporcional; resultado presente; cifras clave Mayor posición 40 %→20 %, Sin asignar 0 %→20 %; alternativa con 20 % «libre»; la zona del resultado en pantalla; posiciones del servidor idénticas',
      J({ lab, igual: antes === despues }), lab.t === 'NVDA' && lab.peso === '20' && lab.fin === 'proporcional' && lab.res && lab.kpis.some(k => /Mayor posición\s*40\s%\s*→\s*20\s%/.test(k)) && lab.kpis.some(k => /Sin asignar\s*0\s%\s*→\s*20\s%/.test(k)) && /NVDA 20 %/.test(lab.alt) && lab.libre === 'libre' && lab.enVista && antes === despues);

    // ---- V4 deslizador: recalcula al instante sin mover el foco
    await p.focus('#lab-rango'); await p.locator('#lab-rango').fill('8'); await p.waitForTimeout(250);
    const des = await p.evaluate(() => ({ peso: document.querySelector('#lab-peso').value, out: document.querySelector('#lab-rango-v').textContent, alt: document.querySelector('.esp-alt .esp-barra')?.getAttribute('aria-label'), kpi: [...document.querySelectorAll('.lab-kpis .kpi')].map(k => k.textContent.replace(/\s+/g, ' ').trim()).find(k => /Sin asignar/.test(k)), foco: document.activeElement?.id }));
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(200);
    const tecla = await p.evaluate(() => ({ peso: document.querySelector('#lab-peso').value, alt: document.querySelector('.esp-alt .esp-barra')?.getAttribute('aria-label') }));
    ev('V4-' + w, `Deslizador del laboratorio (${w} px): al moverlo (ratón o teclado) la comparación se recalcula al instante y el foco no salta`, '8 % → campo «8», salida «8 %», alternativa NVDA 8 %, sin asignar 0 % → 32 %; con → 9 %; el foco sigue en el deslizador',
      J({ des, tecla }), des.peso === '8' && /^8\s?%$/.test(des.out.replace(/ /g, ' ')) && /NVDA 8 %/.test(des.alt) && /0\s%\s*→\s*32\s%/.test(des.kpi) && des.foco === 'lab-rango' && tecla.peso === '9' && /NVDA 9 %/.test(tecla.alt));

    // ---- V5 descubrir por categoría (sin elegir empresa)
    await p.fill('#lab-ticker', ''); await p.dispatchEvent('#lab-ticker', 'change'); await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(300);
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.waitForTimeout(300);
    const chips = await p.$$eval('[data-explorar]', l => l.map(x => x.dataset.explorar));
    const espera = await p.evaluate(() => !!document.querySelector('.lab-espera .esp-barra'));
    if (chips.includes('Energía')) { await p.click('[data-explorar="Energía"]'); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(400); }
    const emp = await p.evaluate(() => ({ sector: document.querySelector('#emp-sector').value, filas: [...document.querySelectorAll('#empresas-lista tr, #empresas-cards li')].filter(e => e.offsetParent !== null).length, otros: [...document.querySelectorAll('#empresas-lista tr')].some(tr => tr.querySelector('.col-sector') && tr.querySelector('.col-sector').textContent.trim() !== 'Energía') }));
    ev('V5-' + w, `Descubrir (${w} px): sin activo elegido, el laboratorio muestra la cartera base y las categorías que NO tiene; al pulsar una se abre Explorar con ese filtro`, 'barra de la base; chips sin Tecnología/Consumo básico/Salud y con Energía; Explorar filtrado por Energía con al menos una empresa y ninguna de otro sector',
      J({ chips, espera, emp }), espera && chips.includes('Energía') && !chips.includes('Tecnología') && !chips.includes('Consumo básico') && !chips.includes('Salud') && emp.sector === 'Energía' && emp.filas > 0 && !emp.otros);
    await p.evaluate(() => sessionStorage.removeItem('klever_filtros_emp'));

    // ---- V6 Cuaderno: resumen con cifras leídas
    const cart = (await api(p, 'GET', '/portfolios/' + conc.id)).j, hoy = new Date(), iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const prop = [{ ticker: 'NVDA', peso: 20 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'AMZN', peso: 15 }, { ticker: 'KO', peso: 15 }, { ticker: 'JNJ', peso: 10 }];
    const e1 = await api(p, 'POST', '/escenarios', { clave: 'v26-' + w + '-a-' + Date.now(), nombre: 'NVDA al 20', cartera_id: conc.id, base_revision: cart.revision, ticker: 'NVDA', peso: 20, financiacion: 'proporcional', propuesta: prop, revisar_en: iso(hoy) });
    const e2 = await api(p, 'POST', '/escenarios', { clave: 'v26-' + w + '-b-' + Date.now(), nombre: 'NVDA al 20 (b)', cartera_id: conc.id, base_revision: cart.revision, ticker: 'NVDA', peso: 20, financiacion: 'proporcional', propuesta: prop, revisar_en: iso(new Date(hoy.getTime() + 9 * 864e5)) });
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-resumen .seg-tile'); await p.waitForTimeout(300);
    const seg = await p.evaluate(() => [...document.querySelectorAll('#seg-resumen .seg-tile')].map(t => [t.querySelector('b').textContent, t.querySelector('span').textContent, t.className.includes('toca'), t.querySelector('small')?.textContent || '']));
    await p.screenshot({ path: CAP + `V6-cuaderno-${w}.png` });
    ev('V6-' + w, `Cuaderno (${w} px): resumen de un vistazo con lo que toca hoy, lo que está en estudio y el radar`, `escenarios creados (${e1.s}/${e2.s}); «1 · Para revisar hoy» destacado; «2 · En estudio» con la próxima fecha; «0 · En tu radar»`, J(seg),
      e1.s === 201 && e2.s === 201 && seg.length === 3 && seg[0][0] === '1' && seg[0][2] && seg[1][0] === '2' && /Próxima/.test(seg[1][3]) && seg[2][0] === '0');

    // ---- V7 Mis portafolios: la señal principal de cada cartera
    await api(p, 'POST', '/portfolios', { nombre: 'Repartida V', plantilla: 'riesgo', posiciones: [{ ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }, { ticker: 'NVDA', peso: 20 }, { ticker: 'JPM', peso: 20 }] });
    await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#mis-lista .cartera-item'); await p.waitForTimeout(400);
    const mis = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#mis-lista .cartera-item')].map(c => [c.querySelector('.ci-l1 b').textContent, c.querySelector('.ci-senal')?.textContent.trim() || ''])));
    await p.screenshot({ path: CAP + `V7-mis-portafolios-${w}.png` });
    ev('V7-' + w, `Mis portafolios (${w} px): cada cartera lleva su señal principal (de la versión guardada)`, '«Concentrada V» → «Exposición alta: Tecnología»; «Repartida V» → «Sin concentraciones destacadas»', J(mis),
      mis['Concentrada V'] === 'Exposición alta: Tecnología' && mis['Repartida V'] === 'Sin concentraciones destacadas');

    ev('V0-' + w, `Sin errores de JavaScript ni desbordes horizontales (${w} px)`, 'ningún pageerror; scrollWidth ≤ ancho', J({ errs, desb: await sinDesborde(p) }), errs.length === 0 && await sinDesborde(p));
    await p.ctx.close();
  }
  await b.close(); await fin('evidencias-V26');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-V26'); });
function N2(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
