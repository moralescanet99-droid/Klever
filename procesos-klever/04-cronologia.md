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

## Después de la ronda 4
- Se pidió crear esta memoria del proyecto (`procesos-klever/` y `CLAUDE.md`). Ver `09-registro-de-cambios.md`.
