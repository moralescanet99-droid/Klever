// Batería T (ronda 22): el CUADERNO y la RECUPERACIÓN del registro de revisiones en el NAVEGADOR (cliente + servidor real con SQLite). Casos de la revisión de la ronda 21 (tabla D) vistos como los ve la persona:
//   «Para revisar» primero y una tarjeta por escenario · registrar desde el Cuaderno · respuesta perdida (el servidor guarda y el navegador no lo sabe) · lectura posterior fallida · texto modificado con un envío incierto ·
//   dos pestañas con versión antigua · revisión personal con historia editorial (estados independientes) · archivar y descartar · base intacta. En 1440, 390 y 320 px. Datos FICTICIOS. Uso: node tests/ronda22/testT.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', process.env.RONDA || 'ronda22', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch(); const DLG = [], DLGMAL = [];
  const dialogo = d => { if (d.type() === 'beforeunload') { DLG.push('beforeunload'); d.accept().catch(() => {}); } else { DLGMAL.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); } };
  const api = (p, m, ruta, body) => p.evaluate(async ([m, ruta, body]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body]);
  const hoy = (d = 0) => { const x = new Date(); x.setDate(x.getDate() + d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const entrarCon = async (p, email) => { await p.goto(B); await p.waitForSelector('#entrar'); await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(800); };
  const txt = (p, s) => p.evaluate(s => document.querySelector(s)?.textContent.replace(/\s+/g, ' ').trim() ?? '', s);
  const filas = (p, id) => api(p, 'GET', `/escenarios/${id}`).then(r => r.j.revisiones || []);
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const abrirCuaderno = async p => { await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios .esc-item, #seg-escenarios .vacio-util'); await p.waitForFunction(() => !document.querySelector('#seg-escenarios').textContent.includes('Cargando')); await p.waitForTimeout(300); };

  for (const [w, h] of [[1440, 900], [390, 780], [320, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo);
    const posts = []; p.on('request', r => { if (r.method() === 'POST' && /\/revisiones$/.test(r.url())) posts.push(r.postData()); });
    await entrarCon(p, mail('T' + w));
    const c = (await api(p, 'POST', '/portfolios', { nombre: 'Mi cartera T', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }] })).j, cart = (await api(p, 'GET', '/portfolios/' + c.id)).j;
    const crea = (clave, extra) => api(p, 'POST', '/escenarios', { clave, nombre: 'Idea ' + clave.slice(-3), cartera_id: c.id, base_revision: cart.revision, ticker: 'JNJ', peso: 10, financiacion: 'proporcional', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'JNJ', peso: 10 }], ...extra });
    const A = (await crea('t-toca-' + w + '-aaa', { pregunta: '¿Aporta JNJ estabilidad?', revisar_en: hoy(-1), invalidacion: 'Si JNJ recorta el dividendo' })).j;
    const Bq = (await crea('t-prox-' + w + '-bbb', { pregunta: '¿Y si pesara un 5 %?', revisar_en: hoy(30) })).j;
    const Cq = (await crea('t-sinf-' + w + '-ccc', { pregunta: '¿Merece la pena mirar PG?' })).j;
    const D = (await crea('t-edit-' + w + '-ddd', { pregunta: '¿Se han firmado los dos contratos anunciados?', historia: 'hidrogeno-norte', pregunta_ref: 'hidrogeno-norte:1', revisar_en: hoy(2), ticker: 'HNORT', propuesta: [{ ticker: 'KO', peso: 54 }, { ticker: 'PG', peso: 36 }, { ticker: 'HNORT', peso: 10 }] })).j;
    const baseAntes = J((await api(p, 'GET', '/portfolios/' + c.id)).j.posiciones.map(x => [x.ticker, x.peso]));

    // ---- T1. «Para revisar» primero y una tarjeta por escenario
    await abrirCuaderno(p); await p.screenshot({ path: CAP + `T1-cuaderno-pendiente-${w}-viewport.png` });
    const cu = await p.evaluate(() => ({ grupos: [...document.querySelectorAll('#seg-escenarios .seg-grupo h3')].map(g => g.textContent.replace(/\s+/g, ' ').trim()), tarjetas: document.querySelectorAll('#seg-escenarios .esc-item').length, casos: document.querySelectorAll('#seg-casos .caso').length, casosOculto: !!document.querySelector('#seg-casos')?.closest('.seg-bloque').hidden,
      primera: (() => { const e = document.querySelector('#seg-escenarios .esc-item'), r = e.getBoundingClientRect(); return { top: Math.round(r.top), t: e.textContent.replace(/\s+/g, ' ').trim(), acc: !!e.querySelector('[data-registrar]') }; })(), alto: innerHeight, primerBloque: document.querySelector('.seg-col > .seg-bloque:not([hidden]) h2')?.textContent.trim() }));
    ev('T1-' + w, `Cuaderno (${w} px): «Para revisar» primero, UNA tarjeta por escenario y la acción de registrar a la vista`, 'Grupos «Para revisar», «Próximas revisiones» y «Sin fecha» en ese orden; 4 tarjetas para 4 escenarios (sin tarjeta editorial repetida); la primera tarjeta está dentro del viewport y trae «Registrar revisión»', J(cu),
      /Para revisar/.test(cu.grupos[0]) && /Próximas/.test(cu.grupos[1]) && /Sin fecha/.test(cu.grupos[2]) && cu.tarjetas === 4 && cu.casos === 0 && cu.casosOculto && cu.primera.top < cu.alto && cu.primera.acc && /Toca revisar/.test(cu.primera.t) && /^Mis escenarios/.test(cu.primerBloque) && await sinDesborde(p));

    // ---- T2. «Registrar revisión» desde el Cuaderno lleva al formulario, con el foco
    await p.locator('#seg-escenarios .esc-toca [data-registrar]').first().click(); await p.waitForSelector('#rev-form', { state: 'visible' }); await p.waitForTimeout(400);
    const dest = await p.evaluate(() => ({ foco: document.activeElement?.id, abierto: document.querySelector('#rev-det').open, hash: location.hash }));
    await p.screenshot({ path: CAP + `T2-formulario-revision-${w}-viewport.png` });
    const radios = await p.evaluate(() => [...document.querySelectorAll('.rev-decision input[type=radio]')].map(r => Math.round(r.getBoundingClientRect().height)));
    ev('T2b-' + w, `Formulario de revisión (${w} px): los botones de opción tienen un tamaño normal`, 'Las tres opciones miden ≤ 24 px de alto (antes heredaban el campo de 44 px y salían como un círculo enorme)', J(radios), radios.length === 3 && radios.every(h => h <= 24));
    ev('T2-' + w, `Registrar desde el Cuaderno (${w} px)`, 'Abre la ficha de la idea con el formulario ya abierto y el foco en «Tu observación»', J(dest), dest.foco === 'rev-obs' && dest.abierto && dest.hash === '#escenario-' + A.id);

    // ---- T3. respuesta PERDIDA: el servidor guarda y el navegador no lo sabe → incierto, sin afirmar «no guardado»; el texto cambia; el reintento envía EL MISMO envío
    let perder = true; await p.route(`**/api/escenarios/${A.id}/revisiones`, async route => { if (perder && route.request().method() === 'POST') { perder = false; await route.fetch(); return route.abort('failed'); } return route.continue(); });
    await p.fill('#rev-obs', 'Observación del primer envío'); await p.fill('#rev-apr', 'Aprendizaje A'); posts.length = 0; await p.click('#rev-btn'); await p.waitForSelector('#rev-estado .rev-aviso'); await p.waitForTimeout(300);
    const t3a = { aviso: await txt(p, '#rev-estado'), boton: await txt(p, '#rev-btn'), filas: (await filas(p, A.id)).length, obs: await p.inputValue('#rev-obs') };
    await p.screenshot({ path: CAP + `T3-recuperacion-incierto-${w}-viewport.png` });
    // la persona sigue escribiendo: ese texto NUEVO no puede darse por guardado
    await p.fill('#rev-obs', 'Observación del primer envío + texto NUEVO escrito después');
    // y el siguiente GET (la relectura tras un 200 «duplicado») falla una vez
    let caerLeer = true; await p.route(`**/api/escenarios/${A.id}`, async route => { if (caerLeer && route.request().method() === 'GET') { caerLeer = false; return route.abort('failed'); } return route.continue(); });
    await p.click('#rev-btn'); await p.waitForSelector('#rev-estado .rev-aviso'); await p.waitForTimeout(300);
    const t3b = { aviso: await txt(p, '#rev-estado'), boton: await txt(p, '#rev-btn'), filas: await filas(p, A.id), posts: posts.map(x => JSON.parse(x)), obs: await p.inputValue('#rev-obs') };
    await p.screenshot({ path: CAP + `T3-recuperacion-vista-pendiente-${w}-viewport.png` });
    const antesPosts = posts.length; await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1); await p.waitForTimeout(300);
    const t3c = { aviso: await txt(p, '#rev-estado'), items: await p.evaluate(() => [...document.querySelectorAll('.esc-rev-lista > li')].map(l => l.textContent.replace(/\s+/g, ' ').trim())), obs: await p.inputValue('#rev-obs'), nuevosPosts: posts.length - antesPosts, filas: await filas(p, A.id) };
    ev('T3-' + w, `Respuesta perdida, relectura fallida y texto modificado (${w} px)`, 'Primero «no hemos podido confirmar» (sin decir «no se ha registrado nada»; el servidor ya tiene 1 fila); con texto nuevo escrito, reintentar envía EL MISMO envío (mismo contenido y clave) y, al fallar la relectura, dice que SÍ está guardada y ofrece «Actualizar la vista»; recuperar la vista NO hace otro POST; al final 1 sola revisión visible con el texto del primer envío, y el texto nuevo sigue en el formulario sin enviar',
      J({ t3a, t3b: { ...t3b, posts: t3b.posts.length }, t3c }),
      /No hemos podido confirmar/.test(t3a.aviso) && !/no se ha registrado nada/i.test(t3a.aviso) && /Reintentar el mismo envío/.test(t3a.boton) && t3a.filas === 1 && t3a.obs === 'Observación del primer envío'
      && /SÍ está guardada/.test(t3b.aviso) && /Actualizar la vista/.test(t3b.boton) && t3b.filas.length === 1 && t3b.filas[0].observacion === 'Observación del primer envío' && t3b.posts.length === 2 && t3b.posts[0].clave === t3b.posts[1].clave && t3b.posts.every(x => x.observacion === 'Observación del primer envío') && /texto NUEVO/.test(t3b.obs)
      && t3c.nuevosPosts === 0 && t3c.items.length === 1 && /Observación del primer envío/.test(t3c.items[0]) && !/texto NUEVO/.test(t3c.items[0]) && /texto NUEVO/.test(t3c.obs) && t3c.filas.length === 1 && await sinDesborde(p));

    // ---- T4. dos pestañas con versión antigua: no se pisa, no se dice «no guardado» sin saberlo y el texto se conserva
    const p2 = await p.ctx.newPage(); await p2.goto(B + '#escenario-' + A.id); await p2.waitForSelector('#rev-form', { state: 'attached' }); if (!(await p2.evaluate(() => document.querySelector('#rev-det').open))) await p2.locator('#rev-det > summary').click(); await p2.fill('#rev-obs', 'Desde la otra pestaña'); await p2.click('#rev-btn'); await p2.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 2); await p2.close();
    await p.fill('#rev-obs', 'Mi texto desde la pestaña antigua'); await p.click('#rev-btn'); await p.waitForSelector('#rev-estado .rev-aviso'); await p.waitForTimeout(500);
    const t4a = { aviso: await txt(p, '#rev-estado'), obs: await p.inputValue('#rev-obs'), items: await p.evaluate(() => document.querySelectorAll('.esc-rev-lista > li').length), filas: (await filas(p, A.id)).length };
    await p.screenshot({ path: CAP + `T4-conflicto-${w}-viewport.png` });
    await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 3); await p.waitForTimeout(300);
    const t4b = { filas: (await filas(p, A.id)).map(x => x.observacion) };
    ev('T4-' + w, `Dos pestañas con versión antigua (${w} px)`, 'La segunda pestaña recibe «cambió en otra pestaña»; NO afirma «no se ha registrado nada» sin base, conserva el texto, ya muestra la versión actual (2 revisiones) y, al pulsar de nuevo, añade la tercera sin pisar ninguna', J({ t4a, t4b }),
      /cambió en otra pestaña/.test(t4a.aviso) && /tu texto sigue aquí/.test(t4a.aviso) && t4a.obs === 'Mi texto desde la pestaña antigua' && t4a.items === 2 && t4a.filas === 2 && t4b.filas.length === 3 && t4b.filas.includes('Desde la otra pestaña') && t4b.filas.includes('Mi texto desde la pestaña antigua'));

    // ---- T5. revisión personal con historia editorial: los dos estados son independientes
    await abrirCuaderno(p); const antesD = N(await p.evaluate(id => [...document.querySelectorAll('#seg-escenarios .esc-item')].find(e => e.querySelector(`[data-registrar="${id}"]`))?.textContent || '', D.id));
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, D.id); await p.waitForSelector('#rev-form', { state: 'attached' }); if (!(await p.evaluate(() => document.querySelector('#rev-det').open))) await p.locator('#rev-det > summary').click(); await p.fill('#rev-obs', 'Mi comentario personal sobre D'); await p.check('#rev-dec-r'); await p.fill('#rev-prox', hoy(20)); await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1); await p.waitForTimeout(300);
    const fichaD = N(await txt(p, '#lab-cuerpo')); await abrirCuaderno(p); const despuesD = N(await p.evaluate(id => [...document.querySelectorAll('#seg-escenarios .esc-item')].find(e => e.querySelector(`[data-registrar="${id}"]`))?.textContent || '', D.id));
    await p.screenshot({ path: CAP + `T5-cuaderno-revisado-${w}-viewport.png` });
    const edAntes = (antesD.match(/Respuesta editorial:[^.]*\./) || [''])[0], edDespues = (despuesD.match(/Respuesta editorial:[^.]*\./) || [''])[0];
    ev('T5-' + w, `Revisión personal con historia editorial (${w} px)`, 'Tras registrar una revisión personal, la tarjeta dice «1 revisión personal registrada» y la nueva fecha; la «Respuesta editorial» es IDÉNTICA a la de antes (no se resuelve ni se verifica por un comentario personal); la ficha las separa', J({ edAntes, edDespues, seg: (despuesD.match(/Tu seguimiento:[^.]*\./) || [''])[0], fecha: despuesD.match(/Próxima revisión: [^.]*\./)?.[0] }),
      /sin revisiones personales todavía/.test(antesD) && /1 revisión personal registrada/.test(despuesD) && edAntes !== '' && edAntes === edDespues && /Próxima revisión: \d+ \w+ 2026/.test(despuesD) && !/resuelta|verificad/i.test(despuesD) && /Respuesta editorial/.test(fichaD) && /Tus revisiones personales/.test(fichaD));

    // ---- T6. archivar y descartar: desaparecen de lo pendiente, siguen en sus filtros y no tocan la cartera
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, Bq.id); await p.waitForSelector('[data-estado=archivado]'); await p.click('[data-estado=archivado]'); await p.waitForTimeout(500);
    await p.evaluate(id => { location.hash = '#escenario-' + id; }, Cq.id); await p.waitForSelector('[data-estado=descartado]'); await p.click('[data-estado=descartado]'); await p.waitForTimeout(500);
    await abrirCuaderno(p); const pend = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .esc-item')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    await p.selectOption('#seg-filtro', 'archivado'); await p.waitForTimeout(400); const arch = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .esc-item')].map(e => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), reg: !!e.querySelector('[data-registrar]') })));
    await p.screenshot({ path: CAP + `T6-cuaderno-archivado-${w}-viewport.png` });
    await p.selectOption('#seg-filtro', 'descartado'); await p.waitForTimeout(400); const desc = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .esc-item')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    const baseDespues = J((await api(p, 'GET', '/portfolios/' + c.id)).j.posiciones.map(x => [x.ticker, x.peso])), revBase = (await api(p, 'GET', '/portfolios/' + c.id)).j.revision;
    ev('T6-' + w, `Archivar y descartar (${w} px)`, 'La idea archivada y la descartada ya no aparecen en lo pendiente (solo quedan las 2 en estudio), aparecen en sus filtros (la archivada sin botón de registrar) y la cartera conserva sus posiciones y su revisión', J({ pend: pend.length, arch: arch.length, desc: desc.length, revBase }),
      pend.length === 2 && !pend.some(x => /¿Y si pesara un 5 %\?|PG\?/.test(x)) && arch.length === 1 && /¿Y si pesara un 5 %\?/.test(arch[0].t) && !arch[0].reg && !/Próxima revisión|Toca revisar/.test(arch[0].t) && desc.length === 1 && /Merece la pena mirar PG/.test(desc[0]) && baseAntes === baseDespues && revBase === cart.revision);
    // ---- T7. «Mis portafolios» con cuenta ofrece las MISMAS tres entradas: las otras dos crean la cartera vacía en la cuenta y abren el mismo editor, con un texto coherente (sin ofrecer una plantilla que no existe)
    await p.evaluate(() => { location.hash = '#carteras'; }); await p.waitForSelector('#btn-nueva'); await p.click('#btn-nueva'); await p.waitForSelector('#nueva-manual', { state: 'visible' }); await p.click('#nueva-manual'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(600);
    const vac = await p.evaluate(() => { const v = e => e && e.offsetParent !== null; const a = document.querySelector('#origen-aviso'), ap = document.querySelector('#origen-aviso-pie'); return { aviso: v(a) ? a.textContent.replace(/\s+/g, ' ') : (v(ap) ? ap.textContent.replace(/\s+/g, ' ') : ''), avisoArriba: v(a), vacio: document.querySelector('#pos-vacio p.mut')?.textContent.trim(), plantilla: !document.querySelector('#mi-plantilla').hidden, id: location.hash }; });
    const creada = (await api(p, 'GET', '/portfolios')).j.find(x => '#cartera-' + x.id === vac.id);
    await p.screenshot({ path: CAP + `T7-manual-con-cuenta-${w}-viewport.png` });
    ev('T7-' + w, `Con cuenta: «Recrear la que ya tengo» (${w} px)`, 'Crea en la cuenta una cartera vacía con origen «manual», abre el editor con el aviso VISIBLE (sin conexión con bróker) y un texto que no ofrece plantillas ni «Más acciones»; la opción de plantilla no está', J(vac) + ' ' + J({ origen: creada?.origen, n: creada?.posiciones?.length }),
      creada?.origen === 'manual' && creada.posiciones.length === 0 && /sin conexión con bróker/.test(vac.aviso) && vac.avisoArriba && !/Más acciones|plantilla/.test(vac.vacio) && vac.plantilla === false);
    ev('T0-' + w, `Sin errores de JavaScript ni diálogos inesperados (${w} px)`, 'Ningún pageerror; sin diálogos inesperados', `errores ${J(errs)}; inesperados ${J(DLGMAL)}`, errs.length === 0 && DLGMAL.length === 0 && await sinDesborde(p));
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-T22');
})();
