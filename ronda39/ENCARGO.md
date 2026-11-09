# Ronda 39 · Encargo común (C56)

> Javier: «Hazme una de demo del punto 2. Quiero que integres una seccion en todas las apps (las tres de arriba y la nueva que haras) que se llama cartera en equipo y quiero otro apartado dentro de (mi cartera) que arroje datos parecidos a los de (tu cartera en el mapa) a parte de los que ya arroja.»

Son tres piezas:
1. **Prototipo D «Tu fantasma»**, nuevo, en `ronda39/d-fantasma.html`.
2. **Sección «Cartera en equipo»** en los cuatro prototipos: `ronda38/a-orbita.html`, `ronda38/b-organismo.html`, `ronda38/c-arena.html` y el D.
3. **Apartado «Tu cartera en el mapa»** dentro de «Mi cartera» (o de su equivalente: «Mi sistema» en A, «Vestuario» en C) en los cuatro. Se añade a lo que ya hay; no sustituye nada.

**Antes de empezar**, lee `ronda38/ENCARGO-COMUN.md`: reglas legales, lógica real de Klever, requisitos técnicos del artefacto, accesibilidad, rendimiento y verificación con capturas. Todo sigue vigente. Lee también `ronda38/IDEAS-15-MAS.md` (ideas 2, 7 y 9).

---

## A · «Cartera en equipo» (idea 9)
Entre 3 y 5 amigos llevan **una cartera común** y **cada cambio se vota**. El objetivo es aprender a argumentar y a ceder.

**Debe incluir:**
- **Entrada:** una pestaña o sección propia llamada exactamente **«Cartera en equipo»** (en móvil, un icono corto con la etiqueta «Equipo» vale).
  - El primer estado ya es un equipo de ejemplo funcionando, no una pantalla vacía.
  - También se puede crear un equipo (nombre + código de 6 letras + «Invitar», con el enlace simulado) o unirse con un código.
- **Miembros:** tú y 3 apodos inventados, cada uno con un avatar generado (sin fotos) y un rol que rota cada semana: **«Capitán de la semana»**, que elige el reto. Solo apodos.
- **La cartera del equipo:** se dibuja con el **lenguaje visual del prototipo** (sistema planetario en A, organismo en B, alineación en C y el estilo de D), con sus semáforos reales de Concentración y Variedad.
- **Propuestas y votación (el corazón de la sección):**
  - Cualquiera propone un **cambio de pesos**, añadir o quitar una empresa inventada del catálogo. Es **obligatorio** un «por qué» de una línea, como mínimo de 15 caracteres.
  - Cada propuesta enseña **antes → después**: Concentración, Variedad, puntos de Equilibrio de la Liga y su efecto en un escenario ilustrativo.
  - Votos: a favor, en contra o abstención. Se aprueba con **mayoría de los miembros** (3 de 4). Hay una cuenta atrás de ejemplo («cierra en 23 h»).
  - Los votos de los demás llegan simulados, con un retardo y una animación. Una propuesta debe aprobarse y otra rechazarse para ver los dos finales.
  - **Reacciones solo predefinidas**, sin chat libre, para evitar moderación: «Buen argumento», «Demasiado arriesgado», «¿Y la variedad?», «De acuerdo».
- **Historial del equipo:** una línea de tiempo con cada decisión, quién la propuso, su «por qué», el resultado de la votación y qué pasó después en los semáforos.
- **El equipo en la Liga:**
  - **Equilibrio:** 50 puntos, calculados sobre la cartera del equipo con las reglas reales.
  - **Aprendizaje:** 30 puntos. 20 por el reto de la semana y 10 si hubo al menos una propuesta argumentada y votada.
  - **Constancia:** 20 puntos. 10 si votaron todos y +2 por cada semana seguida, hasta 10.
  - Clasificación de equipos, de ejemplo y solo con nombres de equipo.
- **Reglas:** Klever **nunca propone empresas**, solo pesos («¿y si la mayor bajara al 25 %?»). El sello legal sigue visible.

## B · «Tu cartera en el mapa» (idea 7), dentro de «Mi cartera»
Añade **datos geográficos y de moneda** a cada empresa inventada del prototipo:
- **sede:** país;
- **moneda de cotización:** EUR, USD, GBP, CHF o JPY;
- **ventas por región:** España, resto de Europa, Norteamérica, Latinoamérica, Asia-Pacífico y otros; deben sumar 100.

Mezcla España, Europa y EE. UU. con al menos 1–2 de Asia o Reino Unido. Todo inventado y rotulado «datos de ejemplo».

**El apartado muestra:**
1. **Mapa del mundo** en el estilo del prototipo. Puede ser una matriz de puntos generada a partir de una máscara de tierra de baja resolución codificada en el propio archivo, o un mapa de regiones en mosaico. Las zonas se iluminan según tu exposición.
   - Dos vistas que se alternan: **«Dónde tienen la sede»** y **«Dónde venden»** (ponderado por peso: `Σ peso_i × ventas_región_i`).
   - Hay que explicar en una línea que no son lo mismo.
