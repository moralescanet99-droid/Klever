# Ronda 11: incidencias visuales cerradas y primera pantalla con identidad propia

Ronda de **una pantalla de referencia** (el editor de cartera, escritorio y móvil) más dos incidencias de la ronda 10. Se conservan las garantías técnicas (guardado atómico, revisiones y conflictos, recuperación local, respuestas tardías, publicar/retirar, separación público/privado, ejecutor que falla ante errores). Reglas financieras sin cambios.

> Informe generado con `tests/ronda11/informe11.py` a partir de `ronda11/resultado-ejecucion.txt` y `ronda11/evidencias-*.json`. **Código con el que se obtuvo el resultado: commit `{{COMMIT}}`** ({{ARBOL}}). Para repetirlo: `git checkout {{COMMIT}}` y `LEEME-PRUEBAS.md`. **Resultado**: {{RESUMEN}}

## 1. Incidencias cerradas
**H1 de la ronda 10 daba por superado un solape.** La prueba excluía las muestras «pegado» y solo comprobaba el inicio, de modo que podía pasar sin muestras elegibles (el informe de la ronda 10 llegó a registrar un solape con «estado» y aun así quedó en verde). **Reescrita** (`tests/ronda10/testH.cjs`): cada fase exige un **mínimo de 6 muestras elegibles** (si no hay, falla); se prueba **al inicio de la página** (H1a) y **tras desplazarse** (H1c); y se distingue el **contenido que pasa por debajo de una zona fija** (normal, se recupera desplazando) de una **acción realmente inaccesible** (enfocada, queda tapada o fuera de la zona libre). Se validó con una **mutación**: quitando `scroll-padding-top` la prueba falla a 1440 px (el buscador queda bajo el aviso: 49–93 px con la zona libre desde 59 px) — `ronda11/mutacion-h1c.txt`.

**Comportamiento de los avisos corregido:**
- El aviso solo se **fija arriba** si es un **error** o hay sitio (escritorio); en móvil los éxitos no se fijan (los confirma además la barra inferior).
- `scroll-padding-top` (medido en JS con la altura real de la zona fija) hace que **lo enfocado o desplazado no quede nunca bajo el aviso**; la función de centrar el campo usa la zona libre entre aviso y barra.
- Botón de cierre **compacto** (✕, 44 px, nombre accesible «Cerrar aviso») en la misma fila: **el mensaje usa el ancho disponible**, sin fila extra.
- **Errores persistentes y trabajo sin cerrar el aviso** (H7): a 320×568 con texto al 200 % (simulado) y aviso de error abierto, la zona libre entre aviso y barra es ≥ 35 % de la ventana, se enfoca y edita el último peso y se alcanza «Guardar» sin cerrar el aviso. La **barra inferior** reorganizada: con texto muy ampliado el botón sube a todo el ancho y se oculta el total (consulta de contenedor en `rem`), con tope de 40 % de la ventana.
- **Legibilidad durante la animación** (H1b, H8): ya **no se anima la opacidad** (el texto es opaco en cada fotograma; solo cambia la altura) y el contraste se calcula **con la opacidad real** (la del aviso y la de sus ancestros, mezclada sobre el fondo) en cada muestra, no con los colores CSS a secas; con «reducir movimiento» el aviso aparece entero desde la primera muestra.

## 2. Dirección visual aplicada al editor
**Problemas de jerarquía de la pantalla anterior** (antes de editar): la composición, el dato principal, era una tabla de filas idénticas y su reparto visual quedaba abajo a la derecha; ROIC competía con el total (dos cifras grandes) y su advertencia ocupaba más que el reparto; «Guardar» aparecía gris y «⋯» tenía el mismo borde (acción principal poco inequívoca); cajas dentro de cajas con borde y sombra; filas sin referencia visual del peso; en móvil, campo con borde y chevron compitiendo, nombres cortados y tarjeta «Asignado» repetida.

**Decisiones aplicadas** (detalle y tokens en `ronda11/SISTEMA-VISUAL.md`):
- **Paleta y tipografía:** fondo cálido, superficies blancas, texto azul tinta, acento verde petróleo; pila del sistema (sin fuentes externas); cifras tabulares; escala tipográfica y de espaciado en tokens (también en oscuro).
- **Composición primero:** cifra del total + **barra de tramos con los pesos reales** (un tramo por posición, rayado para lo pendiente, contorno rojo para el exceso) arriba del panel; cada fila lleva el **punto del mismo color** y una **barra de peso** proporcional.
- **ROIC, secundario:** pasa tras la distribución por categorías, con cifra menor, advertencia, cobertura y el detalle en su desplegable (significado, límites y ausente ≠ cero conservados).
- **Una acción principal:** «Guardar» en acento sólido cuando hay cambios; el resto, discreto. Estado con punto de color + texto.
- **Menos cajas:** una capa blanca con línea fina, sin sombras; Resumen, Gráficos y Publicación planos con líneas.
- **Móvil:** la tabla no se traslada: filas táctiles con nombre completo, campo de peso suave y barra bajo cada fila; el resumen breve se integra en la composición (se elimina la repetición de «Asignado»); pie compacto.
- **Datos, no adornos:** todo lo gráfico sale de pesos y categorías existentes; no hay métricas ficticias ni rentabilidades.

