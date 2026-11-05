# Ronda 18: contraejemplos cerrados, creador por pasos y dos carreras reales con la red lenta

Parte de la ronda 17 (revisión C15 en `procesos-klever/06-`). **Reparación técnica y aplicación visual, por separado**, como pidió la revisión.

> **Código de la última pasada completa: commit `3ae4183`** (después solo cambió la documentación). Resultado literal al final. Una guía única para abrir el recorrido: `ronda18/ABRIR-EN-MOVIL.md`. Antes/después de los contraejemplos exactos: `ronda18/ANTES-Y-DESPUES.md`. **Las cifras de «comprobaciones» son locales del autor.**

# A. Reparación TÉCNICA
| Hallazgo | Qué se hizo | Evidencia |
|---|---|---|
| **I1.** Nota guardada con una décima imposible | `validarResumen` calcula la compatibilidad **exacta** con el redondeo en enteros: bloques con **exactamente dos decimales**; el total real está en [S − 0,005; S + 0,005] y la nota publicada debe ser el redondeo a un decimal de algún valor de ese intervalo. La pérdida de la limitación se comprueba con su tolerancia real (±peso·0,005/100). **Compatibilidad con registros antiguos:** todo lo que produce el propio módulo cumple la regla (probado con 20+ carteras calculadas); un registro que solo cabía en la tolerancia anterior (0,056) se identifica como inválido al leer, porque un cliente legítimo nunca lo habría generado. | Contraejemplo exacto (5,44/5,44/5,47/5,44/5,44 con 5,5): `POST` 201 → **400**; vecinos válidos y extremos 1 y 10 aceptados; fila histórica equivalente → inválida (`unit-integridad18` I1a–I1e) |
| **I2.** Fecha con sufijo arbitrario | `normalizarFecha` (compartida por la API y el evaluador): fecha sola, marca de SQLite (`AAAA-MM-DD HH:MM:SS`) o ISO con `T`, fracción y `Z`; se valida la **cadena entera** (día real, hora 00–23, minutos y segundos 00–59, sin espacios ni sufijos) y se normaliza al día. | `2026-11-04basura` y `… 25:00:00`: origen sintético y 4,4 → **incompleto y pendiente** (mercado y ejercicio, desde SQLite); la marca de SQLite sigue valiendo (I2a–I2c) |
| **I4.** Comparables ajenos y caché | La verificación de procedencia recorre **todas las empresas usables del universo** (no solo las posiciones) y nombra al comparable; la preparación depende de la referencia de `empresas` **y del origen** (una por combinación); se documenta que el universo recibido es **inmutable** (instantánea congelada). | Evaluador directo con un comparable en «ayer», o todos sin fuente: 4,4 → **pendiente**; el mismo objeto como sintético y luego como real habilitado: 126 empresas (21 ficticias) → **105** (I4a–I4c) |
| **M1.** Par historia/referencia | La lectura y el seguimiento comprueban el **par** (`refDeHistoria`); una fila discordante se identifica y se puede **desvincular expresamente** (PATCH con control de revisión, el texto personal se conserva). | M1a–M1c |
| **M2.** Propiedades propias y ancho cero | `limitacion.perdida` debe ser propia; se rechazan U+200B, U+2060 y U+FEFF y se **permiten** U+200C/U+200D (persa y emojis compuestos). | M2a–M2b |
| **M3.** Fecha en la explicación | «Instantánea del 4 nov 2026; ejercicios hasta FY2024»; el detalle da, por empresa, el último ejercicio, la fecha de carga y la fuente. | M3 |
| **M4.** Título bancario | «Ejemplo con evaluación parcial». | M4 |
| **M5.** Cascada CSS | Un solo esquema de color (el aprobado): se retiran los bloques de tema oscuro/claro y el truco `html:root:root:root`; se eliminan las reglas muertas del «resumen breve» y del orden de paneles. **Solo existe un esquema: la revisión pedía verificar «ambos» y ya no hay otro.** | `style.css` y `style-r17.css` |
| **Pruebas** | Geometría (no `position: fixed`) para reconocer la cabecera lateral en las pruebas de avisos; varias acciones dominantes se detectan por color **y** por tono parecido; el creador espera las **seis posiciones** concretas y falla ante errores de consola o de red; **latencia determinista** (`LATENCIA_MS`) y **traza** (`TRAZA=1`) en el ayudante común; paridad de la demo con los módulos (`paridad-demo`: misma huella al reconstruirla y mismas salidas con las mismas entradas). | `testQ`, `paridad-demo`, `repetir-intermitentes.sh` |

