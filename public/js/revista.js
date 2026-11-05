// Revista (versión interna): listado, historia y tesis con su revisión. Legible sin cuenta. El contenido vive en contenido.js.
import { HISTORIAS, AVISO_FICTICIO, historia, tesisDe, revisionDe, fechaCorta } from './contenido.js';

const REV = { ctx: null };
const rx = () => REV.ctx;

export function iniciarRevista(ctx) {
  REV.ctx = ctx;
  for (const id of ['#vista-revista', '#vista-articulo']) ctx.$(id).addEventListener('click', e => {
    const p = e.target.closest('[data-probar]'); if (p) { ctx.probar({ ticker: p.dataset.probar, historia: p.dataset.historia }); return; }
    const f = e.target.closest('[data-ficha]'); if (f) ctx.verFicha(f.dataset.ficha);
  });
}

const refs = (esc, txt) => esc(txt).replace(/\[(\d)\]/g, '<sup class="ref">[$1]</sup>');
const lista = (esc, xs) => `<ul>${xs.map(x => `<li>${refs(esc, x)}</li>`).join('')}</ul>`;

export function mostrarRevista() {
  const { $, esc } = rx(), cont = $('#revista-cuerpo');
  cont.innerHTML = HISTORIAS.map(h => {
    const ult = h.tesis[h.tesis.length - 1];
    return `<article class="rev-tarjeta"><p class="rev-chips"><span class="chip sim">Caso ficticio</span> <span class="chip">Historia · ${esc(fechaCorta(h.fecha))}</span> ${h.tesis.length > 1 ? '<span class="chip">Opinión con revisión</span>' : '<span class="chip">Opinión</span>'}</p>
      <h2><a href="#historia-${esc(h.id)}">${esc(h.titulo)}</a></h2><p>${esc(h.bajada)}</p>
      <p class="mut peq">Por ${esc(h.autor)} · Empresa vinculada: ${esc(h.empresa)}</p>
      <p class="rev-enlaces"><a class="btn btn-primario" href="#historia-${esc(h.id)}">Leer la historia</a> <a class="btn btn-secundario" href="#tesis-${esc(h.id)}-1">Leer la opinión de «El Superespeculador» (ejemplo)</a>
      ${ult.n > 1 ? `<a class="btn btn-ghost" href="#tesis-${esc(h.id)}-${ult.n}">Ver la revisión (${esc(fechaCorta(ult.fecha))})</a>` : ''}</p></article>`;
  }).join('');
}

function fuentes(esc, h) {
  return `<details class="art-fuentes"><summary>Fuentes (${h.fuentes.length})</summary>
    <ol>${h.fuentes.map(f => `<li>${esc(f.titulo)} · ${esc(fechaCorta(f.fecha))} · <span class="mut">${esc(f.tipo)}</span></li>`).join('')}</ol>
    ${h.ficticia ? '<p class="mut peq">Todas las fuentes son documentos de ejemplo inventados para esta demostración: no hay enlace porque no existen.</p>' : ''}</details>`;
}
function cta(esc, h) {
  if (!h.ticker) return `<section class="art-acc" aria-label="Qué hacer con esta historia"><p><a class="btn btn-primario" href="#empresas">Explorar empresas relacionadas</a></p><p class="mut peq">Este contenido no trata de una posición concreta, así que no se elige ninguna empresa por ti.</p></section>`;
  return `<section class="art-acc" aria-label="Qué hacer con esta historia"><p><button class="btn btn-primario" type="button" data-probar="${esc(h.ticker)}" data-historia="${esc(h.id)}">Explorar esta idea en una simulación</button>
    <button class="btn btn-secundario" type="button" data-ficha="${esc(h.ticker)}">Ver la ficha de ${esc(h.empresa)}</button></p>
    <p class="mut peq">«Explorar esta idea en una simulación» abre el laboratorio con ${esc(h.empresa)} ya elegida; allí puedes comparar con tu cartera y <b>guardar tu pregunta en el Cuaderno</b>. Si no tienes cartera, te ofrece una de ejemplo; es una simulación y no cambia nada.</p></section>`;
}
function desconocido(esc, h) {
  return h.desconocido?.length ? `<section class="art-desconocido" aria-label="Qué se desconoce"><h2>Qué no sabemos</h2>${lista(esc, h.desconocido)}</section>` : '';
}

