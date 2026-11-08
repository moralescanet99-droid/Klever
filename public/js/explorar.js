// Fase 1 (ronda 33) · pantalla EXPLORAR EMPRESAS y FICHA de empresa (antes, dentro de app.js). Recibe lo que necesita de la app con iniciarExplorar(ctx).
import { $, $$, esc, nf, pct, miles, norm } from './base.js';
import { svgHuella } from './huella.js';
import { abrirLab, enRadar, origenFicha, pintarFichaRadar } from './lab.js';
let XE = null;   // contexto: { current, pos, by, leerBorrador, getJson, toastError }
export const iniciarExplorar = ctx => { XE = ctx; };
// ---------- explorar empresas ----------
// Cada comprobación: [nombre, regla, formato → [cifra, unidad]]. La unidad larga va aparte para no competir con la regla.
const CRIT = {
  deuda_ebitda: ['Deuda sobre EBITDA', 'Se supera si la deuda neta es menor de 2,5 veces el EBITDA', v => [nf(v, Math.abs(v) < 0.1 && v !== 0 ? 2 : 1), 'veces']],
  roic: ['ROIC', 'Se supera si es mayor del 10 %', v => [pct(v), '']],
  margen_neto: ['Margen neto', 'Se supera si el beneficio neto supera el 10 % de las ventas', v => [pct(v), '']],
  flujo_caja: ['Caja libre', 'Se supera si el flujo de caja libre es positivo', v => [nf(v / 1e9), 'miles de millones de USD']],
  crecimiento: ['Crecimiento de ventas', 'Se supera si las ventas suben respecto al año anterior', v => [pct(v), '']],
};
export let empresas = [];
const marcaRadar = t => enRadar(t) ? ' <span class="chip radar">★ La sigues</span>' : '';
const ABR = { deuda_ebitda: 'Deuda', roic: 'ROIC', margen_neto: 'Margen', flujo_caja: 'Caja libre', crecimiento: 'Crecimiento' };
// Ronda 28 · glosario en palabras llanas (al pulsar), para quien no conoce los términos. Describe la comprobación; no dice si comprar.
const GLOSA = { deuda_ebitda: 'Deuda: si la empresa podría pagar lo que debe con menos de 2,5 años de su beneficio bruto (EBITDA).', roic: 'ROIC: cuánto gana la empresa por cada euro que invierte en su negocio. Se pide más del 10 %.',
  margen_neto: 'Margen: de cada 100 € que vende, cuántos le quedan de beneficio. Se pide más de 10 €.', flujo_caja: 'Caja libre: si le sobra dinero después de pagar su actividad y sus inversiones.', crecimiento: 'Crecimiento: si vendió más que el año anterior.' };
$$('[data-glosa]').forEach(b => b.addEventListener('click', () => { const g = $('#glosa'), k = b.dataset.glosa, mismo = !g.hidden && g.dataset.k === k; g.hidden = mismo; g.dataset.k = k; g.textContent = GLOSA[k]; $$('[data-glosa]').forEach(q => q.setAttribute('aria-pressed', String(!mismo && q === b))); }));
// Sectores que ya tiene la cartera abierta (o el borrador de este dispositivo): para «Solo sectores que no tengo».
const sectoresMios = () => { const l = XE.current() ? XE.pos() : (XE.leerBorrador()?.pos || []), by = XE.by(); return new Set(l.filter(p => p.peso > 0).map(p => by[p.ticker]?.sector).filter(Boolean)); };
const pildoras = r => `<ul class="pil" aria-label="Comprobaciones de ${esc(r.nombre)}">${Object.keys(ABR).map(k => { const x = r.criterios?.[k]; // el estado va escrito, no solo en color
  const e = x?.ok === true ? ['ok', '✓', 'superada'] : x?.ok === false ? ['no', '✗', 'no superada'] : ['nd', '–', 'sin datos'];
  return `<li class="pil-${e[0]}"><span aria-hidden="true">${e[1]}</span> ${ABR[k]}<span class="sr">: ${e[2]}</span></li>`; }).join('')}</ul>`;
