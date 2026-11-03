# Ronda 9: cierre técnico (API pública coherente, comprobación de la demo y descripciones)

Ronda breve y acotada. Se conservan las correcciones de la ronda 8; no hay rediseño ni funciones nuevas.

> Informe generado con `tests/ronda9/informe9.py` a partir de `ronda9/resultado-ejecucion.txt` y `ronda9/evidencias-*.json`. **Código con el que se obtuvo el resultado: commit `a4f871b531bf0abd7ef7ef97b14b70ae05e141df`** (árbol de trabajo limpio). Para repetirlo: `git checkout a4f871b531bf0abd7ef7ef97b14b70ae05e141df` y `LEEME-PRUEBAS.md`.

## 1. `GET /api/public/:id`: una sola instantánea
- **Defecto (confirmado con una prueba que falla antes):** comprobaba `publico = 1` y leía las posiciones en consultas independientes. Con una despublicación y un cambio de posiciones entre las dos lecturas devolvía la cartera pública **con posiciones privadas** (`NEM:100`). `ronda9/antes-pruebas.txt`.
- **Corrección:** visibilidad, metadatos y posiciones salen de **un lote de lecturas** (una transacción) y las posiciones se piden, además, solo si la cartera sigue siendo pública en esa misma instantánea. La respuesta es la versión pública anterior completa o 404; nunca posiciones, nombre o tesis de una versión que no fue pública.
- **Prueba:** R6a (determinista: despublicación + cambio de posiciones intercalados entre las lecturas originales; comprueba también que no se filtra nombre ni tesis privados) y R6b (cartera ya privada → 404). Además `tests/ronda9/verificar-api.mjs` V7 hace una prueba de estrés por HTTP (empírica, no determinista).

## 2. La comprobación de la demo en `tests/run-all.sh`
- **Defecto (confirmado, `ronda9/antes-ejecutor-demo.txt`):** el ejecutor de la ronda 8 salía con código 0 con una demo que imprimía «DEMO OK» y terminaba con código 1, y con el puerto de la demo ocupado ejecutaba la prueba contra un **servidor ajeno**.
- **Corrección:** la demo exige código 0, «DEMO OK», ausencia de «HAY FALLOS» y de timeout; comprueba que existe `demo/index.html`, que el puerto está libre y que su servidor arranca; no ejecuta nada si el puerto está ocupado y no mata servidores ajenos.
- **Casos de prueba** (`tests/ronda8/test-ejecutor.sh`, D1–D8, 18 en total con los anteriores): control correcto; «DEMO OK» con código 1; sin «DEMO OK»; «HAY FALLOS»; timeout; sin demo; servidor que no arranca; puerto ocupado sin ejecutar la prueba y sin matar al ajeno. Resultado: `ronda9/resultado-ejecutor.txt`.

## 3. Descripciones G2 y U4
Un ticker desconocido se rechaza **antes** del lote (validación previa, HTTP 400): ya no se describe como fallo a mitad de transacción. La evidencia de **rollback ante un error interno** es **R4a** (el lote falla en la sentencia 2, HTTP 500, nada cambia y el detalle se registra) y R5 para la creación.
*Nota:* los informes de las rondas 7 y 8 conservan la descripción antigua de G2 y U4 como antecedente; la vigente es la de esta ronda.

## 4. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-03 18:47 UTC
Código: commit a4f871b531bf0abd7ef7ef97b14b70ae05e141df; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 6 correctas, 0 fallos
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
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
Obtenido en un clon nuevo del commit indicado (`git clone`, `npm ci`, `bash tests/run-all.sh`); el ejecutor termina con código 0 solo si todo pasa.

