import { json, auth, readJson, validarComposicion, puedePublicar, tickersDesconocidos, ERROR_INTERNO } from '../../_lib.js';

async function owned(env, user, id) {
  return await env.DB.prepare('SELECT * FROM portafolios WHERE id = ? AND usuario_id = ?').bind(id, user.id).first();
}

export async function onRequestGet({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  // Cartera y posiciones en UN lote (una transacción = una instantánea): nunca se mezclan dos versiones.
  let rc, rp;
  try {
    [rc, rp] = await env.DB.batch([
      env.DB.prepare('SELECT * FROM portafolios WHERE id = ? AND usuario_id = ?').bind(params.id, user.id),
      env.DB.prepare(`
    SELECT po.ticker, po.peso, po.fecha_entrada, a.nombre, a.sector, a.tipo, f.roic
    FROM posiciones po JOIN activos a ON a.ticker = po.ticker
    LEFT JOIN fundamentales f ON f.ticker = po.ticker
      AND f.periodo = (SELECT MAX(periodo) FROM fundamentales WHERE ticker = po.ticker)
    WHERE po.portafolio_id = ? ORDER BY po.peso DESC, po.ticker`).bind(params.id)]);
  } catch (e) { console.error('leer cartera:', e); return json({ error: 'No se pudo leer la cartera. Inténtalo de nuevo.' }, 500); }
  const p = rc.results[0];
  if (!p) return json({ error: 'No encontrado' }, 404);
  const results = rp.results;
  const total = results.reduce((s, r) => s + r.peso, 0);
  const sectores = {};
  for (const r of results) sectores[r.sector] = (sectores[r.sector] || 0) + r.peso;
  const conRoic = results.filter(r => r.roic != null);
  const wRoic = conRoic.reduce((s, r) => s + r.peso, 0);
  const calidad = wRoic ? conRoic.reduce((s, r) => s + r.roic * r.peso, 0) / wRoic : null;
  const { token_escritura, ...publico } = p; // la marca interna de escritura no sale del servidor
  return json({ ...publico, posiciones: results, total, sectores, calidad_media_roic: calidad });
}

// ÚNICA operación de guardado: { posiciones, nombre?, tesis?, revision }. Suma <= 100 %; si la cartera es pública, debe seguir completa (100 %) y con tesis.
// Atomicidad: todo va en UN lote de D1 (una transacción). La escritura está condicionada a `revision = la que vio el cliente`
// en la propia sentencia UPDATE, y las posiciones solo se tocan si esa misma escritura (su marca única) ha ganado.
// Dos guardados concurrentes con la misma revisión: solo uno gana; el otro recibe 409 y no escribe nada. Si algo falla, no queda nada a medias.
const conflicto = (p) => json({ error: 'La cartera cambió en tu cuenta después de la versión desde la que editas.', conflicto: true, revision: p.revision, actualizado_en: p.actualizado_en || p.creado_en || null }, 409);
const esRevision = r => Number.isInteger(r) && r >= 0;

export async function onRequestPut({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const b = await readJson(request);
  const pos = Array.isArray(b?.posiciones) ? b.posiciones : null;
  const v = validarComposicion(pos);
  if (!v.ok) return json({ error: v.error }, 400);
  const nombre = b.nombre !== undefined ? String(b.nombre).trim().slice(0, 80) : p.nombre;
  if (!nombre) return json({ error: 'El nombre no puede estar vacío' }, 400);
  const tesis = b.tesis !== undefined ? String(b.tesis).trim().slice(0, 600) : p.tesis;
  if (p.publico) {
    if (!v.completa) return json({ error: 'Esta cartera es pública y debe mantener el 100 % asignado. Deja de publicarla para guardar un reparto incompleto.' }, 400);
    const motivo = puedePublicar({ total: v.total, n: pos.length, tesis }); if (motivo) return json({ error: motivo }, 400);
  }
  if (!esRevision(b.revision)) return json({ error: 'Falta la revisión de la cartera desde la que editas.' }, 400);
  if (b.revision !== p.revision) return conflicto(p);          // salida rápida; la garantía real es la condición del UPDATE
  const desconocidos = await tickersDesconocidos(env, pos);
  if (desconocidos.length) return json({ error: 'Algún ticker no está en el universo' }, 400);
  const token = crypto.randomUUID();
  const mia = 'EXISTS (SELECT 1 FROM portafolios WHERE id = ? AND token_escritura = ?)';
  const stmts = [
    // RETURNING: la revisión y la fecha que se devuelven son las de ESTA escritura, leídas dentro de la misma transacción
    env.DB.prepare(`UPDATE portafolios SET nombre = ?, tesis = ?, revision = revision + 1, token_escritura = ?, actualizado_en = datetime('now') WHERE id = ? AND revision = ? RETURNING revision, actualizado_en`)
      .bind(nombre, tesis || null, token, p.id, p.revision),
    env.DB.prepare(`DELETE FROM posiciones WHERE portafolio_id = ? AND ${mia}`).bind(p.id, p.id, token)];
  for (const x of pos)
    stmts.push(env.DB.prepare(`INSERT INTO posiciones (portafolio_id, ticker, peso) SELECT id, ?, ? FROM portafolios WHERE id = ? AND token_escritura = ?`).bind(x.ticker, Number(x.peso), p.id, token));
  let res;
  try { res = await env.DB.batch(stmts); } catch (e) { console.error('guardar cartera (PUT):', e); return json({ error: ERROR_INTERNO }, 500); } // el lote se revierte entero
  const mio = res[0].results?.[0];
  if (!mio) return conflicto(await owned(env, user, params.id) || p);                                                                         // otra escritura ganó: no se tocó nada
  return json({ ok: true, revision: mio.revision, actualizado_en: mio.actualizado_en });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM posiciones WHERE portafolio_id = ?').bind(p.id),
    env.DB.prepare('DELETE FROM portafolios WHERE id = ?').bind(p.id)]);
  return json({ ok: true });
}

