# Ronda 7 · revisión TÉCNICA del guardado y de la entrega reproducible (para pegar en ChatGPT)

Sube el zip `klever-ronda7-tecnico.zip` a **la misma conversación** (contiene el proyecto completo en el commit indicado más este texto en la raíz) y pega el texto de abajo. Si no puede abrir zips, sube por separado estos archivos, que son los que importan: `functions/api/portfolios/[id].js`, `functions/api/portfolios/index.js`, `migrations/0007_revision.sql`, `schema.sql`, `public/app.js` (busca `guardar`, `resolverConflictoGuardado`, `recuperarCambiosLocales`, `dialogoConflicto`), `tests/ronda7/unit-servidor.mjs`, `tests/ronda7/testF.cjs`, `tests/run-all.sh`, `ronda7/LEEME.md` y `ronda7/resultado-ejecucion.txt`.

---

Actúa como revisor técnico senior (backend, concurrencia, SQLite/Cloudflare D1, pruebas end-to-end y entregas reproducibles). Ya revisaste el aspecto visual de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript sin dependencias en el cliente). En la ronda 7 se te pidió, y se hizo, priorizar la **fiabilidad del guardado** y una **entrega reproducible**. Quiero que intentes **romper** lo que afirmo.

## Qué se afirma (verifícalo en el código, no me creas)
1. **Guardado en una sola operación todo-o-nada.** `PUT /api/portfolios/:id` guarda posiciones, nombre y tesis en un único `env.DB.batch()`. Antes eran `PUT` + `PATCH` y, con el `PATCH` fallido, las posiciones nuevas quedaban guardadas y **publicadas** con nombre y tesis antiguos (confirmado en el servidor local antes de corregir: `ronda7/antes-defectos.txt`).
2. **Control de versión atómico con una revisión entera**, no con una fecha de un segundo (antes dos `PUT` seguidos con la misma versión devolvían 200 y 200). El primer sentencia del lote es `UPDATE … SET revision = revision + 1, token_escritura = ? … WHERE id = ? AND revision = ?`; el `DELETE` y los `INSERT` de posiciones solo actúan si `token_escritura` es el de esa misma escritura; si `meta.changes !== 1` se responde 409 y no se ha tocado nada. `PATCH` (publicar/despublicar) y `POST` siguen el mismo patrón.
3. **Conflicto coherente en el cliente:** elegir «Conservar la de este dispositivo» vuelve al editor **sin escribir** en la cuenta; hay que pulsar Guardar. Escape y «Decidir después» no eligen ni descartan nada.
4. **Entrega reproducible:** `npm ci` + `npx playwright install chromium` + `bash tests/run-all.sh` desde un clon limpio. El resultado entregado (`ronda7/resultado-ejecucion.txt`) se obtuvo así en el commit `3c3c861`: A 31, B 51, C 50, D 29, E 15, F 9, U 11 y demo OK.

## Qué quiero que revises, por orden
1. **Atomicidad real.** ¿Es `D1.batch()` realmente una transacción en Cloudflare D1 (no solo en Miniflare)? ¿Hay alguna forma de que el `UPDATE` gane y el `DELETE`/`INSERT` condicionado por `token_escritura` falle o se ejecute a medias? ¿Qué pasa con las claves foráneas y los tickers desconocidos dentro del lote? ¿Hay una ventana entre la lectura de `owned()` y el lote que deje pasar una validación obsoleta (por ejemplo, validar contra `publico` ya cambiado)?
2. **Revisión y token.** ¿Se puede colar una escritura con revisión equivocada? ¿Es correcto leer la fila por `token_escritura` tras el lote? ¿Colisiones, reutilización, desbordes? ¿Algún camino que escriba en `portafolios` sin subir la revisión (por ejemplo el `DELETE`)?
3. **Migración 0007** (`ALTER TABLE … ADD COLUMN … NOT NULL DEFAULT 0`) sobre una D1 con datos: riesgos, orden respecto a `schema.sql`, y el efecto de que los clientes antiguos (sin `revision`) reciban 400.
4. **Cliente** (`public/app.js`): `guardar()`, `resolverConflictoGuardado()`, `recuperarCambiosLocales()`, `cambiarPublicacion()`, copia local en `localStorage`. ¿Estados que dejen `saving` atascado, doble envío, copia local desfasada, falsos conflictos, o pérdida de datos? ¿Qué pasa si se edita mientras se guarda?
5. **Las pruebas.** ¿Prueban lo que dicen? En concreto: (a) `tests/ronda7/unit-servidor.mjs` usa SQLite real (`node:sqlite`) con un adaptador mínimo de D1 e **inyecta una escritura ajena entre la lectura y el guardado** de forma determinista; la prueba falla si se quita la condición `AND revision = ?` del `UPDATE` (mutación comprobada a mano). ¿Es una simulación fiel o hay trampas? (b) `tests/ronda7/testF.cjs` (Playwright contra el servidor local). ¿Aserciones débiles, esperas arbitrarias, comprobaciones que no pueden fallar? (c) La prueba de **visibilidad E16a** se corrigió porque antes daba por buena una posición con el borde inferior en −1979 px: ¿la nueva (G6) es suficiente?
6. **Reproducibilidad.** ¿Falta algo para repetirlo desde cero (versiones, rutas absolutas, dependencias implícitas, estado compartido entre baterías, orden de ejecución)? ¿Algún secreto o dato personal en el proyecto?
7. **Honestidad del informe** (`ronda7/LEEME.md`): ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado lo confirmado en el servidor real de lo observado solo en la demo y lo automático de lo manual?

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- **Nada se ha ejecutado contra Cloudflare D1 real**: solo D1 local simulada (Miniflare, `wrangler@3.114.17`) y SQLite real. La carrera entre dos guardados **no se reprodujo** en el servidor local (las peticiones simultáneas dieron 200 + 409); por eso existe la prueba con escritura intercalada.
- Los datos son **inventados**; el email, la SEC y TradingView no se usan en las pruebas.
- **Ninguna prueba manual real se ha ejecutado** (`ronda7/pruebas-manuales.md`, M1–M21): móviles reales, Safari, Firefox, lector de pantalla, zoom real, teclado móvil real, dos dispositivos reales, D1 real y migración 0007 con datos.
- La «ampliación al 200 %» de las pruebas es tamaño de texto simulado, no zoom del navegador.
- La demo HTML (`demo/index.html`) es una **demostración en memoria, sin persistencia**, y no equivale al servidor probado.

## Formato de respuesta
- **Veredicto de 3 líneas**: ¿es fiable el guardado tal como está? ¿es reproducible la entrega?
- **Defectos ordenados por gravedad** (crítico / importante / menor): para cada uno, archivo y línea, escenario concreto que lo dispara, por qué ocurre y arreglo concreto (código o prueba).
- **Pruebas que añadirías** (las 5 más valiosas) y **afirmaciones del informe que rebajarías**.
- Una lista final de **lo que no has podido comprobar leyendo el código** y cómo lo comprobaría yo.

*Fuera de alcance (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión (futuro plan de pago), y cualquier rediseño visual.
