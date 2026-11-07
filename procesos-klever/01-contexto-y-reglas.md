# 01 · Contexto y reglas

## Qué es Klever
Web beta, **gratuita y educativa**, para inversores particulares. Permite:
- Crear **carteras simuladas** a partir de plantillas (oro, dividendos, crecimiento) y ver su composición, el reparto por categorías y el ROIC medio.
- **Explorar empresas** de EE. UU. con un ranking propio de cinco comprobaciones sobre cifras oficiales de la SEC.
- Ver **carteras públicas** (ejemplos de Klever y las que publiquen usuarios): solo composición y tesis, nunca rentabilidad.

**Sin dinero real. Sin recomendaciones personalizadas. Sin cobrar durante la beta.**

> **Actualización 2026-11-06 (ronda 26, C22):** público prioritario **20–30 años con poca experiencia en bolsa**. Promesa: **«descubre alternativas y compara tus opciones antes de invertir»**. Núcleo: **Cartera → Descubrimiento → Comparación → Decisión → Revisión**. Prioridad: que se entienda de forma visual, interactiva y rápida, con poco texto. Se conserva la estética carbón y cobre; azul solo para lo simulado y verde para estados correctos. Palabras de la interfaz: «cartera», «idea», «empresas que sigo». Plan para llevar cada aspecto a 10: `ronda28/PLAN.md`.

## Objetivo de la beta
Validar en **un mes y con coste 0 €** si a inversores particulares les interesa organizar varias carteras y ver ideas de empresas. Meta: unas **200 visitas al día** al cabo de un mes. Decisión con tres datos: registros, carteras creadas por usuario y usuarios que vuelven pasada una semana.

## Recorrido que hay que proteger
**probar una cartera → comprenderla → guardarla → volver a consultarla.**
Principio de diseño (tomado de Administrea y la app de recordatorios de WhatsApp): que la persona entienda *qué ocurre, qué requiere atención y qué hacer después* sin leer instrucciones largas.

## Restricciones (no negociables salvo que el usuario diga lo contrario)
- **Coste 0 €**: Cloudflare Pages + Functions + D1, GitHub Actions, Brevo (plan gratuito).
- **Datos de empresas**: solo públicos de **SEC EDGAR** (User-Agent con app + correo; ≤ 10 peticiones/s).
- **Precios**: solo con **widgets de TradingView intactos** (marca visible); **no se leen, extraen ni guardan**. Sus términos limitan los datos a visualización y no permiten uso comercial sin acuerdo.
- No usar APIs gratuitas de precios (Tiingo, FMP): su plan gratuito es de uso interno.
- **Legal**: contenido educativo, no asesoramiento; consultar a un abogado antes de permitir copiar carteras con dinero real (MiFID II, CNMV). Las cookies de TradingView se piden **donde se usan**.
- **Futuro plan de pago (NO implementar en la beta):** conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión.
- Prohibido: testimonios inventados, rentabilidades ficticias, dependencias de pago, funciones nuevas que distraigan de la beta.
- Idioma: **español de España** en toda la interfaz y documentación.

## Preferencias de trabajo del usuario
- Quiere que se **distinga siempre lo implementado de lo probado y de lo pendiente**, y que no se afirme lo no comprobado.
- Usa **ChatGPT como revisor externo** de diseño e interacción: se le entregan paquetes (capturas + instrucciones) y el usuario devuelve su feedback.
- Prefiere respuestas directas y recomendaciones claras antes que listados de opciones.
- No ha pedido ningún pull request: **no crear PR** salvo petición expresa.
- Trabajar y publicar solo en la rama designada (ver `10-referencias.md`).
- Las tareas que solo puede hacer el usuario (cuentas, claves, despliegue) se dejan documentadas en `PENDIENTES.md`.

## Quién interviene
- **El usuario**: propietario del proyecto; decide y gestiona las cuentas externas.
- **Claude (esta sesión)**: diseña, programa, prueba y documenta.
- **ChatGPT**: revisor externo de diseño e interacción (solo ve capturas y texto).
