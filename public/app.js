// =====================================================================
// Klever · interfaz. Sin dependencias.
// Vistas (hash): inicio · empresas · publicas · carteras · cartera / cartera-<id>
// =====================================================================

// ---------- utilidades ----------
const store = (() => { const m = {}; return { // tolerante a modo privado / datos bloqueados
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } } }; })();
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = ' '; // espacio duro: número y unidad nunca se separan
const nf = (v, d = 1) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const pct = v => v == null ? '—' : nf(v * 100) + NB + '%';   // fracción: 0,12 → 12,0 %
const pesoTxt = v => nf(v) + NB + '%';                          // ya en puntos porcentuales
const miles = v => v == null ? '—' : nf(v / 1e9);               // miles de millones
const r1 = v => Math.round(v * 10) / 10;
const parsePeso = s => { const n = parseFloat(String(s).trim().replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 4000); }
function hideToast() { clearTimeout(toastTimer); $('#toast').classList.remove('on'); }

const API = '/api';
const tok = () => store.getItem('klever_token');
const logged = () => !!tok();

async function api(path, opts = {}) {
  let r;
  try {
    r = await fetch(API + path, {
      ...opts,
      headers: { 'content-type': 'application/json', ...(tok() ? { authorization: 'Bearer ' + tok() } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch { throw new Error('Sin conexión con el servidor. Inténtalo de nuevo.'); }
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && tok()) sesionCaducada();
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}
async function getJson(path) { const r = await fetch(API + path); if (!r.ok) throw new Error('Error ' + r.status); return r.json(); }

// ---------- plantillas ----------
const PLANTILLAS = {
  riesgo: { nombre: 'crecimiento', tickers: ['NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'] },
  oro: { nombre: 'oro', tickers: ['GLD', 'IAU', 'GDX', 'NEM'] },
  dividendos: { nombre: 'dividendos', tickers: ['SCHD', 'VYM', 'KO', 'PG', 'JNJ', 'XOM'] },
};
const nombrePlantilla = p => PLANTILLAS[p]?.nombre || p;
function repartoPlantilla(plantilla) {
  const t = PLANTILLAS[plantilla].tickers.filter(x => by[x]);
  if (!t.length) return [];
  const w = Math.floor(1000 / t.length) / 10;
  const resto = r1(100 - w * t.length); // el primero absorbe el redondeo
  return t.map((ticker, i) => ({ ticker, peso: i === 0 ? r1(w + resto) : w }));
}

// ---------- estado ----------
let assets = [], by = {};
let current = null;          // { id|null, nombre, plantilla, tesis, publico }
let pos = [];                // [{ ticker, peso }]
let rev = 0, savedRev = 0, saving = false, saveErr = null; // máquina de estados de guardado
const DRAFT = 'klever_borrador';
const leerBorrador = () => { try { return JSON.parse(store.getItem(DRAFT)); } catch { return null; } };
function guardarBorrador() {
  if (logged() || !current || current.id) return;
  store.setItem(DRAFT, JSON.stringify({ plantilla: current.plantilla, nombre: $('#nombre').value || current.nombre, pos }));
}
const totalPeso = () => r1(pos.reduce((s, p) => s + (p.peso || 0), 0));

async function loadAssets() {
  try {
    assets = await getJson('/assets'); by = Object.fromEntries(assets.map(a => [a.ticker, a]));
  } catch { toast('No se pudieron cargar los activos. Recarga la página.'); }
}

// ---------- diálogos ----------
function cerrarAlPulsarFuera(d) { // clic en el fondo (no en el relleno del diálogo)
  d.addEventListener('click', e => {
    if (e.target !== d) return; const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });
}
$$('dialog').forEach(cerrarAlPulsarFuera);
$$('[data-cerrar]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));

function confirmar({ titulo, texto, ok = 'Aceptar', peligro = false }) {
  return new Promise(res => {
    const d = $('#dlg-confirmar');
    $('#cf-titulo').textContent = titulo; $('#cf-texto').textContent = texto;
    const si = $('#cf-si'); si.textContent = ok; si.className = 'btn ' + (peligro ? 'btn-peligro' : 'btn-primario');
    d.returnValue = '';
    d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true });
    d.showModal(); $('#cf-no').focus();
  });
}
$('#cf-si').addEventListener('click', () => $('#dlg-confirmar').close('ok'));
$('#cf-no').addEventListener('click', () => $('#dlg-confirmar').close('no'));

// ---------- acceso por enlace ----------
let accEmail = '', cooldownT = null;
function pasoAcceso(n) { $('#acc-paso1').hidden = n !== 1; $('#acc-paso2').hidden = n !== 2; }
function abrirAcceso(motivo = 'entrar') {
  $('#acc-titulo').textContent = motivo === 'guardar' ? 'Guarda tu cartera' : 'Entrar';
  $('#acc-sub').textContent = motivo === 'caducada'
    ? 'Tu sesión ha caducado. Te enviaremos un enlace para entrar sin contraseña.'
    : motivo === 'guardar'
      ? 'Te enviaremos un enlace para entrar sin contraseña. Tu borrador se guardará al entrar.'
      : 'Te enviaremos un enlace para entrar sin contraseña. Sirve para registrarte y para volver a entrar.';
  $('#acc-error').textContent = ''; $('#acc-error2').textContent = '';
  pasoAcceso(1);
  const d = $('#dlg-acceso'); if (!d.open) d.showModal();
}
function cooldown(seg) {
  const b = $('#acc-reenviar'); clearInterval(cooldownT); let s = seg;
  const pintar = () => { b.disabled = s > 0; b.textContent = s > 0 ? `Reenviar enlace (${s}${NB}s)` : 'Reenviar enlace'; };
  pintar(); cooldownT = setInterval(() => { s--; pintar(); if (s <= 0) clearInterval(cooldownT); }, 1000);
}
async function pedirEnlace(email) {
  const r = await api('/login', { method: 'POST', body: { email, acepto: $('#acc-acepto').checked } });
  accEmail = email;
  $('#acc-enviado').textContent = email;
  $('#acc-dev').innerHTML = r.dev_link ? `Modo desarrollo: <a href="${esc(r.dev_link)}">entrar</a>` : '';
  pasoAcceso(2); cooldown(60);
  $('#acc-reenviar').focus();
}
$('#form-acceso').addEventListener('submit', async e => {
  e.preventDefault(); $('#acc-error').textContent = '';
  const btn = e.target.querySelector('button'); btn.disabled = true;
  try { await pedirEnlace(new FormData(e.target).get('email')); }
  catch (err) { $('#acc-error').textContent = err.message; }
  finally { btn.disabled = false; }
});
$('#acc-reenviar').addEventListener('click', async () => {
  $('#acc-error2').textContent = '';
  try { await pedirEnlace(accEmail); toast('Enlace reenviado'); } catch (err) { $('#acc-error2').textContent = err.message; }
});
$('#acc-cambiar').addEventListener('click', () => { pasoAcceso(1); $('#acc-email').value = accEmail; $('#acc-email').focus(); });
$('#entrar').addEventListener('click', () => abrirAcceso('entrar'));

async function redeem() { // canje del enlace mágico (?login=TOKEN)
  const t = new URLSearchParams(location.search).get('login'); if (!t) return;
  history.replaceState(null, '', location.pathname + location.hash);
  try { const { token } = await api('/verify', { method: 'POST', body: { token: t } }); store.setItem('klever_token', token); }
  catch (err) { toast(err.message); }
}
function sesionCaducada() {
  store.removeItem('klever_token'); current = null; actualizarCabecera(); route(); abrirAcceso('caducada');
}
$('#salir').addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST' }); } catch {}
  store.removeItem('klever_token'); current = null; pos = []; actualizarCabecera(); go('#inicio');
});
function actualizarCabecera() {
  const l = logged();
  $('#entrar').hidden = l; $('#salir').hidden = !l; $('#nav-mis').hidden = !l;
}

// ---------- rutas ----------
const VISTAS = ['inicio', 'empresas', 'publicas', 'carteras', 'cartera'];
const TITULOS = { inicio: 'Crea y entiende tu cartera simulada', empresas: 'Explorar empresas', publicas: 'Carteras públicas', carteras: 'Mis carteras', cartera: 'Editor de cartera' };
let routeSeq = 0;
function go(h) { if (location.hash === h) route(); else location.hash = h; }

async function route(primera = false) {
  const seq = ++routeSeq, l = logged();
  const h = location.hash.replace(/^#/, '');
  if (h === 'contenido') { $('#contenido').focus(); return; }
  const m = h.match(/^cartera-(\d+)$/);
  let v = m ? 'cartera' : h;
  if (!VISTAS.includes(v) || v === 'inicio') v = l ? 'carteras' : 'inicio';
  if (v === 'carteras' && !l) v = 'inicio';
  if (v === 'cartera') {
    if (m) {
      if (!l) v = 'inicio';
      else if (current?.id !== +m[1]) { const ok = await cargarCartera(+m[1]); if (seq !== routeSeq) return; if (!ok) v = 'carteras'; }
    } else if (l) v = 'carteras';
    else if (!current) { const d = leerBorrador(); if (d?.pos?.length) restaurarInvitado(d); else v = 'inicio'; }
  }
  mostrar(v, primera);
}
function mostrar(v, primera) {
  $$('[data-vista]').forEach(s => s.hidden = s.dataset.vista !== v);
  $$('[data-nav]').forEach(a => a.dataset.nav === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  document.body.classList.toggle('en-cartera', v === 'cartera');
  $('#barra-guardar').hidden = v !== 'cartera';
  document.title = 'Klever · ' + TITULOS[v];
  if (v === 'cartera') renderWorkspace();
  if (v === 'carteras') cargarMisCarteras();
  if (!primera) { window.scrollTo(0, 0); $('#contenido').focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', () => route());

// ---------- carteras del usuario ----------
async function cargarMisCarteras() {
  const ul = $('#mis-lista'); ul.innerHTML = '<li class="estado-lista">Cargando tus carteras…</li>';
  try {
    const list = await api('/portfolios');
    ul.innerHTML = list.length ? list.map(p => `<li><button class="tarjeta" type="button" data-id="${p.id}" aria-label="Abrir ${esc(p.nombre)}">
        <span><b>${esc(p.nombre)}</b><span class="t-meta" style="display:block">Plantilla ${esc(nombrePlantilla(p.plantilla))} · ${p.publico ? 'Pública' : 'Privada'}</span></span><span class="pl-acc">Abrir</span></button></li>`).join('')
      : '<li class="estado-lista">Aún no tienes carteras. Crea la primera con el formulario de arriba.</li>';
  } catch (err) { ul.innerHTML = `<li class="estado-lista">No se pudieron cargar tus carteras. <button class="enlace" data-retry="mis" type="button">Reintentar</button></li>`; }
}
$('#mis-lista').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) go('#cartera-' + b.dataset.id); });
$('#form-nueva').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target), btn = e.target.querySelector('button.btn-primario'); btn.disabled = true;
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla') } });
    try { await api('/portfolios/' + id, { method: 'PUT', body: { posiciones: repartoPlantilla(f.get('plantilla')) } }); } catch (err) { toast(err.message); }
    e.target.reset(); go('#cartera-' + id);
  } catch (err) { toast(err.message); } finally { btn.disabled = false; }
});
async function cargarCartera(id) {
  try {
    const c = await api('/portfolios/' + id);
    current = { id: c.id, nombre: c.nombre, plantilla: c.plantilla, tesis: c.tesis || '', publico: c.publico };
    pos = c.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso })); rev = savedRev = 0; saveErr = null;
    chartEls.clear(); $('#graficos').innerHTML = ''; return true;
  } catch (err) { toast(err.message); return false; }
}
function abrirInvitado(plantilla) {
  current = { id: null, nombre: 'Mi cartera de ' + nombrePlantilla(plantilla), plantilla, tesis: '', publico: 0 };
  pos = repartoPlantilla(plantilla); rev = savedRev = 0; saveErr = null; chartEls.clear(); $('#graficos').innerHTML = '';
  guardarBorrador(); go('#cartera');
}
function restaurarInvitado(d) {
  current = { id: null, nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla, tesis: '', publico: 0 };
  pos = d.pos; rev = savedRev = 0; saveErr = null;
}
async function migrarBorrador() { // al entrar, el borrador pasa a la cuenta
  const d = leerBorrador(); if (!d) return;
  if (!d.pos?.length) { store.removeItem(DRAFT); return; }
  let ps = d.pos, ajustado = false;
  const tot = ps.reduce((s, x) => s + x.peso, 0);
  if (tot > 100.0001) { const k = 100 / tot; ps = ps.map(x => ({ ticker: x.ticker, peso: Math.floor(x.peso * k * 10) / 10 })); ajustado = true; }
  let id = null;
  try {
    ({ id } = await api('/portfolios', { method: 'POST', body: { nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla } }));
    await api('/portfolios/' + id, { method: 'PUT', body: { posiciones: ps } });
    store.removeItem(DRAFT); // el borrador solo se borra cuando todo se ha guardado
    toast(ajustado ? 'Guardada en tu cuenta. Los pesos pasaban de 100 %, los hemos ajustado en proporción.' : 'Hemos guardado tu cartera en tu cuenta');
    location.hash = '#cartera-' + id;
  } catch (err) {
    if (id) { try { await api('/portfolios/' + id, { method: 'DELETE' }); } catch {} } // no dejar una cartera vacía a medias
    toast('No se pudo guardar tu borrador (' + err.message + '). Sigue en este navegador.');
  }
}

