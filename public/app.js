// ---------- utilidades ----------
const store = (() => { const m = {}; return { // tolerante a modo privado / datos bloqueados
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } } }; })();
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (v, d = 1) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const pct = v => v == null ? '—' : nf(v * 100) + ' %';      // v es una fracción (0,12 → 12,0 %)
const pesoTxt = v => nf(v) + ' %';                            // v ya está en puntos porcentuales
const miles = v => v == null ? '—' : nf(v / 1e9);             // miles de millones

let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 4000); }

const API = '/api';
const tok = () => store.getItem('klever_token');
const logged = () => !!tok();
let sessionExpired = false;

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
  if (r.status === 401 && tok()) { store.removeItem('klever_token'); sessionExpired = true; start(); }
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}

// ---------- plantillas ----------
const PLANTILLAS = {
  riesgo: { nombre: 'crecimiento', tickers: ['NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'] },
  oro: { nombre: 'oro', tickers: ['GLD', 'IAU', 'GDX', 'NEM'] },
  dividendos: { nombre: 'dividendos', tickers: ['SCHD', 'VYM', 'KO', 'PG', 'JNJ', 'XOM'] },
};
function repartoPlantilla(plantilla) {
  const t = PLANTILLAS[plantilla].tickers.filter(x => assets.some(a => a.ticker === x));
  if (!t.length) return [];
  const w = Math.floor(1000 / t.length) / 10;
  const resto = Math.round((100 - w * t.length) * 10) / 10; // el primero absorbe el redondeo
  return t.map((ticker, i) => ({ ticker, peso: i === 0 ? Math.round((w + resto) * 10) / 10 : w }));
}

// ---------- estado ----------
let assets = [], current = null, pos = [], dirty = false;
const DRAFT = 'klever_borrador';
const leerBorrador = () => { try { return JSON.parse(store.getItem(DRAFT)); } catch { return null; } };
const guardarBorrador = () => { if (!logged() && current && !current.id) store.setItem(DRAFT, JSON.stringify({ plantilla: current.plantilla, pos })); };

async function loadAssets() {
  try {
    assets = await (await fetch(API + '/assets')).json();
    $('#ed-ticker').innerHTML = assets.map(a => `<option value="${esc(a.ticker)}">${esc(a.ticker)} · ${esc(a.nombre)}</option>`).join('');
  } catch { toast('No se pudieron cargar los activos. Recarga la página.'); }
}

function mostrarRegistro(msg) {
  $('#registro').hidden = false;
  if (msg) $('#err-registro').textContent = msg;
  $('#registro').scrollIntoView({ behavior: 'smooth' });
  $('#reg-email').focus({ preventScroll: true });
}

async function start() {
  const l = logged();
  $('#hero').hidden = l; $('#app').hidden = !l; $('#entrar').hidden = l;
  if (!l) {
    $('#registro').hidden = !sessionExpired && $('#registro').hidden;
    if (sessionExpired) { mostrarRegistro('Tu sesión ha caducado. Pide un enlace nuevo para entrar.'); sessionExpired = false; }
    const d = leerBorrador();
    if (d?.pos?.length && !current) abrirInvitado(d.plantilla, d.pos, false);
    return;
  }
  $('#registro').hidden = true;
  try { await loadList(); } catch (err) { toast(err.message); $('#lista').innerHTML = '<li class="state">No se pudieron cargar tus portafolios. <a href="#" id="reintentar">Reintentar</a></li>'; }
  await migrarBorrador();
}

