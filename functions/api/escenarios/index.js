import { json, auth, readJson, tickersDesconocidos, ERROR_INTERNO } from '../../_lib.js';
import { propuestaCoincide, simular } from '../../../public/js/calculos.js';
import { SELECT_ESCENARIO, formato } from './_comun.js';

const MAX_ESCENARIOS = 100;

// Mis escenarios (solo los del usuario autenticado; la propiedad va en la consulta).
export async function onRequestGet({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  try {
    const { results } = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.usuario_id = ? ORDER BY e.id DESC`).bind(user.id).all();
    return json(results.map(formato));
  } catch (e) { console.error('leer escenarios:', e); return json({ error: 'No se pudieron leer tus escenarios. Inténtalo de nuevo.' }, 500); }
}

// Guardar un escenario = SIMULACIÓN privada. No ejecuta operaciones, no cambia la cartera base y no toca su publicación.
// { clave, nombre, nota?, cartera_id, base_revision, ticker, peso, financiacion, propuesta }
//  · La base es la composición GUARDADA de la cartera en ese momento (se copia en el servidor); si su revisión ya no es la que vio el cliente → 409.
//  · El servidor recalcula la propuesta con el mismo módulo que la interfaz y rechaza una cifra distinta.
//  · `clave` identifica el intento: un reintento tras un corte devuelve el escenario ya guardado en lugar de duplicarlo.
export async function onRequestPost({ request, env }) {
  const user = await auth(request, env);
  if (!user) return json({ error: 'No autorizado' }, 401);
  const b = await readJson(request) || {};
  const nombre = String(b.nombre ?? '').trim(), nota = String(b.nota ?? '').trim(), clave = String(b.clave ?? '');
  if (!nombre || nombre.length > 80) return json({ error: 'Escribe un nombre de hasta 80 caracteres para el escenario.' }, 400);
  if (nota.length > 600) return json({ error: 'La nota admite hasta 600 caracteres.' }, 400);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(clave)) return json({ error: 'Falta la clave del intento de guardado.' }, 400);
  if (!['sin_asignar', 'proporcional'].includes(b.financiacion)) return json({ error: 'Método de financiación no válido.' }, 400);
  const ticker = String(b.ticker ?? '').toUpperCase(), peso = Number(b.peso);
  if (!/^[A-Z.]{1,6}$/.test(ticker) || !(peso > 0 && peso <= 100)) return json({ error: 'Activo o peso no válidos.' }, 400);
  try {
    const previo = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.usuario_id = ? AND e.clave = ?`).bind(user.id, clave).first();
    if (previo) return json({ ...formato(previo), duplicado: true });             // reintento: ya estaba guardado
    const { c } = await env.DB.prepare('SELECT COUNT(*) c FROM escenarios WHERE usuario_id = ?').bind(user.id).first();
    if (c >= MAX_ESCENARIOS) return json({ error: `Puedes guardar hasta ${MAX_ESCENARIOS} escenarios. Descarta alguno para guardar otro.` }, 400);
    // cartera + posiciones en UN lote (una instantánea)
    const [rc, rp] = await env.DB.batch([
      env.DB.prepare('SELECT id, nombre, revision FROM portafolios WHERE id = ? AND usuario_id = ?').bind(Number(b.cartera_id), user.id),
      env.DB.prepare(`SELECT po.ticker, po.peso FROM posiciones po JOIN portafolios p ON p.id = po.portafolio_id WHERE p.id = ? AND p.usuario_id = ? ORDER BY po.peso DESC, po.ticker`).bind(Number(b.cartera_id), user.id)]);
    const cartera = rc.results[0];
    if (!cartera) return json({ error: 'No encontrado' }, 404);                    // también si es de OTRO usuario: no se distingue
    if (b.base_revision !== cartera.revision) return json({ error: 'La cartera cambió después de la versión que simulaste. Vuelve a simular con la versión actual.', conflicto: true, revision: cartera.revision }, 409);
    if ((await tickersDesconocidos(env, [{ ticker }])).length) return json({ error: 'Ese activo no está en el universo' }, 400);
    const base = rp.results.map(x => ({ ticker: x.ticker, peso: x.peso }));
    const s = simular(base, { ticker, peso }, b.financiacion);
    if (!s.viable) return json({ error: 'La simulación no es viable: ' + s.motivo }, 400);
    const ok = propuestaCoincide(base, { ticker, peso }, b.financiacion, Array.isArray(b.propuesta) ? b.propuesta : []);
    if (!ok.ok) return json({ error: ok.motivo }, 400);
    try {
      await env.DB.prepare(
        `INSERT INTO escenarios (usuario_id, clave, nombre, nota, metodo, cartera_id, cartera_nombre, base_revision, ticker, peso_objetivo, base_json, propuesta_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(user.id, clave, nombre, nota, b.financiacion, cartera.id, cartera.nombre, cartera.revision, ticker, peso, JSON.stringify(base), JSON.stringify(s.despues)).run();
    } catch (e) {
      const otro = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.usuario_id = ? AND e.clave = ?`).bind(user.id, clave).first(); // carrera entre dos reintentos
      if (otro) return json({ ...formato(otro), duplicado: true });
      throw e;
    }
    const guardado = await env.DB.prepare(`${SELECT_ESCENARIO} WHERE e.usuario_id = ? AND e.clave = ?`).bind(user.id, clave).first();
    return json(formato(guardado), 201);
  } catch (e) { console.error('guardar escenario:', e); return json({ error: ERROR_INTERNO }, 500); }
}
