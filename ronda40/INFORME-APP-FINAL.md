# Klever · la app final (informe, ronda 40, C57)

> **Encargo de Javier:** una app final hecha a partir de los cuatro prototipos, **sin supuestos prácticos**, con **tres secciones muy claras: Mi cartera, La Liga y Construye**. Investigar e informar de cómo sería la mejor app posible, qué aspecto tendría y qué permitiría hacer.
>
> **Cómo se hizo:** tres agentes en paralelo y la síntesis de Claude.
> - Auditoría de los cuatro prototipos con capturas y medición de fluidez.
> - Comparativa con apps reales, hábito sano, estética y marco legal.
> - Viabilidad técnica y datos a 0 €.
>
> **Estado:** es una **propuesta**. No se ha construido nada nuevo y la app actual no cambia. Lo marcado **[NV]** no se ha podido verificar en una fuente primaria.

---

## 0 · Qué entiendo por «sin supuestos prácticos»
**Se elimina** todo lo que simula un mercado que no existe:
- las tormentas (A);
- el «lunes de crisis» y los duelos por rondas de crisis (C);
- «Lanzar escenario» y la pregunta de 20 segundos sobre caídas (B);
- la carrera contra el fantasma en una crisis (D);
- «¿Y si el dólar baja un X %?»;
- y, con ellos, **el Temple**.

**Se mantiene** «Probar un peso»: mover un peso de tu cartera, ver cómo cambia y elegir entre **Deshacer** o **Quedármelo**. No simula ninguna crisis; es construir.

*Si Javier se refería a otra cosa, se corrige este punto y el resto del informe apenas cambia.*

## 1 · La idea en una frase
**Klever es el gimnasio de tu cartera.** La construyes con los dedos, ves cómo es por dentro y cómo cambia semana a semana, y compites por **cuidarla mejor**, nunca por ganar más.

El eje de toda la app es **el tiempo**: cada lunes se hace una foto de tu cartera. Esa foto alimenta tu evolución, tu fantasma y la Liga.

## 2 · Qué se queda de cada prototipo
| Prototipo | Medición con el procesador 4 veces más lento | Lo que aporta a la app final | Lo que se queda fuera |
|---|---|---|---|
| **A · Órbita** | 16 fps (el más lento) | El arranque «enciende tu cartera» con 3–5 empresas y el **momento de impacto al entrar** | El 3D permanente, la telemetría decorativa y las tormentas |
| **B · Organismo** | 47 fps | **El tacto**: anillo arrastrable, deslizar para quitar, hojas inferiores. Los **semáforos** más legibles, el **feed con la huella en flor** y un **modo claro** nacarado | La mancha que parece un tamagotchi, el duelo de escenarios y la pregunta de caídas |
| **C · Arena** | 60 fps | **El marcador de la Liga** (puesto grande, puntos 50/30/20, barras de la temporada) y el **resumen de temporada tipo «Wrapped»**. La tipografía cinética, **solo en los grandes momentos** | «EN DIRECTO», la franja de actividad inventada, «Fichar» y «Revancha», y el duelo de crisis |
| **D · Fantasma** | 60 fps | **La base visual**: oscuro y con el tiempo como protagonista. El **radar por sectores con estela**, **rebobinar los 12 lunes**, el **fantasma** (1, 4 u 8 semanas) y **el mejor mapa** | Seis pestañas, la carrera de crisis y la letra fina sobre negro |

**Dirección visual elegida: D como base, con el tacto de B, el marcador de C y el impacto de A, este último solo al entrar.** Motivos:
- es futurista sin 3D;
- es fluido en móviles modestos;
- su metáfora (el tiempo, tu progreso) es la única que no necesita crisis;
- es el que menos se parece a una casa de apuestas.

## 3 · La estructura: tres secciones y nada más
Barra inferior con **tres pestañas**:
- **Mi cartera** (icono de anillo);
- **La Liga** (icono de corona);
- **Construye** (icono de «+» en un hexágono).

Arriba a la derecha, tu **avatar**. Ahí van perfil, avisos, privacidad, tamaño de texto, modo claro u oscuro y «reducir movimiento».

No hay pestaña «Hoy»: la cabecera de **Mi cartera** hace ese papel.

### 3.1 · Mi cartera: «cómo es y cómo cambia»
**Cabecera de la semana:**
- «Lunes 9 nov · semana 3 de 12»;
- una frase de estado («Una parte pesa demasiado» / «Tu cartera está repartida»);
- la cuenta hasta la próxima foto del lunes.

