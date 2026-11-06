# Ronda 17: integridad del resultado y diseño aprobado aplicado al recorrido

Parte de la ronda 16 (revisión C14 en `procesos-klever/06-`). **Dos objetivos de aceptación independientes**, con cambios técnicos y visuales **por separado**: (1) cada resultado de la simulación se explica y se verifica con los datos que lo originaron; (2) desde el primer vistazo se entiende que se puede **crear, entender y seguir** el portafolio. Referencia visual: `ronda17/referencia/maqueta-crea-tu-portafolio.png`.

> **Código de la última pasada completa: commit `a31ed18`** (después solo cambió la documentación y se añadió el antes/después). Resultado literal al final. Una guía única para abrir el recorrido: `ronda17/ABRIR-EN-MOVIL.md`. Antes/después: `ronda17/ANTES-Y-DESPUES.md`.

# A. Cambios TÉCNICOS (integridad)
| Frente | Qué se hizo | Evidencia |
|---|---|---|
| **Procedencia y fechas** | `/api/universo` verifica **cada fila usada** (ejercicios y mercado de las acciones): sin fuente o con fecha que no es de calendario → origen **«incompleto»**; «sintético» exige todas las filas con fuente de prueba/demo y fecha real; mezcla → «mixto»; real → «real». `evaluar()` repite la comprobación sobre las filas **de la cartera** y, si falla, la nota queda **pendiente** y la pantalla dice cuál (`KO FY2024: la fecha de la fila no es una fecha real`). La instantánea ignora fechas inválidas; se expone el periodo efectivo (`hasta FY2024`) y la población de comparación. Las empresas ficticias no son comparables fuera de un conjunto sintético. La semilla usa una **fecha fija** (2026-11-04). | `unit-procedencia17` (13): desde SQLite hasta el texto visible; **KO 60 / PG 40 = 4,4 exacto**; fuente NULL, fecha imposible, «ayer», mercado sin fuente y mixto → pendiente con su motivo; KO + JPM explica por qué; cambios cosméticos conservan el 4,4; conjuntos de tickers (no solo recuentos) |
| **Nota guardada** | `validarResumen`: versiones **conocidas** al guardar («foo» → 400); **coherencia** del total con los bloques redondeados a 2 decimales (tolerancia ±0,056), fortaleza = mejor bloque, limitación = la que más resta; propiedades **propias** (rechaza `__proto__` y heredadas), `-0`, controles de dirección bidireccionales y longitud (700 sí / 701 no). Una fila antigua de versión desconocida pero bien formada se muestra como **«valor guardado por el cliente»**; una incoherente, corrupta o manipulada, sin contenido. | `unit-guardada17` G0–G10 (por HTTP de manejadores y en la interfaz): 4,4 → 10 y versión «foo» detectados; límites 1,0 y 10; redondeos válidos y fuera de tolerancia; entidad escapada sigue siendo texto |
| **Seguimiento editorial** | **Catálogo compartido** (`public/js/catalogo.js`) de identificadores inmutables, usado por cliente y servidor. Referencias nuevas inexistentes o de otra historia → 400; las históricas inválidas (escritas por la ronda 16) se **identifican** (`pregunta_ref_invalida`) y se tratan como pregunta propia; en edición se muestra la pregunta vinculada, se puede **desvincular expresamente** y se avisa si las palabras nuevas parecen tratar otro asunto (índice de Jaccard; avisa, no decide). Edición concurrente: 409. | `unit-guardada17` V1–V9, `unit-migracion` (segunda coincidencia y 0011 con los textos del catálogo), `testO` |
| **Fiabilidad de las pruebas** | O1 exige **4,4 exacto**; O5e exige autenticación positiva, 200 con lista vacía y **404 sobre el ID ajeno**; el cierre de sesión revoca el token antiguo (**401**) y se comprueba el contenido antes/después; O6 se rotula **«respuesta interceptada»** (la fila corrupta real se prueba en `unit-escenarios16` P3/P3b y `unit-guardada17` G9); O3 comprueba **ambas celdas**; el total de empresas se complementa con **conjuntos de tickers**. | `testO` (18), `unit-procedencia17` Q11 |
| **Intermitentes E/F** | `tests/ronda17/repetir-intermitentes.sh` repite cada batería con un servidor limpio y registra hora, duración, código y líneas FALLA por repetición. **6 repeticiones (3 de `testE`, 3 de `testF`): todas correctas (15/15 y 9/9), ~23 s cada una.** | `ronda17/intermitentes.txt` |

