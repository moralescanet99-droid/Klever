# 05 · Estado actual

**Última actualización:** 2026-11-03, tras la ronda 9 (informe `ronda9/LEEME.md`).
Leyenda: ✅ implementado y probado · 🟡 implementado, comprobado solo de forma aproximada · ⬜ pendiente · ⛔ no probado.

## Resumen en cinco líneas
1. La web está **completa para la beta en código** (portada, editor, empresas, carteras públicas, ficha, acceso por enlace, métricas), pero **todavía no está desplegada**: faltan las cuentas del usuario (Cloudflare, Brevo, secretos de GitHub).
2. Todo se ha probado **en local** con D1 simulada, datos inventados y un navegador automático (**221 comprobaciones** automáticas en la ejecución limpia de la ronda 9). No se ha probado con servicios reales.
3. Hay una **demo autónoma** (`demo/index.html`) lista para publicar en Cloudflare Pages y una privada en un artefacto.
4. La ronda 9 (cierre técnico: API pública coherente, demo comprobada en el ejecutor) y la 8 (carreras de lectura y respuesta, ejecutor fiable, migración verificada) están implementadas y probada en local desde una **instalación limpia** (`LEEME-PRUEBAS.md`, commit exacto en `ronda9/resultado-ejecucion.txt`, Node ≥ 22.13); **D1 remoto no probado**; hay una **versión para pruebas de uso** (`PRUEBAS-DE-USO.md`: servidor local completo, demo sin persistencia y artefacto privado). El paquete para ChatGPT de las rondas 6 y 7 está preparado (`revision-chatgpt/ronda-7/`); falta entregarlo y traer su feedback; **ninguna prueba manual real se ha ejecutado**.
5. Lo siguiente razonable: desplegar la demo pública, crear la cuenta de Brevo, desplegar la web real, revisar términos de TradingView y texto legal.

## Mapa del código
```
public/            index.html · app.js · style.css · legal.html       (interfaz, sin dependencias)
functions/         _lib.js (auth, hash, correo, reglas de composición)
  api/             assets · assets/[ticker] · ideas · login · verify · logout
                   portfolios/index · portfolios/[id] · public/index · public/[id]
schema.sql         esquema D1 completo (base nueva)
migrations/        0002 tesis · 0003 enlace mágico · 0004 consentimiento y acceso · 0005 aviso de borrador · 0006 fecha de última modificación · 0007 revisión por escritura
scripts/           fetch_fundamentals.mjs (SEC → SQL) · metrics.sql (decisión de la beta)
data/              universe.json (125 activos) · demo.sql (3 carteras públicas de ejemplo)
.github/workflows/ nightly.yml (carga nocturna de la SEC en D1)
demo/              index.html (demo autónoma) · LEEME.md
tests/ronda5/      baterías A–E, demotest, generadores de informe y datos de prueba (tests/ronda4: histórico)
tests/ronda7/      testF (guardado fiable, conflicto, E16a, diálogo móvil), unit-servidor (SQLite real), informe7
tests/ronda8/      unit-carreras (R1–R6), unit-migracion, testG (respuestas tardías), test-ejecutor.sh (18 casos), fixtures, informe8
tests/ronda9/      verificar-api.mjs (API por HTTP, repetible en remoto), informe9 · tests/lib/d1-sqlite.mjs (adaptador de D1 sobre SQLite)
tests/run-all.sh  ejecuta todo con servidor limpio entre baterías, sale con código ≠ 0 si algo falla y deja ronda9/resultado-ejecucion.txt con el commit
ronda6/ ronda5/ ronda4/ rediseno/  informes LEEME.md de cada ronda · ronda6/pruebas-manuales.md (pendientes reales)
PRUEBAS-DE-USO.md · scripts/local/arrancar.sh · data/seed-prueba.sql   versión para pruebas de uso
revision-chatgpt/  instrucciones para cada ronda de crítica de ChatGPT
procesos-klever/   esta memoria · CLAUDE.md (raíz) apunta aquí
```

### Interfaz (vistas por hash)
`#inicio` portada · `#empresas` explorar empresas (+ screener) · `#publicas` carteras públicas · `#carteras` mis carteras (con sesión) · `#cartera` borrador · `#cartera-<id>` cartera guardada.

### API
`GET /api/assets`, `GET /api/assets/:ticker`, `GET /api/ideas`, `POST /api/login` (email, acepto, con_borrador), `POST /api/verify`, `POST /api/logout`, `GET|POST /api/portfolios`, `GET|PUT|PATCH|DELETE /api/portfolios/:id` (el `PUT` guarda posiciones + nombre + tesis en una sola operación transaccional y exige `revision`; responde `409` si la cuenta cambió; `PATCH` publica/despublica con `revision`; `POST` crea cartera + posiciones atómicamente), `GET /api/public`, `GET /api/public/:id`.