async function migrarBorrador() {
  const d = leerBorrador(); if (!d) return;
  if (!d.pos?.length) { store.removeItem(DRAFT); return; }
  let ps = d.pos, ajustado = false;
  const tot = ps.reduce((s, x) => s + x.peso, 0);
  if (tot > 100.0001) { // el borrador se pasó de 100 %: se reduce en proporción para poder guardarlo
    const k = 100 / tot; ps = ps.map(x => ({ ticker: x.ticker, peso: Math.floor(x.peso * k * 10) / 10 })); ajustado = true;
  }
  let id = null;
  try {
    ({ id } = await api('/portfolios', { method: 'POST', body: { nombre: 'Mi cartera de ' + PLANTILLAS[d.plantilla].nombre, plantilla: d.plantilla } }));
    await api('/portfolios/' + id, { method: 'PUT', body: { posiciones: ps } });
    store.removeItem(DRAFT); // el borrador solo se borra cuando todo se ha guardado
    await loadList(); await open(id);
    toast(ajustado ? 'Guardada en tu cuenta. Los pesos pasaban de 100 %, los hemos ajustado en proporción.' : 'Hemos guardado tu cartera en tu cuenta');
  } catch (err) {
    if (id) { try { await api('/portfolios/' + id, { method: 'DELETE' }); } catch {} } // no dejar una cartera vacía a medias
    toast('No se pudo guardar tu borrador (' + err.message + '). Sigue en este navegador.');
  }
}

// ---------- acceso ----------
$('#entrar').addEventListener('click', () => mostrarRegistro());
$('#form-registro').addEventListener('submit', async e => {
  e.preventDefault();
  $('#err-registro').textContent = ''; $('#ok-registro').textContent = '';
  const btn = e.target.querySelector('button'); btn.disabled = true;
  try {
    const r = await api('/login', { method: 'POST', body: { email: new FormData(e.target).get('email'), acepto: e.target.acepto.checked } });
    $('#ok-registro').innerHTML = r.dev_link ? `Modo desarrollo: <a href="${esc(r.dev_link)}">entrar</a>` : 'Revisa tu email: te hemos enviado el enlace (caduca en 15 minutos).';
  } catch (err) { $('#err-registro').textContent = err.message; }
  finally { btn.disabled = false; }
});
$('#salir').addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST' }); } catch {}
  store.removeItem('klever_token'); $('#editor').hidden = true; current = null; start();
});
async function redeem() { // canje del enlace mágico (?login=TOKEN)
  const t = new URLSearchParams(location.search).get('login'); if (!t) return;
  history.replaceState(null, '', location.pathname);
  try { const { token } = await api('/verify', { method: 'POST', body: { token: t } }); store.setItem('klever_token', token); }
  catch (err) { toast(err.message); }
}

// ---------- lista y apertura de carteras ----------
async function loadList() {
  const list = await api('/portfolios');
  $('#lista').innerHTML = list.length
    ? list.map(p => `<li><a href="#" role="button" data-id="${p.id}">${esc(p.nombre)}</a><span>${esc(PLANTILLAS[p.plantilla]?.nombre || p.plantilla)}${p.publico ? ' · pública' : ''}</span></li>`).join('')
    : '<li>Aún no tienes carteras. Crea la primera arriba.</li>';
}
$('#lista').addEventListener('click', e => {
  if (e.target.id === 'reintentar') { e.preventDefault(); start(); return; }
  const id = e.target.dataset.id; if (id) { e.preventDefault(); open(id); }
});
$('#form-nuevo').addEventListener('submit', async e => {
  e.preventDefault(); const f = new FormData(e.target);
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla') } });
    e.target.reset(); await loadList(); open(id);
  } catch (err) { toast(err.message); }
});

function mostrarEditor(scroll = true) {
  const l = logged();
  $('#editor').hidden = false;
  $$('.solo-cuenta').forEach(e => e.hidden = !l);
  $$('.solo-invitado').forEach(e => e.hidden = l);
  $('#err-editor').textContent = '';
  if (scroll) $('#editor').scrollIntoView({ behavior: 'smooth' });
}
function abrirInvitado(plantilla, posiciones, scroll = true) {
  current = { id: null, nombre: 'Mi cartera de ' + PLANTILLAS[plantilla].nombre, plantilla, tesis: '', publico: 0 };
  chartEls.clear(); $('#graficos').innerHTML = '';
  pos = posiciones || repartoPlantilla(plantilla);
  $('#ed-titulo').textContent = current.nombre; dirty = false;
  mostrarEditor(scroll); render(); guardarBorrador();
}
$$('[data-plantilla]').forEach(b => b.addEventListener('click', () => abrirInvitado(b.dataset.plantilla)));

