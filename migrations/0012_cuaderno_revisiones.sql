-- Ronda 21 (Cuaderno): «qué me haría cambiar de opinión» y el historial mínimo de revisiones; origen de la cartera (plantilla, vacía, ejemplo, manual).
-- SOLO ADITIVA: no toca filas existentes. Las notas, preguntas y fechas antiguas se conservan tal cual; `invalidacion` parte vacía y `origen` parte en «plantilla».
-- (No se aplica sobre un schema.sql nuevo: ya incluye las columnas y fallaría con «duplicate column».)
ALTER TABLE escenarios ADD COLUMN invalidacion TEXT NOT NULL DEFAULT '' CHECK (length(invalidacion) <= 600);
ALTER TABLE portafolios ADD COLUMN origen TEXT NOT NULL DEFAULT 'plantilla' CHECK (origen IN ('plantilla','vacia','ejemplo','manual'));
CREATE TABLE IF NOT EXISTS revisiones_escenario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  escenario_id INTEGER NOT NULL REFERENCES escenarios(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  clave TEXT NOT NULL CHECK (length(clave) BETWEEN 8 AND 64),          -- identifica el intento: un reintento no duplica la revisión
  fecha TEXT NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),   -- día de calendario elegido por la persona (sin zona horaria)
  observacion TEXT NOT NULL DEFAULT '' CHECK (length(observacion) <= 600),   -- comentario PERSONAL (no un hecho verificado)
  aprendizaje TEXT NOT NULL DEFAULT '' CHECK (length(aprendizaje) <= 600),
  decision TEXT NOT NULL CHECK (decision IN ('mantener','descartar','reprogramar')),
  proxima_fecha TEXT CHECK (proxima_fecha IS NULL OR proxima_fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, clave)
);
CREATE INDEX IF NOT EXISTS idx_revisiones_escenario ON revisiones_escenario (escenario_id, id DESC);
