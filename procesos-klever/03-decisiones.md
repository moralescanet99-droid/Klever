# 03 · Decisiones y su motivo

Formato: **decisión** · motivo · dónde está. Las más recientes al final de cada bloque. Si una decisión se revoca, no se borra: se añade una línea «Sustituida por…».

## Arquitectura y datos
- **Cloudflare Pages + Functions + D1, sin framework ni dependencias** (JavaScript puro). Coste 0 € y despliegue simple. `functions/`, `public/`, `schema.sql`.
- **Fundamentales vía GitHub Actions nocturno → D1**, no con un cron de Workers: el plan gratuito de Workers permite 50 llamadas externas por ejecución. `.github/workflows/nightly.yml`, `scripts/fetch_fundamentals.mjs`.
- **Lectura de SEC con ~5 peticiones/s** (el límite es 10) y User-Agent obligatorio (secreto `SEC_USER_AGENT`).
- **ROIC, EBITDA y caja libre son cálculos aproximados** nuestros a partir de los conceptos XBRL; se dice así en la interfaz. ROIC ≈ resultado operativo × (1 − tasa) ÷ (deuda LP + patrimonio − caja).
- **Ranking de ideas = 5 comprobaciones** (deuda neta < 2,5× EBITDA; ROIC > 10 %; margen neto > 10 %; caja libre > 0; ventas crecen). Una comprobación sin dato no suma ni resta. Orden: comprobaciones superadas (desc) y símbolo (A–Z) en empates. *Los umbrales son una propuesta inicial, ajustables.*
- **Universo de 125 activos** (105 acciones + 20 ETFs) elegidos a mano; sin tickers con punto o guion (BRK.B…) porque la API los rechaza; sin emisores extranjeros que no presentan 10-K. `data/universe.json`.
- **Bancos y aseguradoras salen con comprobaciones «no disponibles»** porque no publican deuda/EBITDA con los mismos conceptos. No es un fallo.

## Acceso y cuentas
- **Acceso por enlace mágico, sin contraseña**, enviado con **Brevo** (plan gratuito, 300 emails/día, remitente verificado sin dominio). Se descartó Resend: sin dominio verificado solo envía al propio titular, y un dominio cuesta dinero.
- **Tokens guardados como hash**; enlace de un solo uso (15 min), canjeado por **POST** (los previsualizadores de email no lo consumen); **sesiones por dispositivo** de 30 días; límites de 1 envío/min y 5/día por email; la respuesta es igual exista o no el email.
- **El registro exige aceptar aviso legal y privacidad**; se guarda cuándo (`usuarios.acepto_en`). Se guarda el último acceso por sesión (máx. 1 escritura/hora) para medir «usuarios que vuelven». `scripts/metrics.sql`.
- **El borrador local nunca sale del dispositivo.** Si el enlace se abre en otro navegador no se guarda nada y se avisa; el servidor solo recuerda un indicador (`enlaces.con_borrador`). Un borrador con exceso de asignación **no se reescala en silencio** (decisión de la ronda 4; antes sí se hacía).

## Producto
- **Probar sin registro**: las plantillas abren un editor con borrador en `localStorage`; el email se pide al guardar y el borrador pasa a la cuenta si el enlace se abre en el mismo navegador.
- **Guardar y publicar son acciones separadas**; publicar es secundaria y está plegada.
- **Regla única de composición** (interfaz y servidor, `functions/_lib.js` y `validar()` en `public/app.js`):
  - pesos válidos: cada uno > 0 y ≤ 100;
  - total > 100 %: no se guarda ni se publica («Exceso de asignación»);
  - total < 100 %: **reparto incompleto**: se guarda en privado; **no se publica**; **no existe efectivo implícito** («Pendiente de asignar»);
  - publicar exige 100 %, al menos una posición y tesis;
  - una cartera pública debe mantener el 100 % (si no, hay que dejar de publicarla);
  - «Dejar de publicar» siempre disponible.
