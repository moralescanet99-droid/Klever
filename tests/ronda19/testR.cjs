// Ronda 20: (a) `quieto` DEVUELVE si se estabilizó y la batería FALLA si no (R0e); (b) el teclado es REAL: se parte de un punto conocido (el nombre) y se llega a «Revisar» solo con Tab; (c) se prueba cartera guardada y con CAMBIOS sin guardar;
// (d) en escritorio se mide el CONTEXTO (nombre, pasos, Volver, acción de guardado y estado) además del resultado. Los diálogos beforeunload (editor sucio) se aceptan y se registran; cualquier otro diálogo falla (R0d).
// Batería R (ronda 19): la REVISIÓN medida por el rectángulo del resultado, no por su panel. A 320×780 y 390×780, tras pulsar «Revisar» (con el ratón y con el teclado, con y sin movimiento
// reducido), el resultado breve —la cifra y su titular con nota; el aviso completo sin nota— debe quedar ENTERO entre la parte superior útil y el inicio de la barra fija, con la
// etiqueta «Paso 3 de 3 · Revisión» y «Volver» a la vista, el foco en la nota y los pesos intactos. Las capturas se hacen DESPUÉS de que el desplazamiento se estabilice (sin preparar nada a mano):
// Distribución y Revisión a 1440×900, 390×780 y 320×780; en móvil, con nota y sin nota. Datos FICTICIOS. Uso: node tests/ronda19/testR.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', process.env.RONDA || 'ronda20', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(700); };
  // espera a que el desplazamiento se estabilice (varios fotogramas seguidos sin cambio): nada se mide ni se captura a medias
  const NOESTABLE = [], DLG = [], DLGMAL = []; const dialogo = d => { if (d.type() === 'beforeunload') { DLG.push('beforeunload'); d.accept().catch(() => {}); } else { DLGMAL.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); } };
  const quieto = async (p, que = '') => { let prev = -1, q = 0; const t0 = Date.now(); while (q < 5 && Date.now() - t0 < 6000) { const y = await p.evaluate(() => Math.round(scrollY * 10) / 10); q = y === prev ? q + 1 : 0; prev = y; await p.waitForTimeout(80); } if (q < 5) NOESTABLE.push(que || 'sin etiqueta'); return prev; };
  const abrirCartera = async (p, id) => { await p.evaluate(i => { location.hash = '#cartera-' + i; }, id); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 2 && !!document.querySelector('#donut-leyenda li'), null, { timeout: 15000 }); await p.waitForTimeout(500); };
  const pesos = p => p.evaluate(() => [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => Number(e.value.replace(',', '.'))).join('/'));   // se compara el VALOR (el campo puede mostrar «50» o «50,0» según se haya reformateado)
  const medir = p => p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e || e.offsetParent === null) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) }; }, bar = document.querySelector('#barra-guardar'), barTop = bar && !bar.hidden && getComputedStyle(bar).display !== 'none' ? Math.round(bar.getBoundingClientRect().top) : innerHeight;
    const cifra = r('#nota-cuerpo .nota-num'), titular = r('#nota-cuerpo .nota-expl'), aviso = r('#nota-cuerpo .nota-pend'), etq = document.querySelector('#paso-etq'), volver = r('#paso-volver');
    const resultado = cifra && titular ? { top: Math.min(cifra.top, titular.top), bottom: Math.max(cifra.bottom, titular.bottom) } : aviso;
    return { resultado, tipo: cifra ? 'con nota' : aviso ? 'sin nota' : 'ninguno', barTop, alto: innerHeight, etq: etq && etq.offsetParent !== null ? { texto: etq.textContent.trim(), ...r('#paso-etq') } : null, volver, foco: document.activeElement?.id, paso: document.querySelector('#pasos [aria-current=step]')?.dataset.paso, scroll: Math.round(scrollY) }; });
  const dentro = (m, w) => m.resultado && m.resultado.top >= 0 && m.resultado.bottom <= m.barTop && (w >= 900 || (m.etq && /^Paso 3 de 3 · Revisión$/.test(m.etq.texto) && m.etq.top >= 0 && m.etq.bottom <= m.barTop && m.volver && m.volver.top >= 0 && m.volver.bottom <= m.barTop));
  const TABS = []; const pulsar = async (p, como, que = '') => { if (como === 'teclado') { await p.evaluate(() => { document.querySelector('#nombre').focus(); }); let n = 0; while (n < 80) { await p.keyboard.press('Tab'); n++; if (await p.evaluate(() => { const a = document.activeElement; return !!a && a.classList.contains('js-revisar') && a.offsetParent !== null; })) break; } TABS.push(n); await p.keyboard.press('Enter'); } else await p.locator('.js-revisar:visible').first().click(); await p.waitForSelector('#vista-cartera[data-paso="3"]'); return quieto(p, que); };
  const editar = async p => { await p.locator('.peso-in:visible').nth(0).fill('50'); await p.locator('.peso-in:visible').nth(1).fill('50'); await p.waitForTimeout(300); };
  const contexto = p => p.evaluate(() => { const v = s => { const e = document.querySelector(s); if (!e || e.offsetParent === null) return null; const q = e.getBoundingClientRect(); return q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth; }; const g = [...document.querySelectorAll('.js-guardar')].find(e => e.offsetParent !== null), q = g?.getBoundingClientRect(); return { nombre: v('#nombre'), pasos: v('#pasos'), volver: v('#paso-volver'), estado: v('#estado'), guardar: !!q && q.top >= 0 && q.bottom <= innerHeight, guardarActivo: !!g && !g.disabled, guardarDominante: !!g && g.classList.contains('btn-primario') && getComputedStyle(g).backgroundColor !== 'rgba(0, 0, 0, 0)', estadoTxt: document.querySelector('#estado')?.textContent.trim() }; });

  for (const w of [320, 390]) {
    const resumen = { 'con nota': [], 'sin nota': [], 'con nota y cambios sin guardar': [] }, pesosOk = { 'con nota': true, 'sin nota': true, 'con nota y cambios sin guardar': true };
    for (const rm of ['no-preference', 'reduce']) {
      const p = await nuevo(b, w, 780), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo); await p.emulateMedia({ reducedMotion: rm }); await entrarCon(p, mail('RV' + w + rm));
      const con = (await api(p, 'POST', '/portfolios', { nombre: 'Con nota', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j.id;
      const sin = (await api(p, 'POST', '/portfolios', { nombre: 'Sin nota', plantilla: 'dividendos', posiciones: [{ ticker: 'SCHD', peso: 17 }, { ticker: 'VYM', peso: 16.6 }, { ticker: 'KO', peso: 16.6 }, { ticker: 'PG', peso: 16.6 }, { ticker: 'JNJ', peso: 16.6 }, { ticker: 'XOM', peso: 16.6 }] })).j.id;
      for (const [variante, id, sucio] of [['con nota', con, false], ['sin nota', sin, false], ['con nota y cambios sin guardar', con, true]]) {
        for (const como of ['raton', 'teclado']) {
          await abrirCartera(p, id); if (sucio) await editar(p); const antes = await pesos(p); const tipoEsp = variante.startsWith('con nota') ? 'con nota' : 'sin nota', etqCap = variante.replace(/ /g, '-');
          if (rm === 'no-preference' && como === 'raton' && !sucio) await p.screenshot({ path: CAP + `R-distribucion-${etqCap}-${w}-viewport.png` });
          await pulsar(p, como, `${w}/${rm}/${variante}/${como}`); const m = await medir(p);
          if (rm === 'no-preference' && como === 'raton' && !sucio) await p.screenshot({ path: CAP + `R-revision-${etqCap}-${w}-viewport.png` });
          resumen[variante].push(`${rm}/${como}: ${m.tipo} res ${m.resultado ? m.resultado.top + '–' + m.resultado.bottom : '—'} / barra ${m.barTop} / etq ${m.etq ? m.etq.top + '–' + m.etq.bottom : '—'} / foco ${m.foco}`);
          resumen[variante].ok = (resumen[variante].ok ?? true) && m.tipo === tipoEsp && dentro(m, w) && m.foco === 'nota-panel' && m.paso === '3';
          await p.click('#paso-volver'); await p.waitForSelector('#vista-cartera[data-paso="2"]'); await quieto(p, `${w}/${rm}/${variante}/${como}/volver`); const vuelta = await pesos(p); if (vuelta !== antes) pesosOk[variante] = false;
        }
      }
      ev('R0-' + w + '-' + rm, `Sin errores de JavaScript en las revisiones (${w} px, movimiento ${rm})`, 'Ningún pageerror', J(errs), errs.length === 0);
      await p.ctx.close();
    }
    for (const v of ['con nota', 'sin nota', 'con nota y cambios sin guardar']) ev(`R1-${v.replace(/ /g, '-')}-${w}`, `Revisión ${v} a ${w}×780: el RECTÁNGULO del resultado queda entero entre la parte superior y la barra fija, con «Paso 3 de 3 · Revisión» y «Volver» a la vista (ratón y TECLADO REAL con Tab, con y sin movimiento reducido)`, 'En las 4 combinaciones: resultado (cifra + titular, o el aviso completo) con top ≥ 0 y bottom ≤ inicio de la barra; etiqueta del paso y Volver también; foco en #nota-panel; paso 3; al volver, los pesos son idénticos a los de antes de revisar (también los editados sin guardar)', resumen[v].join(' | ') + ` | pesos conservados ${pesosOk[v]}`, resumen[v].ok === true && pesosOk[v]);
  }
  // escritorio: distribución y revisión (con nota, sin nota y con cambios sin guardar): resultado Y contexto (nombre, pasos, Volver, guardado) a la vista
  { const w = 1440, p = await nuevo(b, w, 900); p.on('dialog', dialogo); await entrarCon(p, mail('RVd'));
    const con = (await api(p, 'POST', '/portfolios', { nombre: 'Con nota', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j.id, sin = (await api(p, 'POST', '/portfolios', { nombre: 'Sin nota', plantilla: 'dividendos', posiciones: [{ ticker: 'SCHD', peso: 17 }, { ticker: 'VYM', peso: 16.6 }, { ticker: 'KO', peso: 16.6 }, { ticker: 'PG', peso: 16.6 }, { ticker: 'JNJ', peso: 16.6 }, { ticker: 'XOM', peso: 16.6 }] })).j.id;
    const filas = []; let todo = true, ctxOk = true, vuelven = true;
    for (const [variante, id, sucio, como] of [['con nota', con, false, 'raton'], ['sin nota', sin, false, 'raton'], ['con nota y cambios sin guardar', con, true, 'raton'], ['con nota', con, false, 'teclado']]) {
      await abrirCartera(p, id); if (sucio) await editar(p); const antes = await pesos(p), tipoEsp = variante.startsWith('con nota') ? 'con nota' : 'sin nota', etqCap = variante.replace(/ /g, '-');
      if (como === 'raton') await p.screenshot({ path: CAP + `R-distribucion-${etqCap}-1440-viewport.png` });
      await pulsar(p, como, `1440/${variante}/${como}`); if (como === 'raton') await p.screenshot({ path: CAP + `R-revision-${etqCap}-1440-viewport.png` });
      const m = await medir(p), c = await contexto(p);
      filas.push(`${variante}/${como}: res ${m.resultado ? m.resultado.top + '–' + m.resultado.bottom : '—'} de ${m.alto}; nombre ${c.nombre}, pasos ${c.pasos}, volver ${c.volver}, guardar ${c.guardar}${c.guardarActivo ? ' (activo)' : ' (inactivo)'}, estado «${c.estadoTxt}» ${c.estado}`);
      if (!(m.tipo === tipoEsp && dentro(m, w) && m.foco === 'nota-panel')) todo = false;
      if (!(c.nombre && c.pasos && c.volver && c.estado && c.guardar && (!sucio || c.guardarActivo))) ctxOk = false;
      await p.click('#paso-volver'); await p.waitForSelector('#vista-cartera[data-paso="2"]'); await quieto(p, `1440/${variante}/volver`); if ((await pesos(p)) !== antes) vuelven = false;
    }
    ev('R2-1440', 'Escritorio 1440×900: tras «Revisar portafolio», el resultado (con nota, sin nota y con cambios sin guardar) queda entero en el viewport y con el foco en la nota', 'El rectángulo del resultado está dentro de la ventana en todos los casos', filas.join(' | '), todo);
    ev('R3-1440', 'Escritorio 1440×900: en la Revisión siguen a la vista el NOMBRE de la cartera, los pasos, «Volver a la distribución», la acción de guardado (activa si hay cambios sin guardar) y el estado de guardado; al volver, los pesos son idénticos', 'Todos los elementos de contexto dentro del viewport, en los cuatro recorridos (ratón y teclado real); pesos conservados', filas.join(' | ') + ` | pesos conservados ${vuelven}`, ctxOk && vuelven);
    await p.ctx.close(); }
  ev('R0e', 'Estabilización del desplazamiento: ninguna medición ni captura se hizo a medias', 'Cada espera de «quieto» terminó con cinco fotogramas sin cambio de scrollY (si no, se lista aquí)', J(NOESTABLE), NOESTABLE.length === 0);
  ev('R0t', 'Teclado REAL: se llegó a «Revisar» solo con Tab desde el nombre de la cartera', 'Todas las llegadas ocurrieron (≤ 80 pulsaciones) y fueron al menos una', `pulsaciones de Tab por recorrido: ${J(TABS)}`, TABS.length >= 6 && TABS.every(n => n > 0 && n < 80));
  ev('R0d', 'Diálogos: solo el aviso esperado de «cambios sin guardar» (beforeunload) y ningún otro', 'Ningún diálogo inesperado; los beforeunload se aceptan y se cuentan', `beforeunload aceptados ${DLG.length}; inesperados ${J(DLGMAL)}`, DLGMAL.length === 0);
  await b.close(); fin('evidencias-R19');
})();