// ---------- cálculo del resumen ----------
function calcResumen(ps) {
  const total = r1(ps.reduce((s, p) => s + (p.peso || 0), 0));
  const con = ps.filter(p => by[p.ticker]?.roic != null && p.peso > 0);
  const wCon = con.reduce((s, p) => s + p.peso, 0);
  const sec = {};
  for (const p of ps) { const s = by[p.ticker]?.sector || 'Sin sector'; sec[s] = (sec[s] || 0) + (p.peso || 0); }
  return {
    total, n: ps.length, nCon: con.length,
    roic: wCon ? con.reduce((s, p) => s + by[p.ticker].roic * p.peso, 0) / wCon : null, // se excluyen los activos sin dato (no cuentan como 0)
    cobertura: total ? wCon / total : 0,
    sectores: Object.entries(sec).sort((a, b) => b[1] - a[1]),
  };
}

// ---------- espacio de trabajo ----------
function renderWorkspace() {
  if (!current) return;
  const l = logged();
  $$('.solo-cuenta').forEach(e => e.hidden = !l);
  $('#mi-eliminar').hidden = !l;
  $('#nombre').value = current.nombre; $('#tesis').value = current.tesis || '';
  $('#pub-error').textContent = '';
  pintarChips(); renderPosiciones(); renderResumen(); renderCharts(); pintarEstado();
}
function pintarChips() {
  const l = logged(), pub = !!current?.publico;
  const c = $('#chip'); c.textContent = !l ? 'Borrador' : pub ? 'Pública' : 'Privada'; c.classList.toggle('pub', l && pub);
  const pc = $('#pub-chip'); pc.textContent = pub ? 'Pública' : 'Privada'; pc.classList.toggle('pub', pub);
  $('#publicar').textContent = pub ? 'Dejar de publicar' : 'Publicar cartera';
  $('#tesis-guardar').hidden = !pub;
}

