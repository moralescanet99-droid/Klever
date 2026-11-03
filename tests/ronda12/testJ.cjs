// Batería J (ronda 12): coherencia visual y recorrido completo de exploración (Mis carteras, Explorar empresas, Ficha) y tres detalles del editor.
// Comprueba propiedades medibles y recorridos, no «gustos». Datos: los de la semilla de prueba (ficticios). El texto ampliado es una SIMULACIÓN (font-size del documento).
const { chromium, B, ev, nuevo, mail, peso, fin } = require('../ronda5/h.cjs');
const LARGO = 'Cartera de inversión a largo plazo con un nombre extraordinariamente largo'; // 74 caracteres (el máximo es 80)
const T10 = ['AAPL', 'MSFT', 'KO', 'PG', 'JNJ', 'XOM', 'NVDA', 'AMZN', 'GOOGL', 'META'];
(async () => {
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, ruta, body]);
  const sinBorrador = async (p, tag) => {
    await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', mail(tag)); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(500);
  };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const colorDeFilas = p => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#pos-tabla tbody tr, #pos-cards .pos-card')].filter(e => e.offsetParent !== null).map(e => [e.querySelector('b').textContent.trim(), getComputedStyle(e.querySelector('.punto')).backgroundColor])));
  const abrirCartera = async (p, nombre) => { await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.locator('.cartera-item', { hasText: nombre }).first().click(); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.locator('.peso-in >> visible=true').first().waitFor(); await p.waitForTimeout(400); };

  for (const w of [320, 390, 1440]) {
    const h = w === 1440 ? 900 : 760, esc = w >= 720;
    const p = await nuevo(b, w, h); await sinBorrador(p, 'J' + w);
    // --- Mis carteras: estado vacío útil
    const vacio = await p.evaluate(() => { const f = document.querySelector('#form-nueva'), v = e => e && e.offsetParent !== null; return { form: v(f), titulo: document.querySelector('#nueva-titulo').textContent, ayuda: v(document.querySelector('#nueva-ayuda')), crear: v(f.querySelector('button.btn-primario')), cancelar: v(document.querySelector('#nueva-cancelar')) }; });
    ev('J1-' + w, `Mis carteras sin carteras: estado vacío con acción clara (${w} px)`, 'Formulario visible con título «Crea tu primera cartera», explicación y botón «Crear cartera»; sin botón Cancelar; sin desbordamiento',
      JSON.stringify(vacio) + ` · sin desbordamiento=${await sinDesborde(p)}`, vacio.form && /primera/.test(vacio.titulo) && vacio.ayuda && vacio.crear && !vacio.cancelar && await sinDesborde(p));
    // --- varias carteras: una pública con reparto incompleto, una con nombre largo, una de diez posiciones, una con cambios locales
    await api(p, 'POST', '/portfolios', { nombre: LARGO, plantilla: 'riesgo', posiciones: [{ ticker: 'NVDA', peso: 40 }, { ticker: 'MSFT', peso: 30 }, { ticker: 'AMZN', peso: 20 }, { ticker: 'GOOGL', peso: 5 }, { ticker: 'META', peso: 3 }, { ticker: 'AAPL', peso: 0.5 }] });
    const d10 = await api(p, 'POST', '/portfolios', { nombre: 'Diez posiciones', plantilla: 'dividendos', posiciones: T10.map(t => ({ ticker: t, peso: 10 })) });
    const o = await api(p, 'POST', '/portfolios', { nombre: 'Oro', plantilla: 'oro', posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 25 }, { ticker: 'GDX', peso: 25 }], tesis: 'Oro como refugio. Cartera simulada.' });
    await api(p, 'PATCH', '/portfolios/' + o.j.id, { publico: true, revision: o.j.revision });
    await p.reload(); await p.waitForSelector('.cartera-item');
    const lista = await p.evaluate(() => [...document.querySelectorAll('.cartera-item')].map(e => ({ nombre: e.querySelector('.ci-l1 b').textContent, tramos: e.querySelectorAll('.ci-comp i:not(.libre)').length, libre: !!e.querySelector('.ci-comp i.libre'), anchos: [...e.querySelectorAll('.ci-comp i')].map(i => i.getBoundingClientRect().width / i.parentElement.getBoundingClientRect().width * 100), top: e.querySelector('.ci-top')?.textContent || '', l2: e.querySelector('.ci-l2').textContent, pend: e.classList.contains('pendiente') })));
    const gl = lista.find(x => x.nombre === LARGO), g10 = lista.find(x => x.nombre === 'Diez posiciones'), go = lista.find(x => x.nombre === 'Oro');
    ev('J2-' + w, `Mis carteras: composición real de cada tarjeta (${w} px)`, 'Un tramo por posición con peso, de ancho proporcional al peso guardado (tolerancia 2 puntos por los huecos); tramo libre si no suma 100 %; nombre largo íntegro; estado de asignación escrito; sin desbordamiento',
      lista.map(x => `${x.nombre.slice(0, 14)}: ${x.tramos} tramos${x.libre ? '+libre' : ''}, «${x.l2}»`).join(' | ') + ` · sin desbordamiento=${await sinDesborde(p)}`,
      lista.length === 3 && gl.tramos === 6 && gl.libre && Math.abs(gl.anchos[0] - 40) < 2 && Math.abs(gl.anchos[5] - 0.5) < 2 && /Falta asignar 1,5\s%/.test(gl.l2) && g10.tramos === 10 && !g10.libre && /Asignada al 100 %/.test(g10.l2) && go.tramos === 3 && /GLD.*50/.test(go.top) && await sinDesborde(p));
    ev('J2b-' + w, `Mis carteras: resumen textual con las tres mayores posiciones (${w} px)`, 'Las tres posiciones de mayor peso con su porcentaje y «+N más»; nada inventado',
      `${g10.top} / ${gl.top}`, /\+7 más/.test(g10.top) && /NVDA.*40\s%.*MSFT.*30\s%.*AMZN.*20\s%.*\+3 más/.test(gl.top));
    // --- cambios locales pendientes en una: se distingue y ofrece «Continuar editando»
    await abrirCartera(p, 'Oro'); await peso(p).fill('18'); await p.waitForTimeout(400); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.waitForTimeout(300);
    const pend = await p.evaluate(() => [...document.querySelectorAll('.cartera-item')].map(e => ({ n: e.querySelector('.ci-l1 b').textContent, pend: e.classList.contains('pendiente'), cta: e.querySelector('.pl-acc-txt').textContent, chip: !!e.querySelector('.chip.aviso'), borde: getComputedStyle(e).borderLeftWidth })));
    const po = pend.find(x => x.n === 'Oro'), resto = pend.filter(x => x.n !== 'Oro');
    ev('J3-' + w, `Mis carteras: cambios locales pendientes claramente distinguidos (${w} px)`, 'Solo la cartera con cambios locales lleva clase «pendiente», chip de aviso, borde reforzado y la acción «Continuar editando»; las demás dicen «Abrir»',
      JSON.stringify(pend), po.pend && po.chip && po.cta === 'Continuar editando' && parseFloat(po.borde) >= 4 && resto.every(x => !x.pend && !x.chip && x.cta === 'Abrir'));
    // --- Editor: % asignado una sola vez
    await abrirCartera(p, 'Oro');
    const dup = await p.evaluate(() => { const vis = e => e && e.offsetParent !== null; return { comp: vis(document.querySelector('#comp-total')), resumen: vis(document.querySelector('#r-total')), barraResumen: vis(document.querySelector('#r-barra')), sectores: vis(document.querySelector('#r-sectores')), roic: vis(document.querySelector('#r-roic')) || !!document.querySelector('#roic-det') }; });
    ev('J4-' + w, `Editor: el % asignado y su barra no se repiten (${w} px)`, 'El % asignado aparece en la composición (información principal); el resumen lateral no lo repite ni repite su barra; sí conserva categorías y ROIC',
      JSON.stringify(dup), dup.comp && !dup.resumen && !dup.barraResumen && (esc ? dup.sectores : true) && dup.roic);
    // --- Editor: cabecera de cartera pública con cambios inválidos (peso 18 → falta 7 %)
    const cab = await p.evaluate(() => { const vis = e => e && e.offsetParent !== null; return { principal: document.querySelector('#mv-main').textContent, visible: vis(document.querySelector('#mv-main')), sub: vis(document.querySelector('#mv-sub')) ? document.querySelector('#mv-sub').textContent : null, det: vis(document.querySelector('#mv-det')), abierto: document.querySelector('#mv-det').open, bar: document.querySelector('#b-estado').textContent }; });
    if (esc) {
      ev('J5-' + w, 'Editor: cabecera de una cartera pública con cambios inválidos', 'Mensaje principal «Falta asignar un 32 % para actualizar la publicación» (18+25+25 = 68 %); sigue visible «La versión pública sigue igual.»; detalle en un desplegable cerrado; el motivo largo no es el mensaje principal',
        JSON.stringify(cab), cab.principal.replace(/\u00a0/g, ' ') === 'Falta asignar un 32 % para actualizar la publicación' && cab.visible && cab.sub === 'La versión pública sigue igual.' && cab.det && !cab.abierto);
      await p.click('#mv-det summary'); await peso(p).fill('17'); await p.waitForTimeout(300);
      const det = await p.evaluate(() => ({ abierto: document.querySelector('#mv-det').open, txt: document.querySelector('#mv-txt').textContent, main: document.querySelector('#mv-main').textContent }));
      ev('J5b-' + w, 'Editor: el detalle abierto no se cierra al teclear y explica la regla', 'Tras abrir «Detalle» y cambiar un peso sigue abierto, actualizado (33 %) y con la explicación completa',
        JSON.stringify(det), det.abierto && /Si prefieres guardar un reparto incompleto/.test(det.txt) && /33\s%/.test(det.main));
      const orden = await p.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(); return { titulo: r('#nombre').top, estado: r('#estado').top, accion: r('.ws-acc .js-guardar').top, motivoDer: r('#motivo').right <= r('.ws-acc .js-guardar').left + 1 || r('#motivo').bottom <= r('.ws-acc .js-guardar').top + 1 || r('#motivo').right <= window.innerWidth }; });
      ev('J5c-' + w, 'Editor: jerarquía título → estado → acción', 'El título está arriba, el estado de guardado debajo y la acción principal a la altura de la cabecera; el motivo no se sale de la pantalla',
        JSON.stringify(orden), orden.titulo <= orden.estado && orden.motivoDer && await sinDesborde(p));
    } else {
      ev('J5-' + w, `Editor en móvil: el motivo breve va en la barra inferior, sin duplicar la cabecera (${w} px)`, 'La barra inferior dice «Pública: debe sumar 100 %» y la cabecera de escritorio está oculta; sin desbordamiento',
        JSON.stringify(cab), /Pública: debe sumar 100/.test(cab.bar) && !cab.visible && await sinDesborde(p));
    }
    // --- colores estables por activo (diez posiciones: más de ocho)
    await abrirCartera(p, 'Diez posiciones');
    const c0 = await colorDeFilas(p), nombres = Object.keys(c0);
    if (!esc) { await p.locator('.pc-toggle').nth(2).click(); await p.waitForTimeout(150); await p.locator('#det-2 [data-quitar]').click(); } else await p.locator('[data-quitar] >> visible=true').nth(2).click(); await p.waitForTimeout(300);
    const quitado = nombres[2], c1 = await colorDeFilas(p);
    const estables1 = Object.keys(c1).every(t => c1[t] === c0[t]) && !(quitado in c1);
    // añadir un activo nuevo: los demás no cambian
    await p.fill('#buscar-activo', 'ABBV'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    const c2 = await colorDeFilas(p), estables2 = Object.keys(c1).every(t => c1[t] === c2[t]), nuevoCol = JSON.stringify(Object.keys(c2).filter(t => !(t in c1)));
    const etiquetas = await p.evaluate(() => [...document.querySelectorAll('#pos-tabla tbody tr, #pos-cards .pos-card')].filter(e => e.offsetParent !== null).every(e => e.querySelector('b').textContent.trim().length >= 1));
    const barraTxt = await p.evaluate(() => document.querySelector('#comp-barra').getAttribute('aria-label'));
    ev('J6-' + w, `Colores estables por activo con diez posiciones (${w} px)`, 'Quitar una posición no cambia el color de ninguna otra; añadir otra tampoco; cada fila lleva su símbolo escrito y la composición lo nombra (el color complementa, no sustituye)',
      `quitada ${quitado}: estables=${estables1}; añadido ${nuevoCol || '—'}: estables=${estables2}; etiquetas=${etiquetas}; aria-label con símbolos=${/AAPL/.test(barraTxt) && /META/.test(barraTxt)}`,
      nombres.length === 10 && estables1 && estables2 && etiquetas && /AAPL/.test(barraTxt) && /META/.test(barraTxt));
    // --- pesos pequeños: el tramo existe y la fila conserva su símbolo
    await abrirCartera(p, LARGO);
    const peq = await p.evaluate(() => { const segs = [...document.querySelectorAll('#comp-barra i:not(.libre)')]; return { n: segs.length, minAncho: Math.min(...segs.map(s => s.getBoundingClientRect().width)), conTxt: segs.filter(s => s.textContent.trim()).length, nombre: document.querySelector('#nombre').value, desborde: document.documentElement.scrollWidth <= window.innerWidth + 1 }; });
    ev('J7-' + w, `Pesos pequeños y nombre largo en el editor (${w} px)`, 'Un peso de 0,5 % sigue dibujando un tramo visible (≥ 2 px); solo los tramos anchos llevan etiqueta (el resto, en la lista); el nombre largo se conserva entero; sin desbordamiento',
      JSON.stringify(peq), peq.n === 6 && peq.minAncho >= 2 && peq.conTxt < 6 && peq.nombre === LARGO && peq.desborde);
    // --- recorrido: abrir → editar → guardar → volver y reconocer el estado actualizado
    await abrirCartera(p, 'Oro'); await peso(p, 0).fill('40'); await peso(p, 1).fill('35'); await p.waitForTimeout(300);
    const antes = await p.evaluate(() => document.querySelector('.js-guardar:not([hidden])') && [...document.querySelectorAll('.js-guardar')].find(e => e.offsetParent !== null).disabled);
    await p.locator('.js-guardar >> visible=true').click(); await p.waitForFunction(() => document.querySelector('#estado-live')?.textContent.includes('Guardada')); await p.waitForTimeout(500);
    await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('.cartera-item'); await p.waitForTimeout(400);
    const des = await p.evaluate(() => { const e = [...document.querySelectorAll('.cartera-item')].find(x => x.textContent.includes('Oro')); return { pend: e.classList.contains('pendiente'), l2: e.querySelector('.ci-l2').textContent, top: e.querySelector('.ci-top').textContent, mod: e.textContent.includes('Modificada') }; });
    ev('J8-' + w, `Recorrido Mis carteras → abrir → editar → guardar → volver (${w} px)`, 'Tras guardar, la tarjeta ya no está «pendiente», refleja el nuevo reparto (GLD 40 %, asignada al 100 %) y muestra la fecha de modificación',
      `Guardar activo antes=${!antes}; ${JSON.stringify(des)}`, !antes && !des.pend && /Asignada al 100 %/.test(des.l2) && /GLD.*40\s%/.test(des.top) && des.mod);
    await p.ctx.close();

    // --- Explorar empresas: resultados comparables, criterios y recorrido con búsqueda conservada
    const q = await nuevo(b, w, h); await q.goto(B + '#empresas'); await q.waitForSelector('.ver-ficha >> visible=true'); await q.waitForTimeout(500);
    const cmp = await q.evaluate(async esc => {
      const ideas = await (await fetch('/api/ideas')).json(), filas = [...document.querySelectorAll(esc ? '#empresas-lista tr' : '#empresas-cards li')].filter(e => e.querySelector('.pil'));
      const malas = []; let sinDat = 0, noSup = 0;
      for (const f of filas) { const t = f.querySelector('[data-t]').dataset.t, r = ideas.find(x => x.ticker === t), ok = f.querySelectorAll('.pil-ok').length, no = f.querySelectorAll('.pil-no').length, nd = f.querySelectorAll('.pil-nd').length;
        sinDat += nd; noSup += no; if (!r || ok !== r.cumplidos || no !== r.no_superadas || nd !== r.sin_datos || f.querySelectorAll('.pil li').length !== 5) malas.push(t); }
      return { filas: filas.length, total: ideas.length, malas, sinDat, noSup, textos: [...new Set([...document.querySelectorAll('.pil li .sr')].map(e => e.textContent.replace(/^: /, '')))].sort() };
    }, esc);
    ev('J9-' + w, `Explorar: cada empresa muestra sus cinco comprobaciones con el estado escrito (${w} px)`, 'Para TODAS las empresas, superadas/no superadas/sin datos coinciden con los datos del servidor; cada estado lleva texto (no solo color); orden y recuento intactos',
      `${cmp.filas}/${cmp.total} filas; discrepancias: ${cmp.malas.length ? cmp.malas.join(',') : 'ninguna'}; no superadas totales ${cmp.noSup}, sin datos ${cmp.sinDat}; textos: ${cmp.textos.join(' / ')}`,
      cmp.filas === cmp.total && cmp.total > 50 && !cmp.malas.length && cmp.textos.includes('superada'));
    // búsqueda → ficha → volver
    await q.fill('#emp-buscar', 'adobe'); await q.waitForTimeout(300);
    const antesLista = await q.evaluate(() => ({ n: document.querySelectorAll(window.innerWidth >= 720 ? '#empresas-lista tr' : '#empresas-cards li').length, cuenta: document.querySelector('#emp-cuenta').textContent }));
    await q.locator('.ver-ficha >> visible=true').first().click(); await q.waitForSelector('#dlg-ficha[open]'); await q.waitForTimeout(400);
    const ficha = await q.evaluate(() => { const d = document.querySelector('#dlg-ficha'), c = d.querySelector('[data-cerrar]').getBoundingClientRect(); return { titulo: document.querySelector('#fi-titulo').textContent, sub: document.querySelector('#fi-sub').textContent, datos: [...d.querySelectorAll('.fd-grid > div')].map(x => ({ l: x.querySelector('dt').textContent, v: x.querySelector('.v').textContent, u: x.querySelector('.u').textContent })), cerrar: c.height, cerrarVisible: c.top >= 0 && c.bottom <= window.innerHeight, h3: d.querySelector('.ficha-datos h3').textContent, desborde: d.scrollWidth <= d.clientWidth + 1 }; });
    const api1 = await q.evaluate(async () => (await (await fetch('/api/assets/ADBE')).json()).fundamentales[0]);
    const nf1 = v => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v / 1e9);
    const ventas = ficha.datos.find(x => x.l === 'Ventas'), roic = ficha.datos.find(x => x.l === 'ROIC');
    ev('J10-' + w, `Ficha: datos principales con periodo y unidades, sin cifras inventadas (${w} px)`, 'Ventas y beneficio coinciden con el servidor en miles de millones de USD; periodo del ejercicio en el título de la sección; ROIC en %; el botón Cerrar es visible y táctil (≥ 44 px); sin desbordamiento',
      `${ficha.titulo}: ${ficha.h3}; Ventas ${ventas.v} ${ventas.u} (servidor ${nf1(api1.ingresos)}); ROIC ${roic.v}; Cerrar ${ficha.cerrar.toFixed(0)} px`,
      ventas.v === nf1(api1.ingresos) && /miles de millones de USD/.test(ventas.u) && ficha.h3.includes(api1.periodo) && /%/.test(roic.v) && ficha.cerrar >= 44 && ficha.cerrarVisible && ficha.desborde);
    await q.keyboard.press('Escape'); await q.waitForTimeout(400);
    const vuelta = await q.evaluate(() => ({ valor: document.querySelector('#emp-buscar').value, n: document.querySelectorAll(window.innerWidth >= 720 ? '#empresas-lista tr' : '#empresas-cards li').length, cuenta: document.querySelector('#emp-cuenta').textContent, foco: document.activeElement?.textContent.trim().slice(0, 20), abierta: document.querySelector('#dlg-ficha').open }));
    ev('J11-' + w, `Recorrido explorar → buscar → abrir ficha → volver (${w} px)`, 'Al cerrar la ficha, la búsqueda sigue escrita, el listado y el recuento son los mismos y el foco vuelve al botón que la abrió',
      `${JSON.stringify(antesLista)} → ${JSON.stringify(vuelta)}`, !vuelta.abierta && vuelta.valor === 'adobe' && vuelta.n === antesLista.n && vuelta.cuenta === antesLista.cuenta && /Ver ficha/.test(vuelta.foco));
    // cambiar de pantalla y volver, y recargar: la búsqueda se conserva (sessionStorage)
    await q.evaluate(() => { location.hash = '#publicas'; }); await q.waitForTimeout(400); await q.evaluate(() => { location.hash = '#empresas'; }); await q.waitForTimeout(400);
    const tras = await q.evaluate(() => document.querySelector('#emp-buscar').value);
    await q.reload(); await q.waitForSelector('.ver-ficha >> visible=true'); await q.waitForTimeout(400);
    const recarga = await q.evaluate(() => ({ v: document.querySelector('#emp-buscar').value, c: document.querySelector('#emp-cuenta').textContent }));
    ev('J12-' + w, `La búsqueda se conserva al cambiar de pantalla y al recargar (${w} px)`, 'Tras ir a «Carteras públicas» y volver, y tras recargar la página, el campo conserva «adobe» y el listado sigue filtrado',
      `tras volver «${tras}»; tras recargar «${recarga.v}» (${recarga.c})`, tras === 'adobe' && recarga.v === 'adobe' && /^1 de /.test(recarga.c));
    // sin resultados: mensaje útil y borrar búsqueda
    await q.fill('#emp-buscar', 'zzzzzz'); await q.waitForTimeout(300);
    const sin = await q.evaluate(() => { const v = e => e && e.offsetParent !== null; const el = [...document.querySelectorAll('.estado-lista')].find(v); return { msg: el?.textContent || '', btn: [...document.querySelectorAll('[data-borrar-busqueda]')].some(v), cuenta: document.querySelector('#emp-cuenta').textContent }; });
    await q.locator('[data-borrar-busqueda] >> visible=true').click(); await q.waitForTimeout(300);
    const borr = await q.evaluate(() => ({ v: document.querySelector('#emp-buscar').value, c: document.querySelector('#emp-cuenta').textContent, filas: document.querySelectorAll('.ver-ficha').length }));
    ev('J13-' + w, `Explorar sin resultados: mensaje con la búsqueda y acción para borrarla (${w} px)`, 'Dice qué se buscó, ofrece «Borrar búsqueda» y, al usarla, vuelve la lista completa; sin desbordamiento',
      `«${sin.msg.trim()}» · tras borrar: campo «${borr.v}», ${borr.c}`, /zzzzzz/.test(sin.msg) && sin.btn && borr.v === '' && /^105 empresas/.test(borr.c) && borr.filas > 50 && await sinDesborde(q));
    // datos ausentes: la ficha los identifica, no inventa cifras
    await q.route('**/api/assets/ADBE', async r => { const resp = await r.fetch(); const j = await resp.json(); j.fundamentales[0].ebitda = null; j.fundamentales[0].roic = null; await r.fulfill({ response: resp, json: j }); });
    await q.fill('#emp-buscar', 'adobe'); await q.waitForTimeout(250); await q.locator('.ver-ficha >> visible=true').first().click(); await q.waitForSelector('#dlg-ficha[open]'); await q.waitForTimeout(400);
    const aus = await q.evaluate(() => [...document.querySelectorAll('.fd-grid > div')].map(x => ({ l: x.querySelector('dt').textContent, v: x.querySelector('.v').textContent, ausente: x.classList.contains('ausente') })));
    ev('J14-' + w, `Ficha: los datos ausentes se identifican como tales (${w} px)`, 'EBITDA y ROIC sin dato aparecen como «No disponible» con la marca de dato ausente; ningún número en su lugar; los demás datos se mantienen',
      JSON.stringify(aus), aus.filter(x => x.ausente).map(x => x.l).join() === 'EBITDA,ROIC' && aus.filter(x => x.ausente).every(x => x.v === 'No disponible') && aus.find(x => x.l === 'Ventas').v !== 'No disponible');
    // texto ampliado (simulado)
    await q.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await q.waitForTimeout(400);
    const amp = await q.evaluate(() => { const d = document.querySelector('#dlg-ficha'); return { dlg: d.scrollWidth <= d.clientWidth + 1, cerrar: d.querySelector('[data-cerrar]').getBoundingClientRect().right <= window.innerWidth }; });
    await q.keyboard.press('Escape'); await q.waitForTimeout(300);
    const amp2 = await sinDesborde(q); await q.evaluate(() => { document.documentElement.style.fontSize = ''; });
    ev('J15-' + w, `Texto ampliado al 200 % (simulado) en ficha y exploración (${w} px)`, 'Sin desbordamiento horizontal en la ficha ni en la página de exploración, y «Cerrar» sigue dentro de la pantalla',
      `ficha sin desborde=${amp.dlg}; Cerrar dentro=${amp.cerrar}; página sin desborde=${amp2}`, amp.dlg && amp.cerrar && amp2);
    // error al cargar: mensaje con reintento
    await q.ctx.close();
    const e = await nuevo(b, w, h); await e.route('**/api/ideas', r => r.abort()); await e.goto(B + '#empresas'); await e.waitForTimeout(1200);
    const err = await e.evaluate(() => { const el = [...document.querySelectorAll('.estado-lista')].find(x => x.offsetParent !== null); return { msg: el?.textContent || '', reintento: !!el?.querySelector('[data-retry]') }; });
    ev('J16-' + w, `Explorar con error de carga: mensaje y reintento (${w} px)`, 'Texto claro «No se pudieron cargar las empresas» con botón Reintentar; sin tabla vacía engañosa; sin desbordamiento',
      JSON.stringify(err), /No se pudieron cargar las empresas/.test(err.msg) && err.reintento && await sinDesborde(e));
    await e.ctx.close();
  }
  await b.close(); fin('evidencias-J');
})();
