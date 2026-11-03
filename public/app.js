// =====================================================================
// Klever · interfaz. Sin dependencias.
// Vistas (hash): inicio · empresas · publicas · carteras · cartera / cartera-<id>
// Tres conceptos separados en el editor:
//   · DÓNDE está guardada  → este dispositivo (borrador) o tu cuenta
//   · CAMBIOS pendientes   → versión actual (rev) frente a la última guardada (savedRev)
//   · VISIBILIDAD          → privada o pública
// =====================================================================

// ---------- utilidades ----------
const store = (() => { const m = {}; let ok = true; try { localStorage.setItem('__k', '1'); localStorage.removeItem('__k'); } catch { ok = false; } return { ok, // ok: ¿persiste de verdad en este dispositivo?
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } } }; })();
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NB = ' '; // espacio duro: número y unidad nunca se separan
const nf = (v, d = 1) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const pct = v => v == null ? '—' : nf(v * 100) + NB + '%';   // fracción: 0,12 → 12,0 %
const pesoTxt = v => nf(v) + NB + '%';                          // ya en puntos porcentuales (1 decimal)
const pesoCorto = v => (Number.isInteger(r1(v)) ? nf(v, 0) : nf(v, 1)) + NB + '%'; // 12 % · 12,5 %
const miles = v => v == null ? '—' : nf(v / 1e9);               // miles de millones
const r1 = v => Math.round(v * 10) / 10;
const parsePeso = s => { const n = parseFloat(String(s).trim().replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastTimer;
function toast(msg, ms = 4000) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms); }
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
let current = null;          // { id|null, nombre, plantilla, tesis, publico }   id null = aún no está en la cuenta
let pos = [];                // [{ ticker, peso }]
let rev = 0, savedRev = 0, saving = false, saveErr = null;
const DRAFT = 'klever_borrador';
const leerBorrador = () => { try { return JSON.parse(store.getItem(DRAFT)); } catch { return null; } };
const hayBorrador = () => !!leerBorrador()?.pos?.length;
let copiaLocal = false, recuperado = false; // copiaLocal: hay una copia de los cambios en este dispositivo (y persiste de verdad)
function guardarBorrador() {
  if (!current) return;
  if (!current.id) { // aún no está en la cuenta: borrador del dispositivo
    store.setItem(DRAFT, JSON.stringify({ plantilla: current.plantilla, nombre: $('#nombre').value || current.nombre, pos })); copiaLocal = store.ok; return;
  }
  const key = 'klever_edit_' + current.id; // cartera de la cuenta: copia de los cambios sin guardar
  if (rev !== savedRev) { store.setItem(key, JSON.stringify({ nombre: $('#nombre').value, tesis: $('#tesis').value, pos, base: current.version })); copiaLocal = store.ok; }
  else { store.removeItem(key); copiaLocal = false; }
}
const enCuenta = () => logged() && !!current?.id;

async function loadAssets() {
  try { assets = await getJson('/assets'); by = Object.fromEntries(assets.map(a => [a.ticker, a])); }
  catch { toast('No se pudieron cargar los activos. Recarga la página.'); }
}

// ---------- reglas de composición: UNA sola fuente para guardar, publicar y la interfaz ----------
// Mismas reglas que el servidor (functions/_lib.js). Por debajo del 100 % es un REPARTO INCOMPLETO: se puede
// guardar en privado, pero no se publica. No existe efectivo implícito.
function validar(ps = pos) {
  const total = r1(ps.reduce((s, p) => s + (p.peso || 0), 0));
  const invalidos = ps.filter(p => !(p.peso > 0 && p.peso <= 100));
  return { total, n: ps.length, invalidos, exceso: total > 100 ? r1(total - 100) : 0, falta: total < 100 ? r1(100 - total) : 0, completa: total === 100 && !invalidos.length };
}
const listaTickers = inv => inv.map(p => p.ticker).join(', ');
function razonGuardar(v) {
  if (v.invalidos.length) return `Revisa el peso de ${listaTickers(v.invalidos)}: debe ser un número entre 0,1 y 100.`;
  if (v.exceso) return `Exceso de asignación: ${pesoCorto(v.exceso)}. Reduce algún peso para guardar.`;
  if (current?.publico && !v.completa) return `Cartera pública: la versión publicada no cambia hasta que el reparto vuelva a sumar el 100 % (pendiente de asignar: ${pesoCorto(v.falta)}). ${copiaLocal ? 'Tus cambios siguen en este dispositivo. ' : ''}Si prefieres guardar un reparto incompleto, deja de publicarla.`;
  return null;
}
function razonPublicar(v) {
  if (!v.n) return 'Añade al menos una posición para publicar.';
  if (v.invalidos.length) return `Revisa el peso de ${listaTickers(v.invalidos)}: debe ser un número entre 0,1 y 100.`;
  if (v.exceso) return `Exceso de asignación: ${pesoCorto(v.exceso)}. Reduce algún peso para poder publicar.`;
  if (v.falta) return `Pendiente de asignar: ${pesoCorto(v.falta)}. Una cartera pública debe tener el 100 % asignado.`;
  if (!$('#tesis').value.trim()) return 'Escribe una tesis para poder publicar.';
  return null;
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

function confirmar({ titulo, texto, ok = 'Aceptar', no = 'Cancelar', peligro = false }) {
  return new Promise(res => {
    const d = $('#dlg-confirmar');
    $('#cf-titulo').textContent = titulo; $('#cf-texto').textContent = texto; $('#cf-no').textContent = no;
    const si = $('#cf-si'); si.textContent = ok; si.className = 'btn ' + (peligro ? 'btn-peligro' : 'btn-primario');
    d.returnValue = '';
    d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true });
    d.showModal(); $('#cf-no').focus();
  });
}
$('#cf-si').addEventListener('click', () => $('#dlg-confirmar').close('ok'));
$('#cf-no').addEventListener('click', () => $('#dlg-confirmar').close('no'));