function filaTabla(p, i) {
  const a = by[p.ticker] || {};
  return `<tr><td><b>${esc(p.ticker)}</b><small>${esc(a.nombre || '')}</small></td><td>${esc(a.sector || '')}</td>
    <td class="num"><span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span></td>
    <td class="num">${pct(a.roic)}</td>
    <td><button class="btn btn-ghost quitar" type="button" data-quitar="${i}" aria-label="Quitar ${esc(p.ticker)}"><span aria-hidden="true">✕</span></button></td></tr>`;
}
function tarjetaPos(p, i) {
  const a = by[p.ticker] || {}, id = 'det-' + i;
  return `<li class="pos-card"><div class="pc-fila"><div class="pc-id"><b>${esc(p.ticker)}</b><span>${esc(a.nombre || '')}</span></div>
    <span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span>
    <button class="btn btn-ghost pc-toggle" type="button" aria-expanded="false" aria-controls="${id}" aria-label="Detalles de ${esc(p.ticker)}"><span aria-hidden="true">⌄</span></button></div>
    <div class="pc-det" id="${id}" hidden><dl>
      <div><dt>Sector: </dt><dd>${esc(a.sector || '—')}</dd></div>
      <div><dt><abbr title="Rentabilidad sobre el capital invertido">ROIC</abbr>: </dt><dd class="num">${a.roic != null ? pct(a.roic) : 'Sin dato'}</dd></div></dl>
      <button class="btn btn-secundario peligro" type="button" data-quitar="${i}">Quitar</button></div></li>`;
}
function renderPosiciones() {
  $('#pos-tabla tbody').innerHTML = pos.map(filaTabla).join('');
  $('#pos-cards').innerHTML = pos.map(tarjetaPos).join('');
  $('.tabla-scroll').hidden = !pos.length; $('#pos-cards').hidden = !pos.length; $('#pos-vacio').hidden = pos.length > 0;
}
function renderResumen() {
  const r = calcResumen(pos), falta = r1(100 - r.total);
  $('#r-total').textContent = pesoTxt(r.total);
  const est = $('#r-falta');
  if (!r.n) { est.textContent = 'Sin posiciones todavía'; est.className = 'asig-estado'; }
  else if (falta > 0.0001) { est.textContent = `Faltan ${pesoTxt(falta)}`; est.className = 'asig-estado aviso'; }
  else if (falta < -0.0001) { est.textContent = `⚠ Sobran ${pesoTxt(-falta)}`; est.className = 'asig-estado error'; }
  else { est.textContent = '✓ Cartera completa'; est.className = 'asig-estado ok'; }
  const barra = $('#r-barra').parentElement; barra.setAttribute('aria-valuenow', Math.min(100, Math.round(r.total)));
  barra.classList.toggle('error', falta < -0.0001); $('#r-barra').style.width = Math.min(100, r.total) + '%';
  $('#r-n').textContent = r.n;
  $('#r-roic').textContent = r.roic != null ? pct(r.roic) : '—';
  $('#r-cobertura').textContent = !r.n ? '' : r.roic == null
    ? 'Ningún activo de la cartera tiene dato de ROIC.'
    : r.nCon === r.n ? `Calculado con los ${r.n} activos.`
      : `Cobertura parcial: ${r.nCon} de ${r.n} activos con dato (${nf(r.cobertura * 100, 0)}${NB}% del peso). Los demás se excluyen.`;
  $('#r-sectores').innerHTML = r.sectores.length ? r.sectores.map(([s, v]) =>
    `<div class="sector"><span>${esc(s)}</span><span class="num">${pesoTxt(v)}</span><div class="barra"><i style="width:${Math.min(100, v)}%"></i></div></div>`).join('')
    : '<p class="mut peq">Añade posiciones para ver el reparto.</p>';
  $('#b-total').textContent = pesoTxt(r.total);
  $('#b-falta').textContent = !r.n ? 'sin posiciones' : falta > 0.0001 ? `faltan ${pesoTxt(falta)}` : falta < -0.0001 ? `sobran ${pesoTxt(-falta)}` : '✓ completa';
}

