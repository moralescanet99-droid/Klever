# 01 · Mapa de supuestos: de qué depende que Klever funcione (ronda 42, C58 + C60)

> **Para qué sirve:** antes de construir la app de la ronda 40, escribir **qué tiene que ser verdad** para que salga bien, **cómo comprobarlo** barato y **qué resultado nos haría cambiar el plan**, fijado **antes** de ver los datos (si no, siempre encontraremos una excusa para seguir).
>
> **Fuentes leídas:** `ronda37/REFUNDACION.md`, `ronda40/INFORME-APP-FINAL.md`, `ronda41/LIGA-FANTASY.md`, `CONTEXTO-KLEVER.md` y la matriz legal (`02-matriz-legal.md`).
> **Restricciones que no se tocan:** tres secciones (Mi cartera · La Liga · Construye), sin supuestos prácticos, coste 0 € y las reglas legales de Klever.
> **Leyenda:** **comprobado** = hay evidencia directa · **supuesto** = lo creemos, pero nadie lo ha medido · **[NV]** = dato no verificado en una fuente primaria.

---

## Cómo se ordenan
Cada supuesto tiene dos notas de 1 a 5:
- **Riesgo** = cuánto daño hace al plan si resulta falso (5 = la app no tiene sentido o no se puede publicar).
- **Incertidumbre** = cuánto sabemos hoy (5 = nada de nada; 1 = ya está comprobado).

**Prioridad = riesgo × incertidumbre** (máximo 25). Se prueba primero lo de arriba.

| Orden | Supuesto (en una frase) | Riesgo | Incert. | Prioridad | Qué hay hoy |
|---|---|---|---|---|---|
| 1 | La gente quiere **practicar a construir una cartera sin precios ni rentabilidad** | 5 | 5 | **25** | Supuesto. Ninguna entrevista hecha |
| 2 | Lo que hace Klever **no es asesoramiento** ni recomendación si habla de pesos y sectores | 5 | 4 | **20** | Textos leídos (02); sin respuesta de la CNMV ni de un abogado |
| 3 | **Competir por cuidar** la cartera, no por ganar dinero, engancha durante semanas | 5 | 4 | **20** | Supuesto. ESMA lo ve sano, pero nadie lo ha probado con personas |
| 4 | Un **ritmo semanal** (la foto del lunes) basta para que la gente vuelva | 4 | 4 | **16** | Supuesto. Objetivo D7 ≥ 25 % sin base |
| 5 | La app crece por **ligas privadas entre amigos** (coeficiente viral ≥ 0,3) | 4 | 4 | **16** | Supuesto, copiado de LaLiga Fantasy (1,5 M de ligas privadas, dato de la ronda 41 [NV]) |
| 6 | Javier puede sacar la app **en unas 14 semanas, a 0 €**, sin programar | 5 | 3 | **15** | La app actual existe; el plan nuevo no está probado |
| 7 | Cualquiera **crea su cartera en menos de un minuto** sin ayuda | 4 | 3 | **12** | Prototipos hechos (rondas 37–40), sin probar con personas |
| 8 | **EDGAR da los datos del Mapa** (ventas por región, sede y moneda) a 0 € | 3 | 4 | **12** | La ronda 40 dice que las regiones «no vienen estandarizadas» [NV] |
| 9 | Los **nombres de las tres secciones** se entienden a la primera | 3 | 3 | **9** | Supuesto |
| 10 | La **votación en tiempo real** cabe en el plan gratuito de Cloudflare | 3 | 3 | **9** | Plan gratuito de Durable Objects desde abril de 2025 (enlace en la ronda 40 [NV]); sin medir el consumo |

---

## Los 10 supuestos, uno a uno

### 1 · La gente quiere practicar a construir una cartera sin precios ni rentabilidad · prioridad 25
- **Por qué importa:** todo Klever descansa en esto. LaLiga Fantasy engancha porque los puntos salen de lo que pasa en el campo; en Klever los puntos salen del **reparto**, no del mercado. Si a nadie le preocupa «¿está bien repartida mi cartera?», no hay producto.
- **Qué hay hoy:** **supuesto**. Solo investigación de escritorio (comparativas de apps en la ronda 40).
- **Cómo se prueba:**
  - 10–12 entrevistas con el guion *Jobs to be Done* + *The Mom Test* (`03-kit-investigacion.md`): se pregunta por **la última vez** que la persona dudó sobre cómo repartir su dinero o qué comprar, no por si «le gustaría» una app.
  - Encuesta Kano con las funciones clave e ideas *fantasy* (`03-`).
  - Reseñas de 1–3 estrellas de la competencia (`07-resenas-competencia.md`): ¿alguien se queja de no saber repartir, o solo de fallos y precios?
