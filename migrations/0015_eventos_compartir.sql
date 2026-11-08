-- Ronda 36: el embudo admite «compartir» y «visita_enlace» (tarjeta para compartir). SQLite no permite cambiar un CHECK: se recrea la tabla conservando sus filas.
CREATE TABLE IF NOT EXISTS eventos_dia_nueva (
  fecha TEXT NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  evento TEXT NOT NULL CHECK (evento IN ('visita','vuelve_7d','cuenta_iniciada','cartera_creada','idea_guardada','compartir','visita_enlace')),
  n INTEGER NOT NULL DEFAULT 0 CHECK (n >= 0),
  PRIMARY KEY (fecha, evento)
);
INSERT INTO eventos_dia_nueva (fecha, evento, n) SELECT fecha, evento, n FROM eventos_dia;
DROP TABLE eventos_dia;
ALTER TABLE eventos_dia_nueva RENAME TO eventos_dia;