### Base de datos (D1)
`usuarios` (+`acepto_en`) · `enlaces` (+`con_borrador`) · `sesiones` (+`ultimo_acceso`) · `activos` · `fundamentales` · `portafolios` (+`tesis`, +`actualizado_en`, +`revision`, +`token_escritura`) · `posiciones` · `ideas`. Sin tabla de precios.

## Funcionalidad
| Área | Estado |
|---|---|
| Portada: titular, acción principal, plantillas, vista previa real, muestra de carteras públicas | ✅ (sin cambios en la ronda 5) |
| «Mis carteras»: lista primero (nombre, privada/pública, posiciones, total asignado, fecha real), «Nueva cartera» a petición, creación como acción principal si no hay carteras | ✅ |
| Botones desactivados con aspecto de desactivados y motivo al lado (Guardar y Publicar) | ✅ |
| Cartera pública con edición inválida: versión publicada intacta, sin despublicar | ✅ (interfaz y servidor) |
| Copia local de cambios sin guardar de carteras de la cuenta (recuperación, descartar) | ✅ |
| Conflicto entre la versión local y la de la cuenta: diálogo con las dos versiones, al abrir y al guardar (409); elegir la local NO escribe, hay que pulsar Guardar; Escape/«Decidir después» posponen | ✅ con una petición directa a la API como «otro dispositivo» · dos navegadores reales ⬜ pendiente |
| Guardado en una sola operación transaccional con revisión atómica; la respuesta lleva la revisión de su propia escritura; lecturas coherentes; errores internos = 500 | ✅ servidor real local + SQLite real (carreras simuladas de forma determinista) · D1 real de Cloudflare ⛔ no probado |
| Respuesta tardía de guardado/publicación con otra cartera abierta (no la toca) | ✅ (H1, H2) |
| `GET /api/public/:id` en una sola instantánea (nunca devuelve una versión que no fue pública) | ✅ R6a/R6b + estrés V7 local · D1 remoto ⛔ |
| Guion de beta y D1 remoto (`ronda9/GUION-BETA-Y-D1-REMOTO.md`) y `verificar-api.mjs` | ✅ el script pasa en local · el guion **no se ha ejecutado** en Cloudflare ⛔ |
| Migración 0007 sobre una base antigua con datos | ✅ SQLite real con fixture · D1 remoto con datos reales ⛔ |
| Diálogo de conflicto en móvil (320×568, texto al 200 % simulado): «Decidir después» y decisiones siempre alcanzables | ✅ simulado · zoom real y teclado real ⬜ pendientes |
| Aviso persistente en «Mis carteras» al abrir el enlace en otro navegador (sin toast largo) | ✅ |
| Comprobaciones con datos ausentes: «N superadas · M sin datos», ficha por grupos, orden documentado | ✅ |
| Cartera pública: «Guardar y actualizar publicación», «Tus cambios aún no son públicos», «Reintentar guardado» | ✅ |
| Versión para pruebas de uso: servidor local completo (`arrancar.sh`), demo sin persistencia (también `file://`), artefacto | ✅ comprobado aquí · con personas ⬜ |
| Entrega reproducible: `npm ci` + `bash tests/run-all.sh` desde un clon limpio; el ejecutor falla (≠ 0) ante cualquier problema y está probado | ✅ ejecutado así (resultado en `ronda8/resultado-ejecucion.txt`) |
| Estado en tres planos con texto explícito de persistencia | ✅ |
| Probar sin registro, borrador local, migración a la cuenta | ✅ |
| Editor: nombre y pesos editables, buscador accesible, resumen, menú de acciones con confirmación | ✅ |
| Regla única de composición (guardar/publicar), estados en tres conceptos | ✅ (también comprobado contra el servidor) |
| Móvil: cabecera 61 px, barra inferior 72 px, lista plana, orden en una columna | ✅ · teclado virtual 🟡 (emulado) |
| Explorar empresas (105), ficha con 5 comprobaciones, metodología, glosario | ✅ |
| Carteras públicas con etiquetas de origen | ✅ |
| Acceso por enlace: pedir, reenviar, cambiar email, caducidad, un solo uso, otro dispositivo | ✅ en local con el enlace devuelto en pantalla · envío real por Brevo ⛔ |
| Cookies de TradingView con consentimiento en el punto de uso | ✅ (sin consentimiento no hay peticiones) · widgets reales ⛔ |
| Métricas (`scripts/metrics.sql`): registros, carteras, usuarios que vuelven a 7 días | ✅ en local sin datos reales |
| Carga nocturna de la SEC | ✅ el script y el flujo existen · **nunca se ha ejecutado contra la SEC real** ⛔ |
| Accesibilidad: roles, foco, contraste ≥ 4,5:1 / 3:1 | ✅ con el árbol de accesibilidad · lector de pantalla real ⛔ |
| Ampliación al 200 % | 🟡 aproximada (tamaño de texto y anchuras de 320/720 px) |
| Safari, Firefox, móviles reales | ⛔ |

