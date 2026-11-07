// Ronda 29 (fase 2.5) · «TU SEMANA» y RETOS de aprendizaje. PURO: recibe los datos ya leídos y devuelve qué mostrar.
// Los retos premian ENTENDER y ORDENAR la cartera (concentración, variedad, comparar, revisar), nunca la rentabilidad, y no eligen activos por nadie.
// «Desde tu última visita» compara las señales de ahora con una instantánea guardada en el dispositivo: cambios que ha hecho la persona, no del mercado.
import { radiografia } from './calculos.js';
import { senales, umbralesValidos } from './senales.js';

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
