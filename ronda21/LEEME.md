# Ronda 21 · del conjunto de correcciones al producto: construir → entender → probar un cambio → guardar una pregunta → volver a revisarla

Parte de la revisión de la ronda 20 y del encargo de producto (`procesos-klever/06-`, C18). Identidad visual conservada (fondo cálido oscuro, naranja/cobre, serif de títulos). **No se publica, no se conectan servicios de pago ni se envían mensajes.** Datos **ficticios**.

> **Código de la última pasada completa:** el commit de la cabecera de `ronda21/resultado-ejecucion.txt` (ver §7). Cómo abrir el recorrido: `ronda21/ABRIR-EN-MOVIL.md`. Antes/después: `ronda21/ANTES-Y-DESPUES.md`. Migración: `ronda21/MIGRACION.md`.

# 1. Paso 0 · base verificable (cierre técnico residual)
- **`registro()` de las pruebas de módulo** (`tests/lib/d1-sqlite.mjs`) acababa con `process.exit(0)` aunque hubiera un código previo ≠ 0 (el caso exacto de la revisión: código 2 → 0). Ahora **no llama a `process.exit(0)`**: fallo → 1; un código previo distinto de cero **se conserva**; el proceso termina solo y, si un recurso lo mantiene vivo 10 s, escribe `CIERRE FORZADO` y sale con **3**.
- **`unit-registro21`** (10) lo verifica en **subprocesos reales**: éxito → 0; aserción fallida → ≠ 0; error previo con aserciones aprobadas → se conserva; error previo **más** aserción fallida → ≠ 0; recurso abierto → 3 con registro; y `run-all.sh` rechaza cada caso. **La garantía se acota a los caminos controlados** (`registro()` y `h.cjs`), no a un `process.exit(0)` arbitrario en cualquier archivo.
- Enlace de M89 corregido (apuntaba al guion de la ronda 19).
- *Los casos X5/X10 de `unit-cierre20` dependen de lanzar Chromium; en este entorno pasan (10/10). La revisión no pudo ejecutarlos en el suyo por una restricción de su sistema; no se sustituyen por una simulación.*

# 2. Paso 1 · entrar y construir
- **Promesa** en la portada: «Construye tu cartera, entiende sus puntos débiles y prueba cambios antes de decidir», con «sin dinero real» y «datos de prueba» visibles **desde la primera pantalla**.
- **Tres entradas al MISMO editor** (`tests/ronda21/testS.cjs`): *Crear desde cero* (cartera vacía), *Explorar un ejemplo* (copia **editable rotulada como «Ejemplo simulado»**, nunca recomendada ni óptima) y *Recrear mi cartera* (entrada manual: «Klever no se conecta a ningún banco ni bróker, no custodia nada y no envía órdenes»; un activo que no está en el universo **no se sustituye en silencio**: se dice).
- **Origen guardado** (`portafolios.origen`: plantilla, ejemplo, vacia, manual; migración 0012): los ejemplos y las carteras personales no se confunden ni se sobrescriben. El aviso de origen es una línea con «Más»; en móvil va **tras las posiciones** para no empujar los controles fuera del primer viewport.
- **Usuario recurrente:** la portada lo lleva a lo que toca (`Tienes N ideas para revisar en tu Cuaderno`, solo si se puede leer; si no, no dice nada). El borrador se conserva al navegar y al **pedir acceso durante el guardado** llega a la cuenta sin duplicarse.

# 3. Paso 2 · entender antes de puntuar
La revisión empieza por **«Tu cartera de un vistazo»** (posiciones, asignado, mayor posición, tres mayores y reparto por tipo de instrumento), calculado con los **mismos datos** de la radiografía (`calculos.js`; no hay una segunda implementación). Después, qué se ha podido analizar y qué queda sin evaluar (las causas de la ronda 20) y la nota de estructura **como un indicador dentro del análisis**. Siguen las distinciones: concentración por posición ≠ exposición subyacente; un ETF no es una empresa; una limitación de datos no convierte una cartera en mala. La acción siguiente es **«Probar un cambio»**; el estado de guardado es inequívoco (sin guardar, guardando, guardada, error; sin cambios respecto a la ronda 20).