**Selector de cartera:** tu principal, otras tuyas y la del equipo.

**Retrato:** el **radar por sectores** (de D). Cada eje es un sector y su longitud, lo que pesa: una cartera concentrada es una aguja y una repartida, una flor. Detrás, en translúcido, **tu fantasma** de hace 1, 4 u 8 semanas, más rojizo cuanto más antiguo. Debajo, una frase como «Hace 4 semanas tu mayor posición pesaba el 46 %; hoy, el 28 %».

**Tres semáforos** (de B): Concentración, Variedad y Datos, con las reglas actuales de Klever.

**Tres pestañas internas:**
1. **Reparto.**
   - **Anillo arrastrable** (de B): tocas un color y arrastras su borde, y el resto se reajusta. Alternativa con botones − y + y con el teclado.
   - Lista de posiciones con su mini huella; se desliza para quitar una.
   - **Probar un peso** (con «Deshacer» o «Quedármelo») y la pista de Klever, siempre de pesos, nunca de empresas: «¿Y si la mayor bajara al 24 %?».
2. **Mapa** (de D, con las etiquetas de C).
   - Dónde tienen la sede las empresas y dónde venden, explicando que no es lo mismo.
   - Anillo de **monedas**, sin escenarios.
   - **Sesgo de casa** («El 48 % tiene sede en España») y señales orientativas.
3. **Evolución** (de D).
   - **Rebobinar** los 12 lunes con un cabezal que se arrastra.
   - En cada foto: semáforos, puntos de la Liga y tu **nota «por qué»** (la cápsula de decisiones: cuando cambias algo, una línea; Klever te la devuelve semanas después).
   - **Tus marcas personales:** más semanas con concentración baja y mejor racha.

### 3.2 · La Liga: «competir por cuidar, no por ganar»
**Tu temporada** (el marcador de C):
- puesto grande;
- puntos de la semana con el desglose **Equilibrio 50 · Aprendizaje 30 · Constancia 20**;
- barras de las 12 semanas;
- cuenta hasta la foto del lunes.

Sin «EN DIRECTO» y sin actividad inventada.

**Reto de la semana**, siempre de construcción: «Ningún sector por encima del 40 %», «Llega a 5 sectores», «Escribe el porqué de un cambio». Se comprueba con la foto del lunes. Vale 20 de los 30 puntos de Aprendizaje; los otros 10 son por guardar o revisar una idea.

**Clasificaciones** (solo apodos):
- **Tu liga privada.** Es la principal: grupos pequeños con código o enlace, como las fantasy españolas.
- **De equipos.**
- **General opcional,** a la que hay que apuntarse.
- Se puede **salir de cualquier clasificación**.

**Duelo semanal de equilibrio.** Retas a un amigo por enlace. El lunes se comparan los puntos de la semana de los dos. Desempate: concentración baja. Son las barras enfrentadas de B y la tarjeta de C, sin crisis.

**Tú contra tu fantasma.** Tus puntos de esta semana frente a los de tu «yo» de hace N semanas.

**Final de temporada:**
- resumen tipo «Wrapped» en 6 historias (de C);
- insignias oro, plata y bronce según el percentil, o «completada»;
- **insignias por comprender**: haber revisado 10 huellas, haber completado la variedad. **Nunca por operar.**

**Hábito sano:**
- racha **semanal**, no diaria;
- **un comodín por temporada** y **pausa sin penalización**;
- nada de «tu amigo te ha adelantado» ni cuentas atrás falsas.

### 3.3 · Construye: «crear, descubrir, decidir juntos»
1. **Crear una cartera.**
   - Arranque en menos de un minuto (inspirado en A, en 2D): eliges de 3 a 5 empresas, se reparten a partes iguales y la cartera «se enciende».
   - También puedes pegar una lista como «KO 40, PG 60» o empezar desde una cartera de ejemplo.
2. **Descubrir** (de B).
   - Feed de tarjetas con la **huella en flor** de 5 comprobaciones: lleno, cumple; pequeño, no cumple; hueco, sin datos.
   - **Tiene un final**: unas 10 tarjetas al día y «Has visto las de hoy».
   - Filtros por sector y país, ficha completa y **comparador de dos**.
   - **Sin «lo más popular entre usuarios».**
   - Acciones: «Probar en mi cartera» y «Guardar idea».
3. **Cartera en equipo.**
   - Estructura de D: capitán que rota cada semana, reto elegido por el capitán y propuestas con cuenta atrás.
   - Votación **3 de 4** con un **«por qué» obligatorio**, en tiempo real.
   - Reacciones predefinidas, **sin chat libre**, para evitar recomendaciones y tener que moderar.
   - Historial de decisiones.
   - Crear un equipo o unirse con código (de C).
