// Presentación de «Mi cartera» (radiografía), «Mi radar», «Mi laboratorio» y «Mi seguimiento». Los cálculos viven en calculos.js; el almacenamiento, en almacen.js.
// app.js le pasa sus utilidades (DOM, API, sesión, ficha…) por un contexto: este módulo no conoce el resto del estado de la aplicación.
import { radiografia, simular, comparar, FINANCIACIONES } from './calculos.js';
import { crearAlmacen } from './almacen.js';

const LAB = { ctx: null, alm: null, datos: null, carteras: [], radioModo: null, radioCartera: null, sim: null, esc: null };
const CLAVE_REF = 'klever_cartera_ref', CLAVE_LAB = 'klever_lab';
const ESTADOS = { en_estudio: 'En estudio', descartado: 'Descartado', archivado: 'Archivado' };
const METODOS = { sin_asignar: 'usando el porcentaje sin asignar', proporcional: 'reduciendo proporcionalmente las otras posiciones' };
const x = () => LAB.ctx;
const P = v => x().pesoCorto(v);

export function iniciarLab(ctx) {
  LAB.ctx = ctx;
  LAB.alm = crearAlmacen({ api: ctx.api, logged: ctx.logged, store: ctx.store, activos: ctx.activos });
  const $ = ctx.$;
  // --- radiografía del editor
  $('#radio-cuerpo').addEventListener('click', e => {
    const b = e.target.closest('[data-modo]'); if (b) { LAB.radioModo = b.dataset.modo; pintarRadiografia(); return; }
    if (e.target.closest('#radio-lab')) { const ed = ctx.editor(); abrirLab({ carteraId: ed.current?.id || null }); }
    if (e.target.closest('#radio-lim-quitar')) guardarLimite(null);
  });
  $('#radio-cuerpo').addEventListener('submit', e => { if (e.target.id === 'radio-lim-form') { e.preventDefault(); guardarLimite($('#radio-lim').value); } });
  // --- seguimiento
  $('#seg-radar').addEventListener('click', clicSeguimientoRadar);
  $('#seg-radar').addEventListener('change', e => { if (e.target.id === 'seg-ref') { ctx.store.setItem(CLAVE_REF, e.target.value); pintarSeguimientoRadar(); $('#seg-ref')?.focus(); } });
  $('#seg-escenarios').addEventListener('click', () => {});
  $('#seg-filtro').addEventListener('change', pintarSeguimientoEscenarios);
  // --- laboratorio
  const lab = $('#lab-cuerpo');
  lab.addEventListener('submit', onLabSubmit);
  lab.addEventListener('change', onLabCambio);
  lab.addEventListener('input', e => { if (e.target.closest('#lab-form')) invalidarResultado(); });
  lab.addEventListener('click', onLabClic);
  // --- ficha
  $('#fi-cuerpo').addEventListener('click', onFichaClic);
  $('#fi-cuerpo').addEventListener('change', e => { if (e.target.id === 'fir-cartera') { ctx.store.setItem(CLAVE_REF, e.target.value); pintarFichaRadar(LAB.fichaActivo); $('#fir-cartera')?.focus(); } });
}

// =============== origen de los datos (nada se atribuye a la SEC sin verificar) ===============
export async function cargarOrigenDatos() {
  try { LAB.datos = await x().getJson('/datos'); } catch { LAB.datos = null; }
  aplicarOrigen();
}
export function origenDatos() {
  const d = LAB.datos, fmt = x().fmtFecha;
  if (d?.origen === 'sec') return { nivel: 'real', corto: `Fuente: SEC EDGAR (informes anuales 10-K). ${d.actualizado_en ? 'Datos actualizados el ' + fmt(d.actualizado_en) + '.' : 'La fecha de actualización de los datos no está disponible.'}` };
  if (d?.origen === 'prueba') return { nivel: 'ficticio', corto: 'Datos de PRUEBA ficticios: no son cifras reales de ninguna empresa ni proceden de la SEC.' };
  if (d?.origen === 'demo') return { nivel: 'ficticio', corto: 'Datos de DEMOSTRACIÓN inventados: no son cifras reales de ninguna empresa ni proceden de la SEC.' };
  return { nivel: 'desconocido', corto: 'Origen de los datos sin verificar: no se atribuye a ninguna fuente.' };
}
function aplicarOrigen() {
  const o = origenDatos(), { $, $$ } = x();
  const av = $('#aviso-datos'); av.hidden = false; av.textContent = o.corto; av.className = 'aviso-datos ' + o.nivel;
  $$('[data-origen]').forEach(e => { e.textContent = o.nivel === 'real' ? o.corto : o.corto; });
}

// =============== radar ===============
export const cargarRadar = () => LAB.alm.radar.cargar().catch(() => []);
export const enRadar = t => LAB.alm.radar.tiene(t);
export const migrarRadarLocal = () => LAB.alm.radar.migrarLocal().catch(() => 0);

// Carteras que sirven de referencia: las guardadas (con sesión) o el borrador de este dispositivo (sin sesión).
async function cargarCarteras() {
  const { api, logged, leerBorrador } = x();
  if (logged()) { try { LAB.carteras = (await api('/portfolios')).map(c => ({ id: c.id, nombre: c.nombre, pos: c.posiciones, revision: c.revision, limite: c.limite_peso, publico: !!c.publico, guardada: true })); } catch { LAB.carteras = []; } }
  else { const d = leerBorrador(); LAB.carteras = d?.pos?.length ? [{ id: null, nombre: 'Tu borrador (sin guardar)', pos: d.pos.map(p => ({ ticker: p.ticker, peso: p.peso })), revision: null, limite: null, guardada: false }] : []; }
  return LAB.carteras;
}
function carteraRef() {
  const id = x().store.getItem(CLAVE_REF), l = LAB.carteras;
  return l.find(c => String(c.id) === id) || l.find(c => c.id === x().editor().current?.id && c.id != null) || l[0] || null;
}
const opcionesCartera = (sel) => LAB.carteras.map(c => `<option value="${c.id ?? 'borrador'}"${c === sel ? ' selected' : ''}>${x().esc(c.nombre)}</option>`).join('');
function textoEnCartera(t, c) { // «ya figura DIRECTAMENTE»: no se miran las posiciones internas de los fondos
  if (!c) return 'Aún no tienes una cartera de referencia.';
  const p = c.pos.find(q => q.ticker === t);
  return p ? `En «${c.nombre}» ya figura directamente con el ${P(p.peso)}.` : `En «${c.nombre}» no figura directamente. (No se analizan las posiciones internas de los fondos: un fondo podría contenerla.)`;
}

