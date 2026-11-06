# Ronda 23 · corrección final acotada: conservar lo que la persona escribe durante todo el ciclo de envío y recuperación

Parte de la revisión de la ronda 22 (`procesos-klever/06-`, C20): **I2 e I3 aceptados; I1 corregido en su caso original; queda B1 y B2 (borrador) y la verificación previa de M102 (sesión caducada)**. Sin cambios de esquema, sin capacidades nuevas, sin rediseño. Se conservan como **decisiones cerradas** I2, I3 y el pulido visual (tabla del apartado 4 de la revisión: ver §6).

> **Código de la última pasada completa:** el commit de la cabecera de `ronda23/resultado-ejecucion.txt` (§5). Diff concreto de las pruebas antiguas adaptadas en la ronda 22: `ronda23/DIFF-pruebas-antiguas-R21-a-R22.patch` (§7).

# 1. B1 · el texto escrito durante la petición ya no se borra ni se da por guardado
- **Defecto reproducido** (por la revisión): solo se desactivaba el botón; los campos seguían editables, y `textoNuevo` se calculaba **antes** de esperar la respuesta (y solo con un intento pendiente), de modo que al confirmarse el primer envío se vaciaba el borrador y se repintaba, perdiendo el texto B escrito mientras se guardaba. El registro confirmado correspondía al texto A: no se perdió ningún registro, sí el texto de la interfaz.
- **Corrección** (`public/js/lab.js`, `registrarRevision()`): al **resolverse** la petición —en el primer envío y en cada reintento— se toma lo que haya **en ese momento** en el formulario y se compara con el contenido del intento confirmado (`mismoContenido`). Si difiere, se conserva y se avisa «Lo que has escrito después NO se ha enviado». La carga de cada intento sigue congelada (misma clave y contenido).

# 2. B2 · conflicto con lectura fallida: ya no se recomienda recargar
- **Defecto:** la rama de conflicto con relectura fallida decía «recarga la página; tu texto sigue aquí», pero el borrador solo vivía en memoria.
- **Corrección:** tras un 409 cuya relectura falla se pasa a un estado de **«Reintentar la lectura»**: solo **lee**, no hay ningún POST ni cambio de clave mientras tanto, el texto se queda en pantalla y el aviso lo dice. Cuando la lectura se recupera se muestra la versión actual (con la revisión de la otra pestaña) y entonces se puede registrar el borrador sin pisar nada.
- **Además, el borrador ya no vive solo en memoria:** se guarda también en el dispositivo (clave por escenario, caduca a los 7 días), de modo que la instrucción «tu texto sigue aquí» es cierta incluso tras una recarga. No es un sistema general de borradores: solo el de una revisión.

# 3. M102 · sesión caducada y regreso (verificado antes del piloto)
- **Resultado:** con la lógica de la ronda 22 el borrador **se perdía** al caducar la sesión (`limpiarSesionLab` vacía la memoria) → M102 **fallaba**. Corrección acotada: el borrador persiste en el dispositivo; al volver a entrar **con la misma cuenta** y abrir la idea, el texto está en el formulario; con **otra cuenta** esa idea es un 404 (ni formulario ni texto) y los borradores de escenarios ajenos **se purgan** al cargar su Cuaderno; **cerrar sesión a propósito borra todos** los borradores de revisión (dispositivo compartido). Comprobado en `testU` U4, U5 y U5b.
- **Un fallo encontrado al probarlo:** la primera versión de la purga se saltaba una clave (el orden de `localStorage.key()` cambia al borrar mientras se itera); ahora se listan **antes** de borrar.
- **Límites:** la caducidad se **simula revocando la sesión en el servidor** (el POST recibe un 401 real), no esperando a una caducidad real por tiempo. Si la sesión caduca con un envío **incierto** pendiente, el intento (clave) se pierde con la memoria: el texto se conserva y se enviaría como un intento nuevo (un duplicado sería posible solo si aquel primer envío sí llegó). **Falta la comprobación manual M102 con un dispositivo real.**

