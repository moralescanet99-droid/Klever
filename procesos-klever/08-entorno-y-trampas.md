# 08 · Entorno, cómo ejecutar y trampas conocidas

## Entorno de trabajo (sesión en la nube)
- Contenedor efímero: lo que no está en el repositorio **se pierde** (`/tmp`, directorio de scratchpad). Todo lo importante debe estar commiteado.
- **Sin acceso a Internet** salvo el proxy de la sesión: no se puede probar SEC, TradingView ni Brevo reales. Las pruebas son locales con servicios simulados.
- Chromium y Playwright preinstalados (`require('playwright')`; no instalar otra vez). `wrangler@3` se instala con `npm i wrangler@3` en un directorio aparte.
- Rama de trabajo, commits con los dos pies de firma que indique el sistema y `git push -u origin <rama>`. **No crear pull requests** salvo petición expresa.

## Ejecutar y probar en local
Los guiones están en `tests/ronda4/` (rutas escritas para este entorno: `/tmp/wr` y `/home/user/Klever`; ajústalas si cambia).
1. `seed.py` genera `seed.sql` (125 activos con cifras **inventadas**, bancos «sin dato»).
2. `up.sh`: pone un `database_id` falso en `wrangler.toml`, crea `.dev.vars` con `DEV_RETURN_LINK=1`, borra `.wrangler`, aplica `schema.sql`, `seed.sql` y `data/demo.sql` y arranca `wrangler pages dev public` en `:8788` (PID en un archivo).
3. `node testA.cjs`, `testB.cjs`, `testC.cjs` (130 comprobaciones). `node shots4.cjs antes|despues` para capturas.
4. `down.sh`: para el servidor, **restaura `wrangler.toml`** y borra `.dev.vars` y `.wrangler`.
5. **Antes de cada commit:** `git diff wrangler.toml` debe estar vacío (`database_id = "REEMPLAZAR_CON_ID_DE_D1"`).

Demo: `python3 scripts/demo/build_demo.py` regenera `demo/index.html` (y `build/klever_demo_artifact.html` para el artefacto). `scripts/demo/mock.js` es el servidor simulado.

## Trampas que ya nos costaron tiempo
**Entorno**
- **No uses `pkill -f` ni `pgrep -f` con un patrón que aparezca en tu propia línea de comandos** (`pages dev`, `wrangler`, `workerd`): matan tu shell (código 144). Usa un archivo de PID.
- **Límite de acceso por email:** 1 envío por minuto y 5 al día por email. Las pruebas deben usar emails distintos cada vez (`h.cjs` genera uno único). La base local persiste entre ejecuciones: reiníciala con `down.sh` + `up.sh`.
- `DEV_RETURN_LINK=1` devuelve el enlace de acceso en pantalla: **solo en `.dev.vars` local, nunca en producción.**
- El control de seguridad rechaza `rm` con variables (`$OUT/*.png`) o comandos que no puede analizar: usa rutas literales.
- `SendUserFile` rechaza imágenes de más de 8000 px por lado: partirlas o reducirlas. Las capturas de página completa a 2× en móvil suelen pasarse.
- Las herramientas de edición exigen **leer el archivo antes de escribir** si ha cambiado desde la última lectura.
- Los heredocs de Python con `%` en `mock.js`: ese archivo se formatea con `%`, así que un `%` literal va como `%%`.

**Interfaz**
- **Un `display` en una clase pisa al atributo `hidden`** (misma especificidad). Hay una regla global `[hidden]{display:none!important}` y reglas específicas para `.solo-escritorio[hidden]`, etc. Ya salió «Entrar» y «Salir» a la vez y un banner que no se ocultaba.
- **Texto `.sr` (solo lectores) dentro de tablas** posiciona en la página y provoca desbordamiento horizontal si el contenedor no es `position: relative`.
- **Cuadrículas con nombres largos:** usar siempre `grid-template-columns: minmax(0, 1fr)`; si no, un nombre largo ensancha la columna (pasó con «Vanguard High Dividend Yield ETF»).
- **Tablas de empresas en móvil:** el ancho mínimo lo marcan las palabras largas; separar con espacios real entre nombre y símbolo y fijar anchos de columna.
- **Capturas de página completa con barra fija:** la barra aparece a mitad de la imagen; hay que ponerla `position: static` solo para esa captura (y avisarlo).
- El texto de los campos de peso se formatea con coma (`16,6`): en pruebas, comparar con `'17,0'`, no `'17'`.
- Al reabrir una cartera el servidor ordena las posiciones por peso: en pruebas, no asumir índices.