4. **Guardado:** tus ideas con su pregunta y lo que ha cambiado en sus datos desde que las guardaste.

## 4 · Cómo se ve y cómo se siente
- **Mundo visual: «espectro».**
  - Fondo tinta casi negro con un grano finísimo.
  - La luz de «hoy» en **cobre claro** (herencia de Klever); el pasado se dispersa en un espectro (ámbar, rosa, violeta).
  - Azul solo para lo simulado o alternativo; verde, ámbar y rojo solo para los semáforos.
  - **Modo claro nacarado** (de B) para quien lo prefiera o para leer al sol.
- **Tipografía.**
  - Una sans variable autoalojada (Geist o similar) para todo.
  - Una display con cuerpo solo para los números grandes y los títulos de los momentos clave.
  - Cifras en monoespaciada **a partir de 12–13 px**; texto **mínimo de 15 px**. Nada de letra fina gris sobre negro.
- **Movimiento con intención.**
  - **Transiciones entre pantallas** con View Transitions: el radar «viaja» de Mi cartera a la Liga.
  - **Muelles** al arrastrar y **contadores que ruedan** solo en el puesto y en los puntos del lunes.
  - **Tipografía cinética** solo en tres momentos: la foto del lunes, subir de puesto y el final de temporada.
- **El «guau» de la entrada** (3 s, se puede saltar): tus 12 lunes pasan como una exposición de larga duración hasta llegar a hoy y aparece tu fantasma. Para un usuario nuevo es su primera cartera «encendiéndose».
- **3D:** solo como regalo, en el resumen de temporada. Se carga si hace falta, tiene alternativa en 2D y se apaga con «reducir movimiento» o en móviles lentos.
- **Vidrio:** como mucho 2–3 superficies (la barra inferior y las hojas), con desenfoque de 8–16 px y nunca animado.
- **Tacto:** vibración breve en Android al cruzar un umbral (por ejemplo, cuando la concentración pasa a Alta). Siempre con alternativa visual y se puede desactivar.
- **Presupuesto en un Android de gama media:**
  - primera carga ≤ 170 KB de JavaScript;
  - respuesta al tocar ≤ 200 ms;
  - animar solo `transform` y `opacity`.

## 5 · El primer minuto y los estados vacíos (lo que ningún prototipo resolvía)
1. **Entrada:** «Practica antes de arriesgar», con una cartera de ejemplo moviéndose detrás.
2. **«Enciende tu cartera»:** eliges de 3 a 5 empresas y ya ves tu radar, tus semáforos y tu primera pista. **Todavía sin cuenta.**
3. **Para guardar:** apodo, declaración de **mayor de 18** y correo para el enlace mágico, o una **passkey**.
4. **Semana 1:**
   - En lugar del fantasma, «Tu primer lunes es el 16 nov: entonces aparecerá tu fantasma».
   - En lugar de la Liga vacía, «Únete o crea una liga con tus amigos», o empezar en la general opcional.
5. **Perfil (fase 3), tres preguntas que solo adaptan retos y avisos:**
   - para qué quieres aprender;
   - en cuánto tiempo;
   - cuánto te inquietan las caídas.

## 6 · Qué se puede hacer: catálogo completo
| Sección | Función | Origen |
|---|---|---|
| Mi cartera | Radar por sectores con fantasma de 1, 4 u 8 semanas | D |
| Mi cartera | Semáforos de Concentración, Variedad y Datos | Klever actual + B |
| Mi cartera | Anillo arrastrable, lista con mini huella y deslizar para quitar | B |
| Mi cartera | Probar un peso con Deshacer o Quedármelo, y pista solo de pesos | B / D |
| Mi cartera | Mapa por sede y por ventas, monedas, sesgo de casa y señales geográficas | D + C + B |
| Mi cartera | Rebobinar 12 lunes, nota «por qué» y marcas personales | D + idea 1 |
| La Liga | Marcador de temporada 50/30/20 y barras de 12 semanas | C |
| La Liga | Reto semanal de construcción | B / D |
| La Liga | Ligas privadas, de equipos y general opcional, con salida | C + Duolingo |
| La Liga | Duelo semanal de equilibrio y tú contra tu fantasma | reconvertidos de B / C / D |
| La Liga | «Wrapped» de temporada e insignias por comprender | C |
| Construye | Arranque de 3–5 empresas, pegar lista y cartera de ejemplo | A + Klever actual |
| Construye | Feed con final, huella en flor, ficha y comparador | B + Klever actual |
| Construye | Cartera en equipo con votación en tiempo real | D + B + C |
| Construye | Ideas guardadas con «qué ha cambiado» | Klever actual |
| Todas | Tarjeta para compartir sin importes ni rentabilidad, con «Simulación educativa · no es recomendación» | C |