- **Cuánto cuesta:** 0 €. Unas 10–12 horas de Javier (entrevistas de 30 min, más preparar y anotar).
- **Resultado que cambia el plan (fijado de antemano):**
  - **Si menos de 5 de 12** cuentan un episodio **real** de los últimos 12 meses en el que dudaron sobre cómo repartir o diversificar, **el problema central no existe** para este público. Se para la construcción y se vuelve a definir el público o el problema.
  - **Si en el Kano «Puntuar el equilibrio de tu cartera» sale *indiferente* o *inverso* para más del 50 %**, la Liga no puede ser el centro: se rediseña alrededor de lo que salga *atractivo* u *obligatorio*.

### 2 · Lo que hace Klever no es asesoramiento ni recomendación · prioridad 20
- **Por qué importa:** si una función central (pistas de pesos, cartera de ejemplo, feed, perfil) fuera **asesoramiento**, haría falta autorización de la CNMV (Ley 6/2023, art. 129), algo imposible a 0 €. Ningún aviso lo arregla (ESMA35-43-3861, §65; guía de *finfluencers* de la CNMV, p. 16).
- **Qué hay hoy:** **comprobado** qué dicen los textos (`02-matriz-legal.md`). **Supuesto** cómo los aplicaría la CNMV a un simulador: ningún texto dice si un usuario sin dinero real es «posible inversor».
- **Cómo se prueba:**
  - Consulta al **Portal FinTech de la CNMV** con el texto de `02-` §5.
  - Dictamen breve de un **abogado** con la matriz y la respuesta de la CNMV.
- **Cuánto cuesta:** CNMV, 0 € (respuesta informativa y no vinculante; plazo no publicado [NV]). Abogado: no es 0 €, hay que pedir presupuesto cerrado [NV]; **lo decide Javier**. Unas 3 horas de Javier.
- **Resultado que cambia el plan:**
  - **Si la CNMV o el abogado dicen que las pistas o la cartera de ejemplo con empresas reales pueden ser una recomendación personalizada**, se pasa a carteras de **sectores y tipos de activo** (la «decisión de fondo» de la ronda 37, §4) y la huella queda solo como aprendizaje en Descubrir.
  - **Si señalan el perfil de 3 preguntas** (horizonte, inquietud ante las caídas), **se quita el perfil**. Se decide ya, sin esperar: el perfil no se construye hasta tener respuesta.
  - **Si señalan el contenido entre usuarios** (propuestas de equipo, tesis compartidas), el «por qué» pasa a **solo plantillas**, sin texto libre.
  - **Si no hay respuesta en 8 semanas**, se lanza con la versión prudente de la matriz (todo lo marcado como *Medio* o *Alto*, en su forma mitigada) y la revisión del abogado como condición del día D.

### 3 · Competir por cuidar la cartera engancha durante semanas · prioridad 20
- **Por qué importa:** la Liga es una de las tres secciones y el motor del regreso semanal. ESMA cita como ejemplo bueno «leader boards where […] traders who have the most diversified portfolio» (ESMA35-43-3682, §97), pero que sea sano **no significa que sea divertido**.
- **Qué hay hoy:** **supuesto**.
- **Cómo se prueba:** la **Liga a mano** (`04-liga-a-mano.md`): 20 personas, 4 semanas, hoja de puntuación y mensajes semanales, sin código. Se prueba también el *draft* en papel.
- **Cuánto cuesta:** 0 €. Unas 2 horas por semana de Javier durante 4 semanas (≈ 8–10 h).
- **Resultado que cambia el plan:**
  - **Menos del 30 % activos en la semana 4** (activo = entrega su foto del lunes) → **rediseñar la Liga** antes de construirla (umbral fijado en el encargo).
  - **Si el *draft* tiene más del doble de participación** que la liga clásica, el *draft* pasa a ser el modo por defecto de las ligas privadas.