// Ronda 28 (fase 2): de la lista al laboratorio en un toque («Probar en mi cartera»), sin pasar por la ficha. No recomienda: solo abre la simulación.
const botonProbar = r => `<button class="probar-emp" type="button" data-probar-emp="${esc(r.ticker)}">Probar<span class="sr"> ${esc(r.nombre)} en mi cartera</span></button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-probar-emp]'); if (b) abrirLab({ carteraId: null, ticker: b.dataset.probarEmp, peso: 10, fin: 'proporcional' }); });
// Ronda 28 (fase 2) · monograma de cada empresa (dos letras y el color de su sector): reconocible de un vistazo y sin logotipos externos (regla: sin fuentes externas)
const SECT_COL = new Map(); const colSector = sec => { if (!SECT_COL.has(sec)) SECT_COL.set(sec, SECT_COL.size % 8); return SECT_COL.get(sec); };
const monograma = r => `<span class="mono" style="--c:var(--c${colSector(r.sector || '')})" aria-hidden="true">${esc((r.ticker || '?').replace(/[^A-Z]/g, '').slice(0, 2))}</span>`;
const BUSQ = 'klever_busqueda_emp'; // la búsqueda sobrevive a abrir la ficha, cambiar de pantalla y recargar (solo en esta pestaña)
const busqLeer = () => { try { return sessionStorage.getItem(BUSQ) || ''; } catch { return ''; } };
const busqGuardar = v => { try { v ? sessionStorage.setItem(BUSQ, v) : sessionStorage.removeItem(BUSQ); } catch { /* sin almacenamiento: la búsqueda sigue en el campo */ } };
const FILT = 'klever_filtros_emp'; // filtros de Explorar: se conservan como la búsqueda (solo esta pestaña)
const filtrosLeer = () => { try { return { sector: '', crit: '', estado: '', radar: false, faltan: false, ...JSON.parse(sessionStorage.getItem(FILT)) }; } catch { return { sector: '', crit: '', estado: '', radar: false }; } };
export const filtrosGuardar = f => { try { (f.sector || f.crit || f.estado || f.radar || f.faltan) ? sessionStorage.setItem(FILT, JSON.stringify(f)) : sessionStorage.removeItem(FILT); } catch { /* sin almacenamiento */ } };
const filtrosActuales = () => ({ sector: $('#emp-sector').value, crit: $('#emp-crit').value, estado: $('#emp-estado').value, radar: $('#emp-radar').checked, faltan: $('#emp-faltan').checked });
const pasaFiltros = (r, f) => {
  if (f.sector && r.sector !== f.sector) return false;
  if (f.radar && !enRadar(r.ticker)) return false;
  if (f.faltan && sectoresMios().has(r.sector)) return false;
  if (f.estado) { // «Superada / No superada / Sin datos» de UNA comprobación (o de alguna de las cinco); no se calcula ninguna puntuación
    const claves = f.crit ? [f.crit] : Object.keys(ABR), est = k => r.criterios?.[k]?.ok === true ? 'ok' : r.criterios?.[k]?.ok === false ? 'no' : 'nd';
    if (!claves.some(k => est(k) === f.estado)) return false;
  }
  return true;
};
export function poblarSectores() {
  const sel = $('#emp-sector'), f = filtrosLeer(), sectores = [...new Set(empresas.map(r => r.sector))].sort((p, q) => p.localeCompare(q, 'es'));
  sel.innerHTML = '<option value="">Todos</option>' + sectores.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  sel.value = sectores.includes(f.sector) ? f.sector : ''; $('#emp-crit').value = f.crit; $('#emp-estado').value = f.estado; $('#emp-radar').checked = !!f.radar; $('#emp-faltan').checked = !!f.faltan;
}
const TANDA_EMP = 24; let empTanda = TANDA_EMP, empFirma = null;
export function renderEmpresas() {
  const bruto = $('#emp-buscar').value.trim(), q = norm(bruto), tb = $('#empresas-lista'), ul = $('#empresas-cards'), filt = filtrosActuales(), hayFiltro = !!(filt.sector || filt.estado || filt.radar || filt.faltan);
  const vistas = empresas.filter(r => (!q || norm(r.ticker + ' ' + r.nombre + ' ' + r.sector).includes(q)) && pasaFiltros(r, filt));
  const resultado = r => { const nd = r.sin_datos ?? 5 - r.evaluados; // sin datos NO es una comprobación fallida ni una evaluación completa: se muestra como parcial
    return nd ? `<span class="marca-n">${r.cumplidos} superadas</span><small class="sin-d">${nd} sin datos</small>` : `<span class="marca-n">${r.cumplidos} de 5 superadas</span>`; };
  const vacio = empresas.length ? `Ninguna empresa coincide con ${bruto ? `«${esc(bruto)}»${hayFiltro ? ' y los filtros elegidos' : ''}` : 'los filtros elegidos'}. <button class="enlace" type="button" data-borrar-busqueda>${hayFiltro ? 'Borrar búsqueda y filtros' : 'Borrar búsqueda'}</button>` : 'Aún no hay datos de empresas cargados.';
  tb.innerHTML = vistas.length ? vistas.map(r => `<tr><td>${monograma(r)}<span class="nombre-emp">${esc(r.nombre)}</span> <span class="simbolo">${esc(r.ticker)}</span>${marcaRadar(r.ticker)}</td><td>${esc(r.sector)}</td>
      <td class="num"><span class="emp-res">${svgHuella(r.criterios, { tam: 30 })}${resultado(r)}</span>${pildoras(r)}</td>
      <td><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button>${botonProbar(r)}</td></tr>`).join('')
    : `<tr><td colspan="4" class="estado-lista">${vacio}</td></tr>`;
  // ronda 31: en el móvil, las tarjetas van por tandas (la búsqueda y los filtros siempre buscan en todas); la tabla de escritorio las muestra todas
  const firmaQ = bruto + '|' + JSON.stringify(filt); if (firmaQ !== empFirma) { empFirma = firmaQ; empTanda = TANDA_EMP; }
  const enTanda = vistas.slice(0, empTanda), quedan = vistas.length - enTanda.length;
  ul.innerHTML = vistas.length ? enTanda.map(r => `<li class="emp-card">
      <div class="ec-l1">${monograma(r)}<span class="nombre-emp">${esc(r.nombre)}${marcaRadar(r.ticker)}</span><span class="ec-res">${svgHuella(r.criterios, { tam: 34 })}${resultado(r)}</span></div>
      <div class="ec-l2"><span class="simbolo">${esc(r.ticker)}</span><span class="ec-sector">${esc(r.sector)}</span><button class="ver-ficha" type="button" data-t="${esc(r.ticker)}">Ver ficha<span class="sr"> de ${esc(r.nombre)}</span></button>${botonProbar(r)}</div>${pildoras(r)}</li>`).join('') + (quedan > 0 ? `<li class="emp-mas"><button class="btn btn-secundario" type="button" data-emp-mas>Mostrar ${Math.min(TANDA_EMP, quedan)} más <span class="mut">(quedan ${quedan})</span></button></li>` : '')
    : `<li class="estado-lista">${vacio}</li>`;
  $('#emp-cuenta').textContent = empresas.length ? (q || hayFiltro ? `${vistas.length} de ${empresas.length} empresas` : `${empresas.length} empresas`) : '';
  const nf = [filt.sector, filt.estado, filt.radar, filt.faltan].filter(Boolean).length; $('#emp-filtros-n').textContent = nf ? `(${nf} activo${nf > 1 ? 's' : ''})` : ''; if (nf) $('#emp-filtros-det').open = true;
  $('#emp-borrar').hidden = !bruto && !hayFiltro; $('#emp-borrar').textContent = hayFiltro ? 'Borrar búsqueda y filtros' : 'Borrar búsqueda';
}
export async function loadEmpresas() {
  $('#empresas-lista').innerHTML = '<tr><td colspan="4" class="estado-lista">Cargando empresas…</td></tr>';
  $('#empresas-cards').innerHTML = '<li class="estado-lista esq-lista"><span class="sr">Cargando empresas…</span><span class="esq bajo"></span><span class="esq bajo"></span><span class="esq bajo"></span></li>';
  try { empresas = await XE.getJson('/ideas'); }
  catch { const m = 'No se pudieron cargar las empresas. <button class="enlace" data-retry="empresas" type="button">Reintentar</button>'; $('#empresas-lista').innerHTML = `<tr><td colspan="4" class="estado-lista">${m}</td></tr>`; $('#empresas-cards').innerHTML = `<li class="estado-lista">${m}</li>`; return; }
  poblarSectores(); renderEmpresas();
}
$('#empresas-cards').addEventListener('click', e => { const b = e.target.closest('[data-emp-mas]'); if (!b) return; const n = $$('#empresas-cards .emp-card').length; empTanda += TANDA_EMP; renderEmpresas(); $$('#empresas-cards .emp-card')[n]?.querySelector('.ver-ficha')?.focus({ preventScroll: true }); });
$('#emp-buscar').addEventListener('input', () => { busqGuardar($('#emp-buscar').value.trim()); renderEmpresas(); });
const borrarBusqueda = () => { $('#emp-buscar').value = ''; busqGuardar(''); $('#emp-sector').value = ''; $('#emp-crit').value = ''; $('#emp-estado').value = ''; $('#emp-radar').checked = false; $('#emp-faltan').checked = false; filtrosGuardar(filtrosActuales()); renderEmpresas(); $('#emp-buscar').focus(); };
$('#emp-borrar').addEventListener('click', borrarBusqueda);
for (const id of ['#emp-sector', '#emp-crit', '#emp-estado', '#emp-radar', '#emp-faltan']) $(id).addEventListener('change', () => { filtrosGuardar(filtrosActuales()); renderEmpresas(); });
$('#empresas-lista').addEventListener('click', e => { if (e.target.closest('[data-borrar-busqueda]')) borrarBusqueda(); });
$('#empresas-cards').addEventListener('click', e => { if (e.target.closest('[data-borrar-busqueda]')) borrarBusqueda(); });
$('#emp-buscar').value = busqLeer();
for (const lista of [$('#empresas-lista'), $('#empresas-cards')]) lista.addEventListener('click', e => { const b = e.target.closest('[data-t]') || e.target.closest('tr,li')?.querySelector('[data-t]'); if (b) verFicha(b.dataset.t); });
$('#ir-screener').addEventListener('click', () => { const s = $('#filtros-precio'); s.scrollIntoView({ behavior: 'auto' }); s.focus({ preventScroll: true }); }); // salto largo: sin animación

export async function verFicha(t) {
  let a; try { a = await XE.getJson('/assets/' + t); } catch { return XE.toastError('No se pudo cargar la ficha'); }
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
  const huella = `<div class="ficha-huella">${svgHuella(c, { tam: 150, etiquetas: true, titulo: `Huella de ${a.nombre}: ${ok} de 5 comprobaciones superadas, ${no} no superadas, ${nd} sin datos` })}<p class="mut peq">La huella: cuanto más llena, más comprobaciones supera. Un punto hueco es un dato que falta, no un suspenso. No es una recomendación.</p></div>`;
  $('#fi-cuerpo').innerHTML = `<div id="fi-radar" class="fi-radar"></div>${huella}${principal}<p class="resumen-ficha">${nd ? 'Evaluación parcial: ' : ''}${resumenF}</p>
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

