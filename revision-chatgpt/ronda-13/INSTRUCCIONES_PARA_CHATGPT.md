# Ronda 13 · primer recorrido completo de cartera, descubrimiento, simulación y seguimiento (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda13-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-13/`) y las **16 imágenes** de `imagenes-ronda13-chatgpt.zip` a **la misma conversación** (si admite pocas por mensaje, en dos tandas: 01–08 y 09–16). Esta ronda añade funciones nuevas, así que **no hay parejas antes/después**: las imágenes son del recorrido (los nombres llevan número, pantalla y ancho en píxeles). Para comparar con el estado anterior tienes las capturas de la ronda 12 en `ronda12/capturas/`.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–12 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). En esta ronda el usuario **actualizó la dirección del producto**: *«Entiende lo que tienes, descubre alternativas y compara tus opciones antes de invertir»*, con cuatro pilares conectados (Mi cartera, Mi radar, Mi laboratorio, Mi seguimiento) y un recorrido concreto: *abrir una cartera → comprender su concentración → explorar una empresa → guardarla en el radar → simular su incorporación → comparar antes/después → guardar el escenario y una nota*. Quiero saber si el recorrido es honesto, útil y está bien construido.

## Qué se afirma
1. **Radiografía** (imágenes 01–02): en el editor, con conclusión primero: mayor posición, tres mayores (o las que haya), sin asignar/exceso, cobertura; **límite personal opcional** («Esta posición supera el límite del 20 % que has definido»), sin umbral impuesto; distingue **versión guardada / cambios locales**; una cartera incompleta se analiza tal cual (no se reescala); la categoría de un ETF se rotula como comercial; no se deduce país/divisa ni se calculan solapamientos; sin puntuaciones.
2. **Radar** (03–06, 15–16): guardar/quitar desde la ficha, **nota privada**, «ya figura directamente en la cartera elegida» (sin mirar dentro de los fondos), marca «★ En tu radar», filtros explícitos en Explorar (sector, comprobación + resultado, «solo mi radar») **sin ranking nuevo**, conservados junto con la búsqueda, y paso al laboratorio con cartera y activo elegidos.
3. **Laboratorio** (07–09, 14): base = versión **guardada**; activo y peso; financiación «usar lo sin asignar» o «reducir proporcionalmente»; el método se explica **antes** de calcular; resultado con pesos antes/después/cambio, concentración, categorías, límites afectados y pasos; inviable con motivo, sin pesos negativos. Ejemplo verificable: A 60 / B 40 + C 10 proporcional → **A 54, B 36, C 10**. Rotulado «Simulación»; no ejecuta nada ni toca la cartera ni su versión pública.
4. **Seguimiento** (05–06, 10–13): radar con notas y escenarios con fecha, cartera y **revisión de origen**, **copia de la base**, propuesta, método, nota y estado (en estudio / descartado / archivado). Si la cartera cambia, el escenario conserva su base y avisa de la versión posterior; **no se recalcula**.
5. **Cálculos** (`public/js/calculos.js`, documentados en `ronda13/CALCULOS.md`): módulo puro en décimas enteras, reparto del redondeo por mayor resto (empate por símbolo), usado por la interfaz, **por el servidor (que recalcula y rechaza una propuesta distinta)** y por las pruebas (2000 casos al azar con totales, mínimo 0,1 % y determinismo).
6. **Servidor y datos** (migración aditiva 0008): `radar` (PK usuario+ticker), `escenarios` (estados y método con CHECK, `clave` por intento con UNIQUE para reintentos sin duplicados, revisión propia para nombre/nota/estado), `portafolios.limite_peso` (endpoint propio sin subir la revisión), `datos_meta`. **Propiedad comprobada en cada consulta** (`WHERE usuario_id = ?`); otro usuario recibe 404; sin sesión, 401.
7. **Visitantes:** exploración y simulación temporales y rotuladas; radar solo en este dispositivo (migrado a la cuenta al iniciar sesión); los escenarios requieren cuenta; nunca se muestra «guardado en tu cuenta» sin persistencia real.
8. **Datos y confianza** (`ronda13/DATOS.md`): la interfaz solo habla de la SEC si el cargador real declara `origen = sec`; con datos de prueba dice «Datos de PRUEBA ficticios» (la demo, «DEMOSTRACIÓN inventados»); se han retirado «cifras de la SEC», «se cargan desde la SEC cada noche» y la atribución de `legal.html`. **La carga real de la SEC nunca se ha ejecutado** (faltan accesos).
9. **Resultado:** `bash tests/run-all.sh` completo (servidor limpio entre baterías) sobre el commit `fde8fee66c1d6b295042f5dccedef6f1843f6334`: **467 comprobaciones correctas, 0 fallos, código de salida 0** (nuevas: 23 de cálculos, 30 de servidor, 75 del recorrido `testK` en 320/390/1440). **No** se repitió en un clon nuevo ni `test-ejecutor.sh`; tú no has repetido la batería. **Un intento previo falló por tiempo** (`testE` agotó 900 s; en solitario tarda 22 s y pasó; las dos pasadas siguientes pasaron; causa no identificada): `ronda13/resultado-ejecucion-intento1-testE-agotado.txt`.
10. **Pruebas antiguas adaptadas por el rediseño** (no rebajadas, dime si alguna lo hace): `testB` (menú móvil con 4 enlaces; la ficha declara «PRUEBA ficticios» en lugar de «Fuente: informes anuales… SEC») y `unit-migracion` (M1b y M6, migración 0008). `testH` H4 sigue exigiendo ≤ 2 desplegables en el resumen.
11. **Editorial:** solo diseño (`ronda13/EDITORIAL.md`): Bajo el radar, ¿Qué está pasando?, El Superespeculador, Seguimos la pista; fuente, fecha, responsable, hechos vs interpretación, historial de tesis; nada generado automáticamente. Plan por fases: `ronda13/PLAN-POR-FASES.md`.
12. **Validación remota: bloqueada** (sin credenciales de Cloudflare ni de Brevo; no se piden secretos por el chat): `ronda10/BLOQUEOS.md`.