### 4 · Un ritmo semanal basta para que la gente vuelva · prioridad 16
- **Por qué importa:** la ronda 40 elige a propósito una racha **semanal** y no diaria (hábito sano, ESMA DP §95). Si la gente se olvida de una semana para otra, se pierde la Liga y el fantasma.
- **Qué hay hoy:** **supuesto**. El objetivo «D7 ≥ 25 %» no tiene base medida.
- **Cómo se prueba:** dentro de la Liga a mano (supuesto 3): cuántos entregan la semana 2 **con un solo recordatorio** el domingo. Y en las entrevistas: qué hace hoy la persona cada semana (apps o rituales que ya tiene).
- **Cuánto cuesta:** 0 €; incluido en el 3.
- **Resultado que cambia el plan:**
  - **Si menos del 50 % entrega la semana 2** con un solo recordatorio (con amigos debería ser fácil; en la app real será peor), el ritmo semanal **no aguanta solo**: se añade un segundo momento ligero a mitad de semana (por ejemplo, el desafío exprés de la ronda 41), sin pasar a diario.
  - **Si más del 50 % pide algo diario sin que se le pregunte**, se apunta, pero **no se cambia** sin revisar la gamificación (riesgo de enganche).

### 5 · La app crece por ligas privadas entre amigos · prioridad 16
- **Por qué importa:** el plan de marketing (ronda 36) y la ronda 40 cuentan con crecer sin anuncios: tarjeta, «reta a un amigo», ligas privadas. Objetivo: coeficiente viral ≥ 0,3 y ≥ 40 % de usuarios en una liga privada.
- **Qué hay hoy:** **supuesto**, por analogía con LaLiga Fantasy (más de 1,5 M de ligas privadas, dato de la ronda 41 [NV]). El fútbol ya tiene grupos de amigos hechos; la inversión, quizá no.
- **Cómo se prueba:**
  - En la Liga a mano, Javier invita a **10** personas y les pide que inviten a **quien quieran**, sin presión: se cuentan las invitaciones aceptadas.
  - En las entrevistas: «¿Con quién hablas de dinero o de inversión? ¿Cuándo fue la última vez?» (hecho, no opinión).
- **Cuánto cuesta:** 0 €; incluido en el 3.
- **Resultado que cambia el plan:**
  - **Si las 10 personas iniciales traen menos de 3 nuevas** (coeficiente < 0,3), el crecimiento **no** puede basarse en ligas entre amigos: el canal principal pasa a ser **ligas de aula o universidad** (ronda 37, idea 6), con un responsable que empuja. Ojo con los menores (`02-`, idea legal 3).
  - **Si menos de la mitad de los entrevistados** nombra a alguien concreto con quien habla de inversión, se baja la prioridad de la Liga privada frente a la general opcional.

### 6 · Javier puede sacar la app en unas 14 semanas, a 0 €, sin programar · prioridad 15
- **Por qué importa:** la ronda 37 lo dice claro: «Javier no programa. Mejor pocas cosas y bien». El plan de la ronda 40 tiene 14 semanas, un repositorio nuevo, una pila nueva (Svelte, Workers, Durable Objects) y passkeys.
- **Qué hay hoy:** **comprobado** que la app actual existe y pasa sus pruebas en local. **Supuesto** que la pila nueva se puede montar y mantener al mismo ritmo.
- **Cómo se prueba:** las **semanas 1–2 del plan** como prueba con hito fijo: despliegue de prueba en verde y la lógica en TypeScript con sus pruebas unitarias (ronda 40, §9). Además, los experimentos 05 y 06 adelantan las dos piezas técnicas más inciertas.
- **Cuánto cuesta:** 0 €; 2 semanas de trabajo (que no se pierden si sale bien).
- **Resultado que cambia el plan:**
  - **Si las semanas 1–2 tardan más de 4 semanas**, se recorta el lanzamiento a **Mi cartera + La Liga**; **Construye en equipo** (votación en tiempo real) pasa a después del lanzamiento.
  - **Si cualquier pieza exige pagar** (un plan, un dominio, una tienda de apps), se para y lo decide Javier (regla de coste 0 €).

### 7 · Cualquiera crea su cartera en menos de un minuto sin ayuda · prioridad 12
- **Por qué importa:** el primer minuto («Enciende tu cartera») es la activación. Objetivo: ≥ 50 % la terminan en la primera visita real.
- **Qué hay hoy:** **supuesto**. Hay prototipos (rondas 37 y 40) y la app actual, pero nadie de fuera los ha usado delante de nosotros.
- **Cómo se prueba:** prueba de uso con 6 tareas y 5–8 personas (`03-`), con el prototipo o la app actual. Se cronometra «crea tu cartera» y se pasa el cuestionario SUS.
- **Cuánto cuesta:** 0 €. Unas 6 horas de Javier.
- **Resultado que cambia el plan (criterios del encargo):**
  - **Si menos del 80 % completa «crea tu cartera» sin ayuda, o el SUS medio es menor que 70**, se rediseña el arranque **antes** de construir la semana 3.
  - **Si la mediana pasa de 2 minutos**, se quita un paso (por ejemplo, empezar siempre con la cartera de ejemplo).

