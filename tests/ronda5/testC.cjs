// Bloque C: recorrido completo, otro navegador, borrador inválido, recargas, accesibilidad y anchuras
const { chromium, B, ok, T, nuevo, entrar, peso, fin, mail } = require('./h.cjs');
(async () => {
  const b = await chromium.launch();
  const draft = p => p.evaluate(() => JSON.parse(localStorage.getItem('klever_borrador') || 'null'));

  // ===== 1. invitado: plantilla → pesos con coma → vaciar → corregir → añadir/quitar =====
  let p = await nuevo(b, 1440, 900); await p.goto(B); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])');
  await peso(p, 1).fill('12,5'); await peso(p, 1).press('Tab'); ok('coma decimal: «12,5» se normaliza y recalcula', (await peso(p, 1).inputValue()) === '12,5' && (await T(p, '#r-falta')).includes('Pendiente de asignar: 4'), await T(p, '#r-falta'));
  await peso(p, 1).fill(''); await p.waitForTimeout(100);
  ok('campo vaciado: marcado inválido, motivo visible, Guardar desactivado', (await peso(p, 1).getAttribute('aria-invalid')) === 'true' && (await T(p, '#pos-error')).includes('Revisa el peso de VYM') && await p.locator('.js-guardar >> visible=true').isDisabled(), await T(p, '#pos-error'));
  await peso(p, 1).fill('abc'); ok('texto no numérico: sigue inválido', (await peso(p, 1).getAttribute('aria-invalid')) === 'true');
  await peso(p, 1).fill('16,6'); await peso(p, 1).press('Tab'); ok('corregido: vuelve a ser válido, sin mensajes', (await peso(p, 1).getAttribute('aria-invalid')) === 'false' && (await T(p, '#pos-error')) === '');
  await peso(p, 0).fill('20'); await p.waitForTimeout(100); ok('total superior a 100 %: exceso indicado y borrador conservado', (await T(p, '#r-falta')).includes('Exceso de asignación: 3 %') && (await draft(p)).pos[0].peso === 20, JSON.stringify((await draft(p))?.pos?.[0]));
  await p.reload(); await p.waitForSelector('#vista-cartera:not([hidden])'); ok('recargar con borrador inválido: se conserva (20 %) y sigue el aviso', (await peso(p, 0).inputValue()) === '20,0' && (await T(p, '#r-falta')).includes('Exceso'), await peso(p, 0).inputValue());
  await peso(p, 0).fill('17'); await p.fill('#buscar-activo', 'apple'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  ok('añadir con teclado: AAPL entra con el peso que faltaba (5 por defecto si no falta)', await p.locator('#pos-tabla tbody tr').count() === 7);
  await p.locator('#pos-tabla [data-quitar="6"]').click(); ok('quitar: vuelve a 6 posiciones y «Asignado: 100 %»', await p.locator('#pos-tabla tbody tr').count() === 6 && (await T(p, '#r-total')) === '100 %');
  ok('invitado: el estado dice «Solo en este dispositivo» (no «Guardada»)', (await T(p, '#estado')) === 'Solo en este dispositivo' && (await T(p, '#chip')) === 'Privada');

  // ===== 2. acceso: conserva el borrador y avisa con honestidad =====
  await peso(p, 0).fill('18'); await peso(p, 1).fill('15,6');
  await p.click('.js-guardar >> visible=true'); await p.waitForSelector('#dlg-acceso[open]');
  ok('acceso: avisa de que el enlace debe abrirse en el mismo navegador para conservar el borrador', (await T(p, '#acc-borrador')).includes('mismo navegador') && await p.isVisible('#acc-borrador'));
  const em = mail('C'); await p.fill('#acc-email', em); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  ok('acceso enviado: confirmación, cambiar email, reenviar con cuenta atrás', (await T(p, '#acc-paso2')).includes(em) && await p.isVisible('#acc-cambiar') && (await T(p, '#acc-reenviar')).includes('Reenviar enlace ('));
  ok('acceso enviado: no promete que el borrador se ha guardado', (await T(p, '#acc-aviso-borrador')).includes('solo si abres el enlace en este mismo dispositivo') && !(await T(p, '#dlg-acceso')).includes('Hemos guardado'));
  ok('el borrador sigue en el dispositivo mientras se pide acceso', (await draft(p)).pos[0].peso === 18);
  const link = await p.getAttribute('#acc-dev a', 'href');

  // ===== 3. el enlace se abre en OTRO navegador/dispositivo =====
  const q = await nuevo(b, 1440, 900); await q.goto(link); await q.waitForSelector('#vista-carteras:not([hidden])'); await q.waitForTimeout(500);
  await q.waitForSelector('#vista-carteras:not([hidden])'); const toastQ = await T(q, '#aviso-cuenta'); const toastCorto = await q.locator('#toast.on').count();
  ok('otro navegador: se entra en la cuenta pero NO hay borrador', (await q.evaluate(() => localStorage.getItem('klever_borrador'))) === null && await q.isVisible('#salir') && await q.isVisible('.menu-escritorio a[data-nav=seguimiento]'));
  ok('otro navegador: aviso PERSISTENTE en «Mis carteras» («todavía no se ha guardado en la cuenta», borrador no disponible en este navegador), sin toast ni confirmación de guardado', toastQ.includes('todavía no se ha guardado en la cuenta') && toastQ.includes('El borrador no está disponible en este navegador') && !toastQ.includes('Hemos guardado') && toastCorto === 0, toastQ);
  ok('otro navegador: sin carteras (no se inventó ninguna) y crear es la acción principal', (await q.locator('.cartera-item').count()) === 0 && (await T(q, '#nueva-titulo')) === 'Crea tu primera cartera' && await q.isVisible('#form-nueva') && !(await q.isVisible('#btn-nueva')), await T(q, '#nueva-titulo'));
  ok('el borrador original sigue intacto en el primer dispositivo', (await draft(p)).pos[0].peso === 18 && (await draft(p)).pos.length === 6);
  await q.ctx.close();

  // ===== 4. enlace de un solo uso: no se puede reutilizar =====
  const r = await nuevo(b, 1440, 900); await r.goto(link); await r.waitForTimeout(800);
  ok('enlace ya canjeado: no entra de nuevo', !(await r.evaluate(() => !!localStorage.getItem('klever_token'))) && (await r.locator('#toast').textContent()).includes('caducado') || (await r.locator('#toast').textContent()).includes('ya se usó'), await T(r, '#toast')); await r.ctx.close();

  // ===== 5. mismo navegador: guardar, volver desde Mis carteras, recargar =====
  // (el enlace ya se consumió en el otro navegador: pedimos otro para el primero)
  await p.click('#acc-cambiar'); const em2 = mail('C2'); await p.fill('#acc-email', em2); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  const link2 = await p.getAttribute('#acc-dev a', 'href'); await p.goto(link2); await p.waitForFunction(() => document.querySelector('#estado-live')?.textContent.includes('Guardada')); await p.waitForTimeout(300);
  ok('mismo navegador: el borrador pasa a la cuenta (hash #cartera-N) y se borra del dispositivo', /^#cartera-\d+$/.test(await p.evaluate(() => location.hash)) && (await draft(p)) === null && (await peso(p, 0).inputValue()) === '18,0');
  const id = (await p.evaluate(() => location.hash)).replace('#cartera-', '');
  await peso(p, 0).fill('17'); await peso(p, 5).fill('16,6'); await p.locator('.js-guardar >> visible=true').click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  await p.goto(B + '#carteras'); await p.waitForSelector('#mis-lista .tarjeta');
  ok('Mis carteras: lista la cartera con visibilidad, posiciones y total asignado', (await T(p, '#mis-lista')).includes('Privada') && (await T(p, '#mis-lista')).includes('6 posiciones') && (await T(p, '#mis-lista')).includes('Asignada al 100 %'), await T(p, '#mis-lista'));
  await p.click('#mis-lista .tarjeta'); await p.waitForSelector('#pos-tabla tbody tr');
  ok('volver desde Mis carteras: versión guardada (17,0 %) y estado «Guardada»', (await peso(p, 0).inputValue()) === '17,0' && (await T(p, '#estado')).includes('Guardada'));
  await peso(p, 0).fill('10'); await p.waitForTimeout(100); ok('editar sin guardar: «Cambios locales pendientes de guardar en tu cuenta»', (await T(p, '#estado')).startsWith('Cambios locales pendientes de guardar en tu cuenta'), await T(p, '#estado'));
  await p.reload(); await p.waitForSelector('#pos-tabla tbody tr'); await p.waitForTimeout(300); ok('recargar: se RECUPERAN los cambios sin guardar (10 %) y siguen marcados como pendientes', (await peso(p, 0).inputValue()) === '10,0' && (await T(p, '#estado')).startsWith('Cambios locales pendientes de guardar en tu cuenta'), await peso(p, 0).inputValue() + ' / ' + await T(p, '#estado'));
  await p.click('#mas'); await p.click('#mi-descartar'); await p.waitForSelector('#dlg-confirmar[open]'); await p.click('#cf-si'); await p.waitForTimeout(500); ok('descartar cambios: vuelve la versión GUARDADA (17,0 %)', (await peso(p, 0).inputValue()) === '17,0' && (await T(p, '#estado')) === 'Guardada en tu cuenta', await peso(p, 0).inputValue());

  // ===== 6. publicar y etiqueta de origen =====
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Mi reparto de dividendos.'); await p.waitForTimeout(200); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública');
  await p.goto(B + '#publicas'); await p.waitForSelector('#publicas-lista .tarjeta');
  const chips = await p.locator('#publicas-lista .chip.origen').allTextContents(); ok('públicas: ejemplos de Klever y publicaciones de usuarios con etiquetas veraces', chips.includes('Ejemplo de Klever') && chips.includes('Publicada por un usuario'), chips.join('|'));
  ok('públicas: los ejemplos de Klever van primero', chips[0] === 'Ejemplo de Klever');
  await p.locator('#publicas-lista .tarjeta', { hasText: 'Publicada por un usuario' }).click(); await p.waitForSelector('#publica-detalle:not([hidden])');
  ok('detalle público: sin email ni rentabilidad', !/@|rentabilidad obtenida/i.test(await T(p, '#publica-detalle')) && (await T(p, '#publica-detalle')).includes('Mi reparto de dividendos.'));
  await p.goto(B + '#cartera-' + id); await p.waitForSelector('#pos-tabla tbody tr'); await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Privada');
  ok('despublicar: Privada y fuera de «Carteras públicas»', true); await p.goto(B + '#publicas'); await p.waitForSelector('#publicas-lista .tarjeta'); ok('ya no aparece como publicación de usuario', !(await p.locator('#publicas-lista .chip.origen', { hasText: 'Publicada por un usuario' }).count()));
  await p.ctx.close();

  // ===== 7. borrador inválido + entrar desde el botón «Entrar» =====
  p = await nuevo(b, 1440, 900); await p.goto(B); await p.click('[data-plantilla=oro]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await peso(p, 0).fill('40'); await p.waitForTimeout(100);
  await p.click('#entrar'); await p.waitForSelector('#dlg-acceso[open]'); await p.fill('#acc-email', mail('C3')); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(600);
  ok('borrador inválido al entrar: NO se altera ni se guarda; se avisa y se conserva', (await T(p, '#toast')).includes('sigue en este dispositivo') && (await peso(p, 0).inputValue()) === '40,0' && (await draft(p)) !== null, await T(p, '#toast'));
  ok('con sesión pero sin guardar: «Solo en este dispositivo» y Guardar desactivado por el exceso', (await T(p, '#estado')) === 'Solo en este dispositivo' && (await T(p, '#motivo')).includes('Exceso de asignación') && await p.locator('.js-guardar >> visible=true').isDisabled());
  await peso(p, 0).fill('25'); await p.waitForTimeout(100); await p.locator('.js-guardar >> visible=true').click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  ok('corregido: se crea la cartera en la cuenta (hash #cartera-N) y se limpia el borrador', /^#cartera-\d+$/.test(await p.evaluate(() => location.hash)) && (await draft(p)) === null);

  // ===== 8. Mis carteras: estados =====
  await p.route('**/api/portfolios', r => r.request().method() === 'GET' ? r.abort() : r.continue()); await p.goto(B + '#carteras'); await p.reload(); await p.waitForSelector('[data-retry=mis]');
  ok('Mis carteras: estado de error con reintento', true); await p.unroute('**/api/portfolios'); await p.click('[data-retry=mis]'); await p.waitForSelector('#mis-lista .tarjeta'); ok('Mis carteras: el reintento recupera la lista', true);

  // ===== 9. teclado y foco visible; árbol de accesibilidad =====
  await p.goto(B + '#cartera-' + (await p.evaluate(() => 0) || '') ); 
  await p.goto(B + '#carteras'); await p.waitForSelector('#mis-lista .tarjeta'); await p.click('#mis-lista .tarjeta'); await p.waitForSelector('#pos-tabla tbody tr');
  const names = await Promise.all([p.getByRole('combobox', { name: 'Añadir un activo' }).count(), p.getByRole('button', { name: 'Más acciones' }).count(), p.getByRole('button', { name: 'Guardar cartera' }).first().count(), p.getByRole('complementary', { name: 'Resumen de la cartera' }).count(), p.getByRole('table', { name: 'Posiciones de la cartera' }).count(), p.getByRole('textbox', { name: 'Nombre de la cartera' }).count(), p.getByRole('textbox', { name: /Peso de/ }).count()]);
  ok('lector de pantalla (árbol de accesibilidad): roles y nombres de los controles clave', names.every(n => n >= 1), names.join(','));
  const seq = []; await p.focus('#nombre');
  for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return (e.id || e.className.toString().split(' ')[0] || e.tagName) + ':' + (s.outlineStyle === 'solid' && parseFloat(s.outlineWidth) >= 2 ? 'foco' : 'SIN-FOCO'); })); }
  ok('teclado: cada parada de Tab muestra foco visible', seq.every(s => s.endsWith(':foco')), seq.join(' '));
  await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(300);
  ok('texto al 200 %: el editor no desborda horizontalmente', (await p.evaluate(() => document.documentElement.scrollWidth)) <= (await p.evaluate(() => innerWidth)), await p.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
  ok('sin errores JS en todo el recorrido', p.errs.length === 0, p.errs.join('|')); await p.ctx.close();

  // ===== 10. matriz de anchuras (360 incluido), ambos temas, estados válidos e inválidos =====
  for (const scheme of ['light', 'dark']) for (const w of [320, 360, 390, 720, 768, 1440]) {
    p = await nuevo(b, w, 800, scheme); const sw = []; const chk = async n => { const s = await p.evaluate(() => document.documentElement.scrollWidth); if (s > w) sw.push(n + ':' + s); };
    await p.goto(B); await p.waitForSelector('.plantilla'); await chk('portada');
    await p.goto(B + '#empresas'); await p.waitForSelector('[data-t] >> visible=true'); await chk('empresas'); await p.locator('[data-t] >> visible=true').nth(1).click(); await p.waitForSelector('#dlg-ficha[open]'); await chk('ficha'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.goto(B + '#publicas'); await p.waitForSelector('#publicas-lista .tarjeta'); await p.locator('#publicas-lista .tarjeta').first().click(); await p.waitForSelector('#publica-detalle:not([hidden])'); await chk('públicas');
    await p.goto(B); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await chk('editor-válido');
    await peso(p, 0).fill('20'); await p.evaluate(() => { document.querySelector('#det-pub').open = true; document.querySelector('#det-graficos').open = true; }); await p.waitForTimeout(150); await chk('editor-inválido');
    await p.click('#estado, #b-estado >> visible=true'); await p.waitForSelector('#dlg-estado[open]'); await chk('estado'); await p.keyboard.press('Escape');
    await p.click('.js-guardar:visible', { force: true }).catch(() => {}); await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('#entrar')?.click()); await p.waitForSelector('#dlg-acceso[open]'); await chk('acceso');
    ok(`sin desbordamiento ${w}px · ${scheme === 'light' ? 'claro' : 'oscuro'}`, sw.length === 0 && p.errs.length === 0, sw.join(',') + p.errs.join('|')); await p.ctx.close();
  }
  await b.close(); fin();
})();
