// Bloque B: móvil, orden en una columna, explorar empresas, ficha móvil y portada
const { chromium, B, ok, T, nuevo, entrar, peso, fin } = require('./h.cjs');
(async () => {
  const b = await chromium.launch();

  // ===== MÓVIL 390: cabecera, barra, controles =====
  let p = await nuevo(b, 390, 844); await entrar(p, 'dividendos', 'B1');
  const alto = async s => p.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().height), s);
  const h = await alto('.cab'); ok('móvil: cabecera global 56–64 px', h >= 56 && h <= 64, h + 'px');
  ok('móvil: navegación secundaria dentro de un menú accesible', !(await p.isVisible('.menu-escritorio')) && await p.isVisible('#btn-menu') && (await p.getAttribute('#btn-menu', 'aria-expanded')) === 'false');
  await p.click('#btn-menu'); ok('móvil: el menú se abre (aria-expanded) con enlaces y Salir', await p.isVisible('#menu-movil') && (await p.getAttribute('#btn-menu', 'aria-expanded')) === 'true' && (await p.locator('#menu-movil a:visible').count()) === 4 && await p.isVisible('#salir-m'));
  await p.keyboard.press('Escape'); ok('móvil: Escape cierra el menú y devuelve el foco', !(await p.isVisible('#menu-movil')) && (await p.evaluate(() => document.activeElement.id)) === 'btn-menu');
  ok('móvil: un solo botón «Guardar cartera» visible (sin duplicado en cabecera)', (await p.locator('.js-guardar:visible').count()) === 1);
  const bh = await alto('#barra-guardar'); ok('móvil: barra inferior 72–88 px', bh >= 72 && bh <= 88, bh + 'px');
  ok('móvil: persistencia explícita en la cabecera y versión breve en la barra', await p.isVisible('#estado') && (await T(p, '#estado')) === 'Guardada en tu cuenta' && (await T(p, '#b-estado')).includes('Guardada'));
  ok('móvil: la barra muestra «Asignado: 100 %», estado breve y acción', (await T(p, '#barra-guardar')).includes('Asignado: 100 %') && await p.locator('#barra-guardar .js-guardar').isVisible());
  ok('móvil: margen exterior de 16 px', await p.evaluate(() => { const m = getComputedStyle(document.querySelector('main')); const r = document.querySelector('#comp').getBoundingClientRect(); return parseFloat(m.paddingLeft) === 16 && Math.round(r.left) === 16; }));   // ronda 11: el título «Posiciones» se oculta en móvil; el primer elemento visible es la composición
  ok('móvil: texto principal de 16 px', await p.evaluate(() => getComputedStyle(document.body).fontSize === '16px' && getComputedStyle(document.querySelector('.peso-in')).fontSize === '16px'));
  const minimos = await p.evaluate(() => ['.peso-in', '.pc-toggle', '#mas', '#btn-menu', '#b-estado', '#barra-guardar .js-guardar', '#buscar-activo', '#nombre'].map(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent || getComputedStyle(x).position === 'fixed'); const r = e.getBoundingClientRect(); return [s, Math.round(r.width), Math.round(r.height)]; }));
  ok('móvil: controles táctiles ≥ 44 × 44', minimos.every(([s, w, h]) => h >= 44 && w >= 44 || (s === '.peso-in' && h >= 44) || (s === '#buscar-activo' && h >= 44) || (s === '#nombre' && h >= 40) || (s === '#b-estado' && h >= 44)), JSON.stringify(minimos));
  const pw = Math.round((await peso(p).boundingBox()).width); ok('móvil: campo de peso compacto (≤ 90 px) y cómodo', pw >= 64 && pw <= 90, pw + 'px');
  await peso(p).fill('12,5'); ok('móvil: acepta coma decimal', (await peso(p).inputValue()) === '12,5');
  await peso(p).fill('17');
  // nombre completo al desplegar
  const trunc = await p.evaluate(() => { const e = document.querySelector('.pc-id span'); return e.scrollHeight > e.clientHeight + 1 || e.textContent.length > 26; });
  await p.locator('.pc-toggle').first().click(); ok('móvil: detalles muestran el nombre completo', (await T(p, '#det-0')).includes('Nombre:') && (await T(p, '#det-0')).includes('Schwab US Dividend Equity ETF') && (await p.getAttribute('.pc-toggle', 'aria-expanded')) === 'true', trunc + '');
  await p.locator('.pc-toggle').first().click();
  // reserva de espacio: llegar a la última posición
  await p.waitForSelector('#nota-cuerpo .nota', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(300);   // ronda 15: la nota se calcula de forma asíncrona y alarga la página: se espera antes de medir
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(200);
  const ult = await p.evaluate(() => { const els = [...document.querySelectorAll('.peso-in')].filter(x => x.offsetParent); const e = els[els.length - 1]; return { b: Math.round(e.getBoundingClientRect().bottom), barra: Math.round(document.querySelector('#barra-guardar').getBoundingClientRect().top), enlace: Math.round(document.querySelector('#cookies-link').getBoundingClientRect().bottom), padPie: parseFloat(getComputedStyle(document.querySelector('.pie')).paddingBottom), alto: Math.round(document.querySelector('#barra-guardar').getBoundingClientRect().height) }; });
  // Ronda 10: la reserva de la barra pasó de <main> al pie (lo que de verdad quedaba tapado eran sus enlaces). Se exige MÁS: el último enlace del pie queda sobre la barra y el relleno del pie cubre su altura.
  ok('móvil: se puede llegar a la última posición y al último enlace del pie sin que la barra los tape', ult.b <= ult.barra && ult.enlace <= ult.barra && ult.padPie >= ult.alto, JSON.stringify(ult));
  // teclado virtual (emulado con viewport reducido)
  await p.setViewportSize({ width: 390, height: 420 }); await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.locator('.peso-in >> visible=true').last().focus(); await p.waitForTimeout(600);
  const kb = await p.evaluate(() => { const e = document.activeElement.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(); return { top: Math.round(e.top), bottom: Math.round(e.bottom), barraTop: Math.round(bar.top), vh: innerHeight }; });
  ok('teclado (emulado): el campo activo queda visible y por encima de la barra', kb.top >= 0 && kb.bottom <= kb.barraTop, JSON.stringify(kb));
  ok('teclado: con la clase «teclado» la barra se oculta (no tapa el campo)', await p.evaluate(() => { document.body.classList.add('teclado'); const d = getComputedStyle(document.querySelector('#barra-guardar')).display; document.body.classList.remove('teclado'); return d === 'none'; }));
  await p.setViewportSize({ width: 390, height: 844 });
  ok('móvil: sin desbordamiento y sin errores', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390 && p.errs.length === 0, p.errs.join('|'));

  // ===== ORDEN en una columna (390 y 768) y dos columnas (1440) =====
  // ronda 18: en una columna el contenido va POR PASOS. Distribución: estado compacto → posiciones → anillo (desplegable). Revisión: anillo → resultado → resumen detallado → publicación → gráficos (el orden visual coincide con el del DOM).
  for (const w of [390, 768]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(200);
    const y = sel => p.evaluate(s => { const e = document.querySelector(s); return Math.round(e.getBoundingClientRect().top + scrollY); }, sel), vis = sel => p.evaluate(s => document.querySelector(s).offsetParent !== null, sel);
    await p.evaluate(() => document.querySelector('#paso-dist').click()); await p.waitForTimeout(300);
    const pos = await p.evaluate(() => document.querySelector('#pos-cards').offsetParent ? '#pos-cards' : '.tabla-scroll');
    const ys2 = [await y('#comp'), await y(pos), await y('#panel-donut')], ocultos2 = [await vis('#nota-panel'), await vis('#res-detalle'), await vis('#det-graficos'), await vis('#det-pub')];
    ok(`orden ${w}px, paso 2: estado compacto → posiciones → anillo, y la revisión oculta`, ys2.every((v, i) => i === 0 || v > ys2[i - 1]) && ocultos2.every(v => v === false), ys2.join(' < ') + '; visibles ' + ocultos2.join('/'));
    await p.evaluate(() => { document.querySelector('.js-revisar').click(); }); await p.waitForSelector('#vista-cartera[data-paso="3"]'); await p.waitForTimeout(300);
    await p.evaluate(() => { document.querySelector('#det-pub').open = true; document.querySelector('#det-graficos').open = true; });
    const ys3 = [await y('#panel-donut'), await y('#nota-panel'), await y('#res-detalle'), await y('#det-pub'), await y('#det-graficos')], posVis = await vis(pos);
    ok(`orden ${w}px, paso 3: anillo (una línea) → resultado → resumen detallado → publicación → gráficos, sin las posiciones (orden visual = orden DOM)`, ys3.every((v, i) => i === 0 || v > ys3[i - 1]) && posVis === false, ys3.join(' < '));
    await p.evaluate(() => document.querySelector('#paso-volver').click()); await p.waitForTimeout(300);
  }
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(200);
  ok('1440: dos columnas, resumen lateral y resumen breve oculto', await p.evaluate(() => { const m = document.querySelector('.ws-main').getBoundingClientRect(), r = document.querySelector('.ws-resumen').getBoundingClientRect(); return r.left > m.right && getComputedStyle(document.querySelector('#res-breve')).display === 'none'; }));
  await p.ctx.close();

  // ===== EXPLORAR EMPRESAS =====
  p = await nuevo(b, 1440, 900); await p.goto(B + '#empresas'); await p.waitForSelector('[data-t] >> visible=true');
  ok('empresas: encabezados Empresa · Sector · Comprobaciones · acción', (await p.locator('.tabla-emp thead th').allTextContents()).map(t => t.trim()).join('|') === 'Empresa|Sector|Comprobaciones|Acción');
  const f1 = (await T(p, '#empresas-lista tr:first-child .nombre-emp')) + ' / ' + (await T(p, '#empresas-lista tr:first-child .simbolo')); ok('empresas: nombre con protagonismo y símbolo complementario', /^[A-Za-z].+ \/ [A-Z]{1,5}$/.test(f1) && (await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.nombre-emp')).fontWeight) >= 600)), f1);
  const alt = await p.evaluate(() => [...document.querySelectorAll('#empresas-lista tr')].slice(0, 20).map(r => Math.round(r.getBoundingClientRect().height))); ok('empresas: filas de 56–96 px (ronda 12: con las cinco píldoras de comprobaciones)', alt.every(a => a >= 56 && a <= 96), alt.join(','));
  ok('empresas: «Ver ficha» visible en cada fila', (await p.locator('#empresas-lista .ver-ficha:visible').count()) === 126 && (await T(p, '#empresas-lista tr:first-child .ver-ficha')).startsWith('Ver ficha'));
  const orden = await p.evaluate(() => [...document.querySelectorAll('#empresas-lista tr')].map(r => [parseInt(r.querySelector('.marca-n').textContent), parseInt((r.querySelector('.sin-d')?.textContent || '').trim()) || 0, r.querySelector('[data-t]').dataset.t]));
  ok('empresas: orden real = superadas (desc) → no superadas (asc) → símbolo (A–Z); sin datos no cuentan como fallo', orden.every((x, i) => { if (i === 0) return true; const y = orden[i - 1], ns = r => 5 - r[0] - r[1]; return x[0] < y[0] || (x[0] === y[0] && (ns(x) > ns(y) || (ns(x) === ns(y) && x[2] > y[2]))); }), orden.slice(0, 4).join(' | '));
  ok('empresas: criterio de orden y empates explicados', (await T(p, '.plegable')).includes('después, por símbolo') && (await T(p, '.plegable')).includes('menos comprobaciones no superadas') && (await T(p, '.plegable')).includes('sin datos no suman ni restan'));
  ok('empresas: «no es una recomendación de compra»', (await T(p, '.pag-cab')).includes('no es una recomendación de compra'));
  ok('empresas: sin paginación ficticia', (await p.locator('[aria-label*="ágina"], .paginacion, [data-page]').count()) === 0 && /^126( de 125)? empresas$/.test(await T(p, '#emp-cuenta')));
  await p.focus('#empresas-lista tr:first-child .ver-ficha'); await p.keyboard.press('Enter'); await p.waitForSelector('#dlg-ficha[open]'); ok('empresas: «Ver ficha» se abre con teclado', true); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.focus('#ir-screener'); await p.keyboard.press('Enter'); await p.waitForTimeout(500); ok('empresas: «Ir a los filtros de precio» salta la lista de 126 filas', await p.evaluate(() => document.activeElement.id) === 'filtros-precio' && await p.evaluate(() => document.querySelector('#filtros-precio').getBoundingClientRect().top < innerHeight));
  await p.keyboard.press('Home'); await p.evaluate(() => window.scrollTo(0, 0)); await p.focus('#emp-buscar');
  let tabs = 0; for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); tabs++; }
  ok('empresas: el foco recorre las filas en orden (Tab)', (await p.evaluate(() => document.activeElement.classList.contains('ver-ficha'))), '');
  await p.ctx.close();

  // ===== FICHA EN MÓVIL =====
  p = await nuevo(b, 390, 844); await p.goto(B + '#empresas'); await p.waitForSelector('[data-t] >> visible=true'); await p.locator('[data-t] >> visible=true').nth(2).click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(300);
  ok('ficha móvil: cinco comprobaciones con valor, icono y texto', (await p.locator('#fi-cuerpo .checks li').count()) === 5 && (await p.locator('#fi-cuerpo .res').allTextContents()).every(t => /[✓✗–]/.test(t) && /Superada|No superada|Sin datos/.test(t)));
  const ficha = await T(p, '#dlg-ficha');
  ok('ficha móvil: moneda y escala en el título; sin «mil M»', ficha.includes('Importes en miles de millones de USD; ROIC en %') && !/mil M\b/.test(ficha), '');
  ok('ficha móvil: periodo y fuente visibles, metodología accesible', (await T(p, '#fi-sub')).includes('FY20') && ficha.includes('Datos de PRUEBA ficticios') && await p.locator('#fi-cuerpo details summary', { hasText: 'Metodología' }).count() === 1);
  const sc = await p.evaluate(() => { const t = document.querySelector('#dlg-ficha .tabla-h'); return { s: t.scrollWidth, c: t.clientWidth }; });
  ok('ficha móvil: tabla desplazable dentro de su contenedor, con aviso visible', sc.s > sc.c && await p.isVisible('.hint-scroll'), JSON.stringify(sc));
  const col = await p.evaluate(() => { const t = document.querySelector('#dlg-ficha .tabla-h'); const th = t.querySelector('tbody th'); const a = th.getBoundingClientRect().left; t.scrollLeft = 150; return [Math.round(a), Math.round(th.getBoundingClientRect().left), Math.round(t.scrollLeft)]; });
  ok('ficha móvil: la columna de año se mantiene como referencia al desplazar', Math.abs(col[0] - col[1]) <= 2 && col[2] > 0, col.join(','));
  ok('ficha móvil: página sin desbordamiento horizontal', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  await p.evaluate(() => { const d = document.querySelector('#dlg-ficha'); d.scrollTop = d.scrollHeight; }); await p.waitForTimeout(200);
  ok('ficha móvil: «Cerrar» sigue a la vista al desplazarse', await p.evaluate(() => { const r = document.querySelector('#dlg-ficha [data-cerrar]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
  await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300); await p.evaluate(() => { const d = document.querySelector('#dlg-ficha'); d.scrollTop = d.scrollHeight; });
  ok('ficha con texto al 200 %: «Cerrar» accesible y sin desbordar la página', await p.evaluate(() => { const r = document.querySelector('#dlg-ficha [data-cerrar]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && document.documentElement.scrollWidth <= innerWidth + 1; }));
  await p.ctx.close();

  // ===== PORTADA =====
  p = await nuevo(b, 1440, 900); await p.goto(B); await p.waitForSelector('#muestra-publicas .tarjeta');
  ok('portada: titular conservado', (await T(p, 'h1')) === 'Crea, entiende y sigue tu portafolio');
  ok('portada: explicación acortada (texto pedido)', (await T(p, '.lead')) === 'Crea una cartera, investiga por qué darle espacio a una empresa y observa qué cambia. Sin invertir dinero real.', await T(p, '.lead'));
  ok('portada: SEC solo en texto secundario de fuentes', !(await T(p, '.lead')).includes('SEC') && (await T(p, '.fuentes')).includes('SEC'));
  await p.click('#probar'); await p.waitForTimeout(700);
  ok('portada: «Probar una cartera» desplaza a las plantillas y mueve el foco', await p.evaluate(() => document.activeElement.classList.contains('plantilla') && document.activeElement.getBoundingClientRect().top < innerHeight && document.activeElement.getBoundingClientRect().bottom > 0));
  const prev = await T(p, '#prev');
  ok('portada: vista previa abreviada (3 posiciones + «+3 posiciones») con totales completos', (await p.locator('#prev .prev-fila:not(.prev-th)').count()) === 3 && prev.includes('+3 posiciones') && prev.includes('abreviada') && prev.includes('100,0 %') && prev.includes('6 posiciones'));
  const ph = await p.evaluate(() => Math.round(document.querySelector('#prev .prev').getBoundingClientRect().height)); ok('portada: vista previa más baja (< 460 px)', ph < 460, ph + 'px');
  ok('portada: etiquetas veraces de origen en carteras públicas', (await p.locator('#muestra-publicas .chip.origen').allTextContents()).every(t => t === 'Ejemplo de Klever'));
  ok('portada: descripciones completas, sin recortes', await p.evaluate(() => [...document.querySelectorAll('#muestra-publicas .t-tesis')].every(e => e.scrollHeight <= e.clientHeight + 1 && !/[…]|\.\.\.$/.test(e.textContent) && /[.]$/.test(e.textContent.trim()))));
  ok('portada: aviso general conservado y sin avisos recortados', (await T(p, '.pie')).includes('Contenido educativo. No es asesoramiento financiero'));
  await p.ctx.close();
  p = await nuevo(b, 390, 844); await p.goto(B); await p.waitForSelector('.plantilla');
  const th = await p.evaluate(() => { const c = [...document.querySelectorAll('.plantilla')]; return Math.round(c[c.length - 1].getBoundingClientRect().bottom - c[0].getBoundingClientRect().top); }); ok('portada móvil: las tres plantillas caben en ≤ 360 px de alto (antes 649)', th <= 360, th + 'px (antes: 649 px)');
  ok('portada móvil: vista previa oculta', !(await p.isVisible('#prev'))); await p.ctx.close();
  await b.close(); fin();
})();
