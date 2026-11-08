# Inspiración: Darwinex Zero y el vídeo de la «cartera en rueda» (C47–C48, 2026-11-08)

Nada de esto está hecho todavía: son ideas para decidir y encajar en la hoja de ruta (`ronda33/PLAN.md`).

## 1 · Darwinex Zero (https://www.darwinexzero.com)
*Leída por un agente: la portada en «/es» salió en inglés; también se leyeron «cómo funciona», «precios», «tu índice DARWIN» y «capital». Algunas cifras no se pudieron leer (se mostraban animadas).*

**Qué es:** una plataforma de pago (desde 45 €/mes) donde operas en una cuenta virtual con datos reales, se crea tu índice público («DARWIN») y, si eres constante, inversores reales pueden invertir en él. Lema: «Serious about trading? So are we.»

### Lo que copiaría (adaptado a carteras simuladas y sin dinero)
| Idea de Darwinex | Cómo sería en Klever | Fase |
|---|---|---|
| **Tu índice con nombre propio**: cada estrategia tiene avatar, «ticker» y una cotización que **empieza en 100** | Cada cartera tiene su **índice Klever que empieza en 100** (p. ej. «Mi cartera tech · 104,2») y un monograma/avatar. Es la forma más clara de enseñar una evolución simulada sin hablar de euros | 5 (Liga) |
| **Niveles sin suspenso** («no pass or fail»), con metáfora de crecimiento (semilla → planta → mariposa → águila) | Niveles de aprendizaje **sin suspender nunca**: p. ej. Semilla → Brote → Árbol → Bosque, que suben con misiones y semanas de constancia, no con rentabilidad | 3–4 |
| **Ranking mensual por mérito** y un **motor de riesgo** que pone a todos en la misma escala de riesgo | La Liga puntúa **rentabilidad simulada ajustada al riesgo + equilibrio**: quien acierta apostando todo a una empresa no gana a quien reparte bien | 5 |
| **Historial como currículum** («acts like a resume») | Perfil público opcional con tus temporadas, tu nivel y tus carteras públicas (nunca tu email) | 4 |
| **Portada con contraste corto y una sola acción** («Trading isn't a game; it's a profession.», CTA «Let's do this» repetido arriba y abajo) | Titular contundente + un único botón repetido al final; frases cortas en contraste | 2 |
| **«Prueba, no promesas»** con cifras verificables | Un bloque de confianza con **cifras reales** del embudo (carteras creadas, semanas medidas) solo cuando las haya; nunca inventadas | 6 |
| **Comunidad** (Discord, historias de usuarios) | Comunidad dentro de la app (fase 4); historias reales solo con permiso (regla: sin testimonios inventados) | 4 |

### Lo que NO copiaría
Cuotas mensuales, comisiones sobre beneficios, capital de inversores, paso a cuenta real y la promesa de «convertirlo en tu profesión»: dependen de dinero real o crean expectativas falsas en gente que empieza. Su aviso legal es más flojo que el nuestro (solo avisa del riesgo en la cuenta real); Klever mantiene «simulación · sin dinero real · no es consejo» siempre.

## 2 · El vídeo (concepto de app «Wallet»)
*8 s, 1080×1440, extraídos 12 fotogramas.*

**Qué se ve:** fondo negro puro. Arriba, «Wallet» y una **frase con iconos dentro del texto**: «You're up ✧ 2.4% today and ▤ +18.2% this year», y a la derecha «Season 2026». Debajo, una **rueda vertical en arco**: cada mes es una **esfera iridiscente** (degradados violeta, verde, coral) sobre una línea curva con el nombre del mes. Al deslizar, la rueda **gira**; la esfera del centro crece y a su lado aparece el dato **en una cifra enorme y finísima** («+5.6 %», «−1.4 %», «3 due») con **una frase corta** («A dip after the rate call»). Al tocarla, sube una **tarjeta de cristal** con degradado (el «detalle» del mes, con tres movimientos) que nace de la esfera.

### Qué haría con esto en Klever
| Elemento del vídeo | En Klever |
|---|---|
| **Rueda del tiempo con esferas** | La **«rueda de tu temporada»** en «Hoy»: una esfera por **semana** (la foto semanal ya existe en el servidor). El color de cada esfera sale de su estado (verde equilibrada, ámbar media, cobre concentrada); en la Liga, de la evolución simulada. La del centro, grande. |
| **Cifra enorme y fina + frase corta** | Al centrar una semana: «Semana 45 · **Baja**» (concentración) o, en la Liga, «**+1,8 %** simulado» con una frase de una línea («Bajaste NVDA del 40 al 25 %»). Inter variable permite el peso fino (200) sin cargar otra fuente. |
| **Frase con iconos dentro** | Cabecera de «Hoy»: «Tu cartera ◎ reparte en 5 sectores y ✧ mejora desde hace 2 semanas». Sustituye a los párrafos (encaja con «menos texto»). |
| **Tarjeta de cristal que nace de la esfera** | Al tocar una semana: hoja de cristal con lo que cambió esa semana (señales resueltas, idea guardada, reto conseguido). Reutiliza «Desde la semana del…» y «Mira atrás». |
| **«Season 2026»** | Temporadas de la Liga («Temporada otoño 2026»). |
| **Portada futurista (efecto «wow»)** | Nueva portada: fondo negro, una **rueda de esferas de una cartera de EJEMPLO** que gira sola una vez al entrar y luego responde al dedo; cada esfera es una empresa o una semana del ejemplo; el titular corto de Darwinex-estilo; **un solo botón**. Rotulado «Ejemplo simulado». |

### Cómo se haría (0 €, sin librerías de pago)
- Esferas con **CSS** (degradados radiales y cónicos + brillo especular), sin WebGL: ligeras y nítidas.
- Rueda con **scroll-snap** vertical y transformaciones en arco (cada esfera rota alrededor de un punto fuera de la pantalla); `IntersectionObserver` para saber cuál está en el centro.
- Tarjeta de cristal con `backdrop-filter` y una animación que parte de la posición de la esfera.
- Todo se desactiva con «reducir movimiento» (la rueda pasa a ser una lista) y se prueba con la comparación visual de capturas.

### Riesgos
- **Rentabilidades en la portada:** antes de la Liga (y de su fuente de precios) las esferas mostrarían **estados** (concentración/variedad), no porcentajes. Con la Liga, porcentajes **simulados** y rotulados.
- La portada en el ejemplo **no debe parecer un anuncio de rendimiento**: sin cifras de ganancia en el primer vistazo.
- Rendimiento en móviles modestos: se mide antes de dar por buena la rueda.

## Propuesta de encaje en la hoja de ruta
1. **Fase 2 (ahora):** nueva **portada futurista** con la rueda de esferas (sin porcentajes) y la **frase con iconos** + **rueda de tu temporada** en «Hoy».
2. **Fase 3–4:** **niveles sin suspenso** y **perfil público** (historial como currículum).
3. **Fase 5 (Liga):** **índice Klever que empieza en 100**, temporadas, puntuación por mérito ajustada al riesgo y al equilibrio; las esferas pasan a mostrar la evolución simulada.
