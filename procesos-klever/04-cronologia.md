# 04 · Cronología de rondas

Todas las fechas son 2026-11-03 salvo indicación (el repositorio se creó el 2026-11-01). Los commits están en la rama de trabajo (ver `10-referencias.md`).

## Ronda 1 · Construcción siguiendo el plan de 4 semanas
- **Semanas 1–2 (`6c08091`)**: esquema D1 (6 tablas), `wrangler.toml`, funciones de la API (activos, carteras), tarea nocturna de SEC, editor de carteras con plantillas y mini gráficos de TradingView.
- **Semana 3 (`455bd98`)**: ranking de ideas (5 criterios), ficha de empresa, screener de TradingView aparte.
- **Semana 4 (`30dc520`)**: carteras públicas (composición y tesis), `legal.html` (borrador), datos demo.
- **Acceso (`99df5eb`)**: enlace mágico con sesiones por dispositivo y Brevo.
- **`9c8d2f1`**: `PENDIENTES.md` con las tareas del usuario (cuenta de Brevo, Cloudflare…).
- **Pruebas locales** con D1 simulada y navegador automático; se corrigieron el redondeo de plantilla y el desborde en móvil (`53ed731`, `d69dbb7`).
- **`895ecf6`**: universo ampliado de 26 a 125 activos.

## Ronda 2 · Críticas de experto y primera revisión de ChatGPT
- Autocrítica como desarrollador de interfaces → **`eede586`**: consentimiento de cookies, casilla legal, último acceso y métricas, estados de error, reintentos, teclado.
- Primer paquete para ChatGPT (`002f947`). El usuario devuelve su veredicto (ver `07-`).
- **`75c16b4`**: portada con propuesta de valor, prueba sin registro con borrador, guardar separado de publicar, cifras con unidades, ideas reducidas con buscador, accesibilidad, contraste.
- **`de56340`**: la tabla del editor cabe en móvil; instrucciones de la segunda ronda de crítica.

## Ronda 3 · Rediseño completo (encargo largo del usuario)
- Encargo literal en `06-`. **`5d999a6`**: portada nueva, editor como espacio de trabajo, móvil específico, sistema visual, acceso en diálogo, ficha, estados.
- 100 comprobaciones automáticas; paquete «antes/después» (`rediseno/LEEME.md`).
- Paquete para ChatGPT (`ad9ddf3`).

## Ronda 4 · Claridad, densidad y coherencia de estados (encargo del usuario)
- Encargo literal en `06-`. **`b45376e`**: reglas únicas de guardar/publicar, resumen exacto, cabecera y barra móviles compactas, orden en una columna, empresas con encabezados, ficha móvil, portada afilada, enlace en otro dispositivo, 130 comprobaciones, informe `ronda4/LEEME.md`.
- Hallazgo importante: con 88 % la cartera **se podía publicar incompleta**; «Publicar» con 103 % lanzaba una petición rechazada por el servidor.
- **`a842619`**: demo pública autónoma (`demo/index.html`), lista para publicar en Cloudflare Pages (pendiente de que el usuario la despliegue).
- **`2692b08`**: paquete de revisión para ChatGPT (ronda 4). **Pendiente: feedback de ChatGPT.**

## Ronda 5 · Cerrar problemas concretos de la ronda 4 (encargo del usuario)
- Encargo literal en `06-` (texto C2). Informe: `ronda5/LEEME.md` (con la tabla de evidencias).
- Hallazgo: el bloqueo de «Publicar» a 103 % ya existía en la lógica, pero **solo el botón primario tenía estilo de desactivado**; el secundario se veía igual que activo.
- Además: las ediciones inválidas de una cartera pública obligaban a despublicar; los cambios sin guardar de una cartera de la cuenta se perdían al recargar; «Mis carteras» abría con el formulario por delante de las carteras.
- Hallazgos de la propia batería: a texto ampliado al 200 % el panel «Publicación» desbordaba la página (416 px sobre 390), y el servidor no devolvía la marca de versión tras guardar (una copia local legítima se trataba como de «otra sesión»).

## Ronda 6 · Cerrar los puntos de ChatGPT sobre la ronda 5 y preparar pruebas de uso (encargo del usuario)
- El usuario pasó el feedback de ChatGPT sobre la ronda 5 («no hagas otro rediseño general»): aviso persistente en lugar del toast largo, textos de cambios locales y conflicto, datos ausentes en las comprobaciones, publicación, reintento, unidades, título de dos líneas y una versión para pruebas de uso. Literal en `06-` (C3). Implementado y probado en local; ver `ronda6/LEEME.md`. Todavía no se ha preparado paquete para ChatGPT.