async function open(id) {
  try { current = await api('/portfolios/' + id); } catch (err) { return toast(err.message); }
  chartEls.clear(); $('#graficos').innerHTML = '';
  pos = current.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso })); dirty = false;
  $('#ed-tesis').value = current.tesis || '';
  $('#ed-titulo').textContent = current.nombre;
  mostrarEditor(); render(); refreshPub(); setEstado();
}
function setEstado() { $('#estado').textContent = dirty ? 'Cambios sin guardar' : (current?.id ? 'Todo guardado' : ''); }
function marcarCambio() { dirty = true; setEstado(); guardarBorrador(); }

function refreshPub() {
  const p = !!current?.publico;
  const chip = $('#pub-estado'); chip.textContent = p ? 'Pública' : 'Privada'; chip.classList.toggle('on', p);
  $('#ed-publicar').textContent = p ? 'Dejar de publicar' : 'Publicar';
  $('#ed-publicar').classList.toggle('sec', p);
  $('#ed-tesis-guardar').hidden = !p;
}

// ---------- editor ----------
function render() {
  const by = Object.fromEntries(assets.map(a => [a.ticker, a]));
  $('#ed-tabla tbody').innerHTML = pos.length ? pos.map((p, i) => `<tr>
    <td>${esc(p.ticker)} <small>${esc(by[p.ticker]?.nombre || '')}</small></td>
    <td>${esc(by[p.ticker]?.sector || '')}</td><td>${pesoTxt(p.peso)}</td>
    <td>${pct(by[p.ticker]?.roic)}</td>
    <td><button class="sec" data-i="${i}" aria-label="Quitar ${esc(p.ticker)}">✕</button></td></tr>`).join('')
    : '<tr><td colspan="5" class="state">Aún no hay posiciones. Añade un activo o usa el reparto de la plantilla.</td></tr>';
  const total = pos.reduce((s, p) => s + p.peso, 0);
  $('#r-total').textContent = pesoTxt(total);
  $('#r-total').className = total > 100.0001 ? 'no' : '';
  const aviso = $('#err-editor');
  if (total > 100.0001) aviso.textContent = 'Los pesos suman más de 100 %. Reduce alguno para poder guardar.';
  else if (aviso.textContent.startsWith('Los pesos suman')) aviso.textContent = '';
  const w = pos.filter(p => by[p.ticker]?.roic != null);
  const ws = w.reduce((s, p) => s + p.peso, 0);
  $('#r-roic').textContent = ws ? pct(w.reduce((s, p) => s + by[p.ticker].roic * p.peso, 0) / ws) : '—';
  const sec = {};
  for (const p of pos) { const s = by[p.ticker]?.sector || '?'; sec[s] = (sec[s] || 0) + p.peso; }
  $('#r-sectores').innerHTML = Object.entries(sec).sort((a, b) => b[1] - a[1])
    .map(([s, v]) => `<div class="bar"><span>${esc(s)} · ${pesoTxt(v)}</span><div class="track"><i style="width:${Math.min(v, 100)}%"></i></div></div>`).join('');
  $('#ed-sugerir-ayuda').textContent = current ? `Sustituye las posiciones actuales por ${PLANTILLAS[current.plantilla].tickers.length} activos con el mismo peso.` : '';
  renderCharts();
}
$('#ed-tabla').addEventListener('click', e => {
  const i = e.target.dataset.i; if (i == null) return;
  pos.splice(+i, 1); marcarCambio(); render();
});
$('#ed-add').addEventListener('click', () => {
  const ticker = $('#ed-ticker').value, peso = parseFloat($('#ed-peso').value);
  $('#err-editor').textContent = '';
  if (!(peso > 0)) return $('#err-editor').textContent = 'Indica un peso mayor que 0';
  const ex = pos.find(p => p.ticker === ticker);
  if (ex) ex.peso = peso; else pos.push({ ticker, peso });
  $('#ed-peso').value = ''; marcarCambio(); render();
});
$('#ed-sugerir').addEventListener('click', () => { pos = repartoPlantilla(current.plantilla); marcarCambio(); render(); toast('Reparto de la plantilla aplicado'); });
$('#ed-tesis').addEventListener('input', marcarCambio);

