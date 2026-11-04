-- Esquema D1 (6 tablas). No hay tabla de precios: la beta no los guarda.
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  acepto_en TEXT                -- cuándo aceptó aviso legal y privacidad
);
-- Enlaces mágicos de un solo uso (se guarda el hash, nunca el token).
CREATE TABLE IF NOT EXISTS enlaces (
  hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expira TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  con_borrador INTEGER NOT NULL DEFAULT 0   -- la persona tenía un borrador local al pedir el enlace (solo para avisar)
);
CREATE INDEX IF NOT EXISTS idx_enlaces_email ON enlaces(email, creado_en);
-- Sesiones por dispositivo (se guarda el hash).
CREATE TABLE IF NOT EXISTS sesiones (
  hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_acceso TEXT            -- se actualiza como mucho una vez por hora
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
  fuente TEXT CHECK (fuente IS NULL OR fuente IN ('sec','prueba','demo')),   -- procedencia de ESTA fila (NULL = sin fuente verificada)
  actualizado_en TEXT,                                                        -- fecha de la carga que la escribió
  PRIMARY KEY (ticker, periodo)
);
CREATE TABLE IF NOT EXISTS portafolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  nombre TEXT NOT NULL,
  plantilla TEXT NOT NULL CHECK (plantilla IN ('riesgo','oro','dividendos')),
  publico INTEGER NOT NULL DEFAULT 0,
  tesis TEXT,
  actualizado_en TEXT,          -- última modificación real (NULL hasta la primera)
  revision INTEGER NOT NULL DEFAULT 0,   -- sube en cada escritura: control de versión atómico (la fecha, de un segundo, solo se muestra)
  token_escritura TEXT,                  -- marca de la escritura en curso (interno)
  limite_peso REAL CHECK (limite_peso IS NULL OR (limite_peso > 0 AND limite_peso <= 100)),  -- límite personal por posición (opcional; preferencia privada, no sube la revisión)
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
-- Ronda 13 (migración 0008): radar, escenarios y origen de los datos
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
  pregunta TEXT NOT NULL DEFAULT '' CHECK (length(pregunta) <= 200),     -- ronda 14: qué quiere averiguar la persona (opcional)
  revisar_en TEXT CHECK (revisar_en IS NULL OR revisar_en GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  historia TEXT CHECK (historia IS NULL OR length(historia) BETWEEN 1 AND 60),   -- identificador de la historia editorial de origen
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, clave)
);
CREATE INDEX IF NOT EXISTS idx_escenarios_usuario ON escenarios (usuario_id, id DESC);
CREATE TABLE IF NOT EXISTS datos_meta (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
-- Ronda 14 (migración 0009): lotes de carga trazables
CREATE TABLE IF NOT EXISTS cargas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origen TEXT NOT NULL CHECK (origen IN ('sec','prueba','demo')),
  fecha TEXT NOT NULL,
  n_ok INTEGER NOT NULL, n_vacias INTEGER NOT NULL, n_fallidas INTEGER NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('correcta','parcial','vacia')),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
