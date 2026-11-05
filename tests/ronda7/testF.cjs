// Batería F (ronda 7): fiabilidad del guardado, conflicto coherente, visibilidad real (E16a corregida) y diálogo móvil.
// Se ejecuta contra el SERVIDOR REAL local (D1 simulada). La demo se prueba aparte (tests/ronda5/demotest.cjs).
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch();
  const token = p => p.evaluate(() => localStorage.getItem('klever_token'));
  const api = async (p, m, path, body) => { const t = await token(p); return p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, path, body, t]); };
  const cartera = async (p, id) => (await api(p, 'GET', '/portfolios/' + id)).j;
  const pos = c => c.posiciones.map(x => x.ticker + ':' + x.peso).sort().join(',');
  const resumen = c => `«${c.nombre}» · tesis «${c.tesis}» · ${pos(c)} · rev ${c.revision}`;
  const pub = async (p, id) => p.evaluate(async id => { const r = await fetch('/api/public/' + id); if (r.status !== 200) return 'HTTP ' + r.status; const j = await r.json(); return `«${j.nombre}» · tesis «${j.tesis}» · ` + j.posiciones.map(x => x.ticker + ':' + x.peso).sort().join(','); }, id);
  const guardado = p => p.waitForFunction(() => document.querySelector('#estado-live').textContent.startsWith('Guardada en tu cuenta'));
  const G = p => p.locator('.js-guardar >> visible=true');
  const idDe = async p => (await p.evaluate(() => location.hash)).replace('#cartera-', '');
  const externo = async (p, id, posiciones, extra = {}) => { await p.waitForTimeout(1100); const c = await cartera(p, id); return api(p, 'PUT', '/portfolios/' + id, { posiciones, revision: c.revision, ...extra }); };
  const gld = p => p.locator('#pos-tabla tbody tr:has(b:text-is("GLD")) .peso-in'); // por símbolo: el orden de las filas tras reabrir no está garantizado
  const abrirPub = p => p.evaluate(() => { document.querySelector('#det-pub').open = true; });

  // ===== G1: un guardado que falla no deja NADA a medias (cartera pública) =====
  // Ronda 19: recargar con cambios sin guardar abre un diálogo «beforeunload»; si el ejecutor lo DESCARTA (comportamiento por defecto sin escuchador), `reload` no termina y la batería se cae sin resultado
  // (la causa del fallo «testF terminó SIN resultado»: se reprodujo con tests/ronda19/beforeunload.cjs). Aquí se aceptan y se deja constancia.
  const DIALOGOS = [];
  let p = await nuevo(b, 1440, 900); p.on('dialog', d => { DIALOGOS.push(d.type()); d.accept().catch(() => {}); }); await entrar(p, 'oro', 'F1'); const id1 = await idDe(p);
  await abrirPub(p); await p.fill('#tesis', 'Tesis original'); await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
  const antes = await cartera(p, id1), pubAntes = await pub(p, id1);
  const metodos = []; p.on('request', r => { if (r.url().includes('/api/portfolios/') && r.method() !== 'GET') metodos.push(r.method()); });
  await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue());
  await p.fill('#nombre', 'Nombre nuevo'); await p.fill('#tesis', 'Tesis NUEVA'); await peso(p).fill('40'); await peso(p, 1).fill('10'); await p.waitForTimeout(200);
  await G(p).click(); await p.waitForTimeout(700);
  const tras = await cartera(p, id1), pubTras = await pub(p, id1), est = await T(p, '#estado'), mot = await T(p, '#motivo'), etq = await T(G(p), 'xpath=.');
  await p.screenshot({ path: EVDIR + 'G1-fallo-sin-parciales-1440.png' });
  await p.unroute('**/api/portfolios/*'); await G(p).click(); await guardado(p); const final = await cartera(p, id1), pubFinal = await pub(p, id1);
  ev('G1', 'Guardado fallido de una cartera pública (servidor real)', 'Con el guardado único, si falla NO queda nada a medias: ni posiciones, ni nombre, ni tesis, ni la versión pública; la interfaz dice que no se guardó y ofrece reintentar; al reintentar se guarda todo junto',
    `antes ${resumen(antes)}; tras fallar ${resumen(tras)} (idéntica=${resumen(antes) === resumen(tras)}); público antes/después igual=${pubAntes === pubTras}; interfaz «${est}» / «${mot}» / botón «${etq}»; peticiones de escritura enviadas en todo el guardado: ${metodos.join(',')}; tras reintentar ${resumen(final)}; público ${pubFinal}`,
    resumen(antes) === resumen(tras) && pubAntes === pubTras && est.startsWith('No se pudo guardar') && etq === 'Reintentar guardado' && metodos.filter(m => m === 'PATCH').length === 0 && final.nombre === 'Nombre nuevo' && final.tesis === 'Tesis NUEVA' && pubFinal.includes('Nombre nuevo') && pubFinal.includes('Tesis NUEVA'), 'G1-fallo-sin-parciales-1440.png');

  // ===== G2: un ticker desconocido se rechaza ANTES del lote (validación previa): la cartera no cambia. No es un fallo a mitad de transacción (el rollback ante un error interno lo prueba R4a en tests/ronda8/unit-carreras.mjs) =====
  const c2 = await cartera(p, id1), r2 = await api(p, 'PUT', '/portfolios/' + id1, { posiciones: [{ ticker: 'GLD', peso: 50 }, { ticker: 'ZZZZ', peso: 50 }], nombre: 'No debe quedar', tesis: 'No debe quedar', revision: c2.revision }), c2b = await cartera(p, id1);
  ev('G2', 'Ticker desconocido en un guardado con nombre y tesis cambiados: se rechaza ANTES del lote (validación previa, no a mitad de transacción)', 'HTTP 400 por validación y la cartera queda exactamente igual (revisión incluida); el rollback ante un error interno es la evidencia R4a', `HTTP ${r2.s}; antes ${resumen(c2)}; después ${resumen(c2b)}`, r2.s === 400 && resumen(c2) === resumen(c2b), '');

  // ===== G3: revisión y concurrencia (HTTP real) =====
  const rev0 = (await cartera(p, id1)).revision; await p.waitForTimeout(1100);
  const seguidos = await p.evaluate(async ([id, rev]) => { const f = (pos) => fetch('/api/portfolios/' + id, { method: 'PUT', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ posiciones: pos, revision: rev }) }).then(r => r.status);
    const a = await f([{ ticker: 'GLD', peso: 55 }, { ticker: 'IAU', peso: 45 }]); const b2 = await f([{ ticker: 'GDX', peso: 65 }, { ticker: 'IAU', peso: 35 }]); return [a, b2]; }, [id1, rev0]);
  let ambos = 0, ninguno = 0, uno = 0;
  for (let i = 0; i < 20; i++) {
    const rv = (await cartera(p, id1)).revision;
    const rs = await p.evaluate(async ([id, rev, i]) => { const f = (pos) => fetch('/api/portfolios/' + id, { method: 'PUT', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + localStorage.getItem('klever_token') }, body: JSON.stringify({ posiciones: pos, revision: rev }) }).then(r => r.status);
      return Promise.all([f([{ ticker: 'GLD', peso: 60 }, { ticker: 'IAU', peso: 40 }]), f([{ ticker: 'GDX', peso: 70 }, { ticker: 'IAU', peso: 30 }])]); }, [id1, rv, i]);
    const n200 = rs.filter(s => s === 200).length; if (n200 === 2) ambos++; else if (n200 === 0) ninguno++; else uno++;
  }
  const revFin = (await cartera(p, id1)).revision;
  ev('G3', 'Escrituras con la misma revisión (servidor real, HTTP)', 'Dos guardados SEGUIDOS en el mismo segundo con la misma revisión: 200 y 409 (antes 200 y 200). 20 pares SIMULTÁNEOS: nunca pasan los dos y la revisión sube exactamente una vez por escritura aceptada',
    `seguidos: ${seguidos.join(' y ')}; 20 pares simultáneos: ambos aceptados=${ambos}, ninguno=${ninguno}, exactamente uno=${uno}; revisión ${rev0} → ${revFin} (esperado ${rev0 + 1 + uno})`, seguidos[0] === 200 && seguidos[1] === 409 && ambos === 0 && ninguno === 0 && revFin === rev0 + 1 + uno, '');
  await p.ctx.close();

  // ===== G4: conflicto: coherencia al ABRIR y al GUARDAR =====
  p = await nuevo(b, 1440, 900); p.on('dialog', d => { DIALOGOS.push(d.type()); d.accept().catch(() => {}); }); await entrar(p, 'oro', 'F4'); const id4 = await idDe(p);
  await peso(p).fill('30'); await peso(p, 1).fill('20'); await G(p).click(); await guardado(p);
  const copia = id => p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id);
  const vals = async () => (await p.locator('.peso-in >> visible=true').evaluateAll(es => es.map(e => e.value))).sort().join(' ');
  // -- al GUARDAR --
  await gld(p).fill('15'); await p.waitForTimeout(150);
  await externo(p, id4, [{ ticker: 'GLD', peso: 50 }, { ticker: 'IAU', peso: 25 }, { ticker: 'GDX', peso: 25 }]); const ajena = await cartera(p, id4);
  await G(p).click(); await p.waitForSelector('#dlg-conflicto[open]');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  const g_esc = { abierto: await p.locator('#dlg-conflicto[open]').count(), copia: await copia(id4), cuenta: resumen(await cartera(p, id4)) };
  await G(p).click(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-despues'); await p.waitForTimeout(200);
  const g_desp = { copia: await copia(id4), cuenta: resumen(await cartera(p, id4)), foco: await p.evaluate(() => document.activeElement?.classList.contains('js-guardar')) };
  await G(p).click(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-local-b'); await p.waitForTimeout(400);
  const g_loc = { cuenta: JSON.stringify(await cartera(p, id4)), estado: await T(p, '#estado'), copia: await copia(id4), valores: await vals() };
  const g_loc_igual = g_loc.cuenta === JSON.stringify(ajena);
  await G(p).click(); await guardado(p); const g_guardada = await cartera(p, id4);
  ev('G4a', 'Conflicto al GUARDAR: elegir la versión de este dispositivo no escribe; Guardar sí', 'Escape y «Decidir después» conservan la copia y no tocan la cuenta; «Conservar la de este dispositivo» vuelve al editor SIN escribir (cuenta idéntica byte a byte, revisión incluida); al pulsar Guardar se escribe y sube la revisión',
    `Escape: diálogo abierto=${g_esc.abierto}, copia=${g_esc.copia}, cuenta intacta=${g_esc.cuenta === resumen(ajena)}; «Decidir después»: copia=${g_desp.copia}, cuenta intacta=${g_desp.cuenta === resumen(ajena)}, foco de vuelta en Guardar=${g_desp.foco}; elegir la local: cuenta idéntica=${g_loc_igual}, estado «${g_loc.estado}», copia=${g_loc.copia}, valores ${g_loc.valores}; tras Guardar: ${resumen(g_guardada)} (revisión ${ajena.revision} → ${g_guardada.revision})`,
    g_esc.abierto === 0 && g_esc.copia && g_esc.cuenta === resumen(ajena) && g_desp.copia && g_desp.cuenta === resumen(ajena) && g_desp.foco && g_loc_igual && g_loc.estado.startsWith('Cambios locales pendientes') && g_loc.copia && g_guardada.revision === ajena.revision + 1 && pos(g_guardada).includes('GLD:15'), '');
  // -- al ABRIR --
  await gld(p).fill('12'); await p.waitForTimeout(150);
  await externo(p, id4, [{ ticker: 'GLD', peso: 40 }, { ticker: 'IAU', peso: 30 }, { ticker: 'GDX', peso: 30 }]); const ajena2 = await cartera(p, id4);
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  const a_esc = { copia: await copia(id4), cuenta: resumen(await cartera(p, id4)), estado: await T(p, '#estado'), val: await vals() };
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-despues'); await p.waitForTimeout(250);
  const a_desp = { copia: await copia(id4), cuenta: resumen(await cartera(p, id4)) };
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.click('#cn-local-b'); await p.waitForTimeout(400);
  const a_loc = { cuenta: JSON.stringify(await cartera(p, id4)), estado: await T(p, '#estado'), val: await vals(), copia: await copia(id4) };
  const a_loc_igual = a_loc.cuenta === JSON.stringify(ajena2);
  await G(p).click(); await guardado(p); const a_guardada = await cartera(p, id4);
  ev('G4b', 'Conflicto al ABRIR: mismo comportamiento que al guardar', 'Escape y «Decidir después» conservan la copia y muestran la versión de la cuenta sin dirty; elegir la local carga la copia en el editor SIN escribir; Guardar escribe',
    `Escape: copia=${a_esc.copia}, cuenta intacta=${a_esc.cuenta === resumen(ajena2)}, se ve «${a_esc.estado}»; «Decidir después»: copia=${a_desp.copia}, cuenta intacta=${a_desp.cuenta === resumen(ajena2)}; elegir la local: cuenta idéntica=${a_loc_igual}, estado «${a_loc.estado}», valores ${a_loc.val}, copia=${a_loc.copia}; tras Guardar: ${resumen(a_guardada)} (revisión ${ajena2.revision} → ${a_guardada.revision})`,
    a_esc.copia && a_esc.cuenta === resumen(ajena2) && a_esc.estado === 'Guardada en tu cuenta' && a_desp.copia && a_desp.cuenta === resumen(ajena2) && a_loc_igual && a_loc.estado.startsWith('Cambios locales pendientes') && a_loc.val.includes('12,0') && a_guardada.revision === ajena2.revision + 1 && pos(a_guardada).includes('GLD:12'), '');
  await p.ctx.close();

  // ===== G5: desconexión REAL contra el servidor (el guion de uso) =====
  p = await nuevo(b, 1440, 900); p.on('dialog', d => { DIALOGOS.push(d.type()); d.accept().catch(() => {}); }); await entrar(p, 'oro', 'F5'); const id5 = await idDe(p); const c5 = await cartera(p, id5);
  await peso(p).fill('30'); await peso(p, 1).fill('20'); await p.waitForTimeout(150);
  await p.context().setOffline(true); await G(p).click(); await p.waitForTimeout(700);
  const off = { estado: await T(p, '#estado'), motivo: await T(p, '#motivo'), etq: await T(G(p), 'xpath=.') };
  await p.context().setOffline(false); const intacta = resumen(await cartera(p, id5)) === resumen(c5);
  await G(p).click(); await guardado(p);
  ev('G5', 'Modo sin conexión REAL contra el servidor local', 'Sin conexión el guardado falla de verdad: «No se pudo guardar», cambios en el dispositivo, botón «Reintentar guardado»; la cuenta no cambia; al volver la conexión se guarda',
    `sin conexión: «${off.estado}» / «${off.motivo}» / botón «${off.etq}»; cuenta intacta=${intacta}; tras reconectar «${await T(p, '#estado')}»`, off.estado.startsWith('No se pudo guardar') && off.etq === 'Reintentar guardado' && intacta && (await T(p, '#estado')) === 'Guardada en tu cuenta', '');
  await p.ctx.close();

  // ===== G6: E16a corregida: la última posición es VISIBLE y editable (texto ampliado SIMULADO, 390 px) =====
  p = await nuevo(b, 390, 844); p.on('dialog', d => { DIALOGOS.push(d.type()); d.accept().catch(() => {}); }); await entrar(p, 'dividendos', 'F6'); await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400);
  const ultimo = p.locator('.peso-in >> visible=true').last(); await ultimo.scrollIntoViewIfNeeded(); await ultimo.focus(); await p.waitForTimeout(700);
  const med = async () => p.evaluate(() => { const e = document.activeElement, r = e.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(); return { enfocado: e.classList.contains('peso-in'), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), barraTop: Math.round(bar.top), vw: innerWidth, vh: innerHeight, ancho: document.documentElement.scrollWidth }; });
  const m1 = await med(); await p.screenshot({ path: EVDIR + 'G6-ultima-posicion-200-390.png' });
  const totalAntes = await T(p, '#b-total'); await ultimo.fill('12,5'); await p.waitForTimeout(250); const valor = await ultimo.inputValue(), totalDesp = await T(p, '#b-total'), m2 = await med();
  const dentro = m => m.enfocado && m.top >= 0 && m.bottom <= m.barraTop && m.left >= 0 && m.right <= m.vw && m.ancho <= m.vw;
  ev('G6', 'E16a corregida: última posición, ampliación de texto SIMULADA al 200 % (font-size del documento, no zoom del navegador) a 390 px', 'Tras desplazar y enfocar, el campo queda dentro de la ventana (top ≥ 0, bottom ≤ inicio de la barra fija, sin desbordar a los lados) y permite escribir',
    `campo enfocado: arriba ${m1.top}, abajo ${m1.bottom}, barra empieza en ${m1.barraTop}, ventana ${m1.vw}×${m1.vh}, ancho de página ${m1.ancho}; tras escribir «${valor}» el total pasó de «${totalAntes}» a «${totalDesp}» y el campo sigue visible (abajo ${m2.bottom} ≤ ${m2.barraTop})`,
    dentro(m1) && dentro(m2) && valor === '12,5' && totalAntes !== totalDesp, 'G6-ultima-posicion-200-390.png');
  await p.ctx.close();

  // ===== G7: diálogo móvil: «Decidir después» accesible con texto grande y muchas diferencias =====
  p = await nuevo(b, 320, 568); p.on('dialog', d => { DIALOGOS.push(d.type()); d.accept().catch(() => {}); }); await entrar(p, 'dividendos', 'F7'); const id7 = await idDe(p);
  const n = await p.locator('.peso-in >> visible=true').count(); const nuevos = [];
  for (let i = 0; i < n; i++) { await peso(p, i).fill(String(10 + i)); } await p.fill('#nombre', 'Nombre local distinto'); await p.waitForTimeout(250);
  const c7 = await cartera(p, id7); await externo(p, id7, c7.posiciones.slice(0, 5).map((x, i) => ({ ticker: x.ticker, peso: 20 }))); const ajena7 = await cartera(p, id7);
  await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await p.reload(); await p.waitForSelector('#dlg-conflicto[open]'); await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400);
  const dm = () => p.evaluate(() => { const d = document.querySelector('#dlg-conflicto'), cu = d.querySelector('.cn-cuerpo'), r = e => { const x = document.querySelector(e).getBoundingClientRect(); return { top: Math.round(x.top), bottom: Math.round(x.bottom), left: Math.round(x.left), right: Math.round(x.right) }; };
    return { vh: innerHeight, vw: innerWidth, despues: r('#cn-despues'), local: r('#cn-local-b'), cuenta: r('#cn-cuenta-b'), cuerpoScroll: cu.scrollHeight > cu.clientHeight, dialogo: r('#dlg-conflicto'), ancho: document.documentElement.scrollWidth, foco: document.activeElement?.id, nDif: d.querySelectorAll('#cn-dif li').length }; });
  const d1 = await dm(); await p.screenshot({ path: EVDIR + 'G7-dialogo-320-texto200.png' });
  const vis = r => r.top >= 0 && r.bottom <= d1.vh && r.left >= 0 && r.right <= d1.vw;
  await p.mouse.move(160, 300); await p.mouse.wheel(0, 2000); await p.waitForTimeout(300); const d2 = await dm(), scrolled = await p.evaluate(() => document.querySelector('.cn-cuerpo').scrollTop);
  await p.screenshot({ path: EVDIR + 'G7-dialogo-320-texto200-desplazado.png' });
  const focoDentro = []; for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); focoDentro.push(await p.evaluate(() => { const a = document.activeElement; return !a || a === document.body || !!a.closest('#dlg-conflicto'); })); } // nunca en un control de la página de fondo (el foco puede pasar a la interfaz del navegador)
  await p.click('#cn-despues'); await p.waitForTimeout(250);
  const post = { copia: await copia(id7), cuenta: resumen(await cartera(p, id7)), dialogo: await p.locator('#dlg-conflicto[open]').count() };
  ev('G7', 'Diálogo de conflicto en móvil (320×568, texto ampliado al 200 % SIMULADO, 6 posiciones distintas + nombre)', '«Decidir después» y las dos decisiones alcanzables siempre (cabecera y pie fijos, cuerpo con desplazamiento propio); el foco no sale del diálogo; posponer no elige, no descarta y no escribe',
    `«Decidir después» visible sin desplazar=${vis(d1.despues)} (arriba ${d1.despues.top}); decisiones visibles: «Usar la de la cuenta» ${vis(d1.cuenta)}, «Conservar la local» ${vis(d1.local)} (abajo ${d1.local.bottom}/${d1.vh}); el cuerpo se desplaza=${d1.cuerpoScroll} (scrollTop tras rueda ${scrolled}); tras desplazar siguen visibles: ${vis(d2.despues) && vis(d2.local) && vis(d2.cuenta)}; diferencias listadas ${d1.nDif}; foco inicial «${d1.foco}»; 8 Tab sin salir del diálogo=${focoDentro.every(Boolean)}; ancho de página ${d1.ancho}/${d1.vw}; tras «Decidir después»: diálogo abierto=${post.dialogo}, copia local=${post.copia}, cuenta intacta=${post.cuenta === resumen(ajena7)}`,
    vis(d1.despues) && vis(d1.cuenta) && vis(d1.local) && d1.cuerpoScroll && scrolled > 0 && vis(d2.despues) && vis(d2.local) && d1.foco === 'cn-titulo' && focoDentro.every(Boolean) && d1.ancho <= d1.vw && post.dialogo === 0 && post.copia && post.cuenta === resumen(ajena7), 'G7-dialogo-320-texto200.png');
  ev('G8', 'Sin errores de JavaScript en la batería F', 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, '');
  ev('F9', 'Diálogos «beforeunload» al recargar con cambios sin guardar', 'Se aceptan (el navegador avisa antes de perder cambios) y quedan registrados', `${DIALOGOS.length} diálogos: ${JSON.stringify([...new Set(DIALOGOS)])}`, DIALOGOS.every(x => x === 'beforeunload'));
  await p.ctx.close(); await b.close(); fin('evidencias-F');
})();
