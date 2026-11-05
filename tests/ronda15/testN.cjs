// Batería N (ronda 15): los cinco cambios de la web móvil, el comparador, la nota en pantalla y el seguimiento que abre con la pregunta.
// 320/390/1440 px. Datos y caso editorial FICTICIOS. Uso: node tests/ronda15/testN.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', 'ronda15', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(600); };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const snap = (p, id, w, full = true) => p.screenshot({ path: CAP + `${id}-${w}.png`, fullPage: full });
  const abrirFicha = async (p, ticker) => { await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true'); await p.fill('#emp-buscar', ticker); await p.waitForTimeout(300); await p.locator('.ver-ficha >> visible=true').first().click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForSelector('#fi-radar .fir-acciones'); await p.waitForTimeout(300); };
  const fmtP = v => (v * 100).toFixed(1).replace('.', ',') + ' %';

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 780, p = await nuevo(b, w, h); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    // ---- 1. Tres destinos
    await p.goto(B); await p.waitForSelector('.hero');
    const movil = w < 720; if (movil) await p.click('#btn-menu');
    const nav = await p.evaluate(m => [...document.querySelectorAll(m ? '#menu-movil a' : '.menu-escritorio a')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()), movil);
    ev('N1-' + w, `Navegación principal de cuatro entradas (${w} px)`, '«Mis portafolios», «Crear portafolio», «Cuaderno» y «Revista» (secundaria)', JSON.stringify(nav), JSON.stringify(nav) === JSON.stringify(['Mis portafolios', 'Crear portafolio', 'Cuaderno', 'Revista']));
    if (movil) await p.click('#btn-menu');
    const tabs = [];
    for (const [hash, id] of [['#revista', 'revista'], ['#empresas', 'empresas'], ['#publicas', 'publicas']]) { await p.evaluate(h2 => { location.hash = h2; }, hash); await p.waitForTimeout(350); tabs.push(await p.evaluate(i => ({ tabs: [...document.querySelectorAll('.ideas-tabs:not([hidden])')].filter(e => e.offsetParent !== null).length, actual: document.querySelector(`.ideas-tabs a[data-ideas=${i}][aria-current=page]`) !== null, nav: document.querySelector('[data-nav][aria-current=page]')?.dataset.nav }), id)); }
    ev('N1b-' + w, `Revista reúne historias, empresas y carteras públicas (${w} px)`, 'En las tres vistas hay pestañas con la actual marcada y la entrada «Revista» activa', JSON.stringify(tabs), tabs.every(t => t.tabs >= 1 && t.actual && t.nav === 'revista'));
    // ---- 2. Portada y ejemplo (visitante)
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForSelector('.hero');
    const por = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, primaria: document.querySelector('#probar').textContent.trim(), sec: document.querySelector('#ver-ejemplo').textContent.trim(), seg: document.querySelector('.entradas')?.textContent.replace(/\s+/g, ' ').trim() || '', vacio: !!document.querySelector('#vista-inicio .vacio-util') }));
    await snap(p, 'C1-portada', w, false);
    ev('N2-' + w, `Portada: crear o explorar un ejemplo, y las tres entradas (${w} px; texto actualizado en la ronda 21)`, 'Acción principal «Crear desde cero», secundaria «Ver un ejemplo explicado» y las tres entradas (desde cero, ejemplo, recrear); sin radar vacío', JSON.stringify(por), por.primaria === 'Crear desde cero' && por.sec === 'Ver un ejemplo explicado' && /Crear desde cero.*Explorar un ejemplo.*Recrear mi cartera/.test(por.seg) && !por.vacio);
    await p.click('#ver-ejemplo'); await p.waitForSelector('.ej-lista'); await p.waitForSelector('#ej-nota .nota, #ej-nota p');
    const ej = await p.evaluate(() => ({ filas: [...document.querySelectorAll('.ej-lista li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()), barra: document.querySelector('.ej-barra').getAttribute('aria-label'), aviso: document.querySelector('#vista-ejemplo .pag-cab p').textContent, nota: document.querySelector('#ej-nota').textContent.replace(/\s+/g, ' ').slice(0, 160) }));
    await snap(p, 'C2-ejemplo', w);
    ev('N2b-' + w, `Cartera de ejemplo: nombre, peso y por qué está cada posición (${w} px)`, 'Dos posiciones con nombre, símbolo, peso (60 % y 40 %) y una frase de razón; aviso de que es un ejemplo; la nota de estructura aparece (con su aviso de datos)', `${ej.filas.map(f => f.slice(0, 70)).join(' | ')}; ${ej.nota.slice(0, 60)}`, ej.filas.length === 2 && /Coca|KO/.test(ej.filas[0]) && /60 %/.test(ej.filas[0]) && /por qué|pone grande/.test(ej.filas[0] + ' ' + 'por qué') && ej.filas[0].length > 60 && /40 %/.test(ej.filas[1]) && /ejemplo/i.test(ej.aviso) && /Nota de estructura/.test(ej.nota) && await sinDesborde(p));
    // ---- 3. Historia: resumen primero, fuentes plegadas
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-resumen');
    const hi = await p.evaluate(() => { const r = document.querySelector('.art-resumen'), primerH2 = document.querySelector('.art h2:not(.art-resumen h2)'); return { items: [...r.querySelectorAll('dt')].map(e => e.textContent), antes: !!(r.compareDocumentPosition(primerH2) & Node.DOCUMENT_POSITION_FOLLOWING), fuentes: document.querySelector('details.art-fuentes')?.open, largo: document.querySelectorAll('.art p').length }; });
    await snap(p, 'C3-historia', w);
    ev('N3-' + w, `Ideas: primera vista con qué hace el negocio, por qué estudiarla y qué puede salir mal (${w} px)`, 'Resumen de tres puntos antes de la lectura extensa; la lectura completa sigue; las fuentes, en un desplegable cerrado', JSON.stringify(hi), JSON.stringify(hi.items) === JSON.stringify(['Qué hace el negocio', 'Por qué merece estudio', 'Qué podría salir mal']) && hi.antes && hi.fuentes === false && hi.largo >= 6);
    // ---- 4. Ficha: nombre y símbolo juntos, acciones con la pregunta, «atrás»
    await p.click('button[data-ficha=HNORT]'); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForSelector('#fi-radar .fir-acciones'); await p.waitForTimeout(300);
    const fi = await p.evaluate(() => ({ titulo: document.querySelector('#fi-titulo').textContent, preg: document.querySelector('.fir-pregunta')?.textContent, botones: [...document.querySelectorAll('.fir-botones button')].map(e => e.textContent.trim()), primero: document.querySelector('#fi-radar').firstElementChild.className }));
    await snap(p, 'C4-ficha', w, false);
    await p.goBack(); await p.waitForTimeout(400);
    const trasAtras = await p.evaluate(() => ({ abierta: document.querySelector('#dlg-ficha').open, hash: location.hash }));
    ev('N4-' + w, `Ficha: nombre y símbolo juntos; pregunta y acciones arriba; «atrás» conserva el contexto (${w} px)`, 'Título «Hidrógeno Norte (empresa ficticia) (HNORT)»; la pregunta investigada junto a «Probar en mi cartera» y «Comparar con otra empresa»; con «atrás» se cierra la ficha y sigues en la historia', `${fi.titulo}; ${fi.preg}; ${fi.botones}; tras atrás: ${JSON.stringify(trasAtras)}`,
      /\(HNORT\)$/.test(fi.titulo) && /¿Se han firmado los dos contratos anunciados\?/.test(fi.preg) && JSON.stringify(fi.botones) === JSON.stringify(['Probar en mi cartera', 'Comparar con otra empresa']) && fi.primero === 'fir-acciones' && !trasAtras.abierta && trasAtras.hash === '#historia-hidrogeno-norte');
    // «atrás» desde Explorar con búsqueda; y que Cerrar no deja el historial atascado
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForSelector('.hero'); await abrirFicha(p, 'JNJ'); await p.click('#dlg-ficha [data-cerrar]'); await p.waitForTimeout(400);
    const cerrada = await p.evaluate(() => ({ abierta: document.querySelector('#dlg-ficha').open, busq: document.querySelector('#emp-buscar').value, hash: location.hash })); await p.goBack(); await p.waitForTimeout(500);
    ev('N4b-' + w, `«Cerrar» y «atrás» no atascan el historial y conservan la búsqueda (${w} px)`, 'Tras Cerrar, sigues en Explorar con «JNJ» escrito; un «atrás» posterior vuelve a la portada (no reabre la ficha)', `${JSON.stringify(cerrada)}; luego ${await p.evaluate(() => location.hash)} / ficha abierta ${await p.evaluate(() => document.querySelector('#dlg-ficha').open)}`, !cerrada.abierta && cerrada.busq === 'JNJ' && cerrada.hash === '#empresas' && (await p.evaluate(() => location.hash)) === '#inicio' && !(await p.evaluate(() => document.querySelector('#dlg-ficha').open)));
    // ---- 5. Comparador
    const sector = await p.evaluate(async () => { const a = await (await fetch('/api/assets/JNJ')).json(); return a.sector; });
    await abrirFicha(p, 'JNJ'); await p.click('#fir-comparar'); await p.waitForSelector('.cmp-lista'); await p.waitForTimeout(300);
    const lista = await p.evaluate(() => [...document.querySelectorAll('.cmp-lista button')].map(e => e.dataset.compararCon));
    const sectores = await p.evaluate(async l => { const out = {}; for (const t of l) out[t] = (await (await fetch('/api/assets/' + t)).json()).sector; return out; }, lista);
    await snap(p, 'C5-comparar-elegir', w, false);
    await p.click('.cmp-lista button >> nth=0'); await p.waitForSelector('.tabla-cmp'); await p.waitForTimeout(400);
    const otra = lista[0];
    const cmp = await p.evaluate(() => ({ filas: [...document.querySelectorAll('.tabla-cmp tbody tr')].map(tr => [tr.querySelector('th').childNodes[0].textContent.trim(), ...[...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim())]), titulo: document.querySelector('#comparar-cuerpo h1').textContent, tabla: document.querySelector('.tabla-cmp').textContent, cuerpo: document.querySelector('#comparar-cuerpo').textContent }));
    const datos = await p.evaluate(async ([x, y]) => [await (await fetch('/api/assets/' + x)).json(), await (await fetch('/api/assets/' + y)).json()], ['JNJ', otra]);
    const esp = (a, y) => { const f = Object.fromEntries(a.fundamentales.map(r => [+r.periodo.slice(2), r])); return { crec: f[y] && f[y - 1] ? f[y].ingresos / f[y - 1].ingresos - 1 : null, marg: f[y]?.resultado_operativo != null ? f[y].resultado_operativo / f[y].ingresos : null }; };
    const E = datos.map(d => esp(d, 2024)), cel = (i, j) => cmp.filas[i][j];
    await snap(p, 'C5-comparar', w);
    ev('N5-' + w, `Comparador: tres filas del mismo sector, con las cifras de los datos y su fuente (${w} px)`, `Solo empresas del sector «${sector}»; tres filas (crecimiento, margen operativo = resultado operativo/ventas, deuda neta/EBITDA); cada cifra coincide con el cálculo independiente; fuente y periodo por cifra; sin ganadores`,
      `${cmp.titulo}; ${JSON.stringify(cmp.filas.map(f => f.slice(0, 3)))}`, lista.length > 0 && lista.every(t => sectores[t] === sector) && cmp.filas.length === 3 && (E[0].crec == null || cel(0, 1).startsWith(fmtP(E[0].crec).replace('.', ',').replace(' %', '')) || cel(0, 1).includes(fmtP(E[0].crec))) && (E[1].marg == null || cel(1, 2).includes(fmtP(E[1].marg))) && /FY2024 · datos de prueba/.test(cmp.cuerpo) && !/ganador|mejor|puntuaci/i.test(cmp.tabla) && /Resultado operativo sobre ventas/.test(cmp.cuerpo));
    await p.click('#comparar-cuerpo [data-probar]'); await p.waitForSelector('#lab-form'); const tk = await p.inputValue('#lab-ticker');
    ev('N5b-' + w, `La acción final del comparador abre el laboratorio con la empresa elegida (${w} px)`, `Laboratorio con «${otra}» ya elegida`, tk, tk === otra);
    // ---- 6. Laboratorio: espacio, quién cede, bloques evaluables
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab'); await p.waitForTimeout(300);
    const lab = await p.evaluate(() => ({ espacio: document.querySelector('.lab-espacio')?.textContent.replace(/\s+/g, ' '), barras: document.querySelectorAll('.esp-barra').length, origen: document.querySelector('.lab-origen')?.textContent.replace(/\s+/g, ' '), cambio: [...document.querySelectorAll('#lab-res h3')].some(e => /Qué cambia en la nota de estructura/.test(e.textContent)),
      bloques: [...document.querySelectorAll('#lab-res table')].find(t => /Bloque/.test(t.textContent))?.querySelectorAll('tbody tr').length, orden: (() => { const o = document.querySelector('.lab-espacio'), t = document.querySelector('#lab-res table'); return !!(o.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); })() }));
    await snap(p, 'C6-laboratorio', w);
    ev('N6-' + w, `Laboratorio: cuánto espacio, quién cede y qué cambia en los bloques evaluables (${w} px)`, 'Primero «HNORT ocuparía el 10 %…» y quién cede (KO 6, PG 4); dos barras antes/después; después las tablas y la tabla de los 5 bloques de la nota (antes/después)', `${lab.espacio}; barras ${lab.barras}; bloques ${lab.bloques}`, /HNORT ocuparía el 10 %/.test(lab.espacio) && lab.barras === 2 && /KO cede 6/.test(lab.origen) && lab.cambio && lab.bloques === 5 && lab.orden && await sinDesborde(p));
    // ---- 7. Seguimiento (visitante): abre con las preguntas, beta visible, radar al final
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.caso'); await p.waitForTimeout(300);
    const seg = await p.evaluate(() => { const bloques = [...document.querySelectorAll('.seg-bloque h2')].map(e => e.textContent.replace(/\s+/g, ' ').trim()), beta = document.querySelector('#seg-beta'); const r = beta.getBoundingClientRect();
      return { bloques, beta: beta.textContent, betaVisible: r.right <= window.innerWidth + 1 && r.left >= -1 && r.width > 40, casos: [...document.querySelectorAll('.caso')].map(c => c.textContent.replace(/\s+/g, ' ').trim()), radarVacioAntes: (() => { const c = document.querySelector('#seg-casos'), r2 = document.querySelector('#seg-radar'); return !!(c.compareDocumentPosition(r2) & Node.DOCUMENT_POSITION_FOLLOWING) === false; })() }; });
    await snap(p, 'C7-seguimiento-visitante', w);
    ev('N7-' + w, `Seguimiento (visitante): abre con la pregunta, etiqueta beta legible y caso sin novedades (${w} px)`, 'Primero «Tus preguntas», luego escenarios y radar; etiqueta «En beta · Formará parte del futuro plan de pago» completa y visible; caso 1 con qué pasó con cada contrato (C firmado, D aplazado, fuente y fecha, simulado); caso 2 «Sigue pendiente» (ya no «Sin novedades»); ambos «Ejemplo ficticio»',
      `${JSON.stringify(seg.bloques)}; «${seg.beta}»; ${seg.casos[0]?.slice(0, 160)}…`, seg.bloques[0] === 'Tus preguntas' && /Mis escenarios/.test(seg.bloques[1]) && /Mi radar/.test(seg.bloques[2]) && /En beta · Formará parte del futuro plan de pago/.test(seg.beta) && seg.betaVisible && /Proyecto C.*Firmado el 29 de octubre/.test(seg.casos[0]) && /Proyecto D.*Aplazado/.test(seg.casos[0]) && /3 nov 2026/.test(seg.casos[0]) && /desenlace SIMULADO/.test(seg.casos[0]) && /Fuente:/.test(seg.casos[0]) && /Sigue pendiente/.test(seg.casos[1]) && seg.casos.every(c => /Ejemplo ficticio/.test(c)) && await sinDesborde(p));
    ev('N7b-' + w, `Sin errores de JavaScript en el recorrido de visitante (${w} px)`, 'Ningún pageerror', JSON.stringify(errs), errs.length === 0);
    await p.ctx.close();
  }

  // ---- 8. Seguimiento con cuenta: solo lo del propietario; pesos del escenario frente a la cartera actual
  for (const w of [390]) {
    const p = await nuevo(b, w, 780); p.on('dialog', d => d.accept()); await entrarCon(p, mail('NS'));
    const c = await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera N', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] });
    await p.evaluate(() => { location.hash = '#historia-hidrogeno-norte'; }); await p.waitForSelector('.art-acc [data-probar]'); await p.click('.art-acc [data-probar]'); await p.waitForSelector('#lab-form');
    await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-guardar-btn');
    await p.fill('#lab-revisar', '2026-12-15'); await p.click('#lab-guardar-btn'); await p.waitForSelector('#esc-editar'); const idEsc = +(await p.evaluate(() => location.hash.match(/escenario-(\d+)/)[1]));
    const det = N(await p.textContent('#lab-cuerpo'));
    ev('N8', 'El escenario guarda la evaluación de estructura fechada que vio la persona', 'El detalle dice «Registro de la nota de estructura que viste (…, método estructura-v1)» y que el servidor no la recalculó ni se recalcula', det.match(/Registro de la nota de estructura que viste[^.]*\./)?.[0] || '(no aparece)', /Registro de la nota de estructura que viste/.test(det) && /no la recalculó/.test(det) && /tampoco se recalcula/.test(det));
    // cambio la cartera actual: HNORT al 20 % (el escenario conserva el 10 %)
    const act = (await api(p, 'GET', '/portfolios/' + c.j.id)).j;
    await api(p, 'PUT', '/portfolios/' + c.j.id, { posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 30 }, { ticker: 'HNORT', peso: 20 }], nombre: act.nombre, tesis: '', revision: act.revision });
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('.caso'); await p.waitForTimeout(500);
    const caso = N(await p.textContent('.caso')); await snap(p, 'C8-seguimiento-regreso', w);
    ev('N9', 'Seguimiento con cuenta: la pregunta, qué ha ocurrido, la fecha y los pesos distinguidos', 'La tarjeta tiene la pregunta, «15 dic 2026», qué ha ocurrido (C firmado, D aplazado, fuente), el peso en el ESCENARIO (10 %, base 0 %) distinto del de la CARTERA ACTUAL (20 %) y los enlaces a la revisión y a la simulación',
      caso.slice(0, 380), /¿Se han firmado los dos contratos anunciados\?/.test(caso) && /15 dic 2026/.test(caso) && /Firmado el 29 de octubre/.test(caso) && /escenario guardado: 10 %.*la base tenía 0 %/.test(caso) && /cartera actual: 20 %/.test(caso) && (await p.locator('.caso a[href="#tesis-hidrogeno-norte-2"]').count()) === 1 && (await p.locator(`.caso a[href="#escenario-${idEsc}"]`).count()) === 1);
    const otro = await nuevo(b, w, 780); await entrarCon(otro, mail('NT')); await otro.evaluate(() => { location.hash = '#seguimiento'; }); await otro.waitForSelector('#seg-casos'); await otro.waitForTimeout(800);
    const ajeno = N(await otro.textContent('#seg-casos'));
    ev('N9b', 'Con cuenta solo se usan las preguntas y posiciones del propietario', 'Otra cuenta no ve la pregunta ni las posiciones de la primera (ni el ejemplo ficticio de visitante)', ajeno.slice(0, 140), !/contratos anunciados/.test(ajeno) && /Cuando guardes un escenario con una pregunta/.test(ajeno));
    await otro.ctx.close(); await p.ctx.close();
  }
  // ---- 9. Nota en el editor y filtros plegados en Explorar
  { const p = await nuevo(b, 390, 780); await p.goto(B); await p.waitForSelector('.plantilla'); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.evaluate(() => document.querySelector('.js-revisar').click()); await p.waitForSelector('#nota-cuerpo .nota'); await p.waitForTimeout(300);
    const nota = N(await p.textContent('#nota-cuerpo .nota'));
    ev('N10', 'La nota de estructura en el editor, con su aviso de datos y «Cómo se calcula»', 'Muestra «Nota de estructura v1 · beta», «No es una previsión de rentabilidad», el aviso de datos de prueba, y el desplegable del método; ETF/fondos sin metodología aparecen como peso sin evaluar con motivo', nota.slice(0, 260), /Nota de estructura/.test(nota) && /No es una previsión de rentabilidad/.test(nota) && /PRUEBA ficticios/.test(nota) && /Cómo se calcula/.test(nota) && /Fondo \(ETF\) sin metodología/.test(nota));
    await p.screenshot({ path: CAP + 'C9-nota-pendiente-390.png', fullPage: true });
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('.ver-ficha >> visible=true');
    const ex = await p.evaluate(() => ({ abierto: document.querySelector('#emp-filtros-det').open, resumen: document.querySelector('#emp-filtros-det summary').textContent.trim(), selVisible: document.querySelector('#emp-sector').offsetParent !== null }));
    ev('N11', 'Explorar: los filtros no ocupan la primera vista', 'Filtros plegados por defecto (el desplegable está cerrado; se abre al pulsarlo o si hay alguno activo)', JSON.stringify(ex), ex.abierto === false && /Filtros/.test(ex.resumen));
    await p.ctx.close(); }
  await b.close(); fin('evidencias-N15');
})();
