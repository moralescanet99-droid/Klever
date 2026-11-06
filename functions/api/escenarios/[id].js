import { json, auth, readJson, ERROR_INTERNO } from '../../_lib.js';
import { refDeHistoria } from '../../../public/js/catalogo.js';
import { ESTADOS, SELECT_ESCENARIO, formato, fechaValida, MAX_INVALIDACION, MAX_PREGUNTA, REF_PREGUNTA } from './_comun.js';

const esRevision = r => Number.isInteger(r) && r >= 0;

export async function onRequestGet({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  try {
    const r = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.id = ? AND e.usuario_id = ?`).bind(Number(params.id), user.id).first();
    if (!r) return json({ error: 'No encontrado' }, 404);
    const { results } = await env.DB.prepare('SELECT id, fecha, observacion, aprendizaje, decision, proxima_fecha, creado_en FROM revisiones_escenario WHERE escenario_id = ? AND usuario_id = ? ORDER BY fecha DESC, id DESC').bind(r.id, user.id).all();
    return json({ ...formato(r), revisiones: results });
  } catch (e) { console.error('leer escenario:', e); return json({ error: 'No se pudo leer el escenario. Inténtalo de nuevo.' }, 500); }
}

// Cambia nombre, nota, pregunta, fecha de revisión o estado. NUNCA la base ni la propuesta (son una copia fechada). Exige la revisión vista: dos pestañas no se pisan.
export async function onRequestPatch({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request) || {};
  const actual = await env.DB.prepare('SELECT * FROM escenarios WHERE id = ? AND usuario_id = ?').bind(Number(params.id), user.id).first();
  if (!actual) return json({ error: 'No encontrado' }, 404);
  const nombre = b.nombre !== undefined ? String(b.nombre).trim() : actual.nombre;
  const nota = b.nota !== undefined ? String(b.nota).trim() : actual.nota;
  const estado = b.estado !== undefined ? b.estado : actual.estado;
  if (!nombre || nombre.length > 80) return json({ error: 'El nombre debe tener entre 1 y 80 caracteres.' }, 400);
  if (nota.length > 600) return json({ error: 'La nota admite hasta 600 caracteres.' }, 400);
  const invalidacion = b.invalidacion !== undefined ? String(b.invalidacion).trim() : actual.invalidacion;
  if (invalidacion.length > MAX_INVALIDACION) return json({ error: `«Qué me haría cambiar de opinión» admite hasta ${MAX_INVALIDACION} caracteres.` }, 400);
  const pregunta = b.pregunta !== undefined ? String(b.pregunta).trim() : actual.pregunta;
  const revisar = b.revisar_en !== undefined ? (b.revisar_en === null || b.revisar_en === '' ? null : String(b.revisar_en)) : actual.revisar_en;
  if (pregunta.length > MAX_PREGUNTA) return json({ error: `La pregunta admite hasta ${MAX_PREGUNTA} caracteres.` }, 400);
  if (revisar !== null && !fechaValida(revisar)) return json({ error: 'La fecha de revisión no es válida (AAAA-MM-DD).' }, 400);
  // Vínculo con la cuestión editorial: se puede mantener, quitar (null) o fijar uno de LA MISMA historia del escenario. Reescribir la pregunta no lo toca.
  const ref = b.pregunta_ref !== undefined ? (b.pregunta_ref === null || b.pregunta_ref === '' ? null : String(b.pregunta_ref)) : actual.pregunta_ref;
  if (ref !== null && ref !== actual.pregunta_ref && (!REF_PREGUNTA.test(ref) || actual.historia == null || !refDeHistoria(ref, actual.historia))) return json({ error: 'La pregunta de la historia vinculada no es válida.' }, 400);
  if (!ESTADOS.includes(estado)) return json({ error: 'Estado no válido.' }, 400);
  if (!esRevision(b.revision)) return json({ error: 'Falta la revisión del escenario.' }, 400);
  const conflicto = (r) => json({ error: 'El escenario cambió en tu cuenta después de la versión que ves.', conflicto: true, revision: r.revision }, 409);
  if (b.revision !== actual.revision) return conflicto(actual);
  try {
    const r = await env.DB.prepare(
      `UPDATE escenarios SET nombre = ?, nota = ?, invalidacion = ?, estado = ?, pregunta = ?, pregunta_ref = ?, revisar_en = ?, revision = revision + 1, actualizado_en = datetime('now')
       WHERE id = ? AND usuario_id = ? AND revision = ? RETURNING id`).bind(nombre, nota, invalidacion, estado, pregunta, ref, revisar, actual.id, user.id, actual.revision).all();
    if (!r.results.length) return conflicto(await env.DB.prepare('SELECT revision FROM escenarios WHERE id = ? AND usuario_id = ?').bind(actual.id, user.id).first() || actual);
    return json(formato(await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.id = ? AND e.usuario_id = ?`).bind(actual.id, user.id).first()));
  } catch (e) { console.error('actualizar escenario:', e); return json({ error: ERROR_INTERNO }, 500); }
}

// Eliminar definitivamente = borrar el escenario (irreversible). «Marcar como descartado» es un PATCH de estado y conserva la historia. La cartera base no se toca.
export async function onRequestDelete({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  try {
    const r = await env.DB.prepare('DELETE FROM escenarios WHERE id = ? AND usuario_id = ? RETURNING id').bind(Number(params.id), user.id).all();
    return r.results.length ? json({ ok: true }) : json({ error: 'No encontrado' }, 404);
  } catch (e) { console.error('borrar escenario:', e); return json({ error: 'No se pudo descartar. Inténtalo de nuevo.' }, 500); }
}