// ---------- acceso por enlace ----------
let accEmail = '', cooldownT = null, avisoOtroDispositivo = false;
function pasoAcceso(n) {
  $('#acc-paso1').hidden = n !== 1; $('#acc-paso2').hidden = n !== 2;
  $('#acc-aviso-borrador').hidden = !(n === 2 && hayBorrador());
}
function abrirAcceso(motivo = 'entrar') {
  $('#acc-titulo').textContent = motivo === 'guardar' ? 'Guarda tu cartera' : 'Entrar';
  $('#acc-sub').textContent = motivo === 'caducada'
    ? 'Tu sesión ha caducado. Te enviaremos un enlace para entrar sin contraseña.'
    : motivo === 'guardar' ? 'Te enviaremos un enlace para entrar sin contraseña.'
      : 'Te enviaremos un enlace para entrar sin contraseña. Sirve para registrarte y para volver a entrar.';
  $('#acc-borrador').hidden = !hayBorrador();
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
  const r = await api('/login', { method: 'POST', body: { email, acepto: $('#acc-acepto').checked, con_borrador: hayBorrador() } });
  accEmail = email; $('#acc-enviado').textContent = email;
  $('#acc-dev').innerHTML = r.dev_link ? `Modo desarrollo: <a href="${esc(r.dev_link)}">entrar</a>` : '';
  pasoAcceso(2); cooldown(60); $('#acc-reenviar').focus();
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
  try { history.replaceState(null, '', location.pathname + location.hash); } catch {}
  try {
    const r = await api('/verify', { method: 'POST', body: { token: t } });
    store.setItem('klever_token', r.token);
    // El enlace se pidió con un borrador local. Si se abre en otro dispositivo/navegador, el borrador no está aquí.
    avisoOtroDispositivo = !!r.con_borrador && !hayBorrador();
  } catch (err) { toast(err.message); }
}
function sesionCaducada() {
  store.removeItem('klever_token'); current = null; actualizarCabecera(); route(); abrirAcceso('caducada');
}
async function cerrarSesion() {
  try { await api('/logout', { method: 'POST' }); } catch {}
  store.removeItem('klever_token'); current = null; pos = []; actualizarCabecera(); go('#inicio');
}
$('#salir').addEventListener('click', cerrarSesion);
$('#salir-m').addEventListener('click', cerrarSesion);
function actualizarCabecera() {
  const l = logged();
  $('#entrar').hidden = l; $('#salir').hidden = !l; $('#salir-m').hidden = !l;
  $$('.nav-mis').forEach(e => e.hidden = !l);
}