## Dos carreras REALES descubiertas con la latencia (no estaban en el encargo)
Al añadir 300 ms a las respuestas que reconstruyen cartera y sesión, `testE`, `testF` y `testC` se caían sin resultado. La causa no era de las pruebas:
1. **Elegir una plantilla antes de que carguen los activos** daba un **borrador vacío** (`repartoPlantilla` devolvía `[]`), que se perdía al entrar. Ahora `abrirInvitado` espera a los activos.
2. **El cambio de `#hash` antes de terminar el arranque** (p. ej. al canjear el enlace de acceso) ejecutaba la ruta con el módulo del laboratorio sin iniciar (`TypeError … 'x(...)' is null`). Ahora la ruta espera al arranque.
Es la **explicación más probable** de los fallos intermitentes antiguos de `testE`/`testF` y del historial, pero **no está demostrada** para cada fallo histórico: solo se demuestra que con latencia determinista estas dos carreras se reproducen y que corregidas desaparecen. Rastros por repetición en `ronda18/trazas/` y `ronda18/intermitentes.txt`.

# B. Aplicación VISUAL
- **Móvil, primer viewport (390×780 y 320×780, plantilla de seis activos):** título breve, pasos en una línea, estado compacto del reparto **con «Revisar →»**, y justo debajo el primer campo de peso con su deslizador, libres de la barra fija (medido con `elementFromPoint`). «Añadir un activo» pasa **después** de la lista.
- **Los pasos organizan el contenido (móvil):** *Distribución* muestra solo los controles; *Revisión* abre con el anillo en una línea, el **resultado y su motivo antes** de la advertencia breve y de «Cómo se calcula», luego la radiografía, la publicación y los gráficos, con «← Volver a la distribución», que conserva cada peso. En escritorio las dos columnas siguen enteras y «Revisar portafolio» está arriba. El orden DOM coincide con el visual (se movieron «Añadir un activo», los gráficos y el pie).
- **Una acción dominante por estado:** Distribución → «Revisar» (borrador o sin cambios) o «Guardar» (cambios pendientes en una cuenta); Revisión → «Guardar» si hay algo que guardar. La barra inferior conserva solo «Guardar» y su altura de siempre.
- **Escritorio:** columna de activos con ticker, nombre, porcentaje y deslizador (categoría y ROIC pasan a la línea de detalle), pista fina y manejador de 44 px de área táctil, anillo más grande en una columna más ancha y nombres completos en la leyenda.
- **Resultado antes de la explicación larga:** cifra o pendiente, motivo, fortaleza, limitación e instantánea; la advertencia breve («No es una previsión… Datos de PRUEBA…») y el resto, en «Cómo se calcula».
- **Revista:** «Leer la opinión de «El Superespeculador» (ejemplo)». **Cuaderno:** original y reformulación juntos en el viewport, con el desenlace una sola vez.
- **La demo usa ahora los mismos números que la semilla** (antes mostraba 4,9 para KO + PG; ahora **4,4**, igual que el servidor local y la documentación).

# C. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** `unit-integridad18` **18** (nuevo), `unit-procedencia17` 13, `unit-guardada17` 20, `unit-nota` 35, `unit-escenarios16` 11, `unit-migracion` 14 y las de rondas anteriores.
**Navegador (Chromium, servidor local):** `testQ` **25** (nuevo: recorrido por pasos medido en el viewport, teclado, cuenta con y sin cambios, Cuaderno), `paridad-demo` **5** (nuevo), `testP` 28, `testO` 18 y las anteriores; demo OK.
**Total de la pasada completa: 774 comprobaciones correctas, 0 fallos, código 0** (36 baterías + demo). *Aserciones ≠ entradas:* `unit-nota` N20–N25, `unit-integridad18` I2a (15 fechas) o `paridad-demo` PD2 (5 carteras) agrupan varias entradas bajo una aserción.
**Entorno remoto:** nada ejecutado.
**Primeros fallos, corrección y última ejecución (registro):** tras el creador por pasos hubo 23 problemas (`ronda18/resultado-ejecucion-intento*.txt` no se conservaron por reinicios del contenedor; ver `procesos-klever/09-`): casi todos pruebas móviles que asumían todo el editor en una página (publicación, radiografía, resumen, orden), que se adaptaron para cambiar de paso como la persona, más **tres regresiones reales**: el evento `change` devolvía a «Distribución» al pasar a la revisión; una regla CSS truncada anulaba estilos (desbordamiento al 200 % en escritorio); y el orden DOM no coincidía con el visual. Después, la demo mostraba 4,9, y la latencia destapó las dos carreras. **Pruebas antiguas adaptadas (dime si alguna rebaja la exigencia):** `testB` (orden por paso en lugar de una sola página), `testD` E9b (se lee el resumen en el paso «Revisión»), `testH` H4 (pasa a la revisión; vuelve a la distribución para añadir un activo), `testK` K1/K3, `testN` N10, `testP` y `testO` (pasos y selectores), `testC` (espera la respuesta real de la lista pública), `demotest` (publicación en la revisión). `testI` I2 y `testD` E5 **no se tocaron** (se mantienen sus exigencias).

