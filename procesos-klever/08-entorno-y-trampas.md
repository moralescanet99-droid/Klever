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
- **Toda lectura pública que combine «¿es pública?» con otros datos debe ir en la misma instantánea**; si no, se filtran posiciones o tesis de una versión que nunca fue pública. Condicionar también la segunda consulta a la visibilidad.
- **Una comprobación que solo mira «DEMO OK» no basta:** también el código de salida, el timeout, el arranque del servidor y que el puerto no sea de otro (si lo es, se probaría un servidor ajeno).
- **`python3 -m http.server --directory /no/existe` arranca igualmente** (responde 404): comprobar antes que existe `index.html`.
- **Un aviso `position: fixed` arriba tapa lo que haya debajo (cabecera, título, botones):** usar una zona en el flujo con `position: sticky` y animar su altura (`grid-template-rows: 0fr → 1fr`); los elementos animados se miden recortados por su contenedor (`overflow: hidden`), no por su caja completa.
- **La barra inferior fija tapa el final de la página:** la reserva debe estar en el **último elemento** (el pie), no en `main`; medirlo con el último enlace del pie, no con la última posición.
- **Con texto muy ampliado una barra fija de una sola fila recorta el botón:** permitir fila doble con `flex-wrap`, un tope de altura (`max-height: 40vh`) y una consulta de contenedor en `rem` (en `@media` los `rem` usan el tamaño inicial del navegador, no el del `html`).
- **El «elemento alcanzable» se comprueba con un clic de prueba** (`click({trial:true})`), no con `elementFromPoint` en el centro: los enlaces que se parten en varias líneas tienen el centro en un hueco.
- **Un «teclado emulado» con la ventana reducida no oculta la barra** (`visualViewport` y `innerHeight` bajan a la vez): `body.teclado` no se ejercita así; no se afirma probado.
- **`git stash push -- public` sirve para medir el «antes» con el mismo servidor** (sirve ficheros vivos); recuperar con `git stash pop`.
- **Sin acceso remoto no se inventa:** `wrangler whoami` y las variables de entorno dicen qué existe; si falta, se entrega un único bloque de requisitos y los scripts listos.
- **Una zona fija arriba tapa lo enfocado:** `scroll-padding-top` con la altura REAL de la zona (medida), no un valor fijo; y centrar manualmente entre la zona fija y la barra.
- **Un elemento que anima su altura se mide recortado por su contenedor:** su `getBoundingClientRect()` es la caja completa (desbordada); para solapes usar la intersección con el contenedor (`#avisos`).
- **Una comprobación sin muestras pasa en vacío:** toda prueba de muestreo debe exigir un mínimo de muestras elegibles y probarse con una mutación que la haga fallar.
- **Contraste con opacidad:** mezclar el color con su opacidad efectiva (la del elemento y la de todos sus ancestros) sobre el fondo antes de medir; calcular con los colores CSS a secas no acredita la legibilidad durante una animación. Más simple: no animar la opacidad.
- **`@container` mide el área de contenido del contenedor:** un contenedor de 320 px con 16 px de relleno por lado mide 288 px (= 18 rem): elegir el umbral con eso en cuenta; el `rem` de una consulta de contenedor sigue al `font-size` del `html` (el de `@media` no).
- **Un `// comentario` añadido al final de una línea de prueba se traga el cierre `}));`:** poner el comentario después del cierre (ya ocurrió dos veces).
- **`git archive` no incluye `.git`:** toda prueba que use `git` debe degradar a «modo ZIP» (solo contenido) y decir que el historial NO está verificado; un repositorio nuevo (vacío o de un commit) tampoco lo acredita.
- **Mutación por `sed` sobre `public/style.css`:** guardar una copia antes (`cp … /tmp`) y restaurarla; comprobar con `git diff --stat` que solo quedan los cambios previstos.
- **Elementos ocultos en la prueba:** el título «Posiciones» (`display:none` en móvil) o `.ver-ficha` de la tabla de escritorio no se pueden medir; usar un elemento visible (`offsetParent !== null`).

