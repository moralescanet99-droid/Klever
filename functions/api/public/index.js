import { json } from '../../_lib.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.nombre, p.plantilla, p.tesis, COUNT(po.ticker) AS n_posiciones
     FROM portafolios p LEFT JOIN posiciones po ON po.portafolio_id = p.id
     WHERE p.publico = 1 GROUP BY p.id ORDER BY p.id DESC LIMIT 50`).all();
  return json(results);
}
