# Antes y después de los fallos de privacidad de la revisión de la ronda 14

Cada fallo se demuestra ejecutando la prueba nueva contra el código de la ronda 14 (commit `8dbea32`, en un árbol de trabajo aparte) y contra el código actual. Salidas literales obtenidas en esta ronda.

## 1. Migración del radar local atada a la sesión, lecturas retrasadas y borrado estricto (`tests/ronda15/unit-almacen.mjs`)
API y almacenamiento simulados con carreras deterministas. **Antes (ronda 14):**
```
FALLA [A1] La migración empieza bajo A, se retrasa la lectura, se reinicia el módulo y se pasa a B  [["A:GET /radar","B:PUT /radar/JNJ","B:PUT /radar/KO"]; migrados 2; local conservado false]
FALLA [A2] Se cambia de cuenta entre la primera y la segunda escritura  [["A:GET /radar","A:PUT /radar/JNJ","B:PUT /radar/KO"]; local conservado false]
OK    [A3] Migración sin interrupciones
FALLA [A4] Un GET retrasado que devuelve «vacío» llega DESPUÉS de guardar una nota  [«»; empresas 0]
OK    [A5] Almacenamiento bloqueado desde el inicio (lectura y escritura fallan)
OK    [A5b] Se puede leer pero NO escribir (cuota llena)
FALLA [A6] El borrado de la ÚLTIMA fila falla  [; en disco «undefined»; memoria 0]
OK    [A6b] Recuperado el almacenamiento, el borrado funciona y sobrevive a «recargar»
OK    [A7] Datos locales dañados
RESULTADO: 5 correctas, 4 fallos
```
- **A1 (crítico):** la migración empieza bajo A, se retrasa la lectura, se reinicia el módulo y se pasa a B: el código de la ronda 14 **escribió las notas de A bajo B** (`B:PUT /radar/JNJ`, `B:PUT /radar/KO`) y borró el original local. A2: igual entre la primera y la segunda escritura.
- **A4:** un GET retrasado que devuelve «vacío» llega después de guardar una nota y **deja la memoria vacía**.
- **A6:** el borrado de la última fila fallaba en silencio (`removeItem`), fingiendo que el dato privado se había borrado.

**Después (actual):** `RESULTADO: 9 correctas, 0 fallos` (`node tests/ronda15/unit-almacen.mjs`): ninguna escritura sale bajo otra sesión, el original local solo se borra al terminar bajo la misma sesión, una lectura anterior a una escritura no se aplica y el borrado es estricto.

## 2. Sesión en el navegador (`tests/ronda15/antes-despues-sesion.cjs`)
```
ANTES (8dbea32)
(1) Salir con el detalle de A en vuelo (llega 2,5 s después): HTML/campos con la cartera de A justo tras llegar: false; y al abrir #cartera después: vista «inicio», contiene la cartera de A: false
(2) 401 retrasado de A con B ya dentro → la sesión de B sigue: false (token BORRADO)

DESPUÉS (actual)
(1) Salir con el detalle de A en vuelo (llega 2,5 s después): HTML/campos con la cartera de A justo tras llegar: false; y al abrir #cartera después: vista «inicio», contiene la cartera de A: false
(2) 401 retrasado de A con B ya dentro → la sesión de B sigue: true (token de B conservado)
```
- **401 retrasado (reproducido):** antes, el 401 de una petición de A comparaba el token **actual** y desconectaba a B (`token BORRADO`); ahora se compara con el token **de la petición** y B conserva su sesión.
- **Salir con el detalle de la cartera de A en vuelo (NO reproducido visiblemente):** la revisión lo demostró con la función real del editor aislada (la respuesta tardía volvía a asignar el nombre privado a `current`); en el navegador completo, con el código antiguo, la navegación a la portada ocultaba el estado y mi comprobación (HTML, campos y apertura de `#cartera` después) **no vio exposición**. Lo dejo declarado: el arreglo (guardas de sesión y de navegación antes de tocar el estado; `limpiarPrivado()` síncrono al pulsar «Salir»; cierre de diálogos abiertos) está probado en el estado **posterior** (`testM` M1, M2: la respuesta tardía no vuelve a asignar nada y el diálogo de conflicto no se abre), pero **sin un «antes» observable en navegador**.

## 3. Copias locales de cambios sin guardar (`testM` M4–M7)
Antes: las copias `klever_edit_*` (nombre, tesis y pesos) quedaban en el dispositivo al salir, sin aviso. Ahora: aviso al salir con «Volver para guardarlos» o «Descartar los cambios y salir» (se borran); al entrar otra cuenta se **purgan** las copias de carteras que no son suyas; **caducan a los 7 días**; en una caducidad involuntaria (401) se conservan para poder recuperarlas, pero no quedan en pantalla. *Limitación declarada:* en una caducidad involuntaria el texto sigue en el almacenamiento del dispositivo hasta que otra cuenta entre, o hasta 7 días.