## 5. Evidencia
**Carreras, rollback y API pública (R):**

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| R1 | PUT: una escritura ajena llega entre el commit y la respuesta | A recibe SU revisión (1), no la de B (2); su siguiente guardado con esa revisión es 409 y no pisa a B | HTTP 200, revisión devuelta 1; siguiente guardado HTTP 409; estado {"nombre":"B","tesis":null,"publico":0,"revision":2,"pos":"NEM:100"} | texto y valores en la propia fila | ✅ |
| R2 | PATCH: una escritura ajena llega entre el commit y la respuesta | A recibe SU revisión (1); su siguiente cambio con esa revisión es 409 | HTTP 200, revisión devuelta 1; siguiente HTTP 409; estado {"nombre":"B","tesis":null,"publico":0,"revision":2,"pos":"NEM:100"} | texto y valores en la propia fila | ✅ |
| R3 | GET: una escritura ajena llega entre la lectura de la cartera y la de sus posiciones | La respuesta es UNA versión que existió (nombre, revisión y posiciones a juego), nunca una mezcla | nombre «Prueba», revisión 0, posiciones GLD:60,IAU:40; la escritura ajena sí se aplicó=true | texto y valores en la propia fila | ✅ |
| R4a | Rollback ante un error interno de infraestructura a mitad del lote (PUT) | HTTP 500 con mensaje de reintento (no «ticker desconocido»), nada queda a medias y el detalle técnico se registra en el servidor | HTTP 500; «No se pudo guardar por un error del servidor. Inténtalo de nuevo.»; sin cambios=true; registrado=true | texto y valores en la propia fila | ✅ |
| R4b | Ticker desconocido (validación) | HTTP 400 «Algún ticker no está en el universo» y nada cambia | HTTP 400; «Algún ticker no está en el universo»; sin cambios=true | texto y valores en la propia fila | ✅ |
| R5 | POST: error interno a mitad del lote | HTTP 500 y no queda ninguna cartera | HTTP 500; carteras=0 | texto y valores en la propia fila | ✅ |
| R6a | GET público: la cartera se despublica y cambian sus posiciones entre las lecturas originales | La respuesta es la versión pública anterior COMPLETA (o 404); nunca posiciones, nombre o tesis de una versión que no fue pública | HTTP 200; nombre «Prueba», tesis «Tesis pública», posiciones GLD:60,IAU:40; la despublicación sí se aplicó=true; fuga de datos privados=false | texto y valores en la propia fila | ✅ |
| R6b | GET público de una cartera ya privada | HTTP 404, sin posiciones | HTTP 404; posiciones en la respuesta=false | texto y valores en la propia fila | ✅ |

**Servidor de la ronda 7 (U) y guardado fiable (F, incluye G2):**

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| U1a | POST con posiciones: una sola operación | Cartera con sus 2 posiciones y revisión 0 | HTTP 201; {"nombre":"C","tesis":"T","publico":0,"revision":0,"pos":"GLD:60,IAU:40"} | tests/ronda7/unit-servidor.mjs | ✅ |
| U1b | POST con un ticker desconocido: no queda una cartera a medias | HTTP 400 y sigue habiendo 1 cartera (la anterior) | HTTP 400; carteras=1 | tests/ronda7/unit-servidor.mjs | ✅ |
| U2a | PUT único guarda posiciones, nombre y tesis y sube la revisión | HTTP 200, revisión 1, todo guardado | HTTP 200; {"nombre":"Nuevo","tesis":"Tesis","publico":0,"revision":1,"pos":"GDX:70,NEM:30"} | tests/ronda7/unit-servidor.mjs | ✅ |
| U2b | Dos escrituras en el mismo segundo con la misma revisión: la segunda se rechaza | HTTP 409 y nada cambia (con la fecha de un segundo habrían pasado las dos) | HTTP 409; sin cambios=true | tests/ronda7/unit-servidor.mjs | ✅ |
| U2c | PUT sin revisión: se rechaza | HTTP 400, nada cambia | HTTP 400; Falta la revisión de la cartera desde la que editas. | tests/ronda7/unit-servidor.mjs | ✅ |
| U2d | PATCH (publicar) también sube la revisión | HTTP 200, publico 1, revisión 2 | HTTP 200; {"nombre":"Nuevo","tesis":"Tesis","publico":1,"revision":2,"pos":"GDX:70,NEM:30"} | tests/ronda7/unit-servidor.mjs | ✅ |
| U2e | PATCH con revisión caducada: 409 y la publicación no cambia | HTTP 409, sigue público | HTTP 409; {"nombre":"Nuevo","tesis":"Tesis","publico":1,"revision":2,"pos":"GDX:70,NEM:30"} | tests/ronda7/unit-servidor.mjs | ✅ |
| U3 | Escritura ajena entre la lectura y la escritura (carrera simulada de forma determinista) | HTTP 409; NO se sobrescribe lo ajeno ni se mezclan posiciones | HTTP 409; {"nombre":"AJENO","tesis":null,"publico":0,"revision":1,"pos":"NEM:100"} | tests/ronda7/unit-servidor.mjs | ✅ |
| U4 | Ticker desconocido con nombre y tesis cambiados: se rechaza ANTES del lote (validación previa, no a mitad de transacción) | HTTP 400 por validación y no cambia nada: ni nombre, ni tesis, ni posiciones, ni revisión (el rollback ante un error interno es la evidencia R4a) | HTTP 400; sin cambios=true | tests/ronda7/unit-servidor.mjs | ✅ |
| U5a | Cartera pública: un reparto incompleto no se guarda (ni siquiera el nombre o la tesis) | HTTP 400, sin cambios | HTTP 400 | tests/ronda7/unit-servidor.mjs | ✅ |
| U5b | Cartera pública: un reparto válido actualiza todo a la vez | HTTP 200; posiciones, nombre y tesis nuevos juntos | HTTP 200; {"nombre":"Y","tesis":"T2","publico":1,"revision":1,"pos":"GDX:70,NEM:30"} | tests/ronda7/unit-servidor.mjs | ✅ |