Capturas comparables **antes/después** (320, 390 y 1440 px; estados normal, pendiente, error de guardado con título largo, pública con cambios privados y texto ampliado **simulado**): `ronda11/capturas/` e índice en `ronda11/CAPTURAS.md`.

## 3. Verificación de una entrega ZIP (A8 y el historial)
La revisión de ChatGPT superó 25 pruebas técnicas y A1–A7; **A8 se interrumpió porque el ZIP no contiene `.git`** (la prueba llamaba a `git ls-files`). Ahora:
- **A8 funciona en dos modos:** *repositorio* (con historial de ≥ 2 commits: además comprueba que `.dev.vars` nunca se versionó y que `wrangler.toml` nunca tuvo un `database_id` distinto del marcador) y *ZIP* (solo contenido; el resultado dice **«historial: NO verificado»**). Un repositorio **vacío o de un solo commit** creado a partir del ZIP se trata como ZIP: **no acredita historial**.
- `scripts/entrega/crear-zip.sh` crea el ZIP desde un commit limpio con `ENTREGA.json` (commit, fecha) y `MANIFEST-SHA256.txt`; `scripts/entrega/verificar-zip.sh` lo verifica sin repositorio (huellas, archivos prohibidos, secretos evidentes, marcador de `wrangler.toml` y las pruebas del servidor sin dependencias) y **separa lo verificado de lo que exige repositorio o `npm ci`**.
- `tests/ronda11/test-zip.sh` (8 casos): manipulación detectada, `.dev.vars` rechazado, falta de manifiesto rechazada, y **ni el ZIP ni un repositorio nuevo declaran verificado el historial**.
- Guía: `LEEME-PRUEBAS.md`, «Verificar una entrega ZIP». **Qué requiere repositorio:** el historial de commits (ausencia de secretos o de un `database_id` real en commits anteriores) y que `ENTREGA.json` corresponde al commit real.

## 4. Resultado de la ejecución (literal) y comandos
```
{{RESULTADO}}
```
Comandos (clon nuevo del commit indicado): `git clone … && npm ci --ignore-scripts && bash tests/run-all.sh` (código de salida 0 solo si todo pasa); `bash tests/ronda8/test-ejecutor.sh` ({{EJECUTOR}}); `node tests/ronda11/capturas.cjs antes|despues`; `python3 scripts/demo/build_demo.py`; `bash scripts/entrega/crear-zip.sh …` y `verificar-zip.sh …`.

## 5. Evidencia por escenario
**Avisos, ROIC y móvil (H):**

{{TABLA_H}}

**Identidad visual del editor (I):**

{{TABLA_I}}

## 6. Probado / simulado / pendiente / bloqueado
| Estado | Qué |
|---|---|
| **Ejecutado en local** (Chromium, Miniflare, SQLite real) | Toda la batería (sección 4), capturas y comprobaciones de las secciones 1–3, demo reconstruida y comprobada («DEMO OK», sin persistencia al recargar) |
| **Simulado** | Texto ampliado (`font-size` del documento), teclado (ventana reducida), «otro dispositivo», correo (interceptación de `fetch`), carreras (escritura intercalada tras el commit). El «antes» se tomó con el mismo servidor sirviendo la versión anterior |
| **Bloqueado** | Validación remota (Cloudflare D1, correo real, caducidad real…): **sin credenciales**; sigue **un único bloque** en `ronda10/BLOQUEOS.md` (no se piden secretos por el chat) |
| **Pendiente** (personas/dispositivos) | Safari y Firefox (el editor usa consultas de contenedor, `color-mix` y `scroll-padding`), dispositivos físicos, lectores de pantalla, zoom real, teclado móvil real, revisión visual en tema oscuro por una persona, `bash` 3.2 de macOS con los scripts de entrega (`ronda11/pruebas-manuales.md`) |

## 7. Limitaciones
Solo Chromium. Esta ronda cubre **una pantalla**: el resto sigue con el estilo anterior (con los tokens nuevos, por lo que cambia el tono, pero sin el rediseño de componentes); la guía para extenderlo está en `ronda11/SISTEMA-VISUAL.md`. La paleta del reparto repite colores a partir de la 9.ª posición. La mutación solo se ejecutó para el caso de `scroll-padding-top`.

**Reservado para el futuro plan de pago (sin implementar ni simular):** conexión con Revolut, conexión con Trade Republic, artículo diario según los intereses del usuario y tip diario de inversión.