## Ronda 11 · Incidencias visuales y primera pantalla con identidad propia (encargo del usuario)
- Tras la revisión de la ronda 10 (25 pruebas técnicas y A1–A7 superadas; A8 interrumpida por el ZIP sin `.git`): cerrar H1 y el comportamiento de los avisos, el espacio útil a 320 px con texto ampliado y la legibilidad durante la animación; empezar la dirección visual por el editor; documentar la verificación de entregas ZIP. Literal en `06-` (C8). Informe: `ronda11/LEEME.md`.

## Ronda 10 · Pulido visual y camino a la beta real (encargo del usuario)
- Tras el feedback técnico de la ronda 9 (25 comprobaciones locales superadas, sin acreditar navegador completo, D1 remoto, correo real ni dispositivos físicos): avisos, resumen de ROIC y móvil; comprobación de accesos reales (bloqueada); entrega técnica reproducible. Literal en `06-` (C7). Informe: `ronda10/LEEME.md`.

## Ronda 9 · Cierre técnico (encargo del usuario)
- Encargo breve: `GET /api/public/:id` coherente, comprobación completa de la demo en el ejecutor y descripciones G2/U4; después, guion de beta y D1 remoto. Literal en `06-` (C6). Informe: `ronda9/LEEME.md`.

## Ronda 8 · Revisión técnica de ChatGPT sobre la ronda 7 (encargo del usuario)
- ChatGPT reprodujo dos carreras no cubiertas (revisión devuelta leída después del lote; `GET` que mezclaba versiones) y señaló el ejecutor de pruebas, los requisitos y los errores internos. Literal resumido en `06-` (C5). Informe: `ronda8/LEEME.md`.

## Ronda 7 · Fiabilidad del guardado y entrega reproducible (encargo del usuario)
- Tras la revisión visual «suficientemente cerrada» de la ronda 6, el usuario pidió priorizar fiabilidad y reproducibilidad: corregir la contradicción del conflicto, eliminar el guardado parcial (operación única con revisión atómica), corregir la prueba E16a, entregar un proyecto repetible y terminar el diálogo móvil. Literal resumido en `06-` (C4). Informe: `ronda7/LEEME.md`.

## Después de la ronda 4 (antes de la ronda 5)
- Se pidió crear esta memoria del proyecto (`procesos-klever/` y `CLAUDE.md`). Ver `09-registro-de-cambios.md`.

- 2026-11-03 · Ronda 12 (C9): coherencia visual y exploración completa; ver `ronda12/LEEME.md`.

- 2026-11-03 · Ronda 13 (C10): primer recorrido completo (cartera → radar → laboratorio → seguimiento); ver `ronda13/LEEME.md`.

- 2026-11-04 · Ronda 14 (C11): confianza y primera historia legible/probable/retomable; ver `ronda14/LEEME.md`.

- 2026-11-04 · Ronda 15 (C12): privacidad, tres destinos, comparador, nota v1 y seguimiento con preguntas; ver `ronda15/LEEME.md`.

- 2026-11-04 · Ronda 16 (C13): notas protegidas, puntuación corregida, seguimiento con vínculo estable y dos notas demostrables; ver `ronda16/LEEME.md`.

- 2026-11-04 · Ronda 17 (C14): integridad del resultado y diseño aprobado aplicado; ver `ronda17/LEEME.md`.

- 2026-11-05 · Ronda 18 (C15): contraejemplos cerrados, creador por pasos y dos carreras reales con la red lenta; ver `ronda18/LEEME.md`.
- 2026-11-05 · Ronda 19 (C16): frontera del redondeo, revisión a 320 px medida por el resultado y revisión sin nota explicada; ver `ronda19/LEEME.md`.
- 2026-11-05 · Paquete para ChatGPT de la ronda 19 (`revision-chatgpt/ronda-19/INSTRUCCIONES_PARA_CHATGPT.md` + 10 imágenes de viewport; ZIPs e imágenes fuera del repositorio).
- 2026-11-05 · Ronda 20 (C17): cierre técnico y visual (causas con código, código de salida de las pruebas, Revisión de escritorio y corrección del desplazamiento diferido); ver `ronda20/LEEME.md`.
- 2026-11-05 · Paquete para ChatGPT de la ronda 20 (`revision-chatgpt/ronda-20/INSTRUCCIONES_PARA_CHATGPT.md` + 9 imágenes de viewport; ZIPs e imágenes fuera del repositorio).
- 2026-11-05 · Ronda 21 (C18): del conjunto de correcciones al producto (tres entradas, revisión útil, comparación, Cuaderno con revisiones, Revista conectada); ver `ronda21/LEEME.md`.
- 2026-11-05 · Paquete para ChatGPT de la ronda 21 (`revision-chatgpt/ronda-21/INSTRUCCIONES_PARA_CHATGPT.md` + 13 imágenes de viewport; ZIPs e imágenes fuera del repositorio).
- 2026-11-05 · Ronda 22 (C19): cierre de lo existente (recuperación del registro de revisiones, Cuaderno coherente, recorrido pulido); ver `ronda22/LEEME.md`.
- 2026-11-05 · Paquete para ChatGPT de la ronda 22 (`revision-chatgpt/ronda-22/INSTRUCCIONES_PARA_CHATGPT.md` + 13 imágenes de viewport; ZIPs e imágenes fuera del repositorio).
- 2026-11-05 · Ronda 23 (C20): corrección final acotada (borrador de revisión protegido durante el envío, el conflicto y la sesión caducada); ver `ronda23/LEEME.md`.

