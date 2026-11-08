// Fase 2 (ronda 35) · RUEDA DE ESFERAS (inspirada en el vídeo de C48): una lista vertical en arco; la esfera del centro crece y a su lado aparece
// su dato en una cifra grande y fina con una frase corta. Se gira con el dedo, la rueda del ratón o las flechas; al tocar la del centro se abre una
// hoja de cristal con el detalle. Con «reducir movimiento» no gira sola ni anima: es una lista con el mismo contenido.
// items: [{ etiqueta, tono: [colorA, colorB], aria, cifra, eti, frase }]. opciones: { titulo, alAbrir(i) → html, inicio, auto }.
import { esc } from './base.js';
const ALTO = 66;   // alto de cada fila (px)
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Esfera iridiscente solo con CSS: dos tonos, brillo especular y un borde de luz (sin imágenes ni WebGL).
export const estiloEsfera = ([a, b]) => `--o1:${a};--o2:${b}`;

export function montarRueda(cont, items, { titulo = '', alAbrir = null, inicio = 0, auto = true } = {}) {
  if (!cont || !items.length) return null;
  cont.classList.add('rueda');
  cont.innerHTML = `<div class="rueda-pista" tabindex="0" role="listbox" aria-label="${esc(titulo)}" aria-activedescendant="">
      <ul class="rueda-lista">${items.map((x, i) => `<li class="rueda-item" id="${cont.id}-o${i}" role="option" aria-selected="false" data-i="${i}"><button class="orbe" type="button" tabindex="-1" style="${estiloEsfera(x.tono)}" aria-label="${esc(x.aria)}"><span class="orbe-in"></span></button><span class="orbe-et">${esc(x.etiqueta)}</span></li>`).join('')}</ul></div>
    <div class="rueda-dato" aria-live="polite"><span class="rd-eti"></span><b class="rd-cifra"></b><span class="rd-frase"></span>${alAbrir ? '<button class="enlace rd-ver" type="button">Ver detalle</button>' : ''}</div>
    <div class="rueda-hoja" role="dialog" aria-modal="false" aria-label="Detalle" hidden><button class="rueda-cerrar" type="button" aria-label="Cerrar el detalle">×</button><div class="rueda-hoja-in"></div></div>`;
  const pista = cont.querySelector('.rueda-pista'), lis = [...cont.querySelectorAll('.rueda-item')], dato = cont.querySelector('.rueda-dato'), hoja = cont.querySelector('.rueda-hoja');
  let actual = -1, pendiente = false, objetivo = inicio;   // objetivo: la esfera a la que se va (al redimensionar se vuelve a ella, no a la que pasaba)
  const relleno = () => { const m = Math.max(0, pista.clientHeight / 2 - ALTO / 2); pista.firstElementChild.style.paddingBlock = m + 'px'; };
  const centrar = (i, suave = true) => { objetivo = i; pista.scrollTo({ top: i * ALTO, behavior: suave && !quieto() ? 'smooth' : 'auto' }); };
  const pintar = () => {
    pendiente = false;
    const c = pista.scrollTop / ALTO, i = Math.max(0, Math.min(items.length - 1, Math.round(c)));
    if (!quieto()) lis.forEach((li, k) => { const d = k - c, a = Math.min(Math.abs(d), 3.2);
      li.style.transform = `translateX(${(a * a * 7).toFixed(1)}px) scale(${(1.18 - a * 0.16).toFixed(3)})`; li.style.opacity = (1 - a * 0.22).toFixed(2); });
    if (i !== actual) {
      actual = i; const x = items[i];
      lis.forEach((li, k) => { li.classList.toggle('centro', k === i); li.setAttribute('aria-selected', String(k === i)); });
      pista.setAttribute('aria-activedescendant', lis[i].id);
      dato.querySelector('.rd-eti').textContent = x.eti || ''; dato.querySelector('.rd-cifra').textContent = x.cifra || ''; dato.querySelector('.rd-frase').textContent = x.frase || '';
      dato.classList.remove('nuevo'); void dato.offsetWidth; dato.classList.add('nuevo');
      if (!hoja.hidden) abrir();
    }
  };
  const abrir = () => { if (!alAbrir || actual < 0) return; hoja.querySelector('.rueda-hoja-in').innerHTML = alAbrir(actual); hoja.hidden = false; cont.classList.add('con-hoja'); };
  const cerrar = () => { hoja.hidden = true; cont.classList.remove('con-hoja'); pista.focus({ preventScroll: true }); };
  pista.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
  pista.addEventListener('click', e => { const li = e.target.closest('.rueda-item'); if (!li) return; const i = +li.dataset.i; if (i === actual) abrir(); else centrar(i); });
  pista.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); centrar(Math.min(items.length - 1, actual + 1)); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); centrar(Math.max(0, actual - 1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
    else if (e.key === 'Escape' && !hoja.hidden) cerrar();
  });
  dato.querySelector('.rd-ver')?.addEventListener('click', abrir);
  hoja.querySelector('.rueda-cerrar').addEventListener('click', cerrar);
  relleno(); if ('ResizeObserver' in window) new ResizeObserver(() => { relleno(); centrar(objetivo, false); }).observe(pista);
  // primer giro: desde el final hasta la esfera de inicio (una sola vez y solo si se permite el movimiento)
  if (auto && !quieto()) { pista.scrollTop = (items.length - 1) * ALTO; requestAnimationFrame(() => setTimeout(() => centrar(inicio), 250)); }
  else centrar(inicio, false);
  pintar();
  return { centrar, abrir, cerrar, actual: () => actual };
}