export function mostrarArticulo({ tipo, id, n }) {
  const { $, esc, go } = rx(), cont = $('#articulo-cuerpo'), h = historia(id);
  if (!h || (tipo === 'tesis' && !tesisDe(h, n))) { cont.innerHTML = '<p class="estado-lista">No encontramos esa pieza.</p><p><a class="btn btn-secundario" href="#revista">Volver a la revista</a></p>'; return; }
  const aviso = h.ficticia ? `<p class="art-aviso" role="note"><b>Caso ficticio.</b> ${esc(AVISO_FICTICIO.replace(/^Caso ficticio: /, '').replace(/^./, c => c.toUpperCase()))}</p>` : '';
  if (tipo === 'historia') {
    cont.innerHTML = `<article class="art"><p><a class="enlace" href="#revista">← Revista</a></p>${aviso}
      <h1>${esc(h.titulo)}</h1><p class="art-bajada">${esc(h.bajada)}</p>
      <p class="art-firma">Por <b>${esc(h.autor)}</b> · <time datetime="${esc(h.fecha)}">${esc(fechaCorta(h.fecha))}</time> · Empresa vinculada: <button class="enlace" type="button" data-ficha="${esc(h.ticker)}">${esc(h.empresa)}</button></p>
      ${h.resumen ? `<section class="art-resumen" aria-label="En breve"><h2>En breve</h2><dl><div><dt>Qué hace el negocio</dt><dd>${esc(h.resumen.negocio)}</dd></div><div><dt>Por qué merece estudio</dt><dd>${esc(h.resumen.estudio)}</dd></div><div><dt>Qué podría salir mal</dt><dd>${esc(h.resumen.riesgo)}</dd></div></dl><p class="mut peq">Sigue la lectura completa y, al final, las fuentes.</p></section>` : ''}
      ${h.bloques.map(b => b.t === 'h2' ? `<h2>${esc(b.x)}</h2>` : b.t === 'p' ? `<p>${refs(esc, b.x)}</p>` : b.t === 'ul' ? lista(esc, b.x)
        : `<div class="tabla-h" role="region" aria-label="Estado de los proyectos" tabindex="0"><table class="tabla-lab"><thead><tr>${b.cab.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.filas.map(f => `<tr><th scope="row">${esc(f[0])}</th>${f.slice(1).map(c => `<td>${refs(esc, c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('')}
      <p class="art-opinion"><a class="btn btn-secundario" href="#tesis-${esc(h.id)}-1">Leer la opinión de El Superespeculador</a></p>
      ${desconocido(esc, h)}${cta(esc, h)}${fuentes(esc, h)}</article>`;
    return;
  }
  const t = tesisDe(h, n), posterior = revisionDe(h, t.n);
  const versiones = h.tesis.map(x => `<a href="#tesis-${esc(h.id)}-${x.n}"${x.n === t.n ? ' aria-current="page"' : ''} class="${x.n === t.n ? 'actual' : ''}">${x.revisa ? 'Revisión' : 'Tesis original'} · ${esc(fechaCorta(x.fecha))}</a>`).join('');
  cont.innerHTML = `<article class="art"><p><a class="enlace" href="#historia-${esc(h.id)}">← La historia</a></p>${aviso}
    <nav class="art-versiones" aria-label="Versiones de la tesis">${versiones}</nav>
    <h1>${esc(t.titulo)}</h1>
    <p class="art-firma">Firmada por <b>${esc(t.firma)}</b> · <time datetime="${esc(t.fecha)}">${esc(fechaCorta(t.fecha))}</time>${t.revisa ? ` · Revisa <a href="#tesis-${esc(h.id)}-${t.revisa}">la tesis del ${esc(fechaCorta(tesisDe(h, t.revisa).fecha))}</a>` : ''}</p>
    ${t.simulada ? `<p class="art-aviso" role="note"><b>Desenlace simulado.</b> ${esc(t.resultado)}</p>` : ''}
    ${posterior ? `<p class="art-aviso art-posterior" role="note"><b>Esta tesis tiene una revisión posterior</b> (${esc(fechaCorta(posterior.fecha))}). Se conserva tal como se publicó. <a href="#tesis-${esc(h.id)}-${posterior.n}">Ver la revisión</a></p>` : ''}
    <h2>Hecho observado</h2>${lista(esc, t.hecho)}
    <h2>Interpretación del autor</h2>${lista(esc, t.interpretacion)}
    <h2>Qué me haría cambiar de opinión</h2>${lista(esc, t.cambiaria)}
    <h2>Pregunta para seguir</h2><p><b>${esc(t.pregunta)}</b></p>${t.revisionPrevista ? `<p class="mut">Fecha prevista para revisar esta opinión: <b>${esc(fechaCorta(t.revisionPrevista))}</b>.</p>` : ''}
    ${desconocido(esc, h)}${cta(esc, h)}${fuentes(esc, h)}</article>`;
}
