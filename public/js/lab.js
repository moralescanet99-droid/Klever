// Presentación de «Mi cartera» (radiografía), «Mi radar», «Mi laboratorio» y «Mi seguimiento». Los cálculos viven en calculos.js; el almacenamiento, en almacen.js.
// app.js le pasa sus utilidades (DOM, API, sesión, ficha…) por un contexto: este módulo no conoce el resto del estado de la aplicación.
// Privacidad: `limpiarSesionLab()` (al salir o caducar la sesión) vacía memoria y pantalla e invalida toda respuesta aún en vuelo (`LAB.gen`).
import { radiografia, simular, comparar, origenPeso, FINANCIACIONES } from './calculos.js';
import { crearAlmacen } from './almacen.js';
import { historia, historiasDeTicker, revisionDe, ultimaTesis, fechaCorta, estadoSeguimiento, refPregunta, casoPorRef, similitudPregunta, UMBRAL_PARECIDO, SEGUIMIENTO_CASOS } from './contenido.js';
import { evaluar, resumenNota } from './nota.js';
import { htmlNotaEstructura, htmlCambioNota, htmlEvaluacionGuardada } from './nota-ui.js';
import { nuevoIntento, enviarIntento, actualizarVista, mismoContenido } from './revisiones.js';

const LAB = { universo: null, universoError: false, ctx: null, alm: null, datos: null, carteras: [], radioModo: null, radioCartera: null, sim: null, esc: null, gen: 0, radarError: null, nota: null, editEsc: false, fichaActivo: null };
const CLAVE_REF = 'klever_cartera_ref', CLAVE_LAB = 'klever_lab';
const ESTADOS = { en_estudio: 'En estudio', descartado: 'Descartado', archivado: 'Archivado' };
const METODOS = { sin_asignar: 'usando el porcentaje sin asignar', proporcional: 'reduciendo proporcionalmente las otras posiciones' };
// Cartera de ejemplo para quien aún no tiene ninguna (visitante sin borrador o cuenta sin carteras). NO es de la persona y se rotula así.
const EJEMPLO = { id: 'ejemplo', nombre: 'Cartera de ejemplo (no es tuya)', pos: [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }], revision: null, limite: null, publico: false, guardada: false, ejemplo: true };
const x = () => LAB.ctx;
const P = v => x().pesoCorto(v);
const vigente = g => g === LAB.gen;                              // ¿sigue siendo la misma sesión que cuando se pidió esto?
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export function iniciarLab(ctx) {
  LAB.ctx = ctx;
  LAB.alm = crearAlmacen({ api: ctx.api, logged: ctx.logged, store: ctx.store, activos: ctx.activos, idSesion: ctx.idSesion });
  const $ = ctx.$;
  ctx.universo().then(u => { LAB.universo = u; pintarRadiografia(); }).catch(() => { LAB.universoError = true; pintarRadiografia(); });   // la nota usa una instantánea congelada del universo
  $('#radio-cuerpo').addEventListener('click', e => {
    const b = e.target.closest('[data-modo]'); if (b) { LAB.radioModo = b.dataset.modo; pintarRadiografia(); return; }
    if (e.target.closest('#radio-lab')) { const ed = ctx.editor(); abrirLab({ carteraId: ed.current?.id || null }); }
    if (e.target.closest('#radio-lim-quitar')) guardarLimite(null);
  });
  $('#radio-cuerpo').addEventListener('submit', e => { if (e.target.id === 'radio-lim-form') { e.preventDefault(); guardarLimite($('#radio-lim').value); } });
  $('#nota-cuerpo').addEventListener('click', e => { if (e.target.closest('#vz-probar')) { const ed = ctx.editor(); abrirLab({ carteraId: ed.current?.id || null }); } });
  $('#seg-radar').addEventListener('click', clicSeguimientoRadar);
  $('#seg-escenarios').addEventListener('click', e => { const b = e.target.closest('[data-registrar]'); if (b) { LAB.abrirRev = Number(b.dataset.registrar); ctx.go('#escenario-' + b.dataset.registrar); } });
  $('#seg-casos').addEventListener('click', e => { const b = e.target.closest('[data-caso-probar]'); if (b) abrirLab({ carteraId: 'ejemplo', ticker: b.dataset.casoProbar, historia: b.dataset.historia }); });
  $('#seg-radar').addEventListener('input', e => { if (e.target.matches('textarea') && LAB.nota) LAB.nota.texto = e.target.value; });
  $('#seg-radar').addEventListener('change', e => { if (e.target.id === 'seg-ref') { ctx.store.setItem(CLAVE_REF, e.target.value); pintarSeguimientoRadar(); $('#seg-ref')?.focus(); } });
  $('#seg-filtro').addEventListener('change', pintarSeguimientoEscenarios);
  const lab = $('#lab-cuerpo');
  lab.addEventListener('submit', onLabSubmit);
  lab.addEventListener('change', onLabCambio);
  lab.addEventListener('input', e => { if (e.target.closest('#rev-form')) guardarBorradorRev(); });
  lab.addEventListener('change', e => { if (e.target.closest('#rev-form')) guardarBorradorRev(); });
  lab.addEventListener('change', e => { if (e.target.name === 'rev-dec') { const p = $('#rev-prox'); p.disabled = e.target.value !== 'reprogramar'; if (p.disabled) p.value = ''; else p.focus(); } });
  lab.addEventListener('input', e => { if (e.target.closest('#lab-form')) invalidarResultado(); });
  const vinc = e => { const q = $; if (e.target.id === 'esc-pregunta' || e.target.id === 'esc-ref') avisoParecido(q('#esc-pregunta'), q('#esc-ref'), q('#esc-vinculo-aviso')); if (e.target.id === 'lab-pregunta' || e.target.id === 'lab-ref') avisoParecido(q('#lab-pregunta'), q('#lab-ref'), q('#lab-vinculo-aviso')); };
  lab.addEventListener('input', vinc); lab.addEventListener('change', vinc);
  lab.addEventListener('click', onLabClic);
  $('#fi-cuerpo').addEventListener('click', onFichaClic);
  $('#fi-cuerpo').addEventListener('input', e => { if (e.target.id === 'fir-nota' && LAB.nota) LAB.nota.texto = e.target.value; });
  $('#fi-cuerpo').addEventListener('change', e => { if (e.target.id === 'fir-cartera') { ctx.store.setItem(CLAVE_REF, e.target.value); pintarFichaRadar(LAB.fichaActivo); $('#fir-cartera')?.focus(); } });
}

// =============== salir / caducar la sesión: nada privado queda en memoria ni en pantalla ===============
export function limpiarSesionLab() {
  if (!LAB.ctx) return;
  LAB.gen++;                                                      // las respuestas pendientes de la sesión anterior se descartan al llegar
  LAB.alm.reiniciar();
  Object.assign(LAB, { carteras: [], radioModo: null, radioCartera: null, sim: null, esc: null, radarError: null, nota: null, editEsc: false, revIntento: null, revLectura: null, revMsg: null, revBorrador: null });   // el borrador de una revisión sobrevive solo en el dispositivo (misma cuenta al volver)
  const { $, store } = LAB.ctx;
  for (const s of ['#fi-radar', '#seg-radar', '#seg-escenarios', '#seg-casos', '#lab-cuerpo', '#radio-cuerpo', '#nota-cuerpo']) { const e = $(s); if (e) { e.innerHTML = ''; delete e.dataset.sig; } }
  const pend = $('#seg-radar-n'), pend2 = $('#seg-esc-n'); if (pend) pend.textContent = ''; if (pend2) pend2.textContent = '';
  store.removeItem(CLAVE_REF); try { sessionStorage.removeItem(CLAVE_LAB); } catch { /* sin almacenamiento */ }
  if ($('#dlg-ficha')?.open && LAB.fichaActivo) pintarFichaRadar(LAB.fichaActivo);   // la ficha abierta pasa a verse como visitante
}

// =============== origen de los datos: derivado de la procedencia de CADA dato ===============
export async function cargarOrigenDatos() {
  try { LAB.datos = await x().getJson('/datos'); } catch { LAB.datos = null; }
  aplicarOrigen();
}
export function origenDatos() {
  const d = LAB.datos, fmt = fechaCorta, g = f => d?.grupos?.find(q => q.fuente === f);
  const rango = q => q.desde && q.hasta ? (q.desde === q.hasta ? `cargadas el ${fmt(q.desde)}` : `cargadas entre el ${fmt(q.desde)} y el ${fmt(q.hasta)}`) : 'fecha de carga no disponible';
  if (d?.origen === 'sec') return { nivel: 'real', corto: `Fuente: SEC EDGAR (informes anuales 10-K) para las ${g('sec').n} empresas, ${rango(g('sec'))}.` };
  if (d?.origen === 'prueba') return { nivel: 'ficticio', corto: 'Datos de PRUEBA ficticios: no son cifras reales de ninguna empresa ni proceden de la SEC.' };
  if (d?.origen === 'demo') return { nivel: 'ficticio', corto: 'Datos de DEMOSTRACIÓN inventados: no son cifras reales de ninguna empresa ni proceden de la SEC.' };
  if (d?.origen === 'mixto') {
    const partes = [g('sec') && `${g('sec').n} con fuente SEC EDGAR (${rango(g('sec'))})`, g('prueba') && `${g('prueba').n} de prueba ficticias`, g('demo') && `${g('demo').n} de demostración inventadas`, g('sin_fuente') && `${g('sin_fuente').n} sin fuente verificada`].filter(Boolean);
    return { nivel: 'ficticio', corto: `Datos mixtos: ${partes.join('; ')}. Mira la fuente de cada ficha.` };
  }
  return { nivel: 'desconocido', corto: 'Origen de los datos sin verificar: no se atribuye a ninguna fuente.' };
}
// Procedencia de UNA ficha: la fuente y la fecha de la fila del último ejercicio, no una declaración global.
export function origenFicha(f0) {
  const p = f0?.periodo ? ` (ejercicio ${f0.periodo})` : '';
  if (f0?.fuente === 'sec') return { nivel: 'real', corto: `Fuente: SEC EDGAR, informe anual 10-K${p}. ${f0.actualizado_en ? 'Cargado el ' + fechaCorta(f0.actualizado_en) + '.' : 'La fecha de carga no está disponible.'}` };
  if (f0?.fuente === 'prueba') return { nivel: 'ficticio', corto: `Datos de PRUEBA ficticios${p}: no son cifras reales de esta empresa ni proceden de la SEC.` };
  if (f0?.fuente === 'demo') return { nivel: 'ficticio', corto: `Datos de DEMOSTRACIÓN inventados${p}: no son cifras reales de esta empresa ni proceden de la SEC.` };
  return { nivel: 'desconocido', corto: `Sin fuente verificada para estos datos${p}: no se atribuyen a ninguna fuente.` };
}
function aplicarOrigen() {
  const o = origenDatos(), { $, $$ } = x();
  const av = $('#aviso-datos'); av.hidden = false; av.textContent = o.corto; av.className = 'aviso-datos ' + o.nivel;
  $$('[data-origen]').forEach(e => { e.textContent = o.corto; });
}

// =============== radar ===============
export async function cargarRadar() {                              // true = leído bien; false = error de lectura (NO es «radar vacío»)
  const g = LAB.gen;
  try { await LAB.alm.radar.cargar(); if (vigente(g)) LAB.radarError = null; return true; }
  catch (e) { if (vigente(g)) LAB.radarError = e.message; return false; }
}
export const enRadar = t => LAB.alm.radar.tiene(t);
export const origenCodigo = () => LAB.datos?.origen ?? null;
export const migrarRadarLocal = () => LAB.alm.radar.migrarLocal().catch(() => 0);

