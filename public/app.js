// =====================================================================
// Klever · interfaz. Sin dependencias.
// Vistas (hash): inicio · empresas · publicas · carteras · cartera / cartera-<id>
// Tres conceptos separados en el editor:
//   · DÓNDE está guardada  → este dispositivo (borrador) o tu cuenta
//   · CAMBIOS pendientes   → versión actual (rev) frente a la última guardada (savedRev)
//   · VISIBILIDAD          → privada o pública
// =====================================================================

// ---------- utilidades ----------
import { iniciarLab, cargarOrigenDatos, cargarRadar, enRadar, migrarRadarLocal, pintarRadiografia, pintarFichaRadar, mostrarSeguimiento, mostrarLab, origenDatos, origenFicha, limpiarSesionLab, abrirLab, origenCodigo } from './js/lab.js';
import { iniciarIdeas, mostrarEjemplo, mostrarComparar } from './js/ideas.js';
import { iniciarRevista, mostrarRevista, mostrarArticulo } from './js/revista.js';
const store = (() => { const m = {}; let ok = true; try { localStorage.setItem('__k', '1'); localStorage.removeItem('__k'); } catch { ok = false; } return { ok, // ok: ¿persiste de verdad en este dispositivo?
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } },
  // Variantes ESTRICTAS (radar del visitante): lanzan si el almacenamiento falla, en vez de caer en silencio a la memoria y devolver después el valor anterior.
  setItemEstricto: (k, v) => localStorage.setItem(k, v), getItemEstricto: k => localStorage.getItem(k), removeItemEstricto: k => localStorage.removeItem(k) }; })();
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

// Avisos: zona reservada bajo la cabecera (no flotan sobre nada). Los de éxito se cierran solos; los ERRORES que requieren actuar
// permanecen hasta que se cierran («Cerrar aviso») y se anuncian como alerta.
let toastTimer;
function mostrarAviso(msg, error, ms) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on'); t.classList.toggle('error', error);
  t.setAttribute('role', error ? 'alert' : 'status'); t.setAttribute('aria-live', error ? 'assertive' : 'polite');
  $('#toast-x').hidden = !error; const w = $('#avisos'); w.classList.add('on'); w.classList.toggle('fija', error || matchMedia('(min-width:720px)').matches); medirAvisos(); clearTimeout(toastTimer);
  if (!error) toastTimer = setTimeout(cerrarAviso, ms);
}
const toast = (msg, ms = 4000) => { if (msg) mostrarAviso(msg, false, ms); };
const toastError = msg => { if (msg) mostrarAviso(msg, true); };   // un mensaje vacío (respuesta de una sesión anterior) no se muestra
function cerrarAviso() { clearTimeout(toastTimer); $('#toast').classList.remove('on', 'error'); $('#avisos').classList.remove('on', 'fija'); $('#toast-x').hidden = true; medirAvisos(); }
// Zona fija de arriba: solo cuenta si el aviso está pegado (.fija). El navegador la respeta al enfocar o desplazar (scroll-padding-top), así ningún campo ni botón queda bajo ella.
function medirAvisos() { const w = $('#avisos'); document.documentElement.style.setProperty('--avisos-alto', (w.classList.contains('on') && w.classList.contains('fija') ? Math.ceil(w.getBoundingClientRect().height) : 0) + 'px'); }
if ('ResizeObserver' in window) new ResizeObserver(medirAvisos).observe($('#avisos'));
function hideToast() { if (!$('#toast').classList.contains('error')) cerrarAviso(); } // al editar se retiran los avisos de éxito, nunca un error pendiente
$('#toast-x').addEventListener('click', cerrarAviso);

const API = '/api';
const tok = () => store.getItem('klever_token');
const logged = () => !!tok();

async function api(path, opts = {}) {
  let r; const t0 = tok();                                           // el token con el que SALE la petición: es el único que puede caducar por su respuesta
  try {
    r = await fetch(API + path, {
      ...opts,
      headers: { 'content-type': 'application/json', ...(t0 ? { authorization: 'Bearer ' + t0 } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch { throw new Error('Sin conexión con el servidor. Inténtalo de nuevo.'); }
  const data = await r.json().catch(() => ({}));
  if (t0 !== tok()) { const e = new Error(''); e.obsoleta = true; e.status = 0; throw e; }   // la sesión cambió mientras llegaba: la respuesta NO se usa (ni un 401 retrasado desconecta a otra persona)
  if (r.status === 401 && t0) sesionCaducada();
  if (!r.ok) { const e = new Error(data.error || 'Error ' + r.status); e.status = r.status; e.data = data; throw e; }
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
let posGuardada = [];        // la composición tal como está guardada en la cuenta (la radiografía distingue guardada / cambios locales)
let rev = 0, savedRev = 0, saving = false, saveErr = null;
const DRAFT = 'klever_borrador';
const leerBorrador = () => { try { return JSON.parse(store.getItem(DRAFT)); } catch { return null; } };
const hayBorrador = () => !!leerBorrador()?.pos?.length;
let copiaLocal = false, recuperado = false; // copiaLocal: hay una copia de los cambios en este dispositivo (y persiste de verdad)
const leerCopia = id => { try { return JSON.parse(store.getItem('klever_edit_' + id)); } catch { return null; } };
function guardarBorrador(conservarFecha = false) { // conservarFecha: se reescribe la copia (p. ej. nueva versión base) sin cambiar cuándo se editó
  if (!current) return;
  if (!current.id) { // aún no está en la cuenta: borrador del dispositivo
    store.setItem(DRAFT, JSON.stringify({ plantilla: current.plantilla, origen: current.origen || 'plantilla', nombre: $('#nombre').value || current.nombre, pos })); copiaLocal = store.ok; return;
  }
  const key = 'klever_edit_' + current.id; // cartera de la cuenta: copia de los cambios sin guardar
  if (rev !== savedRev) {
    const t = (conservarFecha && leerCopia(current.id)?.t) || new Date().toISOString();
    store.setItem(key, JSON.stringify({ nombre: $('#nombre').value, tesis: $('#tesis').value, pos, base: current.revision, t })); copiaLocal = store.ok;
  }
  else { store.removeItem(key); copiaLocal = false; }
}
const enCuenta = () => logged() && !!current?.id;

async function loadAssets() {
  try { assets = await getJson('/assets'); by = Object.fromEntries(assets.map(a => [a.ticker, a])); }
  catch { toastError('No se pudieron cargar los activos. Recarga la página.'); }
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
  const nota = current?.publico ? ' La versión publicada no cambia.' : ''; // en una cartera pública, aclarar que lo publicado sigue intacto
  if (v.invalidos.length) return `Revisa el peso de ${listaTickers(v.invalidos)}: debe ser un número entre 0,1 y 100.${nota}`;
  if (v.exceso) return `Exceso de asignación: ${pesoCorto(v.exceso)}. Reduce los pesos hasta sumar 100 %.${nota}`;
  if (current?.publico && !v.completa) return `Cartera pública: la versión publicada no cambia hasta que el reparto vuelva a sumar el 100 % (pendiente de asignar: ${pesoCorto(v.falta)}). ${copiaLocal ? 'Tus cambios siguen en este dispositivo. ' : ''}Si prefieres guardar un reparto incompleto, deja de publicarla.`;
  return null;
}
function razonPublicar(v) {
  if (!v.n) return 'Añade al menos una posición para publicar.';
  if (v.invalidos.length) return `Revisa el peso de ${listaTickers(v.invalidos)}: debe ser un número entre 0,1 y 100.`;
  if (v.exceso) return `Exceso de asignación: ${pesoCorto(v.exceso)}. Reduce los pesos hasta sumar 100 %.`;
  if (v.falta) return `Pendiente de asignar: ${pesoCorto(v.falta)}. Una cartera pública debe tener el 100 % asignado.`;
  if (!$('#tesis').value.trim()) return 'Escribe una tesis para poder publicar.';
  return null;
}

// ---------- diálogos ----------
function cerrarAlPulsarFuera(d) { // clic en el fondo (no en el relleno del diálogo); los diálogos de decisión (data-fijo) no se cierran así
  if (d.hasAttribute('data-fijo')) return;
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
let accEmail = '', cooldownT = null;
const AVISO = 'klever_aviso_borrador'; // el enlace se pidió con un borrador que no está en este navegador
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
    if (r.con_borrador && !hayBorrador()) store.setItem(AVISO, '1'); else store.removeItem(AVISO);
  } catch (err) { toastError(err.message); }
}
// Al salir o caducar la sesión se borra TODO lo privado de la memoria y de la pantalla, y se invalidan las respuestas que aún estén en vuelo.
let sesionSeq = 0;
function limpiarPrivado() {
  sesionSeq++; misSeq++; nMis = null;
  current = null; pos = []; posGuardada = []; rev = savedRev = 0; saving = false; saveErr = null; copiaLocal = false; chartEls.clear();
  for (const s of ['#mis-lista', '#pos-tabla tbody', '#pos-cards', '#graficos', '#r-sectores', '#comp-barra']) { const e = $(s); if (e) e.innerHTML = ''; }
  for (const s of ['#nombre', '#tesis']) { const e = $(s); if (e) e.value = ''; }
  document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch { /* ya cerrado */ } });   // un diálogo de conflicto o de ficha de la sesión anterior no se queda abierto
  limpiarSesionLab();
}
function sesionCaducada() {
  store.removeItem('klever_token'); limpiarPrivado(); actualizarCabecera(); route(); abrirAcceso('caducada');
}
// Copias locales de cambios sin guardar (recuperación privada): se avisan al salir, se purgan las ajenas al entrar y caducan a los 7 días.
const COPIA_DIAS = 7;
function clavesCopias() { const ks = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('klever_edit_')) ks.push(k); } } catch { /* sin almacenamiento */ } return ks; }
function purgarCopias(idsPropios = null) {                           // idsPropios: ids de las carteras de ESTA cuenta (o null = solo caducidad)
  let n = 0;
  for (const k of clavesCopias()) {
    let c = null; try { c = JSON.parse(store.getItem(k)); } catch { /* dañada: se borra */ }
    const caducada = !c || !c.t || (Date.now() - new Date(c.t).getTime()) > COPIA_DIAS * 864e5, ajena = idsPropios && !idsPropios.includes(Number(k.slice('klever_edit_'.length)));
    if (caducada || ajena) { store.removeItem(k); n++; }
  }
  return n;
}
function confirmarSalidaConCambios() {                                // true = se puede salir (se descartan las copias); false = se queda
  guardarBorrador();
  const ks = clavesCopias(); if (!ks.length) return Promise.resolve(true);
  const d = $('#dlg-salir'); $('#salir-n').textContent = ks.length === 1 ? '1 cartera' : ks.length + ' carteras';
  return new Promise(res => {
    const fin = v => { d.close(); res(v); };
    $('#salir-volver').onclick = () => { fin(false); const id = ks[0].slice('klever_edit_'.length); go('#cartera-' + id); };
    $('#salir-descartar').onclick = () => { ks.forEach(k => store.removeItem(k)); fin(true); };
    d.oncancel = e => { e.preventDefault(); fin(false); };
    d.showModal(); $('#salir-volver').focus();
  });
}
async function cerrarSesion() {
  if (!(await confirmarSalidaConCambios())) return;
  const t = tok();                                                    // se limpia YA (sin esperar al servidor): nada privado queda mientras llega la respuesta
  store.removeItem('klever_token'); store.removeItem(AVISO); limpiarPrivado(); actualizarCabecera(); go('#inicio');
  if (t) fetch(API + '/logout', { method: 'POST', headers: { authorization: 'Bearer ' + t } }).catch(() => {});
}
$('#salir').addEventListener('click', cerrarSesion);
$('#salir-m').addEventListener('click', cerrarSesion);
function actualizarCabecera() {
  const l = logged();
  $('#entrar').hidden = l; if (typeof pintarEntrada === 'function') pintarEntrada(); $('#salir').hidden = !l; $('#salir-m').hidden = !l;
  $$('.nav-mis').forEach(e => e.hidden = !l);
}