// ---------- estado de guardado (una sola fuente de verdad) ----------
function pintarEstado() {
  if (!current) return;
  const l = logged(), total = totalPeso(), over = total > 100.0001, inval = pos.some(p => !(p.peso > 0)), dirty = rev !== savedRev;
  let txt, cls = '';
  if (!l && over) { txt = 'Los pesos suman más de 100 %. Ajusta antes de guardar.'; cls = 'aviso'; }
  else if (!l && inval) { txt = 'Cada posición necesita un peso mayor que 0.'; cls = 'aviso'; }
  else if (!l) txt = 'Borrador guardado solo en este navegador';
  else if (saving) txt = 'Guardando…';
  else if (saveErr) { txt = 'Error al guardar: ' + saveErr; cls = 'error'; }
  else if (dirty && over) { txt = 'Los pesos suman más de 100 %. Ajusta para guardar.'; cls = 'aviso'; }
  else if (dirty && inval) { txt = 'Cada posición necesita un peso mayor que 0.'; cls = 'aviso'; }
  else if (dirty) { txt = 'Cambios sin guardar'; cls = 'aviso'; }
  else { txt = '✓ Guardado'; cls = 'ok'; }
  for (const id of ['#estado', '#b-estado']) { const e = $(id); e.textContent = txt; e.className = (id === '#estado' ? 'estado ' : 'bg-estado ') + cls; }
  $$('.js-guardar').forEach(b => b.disabled = over || inval || (l && (saving || !dirty)));
  window.onbeforeunload = l && dirty ? e => { e.preventDefault(); e.returnValue = ''; } : null; // no perder cambios por error
}
function marcarCambio() { rev++; saveErr = null; hideToast(); guardarBorrador(); pintarEstado(); }

async function guardar() {
  if (!logged()) { guardarBorrador(); return abrirAcceso('guardar'); }
  if (saving) return false;
  const nombre = $('#nombre').value.trim();
  if (!nombre) { saveErr = 'escribe un nombre para la cartera'; pintarEstado(); return false; }
  const r = rev; saving = true; saveErr = null; pintarEstado();
  try {
    await api('/portfolios/' + current.id, { method: 'PUT', body: { posiciones: pos } });
    await api('/portfolios/' + current.id, { method: 'PATCH', body: { nombre, tesis: $('#tesis').value } });
    current.nombre = nombre; savedRev = r; // si se editó durante el guardado, rev > r y sigue "con cambios"
  } catch (err) { saveErr = err.message; }
  finally { saving = false; pintarEstado(); }
  return !saveErr;
}
$$('.js-guardar').forEach(b => b.addEventListener('click', guardar));

async function cambiarPublicacion(publico) {
  const err = $('#pub-error'); err.textContent = '';
  if (rev !== savedRev && !(await guardar())) { err.textContent = 'No se pudo guardar antes de publicar: ' + (saveErr || 'revisa los pesos'); return; }
  try {
    await api('/portfolios/' + current.id, { method: 'PATCH', body: { nombre: $('#nombre').value.trim(), tesis: $('#tesis').value, publico } });
    current.publico = publico ? 1 : 0; pintarChips(); loadPublicas();
    toast(publico ? 'Cartera publicada' : 'La cartera vuelve a ser privada');
  } catch (e) { err.textContent = e.message; }
}
$('#publicar').addEventListener('click', () => cambiarPublicacion(!current.publico));
$('#tesis-guardar').addEventListener('click', () => cambiarPublicacion(true));
$('#nombre').addEventListener('input', marcarCambio);
$('#tesis').addEventListener('input', marcarCambio);