async function guardarPosiciones() {
  await api('/portfolios/' + current.id, { method: 'PUT', body: { posiciones: pos } });
  await api('/portfolios/' + current.id, { method: 'PATCH', body: { tesis: $('#ed-tesis').value } });
  dirty = false; setEstado();
}
$('#ed-guardar').addEventListener('click', async () => {
  $('#err-editor').textContent = '';
  try { await guardarPosiciones(); toast('Cambios guardados (solo los ves tú)'); }
  catch (err) { $('#err-editor').textContent = err.message; }
});
$('#ed-guardar-invitado').addEventListener('click', () => {
  guardarBorrador();
  mostrarRegistro('Entra con tu email para guardar esta cartera. Tu borrador se conserva y se guardará al entrar.');
});
async function cambiarPublicacion(publico) {
  $('#err-editor').textContent = '';
  try {
    await guardarPosiciones();
    await api('/portfolios/' + current.id, { method: 'PATCH', body: { tesis: $('#ed-tesis').value, publico } });
    current.publico = publico ? 1 : 0; refreshPub(); loadPublicos(); loadList();
    toast(publico ? 'Cartera publicada' : 'Ahora es privada');
  } catch (err) { $('#err-editor').textContent = err.message; }
}
$('#ed-publicar').addEventListener('click', () => cambiarPublicacion(!current.publico));
$('#ed-tesis-guardar').addEventListener('click', () => cambiarPublicacion(true));

