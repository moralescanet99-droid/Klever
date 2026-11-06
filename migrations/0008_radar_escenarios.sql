-- Ronda 13: radar, escenarios (laboratorio), límite personal de peso y origen de los datos. SOLO ADITIVA: no toca filas existentes.
-- (No se aplica sobre un schema.sql nuevo: ya incluye todo y fallaría con «duplicate column».)
ALTER TABLE portafolios ADD COLUMN limite_peso REAL CHECK (limite_peso IS NULL OR (limite_peso > 0 AND limite_peso <= 100));
CREATE TABLE IF NOT EXISTS radar (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  ticker TEXT NOT NULL REFERENCES activos(ticker),
  nota TEXT NOT NULL DEFAULT '' CHECK (length(nota) <= 500),
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, ticker)
);
CREATE TABLE IF NOT EXISTS escenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  clave TEXT NOT NULL CHECK (length(clave) BETWEEN 8 AND 64),          -- identifica el intento de guardado: un reintento no duplica
  nombre TEXT NOT NULL CHECK (length(nombre) BETWEEN 1 AND 80),
  nota TEXT NOT NULL DEFAULT '' CHECK (length(nota) <= 600),
  estado TEXT NOT NULL DEFAULT 'en_estudio' CHECK (estado IN ('en_estudio','descartado','archivado')),
  metodo TEXT NOT NULL CHECK (metodo IN ('sin_asignar','proporcional')),
  cartera_id INTEGER,                                                   -- sin FK: si se borra la cartera, el escenario conserva su copia
  cartera_nombre TEXT NOT NULL,
  base_revision INTEGER NOT NULL,
  ticker TEXT NOT NULL REFERENCES activos(ticker),
  peso_objetivo REAL NOT NULL CHECK (peso_objetivo > 0 AND peso_objetivo <= 100),
  base_json TEXT NOT NULL,                                              -- copia de la composición de la cartera en esa revisión
  propuesta_json TEXT NOT NULL,                                         -- composición propuesta (calculada por el método; nunca se recalcula)
  revision INTEGER NOT NULL DEFAULT 0,                                  -- control de escrituras de nombre, nota y estado
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, clave)
);
CREATE INDEX IF NOT EXISTS idx_escenarios_usuario ON escenarios (usuario_id, id DESC);
CREATE TABLE IF NOT EXISTS datos_meta (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
