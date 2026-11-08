-- Fase 1 (ronda 33): EMBUDO ANÓNIMO. Solo contadores por día y tipo de evento: sin usuario, sin IP, sin dispositivo, sin cookies.
-- SOLO ADITIVA. (Sobre un schema.sql nuevo no hace falta: ya incluye la tabla; esta sentencia es idempotente.)
CREATE TABLE IF NOT EXISTS eventos_dia (
  fecha TEXT NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),   -- día (UTC)
  evento TEXT NOT NULL CHECK (evento IN ('visita','vuelve_7d','cuenta_iniciada','cartera_creada','idea_guardada')),
  n INTEGER NOT NULL DEFAULT 0 CHECK (n >= 0),
  PRIMARY KEY (fecha, evento)
);
