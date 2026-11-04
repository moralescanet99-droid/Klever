// Batería H (rondas 10–11): avisos, resumen de ROIC y móvil. En la ronda 11 se reescribió H1 para que NO pueda pasar por falta de muestras:
//  · cada fase exige un mínimo de muestras elegibles (si no hay, FALLA) y se prueba al INICIO de la página y DESPUÉS de desplazarse;
//  · se distingue el contenido que pasa por debajo de una zona fija (normal, recuperable desplazando) de una ACCIÓN realmente inaccesible
//    (tras enfocarla/desplazarla queda tapada o fuera de la zona libre);
//  · el contraste se calcula con la opacidad REAL (la del aviso y la de sus ancestros) mezclada sobre el fondo, en cada fotograma de la animación.
// «Texto ampliado» (font-size del documento) y «teclado» (ventana reducida) son SIMULACIONES: no equivalen a zoom ni a teclado reales.
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch();
  const G = p => p.locator('.js-guardar >> visible=true');
  const MIN = 6; // muestras elegibles mínimas por fase
  // ---- colores: se mezclan con su opacidad real; el contraste se mide sobre el resultado ----
  const num = c => { const m = c.match(/-?[\d.]+(?:e-?\d+)?/g).map(Number); return c.startsWith('color(') ? [m[0] * 255, m[1] * 255, m[2] * 255, m[3] ?? 1] : [m[0], m[1], m[2], m[3] ?? 1]; };
  const mezcla = (f, fondo) => f.slice(0, 3).map((v, i) => v * f[3] + fondo[i] * (1 - f[3]));
  const lum = ([r, g, bl]) => { const l = [r, g, bl].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
  const contr = (x, y) => { const a = lum(x), c = lum(y); return (Math.max(a, c) + .05) / (Math.min(a, c) + .05); };
  // una muestra del aviso: geometría visible (recortada por su zona), opacidad efectiva y contraste real
  const muestra = p => p.evaluate(() => {
    const t = document.querySelector('#toast'), av = document.querySelector('#avisos'), cab = document.querySelector('.cab').getBoundingClientRect();
    const r = t.getBoundingClientRect(), a = av.getBoundingClientRect(), cs = getComputedStyle(t);
    let op = 1; for (let e = t; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const vis = { left: r.left, right: r.right, top: Math.max(r.top, a.top), bottom: Math.min(r.bottom, a.bottom) };
    const area = Math.max(0, vis.bottom - vis.top);
    const solapa = area > 0 ? [...document.querySelectorAll('a,button,input,select,textarea,.cab')].filter(e => !e.closest('#avisos') && e.offsetParent !== null).filter(e => { const q = e.getBoundingClientRect(); return q.width && q.height && q.left < vis.right && q.right > vis.left && q.top < vis.bottom && q.bottom > vis.top; }).map(e => (e.id || e.className || e.tagName).toString().slice(0, 24)) : [];
    return { area: Math.round(area), top: Math.round(a.top), bottom: Math.round(a.bottom), cabBottom: getComputedStyle(document.querySelector('.cab')).position === 'fixed' ? 0 : Math.round(cab.bottom), op, fg: cs.color, bg: cs.backgroundColor, page: getComputedStyle(document.body).backgroundColor, fija: av.classList.contains('fija'), solapa, h: Math.round(r.height), texto: t.textContent.trim(), vh: innerHeight, scrollY: Math.round(scrollY) };
  });
  const contrasteReal = m => { const page = num(m.page).slice(0, 3), bg = num(m.bg); bg[3] *= m.op; const fondo = mezcla(bg, page), fg = num(m.fg); fg[3] *= m.op; return contr(mezcla(fg, fondo), fondo); };
  const muestrear = async (p, n = 16, ms = 35) => { const s = []; for (let i = 0; i < n; i++) { s.push(await muestra(p)); await p.waitForTimeout(ms); } return s; };
  // ¿una acción es realmente accesible? se enfoca (el navegador la desplaza respetando scroll-padding) y se exige: dentro de la zona libre y sin nada encima
  const accesible = async (p, sel) => p.evaluate(async sel => { const e = document.querySelector(sel); if (!e) return { existe: false }; e.focus({ preventScroll: false }); await new Promise(r => setTimeout(r, 450));
    const r = e.getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect(), bar = document.querySelector('#barra-guardar'), barTop = bar && getComputedStyle(bar).display !== 'none' && !bar.hidden ? bar.getBoundingClientRect().top : innerHeight;
    const top = Math.max(av.bottom, 0), x = r.left + r.width / 2, y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1), t = document.elementFromPoint(x, y);
    return { existe: true, enZonaLibre: r.top >= top - 1 && r.bottom <= barTop + 1, libre: !!t && (t === e || e.contains(t) || t.contains(e)), top: Math.round(r.top), bottom: Math.round(r.bottom), zonaLibre: [Math.round(top), Math.round(barTop)] }; }, sel);

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 720;
    // ===== H1: aviso de éxito AL INICIO de la página (en su sitio): ningún solape, animación legible; las muestras elegibles son obligatorias =====
    let p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'H1' + w); await p.waitForTimeout(4600);
    await peso(p).fill('15'); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100); await G(p).click();
    const ini = await muestrear(p, 16, 30), eleg = ini.filter(m => m.area > 0), solapes = eleg.flatMap(m => m.solapa);
    ev('H1a-' + w, `Aviso de éxito al INICIO de la página (${w} px)`, `Al menos ${MIN} muestras elegibles; el aviso queda bajo la cabecera y no solapa NINGUNA acción en ninguna muestra`,
      `${eleg.length} muestras elegibles de ${ini.length}; solapes: ${solapes.length ? [...new Set(solapes)].join(',') : 'ninguno'}; bajo la cabecera siempre=${eleg.every(m => m.top >= m.cabBottom - 1)}; fija=${eleg[0]?.fija}`,
      eleg.length >= MIN && solapes.length === 0 && eleg.every(m => m.top >= m.cabBottom - 1), '');
    // legibilidad REAL durante la animación: opacidad efectiva y contraste mezclado en cada muestra
    const cs = eleg.map(contrasteReal), minC = Math.min(...cs), minOp = Math.min(...eleg.map(m => m.op));
    ev('H1b-' + w, `Legibilidad del aviso durante toda la animación (${w} px), con la opacidad real`, `Opacidad efectiva 1 en cada muestra (solo se anima la altura) y contraste ≥ 4,5:1 calculado con esa opacidad, en al menos ${MIN} muestras`,
      `${eleg.length} muestras; opacidad efectiva mínima ${minOp.toFixed(2)}; contraste real mínimo ${minC.toFixed(1)}:1; alturas visibles ${[...new Set(eleg.map(m => m.area))].slice(0, 8).join('→')} px`,
      eleg.length >= MIN && minOp >= .99 && minC >= 4.5, '');
    await p.ctx.close();

    // ===== H1c: DESPUÉS de desplazarse. Aviso fijo (error en todas las anchuras): la zona fija no deja ninguna ACCIÓN inaccesible =====
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'H1c' + w); await p.waitForTimeout(4600);
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(250);
    await p.locator('.ver-ficha >> visible=true').nth(3).click(); await p.waitForSelector('#toast.error');
    const des = await muestrear(p, 14, 35), eleg2 = des.filter(m => m.area > 0);
    const sombra = await p.evaluate(() => { const av = document.querySelector('#avisos').getBoundingClientRect(); return [...document.querySelectorAll('a,button,input')].filter(e => !e.closest('#avisos') && e.offsetParent !== null).filter(e => { const q = e.getBoundingClientRect(); return q.width && q.height && q.top < av.bottom && q.bottom > av.top; }).length; });
    await p.evaluate(() => { const v = [...document.querySelectorAll('.ver-ficha')].filter(e => e.offsetParent !== null); if (v[5]) v[5].id = 'sonda-ficha'; });   // un «Ver ficha» visible (la tabla de escritorio y las tarjetas móviles son distintas)
    const acts = [await accesible(p, '#emp-buscar'), await accesible(p, '#sonda-ficha'), await accesible(p, '#ir-screener')];
    await p.screenshot({ path: EVDIR + `H1c-desplazado-${w}.png` });
    ev('H1c-' + w, `Aviso fijo tras desplazarse (${w} px, desplazado ${eleg2[0]?.scrollY} px)`, `Al menos ${MIN} muestras elegibles con el aviso pegado arriba (top 0, entero y legible); el contenido que pasa por debajo es normal; NINGUNA acción queda inaccesible: enfocada, queda en la zona libre y sin nada encima`,
      `${eleg2.length} muestras elegibles; pegado arriba=${eleg2.every(m => m.top === 0 && m.fija)}; contraste real mín. ${Math.min(...eleg2.map(contrasteReal)).toFixed(1)}:1; elementos que pasan por debajo en este instante (normal): ${sombra}; acciones enfocadas → ${acts.map(a => a.existe ? `en zona libre=${a.enZonaLibre}, sin tapar=${a.libre} (${a.top}–${a.bottom} dentro de ${a.zonaLibre.join('–')})` : 'no existe').join(' | ')}`,
      eleg2.length >= MIN && eleg2.every(m => m.top === 0 && m.fija) && Math.min(...eleg2.map(contrasteReal)) >= 4.5 && acts.every(a => a.existe && a.enZonaLibre && a.libre), `H1c-desplazado-${w}.png`);
    await p.ctx.close();

    // ===== H2: aviso sobre «Mis carteras»: no tapa el título ni «Nueva cartera» (muestras elegibles obligatorias; en móvil el éxito no se fija) =====
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'H2' + w); await p.waitForTimeout(4600); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.evaluate(() => window.scrollTo(0, 0));
    await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); const mc = await muestrear(p, 14, 35), eleg3 = mc.filter(m => m.area > 0);
    const tit = await p.evaluate(() => { const t = document.querySelector('#toast').getBoundingClientRect(), hh = document.querySelector('#vista-carteras h1').getBoundingClientRect(), nb = document.querySelector('#btn-nueva').getBoundingClientRect(); return { sobreTitulo: t.bottom > hh.top && t.top < hh.bottom && t.height > 0, sobreBoton: t.bottom > nb.top && t.top < nb.bottom && t.height > 0 }; });
    ev('H2-' + w, `Aviso sobre «Mis carteras» (${w} px)`, `≥ ${MIN} muestras elegibles; el aviso no solapa ninguna acción ni el título y queda bajo la cabecera`,
      `${eleg3.length} muestras elegibles; solapes: ${[...new Set(eleg3.flatMap(m => m.solapa))].join(',') || 'ninguno'}; sobre el título=${tit.sobreTitulo}, sobre «Nueva cartera»=${tit.sobreBoton}; fija=${eleg3[0]?.fija}`,
      eleg3.length >= MIN && eleg3.every(m => m.solapa.length === 0 && m.top >= m.cabBottom - 1) && !tit.sobreTitulo && !tit.sobreBoton, '');
    await p.ctx.close();

    // ===== H3: errores accesibles y avisos de éxito fugaces =====
    p = await nuevo(b, w, h); await entrar(p, 'oro', 'H3' + w); await p.waitForTimeout(4600);
    await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error'); await peso(p).fill('20');
    await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue()); await p.waitForTimeout(150); await G(p).click(); await p.waitForTimeout(6200);
    const sg = { estado: await T(p, '#estado'), boton: await T(G(p), 'xpath=.'), motivo: await T(p, '#motivo'), barra: w < 900 ? await T(p, '#b-estado') : '' };
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#toast.error'); await p.waitForTimeout(6200);
    const err = await p.evaluate(() => ({ visible: document.querySelector('#toast').classList.contains('on') && document.querySelector('#toast').classList.contains('error'), rol: document.querySelector('#toast').getAttribute('role'), x: !document.querySelector('#toast-x').hidden, nombreX: document.querySelector('#toast-x').getAttribute('aria-label'), txt: document.querySelector('#toast').textContent }));
    await p.click('#toast-x'); await p.waitForTimeout(400); const cerrado = await p.evaluate(() => !document.querySelector('#toast').classList.contains('on'));
    await p.goto(B + '#carteras'); await p.waitForSelector('.cartera-item'); await p.click('#cookies-link'); await p.waitForSelector('#toast.on'); await p.waitForTimeout(4700); const exito = await p.evaluate(() => document.querySelector('#toast').classList.contains('on'));
    ev('H3-' + w, `Errores accesibles y avisos de éxito fugaces (${w} px, título largo)`, 'Tras 6 s el guardado fallido sigue en el estado (y «Reintentar guardado»); el aviso de error de la ficha sigue ahí (rol alert, botón «Cerrar aviso») hasta cerrarlo; el de éxito se cierra solo',
      `guardado fallido a los 6 s: estado «${sg.estado}», botón «${sg.boton}»${w < 900 ? `, barra «${sg.barra}»` : `, motivo «${sg.motivo}»`}; aviso de error a los 6 s: visible=${err.visible}, rol «${err.rol}», cierre «${err.nombreX}» visible=${err.x}, «${err.txt}»; tras cerrar oculto=${cerrado}; aviso de éxito a los 4,7 s sigue visible=${exito}`,
      sg.estado.startsWith('No se pudo guardar') && sg.boton === 'Reintentar guardado' && err.visible && err.rol === 'alert' && err.x && err.nombreX === 'Cerrar aviso' && err.txt === 'No se pudo cargar la ficha' && cerrado && !exito, '');
    await p.ctx.close();
  }

  // ===== H7: 320 px y texto ampliado: espacio útil con aviso de error + barra; se trabaja SIN cerrar el aviso =====
  for (const [w, h] of [[320, 568], [390, 844]]) {
    const p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'H7' + w); await p.waitForTimeout(4600);
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300);
    await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.route('**/api/assets/*', r => r.abort()); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#toast.error');
    await p.goBack(); await p.waitForSelector('#vista-cartera:not([hidden])').catch(() => {}); await p.waitForTimeout(500);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200);
    const geo = await p.evaluate(() => { const t = document.querySelector('#toast').getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(), x = document.querySelector('#toast-x').getBoundingClientRect();
      return { vh: innerHeight, vw: innerWidth, avisoAlto: Math.round(av.height), barraAlto: Math.round(bar.height), libre: Math.round(bar.top - Math.max(av.bottom, 0)), anchoMensaje: Math.round(t.width), x: Math.round(x.width) }; });
    const libre = geo.libre / geo.vh;
    // se trabaja con el aviso abierto: enfocar la última posición, editar y pulsar Guardar (clic de prueba: nada lo tapa)
    const ult = p.locator('.peso-in >> visible=true').last(); await ult.focus(); await p.waitForTimeout(600);
    const ac = await p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(); return { esPeso: e.classList.contains('peso-in'), entre: r.top >= av.bottom - 1 && r.bottom <= bar.top + 1, top: Math.round(r.top), bottom: Math.round(r.bottom), av: Math.round(av.bottom), bar: Math.round(bar.top) }; });
    await ult.fill('12,5'); await p.waitForTimeout(200);
    let guardarLibre = true; try { await G(p).click({ trial: true, timeout: 3000 }); } catch { guardarLibre = false; }
    const sigue = await p.evaluate(() => document.querySelector('#toast').classList.contains('error') && document.querySelector('#toast').classList.contains('on'));
    await p.screenshot({ path: EVDIR + `H7-texto-200-aviso-barra-${w}.png` });
    ev('H7-' + w, `${w}×${h}, texto ampliado al 200 % (SIMULADO): espacio útil con aviso de error y barra, sin cerrar el aviso`, 'La zona libre entre el aviso y la barra es ≥ 35 % de la ventana; el mensaje usa el ancho disponible (≥ 80 % menos el botón de cierre); se puede enfocar y editar el último peso y pulsar Guardar con el aviso aún abierto',
      `zona libre ${geo.libre} px de ${geo.vh} (${(libre * 100).toFixed(0)} %); aviso ${geo.avisoAlto} px, barra ${geo.barraAlto} px; mensaje ${geo.anchoMensaje} px de ${geo.vw}; último peso entre aviso y barra=${ac.entre} (${ac.top}–${ac.bottom} en ${ac.av}–${ac.bar}); Guardar alcanzable=${guardarLibre}; el aviso sigue abierto=${sigue}`,
      libre >= .35 && geo.anchoMensaje >= (geo.vw - 44 - 32) * .8 && ac.esPeso && ac.entre && guardarLibre && sigue, `H7-texto-200-aviso-barra-${w}.png`);
    await p.ctx.close();
  }

  // ===== H8: con «reducir movimiento» no hay animación: el aviso es legible desde la primera muestra =====
  { const c = await b.newContext({ viewport: { width: 390, height: 720 }, reducedMotion: 'reduce' }); const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.route(/tradingview\.com/, r => r.abort()); p.ctx = c;
    await p.goto(B); await p.waitForSelector('.plantilla'); await p.click('[data-plantilla=oro]'); await p.waitForSelector('#vista-cartera:not([hidden])');
    await p.click('#cookies-link >> visible=true').catch(() => {}); await p.waitForSelector('#toast.on'); const m = await muestra(p);
    ev('H8', 'Con «reducir movimiento» el aviso aparece sin animar', 'Desde la primera muestra el aviso está entero (su altura completa) y es legible', `altura visible ${m.area} px de ${m.h}; opacidad efectiva ${m.op}; contraste real ${contrasteReal(m).toFixed(1)}:1`, m.area >= m.h - 1 && m.op >= .99 && contrasteReal(m) >= 4.5, ''); await c.close(); }

  // ===== H4: resumen de ROIC: lo esencial visible, la explicación en un desplegable accesible =====
  for (const w of [320, 390, 1440]) {
    const p = await nuevo(b, w, 800); await entrar(p, 'dividendos', 'H4' + w);
    await p.evaluate(() => document.querySelector('#res-detalle').scrollIntoView()); await p.waitForTimeout(200);
    const vis = await p.evaluate(() => { const v = s => { const e = document.querySelector(s); return !!e && e.offsetParent !== null && e.getBoundingClientRect().height > 0; };
      const det = document.querySelector('#roic-det'), summ = det.querySelector('summary');
      return { roic: v('#r-roic'), valor: document.querySelector('#r-roic').textContent.trim(), cob: document.querySelector('#r-cob-corta').textContent.trim(), nota: document.querySelector('.nota-roic').textContent.trim(), notaVis: v('.nota-roic'),
        cerrado: !det.open, resumen: summ.textContent.trim(), nDet: document.querySelectorAll('#res-detalle details').length, paneles: document.querySelectorAll('#res-detalle .panel, #res-detalle .tarjeta').length, h2: document.querySelectorAll('#res-detalle h2').length, ancho: document.documentElement.scrollWidth,
        ordenOk: document.querySelector('#r-total').getBoundingClientRect().top < document.querySelector('#r-sectores').getBoundingClientRect().top && document.querySelector('#r-sectores').getBoundingClientRect().top < document.querySelector('#r-roic').getBoundingClientRect().top,
        tam: [parseFloat(getComputedStyle(document.querySelector('#r-total')).fontSize), parseFloat(getComputedStyle(document.querySelector('#r-roic')).fontSize)] }; });
    vis.formulaOculta = !(await p.locator('#roic-det p', { hasText: 'Fórmula' }).first().isVisible());
    await p.focus('#roic-det summary'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const abierto = { abierto: await p.evaluate(() => document.querySelector('#roic-det').open), formula: await p.locator('#roic-det p', { hasText: 'Fórmula' }).first().isVisible() };
    await p.screenshot({ path: EVDIR + `H4-roic-desplegado-${w}.png` });
    await p.keyboard.press('Space'); await p.fill('#buscar-activo', 'jpmorgan'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
    const aus = await p.evaluate(() => ({ corta: document.querySelector('#r-cob-corta').textContent.replace(/\s+/g, ' ').trim(), larga: document.querySelector('#r-cob-larga').textContent.replace(/\s+/g, ' ').trim(), roic: document.querySelector('#r-roic').textContent.trim() }));
    ev('H4-' + w, `Resumen de ROIC (${w} px): composición primero, ROIC secundario con cobertura y advertencia; explicación en desplegable`, 'Orden: Asignado → distribución → ROIC (cifra del ROIC menor que la del total); visibles ROIC, «Con dato: N de M…» y «No representa la rentabilidad de tu cartera.»; fórmula y datos ausentes en un desplegable cerrado que se abre con teclado; sin dato = fuera del cálculo, «no cuenta como 0»; sin tarjeta extra',
      `ROIC «${vis.valor}» visible=${vis.roic}; orden correcto=${vis.ordenOk}; tamaños total/ROIC ${vis.tam.join('/')} px; cobertura «${vis.cob}»; advertencia «${vis.nota}» visible=${vis.notaVis}; desplegable «${vis.resumen}» cerrado=${vis.cerrado}, fórmula oculta=${vis.formulaOculta}; con Enter se abre=${abierto.abierto}, fórmula visible=${abierto.formula}; desplegables ${vis.nDet} (≤ 2), paneles anidados ${vis.paneles}, h2 ${vis.h2}; con JPMorgan: «${aus.corta}» · detalle «${aus.larga}» · ROIC ${aus.roic}; ancho ${vis.ancho}/${w}`,
      vis.roic && /^\d/.test(vis.valor) && vis.ordenOk && vis.tam[1] <= vis.tam[0] + 8 && /Con dato: \d+ de \d+ posiciones/.test(vis.cob) && vis.nota === 'No representa la rentabilidad de tu cartera.' && vis.notaVis && vis.cerrado && vis.formulaOculta && abierto.abierto && abierto.formula && vis.nDet <= 2 && vis.paneles === 0 && vis.h2 === 1 && /1 empresa sin dato \(no cuenta como 0\)/.test(aus.corta) && aus.larga.includes('Dato ausente (no disponible): 1 empresa') && aus.larga.includes('No aplicable: 2 fondos') && vis.ancho <= w, `H4-roic-desplegado-${w}.png`);
    await p.ctx.close();
  }

  // ===== H5: móvil: estado claro y acciones alcanzables =====
  for (const [w, h] of [[320, 568], [390, 844]]) {
    const hit = async (p, sel) => { const dentro = await p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }, sel); let libre = true; try { await p.locator(sel).first().click({ trial: true, timeout: 3000 }); } catch { libre = false; } return { libre, dentro }; };
    const g = await nuevo(b, w, h); await g.goto(B); await g.waitForSelector('.plantilla'); await g.click('[data-plantilla=oro]'); await g.waitForSelector('#vista-cartera:not([hidden])'); const sDisp = (await T(g, '#estado')) + ' | ' + (await T(g, '#b-estado')); await g.ctx.close();
    const p = await nuevo(b, w, h); await entrar(p, 'oro', 'H5' + w); await p.waitForTimeout(4600);
    const sCuenta = (await T(p, '#estado')) + ' | ' + (await T(p, '#b-estado'));
    await peso(p).fill('20'); await p.waitForTimeout(150); const sPend = (await T(p, '#estado')) + ' | ' + (await T(p, '#b-estado'));
    await peso(p).fill('25'); await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Tesis'); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
    await peso(p).fill('20'); await p.waitForTimeout(150); const sPub = (await T(p, '#chip')) + ' | ' + (await T(p, '#estado')) + ' | ' + (await T(p, '#pub-pend'));
    await p.screenshot({ path: EVDIR + `H5-estado-publica-pendiente-${w}.png` });
    await p.fill('#nombre', 'Un título de cartera especialmente largo para comprobar cómo se comporta con dos líneas y un error'); await peso(p).fill('25'); await p.waitForTimeout(150);
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300);
    const acc = {};
    acc.barra = await p.evaluate(() => { const bar = document.querySelector('#barra-guardar'), bt = bar.querySelector('.js-guardar'), r = bt.getBoundingClientRect(), br = bar.getBoundingClientRect(), info = bar.querySelector('.bg-info').getBoundingClientRect(); return { botonDentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= br.bottom + 1 && r.top >= br.top - 1, textoSinRecorte: bt.scrollWidth <= bt.clientWidth + 1 && bt.scrollHeight <= bt.clientHeight + 1, infoDentro: info.right <= innerWidth && info.left >= 0, alto: Math.round(br.height), tope: Math.round(innerHeight * .4) }; });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: EVDIR + `H5-titulo-200-${w}.png` }); acc.nombre = await hit(p, '#nombre'); acc.guardar = await hit(p, '#barra-guardar .js-guardar');
    const ult = p.locator('.peso-in >> visible=true').last(); await ult.scrollIntoViewIfNeeded(); await ult.focus(); await p.waitForTimeout(700);
    acc.ultima = await p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(), t = document.querySelector('#avisos').getBoundingClientRect(); return { dentro: r.top >= t.bottom - 1 && r.bottom <= bar.top, esPeso: e.classList.contains('peso-in') }; });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(200); acc.pie = await hit(p, '#cookies-link');
    await p.screenshot({ path: EVDIR + `H5-acciones-200-${w}.png` });
    await p.evaluate(() => { document.documentElement.style.fontSize = ''; }); await p.waitForTimeout(300);
    await p.setViewportSize({ width: w, height: Math.round(h * 0.45) }); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); const campo = p.locator('.peso-in >> visible=true').first(); await campo.focus(); await p.waitForTimeout(700);
    const tec = await p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(), av = document.querySelector('#avisos').getBoundingClientRect(); return { vh: innerHeight, top: Math.round(r.top), bottom: Math.round(r.bottom), barra: Math.round(bar.top), dentro: r.top >= av.bottom - 1 && r.bottom <= bar.top && r.top >= 0 }; });
    ev('H5-' + w, `Móvil ${w}×${h}: estado claro y acciones alcanzables (texto ampliado SIMULADO, título largo, teclado SIMULADO)`, 'El estado distingue «solo en este dispositivo», «guardada en tu cuenta», «cambios locales pendientes» y «pública + tus cambios aún no son públicos»; Guardar, el título, la última posición y el pie quedan visibles y no tapados; la barra inferior no recorta el botón ni supera el 40 % de la ventana',
      `solo dispositivo «${sDisp}»; cuenta «${sCuenta}»; pendiente «${sPend}»; pública «${sPub}»; alcanzables: título ${JSON.stringify(acc.nombre)}, Guardar ${JSON.stringify(acc.guardar)}, barra con texto ampliado ${JSON.stringify(acc.barra)}, última posición ${JSON.stringify(acc.ultima)}, pie ${JSON.stringify(acc.pie)}; teclado simulado (ventana ${w}×${tec.vh}): campo ${tec.top}–${tec.bottom} px, barra desde ${tec.barra}, campo entre aviso y barra=${tec.dentro}`,
      sDisp.startsWith('Solo en este dispositivo') && sCuenta.startsWith('Guardada en tu cuenta') && sPend.startsWith('Cambios locales pendientes') && sPub.startsWith('Pública') && sPub.includes('Tus cambios aún no son públicos') && acc.nombre.libre && acc.guardar.libre && acc.guardar.dentro && acc.barra.botonDentro && acc.barra.textoSinRecorte && acc.barra.infoDentro && acc.barra.alto <= acc.barra.tope + 1 && acc.ultima.esPeso && acc.ultima.dentro && acc.pie.libre && tec.dentro, `H5-acciones-200-${w}.png`);
    ev('H6-' + w, `Sin errores de JavaScript (${w} px)`, 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, ''); await p.ctx.close();
  }
  await b.close(); fin('evidencias-H');
})();
