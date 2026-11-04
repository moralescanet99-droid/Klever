// Batería O (ronda 16): la nota en el móvil (una calculada y otra pendiente con su motivo), el comparador, el laboratorio, el seguimiento con vínculo estable
// (original, reformulación, pregunta nueva; guardar, cerrar sesión, volver, otra cuenta) y la defensa del DOM ante una nota guardada manipulada. Uso: node tests/ronda16/testO.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda16', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(600); };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const snap = (p, id, w, full = true) => p.screenshot({ path: CAP + `${id}-${w}.png`, fullPage: full });
  const texto = (p, s) => p.evaluate(s => document.querySelector(s)?.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() ?? '', s);

  // ---- O1-O2. Las dos salidas de la nota en el móvil
  for (const w of [320, 390]) {
    const p = await nuevo(b, w, 780), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(B + '#ejemplo'); await p.waitForSelector('#ej-nota .nota-num', { timeout: 15000 }); await p.waitForTimeout(300);
    const a = { nota: await texto(p, '#ej-nota .nota-num'), expl: await texto(p, '#ej-nota .nota-expl'), aviso: await texto(p, '#ej-nota .nota-aviso'), todo: await texto(p, '#ej-nota') };
    await snap(p, 'C10-nota-calculada', w);
    ev('O1-' + w, `Ejemplo con la nota CALCULADA (${w} px)`, 'Una cifra de 1 a 10, la fecha de los datos (4 nov 2026), una explicación con la posición real («Coca-Cola (KO) … 60 %») y sin «fecha no disponible» ni «pendiente»', `${a.nota}; ${a.expl}; ${a.aviso.slice(0, 120)}`,
      /^\d{1,2},\d de 10$/.test(a.nota) && /Coca-Cola \(KO\)/.test(a.expl) && /60 %/.test(a.expl) && /observados el 4 nov\.? 2026/.test(a.aviso) && /PRUEBA/.test(a.aviso) && !/sin verificar/.test(a.aviso) && !/fecha no disponible|pendiente/i.test(a.todo.replace(/¿Por qué esta nota\?.*/, '')) && await sinDesborde(p));
    await p.click('#ej-otro'); await p.waitForSelector('#ej-nota .nota-pend', { timeout: 15000 }); await p.waitForTimeout(300);
    const d = { pend: await texto(p, '#ej-nota .nota-pend'), todo: await texto(p, '#ej-nota'), titulo: await texto(p, '#ejemplo-cuerpo h1') };
    await snap(p, 'C11-nota-pendiente', w);
    ev('O2-' + w, `Ejemplo INCOMPLETO: nota pendiente con su motivo en lenguaje claro (${w} px)`, '«Nota pendiente.» una sola vez, «Podemos medir «empresas», «sectores y actividades» y «tamaño y liquidez»», «Faltan datos para valorar «deuda y caja» y «rentabilidad y crecimiento»» y la causa concreta (JPM 50 %: sector sin metodología); sin «Nota pendiente. Nota pendiente» ni «fecha no disponible»', `${d.pend}`,
      /^Nota pendiente\. Podemos medir «empresas», «sectores y actividades» y «tamaño y liquidez»\. Faltan datos para valorar «deuda y caja» y «rentabilidad y crecimiento»\./.test(d.pend) && /Causa principal: JPM \(50 % de la cartera\)/.test(d.pend) && !/Nota pendiente\. Nota pendiente/.test(d.todo) && !/fecha no disponible/.test(d.todo) && /datos incompletos/.test(d.titulo) && await sinDesborde(p));
    ev('O2b-' + w, `Sin errores de JavaScript en los dos ejemplos (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }
  // ---- O3-O4. Comparador y laboratorio
  { const p = await nuevo(b, 390, 780); await p.goto(B + '#comparar-KO-PG'); await p.waitForSelector('.tabla-cmp'); await p.waitForTimeout(300);
    const c = await texto(p, '#comparar-cuerpo'), fila = await p.evaluate(() => [...document.querySelectorAll('.tabla-cmp tbody tr')].map(tr => tr.textContent.replace(/\s+/g, ' ').trim()));
    ev('O3', 'Comparador: deuda neta / EBITDA en veces y qué cantidades se comparan', 'La fila dice «en veces», explica «deuda neta (deuda menos caja) dividida entre el EBITDA», que 2,0 veces son dos años de EBITDA y que NO es un plazo de devolución; cada cifra acaba en «veces» o es «Caja neta»', fila[2].slice(0, 260),
      /en veces/.test(c) && /deuda menos caja/.test(c) && /dos años de EBITDA/.test(c) && /No es un plazo de devolución/.test(c) && !/Años de EBITDA que haría falta/.test(c) && /\d,\d veces|Caja neta/.test(fila[2]));
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab'); await p.waitForTimeout(400);
    const lab = await p.evaluate(() => { const g = s => document.querySelector(s), pos = (a, c) => !!(g(a).compareDocumentPosition(g(c)) & Node.DOCUMENT_POSITION_FOLLOWING); return { origen: g('.lab-origen').textContent.replace(/\s+/g, ' ').trim(), ord: pos('.lab-espacio', '.lab-origen') && pos('.lab-origen', '.esp') && pos('.esp', '#lab-res table'), barras: document.querySelectorAll('.esp-barra').length }; });
    await snap(p, 'C13-comparacion-pesos', 390);
    ev('O4', 'Laboratorio: quién cede el peso justo al calcular, y el desarrollo debajo', 'Primero «Cuánto espacio ocuparía», justo después «Quién cede el peso: … KO cede 6 …», después las dos barras (antes/después) y debajo las tablas', `${lab.origen}; orden ${lab.ord}; barras ${lab.barras}`, /^Quién cede el peso: .*KO cede 6/.test(lab.origen) && lab.ord && lab.barras === 2 && await sinDesborde(p));
    await p.ctx.close(); }
  // ---- O5. Seguimiento con vínculo estable: tres casos con la misma empresa; guardar, cerrar sesión y volver; otra cuenta
  { const p = await nuevo(b, 390, 780); p.on('dialog', d => d.accept()); const correo = mail('OS'); await entrarCon(p, correo);
    const c = await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera O', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] });
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-guardar-btn');
    const marca = await p.evaluate(() => ({ ref: document.querySelector('#lab-ref')?.checked, preg: document.querySelector('#lab-pregunta').value }));
    await p.fill('#lab-revisar', '2026-12-15'); await p.fill('#lab-nombre', 'Reformulada (UI)'); await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar'); const idUI = +(await p.evaluate(() => location.hash.match(/escenario-(\d+)/)[1]));
    ev('O5a', 'Guardar desde la historia: la casilla «Sigo la pregunta de la historia» viene marcada y la pregunta propia, con las palabras de la historia', 'Casilla marcada; el escenario queda vinculado al identificador, no al texto', JSON.stringify(marca), marca.ref === true && /contratos anunciados/.test(marca.preg) && (await api(p, 'GET', '/escenarios/' + idUI)).j.pregunta_ref === 'hidrogeno-norte:1');
    // editar la pregunta con otras palabras, manteniendo el vínculo
    await p.click('#esc-editar'); await p.waitForSelector('#esc-pregunta'); const refMarcada = await p.evaluate(() => document.querySelector('#esc-ref')?.checked);
    await p.fill('#esc-pregunta', '¿Al final firmaron C y D?'); await p.click('#esc-guardar'); await p.waitForFunction(() => !document.querySelector('#esc-form')); await p.waitForTimeout(400);
    const ficha = await texto(p, '#lab-cuerpo');
    ev('O5b', 'Editar la pregunta con otras palabras: se conserva el vínculo y la ficha lo dice', 'Casilla marcada al editar; tras guardar sigue «responde» y ofrece «Ver revisión de la historia»', `${refMarcada}; ${ficha.match(/La revisión de la historia responde[^.]*\./)?.[0]}`, refMarcada === true && /La revisión de la historia responde a la cuestión que sigues/.test(ficha) && /Ver revisión de la historia/.test(ficha));
    const cart = (await api(p, 'GET', '/portfolios/' + c.j.id)).j;
    const crea = (clave, extra) => api(p, 'POST', '/escenarios', { clave, nombre: 'Caso ' + clave, cartera_id: c.j.id, base_revision: cart.revision, ticker: 'HNORT', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'HNORT', peso: 10 }], historia: 'hidrogeno-norte', ...extra });
    const o = await crea('o5-original-0001', { pregunta: '¿Se han firmado los dos contratos anunciados?', pregunta_ref: 'hidrogeno-norte:1', revisar_en: '2026-12-10' }), nu = await crea('o5-nueva-00001', { pregunta: '¿Y si pierden al cliente principal?', pregunta_ref: null, revisar_en: '2026-12-20' });
    const casos = async pg => { await pg.evaluate(() => { location.hash = '#seguimiento'; }); await pg.waitForSelector('.caso'); await pg.waitForTimeout(700); return pg.evaluate(() => [...document.querySelectorAll('#seg-casos .caso')].map(c => c.textContent.replace(/\s+/g, ' ').trim())); };
    const verTres = (l) => { const por = pre => l.find(x => x.includes(pre)) || ''; const og = por('¿Se han firmado los dos'), rf = por('¿Al final firmaron'), nv = por('¿Y si pierden'); return { og, rf, nv, ok: l.length === 3 && /Con novedades/.test(og) && !/formulación es distinta/.test(og) && /Con novedades/.test(rf) && /Tu formulación es distinta/.test(rf) && /Pregunta pendiente/.test(nv) && /Pregunta distinta a la de la historia/.test(nv) && /Ver revisión de la historia/.test(nv) && /Tu pregunta sigue pendiente/.test(nv) && !/Sin novedades/.test(nv) }; };
    let l = await casos(p), r1 = verTres(l); await snap(p, 'C12-pregunta-editada', 390);
    ev('O5c', 'Tres casos con la MISMA empresa: texto original, reformulación que conserva el vínculo y pregunta nueva', 'Original → «Con novedades»; reformulación → «Con novedades» y avisa de que las palabras son distintas; nueva → «Pregunta pendiente», «Pregunta distinta a la de la historia» y «Ver revisión de la historia», sin «Sin novedades»', `${l.length} tarjetas; ${r1.nv.slice(0, 200)}`, o.s === 201 && nu.s === 201 && r1.ok);
    // cerrar sesión y volver con la misma cuenta
    await p.evaluate(() => document.querySelector('#salir').click()); await p.waitForSelector('#entrar', { state: 'attached' }); await p.waitForTimeout(500); await entrarCon(p, correo); l = await casos(p); const r2 = verTres(l);
    ev('O5d', 'Cierro sesión y vuelvo con la misma cuenta', 'Las tres tarjetas siguen igual (texto, vínculo, fecha y estado)', `${l.length} tarjetas; ${r2.ok}`, r2.ok && JSON.stringify(r1) === JSON.stringify(r2));
    // otra cuenta
    const otro = await nuevo(b, 390, 780); await entrarCon(otro, mail('OT')); const lo = await casos(otro).catch(() => []); const vacio = await texto(otro, '#seg-casos');
    ev('O5e', 'Otra cuenta en otro navegador', 'No ve ninguna de las tres preguntas ni sus pesos; el ejemplo de visitante tampoco aparece (hay cuenta)', vacio.slice(0, 120), lo.length === 0 && !/contratos anunciados|firmaron|cliente principal/.test(vacio));
    await otro.ctx.close();
    // ---- O6. Una nota guardada manipulada NO crea etiquetas en el DOM (defensa en la interfaz aunque el servidor antiguo la entregase)
    const MARCA = '<img src=x onerror="window.__pwn=1">';
    const manipular = async r => { const resp = await r.fetch(); const j = await resp.json(); const cambiar = e => { if (e && e.evaluacion) { e.evaluacion.antes.nota = MARCA; e.evaluacion.antes.motivo = MARCA; e.nota = e.nota; } return e; }; await r.fulfill({ response: resp, json: Array.isArray(j) ? j.map(cambiar) : cambiar(j) }); };
    await p.route(new RegExp('/api/escenarios/' + idUI + '$'), manipular); await p.route(/\/api\/escenarios$/, manipular);
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, idUI); await p.waitForSelector('.esc-ficha'); await p.waitForTimeout(600);
    const dom = await p.evaluate(() => ({ imgs: document.querySelectorAll('#lab-cuerpo img').length, pwn: window.__pwn === 1, texto: document.querySelector('.lab-res')?.textContent.replace(/\s+/g, ' ') }));
    ev('O6', 'Escenario guardado con una evaluación manipulada (el servidor la entrega con marcado en la nota)', 'La interfaz la vuelve a validar: no se crea ninguna etiqueta, no se ejecuta nada y se dice que no supera las comprobaciones de formato', `imgs ${dom.imgs}; ejecutado ${dom.pwn}; ${(dom.texto.match(/no supera[^.]*\./) || [''])[0]}`, dom.imgs === 0 && !dom.pwn && /no supera las comprobaciones de formato/.test(dom.texto));
    await p.ctx.close(); }
  await b.close(); fin('evidencias-O16');
})();
