# Ronda 21 · de las correcciones al producto: construir → entender → probar un cambio → guardar una pregunta → volver a revisarla (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda21-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-21/`) y las **13 imágenes** de `imagenes-ronda21-chatgpt.zip` a **la misma conversación** (00 = maqueta aprobada; 01–02 portada con las tres entradas; 03 «Crear desde cero» en móvil; 04 ejemplo sin nota global; 05–06 «Tu cartera de un vistazo»; 07–08 comparación; 09 ficha del Cuaderno con «qué me haría cambiar de opinión»; 10–11 «Para revisar»; 12 revisión registrada). Todas son **capturas de viewport**, hechas por la batería `testS` sin preparar nada a mano; las del recorrido son de un servidor local con persistencia real.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–20 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 20 **aceptó el cierre visual**, dejó **abierto el cierre técnico por un único defecto** (`registro()` de las pruebas de módulo borraba un código de salida previo) y **autorizó el alcance de producto**: el recorrido *crear → entender → probar un cambio → guardar una pregunta → volver a revisarla*. Esta ronda hace ambas cosas. Identidad visual conservada; datos **inventados**; no se publica, no hay cobros ni integraciones ni correos.

## Qué se afirma
1. **Paso 0** (`tests/lib/d1-sqlite.mjs`, `registro()`): ya no hay `process.exit(0)`. Fallo → 1; un código previo ≠ 0 **se conserva**; un recurso que mantiene vivo el proceso 10 s → `CIERRE FORZADO` y código 3. `unit-registro21` (10) lo verifica en **subprocesos reales** (éxito, aserción fallida, error previo con aserciones aprobadas —tu caso exacto: 2 → 2—, error previo **más** fallo, recurso abierto) y comprueba que `run-all.sh` rechaza cada caso. La garantía se **acota** a `registro()` y `h.cjs`, no a un `process.exit(0)` arbitrario. Enlace de M89 corregido.
2. **Entradas** (imágenes 01–04): promesa y «sin dinero real / datos de prueba» desde la primera pantalla; **tres entradas al mismo editor**: desde cero (vacía), ejemplo editable **rotulado «Ejemplo simulado»** y recrear a mano («no se conecta a ningún banco ni bróker»; un activo inexistente **no se sustituye**). `portafolios.origen` (migración 0012) evita confundir ejemplos con carteras personales. El aviso de origen es una línea con «Más»; en móvil va tras las posiciones. La portada de quien vuelve avisa «Tienes N ideas para revisar» solo si puede leerlo.
3. **Entender antes de puntuar** (05–06 y 04): la revisión empieza por **«Tu cartera de un vistazo»** (con los mismos datos de la radiografía; no hay una segunda implementación de las métricas), después qué se pudo analizar y qué queda sin evaluar, y la nota de estructura como indicador; siguiente paso **«Probar un cambio»**.
4. **Comparar sin tocar la base** (07–08): «Cartera base» / «Alternativa simulada», quién cede el peso, frase que **no dice que sea mejor**; **guardar la comparación no aplica el cambio** (`testS` S6: la cartera conserva posiciones **y revisión**; `unit-cuaderno21` K16/K17: si la cartera cambia o se borra, la comparación se conserva y se avisa, no se recalcula).
5. **Cuaderno** (09–12): «Guardar en mi Cuaderno» con *qué quiero averiguar*, *por qué lo estudio*, ***qué me haría cambiar de opinión*** (**columna nueva `invalidacion`**, 600) y *cuándo revisarlo*; «Para revisar / Próximas revisiones / Sin fecha» (día en la zona de la persona); **«Registrar revisión»** (tabla nueva `revisiones_escenario`): se **añade** al historial, no sustituye la hipótesis, **atómica** (inserta y actualiza estado/fecha en un lote), **idempotente** por clave y con **conflicto de revisión** (409). `unit-cuaderno21` (20).
6. **Revista** (no hay imagen): «Explorar esta idea en una simulación», «Qué no sabemos», fecha prevista de revisión de la opinión y «Volver a la lectura»; si un contenido no trata de una posición concreta, no se fuerza una empresa. Plantilla editorial en `ronda21/PLANTILLA-EDITORIAL.md`.

## Resultado e incidencias
7. `bash tests/run-all.sh` completo sobre el commit `0e9bc0a` con el árbol limpio: **888 comprobaciones correctas, 0 fallos, código 0** (44 baterías + demo), **locales del autor**, sin `CIERRE FORZADO`/`ANÓMALO`; repeticiones de `testE`, `testF` y `testC` con latencia 0 y 300 ms: **12/12**. Entornos: módulo/servidor sobre SQLite real, subprocesos de Node y Chromium con servidor local; **remoto: nada**. *Aserciones ≠ entradas.* Logs íntegros de cada batería **y de `demotest`** en `ronda21/logs/`.
8. **Una regresión real que introduje y la pasada completa detectó:** al añadir la columna `portafolios.origen`, el `ORDER BY (origen = 'ejemplo')` de las carteras públicas ordenaba por la **columna** y no por el alias; los ejemplos de Klever dejaron de ir primero (`testC`). Corregido; `unit-cuaderno21` K20 **falla sin la corrección y pasa con ella**.
9. **Otras pasadas fallidas conservadas** (`logs-pasada1-fallos/`, `logs-pasada2-fallo-P/`): aviso de origen que empujaba los controles fuera del primer viewport a 320 px (`testQ` Q1-320; corregido); textos de la portada comprobados literalmente en `testB`/`testN`/`testP` (actualizados al nuevo copy comprobando lo mismo; **dime si alguna rebaja la exigencia**); `testK` (`page.goto` abortado): causa con **fuerte indicio, no demostración directa** (cerrar la ficha con Escape ejecuta `history.back()`, asíncrono; la prueba espera ahora); `testP` sin resultado una vez: **no reproducido**, causa sin demostrar.
10. **Migración 0012** (`ronda21/MIGRACION.md`): aditiva; `unit-migracion` M1f la aplica con escenarios y carteras previos, sin cambiar ninguna fila y con tablas idénticas a `schema.sql`. **No** probada en una D1 remota.