// Carteras que sirven de referencia: las guardadas (con sesión) o el borrador de este dispositivo (sin sesión). La de ejemplo va aparte.
async function cargarCarteras() {
  const { api, logged, leerBorrador } = x(), g = LAB.gen; let lista = [];
  if (logged()) { try { lista = (await api('/portfolios')).map(c => ({ id: c.id, nombre: c.nombre, pos: c.posiciones, revision: c.revision, limite: c.limite_peso, publico: !!c.publico, guardada: true })); } catch { lista = []; } }
  else { const d = leerBorrador(); lista = d?.pos?.length ? [{ id: null, nombre: 'Tu borrador (sin guardar)', pos: d.pos.map(p => ({ ticker: p.ticker, peso: p.peso })), revision: null, limite: null, guardada: false }] : []; }
  if (!vigente(g)) return [];
  LAB.carteras = lista; return lista;
}
const basesLab = () => (LAB.carteras.length && LAB.sim?.carteraId !== 'ejemplo') ? LAB.carteras : [...LAB.carteras, EJEMPLO];
function carteraRef() {
  const id = x().store.getItem(CLAVE_REF), l = LAB.carteras;
  return l.find(c => String(c.id) === id) || l.find(c => c.id === x().editor().current?.id && c.id != null) || l[0] || null;
}
const opcionesCartera = (sel, lista = LAB.carteras) => lista.map(c => `<option value="${c.id ?? 'borrador'}"${c === sel ? ' selected' : ''}>${x().esc(c.nombre)}</option>`).join('');
function textoEnCartera(t, c) { // «ya figura DIRECTAMENTE»: no se miran las posiciones internas de los fondos
  if (!c) return 'Aún no tienes una cartera de referencia.';
  const p = c.pos.find(q => q.ticker === t);
  return p ? `En «${c.nombre}» ya figura directamente con el ${P(p.peso)}.` : `En «${c.nombre}» no figura directamente. (No se analizan las posiciones internas de los fondos: un fondo podría contenerla.)`;
}
const htmlNota = (esc, id, nota, editando, texto, err) => editando
  ? `<div class="nota-ed"><label for="${id}">Nota privada: por qué te interesa y qué quieres investigar</label><textarea id="${id}" rows="3" maxlength="500">${esc(texto)}</textarea>
      <p class="nota-acc"><button class="btn btn-primario" type="button" data-nota="guardar">${err ? 'Reintentar guardado' : 'Guardar nota'}</button><button class="btn btn-ghost" type="button" data-nota="cancelar">Cancelar</button></p>
      <p class="error peq" role="alert" data-nota-err>${esc(err || '')}</p></div>`
  : `<div class="nota-ver"><p class="nota-txt">${nota ? esc(nota) : '<span class="mut">Sin nota.</span>'}</p><button class="btn btn-secundario" type="button" data-nota="editar">${nota ? 'Editar nota' : 'Añadir nota'}</button></div>`;

// =============== radiografía (editor) ===============
function frase(r) {
  if (r.estado === 'vacia') return 'Esta cartera aún no tiene posiciones.';
  const partes = [`La mayor posición es ${r.mayor.ticker} (${P(r.mayor.peso)}).`, r.top3.completo ? `Las tres mayores suman el ${P(r.top3.peso)}.` : `Solo ${r.top3.n === 1 ? 'hay 1 posición' : 'hay ' + r.top3.n + ' posiciones'}: suman el ${P(r.top3.peso)}.`];
  if (r.estado === 'incompleta') partes.push(`Está asignado el ${P(r.total)}; falta asignar el ${P(r.pendiente)}.`);
  if (r.estado === 'exceso') partes.push(`Los pesos suman el ${P(r.total)}: hay un exceso del ${P(r.exceso)}.`);
  return partes.join(' ');
}
// «Tu cartera de un vistazo» (ronda 21): lo que SÍ se sabe aunque no haya nota global. Usa los mismos datos de la radiografía (mayor posición, tres mayores) y el tipo de instrumento del universo;
// no calcula nada nuevo. Concentración por posición ≠ exposición subyacente ni pérdida esperada; un ETF no es una empresa; una limitación de datos no convierte una cartera en mala.
function htmlVistazo(esc, r, posiciones, activos, ev) {
  const vivas = posiciones.filter(p => p.peso > 0), n = vivas.length;
  if (!n) return `<section class="vistazo" aria-labelledby="vz-t"><h3 id="vz-t">Tu cartera de un vistazo</h3><p class="mut">Todavía no hay posiciones: añade un activo y reparte para ver el resumen.</p></section>`;
  const por = {}; for (const p of vivas) { const k = activos[p.ticker]?.tipo === 'etf' ? 'ETF' : activos[p.ticker] ? 'acciones' : 'sin clasificar'; por[k] = (por[k] || 0) + p.peso; }
  const tipos = Object.entries(por).map(([k, v]) => `${k} ${P(Math.round(v * 10) / 10)}`).join(' · ');
  const ancho = v => Math.max(0, Math.min(100, Number(v) || 0));
  return `<section class="vistazo" aria-labelledby="vz-t"><h3 id="vz-t">Tu cartera de un vistazo</h3>
    <div class="vista-metricas"><div><span>Mayor posición · ${esc(r.mayor.ticker)}</span><strong>${P(r.mayor.peso)}</strong><div class="vista-track" aria-hidden="true"><i style="width:${ancho(r.mayor.peso)}%"></i></div></div>
    <div><span>${r.top3.completo ? 'Tres mayores' : `${n} ${n === 1 ? 'posición' : 'posiciones'}`}</span><strong>${P(r.top3.peso)}</strong><div class="vista-track" aria-hidden="true"><i style="width:${ancho(r.top3.peso)}%"></i></div></div></div>
    <p class="mut peq">Asignado ${P(r.total ?? 0)} · ${esc(tipos)}</p>
    <p class="mut peq">Concentración por posición; no mide pérdidas ni la composición interna de los ETF.</p>
    <p class="vistazo-acc"><button class="btn btn-secundario" type="button" id="vz-probar">Ver qué cambiaría →</button></p></section>`;
}
export function pintarRadiografia() {
  const { $, esc, logged } = x(), ed = x().editor(), cont = $('#radio-cuerpo');
  if (!ed.current) { cont.innerHTML = ''; delete cont.dataset.sig; const n0 = $('#nota-cuerpo'); if (n0) { n0.innerHTML = ''; delete n0.dataset.sig; } return; }
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
  const notaHtml = LAB.universo ? htmlNotaEstructura(esc, evaluar(posiciones, LAB.universo), origenCodigo()) : LAB.universoError ? '<p class="mut peq">La nota de estructura no está disponible ahora.</p>' : '<p class="mut peq">Calculando la nota de estructura…</p>';
  const evNota = LAB.universo ? evaluar(posiciones, LAB.universo) : null, vista = r.estado === 'vacia' ? '' : htmlVistazo(esc, r, posiciones, x().activos(), evNota);
  const html = `<p class="radio-version">Analizando: <b>${etq}</b>.</p>${conmuta}
    <p class="radio-concl">${esc(frase(r))}</p>
    ${r.estado === 'vacia' ? '' : `<dl class="radio-datos"><div><dt>Mayor posición</dt><dd>${esc(r.mayor.ticker)} · ${P(r.mayor.peso)}</dd></div>
      <div><dt>${r.top3.completo ? 'Tres mayores' : 'Mayores posiciones'}</dt><dd>${P(r.top3.peso)}${r.top3.completo ? '' : ` <small>(solo hay ${r.top3.n})</small>`}</dd></div>
      <div><dt>${r.estado === 'exceso' ? 'Exceso' : 'Sin asignar'}</dt><dd>${P(r.estado === 'exceso' ? r.exceso : r.pendiente)}</dd></div></dl>`}
    ${sup ? `<ul class="radio-sup">${sup}</ul>` : ''}${limite}
    ${cobertura.length ? `<p class="radio-cob">${cobertura.join(' ')}</p>` : ''}
    <p class="radio-nota peq mut"><b>Concentración no es riesgo:</b> no mide pérdidas posibles ni diversificación. Qué más no se calcula, en «Más sobre las categorías».</p>
    <p class="radio-acc"><button class="btn btn-secundario" type="button" id="radio-lab">Probar un cambio</button></p>${dirty ? '<p class="mut peq">El laboratorio parte de la versión guardada.</p>' : ''}`;
  const nc = $('#nota-cuerpo'), notaCompleta = vista + notaHtml; if (nc && nc.dataset.sig !== notaCompleta) { nc.dataset.sig = notaCompleta; nc.innerHTML = notaCompleta; }   // la nota tiene su propio panel
  if (cont.dataset.sig === html) return;           // sin cambios: no se sustituye el DOM (un clic en curso no se pierde al salir el foco de un campo)
  cont.dataset.sig = html; cont.innerHTML = html;
}
async function guardarLimite(valor) {
  const { $, api, toast, toastError } = x(), ed = x().editor(), id = ed.current?.id, g = LAB.gen; if (!id) return;
  const txt = valor === null ? null : String(valor).trim().replace(',', '.'), num = txt === null ? null : Number(txt);
  if (txt !== null && !(num >= 0.1 && num <= 100)) { $('#radio-lim-error').textContent = 'Escribe un número entre 0,1 y 100.'; return; }
  try { const r = await api('/portfolios/' + id + '/limite', { method: 'PUT', body: { limite: num } }); if (!vigente(g)) return; x().fijarLimite(r.limite_peso); toast(r.limite_peso == null ? 'Límite quitado' : 'Límite guardado'); }
  catch (e) { if (vigente(g)) toastError(e.message); }
  if (vigente(g)) pintarRadiografia();
}

// =============== ficha: radar, cartera de referencia y laboratorio ===============
export async function pintarFichaRadar(a) {
  LAB.fichaActivo = a; const { $, esc } = x(), cont = $('#fi-radar'), g = LAB.gen; if (!cont || !a) return;
  if (!LAB.carteras.length) await cargarCarteras();
  if (!vigente(g) || LAB.fichaActivo !== a) return;                // otra sesión u otra ficha: esta respuesta ya no vale
  const alm = LAB.alm.radar, dentro = alm.tiene(a.ticker), ref = carteraRef();
  const editando = LAB.nota?.ticker === a.ticker && LAB.nota.donde === 'ficha';
  const hist = historiasDeTicker(a.ticker);
  const radar = LAB.radarError
    ? `<div class="fir-fila"><p class="error" role="alert">${esc(LAB.radarError)}</p><button class="btn btn-secundario" type="button" id="fir-reintentar">Reintentar</button></div>`
    : `<div class="fir-fila"><button class="btn ${dentro ? 'btn-secundario' : 'btn-primario'}" type="button" id="fir-toggle" aria-pressed="${dentro}">${dentro ? '★ En tu radar · Quitar' : '☆ Guardar en mi radar'}</button>
      <span class="mut peq" id="fir-estado" role="status">${dentro ? (alm.enCuenta() ? 'Guardada en tu cuenta.' : 'Guardada solo en este dispositivo.') : alm.enCuenta() ? '' : 'Sin cuenta, el radar se guarda solo en este dispositivo.'}</span></div>
      ${dentro ? `<div class="fir-nota" data-nota-zona="ficha">${htmlNota(esc, 'fir-nota', alm.nota(a.ticker), editando, editando ? LAB.nota.texto : '', editando ? LAB.nota.err : '')}</div>` : ''}`;
  const preg = hist[0]?.pregunta ? `Pregunta que investigas: «${esc(hist[0].pregunta)}»` : '';
  cont.innerHTML = `<div class="fir-acciones">${preg ? `<p class="fir-pregunta">${preg}</p>` : ''}
      <p class="fir-botones"><button class="btn btn-primario" type="button" id="fir-sim">Probar en mi cartera</button> <button class="btn btn-secundario" type="button" id="fir-comparar">Comparar con otra empresa</button></p>
      ${LAB.carteras.length ? '' : '<p class="peq mut" id="fir-en">Si aún no tienes cartera, «Probar en mi cartera» te ofrece una de ejemplo.</p>'}</div>
    ${radar}
    ${LAB.carteras.length ? `<div class="fir-cartera"><label for="fir-cartera">Cartera de referencia</label><select id="fir-cartera">${opcionesCartera(ref)}</select><p class="peq" id="fir-en">${esc(textoEnCartera(a.ticker, ref))}</p></div>` : ''}
    ${hist.length ? `<p class="peq">Historia relacionada: ${hist.map(h => `<a href="#historia-${esc(h.id)}" data-cerrar-ficha>${esc(h.titulo)}</a>`).join(' · ')}</p>` : ''}`;
}
async function onFichaClic(e) {
  const { $, toast, toastError } = x(), a = LAB.fichaActivo, g = LAB.gen; if (!a) return;
  const alm = LAB.alm.radar, t = a.ticker;
  const err = m => { const z = $('#fi-radar [data-nota-err]'); if (z) z.textContent = m; const b = $('#fi-radar [data-nota=guardar]'); if (b) b.textContent = 'Reintentar guardado'; };
  try {
    if (e.target.closest('[data-cerrar-ficha]')) { x().cerrarFicha(); return; }
    if (e.target.closest('#fir-reintentar')) { await cargarRadar(); await pintarFichaRadar(a); return; }
    if (e.target.closest('#fir-toggle')) {
      try {
        if (alm.tiene(t)) { await alm.quitar(t); if (!vigente(g)) return; toast('Quitada de tu radar'); } else { const r = await alm.guardar(t); if (!vigente(g)) return; toast(r.local ? 'Guardada en el radar de este dispositivo' : 'Guardada en tu radar'); }
        await pintarFichaRadar(a); $('#fir-toggle')?.focus(); actualizarMarcasRadar();
      } catch (er) { const s = $('#fir-estado'); if (s) { s.textContent = 'No se ha podido guardar: ' + er.message; s.classList.add('error'); } }
      return;
    }
    const nb = e.target.closest('#fi-radar [data-nota]');
    if (nb) {
      const modo = nb.dataset.nota;
      if (modo === 'editar') { LAB.nota = { ticker: t, donde: 'ficha', texto: alm.nota(t), err: '' }; await pintarFichaRadar(a); $('#fir-nota')?.focus(); }
      else if (modo === 'cancelar') { LAB.nota = null; await pintarFichaRadar(a); $('#fi-radar [data-nota=editar]')?.focus(); }
      else if (modo === 'guardar') {
        const texto = $('#fir-nota').value; LAB.nota.texto = texto;
        try { await alm.guardar(t, texto); if (!vigente(g)) return; LAB.nota = null; toast('Nota guardada'); await pintarFichaRadar(a); $('#fi-radar [data-nota=editar]')?.focus(); }
        catch (er) { if (vigente(g)) { LAB.nota.err = 'No se ha podido guardar. ' + er.message; err(LAB.nota.err); toastError('No se ha podido guardar la nota'); } }   // el texto se conserva en pantalla y en LAB.nota
      }
      return;
    }
    if (e.target.closest('#fir-sim')) { const ref = carteraRef(); x().cerrarFicha(); abrirLab({ carteraId: ref?.id ?? null, ticker: t }); }
    if (e.target.closest('#fir-comparar')) { x().cerrarFicha(); x().go('#comparar-' + t); }
  } catch (er) { toastError(er.message); }
}
let marcasPend = false;
export function actualizarMarcasRadar() { if (!marcasPend) { marcasPend = true; queueMicrotask(() => { marcasPend = false; x().refrescarEmpresas?.(); }); } }