// =============== radiografía (editor) ===============
function frase(r) {
  if (r.estado === 'vacia') return 'Esta cartera aún no tiene posiciones.';
  const partes = [`La mayor posición es ${r.mayor.ticker} (${P(r.mayor.peso)}).`, r.top3.completo ? `Las tres mayores suman el ${P(r.top3.peso)}.` : `Solo ${r.top3.n === 1 ? 'hay 1 posición' : 'hay ' + r.top3.n + ' posiciones'}: suman el ${P(r.top3.peso)}.`];
  if (r.estado === 'incompleta') partes.push(`Está asignado el ${P(r.total)}; falta asignar el ${P(r.pendiente)}.`);
  if (r.estado === 'exceso') partes.push(`Los pesos suman el ${P(r.total)}: hay un exceso del ${P(r.exceso)}.`);
  return partes.join(' ');
}
export function pintarRadiografia() {
  const { $, esc, logged } = x(), ed = x().editor(), cont = $('#radio-cuerpo');
  if (!ed.current) { cont.innerHTML = ''; return; }
  if (cont.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return; // no se repinta mientras se escribe el límite
  const id = ed.current.id, guardable = logged() && !!id;
  if (LAB.radioCartera !== id) { LAB.radioCartera = id; LAB.radioModo = null; }
  const dirty = guardable && ed.dirty, modo = !guardable ? 'local' : dirty ? (LAB.radioModo || 'local') : 'guardada';
  const posiciones = modo === 'guardada' ? ed.posGuardada : ed.pos, lim = ed.current.limite_peso ?? null;
  const r = radiografia(posiciones, x().activos(), lim);
  const etq = !guardable ? 'tu borrador, que aún no está guardado en tu cuenta' : modo === 'guardada' ? 'la versión guardada en tu cuenta' : 'tus cambios sin guardar';
  const conmuta = dirty ? `<div class="radio-modos" role="group" aria-label="Versión que se analiza"><button type="button" class="btn btn-secundario" data-modo="local" aria-pressed="${modo === 'local'}">Con mis cambios</button><button type="button" class="btn btn-secundario" data-modo="guardada" aria-pressed="${modo === 'guardada'}">Versión guardada</button></div>` : '';
  const sup = r.superados.map(s => `<li><b>${esc(s.ticker)}</b>: esta posición supera el límite del ${P(s.limite)} que has definido (tiene el ${P(s.peso)}, ${P(s.exceso)} por encima).</li>`).join('');
  const limite = guardable
    ? `<form id="radio-lim-form" class="radio-limite"><label for="radio-lim">Límite personal por posición <span class="mut">(opcional)</span></label>
        <div class="radio-lim-fila"><input id="radio-lim" inputmode="decimal" autocomplete="off" value="${lim == null ? '' : String(lim).replace('.', ',')}" aria-describedby="radio-lim-ayuda"><span aria-hidden="true">%</span>
        <button class="btn btn-secundario" type="submit">${lim == null ? 'Definir' : 'Cambiar'}</button>${lim == null ? '' : '<button class="btn btn-ghost" type="button" id="radio-lim-quitar">Quitar</button>'}</div>
        <p id="radio-lim-ayuda" class="mut peq">Una referencia tuya, no un consejo: Klever no impone ningún umbral. ${lim == null ? 'Sin límite definido.' : ''}</p><p id="radio-lim-error" class="error peq" role="alert"></p></form>`
    : '<p class="mut peq">Podrás definir un límite personal por posición cuando guardes la cartera en tu cuenta.</p>';
  const cobertura = [];
  if (r.cobertura.sinCategoria.length) cobertura.push(`${r.cobertura.sinCategoria.length} ${r.cobertura.sinCategoria.length === 1 ? 'posición no tiene' : 'posiciones no tienen'} categoría conocida (${esc(r.cobertura.sinCategoria.join(', '))}).`);
  if (r.cobertura.fondos.length) cobertura.push(`${esc(r.cobertura.fondos.join(', '))}: ${r.cobertura.fondos.length === 1 ? 'es un fondo' : 'son fondos'} y su categoría es la comercial, no su exposición sectorial real.`);
  const html = `<p class="radio-version">Analizando: <b>${etq}</b>.</p>${conmuta}
    <p class="radio-concl">${esc(frase(r))}</p>
    ${r.estado === 'vacia' ? '' : `<dl class="radio-datos"><div><dt>Mayor posición</dt><dd>${esc(r.mayor.ticker)} · ${P(r.mayor.peso)}</dd></div>
      <div><dt>${r.top3.completo ? 'Tres mayores' : 'Mayores posiciones'}</dt><dd>${P(r.top3.peso)}${r.top3.completo ? '' : ` <small>(solo hay ${r.top3.n})</small>`}</dd></div>
      <div><dt>${r.estado === 'exceso' ? 'Exceso' : 'Sin asignar'}</dt><dd>${P(r.estado === 'exceso' ? r.exceso : r.pendiente)}</dd></div></dl>`}
    ${sup ? `<ul class="radio-sup">${sup}</ul>` : ''}${limite}
    ${cobertura.length ? `<p class="radio-cob">${cobertura.join(' ')}</p>` : ''}
    <details class="mini"><summary>Qué muestra y qué no</summary>
      <p>Muestra cuánto pesa lo más grande de tu reparto. <b>Concentración no es riesgo</b>: no mide volatilidad, pérdidas posibles ni diversificación.</p>
      <p>Las categorías de los fondos son comerciales (por ejemplo «ETF oro»), no la exposición real de lo que contienen. No se deducen países ni divisas, ni se calculan solapamientos entre fondos, porque no hay composiciones verificadas y fechadas.</p>
      <p>Una cartera incompleta se analiza tal cual: no se rellena ni se reescala al 100 %.</p></details>
    <p class="radio-acc"><button class="btn btn-secundario" type="button" id="radio-lab">Simular un cambio en el laboratorio</button></p>${dirty ? '<p class="mut peq">El laboratorio parte de la versión guardada.</p>' : ''}`;
  if (cont.dataset.sig === html) return;           // sin cambios: no se sustituye el DOM (un clic en curso no se pierde al salir el foco de un campo)
  cont.dataset.sig = html; cont.innerHTML = html;
}
async function guardarLimite(valor) {
  const { $, api, toast, toastError } = x(), ed = x().editor(), id = ed.current?.id; if (!id) return;
  const txt = valor === null ? null : String(valor).trim().replace(',', '.'), num = txt === null ? null : Number(txt);
  if (txt !== null && !(num >= 0.1 && num <= 100)) { $('#radio-lim-error').textContent = 'Escribe un número entre 0,1 y 100.'; return; }
  try { const r = await api('/portfolios/' + id + '/limite', { method: 'PUT', body: { limite: num } }); x().fijarLimite(r.limite_peso); toast(r.limite_peso == null ? 'Límite quitado' : 'Límite guardado'); }
  catch (e) { toastError(e.message); }
  pintarRadiografia();
}

// =============== ficha: radar, cartera de referencia y laboratorio ===============
export async function pintarFichaRadar(a) {
  LAB.fichaActivo = a; const { $, esc } = x(), cont = $('#fi-radar'); if (!cont || !a) return;
  if (!LAB.carteras.length) await cargarCarteras();
  const alm = LAB.alm.radar, dentro = alm.tiene(a.ticker), ref = carteraRef();
  cont.innerHTML = `<div class="fir-fila"><button class="btn ${dentro ? 'btn-secundario' : 'btn-primario'}" type="button" id="fir-toggle" aria-pressed="${dentro}">${dentro ? '★ En tu radar · Quitar' : '☆ Guardar en mi radar'}</button>
      <span class="mut peq" id="fir-estado" role="status">${dentro ? (alm.enCuenta() ? 'Guardada en tu cuenta.' : 'Guardada solo en este dispositivo.') : alm.enCuenta() ? '' : 'Sin cuenta, el radar se guarda solo en este dispositivo.'}</span></div>
    ${dentro ? `<div class="fir-nota"><label for="fir-nota">Nota privada: por qué te interesa y qué quieres investigar</label><textarea id="fir-nota" rows="2" maxlength="500">${esc(alm.nota(a.ticker))}</textarea><button class="btn btn-secundario" type="button" id="fir-nota-g">Guardar nota</button></div>` : ''}
    <div class="fir-cartera">${LAB.carteras.length ? `<label for="fir-cartera">Cartera de referencia</label><select id="fir-cartera">${opcionesCartera(ref)}</select>` : ''}<p class="peq" id="fir-en">${esc(textoEnCartera(a.ticker, ref))}</p></div>
    <p><button class="btn btn-secundario" type="button" id="fir-sim"${ref ? '' : ' disabled'}>Simular su incorporación en el laboratorio</button>${ref ? '' : '<span class="mut peq"> Necesitas una cartera (o un borrador) como base.</span>'}</p>`;
}
async function onFichaClic(e) {
  const { $, toast, toastError } = x(), a = LAB.fichaActivo; if (!a) return;
  const alm = LAB.alm.radar;
  try {
    if (e.target.closest('#fir-toggle')) {
      if (alm.tiene(a.ticker)) { await alm.quitar(a.ticker); toast('Quitada de tu radar'); } else { const r = await alm.guardar(a.ticker); toast(r.local ? 'Guardada en el radar de este dispositivo' : 'Guardada en tu radar'); }
      await pintarFichaRadar(a); $('#fir-toggle')?.focus(); actualizarMarcasRadar();
    } else if (e.target.closest('#fir-nota-g')) { await alm.guardar(a.ticker, $('#fir-nota').value); toast('Nota guardada'); await pintarFichaRadar(a); $('#fir-nota')?.focus(); }
    else if (e.target.closest('#fir-sim')) { const ref = carteraRef(); $('#dlg-ficha').close(); abrirLab({ carteraId: ref?.id ?? null, ticker: a.ticker }); }
  } catch (err) { toastError(err.message); }
}
let marcasPend = false;
export function actualizarMarcasRadar() { if (!marcasPend) { marcasPend = true; queueMicrotask(() => { marcasPend = false; x().refrescarEmpresas?.(); }); } }

// =============== mi seguimiento ===============
export async function mostrarSeguimiento() {
  const { $, logged } = x();
  $('#seg-aviso').hidden = logged();
  $('#seg-aviso').innerHTML = logged() ? '' : '<b>Estás sin cuenta.</b> Tu radar se guarda solo en este dispositivo y pasará a tu cuenta cuando entres. Los escenarios se guardan en tu cuenta: entra para conservarlos.';
  await Promise.all([cargarCarteras(), cargarRadar()]);
  pintarSeguimientoRadar();
  await pintarSeguimientoEscenarios();
}
function pintarSeguimientoRadar() {
  const { $, esc } = x(), alm = LAB.alm.radar, filas = alm.todos(), ref = carteraRef();
  $('#seg-radar-n').textContent = filas.length ? `(${filas.length})` : '';
  if (!filas.length) { $('#seg-radar').innerHTML = '<div class="vacio-util"><p><b>Aún no has guardado ninguna empresa.</b></p><p class="mut">Abre la ficha de una empresa en «Explorar empresas» y pulsa «Guardar en mi radar». Podrás añadir una nota con lo que quieres investigar.</p><p><a class="btn btn-primario" href="#empresas">Explorar empresas</a></p></div>'; return; }
  const cab = LAB.carteras.length ? `<div class="seg-ref"><label for="seg-ref">Cartera de referencia</label><select id="seg-ref">${opcionesCartera(ref)}</select></div>` : '';
  $('#seg-radar').innerHTML = cab + filas.map(f => `<article class="seg-item" data-t="${esc(f.ticker)}">
      <header><b>${esc(f.nombre)}</b> <span class="simbolo">${esc(f.ticker)}</span> <span class="mut">${esc(f.sector || '')}</span></header>
      <label for="nota-${esc(f.ticker)}">Nota privada: por qué te interesa y qué quieres investigar</label>
      <textarea id="nota-${esc(f.ticker)}" rows="2" maxlength="500">${esc(f.nota || '')}</textarea>
      <p class="peq" data-en>${esc(textoEnCartera(f.ticker, ref))}</p>
      <div class="seg-acc"><button class="btn btn-secundario" type="button" data-acc="nota">Guardar nota</button><button class="btn btn-secundario" type="button" data-acc="ficha">Ver ficha<span class="sr"> de ${esc(f.nombre)}</span></button>
      <button class="btn btn-secundario" type="button" data-acc="sim"${ref ? '' : ' disabled'}>Simular en el laboratorio</button><button class="btn btn-ghost" type="button" data-acc="quitar">Quitar del radar<span class="sr"> ${esc(f.nombre)}</span></button></div></article>`).join('');
}
async function clicSeguimientoRadar(e) {
  const { $, toast, toastError } = x(), b = e.target.closest('[data-acc]'); if (!b) return;
  const art = b.closest('.seg-item'), t = art.dataset.t, alm = LAB.alm.radar;
  try {
    if (b.dataset.acc === 'ficha') x().verFicha(t);
    else if (b.dataset.acc === 'sim') abrirLab({ carteraId: carteraRef()?.id ?? null, ticker: t });
    else if (b.dataset.acc === 'nota') { await alm.guardar(t, art.querySelector('textarea').value); toast('Nota guardada'); }
    else if (b.dataset.acc === 'quitar') {
      const sig = art.nextElementSibling?.dataset?.t || art.previousElementSibling?.dataset?.t;
      await alm.quitar(t); toast('Quitada de tu radar'); pintarSeguimientoRadar(); (sig ? $(`.seg-item[data-t="${sig}"] [data-acc="ficha"]`) : $('#seg-radar a, #seg-radar button'))?.focus();
    }
  } catch (err) { toastError(err.message); }
}
async function pintarSeguimientoEscenarios() {
  const { $, esc, logged, fmtFecha } = x(), cont = $('#seg-escenarios');
  if (!logged()) { $('#seg-esc-n').textContent = ''; cont.innerHTML = '<div class="vacio-util"><p><b>Los escenarios se guardan en tu cuenta.</b></p><p class="mut">Puedes simular sin cuenta en el laboratorio, pero para conservar un escenario y volver a él tienes que entrar.</p><p><a class="btn btn-secundario" href="#laboratorio">Ir al laboratorio</a></p></div>'; return; }
  cont.innerHTML = '<p class="mut">Cargando tus escenarios…</p>';
  let lista; try { lista = await LAB.alm.escenarios.listar(); } catch (e) { cont.innerHTML = `<p class="estado-lista">${esc(e.message)} <button class="enlace" type="button" id="seg-reintentar">Reintentar</button></p>`; $('#seg-reintentar').onclick = pintarSeguimientoEscenarios; return; }
  LAB.listaEsc = lista; const f = $('#seg-filtro').value;
  const vistos = lista.filter(e => f === 'todos' || (f === 'activos' ? e.estado === 'en_estudio' : e.estado === f));
  $('#seg-esc-n').textContent = lista.length ? `(${lista.length})` : '';
  if (!lista.length) { cont.innerHTML = '<div class="vacio-util"><p><b>Aún no has guardado ningún escenario.</b></p><p class="mut">En el laboratorio compara cómo cambiaría una cartera antes de tocarla y guarda el escenario con una nota.</p><p><a class="btn btn-primario" href="#laboratorio">Abrir el laboratorio</a></p></div>'; return; }
  cont.innerHTML = vistos.length ? vistos.map(e => `<article class="esc-item"><header><b>${esc(e.nombre)}</b> <span class="chip sim">Simulación</span> <span class="chip">${ESTADOS[e.estado]}</span></header>
      <p>${esc(e.ticker)} al ${P(e.peso_objetivo)} · ${METODOS[e.metodo]}</p>
      <p class="mut peq">Cartera «${esc(e.cartera_nombre)}» (revisión ${e.base_revision}) · creado el ${esc(fmtFecha(e.creado_en))}</p>
      ${!e.cartera_existe ? '<p class="chip aviso">La cartera original ya no existe</p>' : e.hay_version_posterior ? '<p class="chip aviso">Hay una versión posterior de la cartera</p>' : ''}
      ${e.nota ? `<p class="esc-nota">${esc(e.nota.length > 140 ? e.nota.slice(0, 140) + '…' : e.nota)}</p>` : ''}
      <p><a class="btn btn-secundario" href="#escenario-${e.id}">Abrir<span class="sr"> ${esc(e.nombre)}</span></a></p></article>`).join('') : '<p class="mut">No hay escenarios con ese estado.</p>';
}

// =============== laboratorio ===============
export function abrirLab({ carteraId = null, ticker = '' } = {}) {
  LAB.sim = { carteraId, ticker, peso: '', fin: '', clave: null, res: null };
  guardarEstadoLab(); x().go('#laboratorio');
}
const guardarEstadoLab = () => { try { sessionStorage.setItem(CLAVE_LAB, JSON.stringify({ carteraId: LAB.sim.carteraId, ticker: LAB.sim.ticker, peso: LAB.sim.peso, fin: LAB.sim.fin })); } catch { /* sin almacenamiento */ } };
const leerEstadoLab = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE_LAB)); } catch { return null; } };
const nombreActivo = t => x().activos()[t]?.nombre || t;

