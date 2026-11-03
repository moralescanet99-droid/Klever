// Batería I (ronda 11): identidad visual del editor de cartera (pantalla de referencia). Comprueba propiedades medibles del diseño, no «gustos»:
// la composición se dibuja con los datos reales, una sola acción principal, composición > ROIC en jerarquía, filas comparables, tokens accesibles en ambos temas.
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch();
  const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const lum = ([r, g, bl]) => { const l = [r, g, bl].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
  const contr = (x, y) => { const a = lum(x), c = lum(y); return (Math.max(a, c) + .05) / (Math.min(a, c) + .05); };
  const G = p => p.locator('.js-guardar >> visible=true');

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 760;
    const p = await nuevo(b, w, h); await entrar(p, 'dividendos', 'I' + w); await p.waitForTimeout(4600);
    // I1: la composición se dibuja con los datos reales de la cartera
    const comp = () => p.evaluate(w => { const bar = document.querySelector('#comp-barra'), segs = [...bar.querySelectorAll('i:not(.libre)')], libre = bar.querySelector('.libre'), W = bar.getBoundingClientRect().width,
      pesos = [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => parseFloat(e.value.replace(',', '.'))), tot = pesos.reduce((a, c) => a + c, 0), esc = Math.max(100, tot);
      return { n: segs.length, pesos, tot, anchos: segs.map(s => s.getBoundingClientRect().width / W * 100), esperados: pesos.map(x => x / esc * 100), libre: libre ? libre.getBoundingClientRect().width / W * 100 : 0, exceso: bar.classList.contains('exceso'), aria: bar.getAttribute('aria-label'),
        puntos: [...document.querySelectorAll(w < 720 ? '.pos-card .punto' : '#pos-tabla .punto')].map(e => getComputedStyle(e).backgroundColor), colores: segs.map(s => getComputedStyle(s).backgroundColor) }; }, w);
    const c100 = await comp(); await peso(p).fill('10'); await p.waitForTimeout(250); const c95 = await comp(); await peso(p).fill('30'); await p.waitForTimeout(250); const c103 = await comp();
    const prop = c => c.anchos.every((a, i) => Math.abs(a - c.esperados[i]) < 1.5);   // tolerancia ≈ 1,5 puntos por los huecos de 2 px entre tramos
    ev('I1-' + w, `Composición dibujada con los datos reales (${w} px)`, 'Un tramo por posición con ancho proporcional a su peso; el color de cada fila coincide con su tramo; con menos de 100 % hay tramo libre del tamaño que falta; con más de 100 % el borde marca el exceso y no hay tramo libre; el nombre accesible lista tickers y pesos',
      `100 %: ${c100.n} tramos, anchos ${c100.anchos.map(x => x.toFixed(1)).join('/')} vs ${c100.esperados.map(x => x.toFixed(1)).join('/')}, colores fila=tramo ${JSON.stringify(c100.puntos) === JSON.stringify(c100.colores)}; ${c95.tot.toFixed(1)} %: libre ${c95.libre.toFixed(1)} % (esperado ${(100 - c95.tot).toFixed(1)}); ${c103.tot.toFixed(1)} %: exceso=${c103.exceso}, libre ${c103.libre.toFixed(1)}; aria «${c100.aria.slice(0, 90)}…»`,
      c100.n === 6 && prop(c100) && JSON.stringify(c100.puntos) === JSON.stringify(c100.colores) && Math.abs(c95.libre - (100 - c95.tot)) < 1.5 && prop(c95) && c103.exceso && c103.libre === 0 && prop(c103) && /SCHD/.test(c100.aria) && /sin asignar/.test(c95.aria) && /exceso/.test(c103.aria), '');
    await peso(p).fill('17'); await p.waitForTimeout(200);
    // I2: una única acción principal (acento sólido); las demás, discretas. Y jerarquía: composición > ROIC
    await peso(p).fill('15'); await p.waitForTimeout(250);   // hay cambios pendientes: Guardar está activo
    const acc = await p.evaluate(() => { const acento = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), mk = document.createElement('i'); mk.style.color = acento; document.body.appendChild(mk); const ac = getComputedStyle(mk).color; mk.remove();
      const botones = [...document.querySelectorAll('#vista-cartera button, #barra-guardar button')].filter(e => e.offsetParent !== null && !e.closest('[hidden]') && !e.closest('#mas-lista')), solidos = botones.filter(e => getComputedStyle(e).backgroundColor === ac);
      const g = [...document.querySelectorAll('.js-guardar')].find(e => e.offsetParent !== null);
      return { solidos: solidos.map(e => (e.className.split(' ').find(c => c.startsWith('js-')) || e.id || e.textContent.trim()).toString().slice(0, 24)), guardaActivo: !g.disabled, guardaAcento: getComputedStyle(g).backgroundColor === ac,
        totalPx: parseFloat(getComputedStyle(document.querySelector('#comp-total')).fontSize), roicPx: parseFloat(getComputedStyle(document.querySelector('#r-roic')).fontSize), asigResumenPx: parseFloat(getComputedStyle(document.querySelector('#r-total')).fontSize) }; });
    ev('I2-' + w, `Una acción principal y jerarquía composición > ROIC (${w} px)`, 'Con cambios pendientes, «Guardar» es el único botón con relleno de acento y está activo; la cifra del reparto (composición) es mayor que la del ROIC, y el ROIC no supera 1,75 rem',
      `botones con relleno de acento: [${acc.solidos.join(', ')}]; Guardar activo=${acc.guardaActivo} y con acento=${acc.guardaAcento}; tamaños: asignado ${acc.totalPx} px, resumen ${acc.asigResumenPx} px, ROIC ${acc.roicPx} px`,
      acc.guardaActivo && acc.guardaAcento && acc.solidos.length === 1 && acc.totalPx > acc.roicPx && acc.roicPx <= 28, '');
    // I3: filas comparables: barra de peso por fila, sin tabla trasladada en móvil, objetivos táctiles
    const filas = await p.evaluate(() => { const vis = e => e.offsetParent !== null; const ins = [...document.querySelectorAll('.peso-in')].filter(vis), barras = [...document.querySelectorAll('.pbar i')].filter(vis);
      return { n: ins.length, barras: barras.length, anchos: barras.map(i => i.getBoundingClientRect().width / i.parentElement.getBoundingClientRect().width * 100), pesos: ins.map(e => parseFloat(e.value.replace(',', '.'))), tabla: vis(document.querySelector('.tabla-scroll')), tarjetas: vis(document.querySelector('#pos-cards')), minAlto: Math.min(...ins.map(e => e.getBoundingClientRect().height)), ancho: document.documentElement.scrollWidth }; });
    ev('I3-' + w, `Filas de activos comparables y táctiles (${w} px)`, 'Cada fila muestra su peso como barra proporcional; en móvil se ven filas (no la tabla de escritorio); los campos miden ≥ 44 px de alto; sin desbordamiento horizontal',
      `${filas.n} filas, ${filas.barras} barras (anchos ${filas.anchos.map(x => x.toFixed(0)).join('/')} % vs pesos ${filas.pesos.join('/')}); tabla visible=${filas.tabla}, filas móviles visibles=${filas.tarjetas}; alto mínimo del campo ${filas.minAlto.toFixed(0)} px; ancho ${filas.ancho}/${w}`,
      filas.n === 6 && filas.barras === 6 && filas.anchos.every((a, i) => Math.abs(a - filas.pesos[i]) < 1.5) && (w < 720 ? !filas.tabla && filas.tarjetas : filas.tabla && !filas.tarjetas) && filas.minAlto >= 44 && filas.ancho <= w, '');
    // I4: sin desbordamiento en los estados normal / pendiente / error / texto ampliado
    const anchos = {}; anchos.pend = await p.evaluate(() => document.documentElement.scrollWidth);
    await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue()); await G(p).click(); await p.waitForTimeout(800); anchos.error = await p.evaluate(() => document.documentElement.scrollWidth);
    await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400); anchos.ampliado = await p.evaluate(() => document.documentElement.scrollWidth);
    ev('I4-' + w, `Sin desbordamiento horizontal en pendiente, error y texto ampliado (${w} px; ampliado SIMULADO)`, 'La página nunca es más ancha que la ventana', `pendiente ${anchos.pend}, error ${anchos.error}, texto al 200 % ${anchos.ampliado} (ventana ${w})`, Object.values(anchos).every(a => a <= w), '');
    ev('I5-' + w, `Sin errores de JavaScript (${w} px)`, 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, ''); await p.ctx.close();
  }
  // I6: tokens accesibles en claro y oscuro (calculados desde el CSS real): texto, texto atenuado, acento, advertencia y etiquetas de la composición
  const tokens = {};
  for (const tema of ['light', 'dark']) {
    const p = await nuevo(b, 1440, 900); await p.goto(B); await p.waitForSelector('.plantilla'); await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
    tokens[tema] = await p.evaluate(() => { const cs = getComputedStyle(document.documentElement), v = n => { const m = document.createElement('i'); m.style.color = cs.getPropertyValue(n).trim(); document.body.appendChild(m); const c = getComputedStyle(m).color; m.remove(); return c; };
      return Object.fromEntries(['--bg', '--surface', '--text', '--muted', '--accent', '--on-accent', '--accent-soft', '--accent-on-soft', '--warn', '--bad', '--ok', '--c-txt', ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => '--c' + i)].map(n => [n, v(n)])); }); await p.ctx.close();
  }
  const filas = []; let todoOk = true;
  for (const t of ['light', 'dark']) { const k = tokens[t], pares = [['texto/fondo', k['--text'], k['--bg'], 4.5], ['texto/superficie', k['--text'], k['--surface'], 4.5], ['atenuado/fondo', k['--muted'], k['--bg'], 4.5], ['atenuado/superficie', k['--muted'], k['--surface'], 4.5], ['acento/superficie (enlaces)', k['--accent'], k['--surface'], 4.5], ['texto del botón principal', k['--on-accent'], k['--accent'], 4.5], ['acento/suave', k['--accent-on-soft'], k['--accent-soft'], 4.5], ['aviso/superficie', k['--warn'], k['--surface'], 4.5], ['error/superficie', k['--bad'], k['--surface'], 4.5], ['correcto/superficie', k['--ok'], k['--surface'], 4.5], ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [`etiqueta sobre tramo ${i}`, k['--c-txt'], k['--c' + i], 4.5]), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => [`tramo ${i} sobre superficie (gráfico ≥ 3:1)`, k['--c' + i], k['--surface'], 3])];
    const mal = pares.filter(([n, a, c, min]) => contr(rgb(a), rgb(c)) < min); todoOk = todoOk && mal.length === 0; filas.push(`${t}: ${pares.length} pares, mínimo ${Math.min(...pares.map(([n, a, c]) => contr(rgb(a), rgb(c)))).toFixed(1)}:1${mal.length ? `; FALLAN ${mal.map(m => m[0] + ' ' + contr(rgb(m[1]), rgb(m[2])).toFixed(1)).join(', ')}` : ''}`); }
  ev('I6', 'Contraste de los tokens de color (claro y oscuro), calculado desde el CSS real', 'Texto y controles ≥ 4,5:1; etiquetas de los tramos ≥ 4,5:1 sobre su color; tramos ≥ 3:1 frente a la superficie', filas.join(' · '), todoOk, '');
  await b.close(); fin('evidencias-I');
})();