// ---------- menú móvil ----------
const btnMenu = $('#btn-menu'), menuMovil = $('#menu-movil');
function menuAbrir(v) { menuMovil.hidden = !v; btnMenu.setAttribute('aria-expanded', String(v)); }
btnMenu.addEventListener('click', () => menuAbrir(menuMovil.hidden));
menuMovil.addEventListener('click', e => { if (e.target.closest('a,button')) menuAbrir(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menuMovil.hidden) { menuAbrir(false); btnMenu.focus(); } });

// ---------- rutas ----------
const VISTAS = ['inicio', 'empresas', 'publicas', 'carteras', 'cartera', 'seguimiento', 'lab', 'revista', 'articulo', 'ejemplo', 'comparar'];
// Navegación principal de TRES destinos: Cartera, Ideas (historias, empresas y carteras públicas) y Seguimiento.
const NAV = { inicio: 'crear', cartera: 'crear', lab: 'crear', ejemplo: 'crear', carteras: 'mis', comparar: 'revista', revista: 'revista', articulo: 'revista', empresas: 'revista', publicas: 'revista', seguimiento: 'cuaderno' };
const IDEAS = { revista: 'revista', articulo: 'revista', empresas: 'empresas', publicas: 'publicas' };
const TITULOS = { inicio: 'Crea, entiende y sigue tu portafolio', empresas: 'Explorar empresas', publicas: 'Carteras públicas', carteras: 'Mis portafolios', cartera: 'Editor de cartera', seguimiento: 'Cuaderno', lab: 'Laboratorio', revista: 'Ideas', articulo: 'Ideas', ejemplo: 'Cartera de ejemplo', comparar: 'Comparar empresas' };
let routeSeq = 0;
function go(h) { if (location.hash === h) route(); else location.hash = h; }

async function route(primera = false) {
  const seq = ++routeSeq, l = logged();
  const h = location.hash.replace(/^#/, '');
  if (h === 'contenido') { $('#contenido').focus(); return; }
  const m = h.match(/^cartera-(\d+)$/), me = h.match(/^escenario-(\d+)$/), mh = h.match(/^historia-([a-z0-9-]+)$/), mt = h.match(/^tesis-([a-z0-9-]+)-(\d+)$/), mc = h.match(/^comparar-([A-Z.]{1,6})(?:-([A-Z.]{1,6}))?$/);
  const articulo = mh ? { tipo: 'historia', id: mh[1] } : mt ? { tipo: 'tesis', id: mt[1], n: +mt[2] } : null;
  let v = m ? 'cartera' : me || h === 'laboratorio' ? 'lab' : articulo ? 'articulo' : mc ? 'comparar' : h;
  if (!VISTAS.includes(v) || v === 'inicio') v = l ? 'carteras' : 'inicio';
  if (v === 'carteras' && !l) v = 'inicio';
  if (v === 'cartera') {
    if (m) {
      if (!l) v = 'inicio';
      else if (current?.id !== +m[1]) { $$('[data-vista]').forEach(x => x.hidden = true); const ok = await cargarCartera(+m[1], seq); // sin vista de fondo mientras carga: un diálogo de conflicto no debe salir sobre la portada
 if (seq !== routeSeq) return; if (!ok) v = 'carteras'; }
    } else if (!current) { const d = leerBorrador(); if (d?.pos?.length) restaurarBorrador(d); else v = l ? 'carteras' : 'inicio'; }
  }
  mostrar(v, primera, { escenarioId: me ? +me[1] : null, articulo, comparar: mc ? { a: mc[1], b: mc[2] || null } : null });
}
function mostrar(v, primera, extra = {}) {
  const { escenarioId = null, articulo = null, comparar = null } = extra;
  $$('[data-vista]').forEach(s => s.hidden = s.dataset.vista !== v);
  const nv = v === 'lab' && escenarioId ? 'cuaderno' : NAV[v];
  $$('[data-nav]').forEach(a => a.dataset.nav === nv ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  $$('[data-ideas]').forEach(a => a.dataset.ideas === IDEAS[v] ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  document.body.classList.toggle('en-cartera', v === 'cartera');
  $('#barra-guardar').hidden = v !== 'cartera'; medirBarra(); menuAbrir(false);
  document.title = 'Klever · ' + TITULOS[v];
  if (v === 'cartera') renderWorkspace();
  if (v === 'carteras') cargarMisCarteras();
  if (v === 'seguimiento') mostrarSeguimiento();
  if (v === 'lab') mostrarLab(escenarioId ? 'escenario' : 'nuevo', escenarioId);
  if (v === 'revista') mostrarRevista();
  if (v === 'articulo') mostrarArticulo(articulo);
  if (v === 'inicio') pintarEntrada();
  if (v === 'ejemplo') mostrarEjemplo(true);
  if (v === 'comparar') mostrarComparar(comparar);
  if (!primera) { window.scrollTo(0, 0); $('#contenido').focus({ preventScroll: true }); }
}
// Hasta que el arranque termina (sesión, activos, módulos) el hash puede cambiar —p. ej. al canjear el enlace de acceso con la red lenta—: ese cambio lo atiende la ruta final del arranque.
let arrancado = false;
window.addEventListener('hashchange', () => { if (arrancado) route(); });

// ---------- carteras del usuario ----------
const parseF = iso => { const t = String(iso); return new Date(/[zZ]$|[+-]\d\d:?\d\d$/.test(t) ? t : t.replace(' ', 'T') + 'Z'); }; // sello del servidor (UTC, «AAAA-MM-DD HH:MM:SS») o ISO
const fmtFecha = iso => { const d = parseF(iso); return isNaN(d) ? '' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(d); };
const fmtFechaHora = iso => { const d = parseF(iso); return isNaN(d) ? '' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d); };
const txtAsig = (n, total) => !n ? 'Sin posiciones' : `${n} ${n === 1 ? 'posición' : 'posiciones'} · Asignado: ${pesoCorto(total)}${total < 100 ? ' (incompleta)' : total > 100 ? ' (exceso)' : ''}`;
const totalPos = ps => r1(ps.reduce((s, p) => s + (p.peso || 0), 0));
function pintarAviso() { // aviso persistente en «Mis carteras»: el borrador no está en este navegador
  const mostrar = !!store.getItem(AVISO) && !hayBorrador();
  $('#aviso-cuenta').hidden = !mostrar;
}
$('#aviso-cerrar').addEventListener('click', () => { store.removeItem(AVISO); pintarAviso(); $('#btn-nueva').hidden ? $('#nueva-nombre').focus() : $('#btn-nueva').focus(); });
let nMis = null;
function formNuevo(abrir, enfocar = true) {
  $('#form-nueva').hidden = !abrir; $('#btn-nueva').setAttribute('aria-expanded', String(abrir));
  $('#nueva-titulo').textContent = nMis === 0 ? 'Crea tu primera cartera' : 'Nueva cartera';
  $('#nueva-ayuda').hidden = nMis !== 0; $('#nueva-cancelar').hidden = nMis === 0; // sin carteras, crear es la acción principal: no hay nada que cancelar
  if (abrir && enfocar) $('#nueva-nombre').focus();
}
function composicionMini(ps) { // composición REAL de la cartera guardada: tramos proporcionales a su peso; sin datos inventados
  const lista = (ps || []).filter(x => x.peso > 0), total = r1(lista.reduce((s, x) => s + x.peso, 0)), escala = Math.max(100, total);
  if (!lista.length) return '<span class="ci-comp vacia" aria-hidden="true"></span>';
  const col = new Map(); lista.forEach((x, k) => col.set(x.ticker, k % 8)); // mismo orden que el editor al abrirla: mismos colores
  return `<span class="ci-comp${total > 100 ? ' exceso' : ''}" aria-hidden="true">${lista.map(x => `<i style="--c:var(--c${col.get(x.ticker)});width:${(x.peso / escala * 100).toFixed(2)}%"></i>`).join('')}${total < 100 ? `<i class="libre" style="width:${((100 - total) / escala * 100).toFixed(2)}%"></i>` : ''}</span>`;
}
function resumenComp(ps) { // «AAPL 30 % · MSFT 25 % · +3 más»: todo sale de los pesos guardados
  const lista = (ps || []).filter(x => x.peso > 0); if (!lista.length) return '';
  const vis = lista.slice(0, 3).map(x => `<b>${esc(x.ticker)}</b> ${pesoCorto(x.peso)}`).join(' · ');
  return vis + (lista.length > 3 ? ` · +${lista.length - 3} más` : '');
}
function itemCartera(p) {
  const n = p.n_posiciones, total = r1(p.total), loc = leerCopia(p.id), hayLocal = !!store.getItem('klever_edit_' + p.id);
  const fecha = p.actualizado_en ? `Modificada el ${fmtFecha(p.actualizado_en)}` : p.creado_en ? `Creada el ${fmtFecha(p.creado_en)}` : ''; // solo fechas que existen
  const chipLocal = hayLocal ? '<span class="chip aviso">Cambios locales pendientes de guardar en tu cuenta</span>' : '';
  const estadoAsig = !n ? 'Sin posiciones' : total === 100 ? '✓ Asignada al 100 %' : total > 100 ? `⚠ Exceso: ${pesoCorto(r1(total - 100))}` : `Falta asignar ${pesoCorto(r1(100 - total))}`;
  const claseAsig = !n ? '' : total === 100 ? 'ok' : total > 100 ? 'error' : 'aviso';
  // con cambios locales, cada cifra dice a qué versión pertenece: nunca se mezclan las de una con el estado de la otra
  const l2 = hayLocal ? `<span class="ci-l2"><span class="ci-v">Versión de tu cuenta:</span> ${txtAsig(n, total)}</span>` : `<span class="ci-l2 ${claseAsig}">${estadoAsig}${n ? ` · ${n} ${n === 1 ? 'posición' : 'posiciones'}` : ''}</span>`;
  const lLoc = hayLocal && Array.isArray(loc?.pos)
    ? `<span class="ci-l2 ci-loc"><span class="ci-v">Versión de este dispositivo:</span> ${txtAsig(loc.pos.length, totalPos(loc.pos))}${loc.t ? ` · editada el ${fmtFechaHora(loc.t)}` : ''}</span>` : '';
  const comp = resumenComp(p.posiciones);
  return `<li><button class="tarjeta cartera-item${hayLocal ? ' pendiente' : ''}" type="button" data-id="${p.id}" aria-label="${hayLocal ? 'Continuar editando' : 'Abrir'} ${esc(p.nombre)}">
    <span class="ci-l1"><b>${esc(p.nombre)}</b><span class="chip${p.publico ? ' pub' : ''}">${p.publico ? 'Pública' : 'Privada'}</span>${chipLocal}</span>
    ${composicionMini(p.posiciones)}${comp ? `<span class="ci-top">${comp}</span>` : ''}
    ${l2}${lLoc}${fecha ? `<span class="ci-l3 mut">${fecha}</span>` : ''}
    <span class="pl-acc"><span class="pl-acc-txt">${hayLocal ? 'Continuar editando' : 'Abrir'}</span></span></button></li>`;
}
let misSeq = 0;
async function cargarMisCarteras() {
  pintarAviso(); const seq = ++misSeq;
  const ul = $('#mis-lista'); ul.innerHTML = '<li class="estado-lista">Cargando tus carteras…</li>';
  try {
    const list = await api('/portfolios'); if (seq !== misSeq) return;   // la sesión cambió mientras llegaba la respuesta: no se pinta
    nMis = list.length;
    $('#btn-nueva').hidden = nMis === 0;
    if (nMis === 0) { ul.innerHTML = ''; formNuevo(true, false); return; }
    formNuevo(false); ul.innerHTML = list.map(itemCartera).join('');
  } catch (err) { if (seq !== misSeq) return; ul.innerHTML = `<li class="estado-lista">No se pudieron cargar tus carteras. <button class="enlace" data-retry="mis" type="button">Reintentar</button></li>`; }
}
$('#mis-lista').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) go('#cartera-' + b.dataset.id); });
$('#btn-nueva').addEventListener('click', () => formNuevo($('#form-nueva').hidden));
$('#nueva-cancelar').addEventListener('click', () => { formNuevo(false); $('#btn-nueva').focus(); });
$('#form-nueva').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target), btn = e.target.querySelector('button.btn-primario'); btn.disabled = true;
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla'), posiciones: repartoPlantilla(f.get('plantilla')) } }); // una sola operación: sin carteras vacías a medias
    e.target.reset(); go('#cartera-' + id);
  } catch (err) { toastError(err.message); } finally { btn.disabled = false; }
});
async function cargarCartera(id, rseq = null) {
  const s0 = sesionSeq; let c; try { c = await api('/portfolios/' + id); } catch (err) { toastError(err.message); return false; }
  if (s0 !== sesionSeq || (rseq !== null && rseq !== routeSeq)) return false;   // otra sesión u otra navegación: esta respuesta NO toca el estado
  current = { id: c.id, nombre: c.nombre, plantilla: c.plantilla, origen: c.origen || 'plantilla', tesis: c.tesis || '', publico: c.publico, revision: c.revision, limite_peso: c.limite_peso ?? null, fecha: c.actualizado_en || c.creado_en || '' };
  pos = c.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso })); posGuardada = pos.map(p => ({ ...p })); rev = savedRev = 0; saving = false; saveErr = null; copiaLocal = false;
  chartEls.clear(); $('#graficos').innerHTML = ''; colores.clear();
  await recuperarCambiosLocales(); return true;
}
// ---------- conflicto entre la versión de este dispositivo y la de la cuenta ----------
const sinDup = ps => ps.map(p => ({ ticker: p.ticker, peso: p.peso }));
function diferencias(loc, cta) { // lista breve y legible de qué cambia entre las dos versiones
  const d = [], L = Object.fromEntries(loc.pos.map(p => [p.ticker, p.peso])), C = Object.fromEntries(cta.pos.map(p => [p.ticker, p.peso]));
  if ((loc.nombre || '').trim() !== (cta.nombre || '').trim()) d.push(`Nombre: «${loc.nombre}» (este dispositivo) · «${cta.nombre}» (tu cuenta)`);
  if ((loc.tesis || '').trim() !== (cta.tesis || '').trim()) d.push('La tesis es distinta.');
  const soloL = Object.keys(L).filter(t => !(t in C)), soloC = Object.keys(C).filter(t => !(t in L));
  if (soloL.length) d.push(`Solo en este dispositivo: ${soloL.join(', ')}`);
  if (soloC.length) d.push(`Solo en tu cuenta: ${soloC.join(', ')}`);
  for (const t of Object.keys(L)) if (t in C && L[t] !== C[t]) d.push(`${t}: ${pesoCorto(L[t])} en este dispositivo · ${pesoCorto(C[t])} en tu cuenta`);
  return d;
}
function tarjetaVersion(titulo, fechaTxt, v) {
  return `<h3>${titulo}</h3><p class="mut peq">${fechaTxt}</p><p><b>${esc(v.nombre)}</b></p><p>${txtAsig(v.pos.length, totalPos(v.pos))}</p>`;
}
function dialogoConflicto(loc, cta, intro) { // Escape, cerrar o «Decidir después» = posponer: no eligen copia, no descartan datos y no escriben en la cuenta; el clic fuera no cierra
  return new Promise(res => {
    const d = $('#dlg-conflicto');
    $('#cn-intro').textContent = intro;
    $('#cn-local').innerHTML = tarjetaVersion('Versión de este dispositivo', loc.fecha ? `Editada el ${fmtFechaHora(loc.fecha)}` : 'Editada en este dispositivo', loc);
    $('#cn-cuenta').innerHTML = tarjetaVersion('Versión de tu cuenta', cta.fecha ? `Modificada el ${fmtFechaHora(cta.fecha)}` : 'Guardada en tu cuenta', cta);
    const dif = diferencias(loc, cta), ver = dif.slice(0, 6);
    $('#cn-dif').innerHTML = `<h3>Qué cambia</h3>${ver.length ? `<ul>${ver.map(t => `<li>${esc(t)}</li>`).join('')}${dif.length > 6 ? `<li>y ${dif.length - 6} diferencias más</li>` : ''}</ul>` : '<p class="mut">El contenido es el mismo; solo cambian las fechas.</p>'}`;
    d.returnValue = '';
    d.addEventListener('close', () => res(d.returnValue || 'despues'), { once: true });
    d.showModal(); $('#cn-titulo').focus();
  });
}
$('#cn-local-b').addEventListener('click', () => $('#dlg-conflicto').close('local'));
$('#cn-cuenta-b').addEventListener('click', () => $('#dlg-conflicto').close('cuenta'));
$('#cn-despues').addEventListener('click', () => $('#dlg-conflicto').close('despues'));

