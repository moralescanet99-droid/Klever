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

## Ronda 5 (cerrar problemas concretos de la ronda 4)
- **Mis carteras: las existentes primero.** Lista de carteras con nombre, Privada/Pública, número de posiciones, total asignado y fecha; botón «Nueva cartera» que abre el formulario solo a petición; **sin carteras, crear es la acción principal** (formulario abierto, sin «Cancelar»). El resumen por cartera (posiciones y total) lo calcula el servidor.
- **Fechas reales, no inventadas:** columna nueva `portafolios.actualizado_en` (migración 0006), NULL hasta la primera modificación. La lista muestra «Modificada el …» solo si existe y, si no, «Creada el …» (dato real de `creado_en`). El servidor devuelve la marca de versión en cada PATCH.
- **Botones desactivados con aspecto de desactivados (todos).** La causa de que «Publicar» pareciera disponible a 103 % era que solo el botón primario tenía estilo `:disabled`. Ahora `.btn:disabled` cubre todos (secundario: borde discontinuo y texto atenuado) y **el motivo va pegado al botón** (a su lado en escritorio; en la barra inferior en móvil).
- **Cartera pública y edición temporalmente inválida:** se bloquea guardar (cliente y servidor) pero **no hace falta despublicar**. La versión publicada es la **última guardada válida**; los cambios sin guardar se conservan en el dispositivo; al volver a ser válido el reparto (100 %) se guarda y la versión pública se actualiza, sin despublicar. Dejar de publicar sigue siendo la vía para guardar un reparto incompleto.
- **Copia local de los cambios sin guardar de carteras de la cuenta** (`klever_edit_<id>`, con la marca de versión de la que parten). Al recargar se **recuperan** (aviso «Hemos recuperado tus cambios sin guardar»); si la cartera cambió desde otro sitio se pregunta qué conservar; hay «Descartar cambios sin guardar…» en el menú. Si `localStorage` no persiste, no se afirma que haya copia (`store.ok`).
- **Estado en tres planos, explícito y sin depender del ⓘ:** *privacidad* (chip Privada/Pública), *validez del reparto* (resumen y motivo junto a la acción) y *persistencia* (texto: «Guardada en tu cuenta», «Solo en este dispositivo», «Cambios sin guardar en tu cuenta», «No se pudo guardar»; se añade «copia en este dispositivo» / «tus cambios siguen en este dispositivo» cuando es cierto). Un error de asignación **no oculta** la persistencia. El ⓘ solo amplía (diálogo con persistencia, validez y privacidad).
- **Móvil:** la cabecera del editor muestra la persistencia completa; la barra inferior muestra «Asignado: X %» y, en la segunda línea, el **motivo del bloqueo si lo hay** y si no la persistencia breve.
- **Aviso flotante:** arriba de la pantalla (no tapa campos editables) y con el texto corto «Cartera guardada». La palabra «borrador» queda solo para lo que aún no está en la cuenta.
- **Resumen simplificado:** «Asignado: X %» (el exceso o lo pendiente en una línea aparte, a tamaño normal, legible a 360 px); cobertura con líneas separadas «Dato ausente (no disponible)» y «No aplicable» (fondos); fórmula, media ponderada y definiciones en el desplegable; nota breve de categorías «Los ETF se agrupan por tipo; no se desglosan sus empresas» con el desarrollo en un desplegable.
- **Explorar empresas en móvil:** lista de dos líneas por empresa (línea 1: nombre y resultado; línea 2: símbolo, sector y «Ver ficha»), tabla solo en escritorio, buscador justo bajo el título, introducción de una frase y un único desplegable con metodología, significado de cada comprobación y orden. Un dato ausente se muestra en neutro como «no disponible», nunca como comprobación fallida.
- **Ficha:** cifra grande y **unidad debajo** («29,6» / «miles de millones de USD»); la regla del criterio conserva al menos la mitad del ancho; tabla con desplazamiento horizontal real y columna del año fija.
- **Texto ampliado:** las cabeceras de los paneles plegables pueden partirse en varias líneas (a 200 % «Publicación» desbordaba la página).
- **Evidencias:** cada escenario de la batería D registra *esperado, observado y evidencia*; la tabla del informe se **genera** de esas observaciones (`tests/ronda5/tabla.py`), no se escribe a mano. Las pruebas manuales no ejecutables quedan listadas como pendientes (`ronda5/pruebas-manuales.md`).

## Fuera de alcance de la beta (futuro plan de pago)
- **No implementar**: conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión. Decisión del usuario en la ronda 5. Además chocarían con las restricciones actuales (sin recomendaciones personalizadas, sin dinero real, sin cobrar).
