// Ronda 29 (fase 2.5) · «TU SEMANA» y RETOS de aprendizaje. PURO: recibe los datos ya leídos y devuelve qué mostrar.
// Los retos premian ENTENDER y ORDENAR la cartera (concentración, variedad, comparar, revisar), nunca la rentabilidad, y no eligen activos por nadie.
// «Desde tu última visita» compara las señales de ahora con una instantánea guardada en el dispositivo: cambios que ha hecho la persona, no del mercado.
import { radiografia } from './calculos.js';
import { senales, umbralesValidos, indicadores } from './senales.js';

const DIA = 864e5;
const isoMas = (hoy, d) => { const t = new Date(hoy + 'T00:00:00Z').getTime() + d * DIA, x = new Date(t); return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`; };

// datos = { carteras: [{ id, nombre, pos }], activos, ideas: [{ estado, revisar_en, n_revisiones }] | null, sigues: n | null, umb, hoy: 'AAAA-MM-DD' }
// ideas === null → no se sabe (sin cuenta o sin lectura): esos retos se muestran como «con cuenta», nunca como conseguidos ni suspendidos.
export function retos(datos) {
  const U = umbralesValidos(datos.umb), cs = (datos.carteras || []).filter(c => (c.pos || []).some(p => p.peso > 0));
  const rad = cs.map(c => radiografia(c.pos, datos.activos || {}));
  const algunaSinConcentrar = rad.some(r => r.mayor && r.mayor.peso < U.posicion && r.n > 1);
  const maxCats = Math.max(0, ...rad.map(r => r.categorias.filter(k => k.conocida).length));
  const ideas = datos.ideas, sigues = datos.sigues;
  const L = [
    { id: 'concentracion', titulo: `Que ninguna posición pese más del ${U.posicion} %`, hecho: cs.length ? algunaSinConcentrar : false, ir: cs.length ? '#laboratorio' : '#inicio', pista: cs.length ? 'Prueba en el laboratorio a bajar la mayor.' : 'Crea tu primera cartera.' },
    { id: 'variedad', titulo: 'Reparte en 5 categorías o más', hecho: maxCats >= 5, ir: '#empresas', pista: maxCats ? `Ahora tienes ${maxCats}. Descubre sectores que no tienes.` : 'Crea tu primera cartera.' },
    { id: 'idea', titulo: 'Compara una alternativa y guárdala como idea', hecho: ideas == null ? null : ideas.length > 0, ir: '#laboratorio', pista: 'Simula un cambio y pulsa «Guardar en mi Cuaderno».' },
    { id: 'seguir', titulo: 'Sigue 3 empresas', hecho: sigues == null ? null : sigues >= 3, ir: '#empresas', pista: sigues ? `Sigues ${sigues}.` : 'Abre una ficha y pulsa «Seguir esta empresa».' },
    { id: 'revisar', titulo: 'Vuelve sobre una idea y anota qué ha cambiado', hecho: ideas == null ? null : ideas.some(e => (e.n_revisiones || 0) > 0), ir: '#seguimiento', pista: 'Abre una idea y pulsa «Registrar revisión».' },
  ];
  return { lista: L, hechos: L.filter(r => r.hecho === true).length, total: L.length };
}

// Resumen de la semana: señal principal de cada cartera, ideas que tocan en los próximos 7 días y lo que ha cambiado desde la última visita.
export function resumenSemana(datos, previo = null) {
  const hoy = datos.hoy, fin = isoMas(hoy, 7), U = datos.umb || null;
  const carteras = (datos.carteras || []).filter(c => (c.pos || []).some(p => p.peso > 0)).map(c => { const s = senales(radiografia(c.pos, datos.activos || {}), 3, U); return { id: c.id, nombre: c.nombre, senal: s[0] || null, ids: s.map(q => q.id + ':' + q.titulo) }; });
  const ideas = datos.ideas || [];
  const tocan = ideas.filter(e => e.estado === 'en_estudio' && e.revisar_en && e.revisar_en <= fin).sort((a, b) => a.revisar_en.localeCompare(b.revisar_en));
  const instantanea = { fecha: hoy, carteras: Object.fromEntries(carteras.map(c => [String(c.id ?? 'borrador'), c.ids])) };
  const cambios = [];
  if (previo?.carteras && previo.fecha && previo.fecha < hoy) {
    for (const c of carteras) {
      const antes = previo.carteras[String(c.id ?? 'borrador')]; if (!antes) continue;
      const ahora = c.ids, tit = x => x.split(':').slice(1).join(':');
      antes.filter(x => !ahora.includes(x)).forEach(x => cambios.push({ cartera: c.nombre, tipo: 'resuelta', texto: tit(x) }));
      ahora.filter(x => !antes.includes(x)).forEach(x => cambios.push({ cartera: c.nombre, tipo: 'nueva', texto: tit(x) }));
    }
  }
  return { carteras, tocan, vencidas: tocan.filter(e => e.revisar_en <= hoy).length, cambios, desde: previo?.fecha && previo.fecha < hoy ? previo.fecha : null, instantanea };
}

// =====================================================================
// Ronda 30 · el «motor» de volver: FOTO SEMANAL en el servidor, EVOLUCIÓN en el tiempo y RETO DE LA SEMANA. Todo PURO (lo usan el servidor y la interfaz).
// La foto guarda solo NIVELES (semáforo) y SEÑALES de la cartera con los umbrales de Klever: nada de importes ni de rentabilidad.
// La semana es la del LUNES (UTC) que la contiene: «AAAA-MM-DD».
export const lunesDe = iso => { const d = new Date(iso + 'T00:00:00Z'); return isoMas(iso, -((d.getUTCDay() + 6) % 7)); };
const RANGO = { alto: 0, medio: 1, ok: 2 };   // mejor = más alto (concentración baja, variedad amplia)
export const NIVELES_SEMANA = Object.freeze({ concentracion: { ok: 'Baja', medio: 'Media', alto: 'Alta' }, variedad: { ok: 'Amplia', medio: 'Media', alto: 'Poca' } });
const NIV_OK = v => Object.prototype.hasOwnProperty.call(RANGO, v);

// Foto de UNA composición: { concentracion, variedad, n_categorias, senales:[{ id, nivel, titulo }] } o null si está vacía.
export function fotoCartera(pos, activos = {}) {
  const r = radiografia(pos || [], activos); if (r.estado === 'vacia') return null;
  const ind = indicadores(r), niv = id => ind.find(i => i.id === id).nivel;
  const cats = r.categorias.filter(c => c.conocida && !c.soloFondos).length + (r.categorias.some(c => c.soloFondos) ? 1 : 0);
  return { concentracion: niv('concentracion'), variedad: niv('variedad'), n_categorias: cats, senales: senales(r, 3).map(q => ({ id: q.id, nivel: q.nivel, titulo: q.titulo })) };
}
// Una foto leída de la base (o recibida) se revalida antes de usarla: si no tiene la forma esperada, no se usa.
export function fotoValida(f) {
  if (!f || typeof f !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(f.semana || '') || !NIV_OK(f.concentracion) || !NIV_OK(f.variedad) || !Number.isInteger(f.n_categorias) || f.n_categorias < 0) return null;
  const s = Array.isArray(f.senales) ? f.senales : null; if (!s || s.length > 3 || s.some(q => !q || typeof q.id !== 'string' || typeof q.titulo !== 'string' || q.titulo.length > 120)) return null;
  return { semana: f.semana, concentracion: f.concentracion, variedad: f.variedad, n_categorias: f.n_categorias, senales: s.map(q => ({ id: q.id, nivel: String(q.nivel || ''), titulo: q.titulo })) };
}
const porSemana = (a, b) => a.semana.localeCompare(b.semana);
// La foto de la última semana ANTERIOR a `semana` que tenga foto (o null).
export const fotoAnterior = (historial, semana) => (historial || []).map(fotoValida).filter(f => f && f.semana < semana).sort(porSemana).pop() || null;

// EVOLUCIÓN de una cartera: las últimas `max` semanas con foto (hasta la actual) y, si hay al menos dos, cómo ha cambiado cada indicador
// entre la primera y la última («mejora», «empeora» o «igual»). Con una sola semana no hay evolución todavía (se dice, no se inventa).
export function evolucion(historial, semanaActual, max = 6) {
  const h = (historial || []).map(fotoValida).filter(f => f && f.semana <= semanaActual).sort(porSemana).slice(-max);
  if (h.length < 2) return { semanas: h.length, serie: h, desde: null, tendencias: null };
  const a = h[0], z = h[h.length - 1], t = k => { const d = RANGO[z[k]] - RANGO[a[k]]; return { antes: a[k], ahora: z[k], tendencia: d > 0 ? 'mejora' : d < 0 ? 'empeora' : 'igual' }; };
  return { semanas: h.length, serie: h, desde: a.semana, tendencias: { concentracion: t('concentracion'), variedad: t('variedad') } };
}
// CAMBIOS DE SEÑALES desde la última semana anterior con foto (no del mercado: los cambios salen de la composición guardada).
// «Sin concentraciones destacadas» no cuenta como señal nueva ni resuelta: no es un aviso.
export function cambiosSemana(historial, semanaActual) {
  const h = (historial || []).map(fotoValida).filter(Boolean), ahora = h.find(f => f.semana === semanaActual), prev = h.filter(f => f.semana < semanaActual).sort(porSemana).pop();
  if (!ahora || !prev) return { desde: null, cambios: [] };
  const ids = f => f.senales.filter(q => q.id !== 'ok').map(q => q.id + ':' + q.titulo), A = ids(prev), Z = ids(ahora), tit = x => x.split(':').slice(1).join(':');
  return { desde: prev.semana, cambios: [...A.filter(x => !Z.includes(x)).map(x => ({ tipo: 'resuelta', texto: tit(x) })), ...Z.filter(x => !A.includes(x)).map(x => ({ tipo: 'nueva', texto: tit(x) }))] };
}

// RETO DE LA SEMANA: uno cada semana, rotando por esta lista (el mismo para toda la semana, cambia el lunes). Si el que toca no se puede aplicar
// (p. ej. aún no hay una semana anterior con la que comparar), se pasa al siguiente. Como los retos fijos: entender y ordenar, NUNCA rentabilidad.
export const RETOS_SEMANA = Object.freeze([
  { id: 'mejora', titulo: 'Mejora un indicador de una cartera respecto a otra semana', pista: 'Prueba en el laboratorio a bajar la posición o la categoría que más pesa.', ir: '#laboratorio' },
  { id: 'categoria-nueva', titulo: 'Añade a una cartera una categoría que no tenía', pista: 'En Explorar, filtra por «sectores que no tienes».', ir: '#empresas' },
  { id: 'idea-semana', titulo: 'Guarda esta semana una idea comparando', pista: 'Simula un cambio y pulsa «Guardar en mi Cuaderno».', ir: '#laboratorio' },
  { id: 'invalidacion', titulo: 'Escribe en una idea qué te haría cambiar de opinión', pista: 'Abre una idea en estudio, pulsa «Editar» y rellena ese campo.', ir: '#seguimiento' },
  { id: 'sin-alertas', titulo: 'Deja una cartera sin alertas de concentración', pista: 'Mira su señal principal y prueba la hipótesis que propone.', ir: '#carteras' },
]);
const LUNES_0 = Date.parse('2024-01-01T00:00:00Z');   // un lunes: la rotación es la misma para todo el mundo
export const indiceSemana = semana => Math.floor((Date.parse(semana + 'T00:00:00Z') - LUNES_0) / (7 * DIA));
// datos = { semana, carteras: [{ id, foto }] (foto actual), anteriores: { id: foto de la última semana anterior }, ideas: [...] | null }
export function retoSemana(datos) {
  const semana = datos.semana, cs = (datos.carteras || []).filter(c => c.foto), prev = datos.anteriores || {}, ideas = datos.ideas;
  const conPrev = cs.filter(c => prev[c.id]), alerta = f => !!f?.senales?.some(q => q.nivel === 'alerta');
  const estudio = Array.isArray(ideas) ? ideas.filter(e => e.estado === 'en_estudio') : [];
  const reglas = {
    mejora: { aplica: conPrev.length > 0, hecho: () => conPrev.some(c => RANGO[c.foto.concentracion] > RANGO[prev[c.id].concentracion] || RANGO[c.foto.variedad] > RANGO[prev[c.id].variedad]) },
    'categoria-nueva': { aplica: conPrev.length > 0, hecho: () => conPrev.some(c => c.foto.n_categorias > prev[c.id].n_categorias) },
    'idea-semana': { aplica: Array.isArray(ideas) && cs.length > 0, hecho: () => ideas.some(e => String(e.creado_en || '').slice(0, 10) >= semana) },
    invalidacion: { aplica: estudio.some(e => !e.invalidacion || String(e.actualizado_en || '').slice(0, 10) >= semana), hecho: () => estudio.some(e => e.invalidacion && String(e.actualizado_en || '').slice(0, 10) >= semana) },
    'sin-alertas': { aplica: cs.some(c => alerta(c.foto) || alerta(prev[c.id])), hecho: () => cs.some(c => !alerta(c.foto)) },
  };
  const n = RETOS_SEMANA.length, i0 = ((indiceSemana(semana) % n) + n) % n;
  for (let i = 0; i < n; i++) { const r = RETOS_SEMANA[(i0 + i) % n], g = reglas[r.id]; if (g.aplica) return { ...r, hecho: !!g.hecho(), cambia: isoMas(semana, 7) }; }
  return null;
}
