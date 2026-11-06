# Guion breve: recorrido completo de la beta y verificación en D1 remoto

> **Estado: NINGUNO de estos pasos se ha ejecutado contra Cloudflare real.** Lo que sí se ejecutó (en local, con D1 simulada) está en `ronda9/LEEME.md`. Este guion es para que lo ejecutes tú y anotes el resultado; cada casilla empieza en ⬜.

## A. Preparar un proyecto de PRUEBA en Cloudflare (no producción)
Usa una base y un proyecto aparte, **desechables**. El proyecto de prueba devuelve el enlace de acceso en pantalla (así no hace falta Brevo): cualquiera con la dirección puede entrar, por eso es solo para pruebas y se borra después.

```bash
npm ci
npx wrangler login
npx wrangler d1 create klever-prueba                      # anota el database_id que imprime
```
1. ⬜ Edita **solo en tu copia local** `wrangler.toml`: `database_name = "klever-prueba"` y el `database_id` real. **No lo subas al repositorio** (`git diff wrangler.toml` debe quedar vacío antes de cualquier commit; restáuralo al terminar con `git checkout wrangler.toml`).
2. ⬜ Esquema nuevo + datos ficticios (base nueva: **no** apliques ninguna migración):
```bash
npx wrangler d1 execute klever-prueba --remote --file=schema.sql
npx wrangler d1 execute klever-prueba --remote --file=data/seed-prueba.sql
npx wrangler d1 execute klever-prueba --remote --file=data/demo.sql
```
3. ⬜ Proyecto de Pages de prueba con el enlace de acceso visible y despliegue:
```bash
npx wrangler pages project create klever-prueba --production-branch main
npx wrangler pages secret put DEV_RETURN_LINK --project-name klever-prueba     # escribe: 1
npx wrangler pages deploy public --project-name klever-prueba
```
Anota la dirección (`https://klever-prueba.pages.dev` o la que devuelva). Si el binding `DB` no aparece, añádelo en el panel (Pages → klever-prueba → Settings → Bindings → D1 → variable `DB`).

## B. Verificación automática de la API en D1 remoto (≈1 min)
```bash
BASE_URL=https://klever-prueba.pages.dev node tests/ronda9/verificar-api.mjs
```
Debe terminar con `RESULTADO: 8 correctas, 0 fallos` y código de salida 0. Qué comprueba: crear con posiciones en una operación (V1), guardar posiciones + nombre + tesis juntos con su propia revisión (V2), revisión caducada → 409 (V3), ticker desconocido → 400 sin cambios (V4), 20 pares de guardados simultáneos: exactamente uno gana (V5), lecturas que nunca mezclan versiones mientras otro guarda (V6) y `GET /api/public/:id` que nunca devuelve una versión que no fue pública (V7).
- ⬜ Resultado obtenido: ______ (pega la salida; si falla, no sigas y avísame con la salida completa).
- **Límite:** V5–V7 son estrés empírico; que pasen no demuestra ausencia de carreras. Con D1 remoto la latencia es mayor y las carreras son más probables que en local, que es justo lo que se quiere ver.

## C. Migración 0007 con datos en D1 remoto (base antigua)
Solo si tienes una base **anterior a la ronda 7** (si no, sáltalo; **no** la apliques sobre el esquema nuevo: falla con «duplicate column»).
1. ⬜ Crea otra base desechable con el esquema anterior: `git show aa21407:schema.sql > /tmp/esquema-antiguo.sql`, `npx wrangler d1 create klever-antigua`, carga ese esquema y unas carteras con posiciones (por ejemplo `data/seed-prueba.sql` + `data/demo.sql`, que son de esa época).
2. ⬜ Anota `SELECT id, nombre, publico FROM portafolios;` y `SELECT COUNT(*) FROM posiciones;`.
3. ⬜ `npx wrangler d1 execute klever-antigua --remote --file=migrations/0007_revision.sql`
4. ⬜ Repite las consultas: mismas carteras y mismo número de posiciones; `SELECT DISTINCT revision FROM portafolios;` → solo `0`.

## D. Recorrido completo de la beta (a mano, en la dirección de prueba) ≈ 20 min
Abre la dirección de prueba en el móvil y en el ordenador (o en dos navegadores). Anota ✅/❌ y, si dudas, qué frase no se entendía. Es el guion de `PRUEBAS-DE-USO.md` ampliado a D1 remoto:

| # | Paso | Resultado esperado | Estado |
|---|---|---|---|
| D1 | Portada → «Dividendos» → cambiar dos pesos → «Guardar cartera» → entrar con un email (el enlace sale en pantalla) | «Cartera guardada»; estado «Guardada en tu cuenta» | ⬜ |
| D2 | «Mis carteras» → abrir → **recargar la página** | Los pesos son los guardados | ⬜ |
| D3 | Cambiar un peso sin guardar → volver a «Mis carteras» | Tarjeta con «Cambios locales pendientes de guardar en tu cuenta» y las dos versiones rotuladas | ⬜ |
| D4 | Con red cortada (F12 → Red → Sin conexión) pulsar Guardar; después reconectar | «No se pudo guardar», «Reintentar guardado»; la cuenta no cambia hasta reintentar | ⬜ |
| D5 | Pedir el enlace con un borrador sin guardar y abrirlo en **otro navegador** | Aviso fijo en «Mis carteras»; sin toast ni confirmación de guardado | ⬜ |
| D6 | Mismo usuario en dos navegadores: A edita sin guardar; B guarda otro cambio; A pulsa Guardar | Diálogo con «Versión de este dispositivo» y «Versión de tu cuenta»; «Decidir después» no cambia nada; «Conservar la de este dispositivo» vuelve al editor **sin guardar** | ⬜ |
| D7 | Cartera al 100 % + tesis → «Publicar cartera»; subir un peso hasta pasar del 100 % | «Guardar y actualizar publicación» desactivado con motivo; «Tus cambios aún no son públicos»; «Carteras públicas» no cambia | ⬜ |
| D8 | «Dejar de publicar» con cambios locales inválidos | Funciona y no pierdes lo escrito | ⬜ |
| D9 | Guardar en A y abrir otra cartera B antes de que responda (red lenta: F12 → Red → Slow 3G) | B no cambia de estado; A queda guardada con un aviso corto | ⬜ |
| D10 | «Explorar empresas»: buscar «JPMorgan»; abrir su ficha | «N superadas · M sin datos»; ficha con Superadas / No superadas / Sin datos | ⬜ |
| D11 | Móvil, texto grande (ajustes del sistema): repetir D6 | «Decidir después» siempre alcanzable; el diálogo se desplaza | ⬜ |

## E. Al terminar
- ⬜ `git checkout wrangler.toml` (deja el marcador `REEMPLAZAR_CON_ID_DE_D1`); `git status` limpio.
- ⬜ Borra lo de prueba: `npx wrangler pages project delete klever-prueba`, `npx wrangler d1 delete klever-prueba` (y `klever-antigua`).
- ⬜ Dime qué pasos has ejecutado y su resultado; los que no, quedan pendientes.

**No incluido (futuro plan de pago):** Revolut, Trade Republic, artículo diario personalizado y consejo diario de inversión.
