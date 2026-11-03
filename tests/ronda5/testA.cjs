// Bloque A: validaciones unificadas (guardar/publicar) y resumen exacto
const { chromium, B, ok, T, nuevo, entrar, peso, fin } = require('./h.cjs');
(async () => {
  const b = await chromium.launch();
  let p = await nuevo(b); await entrar(p, 'dividendos', 'A');
  const api = async (m, path, body) => { const t = await p.evaluate(() => localStorage.getItem('klever_token'));
    return p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, path, body, t]); };
  const id = (await p.evaluate(() => location.hash)).split('-')[1];
  ok('estado: tres conceptos separados (cuenta · sin cambios · privada)', (await T(p, '#estado')) === 'Guardada en tu cuenta' && (await T(p, '#chip')) === 'Privada');
  await p.click('#estado'); await p.waitForSelector('#dlg-estado[open]');
  ok('diálogo de estado: dónde, cambios pendientes y visibilidad', (await p.locator('#es-cuerpo dt').allTextContents()).join('|') === 'Persistencia|Validez del reparto|Privacidad'); await p.keyboard.press('Escape');

  // --- 103 % ---
  await peso(p).fill('20'); await p.waitForTimeout(150);
  const g = p.locator('.js-guardar >> visible=true');
  ok('103 %: Guardar desactivado y motivo junto a la acción', await g.isDisabled() && (await T(p, '#motivo')).includes('Exceso de asignación: 3 %'), await T(p, '#motivo'));
  ok('103 %: la persistencia sigue visible («Cambios sin guardar en tu cuenta» + copia local)', (await T(p, '#estado')).startsWith('Cambios sin guardar en tu cuenta') && (await T(p, '#estado')).includes('copia en este dispositivo'), await T(p, '#estado'));
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Una tesis.'); await p.waitForTimeout(100);
  ok('103 %: Publicar también desactivado, con motivo al lado', await p.locator('#publicar').isDisabled() && (await T(p, '#pub-razon')).includes('Exceso de asignación: 3 %'), await T(p, '#pub-razon'));
  const r1 = await api('PUT', `/portfolios/${id}`, { posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 60 }] });
  ok('servidor: guardar >100 % rechazado (misma regla)', r1.s === 400 && r1.j.error.includes('más de 100'), JSON.stringify(r1));
  ok('chip sigue Privada y no hay confirmación', (await T(p, '#chip')) === 'Privada' && !(await p.locator('#toast.on').count()));

  // --- por debajo de 100 %: reparto incompleto ---
  await peso(p).fill('5'); await p.waitForTimeout(150);
  ok('88 %: «Pendiente de asignar: 12 %»', (await T(p, '#r-falta')) === 'Pendiente de asignar: 12 %', await T(p, '#r-falta'));
  ok('88 %: se puede guardar (reparto incompleto, privado)', !(await g.isDisabled()));
  ok('88 %: Publicar desactivado: pendiente de asignar', await p.locator('#publicar').isDisabled() && (await T(p, '#pub-razon')).includes('Pendiente de asignar: 12 %'));
  await g.click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  ok('88 %: guardado sin inventar efectivo (sigue «Pendiente de asignar»)', (await T(p, '#r-falta')).includes('Pendiente de asignar') && !(await T(p, 'body')).toLowerCase().includes('efectivo'));
  const r2 = await api('PATCH', `/portfolios/${id}`, { publico: true, tesis: 'x' });
  ok('servidor: publicar con 88 % rechazado', r2.s === 400 && r2.j.error.includes('100 % asignado'), JSON.stringify(r2));

  // --- completar y publicar ---
  await peso(p).fill('17'); await p.waitForTimeout(150);
  ok('100 %: «Asignado: 100 %» y Publicar disponible', (await T(p, '#rb-total')) === 'Asignado: 100 %' && (await T(p, '#r-total')) === '100 %' && !(await p.locator('#publicar').isDisabled()), await T(p, '#rb-total'));
  await g.click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública');
  ok('publicada: chip Pública + botón «Dejar de publicar»', (await T(p, '#publicar')) === 'Dejar de publicar' && (await T(p, '#estado')).includes('Guardada'));
  // pública: no se puede guardar incompleto
  await peso(p).fill('10'); await p.waitForTimeout(150);
  ok('pública + incompleto: Guardar desactivado; la versión publicada no cambia y no hace falta despublicar', await g.isDisabled() && (await T(p, '#motivo')).includes('la versión publicada no cambia') && (await T(p, '#chip')) === 'Pública', await T(p, '#motivo'));
  ok('pública + incompleto: «Actualizar tesis» desactivado, «Dejar de publicar» activo', await p.locator('#tesis-guardar').isDisabled() && !(await p.locator('#publicar').isDisabled()));
  const r3 = await api('PUT', `/portfolios/${id}`, { posiciones: [{ ticker: 'KO', peso: 50 }] });
  ok('servidor: guardar incompleto en cartera pública rechazado', r3.s === 400 && r3.j.error.includes('pública'), JSON.stringify(r3));
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Privada');
  ok('despublicar funciona aunque la composición esté a medias', (await T(p, '#publicar')) === 'Publicar cartera');
  await g.click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  ok('ya privada: se guarda el reparto incompleto', (await T(p, '#estado')).includes('Guardada'));

  // --- una operación fallida no confirma nada ---
  await peso(p).fill('17'); await g.click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  await p.fill('#tesis', 'Tesis.'); await p.route('**/api/portfolios/*', r => r.request().method() === 'PATCH' && r.request().postData().includes('publico') ? r.abort() : r.continue());
  await g.click().catch(() => {}); await p.waitForTimeout(400);
  await p.click('#publicar'); await p.waitForTimeout(700);
  ok('publicación fallida: sin «Cartera publicada», sigue Privada y con aviso', (await T(p, '#chip')) === 'Privada' && (await T(p, '#pub-error')).length > 5 && !(await T(p, '#toast')).includes('publicada'), await T(p, '#pub-error'));
  await p.unroute('**/api/portfolios/*');
  await peso(p).fill('16,5'); await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue()); await g.click(); await p.waitForTimeout(600);
  ok('guardado fallido: «No se pudo guardar», sin «Guardada», valor conservado', (await T(p, '#estado')).startsWith('No se pudo guardar') && !(await T(p, '#estado')).includes('Guardada') && (await peso(p).inputValue()) === '16,5', await T(p, '#estado'));
  await p.unroute('**/api/portfolios/*'); await g.click(); await p.waitForFunction(() => document.querySelector('#estado-live').textContent.includes('Guardada'));
  ok('tras recuperarse: Guardada con el valor conservado', (await T(p, '#estado')) === 'Guardada en tu cuenta');

  // --- resumen: etiquetas exactas ---
  ok('resumen: «Distribución por categorías»', (await p.locator('#res-detalle h3').allTextContents()).join().includes('Distribución por categorías') && !(await T(p, '#res-detalle')).includes('Distribución por sector'));
  ok('resumen: «ROIC medio de empresas con datos»', (await T(p, '.datos')).includes('ROIC medio de empresas con datos'));
  ok('resumen: «No representa la rentabilidad de tu cartera»', (await T(p, '.nota-roic')) === 'No representa la rentabilidad de tu cartera.');
  const cob = await T(p, '#r-cobertura');
  ok('resumen: cobertura por posiciones y por peso con denominador definido', /Con dato: \d+ de \d+ posiciones \(\d+ % del peso asignado\)/.test(cob), cob);
  ok('resumen: media ponderada, fórmula y datos ausentes en el desplegable', (await T(p, '#res-detalle details')).includes('media ponderada') && (await T(p, '#res-detalle details')).includes('suma de (ROIC') && (await T(p, '#res-detalle details')).includes('ni como cero ni en el denominador'));
  ok('ROIC: fondos «No aplicable»', (await T(p, '#pos-tabla tbody')).includes('No aplicable') && !(await T(p, '#pos-tabla tbody')).includes('—'));
  await p.fill('#buscar-activo', 'jpmorgan'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok('ROIC: empresa sin dato «No disponible» (distinto de «No aplicable»)', (await T(p, '#pos-tabla tbody')).includes('No disponible') && (await T(p, '#r-cobertura')).includes('Dato ausente (no disponible)') && (await T(p, '#r-cobertura')).includes('No aplicable'), await T(p, '#r-cobertura'));
  ok('añadir un activo reparte lo que faltaba: queda «Asignado: 100 %»', (await T(p, '#rb-total')) === 'Asignado: 100 %', await T(p, '#rb-total'));
  ok('sin errores JS', p.errs.length === 0, p.errs.join('|')); await p.ctx.close(); await b.close(); fin();
})();
