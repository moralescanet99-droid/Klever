# Klever · sistema de diseño

Una sola hoja de estilo: `public/klever.css` (fase 1, ronda 33). Empieza con **un bloque único de tokens** (`:root`) y sigue con las secciones por origen. Cualquier color, espacio, radio, sombra o duración nuevo se añade **como token**, no como valor suelto.

## Identidad
- **Carbón y cobre**: fondo casi negro cálido, acento cobre. Un único tema (oscuro).
- **Azul solo para lo simulado o alternativo**; **verde solo para lo correcto**; cobre/naranja para la acción principal y las alertas de concentración.
- **Serif solo en los titulares grandes** (`--serif`); el resto, **Inter variable autoalojada** (`--fuente`, `public/fonts/`, licencia OFL).
- Profundidad sutil (capa de luz y sombras), nunca neón.

## Tokens (los principales)
| Grupo | Tokens | Uso |
|---|---|---|
| Superficies | `--bg` `--surface` `--surface-2` `--border` `--border-strong` `--vidrio` `--capa` | fondo, tarjetas, paneles, bordes; `--vidrio` para barras translúcidas |
| Texto | `--text` `--muted` | principal (contraste ≥ 7:1) y secundario (≥ 4,5:1) |
| Acción | `--accent` `--on-accent` `--accent-soft` `--accent-on-soft` `--focus` | botón principal, pestaña activa, anillo de foco |
| Estados | `--ok` `--warn` `--bad` (+ `-bg`), `--verde` `--azul` `--alerta` (+ `-bg`) | correcto, aviso, error; simulado (azul); señal de concentración (alerta) |
| Series de datos | `--c0` … `--c7`, `--c-txt` | tramos de las barras y del anillo (color estable por activo) |
| Tipografía | `--fuente` `--serif`, escala `--t-xs` `--t-s` `--t-m` `--t-l` `--t-xl` `--t-num` | cuerpo 16 px; cifras con `tabular-nums` |
| Espacio | `--s1` 8 · `--s2` 16 · `--s3` 24 · `--s4` 32, `--gutter` (16/24/32 según ancho), `--ancho` 1200 px | márgenes y rejillas |
| Radios | `--r` 12 · `--r-control` 12 · `--r-panel` 20 · `--radio-campo` 10 | controles, tarjetas, paneles |
| Sombras | `--shadow-lg` `--sombra-1` | diálogos; superficies con capa de luz |
| Movimiento | `--rapido` `--suave` `--resorte` `--t-corto` (0,16 s) `--t-medio` (0,26 s) | transiciones; todo se anula con «reducir movimiento» |

## Componentes
| Componente | Clases | Notas |
|---|---|---|
| Botones | `.btn` + `.btn-primario` / `.btn-secundario` / `.btn-ghost` / `.btn-icono` | una sola acción principal por pantalla; presión (escala 0,97) |
| Tarjetas y paneles | `.tarjeta` `.panel` `.lab-res` `.pos-card` | capa de luz + sombra suave |
| Chips y sellos | `.chip` `.sello-b` | estado corto; los avisos legales van en un sello único |
| Señales | `.senal` `.senal-alerta` `.senal-aviso` `.senal-ok` | concentración y variedad, en tres niveles |
| Indicadores | `.ind` | semáforo de Concentración, Variedad y Datos; entran escalonados |
| Barra de reparto | `#comp-barra i` `.pbar i` | se actualizan en su sitio para que la anchura se anime |
| Huella | `.huella` (SVG de `public/js/huella.js`) | cinco comprobaciones; un punto hueco = sin datos |
| «Tu semana» | `.sem-*` `.evo-*` `.reto` `.reto-sem` `.mira` | evolución, reto de la semana, «Mira atrás» |
| Barra inferior (móvil) | `.tabbar` + iconos `.ico` (SVG) | cristal translúcido, zona segura |
| Avisos | `#avisos` `#toast` | píldora oscura con borde de color |
| Carga | `.esq-lista` `.esq` | esqueletos con brillo; el texto se conserva para el lector |

## Reglas de uso
1. Nada de colores, tamaños o duraciones sueltos: tokens.
2. Movimiento solo si explica un cambio; 150–300 ms; nunca animar la opacidad del texto de lectura; siempre respetar «reducir movimiento».
3. Una idea principal y una acción por pantalla; lo secundario, plegado.
4. Probar a 320, 390 y 1440 px y con el texto del sistema ampliado.

## Deuda conocida (para las fases siguientes)
La hoja única conserva, en sus secciones, reglas antiguas que luego se pisan (≈ 34 `!important`). Al rehacer cada pantalla en la fase 2 se eliminan las reglas muertas de esa pantalla, con su prueba visual.