**Después del lanzamiento** (ideas compatibles con «sin supuestos prácticos»):
- **Mi contrato de inversión:** tus reglas, comprobadas cada lunes.
- **Carta de sesgos.**
- **Colección de conceptos.**
- **Clips verticales automáticos.**
- **Certificado de fundamentos.**
- **Bot de Telegram.**
- **Tu cartera suena.**
- **Klever-dle.**

## 7 · Reglas legales y éticas que marcan el diseño
- **Gamificación y supervisores (ESMA e IOSCO):** se premia **comprender y cuidar**, nunca operar mucho ni la rentabilidad.
  - Nada de confeti al «comprar»: Robinhood pagó 7,5 M$ en Massachusetts en 2024 y se comprometió a quitarlo.
  - Nada de listas de «lo más popular».
- **CNMV (guía de *finfluencers* de mayo de 2026):** nada que pueda leerse como recomendación de comprar o vender.
  - Por eso no hay chat libre en los equipos, solo reacciones predefinidas.
  - Por eso los perfiles y carteras públicos llevan un aviso fijo.
- **Publicidad:**
  - En principio, la Circular 2/2020 no se aplica a Klever, pero sí la Ley General de Publicidad.
  - Ni marcas de brókeres ni enlaces de afiliado.
- **Edad:** **solo mayores de 18**, declarado al registrarse.
- **Diseño justo:** la futura *Digital Fairness Act* de la UE, prevista para 2026 [NV], apunta al scroll infinito y al diseño adictivo. Por eso el feed tiene final, la racha es semanal y hay comodín y pausa.
- **Sello siempre visible:** «Simulación · sin dinero real · no es consejo».

## 8 · Cómo se construye (técnica, 0 €)
- **Pila:**
  - **Svelte 5 + Vite + TypeScript**, como PWA;
  - **Cloudflare Workers con archivos estáticos**: hay que pasar de Pages a Workers para poder usar la siguiente pieza;
  - **D1** como base de datos;
  - **Durable Objects** para las votaciones en tiempo real, uno por equipo, con WebSockets. **Entran en el plan gratuito desde abril de 2025**. Si fallan, se consulta cada 5–10 s, solo mientras haya una votación abierta;
  - **Hono** para las rutas;
  - **Motion** y **View Transitions** para el movimiento.
- **Acceso:**
  - Enlace mágico, el que ya existe.
  - **Passkeys:** gratis y sin correo, porque Brevo gratis solo envía **300 correos al día**.
  - Sesiones de 90 días.
- **Avisos:**
  - Push web, que en iPhone **solo funciona con la app instalada** (iOS 16.4 o posterior).
  - La vía principal es el correo semanal y el aviso dentro de la app.
  - Hace falta una pantalla propia de «Instalar en el iPhone».
- **Límites del plan gratuito:**
  - Holgado para unos **10.000 usuarios al mes**.
  - Con 10.000 **al día** hay que agrupar llamadas y poner índices.
  - Desde el 1 de septiembre de 2026, **D1 corta las consultas al pasar el límite diario** hasta las 00:00 UTC. Hay que vigilarlo.
- **Datos reales:**
  - **Huella:** SEC EDGAR, que es gratis y oficial; ya existe el script.
  - **Sede:** EDGAR.
  - **Moneda:** la de informe, que **no es la de cotización**; la interfaz debe decirlo.
  - **Ventas por región:** no vienen estandarizadas en EDGAR. Hay que leerlas informe a informe con cobertura parcial, así que hace falta el estado «sin desglose».
  - **Tipos de cambio:** BCE, para el anillo de monedas.
  - **Empresas españolas:** solo huella básica (ESEF), en una fase posterior.
  - **Precios: no hacen falta.**
- **Se reutiliza:**
  - `calculos.js`: `simular` sirve para las propuestas de equipo;
  - `senales.js`, sin `hipotesis`;
  - `huella.js`;
  - `liga.js` completo;
  - los scripts de carga;
  - el acceso por enlace mágico;
  - la base de datos de pruebas.
