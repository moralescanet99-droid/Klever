// Batería G (ronda 8): respuestas TARDÍAS de guardado/publicación mientras se abre otra cartera (el cliente usa `current` tras un await).
const { chromium, B, EVDIR, ev, T, nuevo, entrar, peso, fin } = require('../ronda5/h.cjs');
(async () => {
  const b = await chromium.launch();
  const token = p => p.evaluate(() => localStorage.getItem('klever_token'));
  const api = async (p, m, path, body) => { const t = await token(p); return p.evaluate(async ([m, path, body, t]) => { const r = await fetch('/api' + path, { method: m, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json() }; }, [m, path, body, t]); };
  const cartera = async (p, id) => (await api(p, 'GET', '/portfolios/' + id)).j;
  const idDe = async p => (await p.evaluate(() => location.hash)).replace('#cartera-', '');
  const guardado = p => p.waitForFunction(() => document.querySelector('#estado-live').textContent.startsWith('Guardada en tu cuenta'));
  const G = p => p.locator('.js-guardar >> visible=true');
  const copia = (p, id) => p.evaluate(id => !!localStorage.getItem('klever_edit_' + id), id);
  const retrasar = (p, id, metodo, ms) => p.route('**/api/portfolios/' + id, async r => { if (r.request().method() === metodo) await new Promise(s => setTimeout(s, ms)); await r.continue(); });
  const abrir = async (p, id) => { await p.evaluate(id => { location.hash = '#cartera-' + id; }, id); await p.waitForFunction(id => location.hash === '#cartera-' + id && document.querySelector('#vista-cartera:not([hidden])'), id); await p.waitForTimeout(400); };

  // ===== G9: un guardado lento de A termina cuando ya estás en B =====
  let p = await nuevo(b, 1440, 900); await entrar(p, 'oro', 'H1'); const idA = await idDe(p); const cA = await cartera(p, idA);
  const nb = await api(p, 'POST', '/portfolios', { nombre: 'Cartera B', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }] }); const idB = nb.j.id;
  await retrasar(p, idA, 'PUT', 1800);
  await p.locator('#pos-tabla tbody tr:has(b:text-is("GLD")) .peso-in').fill('20'); await p.fill('#nombre', 'Nombre de A guardado'); await p.waitForTimeout(150);
  await G(p).click(); await p.waitForTimeout(300);                       // el PUT de A está en vuelo
  await abrir(p, idB);
  const durante = { nombre: await p.inputValue('#nombre'), estado: await T(p, '#estado') };
  await p.waitForTimeout(2200);                                          // llega la respuesta de A
  const trasA = { nombre: await p.inputValue('#nombre'), estado: await T(p, '#estado'), pesos: await p.locator('.peso-in >> visible=true').evaluateAll(es => es.map(e => e.value)).then(v => v.join(' ')), chip: await T(p, '#chip') };
  const cAfin = await cartera(p, idA);
  await p.screenshot({ path: EVDIR + 'H1-respuesta-tardia-1440.png' });
  // B debe seguir siendo editable y guardable con SU revisión
  const pesoB = p.locator('.peso-in >> visible=true').first(); await pesoB.fill('40'); await p.locator('.peso-in >> visible=true').nth(1).fill('60'); await p.waitForTimeout(150);
  const habilB = !(await G(p).isDisabled()); if (habilB) { await G(p).click(); await p.waitForTimeout(1500); }
  const trasB = { habil: habilB, conflicto: await p.locator('#dlg-conflicto[open]').count(), estado: await T(p, '#estado'), cuenta: (await cartera(p, idB)) };
  ev('H1', 'Guardado lento de A que termina cuando ya se ha abierto B', 'La respuesta de A no modifica B (nombre, estado, revisión ni copia local); A queda guardada; B se puede editar y guardar después sin falso conflicto',
    `durante: B «${durante.nombre}» / «${durante.estado}»; tras la respuesta de A: B «${trasA.nombre}» / «${trasA.estado}», pesos ${trasA.pesos}; A en la cuenta: «${cAfin.nombre}», revisión ${cAfin.revision}; copia local de A=${await copia(p, idA)}, de B=${await copia(p, idB)}; guardar B después: botón Guardar activo=${trasB.habil}, diálogo de conflicto=${trasB.conflicto}, estado «${trasB.estado}», cuenta B «${trasB.cuenta.nombre}» ${trasB.cuenta.posiciones.map(x => x.ticker + ':' + x.peso).sort().join(',')}`,
    durante.nombre === 'Cartera B' && trasA.nombre === 'Cartera B' && trasA.estado === 'Guardada en tu cuenta' && cAfin.nombre === 'Nombre de A guardado' && cAfin.revision === cA.revision + 1 && !(await copia(p, idA)) && !(await copia(p, idB)) && trasB.habil && trasB.conflicto === 0 && trasB.estado === 'Guardada en tu cuenta' && trasB.cuenta.nombre === 'Cartera B' && trasB.cuenta.posiciones.map(x => x.peso).sort().join() === '40,60', 'H1-respuesta-tardia-1440.png');
  await p.ctx.close();

  // ===== G10: una publicación lenta de A termina cuando ya estás en B =====
  p = await nuevo(b, 1440, 900); await entrar(p, 'oro', 'H2'); const idA2 = await idDe(p);
  const nb2 = await api(p, 'POST', '/portfolios', { nombre: 'Cartera B2', plantilla: 'dividendos', posiciones: [{ ticker: 'KO', peso: 50 }, { ticker: 'PG', peso: 50 }] }); const idB2 = nb2.j.id;
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); await p.fill('#tesis', 'Tesis de A'); await p.waitForTimeout(100);
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Pública'); await p.waitForTimeout(300);
  await p.click('#publicar'); await p.waitForFunction(() => document.querySelector('#chip').textContent === 'Privada'); await p.waitForTimeout(300); // vuelve a privada (para publicar de nuevo con retraso)
  await retrasar(p, idA2, 'PATCH', 1800);
  await p.click('#publicar'); await p.waitForTimeout(300);
  await abrir(p, idB2);
  await p.waitForTimeout(2200);
  const g10 = { nombre: await p.inputValue('#nombre'), chip: await T(p, '#chip'), publicaA: (await cartera(p, idA2)).publico };
  await p.evaluate(() => { document.querySelector('#det-pub').open = true; }); const botonPub = await T(p, '#publicar');
  await p.locator('.peso-in >> visible=true').first().fill('45'); await p.locator('.peso-in >> visible=true').nth(1).fill('55'); await p.waitForTimeout(150); const habil2 = !(await G(p).isDisabled()); if (habil2) { await G(p).click(); await p.waitForTimeout(1500); }
  ev('H2', 'Publicación lenta de A que termina cuando ya se ha abierto B', 'A queda pública en el servidor; B sigue privada en pantalla («Privada», botón «Publicar cartera») y se guarda sin conflicto',
    `B «${g10.nombre}»: chip «${g10.chip}», botón «${botonPub}»; A pública en la cuenta=${g10.publicaA}; guardar B después: botón Guardar activo=${habil2}, estado «${await T(p, '#estado')}», diálogo de conflicto=${await p.locator('#dlg-conflicto[open]').count()}`,
    g10.nombre === 'Cartera B2' && g10.chip === 'Privada' && botonPub === 'Publicar cartera' && g10.publicaA === 1 && habil2 && (await T(p, '#estado')) === 'Guardada en tu cuenta' && (await p.locator('#dlg-conflicto[open]').count()) === 0, '');
  ev('H3', 'Sin errores de JavaScript en la batería G', 'Ninguno', p.errs.length ? p.errs.join('|') : 'ninguno', p.errs.length === 0, '');
  await p.ctx.close(); await b.close(); fin('evidencias-G');
})();
