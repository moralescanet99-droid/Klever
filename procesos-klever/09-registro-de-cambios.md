# 09 · Registro de cambios

**Solo se añade al final.** Formato: fecha · commit · qué cambió · cómo se comprobó. Las entradas anteriores a esta carpeta se reconstruyeron del historial de git.

| Fecha | Commit | Qué cambió | Comprobación |
|---|---|---|---|
| 2026-11-01 | `2535232` | Repositorio inicializado | — |
| 2026-11-03 | `6c08091` | Esqueleto: Pages + Functions + D1, esquema de 6 tablas, ingesta SEC, API, editor con plantillas, mini gráficos | Sintaxis y esquema |
| 2026-11-03 | `455bd98` | Ranking de ideas (5 criterios), ficha, screener de TradingView | Sintaxis |
| 2026-11-03 | `30dc520` | Carteras públicas, `legal.html` borrador, `data/demo.sql` | Sintaxis, esquema |
| 2026-11-03 | `99df5eb` | Acceso por enlace mágico (Brevo), sesiones por dispositivo | Local con D1 simulada |
| 2026-11-03 | `9c8d2f1` | `PENDIENTES.md` | — |
| 2026-11-03 | `53ed731` | Plantilla suma 100 %; registro antes de carteras públicas | Navegador automático |
| 2026-11-03 | `895ecf6` | Universo de 125 activos | JSON válido, sin duplicados |
| 2026-11-03 | `d69dbb7` | Corrige desborde horizontal en móvil | Navegador automático |
| 2026-11-03 | `eede586` | Consentimiento de cookies, casilla legal, último acceso, métricas, estados de error | Navegador automático |
| 2026-11-03 | `75c16b4` | Portada con propuesta de valor, prueba sin registro, guardar/publicar separados, cifras claras, ideas con buscador | Navegador automático |
| 2026-11-03 | `de56340` | La tabla del editor cabe en móvil | Navegador automático |
| 2026-11-03 | `5d999a6` | **Rediseño completo** (ronda 3): portada, editor como espacio de trabajo, móvil específico, sistema visual, acceso en diálogo, ficha | 100 comprobaciones; contraste de 32 combinaciones |
| 2026-11-03 | `b45376e` | **Ronda 4**: regla única de guardar/publicar (cliente y servidor), resumen exacto, cabecera y barra móviles compactas, orden en una columna, empresas con encabezados, ficha móvil, portada afilada, aviso de enlace en otro dispositivo; migración 0005 | 130 comprobaciones; servidor comprobado directamente; matriz de anchuras 320–1440 |
| 2026-11-03 | `a842619` | Demo pública autónoma `demo/index.html` | 12 comprobaciones sobre servidor estático |
| 2026-11-03 | `2692b08` | Instrucciones del paquete de la ronda 4 para ChatGPT | — |
| 2026-11-03 | *(este commit)* | **Memoria del proyecto**: `procesos-klever/` (10 archivos) y `CLAUDE.md` en la raíz; el script de construcción de la demo pasa de un directorio temporal a `scripts/demo/` (reproduce `demo/index.html` byte a byte) | `cmp` de la demo regenerada |

<!-- Añade las entradas nuevas debajo de esta línea, una fila por tarea. -->