// ---------- pesos editables ----------
function editarPeso(el, fin) {
  const i = +el.dataset.i, v = parsePeso(el.value), ok = v > 0 && v <= 100;
  pos[i].peso = ok ? r1(v) : 0;
  if (fin && ok) el.value = nf(pos[i].peso);
  for (const o of $$(`.peso-in[data-i="${i}"]`)) { o.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (o !== el) o.value = el.value; }
  marcarCambio(); renderResumen();
}
$('#vista-cartera').addEventListener('input', e => { if (e.target.classList.contains('peso-in')) editarPeso(e.target, false); });
$('#vista-cartera').addEventListener('change', e => { if (e.target.classList.contains('peso-in')) editarPeso(e.target, true); });
$('#vista-cartera').addEventListener('click', e => {
  const t = e.target.closest('.pc-toggle');
  if (t) { const abierto = t.getAttribute('aria-expanded') === 'true'; t.setAttribute('aria-expanded', String(!abierto)); document.getElementById(t.getAttribute('aria-controls')).hidden = abierto; return; }
  const q = e.target.closest('[data-quitar]'); if (!q) return;
  const [p] = pos.splice(+q.dataset.quitar, 1);
  marcarCambio(); renderPosiciones(); renderResumen(); renderCharts();
  avisar(`${p.ticker} quitada de la cartera`); $('#buscar-activo').focus();
});
const avisar = t => { $('#combo-aviso').textContent = ''; setTimeout(() => $('#combo-aviso').textContent = t, 50); };
function enfocarPeso(i) { const el = [...$$(`.peso-in[data-i="${i}"]`)].find(x => x.offsetParent !== null); if (el) { el.focus(); el.select(); } }
function agregar(ticker) {
  const ex = pos.findIndex(p => p.ticker === ticker);
  if (ex >= 0) { avisar(`${ticker} ya está en la cartera`); enfocarPeso(ex); return; }
  const falta = r1(100 - totalPeso());
  pos.push({ ticker, peso: falta > 0 ? falta : 5 });
  marcarCambio(); renderPosiciones(); renderResumen(); renderCharts();
  avisar(`${ticker} añadida con ${pesoTxt(pos[pos.length - 1].peso)}. Ajusta el peso si quieres.`); enfocarPeso(pos.length - 1);
}

// ---------- buscador de activos (combobox accesible) ----------
const cbIn = $('#buscar-activo'), cbList = $('#lista-activos');
let cbOpts = [], cbAct = -1;
function cbBuscar(qq) {
  const q = norm(qq.trim()); if (!q) return [];
  const score = a => { const t = norm(a.ticker), n = norm(a.nombre), s = norm(a.sector);
    return t === q ? 0 : t.startsWith(q) ? 1 : n.startsWith(q) ? 2 : (n.includes(q) || t.includes(q)) ? 3 : s.includes(q) ? 4 : 9; };
  return assets.map(a => [score(a), a]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || a[1].ticker.localeCompare(b[1].ticker)).slice(0, 8).map(x => x[1]);
}
function cbCerrar() { cbList.hidden = true; cbIn.setAttribute('aria-expanded', 'false'); cbIn.removeAttribute('aria-activedescendant'); cbAct = -1; }
function cbPintar() {
  const q = cbIn.value.trim(); cbOpts = cbBuscar(q);
  if (!q) return cbCerrar();
  cbList.innerHTML = cbOpts.length ? cbOpts.map((a, i) => {
    const ya = pos.some(p => p.ticker === a.ticker);
    return `<li role="option" id="opt-${i}" data-t="${esc(a.ticker)}" aria-selected="false"${ya ? ' aria-disabled="true"' : ''}><span><b>${esc(a.ticker)}</b> ${esc(a.nombre)}</span><small>${ya ? 'Ya en la cartera' : esc(a.sector)}</small></li>`;
  }).join('') : `<li class="sin" role="option" aria-disabled="true">Ningún activo coincide con «${esc(q)}»</li>`;
  cbList.hidden = false; cbIn.setAttribute('aria-expanded', 'true'); cbMarcar(cbOpts.length ? 0 : -1);
  avisar(cbOpts.length ? `${cbOpts.length} resultados` : 'Sin resultados');
}
function cbMarcar(i) {
  cbAct = i; [...cbList.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
  i >= 0 ? cbIn.setAttribute('aria-activedescendant', 'opt-' + i) : cbIn.removeAttribute('aria-activedescendant');
  if (i >= 0) cbList.children[i]?.scrollIntoView({ block: 'nearest' });
}
function cbElegir(i) { const a = cbOpts[i]; if (!a) return; cbIn.value = ''; cbCerrar(); agregar(a.ticker); }
cbIn.addEventListener('input', cbPintar);
cbIn.addEventListener('focus', () => { if (cbIn.value.trim()) cbPintar(); });
cbIn.addEventListener('blur', cbCerrar);
cbIn.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); if (cbList.hidden) cbPintar(); else cbMarcar((cbAct + 1) % Math.max(1, cbOpts.length)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cbMarcar((cbAct - 1 + cbOpts.length) % Math.max(1, cbOpts.length)); }
  else if (e.key === 'Enter') { if (!cbList.hidden && cbAct >= 0) { e.preventDefault(); cbElegir(cbAct); } }
  else if (e.key === 'Escape') { if (!cbList.hidden) { e.preventDefault(); cbCerrar(); } else cbIn.value = ''; }
});
cbList.addEventListener('mousedown', e => { e.preventDefault(); const li = e.target.closest('li[data-t]'); if (li) cbElegir([...cbList.children].indexOf(li)); });

