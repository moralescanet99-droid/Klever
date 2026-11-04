import { json } from '../_lib.js';

// Instantánea del universo para la nota de estructura y el comparador (datos públicos de empresas, sin nada privado).
// Cada ejercicio lleva SU fuente y su fecha de carga; el mercado (capitalización, importe diario) solo existe si alguien lo ha cargado:
// sin él, la nota no se puede activar con datos reales y la interfaz lo dice. Nada se rellena.
export async function onRequestGet({ env }) {
  try {
    const [a, f, m] = await env.DB.batch([
      env.DB.prepare("SELECT ticker, nombre, tipo, sector, actividad, emisor FROM activos"),
      env.DB.prepare('SELECT ticker, periodo, ingresos, beneficio_neto, resultado_operativo, ebitda, deuda_neta, flujo_caja_libre, roic, fuente, actualizado_en FROM fundamentales ORDER BY ticker, periodo'),
      env.DB.prepare('SELECT ticker, capitalizacion, importe_diario_mediano, sesiones, moneda, fecha, fuente FROM mercado')]);
    const ej = {}; for (const r of f.results) (ej[r.ticker] ||= []).push({ p: r.periodo, ing: r.ingresos, ni: r.beneficio_neto, op: r.resultado_operativo, ebitda: r.ebitda, deuda: r.deuda_neta, fcf: r.flujo_caja_libre, roic: r.roic, f: r.fuente, d: r.actualizado_en });
    const mk = Object.fromEntries(m.results.map(r => [r.ticker, r]));
    const empresas = {};
    for (const r of a.results) empresas[r.ticker] = { nombre: r.nombre, tipo: r.tipo, sector: r.sector, actividad: r.actividad, emisor: r.emisor, cap: mk[r.ticker]?.capitalizacion ?? null, imp: mk[r.ticker]?.importe_diario_mediano ?? null, sesiones: mk[r.ticker]?.sesiones ?? null, ej: ej[r.ticker] || [] };
    const fechas = m.results.map(r => r.fecha).filter(Boolean).sort();
    return json({ fecha: fechas.at(-1) || null, mercado: m.results.length, empresas });
  } catch (e) { console.error('universo:', e); return json({ error: 'No se pudo leer el universo.' }, 500); }
}
