const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');                       // raíz del repositorio (nada va con rutas absolutas)
const B = process.env.BASE_URL || 'http://localhost:8788/';
const RONDA = process.env.RONDA || 'ronda11';
const EVDIR = path.resolve(ROOT, RONDA, 'evidencias') + path.sep;          // capturas de esta ejecución (no se versionan salvo que se indique)
fs.mkdirSync(EVDIR, { recursive: true });
let pass = 0, fail = 0; const fails = [];
const ok = (n, c, x = '') => { c ? pass++ : (fail++, fails.push(n + (x ? ' → ' + x : ''))); console.log((c ? 'OK   ' : 'FALLA') + ' ' + n + (!c && x ? '  [' + x + ']' : '')); };
const T = async (p, s) => ((await p.textContent(s)) || '').trim().replace(/ /g, ' ');
let n = 0; const mail = t => `t4-${t}-${Date.now()}-${++n}@example.com`;
// Ronda 18: diagnóstico de las pruebas intermitentes. LATENCIA_MS añade un retardo DETERMINISTA (el mismo para todas) a las respuestas GET que reconstruyen cartera, sesión y datos;
// TRAZA=1 registra, con el tiempo, cada navegación y cada respuesta de la API (y los errores de página) y la vuelca al terminar en <ronda>/trazas/<batería>.txt.
const LAT = +process.env.LATENCIA_MS || 0, TRAZA = !!process.env.TRAZA, traza = [];
async function nuevo(b, w = 1440, h = 900, scheme = 'light') {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await c.newPage();
  await p.route(/tradingview\.com/, r => r.abort()); p.errs = []; p.on('pageerror', e => { p.errs.push(e.message); if (TRAZA) traza.push(`${Date.now() - T0} PAGEERROR ${e.message}`); }); p.ctx = c;
  if (LAT) await p.route(/\/api\/(portfolios|escenarios|radar|universo|datos|assets|public)/, async r => { if (r.request().method() === 'GET') await new Promise(res => setTimeout(res, LAT)); return r.continue(); });
  if (TRAZA) { p.on('framenavigated', f => f === p.mainFrame() && traza.push(`${Date.now() - T0} NAV ${f.url()}`)); p.on('response', r => /\/api\//.test(r.url()) && traza.push(`${Date.now() - T0} ${r.status()} ${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}`)); }
  return p;
}
const T0 = Date.now();
async function entrar(p, plantilla = 'dividendos', tag = 'x') { // invitado → plantilla → acceso → enlace → cuenta (borrador migrado)
  await p.goto(B); await p.waitForSelector('.plantilla'); await p.click(`[data-plantilla=${plantilla}]`); await p.waitForSelector('#vista-cartera:not([hidden])');
  await p.click('.js-guardar >> visible=true'); await p.waitForSelector('#dlg-acceso[open]');
  await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  const link = await p.getAttribute('#acc-dev a', 'href'); await p.goto(link);
  await p.waitForFunction(() => document.querySelector('#estado-live')?.textContent.includes('Guardada')); await p.waitForTimeout(300);
  return link;
}
const peso = (p, i = 0) => p.locator('.peso-in >> visible=true').nth(i);
// ronda 18: en móvil el editor va por PASOS (Distribución / Revisión): estos ayudantes cambian de paso como lo haría la persona (pulsando «Revisar» / «Volver a la distribución»)
const revision = async p => { await p.evaluate(() => document.querySelector('.js-revisar').click()); await p.waitForSelector('#vista-cartera[data-paso="3"]', { state: 'attached' }); await p.waitForTimeout(250); };
const distribucion = async p => { await p.evaluate(() => document.querySelector('#paso-dist').click()); await p.waitForSelector('#vista-cartera[data-paso="2"]', { state: 'attached' }); await p.waitForTimeout(250); };
const evid = []; // evidencias: escenario, esperado, observado (medido en la ejecución), resultado
const ev = (id, escenario, esperado, observado, cond, evidencia) => { ok(`[${id}] ${escenario}`, cond, observado); evid.push({ id, escenario, esperado, observado, resultado: cond ? 'OK' : 'FALLA', evidencia }); };
const fin = (nombre) => { if (TRAZA && traza.length) { fs.mkdirSync(path.resolve(ROOT, RONDA, 'trazas'), { recursive: true }); fs.writeFileSync(path.resolve(ROOT, RONDA, 'trazas', `${path.basename(process.argv[1] || 'bateria', '.cjs')}${LAT ? '-lat' + LAT : ''}.txt`), traza.join('\n') + '\n'); }
  console.log(`\nRESULTADO: ${pass} correctas, ${fail} fallos` + (fail ? '\nFALLOS:\n- ' + fails.join('\n- ') : ''));
  if (nombre && evid.length) { fs.mkdirSync(path.resolve(ROOT, RONDA), { recursive: true }); fs.writeFileSync(path.resolve(ROOT, RONDA, `${nombre}.json`), JSON.stringify(evid, null, 1)); } };
module.exports = { chromium, B, ROOT, EVDIR, ok, ev, T, nuevo, entrar, peso, fin, mail, revision, distribucion };