// =============== mi seguimiento ===============
export async function mostrarSeguimiento() {
  const { $, logged } = x(), g = LAB.gen;
  $('#seg-aviso').hidden = logged();
  $('#seg-aviso').innerHTML = logged() ? '' : '<b>Estás sin cuenta.</b> Tu radar se guarda solo en este dispositivo y pasará a tu cuenta cuando entres. Los escenarios se guardan en tu cuenta: entra para conservarlos.';
  await Promise.all([cargarCarteras(), cargarRadar()]);
  if (!vigente(g)) return;
  pintarSeguimientoRadar();
  await pintarSeguimientoEscenarios();
}
function pintarSeguimientoRadar() {
  const { $, esc } = x(), alm = LAB.alm.radar, filas = alm.todos(), ref = carteraRef();
  if (LAB.radarError) { $('#seg-radar-n').textContent = ''; $('#seg-radar').innerHTML = `<div class="vacio-util"><p class="error" role="alert">${esc(LAB.radarError)}</p><p class="mut">Esto no significa que tu radar esté vacío: no se ha podido leer.</p><p><button class="btn btn-secundario" type="button" data-acc="reintentar">Reintentar</button></p></div>`; return; }
  $('#seg-radar-n').textContent = filas.length ? `(${filas.length})` : '';
  if (!filas.length) { $('#seg-radar').innerHTML = '<div class="vacio-util"><p><b>Aún no has guardado ninguna empresa.</b></p><p class="mut">Abre la ficha de una empresa en «Explorar empresas» y pulsa «Guardar en mi radar». Podrás añadir una nota con lo que quieres investigar.</p><p><a class="btn btn-primario" href="#empresas">Explorar empresas</a></p></div>'; return; }
  const cab = LAB.carteras.length ? `<div class="seg-ref"><label for="seg-ref">Cartera de referencia</label><select id="seg-ref">${opcionesCartera(ref)}</select></div>` : '';
  $('#seg-radar').innerHTML = cab + filas.map(f => { const ed = LAB.nota?.ticker === f.ticker && LAB.nota.donde === 'seg';
    return `<article class="seg-item" data-t="${esc(f.ticker)}">
      <header><b>${esc(f.nombre)}</b> <span class="simbolo">${esc(f.ticker)}</span> <span class="mut">${esc(f.sector || '')}</span></header>
      ${htmlNota(esc, 'nota-' + f.ticker, f.nota, ed, ed ? LAB.nota.texto : '', ed ? LAB.nota.err : '')}
      <p class="peq" data-en>${esc(textoEnCartera(f.ticker, ref))}</p>
      <div class="seg-acc"><button class="btn btn-secundario" type="button" data-acc="ficha">Ver ficha<span class="sr"> de ${esc(f.nombre)}</span></button>
      <button class="btn btn-secundario" type="button" data-acc="sim">Probar en mi cartera</button><button class="btn btn-ghost" type="button" data-acc="quitar">Quitar del radar<span class="sr"> ${esc(f.nombre)}</span></button></div></article>`; }).join('');
}
async function clicSeguimientoRadar(e) {
  const { $, toast, toastError } = x(), g = LAB.gen, alm = LAB.alm.radar;
  if (e.target.closest('[data-acc=reintentar]')) { await cargarRadar(); pintarSeguimientoRadar(); return; }
  const art = e.target.closest('.seg-item'); if (!art) return; const t = art.dataset.t;
  try {
    const nb = e.target.closest('[data-nota]');
    if (nb) {
      const modo = nb.dataset.nota;
      if (modo === 'editar') { LAB.nota = { ticker: t, donde: 'seg', texto: alm.nota(t), err: '' }; pintarSeguimientoRadar(); $(`#nota-${t}`)?.focus(); }
      else if (modo === 'cancelar') { LAB.nota = null; pintarSeguimientoRadar(); $(`.seg-item[data-t="${t}"] [data-nota=editar]`)?.focus(); }
      else if (modo === 'guardar') {
        const texto = art.querySelector('textarea').value; LAB.nota.texto = texto;
        try { await alm.guardar(t, texto); if (!vigente(g)) return; LAB.nota = null; toast('Nota guardada'); pintarSeguimientoRadar(); $(`.seg-item[data-t="${t}"] [data-nota=editar]`)?.focus(); }
        catch (er) { if (!vigente(g)) return; LAB.nota.err = 'No se ha podido guardar. ' + er.message; art.querySelector('[data-nota-err]').textContent = LAB.nota.err; nb.textContent = 'Reintentar guardado'; toastError('No se ha podido guardar la nota'); }
      }
      return;
    }
    const b = e.target.closest('[data-acc]'); if (!b) return;
    if (b.dataset.acc === 'ficha') x().verFicha(t);
    else if (b.dataset.acc === 'sim') abrirLab({ carteraId: carteraRef()?.id ?? null, ticker: t });
    else if (b.dataset.acc === 'quitar') {
      const sig = art.nextElementSibling?.dataset?.t || art.previousElementSibling?.dataset?.t;
      await alm.quitar(t); if (!vigente(g)) return; toast('Quitada de tu radar'); pintarSeguimientoRadar(); (sig ? $(`.seg-item[data-t="${sig}"] [data-acc="ficha"]`) : $('#seg-radar a, #seg-radar button'))?.focus();
    }
  } catch (err) { toastError(err.message); }
}
const textoRevision = e => e.revisar_en ? `Revisión prevista: ${fechaCorta(e.revisar_en)}${e.revisar_en < hoy() ? ' (la fecha ya ha pasado)' : ''}.` : '';
const pesoDe = (lista, t) => lista?.find(p => p.ticker === t)?.peso ?? 0;
function tarjetaCaso(esc, c) {                                         // una pregunta que sigues: qué se preguntó, qué ha ocurrido, con qué peso lo probaste
  const est = c.estado || estadoSeguimiento({ historia: c.historia, pregunta_ref: c.pregunta_ref, pregunta: c.pregunta }), caso = est.caso, r = est.tipo === 'responde' ? caso.respuesta : null, h = c.historia && historia(c.historia);
  const inval = est.refInvalida ? ' El vínculo guardado ya no existe en el catálogo de preguntas: se trata como pregunta propia.' : '';
  const contexto = est.tipo === 'otra' ? `<p><b>Pregunta distinta a la de la historia.</b>${inval} La revisión publicada de esta historia responde a otra cuestión: «${esc(est.editorial.pregunta)}». Tu pregunta no tiene respuesta editorial: todavía no hay una fuente que la responda.</p>`
    : est.tipo === 'sin' ? `<p><b>Sin respuesta editorial.</b>${inval} Esta pregunta no está vinculada a ninguna historia ni fuente. Tu seguimiento son tus revisiones personales.</p>` : '';
  const formul = (est.tipo === 'responde' || est.tipo === 'pendiente') && est.distinta ? `<p class="mut peq">Tu formulación es distinta de la de la historia, pero sigue la misma cuestión: «${esc(caso.pregunta)}».</p>` : '';
  const ocurrido = r && c.compacta ? `<p class="mut peq">Misma respuesta que la de otra pregunta tuya vinculada a esta cuestión (más arriba). El desenlace completo no se repite aquí.</p>` : r ? `<p><b>Qué ha ocurrido desde entonces</b> (${esc(fechaCorta(r.fecha))}${r.simulada ? ', desenlace SIMULADO' : ''}):</p><ul>${r.porContrato.map(k => `<li><b>${esc(k.nombre)}:</b> ${esc(k.estado)}${k.documento && k.documento !== '—' ? ' ' + esc(k.documento) : ''}</li>`).join('')}</ul><p class="mut peq">Fuente: ${esc(r.fuente)}. ${esc(r.resumen)}</p>`
    : est.tipo === 'pendiente' ? `<p><b>Sin respuesta editorial todavía.</b> ${esc(caso.pendiente || 'Todavía no hay una fuente que permita responder esta pregunta. Se revisará cuando haya una actualización verificada.')}</p>` : contexto;
  const pesos = c.ejemplo ? `<p class="caso-pesos">Peso de ${esc(c.ticker)} en la simulación de ejemplo: <b>${P(c.pesoEsc)}</b>. En tu cartera actual: no tienes ninguna (es un ejemplo).</p>`
    : `<p class="caso-pesos">Peso de ${esc(c.ticker)} en tu <b>escenario guardado</b>: <b>${P(c.pesoEsc)}</b> (la base tenía ${P(c.pesoBase)}). En tu <b>cartera actual</b>: ${c.pesoActual == null ? 'la cartera ya no existe' : `<b>${P(c.pesoActual)}</b>`}.</p>`;
  const rev = !h ? '' : r?.revision ? `<a class="btn btn-secundario" href="#tesis-${esc(h.id)}-${r.revision}">Leer la revisión</a>` : est.tipo === 'otra' ? `<a class="btn btn-secundario" href="#historia-${esc(h.id)}">Ver revisión de la historia</a>` : `<a class="btn btn-secundario" href="#tesis-${esc(h.id)}-${caso?.tesis || 1}">Leer la opinión</a>`;
  const sim = c.ejemplo ? `<button class="btn btn-secundario" type="button" data-caso-probar="${esc(c.ticker)}" data-historia="${esc(c.historia)}">Probar la simulación</button>` : `<a class="btn btn-secundario" href="#escenario-${c.idEsc}">Abrir la simulación</a>`;
  return `<article class="caso${r ? '' : ' caso-pend'}"><header><span class="chip${r ? '' : ' aviso'}">${r ? (est.distinta ? 'Reformulación con respuesta editorial' : 'Con respuesta editorial') : 'Sin respuesta editorial aún'}</span> ${c.ejemplo || h?.ficticia ? '<span class="chip sim">Ejemplo ficticio</span>' : ''}</header>
    ${c.enFicha ? '' : `<h3>«${esc(c.pregunta)}»</h3>`}${formul}${c.revisarEn && !c.enFicha ? `<p>Fecha de revisión: <b>${esc(fechaCorta(c.revisarEn))}</b>${c.revisarEn < hoy() ? ' (la fecha ya ha pasado)' : ''}.</p>` : ''}
    ${ocurrido}${pesos}<p class="caso-acc">${rev} ${c.enFicha ? '' : sim}</p></article>`;
}
// Resumen del vínculo con la revisión de la historia dentro de un escenario: responde / sigue pendiente / es otra pregunta (con enlace para verla).
// Edición: muestra la pregunta de la historia a la que está vinculado el escenario y permite desvincularlo EXPRESAMENTE. Un vínculo guardado que ya no existe
// en el catálogo se identifica y se limpia al guardar. Avisa (sin decidir) si las palabras nuevas parecen tratar otro asunto.
function htmlVinculoEdicion(esc, e) {
  if (!e.historia) return '';
  if (e.pregunta_ref_invalida) return `<p class="aviso-vinculo" id="esc-vinculo-aviso" role="status">El vínculo guardado («${esc(e.pregunta_ref)}») ya no existe en el catálogo de preguntas de la historia. Se tratará como pregunta propia y se quitará al guardar.</p><input type="hidden" id="esc-ref-quitar" value="1">`;
  const ref = e.pregunta_ref || refPregunta(e.historia, 1), caso = casoPorRef(ref); if (!caso) return '';
  return `<p class="fila"><input type="checkbox" id="esc-ref" aria-describedby="esc-vinculo-aviso"${e.pregunta_ref ? ' checked' : ''}> <label for="esc-ref">Sigue la pregunta de la historia: «${esc(caso.pregunta)}»</label></p>
        <p class="mut peq" id="esc-vinculo-aviso" role="status" aria-live="polite" data-editorial="${esc(caso.pregunta)}">${e.pregunta_ref ? 'Vinculada: la revisión de la historia sigue siendo la de esta cuestión aunque cambies tus palabras. Desmarca la casilla para desvincularla.' : 'Sin vincular: tu pregunta se tratará como propia.'}</p>`;
}
function avisoParecido(entrada, ref, aviso) {
  if (!entrada || !ref || !aviso) return;
  const dis = similitudPregunta(entrada.value, aviso.dataset.editorial || '') < UMBRAL_PARECIDO && entrada.value.trim() !== '';
  aviso.textContent = !ref.checked ? 'Sin vincular: tu pregunta se tratará como propia.' : dis ? 'Atención: tu pregunta parece tratar otro asunto, pero sigue vinculada y se mostraría con la respuesta de la historia. Si es otra pregunta, desmarca la casilla.' : 'Vinculada: la revisión de la historia sigue siendo la de esta cuestión aunque cambies tus palabras. Desmarca la casilla para desvincularla.';
}
function tarjetaVinculo(esc, e) {
  const est = estadoSeguimiento(e), h = historia(e.historia); if (!h) return '';
  const txt = est.tipo === 'responde' ? `La revisión de la historia responde a la cuestión que sigues: «${esc(est.caso.pregunta)}».`
    : est.tipo === 'pendiente' ? 'Sigues una cuestión de la historia que la fuente todavía no permite responder: sigue pendiente.'
    : est.tipo === 'otra' ? `Tu pregunta es distinta de la que responde la revisión de la historia («${esc(est.editorial.pregunta)}»): la tuya sigue pendiente.` : '';
  const rev = est.tipo === 'responde' && est.caso.respuesta.revision ? `#tesis-${esc(h.id)}-${est.caso.respuesta.revision}` : `#historia-${esc(h.id)}`;
  return txt ? `<p class="esc-vinculo">${txt} <a href="${rev}">Ver revisión de la historia</a></p>` : '';
}
// Orden del Cuaderno (el orden del DOM es el visual): con cuenta, primero lo que toca revisar (los escenarios) y el bloque editorial desaparece de esta pantalla (su detalle está en la ficha de cada idea);
// de visitante, el ejemplo ficticio de «Tus preguntas» primero y después la invitación a entrar.
function ordenarSeguimiento(conCuenta) {
  const col = document.querySelector('.seg-col'), casos = document.querySelector('#seg-casos')?.closest('.seg-bloque'), escB = document.querySelector('#seg-escenarios')?.closest('.seg-bloque'); if (!col || !casos || !escB) return;
  casos.hidden = conCuenta; if (conCuenta) col.insertBefore(escB, col.firstElementChild); else col.insertBefore(casos, col.firstElementChild);
}
// Respuesta editorial EN UNA FRASE (para la tarjeta compacta del Cuaderno). Independiente del seguimiento personal: una revisión personal no demuestra que haya una fuente ni que la pregunta esté resuelta.
function lineaEditorial(esc, e) {
  if (!e.historia) return '';
  const est = estadoSeguimiento(e), h = historia(e.historia); if (!h) return '';
  const txt = est.tipo === 'responde' ? 'la revisión de la historia responde a la cuestión que sigues.' : est.tipo === 'pendiente' ? 'sin respuesta todavía: la fuente aún no permite responder esa cuestión.'
    : est.tipo === 'otra' ? 'la revisión de la historia responde a otra cuestión; tu pregunta no tiene respuesta editorial.' : 'tu pregunta no está vinculada a la cuestión de la historia.';
  return `<p class="peq mut"><b>Respuesta editorial:</b> ${txt}</p>`;
}
function pintarSeguimientoCasos(lista) {
  const { $, esc, logged } = x(), cont = $('#seg-casos'); if (!cont) return;
  ordenarSeguimiento(logged());
  if (logged()) { cont.innerHTML = ''; return; }
  if (!logged()) {                                                       // visitante: ejemplo ficticio y rotulado; con cuenta solo salen SUS preguntas y posiciones
    cont.innerHTML = `<p class="mut peq">Así se verían tus preguntas (ejemplo ficticio). Con cuenta, aquí aparecen solo tus propias preguntas y posiciones.</p>` + SEGUIMIENTO_CASOS.map(c => tarjetaCaso(esc, { pregunta_ref: refPregunta(c.historia, c.tesis), pregunta: c.pregunta, historia: c.historia, ticker: historia(c.historia).ticker, pesoEsc: 10, ejemplo: true })).join('');
    return;
  }
  const con = (lista || []).filter(e => e.pregunta && e.estado !== 'descartado').sort((a, b) => (a.revisar_en || '9999').localeCompare(b.revisar_en || '9999') || b.id - a.id);
  if (!con.length) { cont.innerHTML = '<p class="mut">Cuando guardes un escenario con una pregunta, aparecerá aquí con su fecha de revisión, lo que ha ocurrido desde entonces y el peso que probaste.</p>'; return; }
  const vistos = new Set();                                                // dos preguntas con el mismo desenlace: el artículo completo una sola vez, cada tarjeta con su enlace
  cont.innerHTML = con.map(e => { const viva = LAB.carteras.find(c => c.id === e.cartera_id), est = estadoSeguimiento(e), clave = est.tipo === 'responde' ? e.pregunta_ref : null, compacta = !!clave && vistos.has(clave); if (clave) vistos.add(clave);
    return tarjetaCaso(esc, { compacta, pregunta: e.pregunta, pregunta_ref: e.pregunta_ref, historia: e.historia, ticker: e.ticker, pesoEsc: pesoDe(e.propuesta, e.ticker), pesoBase: pesoDe(e.base, e.ticker), pesoActual: viva ? pesoDe(viva.pos, e.ticker) : null, revisarEn: e.revisar_en, idEsc: e.id }); }).join('');
}
async function pintarSeguimientoEscenarios() {
  const { $, esc, logged } = x(), cont = $('#seg-escenarios'), g = LAB.gen;
  if (!logged()) { pintarSeguimientoCasos(null); }
  if (!logged()) { $('#seg-esc-n').textContent = ''; cont.innerHTML = '<div class="vacio-util"><p><b>Los escenarios se guardan en tu cuenta.</b></p><p class="mut">Puedes simular sin cuenta en el laboratorio, pero para conservar un escenario y volver a él tienes que entrar.</p><p><a class="btn btn-secundario" href="#laboratorio">Ir al laboratorio</a></p></div>'; return; }
  cont.innerHTML = '<p class="mut">Cargando tus escenarios…</p>';
  let lista; try { lista = await LAB.alm.escenarios.listar(); } catch (e) { if (!vigente(g)) return; cont.innerHTML = `<p class="estado-lista">${esc(e.message)} <button class="enlace" type="button" id="seg-reintentar">Reintentar</button></p>`; $('#seg-reintentar').onclick = pintarSeguimientoEscenarios; return; }
  if (!vigente(g)) return;
  LAB.listaEsc = lista; purgarBorradoresRev(lista.map(e => e.id)); pintarSeguimientoCasos(lista);
  const f = $('#seg-filtro').value;
  const vistos = lista.filter(e => f === 'todos' || (f === 'activos' ? e.estado === 'en_estudio' : e.estado === f));
  $('#seg-esc-n').textContent = lista.length ? `(${lista.length})` : '';
  if (!lista.length) { cont.innerHTML = '<div class="vacio-util"><p><b>Aún no has guardado ningún escenario.</b></p><p class="mut">En el laboratorio compara tu cartera con una alternativa y guárdala en el Cuaderno con tu pregunta y una fecha para volver a revisarla.</p><p><a class="btn btn-primario" href="#laboratorio">Abrir el laboratorio</a></p></div>'; return; }
  // UNA tarjeta por escenario (ronda 22): pregunta, fecha, resumen breve, tu seguimiento personal, la respuesta editorial en una frase y la acción. La composición completa, el contexto editorial y el historial están en la ficha.
  const h0 = hoy(), tarjetaEsc = e => {
    const f = e.revisar_en, vence = !!f && f <= h0 && e.estado === 'en_estudio', n = e.n_revisiones || 0, pend = e.estado === 'en_estudio';
    const fecha = !f ? '' : !pend ? `<p class="esc-fecha mut peq">Tenía prevista una revisión el ${esc(fechaCorta(f))}.</p>` : `<p class="esc-fecha${vence ? ' vence' : ''}">${vence ? 'Toca revisar' : 'Próxima revisión'}: <b>${esc(fechaCorta(f))}</b>${f < h0 ? ' (la fecha ya ha pasado)' : f === h0 ? ' (hoy)' : ''}.</p>`;   // una idea archivada o descartada no promete una revisión
    return `<article class="esc-item${vence ? ' esc-toca' : ''}"><header><b class="esc-t">${e.pregunta ? `«${esc(e.pregunta)}»` : esc(e.nombre)}</b> <span class="chip sim">Simulación</span> <span class="chip">${ESTADOS[e.estado]}</span></header>
      ${fecha}<p class="peq"><b>Tu seguimiento:</b> ${n ? `${n} ${n === 1 ? 'revisión personal registrada' : 'revisiones personales registradas'}` : 'sin revisiones personales todavía'}.</p>${lineaEditorial(esc, e)}
      <p class="mut peq">${esc(e.ticker)} al ${P(e.peso_objetivo)} en la alternativa · cartera «${esc(e.cartera_nombre)}»</p>
      ${!e.cartera_existe ? '<p class="chip aviso">La cartera original ya no existe</p>' : e.hay_version_posterior ? '<p class="chip aviso">Hay una versión posterior de la cartera</p>' : ''}
      ${e.nota ? `<p class="esc-nota peq">${esc(e.nota.length > 110 ? e.nota.slice(0, 110) + '…' : e.nota)}</p>` : ''}
      <p class="esc-acc">${pend ? `<button class="btn ${vence ? 'btn-primario' : 'btn-secundario'}" type="button" data-registrar="${e.id}">Registrar revisión<span class="sr"> de ${esc(e.nombre)}</span></button> ` : ''}<a class="btn btn-secundario" href="#escenario-${e.id}">Abrir<span class="sr"> ${esc(e.nombre)}</span></a></p></article>`;
  };
  // Ronda 21: «En estudio» se ordena para volver a decidir: primero lo que toca revisar (fecha de hoy o ya pasada), después las próximas revisiones y, al final, lo que no tiene fecha. Lo descartado o archivado no se presenta como pendiente.
  const grupo = e => !e.revisar_en ? 2 : e.revisar_en <= h0 ? 0 : 1, TIT = ['Para revisar', 'Próximas revisiones', 'Sin fecha de revisión'];
  if (f === 'activos' && vistos.length) { const g3 = [[], [], []]; vistos.forEach(e => g3[grupo(e)].push(e)); g3.forEach(l => l.sort((a, b) => (a.revisar_en || '9999').localeCompare(b.revisar_en || '9999') || b.id - a.id));
    cont.innerHTML = g3.map((l, k) => l.length ? `<section class="seg-grupo" aria-labelledby="seg-g${k}"><h3 id="seg-g${k}">${TIT[k]} <span class="mut">(${l.length})</span></h3>${k === 0 ? '<p class="mut peq">La fecha es de hoy o ya ha pasado. Abre la idea y registra tu revisión.</p>' : ''}${l.map(tarjetaEsc).join('')}</section>` : '').join(''); }
  else cont.innerHTML = vistos.length ? vistos.map(tarjetaEsc).join('') : '<p class="mut">No hay escenarios con ese estado.</p>';
}

