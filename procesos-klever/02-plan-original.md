# 02 · Plan original

Resumen fiel del documento **«Plan web de portafolios (beta gratuita)»** (Claude Doc del usuario, fecha 03/11/2026). Enlace en `10-referencias.md`. Si el documento cambia, este resumen puede quedar desfasado: el documento manda.

## Objetivo y alcance
Validar en un mes y con 0 € si a inversores particulares les interesa organizar varios portafolios (riesgo, oro, dividendos) y ver ideas de empresas baratas.
- Meta: ~200 visitas/día al cabo de un mes.
- Beta gratuita, sin cobrar, sin dinero real, sin recomendaciones personalizadas.
- Universo: 100–150 empresas y ETFs de EE. UU. elegidos a mano.
- Decisión: registros, portafolios creados por usuario y usuarios que vuelven pasada una semana.

## Reglas legales y de datos
- Calcula solo con datos públicos de la SEC y muestra precios únicamente con widgets de TradingView intactos; no guarda ni redistribuye precios de terceros.
- **SEC EDGAR**: dominio público, API gratuita; User-Agent obligatorio (app + correo); máx. 10 peticiones/s.
- **TradingView**: widgets gratis con su marca visible; términos limitan datos a visualización, prohíben crear productos basados en su contenido y no permiten uso comercial sin acuerdo. Revisar las secciones 3 y 4 de sus términos antes de lanzar (el documento avisa de que se leyeron a través de un resumen).
- **Tiingo y FMP**: plan gratuito de uso interno; mostrar datos a terceros exige licencia. No se usan en la beta.
- Sin cobrar mientras dure la beta: monetizar exige acuerdo con TradingView y licencia de precios.
- Aviso legal: contenido educativo; abogado antes de permitir copiar carteras con dinero real.

## Arquitectura a coste cero
Tarea nocturna (GitHub Actions) lee de SEC y guarda fundamentales en **Cloudflare D1**; la web (**Cloudflare Pages**) los sirve desde ahí; los precios y gráficos llegan al navegador desde los widgets de TradingView.

## Esquema de base de datos (6 tablas en D1)
`usuarios` (id, email, creado_en) · `activos` (ticker, nombre, tipo, sector, cik) · `fundamentales` (ticker, periodo, ingresos, beneficio_neto, deuda_neta, ebitda, flujo_caja_libre, roic) · `portafolios` (id, usuario_id, nombre, plantilla, publico, creado_en) · `posiciones` (portafolio_id, ticker, peso, fecha_entrada) · `ideas` (ticker, criterios_cumplidos, calculado_en). No hay tabla de precios.
*(Después se añadieron `enlaces` y `sesiones`, y columnas nuevas: ver `03-decisiones.md`.)*

## Plan de 4 semanas
1. **Base**: Cloudflare, Pages, D1 con el esquema, tarea nocturna de GitHub Actions que lee de SEC los fundamentales de 100–150 empresas.
2. **Portafolios**: crear por plantilla (riesgo, oro, dividendos) con pesos; composición, peso por sector y calidad media; mini gráfico de TradingView por posición.
3. **Ideas**: screener propio solo con fundamentales (deuda/EBITDA, ROIC, márgenes, flujo de caja, crecimiento); ficha de empresa que explica por qué aparece; bloque aparte con el screener de TradingView para filtros de precio; registro de usuarios.
4. **Lanzamiento**: textos legales, fuentes citadas, analítica gratuita de Cloudflare, portafolios públicos simulados (composición y tesis) y primeros usuarios.

## Limitaciones y punto de decisión
- Sin precios propios no hay rendimiento ni riesgo calculados por nosotros; el primer gasto razonable será una licencia de precios si la beta funciona.
- No se calculan rendimiento, caída máxima ni correlación entre portafolios.
- Los portafolios públicos muestran composición y tesis, no historial de rentabilidad.
- Los filtros que dependen del precio (p. ej. PER) se ofrecen solo con el screener de TradingView, sin mezclarlos en el ranking propio.
- Cloudflare Workers gratis permite 50 llamadas externas por ejecución; por eso la lectura de SEC va en GitHub Actions y no en un cron de Workers.
- Si tras un mes hay registros y usuarios que vuelven: contratar licencia de precios, pedir acuerdo a TradingView si se va a cobrar y consultar a un abogado.

## Fuentes que citaba el plan
SEC EDGAR (artículos de dev.to sobre la API gratuita y el límite de 10 req/s), términos y widgets gratuitos de TradingView, comparativas de Tiingo/Massive y FMP, límites de Cloudflare Workers/Pages y precios de D1. *Nota:* varias son artículos o páginas comerciales, no documentación oficial; conviene contrastarlas con la fuente primaria.
