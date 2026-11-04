// Batería K (ronda 13): recorrido completo de cartera → radiografía → explorar → radar → laboratorio → escenario → seguimiento, en 320/390/1440 px.
// Datos de la semilla (ficticios). El texto ampliado es una SIMULACIÓN (font-size del documento). Uso: node tests/ronda13/testK.cjs
const { chromium, B, ev, nuevo, mail, peso, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda13', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body, tok) => p.evaluate(async ([m, ruta, body, tok]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', ...(tok !== 'ninguno' ? { authorization: 'Bearer ' + (tok || localStorage.getItem('klever_token')) } : {}) }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body, tok]);
  const sinBorrador = async (p, tag) => {
    await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(500);
  };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const abrir = async (p, nombre) => { await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.locator('.cartera-item', { hasText: nombre }).first().click(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(400); };
  const filasLab = p => p.evaluate(() => Object.fromEntries([...document.querySelector('#lab-res table.tabla-lab').querySelectorAll('tbody tr:not(.tot)')].map(tr => [tr.querySelector('th b').textContent.trim(), [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\u00a0/g, ' ').trim())])));
  const snap = (p, id, w, full = false) => p.screenshot({ path: CAP + `${id}-${w}.png`, fullPage: full });

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 760, esc = w >= 720;
    const p = await nuevo(b, w, h); const errs = []; p.on('pageerror', e => errs.push(e.message)); await sinBorrador(p, 'K' + w);
    p.on('dialog', d => d.accept());
    const cb = await api(p, 'POST', '/portfolios', { nombre: 'Base dividendos', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], tesis: 'Cartera de prueba' });
    const cl = await api(p, 'POST', '/portfolios', { nombre: 'Para cambios locales', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 30 }, { ticker: 'JNJ', peso: 20 }] });
    const idBase = cb.j.id, revBase = cb.j.revision;
    // ---------- 1. Radiografía de la versión guardada
    await p.reload(); await abrir(p, 'Base dividendos');
    const rad = await p.evaluate(() => ({ t: document.querySelector('#radio-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '), vis: document.querySelector('#radio-cuerpo').offsetParent !== null }));
    ev('K1-' + w, `Radiografía de la versión guardada (${w} px)`, 'Dice qué versión analiza y da conclusión primero: mayor KO 60 %, tres mayores (solo hay 2) 100 %, sin asignar 0 %; explica qué no mide',
      rad.t.slice(0, 330), rad.vis && /Analizando: la versión guardada en tu cuenta/.test(rad.t) && /La mayor posición es KO \(60 %\)/.test(rad.t) && /Solo hay 2 posiciones: suman el 100 %/.test(rad.t) && /Concentración no es riesgo/.test(rad.t) && /Mayores posiciones/.test(rad.t));
    // ---------- 2. Límite personal: se explica el hecho, no se impone un umbral
    await p.fill('#radio-lim', '50'); await p.click('#radio-lim-form button[type=submit]'); await p.waitForFunction(() => /supera el límite/.test(document.querySelector('#radio-cuerpo').textContent)); await p.waitForTimeout(300);
    const lim = await p.evaluate(() => document.querySelector('#radio-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '));
    const ap = await api(p, 'GET', '/portfolios/' + idBase);
    ev('K2-' + w, `Límite personal definido por la persona (${w} px)`, 'Con un límite del 50 %: «KO: esta posición supera el límite del 50 % que has definido»; se guarda en la cuenta sin subir la revisión; sin límite no hay umbral',
      `${lim.match(/KO: [^.]*\./)?.[0]}; límite ${ap.j.limite_peso}; revisión ${ap.j.revision} (antes ${revBase})`, /KO: esta posición supera el límite del 50 % que has definido/.test(lim) && ap.j.limite_peso === 50 && ap.j.revision === revBase && /Klever no impone ningún umbral/.test(lim));
    await p.reload(); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(500);
    const persiste = await p.evaluate(() => document.querySelector('#radio-lim').value);
    ev('K2b-' + w, `El límite persiste tras recargar (${w} px)`, 'El campo vuelve con 50', persiste, persiste === '50');
    // ---------- 3. Guardada frente a cambios locales; cartera incompleta sin normalizar
    await abrir(p, 'Para cambios locales'); await peso(p, 2).fill('10'); await p.waitForTimeout(400);
    const loc = await p.evaluate(() => ({ t: document.querySelector('#radio-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '), btns: [...document.querySelectorAll('#radio-cuerpo [data-modo]')].map(e => e.textContent + ':' + e.getAttribute('aria-pressed')) }));
    await p.locator('#radio-cuerpo [data-modo=guardada]').click(); await p.waitForTimeout(200);
    const gua = await p.evaluate(() => document.querySelector('#radio-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '));
    ev('K3-' + w, `Versión guardada frente a cambios locales (${w} px)`, 'Con cambios sin guardar analiza «tus cambios» (KO 50, PG 30, JNJ 10 = 90 %, falta asignar 10 %: NO se reescala); un botón cambia a «la versión guardada» (100 %)',
      `${loc.btns.join(' | ')}; local: ${/falta asignar el 10 %/.test(loc.t)}; guardada: ${/Analizando: la versión guardada/.test(gua) && !/falta asignar/.test(gua)}`,
      /Analizando: tus cambios sin guardar/.test(loc.t) && /Está asignado el 90 %; falta asignar el 10 %/.test(loc.t) && loc.btns.join().includes('Con mis cambios:true') && /Analizando: la versión guardada/.test(gua) && !/falta asignar/.test(gua) && /Las tres mayores suman el 100 %/.test(gua));
    await snap(p, 'R1-radiografia-local', w, true);
    // ---------- 4. Explorar → ficha → radar (con nota) y «ya figura en la cartera»
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', 'JNJ'); await p.waitForTimeout(300);
    await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForSelector('#fir-toggle');
    await p.selectOption('#fir-cartera', { label: 'Base dividendos' }); await p.waitForTimeout(200);
    const noFig = await p.evaluate(() => document.querySelector('#fir-en').textContent.replace(/\s+/g, ' '));
    await p.selectOption('#fir-cartera', { label: 'Para cambios locales' }); await p.waitForTimeout(200);
    const fig = await p.evaluate(() => document.querySelector('#fir-en').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '));
    await p.selectOption('#fir-cartera', { label: 'Base dividendos' }); await p.waitForTimeout(200);
    ev('K4-' + w, `La ficha dice si el activo ya figura DIRECTAMENTE en la cartera elegida (${w} px)`, 'En «Base dividendos» no figura directamente (y avisa de que no se miran los fondos por dentro); en «Para cambios locales» figura con el 20 % guardado',
      `${noFig.slice(0, 120)} | ${fig.slice(0, 90)}`, /no figura directamente/.test(noFig) && /posiciones internas de los fondos/.test(noFig) && /ya figura directamente con el 20 %/.test(fig));
    await p.focus('#fir-toggle'); await p.keyboard.press('Enter'); await p.waitForSelector('#fi-radar [data-nota=editar]');
    const foco = await p.evaluate(() => document.activeElement?.id);
    await p.click('#fi-radar [data-nota=editar]'); await p.waitForSelector('#fir-nota'); await p.fill('#fir-nota', 'Revisar deuda y caja libre'); await p.click('#fi-radar [data-nota=guardar]'); await p.waitForSelector('#fi-radar .nota-txt'); await p.waitForTimeout(300);
    const ar = await api(p, 'GET', '/radar');
    ev('K5-' + w, `Guardar en el radar con teclado y con nota privada (${w} px)`, 'Intro sobre el botón guarda; el foco se queda en el botón; la nota se guarda en la cuenta (comprobado en la API) y el estado dice «Guardada en tu cuenta»',
      `foco ${foco}; API ${JSON.stringify(ar.j.map(x => [x.ticker, x.nota]))}; ${N(await p.textContent('#fir-estado'))}`, foco === 'fir-toggle' && ar.j.length === 1 && ar.j[0].ticker === 'JNJ' && ar.j[0].nota === 'Revisar deuda y caja libre' && /Guardada en tu cuenta/.test(await p.textContent('#fir-estado')));
    await snap(p, 'R2-ficha-radar', w);
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    const marca = await p.evaluate(() => [...document.querySelectorAll('.chip.radar')].filter(e => e.offsetParent !== null).length);
    await p.fill('#emp-buscar', ''); await p.check('#emp-radar'); await p.waitForTimeout(300);
    const soloRadar = await p.evaluate(() => ({ cuenta: document.querySelector('#emp-cuenta').textContent, filas: [...document.querySelectorAll(window.innerWidth >= 720 ? '#empresas-lista tr' : '#empresas-cards li')].filter(e => e.querySelector('[data-t]')).length }));
    ev('K6-' + w, `Marca «En tu radar» y filtro «Solo mi radar» (${w} px)`, 'La fila lleva «★ En tu radar»; con «Solo mi radar» queda 1 de 106; no cambia el orden ni crea ranking', `${marca} marca(s); ${soloRadar.cuenta}; ${soloRadar.filas} fila(s)`, marca >= 1 && /^1 de 106/.test(soloRadar.cuenta) && soloRadar.filas === 1);
    await p.uncheck('#emp-radar');
    // ---------- 5. Mi seguimiento: nota y paso al laboratorio con cartera y activo elegidos
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.seg-item');
    await p.selectOption('#seg-ref', { label: 'Base dividendos' });
    const seg = await p.evaluate(() => ({ nota: document.querySelector('.seg-item .nota-txt').textContent.trim(), en: document.querySelector('.seg-item [data-en]').textContent.replace(/\s+/g, ' ') }));
    await snap(p, 'R3-seguimiento-radar', w);
    ev('K7-' + w, `Mi seguimiento conserva la nota y la cartera de referencia (${w} px)`, 'La nota guardada reaparece; dice que en «Base dividendos» no figura directamente; sin desbordamiento', `«${seg.nota}»; ${seg.en.slice(0, 70)}`, seg.nota === 'Revisar deuda y caja libre' && /«Base dividendos» no figura directamente/.test(seg.en) && await sinDesborde(p));
    await p.click('.seg-item [data-acc=sim]'); await p.waitForSelector('#lab-form');
    const pre = await p.evaluate(() => ({ t: document.querySelector('#lab-ticker').value, base: document.querySelector('#lab-base').selectedOptions[0].textContent, h1: document.querySelector('#vista-lab h1').textContent.replace(/\s+/g, ' ').trim() }));
    // ---------- 6. Laboratorio: método explicado ANTES, simulación, antes/después
    await p.check('input[name=lab-fin][value=proporcional]'); await p.waitForTimeout(150);
    const metodo = N(await p.textContent('#lab-metodo')); await p.fill('#lab-peso', '10');
    ev('K8-' + w, `Laboratorio: base y activo llegan elegidos; el método se explica antes de calcular (${w} px)`, 'Activo JNJ y cartera «Base dividendos» preseleccionados; título con «Simulación»; el método menciona que cada posición se multiplica y que se redondea por mayor resto; aún no hay resultado',
      `${pre.t} / ${pre.base}; ${pre.h1}; método: ${metodo.slice(0, 90)}…`, pre.t === 'JNJ' && pre.base === 'Base dividendos' && /Simulación/.test(pre.h1) && /se multiplica/.test(metodo) && /mayor resto/.test(metodo) && (await p.locator('#lab-res h2').count()) === 0);
    await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab');
    const filas = await filasLab(p), tot = N(await p.locator('#lab-res tr.tot').first().textContent()), concl = N(await p.textContent('.lab-concl'));
    await snap(p, 'R4-laboratorio-resultado', w, true);
    ev('K9-' + w, `Simulación del ejemplo verificable: KO 60 / PG 40 + JNJ 10 reduciendo proporcionalmente (${w} px)`, 'KO 54, PG 36, JNJ 10; total 100; tabla con antes, después y cambio (con texto); sin asignar 0 %; ninguna cifra negativa',
      `${JSON.stringify(filas)}; ${tot}; ${concl}`, JSON.stringify(filas.KO) === JSON.stringify(['60 %', '54 %', '−6 puntos']) && JSON.stringify(filas.PG) === JSON.stringify(['40 %', '36 %', '−4 puntos']) && filas.JNJ[1] === '10 %' && /^Total asignado\s*100 %\s*100 %/.test(tot) && /sin asignar: 0 % → 0 %/.test(concl));
    const cabe = await p.evaluate(() => { const t = document.querySelector('#lab-res table.tabla-lab'), c = t.parentElement; return { tabla: Math.round(t.scrollWidth), caja: Math.round(c.clientWidth) }; });
    ev('K9b-' + w, `La tabla de pesos antes/después se lee entera sin desplazar (${w} px)`, 'El ancho de la tabla cabe en su contenedor: las cuatro columnas son visibles a la vez', JSON.stringify(cabe), cabe.tabla <= cabe.caja + 1);
    const comp = await p.evaluate(() => ({ h3: [...document.querySelectorAll('#lab-res h3')].map(e => e.textContent.trim()), pasos: document.querySelectorAll('#lab-res details ol li').length, sim: !!document.querySelector('#lab-res .chip.sim') }));
    ev('K10-' + w, `La comparación cubre pesos, concentración, categorías, límites y pasos (${w} px)`, 'Secciones: pesos, concentración, categorías, límite personal; los pasos del cálculo se pueden desplegar; etiqueta «Simulación»',
      `${comp.h3.join(' | ')}; ${comp.pasos} pasos`, comp.h3.some(x => /Pesos por posición/.test(x)) && comp.h3.some(x => /^Concentración/.test(x)) && comp.h3.some(x => /^Categorías disponibles/.test(x)) && comp.h3.some(x => /límite personal/.test(x)) && comp.pasos >= 3 && comp.sim);
    const limTxt = N(await p.evaluate(() => [...document.querySelectorAll('#lab-res h3')].find(e => /límite personal/.test(e.textContent)).nextElementSibling.parentElement.textContent));
    ev('K10b-' + w, `Límites personales afectados (${w} px)`, 'Con el límite del 50 %: KO dejaría de superarlo (antes 60 %, ahora 54 % sigue por encima: «sigue superando»)', limTxt.slice(0, 200), /KO: sigue superando el límite del 50 %/.test(limTxt) && /Límite definido: 50 %/.test(limTxt));
    // ---------- 7. Guardar el escenario (no toca la cartera ni su versión pública)
    const antes = JSON.stringify((await api(p, 'GET', '/portfolios/' + idBase)).j.posiciones), revAntes = (await api(p, 'GET', '/portfolios/' + idBase)).j.revision;
    const pub0 = await api(p, 'GET', '/public', undefined, 'ninguno');
    await p.fill('#lab-nombre', 'Añadir JNJ al 10 %'); await p.fill('#lab-nota', 'Comparar con KO'); await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar'); await p.waitForTimeout(400);
    const idEsc = +(await p.evaluate(() => location.hash.match(/escenario-(\d+)/)[1]));
    const despues = JSON.stringify((await api(p, 'GET', '/portfolios/' + idBase)).j.posiciones), revDesp = (await api(p, 'GET', '/portfolios/' + idBase)).j.revision;
    const escApi = await api(p, 'GET', '/escenarios/' + idEsc);
    ev('K11-' + w, `Guardar el escenario no modifica la cartera base (${w} px)`, 'Escenario guardado con base 60/40 en la revisión de origen; la cartera sigue igual (mismas posiciones y revisión) y su estado público no cambia',
      `esc ${escApi.s} base ${JSON.stringify(escApi.j.base)} rev ${escApi.j.base_revision}; cartera ${antes === despues ? 'igual' : 'CAMBIÓ'}, rev ${revAntes}→${revDesp}`, escApi.s === 200 && escApi.j.base.length === 2 && escApi.j.base_revision === revBase && antes === despues && revAntes === revDesp && !(pub0.j || []).some?.(x => x.nombre === 'Base dividendos'));
    await snap(p, 'R5-escenario-guardado', w, true);
    // ---------- 8. La cartera cambia: el escenario conserva su base y avisa, sin recalcular
    await api(p, 'PUT', '/portfolios/' + idBase, { posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }], nombre: 'Base dividendos', tesis: 'Cartera de prueba', revision: revBase });
    await p.reload(); await p.waitForSelector('#esc-editar'); await p.waitForTimeout(500);
    const post = await p.evaluate(() => ({ aviso: document.querySelector('#vista-lab .aviso-panel')?.textContent.replace(/\s+/g, ' ') || '', cuerpo: document.querySelector('#vista-lab').textContent.replace(/ /g, ' ').replace(/\s+/g, ' ') }));
    ev('K12-' + w, `Reabrir un escenario tras cambiar la cartera original (${w} px)`, 'Avisa «La cartera cambió después de este escenario (revisión 0 → 1)»; sigue mostrando la base guardada KO 60 y la propuesta KO 54; no recalcula',
      `${post.aviso.slice(0, 110)}…; ${/Base: KO 60 % · PG 40 %/.test(post.cuerpo)}; ${/Propuesta: KO 54 %/.test(post.cuerpo)}`, /La cartera cambió después de este escenario/.test(post.aviso) && /revisión 0 → 1/.test(post.aviso) && /Base: KO 60 % · PG 40 %/.test(post.cuerpo) && /Propuesta: KO 54 % · PG 36 % · JNJ 10 %/.test(post.cuerpo));
    // ---------- 9. Estado, nota y seguimiento
    await p.click('#esc-editar'); await p.fill('#esc-nota', 'Archivado: ya no me interesa'); await p.click('#esc-guardar'); await p.waitForSelector('#esc-editar'); await p.click('[data-estado=archivado]'); await p.waitForFunction(() => /Archivado/.test(document.querySelector('#lab-cuerpo h1')?.textContent || '')); await p.waitForTimeout(300);
    const escB = await api(p, 'GET', '/escenarios/' + idEsc);
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios');
    await p.waitForFunction(() => !document.querySelector('#seg-escenarios').textContent.includes('Cargando')); await p.waitForTimeout(200);
    const enEstudio = await p.evaluate(() => document.querySelectorAll('#seg-escenarios .esc-item').length);
    await p.selectOption('#seg-filtro', 'archivado'); await p.waitForTimeout(200);
    const archivados = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .esc-item')].map(e => e.textContent.replace(/\s+/g, ' ').slice(0, 400)));
    ev('K13-' + w, `Estado y nota del escenario; el seguimiento los distingue (${w} px)`, 'Tras archivarlo, deja «En estudio» (0) y aparece en «Archivados» con la marca «Simulación» y el aviso de versión posterior; la API guarda estado y nota',
      `API ${escB.j.estado}/«${escB.j.nota}»; en estudio ${enEstudio}; archivados: ${archivados[0]}`, escB.j.estado === 'archivado' && escB.j.nota === 'Archivado: ya no me interesa' && enEstudio === 0 && archivados.length === 1 && /Simulación/.test(archivados[0]) && /Hay una versión posterior de la cartera/.test(archivados[0]) && await sinDesborde(p));
    await snap(p, 'R6-seguimiento-escenarios', w, true);
    // ---------- 10. Descartar
    await p.click('#seg-escenarios a.btn'); await p.waitForSelector('#esc-eliminar'); await p.click('#esc-eliminar'); await p.waitForSelector('#seg-escenarios'); await p.waitForTimeout(500);
    const quedan = (await api(p, 'GET', '/escenarios')).j.length, cartDesp = JSON.stringify((await api(p, 'GET', '/portfolios/' + idBase)).j.posiciones);
    ev('K14-' + w, `Descartar un escenario no toca la cartera (${w} px)`, 'Tras descartarlo no queda ninguno; la cartera conserva su estado (50/50)', `escenarios ${quedan}; ${cartDesp}`, quedan === 0 && /"peso":50/.test(cartDesp));
    // ---------- 11. Operación inviable con motivo
    await p.goto(B + '#carteras'); await p.waitForSelector('.cartera-item');
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.selectOption('#lab-base', { label: 'Base dividendos' });
    await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=sin_asignar]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res .inviable');
    const inv = N(await p.textContent('#lab-res'));
    ev('K15-' + w, `Operación inviable: se explica el motivo y no se ofrece guardar (${w} px)`, 'Con la cartera al 100 % y financiación con lo sin asignar: «No hay suficiente porcentaje sin asignar: hay 0 % y el cambio necesita 10 %»; sin formulario de guardado',
      inv.slice(0, 180), /No hay suficiente porcentaje sin asignar: hay 0 % y el cambio necesita 10 %/.test(inv) && (await p.locator('#lab-guardar').count()) === 0);
    // ---------- 12. Texto ampliado (simulado) en las pantallas nuevas
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab');
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400);
    const amp = { lab: await sinDesborde(p) }; await snap(p, 'R7-laboratorio-ampliado', w);
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.seg-item'); await p.waitForTimeout(300); amp.seg = await sinDesborde(p);
    await abrir(p, 'Base dividendos'); amp.ed = await sinDesborde(p);
    await p.evaluate(() => { document.documentElement.style.fontSize = ''; });
    ev('K16-' + w, `Texto ampliado al 200 % (simulado): laboratorio, seguimiento y radiografía (${w} px)`, 'Sin desbordamiento horizontal en las tres pantallas', JSON.stringify(amp), amp.lab && amp.seg && amp.ed);
    ev('K17-' + w, `Sin errores de JavaScript en todo el recorrido (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }

  // ---------- pruebas de una sola pasada (1440 px) ----------
  { // fallo de guardado del escenario y reintento sin duplicar
    const p = await nuevo(b, 1440, 900); await sinBorrador(p, 'KF'); p.on('dialog', d => d.accept());
    await api(p, 'POST', '/portfolios', { nombre: 'Base', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] });
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-guardar');
    const claves = []; await p.route('**/api/escenarios', async r => { if (r.request().method() === 'POST') { claves.push(JSON.parse(r.request().postData()).clave); if (claves.length === 1) return r.abort(); } return r.continue(); });
    await p.click('#lab-guardar-btn'); await p.waitForFunction(() => /Tus datos siguen aquí/.test(document.querySelector('#lab-guardar-error')?.textContent || '')); const nFallo = (await api(p, 'GET', '/escenarios')).j.length;
    const conserva = await p.evaluate(() => ({ nombre: document.querySelector('#lab-nombre').value, form: !!document.querySelector('#lab-guardar') }));
    await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar'); const nOk = (await api(p, 'GET', '/escenarios')).j.length;
    ev('K18', 'Fallo de red al guardar un escenario y reintento', 'El fallo no guarda nada y conserva el formulario con un mensaje; el reintento usa la MISMA clave y guarda exactamente uno', `fallo: ${nFallo} escenarios, formulario ${conserva.form}; reintento: ${nOk}; claves iguales ${claves[0] === claves[1]}`, nFallo === 0 && conserva.form && nOk === 1 && claves.length === 2 && claves[0] === claves[1]);
    // aislamiento por HTTP real entre dos usuarios (otra sesión)
    const idEsc = +(await p.evaluate(() => location.hash.match(/escenario-(\d+)/)[1])); const idCart = (await api(p, 'GET', '/portfolios')).j[0].id;
    const q = await nuevo(b, 1440, 900); await sinBorrador(q, 'KG');
    const r1 = await api(q, 'GET', '/escenarios/' + idEsc), r2 = await api(q, 'PATCH', '/escenarios/' + idEsc, { nota: 'x', revision: 0 }), r3 = await api(q, 'DELETE', '/escenarios/' + idEsc), r4 = await api(q, 'GET', '/escenarios'), r5 = await api(q, 'PUT', '/portfolios/' + idCart + '/limite', { limite: 5 }), r6 = await api(q, 'GET', '/radar');
    const stillThere = (await api(p, 'GET', '/escenarios/' + idEsc)).s;
    ev('K19', 'Aislamiento entre dos usuarios (servidor real por HTTP)', 'Otro usuario recibe 404 al leer, editar, borrar o poner límite; su lista de escenarios y su radar están vacíos; el escenario del primero sigue intacto',
      `GET ${r1.s}, PATCH ${r2.s}, DELETE ${r3.s}, lista ${r4.j.length}, límite ${r5.s}, radar ${r6.j.length}; original ${stillThere}`, [r1.s, r2.s, r3.s, r5.s].every(s => s === 404) && r4.j.length === 0 && r6.j.length === 0 && stillThere === 200);
    const sinSesion = await api(q, 'GET', '/escenarios', undefined, 'ninguno'), sinSesion2 = await api(q, 'PUT', '/radar/KO', {}, 'ninguno');
    ev('K19b', 'Sin sesión, las rutas nuevas devuelven 401', '401 en escenarios y radar', `${sinSesion.s}/${sinSesion2.s}`, sinSesion.s === 401 && sinSesion2.s === 401);
    // rutas de escenario inexistente
    await p.goto(B + '#escenario-999999'); await p.waitForSelector('#vista-lab:not([hidden])'); await p.waitForTimeout(600);
    ev('K20', 'Escenario inexistente: mensaje claro y salida', 'Texto «No encontramos ese escenario» y enlace a Mi seguimiento', N(await p.textContent('#lab-cuerpo')).slice(0, 120), /No encontramos ese escenario/.test(await p.textContent('#lab-cuerpo')) && (await p.locator('#lab-cuerpo a[href="#seguimiento"]').count()) === 1);
    await p.ctx.close(); await q.ctx.close();
  }
  { // visitante: exploración y simulación temporales, radar solo en este dispositivo, y migración al entrar
    for (const w of [390, 1440]) {
      const p = await nuevo(b, w, 800); p.on('dialog', d => d.accept());
      await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', 'JNJ'); await p.waitForTimeout(250); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#fir-toggle');
      const sinRef = N(await p.textContent('#fi-radar')); await p.click('#fir-toggle'); await p.waitForSelector('#fi-radar [data-nota=editar]'); await p.click('#fi-radar [data-nota=editar]'); await p.fill('#fir-nota', 'Mirar con calma'); await p.click('#fi-radar [data-nota=guardar]'); await p.waitForSelector('#fi-radar .nota-txt'); await p.waitForTimeout(300);
      const est = N(await p.textContent('#fir-estado')), local = await p.evaluate(() => localStorage.getItem('klever_radar_local'));
      ev('K21-' + w, `Visitante: el radar se guarda SOLO en este dispositivo y lo dice (${w} px)`, 'Estado «Guardada solo en este dispositivo»; nada de «tu cuenta»; la nota está en localStorage', `${est}; ${local}`, /solo en este dispositivo/.test(est) && !/Guardada en tu cuenta/.test(est) && /Mirar con calma/.test(local || '') && /Probar en mi cartera/.test(sinRef));
      await p.keyboard.press('Escape');
      // probar una cartera (borrador) y simular de forma temporal
      await p.goto(B); await p.waitForSelector('.plantilla'); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(400);
      const radG = N(await p.textContent('#radio-cuerpo'));
      ev('K22-' + w, `Visitante: la radiografía analiza el borrador y no ofrece guardar el límite (${w} px)`, 'Dice que analiza «tu borrador, que aún no está guardado en tu cuenta» y que el límite se podrá definir al guardar', radG.slice(0, 150), /Analizando: tu borrador, que aún no está guardado en tu cuenta/.test(radG) && /cuando guardes la cartera en tu cuenta/.test(radG) && !/Klever no impone/.test(radG));
      await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '5'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab');
      const g = N(await p.textContent('#lab-res .lab-guardar'));
      ev('K23-' + w, `Visitante: la simulación es temporal y no se dice «guardado» (${w} px)`, 'El resultado se muestra; en lugar de guardar dice que es temporal y ofrece entrar; no existe el formulario de guardado ni se muestra «Guardado en tu cuenta»', g.slice(0, 140), /temporal/.test(g) && (await p.locator('#lab-guardar-btn').count()) === 0 && !/Guardado en tu cuenta|Escenario guardado/.test(await p.textContent('body')));
      await p.ctx.close();
    }
    const p = await nuevo(b, 1440, 800); await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', 'JNJ'); await p.waitForTimeout(250); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#fir-toggle'); await p.click('#fir-toggle'); await p.waitForSelector('#fi-radar [data-nota=editar]'); await p.click('#fi-radar [data-nota=editar]'); await p.fill('#fir-nota', 'Desde el visitante'); await p.click('#fi-radar [data-nota=guardar]'); await p.waitForSelector('#fi-radar .nota-txt'); await p.waitForTimeout(300); await p.keyboard.press('Escape');
    await p.click('#entrar'); await p.fill('#acc-email', mail('KM')); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(1200);
    const rem = await api(p, 'GET', '/radar'), loc = await p.evaluate(() => localStorage.getItem('klever_radar_local'));
    ev('K24', 'Al iniciar sesión, el radar del visitante pasa a la cuenta', 'La API devuelve JNJ con su nota; lo local se borra solo tras guardar todo', `${JSON.stringify(rem.j.map(x => [x.ticker, x.nota]))}; local ${loc}`, rem.j.length === 1 && rem.j[0].ticker === 'JNJ' && rem.j[0].nota === 'Desde el visitante' && loc === null);
    await p.ctx.close();
  }
  { // filtros explícitos de Explorar (conservan estado; sin ranking nuevo)
    const p = await nuevo(b, 1440, 900); await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true');
    const datos = await p.evaluate(async () => { const r = await (await fetch('/api/ideas')).json(); return r.map(x => ({ t: x.ticker, s: x.sector, roic: x.criterios.roic.ok, orden: x.ticker })); });
    const sector = datos[0].s, esperado = datos.filter(x => x.s === sector && x.roic === false).length;
    await p.selectOption('#emp-sector', sector); await p.selectOption('#emp-crit', 'roic'); await p.selectOption('#emp-estado', 'no'); await p.waitForTimeout(300);
    const cuenta = N(await p.textContent('#emp-cuenta')), ordenAntes = await p.evaluate(() => [...document.querySelectorAll('#empresas-lista [data-t]')].map(e => e.dataset.t));
    await p.fill('#emp-buscar', ''); await p.locator('.ver-ficha >> visible=true').first().click().catch(() => {}); await p.waitForTimeout(300);
    const abierta = await p.evaluate(() => document.querySelector('#dlg-ficha').open); if (abierta) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
    const tras = await p.evaluate(() => ({ s: document.querySelector('#emp-sector').value, c: document.querySelector('#emp-crit').value, e: document.querySelector('#emp-estado').value, cuenta: document.querySelector('#emp-cuenta').textContent }));
    await p.reload(); await p.waitForSelector('.ver-ficha >> visible=true').catch(() => {}); await p.waitForTimeout(500);
    const recarga = await p.evaluate(() => ({ s: document.querySelector('#emp-sector').value, e: document.querySelector('#emp-estado').value }));
    await p.click('#emp-borrar'); await p.waitForTimeout(300);
    const borr = N(await p.textContent('#emp-cuenta'));
    ev('K25', 'Filtros explícitos: sector + comprobación + resultado', `Sector «${sector}» con ROIC «no superada»: ${esperado} empresa(s) según el servidor; los filtros sobreviven a abrir la ficha y a recargar; «Borrar» devuelve las 106; no se crea ningún ranking nuevo`,
      `${cuenta}; tras ficha ${tras.s}/${tras.c}/${tras.e}; recarga ${recarga.s}/${recarga.e}; borrar ${borr}`, new RegExp(`^${esperado} de 106`).test(cuenta) && tras.s === sector && tras.e === 'no' && recarga.s === sector && recarga.e === 'no' && /^106 empresas/.test(borr));
    // origen de los datos
    const av = N(await p.textContent('#aviso-datos')), pie = await p.evaluate(() => document.body.innerText);
    await p.fill('#emp-buscar', 'JNJ'); await p.waitForTimeout(250); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(400);
    const fichaTxt = N(await p.textContent('#fi-cuerpo'));
    ev('K26', 'Datos de prueba identificados como ficticios; nada se atribuye a la SEC', 'El aviso de Explorar y la ficha dicen «PRUEBA ficticios»; ni la interfaz ni la ficha afirman «SEC EDGAR» ni «cada noche»', `${av}; ficha con «SEC EDGAR»: ${/SEC EDGAR/.test(fichaTxt)}`, /PRUEBA ficticios/.test(av) && /PRUEBA ficticios/.test(fichaTxt) && !/SEC EDGAR|cada noche/.test(pie.replace(/Datos de PRUEBA ficticios[^.]*\./g, '')));
    await p.ctx.close();
  }
  { // navegación: «Mi seguimiento» una sola vez en cada menú y visible también sin cuenta
    for (const w of [390, 1440]) {
      const p = await nuevo(b, w, 800); await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true');
      const nav = await p.evaluate(() => ({ esc: document.querySelectorAll('.menu-escritorio a[data-nav=seguimiento]').length, mov: document.querySelectorAll('#menu-movil a[data-nav=seguimiento]').length }));
      await p.screenshot({ path: CAP + `R8-explorar-filtros-${w}.png` });
      ev('K27-' + w, `Menú: «Mi seguimiento» una vez en cada menú (${w} px)`, 'Una vez en el menú de escritorio y una vez en el móvil', JSON.stringify(nav), nav.esc === 1 && nav.mov === 1);
      await p.ctx.close();
    }
  }
  await b.close(); fin('evidencias-K');
})();