// ---------- menú móvil ----------
const btnMenu = $('#btn-menu'), menuMovil = $('#menu-movil');
function menuAbrir(v) { menuMovil.hidden = !v; btnMenu.setAttribute('aria-expanded', String(v)); }
btnMenu.addEventListener('click', () => menuAbrir(menuMovil.hidden));
menuMovil.addEventListener('click', e => { if (e.target.closest('a,button')) menuAbrir(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menuMovil.hidden) { menuAbrir(false); btnMenu.focus(); } });

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
    } else if (!current) { const d = leerBorrador(); if (d?.pos?.length) restaurarBorrador(d); else v = l ? 'carteras' : 'inicio'; }
  }
  mostrar(v, primera);
}
function mostrar(v, primera) {
  $$('[data-vista]').forEach(s => s.hidden = s.dataset.vista !== v);
  $$('[data-nav]').forEach(a => a.dataset.nav === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  document.body.classList.toggle('en-cartera', v === 'cartera');
  $('#barra-guardar').hidden = v !== 'cartera'; medirBarra(); menuAbrir(false);
  document.title = 'Klever · ' + TITULOS[v];
  if (v === 'cartera') renderWorkspace();
  if (v === 'carteras') cargarMisCarteras();
  if (!primera) { window.scrollTo(0, 0); $('#contenido').focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', () => route());

// ---------- carteras del usuario ----------
const fmtFecha = iso => { const d = new Date(String(iso).replace(' ', 'T') + 'Z'); return isNaN(d) ? '' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(d); };
let nMis = null;
function formNuevo(abrir, enfocar = true) {
  $('#form-nueva').hidden = !abrir; $('#btn-nueva').setAttribute('aria-expanded', String(abrir));
  $('#nueva-titulo').textContent = nMis === 0 ? 'Crea tu primera cartera' : 'Nueva cartera';
  $('#nueva-cancelar').hidden = nMis === 0; // sin carteras, crear es la acción principal: no hay nada que cancelar
  if (abrir && enfocar) $('#nueva-nombre').focus();
}
function itemCartera(p) {
  const n = p.n_posiciones, total = r1(p.total);
  const asig = !n ? 'Sin posiciones' : `${n} ${n === 1 ? 'posición' : 'posiciones'} · Asignado: ${pesoCorto(total)}${total < 100 ? ' (incompleta)' : total > 100 ? ' (exceso)' : ''}`;
  const fecha = p.actualizado_en ? `Modificada el ${fmtFecha(p.actualizado_en)}` : p.creado_en ? `Creada el ${fmtFecha(p.creado_en)}` : ''; // solo fechas que existen
  const local = store.getItem('klever_edit_' + p.id) ? '<span class="chip aviso">Cambios sin guardar en este dispositivo</span>' : '';
  return `<li><button class="tarjeta cartera-item" type="button" data-id="${p.id}" aria-label="Abrir ${esc(p.nombre)}">
    <span class="ci-l1"><b>${esc(p.nombre)}</b><span class="chip${p.publico ? ' pub' : ''}">${p.publico ? 'Pública' : 'Privada'}</span>${local}</span>
    <span class="ci-l2">${asig}</span>${fecha ? `<span class="ci-l3 mut">${fecha}</span>` : ''}
    <span class="pl-acc"><span class="pl-acc-txt">Abrir</span></span></button></li>`;
}
async function cargarMisCarteras() {
  const ul = $('#mis-lista'); ul.innerHTML = '<li class="estado-lista">Cargando tus carteras…</li>';
  try {
    const list = await api('/portfolios'); nMis = list.length;
    $('#btn-nueva').hidden = nMis === 0;
    if (nMis === 0) { ul.innerHTML = ''; formNuevo(true, false); return; }
    formNuevo(false); ul.innerHTML = list.map(itemCartera).join('');
  } catch (err) { ul.innerHTML = `<li class="estado-lista">No se pudieron cargar tus carteras. <button class="enlace" data-retry="mis" type="button">Reintentar</button></li>`; }
}
$('#mis-lista').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) go('#cartera-' + b.dataset.id); });
$('#btn-nueva').addEventListener('click', () => formNuevo($('#form-nueva').hidden));
$('#nueva-cancelar').addEventListener('click', () => { formNuevo(false); $('#btn-nueva').focus(); });
$('#form-nueva').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target), btn = e.target.querySelector('button.btn-primario'); btn.disabled = true;
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla') } });
    try { await api('/portfolios/' + id, { method: 'PUT', body: { posiciones: repartoPlantilla(f.get('plantilla')) } }); } catch (err) { toast(err.message); }
    e.target.reset(); go('#cartera-' + id);
  } catch (err) { toast(err.message); } finally { btn.disabled = false; }
});
async function cargarCartera(id) {
  let c; try { c = await api('/portfolios/' + id); } catch (err) { toast(err.message); return false; }
  current = { id: c.id, nombre: c.nombre, plantilla: c.plantilla, tesis: c.tesis || '', publico: c.publico, version: c.actualizado_en || c.creado_en || '' };
  pos = c.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso })); rev = savedRev = 0; saveErr = null; copiaLocal = false;
  chartEls.clear(); $('#graficos').innerHTML = '';
  await recuperarCambiosLocales(); return true;
}
async function recuperarCambiosLocales() { // cambios sin guardar de una sesión anterior en este dispositivo
  const key = 'klever_edit_' + current.id, raw = store.getItem(key); if (!raw) return;
  let e; try { e = JSON.parse(raw); } catch { store.removeItem(key); return; }
  if (!Array.isArray(e.pos) || (e.nombre === current.nombre && (e.tesis || '') === (current.tesis || '') && JSON.stringify(e.pos) === JSON.stringify(pos))) { store.removeItem(key); return; }
  if (e.base !== current.version) { // la cartera cambió desde otro sitio después de esa copia
    const usar = await confirmar({ titulo: 'Cambios sin guardar de otra sesión', texto: 'Esta cartera se modificó después de que hicieras esos cambios en este dispositivo. Si los conservas y los guardas, sustituirán la versión guardada.', ok: 'Conservar mis cambios', no: 'Usar la versión guardada' });
    if (!usar) { store.removeItem(key); return; }
  }
  current.nombre = e.nombre; current.tesis = e.tesis || ''; pos = e.pos; rev = 1; savedRev = 0; copiaLocal = store.ok; recuperado = true;
}
function abrirInvitado(plantilla) {
  current = { id: null, nombre: 'Mi cartera de ' + nombrePlantilla(plantilla), plantilla, tesis: '', publico: 0 };
  pos = repartoPlantilla(plantilla); rev = savedRev = 0; saveErr = null; chartEls.clear(); $('#graficos').innerHTML = '';
  guardarBorrador(); go('#cartera');
}
function restaurarBorrador(d) {
  current = { id: null, nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla, tesis: '', publico: 0 };
  pos = d.pos; rev = savedRev = 0; saveErr = null; copiaLocal = store.ok;
}
async function migrarBorrador() { // al entrar, el borrador pasa a la cuenta SI es guardable; si no, se conserva tal cual
  const d = leerBorrador(); if (!d) return;
  if (!d.pos?.length) { store.removeItem(DRAFT); return; }
  const v = validar(d.pos);
  if (v.exceso || v.invalidos.length) {
    toast('Tu borrador sigue en este dispositivo: tiene pesos que aún no se pueden guardar. Corrígelos para guardarlo en tu cuenta.', 9000);
    location.hash = '#cartera'; return;
  }
  let id = null;
  try {
    ({ id } = await api('/portfolios', { method: 'POST', body: { nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla } }));
    await api('/portfolios/' + id, { method: 'PUT', body: { posiciones: d.pos } });
    store.removeItem(DRAFT); // el borrador solo se borra cuando todo se ha guardado
    toast('Cartera guardada'); location.hash = '#cartera-' + id;
  } catch (err) {
    if (id) { try { await api('/portfolios/' + id, { method: 'DELETE' }); } catch {} } // no dejar una cartera vacía a medias
    toast('No se pudo guardar tu borrador (' + err.message + '). Sigue en este dispositivo.', 8000);
  }
}

// ---------- cálculo del resumen ----------
const esFondo = t => by[t]?.tipo === 'etf';
function calcResumen(ps) {
  const v = validar(ps);
  const conDato = ps.filter(p => p.peso > 0 && by[p.ticker]?.roic != null);
  const sinDato = ps.filter(p => p.peso > 0 && by[p.ticker]?.roic == null);
  const wCon = conDato.reduce((s, p) => s + p.peso, 0);
  const sec = {};
  for (const p of ps) { const s = by[p.ticker]?.sector || 'Sin categoría'; sec[s] = (sec[s] || 0) + (p.peso || 0); }
  return {
    ...v, nCon: conDato.length,
    noAplic: sinDato.filter(p => esFondo(p.ticker)).length, noDisp: sinDato.filter(p => !esFondo(p.ticker)).length,
    roic: wCon ? conDato.reduce((s, p) => s + by[p.ticker].roic * p.peso, 0) / wCon : null, // media PONDERADA; sin dato = fuera, ni como 0 ni en el denominador
    cobPeso: v.total ? wCon / v.total : 0,                                                    // denominador: peso asignado
    sectores: Object.entries(sec).sort((a, b) => b[1] - a[1]),
  };
}
const roicTxt = a => !a ? '<span class="nd">No disponible</span>' : a.tipo === 'etf' ? '<span class="nd" title="Los fondos no tienen ROIC: no aplicable">No aplicable</span>' : a.roic == null ? '<span class="nd" title="Dato ausente en los informes">No disponible</span>' : pct(a.roic);
function lineasCobertura(r) {
  if (!r.n) return '';
  const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const l = [r.roic == null ? 'Ninguna posición tiene ROIC.' : `Con dato: ${r.nCon} de ${r.n} posiciones (${nf(r.cobPeso * 100, 0)}${NB}% del peso asignado).`];
  if (r.noDisp) l.push(`Dato ausente (no disponible): ${pl(r.noDisp, 'empresa', 'empresas')}.`);
  if (r.noAplic) l.push(`No aplicable: ${pl(r.noAplic, 'fondo', 'fondos')}; los ETF no tienen ROIC.`);
  return l.map(t => `<span class="linea">${t}</span>`).join('');
}

