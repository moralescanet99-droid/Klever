// Capturas «después» de la ronda 5, con los mismos nombres que las «antes» (ronda4/despues). Servidor local en :8788.
const { chromium, B, nuevo, entrar, peso, T } = require('./h.cjs');
const OUT = '/home/user/Klever/ronda5/despues/';
(async () => {
  const b = await chromium.launch();
  for (const [scheme, tema] of [['light', 'claro'], ['dark', 'oscuro']]) for (const [name, w, h] of [['390', 390, 844], ['1440', 1440, 900]]) {
    if (scheme === 'dark' && name === '390') continue;
    const p = await nuevo(b, w, h, scheme); await entrar(p, 'dividendos', `S5${name}${tema}`);
    const t = await p.evaluate(() => localStorage.getItem('klever_token'));
    const api = (m, path, body) => p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: body && JSON.stringify(body) }); return r.json(); }, [m, path, body, t]);
    const f = x => `${OUT}${x}-${name}-${tema}.png`;
    await p.screenshot({ path: f('02-editor-valido') });
    await peso(p).fill('20'); await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.waitForTimeout(300);
    await p.screenshot({ path: f('03-editor-invalido') });
    if (w >= 900) await p.screenshot({ path: f('03b-editor-invalido-completo'), fullPage: true });
    await peso(p).fill('17'); await p.waitForTimeout(200);
    // «Mis carteras» con varias: una pública (100 %), una incompleta (88 %) y la guardada
    const a = await api('POST', '/portfolios', { nombre: 'Oro a largo plazo', plantilla: 'oro' });
    await api('PUT', `/portfolios/${a.id}`, { posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 20 }, { ticker: 'GDX', peso: 20 }, { ticker: 'NEM', peso: 10 }] });
    await api('PATCH', `/portfolios/${a.id}`, { tesis: 'Oro físico y mineras de oro como contrapeso a la renta variable.', publico: true });
    const c = await api('POST', '/portfolios', { nombre: 'Crecimiento en construcción', plantilla: 'riesgo' });
    await api('PUT', `/portfolios/${c.id}`, { posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 48 }] });
    await p.goto(B + '#carteras'); await p.reload(); await p.waitForSelector('.cartera-item'); await p.waitForTimeout(400);
    await p.screenshot({ path: f('04-mis-carteras') });
    await p.goto(B + '#empresas'); await p.waitForSelector('[data-t] >> visible=true'); await p.waitForTimeout(400);
    await p.screenshot({ path: f('05-explorar-empresas') });
    await p.locator('[data-t] >> visible=true').nth(2).click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(400);
    await p.evaluate(() => { document.querySelector('#dlg-ficha').scrollTop = 220; }); await p.waitForTimeout(150);
    await p.screenshot({ path: f('06-ficha') });
    console.log('hecho', name, tema, p.errs.length ? p.errs : 'sin errores'); await p.ctx.close();
  }
  await b.close();
})();
