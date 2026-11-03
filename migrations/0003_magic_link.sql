-- Pasa de token en usuarios a enlaces mágicos + sesiones. Los usuarios de la versión anterior pierden su sesión.
PRAGMA foreign_keys = OFF;
CREATE TABLE usuarios_new (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, creado_en TEXT NOT NULL DEFAULT (datetime('now')));
INSERT INTO usuarios_new (id, email, creado_en) SELECT id, email, creado_en FROM usuarios;
DROP TABLE usuarios;
ALTER TABLE usuarios_new RENAME TO usuarios;
CREATE TABLE IF NOT EXISTS enlaces (hash TEXT PRIMARY KEY, email TEXT NOT NULL, expira TEXT NOT NULL, creado_en TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_enlaces_email ON enlaces(email, creado_en);
CREATE TABLE IF NOT EXISTS sesiones (hash TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id), creado_en TEXT NOT NULL DEFAULT (datetime('now')));
PRAGMA foreign_keys = ON;