// ---------- espacio de trabajo ----------
function renderWorkspace() {
  if (!current) return;
  const l = logged(), id = !!current.id;
  $$('.solo-cuenta').forEach(e => e.hidden = !(l && id));
  $('#mi-eliminar').hidden = !(l && id);
  $('#nombre').value = current.nombre; $('#tesis').value = current.tesis || '';
  $('#pub-error').textContent = '';
  renderPosiciones(); renderResumen(); renderCharts(); pintarEstado();
  if (recuperado) { recuperado = false; toast('Hemos recuperado tus cambios sin guardar'); }
}

function filaTabla(p, i) {
  const a = by[p.ticker] || {};
  return `<tr><td><b>${esc(p.ticker)}</b><small>${esc(a.nombre || '')}</small></td><td>${esc(a.sector || '')}</td>
    <td class="num"><span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-invalid="${p.peso > 0 ? 'false' : 'true'}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span></td>
    <td class="num">${roicTxt(a)}</td>
    <td><button class="btn btn-ghost quitar" type="button" data-quitar="${i}" aria-label="Quitar ${esc(p.ticker)}"><span aria-hidden="true">✕</span></button></td></tr>`;
}
function tarjetaPos(p, i) {
  const a = by[p.ticker] || {}, id = 'det-' + i;
  return `<li class="pos-card"><div class="pc-fila"><div class="pc-id"><b>${esc(p.ticker)}</b><span>${esc(a.nombre || '')}</span></div>
    <span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-invalid="${p.peso > 0 ? 'false' : 'true'}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span>
    <button class="btn btn-ghost pc-toggle" type="button" aria-expanded="false" aria-controls="${id}" aria-label="Detalles de ${esc(p.ticker)}"><span aria-hidden="true">⌄</span></button></div>
    <div class="pc-det" id="${id}" hidden><dl>
      <div><dt>Nombre:</dt><dd>${esc(a.nombre || p.ticker)}</dd></div>
      <div><dt>Categoría:</dt><dd>${esc(a.sector || '—')}</dd></div>
      <div><dt><abbr title="Rentabilidad sobre el capital invertido">ROIC</abbr>:</dt><dd class="num">${roicTxt(a)}</dd></div></dl>
      <button class="btn btn-secundario peligro" type="button" data-quitar="${i}">Quitar</button></div></li>`;
}
function renderPosiciones() {
  $('#pos-tabla tbody').innerHTML = pos.map(filaTabla).join('');
  $('#pos-cards').innerHTML = pos.map(tarjetaPos).join('');
  $('.tabla-scroll').hidden = !pos.length; $('#pos-cards').hidden = !pos.length; $('#pos-vacio').hidden = pos.length > 0;
}
function renderResumen() {
  const r = calcResumen(pos), clase = !r.n ? '' : r.exceso ? 'error' : r.falta ? 'aviso' : 'ok';
  const dif = !r.n ? 'Sin posiciones todavía' : r.exceso ? `⚠ Exceso de asignación: ${pesoCorto(r.exceso)}` : r.falta ? `Pendiente de asignar: ${pesoCorto(r.falta)}` : '';
  $('#r-total').textContent = pesoCorto(r.total);
  const f = $('#r-falta'); f.textContent = dif; f.hidden = !dif; f.className = 'asig-estado ' + clase;
  const barra = $('#r-barra').parentElement; barra.setAttribute('aria-valuenow', Math.min(100, Math.round(r.total)));
  barra.classList.toggle('error', !!r.exceso); $('#r-barra').style.width = Math.min(100, r.total) + '%';
  $('#r-n').textContent = r.n;
  $('#r-roic').textContent = r.roic != null ? pct(r.roic) : '—';
  $('#r-cobertura').innerHTML = lineasCobertura(r);
  $('#r-sectores').innerHTML = r.sectores.length ? r.sectores.map(([s, v]) =>
    `<div class="sector"><span>${esc(s)}</span><span class="num">${pesoTxt(v)}</span><div class="barra"><i style="width:${Math.min(100, v)}%"></i></div></div>`).join('')
    : '<p class="mut peq">Añade posiciones para ver el reparto.</p>';
  $('#pos-error').textContent = r.invalidos.length ? `Revisa el peso de ${listaTickers(r.invalidos)}: debe ser un número entre 0,1 y 100.` : '';
  // resumen breve (una columna): «Asignado: 100 %», sin repetir; la diferencia en su propia línea, a tamaño normal
  $('#rb-total').textContent = `Asignado: ${pesoCorto(r.total)}`;
  const re = $('#rb-estado'); re.textContent = dif; re.hidden = !dif; re.className = 'rb-estado ' + clase;
  $('#rb-n').textContent = `${r.n} ${r.n === 1 ? 'posición' : 'posiciones'}`;
  // barra inferior
  const bt = $('#b-total'); bt.textContent = (r.exceso ? '⚠ ' : '') + `Asignado: ${pesoCorto(r.total)}`; bt.className = 'num ' + clase;
}

