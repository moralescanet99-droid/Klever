// Bloque E (ronda 6): los siete flujos de la prueba de uso, con evidencia observada (esperado · observado · resultado).
// Salida: ronda6/evidencias-E.json y capturas en ronda6/evidencias/ (las capturas no se versionan).
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('./h.cjs');
const EV = EVDIR;
(async () => {
  const b = await chromium.launch();
  const token = p => p.evaluate(() => localStorage.getItem('klever_token'));
  const api = async (p, m, path, body) => { const t = await token(p); return p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, path, body, t]); };
  const pub = async (p, id) => p.evaluate(async id => { const r = await fetch('/api/public/' + id); return r.status === 200 ? (await r.json()).posiciones.map(x => x.ticker + ':' + x.peso).sort().join(',') : 'HTTP ' + r.status; }, id);
  const cuenta = async (p, id) => (await api(p, 'GET', '/portfolios/' + id)).j.posiciones.map(x => x.ticker + ':' + x.peso).sort().join(',');
  const guardado = p => p.waitForFunction(() => document.querySelector('#estado-live').textContent.startsWith('Guardada en tu cuenta'));
  const G = p => p.locator('.js-guardar >> visible=true');
  const hash = p => p.evaluate(() => location.hash);
  const vals = async (p, n = 4) => { const r = []; for (let i = 0; i < n; i++) r.push(await peso(p, i).inputValue()); return r.sort((a, c) => parseFloat(c.replace(',', '.')) - parseFloat(a.replace(',', '.'))).join(' '); }; // por peso (el orden de filas tras reabrir lo decide el servidor)
  const externo = async (p, id, posiciones) => { // otro dispositivo cambia la cartera en la cuenta (se espera >1 s: el sello de versión tiene resolución de segundo)
    await p.waitForTimeout(1200); const c = (await api(p, 'GET', '/portfolios/' + id)).j;
    return api(p, 'PUT', '/portfolios/' + id, { posiciones, revision: c.revision }); };

  // ===== F1: crear · editar · guardar · cerrar · reabrir · recargar =====
  let p = await nuevo(b, 1440, 900); await entrar(p, 'oro', 'E1'); const id = (await hash(p)).replace('#cartera-', '');
  const inicial = await vals(p);
  await peso(p).fill('30'); await peso(p, 1).fill('20'); await p.waitForTimeout(150);
  const antesG = await T(p, '#estado'); await G(p).click(); await guardado(p);
  const toastG = await T(p, '#toast'), estG = await T(p, '#estado');
  await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); const tarjeta = (await T(p, '.cartera-item')).replace(/\s+/g, ' ');
  await p.screenshot({ path: EV + 'F1-mis-carteras-guardada.png' });
  await p.click('.cartera-item'); await p.waitForSelector('#pos-tabla tbody tr'); const reabierta = await vals(p);
  await p.reload(); await p.waitForSelector('#pos-tabla tbody tr'); await p.waitForTimeout(300); const trasRecarga = await vals(p);
  ev('F1', 'Crear, editar, guardar, cerrar, reabrir y recargar', 'Antes de guardar «Cambios locales pendientes…»; tras guardar «Guardada en tu cuenta» y toast corto «Cartera guardada»; la tarjeta no marca cambios locales; reabrir y recargar conservan 30/25/25/20',
    `inicial ${inicial}; antes de guardar «${antesG}»; tras guardar «${estG}», toast «${toastG}»; tarjeta «${tarjeta}»; reabierta ${reabierta}; tras recargar ${trasRecarga}`,
    inicial === '25,0 25,0 25,0 25,0' && antesG.startsWith('Cambios locales pendientes de guardar en tu cuenta') && estG === 'Guardada en tu cuenta' && toastG === 'Cartera guardada' && !tarjeta.includes('Cambios locales') && tarjeta.includes('Asignado: 100 %') && reabierta === '30,0 25,0 25,0 20,0' && trasRecarga === reabierta, 'F1-mis-carteras-guardada.png');

  // ===== F3: cambios locales pendientes: la tarjeta dice a qué versión pertenece cada cifra =====
  await peso(p).fill('28'); await p.waitForTimeout(150);                // 98 %: incompleta, pendiente de guardar
  await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); const tl = (await T(p, '.cartera-item')).replace(/\s+/g, ' ');
  await p.screenshot({ path: EV + 'F3-tarjeta-cambios-locales-1440.png' });
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(200); await p.screenshot({ path: EV + 'F3-tarjeta-cambios-locales-390.png' }); await p.setViewportSize({ width: 1440, height: 900 });
  const ancho = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.reload(); await p.waitForSelector('.cartera-item'); await p.click('.cartera-item'); await p.waitForSelector('#pos-tabla tbody tr'); await p.waitForTimeout(300);
  const recup = await vals(p), estR = await T(p, '#estado');
  ev('F3', 'Cambios locales pendientes de guardar: tarjeta y recuperación', 'Chip «Cambios locales pendientes de guardar en tu cuenta»; «Versión de tu cuenta: … Asignado: 100 %» y «Versión de este dispositivo: … Asignado: 98 % (incompleta)» con fecha y hora; tras recargar se recuperan 28/25/25/20',
    `tarjeta «${tl}»; recuperado ${recup} / «${estR}»; ancho de página ${ancho}`,
    tl.includes('Cambios locales pendientes de guardar en tu cuenta') && /Versión de tu cuenta:.*Asignado: 100 %/.test(tl) && /Versión de este dispositivo:.*Asignado: 98 % \(incompleta\).*editada el .*\d:\d\d/.test(tl) && recup === '28,0 25,0 25,0 20,0' && estR.startsWith('Cambios locales pendientes de guardar en tu cuenta') && ancho <= 1440, 'F3-tarjeta-cambios-locales-1440.png');

  // ===== F5a: conflicto al abrir (la cuenta cambió desde otro dispositivo) =====
  await externo(p, id, [{ ticker: 'GLD', peso: 40 }, { ticker: 'IAU', peso: 30 }, { ticker: 'GDX', peso: 30 }]);
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.waitForTimeout(200);
  const dlg = (await T(p, '#dlg-conflicto')).replace(/\s+/g, ' '); await p.screenshot({ path: EV + 'F5a-conflicto-1440.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); const sigueAbierto = await p.locator('#dlg-conflicto[open]').count(), copiaEscape = await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id);
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]');
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(200); await p.screenshot({ path: EV + 'F5a-conflicto-390.png' }); await p.setViewportSize({ width: 1440, height: 900 });
  await p.click('#cn-despues'); await p.waitForTimeout(300);
  const trasDespues = await vals(p, 3), copiaDespues = await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id);
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-cuenta-b'); await p.waitForTimeout(400);
  const trasCuenta = await vals(p, 3), copiaCuenta = await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id), estC = await T(p, '#estado');
  ev('F5a', 'Conflicto al abrir: versión local frente a versión de la cuenta', 'Diálogo con «Versión de este dispositivo» y «Versión de tu cuenta» con fecha y hora y qué cambia; Escape y «Decidir después» posponen sin perder nada; «Usar la versión de tu cuenta» descarta lo local',
    `diálogo «${dlg}»; Escape: diálogo abierto=${sigueAbierto}, copia local=${copiaEscape}; tras «Decidir después» se ve ${trasDespues} y la copia local sigue=${copiaDespues}; tras «Usar la versión de tu cuenta» ${trasCuenta}, copia local=${copiaCuenta}, «${estC}»`,
    dlg.includes('Versión de este dispositivo') && dlg.includes('Versión de tu cuenta') && /Editada el .*\d:\d\d/.test(dlg) && /Modificada el .*\d:\d\d/.test(dlg) && dlg.includes('Solo en este dispositivo: NEM') && dlg.includes('GLD:') && !/otra sesión/i.test(dlg)
    && sigueAbierto === 0 && copiaEscape && trasDespues === '40,0 30,0 30,0' && copiaDespues && trasCuenta === '40,0 30,0 30,0' && !copiaCuenta && estC === 'Guardada en tu cuenta', 'F5a-conflicto-1440.png');

  // ===== F5b/F5c: conflicto al guardar (409 del servidor) =====
  await peso(p).fill('35'); await p.waitForTimeout(150);
  await externo(p, id, [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 25 }, { ticker: 'GDX', peso: 25 }]);
  await G(p).click(); await p.waitForSelector('#dlg-conflicto[open]'); const cuentaSinTocar = await cuenta(p, id); const dlg2 = (await T(p, '#dlg-conflicto')).replace(/\s+/g, ' ');
  await p.screenshot({ path: EV + 'F5b-conflicto-al-guardar.png' });
  await p.click('#cn-local-b'); await p.waitForTimeout(400); const trasElegir = await cuenta(p, id), pendiente = await T(p, '#estado'), etqG = await T(G(p), 'xpath=.');
  await G(p).click(); await guardado(p); const trasLocal = await cuenta(p, id);
  ev('F5b', 'Conflicto al guardar: elegir la versión de este dispositivo NO escribe; Guardar sí', 'El servidor rechaza (409) sin guardar nada; al elegir la local se vuelve al editor sin tocar la cuenta; al pulsar Guardar se guarda esa y no otra',
    `cuenta justo tras el rechazo «${cuentaSinTocar}» (la del otro dispositivo, intacta); diálogo «${dlg2.slice(0, 200)}…»; tras elegir la local la cuenta sigue «${trasElegir}» y el estado es «${pendiente}» con botón «${etqG}»; tras pulsar Guardar la cuenta tiene «${trasLocal}»`,
    cuentaSinTocar === 'GDX:25,GLD:50,IAU:25' && dlg2.includes('Versión de este dispositivo') && dlg2.includes('Versión de tu cuenta') && trasElegir === cuentaSinTocar && pendiente.startsWith('Cambios locales pendientes') && trasLocal === 'GDX:30,GLD:35,IAU:30' && (await T(p, '#estado')) === 'Guardada en tu cuenta', 'F5b-conflicto-al-guardar.png');
  await peso(p).fill('20'); await p.waitForTimeout(150);
  await externo(p, id, [{ ticker: 'GLD', peso: 60 }, { ticker: 'IAU', peso: 20 }, { ticker: 'GDX', peso: 20 }]);
  await G(p).click(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-despues'); await p.waitForTimeout(300);
  const motivo = await T(p, '#motivo'), etq = await T(G(p), 'xpath=.'), copiaDesp = await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id), cuentaDesp = await cuenta(p, id);
  await p.screenshot({ path: EV + 'F5c-decidir-despues.png' });
  ev('F5c', 'Conflicto al guardar y «Decidir después»', 'No se guarda nada, se explica el motivo, los cambios locales siguen en pantalla y en el dispositivo y el botón pasa a «Reintentar guardado»',
    `motivo «${motivo}»; botón «${etq}»; copia local=${copiaDesp}; cuenta «${cuentaDesp}»; valor en pantalla ${await peso(p).inputValue()}`,
    motivo.includes('La cartera cambió en tu cuenta') && etq === 'Reintentar guardado' && copiaDesp && cuentaDesp === 'GDX:20,GLD:60,IAU:20' && (await peso(p).inputValue()) === '20,0', 'F5c-decidir-despues.png');
  await p.ctx.close();

  // ===== F4: fallo de guardado y recuperación (móvil) =====
  p = await nuevo(b, 390, 844); await entrar(p, 'oro', 'E4'); const id4 = (await hash(p)).replace('#cartera-', '');
  await peso(p).fill('30'); await peso(p, 1).fill('20'); await p.waitForTimeout(150);
  await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue());
  await p.locator('#barra-guardar .js-guardar').click(); await p.waitForTimeout(600);
  const fallo = await T(p, '#estado'), etqF = await T(p, '#barra-guardar .js-guardar'), toastF = await p.locator('#toast.on').count();
  await p.screenshot({ path: EV + 'F4-fallo-guardado-390.png' });
  await p.unroute('**/api/portfolios/*'); await p.locator('#barra-guardar .js-guardar').click(); await guardado(p);
  ev('F4', 'Fallo de guardado y recuperación', 'Botón «Reintentar guardado»; texto «No se pudo guardar… siguen en este dispositivo»; sin toast de éxito; al reintentar, «Guardada en tu cuenta» y el botón vuelve a «Guardar cartera»',
    `tras fallar: «${fallo}», botón «${etqF}», toasts=${toastF}; tras reintentar «${await T(p, '#estado')}», botón «${await T(p, '#barra-guardar .js-guardar')}», cuenta «${await cuenta(p, id4)}»`,
    fallo.startsWith('No se pudo guardar') && fallo.includes('siguen en este dispositivo') && etqF === 'Reintentar guardado' && toastF === 0 && (await T(p, '#estado')) === 'Guardada en tu cuenta' && /:30/.test(await cuenta(p, id4)) && /:20/.test(await cuenta(p, id4)), 'F4-fallo-guardado-390.png');

  // ===== F2: abrir el enlace de acceso en otro navegador (aviso persistente) =====
  const q0 = await nuevo(b, 390, 844); await q0.goto(B); await q0.waitForSelector('.plantilla'); await q0.click('[data-plantilla=oro]'); await q0.waitForSelector('#vista-cartera:not([hidden])');
  await q0.click('.js-guardar >> visible=true'); await q0.waitForSelector('#dlg-acceso[open]'); await q0.fill('#acc-email', `e2-${Date.now()}@example.com`); await q0.check('#acc-acepto'); await q0.click('#form-acceso button'); await q0.waitForSelector('#acc-paso2:not([hidden])');
  const link = await q0.getAttribute('#acc-dev a', 'href');
  const o = await nuevo(b, 390, 844); await o.goto(link); await o.waitForSelector('#vista-carteras:not([hidden])'); await o.waitForTimeout(400);
  const av = (await T(o, '#aviso-cuenta')).replace(/\s+/g, ' '), visible = await o.isVisible('#aviso-cuenta'), toasts = await o.locator('#toast.on').count();
  const altoToast = await o.evaluate(() => { const t = document.querySelector('#toast'); return getComputedStyle(t).opacity; });
  await o.screenshot({ path: EV + 'F2-aviso-otro-navegador-390.png' });
  await o.reload(); await o.waitForSelector('#vista-carteras:not([hidden])'); const tras = await o.isVisible('#aviso-cuenta');
  await o.click('#aviso-cerrar'); await o.waitForTimeout(150); const cerrado = !(await o.isVisible('#aviso-cuenta'));
  await o.reload(); await o.waitForSelector('#vista-carteras:not([hidden])'); const sigueCerrado = !(await o.isVisible('#aviso-cuenta'));
  ev('F2', 'Enlace de acceso abierto en otro navegador', 'Aviso persistente en «Mis carteras» antes del formulario: la cartera todavía no se ha guardado, el borrador no está en este navegador; sin toast flotante ni confirmación de guardado; sobrevive a recargar; se puede cerrar y no vuelve',
    `aviso «${av}»; visible=${visible}; toasts flotantes=${toasts}; tras recargar visible=${tras}; tras «Entendido» oculto=${cerrado}; tras recargar sigue oculto=${sigueCerrado}; carteras creadas=${await o.locator('.cartera-item').count()}`,
    visible && av.includes('Tu cartera todavía no se ha guardado en la cuenta') && av.includes('El borrador no está disponible en este navegador') && av.includes('Vuelve al navegador donde lo creaste') && !/guardada con éxito|Cartera guardada/.test(av) && toasts === 0 && tras && cerrado && sigueCerrado && (await o.locator('.cartera-item').count()) === 0, 'F2-aviso-otro-navegador-390.png');
  await o.ctx.close(); await q0.ctx.close(); await p.ctx.close();

  // ===== F6: cartera pública: editar sin alterar antes de tiempo la publicación =====
  p = await nuevo(b, 1440, 900); await entrar(p, 'oro', 'E6'); const id6 = (await hash(p)).replace('#cartera-', '');
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Tesis de prueba para la ronda 6'); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública');
  await p.waitForTimeout(300); const publicada = await pub(p, id6), etqPub = await T(G(p), 'xpath=.'), pendInicial = await p.isVisible('#pub-pend');
  await peso(p).fill('40'); await p.waitForTimeout(200);                // 115 %: inválido mientras es pública
  const pendInval = await p.isVisible('#pub-pend'), pendTxt = (await T(p, '#pub-pend')), durante = await pub(p, id6), motivo6 = await T(p, '#motivo');
  await p.screenshot({ path: EV + 'F6-publica-pendiente-1440.png' });
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(250); const etqMov = await T(p, '#barra-guardar .js-guardar'), altoBtn = await p.evaluate(() => Math.round(document.querySelector('#barra-guardar .js-guardar').getBoundingClientRect().height));
  const anchoMov = await p.evaluate(() => document.documentElement.scrollWidth); await p.screenshot({ path: EV + 'F6-publica-pendiente-390.png' }); await p.setViewportSize({ width: 1440, height: 900 });
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Privada'); await p.waitForTimeout(300);
  const trasDespub = { valor: await peso(p).inputValue(), estado: await T(p, '#estado'), copia: await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id6), publico: await pub(p, id6) };
  await p.reload(); await p.waitForSelector('#pos-tabla tbody tr'); await p.waitForTimeout(400); const recarga = { valor: await peso(p).inputValue(), estado: await T(p, '#estado'), conflicto: await p.locator('#dlg-conflicto[open]').count() };
  ev('F6a', 'Editar una cartera pública con un reparto inválido', 'Botón «Guardar y actualizar publicación»; chip «Tus cambios aún no son públicos»; la versión publicada no cambia; en móvil el botón puede ocupar dos líneas y no desborda',
    `publicada «${publicada}»; botón «${etqPub}» (chip antes de editar visible=${pendInicial}); con 115 %: chip visible=${pendInval} «${pendTxt}», publicada «${durante}», motivo «${motivo6}»; móvil: botón «${etqMov}» de ${altoBtn} px, ancho de página ${anchoMov}`,
    etqPub === 'Guardar y actualizar publicación' && !pendInicial && pendInval && pendTxt === 'Tus cambios aún no son públicos' && durante === publicada && motivo6.includes('Reduce los pesos hasta sumar 100 %') && etqMov === 'Guardar y actualizar publicación' && anchoMov <= 390, 'F6-publica-pendiente-390.png');
  ev('F6b', 'Dejar de publicar con cambios locales inválidos', 'Dejar de publicar funciona y NO se pierde el trabajo local: sigue el 40, sigue «Cambios locales pendientes…» y sobrevive a recargar sin conflicto falso',
    `tras dejar de publicar: valor ${trasDespub.valor}, «${trasDespub.estado}», copia local=${trasDespub.copia}, ya no es público («${trasDespub.publico}»); tras recargar: valor ${recarga.valor}, «${recarga.estado}», diálogos de conflicto=${recarga.conflicto}`,
    trasDespub.valor === '40,0' && trasDespub.estado.startsWith('Cambios locales pendientes') && trasDespub.copia && trasDespub.publico.startsWith('HTTP') && recarga.valor === '40,0' && recarga.estado.startsWith('Cambios locales pendientes') && recarga.conflicto === 0, 'F6-publica-pendiente-1440.png');
  // publicar de nuevo y guardar un cambio válido: una sola confirmación corta
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await peso(p).fill('25'); await p.waitForTimeout(150); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
  await peso(p).fill('20'); await peso(p, 1).fill('30'); await p.waitForTimeout(150); const antesPub = await pub(p, id6);
  await G(p).click(); await guardado(p); const toast6 = await T(p, '#toast'), despuesPub = await pub(p, id6), estado6 = await T(p, '#estado'), pend6 = await p.isVisible('#pub-pend');
  ev('F6c', 'Guardar una cartera pública con un reparto válido', 'Se actualiza la publicación con una sola confirmación corta; desaparece «Tus cambios aún no son públicos»',
    `publicada antes «${antesPub}»; después «${despuesPub}»; toast «${toast6}»; estado «${estado6}»; chip de cambios no públicos visible=${pend6}`,
    antesPub !== despuesPub && /actualizada|guardada/i.test(toast6) && toast6.length < 50 && estado6 === 'Guardada en tu cuenta' && !pend6, '');
  await p.ctx.close();

  // ===== F7: comprobaciones con datos ausentes =====
  p = await nuevo(b, 390, 844); await p.goto(B + '#empresas'); await p.waitForSelector('#empresas-cards .emp-card');
  const ideas = await p.evaluate(async () => (await fetch('/api/ideas')).json());
  const esperado = [...ideas].sort((a, c) => c.cumplidos - a.cumplidos || (a.evaluados - a.cumplidos) - (c.evaluados - c.cumplidos) || a.ticker.localeCompare(c.ticker)).map(r => r.ticker);
  const real = ideas.map(r => r.ticker), parciales = ideas.filter(r => r.sin_datos > 0);
  const tarjetas = await p.evaluate(() => [...document.querySelectorAll('#empresas-cards .emp-card')].map(c => c.querySelector('.simbolo').textContent + ': ' + c.querySelector('.ec-res').innerText.replace(/\s+/g, ' ')));
  const conDatos = tarjetas.find(t => /de 5 superadas/.test(t)), parcial = tarjetas.find(t => /sin datos/.test(t));
  // un parcial no se trata como fallo: junto a otra con las mismas superadas, la que tiene sin datos NO queda detrás por ello
  const par = parciales.find(a => ideas.some(c => c.ticker !== a.ticker && c.cumplidos === a.cumplidos && c.sin_datos === 0 && c.no_superadas > a.no_superadas));
  const pos = par ? ideas.findIndex(x => x.ticker === par.ticker) : -1, otra = par ? ideas.find(c => c.ticker !== par.ticker && c.cumplidos === par.cumplidos && c.sin_datos === 0 && c.no_superadas > par.no_superadas) : null;
  const posOtra = otra ? ideas.findIndex(x => x.ticker === otra.ticker) : -1;
  await p.screenshot({ path: EV + 'F7-empresas-sin-datos-390.png' });
  await p.fill('#emp-buscar', parciales[0]?.nombre || 'jpmorgan'); await p.waitForTimeout(200); await p.click('#empresas-cards .ver-ficha'); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(300);
  const ficha = (await T(p, '#fi-cuerpo')).replace(/\s+/g, ' '), grupos = await p.locator('#fi-cuerpo h3.grp').allTextContents(), anchoF = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: EV + 'F7-ficha-sin-datos-390.png' });
  ev('F7a', 'Resultados con datos ausentes en la lista', 'Completas: «N de 5 superadas»; parciales: «N superadas · M sin datos» (nunca «N de 5» ni «no disponibles»); el parcial no se muestra como completo',
    `completa «${conDatos}»; parcial «${parcial}»; empresas parciales en los datos: ${parciales.map(r => r.ticker + ' ' + r.cumplidos + '/' + r.sin_datos).join(', ')}`,
    !!conDatos && !!parcial && /\d+ superadas \d+ sin datos/.test(parcial) && !/ de 5/.test(parcial) && !/no disponible/.test(parcial), 'F7-empresas-sin-datos-390.png');
  ev('F7b', 'Regla real de orden', 'Superadas (desc) → no superadas (asc) → símbolo; sin datos no suman ni restan: el orden del servidor coincide con la regla recalculada y un parcial no queda detrás de otra empresa solo por tener datos ausentes',
    `${real.length} empresas; coincide con la regla=${JSON.stringify(real) === JSON.stringify(esperado)}; ejemplo: ${par ? `${par.ticker} (${par.cumplidos} superadas, ${par.no_superadas} no superadas, ${par.sin_datos} sin datos) está en la posición ${pos + 1} y ${otra.ticker} (${otra.cumplidos} superadas, ${otra.no_superadas} no superadas, 0 sin datos) en la ${posOtra + 1}` : 'sin ejemplo en los datos de prueba'}`,
    JSON.stringify(real) === JSON.stringify(esperado) && (!par || pos < posOtra), '');
  ev('F7c', 'Ficha con datos ausentes', 'Grupos «Superadas», «No superadas» y «Sin datos» con su recuento; texto «Evaluación parcial»; unidades «Importes en miles de millones de USD; ROIC en %»',
    `grupos ${grupos.join(' | ')}; ficha «${ficha.slice(0, 260)}…»; ancho ${anchoF}`,
    grupos.some(g => g.startsWith('Sin datos')) && ficha.includes('Evaluación parcial') && ficha.includes('Importes en miles de millones de USD; ROIC en %') && ficha.includes('no cuenta como no superada') && anchoF <= 390, 'F7-ficha-sin-datos-390.png');

  // ===== título de la cartera en móvil: hasta dos líneas =====
  const pm = await nuevo(b, 390, 844); await entrar(pm, 'oro', 'E8');
  await pm.fill('#nombre', 'Mi cartera de dividendos con un nombre largo de prueba'); await pm.waitForTimeout(200);
  const m = await pm.evaluate(() => { const n = document.querySelector('#nombre'), cs = getComputedStyle(n), lh = parseFloat(cs.lineHeight); return { alto: Math.round(n.getBoundingClientRect().height), linea: Math.round(lh), cortado: n.scrollHeight > n.clientHeight + 1, ancho: document.documentElement.scrollWidth }; });
  await pm.screenshot({ path: EV + 'F8-titulo-dos-lineas-390.png' });
  await pm.fill('#nombre', 'x'.repeat(8) + ' ' + 'Nombre de ochenta caracteres, el máximo permitido, para medir el límite de dos líneas ok'.slice(0, 71)); await pm.waitForTimeout(150);
  const lim = await pm.evaluate(() => { const n = document.querySelector('#nombre'); return { alto: Math.round(n.getBoundingClientRect().height), largo: n.value.length, cortado: n.scrollHeight > n.clientHeight + 1 }; });
  await pm.fill('#nombre', 'Mi cartera de dividendos con un nombre largo de prueba');
  await pm.keyboard.press('Enter'); const sinSalto = !(await pm.inputValue('#nombre')).includes('\n');
  ev('F8', 'Título largo de la cartera en móvil', 'Ocupa hasta dos líneas completas, sin cortarse con puntos suspensivos ni desbordar la página; Enter no inserta saltos',
    `alto ${m.alto} px con línea de ${m.linea} px (≈ ${(m.alto / m.linea).toFixed(1)} líneas); cortado=${m.cortado}; ancho de página ${m.ancho}; sin saltos de línea=${sinSalto}. Límite medido: con ${lim.largo} caracteres (máximo 80) el campo mide ${lim.alto} px y ${lim.cortado ? 'el resto se desplaza dentro del campo' : 'cabe entero'}`,
    m.alto >= m.linea * 1.8 && m.alto <= m.linea * 2.6 && !m.cortado && m.ancho <= 390 && sinSalto, 'F8-titulo-dos-lineas-390.png');
  ev('F9', 'Sin errores de JavaScript en la batería E', 'Ninguno', [pm, p].flatMap(x => x.errs).join('|') || 'ninguno', [pm, p].every(x => x.errs.length === 0), '');
  await pm.ctx.close(); await p.ctx.close();
  await b.close(); fin('evidencias-E');
})();