async function recuperarCambiosLocales() { // cambios locales pendientes de una sesión anterior en este dispositivo
  const key = 'klever_edit_' + current.id, raw = store.getItem(key); if (!raw) return;
  let e; try { e = JSON.parse(raw); } catch { store.removeItem(key); return; }
  if (!Array.isArray(e.pos) || (e.nombre === current.nombre && (e.tesis || '') === (current.tesis || '') && JSON.stringify(e.pos) === JSON.stringify(pos))) { store.removeItem(key); return; }
  if (e.base !== current.revision) { // la cartera cambió en la cuenta después de esa copia: nunca se elige en silencio
    const s1 = sesionSeq, id1 = current?.id; if (!current) return;
    const r = await dialogoConflicto({ nombre: e.nombre, tesis: e.tesis, pos: e.pos, fecha: e.t }, { nombre: current.nombre, tesis: current.tesis, pos: pos, fecha: current.fecha },
      'Tienes cambios locales de esta cartera sin guardar, y la versión de tu cuenta se modificó después. No se sobrescribirá nada hasta que lo decidas.');
    if (s1 !== sesionSeq || current?.id !== id1) return;               // la sesión o la cartera cambiaron mientras tanto
    if (r === 'cuenta') { store.removeItem(key); return; }
    if (r === 'despues') return; // se queda como está: la copia local sigue guardada y se volverá a preguntar
    store.setItem(key, JSON.stringify({ ...e, base: current.revision })); // elegida la local: parte de la revisión actual de la cuenta (la cuenta NO se modifica: hay que pulsar Guardar)
  }
  current.nombre = e.nombre; current.tesis = e.tesis || ''; pos = e.pos; rev = 1; savedRev = 0; copiaLocal = store.ok; recuperado = true;
}
// Con la red lenta la persona puede pulsar una plantilla ANTES de que lleguen los activos: `repartoPlantilla` devolvía [] y el borrador quedaba vacío (y se perdía al entrar).
// Se espera a los activos antes de armar el reparto.
let activosListos; const esperaActivos = new Promise(r => { activosListos = r; });
// Ronda 21: UN solo editor y cuatro orígenes. «plantilla» (heredado), «ejemplo» (copia EDITABLE y rotulada como ejemplo simulado), «vacia» (desde cero) y «manual» (la persona introduce su cartera).
// Para «vacia» y «manual» `plantilla` es solo un valor técnico heredado de la base de datos (no significa nada y no se muestra).
async function abrirInvitado(plantilla, origen = 'ejemplo') {
  await esperaActivos;
  current = { id: null, nombre: (origen === 'ejemplo' ? 'Ejemplo simulado: ' : 'Mi cartera de ') + nombrePlantilla(plantilla), plantilla, origen, tesis: '', publico: 0 };
  pos = repartoPlantilla(plantilla); posGuardada = []; rev = savedRev = 0; saving = false; saveErr = null; chartEls.clear(); $('#graficos').innerHTML = '';
  guardarBorrador(); go('#cartera');
}
async function abrirNueva(origen) {                          // «Crear desde cero» y «Recrear mi cartera»: el mismo editor, sin posiciones
  await esperaActivos;
  current = { id: null, nombre: origen === 'manual' ? 'Mi cartera (la que ya tengo)' : 'Mi cartera nueva', plantilla: 'dividendos', origen, tesis: '', publico: 0 };
  pos = []; posGuardada = []; rev = savedRev = 0; saving = false; saveErr = null; chartEls.clear(); $('#graficos').innerHTML = '';
  guardarBorrador(); go('#cartera');
}
function restaurarBorrador(d) {
  current = { id: null, nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla, origen: d.origen || 'plantilla', tesis: '', publico: 0 };
  pos = d.pos; posGuardada = []; rev = savedRev = 0; saving = false; saveErr = null; copiaLocal = store.ok;
}
async function migrarBorrador() { // al entrar, el borrador pasa a la cuenta SI es guardable; si no, se conserva tal cual
  const d = leerBorrador(); if (!d) return;
  if (!d.pos?.length) { store.removeItem(DRAFT); return; }
  const v = validar(d.pos);
  if (v.exceso || v.invalidos.length) {
    toastError('Tu borrador sigue en este dispositivo: corrige los pesos para guardarlo en tu cuenta.');
    location.hash = '#cartera'; return;
  }
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: d.nombre || 'Mi cartera de ' + nombrePlantilla(d.plantilla), plantilla: d.plantilla, origen: d.origen || 'plantilla', posiciones: d.pos } }); // una sola operación: todo o nada
    store.removeItem(DRAFT); // el borrador solo se borra cuando todo se ha guardado
    toast('Cartera guardada'); location.hash = '#cartera-' + id;
  } catch (err) {
    toastError('No se pudo guardar el borrador. Sigue en este dispositivo.');
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
function coberturaCorta(r) { // visible: cobertura y, si hay exclusiones, una línea breve (ausente ≠ cero)
  if (!r.n) return '';
  const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const l = [r.roic == null ? 'Ninguna posición tiene ROIC.' : `Con dato: ${r.nCon} de ${r.n} posiciones (${nf(r.cobPeso * 100, 0)}${NB}% del peso asignado).`];
  const fuera = [r.noDisp ? `${pl(r.noDisp, 'empresa sin dato (no cuenta como 0)', 'empresas sin dato (no cuentan como 0)')}` : '', r.noAplic ? `${pl(r.noAplic, 'fondo', 'fondos')} (no aplicable)` : ''].filter(Boolean);
  if (fuera.length) l.push('Fuera del cálculo: ' + fuera.join(' · ') + '.');
  return l.map(t => `<span class="linea">${t}</span>`).join('');
}
function lineasCobertura(r) { // desplegable: las exclusiones con su nombre completo
  if (!r.n) return '';
  const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const l = [];
  if (r.noDisp) l.push(`Dato ausente (no disponible): ${pl(r.noDisp, 'empresa', 'empresas')}.`);
  if (r.noAplic) l.push(`No aplicable: ${pl(r.noAplic, 'fondo', 'fondos')}; los ETF no tienen ROIC.`);
  return l.map(t => `<span class="linea">${t}</span>`).join('');
}

// ---------- espacio de trabajo ----------
function renderWorkspace() {
  if (!current) return;
  reiniciarPaso();
  const l = logged(), id = !!current.id;
  $$('.solo-cuenta').forEach(e => e.hidden = !(l && id));
  $('#mi-eliminar').hidden = !(l && id);
  $('#creador-titulo').textContent = id ? 'Tu portafolio' : 'Crea tu portafolio'; $('#creador-sub').textContent = id ? 'Ajusta, revisa y guarda.' : 'Elige cómo repartir tu dinero simulado.';
  $('#nombre').value = current.nombre; ajustarNombre(); $('#tesis').value = current.tesis || '';
  $('#pub-error').textContent = '';
  renderPosiciones(); renderResumen(); renderCharts(); pintarEstado();
  if (recuperado) { recuperado = false; toast('Hemos recuperado tus cambios locales'); }
}

const colores = new Map(); // ticker → índice de color (0-7). Estable mientras la posición exista: quitar o añadir otra no recolorea las demás
function asignarColores() {
  const vivos = new Set(pos.map(p => p.ticker));
  for (const t of [...colores.keys()]) if (!vivos.has(t)) colores.delete(t);
  const usados = new Set(colores.values());
  for (const p of pos) { if (colores.has(p.ticker)) continue; let k = 0; while (usados.has(k) && k < 8) k++; if (k >= 8) k = colores.size % 8; colores.set(p.ticker, k); usados.add(k); }
}
const colorDe = t => colores.get(t) ?? 0;
function filaTabla(p, i) {
  const a = by[p.ticker] || {};
  return `<tr><td><div class="id"><span class="punto" style="--c:var(--c${colorDe(p.ticker)})" aria-hidden="true"></span><span class="id-txt"><b>${esc(p.ticker)}</b><small>${esc(a.nombre || '')}</small><small class="det-pos">${esc(a.sector || '')} · ROIC: ${roicTxt(a)}</small></span></div></td>    <td class="num"><div class="peso-celda"><input class="peso-rng" style="--c:var(--c${colorDe(p.ticker)});--f:${Math.max(0, Math.min(1, (p.peso || 0) / 100))}" type="range" min="0" max="100" step="0.1" data-i="${i}" value="${p.peso > 0 ? p.peso : 0}" aria-label="Peso de ${esc(p.ticker)}: deslizador (también puedes escribir el valor)" aria-valuetext="${nf(p.peso)} %"><span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-invalid="${p.peso > 0 ? 'false' : 'true'}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span><span class="pbar" aria-hidden="true"><i style="--c:var(--c${colorDe(p.ticker)});width:${Math.max(0, Math.min(100, p.peso))}%"></i></span></div></td>
    <td><button class="btn btn-ghost quitar" type="button" data-quitar="${i}" aria-label="Quitar ${esc(p.ticker)}"><span aria-hidden="true">✕</span></button></td></tr>`;
}
function tarjetaPos(p, i) {
  const a = by[p.ticker] || {}, id = 'det-' + i;
  return `<li class="pos-card"><div class="pc-fila"><span class="punto" style="--c:var(--c${colorDe(p.ticker)})" aria-hidden="true"></span><div class="pc-id"><b>${esc(p.ticker)}</b><span>${esc(a.nombre || '')}</span></div>
    <span class="peso"><input class="peso-in" data-i="${i}" inputmode="decimal" autocomplete="off" value="${nf(p.peso)}" aria-invalid="${p.peso > 0 ? 'false' : 'true'}" aria-label="Peso de ${esc(p.ticker)}, en porcentaje"><span aria-hidden="true">%</span></span>
    <button class="btn btn-ghost pc-toggle" type="button" aria-expanded="false" aria-controls="${id}" aria-label="Detalles de ${esc(p.ticker)}"><span aria-hidden="true">⌄</span></button></div>
    <input class="peso-rng" style="--c:var(--c${colorDe(p.ticker)});--f:${Math.max(0, Math.min(1, (p.peso || 0) / 100))}" type="range" min="0" max="100" step="0.1" data-i="${i}" value="${p.peso > 0 ? p.peso : 0}" aria-label="Peso de ${esc(p.ticker)}: deslizador (también puedes escribir el valor)" aria-valuetext="${nf(p.peso)} %">
    <div class="pbar pbar-movil" aria-hidden="true"><i style="--c:var(--c${colorDe(p.ticker)});width:${Math.max(0, Math.min(100, p.peso))}%"></i></div>
    <div class="pc-det" id="${id}" hidden><dl>
      <div><dt>Nombre:</dt><dd>${esc(a.nombre || p.ticker)}</dd></div>
      <div><dt>Categoría:</dt><dd>${esc(a.sector || '—')}</dd></div>
      <div><dt><abbr title="Rentabilidad sobre el capital invertido">ROIC</abbr>:</dt><dd class="num">${roicTxt(a)}</dd></div></dl>
      <button class="btn btn-secundario peligro" type="button" data-quitar="${i}">Quitar</button></div></li>`;
}
function renderPosiciones() {
  asignarColores();
  $('#pos-tabla tbody').innerHTML = pos.map(filaTabla).join('');
  $('#pos-cards').innerHTML = pos.map(tarjetaPos).join('');
  $('.tabla-scroll').hidden = !pos.length; $('#pos-cards').hidden = !pos.length; $('#pos-vacio').hidden = pos.length > 0;
}
function pintarComposicion(r) { // datos reales de la cartera: el ancho de cada tramo es su peso; no se inventa nada
  asignarColores();
  const total = r.total, escala = Math.max(100, total), cab = $('#comp'), barra = $('#comp-barra');
  $('#comp-total').textContent = pesoCorto(total); $('#comp-n').textContent = r.n ? `${r.n} ${r.n === 1 ? 'posición' : 'posiciones'}` : '';
  const seg = pos.map((p, i) => ({ t: p.ticker, w: Math.max(0, p.peso || 0), i })).filter(x => x.w > 0);
  barra.innerHTML = seg.map(x => `<i style="--c:var(--c${colorDe(x.t)});width:${(x.w / escala * 100).toFixed(2)}%" aria-hidden="true">${x.w / escala >= .09 ? esc(x.t) : ''}</i>`).join('') + (total < 100 ? `<i class="libre" style="width:${((100 - total) / escala * 100).toFixed(2)}%" aria-hidden="true"></i>` : '');
  barra.classList.toggle('exceso', total > 100); barra.classList.toggle('vacia', !seg.length);
  barra.setAttribute('aria-label', 'Composición de la cartera: ' + (seg.length ? seg.map(x => `${x.t} ${pesoCorto(x.w)}`).join(', ') : 'sin posiciones') + (total < 100 && seg.length ? `; sin asignar ${pesoCorto(r1(100 - total))}` : '') + (total > 100 ? `; exceso de ${pesoCorto(r1(total - 100))}` : ''));
  $('#comp-pie').textContent = !r.n ? 'Añade posiciones para ver el reparto.' : total > 100 ? `⚠ Exceso de asignación: ${pesoCorto(r1(total - 100))}` : total < 100 ? `Pendiente de asignar: ${pesoCorto(r1(100 - total))}` : '';
  cab.classList.toggle('error', total > 100); cab.classList.toggle('aviso', total < 100 && r.n > 0);
  $$('.pbar i').forEach(el => { const i = +(el.closest('tr')?.querySelector('.peso-in') || el.closest('li')?.querySelector('.peso-in'))?.dataset.i; if (Number.isInteger(i)) el.style.width = Math.max(0, Math.min(100, pos[i]?.peso || 0)) + '%'; });
}
// ---------- «Tu portafolio»: anillo, leyenda con importes simulados y una hipótesis que se recalcula al editar ----------
const BASE_SIM = 10000;                                                   // importe SIMULADO de referencia (no es dinero real ni se guarda)
const eur = v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(Math.round(v)).replace(/\u00a0/g, ' ');
function pintarDonut(r) {
  asignarColores();
  const seg = pos.map(p => ({ t: p.ticker, w: Math.max(0, p.peso || 0) })).filter(x => x.w > 0), total = r.total, escala = Math.max(100, total);
  let acum = 0; const arcos = seg.map(x => { const l = x.w / escala * 100, a = `<circle class="donut-arco" cx="21" cy="21" r="15.9155" fill="none" stroke="var(--c${colorDe(x.t)})" stroke-width="3.2" stroke-dasharray="${l.toFixed(3)} ${(100 - l).toFixed(3)}" stroke-dashoffset="${(25 - acum).toFixed(3)}"/>`; acum += l; return a; }).join('');
  const libre = total < 100 && seg.length ? `<circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--border-strong)" stroke-width="3.2" stroke-dasharray="${((100 - total) / escala * 100).toFixed(3)} ${(100 - (100 - total) / escala * 100).toFixed(3)}" stroke-dashoffset="${(25 - acum).toFixed(3)}" opacity=".45"/>` : '';
  $('#donut').innerHTML = `<svg viewBox="0 0 42 42" aria-hidden="true" focusable="false"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--border)" stroke-width="3.2"/>${arcos}${libre}</svg><div class="donut-centro"><b class="num">${eur(BASE_SIM)}</b><span>simulados</span></div>`;
  $('#donut').setAttribute('aria-label', 'Reparto del portafolio sobre ' + eur(BASE_SIM) + ' simulados: ' + (seg.length ? seg.map(x => `${x.t} ${pesoCorto(x.w)} (${eur(BASE_SIM * x.w / 100)})`).join(', ') : 'sin posiciones'));
  $('#donut-leyenda').innerHTML = seg.length ? seg.map(x => `<li><i class="sw" style="--c:var(--c${colorDe(x.t)})" aria-hidden="true"></i><span class="lg-n">${esc(by[x.t]?.nombre || x.t)} <small>${esc(x.t)}</small></span><span class="num lg-p">${pesoCorto(x.w)}</span><span class="num lg-e">${eur(BASE_SIM * x.w / 100)}</span></li>`).join('') : '<li class="mut">Añade posiciones para ver el reparto.</li>';
  $('#donut-resumen').textContent = !r.n ? `${eur(BASE_SIM)} simulados` : `${pesoCorto(r.total)} asignado · ${eur(BASE_SIM)} simulados${r.exceso ? ` · sobran ${pesoCorto(r.exceso)}` : r.falta ? ` · faltan ${pesoCorto(r.falta)}` : ''}`;
  const est = $('#donut-estado'); est.className = 'donut-estado ' + (!r.n ? '' : r.exceso ? 'error' : r.falta ? 'aviso' : 'ok');
  est.textContent = !r.n ? '' : r.exceso ? `Sobran ${pesoCorto(r.exceso)}: reduce algún peso para llegar al 100 %.` : r.falta ? `Faltan ${pesoCorto(r.falta)} por asignar para llegar al 100 %.` : 'Reparto completo: 100 %.';
  // hipótesis: la posición elegida (por defecto, la mayor) cae un X %, las demás se quedan igual
  const sel = $('#hipo-pos'), previa = sel.value, orden = [...seg].sort((a, b) => b.w - a.w);
  sel.innerHTML = orden.map(x => `<option value="${esc(x.t)}">${esc(x.t)}</option>`).join(''); sel.value = orden.some(x => x.t === previa) ? previa : (orden[0]?.t || '');
  const pct = parsePeso($('#hipo-pct').value), h = $('#hipo-res'), x = orden.find(o => o.t === sel.value);
  $('#hipo').hidden = !orden.length;
  h.textContent = !x ? '' : !(pct >= 1 && pct <= 100) ? 'Escribe una caída entre 1 y 100 %.' : (() => { const imp = BASE_SIM * x.w / 100, perd = imp * pct / 100; return `Con ${eur(BASE_SIM)} simulados y ${eur(imp)} en ${x.t}, una caída hipotética del ${nf(pct, 0)} % en ${x.t}, con las demás posiciones constantes, supone ${eur(perd)} menos: el portafolio pasaría de ${eur(BASE_SIM)} a ${eur(BASE_SIM - perd)}. Es una hipótesis, no una previsión.`; })();
}
$('#hipo').addEventListener('input', () => { if (current) pintarDonut(calcResumen(pos)); });
// pasos del creador: «Distribución» (editar pesos) y «Revisión» (resultado, su motivo, el guardado) son DOS vistas del mismo portafolio: los pesos viven en `pos` y no se pierden al ir y volver.
let paso = 2;
function pasoActual(n, foco = false) {
  const cambia = n !== paso; paso = n; $('#vista-cartera').dataset.paso = String(n);
  $$('#pasos .paso').forEach(li => { if (+li.dataset.paso === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  if (cambia) { try { current && pintarEstado(); } catch { /* el estado se repinta en la siguiente edición */ } }
  // El desplazamiento es INSTANTÁNEO y se calcula tras dos fotogramas (cuando el paso ya está pintado): así el resultado queda siempre en la zona útil y las capturas no dependen de una animación.
  if (foco && cambia) requestAnimationFrame(() => requestAnimationFrame(() => {
    const d = n === 3 ? $('#nota-panel') : ($('#h-pos').offsetParent ? $('#h-pos') : $('#comp'));
    // móvil: la nota va arriba del viewport. Escritorio (ronda 20): se vuelve al INICIO de la página para conservar nombre, pasos, Volver y la acción de guardado; la nota está en la parte alta de su columna (orden por CSS).
    const escritorio = matchMedia('(min-width:900px)').matches;
    window.scrollTo({ top: n === 3 && !escritorio ? Math.max(0, d.getBoundingClientRect().top + scrollY - 8) : 0, behavior: 'auto' }); d.focus({ preventScroll: true });
  }));
}
function reiniciarPaso() { paso = 2; $('#vista-cartera').dataset.paso = '2'; $$('#pasos .paso').forEach(li => { if (+li.dataset.paso === 2) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); }); }
reiniciarPaso();
function revisarPortafolio() { pasoActual(3, true); }
$('#vista-cartera').addEventListener('click', e => { if (e.target.closest('.js-revisar')) revisarPortafolio(); else if (e.target.closest('#paso-volver, #paso-dist')) pasoActual(2, true); else if (e.target.closest('#paso-revisar')) revisarPortafolio(); });
document.addEventListener('click', e => { if (e.target.closest('.js-revisar') && !$('#vista-cartera').contains(e.target)) revisarPortafolio(); });   // la barra inferior queda fuera de la vista
// el anillo es un desplegable en móvil (resumen compacto siempre visible) y va abierto y fijo en escritorio
const ancho = matchMedia('(min-width:900px)'); const abrirAnillo = () => { if (ancho.matches) $('#panel-donut').open = true; };
ancho.addEventListener('change', abrirAnillo); abrirAnillo(); if (!ancho.matches) $('#panel-donut').open = false;
$('#panel-donut > summary').addEventListener('click', e => { if (ancho.matches) e.preventDefault(); });
function renderResumen() {
  pintarRadiografia(); pintarDonut(calcResumen(pos));
  const r = calcResumen(pos), clase = !r.n ? '' : r.exceso ? 'error' : r.falta ? 'aviso' : 'ok';
  pintarComposicion(r);
  const dif = !r.n ? 'Sin posiciones todavía' : r.exceso ? `⚠ Exceso de asignación: ${pesoCorto(r.exceso)}` : r.falta ? `Pendiente de asignar: ${pesoCorto(r.falta)}` : '';
  $('#r-total').textContent = pesoCorto(r.total);
  const f = $('#r-falta'); f.textContent = dif; f.hidden = !dif; f.className = 'asig-estado ' + clase;
  const barra = $('#r-barra').parentElement; barra.setAttribute('aria-valuenow', Math.min(100, Math.round(r.total)));
  barra.classList.toggle('error', !!r.exceso); $('#r-barra').style.width = Math.min(100, r.total) + '%';
  $('#r-n').textContent = r.n;
  $('#r-roic').textContent = r.roic != null ? pct(r.roic) : '—';
  $('#r-cob-corta').innerHTML = coberturaCorta(r); $('#r-cob-larga').innerHTML = lineasCobertura(r);
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
  if (dirty) return ['Cambios locales pendientes de guardar en tu cuenta' + (copiaLocal ? '' : '. Si cierras la pestaña se perderán'), 'Cambios locales pendientes', 'aviso'];
  return ['Guardada en tu cuenta', '✓ Guardada', 'ok'];
}
function mensajeCorto(v) { // la frase principal del bloqueo, sin explicaciones
  if (v.invalidos.length) return `Revisa el peso de ${listaTickers(v.invalidos)}`;
  if (v.exceso) return `Sobra un ${pesoCorto(v.exceso)} de asignación`;
  if (current?.publico && !v.completa) return `Falta asignar un ${pesoCorto(v.falta)} para actualizar la publicación`;
  return '';
}
function pintarMotivo(v, razon) { // jerarquía: título · estado · acción; el motivo largo queda en un desplegable que no se cierra al teclear
  const m = $('#motivo'), principal = saveErr ? saveErr : (razon ? mensajeCorto(v) || razon : '');
  m.hidden = !principal; m.classList.toggle('error', !!saveErr);
  $('#mv-main').textContent = principal;
  $('#mv-sub').hidden = !(razon && !saveErr && current?.publico);
  const hayDetalle = !!razon && !saveErr && razon !== principal;
  $('#mv-det').hidden = !hayDetalle; $('#mv-txt').textContent = hayDetalle ? razon : '';
}
const AVISO_ORIGEN = {
  ejemplo: 'Esto es un <b>ejemplo simulado</b>: una copia editable para ver qué muestra Klever. No es una cartera óptima ni recomendada y los datos son de prueba. Cámbiala como quieras: no afecta a ninguna cartera tuya.',
  manual: 'Estás <b>recreando tu cartera a mano</b>: es la representación que tú introduces. Klever no se conecta a ningún banco ni bróker, no custodia nada y no envía órdenes. Solo se pueden usar los activos del universo disponible; si el tuyo no está, te lo diremos y no lo sustituiremos por otro.',
  vacia: 'Cartera <b>vacía</b>: añade tu primer activo, reparte hasta el 100 % y pulsa «Revisar». Es una simulación, sin dinero real.',
};
function pintarOrigen() {
  const o = current?.origen || 'plantilla', a = $('#origen-aviso'); if (!a) return;
  a.hidden = !AVISO_ORIGEN[o] || (o === 'vacia' && pos.length > 0); if (!a.hidden) a.innerHTML = AVISO_ORIGEN[o];
  $('#mi-plantilla').hidden = o === 'vacia' || o === 'manual';       // «Reemplazar por la plantilla» solo tiene sentido en las que nacieron de una
}
function pintarEstado() {
  if (!current) return;
  pintarOrigen();
  const v = validar(), dirty = rev !== savedRev, id = enCuenta(), razon = razonGuardar(v);
  const [largo, breve, cls] = textoPersistencia(id, dirty);
  const est = $('#estado'); est.textContent = largo; est.className = 'estado-btn ' + cls;           // persistencia, siempre explícita
  const brevePeso = v.invalidos.length ? 'Revisa los pesos' : v.exceso ? `Exceso: ${pesoCorto(v.exceso)}` : 'Pública: debe sumar 100 %';
  const be = $('#b-estado'), bloqueo = razon && !saveErr;                                             // barra: el motivo del bloqueo, si lo hay
  be.textContent = bloqueo ? '⚠ ' + brevePeso : breve; be.className = 'bg-estado estado-btn ' + (bloqueo ? 'aviso' : cls);
  pintarMotivo(v, razon);                                                                            // motivo al lado de Guardar: mensaje corto + detalle plegado
  $('#estado-live').textContent = largo + (razon ? '. ' + razon : '');
  const c = $('#chip'); c.textContent = current.publico ? 'Pública' : 'Privada'; c.classList.toggle('pub', !!current.publico); // privacidad
  const etq = saveErr && !saving ? 'Reintentar guardado' : current.publico && id ? 'Guardar y actualizar publicación' : 'Guardar cartera';
  $$('.js-guardar').forEach(b => { b.disabled = !!razon || saving || (id && !dirty); b.textContent = etq; b.classList.toggle('dos-lineas', etq.length > 20); b.setAttribute('aria-describedby', 'motivo estado'); });
  // UNA acción principal según el estado. Distribución: «Guardar» con cambios pendientes en un portafolio de la cuenta; si no, «Revisar portafolio».
  // Revisión: «Guardar» si hay algo que guardar (y «Revisar» se oculta); si no, no hay principal.
  const guardaActivo = !($('.js-guardar').disabled), principalGuardar = paso === 3 ? guardaActivo : (!!id && !!dirty && !razon && !saving);
  $$('.js-guardar').forEach(b => { b.classList.toggle('btn-primario', principalGuardar); b.classList.toggle('btn-secundario', !principalGuardar); });
  $$('.js-revisar').forEach(b => { b.hidden = paso === 3; b.classList.toggle('btn-primario', !principalGuardar); b.classList.toggle('btn-secundario', principalGuardar); });
  $('#pub-pend').hidden = !(current.publico && id && dirty);                                          // lo publicado sigue intacto hasta guardar
  $('#mi-descartar').hidden = !(id && dirty);
  pintarPublicacion(v); pintarRadiografia();
  window.onbeforeunload = id && dirty ? e => { e.preventDefault(); e.returnValue = ''; } : null; // no perder cambios por error
}
function pintarPublicacion(v = validar()) {
  const pub = !!current?.publico, r = razonPublicar(v);
  $('#pub-chip').textContent = pub ? 'Pública' : 'Privada'; $('#pub-chip').classList.toggle('pub', pub);
  $('#publicar').textContent = pub ? 'Dejar de publicar' : 'Publicar cartera';
  $('#publicar').disabled = !pub && !!r;                      // no disponible: se ve igual que Guardar desactivado, con su motivo al lado
  $('#tesis-guardar').hidden = !pub; $('#tesis-guardar').disabled = pub && !!r;
  const z = $('#pub-razon');
  const pend = pub && enCuenta() && rev !== savedRev ? 'Tus cambios aún no son públicos. La versión publicada no cambia hasta que guardes. ' : '';
  z.textContent = pub ? pend + (r ? `Mientras sea pública debe cumplir: ${r}` : 'Esta cartera es pública: se muestra su composición y tu tesis.') : (r ? `No disponible: ${r}` : 'Lista para publicar.');
  z.className = 'peq pub-razon' + (r ? ' aviso' : '');
}
function marcarCambio() { rev++; saveErr = null; hideToast(); guardarBorrador(); pintarEstado(); }

// La copia local de una cartera ya guardada: se borra si coincide con lo guardado; si hay ediciones posteriores, se conservan y solo cambia su revisión base.
function liberarCopia(id, snap, revision) {
  const key = 'klever_edit_' + id, c = leerCopia(id); if (!c) return;
  if (c.nombre === snap.nombre && (c.tesis || '') === snap.tesis && JSON.stringify(c.pos) === snap.pos) store.removeItem(key);
  else store.setItem(key, JSON.stringify({ ...c, base: revision }));
}
async function guardar() {
  if (!current) return false;
  const razon = razonGuardar(validar());
  if (razon) { saveErr = null; pintarEstado(); return false; }   // la misma regla que bloquea el botón; no se envía nada
  if (!logged()) { guardarBorrador(); abrirAcceso('guardar'); return false; }
  if (saving) return false;
  const nombre = $('#nombre').value.trim();
  if (!nombre) { saveErr = 'Escribe un nombre para la cartera.'; pintarEstado(); return false; }
  // La respuesta puede llegar cuando ya se ha abierto OTRA cartera: todo lo que sigue usa `cur` (la que inició el guardado), nunca `current`.
  const cur = current, r = rev, snap = { nombre, tesis: $('#tesis').value.trim(), pos: JSON.stringify(pos) };
  saving = true; saveErr = null; pintarEstado();
  let conflicto = false, u = null, fallo = null;
  try {
    // UNA sola operación en el servidor (posiciones + nombre + tesis, con la revisión desde la que se edita): todo o nada
    u = cur.id
      ? await api('/portfolios/' + cur.id, { method: 'PUT', body: { posiciones: pos, nombre, tesis: $('#tesis').value, revision: cur.revision } })
      : await api('/portfolios', { method: 'POST', body: { nombre, plantilla: cur.plantilla, origen: cur.origen || 'plantilla', tesis: $('#tesis').value, posiciones: pos } });
  } catch (err) { if (err.status === 409 && err.data?.conflicto) conflicto = true; else fallo = err.message; } // un fallo nunca muestra «guardada»; los cambios siguen en local
  const vigente = current === cur;           // ¿sigue abierta la misma cartera?
  if (vigente) saving = false;
  if (u) {
    const eraNueva = !cur.id; if (eraNueva) cur.id = u.id;
    cur.nombre = nombre; cur.tesis = snap.tesis; cur.revision = u.revision; cur.fecha = u.actualizado_en || cur.fecha;
    if (vigente) {
      savedRev = r; posGuardada = JSON.parse(snap.pos);                                               // si se editó durante el guardado, rev > r y sigue «con cambios»
      store.removeItem(DRAFT); guardarBorrador();                                                     // limpia la copia local si ya no hay cambios pendientes
      try { if (location.hash !== '#cartera-' + cur.id) history.replaceState(null, '', '#cartera-' + cur.id); } catch {}
      $$('.solo-cuenta').forEach(e => e.hidden = false); $('#mi-eliminar').hidden = false;
    } else if (!eraNueva) liberarCopia(cur.id, snap, u.revision);                                     // otra cartera abierta: ni su editor ni su copia local se tocan
    toast(vigente ? (cur.publico ? 'Cartera guardada y publicación actualizada' : 'Cartera guardada') : `«${nombre}» guardada`);
  } else if (!vigente) {
    toastError(conflicto ? `«${nombre}» cambió en tu cuenta: ábrela para elegir qué versión conservar.` : `No se pudo guardar «${nombre}». Sus cambios siguen en este dispositivo.`);
    return false;
  }
  if (fallo) saveErr = fallo;
  if (vigente) pintarEstado();
  if (conflicto) return resolverConflictoGuardado();
  return !!u;
}
async function resolverConflictoGuardado() { // el servidor dice que la cuenta cambió después de la versión desde la que se editaba
  const cur = current; let c; try { c = await api('/portfolios/' + current.id); } catch (err) { saveErr = err.message; pintarEstado(); return false; }
  if (current !== cur) return false;
  const cta = { nombre: c.nombre, tesis: c.tesis || '', pos: sinDup(c.posiciones), fecha: c.actualizado_en || c.creado_en || '', publico: c.publico, revision: c.revision };
  const loc = { nombre: $('#nombre').value.trim(), tesis: $('#tesis').value, pos: sinDup(pos), fecha: leerCopia(current.id)?.t };
  const r = await dialogoConflicto(loc, cta, 'Tu cuenta tiene una versión más reciente de esta cartera que la desde la que estabas editando. No se ha guardado nada. Elige cuál conservar.');
  const guardarBtn = [...$$('.js-guardar')].find(x => x.offsetParent); setTimeout(() => guardarBtn?.focus({ preventScroll: true }), 0); // el foco vuelve al botón Guardar (se había desactivado durante el guardado)
  if (r === 'local') { // vuelve al editor SIN escribir en la cuenta: parte de la revisión actual y el usuario revisa y pulsa Guardar
    current.revision = cta.revision; current.fecha = cta.fecha; current.publico = cta.publico; saveErr = null; guardarBorrador(true); pintarEstado();
    toast('Has conservado la versión de este dispositivo. Revísala y pulsa Guardar.', 6000); return false;
  }
  if (r === 'cuenta') {
    store.removeItem('klever_edit_' + current.id);
    current = { ...current, nombre: cta.nombre, tesis: cta.tesis, publico: cta.publico, revision: cta.revision, fecha: cta.fecha };
    pos = cta.pos; posGuardada = cta.pos.map(p => ({ ...p })); rev = savedRev = 0; saveErr = null; copiaLocal = false; renderWorkspace(); toast('Has vuelto a la versión de tu cuenta'); return false;
  }
  saveErr = 'La cartera cambió en tu cuenta. Elige qué versión conservar para poder guardar.'; pintarEstado(); return false;
}
$$('.js-guardar').forEach(b => b.addEventListener('click', guardar));

async function cambiarPublicacion(publico) {
  const err = $('#pub-error'); err.textContent = '';
  const cur = current;                       // la respuesta puede llegar con otra cartera abierta: se usa `cur`, nunca `current`
  if (publico) { // mismas reglas que el servidor; sin petición si no son válidas
    const r = razonPublicar(validar()); if (r) { err.textContent = r; return; }
    if (rev !== savedRev && !(await guardar())) { if (current === cur) err.textContent = 'No se ha publicado: no se pudieron guardar los cambios' + (saveErr ? ' (' + saveErr + ')' : '') + '.'; return; }
    if (current !== cur) return;
  }
  if (publico && cur.publico) return; // ya es pública: «Actualizar tesis» = guardar (arriba), sin otra escritura
  try {
    const u = await api('/portfolios/' + cur.id, { method: 'PATCH', body: { publico: !!publico, revision: cur.revision } });
    cur.publico = publico ? 1 : 0; cur.revision = u.revision; cur.fecha = u.actualizado_en || cur.fecha;
    const c = leerCopia(cur.id); if (c && current !== cur) store.setItem('klever_edit_' + cur.id, JSON.stringify({ ...c, base: u.revision }));
    if (current === cur) { guardarBorrador(true); pintarEstado(); }
    loadPublicas();
    toast(current === cur ? (publico ? 'Cartera publicada' : 'La cartera vuelve a ser privada') : (publico ? `«${cur.nombre}» publicada` : `«${cur.nombre}» vuelve a ser privada`));
  } catch (e) {
    if (current !== cur) { toastError(`No se pudo cambiar la publicación de «${cur.nombre}».`); return; }
    if (e.status === 409 && e.data?.conflicto) { // la cuenta cambió desde otro sitio: se recarga y, si hay cambios locales, se pregunta cuál conservar
      await cargarCartera(cur.id); renderWorkspace(); err.textContent = 'La cartera había cambiado en tu cuenta. No se ha modificado la publicación.';
    } else err.textContent = e.message;
  }
}
$('#publicar').addEventListener('click', () => cambiarPublicacion(!current.publico));
$('#tesis-guardar').addEventListener('click', () => cambiarPublicacion(true));
function ajustarNombre() { // el título puede ocupar hasta dos líneas (móvil); no admite saltos de línea
  const n = $('#nombre'); n.style.height = 'auto'; n.style.height = (n.scrollHeight + n.offsetHeight - n.clientHeight) + 'px';
}
$('#nombre').addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
$('#nombre').addEventListener('input', e => { const n = e.target; if (/\n/.test(n.value)) n.value = n.value.replace(/\s*\n\s*/g, ' '); ajustarNombre(); marcarCambio(); });
window.addEventListener('resize', ajustarNombre);
$('#tesis').addEventListener('input', marcarCambio);

// Detalle ampliado (lo esencial ya está en el texto visible de estado)
function abrirInfoEstado() {
  if (!current) return;
  const id = enCuenta(), dirty = rev !== savedRev, pub = !!current.publico, v = validar(), r = calcResumen(pos);
  const reparto = !r.n ? 'Sin posiciones todavía.' : v.exceso ? `Exceso de asignación: ${pesoCorto(v.exceso)}. No se puede guardar en la cuenta ni publicar hasta corregirlo.` : v.falta ? `Pendiente de asignar: ${pesoCorto(v.falta)}. Se puede guardar en privado como reparto incompleto; no se puede publicar.` : 'Asignado: 100 %. Es un reparto completo.';
  $('#es-cuerpo').innerHTML = `
    <div><dt>Persistencia</dt><dd>${id ? (dirty ? 'Tienes cambios locales pendientes de guardar en tu cuenta.' + (copiaLocal ? ' Se conservan en este dispositivo.' : '') : 'Guardada en tu cuenta. Todo lo que ves está guardado.') : 'Solo en este dispositivo, como borrador en este navegador. No está en tu cuenta ni se sincroniza con otros dispositivos, y se perdería si borras los datos del navegador.'}</dd></div>
    <div><dt>Validez del reparto</dt><dd>${reparto}</dd></div>
    <div><dt>Privacidad</dt><dd>${pub ? 'Pública: se muestra su composición y tu tesis en «Carteras públicas». La versión publicada solo cambia cuando guardas un reparto válido.' : 'Privada: solo la ves tú.'}</dd></div>`;
  $('#es-acciones').innerHTML = id ? '' : '<button class="btn btn-primario" type="button" id="es-guardar">Guardar en mi cuenta</button>';
  const g = $('#es-guardar'); if (g) g.addEventListener('click', () => { $('#dlg-estado').close(); guardar(); });
  $('#dlg-estado').showModal();
}
$('#estado').addEventListener('click', abrirInfoEstado);
$('#b-estado').addEventListener('click', abrirInfoEstado);

// ---------- barra inferior: espacio reservado y teclado virtual ----------
const barra = $('#barra-guardar');
function medirBarra() { document.documentElement.style.setProperty('--barra-alto', (barra.hidden || document.body.classList.contains('teclado')) ? '0px' : barra.offsetHeight + 'px'); }
if ('ResizeObserver' in window) new ResizeObserver(medirBarra).observe(barra);
if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { // teclado abierto: la barra se oculta para no tapar el campo
  document.body.classList.toggle('teclado', window.visualViewport.height < window.innerHeight * 0.75); medirBarra();
});
document.addEventListener('focusin', e => { // el campo activo queda a la vista: centrado entre la zona de avisos (arriba) y la barra inferior (abajo), nunca tapado
  if (!e.target.classList?.contains('peso-in')) return;
  const el = e.target; setTimeout(() => {
    // ronda 20: si en esos 300 ms el campo ya perdió el foco o se ocultó (p. ej. se pulsó «Revisar» y cambió el paso), NO se desplaza: arrastraba la página tras el cambio de paso (fallo intermitente real de Q3-1440)
    if (document.activeElement !== el || el.offsetParent === null) return;
    const r = el.getBoundingClientRect(), a = $('#avisos').getBoundingClientRect(), bar = $('#barra-guardar'), visibleBarra = !bar.hidden && getComputedStyle(bar).display !== 'none';
    const arriba = Math.max(a.bottom, 0), abajo = visibleBarra ? bar.getBoundingClientRect().top : innerHeight;
    window.scrollBy({ top: r.top + r.height / 2 - (arriba + abajo) / 2, behavior: 'auto' });
  }, 300);
});

// ---------- pesos editables ----------
function editarPeso(el, fin) {
  const i = +el.dataset.i, v = parsePeso(el.value), ok = v > 0 && v <= 100;
  pos[i].peso = ok ? r1(v) : 0;
  if (fin && ok) el.value = nf(pos[i].peso);
  for (const o of $$(`.peso-in[data-i="${i}"]`)) { o.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (o !== el) o.value = el.value; }
  for (const g of $$(`.peso-rng[data-i="${i}"]`)) { if (g !== el) g.value = ok ? pos[i].peso : 0; g.setAttribute('aria-valuetext', `${nf(pos[i].peso)} %`); g.style.setProperty('--f', Math.max(0, Math.min(1, (pos[i].peso || 0) / 100))); }
  marcarCambio(); renderResumen(); if (!fin) pasoActual(2);   // solo al teclear (no en el «change» que provoca el cambio de foco al pasar a la revisión)
}
// El deslizador es una ENTRADA MÁS: escribe en el campo numérico y sigue exactamente el mismo camino de validación (también se puede ajustar sin arrastrar).
$('#vista-cartera').addEventListener('input', e => { if (!e.target.classList.contains('peso-rng')) return; const i = +e.target.dataset.i, v = Math.round(+e.target.value * 10) / 10;
  e.target.style.setProperty('--f', Math.max(0, Math.min(1, v / 100))); const num = [...$$(`.peso-in[data-i="${i}"]`)][0]; if (!num) return; for (const o of $$(`.peso-in[data-i="${i}"]`)) o.value = nf(v); editarPeso(num, false); });
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
  }).join('') : `<li class="sin" role="option" aria-disabled="true">Ningún activo coincide con «${esc(q)}». Si no está en el universo disponible, no lo sustituimos por otro.</li>`;
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
  try { await api('/portfolios/' + current.id, { method: 'DELETE' }); } catch (err) { return toastError(err.message); }
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
  deuda_ebitda: ['Deuda sobre EBITDA', 'Se supera si la deuda neta es menor de 2,5 veces el EBITDA', v => [nf(v, Math.abs(v) < 0.1 && v !== 0 ? 2 : 1), 'veces']],
  roic: ['ROIC', 'Se supera si es mayor del 10 %', v => [pct(v), '']],
  margen_neto: ['Margen neto', 'Se supera si el beneficio neto supera el 10 % de las ventas', v => [pct(v), '']],
  flujo_caja: ['Caja libre', 'Se supera si el flujo de caja libre es positivo', v => [nf(v / 1e9), 'miles de millones de USD']],
  crecimiento: ['Crecimiento de ventas', 'Se supera si las ventas suben respecto al año anterior', v => [pct(v), '']],
};
let empresas = [];
const marcaRadar = t => enRadar(t) ? ' <span class="chip radar">★ En tu radar</span>' : '';
const ABR = { deuda_ebitda: 'Deuda', roic: 'ROIC', margen_neto: 'Margen', flujo_caja: 'Caja libre', crecimiento: 'Crecimiento' };
const pildoras = r => `<ul class="pil" aria-label="Comprobaciones de ${esc(r.nombre)}">${Object.keys(ABR).map(k => { const x = r.criterios?.[k]; // el estado va escrito, no solo en color
  const e = x?.ok === true ? ['ok', '✓', 'superada'] : x?.ok === false ? ['no', '✗', 'no superada'] : ['nd', '–', 'sin datos'];
  return `<li class="pil-${e[0]}"><span aria-hidden="true">${e[1]}</span> ${ABR[k]}<span class="sr">: ${e[2]}</span></li>`; }).join('')}</ul>`;
