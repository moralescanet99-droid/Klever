// Batería H (ronda 10): pulido visual. Avisos en zona reservada, errores que permanecen, resumen de ROIC plegable y acciones alcanzables en 320/390/1440.
// «Texto ampliado» y «teclado» son SIMULACIONES (font-size del documento / ventana reducida): no equivalen a zoom ni a teclado reales.
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch();
  const G = p => p.locator('.js-guardar >> visible=true');
  const lum = c => { const [r, g, bl] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * bl; };
  const contraste = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  // rectángulos de todos los controles visibles (salvo el propio aviso) para comprobar que el aviso no se superpone a ninguno
  const solapes = p => p.evaluate(() => { const t0 = document.querySelector('#toast').getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect();
    const t = { left: t0.left, right: t0.right, top: Math.max(t0.top, av.top), bottom: Math.min(t0.bottom, av.bottom) };   // lo que realmente se ve: recortado por la zona reservada
    if (!(t.bottom > t.top) || !t0.width) return { n: 0, con: [] };
    const con = [...document.querySelectorAll('a,button,input,select,textarea,h1,h2,.cab')].filter(e => !e.closest('#avisos') && e.offsetParent !== null && !e.closest('[hidden]')).map(e => [e, e.getBoundingClientRect()])
      .filter(([e, r]) => r.width && r.height && r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top).map(([e]) => (e.id || e.className || e.tagName).toString().slice(0, 30));
    return { n: con.length, con }; });

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 720;
    // ===== H1: aviso de guardado en el editor: nunca se superpone, legible durante toda la animación =====
    let p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'H1' + w); await p.waitForTimeout(4600);
    await peso(p).fill('15'); await p.waitForTimeout(500); await G(p).click();   // se espera a que termine el desplazamiento propio de la app al enfocar el campo
    const muestras = []; for (let i = 0; i < 14; i++) { muestras.push(await p.evaluate(() => { const t = document.querySelector('#toast'), r = t.getBoundingClientRect(), cs = getComputedStyle(t), cab = document.querySelector('.cab').getBoundingClientRect(); return { op: +cs.opacity, top: Math.round(r.top), h: Math.round(r.height), bajoCab: document.querySelector('#avisos').getBoundingClientRect().top >= Math.max(cab.bottom, 0) - 1, pegado: document.querySelector('#avisos').getBoundingClientRect().top <= 0.5, texto: t.textContent.trim(), fg: cs.color, bg: cs.backgroundColor }; }).then(async m => { const s = await solapes(p); return { ...m, solapes: s.n, con: s.con }; })); await p.waitForTimeout(40); }
    const visibles = muestras.filter(m => m.h > 0 && m.texto), minContraste = Math.min(...visibles.map(m => contraste(m.fg, m.bg)));
    ev('H1-' + w, `Aviso de guardado en el editor (${w} px): zona reservada bajo la cabecera, sin superponerse, legible en toda la animación`, 'En 14 muestras durante la animación: el aviso queda siempre bajo la cabecera, no solapa ningún control y su contraste es ≥ 4,5:1',
      `${visibles.length} muestras con aviso visible; solapes con controles (aviso en su sitio): ${Math.max(0, ...muestras.filter(m => !m.pegado).map(m => m.solapes))}; muestras con el aviso pegado arriba al desplazarse: ${muestras.filter(m => m.pegado).length}; controles solapados: [${[...new Set(muestras.flatMap(m => m.con))].join(',')}]; bajo la cabecera siempre=${muestras.every(m => m.bajoCab)}; contraste mínimo ${minContraste.toFixed(1)}:1; texto «${visibles[0]?.texto}»`,
      visibles.length > 3 && muestras.filter(m => !m.pegado).every(m => m.solapes === 0) && muestras.every(m => m.bajoCab) && minContraste >= 4.5 && visibles[0].texto === 'Cartera guardada', '');
    await p.ctx.close();

    // ===== H2: aviso sobre «Mis carteras» (no tapa el título ni «Nueva cartera») y aviso al desplazarse =====
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'H2' + w); await p.waitForTimeout(4600); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item');
    await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); await p.waitForTimeout(500);
    const mc = await solapes(p), tit = await p.evaluate(() => { const t = document.querySelector('#toast').getBoundingClientRect(), hh = document.querySelector('#vista-carteras h1').getBoundingClientRect(), nb = document.querySelector('#btn-nueva').getBoundingClientRect(); return { sobreTitulo: t.bottom > hh.top && t.top < hh.bottom, sobreBoton: t.bottom > nb.top && t.top < nb.bottom, tBottom: Math.round(t.bottom), hTop: Math.round(hh.top) }; });
    await p.waitForTimeout(4400);
    // desplazado: el aviso (error) se queda arriba, entero y legible
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(200);
    await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#toast.error'); await p.waitForTimeout(500);
    const desp = await p.evaluate(() => { const t = document.querySelector('#toast').getBoundingClientRect(), x = document.querySelector('#toast-x').getBoundingClientRect(); const av = document.querySelector('#avisos').getBoundingClientRect(), cab = document.querySelector('.cab').getBoundingClientRect(); return { top: Math.round(av.top), cabBottom: Math.round(cab.bottom), dentro: t.top >= 0 && t.bottom <= innerHeight && x.bottom <= innerHeight && x.top >= 0, scrollY: Math.round(scrollY), ancho: document.documentElement.scrollWidth }; });
    ev('H2-' + w, `Aviso sobre «Mis carteras» y al desplazarse (${w} px)`, 'El aviso queda debajo de la cabecera y no tapa el título ni «Nueva cartera»; con la página desplazada el aviso de error sigue entero arriba de la ventana y la página no desborda',
      `solapes con controles en «Mis carteras»: ${mc.n} (${mc.con.join(',')}); sobre el título=${tit.sobreTitulo}, sobre «Nueva cartera»=${tit.sobreBoton}; desplazado ${desp.scrollY} px: aviso a ${desp.top} px (cabecera termina en ${desp.cabBottom}; arriba del todo si la cabecera ya salió), entero y con «Cerrar aviso» dentro de la ventana=${desp.dentro}; ancho de página ${desp.ancho}/${w}`,
      mc.n === 0 && !tit.sobreTitulo && !tit.sobreBoton && desp.top === Math.max(desp.cabBottom, 0) && desp.dentro && desp.ancho <= w, '');
    await p.ctx.close();

    // ===== H3: errores que requieren actuar permanecen; los de éxito se cierran solos =====
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'H3' + w); await p.waitForTimeout(4600);
    await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error'); await peso(p).fill('20');
    await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue()); await p.waitForTimeout(150); await G(p).click(); await p.waitForTimeout(6200);
    const sg = { estado: await T(p, '#estado'), boton: await T(G(p), 'xpath=.'), motivo: await T(p, '#motivo'), barra: w < 900 ? await T(p, '#b-estado') : '' };
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#toast.error'); await p.waitForTimeout(6200);
    const err = await p.evaluate(() => ({ visible: document.querySelector('#toast').classList.contains('on') && document.querySelector('#toast').classList.contains('error'), rol: document.querySelector('#toast').getAttribute('role'), x: !document.querySelector('#toast-x').hidden, txt: document.querySelector('#toast').textContent }));
    await p.click('#toast-x'); await p.waitForTimeout(400); const cerrado = await p.evaluate(() => !document.querySelector('#toast').classList.contains('on'));
    await p.goto(B + '#carteras'); await p.waitForSelector('.cartera-item'); await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); await p.waitForTimeout(4700); const exito = await p.evaluate(() => document.querySelector('#toast').classList.contains('on'));
    ev('H3-' + w, `Errores accesibles y avisos de éxito fugaces (${w} px, título largo)`, 'Tras 6 s el guardado fallido sigue visible en el estado (y «Reintentar guardado»); el aviso de error de la ficha sigue ahí (rol alert, «Cerrar aviso») hasta cerrarlo; el de éxito se cierra solo',
      `guardado fallido a los 6 s: estado «${sg.estado}», botón «${sg.boton}»${w < 900 ? `, barra «${sg.barra}»` : `, motivo «${sg.motivo}»`}; aviso de error a los 6 s: visible=${err.visible}, rol «${err.rol}», «Cerrar aviso» visible=${err.x}, «${err.txt}»; tras cerrar oculto=${cerrado}; aviso de éxito a los 4,7 s sigue visible=${exito}`,
      sg.estado.startsWith('No se pudo guardar') && sg.boton === 'Reintentar guardado' && err.visible && err.rol === 'alert' && err.x && err.txt === 'No se pudo cargar la ficha' && cerrado && !exito, '');
    await p.ctx.close();
  }

  // ===== H4: resumen de ROIC: lo esencial visible, la explicación extensa en un desplegable accesible =====
  for (const w of [320, 390, 1440]) {
    const p = await nuevo(b, w, 800); await entrar(p, 'dividendos', 'H4' + w);
    await p.evaluate(() => document.querySelector('#res-detalle').scrollIntoView()); await p.waitForTimeout(200);
    const vis = await p.evaluate(() => { const v = s => { const e = document.querySelector(s); return !!e && e.offsetParent !== null && e.getBoundingClientRect().height > 0; };
      const det = document.querySelector('#res-detalle .mini'), summ = det.querySelector('summary');
      return { roic: v('#r-roic'), valor: document.querySelector('#r-roic').textContent.trim(), cob: document.querySelector('#r-cob-corta').textContent.trim(), nota: document.querySelector('.nota-roic').textContent.trim(), notaVis: v('.nota-roic'),
        cerrado: !det.open, resumen: summ.textContent.trim(), nDet: document.querySelectorAll('#res-detalle details').length, paneles: document.querySelectorAll('#res-detalle .panel, #res-detalle .tarjeta').length, h2: document.querySelectorAll('#res-detalle h2').length, ancho: document.documentElement.scrollWidth }; });
    const formulaOculta = !(await p.locator('#res-detalle .mini p', { hasText: 'Fórmula' }).first().isVisible()); vis.formulaOculta = formulaOculta;
    await p.focus('#res-detalle .mini summary'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const abierto = { abierto: await p.evaluate(() => document.querySelector('#res-detalle .mini').open), formula: await p.locator('#res-detalle .mini p', { hasText: 'Fórmula' }).first().isVisible() };
    await p.screenshot({ path: EVDIR + `H4-roic-desplegado-${w}.png` });
    // ausente ≠ cero: añadir una empresa sin dato (JPMorgan)
    await p.keyboard.press('Space'); await p.fill('#buscar-activo', 'jpmorgan'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    const aus = await p.evaluate(() => ({ corta: document.querySelector('#r-cob-corta').textContent.replace(/\s+/g, ' ').trim(), larga: document.querySelector('#r-cob-larga').textContent.replace(/\s+/g, ' ').trim(), roic: document.querySelector('#r-roic').textContent.trim() }));
    ev('H4-' + w, `Resumen de ROIC (${w} px): indicador, cobertura y advertencia visibles; explicación en desplegable`, 'Visibles: ROIC medio, «Con dato: N de M…», «No representa la rentabilidad de tu cartera.»; la fórmula y los datos ausentes, en un solo desplegable cerrado que se abre con teclado; una empresa sin dato queda fuera del cálculo y se dice que no cuenta como 0; sin tarjeta explicativa extra',
      `ROIC «${vis.valor}» visible=${vis.roic}; cobertura «${vis.cob}»; advertencia «${vis.nota}» visible=${vis.notaVis}; desplegable «${vis.resumen}» cerrado=${vis.cerrado}, fórmula oculta=${vis.formulaOculta}; con Enter se abre=${abierto.abierto}, fórmula visible=${abierto.formula}; desplegables en el resumen ${vis.nDet} (≤ 2), paneles anidados ${vis.paneles}, h2 ${vis.h2}; con JPMorgan: «${aus.corta}» · detalle «${aus.larga}» · ROIC ${aus.roic}; ancho ${vis.ancho}/${w}`,
      vis.roic && /^\d/.test(vis.valor) && /Con dato: \d+ de \d+ posiciones/.test(vis.cob) && vis.nota === 'No representa la rentabilidad de tu cartera.' && vis.notaVis && vis.cerrado && vis.formulaOculta && abierto.abierto && abierto.formula && vis.nDet <= 2 && vis.paneles === 0 && vis.h2 === 1 && /1 empresa sin dato \(no cuenta como 0\)/.test(aus.corta) && aus.larga.includes('Dato ausente (no disponible): 1 empresa') && aus.larga.includes('No aplicable: 2 fondos') && vis.ancho <= w, `H4-roic-desplegado-${w}.png`);
    await p.ctx.close();
  }

  // ===== H5: móvil: estado claro (dispositivo / cuenta / publicada) y acciones alcanzables con cabecera, barra, avisos y texto ampliado =====
  for (const [w, h] of [[320, 568], [390, 844]]) {
    // «libre» = Playwright puede pulsarlo de verdad (no lo tapa nada); «dentro» = su caja entra en la ventana
    const hit = async (p, sel) => { const dentro = await p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }, sel); let libre = true; try { await p.locator(sel).first().click({ trial: true, timeout: 3000 }); } catch { libre = false; } return { libre, dentro }; };
    // estados: solo en este dispositivo → pendiente → guardada → pública
    const g = await nuevo(b, w, h); await g.goto(B); await g.waitForSelector('.plantilla'); await g.click('[data-plantilla=oro]'); await g.waitForSelector('#vista-cartera:not([hidden])'); const sDisp = (await T(g, '#estado')) + ' | ' + (await T(g, '#b-estado')); await g.ctx.close();
    const p = await nuevo(b, w, h); await entrar(p, 'oro', 'H5' + w); await p.waitForTimeout(4600);
    const sCuenta = (await T(p, '#estado')) + ' | ' + (await T(p, '#b-estado'));
    await peso(p).fill('20'); await p.waitForTimeout(150); const sPend = (await T(p, '#estado')) + ' | ' + (await T(p, '#b-estado'));
    await peso(p).fill('25'); await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Tesis'); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
    await peso(p).fill('20'); await p.waitForTimeout(150); const sPub = (await T(p, '#chip')) + ' | ' + (await T(p, '#estado')) + ' | ' + (await T(p, '#pub-pend'));
    await p.screenshot({ path: EVDIR + `H5-estado-publica-pendiente-${w}.png` });
    // acciones alcanzables con texto ampliado, aviso de error y título largo
    await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error'); await peso(p).fill('25'); await p.waitForTimeout(150);
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300);
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#toast.error');
    await p.goBack(); await p.waitForSelector('#vista-cartera:not([hidden])').catch(() => {}); await p.waitForTimeout(400);
    const acc = {};
    acc.barra = await p.evaluate(() => { const bar = document.querySelector('#barra-guardar'), bt = bar.querySelector('.js-guardar'), r = bt.getBoundingClientRect(), br = bar.getBoundingClientRect(), info = bar.querySelector('.bg-info').getBoundingClientRect(); return { botonDentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= br.bottom + 1 && r.top >= br.top - 1, textoSinRecorte: bt.scrollWidth <= bt.clientWidth + 1 && bt.scrollHeight <= bt.clientHeight + 1, infoDentro: info.right <= innerWidth && info.left >= 0, alto: Math.round(br.height) }; });
    acc.xAviso = await hit(p, '#toast-x');
    await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: EVDIR + `H5-titulo-200-error-${w}.png` }); acc.nombre = await hit(p, '#nombre');
    acc.guardar = await hit(p, '#barra-guardar .js-guardar');
    const ult = p.locator('.peso-in >> visible=true').last(); await ult.scrollIntoViewIfNeeded(); await ult.focus(); await p.waitForTimeout(700); acc.ultima = await p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(), t = document.querySelector('#avisos').getBoundingClientRect(); return { dentro: r.top >= t.bottom - 1 && r.bottom <= bar.top, esPeso: e.classList.contains('peso-in') }; });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(200); acc.pie = await hit(p, '#cookies-link');
    await p.screenshot({ path: EVDIR + `H5-acciones-200-error-${w}.png` });
    await p.evaluate(() => { document.documentElement.style.fontSize = ''; }); await p.waitForTimeout(300);
    // teclado SIMULADO (sin texto ampliado: son dos condiciones distintas): ventana reducida → la barra se oculta y el campo sigue alcanzable
    await p.setViewportSize({ width: w, height: Math.round(h * 0.45) }); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); const campo = p.locator('.peso-in >> visible=true').first(); await campo.focus(); await p.waitForTimeout(700);
    const tec = await p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect(); return { vh: innerHeight, top: Math.round(r.top), bottom: Math.round(r.bottom), barra: Math.round(bar.top), aviso: Math.round(av.bottom), dentro: r.top >= av.bottom - 1 && r.bottom <= bar.top && r.top >= 0 }; });
    ev('H5-' + w, `Móvil ${w}×${h}: estado claro y acciones alcanzables (texto ampliado SIMULADO, aviso de error, título largo, teclado SIMULADO)`, 'El estado distingue «solo en este dispositivo», «guardada en tu cuenta», «cambios locales pendientes» y «pública + tus cambios aún no son públicos»; Guardar, el título, «Cerrar aviso», la última posición y el pie quedan visibles y no tapados',
      `solo dispositivo «${sDisp}»; cuenta «${sCuenta}»; pendiente «${sPend}»; pública «${sPub}»; alcanzables: cerrar aviso ${JSON.stringify(acc.xAviso)}, título ${JSON.stringify(acc.nombre)}, Guardar ${JSON.stringify(acc.guardar)}, barra inferior con texto ampliado ${JSON.stringify(acc.barra)}, última posición ${JSON.stringify(acc.ultima)}, pie ${JSON.stringify(acc.pie)}; teclado simulado (ventana ${w}×${tec.vh}): campo ${tec.top}–${tec.bottom} px, aviso termina en ${tec.aviso}, barra desde ${tec.barra}, campo entre aviso y barra=${tec.dentro}`,
      sDisp.startsWith('Solo en este dispositivo') && sCuenta.startsWith('Guardada en tu cuenta') && sPend.startsWith('Cambios locales pendientes') && sPub.startsWith('Pública') && sPub.includes('Tus cambios aún no son públicos') && acc.xAviso.libre && acc.xAviso.dentro && acc.nombre.libre && acc.guardar.libre && acc.guardar.dentro && acc.barra.botonDentro && acc.barra.textoSinRecorte && acc.barra.infoDentro && acc.ultima.esPeso && acc.ultima.dentro && acc.pie.libre && tec.dentro, `H5-acciones-200-error-${w}.png`);
    ev('H6-' + w, `Sin errores de JavaScript (${w} px)`, 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, ''); await p.ctx.close();
  }
  await b.close(); fin('evidencias-H');
})();
