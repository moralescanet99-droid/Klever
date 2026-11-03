-- Esquema D1 (6 tablas). No hay tabla de precios: la beta no los guarda.
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS activos (
  ticker TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('accion','etf')),
  sector TEXT NOT NULL,
  cik TEXT,
  exchange TEXT
);
CREATE TABLE IF NOT EXISTS fundamentales (
  ticker TEXT NOT NULL REFERENCES activos(ticker),
  periodo TEXT NOT NULL,            -- ej. FY2024
  ingresos REAL, beneficio_neto REAL, deuda_neta REAL,
  ebitda REAL, flujo_caja_libre REAL, roic REAL,
  PRIMARY KEY (ticker, periodo)
);
CREATE TABLE IF NOT EXISTS portafolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  nombre TEXT NOT NULL,
  plantilla TEXT NOT NULL CHECK (plantilla IN ('riesgo','oro','dividendos')),
  publico INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS posiciones (
  portafolio_id INTEGER NOT NULL REFERENCES portafolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL REFERENCES activos(ticker),
  peso REAL NOT NULL CHECK (peso > 0 AND peso <= 100),
  fecha_entrada TEXT NOT NULL DEFAULT (date('now')),
  PRIMARY KEY (portafolio_id, ticker)
);
CREATE TABLE IF NOT EXISTS ideas (
  ticker TEXT PRIMARY KEY REFERENCES activos(ticker),
  criterios_cumplidos TEXT NOT NULL,  -- JSON
  calculado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
