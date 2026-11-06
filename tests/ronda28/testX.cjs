// Batería X (ronda 28, fase 1 del plan): claridad y lenguaje. Servidor real, datos ficticios, 1440 / 390 / 320 px.
//   X1 portada: UN botón principal visible («Crear desde cero») que abre el editor vacío; las tres entradas siguen como alternativas; enlace a «Cómo funciona»
//   X2 una sola palabra: ningún texto visible dice «portafolio» en las pantallas principales
//   X3 editor: «Reparte a partes iguales» deja los pesos iguales sumando 100 % y desaparece cuando ya están iguales
//   X4 revisión: tres indicadores con semáforo (Concentración, Variedad, Datos) con el nivel esperado
//   X5 laboratorio: «Del resto de posiciones» elegido por defecto y la pregunta llana «¿De dónde sale el peso?»
//   X6 Explorar: glosario al pulsar y filtro «Solo sectores que no tengo»
//   X7 «Cómo funciona Klever»: cuatro pasos · X0 sin errores ni desbordes
const { chromium, B, ev, nuevo, fin, revision } = require('../ronda5/h.cjs');
const J = JSON.stringify;
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
    const sinDesborde = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    const desbordes = [];
    // ---- X1
    await p.goto(B + '#inicio'); await p.waitForSelector('.hero'); await p.waitForTimeout(400);
    const x1 = await p.evaluate(() => { const v = e => !!e && e.offsetParent !== null; return { probar: v(document.querySelector('#probar')), texto: document.querySelector('#probar').textContent.trim(), primario: document.querySelector('#probar').classList.contains('btn-primario'),
      entradas: [...document.querySelectorAll('.entrada')].filter(v).length, primariosVisibles: [...document.querySelectorAll('#vista-inicio .btn-primario')].filter(v).length, como: v(document.querySelector('#vista-inicio a[href="#como-funciona"]')) }; });
    if (!(await sinDesborde())) desbordes.push('portada');
    await p.click('#probar'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(400);
    const vacio = await p.evaluate(() => document.querySelectorAll('.peso-in').length === 0);
    ev('X1-' + w, `Portada (${w} px): un único botón principal visible que abre el editor vacío; las tres entradas siguen; enlace a «Cómo funciona»`, '#probar visible, primario, «Crear desde cero»; 1 botón primario visible en la portada; 3 entradas; editor sin posiciones al pulsarlo', J({ x1, vacio }),
      x1.probar && x1.primario && x1.texto === 'Crear desde cero' && x1.primariosVisibles === 1 && x1.entradas === 3 && x1.como && vacio);

    // ---- X3 reparto igual (con la plantilla Crecimiento: 17 + 5 × 16,6)
    await p.goto(B + '#inicio'); await p.waitForSelector('.plantilla'); await p.click('[data-plantilla="riesgo"]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(400);
    const antes3 = await p.evaluate(() => !document.querySelector('#repartir-igual').hidden);
    await p.click('#repartir-igual'); await p.waitForTimeout(300);
    const x3 = await p.evaluate(() => ({ pesos: [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => e.value), total: document.querySelector('#comp-total').textContent, oculto: document.querySelector('#repartir-igual').hidden }));
    ev('X3-' + w, `Reparte a partes iguales (${w} px)`, 'visible con pesos distintos; tras pulsar: 16,7 ×4 y 16,6 ×2, total 100 %, y el botón se oculta', J({ antes3, x3 }),
      antes3 && J(x3.pesos) === J(['16,7', '16,7', '16,7', '16,7', '16,6', '16,6']) && /100/.test(x3.total) && x3.oculto);
    if (!(await sinDesborde())) desbordes.push('editor');

    // ---- X4 indicadores en la revisión (Crecimiento repartido: 3 categorías)
    await revision(p); await p.waitForSelector('#nota-cuerpo .ind'); await p.waitForTimeout(300);
    const x4 = await p.evaluate(() => [...document.querySelectorAll('#nota-cuerpo .ind')].map(i => [i.querySelector('.ind-etq').textContent.trim(), i.className.match(/ind-(\w+)$/)?.[1], i.querySelector('b').textContent]));
    ev('X4-' + w, `Revisión (${w} px): tres indicadores en lenguaje llano con semáforo`, 'Concentración baja (16,7 %), Variedad media (3 categorías), Datos con un valor', J(x4),
      x4.length === 3 && x4[0][0] === 'Concentración' && x4[0][1] === 'ok' && x4[1][0] === 'Variedad' && x4[1][1] === 'medio' && x4[2][0] === 'Datos' && ['Completos', 'Parciales', 'Escasos', 'Calculando'].includes(x4[2][2]));
    if (!(await sinDesborde())) desbordes.push('revisión');

    // ---- X5 laboratorio
    await p.evaluate(() => { location.hash = '#laboratorio'; }); await p.waitForSelector('#lab-form'); await p.waitForTimeout(300);
    const x5 = await p.evaluate(() => ({ fin: document.querySelector('input[name=lab-fin]:checked')?.value, leyenda: [...document.querySelectorAll('#lab-form legend')].map(l => l.textContent.trim())[2], primera: document.querySelector('input[name=lab-fin]').value }));
    await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res .lab-res');
    const sim5 = await p.evaluate(() => !!document.querySelector('#lab-res .lab-res:not(.inviable)'));
    ev('X5-' + w, `Laboratorio (${w} px): opción por defecto y pregunta llana`, '«Del resto de posiciones» marcada y primera; leyenda «3 · ¿De dónde sale el peso?»; se simula sin elegir nada más', J({ x5, sim5 }),
      x5.fin === 'proporcional' && x5.primera === 'proporcional' && x5.leyenda === '3 · ¿De dónde sale el peso?' && sim5);
    if (!(await sinDesborde())) desbordes.push('laboratorio');

    // ---- X6 Explorar: glosario y «sectores que no tengo» (el borrador tiene Tecnología, Consumo discrecional y Comunicaciones)
    await p.evaluate(() => { location.hash = '#empresas'; }); await p.waitForSelector('#vista-empresas:not([hidden])'); await p.waitForTimeout(500);
    await p.click('[data-glosa="roic"]'); await p.waitForTimeout(150);
    const glosa = await p.evaluate(() => ({ visible: !document.querySelector('#glosa').hidden, txt: document.querySelector('#glosa').textContent, pulsado: document.querySelector('[data-glosa="roic"]').getAttribute('aria-pressed') }));
    if (!(await p.evaluate(() => document.querySelector('#emp-filtros-det').open))) await p.click('#emp-filtros-det > summary');
    const total6 = await p.evaluate(() => document.querySelector('#emp-cuenta').textContent);
    await p.check('#emp-faltan'); await p.waitForTimeout(300);
    const x6 = await p.evaluate(() => { const filas = [...document.querySelectorAll('#empresas-lista tr')].filter(t => t.offsetParent !== null), cards = [...document.querySelectorAll('#empresas-cards li')].filter(t => t.offsetParent !== null);
      const sect = filas.length ? filas.map(tr => tr.querySelector('.col-sector')?.textContent.trim()) : cards.map(li => li.textContent);
      return { n: filas.length || cards.length, cuenta: document.querySelector('#emp-cuenta').textContent, conMios: sect.some(s => /Tecnología|Comunicaciones|Consumo discrecional/.test(s || '')) }; });
    await p.uncheck('#emp-faltan'); await p.evaluate(() => sessionStorage.removeItem('klever_filtros_emp'));
    ev('X6-' + w, `Explorar (${w} px): glosario al pulsar y filtro «Solo sectores que no tengo»`, 'ROIC explicado en palabras llanas; el filtro deja empresas y ninguna de Tecnología, Comunicaciones ni Consumo discrecional', J({ glosa, total6, x6 }),
      glosa.visible && /cuánto gana la empresa/.test(glosa.txt) && glosa.pulsado === 'true' && x6.n > 0 && !x6.conMios && x6.cuenta !== total6);
    if (!(await sinDesborde())) desbordes.push('explorar');

    // ---- X7 Cómo funciona
    await p.evaluate(() => { location.hash = '#como-funciona'; }); await p.waitForSelector('#vista-como-funciona:not([hidden])'); await p.waitForTimeout(300);
    const x7 = await p.evaluate(() => ({ pasos: [...document.querySelectorAll('.como li b')].map(b => b.textContent), titulo: document.title }));
    ev('X7-' + w, `«Cómo funciona Klever» (${w} px)`, 'cuatro pasos: qué hace, qué no hace, datos, qué guardamos', J(x7), J(x7.pasos) === J(['Qué hace', 'Qué no hace', 'De dónde salen los datos', 'Qué guardamos']) && /Cómo funciona/.test(x7.titulo));
    if (!(await sinDesborde())) desbordes.push('cómo funciona');

    // ---- X2 una sola palabra (texto visible de las pantallas principales)
    const vistas = ['#inicio', '#empresas', '#seguimiento', '#laboratorio', '#como-funciona', '#cartera'], con = [];
    for (const v of vistas) { await p.evaluate(h => { location.hash = h; }, v); await p.waitForTimeout(500); if (await p.evaluate(() => /portafolio/i.test(document.body.innerText))) con.push(v); }
    ev('X2-' + w, `Una sola palabra (${w} px): ninguna pantalla principal dice «portafolio»`, 'ninguna', J(con), con.length === 0);

    ev('X0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún pageerror; ninguna pantalla más ancha que la ventana', J({ errs, desbordes }), errs.length === 0 && desbordes.length === 0);
    await p.ctx.close();
  }
  await b.close(); await fin('evidencias-X28');
})().catch(async e => { console.log('FALLA (excepción)', e.message); process.exitCode = 1; await fin('evidencias-X28'); });