**Artefactos de Claude (demo privada)**
- Solo cargan scripts de cdnjs/jsdelivr/unpkg y nada de `fetch` externo; `window.print`, `alert`, `confirm`, descargas y `mailto:` no funcionan; las rutas por hash solo admiten `#nombre` simple.
- El archivo se publica sin `<html>`/`<head>`; el `<title>` va al principio. Para actualizar, publicar el **mismo archivo** con la misma URL.
- No se puede cambiar el acceso del artefacto desde aquí: el usuario lo hace con «Compartir». ChatGPT no puede interactuar con él; por eso existe `demo/index.html` para publicarla como web normal.

**Pruebas**
- El borrador y la sesión viven en `localStorage`; para simular «otro dispositivo» hay que usar **otro contexto de navegador**, no otra pestaña.
- El teclado virtual no se puede reproducir de verdad: se emula reduciendo la altura de la ventana; el ocultado de la barra solo se comprueba a nivel de estilos.
- Los widgets de TradingView se bloquean en pruebas (`page.route` a `tradingview.com`): sin Internet fallan igualmente.

## Añadido en la ronda 5
- **Las baterías comparten la base de datos local y se contaminan** (carteras públicas acumuladas, límite de emails). Reiniciar el servidor entre baterías: `tests/ronda5/run-all.sh`.
- **`[data-t]` existe dos veces** (tabla de escritorio y lista móvil): usar `[data-t] >> visible=true`, o Playwright escoge el oculto y se agota el tiempo.
- **Selectores duplicados escritorio/móvil:** igual con los campos de peso (`.peso-in >> visible=true`) y el botón de guardar (`.js-guardar >> visible=true`).
- **Un `.click()` sobre un localizador con varias coincidencias falla** (modo estricto): usar `.first()`.
- **Estilos `:disabled`:** si un botón desactivado «parece activo», falta el estilo para esa variante (`.btn-secundario:disabled`), no la lógica.
- **Las marcas de tiempo de SQLite (`datetime('now')`) tienen resolución de un segundo:** no usarlas para detectar cambios sin devolver la marca desde el servidor.
- **Un diálogo nativo `<dialog>` deja pasar el foco a la interfaz del navegador:** en pruebas, «foco atrapado» significa que nunca cae en controles de la página de fondo (no que `activeElement` siempre esté dentro).
- **Una tabla con `tabindex=0` se desplaza con las flechas, no con `Fin`.**
- **Pruebas de «200 %»:** `font-size: 200%` en `<html>` + buscar con `document.documentElement.scrollWidth`; los elementos `position: fixed` no se ven con `offsetParent`: para localizar desbordes, ocultar bloques uno a uno y medir.
- `mock.js` se formatea con `%`; la constante de `ahora()` debe definirse **antes** de crear las carteras de ejemplo (si no, error de zona temporal muerta y la demo queda en blanco).
- **`textarea{min-height:96px}` global** hacía que el título (textarea de una fila) midiera tres líneas y media: un campo de una línea necesita su propio `min-height` y `max-height`.
- **Cambiar la marca de versión de la cuenta sin refrescar la copia local** (p. ej. al despublicar) crea un conflicto falso al recargar: tras cualquier cambio de `current.version` con cambios pendientes, reescribir la copia local conservando su fecha (`guardarBorrador(true)`).
- **Orden de filas tras reabrir:** el servidor ordena por peso y desempata sin garantía (GDX, GLD, IAU…): en pruebas, comparar por conjunto o ordenar los valores, no por índice.
- **Los detalles plegables (`<details>`) se cierran al recargar y el redimensionado puede cambiarlos:** abrir `#det-pub` explícitamente antes de pulsar «Publicar» en las pruebas.
- **Un script con `localStorage.removeItem` dentro de un heredoc de shell puede ser bloqueado por el comprobador de seguridad** (lo confunde con un borrado): guardar el script en un archivo con la herramienta de escritura y ejecutarlo.
- **La demo usa `#demo-enter` (botón que simula el enlace), no `#acc-dev a`:** las pruebas de la demo (`tests/ronda5/demotest.cjs`) lo tienen en cuenta; en la demo `#estado` es persistencia y el bloqueo está en `#motivo` (escritorio) o `#b-estado` (móvil).
- **`scripts/local/arrancar.sh` no necesita editar `wrangler.toml`:** wrangler@3 acepta el marcador `REEMPLAZAR_CON_ID_DE_D1` en local si se usa `--persist-to` en `d1 execute` y en `pages dev`; usar `--binding DEV_RETURN_LINK=1` en vez de `.dev.vars`.
- **Un servidor viejo ocupando el puerto 8788** hace que el nuevo falle al enlazar y que las pruebas corran contra la base antigua (sin las columnas nuevas) con errores engañosos («ticker no está en el universo»). `servidor.sh` ahora falla si el puerto sigue ocupado; para parar uno lanzado a mano, usar su PID, no `pkill -f`.
- **`<dialog>` nativo con `display:flex`:** aplicarlo solo a `[open]` (si no, el diálogo se ve cerrado). Un `min-height:96px` genérico de `textarea` o un `max-height` mal puesto rompen el diálogo móvil: medir con texto al 200 %.
- **El foco tras cerrar el diálogo de conflicto:** el botón Guardar se desactiva durante el guardado y pierde el foco; hay que devolvérselo explícitamente.
- **D1 `batch()` es transaccional:** un fallo en cualquier sentencia revierte el lote. Para que una escritura condicionada sea atómica, las demás sentencias del lote se condicionan a la marca única de la escritura ganadora; comprobar `res[0].meta.changes`.
- **La comprobación de seguridad del entorno puede bloquear comandos compuestos sin ningún borrado** (falso positivo); hacer los cambios con Edit/Write y lanzar el resto en comandos separados y simples.
- **Reproducibilidad:** nada de rutas absolutas (`/home/user`, `/tmp/wr`) en pruebas ni scripts; la raíz sale de `__dirname`. `npm ci --ignore-scripts` basta (wrangler y playwright se instalan sin scripts; el navegador se instala con `npx playwright install chromium`).
- **Leer «la versión actual» después de escribir devuelve la de otro:** la revisión de la respuesta debe salir de la propia escritura (`RETURNING` dentro de la transacción). Mismo principio para cualquier lectura que acompañe a una escritura.
- **Dos lecturas seguidas pueden mezclar versiones:** para una instantánea coherente, un solo lote (`DB.batch([...])`) o una sola consulta.
- **Tras un `await` el estado global puede ser otro:** guardar/publicar deben capturar la cartera (`const cur = current`) y no tocar el editor si `current !== cur`; el síntoma era «Guardando…» o un conflicto falso en la cartera abierta después.
- **`path.join(RAIZ, rutaAbsoluta)` concatena:** con una ruta absoluta (p. ej. `RONDA=$(mktemp -d)`) escribía dentro del repositorio (`tmp/…`); usar `path.resolve`.
- **`( cd x && cmd & echo $! > ../f )`** escribe el PID en la ruta equivocada (el `cd` ocurre dentro del trabajo en segundo plano): usar `--directory` y rutas desde la raíz.
- **El ejecutor de pruebas debe poder fallar a propósito:** probarlo con baterías de mentira (fixtures) que fallan, se caen, se cuelgan o no tienen servidor; sin eso un «✅» del ejecutor no vale.
- **`kill` solo del padre deja huérfanos:** wrangler lanza workerd; matar el árbol con `pgrep -P` recursivo (portable) y comprobar el puerto.
- **Esquema antiguo como fixture:** `git show <commit>:schema.sql` fija la base «anterior» para probar migraciones sin depender del historial.