// =============== laboratorio ===============
export function abrirLab({ carteraId = null, ticker = '', historia: hid = null } = {}) {
  LAB.sim = { carteraId, ticker, peso: '', fin: '', clave: null, res: null, historia: hid };
  guardarEstadoLab(); x().go('#laboratorio');
}
const guardarEstadoLab = () => { try { sessionStorage.setItem(CLAVE_LAB, JSON.stringify({ carteraId: LAB.sim.carteraId, ticker: LAB.sim.ticker, peso: LAB.sim.peso, fin: LAB.sim.fin, historia: LAB.sim.historia })); } catch { /* sin almacenamiento */ } };
const leerEstadoLab = () => { try { return JSON.parse(sessionStorage.getItem(CLAVE_LAB)); } catch { return null; } };

export async function mostrarLab(modo, id) {
  const { $ } = x(), g = LAB.gen; $('#lab-cuerpo').innerHTML = '<p class="mut">Cargando…</p>';
  if (modo === 'escenario') return mostrarEscenario(id);
  await Promise.all([cargarCarteras(), cargarRadar()]);
  if (!vigente(g)) return;
  if (!LAB.sim) { const s = leerEstadoLab(); LAB.sim = { carteraId: s?.carteraId ?? null, ticker: s?.ticker || '', peso: s?.peso || '', fin: s?.fin || '', clave: null, res: null, historia: s?.historia || null }; }
  pintarLabForm();
}
const baseLab = () => { const l = basesLab(), s = LAB.sim; return l.find(c => String(c.id) === String(s.carteraId)) || l[0] || null; };
const metodoTexto = fin => ({
  sin_asignar: { corto: 'El peso nuevo se toma del porcentaje que ahora no está asignado. Las demás posiciones no cambian. Si no hay suficiente, este método no se puede usar.', redondeo: '' },
  proporcional: { corto: 'Las demás posiciones bajan todas en la misma proporción para liberar el porcentaje necesario. Si el peso nuevo es menor que el actual, lo liberado queda sin asignar: no se reparte al alza.',
    redondeo: 'Cada posición se multiplica por (lo que deben sumar) / (lo que suman ahora) y se redondea a una décima repartiendo las décimas sobrantes por mayor resto (empate: orden de símbolo). Así los totales siempre cuadran.' },
}[fin] || { corto: 'Elige cómo se financia el cambio y verás aquí cómo se calcula, antes de simular.', redondeo: '' });
const htmlMetodo = (esc, fin) => { const m = metodoTexto(fin); return `<details class="mini"><summary>Cómo se reparte el cambio</summary><p>${esc(m.corto)}</p>${m.redondeo ? `<details class="mini"><summary>Cómo se redondea</summary><p>${esc(m.redondeo)}</p></details>` : ''}</details>`; };
function pintarLabForm() {
  const { $, esc, logged } = x(), s = LAB.sim, alm = LAB.alm.radar, lista = basesLab(), base = baseLab();
  if (!base) { $('#lab-cuerpo').innerHTML = `${cabLab()}<p class="estado-lista">No hay ninguna cartera disponible.</p>`; return; }
  s.carteraId = base.id;
  const activos = x().activos(), act = s.ticker && activos[s.ticker], r = radiografia(base.pos, activos, base.limite), actual = base.pos.find(p => p.ticker === s.ticker)?.peso;
  const radar = alm.todos().map(f => `<option value="${esc(f.ticker)}">${esc(f.nombre)}</option>`).join('');
  const h = s.historia && historia(s.historia);
  $('#lab-cuerpo').innerHTML = `${cabLab(h ? `Vienes de la historia «${esc(h.titulo)}». <a href="#historia-${esc(h.id)}">Volver a la lectura</a>. ` : '')}
    <form id="lab-form" class="lab-form" novalidate>
      <fieldset><legend>1 · Cartera base</legend>
        ${base.ejemplo ? '<p class="lab-ejemplo" role="note"><b>No tienes ninguna cartera, así que usamos una de ejemplo</b> (KO 60 % · PG 40 %) para que puedas probar. No es tuya y la simulación es temporal.</p>' : ''}
        <label for="lab-base">Cartera</label><select id="lab-base">${opcionesCartera(base, lista)}</select>
        <p class="mut peq">${base.ejemplo ? 'Cartera de ejemplo.' : base.guardada ? `Versión guardada (revisión ${base.revision}).` : 'Tu borrador de este dispositivo, sin guardar.'} ${r.n} ${r.n === 1 ? 'posición' : 'posiciones'} · asignado ${P(r.total)}${r.estado === 'incompleta' ? ` (falta asignar ${P(r.pendiente)})` : r.estado === 'exceso' ? ` (exceso de ${P(r.exceso)})` : ''}. El laboratorio parte siempre de lo guardado, no de cambios sin guardar.</p></fieldset>
      <fieldset><legend>2 · Activo y peso</legend>
        <label for="lab-ticker">Activo (símbolo o nombre)</label><input id="lab-ticker" list="lab-activos" autocomplete="off" value="${esc(s.ticker)}" placeholder="Por ejemplo: KO"><datalist id="lab-activos">${Object.values(activos).map(a => `<option value="${esc(a.ticker)}">${esc(a.nombre)}</option>`).join('')}</datalist>
        ${radar ? `<label for="lab-radar">…o elige uno de tu radar (opcional)</label><select id="lab-radar"><option value="">—</option>${radar}</select>` : ''}
        <p class="peq" id="lab-activo-info">${act ? `${esc(act.nombre)}${actual != null ? ` · ya figura con el ${P(actual)}` : ' · no figura directamente en la cartera'}` : ''}</p>
        <label for="lab-peso">Peso propuesto (%)</label><input id="lab-peso" inputmode="decimal" autocomplete="off" value="${esc(String(s.peso).replace('.', ','))}" placeholder="Por ejemplo: 10"></fieldset>
      <fieldset><legend>3 · Cómo se financia</legend>
        ${Object.entries(FINANCIACIONES).map(([k, v]) => `<label class="radio-op"><input type="radio" name="lab-fin" value="${k}"${s.fin === k ? ' checked' : ''}> ${v}${k === 'sin_asignar' ? ` <span class="mut">(ahora hay ${P(r.pendiente)} sin asignar)</span>` : ''}</label>`).join('')}
        <div class="lab-metodo" id="lab-metodo" aria-live="polite">${htmlMetodo(esc, s.fin)}</div></fieldset>
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
  if (id === 'lab-base') { LAB.sim.carteraId = e.target.value === 'borrador' ? null : (/^\d+$/.test(e.target.value) ? Number(e.target.value) : e.target.value); invalidarResultado(); pintarLabForm(); $('#lab-base').focus(); }
  else if (id === 'lab-radar' && e.target.value) { LAB.sim.ticker = e.target.value; invalidarResultado(); leerCampos(); pintarLabForm(); $('#lab-peso').focus(); }
  else if (e.target.name === 'lab-fin') { invalidarResultado(); $('#lab-metodo').innerHTML = htmlMetodo(esc, e.target.value); leerFormulario(); }
  else if (id === 'lab-ticker') { leerFormulario(); const a = x().activos()[LAB.sim.ticker]; $('#lab-activo-info').textContent = a ? a.nombre : ''; }
}
function leerCampos() { const { $ } = x(); LAB.sim.peso = $('#lab-peso')?.value || LAB.sim.peso; }
function onLabSubmit(e) {
  if (e.target.id === 'lab-form') { e.preventDefault(); simularAhora(); }
  else if (e.target.id === 'lab-guardar') { e.preventDefault(); guardarEscenario(); }
  else if (e.target.id === 'esc-form') { e.preventDefault(); guardarCambiosEscenario(); }
  else if (e.target.id === 'rev-form') { e.preventDefault(); registrarRevision(); }
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
  return `<h3>Pesos por posición</h3><div class="tabla-h" role="region" aria-label="Pesos antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Posición</th><th scope="col">Cartera base</th><th scope="col">Alternativa simulada</th><th scope="col">Cambio <small class="mut">(puntos)</small></th></tr></thead><tbody>
      ${cambios.map(f => `<tr><th scope="row"><b>${esc(f.ticker)}</b> <small>${esc(a[f.ticker]?.nombre || '')}</small>${f.nueva ? ' <span class="chip">nueva</span>' : ''}</th><td>${P(f.antes)}</td><td>${P(f.despues)}</td><td>${dpts(f.delta)}</td></tr>`).join('')}
      <tr class="tot"><th scope="row">Total asignado</th><td>${P(A.total)}</td><td>${P(D.total)}</td><td>${dpts(Math.round((D.total - A.total) * 10) / 10)}</td></tr></tbody></table></div>
    <h3>Concentración</h3><div class="tabla-h" role="region" aria-label="Concentración antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Medida</th><th scope="col">Cartera base</th><th scope="col">Alternativa simulada</th></tr></thead><tbody>
      ${fila('Mayor posición', A.mayor ? `${esc(A.mayor.ticker)} · ${P(A.mayor.peso)}` : '—', D.mayor ? `${esc(D.mayor.ticker)} · ${P(D.mayor.peso)}` : '—')}
      ${fila(A.top3.completo && D.top3.completo ? 'Tres mayores' : 'Mayores posiciones (hasta tres)', P(A.top3.peso) + (A.top3.completo ? '' : ` (hay ${A.top3.n})`), P(D.top3.peso) + (D.top3.completo ? '' : ` (hay ${D.top3.n})`))}
      ${fila('Sin asignar', P(A.pendiente), P(D.pendiente))}${A.exceso || D.exceso ? fila('Exceso', P(A.exceso), P(D.exceso)) : ''}</tbody></table></div>
    <h3>Categorías disponibles <small class="mut">(comerciales; no son la exposición real de los fondos)</small></h3><div class="tabla-h" role="region" aria-label="Categorías antes y después" tabindex="0"><table class="tabla-lab"><thead><tr><th scope="col">Categoría</th><th scope="col">Cartera base</th><th scope="col">Alternativa simulada</th></tr></thead><tbody>
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
function htmlBarras(esc, sim) {                                          // dos barras (antes / después) con los pesos reales; la empresa probada va marcada
  const tks = [...new Set([...sim.antes.map(p => p.ticker), ...sim.despues.map(p => p.ticker)])], col = t => tks.indexOf(t) % 8;
  const barra = (lista, tit) => `<div class="esp-fila"><span class="esp-tit">${tit}</span><span class="esp-barra" role="img" aria-label="${tit}: ${esc(lista.map(p => `${p.ticker} ${p.peso} %`).join(', ') || 'vacía')}">${lista.map(p => `<i class="${p.ticker === sim.ticker ? 'dest' : ''}" style="--c:var(--c${col(p.ticker)});width:${p.peso}%">${p.peso >= 9 ? esc(p.ticker) : ''}</i>`).join('')}</span></div>`;
  return `<div class="esp">${barra(sim.antes, 'Cartera base')}${barra(sim.despues, 'Alternativa simulada')}</div>`;
}
function pintarResultado() {
  const { $, esc, logged } = x(), s = LAB.sim, sim = s.res, base = baseLab(), cont = $('#lab-res'); if (!sim) { cont.innerHTML = ''; return; }
  if (!sim.viable) { cont.innerHTML = `<section class="lab-res inviable"><h2 tabindex="-1">No se puede simular</h2><p>${esc(sim.motivo)}</p></section>`; return; }
  const activos = x().activos(), c = comparar(sim.antes, sim.despues, activos, base.limite), n = sim.cambios.filter(f => f.delta !== 0).length;
  const mio = sim.cambios.find(f => f.ticker === sim.ticker);
  const mayorTxt = !c.antes.mayor || !c.despues.mayor ? '' : c.antes.mayor.ticker === c.despues.mayor.ticker && c.antes.mayor.peso === c.despues.mayor.peso ? ` La mayor posición sigue siendo ${esc(c.despues.mayor.ticker)} (${P(c.despues.mayor.peso)}).` : ` La mayor posición pasa de ${esc(c.antes.mayor.ticker)} (${P(c.antes.mayor.peso)}) a ${esc(c.despues.mayor.ticker)} (${P(c.despues.mayor.peso)}).`;
  const concl = `En la alternativa simulada, ${esc(sim.ticker)} pasaría del ${P(mio.antes)} al ${P(mio.despues)} ${METODOS[sim.financiacion]}. ${n} ${n === 1 ? 'posición cambia' : 'posiciones cambian'}; sin asignar: ${P(c.antes.pendiente)} → ${P(c.despues.pendiente)}.${mayorTxt} Es una comparación: no dice que la alternativa sea mejor.`;
  const h = s.historia && historia(s.historia), rev = h && ultimaTesis(h);
  const evA = LAB.universo ? evaluar(sim.antes, LAB.universo) : null, evD = LAB.universo ? evaluar(sim.despues, LAB.universo) : null;
  s.evaluacion = evA && evD ? { antes: resumenNota(evA), despues: resumenNota(evD) } : null;
  const guardar = logged() && base.guardada
    ? `<form id="lab-guardar" class="lab-guardar"><h3>Guardar en mi Cuaderno</h3><p class="mut peq"><b>Guardar la comparación no aplica el cambio a tu cartera.</b> Tu cartera base sigue igual; esto se guarda como simulación privada, con la base y la alternativa tal como las ves ahora.</p>
        <label for="lab-nombre">Nombre</label><input id="lab-nombre" maxlength="80" required value="${esc(`${sim.ticker} al ${String(s.peso).replace('.', ',')} % (${sim.financiacion === 'proporcional' ? 'proporcional' : 'sin asignar'})`)}">
        ${h?.pregunta ? `<p class="fila"><input type="checkbox" id="lab-ref" aria-describedby="lab-vinculo-aviso" checked> <label for="lab-ref">Sigo la pregunta de la historia: «${esc(h.pregunta)}»</label></p><p class="mut peq" id="lab-vinculo-aviso" role="status" aria-live="polite" data-editorial="${esc(h.pregunta)}">Vinculada: la revisión de la historia sigue siendo la de esta cuestión aunque cambies tus palabras. Desmarca la casilla para desvincularla.</p>` : ''}
        <label for="lab-pregunta">Qué quiero averiguar <span class="mut">(opcional; con tus palabras)</span></label><input id="lab-pregunta" maxlength="200" value="${esc(h?.pregunta || '')}" placeholder="Por ejemplo: ¿Se han firmado los dos contratos anunciados?">
        <label for="lab-nota">Por qué lo estoy estudiando <span class="mut">(opcional)</span></label><textarea id="lab-nota" rows="3" maxlength="600"></textarea>
        <label for="lab-invalidacion">Qué me haría cambiar de opinión <span class="mut">(opcional; hasta 600 caracteres)</span></label><textarea id="lab-invalidacion" rows="2" maxlength="600" placeholder="Por ejemplo: si la empresa pierde a su principal cliente"></textarea>
        <label for="lab-revisar">Cuándo quiero revisarlo <span class="mut">(opcional; Klever no envía avisos, es solo para ti)</span></label><input id="lab-revisar" type="date" min="${hoy()}">
        ${h ? `<p class="peq mut">Se vincula a la historia «${esc(h.titulo)}»${rev && rev.n > 1 ? ' y a su revisión editorial' : ''}.</p>` : ''}
        <p><button class="btn btn-primario" type="submit" id="lab-guardar-btn">Guardar en mi Cuaderno</button></p><p class="error" id="lab-guardar-error" role="alert"></p></form>`
    : base.ejemplo && logged()
      ? `<div class="lab-guardar"><h3>Guardar este escenario</h3><p>Esta simulación usa la cartera de ejemplo, que no está en tu cuenta. Para guardar escenarios necesitas una cartera guardada.</p><p><button class="btn btn-primario" type="button" id="lab-crear-ejemplo">Crear la cartera de ejemplo en mi cuenta</button></p><p class="error" id="lab-crear-error" role="alert"></p></div>`
      : `<div class="lab-guardar"><h3>Guardar este escenario</h3><p>${logged() ? 'Guarda primero la cartera en tu cuenta para poder conservar escenarios sobre ella.' : 'Esta simulación es temporal: se perderá al cerrar la página. Entra para guardarla en tu Cuaderno (con una cartera guardada en tu cuenta). <b>Al entrar se conserva la simulación que has preparado</b> (la cartera, el activo y el peso); lo que escribas en el formulario de guardado todavía no.'}</p>${logged() ? '' : '<p><button class="btn btn-secundario" type="button" id="lab-entrar">Entrar para guardar</button></p>'}</div>`;
  cont.innerHTML = `<section class="lab-res"><h2 tabindex="-1">Resultado <span class="chip sim">Simulación</span></h2>
    <p class="lab-espacio"><b>Cuánto espacio ocuparía:</b> ${esc(sim.ticker)} ocuparía el ${P(mio.despues)} de la cartera${mio.antes ? ` (ahora ${P(mio.antes)})` : ' (ahora no figura)'}.</p>
    ${htmlBarras(esc, sim)}<h3>Quién cede el peso</h3><div class="delta-grid">${sim.cambios.filter(f => f.delta !== 0).map(f => `<div><span>${esc(f.ticker)}</span><b>${dpts(f.delta)}</b><small>${P(f.antes)} → ${P(f.despues)}</small></div>`).join('') || '<p>Sin cambios de peso.</p>'}</div><details class="mini"><summary>Ver el origen del peso</summary><p class="lab-origen">${esc(origenPeso(sim))}</p></details>
    <p class="mut peq"><b>Tu cartera base no cambia.</b> Esta alternativa no implica una mayor rentabilidad.</p><details class="mini"><summary>Qué cambia, en palabras</summary><p class="lab-concl">${concl}</p></details>
    <details class="mini"><summary>Comparar todos los pesos y categorías</summary>${htmlComparacion(c, sim.cambios, limitesHtml(c, base.limite))}</details>
    ${evA && evD ? `<details class="mini"><summary>Comparar la nota de estructura</summary>${htmlCambioNota(esc, evA, evD)}</details>` : ''}
    <details class="mini"><summary>Ver los pasos del cálculo</summary><ol>${sim.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></details>${guardar}</section>`;
}
async function guardarEscenario() {
  const { $, toast, toastError } = x(), s = LAB.sim, sim = s.res, base = baseLab(), btn = $('#lab-guardar-btn'), err = $('#lab-guardar-error'), g = LAB.gen; err.textContent = '';
  if (!sim?.viable || !base?.guardada) return;
  s.clave = s.clave || LAB.alm.escenarios.nuevaClave();                 // el mismo intento reutiliza la clave: un reintento no duplica
  btn.disabled = true; btn.textContent = 'Guardando…';
  try {
    const r = await LAB.alm.escenarios.crear({ clave: s.clave, nombre: $('#lab-nombre').value, nota: $('#lab-nota').value, invalidacion: $('#lab-invalidacion').value, pregunta: $('#lab-pregunta').value, revisar_en: $('#lab-revisar').value || null, historia: s.historia || null, pregunta_ref: ($('#lab-ref')?.checked && s.historia) ? refPregunta(s.historia, 1) : null,
      cartera_id: base.id, base_revision: base.revision, ticker: sim.ticker, peso: Number(s.peso), financiacion: sim.financiacion, propuesta: sim.despues, evaluacion: s.evaluacion || undefined });
    if (!vigente(g)) return;
    toast(r.duplicado ? 'Esa comparación ya estaba guardada en tu Cuaderno' : 'Comparación guardada en tu Cuaderno'); x().go('#escenario-' + r.id);
  } catch (e) {
    if (!vigente(g)) return;
    if (e.status === 409) { err.textContent = 'La cartera cambió después de la versión que simulaste. Se ha actualizado la base: vuelve a simular.'; await cargarCarteras(); s.res = null; s.clave = null; pintarLabForm(); return; }
    err.textContent = e.message + ' Tus datos siguen aquí: puedes reintentar.'; toastError(e.message);
  } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = 'Guardar en mi Cuaderno'; } }
}
async function crearEjemploEnCuenta() {
  const { $, api, toastError } = x(), g = LAB.gen, btn = $('#lab-crear-ejemplo'); btn.disabled = true;
  try {
    const { id } = await api('/portfolios', { method: 'POST', body: { nombre: 'Cartera de ejemplo', plantilla: 'dividendos', posiciones: EJEMPLO.pos } }); if (!vigente(g)) return;
    await cargarCarteras(); LAB.sim.carteraId = id; LAB.sim.clave = null; simularAhora(); x().toast('Cartera de ejemplo creada en tu cuenta');
  } catch (e) { if (vigente(g)) { $('#lab-crear-error').textContent = e.message; toastError(e.message); btn.disabled = false; } }
}
function onLabClic(e) {
  if (e.target.closest('#lab-entrar')) x().abrirAcceso('guardar');
  else if (e.target.closest('#lab-crear-ejemplo')) crearEjemploEnCuenta();
  else if (e.target.closest('#esc-editar')) { LAB.editEsc = true; pintarEscenario(); x().$('#esc-pregunta')?.focus(); }
  else if (e.target.closest('#esc-cancelar')) { LAB.editEsc = false; pintarEscenario(); x().$('#esc-editar')?.focus(); }
  else if (e.target.closest('[data-estado]')) cambiarEstadoEscenario(e.target.closest('[data-estado]').dataset.estado);
  else if (e.target.closest('#esc-eliminar')) eliminarEscenario();
}

