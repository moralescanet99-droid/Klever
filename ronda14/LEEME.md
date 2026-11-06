# Ronda 14: confianza primero, y una historia que se puede leer, probar y retomar

Parte de la ronda 13 y conserva sus avances (radiografía, radar privado, laboratorio, historial de escenarios, versión guardada frente a cambios locales). Primero se corrigen los cuatro fallos de confianza; después se entrega el recorrido *historia → opinión → «Probar en mi cartera» → comparación → seguimiento con pregunta*, probado en 320/390/1440 px.

> **Código probado: commit `4a04367e616b60e06c236327b5bea1bd731e3f1b`** (árbol de trabajo limpio al ejecutar; los commits posteriores solo añaden resultados, informe y memoria). Resultado literal al final. Capturas del primer uso y del regreso: `ronda14/capturas/` (S0–S7 en 320 y 390 px). **Cómo abrirlo en el móvil:** `ronda14/ABRIR-EN-MOVIL.md`.

## 1. Fallos de confianza corregidos (con demostración antes/después en `ronda14/ANTES-Y-DESPUES.md`)
| Fallo | Qué se hizo | Prueba |
|---|---|---|
| **Privacidad al salir** | `limpiarPrivado()` (salir y caducar la sesión) vacía memoria y pantalla (lista de carteras, editor, radiografía, ficha, seguimiento, laboratorio, referencia de cartera) e **invalida las respuestas en vuelo** con un contador de sesión | Antes: tras salir sin recargar, el HTML aún contenía la nota y la cartera de A. Después: no. `testL` L1–L3: escritorio y móvil, entrada de B, **respuesta lenta de A que llega después de salir**, caducidad 401 |
| **Procedencia de datos** | Fuente, periodo y fecha **por fila** (`fundamentales.fuente/actualizado_en`), lotes en `cargas`; una empresa fallida o vacía no se toca; una carga vacía no declara fuente; `/api/datos` se **deriva de las filas**; la ficha muestra la procedencia de **esa** ficha; ausencia ≠ cero en las métricas derivadas | Antes: catálogo vacío → «SEC, actualizado hoy». Después: solo un lote `vacia`. `unit-carga` (11), migración 0009 (M1c, M7). Detalle: `ronda14/PROCEDENCIA.md` |
| **Guardado y recuperación del radar** | La escritura es **estricta** (si falla, se lanza); la lectura fallida **no es «radar vacío»**; texto conservado, «No se ha podido guardar», «Reintentar guardado» | Antes: la operación decía guardar y lo guardado seguía siendo el valor viejo. Después: error visible. `testL` L4–L6b (visitante: cuota llena, reintento, recarga; dato dañado; con cuenta: lectura fallida) |
| **Integridad de escenarios** | Una decimal como mucho (cliente, servidor y propuesta); propuesta con símbolos únicos, sin normalizar antes de comparar; fecha de revisión real; topes (100 escenarios, 200 radar) **atómicos en la sentencia**; reintentos concurrentes devuelven el ya guardado | Antes: aceptaba 10,04 y una propuesta con la posición repetida. Después: HTTP 400. `unit-r14` (14): precisión, duplicados, campos, escenario antiguo, dos pestañas, reintentos, topes |

## 2. La historia, que se lee, se prueba y se retoma
- **Revista** (`#revista`, también desde la portada y el menú), legible **sin cuenta**: una pieza con título «**Caso ficticio**: cómo Hidrógeno Norte convierte proyectos anunciados en contratos», autora ficticia, fecha, 6 fuentes de ejemplo (**todas identificadas como documentos ficticios**, sin enlace porque no existen), tabla de proyectos y empresa vinculada («Hidrógeno Norte (empresa ficticia)», con ficha propia y datos de prueba rotulados).
- **El Superespeculador** (`#tesis-…-1`): opinión firmada con **hecho observado / interpretación del autor / qué me haría cambiar de opinión / pregunta para seguir**; **revisión fechada** (`#tesis-…-2`, «**desenlace simulado**») vinculada a la tesis original, que **sigue accesible tal cual** y avisa de su revisión posterior.
- **Laboratorio:** «Probar en mi cartera» desde la historia y desde la ficha; conserva la empresa; **sin cartera ofrece una de ejemplo en ese mismo punto** (KO 60 % · PG 40 %); el radar es opcional; **primero** se dice de dónde sale el peso («KO cede 6, PG cede 4») y **después** la tabla y los pasos; el redondeo va en un desplegable.
- **Seguimiento:** al guardar, **pregunta** (precargada con la de la historia, editable) y **fecha de revisión**, ambas opcionales; al volver se ven la pregunta, la fecha, la comparación original, la base original y los enlaces a la historia, la opinión y la revisión editorial. Los escenarios anteriores sin esos campos siguen abriendo (probado). **«Marcar como descartado»** (conserva) frente a **«Eliminar definitivamente»** (borra).
- **Móvil:** «Editar nota» / «Editar nota y pregunta» en vez de formularios abiertos; método de redondeo desplegable; sin desbordes a 320/390 px con texto ampliado simulado.

