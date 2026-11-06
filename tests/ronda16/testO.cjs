// Batería O (ronda 16): la nota en el móvil (una calculada y otra pendiente con su motivo), el comparador, el laboratorio, el seguimiento con vínculo estable
// (original, reformulación, pregunta nueva; guardar, cerrar sesión, volver, otra cuenta) y la defensa del DOM ante una nota guardada manipulada. Uso: node tests/ronda16/testO.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda16', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
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
    ev('O1-' + w, `Ejemplo con la nota CALCULADA (${w} px)`, 'EXACTAMENTE «4,4 de 10» (semilla fija), la fecha de los datos (4 nov 2026), un titular con la posición real y el sector («Toda la cartera está en Consumo básico y Coca-Cola concentra el 60 %.») y sin «fecha no disponible» ni «pendiente»', `${a.nota}; ${a.expl}; ${a.aviso.slice(0, 120)}`,
      a.nota === '4,4 de 10' && a.expl === 'Toda la cartera está en Consumo básico y Coca-Cola concentra el 60 %.' && /Instantánea del 4 nov\.? 2026; ejercicios hasta FY2024/.test(a.todo) && /PRUEBA/.test(a.aviso) && !/sin verificar/.test(a.aviso) && !/fecha no disponible|pendiente/i.test(a.todo.replace(/¿Por qué esta nota\?.*/, '')) && await sinDesborde(p));
    const orden = await p.evaluate(() => { const g = s => document.querySelector(s), pos = (a, b) => !!(g(a).compareDocumentPosition(g(b)) & Node.DOCUMENT_POSITION_FOLLOWING); return { sel: pos('.ej-sel', '.ej-barra'), nota: pos('.ej-barra', '#ej-nota') && pos('#ej-nota', '#ej-lab'), pulsado: g('[data-ej][aria-pressed=true]').dataset.ej, insignia: /datos ficticios/.test(g('.pag-cab .chip.sim').textContent) }; });
    ev('O1b-' + w, `Orden en el móvil: selector, barra de pesos, RESULTADO y solo después los botones (${w} px)`, 'El resultado queda tras la barra de pesos y antes de «Probar un cambio»; insignia «Ejemplo con datos ficticios»; el ejemplo con nota está seleccionado', JSON.stringify(orden), orden.sel && orden.nota && orden.pulsado === 'completa' && orden.insignia);
    await p.click('[data-ej=incompleta]'); await p.waitForFunction(() => document.querySelector('#ej-nota .nota-pend'), null, { timeout: 15000 });
    const foco = await p.evaluate(() => ({ ae: document.activeElement?.dataset?.ej, pulsado: document.querySelector('[data-ej][aria-pressed=true]').dataset.ej, vivo: document.querySelector('#ej-nota').getAttribute('aria-live') }));
    ev('O1c-' + w, `Cambiar de ejemplo conserva el foco en el selector y la región se anuncia (${w} px)`, 'Tras pulsar «KO + JPM · evaluación parcial»: el foco sigue en ese botón, queda pulsado y la región de la nota es aria-live', JSON.stringify(foco), foco.ae === 'incompleta' && foco.pulsado === 'incompleta' && foco.vivo === 'polite'); await p.waitForSelector('#ej-nota .nota-pend', { timeout: 15000 }); await p.waitForTimeout(300);
    const d = { pend: await texto(p, '#ej-nota .nota-pend'), todo: await texto(p, '#ej-nota'), titulo: await texto(p, '#ejemplo-cuerpo h1') };
    await snap(p, 'C11-nota-pendiente', w);
    ev('O2-' + w, `Ejemplo INCOMPLETO: evaluación parcial con su motivo en lenguaje claro (${w} px)`, '«Evaluación parcial.» una sola vez, «Podemos medir cómo repartes tu cartera», «La mitad está en un banco y este método todavía no evalúa bien la deuda y los beneficios de los bancos» y «Por eso no damos una nota total»; sin «Nota pendiente. Nota pendiente» ni «fecha no disponible»', `${d.pend}`,
      d.pend === 'Evaluación parcial. Podemos medir cómo repartes tu cartera. La mitad está en un banco y este método todavía no evalúa bien la deuda y los beneficios de los bancos. Por eso no damos una nota total.' && !/Evaluación parcial\. Evaluación parcial/.test(d.todo) && !/fecha no disponible/.test(d.todo) && /evaluación parcial/.test(d.titulo) && await sinDesborde(p));
    ev('O2b-' + w, `Sin errores de JavaScript en los dos ejemplos (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }
  // ---- O3-O4. Comparador y laboratorio
  { const p = await nuevo(b, 390, 780); await p.goto(B + '#comparar-KO-PG'); await p.waitForSelector('.tabla-cmp'); await p.waitForTimeout(300);
    const c = await texto(p, '#comparar-cuerpo'), fila = await p.evaluate(() => [...document.querySelectorAll('.tabla-cmp tbody tr')].map(tr => tr.textContent.replace(/\s+/g, ' ').trim())), celdas = await p.evaluate(() => [...document.querySelectorAll('.tabla-cmp tbody tr:nth-child(3) td')].map(td => td.querySelector('.cmp-valor, .cmp-estado')?.textContent.trim() ?? ''));
    ev('O3', 'Comparador: deuda neta / EBITDA en veces y qué cantidades se comparan', 'La fila dice «en veces», explica «deuda neta (deuda menos caja) dividida entre el EBITDA», que por cada euro de EBITDA hay esa cantidad de euros de deuda neta y que NO indica cuándo se devolverá la deuda; AMBAS celdas (una por empresa) acaban en «veces» o son «Caja neta»', J(celdas) + ' · ' + fila[2].slice(0, 200),
      /en veces/.test(c) && /deuda menos caja/.test(c) && /por cada euro de EBITDA/i.test(c) && /no indica cuándo se devolverá la deuda/.test(c) && !/Años de EBITDA que haría falta/.test(c) && celdas.length === 2 && celdas.every(x => /^\d+,\d veces$|^Caja neta \(/.test(x)));
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab', { state: 'attached' }).then(() => p.evaluate(() => document.querySelectorAll('#lab-res details.mini').forEach(d => { d.open = true; }))); await p.waitForTimeout(400);
    const lab = await p.evaluate(() => { const g = s => document.querySelector(s), pos = (a, c) => !!(g(a).compareDocumentPosition(g(c)) & Node.DOCUMENT_POSITION_FOLLOWING); return { origen: [...document.querySelectorAll('#lab-res .delta-grid > div')].map(d => d.textContent.replace(/\s+/g, ' ').trim()).join(' | '), ord: pos('.lab-espacio', '.esp') && pos('.esp', '#lab-res .delta-grid') && pos('#lab-res .delta-grid', '#lab-res table'), quien: /Quién cede el peso/.test(document.querySelector('#lab-res').textContent), barras: document.querySelectorAll('.esp-barra').length }; });
    await snap(p, 'C13-comparacion-pesos', 390);
    ev('O4', 'Laboratorio: quién cede el peso justo al calcular, y el desarrollo debajo', 'Evolución 25: «Cuánto espacio ocuparía», las dos barras (antes/después), «Quién cede el peso» con tarjetas de cambio (KO 60→54, PG 40→36) y debajo las tablas (en desplegable)', `${lab.origen}; orden ${lab.ord}; barras ${lab.barras}`, lab.quien && /KO.*54 %/.test(lab.origen) && /PG.*36 %/.test(lab.origen) && lab.ord && lab.barras === 2 && await sinDesborde(p));
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
    ev('O5b', 'Editar la pregunta con otras palabras: se conserva el vínculo y la ficha lo dice', 'Casilla marcada al editar; tras guardar la ficha sigue mostrando la RESPUESTA EDITORIAL (reformulación con respuesta) y ofrece «Leer la revisión»', `${refMarcada}; ${ficha.match(/Reformulación con respuesta editorial/)?.[0]}; ${ficha.match(/sigue la misma cuestión[^.]*\./)?.[0]}`, refMarcada === true && /Respuesta editorial/.test(ficha) && /Reformulación con respuesta editorial/.test(ficha) && /sigue la misma cuestión/.test(ficha) && /Leer la revisión/.test(ficha));
    const cart = (await api(p, 'GET', '/portfolios/' + c.j.id)).j;
    const crea = (clave, extra) => api(p, 'POST', '/escenarios', { clave, nombre: 'Caso ' + clave, cartera_id: c.j.id, base_revision: cart.revision, ticker: 'HNORT', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'HNORT', peso: 10 }], historia: 'hidrogeno-norte', ...extra });
    const o = await crea('o5-original-0001', { pregunta: '¿Se han firmado los dos contratos anunciados?', pregunta_ref: 'hidrogeno-norte:1', revisar_en: '2026-12-10' }), nu = await crea('o5-nueva-00001', { pregunta: '¿Y si pierden al cliente principal?', pregunta_ref: null, revisar_en: '2026-12-20' });
    const casos = async pg => { await pg.evaluate(() => { location.hash = '#seguimiento'; }); await pg.waitForSelector('#seg-escenarios .esc-item'); await pg.waitForTimeout(700); return pg.evaluate(() => [...document.querySelectorAll('#seg-escenarios .esc-item')].map(c => c.textContent.replace(/\s+/g, ' ').trim())); };
    const verTres = (l) => { const por = pre => l.find(x => x.includes(pre)) || ''; const og = por('¿Se han firmado los dos'), rf = por('¿Al final firmaron'), nv = por('¿Y si pierden');
      const ed = x => (x.match(/Respuesta editorial:[^.]*\./) || [''])[0], seg = x => (x.match(/Tu seguimiento:[^.]*\./) || [''])[0];
      return { og, rf, nv, ok: l.length === 3 && /responde a la cuestión que sigues/.test(ed(og)) && /responde a la cuestión que sigues/.test(ed(rf)) && /responde a otra cuestión/.test(ed(nv)) && /no tiene respuesta editorial/.test(ed(nv))
        && l.every(x => /sin revisiones personales todavía/.test(seg(x))) && !/sigue pendiente hasta que la revises/.test(l.join(' ')) && l.every(x => !/Qué ha ocurrido desde entonces/.test(x)) && l.every(x => /Registrar revisión/.test(x)) && !document_vacio(l) }; };
    const document_vacio = l => l.some(x => !x.trim());
    let l = await casos(p), r1 = verTres(l); await snap(p, 'C12-pregunta-editada', 390);
    ev('O5c', 'Tres escenarios con la MISMA empresa: texto original, reformulación que conserva el vínculo y pregunta nueva', 'UNA tarjeta por escenario; «Tu seguimiento» (revisiones personales) y «Respuesta editorial» son frases SEPARADAS: original y reformulación → la revisión de la historia responde a su cuestión; la nueva → responde a otra cuestión y «no tiene respuesta editorial»; ninguna dice «pendiente hasta que la revises tú» ni repite el desenlace; todas ofrecen «Registrar revisión»', `${l.length} tarjetas; ${r1.nv.slice(0, 240)}`, o.s === 201 && nu.s === 201 && r1.ok);
    // la ficha del original muestra el desenlace completo UNA vez
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, o.j.id); await p.waitForSelector('.esc-editorial'); const fo = await texto(p, '.esc-editorial');
    ev('O5c2', 'La ficha del escenario original muestra la respuesta editorial completa, una sola vez, separada de las revisiones personales', 'Aparece «Qué ha ocurrido desde entonces» una vez y el aviso de que las revisiones personales son aparte', `${(fo.match(/Qué ha ocurrido desde entonces/g) || []).length} vez; ${/Tus revisiones personales/.test(fo)}`, (fo.match(/Qué ha ocurrido desde entonces/g) || []).length === 1 && /Tus revisiones personales/.test(fo) && /Con respuesta editorial/.test(fo));
    // cerrar sesión (se guarda el token antiguo para comprobar que queda REVOCADO) y volver con la misma cuenta
    const tokenViejo = await p.evaluate(() => localStorage.getItem('klever_token'));
    await p.evaluate(() => document.querySelector('#salir').click()); await p.waitForSelector('#entrar', { state: 'attached' }); await p.waitForTimeout(500);
    const viejo = await p.evaluate(async t => (await fetch('/api/escenarios', { headers: { authorization: 'Bearer ' + t } })).status, tokenViejo);
    await entrarCon(p, correo); l = await casos(p); const r2 = verTres(l);
    ev('O5d', 'Cierro sesión y vuelvo con la misma cuenta', 'El token ANTIGUO queda revocado (401) y, con la sesión nueva, las tres tarjetas siguen igual (texto, vínculo, fecha y estado)', `token antiguo ${viejo}; ${l.length} tarjetas; ${r2.ok}`, viejo === 401 && r2.ok && JSON.stringify(r1) === JSON.stringify(r2));
    // otra cuenta
    const otro = await nuevo(b, 390, 780); await entrarCon(otro, mail('OT')); await otro.evaluate(() => { location.hash = '#seguimiento'; }); await otro.waitForFunction(() => /Aún no has guardado ningún escenario/.test(document.querySelector('#seg-escenarios')?.textContent || ''), null, { timeout: 15000 });
    const lista = await api(otro, 'GET', '/escenarios'), ajeno = await api(otro, 'GET', '/escenarios/' + idUI), yo = await api(otro, 'GET', '/portfolios'), vacio = await texto(otro, '#seg-escenarios');
    ev('O5e', 'Otra cuenta, AUTENTICADA, en otro navegador', 'Sesión válida (200 en /portfolios), lista de escenarios 200 y VACÍA, 404 al abrir el ID concreto de la primera cuenta y la pantalla dice «Aún no has guardado ningún escenario» (no un error de carga) y el bloque editorial no se muestra', `portfolios ${yo.s}; lista ${lista.s}/${Array.isArray(lista.j) ? lista.j.length : '?'}; ID ajeno ${ajeno.s}; «${vacio.slice(0, 80)}»`, yo.s === 200 && lista.s === 200 && Array.isArray(lista.j) && lista.j.length === 0 && ajeno.s === 404 && /Aún no has guardado ningún escenario/.test(vacio) && !/contratos anunciados|firmaron|cliente principal/.test(vacio));
    await otro.ctx.close();
    // ---- O6. Una nota guardada manipulada NO crea etiquetas en el DOM (defensa en la interfaz aunque el servidor antiguo la entregase)
    const MARCA = '<img src=x onerror="window.__pwn=1">';
    let interceptadas = 0;
    const manipular = async r => { interceptadas++; const resp = await r.fetch(); const j = await resp.json(); const cambiar = e => { if (e && e.evaluacion) { e.evaluacion.antes.nota = MARCA; e.evaluacion.antes.motivo = MARCA; e.nota = e.nota; } return e; }; await r.fulfill({ response: resp, json: Array.isArray(j) ? j.map(cambiar) : cambiar(j) }); };
    await p.route(new RegExp('/api/escenarios/' + idUI + '$'), manipular); await p.route(/\/api\/escenarios$/, manipular);
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, idUI); await p.waitForSelector('.esc-ficha'); await p.waitForTimeout(600);
    const dom = await p.evaluate(() => ({ imgs: document.querySelectorAll('#lab-cuerpo img').length, pwn: window.__pwn === 1, texto: document.querySelector('.lab-res')?.textContent.replace(/\s+/g, ' ') }));
    ev('O6', 'RESPUESTA INTERCEPTADA (no es una fila corrupta real; esa se prueba en unit-escenarios16 P3/P3b y unit-guardada17 G9): el servidor «entrega» la evaluación con marcado en la nota', 'La interfaz la vuelve a validar: no se crea ninguna etiqueta, no se ejecuta nada y se dice que no supera las comprobaciones de formato', `interceptadas ${interceptadas}; imgs ${dom.imgs}; ejecutado ${dom.pwn}; ${(dom.texto.match(/no supera[^.]*\./) || [''])[0]}`, interceptadas >= 1 && dom.imgs === 0 && !dom.pwn && /no supera las comprobaciones de formato/.test(dom.texto));
    await p.ctx.close(); }
  await b.close(); fin('evidencias-O16');
})();
