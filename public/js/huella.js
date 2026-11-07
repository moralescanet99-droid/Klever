// Ronda 29 (fase 2.5) · HUELLA de una empresa: un pentágono con sus cinco comprobaciones (deuda, ROIC, margen, caja libre, crecimiento).
// Cuanto más lleno, más comprobaciones superadas. PURO: devuelve SVG en texto, sin DOM. No puntúa ni recomienda: dibuja el mismo resultado que las fichas.
// Superada → borde; no superada → 40 % del radio; sin datos → centro y un punto hueco (sin datos NO es «no superada», y se ve distinto).
export const EJES = [['deuda_ebitda', 'Deuda'], ['roic', 'ROIC'], ['margen_neto', 'Margen'], ['flujo_caja', 'Caja'], ['crecimiento', 'Crec.']];
const NIVEL = { ok: 1, no: 0.4, nd: 0 };
export const estadoCriterio = x => x?.ok === true ? 'ok' : x?.ok === false ? 'no' : 'nd';
// Puntos de la huella (para pruebas y para el SVG): [{ clave, estado, x, y }] en un lienzo de lado `tam`.
export function puntosHuella(criterios, tam = 100) {
  const c = tam / 2, r = tam * 0.36;
  return EJES.map(([k], i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, e = estadoCriterio(criterios?.[k]), f = NIVEL[e];
    return { clave: k, estado: e, x: +(c + Math.cos(a) * r * f).toFixed(2), y: +(c + Math.sin(a) * r * f).toFixed(2), bx: +(c + Math.cos(a) * r).toFixed(2), by: +(c + Math.sin(a) * r).toFixed(2), lx: +(c + Math.cos(a) * (r + tam * 0.1)).toFixed(2), ly: +(c + Math.sin(a) * (r + tam * 0.1)).toFixed(2) }; });
}
// SVG de la huella. etiquetas: escribe el nombre de cada eje (solo en tamaños grandes). titulo: texto accesible (si no, decorativa).
export function svgHuella(criterios, { tam = 100, etiquetas = false, titulo = '' } = {}) {
  const p = puntosHuella(criterios, tam), c = tam / 2, n = p.filter(q => q.estado === 'ok').length;
  const marco = p.map(q => `${q.bx},${q.by}`).join(' '), forma = p.map(q => `${q.x},${q.y}`).join(' ');
  const ejes = p.map(q => `<line x1="${c}" y1="${c}" x2="${q.bx}" y2="${q.by}"/>`).join('');
  const marcas = p.map(q => q.estado === 'nd' ? `<circle class="h-nd" cx="${q.bx}" cy="${q.by}" r="${tam * 0.035}"/>` : `<circle class="h-${q.estado}" cx="${q.x}" cy="${q.y}" r="${tam * 0.03}"/>`).join('');
  const txt = etiquetas ? p.map((q, i) => `<text x="${q.lx}" y="${q.ly}" text-anchor="middle" dominant-baseline="middle">${EJES[i][1]}</text>`).join('') : '';
  const pad = etiquetas ? tam * 0.12 : 0, vb = `${-pad} ${-pad / 2} ${tam + pad * 2} ${tam + pad}`;
  const acc = titulo ? `role="img" aria-label="${titulo.replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="huella" viewBox="${vb}" ${acc} data-superadas="${n}"><polygon class="h-marco" points="${marco}"/><g class="h-ejes">${ejes}</g><polygon class="h-forma h-n${n}" points="${forma}"/>${marcas}${txt}</svg>`;
}