- 2026-11-06 · Ronda 24: preparación del piloto privado (`piloto-r23`); ver `ronda24/LEEME.md`.
- 2026-11-06 · Evolución visual 25 integrada en la rama `evolucion-25` (961/0); ver `ronda25/LEEME.md`.
- 2026-11-06 · Fin del circuito con ChatGPT; el supervisor pasa a ser un Claude Opus (`11-traspaso-supervisor.md`).
- 2026-11-06 · Ronda 26 (C22): evolución visual e interactiva sobre `evolucion-25` en la rama `claude/klever-visual-interactive-evolution-h6n454` (señales, comparación instantánea, nueva promesa); 998/0. Ver `ronda26/LEEME.md`.
- 2026-11-06 · Decisiones delegadas (C23): promesa y umbrales confirmados, sin integrar en `main`, piloto de un grupo.
- 2026-11-06 · Ronda 27 (C24): corregida la duplicación por envío incierto; piloto pasa a `piloto-r27` (commit `f991fd8`); 1010/0. Ver `ronda27/LEEME.md`.
- 2026-11-06 · Demo publicada como artefacto privado (C25).
- 2026-11-06 · Valoración experta de 14 aspectos (C26) y propuesta para llegar a 10 (C27).
- 2026-11-06 · Ronda 28, fase 1 del plan (C28): claridad y lenguaje; 1042/0. Ver `ronda28/PLAN.md` y `ronda28/LEEME.md`.
- 2026-11-07 · Ronda 28, fase 2 (C29, C30): móvil y descubrir, varios cambios a la vez, sello único, línea de tiempo; 1094/0.
- 2026-11-07 · Memoria completada (C31) y automatizada con hooks de proyecto (C32).
- 2026-11-07 · Opinión pedida por Javier (C33): por qué la web aún no atrae ni retiene y qué cambiar o tomar como referencia.
- 2026-11-07 · Ronda 29 (C34): fase 2.5 — arranque guiado, huella de empresa, «Tu semana» y retos.
- 2026-11-07 · Ronda 30 (C35–C37): pendientes del punto 14 anotados y hechos los puntos 3–6 (foto semanal en el servidor, evolución, reto de la semana y ciclo de las ideas). Ver `ronda30/LEEME.md`.
- 2026-11-08 · Ronda 31 (C40): visión de «última generación», auditoría (13,5/20) y trabajo autónomo sobre sus hallazgos. Ver `ronda31/`.
- 2026-11-08 · Ronda 32 (C42): arreglos móviles (comparador y tarjetas de Explorar) y propuesta de grandes cambios (`ronda32/PROPUESTA.md`).
- 2026-11-08 · C43: Javier decide la hoja de ruta (Liga + Comunidad + Perfil; toda la UX y el desarrollo; funcionalidad después; publicar al final). Ver `ronda33/PLAN.md`.
- 2026-11-08 · Ronda 33 (C44): fase 1 (cimientos), primera parte: pruebas en paralelo, hoja de estilo única con tokens fusionados y DESIGN.md, embudo anónimo, utilidades a `base.js`.
- 2026-11-08 · Ronda 33 (C45): fase 1, segunda parte: Explorar y «Tu semana» en módulos, comparación visual de capturas y reintento declarado; fase 1 cerrada con 1216/0.
- 2026-11-08 · Ronda 34 (C46): fase 2, primera parte: pantalla «Hoy» con la cartera principal en grande y una sola acción.
- 2026-11-08 · Ronda 35 (C47–C49): inspiración (Darwinex Zero y vídeo); portada con rueda de esferas y «Hoy» con frase con iconos y rueda de la temporada.
- 2026-11-08 · C50: plan de marketing para hacer viral la app (`ronda36/PLAN-MARKETING.md`).
- 2026-11-08 · Ronda 36 (C50–C51): plan de marketing aprobado; reglas de la Liga; tarjeta para compartir, mayores de 18 y embudo sin almacenamiento en el dispositivo.
