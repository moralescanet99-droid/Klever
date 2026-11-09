# 06 · Experimento: votación «3 de 4» en tiempo real con Durable Objects

**Fecha:** 9 nov 2026 · **Dónde:** scratchpad de la sesión (`…/scratchpad/do-votacion/`), **no en el repositorio** · **Coste:** 0 €.

## Resumen
- **Funciona (comprobado en local):** un Worker con un Durable Object por equipo (SQLite + WebSockets con hibernación) gestiona propuesta, votos, recuento en directo, aprobación con 3 «sí», rechazo anticipado con 2 «no», caducidad por alarma, voto doble, quinto miembro, reconexión e hibernación. Latencia de una votación completa en local: **mediana 6,3 ms, p90 9,6 ms**.
- **Por votación (4 miembros):** **4–5 mensajes entrantes**, **12–20 salientes** (gratis), **≈ 22 filas leídas y 11–13 escritas**, más **1 conexión WebSocket por persona que abre la pantalla**.
- **1.000 equipos × 3 votaciones/semana caben en el plan gratuito** con holgura en un día medio (≤ 6 % de cualquier límite) y también en el peor día razonable (todas las votaciones el mismo día): **el límite más justo son las filas escritas (39 %)**; en un escenario pesimista (cada persona se reconecta 5 veces) las peticiones llegan al **60–64 %**. **Sin hibernación o con sondeo HTTP no cabría** (×7 a ×18 del límite).

## 1 · Qué se montó (comprobado)
- `wrangler@3.114.17` instalado con `npm i --ignore-scripts wrangler@3` en el scratchpad (instalación correcta, sin bloqueo). `wrangler dev` con Miniflare/workerd, estado en `--persist-to .estado`.
- `wrangler.toml`: un enlace `EQUIPO` → clase `Equipo`, migración `new_sqlite_classes` (el plan gratuito solo admite DO con SQLite).
- **Worker:** `GET /equipo/<id>/ws?jugador=<apodo>` → `idFromName(<id>)` → el DO del equipo.
- **Durable Object `Equipo`:**
  - Tablas `miembros` (máx. 4), `votaciones` (estado: abierta / aprobada / rechazada / caducada, plazo) y `votos` (clave `votacion + jugador`, un voto por persona).
  - `ctx.acceptWebSocket()` (API de hibernación, nunca `ws.accept()`), `serializeAttachment` para saber quién es cada conexión tras despertar, `setWebSocketAutoResponse("ping","pong")` para que el ping no despierte al objeto.
  - Mensajes: `proponer` → difunde `votacion`; `votar` → difunde `recuento` o `resultado`. Aprobada con 3 «sí»; rechazada en cuanto hay 2 «no» (ya no puede llegar a 3); `setAlarm()` al plazo (48 h por defecto) → `caducada`.
  - Cada respuesta lleva las filas leídas/escritas reales del cursor SQLite (`rowsRead`/`rowsWritten`) para medir.
- **Script de prueba** `clientes.mjs`: 4 clientes WebSocket (ana, beto, carla, dani) en Node 22.

## 2 · Resultados de la prueba (comprobado, salida de `clientes.mjs`)
| Caso | Resultado | Mensajes entrantes | Salientes | Filas leídas | Filas escritas |
|---|---|---|---|---|---|
| Conectar a los 4 (equipo nuevo, crea tablas) | 4 × «101 Switching Protocols» | 0 | 4 | 14 | 18 |
| Aprobada: sí, sí, no, sí (decide el 4.º voto) | aprobada 3–1 | 5 | 20 | 22 | 11 |
| Aprobada rápida: 3 «sí» seguidos | aprobada 3–0 | 4 | 16 | 16 | 9 |
| Rechazada: no, sí, no | rechazada 1–2 tras el 3.er voto | 4 | 16 | 17 | 9 |
| Caducada (plazo 2 s, 1 voto) | caducada a los 2.005 ms por la alarma | 2 | 12 | 14 | 5 |
| Segunda propuesta con una abierta | «ya hay una votación abierta» | — | — | — | — |
| Votar dos veces | «ya has votado» | — | — | — | — |
| Quinto jugador | rechazado con 403 «equipo completo» | — | — | — | — |
| Reconexión a mitad de votación | recupera la votación y el recuento `{"si":1,"no":0}` | — | — | — | — |
| 20 s sin tráfico y luego un voto | el objeto **se recreó** (id de instancia `e0960297` → `e279df0c`) y **los 4 WebSockets siguieron abiertos**: hibernación real | — | — | — | — |
| 20 votaciones seguidas | mediana 6,3 ms · p90 9,6 ms · máx. 15,5 ms | — | — | — | — |

Totales de la prueba: 5 conexiones aceptadas (+1 rechazada), 101 mensajes entrantes, 407 salientes, 706 filas leídas, 241 escritas.

**Límites de lo comprobado:** es local (workerd), con un solo equipo y la red de la propia máquina. No se ha probado en Cloudflare real, ni con móviles en 4G, ni con miles de equipos a la vez. El recuento de filas es el de SQLite local; **supuesto:** que Cloudflare lo cuente igual. `setAlarm()` no aparece en el cursor; la página de precios dice que cuenta como 1 fila escrita (sumado abajo).