## Ronda 12
- **Espacio no separable en las cifras:** `pesoCorto()` y `pct()` usan U+00A0 antes de «%». En pruebas, comparar con `\s` o normalizar `\u00a0`; un literal con espacio normal falla sin que se vea.
- **Nombre de cartera: máximo 80 caracteres.** Un nombre de 86 se trunca/rechaza y la prueba «no encuentra» la tarjeta; el de prueba mide 74.
- **En móvil, «Quitar» está dentro de la tarjeta plegada** (`.pc-det`, oculta): hay que pulsar antes `.pc-toggle`.
- **Un elemento oculto aparece primero:** en móvil, la tabla de empresas (oculta) precede a las tarjetas; medir con `offsetParent !== null` también para `[data-borrar-busqueda]`.
- **Cartera pública y pruebas de guardado:** con pesos que no suman 100 %, «Guardar» está desactivado (es la regla); para probar el guardado, repartir de forma que sume 100.
- **Lista de carteras:** `GET /api/portfolios` ya trae `posiciones`; si se cambia el orden en `[id].js`, hay que cambiarlo también en la lista y en `scripts/demo/mock.js` (colores coherentes entre tarjeta y editor).
- **Un foreground `sleep` largo pasa a segundo plano** (límite de 120 s): esperar a la batería con un bucle `until grep …` en segundo plano.

## Ronda 13
- **Un clic se pierde si el campo en edición provoca un repintado al salir el foco** (mousedown → blur → `change` → `innerHTML`): el botón nuevo sustituye al que recibe el `mouseup`. Solución: no sustituir el DOM si el HTML es idéntico (`dataset.sig`), como en la radiografía.
- **`sub()` de Python con espacios iniciales:** un patrón de 4 espacios casa dentro de una línea de 6 y duplica el enlace (pasó con «Mi seguimiento» en el menú). Comprobar con `grep -c`.
- **`white-space: nowrap` heredado de `.tabla-h`** (tabla de la ficha) afecta a cualquier tabla dentro; la del laboratorio lo anula (`.tabla-lab th,td{white-space:normal}`).
- **`fieldset` tiene `min-width: min-content`:** desborda a 320 px con texto ampliado si no se pone `min-inline-size:0`.
- **`pkill -f` con parte del comando de la propia shell mata la shell (código 144):** parar servidores por PID.
- **Demo = un script clásico:** los módulos de `public/js/` se concatenan sin `import/export`; los nombres de nivel superior no pueden repetirse entre archivos (`const` duplicado = error de sintaxis).
- **El mock de la demo se formatea con `%`:** un `%` literal se escribe `%%` (también dentro de los mensajes nuevos).
- **Rutas de Pages:** `functions/api/portfolios/[id].js` y `functions/api/portfolios/[id]/limite.js` conviven (comprobado en wrangler 3.114); un archivo `_comun.js` sin `onRequest*` no es ruta.

## Ronda 14
- **No ejecutar nada en paralelo con `run-all.sh`:** una pasada hizo fallar `testF` («sin resultado») mientras yo corría otras pruebas; en solitario pasa. Hay ya dos fallos intermitentes de pruebas antiguas (testE en la ronda 13, testF en la 14) sin diagnosticar.
- **`checkVisibility()`/`offsetParent` no sirven para el contenido de un `<details>` cerrado** (devuelven «visible»): usar `details.open` y `innerText` (que excluye lo oculto).
- **Una expresión regular con mayúsculas** (`no es tuya` frente a «No es tuya») hizo fallar una prueba correcta: comparar con `[Nn]` o normalizar.
- **Fechas de calendario:** `parseF` añade «Z» y falla con «AAAA-MM-DD»: usar `fechaCorta` (de `contenido.js`) para fechas sin hora.
- **Tablas en `.art` (revista) con `overflow-wrap:anywhere` y las columnas fijas de `.tabla-lab` en móvil parten palabras:** la tabla de la historia las anula.
- **Árbol de trabajo antiguo para el «antes»:** `git worktree add --detach <ruta> <commit>` + enlace simbólico a `node_modules`; borrar con `git worktree remove --force` y `git worktree prune`.
- **`SELECT … WHERE (subconsulta) < tope`** dentro de un `INSERT … SELECT` hace el tope atómico; con `ON CONFLICT` el `SELECT` necesita su `WHERE`.
- **Semilla:** `tests/ronda5/seed.py` incluye `data/ficticios.json` (126 activos; 106 empresas con comprobaciones). Los recuentos «105» de pruebas antiguas pasaron a 106.

