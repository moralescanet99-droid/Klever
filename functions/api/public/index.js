import { json, DEMO_EMAIL } from '../../_lib.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.nombre, p.plantilla, p.tesis, COUNT(po.ticker) AS n_posiciones,
            CASE WHEN u.email = ? THEN 'ejemplo' ELSE 'usuario' END AS origen
     FROM portafolios p JOIN usuarios u ON u.id = p.usuario_id LEFT JOIN posiciones po ON po.portafolio_id = p.id
     WHERE p.publico = 1 GROUP BY p.id ORDER BY (u.email = ?) DESC, p.id DESC LIMIT 50`).bind(DEMO_EMAIL, DEMO_EMAIL).all();   // ronda 21: `origen` ya es también una columna de portafolios; en un ORDER BY el nombre resolvía a la COLUMNA y no al alias (los ejemplos dejaron de ir primero)
  return json(results);
}