# D. Límites y pendiente
- **No hecho:** lectura contextual en el creador con retorno al mismo paso (opcional); «cartera» → «portafolio» solo en navegación, portada, creador y «Mis portafolios».
- **No probado:** móvil físico, lector de pantalla (solo nombres, roles y orden DOM por prueba automática), texto al 200 % real, Safari/Firefox, contraste en dispositivos, comprensión por personas (**prueba con cinco principiantes pendiente**), D1 remota, correo real, datos de mercado reales. La demo pierde los datos al recargar.
- **La coherencia aritmética de la nota guardada no acredita su origen:** un cliente puede enviar un resumen coherente pero inventado.
- **«Aceptación visual»:** la comparación con la maqueta (`Q7-referencia-vs-implementacion-1440.png`) es inspección mía, no una aprobación de quien la diseñó.
- **Causa de los intermitentes antiguos:** ver el apartado de las dos carreras: explicación más probable, no demostrada para cada fallo histórico.

# E. Capturas (`ronda18/capturas/`)
Por cada tamaño (1440×900, 390×780, 320×780) y en **viewport y página completa**: `Q0-inicio`, `Q1-distribucion`, `Q3-revision`, `Q4-guardado`, `Q8-cuaderno-pareja`; más `Q7-referencia-vs-implementacion-1440` (referencia y resultado en la misma anchura).

# F. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-05 01:50 UTC
Código: commit 3ae4183ac09303eaa36a373b78fba02290a7bf90; árbol de trabajo limpio
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
=== unit-integridad18 ===
RESULTADO: 18 correctas, 0 fallos
=== test-zip ===
RESULTADO: 8 correctas, 0 fallos
=== testA ===
RESULTADO: 31 correctas, 0 fallos
=== testB ===
RESULTADO: 53 correctas, 0 fallos
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
=== testQ ===
RESULTADO: 25 correctas, 0 fallos
=== paridad-demo ===
RESULTADO: 5 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```

## Repeticiones de las baterías intermitentes, con y sin latencia (literal)
```
== tests/ronda5/testE.cjs · latencia 0 ms · repetición 1/2 · 02:04:28Z · 24 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda5/testE.cjs · latencia 0 ms · repetición 2/2 · 02:04:57Z · 23 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda5/testE.cjs · latencia 300 ms · repetición 1/2 · 02:05:53Z · 49 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda5/testE.cjs · latencia 300 ms · repetición 2/2 · 02:06:48Z · 49 s · código 0
RESULTADO: 15 correctas, 0 fallos
== tests/ronda7/testF.cjs · latencia 0 ms · repetición 1/2 · 02:07:16Z · 21 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda7/testF.cjs · latencia 0 ms · repetición 2/2 · 02:07:44Z · 21 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda7/testF.cjs · latencia 300 ms · repetición 1/2 · 02:08:42Z · 51 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda7/testF.cjs · latencia 300 ms · repetición 2/2 · 02:09:39Z · 50 s · código 0
RESULTADO: 9 correctas, 0 fallos
== tests/ronda5/testC.cjs · latencia 0 ms · repetición 1/2 · 02:10:14Z · 28 s · código 0
RESULTADO: 50 correctas, 0 fallos
== tests/ronda5/testC.cjs · latencia 0 ms · repetición 2/2 · 02:10:49Z · 28 s · código 0
RESULTADO: 50 correctas, 0 fallos
== tests/ronda5/testC.cjs · latencia 300 ms · repetición 1/2 · 02:12:08Z · 72 s · código 0
RESULTADO: 50 correctas, 0 fallos
== tests/ronda5/testC.cjs · latencia 300 ms · repetición 2/2 · 02:13:26Z · 71 s · código 0
RESULTADO: 50 correctas, 0 fallos
```
