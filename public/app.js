const $ = s => document.querySelector(s);
const API = '/api';
const tok = () => localStorage.getItem('klever_token');

async function api(path, opts = {}) {
  const r = await fetch(API + path, {
    ...opts,
    headers: { 'content-type': 'application/json', ...(tok() ? { authorization: 'Bearer ' + tok() } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) { localStorage.removeItem('klever_token'); start(); }
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
  if (!logged) return;
  assets = await api('/assets');
  $('#ed-ticker').innerHTML = assets.map(a => `<option value="${a.ticker}">${esc(a.ticker)} · ${esc(a.nombre)}</option>`).join('');
  await loadList();
}

$('#form-registro').addEventListener('submit', async e => {
  e.preventDefault();
  $('#err-registro').textContent = '';
  try {
    const { token } = await api('/register', { method: 'POST', body: { email: new FormData(e.target).get('email') } });
    localStorage.setItem('klever_token', token);
    start();
  } catch (err) { $('#err-registro').textContent = err.message; }
});

async function loadList() {
  const list = await api('/portfolios');
  $('#lista').innerHTML = list.length
    ? list.map(p => `<li><a data-id="${p.id}">${esc(p.nombre)}</a><span>${esc(p.plantilla)}</span></li>`).join('')
    : '<li>Aún no tienes portafolios. Crea el primero arriba.</li>';
}

$('#lista').addEventListener('click', e => { const id = e.target.dataset.id; if (id) open(id); });

$('#form-nuevo').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: f.get('nombre'), plantilla: f.get('plantilla') } });
    e.target.reset();
    await loadList();
    open(id);
  } catch (err) { alert(err.message); }
});

async function open(id) {
  current = await api('/portfolios/' + id);
  pos = current.posiciones.map(p => ({ ticker: p.ticker, peso: p.peso }));
  $('#editor').hidden = false;
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

// Widgets oficiales de TradingView, intactos (con su enlace de marca). No se leen sus datos.
function renderCharts() {
  const box = $('#graficos'); box.innerHTML = '';
  for (const p of pos) {
    const c = document.createElement('div');
    c.className = 'tradingview-widget-container';
    c.innerHTML = '<div class="tradingview-widget-container__widget"></div><div class="tradingview-widget-copyright"><a href="https://es.tradingview.com/" rel="noopener nofollow" target="_blank"><span>TradingView</span></a></div>';
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    s.async = true;
    s.textContent = JSON.stringify({ symbol: p.ticker, width: '100%', height: 220, locale: 'es', dateRange: '12M', colorTheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', isTransparent: false, autosize: false, largeChartUrl: '' });
    c.appendChild(s); box.appendChild(c);
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
  pos = t.map(ticker => ({ ticker, peso: w })); render();
});

$('#ed-guardar').addEventListener('click', async () => {
  $('#err-editor').textContent = '';
  try { await api('/portfolios/' + current.id, { method: 'PUT', body: { posiciones: pos } }); $('#err-editor').textContent = 'Guardado ✓'; }
  catch (err) { $('#err-editor').textContent = err.message; }
});

$('#ed-borrar').addEventListener('click', async () => {
  if (!confirm('¿Eliminar este portafolio?')) return;
  await api('/portfolios/' + current.id, { method: 'DELETE' });
  $('#editor').hidden = true; current = null; loadList();
});

start();