const BUSQ = 'klever_busqueda_emp'; // la búsqueda sobrevive a abrir la ficha, cambiar de pantalla y recargar (solo en esta pestaña)
const busqLeer = () => { try { return sessionStorage.getItem(BUSQ) || ''; } catch { return ''; } };
const busqGuardar = v => { try { v ? sessionStorage.setItem(BUSQ, v) : sessionStorage.removeItem(BUSQ); } catch { /* sin almacenamiento: la búsqueda sigue en el campo */ } };
const FILT = 'klever_filtros_emp'; // filtros de Explorar: se conservan como la búsqueda (solo esta pestaña)
const filtrosLeer = () => { try { return { sector: '', crit: '', estado: '', radar: false, ...JSON.parse(sessionStorage.getItem(FILT)) }; } catch { return { sector: '', crit: '', estado: '', radar: false }; } };
const filtrosGuardar = f => { try { (f.sector || f.crit || f.estado || f.radar) ? sessionStorage.setItem(FILT, JSON.stringify(f)) : sessionStorage.removeItem(FILT); } catch { /* sin almacenamiento */ } };
const filtrosActuales = () => ({ sector: $('#emp-sector').value, crit: $('#emp-crit').value, estado: $('#emp-estado').value, radar: $('#emp-radar').checked });
const pasaFiltros = (r, f) => {
  if (f.sector && r.sector !== f.sector) return false;
  if (f.radar && !enRadar(r.ticker)) return false;
  if (f.estado) { // «Superada / No superada / Sin datos» de UNA comprobación (o de alguna de las cinco); no se calcula ninguna puntuación
    const claves = f.crit ? [f.crit] : Object.keys(ABR), est = k => r.criterios?.[k]?.ok === true ? 'ok' : r.criterios?.[k]?.ok === false ? 'no' : 'nd';
    if (!claves.some(k => est(k) === f.estado)) return false;
  }
  return true;
};
function poblarSectores() {
  const sel = $('#emp-sector'), f = filtrosLeer(), sectores = [...new Set(empresas.map(r => r.sector))].sort((p, q) => p.localeCompare(q, 'es'));
  sel.innerHTML = '<option value="">Todos</option>' + sectores.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  sel.value = sectores.includes(f.sector) ? f.sector : ''; $('#emp-crit').value = f.crit; $('#emp-estado').value = f.estado; $('#emp-radar').checked = !!f.radar;
}
function renderEmpresas() {
  const bruto = $('#emp-buscar').value.trim(), q = norm(bruto), tb = $('#empresas-lista'), ul = $('#empresas-cards'), filt = filtrosActuales(), hayFiltro = !!(filt.sector || filt.estado || filt.radar);
  const vistas = empresas.filter(r => (!q || norm(r.ticker + ' ' + r.nombre + ' ' + r.sector).includes(q)) && pasaFiltros(r, filt));
  const resultado = r => { const nd = r.sin_datos ?? 5 - r.evaluados; // sin datos NO es una comprobación fallida ni una evaluación completa: se muestra como parcial
    return nd ? `<span class="marca-n">${r.cumplidos} superadas</span><small class="sin-d">${nd} sin datos</small>` : `<span class="marca-n">${r.cumplidos} de 5 superadas</span>`; };
  const vacio = empresas.length ? `Ninguna empresa coincide con ${bruto ? `«${esc(bruto)}»${hayFiltro ? ' y los filtros elegidos' : ''}` : 'los filtros elegidos'}. <button class="enlace" type="button" data-borrar-busqueda>${hayFiltro ? 'Borrar búsqueda y filtros' : 'Borrar búsqueda'}</button>` : 'Aún no hay datos de empresas cargados.';
  tb.innerHTML = vistas.length ? vistas.map(r => `<tr><td><span class="nombre-emp">${esc(r.nombre)}</span> <span class="simbolo">${esc(r.ticker)}</span>${marcaRadar(r.ticker)}</td><td>${esc(r.sector)}</td>
      <td class="num">${resultado(r)}${pildoras(r)}</td>
      <td><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button></td></tr>`).join('')
    : `<tr><td colspan="4" class="estado-lista">${vacio}</td></tr>`;
  ul.innerHTML = vistas.length ? vistas.map(r => `<li class="emp-card">
      <div class="ec-l1"><span class="nombre-emp">${esc(r.nombre)}${marcaRadar(r.ticker)}</span><span class="ec-res">${resultado(r)}</span></div>
      <div class="ec-l2"><span class="simbolo">${esc(r.ticker)}</span><span class="ec-sector">${esc(r.sector)}</span><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button></div>${pildoras(r)}</li>`).join('')
    : `<li class="estado-lista">${vacio}</li>`;
  $('#emp-cuenta').textContent = empresas.length ? (q || hayFiltro ? `${vistas.length} de ${empresas.length} empresas` : `${empresas.length} empresas`) : '';
  const nf = [filt.sector, filt.estado, filt.radar].filter(Boolean).length; $('#emp-filtros-n').textContent = nf ? `(${nf} activo${nf > 1 ? 's' : ''})` : ''; if (nf) $('#emp-filtros-det').open = true;
  $('#emp-borrar').hidden = !bruto && !hayFiltro; $('#emp-borrar').textContent = hayFiltro ? 'Borrar búsqueda y filtros' : 'Borrar búsqueda';
}
async function loadEmpresas() {
  $('#empresas-lista').innerHTML = '<tr><td colspan="4" class="estado-lista">Cargando empresas…</td></tr>';
  $('#empresas-cards').innerHTML = '<li class="estado-lista">Cargando empresas…</li>';
  try { empresas = await getJson('/ideas'); }
  catch { const m = 'No se pudieron cargar las empresas. <button class="enlace" data-retry="empresas" type="button">Reintentar</button>'; $('#empresas-lista').innerHTML = `<tr><td colspan="4" class="estado-lista">${m}</td></tr>`; $('#empresas-cards').innerHTML = `<li class="estado-lista">${m}</li>`; return; }
  poblarSectores(); renderEmpresas();
}
$('#emp-buscar').addEventListener('input', () => { busqGuardar($('#emp-buscar').value.trim()); renderEmpresas(); });
const borrarBusqueda = () => { $('#emp-buscar').value = ''; busqGuardar(''); $('#emp-sector').value = ''; $('#emp-crit').value = ''; $('#emp-estado').value = ''; $('#emp-radar').checked = false; filtrosGuardar(filtrosActuales()); renderEmpresas(); $('#emp-buscar').focus(); };
$('#emp-borrar').addEventListener('click', borrarBusqueda);
for (const id of ['#emp-sector', '#emp-crit', '#emp-estado', '#emp-radar']) $(id).addEventListener('change', () => { filtrosGuardar(filtrosActuales()); renderEmpresas(); });
$('#empresas-lista').addEventListener('click', e => { if (e.target.closest('[data-borrar-busqueda]')) borrarBusqueda(); });
$('#empresas-cards').addEventListener('click', e => { if (e.target.closest('[data-borrar-busqueda]')) borrarBusqueda(); });
$('#emp-buscar').value = busqLeer();
for (const lista of [$('#empresas-lista'), $('#empresas-cards')]) lista.addEventListener('click', e => { const b = e.target.closest('[data-t]') || e.target.closest('tr,li')?.querySelector('[data-t]'); if (b) verFicha(b.dataset.t); });
$('#ir-screener').addEventListener('click', () => { const s = $('#filtros-precio'); s.scrollIntoView({ behavior: 'auto' }); s.focus({ preventScroll: true }); }); // salto largo: sin animación