# 4. Pruebas de regresión (fallan con la ronda 22, pasan con la corrección)
`tests/ronda23/testU.cjs` (**24**: 8 casos × 1440, 390 y 320 px) prueba **la lógica del formulario real** en el navegador, no solo el módulo de envío:
| Caso (tabla de la revisión) | Prueba |
|---|---|
| Primer envío lento y edición durante la espera | U1: solo se registra el texto A; B queda como borrador (en pantalla y en el dispositivo) y el aviso dice que no se envió; 1 POST |
| Reintento lento y edición durante la espera | U2: misma clave y mismo contenido que el primer intento; C no se envía y se conserva |
| Conflicto y lectura posterior fallida | U3: sin «recarga»; «Reintentar la lectura» solo lee (cero POST); texto intacto |
| Lectura recuperada | U3: versión actual con la revisión de la otra pestaña; luego registrar añade la mía (2 revisiones, 2 POST en total) |
| Sesión caducada y regreso | U4: el borrador vuelve con la misma cuenta |
| Otra cuenta | U5: no ve el borrador (404, sin formulario ni texto) y se purga; U5b: salir a propósito borra |
| Recorrido principal y base | U6/U0 y `testS`/`testT` en la pasada completa: la base conserva posiciones y revisión |
**Contra el código de la ronda 22** (`ronda23/evidencia-testU-con-R22.txt`, ejecutado con `lab.js` y `app.js` de `b7ae443`): **6 correctas y 18 fallos** (fallan U1, U2, U3, U4, U5 y U5b en los tres tamaños). *U5/U5b fallan con la ronda 22 también porque entonces no se guardaba nada en el dispositivo (la función es nueva).*
**Un error mío al escribir U2:** un comentario a mitad de línea anuló la edición durante el reintento y el caso fallaba también con el código nuevo; lo detecté al comparar, lo corregí y entonces U2 distingue de verdad las dos versiones.

# 5. Pruebas realmente ejecutadas (por entorno)
**Pasada completa final** (`bash tests/run-all.sh`, commit `5de75d8`, árbol limpio): **960 comprobaciones correctas, 0 fallos, código 0** (48 baterías con resultado + `demotest`), **locales del autor**; logs íntegros de cada batería y de `demotest` en `ronda23/logs/`; sin `CIERRE FORZADO` ni `CIERRE ANÓMALO`. *Aserciones ≠ entradas.*
- **Nuevo:** `testU` **24** (formulario real en el navegador a 1440/390/320 px). **Afectadas y en verde:** `testT` 27, `testS` 30, `testQ` 25, `testO` 19, `unit-cliente-revision22` 8, `unit-cuaderno21` 20, `unit-registro21` 10, `unit-migracion` 15, `unit-nota` 35, `testDemo22` 12 y las anteriores.
- **Repeticiones** de `testE`, `testF` y `testC` con latencia 0 y 300 ms (`ronda23/intermitentes.txt`): **12/12 con código 0**.
- **Contraste con la ronda 22:** `testU` contra `lab.js`/`app.js` de `b7ae443` → **6 correctas, 18 fallos** (`evidencia-testU-con-R22.txt`).
- **Entorno remoto:** nada ejecutado. Sin comprobar: lo de §8. La inspección visual de las capturas es mía.

# 6. Decisiones cerradas de la revisión (apartado 4) y límites del encargo
Se conservan sin tocar: tipografía, espaciados y radios; Cuaderno con una tarjeta por escenario y «Para revisar» primero; «Registrar revisión» como acción principal donde toca; estados vacíos útiles; confirmaciones precisas; fechas con texto («hoy», fecha pasada; «en tres días» puede esperar); accesibilidad (foco visible, texto de estado, reducción de movimiento; **no se certifica** contraste, lector de pantalla ni zonas de toque reales); comparación con las dos barras; distinción cuenta/demo/borrador local; serif en títulos, sans en la interfaz, nota global secundaria, fondo oscuro cálido y naranja. **No se añade** radial protagonista, gamificación, calendario, modo claro, histórico, benchmark ni exportación gráfica.

# 7. Pequeños ajustes de evidencia y honestidad
- La captura del Cuaderno con el filtro «Archivados» ya no arrastra el aviso de la acción anterior (el test espera a que desaparezca).
- **Corrección editorial:** el informe de la ronda 22 hablaba de «tres tandas» y enumeraba cuatro resultados (12/12, 11/12, 0/12 y 12/12); son **cuatro**.
- **Diff de las pruebas antiguas adaptadas en la ronda 22** (`DIFF-pruebas-antiguas-R21-a-R22.patch`, solo `tests/ronda5` y `tests/ronda13`–`18`, **6 archivos, +38/−27**: `testB`, `testL`, `testN`, `testO`, `testP`, `testQ`): se adjunta para que se contraste; **sigo sin certificar «sin rebajar aserciones»**.
- El calentamiento del servidor es una **mitigación; la causa de la primera carga lenta no está demostrada** (mismo síntoma que el `testP` único de la ronda 21, sin cerrar).

# 8. Sin comprobar
Navegador interactivo en dispositivo físico, lector de pantalla, zoom real, Safari/Firefox, correo real, D1 remota, **M102 con una caducidad real**, dos clientes reales simultáneos con la misma clave (K9: el servidor garantiza una inserción y ningún 500; un cliente puede recibir un 409 y lo trata como conflicto con el texto conservado), el piloto con personas y el regreso real al día siguiente.