// ---------- menú «Más acciones» ----------
const masBtn = $('#mas'), masLista = $('#mas-lista');
const masItems = () => [...masLista.querySelectorAll('button:not([hidden])')];
function masAbrir(v, enfocar = true) { masLista.hidden = !v; masBtn.setAttribute('aria-expanded', String(v)); if (v && enfocar) masItems()[0]?.focus(); }
masBtn.addEventListener('click', () => masAbrir(masLista.hidden));
document.addEventListener('click', e => { if (!e.target.closest('.menu-mas')) masAbrir(false); });
masLista.addEventListener('keydown', e => {
  const it = masItems(), i = it.indexOf(document.activeElement);
  if (e.key === 'Escape') { masAbrir(false); masBtn.focus(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); it[(i + 1) % it.length].focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); it[(i - 1 + it.length) % it.length].focus(); }
  else if (e.key === 'Tab') masAbrir(false, false);
});
$('#mi-plantilla').addEventListener('click', async () => {
  masAbrir(false); masBtn.focus();
  if (pos.length && !(await confirmar({
    titulo: 'Reemplazar las posiciones',
    texto: `Se sustituirán las ${pos.length} posiciones actuales por el reparto de la plantilla ${nombrePlantilla(current.plantilla)}. ${logged() ? 'No se guarda hasta que pulses «Guardar cartera».' : 'Seguirás teniendo el borrador en este navegador.'}`,
    ok: 'Reemplazar' }))) return;
  pos = repartoPlantilla(current.plantilla); marcarCambio(); renderPosiciones(); renderResumen(); renderCharts();
  toast('Reparto de la plantilla aplicado');
});
$('#mi-eliminar').addEventListener('click', async () => {
  masAbrir(false); masBtn.focus();
  if (!(await confirmar({ titulo: 'Eliminar cartera', texto: `Se eliminará «${current.nombre}» de tu cuenta, con todas sus posiciones. No se puede deshacer.`, ok: 'Eliminar cartera', peligro: true }))) return;
  try { await api('/portfolios/' + current.id, { method: 'DELETE' }); } catch (err) { return toast(err.message); }
  current = null; pos = []; chartEls.clear(); window.onbeforeunload = null; toast('Cartera eliminada'); loadPublicas(); go('#carteras');
});

// ---------- TradingView: el consentimiento se pide donde se usa ----------
const consent = () => store.getItem('klever_consent');
const dark = () => matchMedia('(prefers-color-scheme: dark)').matches;
const MARCA = '<div class="tradingview-widget-copyright"><a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank"><span>TradingView</span></a></div>';
const chartEls = new Map();
function widget(container, src, config) {
  container.classList.add('tradingview-widget-container');
  container.innerHTML = '<div class="tradingview-widget-container__widget"></div>' + MARCA;
  const sc = document.createElement('script');
  sc.src = src; sc.async = true; sc.textContent = JSON.stringify(config);
  container.appendChild(sc);
}
const placeholder = texto => `<div class="ph"><span>${texto} TradingView puede usar cookies propias. ¿Cargarlo?</span>
  <span class="fila"><button type="button" class="btn btn-secundario" data-consent="si">Cargar</button>${consent() === 'no' ? '' : '<button type="button" class="btn btn-ghost" data-consent="no">Ahora no</button>'}</span></div>`;
const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return; io.unobserve(e.target); mountChart(e.target);
}), { rootMargin: '200px' }) : null;
function mountChart(c) {
  widget(c, 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
    { symbol: c.dataset.t, width: '100%', height: 220, locale: 'es', dateRange: '12M', colorTheme: dark() ? 'dark' : 'light', isTransparent: false, autosize: false, largeChartUrl: '' });
}
function renderCharts() {
  const box = $('#graficos');
  if (consent() !== 'si') { chartEls.clear(); box.innerHTML = pos.length ? placeholder('Los gráficos de precio los carga') : ''; return; }
  box.querySelectorAll('.ph').forEach(n => n.remove());
  const want = new Set(pos.map(p => p.ticker));
  for (const [t, el] of chartEls) if (!want.has(t)) { el.remove(); chartEls.delete(t); }
  for (const p of pos) {
    if (chartEls.has(p.ticker)) continue;
    const c = document.createElement('div'); c.className = 'chart-slot'; c.dataset.t = p.ticker;
    box.appendChild(c); chartEls.set(p.ticker, c); io ? io.observe(c) : mountChart(c);
  }
}
function loadScreener() {
  const box = $('#tv-screener');
  if (consent() !== 'si') { box.className = ''; box.innerHTML = placeholder('El screener de precios lo carga'); return; }
  widget(box, 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
    { width: '100%', height: 500, defaultColumn: 'overview', defaultScreen: 'most_capitalized', market: 'america', showToolbar: true, locale: 'es', colorTheme: dark() ? 'dark' : 'light' });
}
function setConsent(v) { store.setItem('klever_consent', v); loadScreener(); if (current) renderCharts(); }
document.addEventListener('click', e => { const v = e.target.dataset?.consent; if (v) setConsent(v); });
$('#cookies-link').addEventListener('click', () => { store.removeItem('klever_consent'); loadScreener(); if (current) renderCharts(); toast('Preferencia restablecida: se te volverá a preguntar'); });

