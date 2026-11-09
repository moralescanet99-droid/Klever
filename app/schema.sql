-- Klever v1 · ESQUEMA D1 (Cloudflare). Una tabla por cada colección del `Repo` (src/lib/servicio/repo.ts)
-- más enlaces de acceso y sesiones. Fechas en texto ISO UTC (instantes) o yyyy-mm-dd (lunes de la semana).
-- Pesos en décimas (1000 = 100 %). Sin datos personales salvo el correo (necesario para entrar).
-- Aplicar:  npx wrangler d1 execute klever --remote --file=schema.sql   (idempotente: IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS usuarios (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL UNIQUE,              -- siempre en minúsculas
  apodo        TEXT NOT NULL,
  apodo_clave  TEXT NOT NULL UNIQUE,              -- apodo en minúsculas (único sin distinguir mayúsculas)
  mayor18_en   TEXT NOT NULL,                     -- cuándo declaró tener 18 años o más
  invitado_por TEXT,                              -- código de invitación usado (NULL: administración)
  creado       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carteras (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre     TEXT NOT NULL,
  principal  INTEGER NOT NULL DEFAULT 0,
  liga_id    INTEGER,                             -- cartera de un draft
  creada     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS carteras_usuario ON carteras(usuario_id);

-- Historial: cada guardado es una versión nueva (la foto del lunes se reconstruye de aquí).
CREATE TABLE IF NOT EXISTS versiones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cartera_id INTEGER NOT NULL REFERENCES carteras(id) ON DELETE CASCADE,
  desde      TEXT NOT NULL,
  posiciones TEXT NOT NULL                        -- JSON [{ticker, decimas}]
);
CREATE INDEX IF NOT EXISTS versiones_cartera ON versiones(cartera_id, id);

CREATE TABLE IF NOT EXISTS revisiones (
  usuario_id INTEGER NOT NULL,
  semana     TEXT NOT NULL,
  ticker     TEXT NOT NULL,
  PRIMARY KEY (usuario_id, semana, ticker)
);

CREATE TABLE IF NOT EXISTS visitas (
  usuario_id INTEGER NOT NULL,
  semana     TEXT NOT NULL,
  PRIMARY KEY (usuario_id, semana)
);

CREATE TABLE IF NOT EXISTS temporadas (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  inicio TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ligas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo       TEXT NOT NULL,
  nombre       TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('clasica', 'draft', 'general')),
  estado       TEXT NOT NULL CHECK (estado IN ('abierta', 'draft', 'en_juego', 'terminada')),
  reglas       TEXT NOT NULL,                     -- JSON ReglasLiga
  creador_id   INTEGER NOT NULL,                  -- 0 en la clasificación general
  temporada_id INTEGER NOT NULL,
  creada       TEXT NOT NULL
);
-- El código de las ligas privadas es único; la general de cada temporada usa un código fijo.
CREATE UNIQUE INDEX IF NOT EXISTS ligas_codigo ON ligas(codigo) WHERE tipo <> 'general';
CREATE UNIQUE INDEX IF NOT EXISTS ligas_general ON ligas(temporada_id) WHERE tipo = 'general';

CREATE TABLE IF NOT EXISTS miembros (
  liga_id     INTEGER NOT NULL,
  usuario_id  INTEGER NOT NULL,
  cartera_id  INTEGER,
  unido       TEXT NOT NULL,
  orden_draft INTEGER,
  PRIMARY KEY (liga_id, usuario_id)
);
CREATE INDEX IF NOT EXISTS miembros_usuario ON miembros(usuario_id);

CREATE TABLE IF NOT EXISTS picks (
  liga_id    INTEGER NOT NULL,
  ronda      INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  ticker     TEXT NOT NULL,
  en         TEXT NOT NULL,
  UNIQUE (liga_id, ticker)                        -- cada empresa es exclusiva dentro de la liga
);
CREATE INDEX IF NOT EXISTS picks_liga ON picks(liga_id, en);

CREATE TABLE IF NOT EXISTS cambios_draft (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  liga_id    INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  semana     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cambios_draft_semana ON cambios_draft(liga_id, usuario_id, semana);

CREATE TABLE IF NOT EXISTS invitaciones (
  codigo     TEXT PRIMARY KEY,
  creada_por INTEGER,                             -- NULL = creada desde el panel de administración
  usos_max   INTEGER NOT NULL DEFAULT 1,
  usos       INTEGER NOT NULL DEFAULT 0,
  creada     TEXT NOT NULL,
  nota       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS invitaciones_creador ON invitaciones(creada_por);

-- Medición anónima: un contador por día y evento. Nada que identifique a nadie.
CREATE TABLE IF NOT EXISTS eventos (
  dia    TEXT NOT NULL,
  nombre TEXT NOT NULL,
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, nombre)
);

-- Enlaces de acceso por correo: solo se guarda el HASH (SHA-256) del token; un solo uso, 15 minutos.
CREATE TABLE IF NOT EXISTS enlaces (
  hash       TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  invitacion TEXT,                                -- código con el que pidió entrar (cuentas nuevas)
  creado     TEXT NOT NULL,
  expira     TEXT NOT NULL,
  usado      TEXT
);
CREATE INDEX IF NOT EXISTS enlaces_email ON enlaces(email, creado);

-- Sesiones: cookie HttpOnly con un token aleatorio; aquí solo su HASH. 30 días.
-- usuario_id NULL = el correo está verificado pero falta el alta (apodo y mayoría de edad).
CREATE TABLE IF NOT EXISTS sesiones (
  hash       TEXT PRIMARY KEY,
  usuario_id INTEGER,
  email      TEXT NOT NULL,
  invitacion TEXT,
  creada     TEXT NOT NULL,
  expira     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sesiones_usuario ON sesiones(usuario_id);
