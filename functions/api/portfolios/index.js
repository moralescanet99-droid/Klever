import { json, auth, readJson, validarComposicion, tickersDesconocidos, ERROR_INTERNO } from '../../_lib.js';

const PLANTILLAS = ['riesgo', 'oro', 'dividendos'];

export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  // Resumen para «Mis carteras»: posiciones y total asignado salen de las posiciones guardadas.
  // actualizado_en es NULL hasta la primera modificación real (no se inventa ninguna fecha).
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.nombre, p.plantilla, p.publico, p.creado_en, p.actualizado_en,
            COUNT(po.ticker) AS n_posiciones, COALESCE(SUM(po.peso), 0) AS total
     FROM portafolios p LEFT JOIN posiciones po ON po.portafolio_id = p.id
     WHERE p.usuario_id = ? GROUP BY p.id
     ORDER BY COALESCE(p.actualizado_en, p.creado_en) DESC, p.id DESC`
  ).bind(user.id).all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request);
  const nombre = String(b?.nombre || '').trim().slice(0, 80);
  if (!nombre || !PLANTILLAS.includes(b?.plantilla)) return json({ error: 'Nombre o plantilla no válidos' }, 400);
  // Creación atómica: la cartera y sus posiciones (si vienen) se escriben en un solo lote; no queda una cartera vacía a medias.
  const pos = b.posiciones === undefined ? [] : b.posiciones;
  const v = validarComposicion(pos); if (!v.ok) return json({ error: v.error }, 400);
  const tesis = b.tesis === undefined ? null : String(b.tesis).trim().slice(0, 600) || null;
  if ((await tickersDesconocidos(env, pos)).length) return json({ error: 'Algún ticker no está en el universo' }, 400);
  const token = crypto.randomUUID();
  const stmts = [env.DB.prepare('INSERT INTO portafolios (usuario_id, nombre, plantilla, publico, tesis, token_escritura) VALUES (?,?,?,0,?,?)').bind(user.id, nombre, b.plantilla, tesis, token)];
  for (const x of pos)
    stmts.push(env.DB.prepare('INSERT INTO posiciones (portafolio_id, ticker, peso) SELECT id, ?, ? FROM portafolios WHERE token_escritura = ?').bind(x.ticker, Number(x.peso), token));
  stmts.push(env.DB.prepare('SELECT id, revision, actualizado_en FROM portafolios WHERE token_escritura = ?').bind(token)); // dentro del mismo lote
  let res;
  try { res = await env.DB.batch(stmts); } catch (e) { console.error('crear cartera:', e); return json({ error: ERROR_INTERNO }, 500); }
  const c = res[res.length - 1].results[0];
  return json({ id: c.id, revision: c.revision, actualizado_en: c.actualizado_en }, 201);
}
