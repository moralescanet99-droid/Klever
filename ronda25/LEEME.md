# Evolución 25 · integración en una rama aparte (`evolucion-25`)

Parte de `Klever_Evolucion_25.zip` (evolución visual propuesta sobre R24, con `CAMBIOS-R25.patch`). **No sustituye el piloto**: la rama `ccr-b652a7eb-uukhdy` y la versión `piloto-r23` no se han tocado; esta rama sale del commit `65013cb` (R24).

## Qué se ha hecho (implementado / probado / pendiente)
| Punto del encargo | Estado |
|---|---|
| 1. Integrar el patch en una rama de evolución, piloto disponible | **Hecho**: el patch se aplica limpio (6 archivos) en la rama `evolucion-25`; el piloto sigue en la otra rama. |
| 2. Batería completa con servidor real; adaptar solo expectativas de interfaz | **Hecho**: `bash tests/run-all.sh` sobre el commit `66a3f0c`, árbol limpio: **961 comprobaciones correctas, 0 fallos, código 0** (48 baterías con resultado + `demotest`), ejecución **local del autor**; logs íntegros en `ronda25/logs/`. |
| 3. Teléfono real, estados sin datos, pesos incompletos, ETF | **No hecho**. Solo viewports de Chromium (1440/390/320). Los tests existentes de ETF/datos ausentes/pesos incompletos siguen en verde, pero no se ha mirado el aspecto visual de esos casos. |
| 4. Cinco usuarios del público objetivo | **No hecho.** |
| 5. Cerrar la evolución | **No se cierra**: faltan 3 y 4. |

## La primera pasada falló (25 problemas): qué era cada cosa
**Regresiones reales de la evolución, corregidas en código (desviaciones respecto al patch):**
1. «Ver qué cambiaría →» (`#vz-probar`) pasó a botón naranja y rompía la regla aprobada de **una sola acción dominante** (`testI`, `testP`, `testQ`) → vuelve a `btn-secundario`.
2. A 320 px el resultado de la revisión quedaba **bajo la barra fija** (rectángulo 531–727 px frente a la barra en 708; `testQ` Q3, `testR` R1) porque el resumen visual empujaba el contenido → ajuste de espaciados y tamaños solo en ≤ 479 px (CSS al final de `style-r17.css`).
3. La portada decía «compara tus opciones **antes de invertir**» → «**antes de decidir**» (la promesa aprobada; el producto no opera ni recomienda).
4. El texto de la portada perdía «sin dinero real» y «datos de prueba» (exigidos por `testB`/`testS`) → restituidos: «Crea una cartera simulada (sin dinero real, con datos de prueba), …».
5. El banner de la demo perdía «sin persistencia de cuenta» → añadido dentro del desplegable.
**Cambios de interfaz intencionados: se adaptaron las pruebas (sin tocar invariantes de negocio):**
- Portada (`testB`, `testN` N2, `testS` S1): nuevo titular y «Explorar un ejemplo →»; la vista previa abreviada (3 posiciones) se **sustituye** por pruebas del ejemplo interactivo (JNJ 10 % → KO 54/PG 36; JNJ 40 % → KO 36/PG 24; visible y sin desbordar también en 390 px; antes se exigía oculta en móvil).
- La tabla de comparación del laboratorio, la concentración (`#radio`) y el banner de la demo ahora son **desplegables**: las pruebas los abren antes de interactuar (`testK`, `testL`, `testN`, `testO`, `testS`, `demotest`).
- `testO` O4: «Quién cede el peso» pasa de una frase a tarjetas de cambio (KO 60→54, PG 40→36) y va **después** de las barras.
- **Una expectativa SÍ se relaja y se declara:** `testH` H4 permitía ≤ 2 desplegables en la vista del resumen; ahora ≤ 3 (la concentración pasó a desplegable). Decisión de diseño de la evolución que conviene que el revisor confirme.
**Falsos positivos míos:** `test-zip` falló porque había versionado por error el enlace `node_modules` del entorno de pruebas; retirado.
**Incidencia observada:** en una pasada parcial, `testB` falló 12 comprobaciones seguidas (móvil/empresas) y al repetirlo solo dio 54/0; es el síntoma ya conocido de la primera carga lenta tras arrancar el servidor (causa no demostrada). La pasada final no lo reprodujo.

## Sin comprobar
Dispositivo físico, teclado virtual, orientación, Safari/Firefox, lector de pantalla, contraste, zoom real, D1 remota, correo real, piloto con personas. **No he hecho una revisión visual de capturas de la evolución**; las pruebas comprueban geometría, foco y textos, no si el diseño «se ve bien». La comprensión en diez segundos y el retorno semanal siguen siendo hipótesis, no resultados.

## Cómo repetirlo
`git checkout evolucion-25`, `npm ci`, `bash tests/run-all.sh` (RONDA=ronda25). `git diff 65013cb evolucion-25 -- public scripts` muestra los cambios del producto.
