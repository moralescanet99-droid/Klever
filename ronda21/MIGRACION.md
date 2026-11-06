# Migración 0012 (ronda 21) — `migrations/0012_cuaderno_revisiones.sql`

**Solo aditiva; conserva los datos previos.** No se aplica sobre un `schema.sql` nuevo (ya incluye las columnas y fallaría con «duplicate column»).

| Cambio | Detalle |
|---|---|
| `escenarios.invalidacion` | `TEXT NOT NULL DEFAULT ''`, ≤ 600 caracteres. «Qué me haría cambiar de opinión». Las filas antiguas quedan en `''` |
| `portafolios.origen` | `TEXT NOT NULL DEFAULT 'plantilla'`, valores `plantilla`, `vacia`, `ejemplo`, `manual`. Las filas antiguas quedan en `plantilla` |
| `revisiones_escenario` | `id`, `escenario_id` (FK `ON DELETE CASCADE`), `usuario_id`, `clave` (8–64; `UNIQUE (usuario_id, clave)`: idempotencia), `fecha` (día de calendario), `observacion` y `aprendizaje` (≤ 600), `decision` (`mantener`, `descartar`, `reprogramar`), `proxima_fecha`, `creado_en`. Índice por `(escenario_id, id DESC)` |

**Verificación:** `tests/ronda8/unit-migracion.mjs` M1f aplica la 0012 sobre una base antigua **con escenarios y carteras**, comprueba que **ninguna fila cambia campo a campo**, que `invalidacion` está vacía y `origen` = `plantilla` en todas, que la tabla nueva existe y está vacía y que las tablas migradas **coinciden con `schema.sql`**. Sin probar en una D1 remota.

**Orden de aplicación en una base existente:** 0012 después de 0011. **Si falla a medias:** SQLite aplica cada `ALTER` por separado; comprobar con `PRAGMA table_info` qué columnas existen y aplicar solo lo que falte. No hay reversión automática (`DROP COLUMN` exige SQLite ≥ 3.35; no se incluye).

**Nota sobre un nombre:** `portafolios.origen` convive con el alias `origen` de las consultas de carteras públicas; hay que **calificar** el nombre en cualquier `ORDER BY` (ver la regresión K20).
