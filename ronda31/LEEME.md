# Ronda 31 · Klever de última generación (C40)

**Encargo (Javier, 2026-11-08):** pensar cómo debe verse una web/app de última generación y apuntarlo; auditar; anotarlo todo en el cuaderno maestro; y trabajar en todas las mejoras **sin consultar**, siempre que cuesten 0 €. Lo que necesite su aprobación queda en `PENDIENTES.md` § ★★ «Para Javier».

- Visión y lista de detalles: `VISION.md` (V1–V14).
- Auditoría: `AUDITORIA.md` (13,5/20; axe-core: 3 fallos en el editor móvil, 0 en el resto).

## Qué se ha hecho (implementado)
| Detalle | Estado | Cómo |
|---|---|---|
| V2 Iconos SVG | ✅ | La barra inferior y el botón de menú usan iconos SVG de trazo (cartera, lupa, cuaderno, menú) en vez de caracteres de texto. |
| V3 Cristal en el móvil | ✅ | Barra inferior y barra de guardar translúcidas con desenfoque y borde de luz; respetan la barra de gestos (`viewport-fit=cover` + `safe-area`). Sin desenfoque disponible → fondo opaco. |
| V4 Respuesta táctil | ✅ | Presión (escala 0,97) en botones, tarjetas, pestañas y opciones; sin destello gris al tocar; sin retardo de doble toque; campos a 16 px en el móvil (sin zoom en iOS). |
| V5 Esqueletos de carga | ✅ | «Mis carteras» y Explorar muestran bloques con brillo suave; el texto «Cargando…» se conserva para el lector de pantalla. |
| V6 Tipografía propia | ✅ | **Inter variable autoalojada** (`public/fonts/`, 48 KB, licencia OFL incluida, sin servicios externos); cifras tabulares; titulares equilibrados (`text-wrap: balance`) y párrafos con mejor corte. En la demo de un solo archivo la fuente va incrustada. |
| V7 Barras y semáforo con movimiento | ✅ | La barra de reparto se **actualiza en su sitio** (misma pieza, nueva anchura) y se anima; las barras de cada fila también; los tres indicadores entran escalonados. |
| V8 Aviso en la paleta | ✅ | «Cartera guardada» pasa de franja beige a píldora oscura con borde verde y entrada suave. |
| V9 Instalable | ✅ | `manifest.webmanifest`, icono propio (SVG + PNG 180/192/512), `theme-color`, metadatos de Apple y Open Graph. **Sin service worker** (no funciona sin conexión; ver «Para Javier»). |
| V10 Explorar en el móvil | ✅ | Tarjetas por tandas de 24 con «Mostrar 24 más (quedan N)» (el foco va a la primera nueva); la búsqueda y los filtros siempre buscan en todas; en escritorio la tabla sigue completa. Página de ≈ 31.000 px → ≈ 7.000 px. |
| V12 Celebrar un reto | ✅ | Destello breve en el círculo del reto conseguido (sin confeti ni sonido). |
| V1 Transición entre vistas | 🟡 | Entrada con desplazamiento corto de 4 px y fundido (0,26 s), sin quedarse con transformación. **La API View Transitions se aplazó**: el cambio de vista de la app es síncrono y parte del contenido se pinta después de forma asíncrona; congelar la pantalla hasta que llegue la red empeoraría la respuesta. |
| V11 Foco | ✅ (ya existía) | El anillo de foco de 3 px ya era coherente en toda la app; no se cambia. |
| V14 Desplazamiento | 🟡 | Barras finas en paneles con ratón. `scrollbar-gutter` no se aplicó (cambiaría anchos medidos por las pruebas sin beneficio claro). |
| V13 Portada que se reparte sola | ⛔ decidido no hacerlo | Un ejemplo que se mueve solo al cargar puede leerse como reclamo comercial y hace inestables las cifras que se leen al entrar. Se mantiene el ejemplo que mueve la persona. |
| Accesibilidad (axe) | ✅ | Los pasos del editor conservan su nombre en el móvil (se ocultan solo a la vista); la barra de guardar es una región con nombre. |
| Texto de la portada | ↩️ deshecho | Se quitó una repetición de «sin dinero real / datos de prueba» en la frase principal, pero `testB` exige esa transparencia en la frase principal (regla de la ronda 21): se restauró. |
| «Reducir movimiento» | ✅ | Todas las animaciones y transiciones nuevas se desactivan. |

## Qué se ha probado
*(se completa con la batería `tests/ronda31/testAC.cjs` y la pasada completa)*

## Sin comprobar
Teléfono real (instalación desde Safari/Chrome, muesca, barra de gestos, desenfoque real), lector de pantalla real, Safari y Firefox, rendimiento del desenfoque en un móvil de gama baja, personas.