| Id | Escenario | Resultado esperado | Resultado observado | Evidencia | OK |
|---|---|---|---|---|---|
| G1 | Guardado fallido de una cartera pública (servidor real) | Con el guardado único, si falla NO queda nada a medias: ni posiciones, ni nombre, ni tesis, ni la versión pública; la interfaz dice que no se guardó y ofrece reintentar; al reintentar se guarda todo junto | antes «Mi cartera de oro» · tesis «Tesis original» · GDX:25,GLD:25,IAU:25,NEM:25 · rev 2; tras fallar «Mi cartera de oro» · tesis «Tesis original» · GDX:25,GLD:25,IAU:25,NEM:25 · rev 2 (idéntica=true); público antes/después igual=true; interfaz «No se pudo guardar. Tus cambios siguen en este dispositivo» / «Sin conexión con el servidor. Inténtalo de nuevo.» / botón «Reintentar guardado»; peticiones de escritura enviadas en todo el guardado: PUT,PUT; tras reintentar «Nombre nuevo» · tesis «Tesis NUEVA» · GDX:40,GLD:10,IAU:25,NEM:25 · rev 3; público «Nombre nuevo» · tesis «Tesis NUEVA» · GDX:40,GLD:10,IAU:25,NEM:25 | `ronda9/evidencias/G1-fallo-sin-parciales-1440.png` | ✅ |
| G2 | Ticker desconocido en un guardado con nombre y tesis cambiados: se rechaza ANTES del lote (validación previa, no a mitad de transacción) | HTTP 400 por validación y la cartera queda exactamente igual (revisión incluida); el rollback ante un error interno es la evidencia R4a | HTTP 400; antes «Nombre nuevo» · tesis «Tesis NUEVA» · GDX:40,GLD:10,IAU:25,NEM:25 · rev 3; después «Nombre nuevo» · tesis «Tesis NUEVA» · GDX:40,GLD:10,IAU:25,NEM:25 · rev 3 | texto y valores en la propia fila | ✅ |
| G3 | Escrituras con la misma revisión (servidor real, HTTP) | Dos guardados SEGUIDOS en el mismo segundo con la misma revisión: 200 y 409 (antes 200 y 200). 20 pares SIMULTÁNEOS: nunca pasan los dos y la revisión sube exactamente una vez por escritura aceptada | seguidos: 200 y 409; 20 pares simultáneos: ambos aceptados=0, ninguno=0, exactamente uno=20; revisión 3 → 24 (esperado 24) | texto y valores en la propia fila | ✅ |
| G4a | Conflicto al GUARDAR: elegir la versión de este dispositivo no escribe; Guardar sí | Escape y «Decidir después» conservan la copia y no tocan la cuenta; «Conservar la de este dispositivo» vuelve al editor SIN escribir (cuenta idéntica byte a byte, revisión incluida); al pulsar Guardar se escribe y sube la revisión | Escape: diálogo abierto=0, copia=true, cuenta intacta=true; «Decidir después»: copia=true, cuenta intacta=true, foco de vuelta en Guardar=true; elegir la local: cuenta idéntica=true, estado «Cambios locales pendientes de guardar en tu cuenta», copia=true, valores 15,0 25,0 25,0 30,0; tras Guardar: «Mi cartera de oro» · tesis «null» · GDX:30,GLD:15,IAU:25,NEM:25 · rev 3 (revisión 2 → 3) | texto y valores en la propia fila | ✅ |
| G4b | Conflicto al ABRIR: mismo comportamiento que al guardar | Escape y «Decidir después» conservan la copia y muestran la versión de la cuenta sin dirty; elegir la local carga la copia en el editor SIN escribir; Guardar escribe | Escape: copia=true, cuenta intacta=true, se ve «Guardada en tu cuenta»; «Decidir después»: copia=true, cuenta intacta=true; elegir la local: cuenta idéntica=true, estado «Cambios locales pendientes de guardar en tu cuenta», valores 12,0 25,0 25,0 30,0, copia=true; tras Guardar: «Mi cartera de oro» · tesis «null» · GDX:30,GLD:12,IAU:25,NEM:25 · rev 5 (revisión 4 → 5) | texto y valores en la propia fila | ✅ |
| G5 | Modo sin conexión REAL contra el servidor local | Sin conexión el guardado falla de verdad: «No se pudo guardar», cambios en el dispositivo, botón «Reintentar guardado»; la cuenta no cambia; al volver la conexión se guarda | sin conexión: «No se pudo guardar. Tus cambios siguen en este dispositivo» / «Sin conexión con el servidor. Inténtalo de nuevo.» / botón «Reintentar guardado»; cuenta intacta=true; tras reconectar «Guardada en tu cuenta» | texto y valores en la propia fila | ✅ |
| G6 | E16a corregida: última posición, ampliación de texto SIMULADA al 200 % (font-size del documento, no zoom del navegador) a 390 px | Tras desplazar y enfocar, el campo queda dentro de la ventana (top ≥ 0, bottom ≤ inicio de la barra fija, sin desbordar a los lados) y permite escribir | campo enfocado: arriba 312, abajo 378, barra empieza en 705, ventana 390×844, ancho de página 390; tras escribir «12,5» el total pasó de «Asignado: 100 %» a «Asignado: 95,9 %» y el campo sigue visible (abajo 378 ≤ 663) | `ronda9/evidencias/G6-ultima-posicion-200-390.png` | ✅ |
| G7 | Diálogo de conflicto en móvil (320×568, texto ampliado al 200 % SIMULADO, 6 posiciones distintas + nombre) | «Decidir después» y las dos decisiones alcanzables siempre (cabecera y pie fijos, cuerpo con desplazamiento propio); el foco no sale del diálogo; posponer no elige, no descarta y no escribe | «Decidir después» visible sin desplazar=true (arriba 163); decisiones visibles: «Usar la de la cuenta» true, «Conservar la local» true (abajo 559/568); el cuerpo se desplaza=true (scrollTop tras rueda 2000); tras desplazar siguen visibles: true; diferencias listadas 7; foco inicial «cn-titulo»; 8 Tab sin salir del diálogo=true; ancho de página 320/320; tras «Decidir después»: diálogo abierto=0, copia local=true, cuenta intacta=true | `ronda9/evidencias/G7-dialogo-320-texto200.png` | ✅ |
| G8 | Sin errores de JavaScript en la batería F | Ninguno | ninguno | texto y valores en la propia fila | ✅ |

**Verificación por HTTP repetible en D1 remoto (V):** pasa en local (`ronda9/resultado-ejecucion.txt`, bloque `verificar-api`); **no se ha ejecutado contra D1 remoto**.

## 6. Ejecutado y pendiente
| Ámbito | Estado |
|---|---|
| Local simulado (Miniflare, SQLite real, Chromium) | **Ejecutado**: todo lo de este informe |
| D1 remoto (Cloudflare) | **Pendiente**: `ronda9/GUION-BETA-Y-D1-REMOTO.md` (secciones A–C); ningún paso ejecutado |
| Recorrido completo de la beta en un despliegue | **Pendiente**: guion D1–D11, sin ejecutar |
| Pruebas manuales (móviles reales, Safari, Firefox, lector de pantalla, zoom real, teclado real) | **Pendientes**: `ronda9/pruebas-manuales.md` (M1–M24), ninguna ejecutada |

## 7. Limitaciones
Las carreras se modelan con un adaptador que aplaza las escrituras intercaladas hasta después del commit (comportamiento documentado de `batch()`), no con dos procesos reales; V5–V7 son estrés empírico. Siguen las de las rondas 7 y 8.

Fuera de alcance: plan de pago (Revolut, Trade Republic, artículo y consejo diarios).