# B. Cambios VISUALES (diseño aprobado)
`public/style-r17.css` (tokens centralizados: color, tipografía, márgenes, bordes y foco) y cambios de estructura en `index.html`/`app.js`:
- **Fondo carbón cálido con resplandor cobre** (esquina superior derecha), marfil para el texto, **un título serif** por pantalla (Georgia), sans del sistema con **cifras tabulares**, naranja intenso solo para la acción principal y el paso activo.
- **Navegación:** columna izquierda en escritorio (Mis portafolios · Crear portafolio · Cuaderno · **Revista** como entrada secundaria); en móvil, menú con las mismas cuatro. «Seguimiento» pasa a llamarse **«Cuaderno»**.
- **Entrada:** una acción principal según el estado (crear el primero · **retomar mi borrador** · abrir mis portafolios con sesión); en la demo avisa de que se pierde al recargar.
- **Creador:** título «Crea tu portafolio», pasos Objetivo · **Distribución** · Revisión, **deslizador + campo numérico** (una sola entrada, también con flechas), anillo con 10.000 € **simulados**, leyenda con nombre, porcentaje e importe, estado «Faltan/Sobran X %», **hipótesis** («con 10.000 € y 2.000 € en una empresa, una caída del 25 % supone 500 € menos»; se recalcula al editar), «Volver» y «Revisar portafolio». **Una sola acción principal:** «Revisar» (borrador o sin cambios) o «Guardar» (cambios pendientes en un portafolio de la cuenta).
- **Notas en móvil** (revisión de la ronda 16): selector «KO + PG · con nota» / «KO + JPM · pendiente»; el resultado queda **tras la barra de pesos y antes de los botones**, con insignia «Ejemplo con datos ficticios», titular «4,4 de 10. Toda la cartera está en Consumo básico y Coca-Cola concentra el 60 %.», fortaleza, limitación y fecha a la vista; el detalle técnico, en **«Cómo se calcula»**; para JPM: «…este método todavía no evalúa bien la deuda y los beneficios de los bancos. Por eso no damos una nota total.»
- **Cuaderno:** «Tu pregunta tiene respuesta» / «Tu reformulación tiene respuesta»; si dos preguntas comparten desenlace, el artículo completo **una sola vez** y cada tarjeta con su enlace. **Comparador:** «por cada euro de EBITDA del ejercicio hay esa cantidad de euros de deuda neta; no indica cuándo se devolverá la deuda».
- **Pruebas del diseño:** `testP` (28): estructura, sincronía deslizador/campo, importes, hipótesis, estados del reparto, pasos, entrada según el estado, acción principal, teclado y nombres accesibles, navegación, sin desplazamiento horizontal incluso con el texto **simulado** al 200 % (320/390/1440).

# C. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** `unit-procedencia17` 13, `unit-guardada17` 20, `unit-nota` 35, `unit-escenarios16` 11, `unit-migracion` 14, `unit-comparador`, `unit-almacen` y las de rondas anteriores.
**Navegador (Chromium, servidor local):** `testP` 28 (nuevo), `testO` 18, `testN` y las anteriores; demo OK.
**Total de la pasada completa: 724 comprobaciones correctas, 0 fallos, código 0** (33 baterías + demo). Son comprobaciones **locales del autor**.
**Entorno remoto:** nada ejecutado.
**Incidencias declaradas:** la primera pasada tras el rediseño falló en 43 líneas (`ronda17/resultado-ejecucion-intento1.txt`) y la segunda en 6 problemas (`…intento2.txt`): **todas por pruebas antiguas atadas a textos o estructura que cambiaron a propósito** (menú, titular, «Seguimiento» → «Cuaderno», chips de las tarjetas, barras de peso → deslizadores) **y por tres regresiones reales que corregí**: desbordamiento horizontal con el texto al 200 % (botón «Revisar» y leyenda del anillo), `min-width` del botón, y la acción principal duplicada. Revisa si alguna adaptación rebaja la exigencia: en `testI` I2 la regla original (un solo botón con acento, «Guardar» con cambios pendientes en una cuenta) **se mantiene**; solo se añadió el caso del borrador.

