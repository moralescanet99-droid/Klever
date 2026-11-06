# Sistema visual de Klever (rondas 11 y 12): base para extender al resto de pantallas

Dirección: **sobria, moderna y agradable** para explorar empresas y organizar carteras simuladas. Fondo claro ligeramente cálido, superficies blancas, texto azul tinta y un único acento verde petróleo. Sin fuentes externas (pila del sistema), sin dependencias nuevas, sin imágenes: todo es CSS y datos reales de la cartera.

## Tokens (`public/style.css`, bloque `:root`; hay variante oscura con la misma estructura)
| Token | Claro | Uso |
|---|---|---|
| `--bg` / `--surface` / `--surface-2` | `#F7F5F0` / `#FFFFFF` / `#F0EDE6` | fondo cálido / superficie / campos y pistas |
| `--text` / `--muted` | `#14213D` / `#4A5873` | azul tinta / texto atenuado (≥ 4,5:1 sobre fondo y superficie) |
| `--accent` / `--on-accent` / `--accent-soft` / `--accent-on-soft` | `#0B6B6B` / `#FFFFFF` / `#DCEDEA` / `#095555` | verde petróleo: acción principal, enlaces, foco |
| `--ok` `--warn` `--bad` (+ `-bg`) | verde, ámbar, rojo | estados; nunca solo color (siempre con texto/icono) |
| `--border` / `--border-strong` | `#E6E1D6` / `#7C879B` | línea fina cálida / bordes de campos (≥ 3:1) |
| `--c0…--c7`, `--c-txt` | teal, azul, ámbar oscuro, violeta, verde, ladrillo, pizarra, oliva; blanco | **reparto de la cartera** (etiqueta ≥ 4,5:1 sobre cada tramo; tramo ≥ 3:1 frente a la superficie; en oscuro, tonos claros con etiqueta oscura) |
| `--t-xs … --t-num` | .8125 · .875 · 1 · 1,25 · 1,75 · 2,25 rem | escala tipográfica (cifras con `tabular-nums`) |
| `--s1…--s4`, `--r`, `--radio-campo` | 8/16/24/32 px, 12 px, 10 px | espaciado y formas |

El contraste de **todos** los pares se calcula desde el CSS real en ambos temas (`tests/ronda11/testI.cjs`, I6).

## Componentes reutilizables
- **Botones** (`.btn`): `btn-primario` (relleno de acento: *la* acción principal, una por pantalla), `btn-secundario` (contorno fino), `btn-ghost` / `btn-icono` (discretos). Desactivado: gris con el motivo al lado (regla de la ronda 5).
- **Campos**: fondo `--surface-2` sin borde pesado (el pesos y el buscador); el borde de acento aparece al enfocar; error con borde rojo grueso.
- **Estado de guardado** (`.estado-btn`): punto + texto (verde guardada, ámbar pendiente, rojo error) y chip de privacidad. Tres planos separados: privada/pública, validez del reparto, persistencia.
- **Composición** (`.comp`): cifra del total + barra de tramos con el color de cada fila; tramo rayado = «pendiente de asignar»; contorno rojo = exceso. **Se dibuja solo con los pesos reales.**
- **Fila de activo**: punto de color (el del tramo), nombre, categoría atenuada, campo de peso con barra proporcional y ROIC discreto. En móvil, fila táctil (no la tabla trasladada) con la barra debajo.
- **Avisos** (`#avisos`): zona reservada bajo la cabecera; los de éxito se cierran solos, los errores permanecen (con «Cerrar aviso»); solo se anima la altura.
- **Plegables** (`details`): planos, con línea superior; contienen la explicación extensa (ROIC, categorías).

## Reglas de composición de una pantalla (para extender)
1. Una **información principal** por pantalla, la más grande (en el editor: el reparto). Lo demás, en segundo plano.
2. **Una acción principal** con relleno de acento; el resto, discretas.
3. **Menos cajas**: una capa blanca con línea fina; secciones separadas por espacio y líneas, no por tarjetas anidadas. Sin sombras salvo menús y diálogos.
4. **Gráficos solo con datos existentes**; si falta un dato se dice («sin dato»), nunca se rellena.
5. **Móvil**: filas para tocar y leer (≥ 44 px), explicación en desplegables, nada tapado por lo fijo (`scroll-padding`), y adaptación a texto ampliado con consultas de contenedor en `rem`.

