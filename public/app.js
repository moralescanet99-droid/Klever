// Almacenamiento tolerante a modo privado / datos bloqueados.
const store = (() => { const m = {}; return {
  getItem: k => { try { return localStorage.getItem(k); } catch { return m[k] ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { m[k] = v; } },
  removeItem: k => { try { localStorage.removeItem(k); } catch { delete m[k]; } } }; })();
const $ = s => document.querySelector(s);
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 4000); }
let sessionExpired = false;
const API = '/api';
const tok = () => store.getItem('klever_token');

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

// Tickers sugeridos por plantilla (del universo inicial). Pesos iguales.
const PLANTILLAS = {
  riesgo: ['NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'],
  oro: ['GLD', 'IAU', 'GDX', 'NEM'],
  dividendos: ['SCHD', 'VYM', 'KO', 'PG', 'JNJ', 'XOM'],
};

let assets = [], current = null, pos = [];

const fmtPct = v => v == null ? '—' : (v * 100).toFixed(1) + '%';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function start() {
  const logged = !!tok();
  $('#registro').hidden = logged;
  $('#app').hidden = !logged;
  if (!logged) {
    if (sessionExpired) { $('#err-registro').textContent = 'Tu sesión ha caducado. Pide un enlace nuevo para entrar.'; sessionExpired = false; }
    return;
  }
  try {
    assets = await api('/assets');
    $('#ed-ticker').innerHTML = assets.map(a => `<option value="${a.ticker}">${esc(a.ticker)} · ${esc(a.nombre)}</option>`).join('');
    await loadList();
  } catch (err) { toast(err.message); $('#lista').innerHTML = '<li class="state">No se pudieron cargar tus portafolios. <a href="#" id="reintentar">Reintentar</a></li>'; }
}

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
  store.removeItem('klever_token'); $('#editor').hidden = true; start();
});

// Canje del enlace mágico (?login=TOKEN) antes de arrancar.
async function redeem() {
  const t = new URLSearchParams(location.search).get('login');
  if (!t) return;
  history.replaceState(null, '', location.pathname);
  try {
    const { token } = await api('/verify', { method: 'POST', body: { token: t } });
    store.setItem('klever_token', token);
  } catch (err) { toast(err.message); }
}

async function loadList() {
  const list = await api('/portfolios');
  $('#lista').innerHTML = list.length
    ? list.map(p => `<li><a href="#" role="button" data-id="${p.id}">${esc(p.nombre)}</a><span>${esc(p.plantilla)}</span></li>`).join('')
    : '<li>Aún no tienes portafolios. Crea el primero arriba.</li>';
}

$('#lista').addEventListener('click', e => {
  if (e.target.id === 'reintentar') { e.preventDefault(); start(); return; }
  const id = e.target.dataset.id; if (id) { e.preventDefault(); open(id); }
});

$('#form-nuevo').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla') } });
    e.target.reset();
    await loadList();
    open(id);
  } catch (err) { toast(err.message); }
});

async function open(id) {
  try { current = await api('/portfolios/' + id); } catch (err) { return toast(err.message); }
  chartEls.clear(); $('#graficos').innerHTML = '';
  pos = current.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso }));
  $('#editor').hidden = false;
  $('#ed-tesis').value = current.tesis || '';
  $('#ed-publico').checked = !!current.publico;
  $('#ed-titulo').textContent = `${current.nombre} (${current.plantilla})`;
  $('#editor').scrollIntoView({ behavior: 'smooth' });
  render();
}

