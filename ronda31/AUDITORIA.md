# Auditoría de Klever · 2026-11-08 (C40)

**Cómo se hizo:** capturas de las 13 vistas a 390 px y 1440 px (invitado y con cuenta), revisión automática de accesibilidad con **axe-core 4.10** (WCAG 2.1 A/AA + buenas prácticas) en 8 pantallas, mediciones del código (CSS, JS, metadatos) y revisión experta con los criterios de las skills `impeccable` (auditoría y crítica), `accessibility-review`, `mobile-native`, `break-ui`, `emil-design-eng`, `ux-copy` y `find-animation-opportunities`. Servidor local con datos de prueba. **No** se ha probado en un teléfono real, con lector de pantalla real ni con personas.

Prioridad: **P0** roto o inaccesible · **P1** se nota mucho / impide parecer de última generación · **P2** pulido importante · **P3** detalle.

## Nota por área (0–4)
| Área | Nota | Resumen |
|---|---|---|
| Accesibilidad | 3,5 | axe: 0 fallos en 7 de 8 pantallas; 3 en el editor (móvil). Contraste de los tokens ya probado (`testI`). |
| Rendimiento | 3 | Sin dependencias ni fuentes externas; 4 hojas de estilo (125 KB sin comprimir) y 500 KB de JS+CSS en total; la lista de Explorar pinta 126 tarjetas de golpe. |
| Adaptación (móvil) | 2,5 | Funciona de 320 a 1440 px sin desbordes, pero **no se comporta como app**: sin manifiesto, sin icono, sin color de sistema, sin zona segura en la barra inferior, iconos de texto, lista de 31.000 px. |
| Sistema visual | 2,5 | Identidad clara y coherente (carbón y cobre), pero **cuatro capas de CSS** acumuladas (r13, r17, r26 sobre la base) con 34 `!important`; la tipografía depende de lo que tenga el dispositivo. |
| Movimiento | 2 | Un fundido genérico por vista y transiciones cortas en botones; nada explica los cambios (barra de reparto, semáforo, vistas). |
| **Total** | **13,5 / 20** | Bueno y honesto; le falta acabado de app moderna. |

## Hallazgos
### Accesibilidad
| P | Dónde | Qué | Arreglo |
|---|---|---|---|
| P0 | Editor, móvil (< 480 px) | Los pasos «Objetivo» y «Revisión» se quedan **sin nombre accesible**: su texto se oculta con `display:none` (axe: `button-name` crítico, `link-name` grave) | ocultarlo solo visualmente (`.sr`), no para el lector |
| P2 | Barra de guardar (móvil) | contenido fuera de cualquier región (axe: `region`) | marcarla como región con nombre |
| P2 | Toda la app | anillo de foco por defecto, distinto según el elemento | un anillo propio y coherente (cobre, 2 px, separación 2 px) |

### Móvil «nativo»
| P | Qué | Arreglo |
|---|---|---|
| P1 | No es instalable: sin `manifest`, sin icono, sin `theme-color`, sin favicon | manifiesto + iconos SVG/PNG propios + metadatos |
| P1 | Iconos de la barra inferior y del menú son **caracteres de texto** (◧ ◎ ✎ ☰): se ven distintos en cada sistema | iconos SVG en línea |
| P1 | Explorar en el móvil: **126 tarjetas** de ≈ 210 px (≈ 31.000 px de página) | tarjetas compactas + «Mostrar más» por tandas; la búsqueda siempre busca en todo |
| P2 | La barra inferior no respeta la barra de gestos del iPhone (`safe-area-inset-bottom` solo en diálogos) y falta `viewport-fit=cover` | rellenos con `env(safe-area-inset-*)` |
| P2 | Destello gris al tocar (iOS/Android) y retardo de doble toque | `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` |
| P3 | Sin metadatos para compartir (Open Graph) | título, descripción e imagen al compartir el enlace |

### Sistema visual y tipografía
| P | Qué | Arreglo |
|---|---|---|
| P1 | La fuente es «Inter si está instalada»: en Windows/Android sale otra; las cifras cambian de ancho al editar pesos | Inter variable **autoalojada** (licencia OFL, 0 €) y cifras tabulares |
| P1 | El aviso de éxito («Cartera guardada») es una franja beige clara que rompe la paleta oscura | píldora oscura con borde de color y entrada suave |
| P2 | Titulares de 2–3 líneas con palabras sueltas al final («invertir.») | `text-wrap: balance` en titulares, `pretty` en párrafos |
| P2 | Cuatro hojas de estilo superpuestas; reglas que se pisan (34 `!important`) | consolidar tokens en una capa final (sin rehacer lo que funciona); la limpieza completa se planifica aparte (riesgo) |
| P3 | Barras de desplazamiento gruesas en escritorio | barras finas en paneles |

### Movimiento y respuesta
| P | Qué | Arreglo |
|---|---|---|
| P1 | Cambiar de vista = fundido genérico | View Transitions con desplazamiento corto; sin movimiento si se pide |
| P1 | La barra de reparto y los indicadores cambian de golpe | transición de anchura en la barra y entrada escalonada de los indicadores |
| P2 | Estados de carga en texto («Cargando…») | esqueletos con brillo suave |
| P2 | Tarjetas y pestañas sin respuesta al pulsar | presión sutil (escala 0,97–0,98) |
| P3 | Conseguir un reto no se nota | destello breve en el icono del reto |

### Textos (ux-copy)
| P | Qué | Arreglo |
|---|---|---|
| P2 | La portada repite «sin dinero real / datos de prueba» tres veces en la primera pantalla | dejar el sello y la línea de confianza; quitar repeticiones |
| P3 | Botones con flecha de texto «→» mezclados con iconos | flecha SVG coherente donde haya icono |

### Lo que está bien (se conserva)
Identidad carbón y cobre con jerarquía clara; una acción principal por pantalla en la portada; «Tu semana» y los retos; huella de empresa; contraste de tokens verificado; navegación por teclado y diálogos probados en rondas anteriores; sin dependencias de pago ni servicios externos.

## Pendiente de comprobar (no se puede desde aquí)
Teléfono real (iPhone con muesca y Android), lector de pantalla real (VoiceOver/TalkBack), Safari y Firefox, rendimiento en un móvil de gama baja, personas.
