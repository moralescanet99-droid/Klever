// Demo autónoma (ronda 22): el recorrido nuevo del Cuaderno funciona TAMBIÉN en la demo (todo en memoria): probar un cambio → guardar en el Cuaderno → «Para revisar» → registrar una revisión → historial; y la demo
// NO persiste: tras recargar, nada de eso sigue (por eso no sirve para «cerrar y volver»). Requiere el servidor estático de la demo (run-all.sh lo arranca) o DEMO_URL. Uso: DEMO_URL=http://localhost:8790/ node tests/ronda22/testDemo22.cjs
const { chromium } = require('playwright');
const F = process.env.DEMO_URL || 'http://localhost:8790/';
(async () => {
  const b = await chromium.launch(); let bad = 0, n = 0;
  const ok = (id, c, x = '') => { n++; console.log((c ? 'OK   ' : 'FALLA') + ' ' + id + (c ? '' : '  [' + x + ']')); if (!c) bad++; };
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const c = await b.newContext({ viewport: { width: w, height: h } }), p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('dialog', d => d.accept().catch(() => {}));
    await p.goto(F); await p.waitForSelector('#entrada-vacia'); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 6);
    await p.click('.js-guardar >> visible=true'); await p.waitForSelector('#dlg-acceso[open]'); await p.fill('#acc-email', 'demo@ejemplo.co'); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#demo-enter'); await p.click('#demo-enter'); await p.waitForTimeout(900);
    ok(`D1-${w}`, /^#cartera-\d+$/.test(await p.evaluate(() => location.hash)));
    await p.evaluate(() => document.querySelector('.js-revisar').click()); await p.waitForSelector('#vz-probar', { state: 'attached' }); await p.waitForTimeout(300); await p.click('#vz-probar'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-ticker', 'KO'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-guardar-btn');
    await p.fill('#lab-pregunta', '¿Qué cambia si KO pesa más?'); await p.fill('#lab-invalidacion', 'Si baja su dividendo'); await p.fill('#lab-revisar', hoy()); await p.click('#lab-guardar-btn'); await p.waitForSelector('.esc-ficha');
    const ficha = await p.evaluate(() => ({ t: document.querySelector('#lab-cuerpo').textContent.replace(/\s+/g, ' '), inval: document.querySelector('.esc-invalidacion')?.textContent.trim() }));
    ok(`D2-${w}`, /Si baja su dividendo/.test(ficha.inval || '') && /¿Qué cambia si KO pesa más\?/.test(ficha.t), JSON.stringify(ficha).slice(0, 200));
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios .seg-grupo'); const g = await p.evaluate(() => document.querySelector('#seg-escenarios .seg-grupo h3').textContent);
    ok(`D3-${w}`, /Para revisar/.test(g), g);
    await p.click('#seg-escenarios [data-registrar]'); await p.waitForSelector('#rev-form', { state: 'visible' }); await p.fill('#rev-obs', 'Comentario en la demo'); await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1, null, { timeout: 10000 });
    const rv = await p.evaluate(() => ({ lista: document.querySelector('.esc-rev-lista').textContent.replace(/\s+/g, ' '), msg: document.querySelector('#rev-estado')?.textContent.trim() }));
    ok(`D4-${w}`, /Comentario en la demo/.test(rv.lista) && /Revisión registrada/.test(rv.msg), JSON.stringify(rv).slice(0, 200));
    await p.reload(); await p.waitForTimeout(1200); const logged = await p.evaluate(() => !document.querySelector('#entrar')?.hidden);   // sin sesión vuelve a verse «Entrar»
    ok(`D5-${w}`, logged === true, 'tras recargar la demo debe volver a pedir acceso (no persiste)');
    ok(`D0-${w}`, errs.length === 0 && (await p.evaluate(() => document.documentElement.scrollWidth)) <= w, errs.join('|'));
    await c.close();
  }
  await b.close(); console.log(`\nRESULTADO: ${n - bad} correctas, ${bad} fallos`); if (bad) process.exitCode = 1;
  setTimeout(() => process.exit(process.exitCode || 0), 10000).unref();
})();