// ---------- estado de guardado: privacidad, validez del reparto y persistencia, por separado ----------
function textoPersistencia(id, dirty) { // [largo, breve, clase]
  if (saving) return ['Guardando en tu cuenta…', 'Guardando…', ''];
  if (saveErr) return ['No se pudo guardar' + (copiaLocal ? '. Tus cambios siguen en este dispositivo' : ''), 'No se pudo guardar', 'error'];
  if (!id) return ['Solo en este dispositivo', 'Solo en este dispositivo', ''];
  if (dirty) return ['Cambios sin guardar en tu cuenta' + (copiaLocal ? ' · copia en este dispositivo' : ''), 'Sin guardar en tu cuenta', 'aviso'];
  return ['Guardada en tu cuenta', '✓ Guardada', 'ok'];
}
function pintarEstado() {
  if (!current) return;
  const v = validar(), dirty = rev !== savedRev, id = enCuenta(), razon = razonGuardar(v);
  const [largo, breve, cls] = textoPersistencia(id, dirty);
  const est = $('#estado'); est.textContent = largo; est.className = 'estado-btn ' + cls;           // persistencia, siempre explícita
  const brevePeso = v.invalidos.length ? 'Revisa los pesos' : v.exceso ? `Exceso: ${pesoCorto(v.exceso)}` : 'Pública: debe sumar 100 %';
  const be = $('#b-estado'), bloqueo = razon && !saveErr;                                             // barra: el motivo del bloqueo, si lo hay
  be.textContent = bloqueo ? '⚠ ' + brevePeso : breve; be.className = 'bg-estado estado-btn ' + (bloqueo ? 'aviso' : cls);
  const m = $('#motivo'); m.textContent = saveErr ? saveErr : (razon || ''); m.className = 'motivo solo-escritorio-ws' + (saveErr ? ' error' : ''); // motivo al lado de Guardar
  $('#estado-live').textContent = largo + (razon ? '. ' + razon : '');
  const c = $('#chip'); c.textContent = current.publico ? 'Pública' : 'Privada'; c.classList.toggle('pub', !!current.publico); // privacidad
  $$('.js-guardar').forEach(b => { b.disabled = !!razon || saving || (id && !dirty); b.setAttribute('aria-describedby', 'motivo estado'); });
  $('#mi-descartar').hidden = !(id && dirty);
  pintarPublicacion(v);
  window.onbeforeunload = id && dirty ? e => { e.preventDefault(); e.returnValue = ''; } : null; // no perder cambios por error
}
function pintarPublicacion(v = validar()) {
  const pub = !!current?.publico, r = razonPublicar(v);
  $('#pub-chip').textContent = pub ? 'Pública' : 'Privada'; $('#pub-chip').classList.toggle('pub', pub);
  $('#publicar').textContent = pub ? 'Dejar de publicar' : 'Publicar cartera';
  $('#publicar').disabled = !pub && !!r;                      // no disponible: se ve igual que Guardar desactivado, con su motivo al lado
  $('#tesis-guardar').hidden = !pub; $('#tesis-guardar').disabled = pub && !!r;
  const z = $('#pub-razon');
  z.textContent = pub ? (r ? `Mientras sea pública debe cumplir: ${r}` : 'Esta cartera es pública: se muestra su composición y tu tesis.') : (r ? `No disponible: ${r}` : 'Lista para publicar.');
  z.className = 'peq pub-razon' + (r ? ' aviso' : '');
}
function marcarCambio() { rev++; saveErr = null; hideToast(); guardarBorrador(); pintarEstado(); }

async function guardar() {
  if (!current) return false;
  const razon = razonGuardar(validar());
  if (razon) { saveErr = null; pintarEstado(); return false; }   // la misma regla que bloquea el botón; no se envía nada
  if (!logged()) { guardarBorrador(); abrirAcceso('guardar'); return false; }
  if (saving) return false;
  const nombre = $('#nombre').value.trim();
  if (!nombre) { saveErr = 'Escribe un nombre para la cartera.'; pintarEstado(); return false; }
  const r = rev; saving = true; saveErr = null; pintarEstado();
  try {
    if (!current.id) { const { id } = await api('/portfolios', { method: 'POST', body: { nombre, plantilla: current.plantilla } }); current.id = id; }
    await api('/portfolios/' + current.id, { method: 'PUT', body: { posiciones: pos } });
    const u = await api('/portfolios/' + current.id, { method: 'PATCH', body: { nombre, tesis: $('#tesis').value } });
    current.nombre = nombre; current.version = u.actualizado_en || current.version; savedRev = r; // si se editó durante el guardado, rev > r y sigue «con cambios»
    store.removeItem(DRAFT); guardarBorrador();                                                      // limpia la copia local si ya no hay cambios pendientes
    try { if (location.hash !== '#cartera-' + current.id) history.replaceState(null, '', '#cartera-' + current.id); } catch {}
    $$('.solo-cuenta').forEach(e => e.hidden = false); $('#mi-eliminar').hidden = false;
    toast('Cartera guardada');
  } catch (err) { saveErr = err.message; }                                                            // un fallo nunca muestra «guardada»; los cambios siguen en local
  finally { saving = false; pintarEstado(); }
  return !saveErr;
}
$$('.js-guardar').forEach(b => b.addEventListener('click', guardar));

async function cambiarPublicacion(publico) {
  const err = $('#pub-error'); err.textContent = '';
  if (publico) { // mismas reglas que el servidor; sin petición si no son válidas
    const r = razonPublicar(validar()); if (r) { err.textContent = r; return; }
    if (rev !== savedRev && !(await guardar())) { err.textContent = 'No se ha publicado: no se pudieron guardar los cambios' + (saveErr ? ' (' + saveErr + ')' : '') + '.'; return; }
  }
  try {
    const u = await api('/portfolios/' + current.id, { method: 'PATCH', body: publico ? { nombre: $('#nombre').value.trim(), tesis: $('#tesis').value, publico: true } : { publico: false } });
    current.publico = publico ? 1 : 0; current.version = u.actualizado_en || current.version; pintarEstado(); loadPublicas();
    toast(publico ? 'Cartera publicada' : 'La cartera vuelve a ser privada');
  } catch (e) { err.textContent = e.message; }
}
$('#publicar').addEventListener('click', () => cambiarPublicacion(!current.publico));
$('#tesis-guardar').addEventListener('click', () => cambiarPublicacion(true));
$('#nombre').addEventListener('input', marcarCambio);
$('#tesis').addEventListener('input', marcarCambio);