// Cambia visibilidad (y, si se envían, nombre y tesis). Exige la revisión vista por el cliente. Para publicar: composición completa (100 %), al menos 1 posición y tesis.
export async function onRequestPatch({ request, env, params }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const p = await owned(env, user, params.id);
  if (!p) return json({ error: 'No encontrado' }, 404);
  const b = await readJson(request) || {};
  const nombre = b.nombre !== undefined ? String(b.nombre).trim().slice(0, 80) : p.nombre;
  if (!nombre) return json({ error: 'El nombre no puede estar vacío' }, 400);
  const tesis = b.tesis !== undefined ? String(b.tesis).trim().slice(0, 600) : p.tesis;
  const publico = b.publico !== undefined ? (b.publico ? 1 : 0) : p.publico;
  if (publico) {
    const r = await env.DB.prepare('SELECT COUNT(*) c, COALESCE(SUM(peso), 0) s FROM posiciones WHERE portafolio_id = ?').bind(p.id).first();
    const motivo = puedePublicar({ total: r.s, n: r.c, tesis });
    if (motivo) return json({ error: motivo }, 400);
  }
  if (!esRevision(b.revision)) return json({ error: 'Falta la revisión de la cartera desde la que editas.' }, 400);
  if (b.revision !== p.revision) return conflicto(p);
  let mio;
  try {
    const r = await env.DB.prepare(`UPDATE portafolios SET nombre = ?, tesis = ?, publico = ?, revision = revision + 1, token_escritura = ?, actualizado_en = datetime('now') WHERE id = ? AND revision = ? RETURNING revision, actualizado_en`)
      .bind(nombre, tesis || null, publico, crypto.randomUUID(), p.id, p.revision).all();
    mio = r.results?.[0];
  } catch (e) { console.error('guardar cartera (PATCH):', e); return json({ error: ERROR_INTERNO }, 500); }
  if (!mio) return conflicto(await owned(env, user, params.id) || p);
  return json({ ok: true, revision: mio.revision, actualizado_en: mio.actualizado_en }); // los de ESTA escritura, no «los vigentes»
}