## Ronda 15
- **La demo concatena los módulos en UN script clásico:** (1) los nombres de nivel superior no pueden repetirse entre archivos (`esNum`, `x`, `c` chocaron); (2) **un alias de importación (`import { a as b }`) deja `b` sin definir**: no usar alias; (3) `node --check` del script extraído detecta duplicados pero **no identificadores sin definir**: la prueba de recorrido de la demo sí.
- **Renombrar con `sed` globales:** `s/x()/xi()/` dejó `x()` sin cambiar en líneas con coma; comprobar con `grep` y volver a ejecutar la prueba que usa ese archivo.
- **`history.pushState` al abrir la ficha:** un `Escape` seguido de una navegación inmediata de la prueba puede ser deshecho por el `history.back()` del cierre; esperar ~400 ms tras cerrar. `history.scrollRestoration = 'manual'` evita saltos al volver.
- **Elementos de un `<details>` cerrado:** `offsetParent` es no nulo; comprobar `details.open`.
- **Tests de privacidad:** inspeccionar `outerHTML` **y los valores** de `input/textarea`; las respuestas lentas se simulan con `page.route` y un retraso.
- **Un test que mide posiciones tras `scrollTo(bottom)` falla si la página crece de forma asíncrona** (la nota se calcula después): esperar a que termine antes de medir.
- **Semilla:** los años 2020–2021 salen de otro generador para que 2022–2024 no cambien; 126 activos (106 con comprobaciones) al incluir la empresa ficticia.
- **Cinco ejercicios** son necesarios para la nota; la carga real ahora los pide (`slice(-5)`).

## Ronda 16
- **Añadir empresas a `data/ficticios.json` cambia los recuentos de las pruebas** (testB, testJ, testK: «126»); regenerar la semilla (`python3 tests/ronda5/seed.py`) y revisar los recuentos.
- **Los tickers de escenarios solo admiten letras** (`^[A-Z.]{1,6}$`): las empresas ficticias son `EJBA…EJBT`, sin dígitos.
- **El «antes» de una prueba se ejecuta en un árbol de trabajo aparte** (`git worktree add /tmp/x <commit>`); borrarlo después (`git worktree remove --force`) para que no entre en el ZIP ni en el estado.
- **`#salir` está oculto en móvil (`solo-escritorio`):** en pruebas a 390 px, `evaluate(() => document.querySelector('#salir').click())`.
- **Los reemplazos de texto con `str.replace` en Python fallan en silencio** si la cadena no está: comprobar siempre con `grep` o `assert old in s`.
- **`resumenNota` no debe incluir campos nuevos sin actualizar `validarResumen`** (rechaza campos desconocidos): `origenDatos` solo vive en el resultado de `evaluar`.

## Ronda 17
- **El comprobador de seguridad bloquea órdenes con heredoc que contienen ciertas palabras (falso positivo de «rm»):** escribir el parche en un archivo `.py` con la herramienta Write y ejecutarlo aparte.
- **La demo concatena los módulos:** un módulo nuevo (`catalogo.js`) hay que añadirlo a la lista de `build_demo.py` ANTES de quien lo importa; los alias de importación (`as`) dejan nombres sin definir; un nombre de nivel superior repetido (`num`) rompe todo el script (se renombró a `numEn`).
- **`position: fixed` en la cabecera (columna lateral) cambia lo que miden las pruebas de avisos** (`cabBottom`); y los botones con `min-width` en rem desbordan con el texto al 200 %.
- **Hay dos «Guardar» (cabecera y barra inferior) y un «Revisar»:** la clase de acción principal se alterna en `pintarEstado()`; no usar `btn-primario` fijo en HTML.
- **`#inicio` con sesión muestra «Mis portafolios»** (la portada queda oculta): el estado «Abrir mis portafolios» del botón de la portada es un respaldo; con sesión el menú ya lleva a la lista (probado en `testP` P7b).
- **La semilla (`seed.py`) usa fecha fija 2026-11-04:** cualquier prueba con la fecha de hoy fallará; no volver a `date('now')`.
- **Las pruebas que cuentan empresas (126) deben comprobar también el conjunto de tickers**, no solo el recuento.

