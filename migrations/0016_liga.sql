-- Ronda 36 (C51): LIGA, Temporada 0 (ronda36/LIGA.md). Apodo y visibilidad pública de cada persona, inscripción por temporada, ligas privadas con código y miembros.
-- La foto semanal guarda además cuántas posiciones tiene la cartera y si está al 100 % (la Liga solo da puntos de equilibrio con ≥ 4 posiciones y al 100 %).
-- SOLO ADITIVA. (No se aplica sobre un schema.sql nuevo: ya incluye estas columnas y fallaría con «duplicate column».)
ALTER TABLE usuarios ADD COLUMN apodo TEXT CHECK (apodo IS NULL OR length(apodo) BETWEEN 3 AND 20);
ALTER TABLE usuarios ADD COLUMN liga_publica INTEGER NOT NULL DEFAULT 0 CHECK (liga_publica IN (0, 1));
ALTER TABLE instantaneas ADD COLUMN n_posiciones INTEGER;
ALTER TABLE instantaneas ADD COLUMN completa INTEGER CHECK (completa IS NULL OR completa IN (0, 1));
CREATE TABLE IF NOT EXISTS liga_inscripciones (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  temporada TEXT NOT NULL CHECK (temporada GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),   -- lunes en que empieza la temporada
  cartera_id INTEGER NOT NULL,
  inscrito_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, temporada)
);
CREATE TABLE IF NOT EXISTS ligas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE CHECK (length(codigo) = 6),
  nombre TEXT NOT NULL CHECK (length(nombre) BETWEEN 3 AND 40),
  creador_id INTEGER NOT NULL REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS liga_miembros (
  liga_id INTEGER NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  unido_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (liga_id, usuario_id)
);
CREATE INDEX IF NOT EXISTS idx_liga_miembros_usuario ON liga_miembros (usuario_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_apodo ON usuarios (lower(apodo)) WHERE apodo IS NOT NULL;
