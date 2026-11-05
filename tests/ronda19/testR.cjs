// Batería R (ronda 19): la REVISIÓN medida por el rectángulo del resultado, no por su panel. A 320×780 y 390×780, tras pulsar «Revisar» (con el ratón y con el teclado, con y sin movimiento
// reducido), el resultado breve —la cifra y su titular con nota; el aviso completo sin nota— debe quedar ENTERO entre la parte superior útil y el inicio de la barra fija, con la
// etiqueta «Paso 3 de 3 · Revisión» y «Volver» a la vista, el foco en la nota y los pesos intactos. Las capturas se hacen DESPUÉS de que el desplazamiento se estabilice (sin preparar nada a mano):
// Distribución y Revisión a 1440×900, 390×780 y 320×780; en móvil, con nota y sin nota. Datos FICTICIOS. Uso: node tests/ronda19/testR.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda19', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(700); };
  // espera a que el desplazamiento se estabilice (varios fotogramas seguidos sin cambio): nada se mide ni se captura a medias
  const quieto = async p => { let prev = -1, q = 0; const t0 = Date.now(); while (q < 5 && Date.now() - t0 < 6000) { const y = await p.evaluate(() => Math.round(scrollY * 10) / 10); q = y === prev ? q + 1 : 0; prev = y; await p.waitForTimeout(80); } return prev; };
  const abrirCartera = async (p, id) => { await p.evaluate(i => { location.hash = '#cartera-' + i; }, id); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 2 && !!document.querySelector('#donut-leyenda li'), null, { timeout: 15000 }); await p.waitForTimeout(500); };
  const pesos = p => p.evaluate(() => [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => e.value).join('/'));
  const medir = p => p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e || e.offsetParent === null) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) }; }, bar = document.querySelector('#barra-guardar'), barTop = bar && !bar.hidden && getComputedStyle(bar).display !== 'none' ? Math.round(bar.getBoundingClientRect().top) : innerHeight;
    const cifra = r('#nota-cuerpo .nota-num'), titular = r('#nota-cuerpo .nota-expl'), aviso = r('#nota-cuerpo .nota-pend'), etq = document.querySelector('#paso-etq'), volver = r('#paso-volver');
    const resultado = cifra && titular ? { top: Math.min(cifra.top, titular.top), bottom: Math.max(cifra.bottom, titular.bottom) } : aviso;
    return { resultado, tipo: cifra ? 'con nota' : aviso ? 'sin nota' : 'ninguno', barTop, alto: innerHeight, etq: etq && etq.offsetParent !== null ? { texto: etq.textContent.trim(), ...r('#paso-etq') } : null, volver, foco: document.activeElement?.id, paso: document.querySelector('#pasos [aria-current=step]')?.dataset.paso, scroll: Math.round(scrollY) }; });
  const dentro = (m, w) => m.resultado && m.resultado.top >= 0 && m.resultado.bottom <= m.barTop && (w >= 900 || (m.etq && /^Paso 3 de 3 · Revisión$/.test(m.etq.texto) && m.etq.top >= 0 && m.etq.bottom <= m.barTop && m.volver && m.volver.top >= 0 && m.volver.bottom <= m.barTop));
  const pulsar = async (p, como) => { if (como === 'teclado') { await p.evaluate(() => { const b = [...document.querySelectorAll('.js-revisar')].find(e => e.offsetParent !== null); b.focus(); }); await p.keyboard.press('Enter'); } else await p.locator('.js-revisar:visible').first().click(); await p.waitForSelector('#vista-cartera[data-paso="3"]'); return quieto(p); };

  for (const w of [320, 390]) {
    const resumen = { 'con nota': [], 'sin nota': [] }, pesosOk = { 'con nota': true, 'sin nota': true };
    for (const rm of ['no-preference', 'reduce']) {
      const p = await nuevo(b, w, 780), errs = []; p.on('pageerror', e => errs.push(e.message)); await p.emulateMedia({ reducedMotion: rm }); await entrarCon(p, mail('RV' + w + rm));
      const con = (await api(p, 'POST', '/portfolios', { nombre: 'Con nota', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j.id;
      const sin = (await api(p, 'POST', '/portfolios', { nombre: 'Sin nota', plantilla: 'dividendos', posiciones: [{ ticker: 'SCHD', peso: 17 }, { ticker: 'VYM', peso: 16.6 }, { ticker: 'KO', peso: 16.6 }, { ticker: 'PG', peso: 16.6 }, { ticker: 'JNJ', peso: 16.6 }, { ticker: 'XOM', peso: 16.6 }] })).j.id;
      for (const [variante, id] of [['con nota', con], ['sin nota', sin]]) {
        for (const como of ['raton', 'teclado']) {
          await abrirCartera(p, id); const antes = await pesos(p);
          if (rm === 'no-preference' && como === 'raton') await p.screenshot({ path: CAP + `R-distribucion-${variante.replace(' ', '-')}-${w}-viewport.png` });
          await pulsar(p, como); const m = await medir(p);
          if (rm === 'no-preference' && como === 'raton') await p.screenshot({ path: CAP + `R-revision-${variante.replace(' ', '-')}-${w}-viewport.png` });
          resumen[variante].push(`${rm}/${como}: ${m.tipo} res ${m.resultado ? m.resultado.top + '–' + m.resultado.bottom : '—'} / barra ${m.barTop} / etq ${m.etq ? m.etq.top + '–' + m.etq.bottom : '—'} / foco ${m.foco}`);
          resumen[variante].ok = (resumen[variante].ok ?? true) && m.tipo === variante && dentro(m, w) && m.foco === 'nota-panel' && m.paso === '3';
          await p.click('#paso-volver'); await p.waitForSelector('#vista-cartera[data-paso="2"]'); await quieto(p); const vuelta = await pesos(p); if (vuelta !== antes) pesosOk[variante] = false;
        }
      }
      ev('R0-' + w + '-' + rm, `Sin errores de JavaScript en las revisiones (${w} px, movimiento ${rm})`, 'Ningún pageerror', J(errs), errs.length === 0);
      await p.ctx.close();
    }
    for (const v of ['con nota', 'sin nota']) ev(`R1-${v.replace(' ', '-')}-${w}`, `Revisión ${v} a ${w}×780: el RECTÁNGULO del resultado queda entero entre la parte superior y la barra fija, con «Paso 3 de 3 · Revisión» y «Volver» a la vista (ratón y teclado, con y sin movimiento reducido)`, 'En las 4 combinaciones: resultado (cifra + titular, o el aviso completo) con top ≥ 0 y bottom ≤ inicio de la barra; etiqueta del paso y Volver también; foco en #nota-panel; paso 3; al volver, los pesos son idénticos', resumen[v].join(' | ') + ` | pesos conservados ${pesosOk[v]}`, resumen[v].ok === true && pesosOk[v]);
  }
  // escritorio: distribución y revisión (con y sin nota), resultado a la vista
  { const w = 1440, p = await nuevo(b, w, 900); await entrarCon(p, mail('RVd'));
    const con = (await api(p, 'POST', '/portfolios', { nombre: 'Con nota', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j.id, sin = (await api(p, 'POST', '/portfolios', { nombre: 'Sin nota', plantilla: 'dividendos', posiciones: [{ ticker: 'SCHD', peso: 17 }, { ticker: 'VYM', peso: 16.6 }, { ticker: 'KO', peso: 16.6 }, { ticker: 'PG', peso: 16.6 }, { ticker: 'JNJ', peso: 16.6 }, { ticker: 'XOM', peso: 16.6 }] })).j.id;
    const filas = []; let todo = true;
    for (const [variante, id] of [['con nota', con], ['sin nota', sin]]) { await abrirCartera(p, id); await p.screenshot({ path: CAP + `R-distribucion-${variante.replace(' ', '-')}-1440-viewport.png` }); await pulsar(p, 'raton'); await p.screenshot({ path: CAP + `R-revision-${variante.replace(' ', '-')}-1440-viewport.png` }); const m = await medir(p); filas.push(`${variante}: res ${m.resultado ? m.resultado.top + '–' + m.resultado.bottom : '—'} de ${m.alto}`); if (!(m.tipo === variante && dentro(m, w) && m.foco === 'nota-panel')) todo = false; }
    ev('R2-1440', 'Escritorio 1440×900: tras «Revisar portafolio», el resultado (con nota y sin nota) queda entero en el viewport y con el foco en la nota', 'El rectángulo del resultado está dentro de la ventana en ambos casos', filas.join(' | '), todo);
    await p.ctx.close(); }
  await b.close(); fin('evidencias-R19');
})();