### 8 · EDGAR da los datos del Mapa a 0 € · prioridad 12
- **Por qué importa:** el Mapa (sede frente a ventas, monedas) es una de las tres pestañas de Mi cartera y lo que distingue a Klever de un simple anillo de pesos.
- **Qué hay hoy:** **supuesto**. La ronda 40 avisa de que las ventas por región «no vienen estandarizadas» y harán falta estados «sin desglose» [NV].
- **Cómo se prueba:** experimento EDGAR (`05-experimento-edgar.md`): 30 empresas reales, qué porcentaje trae ventas por región en XBRL (`srt:StatementGeographicalAxis`), sede y moneda de informe; 5 comprobadas a mano.
- **Cuánto cuesta:** 0 €. Unas pocas horas de un agente, a ≤ 10 peticiones por segundo y con un User-Agent sin datos personales.
- **Resultado que cambia el plan:**
  - **Si menos del 50 % de las 30** trae ventas por región aprovechables, **el Mapa por ventas sale del lanzamiento**: se queda solo la sede y la moneda de informe, y las ventas pasan a «más adelante».
  - **Si sede o moneda fallan en más del 10 %**, o las 5 comprobaciones a mano encuentran más de 1 error, el Mapa entero pasa a la fase 2 y se lanza sin él.

### 9 · Los nombres de las tres secciones se entienden a la primera · prioridad 9
- **Por qué importa:** la estructura es fija (Mi cartera · La Liga · Construye), pero si «Construye» no dice dónde se descubren empresas o se crea un equipo, la gente se pierde.
- **Qué hay hoy:** **supuesto**.
- **Cómo se prueba:** prueba de árbol (`03-`) con 15–20 personas y 8–10 tareas («¿Dónde crearías una cartera con tus amigos?»).
- **Cuánto cuesta:** 0 € (formulario gratuito). Unas 2 horas de Javier.
- **Resultado que cambia el plan:**
  - **Si en 2 o más tareas acierta menos del 80 %**, se cambian **los nombres** (no el número de secciones, que es fijo) o se mueve la función. Por ejemplo, «Construye» puede pasar a «Crear y descubrir».

### 10 · La votación en tiempo real cabe en el plan gratuito · prioridad 9
- **Por qué importa:** la cartera en equipo con votación en directo es la función social de Construye. La ronda 40 cuenta con Durable Objects gratis.
- **Qué hay hoy:** **supuesto**. El plan gratuito existe según el enlace de la ronda 40 [NV en esta ronda]; el consumo por votación no se ha medido.
- **Cómo se prueba:** experimento de votación (`06-experimento-votacion.md`): Durable Objects en local (wrangler o miniflare, en el scratchpad), mensajes y peticiones por votación y estimación para 1.000 equipos.
- **Cuánto cuesta:** 0 €. Unas pocas horas de un agente.
- **Resultado que cambia el plan:**
  - **Si no funciona en local**, o **si 1.000 equipos con una votación al día pasan del 50 % de la cuota gratuita diaria**, se descarta el tiempo real: votación **asíncrona** (cada uno vota cuando entra, cierre a una hora fija) o consulta cada 5–10 s solo con una votación abierta, como ya prevé la ronda 40.

---

## Orden de trabajo propuesto
1. **Ya, en paralelo y sin esperar a nadie:** enviar la consulta a la CNMV (2), que tarda y no cuesta nada, y lanzar los experimentos de agente (8 y 10).
2. **Semanas 1–2:** entrevistas y Kano (1), prueba de árbol (9) y prueba de uso (7).
3. **Semanas 2–6:** Liga a mano (3, 4 y 5).
4. **Solo si 1 y 3 pasan su umbral:** empezar la construcción (6), que es a la vez la prueba de capacidad.

**Regla:** si los supuestos **1 o 3** no pasan su umbral, **no se construye la app de la ronda 40** tal como está. Primero se rediseña con los datos y se vuelve a probar a mano.

## Qué no es un supuesto (ya está decidido)
- Tres secciones, sin supuestos prácticos, 0 €, sin dinero real y sin recomendaciones: son **restricciones**, no hipótesis.
- «Solo mayores de 18»: decisión prudente, más estricta que la ley (LOPDGDD art. 7 fija 14 años; ver `02-`).
