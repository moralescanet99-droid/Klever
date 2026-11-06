// Batería S (ronda 21): el RECORRIDO COMPLETO de producto, con cuenta y persistencia real (servidor local con SQLite; NO la demo): portada con tres entradas → un solo editor → revisión útil sin nota →
// probar un cambio (cartera base intacta) → guardar en el Cuaderno con pregunta, motivo, invalidación y fecha → cerrar sesión → volver con la misma cuenta → «Para revisar» → registrar revisión → historial;
// otra cuenta aislada. Datos FICTICIOS. Se comprueba COMPORTAMIENTO y persistencia (estado, filas, datos), no frases literales completas. Uso: node tests/ronda21/testS.cjs
const { chromium, B, ev, nuevo, mail, fin } = require('../ronda5/h.cjs');
const path = require('path'), fs = require('fs');
const CAP = path.resolve(__dirname, '..', '..', process.env.RONDA || 'ronda21', 'capturas') + path.sep; fs.mkdirSync(CAP, { recursive: true });
const J = JSON.stringify;
const N = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  const b = await chromium.launch(); const DLG = [], DLGMAL = [];
  const dialogo = d => { if (d.type() === 'beforeunload') { DLG.push('beforeunload'); d.accept().catch(() => {}); } else { DLGMAL.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); } };
  const api = (p, m, ruta, body, token) => p.evaluate(async ([m, ruta, body, token]) => { const r = await fetch('/api' + ruta, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + (token || localStorage.getItem('klever_token')) }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; }, [m, ruta, body, token]);
  const texto = (p, s) => p.evaluate(s => document.querySelector(s)?.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() ?? '', s);
  const quieto = async p => { let prev = -1, q = 0; const t0 = Date.now(); while (q < 5 && Date.now() - t0 < 6000) { const y = await p.evaluate(() => Math.round(scrollY)); q = y === prev ? q + 1 : 0; prev = y; await p.waitForTimeout(80); } };
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const sinDesborde = p => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const anadir = async (p, q) => { await p.fill('#buscar-activo', q); await p.waitForSelector('#lista-activos li[role=option]'); await p.waitForTimeout(150); await p.keyboard.press('Enter'); await p.waitForTimeout(250); };
  const pesos = (p, vals) => p.evaluate(v => [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).length, vals);
  const fijar = async (p, t, v) => { const l = p.locator(`.peso-in[aria-label^="Peso de ${t},"] >> visible=true`).first(); await l.fill(String(v)); await l.press('Tab'); await p.waitForTimeout(250); };
  const esperaPortada = async p => { await p.goto(B); await p.waitForSelector('#entrada-vacia'); };
  const entrarCon = async (p, email, abierto = false) => { if (!abierto) await p.click('#entrar'); await p.fill('#acc-email', email); await p.check('#acc-acepto'); await p.click('#form-acceso button');
    await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href')); await p.waitForSelector('#vista-carteras:not([hidden]), #vista-cartera:not([hidden])'); await p.waitForTimeout(900); };
  const salir = async p => { if (await p.locator('#salir').isVisible().catch(() => false)) await p.click('#salir'); else { await p.click('#btn-menu, #menu-btn, .btn-menu, [aria-controls=menu-movil]'); await p.click('#salir-m'); } await p.waitForTimeout(500); const d = p.locator('#salir-descartar'); if (await d.isVisible().catch(() => false)) await d.click(); await p.waitForSelector('#entrar', { state: 'visible' }); };

  for (const [w, h] of [[1440, 900], [390, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo);
    const correo = mail('S' + w);
    // ---- S1. portada: la promesa y las tres entradas
    await esperaPortada(p); await p.waitForTimeout(500);
    const portada = await p.evaluate(() => ({ h1: document.querySelector('#vista-inicio h1').textContent, entradas: [...document.querySelectorAll('.entrada')].filter(e => e.offsetParent !== null).map(e => e.querySelector('b').textContent), simulacion: /sin dinero real/i.test(document.querySelector('#vista-inicio .lead').textContent) }));
    await p.screenshot({ path: CAP + `S1-portada-${w}-viewport.png` });
    ev('S1-' + w, `Portada (${w} px): promesa de producto y TRES entradas claras, con la transparencia de simulación visible desde el principio`, 'El título contiene la promesa; hay tres entradas (crear desde cero, explorar un ejemplo, recrear mi cartera); el texto inicial dice «sin dinero real»', J(portada),
      /entiende lo que tienes/i.test(portada.h1) && /explora lo que podría cambiar/i.test(portada.h1) && portada.entradas.length === 3 && /desde cero/i.test(portada.entradas[0]) && /ejemplo/i.test(portada.entradas[1]) && /Recrear/i.test(portada.entradas[2]) && portada.simulacion);
    // ---- S2. desde cero: editor vacío, aviso de origen, primer activo, reparto al 100 %
    await p.click('#entrada-vacia'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(400);
    const vacio = await p.evaluate(() => ({ aviso: document.querySelector('#origen-aviso')?.hidden === false ? document.querySelector('#origen-aviso').textContent : null, filas: document.querySelectorAll('.peso-in').length }));
    await anadir(p, 'KO'); await anadir(p, 'PG'); await fijar(p, 'KO', 60); await fijar(p, 'PG', 40);
    const tras = await p.evaluate(() => ({ filas: [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => e.value).join('/'), aviso: document.querySelector('#origen-aviso')?.hidden, total: document.querySelector('#vista-cartera')?.textContent.match(/100\s*%\s*asignado/) ? true : false }));
    await p.screenshot({ path: CAP + `S2-desde-cero-${w}-viewport.png` });
    ev('S2-' + w, `Crear desde cero (${w} px): cartera vacía con su aviso, primer activo, reparto al 100 %`, 'Empieza sin posiciones y con el aviso de «cartera vacía»; tras añadir KO y PG y repartir 60/40 el editor muestra 100 % asignado y el aviso desaparece', J({ vacio, tras }), vacio.filas === 0 && /vac[ií]a/i.test(vacio.aviso || '') && /60,?0?\/40,?0?/.test(tras.filas) && tras.aviso === true && tras.total);
    // ---- S3. acceso DURANTE el guardado: el trabajo no se pierde y llega a la cuenta
    await p.locator('.js-guardar:visible').first().click(); await p.waitForTimeout(400);
    const dialogoAcceso = await p.evaluate(() => !!document.querySelector('#dlg-acceso[open], dialog[open]'));
    await entrarCon(p, correo, true);
    const lista = (await api(p, 'GET', '/portfolios')).j;
    const mia = lista.find(c => (c.posiciones || []).length === 2);
    ev('S3-' + w, `Guardar pidiendo acceso (${w} px): el borrador no se pierde`, 'Se pidió acceso; tras entrar, la cartera existe en la cuenta con KO 60 % y PG 40 %, origen «vacia» y sin duplicados', J({ dialogoAcceso, n: lista.length, origen: mia?.origen, pos: mia?.posiciones }),
      dialogoAcceso && lista.length === 1 && mia?.origen === 'vacia' && mia.posiciones.some(x => x.ticker === 'KO' && x.peso === 60) && mia.posiciones.some(x => x.ticker === 'PG' && x.peso === 40));
    // ---- S4. revisión útil: «de un vistazo», estado de guardado y «Probar un cambio»
    await p.evaluate(i => { location.hash = '#cartera-' + i; }, mia.id); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 2 && !!document.querySelector('#donut-leyenda li')); await p.waitForTimeout(500);
    const estadoGuardada = N(await p.textContent('#estado'));
    await p.locator('.js-revisar:visible').first().click(); await p.waitForSelector('#vista-cartera[data-paso="3"]'); await p.waitForFunction(() => document.activeElement?.id === 'nota-panel'); await quieto(p);
    await p.waitForSelector('#nota-cuerpo .vistazo'); await p.waitForTimeout(400);
    const rev = await p.evaluate(() => ({ vz: document.querySelector('#nota-cuerpo .vistazo')?.textContent.replace(/\s+/g, ' ').trim(), probar: !!document.querySelector('#vz-probar'), nota: document.querySelector('#nota-cuerpo .nota-num')?.textContent.replace(/\s+/g, ' ').trim() }));
    await p.screenshot({ path: CAP + `S4-revision-vistazo-${w}-viewport.png` });
    ev('S4-' + w, `Revisión de la cartera guardada (${w} px): «Tu cartera de un vistazo», estado de guardado inequívoco y acción «Probar un cambio»`, 'Hay resumen (posiciones, mayor posición, tipos), el estado dice que está guardada en la cuenta y existe el botón; la nota 4,4 es un indicador dentro del análisis, no lo único', J({ estadoGuardada, rev }),
      /Tu cartera de un vistazo/.test(rev.vz) && /KO/.test(rev.vz) && /60/.test(rev.vz) && rev.probar && /guardada/i.test(estadoGuardada) && /4,4/.test(rev.nota));
    // ---- S5. probar un cambio: base intacta, «Cartera base» y «Alternativa simulada»
    await p.click('#vz-probar'); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'JNJ'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab', { state: 'attached' }).then(() => p.evaluate(() => document.querySelectorAll('#lab-res details.mini').forEach(d => { d.open = true; })));
    const cmp = await p.evaluate(() => ({ cab: [...document.querySelectorAll('#lab-res table.tabla-lab thead th')].map(t => t.textContent.trim()), origen: document.querySelector('.lab-origen')?.textContent.replace(/\s+/g, ' ').trim(), baseIntacta: /Tu cartera base no cambia/.test(document.querySelector('#lab-res').textContent), noMejor: /no dice que la alternativa sea mejor/.test(document.querySelector('#lab-res').textContent) }));
    await p.screenshot({ path: CAP + `S5-comparacion-${w}-viewport.png` });
    const baseAntes = (await api(p, 'GET', '/portfolios/' + mia.id)).j;
    ev('S5-' + w, `Comparación (${w} px): «Cartera base» frente a «Alternativa simulada», con el origen del peso añadido y sin afirmar que sea mejor`, 'Las columnas se llaman «Cartera base» y «Alternativa simulada»; se explica quién cede el peso; se dice que la base no cambia', J(cmp),
      cmp.cab.includes('Cartera base') && cmp.cab.includes('Alternativa simulada') && /cede|proporcional|KO|PG/i.test(cmp.origen) && cmp.baseIntacta && cmp.noMejor);
    // ---- S6. guardar en el Cuaderno
    const nombreEsc = 'JNJ al 10 % de prueba';
    await p.fill('#lab-nombre', nombreEsc); await p.fill('#lab-pregunta', '¿Aporta JNJ más estabilidad?'); await p.fill('#lab-nota', 'Quiero ver qué cambia si diversifico'); await p.fill('#lab-invalidacion', 'Si JNJ recorta su dividendo, lo descarto'); await p.fill('#lab-revisar', hoy());
    await p.click('#lab-guardar-btn'); await p.waitForSelector('#vista-lab .esc-ficha, .esc-ficha', { timeout: 15000 }); await p.waitForTimeout(400);
    const ficha = await p.evaluate(() => ({ t: document.querySelector('#lab-cuerpo').textContent.replace(/\s+/g, ' '), inval: document.querySelector('.esc-invalidacion')?.textContent.trim() }));
    const baseDespues = (await api(p, 'GET', '/portfolios/' + mia.id)).j;
    await p.screenshot({ path: CAP + `S6-cuaderno-ficha-${w}-viewport.png` });
    const lst = (await api(p, 'GET', '/escenarios')).j, esc = lst[0];
    ev('S6-' + w, `Guardar en mi Cuaderno (${w} px): pregunta, motivo, qué me haría cambiar de opinión y fecha; la cartera base NO cambia`, 'El escenario existe con los cuatro campos y la ficha los muestra; la cartera guardada tiene las mismas posiciones y la misma revisión que antes', J({ n: lst.length, esc: esc && { p: esc.pregunta, n: esc.nota, i: esc.invalidacion, f: esc.revisar_en }, inval: ficha.inval, revAntes: baseAntes.revision, revDespues: baseDespues.revision }),
      lst.length === 1 && esc.pregunta === '¿Aporta JNJ más estabilidad?' && esc.invalidacion === 'Si JNJ recorta su dividendo, lo descarto' && esc.revisar_en === hoy() && /JNJ recorta/.test(ficha.inval || '') && baseAntes.revision === baseDespues.revision && J(baseAntes.posiciones.map(x => [x.ticker, x.peso])) === J(baseDespues.posiciones.map(x => [x.ticker, x.peso])));
    // ---- S7. cerrar sesión, volver con la misma cuenta, «Para revisar»
    const tokenViejo = await p.evaluate(() => localStorage.getItem('klever_token'));
    await salir(p); const revocado = (await api(p, 'GET', '/escenarios', undefined, tokenViejo)).s;
    await esperaPortada(p); await entrarCon(p, correo);
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#vista-seguimiento:not([hidden])'); await p.waitForSelector('#seg-escenarios .seg-grupo', { timeout: 15000 });
    const grupos = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .seg-grupo')].map(g => ({ t: g.querySelector('h3').textContent.replace(/\s+/g, ' ').trim(), n: g.querySelectorAll('.esc-item').length })));
    await p.screenshot({ path: CAP + `S7-para-revisar-${w}-viewport.png` });
    await p.evaluate(() => { location.hash = '#inicio'; }); await p.waitForSelector('#inicio-revisar:not([hidden])', { timeout: 10000 }).catch(() => {});
    const aviso7 = await p.evaluate(() => { const e = document.querySelector('#inicio-revisar'); return e && !e.hidden ? e.textContent.trim() : null; });
    ev('S7b-' + w, `Usuario recurrente (${w} px): la portada le lleva a lo que toca revisar`, 'Con una idea con fecha de hoy aparece «Tienes 1 idea para revisar en tu Cuaderno» con enlace al Cuaderno', J(aviso7), /1 idea/.test(aviso7 || ''));
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios .seg-grupo');
    ev('S7-' + w, `Cerrar sesión y volver con la misma cuenta (${w} px): la idea reaparece en «Para revisar»`, 'El token antiguo queda revocado (401); con la sesión nueva, el Cuaderno agrupa la idea con fecha de hoy en «Para revisar»', J({ revocado, grupos }), revocado === 401 && grupos.length >= 1 && /Para revisar/.test(grupos[0].t) && grupos[0].n === 1);
    // ---- S8. registrar revisión: se añade al historial, la hipótesis original sigue
    await p.locator('#seg-escenarios .esc-item a.btn').first().click(); await p.waitForSelector('#rev-form', { state: 'attached' }); const abierto = await p.evaluate(() => document.querySelector('#rev-det').open); if (!abierto) await p.locator('#rev-det > summary').click(); await p.waitForSelector('#rev-form', { state: 'visible' });   // con la fecha de hoy o vencida el formulario ya viene abierto
    await p.fill('#rev-obs', 'JNJ mantuvo su dividendo'); await p.fill('#rev-apr', 'Mi condición no se cumplió'); await p.check('#rev-dec-r'); await p.fill('#rev-prox', '2099-01-15'); await p.click('#rev-btn'); await p.waitForFunction(() => document.querySelectorAll('.esc-rev-lista > li').length === 1, null, { timeout: 15000 });
    const hist = await p.evaluate(() => ({ items: [...document.querySelectorAll('.esc-rev-lista > li')].map(l => l.textContent.replace(/\s+/g, ' ').trim()), preg: document.querySelector('.esc-preg')?.textContent.trim(), inval: document.querySelector('.esc-invalidacion')?.textContent.trim() }));
    await p.screenshot({ path: CAP + `S8-revision-registrada-${w}-viewport.png` });
    await p.reload(); await p.waitForSelector('.esc-rev-lista > li', { timeout: 15000 });
    const trasRecargar = await p.evaluate(() => document.querySelectorAll('.esc-rev-lista > li').length);
    const dsrv = (await api(p, 'GET', '/escenarios/' + esc.id)).j;
    ev('S8-' + w, `Registrar revisión (${w} px): se suma al historial; la pregunta y la invalidación originales siguen; persiste tras recargar`, '1 revisión visible, con la observación y la próxima fecha; la pregunta y la condición originales intactas; sigue allí tras recargar; el servidor tiene la fecha reprogramada', J({ hist, trasRecargar, revisar_en: dsrv.revisar_en, n: dsrv.revisiones?.length }),
      hist.items.length === 1 && /JNJ mantuvo su dividendo/.test(hist.items[0]) && /2099/.test(hist.items[0]) && /Aporta JNJ/.test(hist.preg || '') && /JNJ recorta/.test(hist.inval || '') && trasRecargar === 1 && dsrv.revisar_en === '2099-01-15' && dsrv.revisiones.length === 1);
    // ---- S9. de «Para revisar» a «Próximas revisiones»; aislamiento con otra cuenta
    await p.evaluate(() => { location.hash = '#seguimiento'; }); await p.waitForSelector('#seg-escenarios .seg-grupo'); await p.waitForTimeout(400);
    const grupos2 = await p.evaluate(() => [...document.querySelectorAll('#seg-escenarios .seg-grupo h3')].map(g => g.textContent.replace(/\s+/g, ' ').trim()));
    const otra = await nuevo(b, w, h); otra.on('dialog', dialogo); await esperaPortada(otra); await entrarCon(otra, mail('SO' + w));
    const ajena = [(await api(otra, 'GET', '/escenarios/' + esc.id)).s, (await api(otra, 'GET', `/escenarios/${esc.id}/revisiones`)).s, (await api(otra, 'POST', `/escenarios/${esc.id}/revisiones`, { clave: 'rev-ajena-' + w, fecha: hoy(), decision: 'mantener', revision: 0 })).s, (await api(otra, 'PATCH', '/escenarios/' + esc.id, { nota: 'x', revision: 0 })).s];
    const listaAjena = (await api(otra, 'GET', '/escenarios')).j.length, intacto = (await api(p, 'GET', '/escenarios/' + esc.id)).j;
    ev('S9-' + w, `Idea reprogramada y aislamiento (${w} px)`, 'La idea ya no está en «Para revisar» sino en «Próximas revisiones»; otra cuenta autenticada recibe 404 al leer, listar revisiones, registrar y editar, no ve nada en su Cuaderno y no cambia la revisión del original', J({ grupos2, ajena, listaAjena, n: intacto.revisiones.length }),
      !grupos2.some(g => /Para revisar/.test(g)) && grupos2.some(g => /Próximas revisiones/.test(g)) && ajena.every(s => s === 404) && listaAjena === 0 && intacto.revisiones.length === 1);
    ev('S0-' + w, `Sin errores de JavaScript ni diálogos inesperados en el recorrido (${w} px)`, 'Ningún pageerror; los avisos de «cambios sin guardar» se aceptan y se cuentan', `errores ${J(errs)}; beforeunload ${DLG.length}; inesperados ${J(DLGMAL)}`, errs.length === 0 && DLGMAL.length === 0 && await sinDesborde(p));
    await otra.ctx.close(); await p.ctx.close();
  }
  // ---- las OTRAS DOS entradas (explorar un ejemplo y recrear mi cartera) y el acceso por TECLADO; sin cuenta, para comprobar que una cartera SIN NOTA llega igualmente a la comparación
  for (const [w, h] of [[1440, 900], [390, 780]]) {
    const p = await nuevo(b, w, h), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', dialogo);
    await esperaPortada(p); await p.click('#entrada-ejemplo'); await p.waitForSelector('[data-plantilla=dividendos]'); await p.click('[data-plantilla=dividendos]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForFunction(() => document.querySelectorAll('.peso-in').length >= 6); await p.waitForTimeout(500);
    const ejemplo = await p.evaluate(() => ({ nombre: document.querySelector('#nombre').value, aviso: document.querySelector('#origen-aviso')?.hidden === false ? document.querySelector('#origen-aviso').textContent : null }));
    await p.locator('.js-revisar:visible').first().click(); await p.waitForSelector('#vista-cartera[data-paso="3"]'); await p.waitForFunction(() => document.activeElement?.id === 'nota-panel'); await p.waitForSelector('#nota-cuerpo .vistazo'); await quieto(p);
    const sinNota = await p.evaluate(() => ({ vz: !!document.querySelector('#nota-cuerpo .vistazo'), probar: !!document.querySelector('#vz-probar'), nota: !!document.querySelector('#nota-cuerpo .nota-num'), estado: document.querySelector('#nota-cuerpo .nota-pend b')?.textContent }));
    await p.screenshot({ path: CAP + `S10-ejemplo-sin-nota-${w}-viewport.png` });
    await p.click('#vz-probar'); await p.waitForSelector('#lab-form'); await p.fill('#lab-ticker', 'KO'); await p.fill('#lab-peso', '10'); await p.check('input[name=lab-fin][value=proporcional]'); await p.click('#lab-form button[type=submit]'); await p.waitForSelector('#lab-res table.tabla-lab', { state: 'attached' }).then(() => p.evaluate(() => document.querySelectorAll('#lab-res details.mini').forEach(d => { d.open = true; })));
    const cmp = await p.evaluate(() => [...document.querySelectorAll('#lab-res table.tabla-lab thead th')].map(t => t.textContent.trim()));
    ev('S10-' + w, `Explorar un ejemplo (${w} px): copia editable rotulada como ejemplo simulado; SIN nota global el recorrido sigue siendo útil y llega a la comparación`, 'El nombre y el aviso dicen «ejemplo simulado»; la revisión tiene resumen, el estado «Sin nota global» (no «pendiente») y «Probar un cambio»; la comparación se calcula', J({ ejemplo, sinNota, cmp }),
      /Ejemplo simulado/.test(ejemplo.nombre) && /ejemplo simulado/i.test(ejemplo.aviso || '') && sinNota.vz && sinNota.probar && !sinNota.nota && /Sin nota global|Evaluación parcial/.test(sinNota.estado || '') && cmp.includes('Cartera base') && cmp.includes('Alternativa simulada'));
    await esperaPortada(p); await p.click('#entrada-manual'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.waitForTimeout(400);
    const manual = await p.evaluate(() => document.querySelector('#origen-aviso')?.textContent || '');
    await p.fill('#buscar-activo', 'ZZZZQ'); await p.waitForSelector('#lista-activos li.sin'); const noSoportado = N(await p.textContent('#lista-activos li.sin')); await p.fill('#buscar-activo', '');
    const enGuardado = await p.evaluate(() => document.querySelectorAll('.peso-in').length);
    await anadir(p, 'KO'); await fijar(p, 'KO', 100);
    const traer = await p.evaluate(() => ({ filas: [...document.querySelectorAll('.peso-in')].filter(e => e.offsetParent !== null).map(e => e.getAttribute('aria-label')).join('|'), aviso: document.querySelector('#origen-aviso')?.hidden === false }));
    ev('S11-' + w, `Recrear mi cartera (${w} px): representación manual, sin conexión con bróker; un activo que no existe NO se sustituye en silencio`, 'El aviso dice que no hay conexión, custodia ni órdenes; «ZZZZQ» no se añade y se explica que no se sustituye; KO se añade y queda al 100 %', J({ manual: manual.slice(0, 160), noSoportado, enGuardado, traer }),
      /no se conecta a ningún banco ni bróker/.test(manual) && /no (lo )?sustituimos/.test(noSoportado) && enGuardado === 0 && /KO/.test(traer.filas) && traer.aviso);
    await esperaPortada(p); await p.evaluate(() => document.activeElement?.blur()); let pulsaciones = 0;
    while (pulsaciones < 60) { await p.keyboard.press('Tab'); pulsaciones++; if (await p.evaluate(() => document.activeElement?.id === 'entrada-vacia')) break; }
    await p.keyboard.press('Enter'); await p.waitForSelector('#vista-cartera:not([hidden])'); const origenTeclado = await p.evaluate(() => document.querySelector('#origen-aviso')?.hidden === false);
    ev('S12-' + w, `Teclado real (${w} px): se llega con Tab a «Crear desde cero» y Enter abre el editor vacío`, 'El foco alcanza la entrada (≤ 60 pulsaciones) y Enter abre la cartera vacía con su aviso', `Tab ×${pulsaciones}; aviso ${origenTeclado}`, pulsaciones < 60 && origenTeclado);
    ev('S13-' + w, `Sin errores de JavaScript ni desbordes en las otras entradas (${w} px)`, 'Ningún pageerror; sin desbordamiento horizontal', J(errs), errs.length === 0 && await sinDesborde(p));
    await p.ctx.close();
  }
  await b.close(); fin('evidencias-S21');
})();