// =============== escenario guardado: se muestra TAL COMO SE GUARDÓ ===============
function cambiosEntre(base, prop) {
  const a = new Map(base.map(p => [p.ticker, p.peso])), d = new Map(prop.map(p => [p.ticker, p.peso]));
  return [...new Set([...a.keys(), ...d.keys()])].map(t => ({ ticker: t, antes: a.get(t) || 0, despues: d.get(t) || 0, delta: Math.round(((d.get(t) || 0) - (a.get(t) || 0)) * 10) / 10, nueva: !a.has(t) }))
    .sort((p, q) => q.despues - p.despues || (p.ticker < q.ticker ? -1 : 1));
}
async function mostrarEscenario(id) {
  const { $, esc, go, logged } = x(), g = LAB.gen;
  if (!logged()) { go('#seguimiento'); return; }
  let e; try { e = await LAB.alm.escenarios.leer(id); } catch (err) { if (!vigente(g)) return; $('#lab-cuerpo').innerHTML = `${cabLab()}<p class="estado-lista">${esc(err.status === 404 ? 'No encontramos ese escenario (puede que lo hayas eliminado).' : err.message)}</p><p><a class="btn btn-secundario" href="#seguimiento">Volver a mi seguimiento</a></p>`; return; }
  await cargarCarteras(); if (!vigente(g)) return;
  LAB.esc = e; LAB.editEsc = false; if (LAB.revIntento && LAB.revIntento.intento.escId !== e.id) { LAB.revIntento = null; LAB.revBorrador = null; LAB.revMsg = null; } if (LAB.revLectura !== e.id) LAB.revLectura = null; pintarEscenario();
}
function htmlEditorialFicha(esc, e, viva) {      // el contexto editorial completo, UNA vez y en su sitio: la ficha. Es independiente de las revisiones personales.
  return `<section class="esc-editorial" aria-label="Respuesta editorial"><h2>Respuesta editorial</h2><p class="mut peq">Lo que dice la Revista sobre la cuestión que sigues. Tus revisiones personales (más abajo) son aparte: no cambian esta respuesta ni demuestran que exista una fuente.</p>
    ${tarjetaCaso(esc, { enFicha: true, pregunta: e.pregunta, pregunta_ref: e.pregunta_ref, historia: e.historia, ticker: e.ticker, pesoEsc: pesoDe(e.propuesta, e.ticker), pesoBase: pesoDe(e.base, e.ticker), idEsc: e.id, revisarEn: e.revisar_en, pesoActual: viva ? pesoDe(viva.pos, e.ticker) : null })}</section>`;
}
function pintarEscenario() {
  const { $, esc, fmtFechaHora } = x(), e = LAB.esc; if (!e) return;
  const viva = LAB.carteras.find(c => c.id === e.cartera_id), activos = x().activos();
  const c = comparar(e.base, e.propuesta, activos, viva?.limite ?? null);
  const aviso = !e.cartera_existe ? `<p class="aviso-panel"><b>La cartera original ya no existe.</b> Este escenario conserva su copia de la base.</p>`
    : e.hay_version_posterior ? `<div class="aviso-panel"><div><b>La cartera cambió después de este escenario</b> (revisión ${e.base_revision} → ${e.revision_actual}). El escenario conserva la base con la que se simuló y no se recalcula. <a href="#cartera-${e.cartera_id}">Abrir la cartera</a>. Si quieres, simula de nuevo con su versión actual.</div></div>` : '';
  const h = e.historia && historia(e.historia), rev = h && ultimaTesis(h);
  const enlHist = h ? `<p class="esc-historia"><b>Historia de origen:</b> <a href="#historia-${esc(h.id)}">${esc(h.titulo)}</a> · <a href="#tesis-${esc(h.id)}-1">Opinión original (${esc(fechaCorta(h.tesis[0].fecha))})</a>${rev && rev.n > 1 ? ` · <a href="#tesis-${esc(h.id)}-${rev.n}">Revisión editorial (${esc(fechaCorta(rev.fecha))}${rev.simulada ? ', desenlace simulado' : ''})</a>` : ''}</p>` : '';
  const estados = Object.keys(ESTADOS).filter(k => k !== e.estado).map(k => k === 'descartado' ? '<button class="btn btn-secundario" type="button" data-estado="descartado">Marcar como descartado</button>' : k === 'archivado' ? '<button class="btn btn-secundario" type="button" data-estado="archivado">Archivar</button>' : '<button class="btn btn-secundario" type="button" data-estado="en_estudio">Volver a «en estudio»</button>').join(' ');
  $('#lab-cuerpo').innerHTML = `<div class="pag-cab"><p><a class="enlace" href="#seguimiento">← Mi seguimiento</a></p><h1 tabindex="-1">${esc(e.nombre)} <span class="chip sim">Simulación</span> <span class="chip">${ESTADOS[e.estado]}</span></h1>
      <p class="mut">${esc(e.ticker)} al ${P(e.peso_objetivo)} ${METODOS[e.metodo]}. Cartera «${esc(e.cartera_nombre)}». Creado el ${esc(fmtFechaHora(e.creado_en))}. Es una simulación: no ejecuta operaciones ni cambia la cartera.</p></div>${aviso}
    <section class="esc-ficha" aria-label="Lo que querías averiguar">
      ${e.pregunta ? `<h2>Lo que querías averiguar</h2><p class="esc-preg">«${esc(e.pregunta)}»</p>` : '<p class="mut">No guardaste ninguna pregunta en este escenario.</p>'}
      ${enlHist}${e.historia ? htmlEditorialFicha(esc, e, viva) : ''}
      <h2>Por qué lo estudias</h2><p class="nota-txt">${e.nota ? esc(e.nota) : '<span class="mut">Sin nota.</span>'}</p>
      ${e.invalidacion ? `<h2>Qué te haría cambiar de opinión</h2><p class="esc-invalidacion">${esc(e.invalidacion)}</p>` : ''}${e.revisar_en ? `<p>Fecha de revisión: <b>${esc(fechaCorta(e.revisar_en))}</b>${e.revisar_en < hoy() ? ' (la fecha ya ha pasado)' : e.revisar_en === hoy() ? ' (hoy)' : ''}.</p>` : ''}
      ${LAB.editEsc ? `<form id="esc-form" class="lab-guardar"><label for="esc-nombre">Nombre</label><input id="esc-nombre" maxlength="80" required value="${esc(e.nombre)}">
        ${htmlVinculoEdicion(esc, e)}
        <label for="esc-pregunta">Qué quiero averiguar <span class="mut">(opcional; con tus palabras)</span></label><input id="esc-pregunta" maxlength="200" value="${esc(e.pregunta)}">
        <label for="esc-nota">Por qué lo estoy estudiando</label><textarea id="esc-nota" rows="3" maxlength="600">${esc(e.nota)}</textarea>
        <label for="esc-invalidacion">Qué me haría cambiar de opinión <span class="mut">(opcional)</span></label><textarea id="esc-invalidacion" rows="2" maxlength="600">${esc(e.invalidacion || '')}</textarea>
        <label for="esc-revisar">Cuándo quiero revisarlo <span class="mut">(opcional)</span></label><input id="esc-revisar" type="date" value="${esc(e.revisar_en || '')}">
        <p class="fila"><button class="btn btn-primario" type="submit" id="esc-guardar">Guardar cambios</button><button class="btn btn-ghost" type="button" id="esc-cancelar">Cancelar</button></p><p class="error" id="esc-error" role="alert"></p></form>`
        : '<p><button class="btn btn-secundario" type="button" id="esc-editar">Editar pregunta, motivo y fecha</button></p>'}
    </section>
    ${htmlRevisiones(esc, e)}
    <section class="esc-estado" aria-label="Estado del escenario"><h2>Estado</h2><p class="mut peq">«Marcar como descartado» o archivar conservan el escenario y su historia; «Eliminar definitivamente» lo borra y no se puede deshacer. En ningún caso se toca tu cartera.</p>
      <p class="fila">${estados} <button class="btn btn-ghost peligro" type="button" id="esc-eliminar">Eliminar definitivamente</button></p><p class="error" id="esc-estado-error" role="alert"></p></section>
    <section class="lab-res"><h2>Comparación guardada</h2>${htmlEvaluacionGuardada(esc, e)}${htmlComparacion(c, cambiosEntre(e.base, e.propuesta), viva?.limite == null ? '<p class="mut">La cartera no tiene un límite personal definido ahora.</p>' : `<p class="mut peq">Con el límite que tiene ahora la cartera (${P(viva.limite)}).</p>${limitesHtml(c, viva.limite)}`)}
      <details class="mini"><summary>Composición guardada</summary><p class="peq">Base: ${esc(e.base.map(p => `${p.ticker} ${p.peso} %`).join(' · ') || 'vacía')}.</p><p class="peq">Propuesta: ${esc(e.propuesta.map(p => `${p.ticker} ${p.peso} %`).join(' · '))}.</p></details></section>`;
  restaurarFormRev();
  if (LAB.abrirRev === e.id) { LAB.abrirRev = null; const d = $('#rev-det'); if (d) { d.open = true; $('#esc-rev-t')?.scrollIntoView({ block: 'start' }); $('#rev-obs')?.focus({ preventScroll: true }); } }   // «Registrar revisión» desde el Cuaderno lleva directamente al formulario
}
// Historial de revisiones (solo se AÑADE: la hipótesis original, la base y la propuesta no se tocan). El texto es un comentario PERSONAL, no un hecho verificado.
const DECIS = { mantener: 'Mantengo la idea', descartar: 'Descarto la idea', reprogramar: 'Programo otra revisión' };
function htmlRevisiones(esc, e) {
  const l = e.revisiones || [], mk = r => `<li><p><b>${esc(fechaCorta(r.fecha))}</b> · ${DECIS[r.decision] || esc(r.decision)}${r.proxima_fecha ? ` (próxima revisión: ${esc(fechaCorta(r.proxima_fecha))})` : ''}</p>${r.observacion ? `<p><span class="mut">Tu observación:</span> ${esc(r.observacion)}</p>` : ''}${r.aprendizaje ? `<p><span class="mut">Lo que aprendiste:</span> ${esc(r.aprendizaje)}</p>` : ''}</li>`;
  return `<section class="esc-revisiones" aria-labelledby="esc-rev-t"><h2 id="esc-rev-t">Revisiones <span class="mut">(${l.length})</span></h2>
    <p class="mut peq">Anota aquí lo que has observado al volver sobre esta idea. Es <b>tu comentario personal</b>, no un dato verificado: Klever no añade lo que haya ocurrido en el mercado. Cada revisión se suma al historial; no cambia la hipótesis original ni las composiciones guardadas.</p>
    ${l.length ? `<ol class="esc-rev-lista">${l.map(mk).join('')}</ol>` : '<p class="mut">Todavía no has registrado ninguna revisión.</p>'}
    <details class="mini" id="rev-det"${e.revisar_en && e.revisar_en <= hoy() ? ' open' : ''}><summary>Registrar revisión</summary>
      <form id="rev-form" class="lab-guardar"><label for="rev-fecha">Fecha de la revisión</label><input id="rev-fecha" type="date" required value="${hoy()}">
        <label for="rev-obs">Tu observación <span class="mut">(comentario personal; opcional)</span></label><textarea id="rev-obs" rows="3" maxlength="600"></textarea>
        <label for="rev-apr">Qué has aprendido <span class="mut">(opcional)</span></label><textarea id="rev-apr" rows="2" maxlength="600"></textarea>
        <fieldset class="rev-decision"><legend>¿Qué haces con esta idea?</legend>
          <p class="fila"><input type="radio" name="rev-dec" id="rev-dec-m" value="mantener" checked> <label for="rev-dec-m">La mantengo (sin nueva fecha)</label></p>
          <p class="fila"><input type="radio" name="rev-dec" id="rev-dec-r" value="reprogramar"> <label for="rev-dec-r">Programo otra revisión</label> <input id="rev-prox" type="date" min="${hoy()}" aria-label="Fecha de la próxima revisión" disabled></p>
          <p class="fila"><input type="radio" name="rev-dec" id="rev-dec-d" value="descartar"> <label for="rev-dec-d">La descarto (se conserva en el Cuaderno como descartada)</label></p></fieldset>
        <div id="rev-estado" class="rev-estado" role="status" aria-live="polite"></div>
        <p><button class="btn btn-primario" type="submit" id="rev-btn">${rotuloBotonRev()}</button></p><p class="error" id="rev-error" role="alert"></p></form></details></section>`;
}
// Estado del registro de una revisión (ronda 22). LAB.revIntento = { intento, fase }: fase «incierto» (no se sabe si el servidor lo registró: se reintenta EL MISMO intento) o «vista» (el servidor ya lo confirmó y solo falta
// releer el escenario: se recupera la vista SIN volver a escribir). LAB.revBorrador conserva lo escrito aunque la pantalla se repinte; LAB.revMsg, el aviso visible.
const rotuloBotonRev = () => LAB.revLectura === LAB.esc?.id ? 'Reintentar la lectura' : LAB.revIntento?.fase === 'vista' ? 'Actualizar la vista' : LAB.revIntento?.fase === 'incierto' ? 'Reintentar el mismo envío' : 'Registrar revisión';
const leerBorradorRev = () => { const q = s => document.querySelector(s), dec = document.querySelector('input[name="rev-dec"]:checked')?.value || 'mantener';
  return { fecha: q('#rev-fecha').value, observacion: q('#rev-obs').value.trim(), aprendizaje: q('#rev-apr').value.trim(), decision: dec, proxima_fecha: dec === 'reprogramar' ? (q('#rev-prox').value || null) : null }; };