- **Se quita:** escenarios, laboratorio, radar, revisiones y revista.
- **Esquema nuevo:**
  - temporadas;
  - inscripciones;
  - equipos;
  - propuestas;
  - votos;
  - fotos de los lunes, que sustituyen a las instantáneas;
  - puntos por semana;
  - ventas por región;
  - tipos de cambio;
  - suscripciones push.
- **Pruebas:** Vitest para la lógica y una docena de recorridos con Playwright, **en menos de 3 minutos**.

## 9 · Plan por fases (≈ 14 semanas)
| Semanas | Qué | Se da por cerrado cuando |
|---|---|---|
| 1 | Repositorio nuevo y **privado**, Workers, D1, CI | El despliegue de prueba está en verde |
| 2 | Lógica en TypeScript y acceso (enlace y passkeys) | Las pruebas unitarias pasan |
| 3–4 | **Mi cartera**: anillo, semáforos, radar, foto del lunes, rebobinar | 3 recorridos en verde |
| 5–6 | Datos: EDGAR (huella, sede, moneda), BCE y regiones de 30 empresas | Coinciden con valores conocidos |
| 7 | Mapa | Capturas aprobadas |
| 8–9 | **La Liga**: temporadas, ligas privadas, puntos, duelo semanal, fantasma | Pasan los casos de `liga.js` |
| 10–11 | **Construye**: arranque, feed con final, ficha, comparador, cartera en equipo con Durable Objects | Prueba con 2 navegadores |
| 12 | Wrapped, tarjeta para compartir, avisos | Recorrido completo |
| 13–14 | Accesibilidad, privacidad, rendimiento en un Android real, textos legales | Lista de comprobación previa al lanzamiento |

Después: **piloto con 5 personas**, beta con 50–100 fundadores y revisión legal antes del día D.

## 10 · Cómo sabremos si funciona
| Qué se mide | Objetivo |
|---|---|
| Activación: termina «Enciende tu cartera» en la primera visita | ≥ 50 % |
| Vuelve el primer lunes (D7) | ≥ 25 % |
| Sigue al final de la temporada (12 semanas) | ≥ 10 % |
| Usuarios en al menos una liga privada | ≥ 40 % |
| Equipos con al menos una votación por semana | ≥ 50 % |
| Coeficiente viral (invitaciones aceptadas por usuario) | ≥ 0,3 |
| Rendimiento: respuesta al tocar (INP) en Android medio | ≤ 200 ms |

Todo con el contador anónimo que ya existe: un número por día y evento, sin guardar nada en el dispositivo.

## 11 · Decisiones para Javier
1. **¿Es correcta la interpretación de «supuestos prácticos»?** (§0)
2. **¿Te gusta la dirección visual «espectro»** (D como base, con modo claro nacarado)?
3. **¿Este orden de pestañas** (Mi cartera · La Liga · Construye)? Alternativa: Construye en el centro.
4. **¿Pasar de Pages a Workers** para tener votaciones en tiempo real (0 €)?
5. **Tiendas de apps:** ¿más adelante, con Capacitor? Cuesta unos 99 $ al año en Apple y unos 25 $ una sola vez en Google [NV].
6. **¿Repositorio nuevo y privado?**
7. **¿Ranking general** solo para quien se apunte (recomendado)?
8. **«Ideas guardadas»:** ¿se quedan, como en este informe, o se simplifican?

## Fuentes principales
- **Robinhood y el confeti** (Vinson & Elkins): https://velaw.com/insights/game-over-robinhood-pays-7-5-million-to-resolve-gamification-securities-violations
- **ESMA y la gamificación:** https://www.esma.europa.eu/node/206152
- **Guía de *finfluencers* de la CNMV:** https://www.cuatrecasas.com/es/global/propiedad-intelectual/art/cnmv-publica-guia-finfluencers
- **Ligas de Duolingo:** https://blog.duolingo.com/duolingo-leagues-leaderboards/
- **Treemap de Trading 212:** https://community.trading212.com/t/asset-allocation-update-now-a-treemap/76707
- **Getquin:** https://www.getquin.com/portfolio-tracker
- **Web Push en iOS:** https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- **Plan gratuito de Durable Objects:** https://developers.cloudflare.com/changelog/2025-04-07-durable-objects-free-tier/
- **Límites de D1:** https://developers.cloudflare.com/d1/platform/limits
- **Aplicación de límites de D1 (2026):** https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/
- **Pasar de Pages a Workers:** https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/
- **Acceso a EDGAR:** https://www.sec.gov/os/accessing-edgar-data
- **API del BCE:** https://data.ecb.europa.eu/help/api/data
