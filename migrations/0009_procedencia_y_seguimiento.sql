-- Ronda 14: procedencia POR DATO (fuente y fecha en cada fila de fundamentales), lotes de carga trazables y campos de seguimiento
-- del escenario (pregunta, fecha de revisión, historia vinculada). SOLO ADITIVA: las filas existentes quedan con fuente NULL
-- («sin fuente verificada»), los escenarios anteriores con pregunta vacía y sin fecha: siguen abriéndose igual.
-- (No se aplica sobre un schema.sql nuevo: ya incluye todo y fallaría con «duplicate column».)
ALTER TABLE fundamentales ADD COLUMN fuente TEXT CHECK (fuente IS NULL OR fuente IN ('sec','prueba','demo'));
ALTER TABLE fundamentales ADD COLUMN actualizado_en TEXT;
ALTER TABLE escenarios ADD COLUMN pregunta TEXT NOT NULL DEFAULT '' CHECK (length(pregunta) <= 200);
ALTER TABLE escenarios ADD COLUMN revisar_en TEXT CHECK (revisar_en IS NULL OR revisar_en GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]');
ALTER TABLE escenarios ADD COLUMN historia TEXT CHECK (historia IS NULL OR length(historia) BETWEEN 1 AND 60);
CREATE TABLE IF NOT EXISTS cargas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origen TEXT NOT NULL CHECK (origen IN ('sec','prueba','demo')),
  fecha TEXT NOT NULL,
  n_ok INTEGER NOT NULL, n_vacias INTEGER NOT NULL, n_fallidas INTEGER NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('correcta','parcial','vacia')),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
