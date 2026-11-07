// Batería AB (ronda 30, punto 14): «Tu semana» con memoria en el servidor. Servidor real, datos ficticios, 1440 / 390 / 320 px.
//   AB1 primera visita: la evolución «aparecerá cuando vuelvas la semana que viene», hay reto de la semana y la foto de esta semana queda en el servidor
//   AB2 con una semana anterior (escrita en la base local como si la persona hubiera venido hace 7 días): «Tu evolución» con Alta → Baja (mejora) y «Desde la semana del…»
//   AB3 la ficha de una idea dice qué ha cambiado en los datos desde que la guardaste (con la foto que hizo el servidor); «Mira atrás» en «Tu semana» con una idea de hace 40 días
//   AB4 al salir, «Tu semana» (evolución incluida) desaparece de la página
//   AB0 sin errores ni desbordes
// La semana anterior y la antigüedad de la idea se escriben DIRECTAMENTE en la base local de pruebas (node:sqlite): no hay otra forma de «esperar una semana».
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const fs = require('fs'), path = require('path');
const J = JSON.stringify;
const RAIZ = path.resolve(__dirname, '..', '..');
const baseLocal = () => { const d = path.join(RAIZ, '.wrangler/pruebas-auto/v3/d1/miniflare-D1DatabaseObject'); const f = fs.readdirSync(d).filter(x => x.endsWith('.sqlite') && x !== 'metadata.sqlite'); if (f.length !== 1) throw new Error('base local no encontrada: ' + f); return path.join(d, f[0]); };
const sql = (q, ...a) => { const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(baseLocal()); try { return /^\s*SELECT/i.test(q) ? db.prepare(q).all(...a) : db.prepare(q).run(...a); } finally { db.close(); } };
const isoUtc = ms => new Date(ms).toISOString().slice(0, 10);
(async () => {
  process.removeAllListeners('warning');
  const b = await chromium.launch();
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, ruta, body]);
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const aCarteras = async p => { await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForTimeout(200); await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#tu-semana:not([hidden]) .reto'); await p.waitForTimeout(400); };
  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = [], desb = []; p.on('pageerror', e => errs.push(e.message));
    const mira = async n => { if (!(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))) desb.push(n); };
    await entrarCon(p, mail('AB' + w));
    // ---- AB1 primera visita: cartera repartida (concentración baja, variedad amplia)
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Repartida AB', plantilla: 'riesgo', posiciones: [{ ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }, { ticker: 'NVDA', peso: 20 }, { ticker: 'JPM', peso: 20 }] })).j;
    await aCarteras(p);
    const ab1 = await p.evaluate(() => ({ vacia: document.querySelector('.evo-vacia')?.textContent, evo: document.querySelectorAll('.evo').length, reto: document.querySelector('.reto-sem .reto-sem-t')?.textContent.trim(), cambia: document.querySelector('.reto-sem-cab .mut')?.textContent, local: localStorage.getItem('klever_semana') }));
    const uid = sql('SELECT usuario_id FROM portafolios WHERE id = ?', c.id)[0].usuario_id, f1 = sql('SELECT semana, concentracion, variedad, n_categorias FROM instantaneas WHERE usuario_id = ?', uid);
    ev('AB1-' + w, `Primera visita a «Tu semana» (${w} px)`, 'sin evolución todavía («aparecerá cuando vuelvas la semana que viene»); un reto de la semana con «cambia el…»; la foto de esta semana en el servidor (Baja/Amplia, 5 categorías) y nada en el dispositivo',
      J({ ab1, f1 }), /semana que viene/.test(ab1.vacia || '') && ab1.evo === 0 && !!ab1.reto && /cambia el/.test(ab1.cambia || '') && ab1.local === null && f1.length === 1 && f1[0].concentracion === 'ok' && f1[0].variedad === 'ok' && f1[0].n_categorias === 5);
    await mira('primera visita');
    // ---- AB2 una semana anterior con la cartera concentrada (escrita en la base como si hubiera venido hace 7 días)
    const semAnt = isoUtc(Date.parse(f1[0].semana + 'T00:00:00Z') - 7 * 864e5);
    sql(`INSERT INTO instantaneas(usuario_id,cartera_id,semana,concentracion,variedad,n_categorias,senales) VALUES (?,?,?,'alto','medio',3,?)`, uid, c.id, semAnt, J([{ id: 'posicion', nivel: 'alerta', titulo: 'NVDA pesa el 60 %' }]));
    await aCarteras(p);
    const ab2 = await p.evaluate(() => ({ titulo: document.querySelector('.evo-titulo')?.textContent, cab: document.querySelector('.evo-cab')?.textContent.replace(/\s+/g, ' ').trim(), filas: [...document.querySelectorAll('.evo-fila')].map(f => f.textContent.replace(/\s+/g, ' ').trim()),
      mejora: document.querySelectorAll('.evo-txt.evo-mejora').length, puntos: document.querySelectorAll('.evo-fila:first-child .evo-p').length, desde: document.querySelector('.sem-desde')?.textContent, cambios: [...document.querySelectorAll('.sem-cambios li')].map(l => l.textContent.replace(/\s+/g, ' ').trim()) }));
    ev('AB2-' + w, `Con una semana anterior: evolución y cambios (${w} px)`, '«Tu evolución» con «Repartida AB · desde hace 1 semana»; Concentración «Alta → Baja» y Variedad «Media → Amplia», las dos «mejora», con 2 puntos; «Desde la semana del…» con «✓ Ya no: NVDA pesa el 60 %»',
      J(ab2), /Tu evolución/.test(ab2.titulo || '') && /Repartida AB/.test(ab2.cab) && /hace 1 semana/.test(ab2.cab) && ab2.filas.some(f => /Concentración.*Alta → Baja/.test(f)) && ab2.filas.some(f => /Variedad.*Media → Amplia/.test(f)) && ab2.mejora === 2 && ab2.puntos === 2
      && /^Desde la semana del/.test(ab2.desde || '') && ab2.cambios.some(t => /Ya no: NVDA pesa el 60 %/.test(t)));
    await p.locator('#tu-semana').screenshot({ path: path.resolve(RAIZ, process.env.RONDA || 'ronda30', 'evidencias', `AB2-semana-${w}.png`) }).catch(() => {});
    await mira('evolución');
    // ---- AB3 ciclo de la idea: el servidor hace la foto; se envejece y se cambia un dato de KO en la base
    const cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    const { simular } = await import(require('url').pathToFileURL(path.join(RAIZ, 'public/js/calculos.js')).href);   // la propuesta, con el mismo módulo que la app y el servidor
    const base = cart.posiciones.map(x => ({ ticker: x.ticker, peso: x.peso })), propuesta = simular(base, { ticker: 'KO', peso: 10 }, 'proporcional').despues;
    const rIdea = await api(p, 'POST', '/escenarios', { clave: 'ab-' + w + '-' + Date.now(), nombre: 'Idea AB', pregunta: '¿Mejora el ROIC de KO?', cartera_id: c.id, base_revision: cart.revision, ticker: 'KO', peso: 10, financiacion: 'proporcional', propuesta });
    const idea = rIdea.j; if (rIdea.s !== 201) throw new Error('no se guardó la idea: ' + J(rIdea));
    const koAntes = sql("SELECT criterios_cumplidos FROM ideas WHERE ticker = 'KO'")[0].criterios_cumplidos, ko = JSON.parse(koAntes);
    const fotoKO = idea.foto_datos?.empresas?.KO;
    const nuevoRoic = ko.roic?.ok === true ? false : true;
    sql("UPDATE ideas SET criterios_cumplidos = ? WHERE ticker = 'KO'", J({ ...ko, roic: { ...(ko.roic || {}), ok: nuevoRoic } }));
    sql('UPDATE escenarios SET foto_datos = json_set(foto_datos, \'$.fecha\', ?) WHERE id = ?', isoUtc(Date.now() - 40 * 864e5), idea.id);
    await p.reload(); await p.waitForTimeout(800);   // «volver más tarde»: los datos de hoy se leen al volver (la app los guarda como mucho un minuto)
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, idea.id); await p.waitForSelector('#esc-ciclo .ciclo-lista', { timeout: 10000 }); await p.waitForTimeout(200);
    const ficha = await p.evaluate(() => ({ txt: document.querySelector('#esc-ciclo').textContent.replace(/\s+/g, ' ').trim(), cambio: document.querySelector('#esc-ciclo .ciclo-c')?.textContent }));
    await p.locator('#esc-ciclo').screenshot({ path: path.resolve(RAIZ, process.env.RONDA || 'ronda30', 'evidencias', `AB3-ciclo-${w}.png`) }).catch(() => {});
    await mira('ficha de la idea');
    await p.goto(B + '#carteras'); await p.waitForSelector('#tu-semana:not([hidden]) .mira', { timeout: 10000 });
    await p.locator('#tu-semana').screenshot({ path: path.resolve(RAIZ, process.env.RONDA || 'ronda30', 'evidencias', `AB3-mira-${w}.png`) }).catch(() => {});
    const miraTxt = await p.evaluate(() => document.querySelector('.mira').textContent.replace(/\s+/g, ' ').trim());
    sql("UPDATE ideas SET criterios_cumplidos = ? WHERE ticker = 'KO'", koAntes);   // la base compartida vuelve a su estado
    ev('AB3-' + w, `Cerrar el ciclo de una idea (${w} px)`, 'foto hecha por el servidor (KO con sus 5 comprobaciones); en la ficha: «La guardaste hace 40 días… 1 comprobación ha cambiado» y «ROIC: … → …»; en «Tu semana», «Mira atrás: hace 40 días guardaste «Idea AB» (¿Mejora el ROIC de KO?)» con el cambio de KO',
      J({ fotoKO, ficha, miraTxt }), !!fotoKO?.c && Object.keys(fotoKO.c).length === 5 && /hace 40 días/.test(ficha.txt) && /1 comprobación ha cambiado/.test(ficha.txt) && /^ROIC: (no superada → superada|superada → no superada)$/.test(ficha.cambio || '')
      && /Mira atrás: hace 40 días guardaste «Idea AB» \(¿Mejora el ROIC de KO\?\)/.test(miraTxt) && /KO.*ROIC/.test(miraTxt));
    await mira('mira atrás');
    // ---- AB4 privacidad al salir
    await p.click('#salir >> visible=true').catch(async () => { await p.evaluate(() => document.querySelector('#salir')?.click()); });
    await p.waitForTimeout(800);
    const tras = await p.evaluate(() => ({ oculta: document.querySelector('#tu-semana')?.hidden, evo: document.querySelectorAll('.evo, .mira, .reto-sem').length, nombre: document.body.innerText.includes('Repartida AB') }));
    ev('AB4-' + w, `Al salir, «Tu semana» desaparece (${w} px)`, 'oculta; sin evolución, «Mira atrás» ni reto en la página; sin el nombre de la cartera', J(tras), tras.oculta === true && tras.evo === 0 && !tras.nombre);
    ev('AB0-' + w, `Sin errores ni desbordes (${w} px)`, 'ningún error de JavaScript; ancho de página = ventana', J({ errs, desb }), !errs.length && !desb.length);
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-AB30');
})();