2. **Exposición a monedas:** barra o anillo con el % por moneda.
   - Escenario ilustrativo con deslizador: **«¿Y si el dólar baja un X % frente al euro?»**.
   - Efecto aproximado en tu cartera medida en euros: `−X % × peso_USD`, y lo mismo para cada moneda si se elige.
   - Tipos de cambio de ejemplo, con la nota: «en la versión real, tipos del BCE».
3. **Sesgo de casa:** % en España frente al resto, con una frase neutra («El 48 % de tu cartera tiene sede en España»).
4. **Señales orientativas, no normas:**
   - una moneda distinta del euro por encima del 50 % → aviso medio;
   - un país de sede por encima del 60 % o una región de ventas por encima del 70 % → «concentración geográfica»;
   - sugerencias solo de pesos.
5. **Reacción en directo:** si cambias los pesos en «Mi cartera», el mapa y las monedas se actualizan con transición.

Debe convivir con lo que ya hay. Lo normal es una subpestaña o un segmento dentro de «Mi cartera»: «Reparto · Mapa». No metas todo en una pantalla infinita.

## C · Prototipo D «Tu fantasma» (idea 2)
Compites contra **tu propia cartera del pasado**, de hace 1, 4 u 8 semanas, en el mismo escenario. Ves si has mejorado sin compararte con nadie.

**Dirección visual propia,** distinta de A (espacio 3D cobre), B (perla iridiscente) y C (grafito y azul ultramar con tipografía gigante):
- Una idea de **cronofotografía o espectro**: el tiempo como protagonista, estelas de movimiento, capas translúcidas del «tú» pasado detrás del «tú» actual y una línea de tiempo que se arrastra para rebobinar.
- Elige paleta y tipografías nuevas. No uses Inter, Space Grotesk, Unbounded, Oxanium, Hanken Grotesk, IBM Plex Mono, Fraunces, Figtree, Archivo ni Martian Mono.
- Momento «guau» en los primeros 5 segundos.

**Pantallas** (app navegable):
1. **Hoy:** tu cartera actual con su fantasma superpuesto (la de hace 4 semanas, translúcida) y una frase del tipo «Hace 4 semanas tu mayor posición pesaba el 46 %; hoy, el 28 %».
2. **Rebobinar:** línea de tiempo de 12 semanas con tus fotos de los lunes, de ejemplo. Al arrastrarla, la cartera se transforma semana a semana y se ven los semáforos, los puntos de la Liga y tus notas «por qué», al estilo de la cápsula de decisiones.
3. **Carrera contra tu fantasma (el bucle):**
   - eliges qué fantasma (1, 4 u 8 semanas);
   - los dos afrontan el **mismo escenario a ciegas**, inspirado en una crisis, con cifras de ejemplo;
   - el índice parte de 100 con la fórmula real y se dibuja en carrera;
   - tú decides aguantar, reequilibrar o vender;
   - el fantasma repite lo que «hiciste» entonces (de ejemplo).
   - Resultado: ¿has mejorado?, medido por **Temple + Equilibrio**, no por rentabilidad. Se muestra qué ha cambiado («concentración: Alta → Media») y una tarjeta para compartir.
   - **Temple,** fórmula fija y explicada en pantalla: parte de 100; vender tras una caída −40; decidir en menos de 8 s −10; agotar el tiempo −10; reequilibrar una cartera ya equilibrada −10; mínimo 0.
4. **Mi cartera,** con «Reparto» y el nuevo **«Mapa»** de la sección B.
5. **Cartera en equipo,** sección A.
6. **Tus fantasmas:** una pequeña «liga contra ti mismo» con tus marcas personales (mejor Temple, más semanas con concentración baja, racha).

Archivo: `ronda39/d-fantasma.html`. Un único archivo, con las mismas reglas que los demás.

---

## Para quien modifica A, B o C
- **No rompas nada de lo que ya funciona.** Recorre el bucle original completo después de tus cambios.
- Respeta el estilo, la navegación, las fuentes y los tokens de ese archivo. Lo nuevo debe parecer hecho por el mismo equipo.
- Revisa la barra de navegación en móvil (390 px) con la pestaña nueva: que quepa, sin textos cortados.
- No añadas botones de «Descargar» (el visor los bloquea).
- **Verificación obligatoria** con Playwright a 390×844 y 1440×900 y con `reducedMotion: 'reduce'`:
  - 0 errores;
  - `scrollWidth` ≤ ancho;
  - recorrido completo de lo nuevo (crear una propuesta, votar y ver la aprobada y la rechazada; alternar sede y ventas; mover el deslizador del dólar);
  - capturas revisadas con Read e iteradas hasta que estén impecables.
- No hagas commit ni push. Solo tocas tu archivo y tus capturas en el scratchpad.
- **Entrega:** qué has añadido, dónde está, lo comprobado y lo pendiente.
