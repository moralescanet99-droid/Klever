// Utilidades de escenarios (privadas del módulo; el prefijo «_» evita que Pages lo enrute).
export const ESTADOS = ['en_estudio', 'descartado', 'archivado'];
const colegir = r => ({
  id: r.id, clave: r.clave, nombre: r.nombre, nota: r.nota, estado: r.estado, metodo: r.metodo, ticker: r.ticker, peso_objetivo: r.peso_objetivo,
  cartera_id: r.cartera_id, cartera_nombre: r.cartera_nombre, base_revision: r.base_revision, revision: r.revision,
  pregunta: r.pregunta || '', revisar_en: r.revisar_en || null, historia: r.historia || null,
  base: JSON.parse(r.base_json), propuesta: JSON.parse(r.propuesta_json), creado_en: r.creado_en, actualizado_en: r.actualizado_en,
  // Aviso de versión posterior: SOLO informa; el escenario conserva su base y nunca se recalcula.
  cartera_existe: r.revision_actual != null, revision_actual: r.revision_actual ?? null,
  hay_version_posterior: r.revision_actual != null && r.revision_actual > r.base_revision,
});
export const SELECT_ESCENARIO = `SELECT e.*, p.revision AS revision_actual FROM escenarios e LEFT JOIN portafolios p ON p.id = e.cartera_id AND p.usuario_id = e.usuario_id`;
export const formato = colegir;

// Fecha de calendario real «AAAA-MM-DD» (no basta el formato: 2026-02-31 no existe).
export const fechaValida = v => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return false; const d = new Date(v + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().slice(0, 10) === v; };
export const MAX_PREGUNTA = 200, ID_HISTORIA = /^[a-z0-9][a-z0-9-]{0,59}$/;