function render() {
  const by = Object.fromEntries(assets.map(a => [a.ticker, a]));
  $('#ed-tabla tbody').innerHTML = pos.map((p, i) => `<tr>
    <td>${esc(p.ticker)} <small>${esc(by[p.ticker]?.nombre || '')}</small></td>
    <td>${esc(by[p.ticker]?.sector || '')}</td><td>${p.peso}%</td>
    <td>${fmtPct(by[p.ticker]?.roic)}</td><td><button class="sec" data-i="${i}">✕</button></td></tr>`).join('');
  const total = pos.reduce((s, p) => s + p.peso, 0);
  $('#r-total').textContent = total.toFixed(1) + '%';
  const w = pos.filter(p => by[p.ticker]?.roic != null);
  const ws = w.reduce((s, p) => s + p.peso, 0);
  $('#r-roic').textContent = ws ? fmtPct(w.reduce((s, p) => s + by[p.ticker].roic * p.peso, 0) / ws) : '—';
  const sec = {};
  for (const p of pos) { const s = by[p.ticker]?.sector || '?'; sec[s] = (sec[s] || 0) + p.peso; }
  $('#r-sectores').innerHTML = Object.entries(sec).sort((a, b) => b[1] - a[1])
    .map(([s, v]) => `<div class="bar"><span>${esc(s)} ${v.toFixed(1)}%</span><i style="width:${Math.min(v, 100) * 3}px"></i></div>`).join('');
  renderCharts();
}

// ---- TradingView: solo con consentimiento, carga diferida y sin redibujar lo ya cargado ----
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
const placeholder = texto => `<div class="ph"><span>${texto}</span><button type="button" class="sec" data-consent="si">Aceptar cookies de TradingView y cargar</button></div>`;

const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return; io.unobserve(e.target); mountChart(e.target);
}), { rootMargin: '200px' }) : null;

function mountChart(c) {
  widget(c, 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
    { symbol: c.dataset.t, width: '100%', height: 220, locale: 'es', dateRange: '12M', colorTheme: dark() ? 'dark' : 'light', isTransparent: false, autosize: false, largeChartUrl: '' });
}

function renderCharts() {
  const box = $('#graficos');
  if (consent() !== 'si') {
    chartEls.clear();
    box.innerHTML = pos.length ? placeholder(consent() === 'no' ? 'Gráficos desactivados.' : 'Los gráficos de cada posición los carga TradingView.') : '';
    return;
  }
  box.querySelectorAll('.ph').forEach(n => n.remove());
  const want = new Set(pos.map(p => p.ticker));
  for (const [t, el] of chartEls) if (!want.has(t)) { el.remove(); chartEls.delete(t); }
  for (const p of pos) {
    if (chartEls.has(p.ticker)) continue;
    const c = document.createElement('div'); c.className = 'chart-slot'; c.dataset.t = p.ticker;
    box.appendChild(c); chartEls.set(p.ticker, c);
    io ? io.observe(c) : mountChart(c);
  }
}

$('#ed-tabla').addEventListener('click', e => {
  const i = e.target.dataset.i; if (i == null) return;
  pos.splice(+i, 1); render();
});

$('#ed-add').addEventListener('click', () => {
  const ticker = $('#ed-ticker').value, peso = parseFloat($('#ed-peso').value);
  $('#err-editor').textContent = '';
  if (!(peso > 0)) return $('#err-editor').textContent = 'Indica un peso mayor que 0';
  const ex = pos.find(p => p.ticker === ticker);
  if (ex) ex.peso = peso; else pos.push({ ticker, peso });
  $('#ed-peso').value = ''; render();
});

$('#ed-sugerir').addEventListener('click', () => {
  const t = PLANTILLAS[current.plantilla].filter(x => assets.some(a => a.ticker === x));
  const w = Math.floor(1000 / t.length) / 10;
  const resto = Math.round((100 - w * t.length) * 10) / 10; // el primero absorbe el redondeo
  pos = t.map((ticker, i) => ({ ticker, peso: i === 0 ? Math.round((w + resto) * 10) / 10 : w })); render();
});

$('#ed-guardar').addEventListener('click', async () => {
  $('#err-editor').textContent = '';
  try { await api('/portfolios/' + current.id, { method: 'PUT', body: { posiciones: pos } });
    await api('/portfolios/' + current.id, { method: 'PATCH', body: { tesis: $('#ed-tesis').value, publico: $('#ed-publico').checked } }); loadPublicos(); $('#err-editor').textContent = 'Guardado ✓'; }
  catch (err) { $('#err-editor').textContent = err.message; }
});