## 3 · Lo que dice la página de precios (cita literal)
Fuente: <https://developers.cloudflare.com/durable-objects/platform/pricing/> («Last updated Oct 18, 2026»), consultada el 9 nov 2026.
- «Workers Free plan: Only Durable Objects with SQLite storage backend are available.»
- «If you exceed any one of the free tier limits, further operations of that type will fail with an error.» · «Daily free limits reset at 00:00 UTC.»
- Plan gratuito: «Requests \| 100,000 / day» (incluye «HTTP requests, RPC sessions, WebSocket messages, and alarm invocations»); «Duration \| 13,000 GB-s / day».
- «A request is needed to create a WebSocket connection. There is no charge for outgoing WebSocket messages, nor for incoming WebSocket protocol pings.» · «a 20:1 ratio is applied to incoming WebSocket messages … 100 WebSocket incoming messages would be charged as 5 requests».
- «Durable Objects that are idle and eligible for hibernation are not billed for duration, even before the runtime has hibernated them.» · «Calling accept() on a WebSocket in an Object will incur duration charges for the entire time the WebSocket is connected.»
- «Duration billing charges for the 128 MB of memory your Durable Object is allocated».
- SQLite, plan gratuito: «Rows reads \| 5 million / day», «Rows written \| 100,000 / day», «SQL Stored data \| 5 GB (total)»; «Each setAlarm() is billed as a single row written.»
- Y la página de Workers (<https://developers.cloudflare.com/workers/platform/pricing/>): plan gratuito «100,000 per day» peticiones; «WebSocket connections made to a Worker are charged as a request, representing the initial Upgrade connection … WebSocket messages routed through a Worker do not count as requests.»

## 4 · Estimación para 1.000 equipos con 3 votaciones/semana (supuesto, calculado)
3.000 votaciones/semana → **429 en un día medio**; **día pico = las 3.000 el mismo día** (p. ej., todas antes del cierre del lunes).

**Por votación:**
- **Escenario A (base):** cada miembro abre la pantalla una vez → 4 conexiones (4 peticiones al Worker + 4 al DO); 5 mensajes entrantes = 0,25 peticiones; se resuelve antes del plazo (sin alarma); 13 filas escritas (11 medidas + `setAlarm` + `deleteAlarm`); ≈ 42 leídas.
- **Escenario B (pesimista):** cada miembro se reconecta 5 veces → 20 conexiones; además todas caducan por alarma (+1 petición).
- **Duración:** solo se cobra mientras se ejecuta código (con hibernación). Se calcula con 50 ms por evento (realista; en local fueron ~1–2 ms) y con **1 s por evento** (muy prudente) × 128 MB.

| Uso diario | Límite gratis | A · día medio | A · día pico | B · día pico |
|---|---|---|---|---|
| Peticiones al DO | 100.000 | 1.821 (1,8 %) | 12.750 (12,8 %) | 63.750 (63,7 %) |
| Peticiones al Worker (conexiones) | 100.000 **compartidas con toda la web** | 1.714 (1,7 %) | 12.000 (12 %) | 60.000 (60 %) |
| Filas escritas | 100.000 | 5.571 (5,6 %) | **39.000 (39 %)** | 39.000 (39 %) |
| Filas leídas | 5.000.000 | 18.000 (0,4 %) | 126.000 (2,5 %) | 366.000 (7,3 %) |
| Duración (1 s/evento) | 13.000 GB-s | 494 (3,8 %) | 3.456 (26,6 %) | 9.984 (76,8 %) |
| Duración (50 ms/evento) | 13.000 GB-s | 25 (0,2 %) | 173 (1,3 %) | — |
| Almacenamiento | 5 GB | ~12 KB por base vacía + unos pocos KB por equipo → ≪ 1 % | | |

**Cuántos equipos caben (día pico):** ≈ **2.560** en el escenario A (lo limitan las filas escritas) y ≈ **1.570** en el B (lo limitan las peticiones).

**Comparación (por qué importa la hibernación):**
- **Sin hibernación** (`ws.accept()`), si cada equipo tuviera el objeto despierto 30 min al día: 1.000 × 1.800 s × 0,128 GB = **230.400 GB-s/día → 17,7 veces el límite**.
- **Sondeo HTTP cada 5 s** (4 personas, 5 min por votación): 240 peticiones por votación → 720.000 en el día pico → **7,2 veces el límite**.

## 5 · Qué significa para Klever
- **Comprobado:** la mecánica «3 de 4» es sencilla y robusta en un DO por equipo; la reconexión recupera el estado, no hay votos dobles y la alarma cierra lo que nadie termina.
- **Supuesto razonable:** cabe en el plan gratuito para 1.000 equipos, **siempre que** (1) se use la API de hibernación, (2) no se sondee por HTTP y (3) se vigilen las **filas escritas** (cada fila cuenta: no guardar registros superfluos, no reescribir miembros en cada conexión).
- **Riesgo:** las 100.000 peticiones diarias del Worker se **comparten** con el resto de la web (Pages Functions); un día con mucho tráfico normal más un cierre de jornada podría agotarlas, y al superarlas **«further operations … will fail with an error»** hasta las 00:00 UTC. Haría falta un aviso de consumo y un plan B (votar sin tiempo real, recargando).
- **Pendiente:** prueba en Cloudflare real (necesita cuenta y `wrangler login`, decisión de Javier), con móviles y con varios equipos a la vez.