---

# Ronda 12: el mismo lenguaje en «Mis carteras», «Explorar empresas» y la ficha

## Reglas nuevas que valen para todo el producto
1. **Color estable por activo.** Cada símbolo conserva su color mientras exista en la cartera: quitar o añadir otra posición no recolorea las demás (mapa símbolo → color en `public/app.js`, `asignarColores`). Con más de ocho posiciones los colores se repiten (hay ocho), **por eso el color nunca va solo**: cada fila lleva su símbolo escrito, la barra de composición nombra los símbolos en su `aria-label` y solo etiqueta los tramos anchos (≥ 9 %). Un peso pequeño (0,5 %) conserva un tramo mínimo visible de 3 px.
2. **Un dato, un sitio.** El % asignado está en la composición (información principal). El resumen lateral conserva solo categorías, cobertura y ROIC; en móvil la barra inferior ya dice «Asignado: N %» y no se repite en el resumen.
3. **Mensaje corto + detalle plegado.** Un bloqueo se dice en una frase («Falta asignar un 32 % para actualizar la publicación»), junto con lo que sigue valiendo («La versión pública sigue igual.»); la explicación larga va en un `<details>` «Detalle» que **no se cierra al teclear**. Jerarquía de la cabecera: título → estado (privacidad, cambios no públicos, guardado) → acción.
4. **El estado se escribe.** Superada / no superada / sin datos se muestran siempre con símbolo y texto (✓ ✗ –), nunca solo con color; un dato ausente dice «No disponible», no se rellena.
5. **Unidades y periodos a la vista.** Toda cifra de la ficha indica periodo (ejercicio) y unidad; la fuente (informes 10-K ante la SEC) se nombra.
6. **Lo que se explica una vez no desplaza resultados.** Las explicaciones largas (cómo se calcula, cómo se ordena) van **debajo** de los resultados, plegadas.

## Componentes nuevos
- **Tarjeta de cartera** (`.cartera-item`): nombre (hasta tres líneas, sin cortar), chips de privacidad y de cambios locales, **mini-composición real** (`.ci-comp`: tramos proporcionales a los pesos guardados, rayado = sin asignar, contorno rojo = exceso), las tres mayores posiciones con su peso («+N más»), estado de asignación en texto («✓ Asignada al 100 %», «Falta asignar 1,5 %»), fecha existente y acción. Con **cambios locales pendientes** (`.pendiente`): borde izquierdo reforzado en ámbar, chip y acción «Continuar editando»; las cifras separan «Versión de tu cuenta» y «Versión de este dispositivo». Cuadrícula de 19–26 rem: una tarjeta no se estira; varias se reparten; en móvil, una columna.
- **Estado vacío de «Mis carteras»**: el formulario «Crea tu primera cartera» con una frase que explica qué es una cartera simulada y una única acción («Crear cartera»).
- **Buscador** (`#emp-buscar`): campo de 52 px con borde reforzado, recuento («N de 105 empresas») y «Borrar búsqueda»; la búsqueda se conserva (en la pestaña) al abrir la ficha, cambiar de pantalla y recargar.
- **Píldoras de comprobaciones** (`.pil`): las cinco comprobaciones de cada empresa con ✓ / ✗ / – y texto («Deuda», «ROIC», «Margen», «Caja libre», «Crecimiento»; lectores: «superada / no superada / sin datos»). Salen de `/api/ideas`: ninguna cifra nueva. Se mantiene el recuento («3 superadas · 2 sin datos») y el orden de la lista.
- **Datos principales de la ficha** (`.fd-grid`): Ventas, Beneficio neto, EBITDA, Caja libre y ROIC del último ejercicio con su unidad; si falta uno, «No disponible · dato ausente en el informe». Debajo, los criterios agrupados (superadas / no superadas / sin datos), la evolución por años y las explicaciones plegadas (metodología, glosario).

## Qué pantallas faltan por adaptar
Portada, carteras públicas (lista y detalle), acceso (diálogo de entrada), pie legal y gráficos de precio. Siguen funcionando con el estilo de la ronda 10/11; no se han rediseñado.
