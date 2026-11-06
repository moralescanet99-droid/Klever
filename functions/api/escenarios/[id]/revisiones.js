import { json, auth, readJson, ERROR_INTERNO } from '../../../_lib.js';
import { SELECT_ESCENARIO, formato, fechaValida, DECISIONES, MAX_REVISIONES } from '../_comun.js';

// Historial MÍNIMO de revisiones de un escenario (ronda 21). Solo se AÑADE: no sustituye la hipótesis original ni las composiciones base/propuesta, que no se tocan.
// El texto es un comentario PERSONAL de la persona (no un hecho verificado y nunca se genera nada sobre el mercado). Las fechas son días de calendario elegidos por la persona (sin zona horaria).
const CAMPOS = 'id, fecha, observacion, aprendizaje, decision, proxima_fecha, creado_en';
const leer = (env, escId, userId) => env.DB.prepare(`SELECT ${CAMPOS} FROM revisiones_escenario WHERE escenario_id = ? AND usuario_id = ? ORDER BY fecha DESC, id DESC`).bind(escId, userId).all();

export async function onRequestGet({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  try {
    const e = await env.DB.prepare('SELECT id FROM escenarios WHERE id = ? AND usuario_id = ?').bind(Number(params.id), user.id).first();
    if (!e) return json({ error: 'No encontrado' }, 404);                       // también si es de OTRA cuenta: no se distingue
    return json((await leer(env, e.id, user.id)).results);
  } catch (e) { console.error('leer revisiones:', e); return json({ error: 'No se pudieron leer las revisiones. Inténtalo de nuevo.' }, 500); }
}

// { clave, revision, fecha, observacion?, aprendizaje?, decision: mantener|descartar|reprogramar, proxima_fecha? }
//  · UNA operación atómica: se añade la revisión Y se actualiza el estado/fecha del escenario (mantener → en estudio; descartar → descartado, sin fecha; reprogramar → en estudio con la nueva fecha).
//  · `revision` es la que vio la persona: si el escenario cambió desde otra pestaña → 409 y no se pisa nada.
//  · `clave` identifica el intento: un reintento (corte de red) devuelve la revisión ya guardada, sin duplicarla ni subir otra vez la revisión del escenario.
export async function onRequestPost({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request) || {};
  const clave = String(b.clave ?? ''), observacion = String(b.observacion ?? '').trim(), aprendizaje = String(b.aprendizaje ?? '').trim();
  if (!/^[A-Za-z0-9-]{8,64}$/.test(clave)) return json({ error: 'Falta la clave del intento de guardado.' }, 400);
  if (!fechaValida(b.fecha)) return json({ error: 'La fecha de la revisión no es válida (AAAA-MM-DD).' }, 400);
  if (observacion.length > 600 || aprendizaje.length > 600) return json({ error: 'La observación y lo aprendido admiten hasta 600 caracteres cada uno.' }, 400);
  if (!DECISIONES.includes(b.decision)) return json({ error: 'Elige si mantienes la idea, la descartas o programas otra revisión.' }, 400);
  const proxima = b.proxima_fecha == null || b.proxima_fecha === '' ? null : String(b.proxima_fecha);
  if (proxima !== null && !fechaValida(proxima)) return json({ error: 'La fecha de la próxima revisión no es válida (AAAA-MM-DD).' }, 400);
  if (b.decision === 'reprogramar' && proxima === null) return json({ error: 'Indica la fecha de la próxima revisión.' }, 400);
  if (b.decision === 'descartar' && proxima !== null) return json({ error: 'Una idea descartada no lleva próxima revisión.' }, 400);
  if (!Number.isInteger(b.revision) || b.revision < 0) return json({ error: 'Falta la revisión del escenario.' }, 400);
  const estado = b.decision === 'descartar' ? 'descartado' : 'en_estudio', revisar = b.decision === 'descartar' ? null : proxima;
  try {
    const e = await env.DB.prepare('SELECT id, revision FROM escenarios WHERE id = ? AND usuario_id = ?').bind(Number(params.id), user.id).first();
    if (!e) return json({ error: 'No encontrado' }, 404);
    const previa = await env.DB.prepare(`SELECT ${CAMPOS}, escenario_id FROM revisiones_escenario WHERE usuario_id = ? AND clave = ?`).bind(user.id, clave).first();
    if (previa) return previa.escenario_id === e.id ? json({ ...previa, duplicado: true }) : json({ error: 'Esa clave de intento ya se usó en otro escenario.' }, 409);   // reintento
    if (b.revision !== e.revision) return json({ error: 'El escenario cambió en tu cuenta después de la versión que ves.', conflicto: true, revision: e.revision }, 409);
    let res;
    try {
      // Un solo lote (transacción): la revisión solo se inserta si el escenario sigue en la revisión vista y no se superó el tope; el escenario solo se actualiza si esa revisión quedó insertada.
      res = await env.DB.batch([
        env.DB.prepare(`INSERT INTO revisiones_escenario (escenario_id, usuario_id, clave, fecha, observacion, aprendizaje, decision, proxima_fecha)
          SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM escenarios WHERE id = ? AND usuario_id = ? AND revision = ?)
            AND (SELECT COUNT(*) FROM revisiones_escenario WHERE escenario_id = ?) < ?`)
          .bind(e.id, user.id, clave, b.fecha, observacion, aprendizaje, b.decision, revisar, e.id, user.id, e.revision, e.id, MAX_REVISIONES),
        env.DB.prepare(`UPDATE escenarios SET estado = ?, revisar_en = ?, revision = revision + 1, actualizado_en = datetime('now')
          WHERE id = ? AND usuario_id = ? AND revision = ? AND EXISTS (SELECT 1 FROM revisiones_escenario WHERE usuario_id = ? AND clave = ? AND escenario_id = ?) RETURNING id`)
          .bind(estado, revisar, e.id, user.id, e.revision, user.id, clave, e.id)]);
    } catch (err) {
      const otra = await env.DB.prepare(`SELECT ${CAMPOS}, escenario_id FROM revisiones_escenario WHERE usuario_id = ? AND clave = ?`).bind(user.id, clave).first();   // carrera entre dos reintentos
      if (otra && otra.escenario_id === e.id) return json({ ...otra, duplicado: true });
      throw err;
    }
    if (!res[0].meta?.changes) {
      const act = await env.DB.prepare('SELECT revision FROM escenarios WHERE id = ? AND usuario_id = ?').bind(e.id, user.id).first();
      if (act && act.revision !== e.revision) return json({ error: 'El escenario cambió en tu cuenta después de la versión que ves.', conflicto: true, revision: act.revision }, 409);
      return json({ error: `Puedes registrar hasta ${MAX_REVISIONES} revisiones por escenario.` }, 400);
    }
    const nueva = await env.DB.prepare(`SELECT ${CAMPOS} FROM revisiones_escenario WHERE usuario_id = ? AND clave = ?`).bind(user.id, clave).first();
    const esc = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.id = ? AND e.usuario_id = ?`).bind(e.id, user.id).first();
    return json({ ...nueva, escenario: formato(esc) }, 201);
  } catch (e) { console.error('registrar revisión:', e); return json({ error: ERROR_INTERNO }, 500); }
}