// Detalle ampliado (lo esencial ya está en el texto visible de estado)
function abrirInfoEstado() {
  if (!current) return;
  const id = enCuenta(), dirty = rev !== savedRev, pub = !!current.publico, v = validar(), r = calcResumen(pos);
  const reparto = !r.n ? 'Sin posiciones todavía.' : v.exceso ? `Exceso de asignación: ${pesoCorto(v.exceso)}. No se puede guardar en la cuenta ni publicar hasta corregirlo.` : v.falta ? `Pendiente de asignar: ${pesoCorto(v.falta)}. Se puede guardar en privado como reparto incompleto; no se puede publicar.` : 'Asignado: 100 %. Es un reparto completo.';
  $('#es-cuerpo').innerHTML = `
    <div><dt>Persistencia</dt><dd>${id ? (dirty ? 'Tienes cambios sin guardar en tu cuenta.' + (copiaLocal ? ' Se conservan en este dispositivo.' : '') : 'Guardada en tu cuenta. Todo lo que ves está guardado.') : 'Solo en este dispositivo, como borrador en este navegador. No está en tu cuenta ni se sincroniza con otros dispositivos, y se perdería si borras los datos del navegador.'}</dd></div>
    <div><dt>Validez del reparto</dt><dd>${reparto}</dd></div>
    <div><dt>Privacidad</dt><dd>${pub ? 'Pública: se muestra su composición y tu tesis en «Carteras públicas». La versión publicada solo cambia cuando guardas un reparto válido.' : 'Privada: solo la ves tú.'}</dd></div>`;
  $('#es-acciones').innerHTML = id ? '' : '<button class="btn btn-primario" type="button" id="es-guardar">Guardar en mi cuenta</button>';
  const g = $('#es-guardar'); if (g) g.addEventListener('click', () => { $('#dlg-estado').close(); guardar(); });
  $('#dlg-estado').showModal();
}
$('#estado').addEventListener('click', abrirInfoEstado);
$('#b-estado').addEventListener('click', abrirInfoEstado);
$('#rb-ver').addEventListener('click', () => { const d = $('#res-detalle'); d.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' }); d.focus({ preventScroll: true }); });

// ---------- barra inferior: espacio reservado y teclado virtual ----------
const barra = $('#barra-guardar');
function medirBarra() { document.documentElement.style.setProperty('--barra-alto', (barra.hidden || document.body.classList.contains('teclado')) ? '0px' : barra.offsetHeight + 'px'); }
if ('ResizeObserver' in window) new ResizeObserver(medirBarra).observe(barra);
if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { // teclado abierto: la barra se oculta para no tapar el campo
  document.body.classList.toggle('teclado', window.visualViewport.height < window.innerHeight * 0.75); medirBarra();
});
document.addEventListener('focusin', e => { // el campo activo queda a la vista, nunca bajo la barra
  if (!e.target.classList?.contains('peso-in')) return;
  const el = e.target; setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'auto' }), 300);
});

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
  const falta = r1(100 - validar().total);
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
    texto: `Se sustituirán las ${pos.length} posiciones actuales por el reparto de la plantilla ${nombrePlantilla(current.plantilla)}. ${enCuenta() ? 'No se guarda en tu cuenta hasta que pulses «Guardar cartera».' : 'Seguirás teniendo el borrador en este dispositivo.'}`,
    ok: 'Reemplazar' }))) return;
  pos = repartoPlantilla(current.plantilla); marcarCambio(); renderPosiciones(); renderResumen(); renderCharts();
  toast('Reparto de la plantilla aplicado');
});
$('#mi-descartar').addEventListener('click', async () => {
  masAbrir(false); masBtn.focus();
  if (!(await confirmar({ titulo: 'Descartar cambios sin guardar', texto: 'Se borrarán los cambios que no has guardado, también la copia de este dispositivo, y volverás a la versión guardada en tu cuenta.', ok: 'Descartar cambios', peligro: true }))) return;
  const id = current.id; store.removeItem('klever_edit_' + id); current = null; if (await cargarCartera(id)) renderWorkspace();
});
$('#mi-eliminar').addEventListener('click', async () => {
  masAbrir(false); masBtn.focus();
  if (!(await confirmar({ titulo: 'Eliminar cartera', texto: `Se eliminará «${current.nombre}» de tu cuenta, con todas sus posiciones. No se puede deshacer.`, ok: 'Eliminar cartera', peligro: true }))) return;
  try { await api('/portfolios/' + current.id, { method: 'DELETE' }); } catch (err) { return toast(err.message); }
  store.removeItem('klever_edit_' + current.id); current = null; pos = []; chartEls.clear(); window.onbeforeunload = null; toast('Cartera eliminada'); loadPublicas(); go('#carteras');
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
// Cada comprobación: [nombre, regla, formato → [cifra, unidad]]. La unidad larga va aparte para no competir con la regla.
const CRIT = {
  deuda_ebitda: ['Deuda sobre EBITDA', 'Cumple si la deuda neta es menor de 2,5 veces el EBITDA', v => [nf(v), 'veces']],
  roic: ['ROIC', 'Cumple si supera el 10 %', v => [pct(v), '']],
  margen_neto: ['Margen neto', 'Cumple si el beneficio neto supera el 10 % de las ventas', v => [pct(v), '']],
  flujo_caja: ['Caja libre', 'Cumple si el flujo de caja libre es positivo', v => [nf(v / 1e9), 'miles de millones de USD']],
  crecimiento: ['Crecimiento de ventas', 'Cumple si las ventas suben respecto al año anterior', v => [pct(v), '']],
};
let empresas = [];
function renderEmpresas() {
  const q = norm($('#emp-buscar').value.trim()), tb = $('#empresas-lista'), ul = $('#empresas-cards');
  const vistas = q ? empresas.filter(r => norm(r.ticker + ' ' + r.nombre + ' ' + r.sector).includes(q)) : empresas;
  const resultado = r => { const nd = 5 - r.evaluados; // un dato ausente NO es una comprobación fallida: se indica aparte y en neutro
    return `<span class="marca-n">${r.cumplidos} de 5</span>${nd ? `<small>${nd} no ${nd === 1 ? 'disponible' : 'disponibles'}</small>` : ''}`; };
  tb.innerHTML = vistas.length ? vistas.map(r => `<tr><td><span class="nombre-emp">${esc(r.nombre)}</span> <span class="simbolo">${esc(r.ticker)}</span></td><td>${esc(r.sector)}</td>
      <td class="num">${resultado(r)}</td>
      <td><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button></td></tr>`).join('')
    : `<tr><td colspan="4" class="estado-lista">${empresas.length ? 'Ninguna empresa coincide con tu búsqueda.' : 'Aún no hay datos. Se cargan desde la SEC cada noche.'}</td></tr>`;
  ul.innerHTML = vistas.length ? vistas.map(r => `<li class="emp-card">
      <div class="ec-l1"><span class="nombre-emp">${esc(r.nombre)}</span><span class="ec-res">${resultado(r)}</span></div>
      <div class="ec-l2"><span class="simbolo">${esc(r.ticker)}</span><span class="ec-sector">${esc(r.sector)}</span><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button></div></li>`).join('')
    : `<li class="estado-lista">${empresas.length ? 'Ninguna empresa coincide con tu búsqueda.' : 'Aún no hay datos. Se cargan desde la SEC cada noche.'}</li>`;
  $('#emp-cuenta').textContent = empresas.length ? `${vistas.length} de ${empresas.length} empresas` : '';
}
async function loadEmpresas() {
  $('#empresas-lista').innerHTML = '<tr><td colspan="4" class="estado-lista">Cargando empresas…</td></tr>';
  $('#empresas-cards').innerHTML = '<li class="estado-lista">Cargando empresas…</li>';
  try { empresas = await getJson('/ideas'); }
  catch { const m = 'No se pudieron cargar las empresas. <button class="enlace" data-retry="empresas" type="button">Reintentar</button>'; $('#empresas-lista').innerHTML = `<tr><td colspan="4" class="estado-lista">${m}</td></tr>`; $('#empresas-cards').innerHTML = `<li class="estado-lista">${m}</li>`; return; }
  renderEmpresas();
}
$('#emp-buscar').addEventListener('input', renderEmpresas);
for (const lista of [$('#empresas-lista'), $('#empresas-cards')]) lista.addEventListener('click', e => { const b = e.target.closest('[data-t]') || e.target.closest('tr,li')?.querySelector('[data-t]'); if (b) verFicha(b.dataset.t); });
$('#ir-screener').addEventListener('click', () => { const s = $('#filtros-precio'); s.scrollIntoView({ behavior: 'auto' }); s.focus({ preventScroll: true }); }); // salto largo: sin animación

async function verFicha(t) {
  let a; try { a = await getJson('/assets/' + t); } catch { return toast('No se pudo cargar la ficha'); }
  const c = a.criterios, periodo = c?.periodo || a.fundamentales[0]?.periodo || '';
  const filas = Object.entries(CRIT).map(([k, [label, regla, f]]) => {
    const x = c?.[k], res = x?.ok === true ? ['ok', '✓ Cumple'] : x?.ok === false ? ['no', '✗ No cumple'] : ['nd', '– No disponible'];
    return `<li><div class="ck-crit"><b>${label}</b><small>${regla}</small></div><div class="ck-res"><span class="res ${res[0]}">${res[1]}</span>${x?.valor != null ? (([c, u]) => `<span class="ck-val"><b class="v">${c}</b>${u ? `<span class="u">${u}</span>` : ''}</span>`)(f(x.valor)) : '<span class="ck-val"><span class="u">Dato no disponible</span></span>'}</div></li>`;
  }).join('');
  const ok = c ? Object.keys(CRIT).filter(k => c[k]?.ok === true).length : 0, nd = c ? Object.keys(CRIT).filter(k => c[k]?.ok == null).length : 5;
  const hist = a.fundamentales.map(x => `<tr><th scope="row">${esc(x.periodo)}</th><td>${miles(x.ingresos)}</td><td>${miles(x.beneficio_neto)}</td><td>${miles(x.ebitda)}</td><td>${miles(x.flujo_caja_libre)}</td><td>${pct(x.roic)}</td></tr>`).join('');
  $('#fi-titulo').textContent = a.nombre;
  $('#fi-sub').textContent = `${a.ticker} · ${a.sector}${periodo ? ' · Datos del ejercicio ' + periodo : ''}`;
  $('#fi-cuerpo').innerHTML = `<p class="resumen-ficha">Supera ${ok} de 5 comprobaciones${nd ? ` · ${nd} no ${nd === 1 ? 'disponible' : 'disponibles'}` : ''}</p>
    <ul class="checks">${filas}</ul>
    ${nd ? '<p class="mut peq">Una comprobación no disponible no suma ni resta.</p>' : ''}
    <h3>Cifras de los últimos años · miles de millones de dólares (USD)</h3>
    <p class="hint-scroll">Desliza la tabla hacia los lados para ver todas las columnas →</p>
    <div class="tabla-h" role="region" aria-label="Cifras históricas, desplazable horizontalmente" tabindex="0"><table><caption class="sr">Cifras en miles de millones de dólares (USD); el ROIC va en porcentaje</caption>
      <thead><tr><th scope="col">Año</th><th scope="col">Ventas</th><th scope="col">Beneficio neto</th><th scope="col">EBITDA</th><th scope="col">Caja libre</th><th scope="col">ROIC (%)</th></tr></thead><tbody>${hist}</tbody></table></div>
    <p class="mut peq">Fuente: informes anuales (10-K) de la empresa ante la SEC (EDGAR). Importes en miles de millones de dólares estadounidenses (USD).</p>
    <details class="ficha-det"><summary>Metodología</summary><div><p>EBITDA = resultado operativo + amortizaciones. Caja libre = flujo de caja operativo − inversiones en inmovilizado. El ROIC se aproxima como resultado operativo × (1 − tasa de impuestos) ÷ (deuda a largo plazo + patrimonio − caja). Son cálculos aproximados y pueden contener errores.</p></div></details>
    <details class="ficha-det"><summary>Glosario</summary><div>
      <p><b>ROIC:</b> cuánto gana la empresa por cada dólar invertido en su negocio. Es una medida de la empresa; no es la rentabilidad que obtendría un inversor.</p>
      <p><b>EBITDA:</b> beneficio operativo antes de intereses, impuestos y amortizaciones.</p>
      <p><b>Caja libre:</b> dinero que queda tras pagar las operaciones y las inversiones necesarias.</p>
      <p><b>No disponible:</b> el dato falta en los informes. <b>No aplicable:</b> la medida no tiene sentido para ese activo (por ejemplo, el ROIC de un fondo).</p></div></details>`;
  const d = $('#dlg-ficha'); if (!d.open) d.showModal(); d.scrollTop = 0;
}

// ---------- carteras públicas ----------
let publicas = null, publicasError = false;
const etiquetaOrigen = o => o === 'ejemplo' ? '<span class="chip origen">Ejemplo de Klever</span>' : '<span class="chip origen usr">Publicada por un usuario</span>';
function tarjetaPublica(p) {
  return `<button class="tarjeta" type="button" data-pid="${p.id}">${etiquetaOrigen(p.origen)}<b>${esc(p.nombre)}</b>
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
  d.innerHTML = `<h2>${esc(p.nombre)}</h2><p>${etiquetaOrigen(p.origen)} <span class="mut">Plantilla ${esc(nombrePlantilla(p.plantilla))}</span></p>${p.tesis ? `<p><b>Tesis:</b> ${esc(p.tesis)}</p>` : ''}
    <div class="tabla-h" role="region" aria-label="Composición" tabindex="0"><table><caption class="sr">Composición de la cartera</caption><thead><tr><th scope="col">Activo</th><th scope="col">Categoría</th><th scope="col">Peso</th></tr></thead><tbody>${p.posiciones.map(x =>
      `<tr><th scope="row"><b>${esc(x.ticker)}</b> <span class="mut">${esc(x.nombre)}</span></th><td style="text-align:left">${esc(x.sector)}</td><td class="num">${pesoTxt(x.peso)}</td></tr>`).join('')}</tbody></table></div>
    <p class="mut peq">Distribución por categorías: ${r.sectores.map(([s, v]) => `${esc(s)} ${pesoTxt(v)}`).join(' · ')}. Simulación educativa; no es una recomendación de inversión.</p>`;
  d.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
}
let pendientePublica = null;
const vistaActual = () => [...$$('[data-vista]')].find(s => !s.hidden)?.dataset.vista;
document.addEventListener('click', e => { const b = e.target.closest('[data-pid]'); if (b) verPublica(b.dataset.pid); });
new MutationObserver(() => { if (vistaActual() === 'publicas' && pendientePublica) { const id = pendientePublica; pendientePublica = null; verPublica(id); } })
  .observe($('#vista-publicas'), { attributes: true, attributeFilter: ['hidden'] });

// ---------- portada: acción principal y vista previa real ----------
$('#probar').addEventListener('click', () => { // destino inequívoco: la elección de plantilla, con el foco allí
  const s = $('#plantillas'); s.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth' }); s.querySelector('.plantilla').focus({ preventScroll: true });
});
$$('[data-plantilla]').forEach(b => b.addEventListener('click', () => abrirInvitado(b.dataset.plantilla)));
function renderPreview() {
  const ps = repartoPlantilla('dividendos'); if (!ps.length) return;
  const r = calcResumen(ps), vis = ps.slice(0, 3), resto = ps.length - vis.length;
  $('#prev').innerHTML = `<div class="prev"><div class="prev-cab"><b>Cartera de dividendos</b><span class="chip">Vista previa</span></div>
    <div class="prev-fila prev-th" aria-hidden="true"><span>Activo</span><span class="num">Peso</span><span class="num"><abbr>ROIC</abbr></span></div>
    ${vis.map(p => `<div class="prev-fila"><span><b>${esc(p.ticker)}</b><small>${esc(by[p.ticker].nombre)}</small></span><span class="num">${pesoTxt(p.peso)}</span><span class="num">${roicTxt(by[p.ticker])}</span></div>`).join('')}
    ${resto ? `<div class="prev-mas">+${resto} posiciones más. Lista abreviada: los totales incluyen las ${ps.length} posiciones.</div>` : ''}
    <div class="barra" aria-hidden="true"><i style="width:${Math.min(100, r.total)}%"></i></div>
    <div class="prev-pie"><div><span>Total asignado</span><b class="num">${pesoTxt(r.total)}</b></div><div><span><abbr title="Rentabilidad sobre el capital invertido">ROIC</abbr> medio de empresas con datos</span><b class="num">${pct(r.roic)}</b></div></div></div>`;
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
  if (logged()) {
    await migrarBorrador();
    if (avisoOtroDispositivo) toast('Has entrado en tu cuenta, pero el borrador que pediste guardar no estaba en este dispositivo y no se ha guardado. Sigue en el dispositivo donde lo creaste.', 10000);
  }
  route(true);
})();