## Ronda 18
- **Una regla CSS truncada (por un `printf` con `%`) deja un `{` sin cerrar y anula todo lo que viene después:** no añadir CSS con `printf`; comprobar siempre el equilibrio de llaves (script de profundidad) tras editar `style-r17.css`.
- **El evento `change` de un campo se dispara al perder el foco** (p. ej. al pasar a la revisión y enfocar la nota): no cambiar de paso desde `change`, solo desde `input`.
- **Con latencia determinista (`LATENCIA_MS`) aparecen carreras que sin ella no se ven:** elegir plantilla antes de que carguen los activos y un `hashchange` antes del arranque. Cualquier arranque asíncrono nuevo debe esperar a `activosListos`/`arrancado`.
- **Los servidores locales acumulan publicaciones entre ejecuciones de una misma batería:** reiniciar el servidor (`servidor.sh stop/start`) entre repeticiones; si no, los selectores «estrictos» fallan por duplicados.
- **`page.goto` con solo un cambio de `#hash` no recarga:** para esperar una respuesta de red hay que `reload()` o esperar una condición de pantalla.
- **La demo concatenada debe incluir `catalogo.js` antes de `contenido.js`** y sus datos salen de la semilla (`scripts/demo/exportar-semilla.mjs`): si cambia la semilla hay que reconstruir.
- **Un `git worktree` temporal (`/tmp/klever-r17`) se borra con `git worktree remove --force` al terminar.**
- **`page.reload()` con el editor sucio abre un diálogo `beforeunload` (la app lo registra con cambios sin guardar):** si la prueba no tiene un manejador `dialog` que lo acepte, `reload` no termina y la batería cae sin resultado (causa del fallo de `testF` en la ronda 19). Registrar y aceptar el diálogo al crear la página.
- **Medir o capturar tras un cambio de paso exige esperar a que `scrollY` se estabilice** (cinco fotogramas sin cambio); un `waitForTimeout` fijo dio un falso fallo en `testQ` a 320 px.
- **Fallos intermitentes sin causa demostrada (ronda 19):** `testK` con `page.goto: net::ERR_ABORTED` y `testO` que no salía del proceso tras imprimir 18/0. No se reprodujeron; `h.cjs` ya fuerza la salida a los 10 s. Si reaparecen, conservar el log íntegro (`LOGS_DIR`).
- **`run-all.sh` sobrescribe `resultado-ejecucion.txt` y `logs/`:** antes de una pasada nueva, mover los de la anterior a `logs-intentoN/` si se quieren conservar los intentos fallidos. Una pasada deja modificadas las capturas de rondas anteriores: `git checkout -- ronda1*` antes de commitear.
- **El centrado diferido de 300 ms del campo de peso activo (`app.js`, `focusin`) desplaza la página:** cualquier prueba que mida cajas justo después de `fill` en un peso debe esperar ≥ 500 ms (causó `testD` E5 intermitente), y la aplicación debe cancelarlo si cambia el paso (causó `testQ` Q3-1440 intermitente: fallo real).
- **Una variable de entorno VACÍA en `run-all.sh` recupera su valor por defecto (`${V:-x}`):** para «ninguna batería» usar un espacio, no `''` (mi primer `unit-cierre20` lanzó todas las baterías reales).
- **`run-all.sh` y `testR` escriben en `<RONDA>`:** fijar `RONDA` o se pisan evidencias de otra ronda; tras una pasada, `git checkout -- ronda1*` para no commitear capturas regeneradas de rondas anteriores.
- **Medir primero si es un fallo de la aplicación con registro de `scrollTo/scrollBy/scrollIntoView` y pilas antes de culpar a la prueba (o al revés):** mi primera hipótesis en Q3-1440 fue incorrecta.
- **Una columna nueva con el mismo nombre que un alias rompe un `ORDER BY`:** `portafolios.origen` hizo que `ORDER BY (origen = 'ejemplo')` ordenara por la COLUMNA y no por el alias de la consulta pública; los ejemplos dejaron de ir primero. Calificar siempre (`u.email = ?`) y comprobar con una prueba que **falla sin la corrección** (K20, con el ejemplo con id MENOR).
- **Cerrar la ficha con Escape ejecuta `history.back()` (asíncrono):** un `page.goto` inmediato se aborta (`net::ERR_ABORTED`; `testK`). Esperar `!history.state?.ficha` antes de navegar.
- **Un bucle de reintento de `git push` con `| tail` no sirve:** el estado es el del `tail`; usar el código de salida de `git push` (`2>/dev/null && break`).
- **Los copy de la portada están comprobados en pruebas antiguas** (`testB`, `testN`, `testP`): un cambio de texto de producto exige actualizarlas comprobando lo mismo, nunca borrando la comprobación.
- **Una lectura fallida tras un POST confirmado no es una escritura fallida:** separar «el servidor confirmó» de «la vista se actualizó»; congelar clave y contenido del intento y reintentar el MISMO (el servidor comprueba la clave antes que la revisión). Probar el cliente contra el servidor real con cortes inyectados (`unit-cliente-revision22`).
- **Dos tarjetas del mismo objeto compiten por la atención:** una compacta en la lista y el detalle en la ficha; el orden del DOM debe ser el visual (el Cuaderno reordena sus bloques según haya cuenta o no).
- **`run-all.sh`: al encadenar dos pruebas con la misma variable `SALIDA_T`, las comprobaciones de la primera deben ir antes de lanzar la segunda** (mi bloque de la demo pisaba el «DEMO OK»).
- **Recorrer el producto con capturas encuentra defectos que las pruebas no ven** (una entrada vieja en «Mis portafolios», un texto que ofrecía una acción inexistente, avisos ámbar por condiciones normales).
- **Un comentario `//` a mitad de línea anula TODO el resto de la línea:** me pasó tres veces (el calentamiento del servidor, el reintento lento de `testU`); comentar siempre en su propia línea.
- **Iterar `localStorage.key(i)` mientras se borra se salta claves** (el orden cambia): listar primero, borrar después (`clavesRev`).
- **Probar la lógica del formulario, no solo el módulo de envío:** el borrado del borrador ocurría en la integración con la pantalla; una prueba solo del módulo no lo ve. Contrastar siempre la prueba nueva contra el código anterior (6/24).
- **`git push` puede fallar del lado del remoto («fatal error in commit_refs») aun siendo fast-forward:** probar a empujar commit a commit (`git push origin <hash>:refs/heads/<rama>`).