# 4. Paso 3 · comparar una alternativa sin tocar la base
Reutiliza `lab.js` y los escenarios existentes (un activo y un peso objetivo con financiación explícita). Rótulos **«Cartera base»** y **«Alternativa simulada»**, quién cede el peso, posiciones afectadas, cambio en la concentración y una frase que **no afirma que la alternativa sea mejor**. **«Guardar la comparación no aplica el cambio a tu cartera»**: `testS` S6 comprueba que la cartera guardada conserva posiciones **y revisión**. Si la cartera cambia después, el escenario lo avisa y **no recalcula** (K16/K17). Al salir: **«Guardar en mi Cuaderno»**; sin cuenta se explica qué se conserva al entrar (la simulación preparada) y qué no (lo escrito en el formulario de guardado).

# 5. Paso 4 · un Cuaderno para revisar decisiones
- **Formulario ligero** (nada obligatorio): *Qué quiero averiguar* (`pregunta`, 200), *Por qué lo estoy estudiando* (`nota`, 600, las antiguas se conservan), ***Qué me haría cambiar de opinión*** (**campo nuevo** `invalidacion`, 600), *Cuándo quiero revisarlo* (`revisar_en`). El vínculo editorial y su desvinculación explícita no cambian.
- **«Para revisar» / «Próximas revisiones» / «Sin fecha»** en «En estudio»; lo descartado o archivado no se presenta como pendiente. La fecha se compara como **día en la zona de la persona**.
- **«Registrar revisión»** (tabla `revisiones_escenario`): fecha, observación (*comentario personal, no un hecho verificado*), aprendizaje y decisión (mantener, descartar o programar otra revisión). Se **añade** al historial; no sustituye la hipótesis original ni la base/propuesta. **Atómica** (inserta y actualiza estado/fecha en un lote), **idempotente** por clave (reintento y dos envíos simultáneos = un registro) y con **conflicto de revisión** entre pestañas (409 sin pisar nada). Tope de 200.
- `unit-cuaderno21` (**20**): campos, límites, atomicidad, idempotencia, concurrencia, conflicto, validación, aislamiento entre cuentas, cambio y **borrado** de la cartera original sin perder la comparación, borrado en cascada y la regresión del §6.

# 6. Paso 5 · conectar la Revista con el producto
La historia y la opinión muestran tema, fecha, carácter ficticio y fuentes, y ahora **«Qué no sabemos»**; la opinión añade **fecha prevista de revisión**. La acción es **«Explorar esta idea en una simulación»** (con una nota sobre guardar la pregunta en el Cuaderno) y, desde el laboratorio, **«Volver a la lectura»**. Si un contenido no trata de una posición concreta, enlaza a «Explorar empresas relacionadas» y **no** crea un escenario. Plantilla para artículos futuros: `ronda21/PLANTILLA-EDITORIAL.md`. Sin fábrica de artículos, noticias automáticas ni señales de compra/venta.

# 7. Regresiones halladas por la pasada completa (y corregidas)
La pasada completa **encontró regresiones reales que ninguna prueba nueva habría visto**:
1. **`ORDER BY` de las carteras públicas** (`functions/api/public/index.js`): al añadir la columna `portafolios.origen`, el nombre `origen` en el `ORDER BY` resolvía a la **columna** y no al alias; los ejemplos de Klever dejaron de ir primero (`testC`). Corregido; **regresión `unit-cuaderno21` K20: falla sin la corrección y pasa con ella**.
2. **El aviso de origen empujaba los controles fuera del primer viewport a 320 px** (`testQ` Q1-320). Compactado y, en móvil, colocado tras las posiciones.
3. **Textos de la portada** que algunas pruebas comprobaban literalmente (`testB`, `testN`, `testP`): se actualizaron al nuevo copy **comprobando lo mismo** (promesa, acciones, transparencia); no se rebajó nada. Una nueva decisión de producto cambia esas frases a propósito.
4. **`testK` (`page.goto` abortado)** — *su causa queda explicada, no solo mitigada*: cerrar la ficha con Escape ejecuta `history.back()` (asíncrono, `app.js`) y un `goto` inmediato lo abortaba; la prueba espera ahora a que la navegación termine. Es la causa del fallo intermitente de las rondas 19–21 con **fuerte indicio, no demostración directa** (ya no se reproduce).
5. **`testP` sin resultado en una pasada** (`waitForSelector('[data-plantilla]')` agotado en la primera apertura): **no reproducido** en 6 repeticiones; causa **sin demostrar**.