async function verFicha(t) {
  let a; try { a = await getJson('/assets/' + t); } catch { return toastError('No se pudo cargar la ficha'); }
  const c = a.criterios, periodo = c?.periodo || a.fundamentales[0]?.periodo || '';
  const fila = ([label, regla, f], x, res) => `<li><div class="ck-crit"><b>${label}</b><small>${regla}</small></div><div class="ck-res"><span class="res ${res[0]}">${res[1]}</span>${x?.valor != null ? (([c, u]) => `<span class="ck-val"><b class="v">${c}</b>${u ? `<span class="u">${u}</span>` : ''}</span>`)(f(x.valor)) : '<span class="ck-val"><span class="u">Dato no disponible</span></span>'}</div></li>`;
  const grupos = { ok: [], no: [], nd: [] };
  for (const [k, def] of Object.entries(CRIT)) { const x = c?.[k]; grupos[x?.ok === true ? 'ok' : x?.ok === false ? 'no' : 'nd'].push(fila(def, x, x?.ok === true ? ['ok', '✓ Superada'] : x?.ok === false ? ['no', '✗ No superada'] : ['nd', '– Sin datos'])); }
  const ok = grupos.ok.length, no = grupos.no.length, nd = grupos.nd.length;
  const seccion = (t, n, l) => n ? `<h3 class="grp">${t} (${n})</h3><ul class="checks">${l.join('')}</ul>` : '';
  const resumenF = [`${ok} ${ok === 1 ? 'superada' : 'superadas'}`, `${no} ${no === 1 ? 'no superada' : 'no superadas'}`, `${nd} sin datos`].filter((_, i) => [ok, no, nd][i] || i === 0).join(' · ');
  const hist = a.fundamentales.map(x => `<tr><th scope="row">${esc(x.periodo)}</th><td>${miles(x.ingresos)}</td><td>${miles(x.beneficio_neto)}</td><td>${miles(x.ebitda)}</td><td>${miles(x.flujo_caja_libre)}</td><td>${pct(x.roic)}</td></tr>`).join('');
  $('#fi-titulo').textContent = `${a.nombre} (${a.ticker})`;
  $('#fi-sub').textContent = `${a.sector}${periodo ? ' · Datos del ejercicio ' + periodo : ''}`;
  const f0 = a.fundamentales[0], U = 'miles de millones de USD';
  const dato = (l, v, u) => v == null ? `<div class="ausente"><dt>${l}</dt><dd><span class="v">No disponible</span><span class="u">dato ausente en el informe</span></dd></div>` : `<div><dt>${l}</dt><dd><span class="v num">${v}</span><span class="u">${u}</span></dd></div>`;
  const principal = f0 ? `<section class="ficha-datos" aria-labelledby="fd-t"><h3 id="fd-t">Datos principales · ejercicio ${esc(f0.periodo)}</h3><dl class="fd-grid">${dato('Ventas', f0.ingresos == null ? null : miles(f0.ingresos), U)}${dato('Beneficio neto', f0.beneficio_neto == null ? null : miles(f0.beneficio_neto), U)}${dato('EBITDA', f0.ebitda == null ? null : miles(f0.ebitda), U)}${dato('Caja libre', f0.flujo_caja_libre == null ? null : miles(f0.flujo_caja_libre), U)}${dato('ROIC', f0.roic == null ? null : pct(f0.roic), 'del capital invertido (cálculo aproximado)')}</dl></section>` : '<p class="mut peq">No hay cifras anuales disponibles para esta empresa.</p>';
  $('#fi-cuerpo').innerHTML = `<div id="fi-radar" class="fi-radar"></div>${principal}<p class="resumen-ficha">${nd ? 'Evaluación parcial: ' : ''}${resumenF}</p>
    ${seccion('Superadas', ok, grupos.ok)}${seccion('No superadas', no, grupos.no)}${seccion('Sin datos', nd, grupos.nd)}
    ${nd ? '<p class="mut peq">Una comprobación sin datos no suma ni resta: no cuenta como no superada.</p>' : ''}
    <h3>Cifras de los últimos años</h3>
    <p class="mut peq unidades">Importes en miles de millones de USD; ROIC en %</p>
    <p class="hint-scroll">Desliza la tabla hacia los lados para ver todas las columnas →</p>
    <div class="tabla-h" role="region" aria-label="Cifras históricas, desplazable horizontalmente" tabindex="0"><table><caption class="sr">Importes en miles de millones de USD; ROIC en %</caption>
      <thead><tr><th scope="col">Año</th><th scope="col">Ventas</th><th scope="col">Beneficio neto</th><th scope="col">EBITDA</th><th scope="col">Caja libre</th><th scope="col">ROIC (%)</th></tr></thead><tbody>${hist}</tbody></table></div>
    <p class="mut peq aviso-datos ${origenFicha(a.fundamentales[0]).nivel}">${esc(origenFicha(a.fundamentales[0]).corto)}</p>
    <details class="ficha-det"><summary>Metodología</summary><div><p>EBITDA = resultado operativo + amortizaciones. Caja libre = flujo de caja operativo − inversiones en inmovilizado. El ROIC se aproxima como resultado operativo × (1 − tasa de impuestos) ÷ (deuda a largo plazo + patrimonio − caja). Son cálculos aproximados y pueden contener errores.</p></div></details>
    <details class="ficha-det"><summary>Glosario</summary><div>
      <p><b>ROIC:</b> cuánto gana la empresa por cada dólar invertido en su negocio. Es una medida de la empresa; no es la rentabilidad que obtendría un inversor.</p>
      <p><b>EBITDA:</b> beneficio operativo antes de intereses, impuestos y amortizaciones.</p>
      <p><b>Caja libre:</b> dinero que queda tras pagar las operaciones y las inversiones necesarias.</p>
      <p><b>No disponible:</b> el dato falta en los informes. <b>No aplicable:</b> la medida no tiene sentido para ese activo (por ejemplo, el ROIC de un fondo).</p></div></details>`;
  const d = $('#dlg-ficha'); if (!d.open) { d.showModal(); try { history.pushState({ ficha: a.ticker }, ''); } catch { /* sin historial */ } } d.scrollTop = 0;   // «atrás» cierra la ficha y vuelve donde estabas
  pintarFichaRadar(a);
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
  let p; try { p = await getJson('/public/' + id); } catch { return toastError('No se pudo cargar la cartera'); }
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
// Una acción principal según el estado: con sesión, «Abrir mis portafolios»; con un borrador en este dispositivo, «Retomar mi borrador»; si no, crear el primero.
function pintarEntrada() {
  const b = $('#probar'), modo = logged() ? 'mis' : hayBorrador() ? 'borrador' : 'crear';
  b.dataset.modo = modo; b.textContent = modo === 'mis' ? 'Abrir mis portafolios' : modo === 'borrador' ? 'Retomar mi borrador' : 'Crea tu primer portafolio';
  $('#entrada-demo').hidden = !window.__KLEVER_DEMO__;
  pintarPendientes();
}
// Usuario recurrente (ronda 21): lo primero es continuar y revisar, no repetir la bienvenida. Si hay ideas del Cuaderno con fecha de revisión de hoy o vencida, se avisa con un enlace; si no se pueden leer, no se dice nada (no se inventa un «0»).
let pendSeq = 0;
async function pintarPendientes() {
  const el = $('#inicio-revisar'), n = ++pendSeq; el.hidden = true; if (!logged()) return;
  try {
    const l = await api('/escenarios'); if (n !== pendSeq || !logged()) return;
    const d = new Date(), hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const k = l.filter(e => e.estado === 'en_estudio' && e.revisar_en && e.revisar_en <= hoy).length;
    if (k) { el.firstElementChild.textContent = `Tienes ${k} ${k === 1 ? 'idea' : 'ideas'} para revisar en tu Cuaderno`; el.hidden = false; }
  } catch { /* sin datos fiables no se muestra nada */ }
}
$('#probar').addEventListener('click', () => { // destino inequívoco según el estado; al crear, la elección de plantilla con el foco allí
  const modo = $('#probar').dataset.modo;
  if (modo === 'mis') { go('#carteras'); return; }
  if (modo === 'borrador') { const d = leerBorrador(); if (d?.pos?.length) { restaurarBorrador(d); go('#cartera'); return; } }
  const s = $('#plantillas'); s.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth' }); s.querySelector('.plantilla').focus({ preventScroll: true });
});
$$('[data-plantilla]').forEach(b => b.addEventListener('click', () => abrirInvitado(b.dataset.plantilla, 'ejemplo')));
// las TRES entradas de la portada; todas abren el mismo editor (ver abrirNueva / abrirInvitado)
$('#entrada-vacia').addEventListener('click', () => abrirNueva('vacia'));
$('#entrada-manual').addEventListener('click', () => abrirNueva('manual'));
$('#entrada-ejemplo').addEventListener('click', () => { const s = $('#plantillas'); s.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth' }); s.querySelector('.plantilla').focus({ preventScroll: true }); });
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

let universoCache = null;                                            // instantánea del universo (nota y comparador); se pide una vez
const cargarUniverso = () => universoCache || (universoCache = getJson('/universo').catch(e => { universoCache = null; throw e; }));
// Cerrar la ficha para NAVEGAR a otra parte: se quita la marca del historial antes, para que el cierre no «vuelva atrás» y deshaga la navegación.
function cerrarFicha() { try { history.replaceState(null, ''); } catch { /* sin historial */ } const d = $('#dlg-ficha'); if (d.open) d.close(); }
try { history.scrollRestoration = 'manual'; } catch { /* sin historial */ }   // «atrás» desde la ficha no debe mover el scroll: la página sigue donde estabas
$('#dlg-ficha').addEventListener('close', () => { if (history.state?.ficha) { try { history.back(); } catch { /* sin historial */ } } });
window.addEventListener('popstate', () => { const d = $('#dlg-ficha'); if (d.open) d.close(); });
// ---------- contexto que se entrega a js/lab.js (radiografía, radar, laboratorio, seguimiento) ----------
function contextoLab() {
  return { idSesion: () => tok(), sesion: () => sesionSeq, universo: cargarUniverso, empresas: () => empresas, origen: origenCodigo, cerrarFicha, abrirEjemplo: () => abrirLab({ carteraId: 'ejemplo' }), $, $$, esc, pesoCorto, nf, api, getJson, logged, store, go, toast, toastError, abrirAcceso, fmtFecha, fmtFechaHora, leerBorrador,
    activos: () => by, verFicha, refrescarEmpresas: () => renderEmpresas(),
    editor: () => ({ current, pos, posGuardada, dirty: !!current?.id && rev !== savedRev }),
    fijarLimite: v => { if (current) current.limite_peso = v; },
    probar: ({ ticker, historia }) => abrirLab({ carteraId: null, ticker, historia }) };
}
// ---------- arranque ----------
(async () => {
  await redeem();
  await loadAssets(); activosListos();
  const ctxLab = contextoLab(); iniciarLab(ctxLab); iniciarRevista(ctxLab); iniciarIdeas(ctxLab);
  actualizarCabecera(); renderPreview(); loadScreener(); loadPublicas(); cargarOrigenDatos();
  purgarCopias();                                    // las copias locales caducan a los 7 días
  if (logged()) { try { purgarCopias((await api('/portfolios')).map(c => c.id)); } catch { /* sin conexión: se purgará en la próxima carga */ } }   // y las de OTRA cuenta se borran al entrar esta
  if (logged()) await migrarRadarLocal();            // el radar de este dispositivo pasa a la cuenta (idempotente)
  await cargarRadar(); loadEmpresas();               // el radar se carga antes de pintar la lista (marcas «En tu radar»)
  if (logged()) {
    await migrarBorrador();
  }
  arrancado = true; route(true);
})();