# D. Límites y pendiente
- **No hecho:** la **lectura contextual en el creador con retorno al mismo paso** (opcional en el encargo); el cambio de «cartera» a «portafolio» se aplicó solo a la navegación, la portada, el creador y «Mis portafolios» (el resto del texto sigue diciendo «cartera»).
- **No probado:** móvil físico, lector de pantalla (solo nombres y roles por prueba automática), Safari/Firefox, texto al 200 % **real** (simulado con `font-size`), contraste medido en dispositivos, comprensión por personas (**prueba con cinco principiantes pendiente**), D1 remota y migraciones 0008–0011, correo real, carga SEC real y datos de mercado reales.
- **Aprobación visual:** la comparación con la maqueta es **inspección mía de las capturas**, no una aprobación de quien la diseñó (M77). Diferencias conocidas: la maqueta usa tres clases de activo (acciones, bonos, efectivo) y Klever, empresas y fondos del universo; el título de la pantalla del creador queda dentro del flujo y no en una barra superior.
- **La nota sigue restringida a la demo sintética;** las 20 empresas ficticias cambian el significado del percentil de KO **solo en la semilla y la demo**.
- **La demo pierde los datos al recargar;** «mañana, cierra y vuelve» exige el servidor local.
- **Calidad predictiva, comprensión y ausencia de regresiones generales siguen sin demostrarse.**

# E. Capturas (`ronda17/capturas/`)
Creador a **1440, 390 y 320 px** (`C14-creador-*`, estado inicial con el reparto completo); las **dos notas móviles** (`C10-nota-calculada-*`, `C11-nota-pendiente-*`, a 390 y 320); Cuaderno en escritorio (`C15`); **acceso a Revista** en escritorio, 390 y 320 (`C16`). El retorno desde el contenido **no existe** (ver D).

# F. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-04 22:23 UTC
Código: commit da5927b7caecc629a36be9f70d437ff032892445; árbol de trabajo CON CAMBIOS sin commitear
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 14 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
=== unit-calculos ===
RESULTADO: 23 correctas, 0 fallos
=== unit-r13 ===
RESULTADO: 30 correctas, 0 fallos
=== unit-carga ===
RESULTADO: 18 correctas, 0 fallos
=== unit-r14 ===
RESULTADO: 14 correctas, 0 fallos
=== unit-nota ===
RESULTADO: 35 correctas, 0 fallos
=== unit-comparador ===
RESULTADO: 9 correctas, 0 fallos
=== unit-almacen ===
RESULTADO: 9 correctas, 0 fallos
=== unit-escenarios16 ===
RESULTADO: 11 correctas, 0 fallos
=== unit-procedencia17 ===
RESULTADO: 13 correctas, 0 fallos
=== unit-guardada17 ===
RESULTADO: 20 correctas, 0 fallos
=== test-zip ===
RESULTADO: 8 correctas, 0 fallos
=== testA ===
RESULTADO: 31 correctas, 0 fallos
=== testB ===
RESULTADO: 51 correctas, 0 fallos
=== testC ===
RESULTADO: 50 correctas, 0 fallos
=== testD ===
RESULTADO: 29 correctas, 0 fallos
=== testE ===
RESULTADO: 15 correctas, 0 fallos
=== testF ===
RESULTADO: 9 correctas, 0 fallos
=== testG ===
RESULTADO: 3 correctas, 0 fallos
=== verificar-api ===
RESULTADO: 8 correctas, 0 fallos
=== testH ===
RESULTADO: 25 correctas, 0 fallos
=== testI ===
RESULTADO: 16 correctas, 0 fallos
=== testJ ===
RESULTADO: 53 correctas, 0 fallos
=== testK ===
RESULTADO: 75 correctas, 0 fallos
=== testL ===
RESULTADO: 28 correctas, 0 fallos
=== testM ===
RESULTADO: 7 correctas, 0 fallos
=== testN ===
RESULTADO: 41 correctas, 0 fallos
=== testO ===
OK    [O1b-320] Orden en el móvil: selector, barra de pesos, RESULTADO y solo después los botones (320 px)
OK    [O1b-390] Orden en el móvil: selector, barra de pesos, RESULTADO y solo después los botones (390 px)
RESULTADO: 18 correctas, 0 fallos
=== testP ===
RESULTADO: 28 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```

## Repeticiones de las baterías intermitentes (literal)
```
== tests/ronda5/testE.cjs repetición 1/3 · 22:36:44Z · 1793831804-1793831781=23 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda5/testE.cjs repetición 2/3 · 22:37:14Z · 1793831834-1793831811=23 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda5/testE.cjs repetición 3/3 · 22:37:45Z · 1793831865-1793831841=24 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda7/testF.cjs repetición 1/3 · 22:38:14Z · 1793831894-1793831872=22 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda7/testF.cjs repetición 2/3 · 22:38:44Z · 1793831924-1793831902=22 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda7/testF.cjs repetición 3/3 · 22:39:14Z · 1793831954-1793831932=22 s · código 0
RESULTADO: 9 correctas, 0 fallos
```