## Limitaciones y lo que NO se afirma
- **Prueba con cinco principiantes: NO realizada** (`ronda21/PRUEBA-CON-USUARIOS.md`, todo «pendiente»). «Cerrar y volver al día siguiente» no se ha probado un día después ni en D1 remota: se prueba cerrar sesión y volver con la misma cuenta contra SQLite local.
- **No probado:** móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, correo real, datos reales. La inspección visual de las capturas es mía.
- **Demo:** soporta las revisiones en memoria (`mock.js`); `demotest` y `paridad-demo` pasan, pero **no probé registrar una revisión en la demo** y pierde sus datos al recargar.
- `plantilla` queda como valor técnico heredado en carteras vacías o manuales (el CHECK impide un cuarto valor sin reconstruir la tabla).
- Estados «guardando» y «error» de guardado, ideas generales sin escenario y la medición «antes» de la portada con el criterio actual: no abordados a fondo.
- **Datos inventados**; la nota solo existe con el conjunto sintético; nada es una recomendación ni una previsión.

## Casos que te pido repetir (tú, no yo)
Sin navegador (Node ≥ 22.13, tras `npm ci`): `node tests/ronda21/unit-cuaderno21.mjs`, `node tests/ronda21/unit-registro21.mjs` (lanza subprocesos y un `run-all.sh` mínimo), `node tests/ronda8/unit-migracion.mjs`, `node tests/ronda20/unit-causas20.mjs`, `node tests/ronda15/unit-nota.mjs`. Tu ejemplo literal del Paso 0: `node --input-type=module -e "import {registro} from './tests/lib/d1-sqlite.mjs'; process.exitCode=2; const r=registro('x.json'); r.t('x','x','x','x',true); await r.fin();"; echo $?` (debe imprimir 2). Con navegador: `npx playwright install chromium`, `bash scripts/local/servidor.sh start` y `RONDA=ronda21 node tests/ronda21/testS.cjs` (recorrido completo con cuenta; usa el enlace de acceso que muestra el servidor local de pruebas).

## Qué quiero que evalúes
### Corrección técnica residual (aceptar o rechazar su CIERRE)
1. **Paso 0:** ¿`registro()` y el ejecutor garantizan que un fallo o un error previo nunca terminen en 0 dentro del alcance declarado? ¿Algún camino de módulo escapa?
2. **Regresiones:** ¿la corrección del `ORDER BY` y su prueba K20 bastan? ¿Hay otros usos del nombre `origen` o consultas que mezclen alias y columna?
### Producto (aceptar o rechazar el recorrido, con lo que falte)
3. **Datos:** `revisiones_escenario` y `invalidacion`: ¿propiedad, límites, atomicidad, idempotencia, concurrencia, cascada, escape al mostrar y comparación de fechas como día son correctos? ¿Qué pasa si falla a medias el lote? ¿Algún dato personal o ajeno se filtra?
4. **Honestidad:** ¿se distingue siempre simulación, dato aportado y dato verificado? ¿«Guardar la comparación no aplica el cambio» es inequívoco? ¿El texto de «Tu cartera de un vistazo» cae en recomendación o en sugerir que una cartera es buena o mala? ¿La entrada «Recrear mi cartera» da impresión de conexión bancaria o de asesoramiento?
5. **Recorrido** (01–12): ¿una persona sin ayuda llega de la portada a la comparación y al Cuaderno? ¿Una sola acción principal por momento? ¿Qué se pierde al pedir acceso durante el guardado?
6. **Honestidad del informe** (`ronda21/LEEME.md`, `ANTES-Y-DESPUES.md`): ¿alguna afirmación que las pruebas no respalden? ¿Se separan implementado, verificado, no verificado y futuro?
7. **Prueba de uso** (`ronda21/PRUEBA-CON-USUARIOS.md`): ¿el protocolo permite decidir qué reparar? ¿Qué cambiarías antes de empezar?
8. Lo que debería probar yo a mano (`ronda21/pruebas-manuales.md`, M94–M100).

## Formato de respuesta
- **Veredicto de 3 líneas** y **dos decisiones separadas: aceptar/rechazar el cierre técnico y aceptar/rechazar el recorrido de producto** (con lo que falte), con notas del 1 al 10 en confianza/privacidad, procedencia de datos, claridad del recorrido móvil, honestidad del contenido, solidez técnica y calidad de las pruebas, **comparadas con tu revisión de la ronda 20 (7/8/8,5/8/8/8)**.
- **Qué casos has repetido y con qué resultado**, y cuáles no.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- Si el recorrido queda listo para la prueba con personas, dilo y señala qué **no** conviene medir todavía; si no, **solo** lo que lo impide.
- Lista final de **lo que no has podido comprobar**.

*Fuera de alcance:* cobros, Revolut/Trade Republic, datos de mercado reales, noticias automáticas, correos o notificaciones, artículo o tip diario personalizado, recomendaciones de compra/venta y publicación pública; no enviar comunicaciones ni publicar.
