-- Ronda 15: datos para el comparador (resultado operativo), trazabilidad del informe de origen, clasificación y mercado para la nota de
-- estructura v1, y evaluación fechada guardada en cada escenario. SOLO ADITIVA (las filas existentes quedan con NULL = «sin dato»).
-- (No se aplica sobre un schema.sql nuevo: ya incluye todo y fallaría con «duplicate column».)
ALTER TABLE fundamentales ADD COLUMN resultado_operativo REAL;      -- para el margen operativo (resultado operativo / ventas); NO es el margen neto
ALTER TABLE fundamentales ADD COLUMN informe TEXT;                  -- identificador del informe de origen (p. ej. número de acceso de la SEC)
ALTER TABLE activos ADD COLUMN actividad TEXT;                      -- actividad (más fina que el sector); NULL = desconocida
ALTER TABLE activos ADD COLUMN emisor TEXT;                         -- compañía emisora: agrupa las distintas clases de acciones de una misma empresa
CREATE TABLE IF NOT EXISTS mercado (
  ticker TEXT PRIMARY KEY REFERENCES activos(ticker),
  capitalizacion REAL,                                              -- en moneda común
  importe_diario_mediano REAL,                                      -- mediana del importe negociado en `sesiones` sesiones, en moneda común
  sesiones INTEGER,
  moneda TEXT NOT NULL DEFAULT 'USD',
  fecha TEXT,
  fuente TEXT CHECK (fuente IS NULL OR fuente IN ('sec','mercado','prueba','demo'))
);
ALTER TABLE escenarios ADD COLUMN nota_json TEXT;                   -- evaluación de estructura (antes/después) FECHADA que vio la persona; nunca se recalcula