## Pruebas
- **Ejecución limpia de la ronda 8**: ver `ronda8/LEEME.md` y `ronda8/resultado-ejecucion.txt` (commit exacto dentro). Antecedente, ronda 7 (clon nuevo del commit `3c3c861`, `npm ci`, `bash tests/run-all.sh`): A 31 · B 51 · C 50 · D 29 · E 15 · **F 9** (guardado fiable, conflicto, E16a, diálogo móvil, desconexión real) · **U 11** (servidor real sobre SQLite: atomicidad y revisión) = 196, y la demo con sus comprobaciones. Tablas esperado/observado en `ronda7/LEEME.md`; capturas presentes y ausentes en `ronda7/EVIDENCIAS.md`. Antes de corregir, `ronda7/antes-defectos.txt` documenta los defectos del servidor real. Cómo ejecutarlas: `08-entorno-y-trampas.md`.
- Mediciones (390 px): cabecera global 61 px (antes 105); barra inferior 72 px; tres plantillas 357 px (antes 649).

## Pendiente del usuario (ver `PENDIENTES.md`)
0. Publicar la demo: `wrangler pages deploy demo --project-name klever-demo`. Para pruebas con personas, seguir `PRUEBAS-DE-USO.md`.
1. Cuenta de Brevo: remitente verificado, clave API, secretos `BREVO_API_KEY` y `MAIL_FROM`.
2. Cloudflare: `wrangler d1 create klever`, pegar el `database_id` en `wrangler.toml`, cargar `schema.sql`, secretos de GitHub (`SEC_USER_AGENT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), lanzar el flujo nocturno, cargar `data/demo.sql`, desplegar, activar Web Analytics.
3. Antes de abrir al público: leer los términos de TradingView (secciones 3 y 4) completos; abogado para `legal.html` y contacto de derechos de datos.
4. Con usuarios: ejecutar `scripts/metrics.sql`; aplicar migraciones 0002–0007 en bases antiguas; recargar `data/demo.sql` si ya estaba cargado.

## Decisiones abiertas / dudas
- **Feedback de ChatGPT sobre las rondas 6 y 7:** paquete preparado (`revision-chatgpt/ronda-7/`), pendiente de entrega. Para la ronda 4 se preguntó por: regla del reparto incompleto, estado en tres conceptos (ⓘ en móvil), redundancia del resumen breve y la barra, etiquetas técnicas, nombre «Carteras públicas», mensajes cortos de la barra.
- Los **umbrales de las 5 comprobaciones** son una propuesta inicial.
- Al reabrir una cartera el servidor devuelve las posiciones **ordenadas por peso**; mientras se edita mantienen el orden de inserción.
- La lista de 105 empresas es una página larga (sin paginación, a petición expresa).
- Los cambios locales pendientes de una cartera de la cuenta **sí sobreviven a recargar** (copia local); si la cartera cambió desde otro dispositivo se muestra el diálogo con las dos versiones (al abrir y al guardar, con 409 del servidor). Probado con una petición directa a la API como segundo dispositivo; con dos dispositivos reales está en las pruebas manuales. El aviso del navegador al salir está implementado y no probado.
- **Título largo:** con 80 caracteres en móvil necesita tres líneas y se desplaza dentro del campo (límite asumido).
- **Clientes antiguos:** desde la ronda 7 el servidor exige `revision` (400 si falta); las copias locales de versiones anteriores del cliente se tratarán como conflicto al abrir.
- **La atomicidad no se ha probado en Cloudflare D1 real** (solo D1 local simulada y SQLite real); M20–M22 en `ronda8/pruebas-manuales.md`. La carrera «escritura ajena tras el commit» se modela con un adaptador que aplaza la escritura intercalada hasta después del commit (comportamiento documentado de `batch()`), no con dos procesos reales.
- **«Decidir después»** en el diálogo de conflicto es una decisión de producto añadida (no pedida) para no atrapar al usuario; conviene validarla con ChatGPT/personas.
- ChatGPT quizá no pueda **interactuar** con la demo aunque sea pública; las capturas siguen siendo la vía segura.

## Siguientes pasos sugeridos
1. Hacer las pruebas de uso con personas (`PRUEBAS-DE-USO.md`) y/o preparar el paquete de la ronda 6 para ChatGPT si el usuario lo pide.
2. Publicar la demo en Cloudflare Pages y comprobar que carga.
3. Crear la cuenta de Brevo y desplegar la web real; probar el acceso por email real (spam en Gmail, otro proveedor).
4. Ejecutar la carga nocturna con la SEC real y revisar qué empresas no devuelven datos.
5. Leer términos de TradingView y revisar el texto legal con un abogado.
6. Ejecutar las pruebas manuales pendientes de `ronda8/pruebas-manuales.md` (M1–M23; ninguna ejecutada) (teclado móvil real, lector de pantalla real, zoom real, Safari/Firefox, email real).
