import { json } from '../_lib.js';
import { normalizarFecha } from '../../public/js/nota.js';

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
    for (const r of a.results) empresas[r.ticker] = { nombre: r.nombre, tipo: r.tipo, sector: r.sector, actividad: r.actividad, emisor: r.emisor, ficticia: /\(empresa ficticia\)/.test(r.nombre), cap: mk[r.ticker]?.capitalizacion ?? null, imp: mk[r.ticker]?.importe_diario_mediano ?? null, sesiones: mk[r.ticker]?.sesiones ?? null, moneda: mk[r.ticker]?.moneda ?? null, fuenteMercado: mk[r.ticker]?.fuente ?? null, fechaMercado: mk[r.ticker]?.fecha ?? null, ej: ej[r.ticker] || [] };
    const fechas = m.results.map(r => normalizarFecha(r.fecha)).filter(Boolean).sort();
    // Se verifica CADA fila usada antes de clasificar: una fila sin fuente o con una fecha que no es de calendario hace el conjunto «incompleto» (y la nota no se calcula).
    // «Sintético» exige que TODAS las filas de acciones (ejercicios y mercado) tengan fuente de prueba/demo y fecha real; fuentes reales y sintéticas a la vez = «mixto».
    const acc = new Set(a.results.filter(r => r.tipo === 'accion').map(r => r.ticker)), sint = ['prueba', 'demo'], problemas = [], fuentes = new Set();
    const fila = (t, tabla, ref, fuente, fecha) => { if (!acc.has(t)) return; if (!fuente) problemas.push(`${t} ${tabla} ${ref}: sin fuente`); else fuentes.add(fuente); if (normalizarFecha(fecha) === null) problemas.push(`${t} ${tabla} ${ref}: fecha no válida`); };
    for (const r of f.results) fila(r.ticker, 'ejercicio', r.periodo, r.fuente, r.actualizado_en);
    for (const r of m.results) fila(r.ticker, 'mercado', 'actual', r.fuente, r.fecha);
    const origen = problemas.length ? 'incompleto' : !fuentes.size ? 'sin_datos' : [...fuentes].every(x => sint.includes(x)) ? 'sintetico' : [...fuentes].every(x => !sint.includes(x)) ? 'real' : 'mixto';
    const periodos = f.results.map(r => r.periodo).sort();
    return json({ fecha: fechas.at(-1) || null, instantanea: fechas.at(-1) || null, periodos: { desde: periodos[0] || null, hasta: periodos.at(-1) || null }, mercado: m.results.length, origen, procedencia: { problemas: problemas.length, ejemplos: problemas.slice(0, 5) }, habilitada: false, empresas });
  } catch (e) { console.error('universo:', e); return json({ error: 'No se pudo leer el universo.' }, 500); }
}