## Imágenes (16)
- 01-R1-radiografia-local-1440.png
- 02-R1-radiografia-local-390.png
- 03-R2-ficha-radar-1440.png
- 04-R2-ficha-radar-390.png
- 05-R3-seguimiento-radar-1440.png
- 06-R3-seguimiento-radar-390.png
- 07-R4-laboratorio-resultado-1440.png
- 08-R4-laboratorio-resultado-390.png
- 09-R4-laboratorio-resultado-320.png
- 10-R5-escenario-guardado-1440.png
- 11-R5-escenario-guardado-390.png
- 12-R6-seguimiento-escenarios-1440.png
- 13-R6-seguimiento-escenarios-390.png
- 14-R7-laboratorio-ampliado-320.png
- 15-R8-explorar-filtros-1440.png
- 16-R8-explorar-filtros-390.png

## Qué quiero que evalúes
### Producto y recorrido (con las imágenes)
1. **Propuesta de valor:** ¿el recorrido la cumple de verdad para un principiante y para quien investiga? ¿Las explicaciones progresivas (conclusión → método → detalle) funcionan? ¿Qué sobra o falta para que no sea una «colección de funciones»?
2. **Honestidad del análisis:** ¿la radiografía y el laboratorio evitan sugerir riesgo, recomendación o exposición real que no se mide? ¿Algún texto o cifra puede inducir a error (p. ej. «tres mayores», categorías de ETF, «ya figura directamente»)?
3. **Laboratorio (07–09, 14):** ¿se entiende el método antes del resultado? ¿La tabla antes/después y la comparación son legibles en móvil? ¿«Simulación» es inequívoco? ¿Qué falta para confiar en el resultado?
4. **Seguimiento (05–06, 10–13):** ¿da una razón concreta para volver? ¿El aviso de versión posterior y el estado del escenario se entienden?
5. **Radar y Explorar (03–04, 15–16):** ¿los filtros son explícitos y evitan parecer un ranking de «mejores inversiones»? ¿La nota y el paso al laboratorio son naturales?
6. **Visitantes:** ¿queda claro qué se guarda y qué no? ¿El texto sobre «solo en este dispositivo» y sobre guardar escenarios es suficiente?
7. **Regresiones y coherencia visual** con las rondas 11–12; menú con cuatro entradas; texto ampliado a 320 px (**simulado**, imagen 14).

