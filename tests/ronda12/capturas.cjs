// Capturas COMPARABLES antes/después de la ronda 12: detalles del editor, «Mis carteras», «Explorar empresas» y ficha.
// Uso: node tests/ronda12/capturas.cjs antes|despues → ronda12/capturas/<fase>-<id>-<ancho>.png (el texto ampliado es una SIMULACIÓN: font-size del documento)
const { chromium, B, nuevo, entrar, peso, mail } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const FASE = process.argv[2] || 'antes', OUT = path.resolve(__dirname, '..', '..', 'ronda12', 'capturas') + path.sep; fs.mkdirSync(OUT, { recursive: true });
const LARGO = 'Cartera de inversión a largo plazo con un nombre extraordinariamente largo para probar';
(async () => {
  const b = await chromium.launch(); let n = 0;
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, ruta, body]);
  const sinBorrador = async (p, tag) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(500); };
  const ampliar = async (p, v) => { await p.evaluate(v => { document.documentElement.style.fontSize = v ? '200%' : ''; }, v); await p.waitForTimeout(350); };
  const T10 = ['AAPL', 'MSFT', 'KO', 'PG', 'JNJ', 'XOM', 'NVDA', 'AMZN', 'GOOGL', 'META'];
  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 760;
    const shot = async (p, id, full = false) => { await p.waitForTimeout(300); await p.screenshot({ path: OUT + `${FASE}-${id}-${w}.png`, fullPage: full }); n++; };
    // ---- Mis carteras: vacía → una → varias (con una pública, un nombre largo y cambios locales pendientes)
    let p = await nuevo(b, w, h); await sinBorrador(p, 'V' + w); await shot(p, 'M0-mis-carteras-vacia');
    await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera de dividendos', plantilla: 'dividendos', posiciones: [{ ticker: 'SCHD', peso: 30 }, { ticker: 'KO', peso: 25 }, { ticker: 'PG', peso: 20 }, { ticker: 'JNJ', peso: 15 }, { ticker: 'XOM', peso: 10 }] });
    await p.reload(); await p.waitForSelector('.cartera-item'); await shot(p, 'M1-mis-carteras-una');
    await api(p, 'POST', '/portfolios', { nombre: LARGO, plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 30 }, { ticker: 'AMZN', peso: 20 }, { ticker: 'GOOGL', peso: 5 }, { ticker: 'META', peso: 3 }, { ticker: 'TSLA', peso: 0.5 }] });
    const o = await api(p, 'POST', '/portfolios', { nombre: 'Oro', plantilla: 'oro', posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 25 }, { ticker: 'GDX', peso: 25 }], tesis: 'Oro físico y mineras' });
    await api(p, 'PATCH', '/portfolios/' + o.j.id, { publico: true, revision: o.j.revision });
    await p.reload(); await p.waitForSelector('.cartera-item'); await p.locator('.cartera-item').first().click(); await p.locator('.peso-in >> visible=true').first().waitFor(); await peso(p).fill('18'); await p.waitForTimeout(600);
    await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.waitForTimeout(300); await shot(p, 'M2-mis-carteras-varias'); await shot(p, 'M2-mis-carteras-varias-pagina', true);
    await ampliar(p, true); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'T1-mis-carteras-texto-ampliado'); await ampliar(p, false);
    // ---- Editor: cabecera de una cartera pública con cambios inválidos, y diez posiciones
    await p.locator('.cartera-item', { hasText: 'Oro' }).first().click(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(500); await peso(p).fill('20'); await p.waitForTimeout(700); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'E1-editor-publica-invalida'); await shot(p, 'E1b-editor-publica-invalida-pagina', true);
    const d = await api(p, 'POST', '/portfolios', { nombre: 'Diez posiciones', plantilla: 'dividendos', posiciones: T10.map(t => ({ ticker: t, peso: 10 })) });
    await p.goto(B + '#cartera-' + d.j.id); await p.reload(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(600); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'E2-editor-diez-posiciones');
    await p.ctx.close();
    // ---- Explorar empresas
    p = await nuevo(b, w, h); await p.goto(B + '#empresas'); await p.waitForSelector('.ver-ficha >> visible=true'); await p.waitForTimeout(400); await shot(p, 'X1-explorar'); await shot(p, 'X1-explorar-pagina-corta');
    await p.fill('#emp-buscar', 'bank'); await p.waitForTimeout(300); await shot(p, 'X2-explorar-busqueda');
    await p.fill('#emp-buscar', 'zzzzzz'); await p.waitForTimeout(300); await shot(p, 'X3-explorar-sin-resultados');
    await p.fill('#emp-buscar', ''); await ampliar(p, true); await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'T2-explorar-texto-ampliado'); await ampliar(p, false);
    // ---- Ficha: con datos, con datos ausentes y texto ampliado
    await p.fill('#emp-buscar', 'adobe'); await p.waitForTimeout(250); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(500); await shot(p, 'F1-ficha');
    await p.evaluate(() => { const d = document.querySelector('#dlg-ficha'); d.scrollTop = d.scrollHeight; }); await shot(p, 'F1b-ficha-final');
    await p.keyboard.press('Escape'); await p.waitForTimeout(250); await p.fill('#emp-buscar', 'jpmorgan'); await p.waitForTimeout(250); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(500); await shot(p, 'F2-ficha-sin-datos');
    await ampliar(p, true); await p.evaluate(() => { document.querySelector('#dlg-ficha').scrollTop = 0; }); await shot(p, 'T3-ficha-texto-ampliado'); await ampliar(p, false);
    await p.ctx.close();
    // ---- Explorar: error al cargar
    p = await nuevo(b, w, h); await p.route('**/api/ideas', r => r.abort()); await p.goto(B + '#empresas'); await p.waitForTimeout(1200); await shot(p, 'X4-explorar-error');
    await p.ctx.close();
  }
  console.log(FASE + ': ' + n + ' capturas'); await b.close();
})();
