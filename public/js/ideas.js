// Vistas de «Cartera de ejemplo» y «Comparar con otra empresa». Presentación; los cálculos están en comparador.js y nota.js.
import { CARTERA_EJEMPLO, CARTERA_EJEMPLO_INCOMPLETA } from './contenido.js';
import { compararEmpresas } from './comparador.js';
import { evaluar } from './nota.js';
import { htmlNotaEstructura } from './nota-ui.js';

const ID = { ctx: null, incompleto: false };
const xi = () => ID.ctx;
export function iniciarIdeas(ctx) {
  ID.ctx = ctx;
  ctx.$('#vista-ejemplo').addEventListener('click', e => {
    if (e.target.closest('#ej-lab')) ctx.abrirEjemplo(); else if (e.target.closest('[data-ej]')) { const inc = e.target.closest('[data-ej]').dataset.ej === 'incompleta'; if (inc !== ID.incompleto) { ID.incompleto = inc; mostrarEjemplo().then(() => ctx.$('#ejemplo-cuerpo [data-ej][aria-pressed="true"]')?.focus()); } } else if (e.target.closest('#ej-crear')) { ctx.go('#inicio'); setTimeout(() => ctx.$('#plantillas')?.scrollIntoView(), 50); }
  });
  ctx.$('#vista-comparar').addEventListener('click', e => {
    const b = e.target.closest('[data-comparar-con]'); if (b) { ctx.go(`#comparar-${b.dataset.a}-${b.dataset.compararCon}`); return; }
    const p = e.target.closest('[data-probar]'); if (p) ctx.probar({ ticker: p.dataset.probar });
    const f = e.target.closest('[data-ficha]'); if (f) ctx.verFicha(f.dataset.ficha);
  });
}
const C = v => String(v).replace('.', ',');
export async function mostrarEjemplo(inicio) {
  if (inicio) ID.incompleto = false;
  const { $, esc } = xi(), cont = $('#ejemplo-cuerpo'), act = xi().activos(), g = xi().gen?.() ;
  const EJ = ID.incompleto ? CARTERA_EJEMPLO_INCOMPLETA : CARTERA_EJEMPLO, pos = EJ.posiciones;
  const sel = (id, txt) => `<button class="btn btn-secundario ej-opc" type="button" data-ej="${id}" aria-pressed="${(id === 'incompleta') === ID.incompleto}">${txt}</button>`;
  cont.innerHTML = `<div class="pag-cab"><h1>${esc(EJ.nombre)}</h1><p class="mut">${esc(EJ.aviso)}</p><p><span class="chip sim">Ejemplo con datos ficticios</span></p></div>
    <div class="ej-sel" role="group" aria-label="Elige un ejemplo">${sel('completa', 'KO + PG · con nota')}${sel('incompleta', 'KO + JPM · evaluación parcial')}</div>
    <div class="ej-barra" role="img" aria-label="Reparto: ${esc(pos.map(p => `${p.ticker} ${p.peso} %`).join(', '))}">${pos.map((p, i) => `<i style="--c:var(--c${i});width:${p.peso}%">${esc(p.ticker)} ${p.peso} %</i>`).join('')}</div>
    <div id="ej-nota" role="region" aria-label="Nota de estructura del ejemplo" aria-live="polite"><p class="mut peq">Calculando la nota de estructura…</p></div>
    <p class="ej-acc">${ID.incompleto ? '' : '<button class="btn btn-primario" type="button" id="ej-lab">Probar un cambio en esta cartera</button> '}<button class="btn btn-secundario" type="button" id="ej-crear">Crear mi primera cartera</button></p>
    <ul class="ej-lista">${pos.map(p => `<li><p class="ej-cab"><b>${esc(act[p.ticker]?.nombre || p.ticker)}</b> <span class="simbolo">${esc(p.ticker)}</span> · <b>${p.peso} %</b></p><p>${esc(p.razon)}</p></li>`).join('')}</ul>
    <p class="mut peq"><a href="#revista">Lee una historia para investigar una empresa</a> y pruébala aquí.</p>`;
  try { const u = await xi().universo(); const o = xi().origen(); $('#ej-nota').innerHTML = htmlNotaEstructura(esc, evaluar(pos, u), o); } catch { $('#ej-nota').innerHTML = '<p class="mut peq">La nota de estructura no está disponible ahora.</p>'; }
}