let borrarTimer;
$('#ed-borrar').addEventListener('click', async e => {
  const b = e.currentTarget;
  if (b.dataset.armed !== '1') {
    b.dataset.armed = '1'; b.textContent = '¿Seguro? Pulsa otra vez';
    clearTimeout(borrarTimer); borrarTimer = setTimeout(() => { b.dataset.armed = ''; b.textContent = 'Eliminar'; }, 4000); return;
  }
  clearTimeout(borrarTimer); b.dataset.armed = ''; b.textContent = 'Eliminar';
  try { await api('/portfolios/' + current.id, { method: 'DELETE' }); toast('Cartera eliminada'); }
  catch (err) { return toast(err.message); }
  $('#editor').hidden = true; current = null; chartEls.clear(); loadList(); loadPublicos();
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
  <span class="row"><button type="button" data-consent="si">Cargar</button>${consent() === 'no' ? '' : '<button type="button" class="sec" data-consent="no">Ahora no</button>'}</span></div>`;
const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return; io.unobserve(e.target); mountChart(e.target);
}), { rootMargin: '200px' }) : null;
function mountChart(c) {
  widget(c, 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
    { symbol: c.dataset.t, width: '100%', height: 220, locale: 'es', dateRange: '12M', colorTheme: dark() ? 'dark' : 'light', isTransparent: false, autosize: false, largeChartUrl: '' });
}
function renderCharts() {
  const box = $('#graficos');
  if (consent() !== 'si') { chartEls.clear(); box.innerHTML = pos.length ? placeholder('Los gráficos de precio de cada posición los carga') : ''; return; }
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

// ---------- Ideas ----------
const CRIT = {
  deuda_ebitda: ['Deuda baja: la deuda neta es menos de 2,5 veces su beneficio operativo (EBITDA)', v => nf(v) + ' veces'],
  roic: ['Buena rentabilidad: gana más del 10 % sobre el capital invertido (ROIC)', pct],
  margen_neto: ['Margen sano: se queda con más del 10 % de las ventas como beneficio', pct],
  flujo_caja: ['Genera caja: el flujo de caja libre es positivo', v => nf(v / 1e9) + ' mil millones de USD'],
  crecimiento: ['Crece: las ventas suben respecto al año anterior', pct],
};
const critRows = c => Object.entries(CRIT).map(([k, [label, f]]) => {
  const x = c[k];
  const mark = x?.ok === true ? '<b class="ok">✓ Cumple</b>' : x?.ok === false ? '<b class="no">✗ No cumple</b>' : '<span class="mut">Sin dato</span>';
  return `<li>${mark}: ${label} <span class="mut">${x?.valor != null ? '(' + f(x.valor) + ')' : ''}</span></li>`;
}).join('');

let ideasRows = [], ideasTodas = false;
const IDEAS_INICIO = 8;
function renderIdeas() {
  const q = $('#ideas-buscar').value.trim().toLowerCase();
  const filtradas = q ? ideasRows.filter(r => (r.ticker + ' ' + r.nombre + ' ' + r.sector).toLowerCase().includes(q)) : ideasRows;
  const vistas = (q || ideasTodas) ? filtradas : filtradas.slice(0, IDEAS_INICIO);
  $('#ideas-tabla tbody').innerHTML = vistas.length ? vistas.map(r =>
    `<tr tabindex="0" data-t="${esc(r.ticker)}"><td>${esc(r.ticker)} <small>${esc(r.nombre)}</small></td><td>${esc(r.sector)}</td><td>${r.cumplidos} de ${r.evaluados}</td><td><a>Ver ficha</a></td></tr>`).join('')
    : `<tr><td colspan="4" class="state">${ideasRows.length ? 'Ninguna empresa coincide con tu búsqueda.' : 'Aún no hay datos: ejecuta la carga de la SEC.'}</td></tr>`;
  $('#ideas-cuenta').textContent = ideasRows.length ? `Mostrando ${vistas.length} de ${filtradas.length}` : '';
  const mas = $('#ideas-mas');
  mas.hidden = !!q || filtradas.length <= IDEAS_INICIO;
  mas.textContent = ideasTodas ? `Ver solo las ${IDEAS_INICIO} primeras` : `Ver las ${filtradas.length} empresas`;
}
async function loadIdeas() {
  $('#ideas-tabla tbody').innerHTML = '<tr><td colspan="4" class="state">Cargando ideas…</td></tr>';
  try { const r = await fetch(API + '/ideas'); if (!r.ok) throw 0; ideasRows = await r.json(); }
  catch { $('#ideas-tabla tbody').innerHTML = '<tr><td colspan="4" class="state">No se pudieron cargar las ideas. <a href="#" data-retry="ideas">Reintentar</a></td></tr>'; return; }
  renderIdeas();
}
$('#ideas-buscar').addEventListener('input', renderIdeas);
$('#ideas-mas').addEventListener('click', () => { ideasTodas = !ideasTodas; renderIdeas(); });

async function verFicha(t) {
  let a;
  try { const r = await fetch(API + '/assets/' + t); if (!r.ok) throw 0; a = await r.json(); } catch { return toast('No se pudo cargar la ficha'); }
  const f = $('#ficha'); f.hidden = false;
  const hist = a.fundamentales.map(x => `<tr><td>${esc(x.periodo)}</td><td>${miles(x.ingresos)}</td><td>${miles(x.beneficio_neto)}</td><td>${miles(x.ebitda)}</td><td>${miles(x.flujo_caja_libre)}</td><td>${pct(x.roic)}</td></tr>`).join('');
  f.innerHTML = `<h3>${esc(a.nombre)} (${esc(a.ticker)}) · ${esc(a.sector)}</h3>
    <p>Así sale en nuestras cinco comprobaciones${a.criterios?.periodo ? ' (' + esc(a.criterios.periodo) + ')' : ''}:</p>
    <ul>${a.criterios ? critRows(a.criterios) : '<li>Sin datos</li>'}</ul>
    <table><caption class="sr">Cifras de los últimos años, en miles de millones de dólares</caption><thead><tr><th scope="col">Año</th><th scope="col">Ventas</th><th scope="col">Beneficio neto</th><th scope="col">EBITDA</th><th scope="col">Caja libre</th><th scope="col">ROIC</th></tr></thead><tbody>${hist}</tbody></table>
    <small class="mut">Ventas, beneficio, EBITDA y caja libre en miles de millones de dólares (USD). Fuente: SEC EDGAR; EBITDA y ROIC son cálculos aproximados.</small>
    <details class="glosario"><summary>¿Qué significan estos términos?</summary>
      <p><b>EBITDA:</b> beneficio operativo antes de intereses, impuestos y amortizaciones; sirve para comparar cuánta deuda soporta el negocio.</p>
      <p><b>ROIC:</b> rentabilidad sobre el capital invertido; cuánto gana la empresa por cada dólar que tiene en el negocio.</p>
      <p><b>Caja libre (flujo de caja libre):</b> dinero que queda tras pagar las operaciones y las inversiones necesarias.</p></details>`;
  f.scrollIntoView({ behavior: 'smooth' });
}
$('#ideas-tabla').addEventListener('click', e => { const t = e.target.closest('tr')?.dataset.t; if (t) verFicha(t); });
$('#ideas-tabla').addEventListener('keydown', e => { if (e.key !== 'Enter') return; const t = e.target.closest('tr')?.dataset.t; if (t) verFicha(t); });

// ---------- carteras públicas ----------
async function loadPublicos() {
  let rows;
  try { const r = await fetch(API + '/public'); if (!r.ok) throw 0; rows = await r.json(); }
  catch { $('#lista-publicos').innerHTML = '<li class="state">No se pudieron cargar. <a href="#" data-retry="publicos">Reintentar</a></li>'; return; }
  $('#lista-publicos').innerHTML = rows.length
    ? rows.map(p => `<li><a href="#" role="button" data-pid="${p.id}">${esc(p.nombre)}</a><span>${esc(PLANTILLAS[p.plantilla]?.nombre || p.plantilla)} · ${p.n_posiciones} posiciones</span></li>`).join('')
    : '<li>Aún no hay carteras públicas.</li>';
}
$('#lista-publicos').addEventListener('click', async e => {
  const id = e.target.dataset.pid; if (!id) return; e.preventDefault();
  let p; try { const r = await fetch(API + '/public/' + id); if (!r.ok) throw 0; p = await r.json(); } catch { return toast('No se pudo cargar la cartera'); }
  const d = $('#detalle-publico'); d.hidden = false;
  d.innerHTML = `<h3>${esc(p.nombre)}</h3><p>${esc(p.tesis || '')}</p>
    <table><thead><tr><th scope="col">Activo</th><th scope="col">Sector</th><th scope="col">Peso</th></tr></thead><tbody>${p.posiciones.map(x =>
      `<tr><td>${esc(x.ticker)} <small>${esc(x.nombre)}</small></td><td>${esc(x.sector)}</td><td>${pesoTxt(x.peso)}</td></tr>`).join('')}</tbody></table>
    <small class="mut">Simulación educativa; no es una recomendación de inversión.</small>`;
});
document.addEventListener('click', e => { const r = e.target.dataset?.retry; if (!r) return; e.preventDefault(); r === 'ideas' ? loadIdeas() : loadPublicos(); });

// ---------- arranque ----------
(async () => {
  await redeem();
  await loadAssets();
  loadScreener(); loadIdeas(); loadPublicos();
  start();
})();
