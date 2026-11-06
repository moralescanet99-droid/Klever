# Ronda 5: cerrar los problemas concretos de la ronda 4

Se conservan la estructura, la paleta, la portada compacta, las posiciones móviles y la tabla de escritorio. No se ha rediseñado nada: solo se cierran los puntos pedidos.

> Este informe se genera con `tests/ronda5/informe.py` a partir de lo **observado** en una ejecución limpia de las cuatro baterías (`tests/ronda5/run-all.sh`). Las filas de la tabla de evidencias salen de `ronda5/evidencias-D.json`, no están escritas a mano.

## Qué se ha cambiado, punto por punto

**1. «Mis carteras»: las existentes primero.** La lista de carteras guardadas va primero; cada una muestra nombre, privada o pública, número de posiciones, total asignado y fecha. El formulario solo se abre con el botón «Nueva cartera» (y toma el foco). Si no hay ninguna cartera, crear es la acción principal: formulario abierto con «Crea tu primera cartera», sin botón «Nueva cartera» ni «Cancelar». *Fechas:* se añadió el campo real `actualizado_en` (migración `0006`), vacío hasta la primera modificación. Una cartera nunca modificada muestra «Creada el …» (dato real) y no «Modificada»; ninguna fecha se inventa. Una cartera con cambios sin guardar en este dispositivo lo indica con una etiqueta.

**2. Bloqueo visual de Guardar y Publicar.** La lógica ya impedía publicar a 103 %, pero **solo el botón primario tenía estilo de desactivado**: «Publicar cartera» (secundario) se veía igual que activo. Ahora todo botón desactivado lo muestra (borde discontinuo y texto atenuado) y **el motivo va pegado al botón**, en escritorio y en la barra inferior móvil. Las reglas se mantienen en interfaz y servidor:
- más del 100 %: no se guarda en la cuenta ni se publica; el borrador se conserva en el dispositivo;
- menos del 100 %: se guarda en privado como reparto incompleto, sin efectivo implícito;
- publicar exige el 100 %, al menos una posición y tesis.

*Cartera pública con una edición temporalmente inválida:* no modifica la versión publicada, y **no hace falta despublicar** para corregirla. La versión publicada es la última guardada válida; los cambios sin guardar se conservan en el dispositivo (también tras recargar) y, cuando el reparto vuelve a sumar 100 %, se guarda y la versión pública se actualiza. Dejar de publicar sigue siendo la vía para guardar un reparto incompleto.

**3. Estado de guardado sin depender del ⓘ.** Tres planos separados: *privacidad* (chip Privada/Pública), *validez del reparto* (resumen y motivo junto a la acción) y *persistencia* (texto explícito: «Guardada en tu cuenta», «Solo en este dispositivo», «Cambios sin guardar en tu cuenta», «No se pudo guardar»). Un error de asignación **no oculta** la persistencia: se lee «Cambios sin guardar en tu cuenta · copia en este dispositivo» junto al motivo del bloqueo. El ⓘ solo amplía. La confirmación flotante es «Cartera guardada», aparece arriba y no tapa campos editables. «Borrador» queda únicamente para lo que aún no está en la cuenta. *Se añadió* la copia local de los cambios sin guardar de las carteras de la cuenta (antes se perdían al recargar), con aviso de recuperación, conflicto entre dispositivos y «Descartar cambios sin guardar…».

**4. Resumen simplificado.** Visible: «Asignado: X %» (sin «100,0 % ✓ 100 % asignado»), la diferencia («Pendiente de asignar» / «Exceso de asignación») en una línea aparte y a tamaño normal, número de posiciones, ROIC medio de empresas con datos, cobertura y «No representa la rentabilidad de tu cartera». La fórmula, la media ponderada y las definiciones van al desplegable. «Sin dato: 2 fondos (no aplicable)» se sustituye por dos líneas distintas: **«Dato ausente (no disponible)»** y **«No aplicable»**. Categorías: nota breve «Los ETF se agrupan por tipo; no se desglosan sus empresas» y desarrollo en un desplegable.

**5. Explorar empresas en móvil.** Dos líneas por empresa: nombre y resultado; símbolo, sector y «Ver ficha» (con crecimiento para nombres y sectores largos). Buscador justo bajo el título, introducción de una frase y un único desplegable con metodología, significado de cada comprobación y orden. Un dato ausente se muestra en neutro como «no disponible», nunca como comprobación fallida. La tabla de escritorio no cambia.

**6. Ficha.** Cifra y unidad separadas («29,6» y debajo «miles de millones de USD») y la regla del criterio conserva al menos la mitad del ancho. El desplazamiento horizontal de la tabla histórica y la columna fija del año se han verificado de verdad (scroll con teclado), no solo la presencia de la instrucción. La portada no se ha tocado.

## Hallazgos de las propias pruebas (corregidos en esta ronda)
- A texto ampliado al 200 %, el panel «Publicación» plegado desbordaba la página (416 px sobre 390): su cabecera no podía partirse en dos líneas.
- El servidor no devolvía la marca de versión tras guardar: una copia local legítima se interpretaba como «cambios de otra sesión».
- En la ficha, la unidad larga dejaba la regla del criterio con el 46 % del ancho (ahora ≥ 50 %).
- En «Mis carteras» una regla antigua de la lista pisaba la nueva disposición y la tarjeta se desbordaba.

## Pruebas

**Automáticas (navegador automático Chromium, servidor local con base simulada y datos inventados):** {{TOTAL}} comprobaciones correctas y {{FALLOS}} fallos en la ejecución final limpia: batería A {{A}} (validaciones, estados y resumen), B {{B}} (móvil, orden, empresas, ficha y portada), C {{C}} (recorrido, otro navegador, errores, teclado, anchuras de 320 a 1440 px en ambos temas) y D {{D}} (los escenarios de la tabla siguiente). Estos totales **no sustituyen** a la tabla: lo que importa es lo observado en cada escenario.

**Tabla de escenarios** (evidencia = captura en `ronda5/evidencias/`, que se entrega en el zip, o «ver baterías» cuando el resultado se comprueba por texto y valores):

{{TABLA}}

**Manuales:** ninguna se ha ejecutado. Lo que no se puede hacer desde el entorno de trabajo queda **explícitamente pendiente** en `ronda5/pruebas-manuales.md` (teclado móvil real, lector de pantalla real, zoom real del navegador, Safari y Firefox, email real, conflicto entre dos dispositivos reales, TradingView, carga de la SEC).

**Qué es aproximado:** el teclado móvil (E15) se emula reduciendo la altura de la ventana; el «200 %» (E16a) es el tamaño de texto de la página, no el zoom del navegador; el «otro navegador» (E13b) es otro contexto de Playwright con almacenamiento separado.

## Decisiones que conviene revisar
- Una cartera pública que se edita a un reparto distinto pero válido (100 %) **se actualiza al guardar** sin pedir confirmación; la versión pública siempre es la última guardada válida.
- La copia local de cambios sin guardar vive en `localStorage` del dispositivo; si el navegador no persiste, la interfaz **no afirma** que haya copia.
- En móvil, la barra inferior muestra el motivo del bloqueo en lugar de la persistencia breve cuando el reparto no es válido; la persistencia completa sigue visible en la cabecera.
- «Carteras públicas» se mantiene como nombre (incluye las de usuarios).

## Fuera de alcance (futuro plan de pago, no implementado)
Conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión.

## Antes de desplegar
Aplicar `migrations/0006_actualizado_en.sql` en las bases existentes (en una base nueva basta `schema.sql`).
