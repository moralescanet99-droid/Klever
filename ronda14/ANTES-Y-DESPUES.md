# Antes y después de los fallos de confianza de la ronda 13

Cada fallo se demuestra **ejecutando la prueba nueva contra el código de la ronda 13** (commit `b7ad3b9`, en un árbol de trabajo aparte) y contra el código actual. Salidas literales, obtenidas en esta ronda.

## 1. Privacidad al salir (`tests/ronda14/antes-despues-privacidad.cjs`)
Con una cuenta A (cartera «CARTERA-SECRETA-A-5520» y nota «NOTA-SECRETA-A-7731» en su radar), se abre la ficha, se visita «Mis carteras» y se **sale sin recargar la página**. Se busca en el HTML de la página.
```
ANTES  (b7ad3b9): Tras salir SIN recargar → HTML contiene la nota de A: true; el nombre de la cartera de A: true
DESPUÉS (actual): Tras salir SIN recargar → HTML contiene la nota de A: false; el nombre de la cartera de A: false
```
La batería `testL` (L1, L1b, L2, L3) lo repite en escritorio y móvil, con la entrada posterior de B, con una **respuesta lenta de A que llega después de salir** y con **caducidad de sesión (401)**.

## 2. Procedencia de datos con catálogo vacío (carga con `fetch` de la SEC simulado a «vacío»)
```
ANTES  (b7ad3b9): INSERT OR REPLACE INTO datos_meta(clave,valor) VALUES('origen','sec');
                  INSERT OR REPLACE INTO datos_meta(clave,valor) VALUES('actualizado_en',date('now'));
                  → la interfaz habría dicho «Fuente: SEC EDGAR, actualizado hoy» sin cargar ninguna fila financiera
DESPUÉS (actual): INSERT INTO cargas (origen,fecha,n_ok,n_vacias,n_fallidas,estado) VALUES ('sec','2026-11-04',0,0,0,'vacia');
                  → solo queda constancia del lote vacío; ninguna fuente declarada
```
`tests/ronda14/unit-carga.mjs` (11 comprobaciones) cubre carga vacía, parcial y correcta sobre datos previos; una empresa fallida conserva su fecha anterior; ausencia ≠ cero. Ver `ronda14/PROCEDENCIA.md`.

## 3. Radar: escritura fallida tras un primer guardado (`tests/ronda14/antes-despues-radar.mjs`)
Almacenamiento simulado que acepta la primera escritura y rechaza la segunda (cuota llena):
```
ANTES  (ronda 13): la operación DIJO que había guardado (sin error); el radar guarda ahora: «v1: nota guardada»; en disco: «v1: nota guardada»
DESPUÉS (ronda 14): lanzó un error: «No se ha podido guardar en este dispositivo (almacenamiento lleno o bl…»; el radar guarda ahora: «v1: nota guardada»; en disco: «v1: nota guardada»
```
Antes, la interfaz creía haber guardado «v2» pero lo guardado seguía siendo «v1». Ahora se avisa, el texto se conserva en pantalla y se ofrece «Reintentar guardado» (`testL` L4, L5, L6, L6b: reintento, recarga, y lectura fallida distinta de «radar vacío»).

## 4. Integridad de escenarios (`tests/ronda14/unit-r14.mjs` contra el servidor de la ronda 13)
Las pruebas de **precisión y símbolos únicos** (Q1–Q3b) fallan en el código antiguo; las de campos nuevos (Q4–Q5) fallan porque esos campos no existían. Las de concurrencia (Q6–Q10) pasan en ambos: el control de revisión y las claves de reintento ya eran correctos; **los topes se hacen ahora atómicos** (la sentencia comprueba el tope; antes se comprobaba antes de insertar).
```
ANTES (b7ad3b9)
FALLA [Q1] Peso de 10,04 %  [HTTP 201: undefined; filas 1]
FALLA [Q2] Propuesta con un símbolo duplicado (C dos veces, 5 + 5)  [HTTP 400: La propuesta no coincide con el resultado del método elegido.; filas 1]
FALLA [Q3] Propuesta con pesos de más de una decimal  [HTTP 201: undefined]
FALLA [Q3b] Propuesta con una fila de más (misma posición repetida)  [HTTP 201]
OK    [Q3c] Un decimal SÍ se acepta (10,5 %)
FALLA [Q4] Pregunta, fecha de revisión e historia vinculada  [[201,null,null,null]]
FALLA [Q4b] Campos no válidos  [[201,201,201]]
FALLA [Q4c] Editar la pregunta y quitar la fecha (revisión 0 → 1)  [[200,null,null,1,2,3]]
FALLA [Q5] Un escenario anterior (sin los campos nuevos) se abre y se lista  [[200,null,null,null,1]]
OK    [Q6] «Marcar como descartado» conserva la historia; «Eliminar» la borra del todo
OK    [Q7] Dos pestañas: otra escritura se cuela entre la lectura y la actualización
OK    [Q8] Dos reintentos con la misma clave a la vez (el otro escribe entre la comprobación y el INSERT)
OK    [Q9] Tope de 100 escenarios con una escritura simultánea
OK    [Q10] Tope de 200 en el radar con una escritura simultánea
RESULTADO: 6 correctas, 8 fallos

DESPUÉS (actual)
OK    [Q1] Peso de 10,04 %
OK    [Q2] Propuesta con un símbolo duplicado (C dos veces, 5 + 5)
OK    [Q3] Propuesta con pesos de más de una decimal
OK    [Q3b] Propuesta con una fila de más (misma posición repetida)
OK    [Q3c] Un decimal SÍ se acepta (10,5 %)
OK    [Q4] Pregunta, fecha de revisión e historia vinculada
OK    [Q4b] Campos no válidos
OK    [Q4c] Editar la pregunta y quitar la fecha (revisión 0 → 1)
OK    [Q5] Un escenario anterior (sin los campos nuevos) se abre y se lista
OK    [Q6] «Marcar como descartado» conserva la historia; «Eliminar» la borra del todo
OK    [Q7] Dos pestañas: otra escritura se cuela entre la lectura y la actualización
OK    [Q8] Dos reintentos con la misma clave a la vez (el otro escribe entre la comprobación y el INSERT)
OK    [Q9] Tope de 100 escenarios con una escritura simultánea
OK    [Q10] Tope de 200 en el radar con una escritura simultánea
RESULTADO: 14 correctas, 0 fallos
```
- **Q1:** el servidor antiguo aceptaba `peso: 10,04` (HTTP 201) y guardaba un objetivo de 10,04 con una posición de 10 %.
- **Q3b:** aceptaba una propuesta con la misma posición repetida (la normalización quitaba el duplicado antes de comparar).
- **Q2:** el antiguo la rechazaba por otro motivo (el reparto 5 + 5 no coincide); la regla nueva rechaza el símbolo repetido por sí mismo.

## Qué no se demuestra aquí
Que «dos pestañas» o los topes simultáneos fallaran antes: se comprobó que **no** fallaban (Q6–Q10 pasan en el código antiguo salvo los campos nuevos); el tope atómico es un endurecimiento, no la corrección de un fallo observado.