export async function mostrarLab(modo, id) {
  const { $, esc } = x(); $('#lab-cuerpo').innerHTML = '<p class="mut">Cargando…</p>';
  if (modo === 'escenario') return mostrarEscenario(id);
  await Promise.all([cargarCarteras(), cargarRadar()]);
  if (!LAB.sim) { const g = leerEstadoLab(); LAB.sim = { carteraId: g?.carteraId ?? null, ticker: g?.ticker || '', peso: g?.peso || '', fin: g?.fin || '', clave: null, res: null }; }
  pintarLabForm();
}
const baseLab = () => { const s = LAB.sim; return LAB.carteras.find(c => String(c.id) === String(s.carteraId)) || LAB.carteras[0] || null; };
const metodoTexto = fin => ({
  sin_asignar: 'El peso nuevo se toma del porcentaje que ahora no está asignado. Las demás posiciones no cambian. Si no hay suficiente, este método no se puede usar.',
  proporcional: 'Las demás posiciones bajan todas en la misma proporción para liberar el porcentaje necesario: cada una se multiplica por (lo que deben sumar) / (lo que suman ahora). Se redondea a una décima repartiendo las décimas sobrantes por mayor resto (empate: orden de símbolo). Si el peso nuevo es menor que el actual, lo liberado queda sin asignar: no se reparte al alza.',
}[fin] || 'Elige cómo se financia el cambio y verás aquí cómo se calcula, antes de simular.');
function pintarLabForm() {
  const { $, esc, logged } = x(), s = LAB.sim, base = baseLab(), alm = LAB.alm.radar;
  if (!base) { $('#lab-cuerpo').innerHTML = `${cabLab()}<div class="vacio-util"><p><b>Necesitas una cartera como base.</b></p><p class="mut">El laboratorio compara el reparto de una cartera antes y después de un cambio. ${logged() ? 'Crea una cartera en «Mis carteras».' : 'Prueba una cartera (se guarda como borrador en este dispositivo) y vuelve.'}</p><p><a class="btn btn-primario" href="${logged() ? '#carteras' : '#inicio'}">${logged() ? 'Ir a Mis carteras' : 'Probar una cartera'}</a></p></div>`; return; }
  s.carteraId = base.id;
  const activos = x().activos(), act = s.ticker && activos[s.ticker], r = radiografia(base.pos, activos, base.limite), actual = base.pos.find(p => p.ticker === s.ticker)?.peso;
  const radar = alm.todos().map(f => `<option value="${esc(f.ticker)}">${esc(f.nombre)}</option>`).join('');
  $('#lab-cuerpo').innerHTML = `${cabLab()}
    <form id="lab-form" class="lab-form" novalidate>
      <fieldset><legend>1 · Cartera base</legend>
        <label for="lab-base">Cartera</label><select id="lab-base">${opcionesCartera(base)}</select>
        <p class="mut peq">${base.guardada ? `Versión guardada (revisión ${base.revision}).` : 'Tu borrador de este dispositivo, sin guardar.'} ${r.n} ${r.n === 1 ? 'posición' : 'posiciones'} · asignado ${P(r.total)}${r.estado === 'incompleta' ? ` (falta asignar ${P(r.pendiente)})` : r.estado === 'exceso' ? ` (exceso de ${P(r.exceso)})` : ''}. El laboratorio parte siempre de lo guardado, no de cambios sin guardar.</p></fieldset>
      <fieldset><legend>2 · Activo y peso</legend>
        <label for="lab-ticker">Activo (símbolo o nombre)</label><input id="lab-ticker" list="lab-activos" autocomplete="off" value="${esc(s.ticker)}" placeholder="Por ejemplo: KO"><datalist id="lab-activos">${Object.values(activos).map(a => `<option value="${esc(a.ticker)}">${esc(a.nombre)}</option>`).join('')}</datalist>
        ${radar ? `<label for="lab-radar">…o elige uno de tu radar</label><select id="lab-radar"><option value="">—</option>${radar}</select>` : ''}
        <p class="peq" id="lab-activo-info">${act ? `${esc(act.nombre)}${actual != null ? ` · ya figura con el ${P(actual)}` : ' · no figura directamente en la cartera'}` : ''}</p>
        <label for="lab-peso">Peso propuesto (%)</label><input id="lab-peso" inputmode="decimal" autocomplete="off" value="${esc(String(s.peso).replace('.', ','))}" placeholder="Por ejemplo: 10"></fieldset>
      <fieldset><legend>3 · Cómo se financia</legend>
        ${Object.entries(FINANCIACIONES).map(([k, v]) => `<label class="radio-op"><input type="radio" name="lab-fin" value="${k}"${s.fin === k ? ' checked' : ''}> ${v}${k === 'sin_asignar' ? ` <span class="mut">(ahora hay ${P(r.pendiente)} sin asignar)</span>` : ''}</label>`).join('')}
        <div class="lab-metodo" id="lab-metodo" aria-live="polite"><b>Cómo se calcula:</b> ${esc(metodoTexto(s.fin))}</div></fieldset>
      <p class="mut peq">Trabaja con porcentajes: no usa precios, rentabilidades esperadas, costes ni impuestos, y no es una recomendación.</p>
      <p><button class="btn btn-primario" type="submit">Simular</button></p><p id="lab-error" class="error" role="alert"></p>
    </form><div id="lab-res" aria-live="polite"></div>`;
  if (s.res) pintarResultado();
}
const cabLab = (extra = '') => `<div class="pag-cab"><h1>Laboratorio <span class="chip sim">Simulación</span></h1><p class="mut">Compara cómo cambiaría el reparto de una cartera antes de tocarla. ${extra}Nada de lo que hagas aquí cambia tu cartera, ni su versión pública, ni ejecuta operaciones.</p></div>`;
function leerFormulario() {
  const { $ } = x(), fin = document.querySelector('input[name="lab-fin"]:checked')?.value || '';
  const t = $('#lab-ticker').value.trim().toUpperCase(), peso = $('#lab-peso').value.trim().replace(',', '.');
  Object.assign(LAB.sim, { ticker: t, peso, fin }); guardarEstadoLab(); return { t, peso: Number(peso), fin };
}
function invalidarResultado() { if (LAB.sim) { LAB.sim.res = null; LAB.sim.clave = null; } const r = x().$('#lab-res'); if (r) r.innerHTML = ''; }
function onLabCambio(e) {
  const { $, esc } = x(), id = e.target.id;
  if (id === 'lab-base') { LAB.sim.carteraId = e.target.value === 'borrador' ? null : Number(e.target.value); invalidarResultado(); pintarLabForm(); $('#lab-base').focus(); }
  else if (id === 'lab-radar' && e.target.value) { LAB.sim.ticker = e.target.value; invalidarResultado(); leerCampos(); pintarLabForm(); $('#lab-peso').focus(); }
  else if (e.target.name === 'lab-fin') { invalidarResultado(); $('#lab-metodo').innerHTML = `<b>Cómo se calcula:</b> ${esc(metodoTexto(e.target.value))}`; leerFormulario(); }
  else if (id === 'lab-ticker') { leerFormulario(); const a = x().activos()[LAB.sim.ticker]; $('#lab-activo-info').textContent = a ? a.nombre : ''; }
}
function leerCampos() { const { $ } = x(); LAB.sim.peso = $('#lab-peso')?.value || LAB.sim.peso; }
function onLabSubmit(e) {
  if (e.target.id === 'lab-form') { e.preventDefault(); simularAhora(); }
  else if (e.target.id === 'lab-guardar') { e.preventDefault(); guardarEscenario(); }
  else if (e.target.id === 'esc-form') { e.preventDefault(); guardarCambiosEscenario(); }
}
function simularAhora() {
  const { $ } = x(), f = leerFormulario(), base = baseLab(), err = $('#lab-error'); err.textContent = '';
  if (!x().activos()[f.t]) { err.textContent = 'Elige un activo del universo (símbolo o nombre).'; $('#lab-ticker').focus(); return; }
  if (!f.fin) { err.textContent = 'Elige cómo se financia el cambio.'; return; }
  const sim = simular(base.pos, { ticker: f.t, peso: f.peso }, f.fin);
  LAB.sim.res = sim; LAB.sim.clave = null; pintarResultado();
  if (!sim.viable) $('#lab-res').scrollIntoView({ block: 'nearest' });
  $('#lab-res').querySelector('h2')?.focus();
}
const dpts = d => d === 0 ? 'sin cambio' : (d > 0 ? '+' : '−') + String(Math.abs(d)).replace('.', ',') + '<span class="u"> puntos</span>'; // en móvil «puntos» solo para lectores (la cabecera lo dice)
function htmlComparacion(c, cambios, limiteTxt) {
  const { esc } = x(), A = c.antes, D = c.despues, a = x().activos();
  const fila = (n, va, vd) => `<tr><th scope="row">${n}</th><td>${va}</td><td>${vd}</td></tr>`;
  return `<h3>Pesos por posición</h3><div class="tabla-h" role="region" aria-label="Pesos antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Posición</th><th scope="col">Antes</th><th scope="col">Después</th><th scope="col">Cambio <small class="mut">(puntos)</small></th></tr></thead><tbody>
      ${cambios.map(f => `<tr><th scope="row"><b>${esc(f.ticker)}</b> <small>${esc(a[f.ticker]?.nombre || '')}</small>${f.nueva ? ' <span class="chip">nueva</span>' : ''}</th><td>${P(f.antes)}</td><td>${P(f.despues)}</td><td>${dpts(f.delta)}</td></tr>`).join('')}
      <tr class="tot"><th scope="row">Total asignado</th><td>${P(A.total)}</td><td>${P(D.total)}</td><td>${dpts(Math.round((D.total - A.total) * 10) / 10)}</td></tr></tbody></table></div>
    <h3>Concentración</h3><div class="tabla-h" role="region" aria-label="Concentración antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Medida</th><th scope="col">Antes</th><th scope="col">Después</th></tr></thead><tbody>
      ${fila('Mayor posición', A.mayor ? `${esc(A.mayor.ticker)} · ${P(A.mayor.peso)}` : '—', D.mayor ? `${esc(D.mayor.ticker)} · ${P(D.mayor.peso)}` : '—')}
      ${fila(A.top3.completo && D.top3.completo ? 'Tres mayores' : 'Mayores posiciones (hasta tres)', P(A.top3.peso) + (A.top3.completo ? '' : ` (hay ${A.top3.n})`), P(D.top3.peso) + (D.top3.completo ? '' : ` (hay ${D.top3.n})`))}
      ${fila('Sin asignar', P(A.pendiente), P(D.pendiente))}${A.exceso || D.exceso ? fila('Exceso', P(A.exceso), P(D.exceso)) : ''}</tbody></table></div>
    <h3>Categorías disponibles <small class="mut">(comerciales; no son la exposición real de los fondos)</small></h3><div class="tabla-h" role="region" aria-label="Categorías antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Categoría</th><th scope="col">Antes</th><th scope="col">Después</th></tr></thead><tbody>
      ${c.categorias.map(k => fila(esc(k.categoria), P(k.antes), P(k.despues))).join('')}</tbody></table></div>
    <h3>Tu límite personal</h3>${limiteTxt}`;
}
function limitesHtml(c, limite) {
  const { esc } = x();
  if (limite == null) return '<p class="mut">No has definido un límite personal en esta cartera, así que no hay nada que comparar. Puedes definirlo en la radiografía del editor.</p>';
  const L = [`<p class="mut peq">Límite definido: ${P(limite)} por posición.</p>`];
  c.limites.nuevos.forEach(s => L.push(`<p><b>${esc(s.ticker)}</b>: tras el cambio supera el límite del ${P(s.limite)} que has definido (${P(s.peso)}).</p>`));
  c.limites.siguen.forEach(s => L.push(`<p><b>${esc(s.ticker)}</b>: sigue superando el límite del ${P(s.limite)} (${P(s.peso)}).</p>`));
  c.limites.resueltos.forEach(s => L.push(`<p><b>${esc(s.ticker)}</b>: dejaría de superar el límite del ${P(s.limite)} (antes ${P(s.peso)}).</p>`));
  if (L.length === 1) L.push('<p>Ninguna posición supera el límite, ni antes ni después.</p>');
  return L.join('');
}
function pintarResultado() {
  const { $, esc, logged } = x(), s = LAB.sim, sim = s.res, base = baseLab(), cont = $('#lab-res'); if (!sim) { cont.innerHTML = ''; return; }
  if (!sim.viable) { cont.innerHTML = `<section class="lab-res inviable"><h2 tabindex="-1">No se puede simular</h2><p>${esc(sim.motivo)}</p></section>`; return; }
  const activos = x().activos(), c = comparar(sim.antes, sim.despues, activos, base.limite), n = sim.cambios.filter(f => f.delta !== 0).length;
  const concl = `${esc(sim.ticker)} pasaría del ${P(sim.cambios.find(f => f.ticker === sim.ticker).antes)} al ${P(sim.cambios.find(f => f.ticker === sim.ticker).despues)} ${METODOS[sim.financiacion]}. ${n} ${n === 1 ? 'posición cambia' : 'posiciones cambian'}; sin asignar: ${P(c.antes.pendiente)} → ${P(c.despues.pendiente)}.`;
  const guardar = logged() && base.guardada
    ? `<form id="lab-guardar" class="lab-guardar"><h3>Guardar este escenario</h3><p class="mut peq">Se guarda en tu seguimiento como simulación privada. No cambia tu cartera ni su versión pública.</p>
        <label for="lab-nombre">Nombre</label><input id="lab-nombre" maxlength="80" required value="${esc(`${sim.ticker} al ${String(s.peso).replace('.', ',')} % (${sim.financiacion === 'proporcional' ? 'proporcional' : 'sin asignar'})`)}">
        <label for="lab-nota">Nota <span class="mut">(por qué lo pruebas, qué quieres revisar)</span></label><textarea id="lab-nota" rows="3" maxlength="600"></textarea>
        <p><button class="btn btn-primario" type="submit" id="lab-guardar-btn">Guardar escenario</button></p><p class="error" id="lab-guardar-error" role="alert"></p></form>`
    : `<div class="lab-guardar"><h3>Guardar este escenario</h3><p>${logged() ? 'Guarda primero la cartera en tu cuenta para poder conservar escenarios sobre ella.' : 'Estás sin cuenta: esta simulación es temporal y se perderá al cerrar la página. Entra para guardar escenarios en tu seguimiento (vuelve a simular con tu cartera guardada).'}</p>${logged() ? '' : '<p><button class="btn btn-secundario" type="button" id="lab-entrar">Entrar para guardar</button></p>'}</div>`;
  cont.innerHTML = `<section class="lab-res"><h2 tabindex="-1">Resultado <span class="chip sim">Simulación</span></h2><p class="lab-concl">${concl}</p>
    ${htmlComparacion(c, sim.cambios, limitesHtml(c, base.limite))}
    <details class="mini"><summary>Ver los pasos del cálculo</summary><ol>${sim.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></details>${guardar}</section>`;
}
async function guardarEscenario() {
  const { $, toast, toastError } = x(), s = LAB.sim, sim = s.res, base = baseLab(), btn = $('#lab-guardar-btn'), err = $('#lab-guardar-error'); err.textContent = '';
  if (!sim?.viable || !base?.guardada) return;
  s.clave = s.clave || LAB.alm.escenarios.nuevaClave();                 // el mismo intento reutiliza la clave: un reintento no duplica
  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const r = await LAB.alm.escenarios.crear({ clave: s.clave, nombre: $('#lab-nombre').value, nota: $('#lab-nota').value, cartera_id: base.id, base_revision: base.revision, ticker: sim.ticker, peso: Number(s.peso), financiacion: sim.financiacion, propuesta: sim.despues });
    toast(r.duplicado ? 'Ese escenario ya estaba guardado' : 'Escenario guardado en tu seguimiento'); x().go('#escenario-' + r.id);
  } catch (e) {
    if (e.status === 409) { err.textContent = 'La cartera cambió después de la versión que simulaste. Se ha actualizado la base: vuelve a simular.'; await cargarCarteras(); s.res = null; s.clave = null; pintarLabForm(); return; }
    err.textContent = e.message + ' Tus datos siguen aquí: puedes reintentar.'; toastError(e.message);
  } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = 'Guardar escenario'; } }
}
function onLabClic(e) {
  if (e.target.closest('#lab-entrar')) x().abrirAcceso('guardar');
  else if (e.target.closest('#esc-descartar')) descartarEscenario();
}

