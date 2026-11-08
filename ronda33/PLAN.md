# Hoja de ruta decidida por Javier (C43, 2026-11-08)

**Decisión:** producto = **Liga + Comunidad + Perfil y objetivo**; experiencia de usuario = **todo lo propuesto**; desarrollo = **todo lo propuesto**; funcionalidad = **más adelante** (apuntada abajo); **publicar la web, lo último**.
Origen: `ronda32/PROPUESTA.md`. Regla de oro de siempre: cada fase se declara hecha solo con pruebas en verde y su informe; lo no comprobado se dice.

## Orden de trabajo (y por qué)
El desarrollo va primero porque todo lo demás se construye encima: hacerlo sobre 31 capas de código y 5 hojas de estilo multiplicaría el trabajo y los fallos.

| Fase | Qué | Incluye | Depende de |
|---|---|---|---|
| **1 · Cimientos (desarrollo)** | Reordenar el código, un solo sistema de diseño, pruebas rápidas y medición | un módulo por pantalla; tokens y componentes únicos (fuera las 5 hojas superpuestas); paso de construcción ligero (Vite, compatible con Cloudflare Pages); pruebas de componentes + pocas de recorrido + comparación visual de capturas (objetivo < 5 min); embudo de eventos propio sin datos personales | — |
| **2 · Experiencia nueva (UX)** | Las cinco piezas de la propuesta | pantalla **«Hoy»** y navegación **Hoy · Carteras · Descubrir**; **menos texto** (máx. 12 palabras por bloque, un sello legal, animaciones en vez de explicaciones); **Descubrir como feed** (tarjetas que se deslizan, historias); **editar la cartera con los dedos** (anillo arrastrable); **primer minuto «wow»** (cuenta después) | Fase 1 |
| **3 · Perfil y objetivo** | Klever se adapta a cada persona sin elegir empresas | 3 preguntas al empezar (para qué, horizonte, cuánto te inquietan las caídas); adapta misiones, ejemplos y umbrales de las señales; editable | Fase 2 |
| **4 · Comunidad** | Aprender de otros | paso 1: tu cartera frente a la comunidad (anónimo y agregado); paso 2: seguir y copiar carteras públicas como punto de partida, «cartera de la semana»; nunca ordenado por rentabilidad; comentarios abiertos **no** (necesitarían moderación) | Fase 3 |
| **5 · Liga** | Carteras simuladas que se mueven con el mercado, por temporadas | rentabilidad **simulada** de tu cartera con precios de cierre (un día de retraso); temporadas de 3 meses; comparación con la media de la comunidad; puntuación que premia **también el equilibrio**, no solo la subida; siempre «simulación · sin dinero · no es consejo» | Fases 3–4 y **una fuente de precios legal y gratuita** (ver bloqueo) |
| **6 · Publicar la web** | Despliegue real | Cloudflare Pages + D1, SEC real, Brevo, analítica sin cookies, revisión legal antes de abrir al público | Cuentas de Javier |

## Bloqueo de la Liga: la fuente de precios
Las reglas actuales (`procesos-klever/01-contexto-y-reglas.md`) dicen: precios **solo** con widgets de TradingView (no se pueden leer ni guardar) y **no** usar APIs gratuitas cuyo plan sea de uso interno (Tiingo, FMP). Javier aprueba la Liga (C43), así que la regla de «sin rentabilidades» cambia **para la simulación**, pero sigue haciendo falta una fuente de precios de cierre **gratuita y cuyas condiciones permitan este uso**. Antes de la fase 5 investigaré las fuentes y sus condiciones y le presentaré opciones (gratuitas que lo permitan, de pago, o una alternativa). **Hasta entonces la Liga se construye con precios de prueba rotulados.**

## Funcionalidad aplazada (C43: «la dejamos para más tarde»)
- Datos reales de la SEC (ya pendiente para la publicación).
- Avisos fuera de la web: correo semanal (Brevo) y notificaciones push de la web instalada.
- Calendario de resultados de tus empresas.
- Importar tu cartera desde un CSV del bróker.
- Comparar hasta 4 empresas con gráficos.
- Funcionar sin conexión (service worker).
- Exportar o compartir una imagen de tu cartera.
- (Crecimiento) Páginas públicas indexables por empresa y por comparación; imagen para compartir; Revista enlazada a misiones.

## Lo que no cambia
Coste 0 €; sin dinero real; sin recomendaciones ni «compra esto»; español de España; distinguir implementado / probado / pendiente; la memoria del proyecto al día.