## 3. Criterios de aceptación del encargo, uno a uno
- **Primera visita sin cuenta** → `testL` L7–L9 (320 y 390): historia → opinión → revisión → vuelta a la original → «Probar en mi cartera» → **KO 54 % · PG 36 % · HNORT 10 %**, A cede 6 y B cede 4, la simulación es temporal.
- **Regreso con cuenta** → L10–L12: se guarda con «¿Se han firmado los dos contratos anunciados?»; tras cerrar y volver a entrar con el mismo correo aparecen la pregunta, la base original y la revisión editorial; **un cambio posterior de mi cartera conserva los pesos históricos** y avisa de la versión posterior.
- **Errores y datos privados** → `ronda14/ANTES-Y-DESPUES.md`; L14: **simular y guardar deja intactas la composición privada y la publicación** (revisión, posiciones y vista pública idénticas).

## 4. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** `bash tests/run-all.sh` completo con servidor limpio entre baterías: **522 comprobaciones correctas, 0 fallos, código 0**. Unidad: 11 + 8 + **10** (migración, ahora con 0009) + 8 + 23 + 30 + **11** (carga) + **14** (escenarios y concurrencia); zip 8.
**Navegador (Chromium, servidor local):** A 31, B 51, C 50, D 29, E 15, F 9, G 3, H 25, I 16, J 53, K 75, **L 28 nuevas**; API 8; seguridad 6; **demo OK** (con el recorrido radar → laboratorio → escenario y la lectura de la historia).
**Entorno remoto:** **nada ejecutado** (ver §5).
**Revisión visual de capturas** corrigió: la tabla de la historia partía palabras a 390 px, el aviso del caso empezaba en minúscula y los campos de fecha desbordaban a 200 % en 320 px.
**Pruebas antiguas adaptadas por el rediseño** (cambios intencionados): `testB` (menú móvil con 5 enlaces; recuento 106 empresas al incluir la ficticia), `testJ`/`testK` (106 empresas; la nota ahora se edita con «Editar nota»; «Eliminar definitivamente»), `demotest` (idem) y `unit-migracion` (M1c, M7).
**Dos incidencias de la ejecución, declaradas:** (1) en una pasada previa, `testF` «terminó sin resultado» mientras yo ejecutaba a la vez pruebas contra otro árbol de trabajo; en solitario pasa 9/9 y en la pasada siguiente también (conservado: `ronda14/resultado-ejecucion-intento1-testF-sin-resultado.txt`); es la **segunda vez** que una prueba antigua del navegador falla de forma no reproducible (en la ronda 13, `testE`), así que **hay una fragilidad intermitente sin diagnosticar**. (2) Otra pasada falló por una mayúscula en una expresión regular de mi propia prueba (`ronda14/resultado-ejecucion-intento2-L9.txt`).

## 5. Bloqueos reales y pruebas pendientes
- **Bloqueado (faltan accesos; no se piden secretos):** Cloudflare D1 remoto, `UPDATE … RETURNING`/`batch` y las migraciones 0008–0009 en una D1 real, correo real, **carga real de la SEC** (la lógica nueva está probada con datos simulados, no con la SEC) → `ronda10/BLOQUEOS.md`.
- **Pendiente de hacer a mano** (`ronda14/pruebas-manuales.md`, M50–M58, más M1–M49): móvil físico, lector de pantalla, texto del sistema real, almacenamiento bloqueado real, tema oscuro de las pantallas nuevas, revisión editorial por una persona.
- **Conocido:** las copias locales de cambios sin guardar (`klever_edit_*`) **no se borran al salir** (permiten recuperarlas al volver a entrar con esa cuenta); no aparecen en pantalla pero siguen en el almacenamiento del dispositivo.
- **Honestidad de los datos:** los datos de las pruebas, la demo y la ficticia «Hidrógeno Norte» son **inventados**; la pieza editorial es un **caso de ejemplo** (autoría, fuentes, cifras y desenlace ficticios); cuando haya contenido real habrá que verificar cada cifra y enlazar su origen. Con datos reales y la regla «ausencia ≠ cero» habrá **más comprobaciones «sin datos»**.
- **Reservado para después (no tocado):** piloto de tres piezas, revista con categorías, publicaciones semanales, avisos, comparación de escenarios, análisis interno de ETF, Revolut/Trade Republic, artículo y tip diarios, suscripciones, apertura pública (tras validar privacidad, migración, D1 remoto, correo y procedencia real).

## 6. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-04 07:45 UTC
Código: commit 4a04367e616b60e06c236327b5bea1bd731e3f1b; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 10 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
=== unit-calculos ===
RESULTADO: 23 correctas, 0 fallos
=== unit-r13 ===
RESULTADO: 30 correctas, 0 fallos
=== unit-carga ===
RESULTADO: 11 correctas, 0 fallos
=== unit-r14 ===
RESULTADO: 14 correctas, 0 fallos
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
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
