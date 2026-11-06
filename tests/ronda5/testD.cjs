// Bloque D (ronda 5): escenarios con evidencia. Cada ev() guarda escenario · esperado · observado · evidencia.
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin, mail } = require('./h.cjs');
const EV = EVDIR;
(async () => {
  const b = await chromium.launch();
  const token = p => p.evaluate(() => localStorage.getItem('klever_token'));
  const api = async (p, m, path, body) => { const t = await token(p); return p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, path, body, t]); };
  const pub = async (p, id) => p.evaluate(async id => { const r = await fetch('/api/public/' + id); return r.status === 200 ? (await r.json()).posiciones.map(x => x.ticker + ':' + x.peso).join(',') : 'HTTP ' + r.status; }, id);
  const guardado = p => p.waitForFunction(() => document.querySelector('#estado-live').textContent.startsWith('Guardada en tu cuenta'));
  const G = p => p.locator('.js-guardar >> visible=true');

  // ===== E1-E3: «Mis carteras» =====
  let p = await nuevo(b, 390, 844); await p.goto(B); await p.click('[data-plantilla=oro]'); await p.waitForSelector('#vista-cartera:not([hidden])'); await p.click('.js-guardar >> visible=true');
  await p.fill('#acc-email', mail('D0')); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  // cuenta nueva SIN carteras: no migrar el borrador (lo limpiamos antes de entrar)
  const link0 = await p.getAttribute('#acc-dev a', 'href'); await p.evaluate(() => localStorage.removeItem('klever_borrador')); await p.goto(link0); await p.waitForSelector('#vista-carteras:not([hidden])'); await p.waitForTimeout(500);
  await p.screenshot({ path: EV + 'E2-mis-carteras-vacia-390.png' });
  ev('E2', 'Mis carteras sin carteras', 'La creación es la acción principal (formulario abierto, sin botón «Nueva cartera»)', `título «${await T(p, '#nueva-titulo')}»; formulario visible=${await p.isVisible('#form-nueva')}; botón «Nueva cartera» visible=${await p.isVisible('#btn-nueva')}; botón primario «${await T(p, '#form-nueva .btn-primario')}»`,
    (await T(p, '#nueva-titulo')) === 'Crea tu primera cartera' && await p.isVisible('#form-nueva') && !(await p.isVisible('#btn-nueva')) && await p.locator('#form-nueva .btn-primario').isVisible(), 'E2-mis-carteras-vacia-390.png');
  // dos carteras por API: una solo creada (sin modificar) y otra con posiciones
  const A = await api(p, 'POST', '/portfolios', { nombre: 'Solo creada', plantilla: 'oro' });
  const Bc = await api(p, 'POST', '/portfolios', { nombre: 'Con posiciones y un nombre largo para comprobar el ajuste en pantallas pequeñas', plantilla: 'dividendos' });
  await api(p, 'PUT', `/portfolios/${Bc.j.id}`, { posiciones: [{ ticker: 'KO', peso: 40 }, { ticker: 'PG', peso: 48 }], revision: 0 });
  await p.goto(B + '#carteras'); await p.reload(); await p.waitForSelector('.cartera-item'); await p.waitForTimeout(300);
  await p.screenshot({ path: EV + 'E1-mis-carteras-390.png', fullPage: true });
  ev('E1', 'Mis carteras con carteras', 'Las carteras guardadas primero; «Nueva cartera» como botón; formulario cerrado', `items=${await p.locator('.cartera-item').count()}; formulario oculto=${await p.locator('#form-nueva').isHidden()}; botón «Nueva cartera» visible=${await p.isVisible('#btn-nueva')}; la lista aparece por encima del formulario`,
    (await p.locator('.cartera-item').count()) === 2 && await p.locator('#form-nueva').isHidden() && await p.isVisible('#btn-nueva'), 'E1-mis-carteras-390.png');
  await p.click('#btn-nueva'); const ok_ = await p.isVisible('#form-nueva') && (await p.evaluate(() => document.activeElement.id)) === 'nueva-nombre';
  ev('E1b', 'Abrir «Nueva cartera»', 'El formulario solo se abre al pulsar el botón y toma el foco', `formulario visible=${await p.isVisible('#form-nueva')}; foco en «${await p.evaluate(() => document.activeElement.id)}»; aria-expanded=${await p.getAttribute('#btn-nueva', 'aria-expanded')}`, ok_, '');
  await p.click('#nueva-cancelar');
  const txt = (await T(p, '#mis-lista')).replace(/\s+/g, ' ');
  ev('E3', 'Datos de cada cartera', 'Nombre, privada/pública, posiciones, total asignado y última modificación SOLO si existe', `«${txt}»`,
    txt.includes('Con posiciones') && txt.includes('Privada') && /Falta asignar 12\s%.*2 posiciones/.test(txt) && txt.includes('Modificada el') && txt.includes('Sin posiciones') && /Solo creada.*Creada el/.test(txt) && !/Solo creada.*Modificada/.test(txt), 'E1-mis-carteras-390.png');
  ev('E3b', 'Fechas no inventadas', 'Una cartera nunca modificada muestra «Creada el», no «Modificada»', `actualizado_en de «Solo creada» = ${JSON.stringify((await api(p, 'GET', '/portfolios')).j.find(x => x.nombre === 'Solo creada').actualizado_en)}; texto: ${/Solo creada.*?(Creada el [^A]*)/.exec(txt)?.[1]?.trim()}`,
    (await api(p, 'GET', '/portfolios')).j.find(x => x.nombre === 'Solo creada').actualizado_en === null, '');
  await p.ctx.close();

  // ===== E4-E8: 88 / 100 / 103 %, bloqueo visual, pública, persistencia, toast =====
  p = await nuevo(b, 1440, 900); await entrar(p, 'dividendos', 'D1');
  const id = (await p.evaluate(() => location.hash)).replace('#cartera-', '');
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Mi tesis de prueba.');
  // 88 %
  await peso(p).fill('5'); await p.waitForTimeout(150);
  const est88 = { guardar: !(await G(p).isDisabled()), publicar: !(await p.locator('#publicar').isDisabled()), razon: await T(p, '#pub-razon'), falta: await T(p, '#r-falta') };
  await G(p).click(); await guardado(p);
  const s88 = await api(p, 'PATCH', `/portfolios/${id}`, { publico: true, tesis: 'x' });
  await p.screenshot({ path: EV + 'E4-88-escritorio.png' });
  ev('E4a', 'Cartera privada al 88 %', 'Se guarda en privado como reparto incompleto; NO se publica (interfaz y servidor); sin efectivo implícito', `${est88.falta}; Guardar activo=${est88.guardar}; Publicar activo=${est88.publicar}; motivo: «${est88.razon}»; guardado=${await T(p, '#estado')}; servidor al publicar: HTTP ${s88.s} «${s88.j.error}»`,
    est88.guardar && !est88.publicar && est88.falta === 'Pendiente de asignar: 12 %' && s88.s === 400, 'E4-88-escritorio.png');
  // 100 %
  await peso(p).fill('17'); await p.waitForTimeout(150); await G(p).click(); await guardado(p);
  const est100 = { publicar: !(await p.locator('#publicar').isDisabled()), asignado: await T(p, '#rb-total') };
  await p.screenshot({ path: EV + 'E4-100-escritorio.png' });
  ev('E4b', 'Cartera privada al 100 %', 'Se guarda y puede publicarse (con tesis)', `${est100.asignado}; Publicar activo=${est100.publicar}; ${await T(p, '#estado')}`, est100.publicar && est100.asignado === 'Asignado: 100 %', 'E4-100-escritorio.png');
  // 103 %
  await peso(p).fill('20'); await p.waitForTimeout(700);   // ronda 20: 700 ms (antes 200): el campo activo se centra con un desplazamiento diferido de 300 ms (app.js, focusin); medir las cajas durante ese desplazamiento daba E5 intermitente (motivo en y=2 y Guardar en y=184)
  const gDis = await G(p).isDisabled(), pDis = await p.locator('#publicar').isDisabled();
  const estilo = async sel => p.evaluate(s => { const e = document.querySelector(s), c = getComputedStyle(e); return { color: c.color, cursor: c.cursor, borde: c.borderTopStyle, fondo: c.backgroundColor }; }, sel);
  const eG = await estilo('.ws-acc .js-guardar'), eP = await estilo('#publicar');
  const mismoColor = eG.color === eP.color && eG.cursor === eP.cursor && eG.cursor === 'not-allowed';
  const rP = await p.locator('#publicar').boundingBox(), zP = await p.locator('#pub-razon').boundingBox(), rG = await G(p).boundingBox(), mG = await p.locator('#motivo').boundingBox();
  const cercaP = Math.abs(zP.y - (rP.y + rP.height)) < 40 || (zP.x >= rP.x + rP.width && Math.abs(zP.y - rP.y) < 40);
  const cercaG = Math.abs((mG.x + mG.width) - rG.x) < 24 && Math.abs(mG.y - rG.y) < 60;
  const s103 = await api(p, 'PUT', `/portfolios/${id}`, { posiciones: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 43 }] });
  await p.screenshot({ path: EV + 'E4-103-escritorio.png' });
  ev('E4c', 'Cartera privada al 103 %', 'No se guarda ni se publica; motivo junto a cada acción; cambios conservados en el dispositivo', `Guardar desactivado=${gDis}; Publicar desactivado=${pDis}; ${await T(p, '#motivo')}; publicar: «${await T(p, '#pub-razon')}»; servidor PUT 103 %: HTTP ${s103.s}; copia local=${await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id)}`,
    gDis && pDis && (await T(p, '#motivo')).includes('Exceso de asignación: 3 %') && s103.s === 400 && await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id), 'E4-103-escritorio.png');
  ev('E5', 'Publicar desactivado se ve como Guardar desactivado', 'Mismo tratamiento visual y motivo pegado a cada botón', `color Guardar ${eG.color} / Publicar ${eP.color}; cursor ${eG.cursor} / ${eP.cursor}; borde Guardar ${eG.borde} / Publicar ${eP.borde}; motivo junto a Publicar=${cercaP}; motivo junto a Guardar=${cercaG} (motivo x ${Math.round(mG.x)} ancho ${Math.round(mG.width)} y ${Math.round(mG.y)}; Guardar x ${Math.round(rG.x)} y ${Math.round(rG.y)})`, mismoColor && eP.borde === 'dashed' && cercaP && cercaG, 'E4-103-escritorio.png');
  // persistencia visible + validez
  const per = await T(p, '#estado'), mot = await T(p, '#motivo');
  ev('E7', 'Con error de asignación, la persistencia sigue visible', 'Texto explícito de persistencia + motivo del bloqueo + privacidad, por separado', `persistencia «${per}»; validez «${mot}»; privacidad «${await T(p, '#chip')}»; el ⓘ solo amplía`, per.startsWith('Cambios locales pendientes de guardar en tu cuenta') && mot.includes('Exceso') && mot.includes('Reduce los pesos hasta sumar 100 %') && (await T(p, '#chip')) === 'Privada', 'E4-103-escritorio.png');
  // vuelve a 100, guarda y mide el aviso flotante
  await peso(p).fill('17'); await p.waitForTimeout(150); await G(p).click(); await guardado(p); await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(450);   // ronda 11: «no tapa campos» se mide con el aviso en su sitio (inicio de la página); con la página desplazada el contenido pasa por debajo de la zona fija y lo que se exige es que ninguna acción quede inaccesible (H1c).
  //  el aviso anima su altura (200 ms); se mide ya asentado, con la geometría de los campos del mismo instante (el solape durante la animación lo cubre H1a con el rectángulo VISIBLE)
  const toast = await T(p, '#toast'), tb = await p.locator('#toast').boundingBox();
  const campos = await p.evaluate(() => ['#nombre', '#buscar-activo', '.peso-in', '#tesis'].map(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return [s, r.top, r.bottom, r.left, r.right]; }).filter(Boolean));
  const solapa = campos.some(([s, t, bo, l, r]) => !(tb.y + tb.height < t || tb.y > bo || tb.x + tb.width < l || tb.x > r));
  const textoEditor = await p.evaluate(() => document.querySelector('#vista-cartera').innerText);
  ev('E8', 'Aviso flotante y vocabulario', 'El aviso dice «Cartera guardada», no tapa campos editables y no se llama «borrador» a una cartera guardada', `aviso «${toast}»; solapa campos=${solapa}; aparece «borrador» en el editor de una cartera guardada=${/borrador/i.test(textoEditor)}`, toast === 'Cartera guardada' && !solapa && !/borrador/i.test(textoEditor), '');
  ev('E7b', 'Guardada', 'Texto «Guardada en tu cuenta»', await T(p, '#estado'), (await T(p, '#estado')) === 'Guardada en tu cuenta', '');

  // ===== E6: pública con edición inválida =====
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública');
  const antes = await pub(p, id);
  await peso(p).fill('25'); await p.waitForTimeout(200);                      // 108 % mientras es pública
  const durante = await pub(p, id), mG2 = await T(p, '#motivo'), chip = await T(p, '#chip');
  const noGuardar = await G(p).isDisabled(), copia = await p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id);
  const rIncompleto = await api(p, 'PUT', `/portfolios/${id}`, { posiciones: [{ ticker: 'KO', peso: 30 }] });
  await p.screenshot({ path: EV + 'E6-publica-invalida-escritorio.png' });
  await p.reload(); await p.waitForSelector('#pos-tabla tbody tr'); await p.waitForTimeout(400);
  const tras = await pub(p, id), valorRecuperado = await peso(p).inputValue();
  await peso(p).fill('18'); await peso(p, 1).fill('15,6'); await p.waitForTimeout(200);
  const okGuardar = !(await G(p).isDisabled()); await G(p).click(); await guardado(p);
  const despues = await pub(p, id);
  ev('E6', 'Edición inválida de una cartera pública', 'La versión publicada no cambia mientras el borrador es inválido; se recupera tras recargar; al ser válido de nuevo se guarda sin despublicar', `publicada antes «${antes}»; durante la edición (108 %) «${durante}» (igual=${antes === durante}); Guardar desactivado=${noGuardar}; chip=${chip}; copia local=${copia}; servidor PUT incompleto: HTTP ${rIncompleto.s}; tras recargar sigue «${tras}» con el valor recuperado ${valorRecuperado}; al corregir, Guardar activo=${okGuardar}; versión publicada final «${despues}» (cambió=${despues !== antes}); chip final=${await T(p, '#chip')}`,
    antes === durante && antes === tras && noGuardar && chip === 'Pública' && copia && rIncompleto.s === 400 && valorRecuperado === '25,0' && okGuardar && despues !== antes && (await T(p, '#chip')) === 'Pública', 'E6-publica-invalida-escritorio.png');
  await p.ctx.close();

  // ===== E12: guardado fallido y recuperación; E14 regreso desde Mis carteras =====
  p = await nuevo(b, 390, 844); await entrar(p, 'oro', 'D2'); const id2 = (await p.evaluate(() => location.hash)).replace('#cartera-', '');
  await peso(p).fill('30'); await p.waitForTimeout(100); await peso(p, 1).fill('20'); await p.waitForTimeout(100);
  await p.route('**/api/portfolios/*', r => r.request().method() === 'PUT' ? r.abort() : r.continue());
  await p.locator('#barra-guardar .js-guardar').click(); await p.waitForTimeout(500);
  const fallo = await T(p, '#estado'), brev = await T(p, '#b-estado'), toastF = await p.locator('#toast.on').count();
  await p.screenshot({ path: EV + 'E12-fallo-390.png' });
  await p.unroute('**/api/portfolios/*'); const antesRec = [await peso(p).inputValue(), await peso(p, 1).inputValue()];
  await p.locator('#barra-guardar .js-guardar').click(); await guardado(p);
  ev('E12', 'Guardado fallido y recuperación', 'Se muestra «No se pudo guardar», sin confirmar; los cambios siguen en pantalla y en el dispositivo; al reintentar se guarda', `tras fallar: «${fallo}» / barra «${brev}»; confirmación flotante=${toastF}; valores conservados ${antesRec.join(' y ')}; tras reintentar: «${await T(p, '#estado')}»`,
    fallo.startsWith('No se pudo guardar') && fallo.includes('siguen en este dispositivo') && toastF === 0 && antesRec[0] === '30,0' && (await T(p, '#estado')) === 'Guardada en tu cuenta', 'E12-fallo-390.png');
  await p.goto(B + '#carteras'); await p.waitForSelector('.cartera-item'); await p.click('.cartera-item'); await p.waitForSelector('#pos-cards .pos-card');
  ev('E14', 'Regreso desde «Mis carteras»', 'Se abre la versión guardada con sus pesos y «Guardada en tu cuenta»', `pesos ${await peso(p).inputValue()} y ${await peso(p, 1).inputValue()}; estado «${await T(p, '#estado')}»; hash ${await p.evaluate(() => location.hash)}`, (await peso(p).inputValue()) === '30,0' && (await T(p, '#estado')) === 'Guardada en tu cuenta', '');
  // E15: teclado móvil abierto, última posición (emulado)
  await p.setViewportSize({ width: 390, height: 420 }); await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); const inputs = p.locator('.peso-in >> visible=true'); await inputs.last().focus(); await p.waitForTimeout(600);
  await inputs.last().fill('12,5'); await p.waitForTimeout(150);
  const pk = await p.evaluate(() => { const e = document.activeElement.getBoundingClientRect(), bar = document.querySelector('#barra-guardar').getBoundingClientRect(); return { top: Math.round(e.top), bottom: Math.round(e.bottom), barra: Math.round(bar.top), vh: innerHeight, valor: document.activeElement.value }; });
  await p.screenshot({ path: EV + 'E15-teclado-emulado-390x420.png' });
  ev('E15', 'Teclado móvil abierto al editar la última posición (EMULADO: ventana de 390×420)', 'El campo queda visible, por encima de la barra, y acepta el valor', `campo ${pk.top}–${pk.bottom} px; barra desde ${pk.barra}; ventana ${pk.vh}; valor ${pk.valor}`, pk.top >= 0 && pk.bottom <= pk.barra && pk.valor === '12,5', 'E15-teclado-emulado-390x420.png');
  await p.ctx.close();

  // ===== E13: acceso por email, mismo navegador y otro =====
  p = await nuevo(b, 1440, 900); await p.goto(B); await p.click('[data-plantilla=riesgo]'); await peso(p).fill('16'); await p.click('.js-guardar >> visible=true'); await p.fill('#acc-email', mail('D3')); await p.check('#acc-acepto'); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])');
  const aviso = await T(p, '#acc-aviso-borrador'), linkE = await p.getAttribute('#acc-dev a', 'href'); const q = await nuevo(b, 1440, 900); await q.goto(linkE); await q.waitForSelector('#vista-carteras:not([hidden])'); await q.waitForTimeout(400);
  await q.waitForSelector('#vista-carteras:not([hidden])'); const toastQ = await T(q, '#aviso-cuenta'), toastCortoQ = await q.locator('#toast.on').count(), draftQ = await q.evaluate(() => localStorage.getItem('klever_borrador')), draftP = await p.evaluate(() => JSON.parse(localStorage.getItem('klever_borrador')).pos[0].peso);
  await q.screenshot({ path: EV + 'E13-otro-navegador.png' });
  ev('E13b', 'Acceso por email en OTRO navegador', 'Se entra, pero NO se guarda el borrador y se avisa sin prometerlo', `aviso previo: «${aviso.slice(0, 120)}…»; aviso persistente al entrar: «${toastQ.replace(/\s+/g, ' ')}» (toasts flotantes: ${toastCortoQ}); borrador en el otro navegador=${draftQ}; borrador original sigue en el primero (peso ${draftP}); carteras creadas=${await q.locator('.cartera-item').count()}`,
    aviso.includes('solo si abres el enlace en este mismo dispositivo') && toastQ.includes('todavía no se ha guardado en la cuenta') && toastQ.includes('Vuelve al navegador donde lo creaste') && toastCortoQ === 0 && draftQ === null && draftP === 16 && (await q.locator('.cartera-item').count()) === 0, 'E13-otro-navegador.png'); await q.ctx.close();
  await p.click('#acc-cambiar'); await p.fill('#acc-email', mail('D3b')); await p.click('#form-acceso button'); await p.waitForSelector('#acc-paso2:not([hidden])'); await p.goto(await p.getAttribute('#acc-dev a', 'href'));
  await p.waitForFunction(() => document.querySelector('#estado-live')?.textContent.startsWith('Guardada')); 
  ev('E13a', 'Acceso por email en el MISMO navegador', 'El borrador pasa a la cuenta con sus pesos y se borra del dispositivo', `hash ${await p.evaluate(() => location.hash)}; pesos ${(await p.locator('.peso-in >> visible=true').evaluateAll(e => e.map(x => x.value))).join(' ')} (el editado es 16,0); borrador local=${await p.evaluate(() => localStorage.getItem('klever_borrador'))}; estado «${await T(p, '#estado')}»`,
    /^#cartera-\d+$/.test(await p.evaluate(() => location.hash)) && (await p.locator('.peso-in >> visible=true').evaluateAll(e => e.map(x => x.value))).includes('16,0') && (await p.evaluate(() => localStorage.getItem('klever_borrador'))) === null, ''); await p.ctx.close();

  // ===== E9: resumen y exceso a 360 px =====
  p = await nuevo(b, 360, 780); await entrar(p, 'dividendos', 'D4'); await peso(p).fill('30'); await p.waitForTimeout(200);
  const m360 = await p.evaluate(() => ({ ancho: document.documentElement.scrollWidth, fuente: getComputedStyle(document.querySelector('#comp-pie')).fontSize, barra: Math.round(document.querySelector('#barra-guardar').getBoundingClientRect().height), rb: document.querySelector('#comp-pie').textContent, bt: document.querySelector('#b-total').textContent, be: document.querySelector('#b-estado').textContent, desborde: [...document.querySelectorAll('#barra-guardar *')].some(e => e.getBoundingClientRect().right > innerWidth + 1) }));
  await p.screenshot({ path: EV + 'E9-exceso-360.png' });
  // ronda 18: en móvil el resumen detallado vive en el paso «Revisión»: se abre, se lee y se vuelve a «Distribución»
  await p.evaluate(() => document.querySelector('.js-revisar').click()); await p.waitForSelector('#vista-cartera[data-paso="3"]'); await p.waitForTimeout(300);
  const resumenTxt = await p.evaluate(() => document.querySelector('#vista-cartera').innerText);
  // Ronda 10: la nota de categorías pasó al desplegable «Más sobre las categorías» (menos texto secundario visible): debe seguir existiendo, dentro de ese desplegable accesible
  const notaCat = await p.evaluate(() => { const x = [...document.querySelectorAll('#res-detalle p')].find(e => e.textContent.includes('Los ETF se agrupan por tipo; no se desglosan sus empresas.')); return { existe: !!x, enDesplegable: !!x?.closest('details'), visible: !!x?.offsetParent && x.getBoundingClientRect().height > 0 && !x.closest('details:not([open])') }; });
  ev('E9a', 'Exceso de asignación a 360 px', 'Se lee bien sin reducir la letra; sin desbordamiento; barra ≤ 88 px', `página ${m360.ancho}/360 px; texto del exceso a ${m360.fuente}; barra ${m360.barra} px; resumen «${m360.rb}»; barra «${m360.bt}» · «${m360.be}»; contenido de la barra fuera de pantalla=${m360.desborde}`,
    m360.ancho <= 360 && parseFloat(m360.fuente) >= 16 && m360.barra <= 88 && !m360.desborde && m360.rb.startsWith('⚠ Exceso de asignación'), 'E9-exceso-360.png');
  ev('E9b', 'Etiquetas del resumen', '«Asignado: 100 %» sin «100,0 % ✓ 100 % asignado»; «No representa la rentabilidad de tu cartera»; categorías con nota breve', `«✓ 100 % asignado» aparece=${/✓ 100 % asignado|100,0 % ✓/.test(resumenTxt)}; nota ROIC=${resumenTxt.includes('No representa la rentabilidad de tu cartera.')}; nota categorías (en el desplegable, plegada)=${notaCat.existe && notaCat.enDesplegable && !notaCat.visible}; antes visible=${resumenTxt.includes('Los ETF se agrupan por tipo; no se desglosan sus empresas.')}`,
    !/✓ 100 % asignado|100,0 % ✓/.test(resumenTxt) && resumenTxt.includes('No representa la rentabilidad de tu cartera.') && notaCat.existe && notaCat.enDesplegable && !notaCat.visible, '');
  await p.evaluate(() => document.querySelector('#paso-dist').click()); await p.waitForTimeout(300);
  await peso(p).fill('17'); await p.waitForTimeout(150);
  ev('E9c', 'Cobertura: datos ausentes distintos de no aplicable', 'Líneas separadas: «Dato ausente (no disponible)» y «No aplicable»', `«${(await T(p, '#r-cobertura')).replace(/\s+/g, ' ')}»`, (await T(p, '#r-cobertura')).includes('No aplicable') && !(await T(p, '#r-cobertura')).includes('Sin dato:'), '');
  await p.fill('#buscar-activo', 'jpmorgan'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  const cobJ = (await T(p, '#r-cobertura')).replace(/\s+/g, ' ');
  ev('E9d', 'Con una empresa sin dato (JPMorgan)', 'Aparece como «Dato ausente (no disponible)», aparte de los fondos «No aplicable»', cobJ, cobJ.includes('Dato ausente (no disponible): 1 empresa') && cobJ.includes('No aplicable: 2 fondos'), ''); await p.ctx.close();

  // ===== E10: Explorar empresas en móvil =====
  p = await nuevo(b, 390, 844); await p.goto(B + '#empresas'); await p.waitForSelector('.emp-card'); await p.waitForTimeout(300);
  const e1 = await p.evaluate(() => { const c = [...document.querySelectorAll('.emp-card')][0], l1 = c.querySelector('.ec-l1'), n = c.querySelector('.nombre-emp').getBoundingClientRect(), r = c.querySelector('.ec-res').getBoundingClientRect(), l2 = c.querySelector('.ec-l2'), s = c.querySelector('.simbolo').getBoundingClientRect(), v = c.querySelector('.ver-ficha').getBoundingClientRect(); const h1 = document.querySelector('#vista-empresas h1').getBoundingClientRect(), b = document.querySelector('#emp-buscar').getBoundingClientRect(); return { l1misma: Math.abs(n.top - r.top) < 8, l2misma: Math.abs(s.top - v.top) < 20, l2debajo: s.top > n.bottom - 2, distancia: Math.round(b.top - h1.bottom), nombreAncho: Math.round(n.width) }; });
  await p.screenshot({ path: EV + 'E10-empresas-390.png' });
  ev('E10a', 'Explorar empresas en móvil: dos líneas', 'Línea 1: nombre y resultado; línea 2: símbolo, sector y «Ver ficha»; buscador cerca del título', `nombre y resultado en la misma línea=${e1.l1misma}; símbolo/sector/«Ver ficha» en la línea inferior=${e1.l2debajo && e1.l2misma}; distancia título→buscador ${e1.distancia} px; ancho del nombre ${e1.nombreAncho} px`, e1.l1misma && e1.l2debajo && e1.l2misma && e1.distancia < 130, 'E10-empresas-390.png');
  const anchos = []; for (const w of [320, 360, 390]) { await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(150); anchos.push(w + ':' + await p.evaluate(() => document.documentElement.scrollWidth)); }
  await p.fill('#emp-buscar', 'international'); await p.waitForTimeout(200); const largos = await p.locator('.emp-card .nombre-emp').allTextContents();
  await p.fill('#emp-buscar', 'consumo discrecional'); await p.waitForTimeout(200); const nSect = await p.locator('.emp-card').count();
  await p.fill('#emp-buscar', 'jpmorgan'); await p.waitForTimeout(200);
  const jp = await p.evaluate(() => { const c = document.querySelector('.emp-card'), s = c.querySelector('.ec-res small'), col = s ? getComputedStyle(s).color : null; return { txt: c.querySelector('.ec-res').innerText.replace(/\s+/g, ' '), color: col, rojo: col && /rgb\(\s*(1[7-9]\d|2\d\d)\s*,\s*[0-5]?\d\s*,/.test(col) }; });
  await p.screenshot({ path: EV + 'E10-empresas-sin-dato-390.png' });
  ev('E10b', 'Nombres largos, sectores largos, resultados incompletos', 'Sin desbordamiento a 320/360/390; datos ausentes en neutro y como «N superadas · M sin datos», no como fallo', `anchos de página ${anchos.join(', ')}; nombres largos hallados: ${largos.join(' | ')}; empresas de «Consumo discrecional»: ${nSect}; JPMorgan: «${jp.txt}» (color ${jp.color}, rojo=${jp.rojo})`,
    anchos.every(a => parseInt(a.split(':')[1]) <= parseInt(a.split(':')[0])) && largos.length > 0 && jp.txt.includes('superadas') && jp.txt.includes('sin datos') && !/ de 5/.test(jp.txt) && !jp.rojo, 'E10-empresas-sin-dato-390.png');
  await p.ctx.close();

  // ===== E11: ficha, unidad separada y desplazamiento real =====
  p = await nuevo(b, 390, 844); await p.goto(B + '#empresas'); await p.waitForSelector('.emp-card'); await p.locator('.ver-ficha >> visible=true').nth(2).click(); await p.waitForSelector('#dlg-ficha[open]'); await p.waitForTimeout(300);
  const u = await p.evaluate(() => { const li = [...document.querySelectorAll('#fi-cuerpo .checks li')].find(l => l.textContent.includes('Caja libre')), v = li.querySelector('.ck-val .v').getBoundingClientRect(), un = li.querySelector('.ck-val .u').getBoundingClientRect(), crit = li.querySelector('.ck-crit').getBoundingClientRect(), fila = li.getBoundingClientRect(); return { cifra: li.querySelector('.ck-val .v').textContent, unidad: li.querySelector('.ck-val .u').textContent, debajo: un.top >= v.bottom - 2, criterioAncho: Math.round(crit.width), filaAncho: Math.round(fila.width) }; });
  await p.evaluate(() => { document.querySelector('#dlg-ficha').scrollTop = 250; }); await p.screenshot({ path: EV + 'E11-ficha-unidad-390.png' });
  ev('E11a', 'Ficha: cifra y unidad separadas', '«29,6» arriba y «miles de millones de USD» debajo; la regla del criterio conserva ancho', `cifra «${u.cifra}», unidad «${u.unidad}» debajo=${u.debajo}; ancho del criterio ${u.criterioAncho} de ${u.filaAncho} px`, u.debajo && u.unidad === 'miles de millones de USD' && u.criterioAncho > u.filaAncho * 0.5, 'E11-ficha-unidad-390.png');
  const tabla = p.locator('#dlg-ficha .tabla-h'); await tabla.scrollIntoViewIfNeeded(); await tabla.focus();
  const sc0 = await tabla.evaluate(e => e.scrollLeft); for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight'); await p.waitForTimeout(250); const sc1 = await tabla.evaluate(e => e.scrollLeft);
  const sticky = await p.evaluate(() => { const t = document.querySelector('#dlg-ficha .tabla-h'), th = t.querySelector('tbody th'), a = th.getBoundingClientRect().left, c = t.getBoundingClientRect().left; return { desfase: Math.round(a - c), scroll: t.scrollLeft, max: t.scrollWidth - t.clientWidth, ultima: Math.round([...t.querySelectorAll('thead th')].pop().getBoundingClientRect().right - t.getBoundingClientRect().right) }; });
  await p.screenshot({ path: EV + 'E11-ficha-tabla-desplazada-390.png' });
  ev('E11b', 'Tabla histórica: desplazamiento horizontal REAL con teclado (flecha derecha) y columna del año fija', 'La tabla se desplaza dentro de su contenedor, la columna del año queda como referencia y se llega a la última columna', `scrollLeft ${sc0} → ${sc1} de ${sticky.max}; la columna del año sigue a ${sticky.desfase} px del borde izquierdo; la última columna termina ${sticky.ultima} px respecto al borde; página sin desbordar=${(await p.evaluate(() => document.documentElement.scrollWidth)) <= 390}`,
    sc1 > sc0 && sc1 >= sticky.max - 2 && Math.abs(sticky.desfase) <= 2 && sticky.ultima <= 2, 'E11-ficha-tabla-desplazada-390.png'); await p.ctx.close();

  // ===== E16: texto al 200 %, teclado y foco en diálogos =====
  p = await nuevo(b, 390, 844); await entrar(p, 'dividendos', 'D5'); await p.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await p.waitForTimeout(400);
  // E16a CORREGIDA (ronda 8): antes se daba por buena una última posición con el borde inferior en −1979 px (fuera de la ventana). Ahora se desplaza, se ENFOCA y se exige que esté dentro de la ventana y sobre la barra fija.
  const ultimoPeso = p.locator('.peso-in >> visible=true').last(); await ultimoPeso.scrollIntoViewIfNeeded(); await ultimoPeso.focus(); await p.waitForTimeout(700);
  const t200 = await p.evaluate(() => { const bar = document.querySelector('#barra-guardar').getBoundingClientRect(), e = document.activeElement, r = e.getBoundingClientRect(); return { ancho: document.documentElement.scrollWidth, barra: Math.round(bar.height), enfocado: e.classList.contains('peso-in'), ultimoTop: Math.round(r.top), ultimoBottom: Math.round(r.bottom), barraTop: Math.round(bar.top), alto: innerHeight }; });
  await p.screenshot({ path: EV + 'E16-texto-200-editor-390.png' });
  ev('E16a', 'Texto ampliado al 200 % en el editor (APROXIMADO: tamaño de texto de la página, no zoom del navegador)', 'Sin desbordamiento horizontal; la barra crece; la última posición, desplazada y enfocada, queda DENTRO de la ventana y por encima de la barra', `página ${t200.ancho}/390 px; barra ${t200.barra} px; campo enfocado=${t200.enfocado}, arriba ${t200.ultimoTop}, abajo ${t200.ultimoBottom} (ventana ${t200.alto}), la barra empieza en ${t200.barraTop}`, t200.ancho <= 390 && t200.enfocado && t200.ultimoTop >= 0 && t200.ultimoBottom <= t200.barraTop, 'E16-texto-200-editor-390.png');
  await p.evaluate(() => { document.documentElement.style.fontSize = ''; }); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(300);
  const focoDlg = async (abrir, cerrarConEsc, selDlg, opener, nombre) => { await abrir(); await p.waitForSelector(selDlg + '[open]'); const dentro = await p.evaluate(s => document.querySelector(s).contains(document.activeElement), selDlg); let sale = false; for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(s => { const a = document.activeElement; return a !== document.body && !document.querySelector(s).contains(a); }, selDlg)) sale = true; } await p.keyboard.press('Escape'); await p.waitForTimeout(250); const cerrado = !(await p.evaluate(s => document.querySelector(s).open, selDlg)); const vuelve = await p.evaluate(o => { const e = document.querySelector(o); return document.activeElement === e || e.contains(document.activeElement); }, opener); return { nombre, dentro, atrapado: !sale, cerrado, vuelve }; };
  await p.goto(B + '#cartera-' + (await p.evaluate(() => 0) || ''));
  const dl = [];
  await p.goto(B + '#carteras'); await p.waitForSelector('.cartera-item'); await p.click('.cartera-item'); await p.waitForSelector('#pos-tabla tbody tr');
  dl.push(await focoDlg(() => p.click('#estado'), 1, '#dlg-estado', '#estado', 'estado'));
  dl.push(await focoDlg(async () => { await p.click('#mas'); await p.click('#mi-plantilla'); }, 1, '#dlg-confirmar', '#mas', 'confirmación'));
  await p.goto(B + '#empresas'); await p.waitForSelector('[data-t] >> visible=true'); dl.push(await focoDlg(() => p.locator('.ver-ficha >> visible=true').first().focus().then(() => p.keyboard.press('Enter')), 1, '#dlg-ficha', '.ver-ficha', 'ficha'));
  await p.goto(B + '#inicio'); await p.evaluate(() => localStorage.clear()); await p.context().clearCookies(); await p.goto(B); await p.reload(); await p.waitForSelector('#entrar:not([hidden])'); dl.push(await focoDlg(() => p.click('#entrar'), 1, '#dlg-acceso', '#entrar', 'acceso'));
  ev('E16b', 'Foco en diálogos con teclado', 'Al abrir, el foco entra; Tab no sale del diálogo; Escape cierra y el foco vuelve al origen', dl.map(d => `${d.nombre}: entra=${d.dentro}, atrapado=${d.atrapado}, cierra=${d.cerrado}, vuelve=${d.vuelve}`).join(' | '), dl.every(d => d.dentro && d.atrapado && d.cerrado && d.vuelve), '');
  ev('E16c', 'Sin errores de JavaScript en toda la ronda', 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, ''); await p.ctx.close();
  await b.close(); fin('evidencias-D');
})();