- **`scripts/local/servidor.sh start` RESIEMBRA la base de datos (borra lo guardado) en cada arranque**: sirve para pruebas, **no para el piloto**. Para el piloto usar `scripts/piloto/abrir-piloto.sh` (estado en `.wrangler/piloto`, solo se borra con `RESET_PILOTO=1`; nunca entre la sesión 1 y la 2). Con `LAN=1` cualquiera de la misma wifi ve el acceso con enlace en pantalla: solo en red de confianza.

## Añadido en la ronda 26
- **`tests/run-all.sh` sirve el árbol de trabajo EN VIVO:** si editas `public/` mientras corre una pasada, las baterías posteriores prueban una mezcla. Una línea base se toma con el árbol quieto (o en un `git worktree` aparte).
- **No dejes `<details>` nuevos dentro de `#nota-cuerpo` antes del aviso de la nota:** `testQ` Q3 comprueba el orden «resultado → aviso → `details`» con `querySelector('#nota-cuerpo details')` (el primero que encuentra). Para desplegar algo en el vistazo, usa un botón con `aria-expanded`.
- **La revisión va al límite de la pantalla** (Q3/R1/R2: el resultado de la nota debe caber entero sobre la barra fija a 320×780 y en 1440×900). Margen actual 26–30 px: cualquier línea más en el vistazo lo rompe. Mide con `testR` antes de añadir nada.
- **Al fusionar, mira TODOS los conflictos** (`git diff --name-only --diff-filter=U`), no la cola de la salida: en la integración de la ronda 26 se quedaron marcadores en `03-decisiones.md` hasta revisarlo.
- **La demo concatena todos los módulos en un solo script:** dos `const` con el mismo nombre en archivos distintos (p. ej. `cm`) la dejan en blanco. Usa nombres propios en módulos nuevos y añádelos a `scripts/demo/build_demo.py`.
- **`textContent` de las cifras clave no lleva espacios entre nodos** («Mayor posición40 %→20 %») y los porcentajes llevan espacio duro: en pruebas, regex con `\s*` y `\s%`.
- **En pruebas con varias pestañas, un ayudante ligado a la primera página falla cuando se cierra** («Target page… has been closed»): pasar la página actual como variable. `page.route` es por página: una pestaña nueva no hereda las rutas simuladas.
- **Hooks de memoria (desde 2026-11-07):** si un turno no termina y aparece «MEMORIA DEL PROYECTO desactualizada», no es un error: falta anotar el cambio en `procesos-klever/09-` (y lo demás) y hacer commit. Comprobación manual: `bash scripts/memoria/comprobar-memoria.sh < /dev/null` (código 0 = al día). El bloqueo deja pasar a la segunda en el mismo turno para no entrar en bucle.
- **Todo bloque nuevo con datos de la cuenta (nombres de carteras, señales, ideas) debe vaciarse en `limpiarPrivado()`** (app.js) y no pintarse si la respuesta llega tras salir (`seq !== misSeq || !logged()`). En la ronda 29 «Tu semana» dejaba el nombre de la cartera en la página al cerrar sesión; lo cazaron `testL` y `testM`.