// ---------- explorar empresas ----------
const CRIT = {
  deuda_ebitda: ['Deuda sobre EBITDA', 'Cumple si la deuda neta es menor de 2,5 veces el EBITDA', v => nf(v) + NB + 'veces'],
  roic: ['ROIC', 'Cumple si supera el 10 %', pct],
  margen_neto: ['Margen neto', 'Cumple si el beneficio neto supera el 10 % de las ventas', pct],
  flujo_caja: ['Caja libre', 'Cumple si el flujo de caja libre es positivo', v => nf(v / 1e9) + NB + 'mil M USD'],
  crecimiento: ['Crecimiento de ventas', 'Cumple si las ventas suben respecto al año anterior', pct],
};
let empresas = [];
function renderEmpresas() {
  const q = norm($('#emp-buscar').value.trim()), ul = $('#empresas-lista');
  const vistas = q ? empresas.filter(r => norm(r.ticker + ' ' + r.nombre + ' ' + r.sector).includes(q)) : empresas;
  ul.innerHTML = vistas.length ? vistas.map(r => `<li><button class="fila-emp" type="button" data-t="${esc(r.ticker)}" aria-label="Ver ficha de ${esc(r.nombre)} (${esc(r.ticker)}), ${esc(r.sector)}: supera ${r.cumplidos} de 5 comprobaciones">
      <span><b>${esc(r.ticker)}</b> <small>${esc(r.nombre)}</small></span><span class="sector">${esc(r.sector)}</span>
      <span class="marca-n">${r.cumplidos} de 5${r.evaluados < 5 ? `<small style="display:block;font-weight:400;color:var(--muted)">${5 - r.evaluados} sin dato</small>` : ''}</span></button></li>`).join('')
    : `<li class="estado-lista">${empresas.length ? 'Ninguna empresa coincide con tu búsqueda.' : 'Aún no hay datos. Se cargan desde la SEC cada noche.'}</li>`;
  $('#emp-cuenta').textContent = empresas.length ? `${vistas.length} de ${empresas.length} empresas` : '';
}
async function loadEmpresas() {
  $('#empresas-lista').innerHTML = '<li class="estado-lista">Cargando empresas…</li>';
  try { empresas = await getJson('/ideas'); }
  catch { $('#empresas-lista').innerHTML = '<li class="estado-lista">No se pudieron cargar las empresas. <button class="enlace" data-retry="empresas" type="button">Reintentar</button></li>'; return; }
  renderEmpresas();
}
$('#emp-buscar').addEventListener('input', renderEmpresas);
$('#empresas-lista').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) verFicha(b.dataset.t); });

async function verFicha(t) {
  let a; try { a = await getJson('/assets/' + t); } catch { return toast('No se pudo cargar la ficha'); }
  const c = a.criterios, periodo = c?.periodo || a.fundamentales[0]?.periodo || '';
  const filas = Object.entries(CRIT).map(([k, [label, regla, f]]) => {
    const x = c?.[k], res = x?.ok === true ? ['ok', '✓ Cumple'] : x?.ok === false ? ['no', '✗ No cumple'] : ['nd', '– Sin dato'];
    return `<li><div class="ck-crit"><b>${label}</b><small>${regla}</small></div><div class="ck-res"><span class="res ${res[0]}">${res[1]}</span><span class="ck-val">${x?.valor != null ? f(x.valor) : 'No disponible'}</span></div></li>`;
  }).join('');
  const ok = c ? Object.entries(CRIT).filter(([k]) => c[k]?.ok === true).length : 0, nd = c ? Object.keys(CRIT).filter(k => c[k]?.ok == null).length : 5;
  const hist = a.fundamentales.map(x => `<tr><td>${esc(x.periodo)}</td><td>${miles(x.ingresos)}</td><td>${miles(x.beneficio_neto)}</td><td>${miles(x.ebitda)}</td><td>${miles(x.flujo_caja_libre)}</td><td>${pct(x.roic)}</td></tr>`).join('');
  $('#fi-titulo').textContent = a.nombre;
  $('#fi-sub').textContent = `${a.ticker} · ${a.sector}${periodo ? ' · Datos del ejercicio ' + periodo : ''}`;
  $('#fi-cuerpo').innerHTML = `<p class="resumen-ficha">Supera ${ok} de 5 comprobaciones${nd ? ` · ${nd} sin dato` : ''}</p>
    <ul class="checks">${filas}</ul>
    ${nd ? '<p class="mut peq">Una comprobación sin dato no cuenta ni a favor ni en contra.</p>' : ''}
    <h3>Cifras de los últimos años</h3>
    <div class="tabla-h" role="region" aria-label="Cifras históricas" tabindex="0"><table><caption class="sr">Cifras en miles de millones de USD; ROIC en porcentaje</caption>
      <thead><tr><th scope="col">Año</th><th scope="col">Ventas</th><th scope="col">Beneficio neto</th><th scope="col">EBITDA</th><th scope="col">Caja libre</th><th scope="col">ROIC</th></tr></thead><tbody>${hist}</tbody></table></div>
    <p class="mut peq">Miles de millones de dólares (USD), salvo el ROIC.</p>
    <details class="ficha-det"><summary>Metodología y fuentes</summary><div><p>Las cifras salen de los informes anuales (10-K) que la empresa presenta ante la SEC (EDGAR). EBITDA = resultado operativo + amortizaciones. Caja libre = flujo de caja operativo − inversiones en inmovilizado. El ROIC se aproxima como resultado operativo × (1 − tasa de impuestos) ÷ (deuda a largo plazo + patrimonio − caja). Son cálculos aproximados y pueden contener errores.</p></div></details>
    <details class="ficha-det"><summary>Glosario</summary><div>
      <p><b>ROIC:</b> cuánto gana la empresa por cada dólar invertido en su negocio. Es una medida de la empresa; no es la rentabilidad que obtendría un inversor.</p>
      <p><b>EBITDA:</b> beneficio operativo antes de intereses, impuestos y amortizaciones.</p>
      <p><b>Caja libre:</b> dinero que queda tras pagar las operaciones y las inversiones necesarias.</p></div></details>`;
  const d = $('#dlg-ficha'); if (!d.open) d.showModal(); d.scrollTop = 0;
}

