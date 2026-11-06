# Rediseño de Klever: antes y después

Este paquete compara la interfaz anterior con la rediseñada, con los mismos tamaños y temas.

## Qué contiene
- `antes/` (32 imágenes) y `despues/` (56 imágenes), en **360, 390, 768 y 1440 px** y en **tema claro y oscuro**.
- Las cuatro pantallas comparables llevan el mismo número en las dos carpetas:
  - `01-portada-…`: página de inicio completa.
  - `02-editor-…`: editor tras elegir la plantilla «Dividendos», sin cuenta (página completa).
  - `03-acceso-…`: lo que aparece al pulsar guardar sin haber entrado.
  - `04-ficha-…`: ficha de la tercera empresa del ranking.
- Solo en `despues/`: `02b-editor-viewport-real-…` (el editor tal como se ve en pantalla, con la barra inferior fija), `03b-acceso-enlace-enviado-…`, `05-editor-con-cuenta-cambios-sin-guardar-…`, `05b-editor-con-publicacion-abierta-…` y `06-explorar-empresas-…`.

## Lo que hay que saber de las capturas
- **Datos inventados.** Son de una base local de prueba con 125 activos y cifras aleatorias. Algunos bancos salen «sin dato» a propósito para probar la cobertura. Ninguna cifra es real.
- **Gráficos de TradingView:** salen como recuadros con el botón «Cargar», porque el entorno de captura no tiene Internet y el consentimiento no está dado.
- **«Modo desarrollo: entrar»** aparece en `03b` porque el servidor de pruebas devuelve el enlace en pantalla en vez de enviar un email. En producción no existe.
- **Capturas de página completa en móvil:** la barra inferior de guardado es fija. En las capturas `02-editor-…` de `despues/` se coloca al final de la página para que no tape contenido. La captura `02b` muestra cómo se ve de verdad.
- Las capturas «antes» incluyen el diseño anterior completo, con su aviso largo y la tabla de empresas en la portada.

## Qué se ha implementado
**Portada:** cabecera compacta (marca, «Explorar empresas», «Carteras públicas», «Entrar»), titular «Crea y entiende tu cartera simulada», una frase y un único botón principal («Probar una cartera»), tres plantillas con descripción y símbolos, vista previa real del editor en escritorio (calculada con los mismos datos y funciones que el editor), muestra de 3 carteras públicas. El listado completo de empresas y el screener están ahora en «Explorar empresas».

**Editor como espacio de trabajo:**
- Cabecera con nombre editable, estado (Borrador, Privada o Pública), estado de guardado y botón principal «Guardar cartera».
- Escritorio: posiciones en dos tercios y resumen fijo en el tercio restante, con total asignado, falta o sobra, número de posiciones, ROIC medio con su cobertura y distribución por sector.
- Pesos editables en la propia tabla, con coma decimal, cifras alineadas a la derecha y números de ancho uniforme.
- Buscador de activos por nombre o símbolo, con el patrón accesible de combobox y manejo por teclado.
- «Reemplazar por la plantilla» y «Eliminar cartera» en el menú «Más acciones», ambos con confirmación.
- Publicación en un bloque plegado y como acción secundaria. Gráficos de precio en una sección plegada aparte.

**Móvil, diseñado aparte:** cada posición es una fila compacta (símbolo y nombre a la izquierda, peso editable a la derecha, detalles desplegables), márgenes de 16 px, controles de al menos 44 px, número y unidad unidos (espacio duro), y una barra inferior con el total asignado y «Guardar cartera». El contenido reserva espacio para esa barra.

**Sistema visual:** fondo #F6F8FB, superficies blancas, texto #17212F y acento #0F766E. Espacios de 8, 16, 24 y 32 px, radio de 12 px, ancho máximo de 1200 px, cuerpo de 16 px. Sin fuentes ni librerías externas. Tema oscuro con superficies y estados propios (no es una inversión de colores).

**Estados y textos:** acceso en un diálogo «Guarda tu cartera / Te enviaremos un enlace para entrar sin contraseña» sin presentación roja; tras enviar, confirmación con el email, «Cambiar email» y «Reenviar enlace» con cuenta atrás de 60 s; el borrador se conserva durante todo el proceso. Estados de guardado: «Guardando…», «✓ Guardado», «Cambios sin guardar» y «Error al guardar: …».

**Ficha:** cabecera con empresa, símbolo, sector y periodo; las cinco comprobaciones en filas (criterio, valor y resultado con icono y texto); «Sin dato» explicado; metodología, fuentes y glosario plegados; el ROIC se explica como medida de la empresa, no como rentabilidad del inversor. La cobertura del ROIC medio se indica siempre y los activos sin dato se excluyen, nunca cuentan como cero.

## La causa del «Guardado» y «Cambios sin guardar» a la vez
Había dos causas:
1. **En la captura:** el aviso «Hemos guardado tu cartera…» (que dura 4 segundos) seguía visible cuando mi guion de captura ya había editado un campo. Los dos mensajes eran ciertos en momentos distintos, pero se veían juntos porque el aviso no desaparecía al cambiar el estado.
2. **Un fallo real, más grave:** al guardar, el código marcaba «sin cambios» al terminar, aunque el usuario hubiera seguido editando mientras tanto. Esas ediciones se mostraban como guardadas sin estarlo.

Ahora hay una sola fuente de verdad (una versión de los cambios frente a la última versión guardada), el aviso se retira al editar y hay una prueba específica con un guardado lento y una edición en medio.

## Decisiones que conviene revisar
- **«Carteras públicas» en lugar de «Carteras de ejemplo».** El listado incluye las carteras que los usuarios publiquen, y llamarlas «de ejemplo» sería inexacto. Si prefieres «de ejemplo» mientras solo haya carteras de demostración, es cambiar una etiqueta.
- **Nombre editable** requería poder guardarlo: el servidor ahora acepta `nombre` al editar una cartera.
- «Guardar cartera» se desactiva si no hay cambios, si los pesos suman más de 100 % o si alguna posición no tiene peso. El motivo se explica en el estado.

## Qué está probado y qué no
**Probado con un navegador automático (Chromium), 100 comprobaciones superadas:**
- Portada, editor, acceso, ficha y estados de error y vacío.
- El recorrido completo: plantilla, edición, guardar, enviar enlace, reenviar, cambiar email, entrar, borrador migrado a la cuenta, recargar, volver a abrir, publicar, despublicar, reemplazar y eliminar.
- Guardado lento, error de red al guardar y reintento.
- Teclado (saltar al contenido, menú, buscador), foco visible de 3 px.
- Ausencia de desbordamiento horizontal a 320, 360, 390, 720, 768 y 1440 px en claro y oscuro, en portada, empresas, públicas, editor con nombres largos, acceso y ficha.
- Contraste: las 32 combinaciones de color de ambos temas cumplen (texto ≥ 4,5:1, controles y foco ≥ 3:1).

**Implementado pero NO probado:**
- Safari y Firefox (solo Chromium).
- Lector de pantalla real: las etiquetas, regiones y el combobox siguen el patrón estándar, pero no los he oído leídos.
- Ampliación al 200 % del navegador: la he aproximado con ventanas de 720 y 320 px de ancho, que es el criterio de reflujo, no el zoom real.
- Dispositivos táctiles reales y la barra inferior con el teclado del móvil abierto.
- Cloudflare D1 real, el envío por Brevo y los widgets de TradingView: todo en local con servicios simulados.

## Qué no se añadió
Ninguna dependencia, ninguna fuente externa, testimonios ni rentabilidades ficticias. No se añadieron funciones nuevas fuera de las pedidas.
