const { chromium } = require('playwright');
const B = 'http://localhost:8788/';
let pass = 0, fail = 0; const fails = [];
const ok = (n, c, x = '') => { c ? pass++ : (fail++, fails.push(n + (x ? ' → ' + x : ''))); console.log((c ? 'OK   ' : 'FALLA') + ' ' + n + (!c && x ? '  [' + x + ']' : '')); };
const T = async (p, s) => ((await p.textContent(s)) || '').trim().replace(/ /g, ' ');
let n = 0; const mail = t => `t4-${t}-${Date.now()}-${++n}@example.com`;
async function nuevo(b, w = 1440, h = 900, scheme = 'light') {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await c.newPage();
  await p.route(/tradingview\.com/, r => r.abort()); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.ctx = c; return p;
}
async function entrar(p, plantilla = 'dividendos', tag = 'x') { // invitado → plantilla → acceso → enlace → cuenta (borrador migrado)
  await p.goto(B); await p.waitForSelector('.plantilla'); await p.click(`[data-plantilla=${plantilla}]`); await p.waitForSelector('#vista-cartera:not([hidden])');
  await p.click('.js-guardar >> visible=true'); await p.waitForSelector('#dlg-acceso[open]');
  await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  const link = await p.getAttribute('#acc-dev a', 'href'); await p.goto(link);
  await p.waitForFunction(() => document.querySelector('#estado-live')?.textContent.includes('Guardada')); await p.waitForTimeout(300);
  return link;
}
const peso = (p, i = 0) => p.locator('.peso-in >> visible=true').nth(i);
const evid = []; // evidencias: escenario, esperado, observado (medido en la ejecución), resultado
const ev = (id, escenario, esperado, observado, cond, evidencia) => { ok(`[${id}] ${escenario}`, cond, observado); evid.push({ id, escenario, esperado, observado, resultado: cond ? 'OK' : 'FALLA', evidencia }); };
const fin = (nombre) => { console.log(`\nRESULTADO: ${pass} correctas, ${fail} fallos` + (fail ? '\nFALLOS:\n- ' + fails.join('\n- ') : ''));
  if (nombre && evid.length) { const R = process.env.RONDA || 'ronda5'; require('fs').mkdirSync(`/home/user/Klever/${R}`, { recursive: true }); require('fs').writeFileSync(`/home/user/Klever/${R}/${nombre}.json`, JSON.stringify(evid, null, 1)); } };
module.exports = { chromium, B, ok, ev, T, nuevo, entrar, peso, fin, mail };
