# Sistema visual de Klever (ronda 11): base para extender al resto de pantallas

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

Pendiente de extender (otra fase): portada, explorar empresas, ficha, carteras públicas, «Mis carteras», acceso y pie legal.