# 8. Pruebas realmente ejecutadas (por entorno)
**Pasada completa definitiva** (`bash tests/run-all.sh`, commit `0e9bc0a`, árbol limpio): **888 comprobaciones correctas, 0 fallos, código 0** (44 baterías + demo), **locales del autor**. Registro íntegro de cada batería **y de `demotest`** en `ronda21/logs/`; ninguno contiene `CIERRE FORZADO` ni `CIERRE ANÓMALO`: **no hubo cierre forzado**. *Aserciones ≠ entradas.*
- **Módulo / servidor (SQLite real, sin navegador) y subprocesos:** `unit-registro21` **10** y `unit-cuaderno21` **20** (nuevos), `unit-migracion` 15 (con la 0012), `unit-cierre20` 10, `unit-causas20` 10, `unit-revision19` 10, `unit-redondeo19` 6, `unit-nota` 35, `unit-calculos` 23 y las anteriores.
- **Navegador (Chromium, servidor local con SQLite):** `testS` **30** (nuevo: recorrido completo con cuenta y persistencia a 1440 y 390 px, las tres entradas, una cartera sin nota hasta la comparación, teclado real, aislamiento entre cuentas), `testR` 16, `testQ` 25, `testB` 53, `testC` 50, `testK` 75, `testN` 41, `testP` 28 y las anteriores; demo autónoma con su log.
- **Repeticiones** de `testE`, `testF` y `testC` con latencia 0 y 300 ms (`ronda21/intermitentes.txt`): **12/12 con código 0** (`testE` 15/0, `testF` 10/0 y `testC` 50/0, dos veces con latencia 0 y dos con 300 ms), sobre el código final.
- **Pasadas fallidas conservadas con su log íntegro:** `logs-pasada1-fallos/` (767 correctas; 10 problemas: regresión del `ORDER BY` público, aviso de origen en móvil, textos de la portada en `testB`/`testN`/`testP`/`testC`, y `testK`) y `logs-pasada2-fallo-P/` (860; `testP`). Cada una **no se rebajó ninguna aserción**.
- **Entorno remoto:** nada ejecutado. **Móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, D1 remota, correo real, datos reales y comprensión por personas: no probados.** No se aprueba ninguna comprobación por simulación de un caso de navegador.

# 9. Qué está implementado, verificado, no verificado y futuro
| | |
|---|---|
| **Implementado y verificado** (local, SQLite real, Chromium) | Los pasos 0–5 descritos; recorrido con cuenta y persistencia (`testS`); migración 0012 con datos previos (`unit-migracion` M1f); atomicidad, idempotencia, conflicto y aislamiento (`unit-cuaderno21`) |
| **Implementado, no verificado** | Móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, D1 remota, correo real, comprensión por personas |
| **Futuro** (fuera de alcance, no implementado) | Cobros, Revolut/Trade Republic, datos de mercado reales, noticias automáticas, correos o notificaciones, artículo o tip diario personalizado, recomendaciones, publicación pública, ideas generales sin escenario (el modelo actual exige ticker y propuesta; no se crean valores ficticios) |

# 10. Limitaciones
- **La prueba con personas NO está hecha** (`ronda21/PRUEBA-CON-USUARIOS.md`, todo «pendiente»). «Cerrar y volver al día siguiente» exige persistencia verificada: aquí se verifica cerrar sesión y volver con la misma cuenta contra SQLite local, **no** pasar un día ni usar D1 remota.
- El estado «guardando» y el de «error» de guardado ya existían y no se han vuelto a probar en profundidad en esta ronda.
- Las cantidades monetarias solo aparecen con su base («10.000 € simulados»); la nueva sección «de un vistazo» no muestra importes.
- `plantilla` queda como valor técnico heredado para carteras vacías o manuales (la base impide un cuarto valor sin reconstruir la tabla); no se muestra.
- **La demo autónoma** soporta ahora en memoria las revisiones y la invalidación del Cuaderno (`scripts/demo/mock.js`); `demotest` (recorrido básico) y `paridad-demo` pasan, pero **no se probó registrar una revisión en la demo** y la demo pierde sus datos al recargar: no sirve para la tarea «cerrar y volver».
- **Las dos pasadas fallidas** y sus causas están en el §7; `testK` y `testP` tienen causa explicada o sin demostrar según se indica allí.
