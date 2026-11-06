# Guion de validación manual y remota (ronda 10; sustituye a `ronda9/GUION-BETA-Y-D1-REMOTO.md`)

> **Estado: bloqueado.** No hay credenciales de Cloudflare ni de Brevo en el entorno (`ronda10/BLOQUEOS.md`). **Ningún paso de este guion se ha ejecutado contra Cloudflare real ni con correo real.** Cada casilla empieza en ⬜. Recursos desechables, datos ficticios, nada de producción.

## A. Recursos de PRUEBA aislados
```bash
npm ci
export CLOUDFLARE_API_TOKEN=…  CLOUDFLARE_ACCOUNT_ID=…       # token mínimo: D1 y Pages de esa cuenta
npx wrangler d1 create klever-prueba                          # anota el database_id
```
1. ⬜ Edita **solo tu copia** de `wrangler.toml` (`database_name = "klever-prueba"` y el `database_id` real). **No lo subas**: `git diff wrangler.toml` debe quedar vacío antes de cualquier commit (`git checkout wrangler.toml` al terminar).
2. ⬜ Esquema nuevo y datos ficticios (base nueva: **sin** migraciones): `npx wrangler d1 execute klever-prueba --remote --file=schema.sql`, y lo mismo con `data/seed-prueba.sql` y `data/demo.sql`.
3. ⬜ Proyecto de Pages **con correo real** (configuración como la de la beta pública: **sin** `DEV_RETURN_LINK`):
```bash
npx wrangler pages project create klever-prueba --production-branch main
npx wrangler pages secret put BREVO_API_KEY --project-name klever-prueba
npx wrangler pages secret put MAIL_FROM     --project-name klever-prueba
npx wrangler pages deploy public --project-name klever-prueba
```
   Si el binding `DB` no aparece, añádelo en el panel (Pages → klever-prueba → Settings → Bindings → D1 → variable `DB`).
4. ⬜ **Comprobar que no se expone el enlace:** `curl -s -X POST https://<proyecto>/api/login -H 'content-type: application/json' -d '{"email":"TU_BUZON","acepto":true}'` debe devolver exactamente `{"ok":true}` (sin `dev_link`). Y `curl -s https://<proyecto>/app.js | grep -c DEV_RETURN_LINK` → `0`.

## B. API por HTTP (≈1 min; requiere un proyecto con `DEV_RETURN_LINK=1`, **solo de pruebas aisladas**)
`verificar-api.mjs` entra con el enlace devuelto en la respuesta, así que no sirve contra el proyecto de la sección A. Opción: un segundo proyecto efímero `klever-prueba-dev` con `npx wrangler pages secret put DEV_RETURN_LINK` (valor `1`) sobre la **misma** D1 de prueba, y borrarlo al terminar.
```bash
BASE_URL=https://klever-prueba-dev.pages.dev node tests/ronda9/verificar-api.mjs     # esperado: RESULTADO: 8 correctas, 0 fallos
```
- ⬜ Resultado: ______ (pega la salida; V5–V7 son estrés empírico, con la latencia de D1 remoto las carreras son más probables que en local).

## C. Migración 0007 con datos (D1 remota de prueba aparte)
⬜ `git show aa21407:schema.sql > /tmp/esquema-antiguo.sql` → crear `klever-antigua` → cargar ese esquema + `data/seed-prueba.sql` + `data/demo.sql` → anotar `SELECT COUNT(*) FROM portafolios; SELECT COUNT(*) FROM posiciones;` → `npx wrangler d1 execute klever-antigua --remote --file=migrations/0007_revision.sql` → mismos recuentos y `SELECT DISTINCT revision FROM portafolios;` = `0`. (La prueba local equivalente con SQLite real está en `tests/ronda8/unit-migracion.mjs`; **no** aplicar la 0007 al esquema nuevo.)

