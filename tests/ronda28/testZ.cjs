// Batería Z (ronda 28, cierre de la fase 2): varios cambios a la vez y «Aplicar a mi cartera», sello único de avisos, línea de tiempo de una idea y monogramas.
// Servidor real, datos ficticios, 1440 / 390 / 320 px. Uso: node tests/ronda28/testZ.cjs
//   Z1 dos cambios encadenados (NVDA 40→20 y luego JNJ +10): la comparación es contra la ORIGINAL; deshacer el último vuelve a un cambio
//   Z2 con varios cambios no se ofrece guardar como idea (una idea = un cambio) y se explica por qué
//   Z3 «Aplicar a mi cartera» (borrador abierto en el editor): pide confirmación; al aceptar, el editor tiene la composición final y la cuenta no cambia (no hay cuenta)
//   Z4 sello único: una línea breve; el detalle aparece al pulsar «Más» · Z5 línea de tiempo con «Guardaste la idea» y la próxima revisión · Z6 monogramas en Explorar · Z0 sin errores ni desbordes
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const pesosEditor = p => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => [(e.getAttribute('aria-label') || '').match(/^Peso de ([A-Z.]+),/)?.[1], e.value])));
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    // borrador del visitante, abierto en el editor
    await p.goto(B + '#inicio'); await p.waitForSelector('.hero');
    await p.evaluate(() => localStorage.setItem('klever_borrador', JSON.stringify({ plantilla: 'riesgo', origen: 'manual', nombre: 'Mi cartera Z', pos: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 20 }, { ticker: 'AMZN', peso: 20 }, { ticker: 'KO', peso: 20 }] })));
    await p.goto(B + '#cartera'); await p.reload(); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 4); await p.waitForTimeout(300);
    // ---- Z1 / Z2 dos cambios encadenados
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form');
    await p.fill('#lab-ticker', 'NVDA'); await p.fill('#lab-peso', '20'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-otro');
    await p.click('#lab-otro'); await p.waitForSelector('.lab-cadena');
    const cad1 = await p.evaluate(() => document.querySelector('.lab-cadena').textContent.replace(/\s+/g, ' '));
    await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res .lab-res'); await p.waitForTimeout(200);
    const z1 = await p.evaluate(() => ({ base: document.querySelector('.esp-base .esp-barra')?.getAttribute('aria-label'), alt: document.querySelector('.esp-alt .esp-barra')?.getAttribute('aria-label'), guardar: document.querySelector('#lab-res .lab-guardar')?.textContent.replace(/\s+/g, ' ') || '', form: !!document.querySelector('#lab-guardar-btn'), aplicar: !!document.querySelector('#lab-aplicar') }));
    ev('Z1-' + w, `Dos cambios encadenados (${w} px): la comparación es contra la cartera ORIGINAL`, 'aviso «Cambios acumulados (1): NVDA → 20 %»; base = NVDA 40, MSFT 20, AMZN 20, KO 20; alternativa con NVDA 20, JNJ 10 y las demás bajan en proporción a 17,5 % (el 20 % liberado por NVDA queda sin asignar: el método proporcional no lo reparte)',
      J({ cad1, z1 }), /Cambios acumulados \(1\): NVDA → 20\s%/.test(cad1) && /NVDA 40 %/.test(z1.base) && /MSFT 20 %/.test(z1.base) && !/JNJ/.test(z1.base) && /NVDA 17\.5 %/.test(z1.alt) && /JNJ 10 %/.test(z1.alt) && /MSFT 17\.5 %/.test(z1.alt));
    ev('Z2-' + w, `Con varios cambios no se guarda como idea (${w} px)`, 'sin formulario de guardado; se explica que una idea guarda un solo cambio; se ofrece «Aplicar a mi cartera»', J(z1), !z1.form && /un solo cambio/.test(z1.guardar) && z1.aplicar);
    // deshacer el último: vuelve a un solo cambio acumulado → ninguno
    await p.click('#lab-cad-deshacer'); await p.waitForTimeout(200); const trasDeshacer = await p.evaluate(() => !document.querySelector('.lab-cadena'));
    await p.fill('#lab-ticker', 'NVDA'); await p.fill('#lab-peso', '20'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-otro'); await p.click('#lab-otro'); await p.waitForSelector('.lab-cadena');
    await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-aplicar'); await mira('laboratorio');
    // ---- Z4 sello
    const sello0 = await p.evaluate(() => { const s = document.querySelector('#lab-res .sello'); return { breve: s?.querySelector('.sello-b')?.textContent, detalleOculto: s?.querySelector('.sello-t')?.hidden }; });
    await p.click('#lab-res .sello-mas'); await p.waitForTimeout(100);
    const sello1 = await p.evaluate(() => { const s = document.querySelector('#lab-res .sello'); return { visible: !s.querySelector('.sello-t').hidden, txt: s.querySelector('.sello-t').textContent, exp: s.querySelector('.sello-mas').getAttribute('aria-expanded') }; });
    ev('Z4-' + w, `Sello único de avisos (${w} px)`, '«Simulación · sin dinero real · no es una recomendación»; detalle oculto hasta pulsar «Más»; al pulsar, «Tu cartera base no cambia» y aria-expanded=true', J({ sello0, sello1 }),
      sello0.breve === 'Simulación · sin dinero real · no es una recomendación' && sello0.detalleOculto === true && sello1.visible && /Tu cartera base no cambia/.test(sello1.txt) && sello1.exp === 'true');
    // ---- Z3 aplicar a mi cartera
    await p.click('#lab-aplicar'); await p.waitForSelector('#dlg-confirmar[open]'); const dlg = await p.evaluate(() => document.querySelector('#cf-texto').textContent);
    await p.click('#cf-si'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(500);
    const editor = await pesosEditor(p), borrador = await p.evaluate(() => JSON.parse(localStorage.getItem('klever_borrador')).pos.map(x => x.ticker).sort().join(','));
    ev('Z3-' + w, `«Aplicar a mi cartera» (${w} px)`, 'confirmación con la composición final; al aceptar, el editor tiene NVDA 17,5 y JNJ 10, suma 80 % (20 % sin asignar, como en la simulación); el borrador se actualiza', J({ dlg: dlg.slice(0, 140), editor, borrador }),
      /JNJ 10/.test(dlg) && editor.NVDA && editor.JNJ === '10,0' && editor.NVDA === '17,5' && Math.abs(Object.values(editor).reduce((a, v) => a + Number(v.replace(',', '.')), 0) - 80) < 0.05 && borrador.includes('JNJ') && trasDeshacer);
    await mira('editor');
    // ---- Z5 línea de tiempo (con cuenta)
    await entrarCon(p, mail('Z' + w));
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Cartera Z', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j, cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    const d = new Date(Date.now() + 5 * 864e5), fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const e = (await api(p, 'POST', '/escenarios', { clave: 'z-' + w + '-' + Date.now(), nombre: 'Idea Z', cartera_id: c.id, base_revision: cart.revision, ticker: 'JNJ', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'JNJ', peso: 10 }], pregunta: '¿Aporta JNJ?', revisar_en: fecha })).j;
    await p.evaluate(i => { location.hash = '#escenario-' + i; }, e.id); await p.waitForSelector('.esc-tiempo'); await p.waitForTimeout(300);
    const tl = await p.evaluate(() => [...document.querySelectorAll('.esc-tiempo > .tl-nodo, .esc-tiempo > p.tl-vacio')].map(n => n.textContent.replace(/\s+/g, ' ').trim()));
    ev('Z5-' + w, `Línea de tiempo de una idea (${w} px)`, 'arriba «Próxima revisión» con su fecha; sin revisiones aún; abajo «Guardaste la idea» con la pregunta', J(tl),
      tl.length === 3 && /^Próxima revisión/.test(tl[0]) && /ninguna revisión/.test(tl[1]) && /^Guardaste la idea/.test(tl[2]) && /¿Aporta JNJ\?/.test(tl[2])); await mira('idea');
    // ---- Z6 monogramas
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(500);
    const mono = await p.evaluate(() => { const m = [...document.querySelectorAll('#empresas-lista .mono, #empresas-cards .mono')].filter(x => x.offsetParent !== null); return { n: m.length, primero: m[0]?.textContent, oculto: m[0]?.getAttribute('aria-hidden') }; });
    ev('Z6-' + w, `Monogramas en Explorar (${w} px)`, 'cada empresa visible lleva dos letras de su símbolo, ocultas a lectores de pantalla (el nombre ya se lee)', J(mono), mono.n > 10 && /^[A-Z]{1,2}$/.test(mono.primero) && mono.oculto === 'true'); await mira('explorar');
    ev('Z0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún pageerror; ninguna vista más ancha que la ventana', J({ errs, desb }), errs.length === 0 && desb.length === 0);
    await p.ctx.close();
  }
  await b.close(); await fin('evidencias-Z28');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-Z28'); });