export async function mostrarComparar({ a, b }) {
  const { $, esc } = xi(), cont = $('#comparar-cuerpo'), lista = xi().empresas(), act = xi().activos();
  if (!act[a]) { cont.innerHTML = '<p class="estado-lista">No encontramos esa empresa.</p><p><a class="btn btn-secundario" href="#empresas">Volver a empresas</a></p>'; return; }
  const sector = act[a].sector;
  if (!b) {                                                              // paso 1: elegir con quién comparar (mismo sector); una sola decisión
    const otras = lista.filter(r => r.sector === sector && r.ticker !== a);
    cont.innerHTML = `<p><button class="enlace" type="button" data-ficha="${esc(a)}">← Ficha de ${esc(act[a].nombre)}</button></p><div class="pag-cab"><h1>Comparar ${esc(act[a].nombre)} (${esc(a)}) con otra empresa</h1><p class="mut">Solo empresas del mismo sector (${esc(sector)}), para que la comparación tenga sentido. Verás tres cifras y de dónde sale cada una; no hay clasificación de ganadores.</p></div>
      ${otras.length ? `<ul class="cmp-lista">${otras.map(r => `<li><button class="btn btn-secundario" type="button" data-a="${esc(a)}" data-comparar-con="${esc(r.ticker)}">${esc(r.nombre)} <span class="simbolo">${esc(r.ticker)}</span></button></li>`).join('')}</ul>` : '<p class="estado-lista">No hay otras empresas de este sector en el universo.</p>'}`;
    return;
  }
  cont.innerHTML = '<p class="mut">Cargando la comparación…</p>'; const g = xi().sesion();
  let A, B; try { [A, B] = await Promise.all([xi().getJson('/assets/' + a), xi().getJson('/assets/' + b)]); } catch { cont.innerHTML = '<p class="estado-lista">No se pudo cargar la comparación. <a href="#comparar-' + esc(a) + '">Reintentar</a></p>'; return; }
  if (g !== xi().sesion()) return;
  const r = compararEmpresas(A, B);
  // ronda 32: si todas las cifras salen del mismo periodo, fuente y carga, la procedencia se dice UNA vez (antes se repetía en cada celda)
  const txtOrigen = o => `${o.periodo} · ${o.fuente === 'sec' ? 'SEC' : o.fuente === 'prueba' ? 'datos de prueba' : o.fuente === 'demo' ? 'datos de demostración' : 'sin fuente verificada'}${o.fecha ? ' · cargado ' + o.fecha : ''}`;
  const origenes = r.filas.flatMap(f => [f.a, f.b]).filter(c => c.origen).map(c => txtOrigen(c.origen)), origenUnico = origenes.length && origenes.every(o => o === origenes[0]) ? origenes[0] : null;
  const celda = (c, emp) => `<td data-emp="${esc(emp)}">${c.estado === 'ok' ? `<span class="cmp-valor">${esc(c.texto)}</span>` : `<span class="cmp-estado">${c.estado === 'sin_dato' ? 'Sin dato' : 'No comparable'}</span><span class="cmp-motivo">${esc(c.motivo)}</span>`}
    ${c.origen && !origenUnico ? `<span class="cmp-origen">${esc(txtOrigen(c.origen))}</span>` : ''}</td>`;
  cont.innerHTML = `<p><a class="enlace" href="#comparar-${esc(a)}">← Elegir otra empresa</a></p>
    <div class="pag-cab"><h1>${esc(A.nombre)} frente a ${esc(B.nombre)}</h1><p class="mut">${r.ejercicio ? `Ejercicio comparado: ${esc(r.ejercicio)} (el último que tienen los dos). ` : ''}Importes en ${esc(r.moneda)}. Una cifra distinta no significa «mejor» ni «peor»: depende del negocio y del momento.${r.mismoSector ? '' : ' Atención: no son del mismo sector.'}</p></div>
    <div class="tabla-h" role="region" aria-label="Comparación de tres cifras" tabindex="0"><table class="tabla-lab tabla-cmp"><thead><tr><th scope="col">Cifra</th><th scope="col">${esc(A.nombre)} <span class="simbolo">${esc(a)}</span></th><th scope="col">${esc(B.nombre)} <span class="simbolo">${esc(b)}</span></th></tr></thead><tbody>
      ${r.filas.map(f => `<tr><th scope="row">${esc(f.nombre)}<small class="cmp-def">${esc(f.definicion)} (${esc(f.unidad)})</small></th>${celda(f.a, a)}${celda(f.b, b)}</tr>`).join('')}</tbody></table></div>${origenUnico ? `<p class="cmp-fuente mut peq">Todas las cifras: ${esc(origenUnico)}</p>` : ''}
    <p class="art-acc"><button class="btn btn-primario" type="button" data-probar="${esc(b)}">Probar ${esc(B.nombre)} en mi cartera</button></p>
    <p class="mut peq">La acción abre el laboratorio con ${esc(B.nombre)} ya elegida: allí verás cuánto espacio ocuparía y quién cedería ese peso.</p>`;
}
