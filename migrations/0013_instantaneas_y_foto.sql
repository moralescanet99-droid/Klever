-- Ronda 30 (punto 14): FOTO SEMANAL de cada cartera en el servidor y FOTO DE LOS DATOS de las empresas de una idea al guardarla.
-- SOLO ADITIVA: no toca filas existentes. Las ideas antiguas quedan sin foto (`foto_datos` NULL) y así se dice en la interfaz.
-- (No se aplica sobre un schema.sql nuevo: ya incluye la tabla y la columna y fallaría con «duplicate column».)
CREATE TABLE IF NOT EXISTS instantaneas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  cartera_id INTEGER NOT NULL,                                   -- sin FK: se borra explícitamente al borrar la cartera
  semana TEXT NOT NULL CHECK (semana GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),   -- lunes (UTC) de la semana
  concentracion TEXT NOT NULL CHECK (concentracion IN ('ok','medio','alto')),
  variedad TEXT NOT NULL CHECK (variedad IN ('ok','medio','alto')),
  n_categorias INTEGER NOT NULL CHECK (n_categorias >= 0),
  senales TEXT NOT NULL CHECK (length(senales) <= 1000),           -- JSON [{ id, nivel, titulo }] (como mucho 3); NUNCA importes
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, cartera_id, semana)
);
ALTER TABLE escenarios ADD COLUMN foto_datos TEXT CHECK (foto_datos IS NULL OR length(foto_datos) <= 4000);
