// Batería L (ronda 14): (1) privacidad al salir, (2) guardado y recuperación del radar, (3) primera visita sin cuenta (revista → opinión → revisión →
// «Probar en mi cartera» con la cartera de ejemplo), (4) regreso con cuenta (pregunta, fecha, revisión editorial, base histórica), (5) integridad
// y publicación intactas. 320/390/1440 px. Los datos son ficticios; el caso editorial es FICTICIO. Uso: node tests/ronda14/testL.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda14', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(600); };
  const salir = async p => { if (await p.locator('#salir').isVisible()) await p.click('#salir'); else { await p.click('#btn-menu'); await p.click('#salir-m'); } await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(300); };
  const html = p => p.evaluate(() => document.documentElement.outerHTML);
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const snap = (p, id, w, full = false) => p.screenshot({ path: CAP + `${id}-${w}.png`, fullPage: full });
  const verFicha = async (p, ticker) => { await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', ticker); await p.waitForTimeout(300); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForSelector('#fi-radar *'); await p.waitForTimeout(300); };
  const SEC_A = 'NOTA-SECRETA-A-7731', CAR_A = 'CARTERA-SECRETA-A-5520';

  // =================== 1. Privacidad al salir (escritorio y móvil) ===================
  for (const w of [1440, 390]) {
    const h = w === 1440 ? 900 : 780, p = await nuevo(b, w, h); const emailA = mail('PA' + w); await entrarCon(p, emailA);
    await api(p, 'POST', '/portfolios', { nombre: CAR_A, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] });
    await api(p, 'PUT', '/radar/KO', { nota: SEC_A }); await p.reload(); await p.waitForSelector('.cartera-item');
    await verFicha(p, 'KO'); const conNota = N(await p.textContent('#fi-radar')); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.seg-item'); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item');
    await salir(p);
    const tras = await html(p), refGuardada = await p.evaluate(() => localStorage.getItem('klever_cartera_ref'));
    await verFicha(p, 'KO'); const comoVisitante = N(await p.textContent('#fi-radar')), tras2 = await html(p);
    ev('L1-' + w, `Privacidad al salir: la nota y la cartera de A no quedan en pantalla ni en memoria (${w} px)`, 'Con A: la ficha muestra su nota. Tras salir SIN recargar, el HTML no contiene ni la nota ni el nombre de la cartera; la referencia guardada se borra; al reabrir la ficha como visitante no hay nota ni «En tu radar»',
      `con A: ${conNota.includes(SEC_A)}; HTML tras salir: nota ${tras.includes(SEC_A)}, cartera ${tras.includes(CAR_A)}; referencia ${refGuardada}; visitante: ${comoVisitante.slice(0, 60)}; HTML tras reabrir: nota ${tras2.includes(SEC_A)}, cartera ${tras2.includes(CAR_A)}`,
      conNota.includes(SEC_A) && !tras.includes(SEC_A) && !tras.includes(CAR_A) && refGuardada === null && /Guardar en mi radar/.test(comoVisitante) && !comoVisitante.includes('En tu radar') && !tras2.includes(SEC_A) && !tras2.includes(CAR_A));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    // entra B: no hay nada de A
    await entrarCon(p, mail('PB' + w)); const tB = await html(p), radarB = await api(p, 'GET', '/radar'), carB = await api(p, 'GET', '/portfolios');
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForTimeout(800); const tB2 = await html(p);
    ev('L1b-' + w, `Entra B tras A: no ve nada de A (${w} px)`, 'Radar y carteras de B vacíos; el HTML no contiene la nota ni el nombre de la cartera de A', `radar ${radarB.j.length}, carteras ${carB.j.length}; nota ${tB.includes(SEC_A) || tB2.includes(SEC_A)}, cartera ${tB.includes(CAR_A) || tB2.includes(CAR_A)}`, radarB.j.length === 0 && carB.j.length === 0 && !tB.includes(SEC_A) && !tB2.includes(SEC_A) && !tB.includes(CAR_A) && !tB2.includes(CAR_A));
    await p.ctx.close();
  }
  { // respuesta lenta de A: llega DESPUÉS de salir y no se pinta
    const p = await nuevo(b, 1440, 900); await entrarCon(p, mail('PL'));
    await api(p, 'POST', '/portfolios', { nombre: CAR_A, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] }); await api(p, 'PUT', '/radar/KO', { nota: SEC_A });
    await p.reload(); await p.waitForSelector('.cartera-item'); await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true'); await p.waitForTimeout(500);
    await p.route(/\/api\/(portfolios|radar)$/, async r => { if (r.request().method() === 'GET') await new Promise(res => setTimeout(res, 1800)); return r.continue(); });
    await p.fill('#emp-buscar', 'KO'); await p.waitForTimeout(300); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]');
    await p.keyboard.press('Escape'); await p.click('#salir'); await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(3200);
    const t = await html(p), ficha = await p.evaluate(() => document.querySelector('#fi-radar').textContent), mis = await p.evaluate(() => document.querySelector('#mis-lista').textContent);
    ev('L2', 'Respuesta lenta de A que llega después de salir', 'Las respuestas pendientes se descartan: ni la nota ni la cartera de A aparecen en ninguna parte del HTML', `nota ${t.includes(SEC_A)}, cartera ${t.includes(CAR_A)}; ficha «${N(ficha).slice(0, 50)}»; lista «${N(mis).slice(0, 30)}»`, !t.includes(SEC_A) && !t.includes(CAR_A) && !ficha.includes(SEC_A) && mis.trim() === '');
    await p.ctx.close();
  }
  { // caducidad de la sesión (401): se limpia igual
    const p = await nuevo(b, 1440, 900); await entrarCon(p, mail('PC'));
    await api(p, 'POST', '/portfolios', { nombre: CAR_A, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] }); await api(p, 'PUT', '/radar/KO', { nota: SEC_A });
    await p.reload(); await p.waitForSelector('.cartera-item'); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.seg-item');
    await p.route('**/api/escenarios', r => r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"No autorizado"}' }));
    await p.selectOption('#seg-filtro', 'todos'); await p.waitForSelector('#dlg-acceso[open]'); await p.waitForTimeout(400);
    const t = await html(p);
    ev('L3', 'Caducidad de la sesión (401) con datos privados en pantalla', 'Se abre el acceso y no queda en el HTML ni la nota ni el nombre de la cartera', `nota ${t.includes(SEC_A)}, cartera ${t.includes(CAR_A)}; token ${await p.evaluate(() => localStorage.getItem('klever_token'))}`, !t.includes(SEC_A) && !t.includes(CAR_A) && (await p.evaluate(() => localStorage.getItem('klever_token'))) === null);
    await p.ctx.close();
  }

  // =================== 2. Guardado y recuperación del radar ===================
  {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); await c.addInitScript(() => { const orig = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (window.__fallarAlmacen) throw new DOMException('QuotaExceededError', 'QuotaExceededError'); return orig.call(this, k, v); }; });
    const p = await c.newPage(); p.ctx = c; await p.route(/tradingview\.com/, r => r.abort()); p.on('dialog', d => d.accept());
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await verFicha(p, 'JNJ');
    await p.click('#fir-toggle'); await p.waitForSelector('#fi-radar [data-nota=editar]');                       // primer guardado: bien
    await p.click('#fi-radar [data-nota=editar]'); const TEXTO = 'Revisar la deuda neta y comparar con KO antes de decidir nada';
    await p.fill('#fir-nota', TEXTO); await p.evaluate(() => { window.__fallarAlmacen = true; }); await p.click('#fi-radar [data-nota=guardar]'); await p.waitForTimeout(500);
    const fallo = await p.evaluate(() => ({ err: document.querySelector('[data-nota-err]')?.textContent || '', texto: document.querySelector('#fir-nota')?.value, boton: document.querySelector('#fi-radar [data-nota=guardar]')?.textContent, guardado: JSON.parse(localStorage.getItem('klever_radar_local') || '{}').JNJ?.nota }));
    ev('L4', 'Fallo de escritura tras un primer guardado correcto', 'Se avisa «No se ha podido guardar», el texto se conserva en pantalla, el botón pasa a «Reintentar guardado» y lo guardado en el dispositivo NO cambia (no se finge el nuevo valor ni se devuelve el viejo como si fuera el nuevo)',
      `${fallo.err.slice(0, 70)}…; texto conservado=${fallo.texto === TEXTO}; botón «${fallo.boton}»; guardado «${fallo.guardado}»`, /No se ha podido guardar/.test(fallo.err) && fallo.texto === TEXTO && fallo.boton === 'Reintentar guardado' && fallo.guardado === '');
    await p.evaluate(() => { window.__fallarAlmacen = false; }); await p.click('#fi-radar [data-nota=guardar]'); await p.waitForSelector('#fi-radar .nota-txt'); await p.waitForTimeout(300);
    await p.reload(); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.seg-item');
    const rec = N(await p.textContent('.seg-item .nota-txt'));
    ev('L5', 'Recuperar espacio, reintentar y recargar', 'El reintento guarda; tras recargar, la nota está en «Mi seguimiento»', `«${rec}»`, rec === TEXTO);
    // error de lectura ≠ radar vacío
    await p.evaluate(() => localStorage.setItem('klever_radar_local', '{datos dañados')); await p.reload(); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-radar .vacio-util'); await p.waitForTimeout(300);
    const lec = await p.evaluate(() => ({ t: document.querySelector('#seg-radar').textContent.replace(/\s+/g, ' '), crudo: localStorage.getItem('klever_radar_local'), reint: !!document.querySelector('[data-acc=reintentar]') }));
    ev('L6', 'Un fallo de lectura no se muestra como radar vacío', 'Dice que no se puede leer (y que no significa que esté vacío), ofrece Reintentar y NO borra el valor dañado', `${lec.t.slice(0, 120)}…; crudo conservado=${lec.crudo === '{datos dañados'}`, /no se puede leer/.test(lec.t) && /no significa que tu radar esté vacío/.test(lec.t) && lec.reint && !/Aún no has guardado/.test(lec.t) && lec.crudo === '{datos dañados');
    await p.ctx.close();
    // con cuenta: la lectura falla
    const q = await nuevo(b, 1440, 900); await entrarCon(q, mail('PR')); await q.route('**/api/radar', r => r.request().method() === 'GET' ? r.abort() : r.continue());
    await q.evaluate(() => { location.hash = '#seguimiento'; }); await q.waitForSelector('#seg-radar .vacio-util'); await q.waitForTimeout(300); const t = N(await q.textContent('#seg-radar'));
    ev('L6b', 'Con cuenta, un fallo de lectura del radar tampoco es «vacío»', 'Mensaje de error con Reintentar; no dice «Aún no has guardado ninguna empresa»', t.slice(0, 140), /no significa que tu radar esté vacío/.test(t) && !/Aún no has guardado/.test(t));
    await q.ctx.close();
  }

  // =================== 3 y 4. Primera visita sin cuenta y regreso con cuenta ===================
  for (const w of [320, 390]) {
    const h = 780, p = await nuevo(b, w, h); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    // --- primera visita
    await p.goto(B); await p.waitForSelector('.inicio-revista a'); await snap(p, 'S0-portada-con-historia', w); await p.click('.inicio-revista a'); await p.waitForSelector('.rev-tarjeta');
    const lista = N(await p.textContent('.rev-tarjeta')); await p.click('.rev-enlaces a >> nth=0'); await p.waitForSelector('.art h1'); await p.waitForTimeout(300);
    const hist = await p.evaluate(() => ({ h1: document.querySelector('.art h1').textContent, aviso: document.querySelector('.art-aviso')?.textContent.replace(/\s+/g, ' '), firma: document.querySelector('.art-firma').textContent.replace(/\s+/g, ' '), fuentes: document.querySelectorAll('.art-fuentes li').length, tabla: !!document.querySelector('.art table'), empresa: !!document.querySelector('button[data-ficha=HNORT]'), probar: !!document.querySelector('[data-probar=HNORT]') }));
    await snap(p, 'S1-historia', w, true);
    ev('L7-' + w, `Historia legible sin cuenta, con autor, fecha, fuentes y empresa vinculada; ficticia desde el título (${w} px)`, 'Título con «Caso ficticio»; aviso de caso ficticio; autor y fecha; 6 fuentes de ejemplo; tabla de proyectos; empresa vinculada; botón «Probar en mi cartera»; sin desbordamiento',
      `${hist.h1.slice(0, 60)}…; ${hist.firma.slice(0, 90)}; fuentes ${hist.fuentes}; sin desborde ${await sinDesborde(p)}`, /Caso ficticio/.test(hist.h1) && /inventados/.test(hist.aviso) && /Ana Ejemplo/.test(hist.firma) && /20 oct 2026/.test(hist.firma) && hist.fuentes === 6 && hist.tabla && hist.empresa && hist.probar && await sinDesborde(p) && /Caso ficticio/.test(lista));
    // opinión: hecho / interpretación / qué haría cambiar de opinión; revisión fechada; la original sigue accesible
    await p.click('.art-opinion a'); await p.waitForSelector('.art-versiones'); await p.waitForTimeout(300);
    const t1 = await p.evaluate(() => ({ h2: [...document.querySelectorAll('.art h2')].map(e => e.textContent), titulo: document.querySelector('.art h1').textContent, posterior: document.querySelector('.art-posterior')?.textContent.replace(/\s+/g, ' ') || '', versiones: [...document.querySelectorAll('.art-versiones a')].map(e => e.textContent) }));
    await snap(p, 'S2-opinion-original', w, true);
    await p.click('.art-posterior a'); await p.waitForFunction(() => /Revisión/.test(document.querySelector('.art h1')?.textContent || '')); await p.waitForTimeout(300);
    const t2 = await p.evaluate(() => ({ titulo: document.querySelector('.art h1').textContent, simulado: document.querySelector('.art-aviso')?.parentElement.textContent.includes('Desenlace simulado'), firma: document.querySelector('.art-firma').textContent.replace(/\s+/g, ' ') }));
    await snap(p, 'S3-revision-simulada', w, true);
    await p.click('.art-versiones a >> nth=0'); await p.waitForFunction(() => /solo uno de los dos/.test(document.querySelector('.art h1')?.textContent || '')); const orig = N(await p.textContent('.art h1'));
    ev('L8-' + w, `Opinión firmada con hecho, interpretación y qué cambiaría la opinión; revisión fechada y simulada; la original sigue accesible (${w} px)`, 'La tesis original tiene Hecho observado / Interpretación / Qué me haría cambiar de opinión / Pregunta, aviso de revisión posterior; la revisión dice «Desenlace simulado», cita la tesis que revisa y la original se conserva intacta',
      `${t1.h2.join(' | ')}; ${t1.posterior.slice(0, 80)}; revisión: ${t2.titulo}; ${t2.firma.slice(0, 100)}; original: ${orig}`, ['Hecho observado', 'Interpretación del autor', 'Qué me haría cambiar de opinión', 'Pregunta para seguir'].every(x => t1.h2.includes(x)) && /revisión posterior/.test(t1.posterior) && t1.versiones.length === 2 && t2.simulado && /Revisa la tesis del 20 oct 2026/.test(t2.firma) && /solo uno de los dos contratos/.test(orig) && await sinDesborde(p));
    // probar en mi cartera: sin cuenta, con la cartera de ejemplo
    await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form'); await p.waitForTimeout(300);
    const pre = await p.evaluate(() => ({ ticker: document.querySelector('#lab-ticker').value, ejemplo: document.querySelector('.lab-ejemplo')?.textContent.replace(/\s+/g, ' ') || '', base: document.querySelector('#lab-base').selectedOptions[0].textContent }));
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.waitForTimeout(150);
    const det = await p.evaluate(() => ({ abierto: document.querySelector('#lab-metodo details')?.open, visibleRed: [...document.querySelectorAll('#lab-metodo details p')].some(e => e.offsetParent !== null) }));
    await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab'); await p.waitForTimeout(200);
    const res = await p.evaluate(() => ({ origen: document.querySelector('.lab-origen')?.textContent.replace(/\s+/g, ' ') || '', filas: Object.fromEntries([...document.querySelector('#lab-res table.tabla-lab').querySelectorAll('tbody tr:not(.tot)')].map(tr => [tr.querySelector('th b').textContent.trim(), [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/ /g, ' ').trim())])), guardar: document.querySelector('#lab-res .lab-guardar')?.textContent.replace(/\s+/g, ' ') || '', form: !!document.querySelector('#lab-guardar-btn'), orden: (() => { const o = document.querySelector('.lab-origen'), t = document.querySelector('#lab-res table'); return !!(o.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); })() }));
    await snap(p, 'S4-laboratorio-primera-visita', w, true);
    ev('L9-' + w, `Primera visita: «Probar en mi cartera» con la cartera de ejemplo; A 60 / B 40 + C 10 → 54 / 36 / 10 (${w} px)`, 'La empresa llega elegida (HNORT); se ofrece la cartera de ejemplo (no es tuya); el redondeo está en un desplegable cerrado; primero se dice de dónde sale el peso (KO cede 6, PG cede 4) y después la tabla (KO 54, PG 36, HNORT 10); la simulación es temporal y no hay formulario de guardado',
      `${pre.ticker} / ${pre.base}; ejemplo «${pre.ejemplo.slice(0, 50)}»; detalle abierto=${det.abierto}, visible=${det.visibleRed}; ${res.origen.slice(0, 120)}; ${JSON.stringify(res.filas)}; ${res.guardar.slice(0, 60)}`,
      pre.ticker === 'HNORT' && /Cartera de ejemplo/.test(pre.base) && /no es tuya/.test(pre.ejemplo) && det.abierto === false && !det.visibleRed && /KO cede 6 \(60 → 54 %\)/.test(res.origen) && /PG cede 4 \(40 → 36 %\)/.test(res.origen) && res.orden
        && res.filas.KO[1] === '54 %' && res.filas.PG[1] === '36 %' && res.filas.HNORT[1] === '10 %' && /temporal/.test(res.guardar) && !res.form && await sinDesborde(p));
    // --- regreso con cuenta
    const email = mail('R' + w); await entrarCon(p, email);
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-crear-ejemplo');
    await p.click('#lab-crear-ejemplo'); await p.waitForSelector('#lab-guardar-btn'); await p.waitForTimeout(300);
    const pregPre = await p.inputValue('#lab-pregunta'); await p.fill('#lab-revisar', '2026-12-15'); await p.fill('#lab-nota', 'Mirar también el precio del contrato de D');
    await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar'); await p.waitForTimeout(400);
    const idEsc = +(await p.evaluate(() => location.hash.match(/escenario-(\d+)/)[1]));
    await snap(p, 'S5-escenario-guardado', w, true);
    // cierro y vuelvo a entrar con el mismo correo
    await salir(p); await entrarCon(p, email); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.esc-item'); await p.waitForFunction(() => !document.querySelector('#seg-escenarios').textContent.includes('Cargando'));
    const carta = N(await p.textContent('.esc-item')); await snap(p, 'S6-regreso-seguimiento', w, true);
    await p.click('.esc-item a.btn'); await p.waitForSelector('#esc-editar'); await p.waitForTimeout(300);
    const det2 = await p.evaluate(() => ({ t: document.querySelector('#lab-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '), enlaces: [...document.querySelectorAll('.esc-historia a')].map(a => a.getAttribute('href')) }));
    await snap(p, 'S7-regreso-escenario', w, true);
    ev('L10-' + w, `Regreso con cuenta: pregunta, fecha, base original y revisión editorial (${w} px)`, 'La pregunta de la historia llega precargada y se guarda; al volver a entrar se ven la pregunta «¿Se han firmado los dos contratos anunciados?», la revisión prevista «15 dic 2026», la base KO 60 / PG 40, la propuesta 54/36/10 y los enlaces a la historia, la opinión y la revisión editorial (desenlace simulado)',
      `precargada «${pregPre}»; tarjeta: ${carta.slice(0, 110)}; enlaces ${det2.enlaces.join(',')}`, pregPre === '¿Se han firmado los dos contratos anunciados?' && /¿Se han firmado los dos contratos anunciados\?/.test(carta) && /Revisión prevista: 15 dic 2026/.test(carta) && /Base: KO 60 % · PG 40 %/.test(det2.t) && /Propuesta: KO 54 % · PG 36 % · HNORT 10 %/.test(det2.t)
        && det2.enlaces.includes('#historia-hidrogeno-norte') && det2.enlaces.includes('#tesis-hidrogeno-norte-1') && det2.enlaces.includes('#tesis-hidrogeno-norte-2') && /desenlace simulado/.test(det2.t) && await sinDesborde(p));
    // un cambio posterior de la cartera conserva los pesos históricos
    const cart = (await api(p, 'GET', '/portfolios')).j[0];
    await api(p, 'PUT', '/portfolios/' + cart.id, { posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }], nombre: cart.nombre, tesis: '', revision: cart.revision });
    await p.reload(); await p.waitForSelector('#esc-editar'); await p.waitForTimeout(400);
    const post = await p.evaluate(() => document.querySelector('#lab-cuerpo').textContent.replace(/ /g, ' ').replace(/\s+/g, ' '));
    ev('L11-' + w, `Un cambio posterior en mi cartera conserva los pesos históricos del escenario (${w} px)`, 'Avisa de la versión posterior y sigue mostrando base KO 60 / PG 40 (no 50/50) y la propuesta original', post.match(/La cartera cambió[^.]*\./)?.[0] || '', /La cartera cambió después de este escenario/.test(post) && /Base: KO 60 % · PG 40 %/.test(post) && /Propuesta: KO 54 %/.test(post));
    // descartar (conserva) frente a eliminar (borra)
    await p.click('[data-estado=descartado]'); await p.waitForFunction(() => /Descartado/.test(document.querySelector('#lab-cuerpo h1')?.textContent || '')); const aunEsta = (await api(p, 'GET', '/escenarios/' + idEsc)).s;
    await p.click('#esc-eliminar'); await p.waitForSelector('#seg-escenarios'); await p.waitForTimeout(500); const yaNo = (await api(p, 'GET', '/escenarios/' + idEsc)).s;
    ev('L12-' + w, `«Marcar como descartado» conserva; «Eliminar definitivamente» borra (${w} px)`, 'Tras descartar, el escenario sigue existiendo (200); tras eliminar, 404; la cartera no se toca', `descartado → ${aunEsta}; eliminado → ${yaNo}`, aunEsta === 200 && yaNo === 404);
    ev('L13-' + w, `Sin errores de JavaScript en las dos visitas (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }

  // =================== 5. Simular y guardar deja intactas la composición privada y la publicación ===================
  {
    const p = await nuevo(b, 1440, 900); await entrarCon(p, mail('PI'));
    const pub = await api(p, 'POST', '/portfolios', { nombre: 'Pública de prueba', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], tesis: 'Tesis pública de prueba' });
    await api(p, 'PATCH', '/portfolios/' + pub.j.id, { publico: true, revision: pub.j.revision });
    const antes = await api(p, 'GET', '/portfolios/' + pub.j.id), antesPub = await api(p, 'GET', '/public/' + pub.j.id);
    await p.reload(); await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'HNORT'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-guardar-btn');
    await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar');
    const desp = await api(p, 'GET', '/portfolios/' + pub.j.id), despPub = await api(p, 'GET', '/public/' + pub.j.id);
    ev('L14', 'Simular y guardar el escenario deja intactas la composición privada y la publicación', 'La cartera pública conserva posiciones, revisión y estado público; la vista pública no cambia', `revisión ${antes.j.revision}→${desp.j.revision}; posiciones iguales ${JSON.stringify(antes.j.posiciones) === JSON.stringify(desp.j.posiciones)}; pública igual ${JSON.stringify(antesPub.j) === JSON.stringify(despPub.j)}`, antes.j.revision === desp.j.revision && JSON.stringify(antes.j.posiciones) === JSON.stringify(desp.j.posiciones) && desp.j.publico === 1 && JSON.stringify(antesPub.j) === JSON.stringify(despPub.j));
    // ficha de la empresa ficticia: historia relacionada y procedencia por dato
    await verFicha(p, 'HNORT'); const f = N(await p.textContent('#dlg-ficha'));
    ev('L15', 'Ficha de la empresa del caso: historia relacionada y procedencia', 'Enlaza a la historia, se llama «empresa ficticia» y declara «PRUEBA ficticios» para su ejercicio (no SEC); «Probar en mi cartera» disponible', f.slice(0, 160), /Historia relacionada/.test(f) && /empresa ficticia/.test(f) && /PRUEBA ficticios/.test(f) && !/SEC EDGAR/.test(f) && /Probar en mi cartera/.test(f));
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-L');
})();
