import { json } from '../_lib.js';

// Origen de los datos que se muestran. La interfaz SOLO habla de la SEC si `origen` es «sec» (lo escribe el cargador real).
// Sin fila: origen desconocido (no se atribuye a nadie). Los datos de prueba llevan origen «prueba» y se identifican como ficticios.
export async function onRequestGet({ env }) {
  let filas = [];
  try { filas = (await env.DB.prepare("SELECT clave, valor FROM datos_meta WHERE clave IN ('origen','actualizado_en')").all()).results; } catch { /* tabla ausente: origen desconocido */ }
  const m = Object.fromEntries(filas.map(f => [f.clave, f.valor]));
  let calculado = null;
  try { calculado = (await env.DB.prepare('SELECT MAX(calculado_en) c FROM ideas').first())?.c || null; } catch { /* sin ideas */ }
  return json({ origen: m.origen || null, actualizado_en: m.actualizado_en || null, ideas_calculadas_en: calculado });
}