### Técnico (con el código)
8. **Cálculos** (`public/js/calculos.js`): corrección del reparto por mayor resto, casos límite (base con exceso, delta ≤ 0, 0,1 %, activo ya existente), semántica de «proporcional» con base incompleta (¿es la esperada por el usuario?), y que el servidor reutilice el mismo módulo.
9. **API y seguridad:** `functions/api/{radar,escenarios}/*`, `portfolios/[id]/limite.js`, `datos.js`: propiedad en cada consulta, 404 frente a 403, límites de tamaño (200 radar, 100 escenarios, notas), idempotencia por `clave`, carrera entre dos reintentos, revisión de escenarios, escritura del límite sin revisión, GET de lista que lee posiciones (ronda 12). ¿Algún IDOR o fuga posible? ¿La importación de `public/js/calculos.js` desde `functions/` es razonable?
10. **Modelo de datos:** migración 0008 (CHECKs, UNIQUE, ausencia de FK a `cartera_id`), y su prueba sobre una base antigua con datos; ¿qué falta antes de una D1 real?
11. **Pruebas:** `unit-calculos`, `unit-r13` y `testK`: ¿alguna comprobación puede pasar en vacío o medir lo equivocado (tablas leídas por texto, `aria-live`, foco, dos usuarios, «sin tocar la cartera», texto ampliado simulado)? ¿Falta algo (p. ej. conflicto de nota en dos pestañas, 200 radar, 100 escenarios, borrado de cartera con escenarios)? ¿El fallo intermitente de `testE` apunta a un problema real?
12. **Estructura y CSS:** extracción a `public/js/*` y `style-r13.css`; contexto inyectado desde `app.js`; la demo concatena módulos sin `import/export`. ¿Deuda aceptable? ¿Qué limpiarías antes de la siguiente ronda?
13. **Accesibilidad:** tablas con `th scope`, resultados en `aria-live`, foco tras guardar/quitar, botones de modo con `aria-pressed`, `<details>`, `confirm` nativo al descartar.
14. **Honestidad del informe (`ronda13/LEEME.md`, `DATOS.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado ejecutado / simulado / bloqueado / pendiente? ¿La auditoría de datos es suficiente?
15. Todo lo que debería probar yo a mano (`ronda13/pruebas-manuales.md`, M41–M49, más M1–M40 anteriores).

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo se probó en **Chromium** con servidor local (D1 simulada con Miniflare) y SQLite real; **nada en Cloudflare D1 remoto**, **ningún correo real**, **ningún Safari, Firefox, dispositivo físico ni lector de pantalla**. El texto ampliado es **simulado**. No se revisó el tema oscuro de las pantallas nuevas.
- **Los datos de las capturas y las pruebas son inventados**: no acreditan calidad ni actualización de datos financieros.
- El laboratorio parte siempre de la versión guardada; el visitante no guarda escenarios; no hay comparación entre dos escenarios ni «rehacer con la versión nueva»; la nota del radar es «última escritura gana»; el límite personal exige cartera guardada.
- Los ETF y sus composiciones internas, países, divisas y solapamientos **no están implementados** (a propósito).

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en producto, claridad, confianza, móvil, solidez técnica y honestidad, **comparadas con tu valoración anterior**.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían el recorrido**, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar** con imágenes fijas y lectura de código.

*Fuera de alcance (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión, monetización (futuro plan de pago).