- **Estado del editor en tres conceptos separados**: dónde está guardada (este dispositivo / tu cuenta), cambios pendientes (`rev` frente a `savedRev`), visibilidad (Privada/Pública). Corrige el fallo en que editar durante un guardado se marcaba como guardado.
- **Sección «Carteras públicas»** (no «de ejemplo»): incluirá las que publiquen los usuarios. Etiquetas veraces: «Ejemplo de Klever» / «Publicada por un usuario» (calculadas en servidor, sin exponer emails). Los ejemplos van primero. Descripciones de los ejemplos: breves y completas (`data/demo.sql`).
- **Etiquetas del resumen**: «100 % asignado», «Pendiente de asignar: X %», «Exceso de asignación: X %»; «Distribución por **categorías**» (mezcla sectores y tipos de fondo; no es exposición sectorial de los ETF); «ROIC medio de empresas con datos» con «No representa la rentabilidad de tu cartera»; cobertura por posiciones y por peso (denominador = peso asignado); media **ponderada**; **«No aplicable»** (fondos) frente a **«No disponible»** (dato ausente).
- **Pesos con 1 decimal y coma decimal**; número y unidad unidos con espacio duro. Una posición nueva entra con el peso que faltaba (o 5 si no falta).
- **Cookies de TradingView: consentimiento donde se usa** (en el hueco del gráfico o del screener), sin banner global; se cambia desde el pie. Sin consentimiento no se carga nada de TradingView.

## Interfaz
- **Rutas por vista con hash**: `#inicio`, `#empresas`, `#publicas`, `#carteras`, `#cartera` (borrador) y `#cartera-<id>`. Compatible con las restricciones de los artefactos (solo `#nombre` simple).
- **Móvil específico, no tabla comprimida**: cabecera global de 61 px con menú accesible; barra inferior de 72 px (total, estado breve, acción); posiciones como lista plana con detalles desplegables y nombre completo; sin botón de guardar duplicado; estado completo en un diálogo «Estado de tu cartera»; la barra se oculta con el teclado virtual.
- **Orden en una columna** con `display: contents` + `order`: resumen breve → posiciones → resumen detallado → gráficos → publicación. En escritorio, dos columnas y resumen lateral fijo.
- **Sistema visual**: fondo #F6F8FB, superficies blancas, texto #17212F, acento #0F766E; radio 12 px; espacios 8/16/24/32; ancho máximo 1200 px; **sin fuentes externas** (pila del sistema) por privacidad y rapidez; **contraste verificado ≥ 4,5:1 (texto) y ≥ 3:1 (controles y foco)** en claro y oscuro; tema oscuro con superficies propias.
- **Accesibilidad**: combobox ARIA para el buscador, diálogos nativos `<dialog>`, foco visible de 3 px, objetivos táctiles ≥ 44 px, `aria-live` para estados, tablas con `caption` y `scope`.
- **Explorar empresas**: tabla con encabezados, «Ver ficha» visible, filas de 60 px, **sin paginación** (se pidió expresamente no inventarla) y enlace «Ir a los filtros de precio».

## Proceso y entrega
- **Demo interactiva con servidor simulado** dentro de la página, con datos inventados y aviso visible. Se publicó como artefacto privado y como archivo autónomo `demo/index.html` (para Cloudflare Pages, con `noindex`).
- **Paquetes de revisión para ChatGPT**: capturas (≤ 8000 px por lado; las largas se parten) + `INSTRUCCIONES_PARA_CHATGPT.md`; el usuario copia el texto bajo la primera línea `---`.
- **Los scripts de prueba viven en `tests/ronda4/`** y las capturas pesadas fuera del repositorio (`.gitignore`).
- **Memoria del proyecto en `procesos-klever/` + `CLAUDE.md` en la raíz** para que cualquier sesión retome el contexto.