let borrarTimer;
$('#ed-borrar').addEventListener('click', async e => {
  const b = e.currentTarget;
  if (b.dataset.armed !== '1') { // primera pulsación: pide confirmar
    b.dataset.armed = '1'; b.textContent = '¿Seguro? Pulsa otra vez';
    clearTimeout(borrarTimer); borrarTimer = setTimeout(() => { b.dataset.armed = ''; b.textContent = 'Eliminar'; }, 4000); return;
  }
  clearTimeout(borrarTimer); b.dataset.armed = ''; b.textContent = 'Eliminar';
  try { await api('/portfolios/' + current.id, { method: 'DELETE' }); toast('Portafolio eliminado'); }
  catch (err) { return toast(err.message); }
  $('#editor').hidden = true; current = null; chartEls.clear(); loadList();
});

redeem().then(start);

// ---- Ideas (semana 3) ----
const CRIT = {
  deuda_ebitda: ['Deuda neta / EBITDA < 2,5', v => v.toFixed(2) + 'x'],
  roic: ['ROIC aprox. > 10%', fmtPct],
  margen_neto: ['Margen neto > 10%', fmtPct],
  flujo_caja: ['Flujo de caja libre > 0', v => (v / 1e9).toFixed(2) + ' mil M$'],
  crecimiento: ['Ingresos crecen vs. año anterior', fmtPct],
};
const critRows = c => Object.entries(CRIT).map(([k, [label, f]]) => {
  const x = c[k]; const mark = x?.ok === true ? '<b class="ok">✓</b>' : x?.ok === false ? '<b class="no">✗</b>' : '<span class="mut">sin dato</span>';
  return `<li>${mark} ${label} <span class="mut">${x?.valor != null ? '(' + f(x.valor) + ')' : ''}</span></li>`;
}).join('');

async function loadIdeas() {
  $('#ideas-tabla tbody').innerHTML = '<tr><td colspan="4" class="state">Cargando ideas…</td></tr>';
  let rows;
  try { const r = await fetch(API + '/ideas'); if (!r.ok) throw 0; rows = await r.json(); }
  catch { $('#ideas-tabla tbody').innerHTML = '<tr><td colspan="4" class="state">No se pudieron cargar las ideas. <a href="#" data-retry="ideas">Reintentar</a></td></tr>'; return; }
  $('#ideas-tabla tbody').innerHTML = rows.length ? rows.map(r =>
    `<tr tabindex="0" data-t="${esc(r.ticker)}"><td>${esc(r.ticker)} <small>${esc(r.nombre)}</small></td><td>${esc(r.sector)}</td><td>${r.cumplidos}/${r.evaluados}</td><td><a>Ver ficha</a></td></tr>`).join('')
    : '<tr><td colspan="4">Aún no hay datos: ejecuta la carga de la SEC.</td></tr>';
}

