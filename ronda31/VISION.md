# Klever de última generación · visión y detalles (C40, 2026-11-08)

**Qué significa «última generación» aquí:** no es más efectos ni más neón. Es la sensación de las mejores apps de 2026 (Linear, Arc, Revolut, Apple Wallet): **todo responde al instante, se mueve con física y sentido, se lee de un vistazo y en el móvil parece una app instalada.** Klever conserva su identidad aprobada (carbón y cobre, un serif solo en titulares, azul solo para lo simulado, verde solo para lo correcto) y sus reglas (sin dinero real, sin recomendaciones, sin rentabilidades).

## Los 6 principios
1. **Respuesta inmediata.** Cada toque da señal en < 100 ms (presión del botón, estado del campo). Nada de «Cargando…» en texto: esqueletos con la forma del contenido.
2. **Movimiento que explica.** Solo se anima lo que ayuda a entender un cambio: la barra que se reparte, el semáforo que cambia, la vista que viene de donde se pulsó. Curvas suaves (salida rápida, llegada suave), 150–300 ms, interrumpibles, y **nada si la persona pide «reducir movimiento»**.
3. **Profundidad y materiales.** Cabecera y barra inferior de cristal translúcido (desenfoque del fondo), superficies con una capa de luz sutil, sombras que dicen qué está encima. Sin brillos de neón.
4. **Tipografía de producto.** Una sans moderna propia (Inter variable, autoalojada, licencia libre) para que se vea igual en todos los dispositivos; cifras tabulares (no bailan al cambiar); titulares equilibrados (sin palabras huérfanas).
5. **App nativa en el móvil.** Instalable (icono, nombre, color del sistema), respeta la muesca y la barra de gestos, sin destellos al tocar, sin zoom al escribir, iconos dibujados (no caracteres de texto), listas largas que no obligan a recorrer 30 pantallas.
6. **Calma y foco.** Una idea principal y una acción por pantalla; lo secundario se pliega. El texto legal y los avisos, en un sello único y discreto.

## Detalles que cambiaría (lista de trabajo)
| # | Detalle | Hoy | Última generación |
|---|---|---|---|
| V1 | Transiciones entre pantallas | fundido genérico de 0,28 s | **View Transitions**: la vista nueva entra deslizándose 8 px con fundido; los elementos compartidos (título, barra de la cartera) se transforman. Sin movimiento con «reducir movimiento». |
| V2 | Iconos | caracteres de texto (◧ ◎ ✎ ☰ ×) | **iconos SVG** de trazo fino coherentes (cartera, descubrir, cuaderno, menú, cerrar, más) |
| V3 | Barra inferior y cabecera (móvil) | opacas | **cristal translúcido** con desenfoque y borde de luz; respetan la zona segura (muesca / barra de gestos) |
| V4 | Respuesta táctil | sin destello, algunos botones sin presión | presión (escala 0,97) en botones, tarjetas y pestañas; sin el destello gris de iOS/Android |
| V5 | Carga | «Cargando tus carteras…» en texto | **esqueletos** con brillo suave (forma de tarjeta) |
| V6 | Tipografía | Inter solo si el dispositivo la tiene (si no, la del sistema) | **Inter variable autoalojada** (sin servicios externos), cifras tabulares en pesos y totales, `text-wrap: balance/pretty` |
| V7 | Barra de reparto y semáforo | cambian de golpe | la barra **se reparte con una transición** al cambiar pesos; los indicadores entran escalonados (40 ms) |
| V8 | Avisos («Cartera guardada») | franja beige fuera de la paleta | **píldora oscura con borde de color** y entrada con resorte, coherente con la paleta |
| V9 | Instalable (PWA ligera) | no hay manifiesto ni icono | manifiesto, icono, `theme-color`, nombre corto «Klever», pantalla completa al abrirla desde el inicio |
| V10 | Explorar en el móvil | 126 tarjetas seguidas (≈ 31.000 px) | tarjetas **compactas** y la lista por tandas («Mostrar más»), la búsqueda siempre en todo |
| V11 | Foco del teclado | anillo por defecto | anillo de cobre de 2 px con separación, igual en toda la app |
| V12 | Celebración | ninguna | al conseguir un reto: un destello breve en el anillo del reto (sin confeti, sin sonido) |
| V13 | Superficie de la portada | ejemplo estático al cargar | el ejemplo **se reparte solo una vez** al entrar (KO 60 / PG 40 → +JNJ) para enseñar el producto sin texto |
| V14 | Desplazamiento | por defecto | `scrollbar-gutter` estable, barras finas en escritorio, rebote contenido en paneles |

**Qué NO haría:** confeti, sonidos, partículas, fondos animados permanentes, cristal sobre el texto de lectura, animar la opacidad del texto (rompe el contraste), gamificación de rentabilidad.
