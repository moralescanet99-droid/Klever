// Fase 2 (ronda 34) · pantalla «HOY» (antes «Mis carteras»): tu cartera principal en grande, con su anillo, sus dos semáforos y UNA acción.
// La cartera principal es la última que has tocado (modificada o creada) que tiene posiciones. Nada de importes ni rentabilidad.
// PURO en lo que calcula (eleccion y modelo); pintarHoy() solo dibuja con lo que recibe.
import { $, esc } from './base.js';
import { radiografia } from './calculos.js';
import { senales, indicadores, hipotesis } from './senales.js';
import { compartirTarjeta } from './compartir.js';

let XH = null, ULTIMO = null;   // contexto: { by, abrirLab, medir, toast }; ULTIMO: el modelo pintado (para la tarjeta)
export const iniciarHoy = ctx => {
  XH = ctx;
  $('#hoy-hero')?.addEventListener('click', e => {
    const b = e.target.closest('[data-hoy-lab]'); if (!b) return;
    XH.abrirLab({ carteraId: +b.dataset.hoyLab, ticker: b.dataset.ticker || '', peso: b.dataset.peso || '', fin: b.dataset.fin || 'proporcional', auto: !!b.dataset.ticker });
  });
  $('#hoy-hero')?.addEventListener('click', async e => {   // ronda 36: tarjeta para compartir
    const b = e.target.closest('[data-hoy-compartir]'); if (!b || !ULTIMO) return;
    b.disabled = true; try { const r = await compartirTarjeta(ULTIMO, { url: location.origin + location.pathname + '?ref=compartir', medir: XH.medir }); if (r === 'descargada') XH.toast?.('Imagen descargada: compártela donde quieras'); }
    catch { XH.toast?.('No se pudo crear la imagen'); } finally { b.disabled = false; }
  });
};

const fecha = c => String(c.actualizado_en || c.creado_en || '');
// La cartera principal: la última tocada con al menos una posición (si ninguna tiene, la última tocada).
export function carteraPrincipal(lista) {
  const conPos = (lista || []).filter(c => (c.posiciones || []).some(p => p.peso > 0));
  const orden = l => [...l].sort((a, b) => fecha(b).localeCompare(fecha(a)) || b.id - a.id);
  return orden(conPos)[0] || orden(lista || [])[0] || null;
}
// Modelo de la tarjeta: anillo (tramos), semáforos de Concentración y Variedad, señal principal y la acción.
export function modeloHoy(c, activos = {}) {
  if (!c) return null;
  const pos = (c.posiciones || []).filter(p => p.peso > 0).map(p => ({ ticker: p.ticker, peso: p.peso }));
  if (!pos.length) return { id: c.id, nombre: c.nombre, vacia: true, accion: { tipo: 'abrir', texto: 'Añadir empresas' } };
  const r = radiografia(pos, activos), ind = indicadores(r).filter(i => i.id !== 'datos'), s = senales(r, 1)[0] || null;
  const h = s ? hipotesis(s, r, pos) : null;
  const accion = s && s.nivel !== 'ok' && h?.ticker ? { tipo: 'lab', texto: 'Ver qué cambiaría', ticker: h.ticker, peso: h.peso, fin: h.fin, pregunta: s.accion?.pregunta || '' }
    : { tipo: 'abrir', texto: 'Abrir mi cartera' };
  return { id: c.id, nombre: c.nombre, pos, n: r.n, indicadores: ind.map(i => ({ id: i.id, etiqueta: i.etiqueta, nivel: i.nivel, valor: i.valor })), senal: s && { nivel: s.nivel, titulo: s.titulo }, accion };
}
// Anillo SVG con un tramo por posición. Color por ORDEN de la posición (como la barra de la lista y el editor al abrirla: los mismos colores).
export function svgAnillo(pos, { tam = 132, grosor = 14 } = {}) {
  const colorDe = t => pos.findIndex(p => p.ticker === t) % 8;
  const r = (tam - grosor) / 2, C = 2 * Math.PI * r, total = Math.max(100, pos.reduce((a, p) => a + p.peso, 0));
  let acum = 0;
  const arcos = pos.map(p => { const l = p.peso / total * C, a = `<circle cx="${tam / 2}" cy="${tam / 2}" r="${r.toFixed(2)}" fill="none" stroke="var(--c${colorDe(p.ticker)})" stroke-width="${grosor}" stroke-dasharray="${Math.max(0, l - 1.5).toFixed(2)} ${(C - Math.max(0, l - 1.5)).toFixed(2)}" stroke-dashoffset="${(-acum).toFixed(2)}"/>`; acum += l; return a; }).join('');
  return `<svg class="hoy-anillo" viewBox="0 0 ${tam} ${tam}" aria-hidden="true" focusable="false"><g transform="rotate(-90 ${tam / 2} ${tam / 2})"><circle cx="${tam / 2}" cy="${tam / 2}" r="${r.toFixed(2)}" fill="none" stroke="var(--surface-2)" stroke-width="${grosor}"/>${arcos}</g></svg>`;
}
export function pintarHoy(lista) {
  const el = $('#hoy-hero'); if (!el) return;
  const m = modeloHoy(carteraPrincipal(lista), XH.by());
  ULTIMO = m && !m.vacia ? m : null;
  if (!m) { el.hidden = true; el.innerHTML = ''; return; }
  const boton = m.accion.tipo === 'lab'
    ? `<button class="btn btn-primario" type="button" data-hoy-lab="${m.id}" data-ticker="${esc(m.accion.ticker)}" data-peso="${m.accion.peso}" data-fin="${esc(m.accion.fin)}">${esc(m.accion.texto)} →</button><a class="enlace hoy-abrir" href="#cartera-${m.id}">Abrir</a>`
    : `<a class="btn btn-primario" href="#cartera-${m.id}">${esc(m.accion.texto)} →</a>`;
  el.innerHTML = m.vacia
    ? `<p class="hoy-eti">Tu cartera principal</p><h2 class="hoy-nombre">${esc(m.nombre)}</h2><p class="mut">Aún no tiene empresas.</p><p class="hoy-acc">${boton}</p>`
    : `<div class="hoy-grid"><div class="hoy-anillo-w">${svgAnillo(m.pos)}<span class="hoy-centro"><b>${m.n}</b><small>${m.n === 1 ? 'posición' : 'posiciones'}</small></span></div>
      <div class="hoy-info"><p class="hoy-eti">Tu cartera principal</p><h2 class="hoy-nombre">${esc(m.nombre)}</h2>
        <ul class="hoy-ind" aria-label="Cómo está">${m.indicadores.map(i => `<li class="hoy-i hoy-${i.nivel}"><i aria-hidden="true"></i>${esc(i.etiqueta)}: <b>${esc(i.valor)}</b></li>`).join('')}</ul>
        ${m.senal ? `<p class="hoy-senal senal-${m.senal.nivel}"><i aria-hidden="true"></i>${esc(m.senal.titulo)}</p>` : ''}
        <p class="hoy-acc">${boton}<button class="btn btn-secundario hoy-compartir" type="button" data-hoy-compartir><svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4v11M8 8l4-4 4 4"/><path d="M5 13v6h14v-6"/></svg> Compartir</button></p></div></div>
      <p class="hoy-frase" id="hoy-frase" data-cartera="${m.id}" hidden></p>
      <div class="hoy-temporada" id="hoy-temporada" data-cartera="${m.id}" hidden></div>`;
  el.hidden = false;
}