async function verFicha(t) {
  let a;
  try { const r = await fetch(API + '/assets/' + t); if (!r.ok) throw 0; a = await r.json(); } catch { return toast('No se pudo cargar la ficha'); }
  const f = $('#ficha'); f.hidden = false;
  const hist = a.fundamentales.map(x => `<tr><td>${esc(x.periodo)}</td><td>${(x.ingresos / 1e9).toFixed(1)}</td><td>${x.beneficio_neto != null ? (x.beneficio_neto / 1e9).toFixed(1) : '—'}</td><td>${x.ebitda != null ? (x.ebitda / 1e9).toFixed(1) : '—'}</td><td>${x.flujo_caja_libre != null ? (x.flujo_caja_libre / 1e9).toFixed(1) : '—'}</td><td>${fmtPct(x.roic)}</td></tr>`).join('');
  f.innerHTML = `<h3>${esc(a.nombre)} (${esc(a.ticker)}) · ${esc(a.sector)}</h3>
    <p>Aparece en el ranking según estos criterios${a.criterios?.periodo ? ' (' + esc(a.criterios.periodo) + ')' : ''}:</p>
    <ul>${a.criterios ? critRows(a.criterios) : '<li>Sin datos</li>'}</ul>
    <table><thead><tr><th>Periodo</th><th>Ingresos</th><th>Beneficio</th><th>EBITDA</th><th>FCF</th><th>ROIC</th></tr></thead><tbody>${hist}</tbody></table>
    <small class="mut">Miles de millones de USD. Fuente: SEC EDGAR; ROIC y EBITDA son cálculos aproximados.</small>`;
  f.scrollIntoView({ behavior: 'smooth' });
}
$('#ideas-tabla').addEventListener('click', e => { const t = e.target.closest('tr')?.dataset.t; if (t) verFicha(t); });
$('#ideas-tabla').addEventListener('keydown', e => { if (e.key !== 'Enter') return; const t = e.target.closest('tr')?.dataset.t; if (t) verFicha(t); });

// Screener oficial de TradingView (con consentimiento), separado del ranking propio.
function loadScreener() {
  const box = $('#tv-screener');
  if (consent() !== 'si') { box.className = ''; box.innerHTML = placeholder('El screener para filtros de precio lo carga TradingView.'); return; }
  widget(box, 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
    { width: '100%', height: 500, defaultColumn: 'overview', defaultScreen: 'most_capitalized', market: 'america', showToolbar: true, locale: 'es', colorTheme: dark() ? 'dark' : 'light' });
}
function setConsent(v) { store.setItem('klever_consent', v); $('#consent').hidden = true; loadScreener(); if (current) renderCharts(); }
document.addEventListener('click', e => { const v = e.target.dataset?.consent; if (v) setConsent(v); });
$('#consent-si').addEventListener('click', () => setConsent('si'));
$('#consent-no').addEventListener('click', () => setConsent('no'));
$('#consent').hidden = consent() !== null;
loadScreener();
loadIdeas();

// ---- Portafolios públicos (semana 4) ----
async function loadPublicos() {
  let rows;
  try { const r = await fetch(API + '/public'); if (!r.ok) throw 0; rows = await r.json(); }
  catch { $('#lista-publicos').innerHTML = '<li class="state">No se pudieron cargar. <a href="#" data-retry="publicos">Reintentar</a></li>'; return; }
  $('#lista-publicos').innerHTML = rows.length
    ? rows.map(p => `<li><a href="#" role="button" data-pid="${p.id}">${esc(p.nombre)}</a><span>${esc(p.plantilla)} · ${p.n_posiciones} posiciones</span></li>`).join('')
    : '<li>Aún no hay portafolios públicos.</li>';
}
$('#lista-publicos').addEventListener('click', async e => {
  const id = e.target.dataset.pid; if (!id) return; e.preventDefault();
  let p; try { const r = await fetch(API + '/public/' + id); if (!r.ok) throw 0; p = await r.json(); } catch { return toast('No se pudo cargar el portafolio'); }
  const d = $('#detalle-publico'); d.hidden = false;
  d.innerHTML = `<h3>${esc(p.nombre)}</h3><p>${esc(p.tesis || '')}</p>
    <table><thead><tr><th>Activo</th><th>Sector</th><th>Peso</th></tr></thead><tbody>${p.posiciones.map(x =>
      `<tr><td>${esc(x.ticker)} <small>${esc(x.nombre)}</small></td><td>${esc(x.sector)}</td><td>${x.peso}%</td></tr>`).join('')}</tbody></table>
    <small class="mut">Simulación educativa; no es una recomendación de inversión.</small>`;
});
loadPublicos();

document.addEventListener('click', e => { const r = e.target.dataset?.retry; if (!r) return; e.preventDefault(); r === 'ideas' ? loadIdeas() : loadPublicos(); });
