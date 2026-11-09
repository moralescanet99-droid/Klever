# 05 · Estado actual

**Última actualización:** 2026-11-08, ronda 33 (fase 1, primera parte); antes, ronda 31 (última generación, `ronda31/`); antes, 2026-11-07, ronda 30 (puntos 3–6 del punto 14, `ronda30/`); antes, pendientes del punto 14 anotados (C35–C36); antes, la ronda 29 (fase 2.5, `ronda29/`); antes, la ronda 28 (fase 1 del plan a 10, `ronda28/`); antes, ronda 27 (corrección de la duplicación por envío incierto, `ronda27/LEEME.md`; antes, ronda 26: evolución visual e interactiva). El piloto sigue siendo `piloto-r23` (ronda 24).
Leyenda: ✅ implementado y probado · 🟡 implementado, comprobado solo de forma aproximada · ⬜ pendiente · ⛔ no probado.

## Resumen en cinco líneas
1. La web está **completa para la beta en código** (portada, editor, empresas, carteras públicas, ficha, acceso por enlace, métricas), pero **todavía no está desplegada**: faltan las cuentas del usuario (Cloudflare, Brevo, secretos de GitHub).
2. Todo se ha probado **en local** con D1 simulada, datos inventados y un navegador automático (**888 comprobaciones** automáticas en la ejecución de la ronda 21; antes 827). No se ha probado con servicios reales.
3. Hay una **demo autónoma** (`demo/index.html`) lista para publicar en Cloudflare Pages y una privada en un artefacto.
4. La ronda 23 (**corrección final acotada: el borrador de una revisión se conserva durante el envío, el conflicto y la sesión caducada; siguiente paso: el piloto con personas, NO realizado**), la 22 (**cierre de lo existente: recuperación del registro de revisiones, Cuaderno coherente con «Para revisar» primero y recorrido pulido; siguiente paso: el piloto con personas, NO realizado**), la 21 (**primer recorrido de producto: tres entradas, revisión útil sin nota, comparación, Cuaderno con invalidación e historial de revisiones y Revista conectada; migración 0012; la prueba con personas sigue NO realizada**), la 20 (**causas coexistentes con código, código de salida real de las pruebas, Revisión de escritorio con contexto y una corrección real del desplazamiento; la revisión pidió cerrar este ciclo y pasar a la prueba de uso, que sigue NO realizada**), la 19 (**frontera del redondeo cerrada, revisión a 320 px medida por el rectángulo del resultado, revisión sin nota explicada por causas; evidencia con registros íntegros; prueba con personas preparada y NO realizada**), la 18 (**contraejemplos de la nota guardada, la fecha y los comparables cerrados; creador por pasos con la edición a la vista; dos carreras reales con la red lenta corregidas; demo con los números de la semilla**), la 17 (**procedencia verificada fila a fila, nota guardada coherente, catálogo compartido de preguntas y el diseño aprobado — carbón y cobre, creador con anillo y deslizadores — aplicado al recorrido**), la 16 (**notas guardadas validadas, puntuación por indicador con ausente≠cero, vínculo estable de la pregunta y dos ejemplos de nota — calculada e incompleta**), la 15 (**privacidad cerrada, tres destinos Cartera·Ideas·Seguimiento, comparador de dos empresas, nota de estructura v1 (solo con datos sintéticos rotulados) y seguimiento con preguntas**), la 14 (**confianza: privacidad al salir, procedencia por dato, radar sin falsos «guardado», escenarios íntegros; y la primera historia editable-de-ejemplo → laboratorio → seguimiento con pregunta**), la 13 (**radiografía, radar, laboratorio de porcentajes y seguimiento de escenarios**, con el recorrido completo probado; origen de los datos declarado), la 12 (editor, «Mis carteras», «Explorar empresas» y ficha con un mismo lenguaje visual; faltan portada, públicas, acceso, pie y gráficos), la 11 (avisos sin solapes y **editor con identidad propia** como pantalla de referencia; entregas ZIP verificables), la 10 (pulido visual y acceso) , la 9 (API pública coherente, demo comprobada en el ejecutor) y la 8 (carreras de lectura y respuesta, ejecutor fiable, migración verificada) están implementadas y probada en local desde una **instalación limpia** (`LEEME-PRUEBAS.md`, commit exacto en `ronda11/resultado-ejecucion.txt`, Node ≥ 22.13); **D1 remoto no probado**; hay una **versión para pruebas de uso** (`PRUEBAS-DE-USO.md`: servidor local completo, demo sin persistencia y artefacto privado). El paquete para ChatGPT de las rondas 6 y 7 está preparado (`revision-chatgpt/ronda-7/`); falta entregarlo y traer su feedback; **ninguna prueba manual real se ha ejecutado**.
5. Lo siguiente razonable: desplegar la demo pública, crear la cuenta de Brevo, desplegar la web real, revisar términos de TradingView y texto legal.

