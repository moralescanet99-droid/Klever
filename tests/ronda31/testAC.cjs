// Batería AC (ronda 31, «última generación»). Servidor real, datos ficticios, 1440 / 390 / 320 px.
//   AC1 instalable: manifiesto válido servido, iconos que existen, theme-color, viewport-fit=cover, icono y Open Graph
//   AC2 tipografía propia: la fuente autoalojada se carga y se usa; sin peticiones a dominios externos
//   AC3 iconos SVG en la barra inferior y el menú (ya no caracteres de texto) y barra inferior translúcida
//   AC4 accesibilidad: los pasos del editor conservan su nombre en el móvil; la barra de guardar es una región con nombre
//   AC5 Explorar en el móvil por tandas: 24 tarjetas + «Mostrar 24 más»; la búsqueda encuentra una empresa fuera de la tanda; en escritorio la tabla las tiene todas
//   AC6 la barra de reparto se actualiza en su sitio al cambiar un peso (mismos elementos → la anchura se anima)
//   AC7 aviso de éxito dentro de la paleta (fondo oscuro, texto claro)
//   AC8 «reducir movimiento»: ninguna animación ni transición en marcha al cambiar de vista
//   AC0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, ruta, body]);
  // ---- AC1 / AC2 (una vez)
  {
    const p = await nuevo(b, 390, 844), externas = []; p.on('request', r => { const u = new URL(r.url()); if (!/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && !/tradingview/.test(u.hostname) && u.protocol.startsWith('http')) externas.push(r.url()); });
    await p.goto(B); await p.waitForSelector('.hero'); await p.waitForTimeout(600);
    const meta = await p.evaluate(async () => { const q = s => document.querySelector(s); const man = await (await fetch(q('link[rel=manifest]').href)).json();
      const ok = async u => (await fetch(new URL(u, location.href))).ok; const iconos = await Promise.all(man.icons.map(i => ok(i.src)));
      return { man: { name: man.name, short: man.short_name, display: man.display, start: man.start_url, n: man.icons.length }, iconos, theme: q('meta[name=theme-color]')?.content, vp: q('meta[name=viewport]').content,
        icono: await ok(q('link[rel=icon]').href), apple: await ok(q('link[rel=apple-touch-icon]').href), og: q('meta[property="og:title"]')?.content }; });
    ev('AC1', 'Instalable como app', 'manifiesto «Klever» standalone con 4 iconos que existen; theme-color; viewport-fit=cover; icono, icono de Apple y Open Graph', J(meta),
      meta.man.short === 'Klever' && meta.man.display === 'standalone' && meta.man.n === 4 && meta.iconos.every(Boolean) && /^#/.test(meta.theme || '') && /viewport-fit=cover/.test(meta.vp) && meta.icono && meta.apple && !!meta.og);
    const fuente = await p.evaluate(async () => { await document.fonts.ready; return { cargada: document.fonts.check('16px "Inter Klever"'), usada: getComputedStyle(document.body).fontFamily.startsWith('"Inter Klever"') }; });
    ev('AC2', 'Tipografía propia autoalojada', 'la fuente «Inter Klever» se carga desde /fonts y es la del cuerpo; ninguna petición a dominios externos (salvo TradingView, bloqueado en pruebas)', J({ fuente, externas }), fuente.cargada && fuente.usada && externas.length === 0);
    await p.ctx.close();
  }
  for (const [w, h] of [[1440, 900], [390, 844], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    await p.goto(B); await p.waitForSelector('.hero'); await p.waitForTimeout(400); await mira('portada');
    // ---- AC3
    const iconos = await p.evaluate(() => ({ tab: [...document.querySelectorAll('.tabbar a')].map(a => ({ svg: !!a.querySelector('svg.ico'), txt: a.textContent.trim() })), menu: !!document.querySelector('#btn-menu svg.ico'),
      glifos: /[◧◎✎☰]/.test(document.querySelector('.tabbar').textContent + document.querySelector('#btn-menu').textContent), fondo: getComputedStyle(document.querySelector('.tabbar')).backgroundColor, visible: getComputedStyle(document.querySelector('.tabbar')).display !== 'none' }));
    ev('AC3-' + w, `Iconos SVG y barra inferior (${w} px)`, 'las 3 pestañas y el menú con icono SVG y su texto; ningún carácter de icono; en el móvil, barra translúcida', J(iconos),
      iconos.tab.length === 3 && iconos.tab.every(t => t.svg && t.txt) && iconos.menu && !iconos.glifos && (w > 719 ? !iconos.visible : /rgba\(.*0\.\d+\)/.test(iconos.fondo)));
    // ---- AC5 Explorar
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(700);
    const e1 = await p.evaluate(() => ({ cards: document.querySelectorAll('#empresas-cards .emp-card').length, mas: document.querySelector('[data-emp-mas]')?.textContent.replace(/\s+/g, ' ').trim(), filas: document.querySelectorAll('#empresas-lista tr').length, cuenta: document.querySelector('#emp-cuenta').textContent }));
    let e2 = null, e3 = null;
    if (w < 720) {
      await p.click('[data-emp-mas]'); await p.waitForTimeout(200);
      e2 = await p.evaluate(() => ({ cards: document.querySelectorAll('#empresas-cards .emp-card').length, foco: document.activeElement?.classList.contains('ver-ficha') }));
      await p.fill('#emp-buscar', 'Coca'); await p.waitForTimeout(200);
      e3 = await p.evaluate(() => ({ cards: [...document.querySelectorAll('#empresas-cards .emp-card')].map(c => c.querySelector('.simbolo').textContent), mas: !!document.querySelector('[data-emp-mas]') }));
      await p.fill('#emp-buscar', ''); await p.waitForTimeout(200);
    }
    ev('AC5-' + w, `Explorar por tandas en el móvil (${w} px)`, w < 720 ? '24 tarjetas y «Mostrar 24 más (quedan …)»; tras pulsar, 48 y el foco en la primera nueva; «Coca» encuentra KO aunque no estuviera en la tanda' : 'en escritorio la tabla tiene todas las empresas',
      J({ e1, e2, e3 }), w < 720 ? e1.cards === 24 && /^Mostrar 24 más \(quedan \d+\)$/.test(e1.mas || '') && e2.cards === 48 && e2.foco && e3.cards.includes('KO') && !e3.mas : e1.filas >= 100);
    await mira('explorar');
    // ---- con cuenta: AC4, AC6, AC7
    await entrarCon(p, mail('AC' + w));
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Cartera AC', plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 50 }, { ticker: 'KO', peso: 50 }] })).j;
    await p.evaluate(id => { location.hash = '#cartera-' + id; }, c.id); await p.waitForSelector('#comp-barra i'); await p.waitForTimeout(600);
    const a11y = await p.evaluate(() => { const n = el => (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim(); const r = document.querySelector('#barra-guardar');
      return { pasos: [...document.querySelectorAll('.paso a, .paso button')].map(n), region: r.getAttribute('role') + ':' + r.getAttribute('aria-label') }; });
    ev('AC4-' + w, `Accesibilidad del editor (${w} px)`, 'los tres pasos con nombre («Objetivo», «Distribución», «Revisión») aunque en el móvil solo se vea el número; barra de guardar = región «Guardar la cartera»', J(a11y),
      a11y.pasos.length === 3 && a11y.pasos.every(t => /Objetivo|Distribución|Revisión/.test(t)) && a11y.region === 'region:Guardar la cartera');
    const antes = await p.evaluate(() => { window.__tramo = document.querySelector('#comp-barra i'); return document.querySelector('#comp-barra i').style.width; });
    await p.locator('.peso-in >> visible=true').first().fill('60'); await p.locator('.peso-in >> visible=true').first().dispatchEvent('change'); await p.waitForTimeout(400);
    const despues = await p.evaluate(() => ({ mismo: window.__tramo === document.querySelector('#comp-barra i'), ancho: document.querySelector('#comp-barra i').style.width, trans: getComputedStyle(document.querySelector('#comp-barra i')).transitionProperty }));
    ev('AC6-' + w, `La barra de reparto se transforma, no se repinta (${w} px)`, 'el mismo elemento cambia de anchura (50 % → otra) con transición de «width»', J({ antes, despues }), despues.mismo && despues.ancho !== antes && /width/.test(despues.trans));
    await p.locator('.peso-in >> visible=true').first().fill('50'); await p.locator('.peso-in >> visible=true').first().dispatchEvent('change'); await p.waitForTimeout(300);   // vuelve a sumar 100 % para poder guardar
    await p.locator('.js-guardar >> visible=true').first().click().catch(() => {}); await p.waitForSelector('#avisos.on', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(300);
    const aviso = await p.evaluate(() => { const t = document.querySelector('#toast'), cs = getComputedStyle(t), lum = c => { const [r, g, b] = c.match(/\d+/g).map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
      return { txt: t.textContent, fondo: cs.backgroundColor, color: cs.color, lf: lum(cs.backgroundColor), lc: lum(cs.color) }; });
    ev('AC7-' + w, `Aviso de éxito dentro de la paleta (${w} px)`, 'fondo oscuro y texto claro (antes: franja beige con texto oscuro)', J(aviso), aviso.lf < 0.25 && aviso.lc > 0.7 && !!aviso.txt);
    await mira('editor');
    ev('AC0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún pageerror; ancho = ventana', J({ errs, desb }), !errs.length && !desb.length);
    await p.ctx.close();
  }
  // ---- AC8 reducir movimiento
  {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }), p = await c.newPage(); await p.route(/tradingview\.com/, r => r.abort());
    await p.goto(B); await p.waitForSelector('.hero'); await p.waitForTimeout(500);
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForTimeout(60);
    const anims = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.transitionProperty || 'anim'));
    ev('AC8', '«Reducir movimiento»: nada se mueve', 'ninguna animación ni transición en marcha justo después de cambiar de vista', J(anims), anims.length === 0);
    await c.close();
  }
  await b.close(); fin('evidencias-AC31');
})();
