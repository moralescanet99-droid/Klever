// Demostración ANTES/DESPUÉS de la privacidad al salir (fallo de la ronda 13). Se ejecuta contra cualquier servidor:
//   BASE_URL=http://localhost:8795/ node tests/ronda14/antes-despues-privacidad.cjs   (código antiguo → debe MOSTRAR los datos de A tras salir)
//   BASE_URL=http://localhost:8788/ node tests/ronda14/antes-despues-privacidad.cjs   (código nuevo → no debe quedar nada)
const { chromium, B, nuevo, mail } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch(), p = await nuevo(b, 1440, 900), NOTA = 'NOTA-SECRETA-A-7731', CAR = 'CARTERA-SECRETA-A-5520';
  const api = (m, r, body) => p.evaluate(async ([m, r, body]) => (await fetch('/api' + r, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) })).status, [m, r, body]);
  await p.goto(B); await p.click('#entrar'); await p.fill('#acc-email', mail('AD')); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(500);
  await api('POST', '/portfolios', { nombre: CAR, plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] }); await api('PUT', '/radar/KO', { nota: NOTA });
  await p.reload(); await p.waitForSelector('.cartera-item'); await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', 'KO'); await p.waitForTimeout(300);
  await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(600);
  await p.keyboard.press('Escape'); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item');
  await p.click('#salir'); await p.waitForSelector('#entrar:not([hidden])'); await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.documentElement.outerHTML);
  console.log(`Tras salir SIN recargar → HTML contiene la nota de A: ${t.includes(NOTA)}; el nombre de la cartera de A: ${t.includes(CAR)}`);
  await b.close();
})();