// ---------- carteras públicas ----------
let publicas = null, publicasError = false;
function tarjetaPublica(p) {
  return `<button class="tarjeta" type="button" data-pid="${p.id}"><b>${esc(p.nombre)}</b>
    <span class="t-meta">Plantilla ${esc(nombrePlantilla(p.plantilla))} · ${p.n_posiciones} posiciones</span>${p.tesis ? `<span class="t-tesis">${esc(p.tesis)}</span>` : ''}</button>`;
}
function renderPublicas() {
  const msg = publicasError ? '<p class="estado-lista">No se pudieron cargar las carteras. <button class="enlace" data-retry="publicas" type="button">Reintentar</button></p>'
    : publicas === null ? '<p class="estado-lista">Cargando carteras…</p>'
    : !publicas.length ? '<p class="estado-lista">Aún no hay carteras públicas.</p>' : null;
  $('#muestra-publicas').innerHTML = msg ?? publicas.slice(0, 3).map(tarjetaPublica).join('');
  $('#publicas-lista').innerHTML = msg ?? publicas.map(tarjetaPublica).join('');
}
async function loadPublicas() {
  publicasError = false; renderPublicas();
  try { publicas = await getJson('/public'); } catch { publicasError = true; }
  renderPublicas();
}
async function verPublica(id) {
  if (vistaActual() !== 'publicas') { pendientePublica = id; return go('#publicas'); }
  let p; try { p = await getJson('/public/' + id); } catch { return toast('No se pudo cargar la cartera'); }
  const r = calcResumen(p.posiciones.map(x => ({ ticker: x.ticker, peso: x.peso })));
  const d = $('#publica-detalle'); d.hidden = false;
  d.innerHTML = `<h2>${esc(p.nombre)}</h2><p class="mut">Plantilla ${esc(nombrePlantilla(p.plantilla))}</p>${p.tesis ? `<p><b>Tesis:</b> ${esc(p.tesis)}</p>` : ''}
    <div class="tabla-h" role="region" aria-label="Composición" tabindex="0"><table><caption class="sr">Composición de la cartera</caption><thead><tr><th scope="col">Activo</th><th scope="col">Sector</th><th scope="col">Peso</th></tr></thead><tbody>${p.posiciones.map(x =>
      `<tr><td><b>${esc(x.ticker)}</b> <span class="mut">${esc(x.nombre)}</span></td><td style="text-align:left">${esc(x.sector)}</td><td class="num">${pesoTxt(x.peso)}</td></tr>`).join('')}</tbody></table></div>
    <p class="mut peq">Reparto por sector: ${r.sectores.map(([s, v]) => `${esc(s)} ${pesoTxt(v)}`).join(' · ')}. Simulación educativa; no es una recomendación de inversión.</p>`;
  d.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
let pendientePublica = null;
const vistaActual = () => [...$$('[data-vista]')].find(s => !s.hidden)?.dataset.vista;
document.addEventListener('click', e => { const b = e.target.closest('[data-pid]'); if (b) verPublica(b.dataset.pid); });
new MutationObserver(() => { if (vistaActual() === 'publicas' && pendientePublica) { const id = pendientePublica; pendientePublica = null; verPublica(id); } })
  .observe($('#vista-publicas'), { attributes: true, attributeFilter: ['hidden'] });

// ---------- portada: acción principal y vista previa real ----------
$('#probar').addEventListener('click', () => { const s = $('#plantillas'); s.scrollIntoView({ behavior: 'smooth' }); s.querySelector('.plantilla').focus({ preventScroll: true }); });
$$('[data-plantilla]').forEach(b => b.addEventListener('click', () => abrirInvitado(b.dataset.plantilla)));
function renderPreview() {
  const ps = repartoPlantilla('dividendos'); if (!ps.length) return;
  const r = calcResumen(ps);
  $('#prev').innerHTML = `<div class="prev"><div class="prev-cab"><b>Cartera de dividendos</b><span class="chip">Vista previa</span></div>
    <div class="prev-fila prev-th" aria-hidden="true"><span>Activo</span><span class="num">Peso</span><span class="num"><abbr>ROIC</abbr></span></div>
    ${ps.map(p => `<div class="prev-fila"><span><b>${esc(p.ticker)}</b><small>${esc(by[p.ticker].nombre)}</small></span><span class="num">${pesoTxt(p.peso)}</span><span class="num mut">${pct(by[p.ticker].roic)}</span></div>`).join('')}
    <div class="barra" aria-hidden="true"><i style="width:${Math.min(100, r.total)}%"></i></div>
    <div class="prev-pie"><div><span>Asignado</span><b class="num">${pesoTxt(r.total)}</b></div><div><span><abbr title="Rentabilidad sobre el capital invertido">ROIC</abbr> medio · ${r.nCon} de ${r.n} con dato</span><b class="num">${pct(r.roic)}</b></div></div></div>`;
}

// ---------- reintentos genéricos ----------
document.addEventListener('click', e => {
  const r = e.target.dataset?.retry; if (!r) return;
  ({ empresas: loadEmpresas, publicas: loadPublicas, mis: cargarMisCarteras })[r]?.();
});

// ---------- arranque ----------
(async () => {
  await redeem();
  await loadAssets();
  actualizarCabecera(); renderPreview(); loadScreener(); loadEmpresas(); loadPublicas();
  if (logged()) await migrarBorrador();
  route(true);
})();
