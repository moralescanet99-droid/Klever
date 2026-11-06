import { json } from '../_lib.js';

// Procedencia de los datos, DERIVADA de cada fila (no una declaración global): para el último periodo de cada empresa se agrupa por fuente
// y se informa de cuántas empresas hay y entre qué fechas se cargaron. Sin fuente en la fila = «sin fuente verificada».
// Solo una carga real puede escribir fuente «sec» (ver scripts/lib/carga.mjs); una carga vacía o fallida no cambia nada.
export async function onRequestGet({ env }) {
  let grupos = [], carga = null;
  try {
    grupos = (await env.DB.prepare(
      `SELECT COALESCE(f.fuente, 'sin_fuente') AS fuente, COUNT(*) AS n, MIN(f.actualizado_en) AS desde, MAX(f.actualizado_en) AS hasta
       FROM fundamentales f WHERE f.periodo = (SELECT MAX(periodo) FROM fundamentales WHERE ticker = f.ticker) GROUP BY COALESCE(f.fuente, 'sin_fuente')`).all()).results;
  } catch { /* esquema anterior: sin procedencia */ }
  try { carga = await env.DB.prepare('SELECT origen, fecha, n_ok, n_vacias, n_fallidas, estado FROM cargas ORDER BY id DESC LIMIT 1').first() || null; } catch { /* sin tabla de cargas */ }
  const total = grupos.reduce((s, g) => s + g.n, 0), tipos = grupos.filter(g => g.n).map(g => g.fuente);
  const origen = !total ? null : tipos.length === 1 ? (tipos[0] === 'sin_fuente' ? null : tipos[0]) : 'mixto';
  return json({ origen, empresas: total, grupos, ultima_carga: carga });
}
