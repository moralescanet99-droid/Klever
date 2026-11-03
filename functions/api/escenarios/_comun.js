// Utilidades de escenarios (privadas del módulo; el prefijo «_» evita que Pages lo enrute).
export const ESTADOS = ['en_estudio', 'descartado', 'archivado'];
const colegir = r => ({
  id: r.id, clave: r.clave, nombre: r.nombre, nota: r.nota, estado: r.estado, metodo: r.metodo, ticker: r.ticker, peso_objetivo: r.peso_objetivo,
  cartera_id: r.cartera_id, cartera_nombre: r.cartera_nombre, base_revision: r.base_revision, revision: r.revision,
  base: JSON.parse(r.base_json), propuesta: JSON.parse(r.propuesta_json), creado_en: r.creado_en, actualizado_en: r.actualizado_en,
  // Aviso de versión posterior: SOLO informa; el escenario conserva su base y nunca se recalcula.
  cartera_existe: r.revision_actual != null, revision_actual: r.revision_actual ?? null,
  hay_version_posterior: r.revision_actual != null && r.revision_actual > r.base_revision,
});
export const SELECT_ESCENARIO = `SELECT e.*, p.revision AS revision_actual FROM escenarios e LEFT JOIN portafolios p ON p.id = e.cartera_id AND p.usuario_id = e.usuario_id`;
export const formato = colegir;