// El borrador de una revisión vive en memoria Y en el dispositivo (clave por escenario, caduca a los 7 días): si la sesión caduca y se vuelve a entrar con la MISMA cuenta, sigue ahí; si entra OTRA cuenta, el escenario
// no es suyo (404) y además se purgan los borradores de escenarios ajenos al cargar su Cuaderno; al cerrar sesión a propósito se borran todos.
const CLAVE_REV = 'klever_rev_', DIAS_REV = 7;
function persistirBorradorRev(b) { try { const { store } = LAB.ctx, k = CLAVE_REV + b.esc; if ((b.obs || '').trim() || (b.apr || '').trim() || b.dec !== 'mantener') store.setItem(k, JSON.stringify({ ...b, t: Date.now() })); else store.removeItem(k); } catch { /* sin almacenamiento */ } }
function leerBorradorGuardado(id) { try { const b = JSON.parse(LAB.ctx.store.getItem(CLAVE_REV + id)); if (b && b.esc === id && Date.now() - b.t < DIAS_REV * 864e5) return b; } catch { /* dañado */ } return null; }
function olvidarBorradorRev(id) { try { LAB.ctx.store.removeItem(CLAVE_REV + id); } catch { /* sin almacenamiento */ } if (LAB.revBorrador?.esc === id) LAB.revBorrador = null; }
const clavesRev = () => { const ks = []; try { for (let k = 0; k < localStorage.length; k++) { const c = localStorage.key(k); if (c && c.startsWith(CLAVE_REV)) ks.push(c); } } catch { /* sin almacenamiento */ } return ks; };   // se listan ANTES de borrar: el orden de localStorage.key() cambia al eliminar
export function purgarBorradoresRev(idsPropios = null) {                 // idsPropios: ids de los escenarios de ESTA cuenta (null = solo caducidad)
  for (const c of clavesRev()) { const id = Number(c.slice(CLAVE_REV.length)); let b = null; try { b = JSON.parse(localStorage.getItem(c)); } catch { /* dañado */ }
    if (!b || Date.now() - b.t >= DIAS_REV * 864e5 || (idsPropios && !idsPropios.includes(id))) { try { localStorage.removeItem(c); } catch { /* sin almacenamiento */ } } }
}
export function borrarBorradoresRev() { for (const c of clavesRev()) { try { localStorage.removeItem(c); } catch { /* sin almacenamiento */ } } if (LAB) LAB.revBorrador = null; }
const cuerpoDeBorrador = b => ({ fecha: b.fecha, observacion: (b.obs || '').trim(), aprendizaje: (b.apr || '').trim(), decision: b.dec, proxima_fecha: b.dec === 'reprogramar' ? (b.prox || null) : null });
function guardarBorradorRev() {
  if (!document.querySelector('#rev-form')) return;
  LAB.revBorrador = { esc: LAB.esc?.id, fecha: document.querySelector('#rev-fecha').value, obs: document.querySelector('#rev-obs').value, apr: document.querySelector('#rev-apr').value, dec: document.querySelector('input[name="rev-dec"]:checked')?.value || 'mantener', prox: document.querySelector('#rev-prox').value };
  persistirBorradorRev(LAB.revBorrador);
}
function restaurarFormRev() {
  const q = s => document.querySelector(s); if (!q('#rev-form')) return;
  const b = LAB.revBorrador?.esc === LAB.esc?.id ? LAB.revBorrador : leerBorradorGuardado(LAB.esc?.id);
  if (b && b.esc === LAB.esc?.id) { q('#rev-fecha').value = b.fecha || hoy(); q('#rev-obs').value = b.obs; q('#rev-apr').value = b.apr; const r = q(`input[name="rev-dec"][value="${b.dec}"]`); if (r) r.checked = true; q('#rev-prox').value = b.prox || ''; q('#rev-prox').disabled = b.dec !== 'reprogramar'; if (b.obs || b.apr) q('#rev-det').open = true; }
  const m = LAB.revMsg; if (m && m.esc === LAB.esc?.id) { q('#rev-estado').innerHTML = `<p class="${m.tipo === 'ok' ? 'rev-ok' : 'rev-aviso'}">${x().esc(m.texto)}</p>`; q('#rev-det').open = true; }
}
const avisarRev = (tipo, texto) => { LAB.revMsg = { esc: LAB.esc?.id, tipo, texto }; };
async function registrarRevision() {
  const { $, toast } = x(), e = LAB.esc, g = LAB.gen, btn = $('#rev-btn'), err = $('#rev-error'); err.textContent = '';
  const pend = LAB.revIntento && LAB.revIntento.intento.escId === e.id ? LAB.revIntento : null;
  const refrescar = async () => { const v = await actualizarVista(LAB.alm.escenarios, e.id); return v.ok ? v.escenario : null; };
  btn.disabled = true;
  try {
    // 0) hubo un CONFLICTO y no se pudo leer la versión actual: solo se reintenta la LECTURA (nada se envía hasta recuperarla; el texto no se toca)
    if (LAB.revLectura === e.id) {
      btn.textContent = 'Leyendo…'; const n = await refrescar(); if (!vigente(g)) return;
      if (n) { LAB.esc = n; LAB.revLectura = null; avisarRev('ok', 'Hemos cargado la versión actual. Tu texto sigue aquí: pulsa «Registrar revisión» para añadirlo.'); } else avisarRev('aviso', 'Todavía no podemos leer la versión actual. Tu texto sigue aquí y no se enviará nada hasta que la leamos: pulsa «Reintentar la lectura».');
      guardarBorradorRev(); pintarEscenario(); return;
    }
    // 1) la revisión ya está CONFIRMADA y solo falta la vista: leer, nunca reenviar (lo que haya escrito después NO se envía)
    if (pend?.fase === 'vista') {
      btn.textContent = 'Actualizando…'; const n = await refrescar(); if (!vigente(g)) return;
      if (n) { LAB.esc = n; LAB.revIntento = null; avisarRev('ok', 'Vista actualizada: tu revisión aparece en el historial.'); } else avisarRev('aviso', 'Tu revisión SÍ está guardada. Todavía no hemos podido actualizar la vista: pulsa «Actualizar la vista» cuando tengas conexión. No hace falta volver a escribirla.');
      guardarBorradorRev(); pintarEscenario(); return;
    }
    // 2) intento pendiente de resultado incierto: se reintenta EL MISMO (clave y contenido congelados), aunque el formulario tenga ahora otro texto
    const borr = leerBorradorRev();
    if (!pend && borr.decision === 'reprogramar' && !borr.proxima_fecha) { err.textContent = 'Indica la fecha de la próxima revisión.'; $('#rev-prox').focus(); return; }
    const intento = pend ? pend.intento : nuevoIntento(LAB.alm.escenarios, e, borr);
    btn.textContent = pend ? 'Comprobando…' : 'Registrando…'; guardarBorradorRev();
    const r = await enviarIntento(LAB.alm.escenarios, intento, e); if (!vigente(g)) return;
    if (r.tipo === 'confirmada') {
      guardarBorradorRev();                                           // se toma lo que haya AHORA en el formulario (la persona puede haber escrito mientras llegaba la respuesta)
      const actual = LAB.revBorrador && LAB.revBorrador.esc === e.id ? cuerpoDeBorrador(LAB.revBorrador) : null, conservar = !!actual && !mismoContenido(intento, actual);   // distinto del intento CONFIRMADO → queda en el formulario SIN enviar
      if (r.vista === 'actualizada') { LAB.esc = r.escenario; LAB.revIntento = null; } else LAB.revIntento = { intento, fase: 'vista' };
      if (!conservar) olvidarBorradorRev(e.id); else guardarBorradorRev();
      avisarRev(r.vista === 'actualizada' ? 'ok' : 'aviso', r.vista === 'pendiente' ? 'Tu revisión SÍ está guardada. No hemos podido actualizar la vista: pulsa «Actualizar la vista». No hace falta volver a escribirla.' : (conservar ? 'Se ha registrado el envío anterior. Lo que has escrito después NO se ha enviado: sigue en el formulario.' : (r.duplicado ? 'Esa revisión ya estaba registrada.' : 'Revisión registrada.')));
      toast(r.vista === 'pendiente' ? 'Revisión guardada' : 'Revisión registrada'); pintarEscenario(); if (!conservar) $('#esc-rev-t')?.scrollIntoView({ block: 'start' }); return;
    }
    if (r.tipo === 'incierto') { LAB.revIntento = { intento, fase: 'incierto' }; avisarRev('aviso', r.mensaje + ' Tu texto se conserva. «Reintentar el mismo envío» lo comprueba sin duplicarlo.'); }
    else if (r.tipo === 'conflicto') { LAB.revIntento = null; const n = await refrescar(); if (!vigente(g)) return; if (n) LAB.esc = n; avisarRev('aviso', r.mensaje + (n ? ' Hemos cargado la versión actual: pulsa «Registrar revisión» para añadirla.' : ' No hemos podido cargar la versión actual. Tu texto sigue aquí: pulsa «Reintentar la lectura» (no se enviará nada hasta que la leamos).')); if (!n) LAB.revLectura = e.id; }
    else { LAB.revIntento = null; avisarRev('aviso', r.mensaje + ' No se ha registrado nada; tu texto sigue aquí.'); }
    guardarBorradorRev(); pintarEscenario();
  } finally { const b2 = document.querySelector('#rev-btn'); if (b2) { b2.disabled = false; b2.textContent = rotuloBotonRev(); } }
}
async function aplicarCambios(cambios, mensaje, errId) {
  const { $, toast, toastError } = x(), e = LAB.esc, g = LAB.gen, z = $(errId); if (z) z.textContent = '';
  try { const r = await LAB.alm.escenarios.actualizar(e.id, { ...cambios, revision: e.revision }); if (!vigente(g)) return; LAB.esc = r; LAB.editEsc = false; toast(mensaje); pintarEscenario(); $('#lab-cuerpo h1')?.focus(); }
  catch (er) { if (!vigente(g)) return; const m = er.status === 409 ? 'Este escenario cambió en otra pestaña o dispositivo. Recarga para ver la versión actual; no se ha guardado nada.' : er.message; const zz = $(errId); if (zz) zz.textContent = m; toastError(m); }
}
function guardarCambiosEscenario() { const { $ } = x(); return aplicarCambios({ nombre: $('#esc-nombre').value, pregunta: $('#esc-pregunta').value, ...($('#esc-ref-quitar') ? { pregunta_ref: null } : $('#esc-ref') ? { pregunta_ref: $('#esc-ref').checked ? (LAB.esc.pregunta_ref || refPregunta(LAB.esc.historia, 1)) : null } : {}), revisar_en: $('#esc-revisar').value || null, nota: $('#esc-nota').value, invalidacion: $('#esc-invalidacion').value }, 'Cambios guardados', '#esc-error'); }
function cambiarEstadoEscenario(estado) { return aplicarCambios({ estado }, estado === 'descartado' ? 'Escenario marcado como descartado (se conserva)' : estado === 'archivado' ? 'Escenario archivado' : 'Escenario de nuevo en estudio', '#esc-estado-error'); }
async function eliminarEscenario() {
  const { toast, toastError, go } = x(), e = LAB.esc, g = LAB.gen;
  if (!window.confirm(`¿Eliminar definitivamente el escenario «${e.nombre}»? Se borra del todo y no se puede deshacer; tu cartera no cambia. (Si solo quieres dejar de verlo, usa «Marcar como descartado»: se conserva.)`)) return;
  try { await LAB.alm.escenarios.borrar(e.id); if (!vigente(g)) return; toast('Escenario eliminado'); go('#seguimiento'); } catch (er) { if (vigente(g)) toastError(er.message); }
}