// =============== escenario guardado: se muestra TAL COMO SE GUARDÓ ===============
function cambiosEntre(base, prop) {
  const a = new Map(base.map(p => [p.ticker, p.peso])), d = new Map(prop.map(p => [p.ticker, p.peso]));
  return [...new Set([...a.keys(), ...d.keys()])].map(t => ({ ticker: t, antes: a.get(t) || 0, despues: d.get(t) || 0, delta: Math.round(((d.get(t) || 0) - (a.get(t) || 0)) * 10) / 10, nueva: !a.has(t) }))
    .sort((p, q) => q.despues - p.despues || (p.ticker < q.ticker ? -1 : 1));
}
async function mostrarEscenario(id) {
  const { $, esc, go, logged, fmtFechaHora } = x();
  if (!logged()) { go('#seguimiento'); return; }
  let e; try { e = await LAB.alm.escenarios.leer(id); } catch (err) { $('#lab-cuerpo').innerHTML = `${cabLab()}<p class="estado-lista">${esc(err.status === 404 ? 'No encontramos ese escenario (puede que lo hayas descartado).' : err.message)}</p><p><a class="btn btn-secundario" href="#seguimiento">Volver a mi seguimiento</a></p>`; return; }
  LAB.esc = e; await cargarCarteras();
  const viva = LAB.carteras.find(c => c.id === e.cartera_id), activos = x().activos();
  const c = comparar(e.base, e.propuesta, activos, viva?.limite ?? null);
  const aviso = !e.cartera_existe ? `<p class="aviso-panel"><b>La cartera original ya no existe.</b> Este escenario conserva su copia de la base.</p>`
    : e.hay_version_posterior ? `<div class="aviso-panel"><div><b>La cartera cambió después de este escenario</b> (revisión ${e.base_revision} → ${e.revision_actual}). El escenario conserva la base con la que se simuló y no se recalcula. <a href="#cartera-${e.cartera_id}">Abrir la cartera</a>. Si quieres, simula de nuevo con su versión actual.</div></div>` : '';
  $('#lab-cuerpo').innerHTML = `<div class="pag-cab"><p><a class="enlace" href="#seguimiento">← Mi seguimiento</a></p><h1>${esc(e.nombre)} <span class="chip sim">Simulación</span></h1>
      <p class="mut">${esc(e.ticker)} al ${P(e.peso_objetivo)} ${METODOS[e.metodo]}. Cartera «${esc(e.cartera_nombre)}», revisión ${e.base_revision}. Creado el ${esc(fmtFechaHora(e.creado_en))}. Es una simulación: no ejecuta operaciones ni cambia la cartera.</p></div>${aviso}
    <form id="esc-form" class="lab-guardar"><label for="esc-nombre">Nombre</label><input id="esc-nombre" maxlength="80" required value="${esc(e.nombre)}">
      <label for="esc-estado">Estado</label><select id="esc-estado">${Object.entries(ESTADOS).map(([k, v]) => `<option value="${k}"${e.estado === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
      <label for="esc-nota">Nota</label><textarea id="esc-nota" rows="3" maxlength="600">${esc(e.nota)}</textarea>
      <p class="fila"><button class="btn btn-primario" type="submit" id="esc-guardar">Guardar cambios</button><button class="btn btn-ghost peligro" type="button" id="esc-descartar">Descartar escenario</button></p><p class="error" id="esc-error" role="alert"></p></form>
    <section class="lab-res"><h2>Comparación guardada</h2>${htmlComparacion(c, cambiosEntre(e.base, e.propuesta), viva?.limite == null ? '<p class="mut">La cartera no tiene un límite personal definido ahora.</p>' : `<p class="mut peq">Con el límite que tiene ahora la cartera (${P(viva.limite)}).</p>${limitesHtml(c, viva.limite)}`)}
      <details class="mini"><summary>Composición guardada</summary><p class="peq">Base: ${esc(e.base.map(p => `${p.ticker} ${p.peso} %`).join(' · ') || 'vacía')}.</p><p class="peq">Propuesta: ${esc(e.propuesta.map(p => `${p.ticker} ${p.peso} %`).join(' · '))}.</p></details></section>`;
}
async function guardarCambiosEscenario() {
  const { $, toast, toastError } = x(), e = LAB.esc, btn = $('#esc-guardar'), err = $('#esc-error'); err.textContent = ''; btn.disabled = true;
  try { LAB.esc = await LAB.alm.escenarios.actualizar(e.id, { nombre: $('#esc-nombre').value, nota: $('#esc-nota').value, estado: $('#esc-estado').value, revision: e.revision }); toast('Cambios guardados'); }
  catch (er) { err.textContent = er.status === 409 ? 'Este escenario cambió en otra pestaña o dispositivo. Recarga para ver la versión actual.' : er.message; toastError(err.textContent); }
  finally { btn.disabled = false; }
}
async function descartarEscenario() {
  const { toast, toastError, go } = x(), e = LAB.esc;
  if (!window.confirm(`¿Descartar el escenario «${e.nombre}»? Se borra del todo; tu cartera no cambia.`)) return;
  try { await LAB.alm.escenarios.borrar(e.id); toast('Escenario descartado'); go('#seguimiento'); } catch (er) { toastError(er.message); }
}
