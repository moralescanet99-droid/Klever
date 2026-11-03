import { json, DEMO_EMAIL } from '../../_lib.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.nombre, p.plantilla, p.tesis, COUNT(po.ticker) AS n_posiciones,
            CASE WHEN u.email = ? THEN 'ejemplo' ELSE 'usuario' END AS origen
     FROM portafolios p JOIN usuarios u ON u.id = p.usuario_id LEFT JOIN posiciones po ON po.portafolio_id = p.id
     WHERE p.publico = 1 GROUP BY p.id ORDER BY (origen = 'ejemplo') DESC, p.id DESC LIMIT 50`).bind(DEMO_EMAIL).all();
  return json(results);
}