## D. Acceso con correo real y persistencia (asistido) — contra el proyecto de la sección A
```bash
BASE_URL=https://klever-prueba.pages.dev TEST_EMAIL=tu-buzon-de-pruebas@ejemplo.com node tests/ronda10/validar-acceso-real.mjs
CADUCIDAD=1 BASE_URL=… TEST_EMAIL=… node tests/ronda10/validar-acceso-real.mjs        # añade la caducidad real (espera 16 min)
```
El script pide cada enlace (cópialo del correo recibido). Esperado: R1 acceso con enlace del correo (y la respuesta del servidor solo `{"ok":true}`), R2 un solo uso, R3 persistencia al recargar, R4 cerrar sesión invalida, R5 persistencia tras volver a entrar, R6 conflicto entre dos sesiones independientes (una 200, otra 409), R7 fallo de guardado y recuperación, R8 público/privado sin datos personales, R9 caducidad (con `CADUCIDAD=1`). Resultado en `ronda10/resultado-validacion-acceso.json`.
- ⬜ ¿Llegó el correo? ¿en bandeja o en spam? ¿cuánto tardó?: ______
- ⬜ Resultado del script: ______

## E. Recorrido completo de la beta a mano (≈20 min), en el proyecto de la sección A y en móvil y ordenador
| # | Paso | Esperado | Estado |
|---|---|---|---|
| E1 | Portada → «Dividendos» → cambiar dos pesos → «Guardar cartera» → entrar con tu buzón de pruebas (llega un correo) | «Cartera guardada»; estado «Guardada en tu cuenta» | ⬜ |
| E2 | Abrir «Mis carteras» → cartera → **recargar** | Los pesos son los guardados | ⬜ |
| E3 | Cambiar un peso sin guardar → volver a «Mis carteras» | «Cambios locales pendientes de guardar en tu cuenta» y las dos versiones rotuladas | ⬜ |
| E4 | Red cortada (F12 → Red → Sin conexión) → Guardar; reconectar → «Reintentar guardado» | «No se pudo guardar» (persiste, no es un aviso fugaz); la cuenta no cambia hasta reintentar | ⬜ |
| E5 | Dos navegadores, misma cuenta: A edita sin guardar; B guarda; A pulsa Guardar | Diálogo con las dos versiones; «Decidir después» no cambia nada | ⬜ |
| E6 | Pedir el enlace con un borrador y abrirlo en otro navegador | Aviso fijo en «Mis carteras»; sin confirmación de guardado | ⬜ |
| E7 | Cartera al 100 % + tesis → Publicar; subir un peso por encima del 100 % | Guardar desactivado con motivo; «Tus cambios aún no son públicos»; la pública no cambia | ⬜ |
| E8 | Con el aviso de error de una ficha que no carga (red cortada en «Explorar empresas») | El aviso **permanece** hasta pulsar «Cerrar aviso»; no tapa «Mis carteras» ni la cabecera | ⬜ |
| E9 | Móvil, texto grande y teclado abierto al editar la última posición | El campo se ve entre el aviso y la barra; el pie y sus enlaces se alcanzan | ⬜ |
| E10 | Resumen: ROIC visible con su cobertura y la advertencia; abrir «Cómo se calcula y qué se excluye» con teclado | El detalle aparece/desaparece; una empresa sin dato dice «no cuenta como 0» | ⬜ |

## F. Al terminar
⬜ `git checkout wrangler.toml` y `git status` limpio · ⬜ `npx wrangler pages project delete klever-prueba` (y `klever-prueba-dev`) · ⬜ `npx wrangler d1 delete klever-prueba` (y `klever-antigua`) · ⬜ quitar los secretos · ⬜ anotar qué pasos se ejecutaron y su resultado (los que no, siguen pendientes).

**Reservado para el futuro plan de pago (no implementado ni simulado):** conexión con Revolut, conexión con Trade Republic, artículo diario según los intereses del usuario y tip diario de inversión.