## Ronda 40 · informe de la app final (C57)
- ✅ Informe escrito y publicado (`ronda40/INFORME-APP-FINAL.md` y su versión HTML). Sin supuestos prácticos; 3 secciones: Mi cartera · La Liga · Construye.
- ⬜ Decisiones de Javier (§11 del informe), incluida la confirmación de qué son los «supuestos prácticos». Después: empezar la construcción (fase de 14 semanas).

## Ronda 39 · fantasma, equipo y mapa (C56)
- ✅ Prototipo D «Tu fantasma» (`ronda39/d-fantasma.html`). ✅ «Cartera en equipo» y «Tu cartera en el mapa» en A, B, C y D (enlaces en `ronda38/LEEME.md`). 🟡 Comprobado solo con Playwright, no en un móvil real.
- ⬜ Javier elige prototipo, o una mezcla, para la refundación.

## Ronda 38 · tres prototipos (C54)
- ✅ A «Órbita», B «Organismo» y C «Arena» en `ronda38/`, publicados como artefactos (`ronda38/LEEME.md`). 🟡 Comprobados solo con Playwright, no en un Android real.
- ⬜ Javier elige uno; después hay que fijar la fórmula del Temple y planificar la refundación.

## Ronda 37 · propuesta de refundación (C53)
- ✅ Propuesta escrita (`ronda37/REFUNDACION.md`) y prototipo interactivo (`ronda37/prototipo-klever-2.html`, artefacto https://claude.ai/artifact/Kth1hjzwQiSjW3R7vev9GQ). 🟡 Prototipo comprobado solo con Playwright (sin errores, sin scroll horizontal a 390 y 1280 px).
- ⬜ Decisiones de Javier (§9 de la propuesta): refundar o evolucionar; bucle de escenarios y Temple; empresas, sectores o ambos; identidad «espacio y cobre»; repositorio privado. La app actual no cambia hasta entonces.

## Piloto (ronda 24)
- ✅ Versión identificable `piloto-r23` con verificación de hashes; ✅ entorno privado con persistencia (`scripts/piloto/abrir-piloto.sh`) comprobado en el lado servidor; ✅ guion con la incidencia del intento incierto y registro **vacío**.
- ⬜ Verificación previa en el dispositivo previsto y piloto con personas: **no realizados**. ⬜ Limitación conocida (intento incierto + pérdida de sesión) pendiente de corregir antes de una beta pública.

## Hoja de ruta (C43, `ronda33/PLAN.md`)
- ✅ **Fase 1 (cimientos) hecha** (ronda 33, `ronda33/LEEME.md`): pruebas en paralelo (≈ 15 min) con reintento declarado, hoja de estilo única con tokens fusionados y `DESIGN.md`, embudo anónimo (migración 0014), módulos `base.js`, `explorar.js` y `semana-ui.js`, comparación visual (10 referencias); pasada **1216/0** (`55ea85b`). Mis carteras y el editor se separan en la fase 2; Vite, en la 6.
- 🟡 **Fase 2 (UX):** ✅ «Hoy» con la cartera principal en grande (ronda 34, pasada **1238/0**). ✅ Portada con rueda de esferas y «Hoy» con frase con iconos y rueda de la temporada (ronda 35, pasada **1254/0**, `6c544f8`). Pendiente: menos texto, Descubrir como feed, editar con los dedos, primer minuto.
- ✅ **Liga, Temporada 0** adelantada (ronda 36, `ronda36/LIGA.md`): puntos por equilibrio, aprendizaje y constancia; apodos; clasificación general opcional; ligas privadas con código e invitación. ✅ Tarjeta para compartir; solo mayores de 18; embudo sin almacenamiento en el dispositivo.
- ⬜ Fases 3 perfil → 4 comunidad → 5 liga con precios (índice 100) → 6 publicar.

## Ronda 32 (C42)
- ✅ Comparador y tarjetas de Explorar legibles en el móvil (también con el texto ampliado del sistema).
- ✅ Propuesta decidida por Javier (C43).

## Ronda 31 · última generación (C40)
- ✅ Visión (`ronda31/VISION.md`) y auditoría (`ronda31/AUDITORIA.md`, 13,5/20) hechas y anotadas en `PENDIENTES.md` § ★★.
- ✅ Implementado: V2–V10, V12, accesibilidad del editor, texto de la portada; 🟡 V1 (sin View Transitions) y V14; ⛔ V13 descartado. `testAC` (21/0); pasada completa **1194/0** (`33db027`). Ver `ronda31/LEEME.md`. Decisiones de Javier en `PENDIENTES.md` § ★★.

## Plan a 10 (ronda 28, `ronda28/PLAN.md`)
- ✅ Fase 1 (claridad y lenguaje): implementada y probada (`unit-claridad28`, `testX`; ver `ronda28/LEEME.md`).
- ✅ Fase 2 (móvil y descubrir): barra inferior, pegar cartera, «Probar» desde Explorar, señales en tres niveles con umbrales propios, «idea» / «empresas que sigo». Cerrada con varios cambios a la vez y «Aplicar a mi cartera», sello único, línea de tiempo y monogramas (`testZ`).
- ✅ Fase 2.5 (ronda 29, retoma el punto 14): arranque guiado, huella de empresa, «Tu semana» y retos (`ronda29/LEEME.md`).
- ⬜ Fase 3 (personas), fase 4 (producción). Abiertas: precios históricos, correo semanal (Brevo), datos reales de la SEC.
- ✅ **Ronda 30 (C37), puntos 3–6 del punto 14:** foto semanal en el servidor (`/api/semana`, migración 0013), «Tu evolución», reto de la semana y ciclo de las ideas («Qué ha cambiado en los datos», «Mira atrás»). `unit-ronda30` (35) y `testAB` (15); pasada completa **1173/0**. Ver `ronda30/LEEME.md`.
- ⬜ **Punto 14, lo que falta** (`PENDIENTES.md` § ★): 14.1 «Novedades de tus empresas» (SEC real) y 14.2 correo semanal (Brevo + despliegue + tarea programada); criterio de 10 del punto 14 sin fijar.
- Piloto: `piloto-r27` = commit `f991fd8` (`git checkout f991fd8` antes de `abrir-piloto.sh`).

## Evolución visual e interactiva 26 (rama `claude/klever-visual-interactive-evolution-h6n454`, sobre `evolucion-25`)
- ✅ Señales de cartera (`public/js/senales.js`), exposición por categoría, «Ver qué cambiaría» con la comparación ya calculada, deslizador instantáneo y cifras clave en el laboratorio, «Descubre otras categorías», anillo de la nota, resumen del Cuaderno, señal en «Mis portafolios», portada con la nueva promesa y recorrido de 5 pasos, `style-r26.css`. Pruebas: `unit-senales26` (13) y `testV` (24) en verde; pasada completa **998/0** (`cdae3ee`, local) tras corregir 3 regresiones de geometría y orden y reponer «recomendación de compra» (ver informe).
- ✅ Promesa y umbrales decididos (03-, con permiso de Javier). Piloto preparado sobre **`piloto-r27`** (antes `piloto-r26`; ronda 27) (versión congelada, persistencia comprobada en servidor; `ronda26/PILOTO-R26.md`). No integrado en `main` hasta el piloto.
- ⬜ Verificación previa en el dispositivo, reclutar 5 personas y hacer el piloto; teléfono real, lector de pantalla, Safari/Firefox y personas: no hechos. Margen estrecho de la revisión a 320 px y 1440 px (26–30 px).

## Evolución visual 25 (rama `evolucion-25`)
- ✅ Patch integrado y batería completa 961/0 (local); regresiones del patch corregidas (ver `ronda25/LEEME.md`). ⬜ Teléfono real, ETF/datos ausentes a la vista, 5 usuarios y revisión visual: no hechos. El piloto sigue en `piloto-r23`.

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
tests/ronda9/      verificar-api.mjs (API por HTTP, repetible en remoto), informe9
tests/ronda10/     testH (avisos, ROIC, móvil; reescrita en la ronda 11), unit-acceso (A8 en modo repositorio/ZIP), seguridad-http, capturas/medir, validar-acceso-real (asistido), informe10
tests/ronda18/     unit-integridad18, testQ (recorrido por pasos en el viewport), paridad-demo, antes-despues-r18, repetir-intermitentes.sh (latencia y traza)
tests/ronda17/     unit-procedencia17, unit-guardada17, testP (creador y navegación), antes-despues-r17, repetir-intermitentes.sh
tests/ronda16/     unit-escenarios16, testO (nota en móvil, seguimiento con tres casos), antes-despues-r16
tests/ronda15/     unit-nota, unit-comparador, unit-almacen, testM (privacidad A/B), testN (interfaz), antes-despues-*
public/js/         nota (puro, versionado), nota-ui, comparador, ideas (ejemplo y comparar)
tests/ronda14/     unit-carga (procedencia), unit-r14 (escenarios y concurrencia), testL (privacidad, radar, primera visita, regreso), antes-despues-*
public/js/         contenido (caso ficticio), revista (render)
scripts/lib/       carga.mjs (métricas derivadas y SQL de carga, probado)
tests/ronda13/     unit-calculos, unit-r13 (servidor, aislamiento), testK (recorrido completo)
public/js/         calculos (puro, compartido con el servidor), almacen (radar/escenarios), lab (presentación)
tests/ronda12/     testJ (Mis carteras, Explorar, ficha, detalles del editor), capturas antes/después
tests/ronda11/     testI (identidad visual del editor), test-zip.sh, capturas (antes/después del editor), informe11
scripts/entrega/   crear-zip.sh, verificar-zip.sh (huellas + ENTREGA.json; el historial solo con repositorio) · tests/lib/d1-sqlite.mjs (adaptador de D1 sobre SQLite)
tests/run-all.sh  ejecuta todo con servidor limpio entre baterías, sale con código ≠ 0 si algo falla y deja ronda10/resultado-ejecucion.txt con el commit
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
| Avisos en zona reservada bajo la cabecera, errores persistentes con «Cerrar aviso»; las acciones y lo enfocado nunca quedan bajo la zona fija; legibilidad con opacidad real | ✅ H1a–H3, H7, H8 en 320/390/1440 (Chromium; mutación que valida H1c) |
| **Editor con identidad propia** (tokens, composición con datos reales, ROIC secundario, filas comparables, móvil táctil) | ✅ testI (16) + capturas antes/después · solo el editor; resto de pantallas ⬜ |
| Verificación de una entrega ZIP (sin `.git`): huellas, archivos prohibidos, secretos, pruebas sin dependencias | ✅ `verificar-zip.sh` + `test-zip.sh` · el **historial** solo con el repositorio |
| Resumen de ROIC: indicador, cobertura y advertencia visibles; explicación en un desplegable accesible | ✅ H4 |
| Móvil: pie compacto, barra inferior adaptable, acciones alcanzables (texto ampliado y teclado SIMULADOS) | ✅ H5 · zoom real y teclado real ⛔ |
| Acceso: enlace solo por correo en la configuración pública; un solo uso; caducidad; límites | ✅ manejadores reales + HTTP sin enlace en pantalla · **correo real ⛔ bloqueado** |
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
- **Feedback de ChatGPT:** las revisiones 5 a 8 están recibidas y tratadas; **pendiente la revisión 9** (ronda 11). Para la ronda 4 se preguntó por: regla del reparto incompleto, estado en tres conceptos (ⓘ en móvil), redundancia del resumen breve y la barra, etiquetas técnicas, nombre «Carteras públicas», mensajes cortos de la barra.
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
6. Conseguir los accesos de `ronda10/BLOQUEOS.md` y ejecutar `ronda10/GUION-VALIDACION-REMOTA.md`; después las pruebas manuales de `ronda11/pruebas-manuales.md` (M1–M32; ninguna ejecutada); revisar el editor y extender el sistema visual al resto (teclado móvil real, lector de pantalla real, zoom real, Safari/Firefox, email real).