## Ronda 31
- **La pasada completa reescribe capturas VERSIONADAS de `ronda13/capturas/` y `ronda14/capturas/`** (testK y testL). Son evidencia histórica: tras la pasada, restaurarlas con `git checkout -- ronda13/capturas ronda14/capturas` antes de commitear.
- **Cerrar la ficha (`#dlg-ficha`) hace `history.back()`:** un `page.goto` inmediatamente después se aborta (`net::ERR_ABORTED`). Esperar ~600 ms tras cerrarla.
- **Explorar en el móvil va por tandas de 24** (`[data-emp-mas]`): una prueba que necesite una empresa concreta debe buscarla, y una que compruebe TODAS debe pulsar «Mostrar más» hasta que desaparezca.
- **El comprobador de seguridad del entorno puede bloquear un heredoc de Python largo sin ningún borrado** («could not be checked for dangerous rm»): guardar el script con la herramienta de escritura y ejecutarlo aparte.
- **Pruebas en paralelo (ronda 33):** cada trabajador usa el puerto 8800+k y su base `.wrangler/pruebas-auto-<puerto>`; las pruebas que abren la base local leen la ruta de `KLEVER_ESTADO`. Una batería nueva que abra la base debe usar esa variable. Para depurar una a una: `PARALELO=1`.
- **Comparación visual (ronda 33):** las referencias de `tests/visual/referencias/` se generaron con el Chromium de Playwright en Linux y la fuente autoalojada; en otro sistema (macOS, otro Chromium) pueden diferir por el suavizado. Para aprobar un cambio visual intencionado o rehacerlas en otra máquina: `ACTUALIZAR=1 node tests/ronda33/testVisual.cjs` (con el servidor arrancado) y **mirar las imágenes** antes de commitear. Si una no coincide, la captura actual y el mapa de diferencias quedan en `<ronda>/visual/`.
- **Módulos de la demo:** la demo concatena los módulos en un solo script; dos módulos no pueden declarar el mismo nombre de nivel superior (pasó con `X` en `explorar.js` y `semana-ui.js`: ahora `XE` y `XS`). Comprobar con la construcción de la demo y `new Function` sobre su script.
- **Al mover código a un módulo, buscar también los usos tras `...` (spread):** una comprobación de nombres con «no precedido de punto» los descarta como propiedades (pasó con `filtrosLeer`).

- **2026-11-09 · SEC/EDGAR (ronda 42):** `data.sec.gov` acepta un User-Agent sin correo, pero `www.sec.gov/Archives` devuelve 403 si el User-Agent no tiene forma de correo. En pruebas se usó `admin@klever.invalid` (dominio reservado). En producción hace falta un buzón genérico del proyecto (decide Javier); nunca un correo personal. El listado de tickers de la SEC puede apuntar a un CIK nuevo sin 10-K (caso XOM: usar el CIK histórico 34088).
- **2026-11-09 · Durable Objects (ronda 42):** sin hibernación de WebSockets el consumo supera unas 17,7 veces el plan gratuito; con hibernación cabe de sobra. El límite de 100.000 peticiones diarias del Worker se comparte con toda la web.
- **2026-11-09 · Enlace de acceso (ronda 43):** `GET /api/verificar` ya no canjea el enlace: muestra una página con un botón que hace `POST`. Así los antivirus y previsualizadores de correo no lo gastan. **Trampa:** con `Referrer-Policy: no-referrer`, Chrome manda `Origin: null` en el POST del formulario y la comprobación de origen lo rechaza (403). La página de confirmación usa `same-origin`.
- **2026-11-09 · App v1 (`app/`):** usa su propio `package.json`, `wrangler.toml` (con el marcador `REEMPLAZAR_CON_ID_DE_D1`) y pruebas: `cd app && npx vitest run` (31) y `node e2e/ejecutar.mjs` (32, levanta `wrangler pages dev` con D1 local en `e2e/salida/`). La demo de un solo archivo se genera con `npx vite build --mode demo` (`dist-demo/index.html`); para publicarla como artefacto se quita el envoltorio html/head/body (`ronda43/demo-klever-v1.html`).
