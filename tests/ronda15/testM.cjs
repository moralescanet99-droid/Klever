// Batería M (ronda 15): privacidad y regresiones con cuentas A y B en el navegador. (1) salida inmediata con el detalle de cartera de A en vuelo,
// (2) diálogo de conflicto retrasado, (3) 401 retrasado de A con B ya dentro, (4) copias locales de cambios sin guardar: aviso al salir, descarte,
// purga al entrar otra cuenta y caducidad. Además de outerHTML se inspeccionan los VALORES de los campos. Uso: node tests/ronda15/testM.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const N = s => String(s).replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(700); };
  const todo = p => p.evaluate(() => document.documentElement.outerHTML + ' ' + [...document.querySelectorAll('input,textarea')].map(e => e.value).join(' '));
  const claves = p => p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('klever_edit_')));
  const CAR = 'CARTERA-SECRETA-A-5520', TXT = 'TEXTO-EDITADO-SECRETO-9914';
  const conCartera = async (p, email) => { await entrarCon(p, email); const c = await api(p, 'POST', '/portfolios', { nombre: CAR, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], tesis: 'Tesis privada de A' }); await p.reload(); await p.waitForSelector('.cartera-item'); return c.j; };

  // ---------- 1. Salir mientras el detalle de la cartera de A está en vuelo
  { const p = await nuevo(b, 1440, 900), c = await conCartera(p, mail('MA'));
    await p.route(new RegExp('/api/portfolios/' + c.id + '$'), async r => { if (r.request().method() === 'GET') await new Promise(res => setTimeout(res, 2500)); return r.continue(); });
    await p.locator('.cartera-item').first().click(); await p.waitForTimeout(300); await p.click('#salir'); await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(3600);
    const t = await todo(p), hash = await p.evaluate(() => location.hash), vista = await p.evaluate(() => [...document.querySelectorAll('[data-vista]')].find(s => !s.hidden)?.dataset.vista);
    ev('M1', 'Salir con el detalle de la cartera de A todavía en vuelo (llega 2,5 s después)', 'Al salir se limpia YA; la respuesta tardía no vuelve a asignar el nombre ni los pesos: ni el HTML ni los campos contienen la cartera; se queda en la portada', `HTML/campos con la cartera: ${t.includes(CAR)}; hash ${hash}; vista ${vista}`, !t.includes(CAR) && !t.includes('Tesis privada de A') && vista === 'inicio');
    await p.ctx.close(); }
  // ---------- 2. Diálogo de conflicto retrasado
  { const p = await nuevo(b, 1440, 900), c = await conCartera(p, mail('MB'));
    await p.evaluate(([id]) => localStorage.setItem('klever_edit_' + id, JSON.stringify({ nombre: 'NOMBRE-LOCAL-SECRETO', tesis: '', pos: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }], base: -5, t: new Date().toISOString() })), [c.id]);
    await p.route(new RegExp('/api/portfolios/' + c.id + '$'), async r => { if (r.request().method() === 'GET') await new Promise(res => setTimeout(res, 2200)); return r.continue(); });
    await p.locator('.cartera-item').first().click(); await p.waitForTimeout(300); await p.click('#salir'); await p.waitForSelector('#dlg-salir[open]'); await p.click('#salir-descartar'); await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(3500);
    const t = await todo(p), abierto = await p.evaluate(() => [...document.querySelectorAll('dialog[open]')].map(d => d.id));
    ev('M2', 'Diálogo de conflicto de A que habría salido DESPUÉS de salir (respuesta tardía)', 'No se abre ningún diálogo de conflicto ni queda el nombre local ni el de la cartera', `diálogos abiertos [${abierto}]; nombre local ${t.includes('NOMBRE-LOCAL-SECRETO')}; cartera ${t.includes(CAR)}`, !abierto.includes('dlg-conflicto') && !t.includes('NOMBRE-LOCAL-SECRETO') && !t.includes(CAR));
    await p.ctx.close(); }
  // ---------- 3. 401 retrasado de A mientras B ya está dentro: no desconecta a B
  { const pb = await nuevo(b, 1440, 900); await entrarCon(pb, mail('MBt')); const tokenB = await pb.evaluate(() => localStorage.getItem('klever_token'));
    const p = await nuevo(b, 1440, 900); await entrarCon(p, mail('MAt')); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForTimeout(500);
    await p.route('**/api/escenarios', async r => { await new Promise(res => setTimeout(res, 1800)); return r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"No autorizado"}' }); });
    await p.selectOption('#seg-filtro', 'todos'); await p.waitForTimeout(300);
    await p.evaluate(t => localStorage.setItem('klever_token', t), tokenB);                        // «pasa B»: el token cambia mientras la petición de A sigue en vuelo
    await p.waitForTimeout(2500);
    const tk = await p.evaluate(() => localStorage.getItem('klever_token')), acceso = await p.evaluate(() => document.querySelector('#dlg-acceso')?.open === true);
    ev('M3', 'Un 401 retrasado de la petición de A llega cuando B ya tiene la sesión', 'El 401 se compara con el token de la PETICIÓN, no con el actual: B no se desconecta (su token sigue ahí) y no se abre el acceso', `token de B conservado ${tk === tokenB}; acceso abierto ${acceso}`, tk === tokenB && !acceso);
    await p.ctx.close(); await pb.ctx.close(); }
  // ---------- 4. Copias locales de cambios sin guardar
  { const p = await nuevo(b, 1440, 900), c = await conCartera(p, mail('MC'));
    await p.locator('.cartera-item').first().click(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(400);
    await p.fill('#nombre', TXT); await p.waitForTimeout(600); const hay = (await claves(p)).length;
    await p.click('#salir'); await p.waitForSelector('#dlg-salir[open]'); const aviso = N(await p.textContent('#dlg-salir'));
    await p.click('#salir-volver'); await p.waitForTimeout(500); const sigueDentro = (await p.evaluate(() => localStorage.getItem('klever_token'))) !== null, hashVuelta = await p.evaluate(() => location.hash);
    ev('M4', 'Salir con cambios sin guardar: se avisa y se puede volver a guardarlos', 'Hay una copia local; al pulsar Salir aparece el aviso (nombra el riesgo del dispositivo compartido); «Volver para guardarlos» NO sale y lleva a la cartera', `copias ${hay}; aviso «${aviso.slice(0, 80)}…»; sigue dentro ${sigueDentro}; ${hashVuelta}`, hay === 1 && /podría llegar a verlos/.test(aviso) && sigueDentro && hashVuelta === '#cartera-' + c.id);
    await p.click('#salir'); await p.waitForSelector('#dlg-salir[open]'); await p.click('#salir-descartar'); await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(400);
    const t = await todo(p), tras = (await claves(p)).length;
    ev('M5', 'Salir descartando los cambios locales', 'No queda ninguna copia local y el texto privado no está en el HTML ni en los campos', `copias ${tras}; texto ${t.includes(TXT)}; cartera ${t.includes(CAR)}`, tras === 0 && !t.includes(TXT) && !t.includes(CAR));
    await p.ctx.close(); }
  { // caducidad involuntaria (401): la copia se conserva para recuperarla; al entrar OTRA cuenta se purga
    const p = await nuevo(b, 1440, 900), c = await conCartera(p, mail('MD'));
    await p.locator('.cartera-item').first().click(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(400);
    await p.fill('#nombre', TXT); await p.waitForTimeout(600);
    await p.route('**/api/escenarios', r => r.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"No autorizado"}' })); await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#dlg-acceso[open]', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500);
    const antes = (await claves(p)).length, vistoEnPantalla = (await todo(p)).includes(TXT);
    await p.unroute('**/api/escenarios'); await entrarCon(p, mail('MDB')); await p.waitForTimeout(1500);
    const despues = (await claves(p)).length;
    ev('M6', 'Caducidad involuntaria y entrada de otra cuenta en el mismo navegador', 'Al caducar, el texto no queda en pantalla pero la copia se conserva (para recuperarla); al entrar B, la copia de A (que B no puede abrir) se purga', `copias tras caducar ${antes}; texto en pantalla ${vistoEnPantalla}; copias tras entrar B ${despues}`, antes === 1 && !vistoEnPantalla && despues === 0);
    await p.ctx.close(); }
  { // caducidad por antigüedad (7 días)
    const p = await nuevo(b, 1440, 900), c = await conCartera(p, mail('ME'));
    await p.evaluate(([id]) => localStorage.setItem('klever_edit_' + id, JSON.stringify({ nombre: 'VIEJO', tesis: '', pos: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }], base: 0, t: new Date(Date.now() - 8 * 864e5).toISOString() })), [c.id]);
    await p.reload(); await p.waitForTimeout(1200); const n = (await claves(p)).length;
    ev('M7', 'Copia local de hace 8 días', 'Caduca a los 7 días: se borra al cargar la aplicación', `copias ${n}`, n === 0);
    await p.ctx.close(); }
  await b.close(); fin('evidencias-M15');
})();
