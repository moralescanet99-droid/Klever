# 03 · Kit de investigación con personas (ronda 42, C58 + C60)

> **Para quién es:** para Javier, que lo va a hacer **solo**, sin experiencia previa en investigación y sin gastar dinero.
> **Qué contiene:** reclutamiento de 20 personas de 20 a 30 años en España, consentimiento informado (RGPD), guion de entrevista (*Jobs to be Done* + *The Mom Test*), prueba de uso moderada con 6 tareas y cuestionario SUS, prueba de árbol de las 3 secciones, encuesta Kano con las ideas *fantasy* y los **criterios de éxito fijados antes de empezar**.
> **Hoja de resultados:** `ronda42/validacion/03-hoja-resultados.csv` (una fila por persona; se importa en Google Sheets).
> **Estado:** **preparado, no ejecutado.** No hay ningún dato de personas todavía. Todo lo que aquí parece un resultado es un umbral fijado de antemano, no una observación.

---

## 0 · Resumen en una página

| Paso | Qué haces | Herramienta gratuita | Tiempo tuyo |
|---|---|---|---|
| 1 | Preparar los formularios y la hoja (§2) | Google Forms y Google Sheets | 3–4 h, una vez |
| 2 | Ensayo con 1 persona de confianza (§10.2) | Google Meet + OBS Studio | 1 h 30 min |
| 3 | Reclutar 26 personas para quedarte con 20 (§3) | WhatsApp, Telegram, Instagram, LinkedIn | 1 semana, ratos sueltos |
| 4 | 20 sesiones de 60 min: entrevista + prueba de uso + SUS + Kano A (§5) | Google Meet 1 a 1 + OBS Studio | 2–3 sesiones al día, 1–2 semanas |
| 5 | Enviar prueba de árbol y Kano B por enlace (§6 y §7) | Google Forms | 10 min por envío |
| 6 | Invitar a la Liga a mano de 4 semanas (archivo `04-liga-a-mano.md`) | WhatsApp o Telegram + Google Sheets | ver ese archivo |
| 7 | Analizar con los criterios fijados (§8 y §9) | Google Sheets | 1 día |

**Orden de cada sesión (60 min):** consentimiento (3) → entrevista (25) → prueba de uso con 6 tareas (20) → SUS (3) → Kano A (7) → cierre y propuesta de la Liga (2).

**Calendario orientativo:** semana 1, preparar y ensayar; semana 2, reclutar; semanas 3 y 4, sesiones; semanas 5 a 8, la Liga a mano; semana 9, análisis. Total, unas 9 semanas.

---

## 1 · Qué se quiere averiguar (y qué no se puede averiguar con 20 personas)

| Pregunta | Método | Por qué ese método |
|---|---|---|
| ¿Existe de verdad el «trabajo» de aprender a invertir practicando, solo o con amigos, sin dinero? ¿Qué usan hoy? | Entrevista de cambio de *Jobs to be Done* (JTBD) | Pregunta por **lo que hicieron**, no por lo que harían |
| ¿Nos dicen la verdad o nos dan la razón por educación? | Reglas de *The Mom Test* (Rob Fitzpatrick) dentro de la entrevista | Evita halagos, hipótesis y promesas vacías |
| ¿Se entiende y se usa lo que ya existe (crear una cartera, semáforos, Liga)? | Prueba de uso moderada con 6 tareas, «pensar en voz alta», y SUS | Es la forma estándar de ver dónde se pierde la gente |
| ¿Los nombres **Mi cartera · La Liga · Construye** llevan a cada uno a su sitio? | Prueba de árbol (*tree testing*) en Google Forms | Prueba los nombres y la estructura **sin diseño visual** |
| ¿Qué funciones son imprescindibles, cuáles ilusionan y cuáles dan igual o molestan? | Encuesta Kano (pregunta funcional y disfuncional) | Separa «lo doy por hecho» de «me encantaría» |
| ¿Hay compromiso real? | Propuesta al final: apuntarse a la Liga a mano de 4 semanas | En *The Mom Test*, el compromiso (tiempo, reputación) vale más que un «me gusta» |

**Límites honestos:**
- 20 personas sirven para **encontrar problemas grandes** y para **descartar ideas**; no para estimar porcentajes del mercado. Ejemplo: si 16 de 20 (80 %) completan una tarea, el intervalo de confianza del 95 % (método de Wilson) va aproximadamente del **58 % al 92 %**. Por eso los criterios de §8 son umbrales de decisión, no medidas precisas.
- La prueba de árbol y la encuesta Kano mejoran mucho con más respuestas: el enlace se puede compartir con más gente (objetivo deseable: 50 respuestas), pero **los criterios se aplican también con 20**.
- La prueba de uso se hace con la **demo actual** (`demo/index.html`), que tiene la navegación de la app de hoy, **no** las 3 secciones de la app final. Los nombres de las secciones se prueban solo en la prueba de árbol.

---

## 2 · Herramientas gratuitas y preparación (una sola vez)

| Para qué | Herramienta | Nota |
|---|---|---|
| Cuestionario de selección, consentimiento, SUS, Kano y prueba de árbol | **Google Forms** | Desactiva «Recopilar direcciones de correo» y «Limitar a 1 respuesta» (obligaría a iniciar sesión con Google) |
| Hoja de resultados | **Google Sheets** | Importa `03-hoja-resultados.csv`: Archivo → Importar → Subir → «Reemplazar hoja de cálculo» |
| Videollamada | **Google Meet** 1 a 1 | Con dos personas no hay límite práctico de tiempo [NV: compruébalo en el ensayo] |
| Grabar | **OBS Studio** (gratis, Windows, Mac y Linux) | Según fuentes secundarias, Meet **no graba** con una cuenta personal gratuita [NV en la ayuda oficial de Google]; por eso se graba con OBS en tu ordenador. Alternativa sin instalar: Jitsi Meet con «grabación local» [NV] |
| Que la persona use la demo en su móvil | Demo publicada + compartir pantalla desde la app de Meet en el móvil | Para publicar la demo sin programar: panel de Cloudflare → Workers y Pages → Crear → Pages → «Subir recursos» y arrastrar la carpeta `demo` (gratis) [NV: el nombre exacto del botón puede cambiar]. Alternativa: `wrangler pages deploy demo --project-name klever-demo` (ya está en `PENDIENTES.md`, punto 0) |
| Mensajes | WhatsApp o Telegram | Para reclutar, recordar citas y la Liga |
| Agenda | Google Calendar («Programación de citas», versión básica) o proponer 3 horas por WhatsApp | [NV: disponibilidad en cuentas personales] |

**Formularios que tienes que crear (copiando los textos de este archivo):**
1. **F0 · Selección y consentimiento** (§3.4 y §4).
2. **F1 · SUS** (§5.4): 10 preguntas de escala lineal de 1 a 5. Primera pregunta: «Tu código de participante (te lo digo yo, por ejemplo P07)».
3. **F2 · Kano A**, funciones de la app (§7.3).
4. **F3 · Kano B**, ideas de juego (§7.4).
5. **F4 · Prueba de árbol**, en dos versiones con las tareas en distinto orden (§6).

En todos, la primera pregunta es el **código de participante** (P01–P20). Así **nunca** se cruza el nombre con las respuestas.

---

## 3 · Reclutamiento de 20 personas sin coste

### 3.1 · Perfil y cuotas (fíjalas antes de empezar)
- **Edad:** de 20 a 30 años. **Residencia:** España.
- **Cuotas** (mínimos, no exactos):
  - al menos **8** que hayan jugado a una liga *fantasy* (LaLiga Fantasy, Biwenger, Comunio…) en el último año;
  - al menos **6** que **nunca** hayan invertido y al menos **6** que hayan invertido algo con dinero propio;
  - al menos **8** mujeres y al menos **8** hombres (aproximado; la persona responde como quiera, con «prefiero no decirlo»);
  - como mucho **5** de la misma ciudad.
- **Excluye:**
  - amigos cercanos, familia y pareja (*The Mom Test*: te dirán lo que quieres oír);
  - quien trabaje en asesoramiento financiero, en una gestora o bróker, o diseñando apps (no es un usuario típico);
  - quien ya haya visto Klever.
- **Sobrerrecluta:** busca **26** para llegar a 20; es normal que un 20–30 % no se presente.

### 3.2 · Dónde encontrarlas gratis
1. **Segundo grado:** pide a 5–6 conocidos que te presenten cada uno a 2–3 personas que **tú no conozcas**. Es el canal que mejor funciona.
2. **Asociaciones y clubes universitarios** de inversión, finanzas o economía, y delegaciones de estudiantes. Escribe a la junta directiva.
3. **Comunidades de ligas *fantasy*** en Telegram o Discord, y grupos de amigos que ya tengan una liga.
4. **Comunidades de finanzas personales en español** (Telegram, Discord, Reddit). **Lee sus normas y pide permiso a quien modera antes de publicar.**
5. **Tus redes:** historia de Instagram, publicación en LinkedIn y estados de WhatsApp, pidiendo que se compartan.

**No ofrezcas dinero ni regalos.** Ofrece: el resumen de lo aprendido, una plaza en la Liga de 4 semanas y tu agradecimiento. Es coste 0 y evita que la gente venga solo por el premio.

### 3.3 · Textos listos para copiar

**Publicación (grupos, Instagram, LinkedIn):**
> Busco 20 personas de **20 a 30 años** que vivan en España para una **videollamada de 1 hora**. Estoy preparando una app **educativa y gratuita** para aprender a construir una cartera de inversión **sin dinero real**, y quiero entender cómo aprendéis hoy sobre inversión y cómo jugáis con amigos (ligas *fantasy* y similares).
> - No hace falta saber nada de inversión.
> - No vendo nada, no pido dinero y no hay premios.
> - No te preguntaré cuánto dinero tienes ni inviertes.
> Si te apetece, rellena este formulario de 2 minutos: [ENLACE F0]
> ¡Gracias por compartirlo!

**Mensaje privado (presentado por un conocido):**
> ¡Hola, [nombre]! Soy Javier; me ha pasado tu contacto [conocido]. Estoy preparando una app educativa para aprender a invertir **sin dinero real** y busco gente de 20 a 30 años para una charla de una hora por videollamada. No vendo nada: quiero aprender de cómo lo haces tú. Si te apetece, aquí hay un formulario de 2 minutos: [ENLACE F0]. Y si no, ¡ningún problema!

**Mensaje a una asociación universitaria:**
> Hola, soy Javier. Estoy preparando una app educativa y gratuita para aprender a construir carteras **sin dinero real** (no es un bróker y no recomienda nada). Busco personas de 20 a 30 años para una entrevista de una hora por videollamada. ¿Podríais difundir este formulario entre vuestros miembros? [ENLACE F0]. Al terminar os puedo enviar un resumen anónimo de lo aprendido. ¡Gracias!

**Confirmación de cita:**
> ¡Gracias, [nombre]! Te propongo estas horas: [opción 1], [opción 2], [opción 3]. Será por Google Meet, desde tu **móvil** (para la parte en la que pruebas una app) y en un sitio tranquilo. Dura 60 minutos. Te envío el enlace el día antes.

**Recordatorio (el día antes):**
> ¡Hola! Te recuerdo que mañana a las [hora] tenemos la videollamada: [ENLACE MEET]. Ten el móvil cargado y la app de Google Meet instalada. Si no puedes, dímelo sin problema y buscamos otra hora.

**Agradecimiento (después de la sesión):**
> ¡Mil gracias por tu tiempo, [nombre]! Me has ayudado muchísimo. Cuando tenga el resumen te lo envío. [Si aceptó la Liga:] Te escribo el [día] con el inicio de la Liga.

### 3.4 · Cuestionario de selección (formulario F0)
**Sección 1:** el consentimiento de §4.1 (sin aceptar, el formulario termina).

**Sección 2 · Sobre ti:**
1. Nombre o apodo con el que te llamo. *(respuesta corta)*
2. ¿Cómo prefieres que te contacte? Teléfono o usuario de Telegram. *(respuesta corta)*
3. Edad. *(número, validación: entre 20 y 30)*
4. ¿Vives en España? Sí / No.
5. Provincia. *(desplegable)*
6. Género: Mujer / Hombre / Otro / Prefiero no decirlo.
7. ¿Has invertido alguna vez con dinero propio (acciones, fondos, ETF, cripto…)? Nunca / Alguna vez, poco / Sí, de forma habitual. **No preguntes cantidades.**
8. En el último año, ¿has jugado a alguna liga *fantasy* (LaLiga Fantasy, Biwenger, Comunio…)? Sí / No.
9. ¿Trabajas en asesoramiento financiero, en un banco, bróker o gestora, o diseñando apps? Sí / No.
10. ¿Cómo te has enterado? Me lo pasó un conocido / Asociación / Grupo de Telegram o Discord / Redes sociales / Otro.
11. ¿Qué días y horas te vienen mejor? *(casillas: mañanas, tardes, noches, fin de semana)*

**Cómo elegir:** descarta a quien no cumpla 3, 4 o 9 y rellena las cuotas de §3.1 por orden de llegada.

---

## 4 · Consentimiento informado (RGPD) · breve y listo para pegar

> **No es asesoramiento jurídico.** Es un texto informativo basado en los artículos 6.1.a, 7 y 13 del RGPD. Antes de usarlo con más de estas 20 personas, que lo revise un abogado (`02-matriz-legal.md`).

### 4.1 · Texto para la primera sección del formulario F0
> **Participar en la investigación de Klever**
> **Quién:** Javier [NOMBRE Y APELLIDOS], responsable del proyecto Klever. Contacto: [DIRECCIÓN DE CORREO DEL PROYECTO, no una personal].
> **Para qué:** entender cómo aprendéis sobre inversión y probar una app **educativa, gratuita y sin dinero real**. No es un servicio financiero, no recomienda comprar ni vender nada y no hay premios.
> **Qué haremos:** una videollamada de 60 minutos con preguntas, una prueba de la app en tu móvil y unos cuestionarios cortos. Después, si quieres, una liga de 4 semanas por WhatsApp o Telegram.
> **Qué datos:** tu nombre o apodo, tu contacto, edad, provincia, género, si has invertido o jugado a ligas *fantasy*, tus respuestas y, **solo si lo aceptas aparte**, la grabación de voz y de la pantalla del móvil (no hace falta que se vea tu cara). **No te preguntaremos cuánto dinero tienes ni inviertes**; si lo mencionas, no se apuntará.
> **Base legal:** tu consentimiento (art. 6.1.a del RGPD). Puedes retirarlo cuando quieras, sin dar explicaciones y sin consecuencias.
> **Quién lo ve:** solo Javier. Las respuestas se guardan con un código (P01, P02…) en lugar de tu nombre. No se ceden a nadie. Se usan servicios de Google (Forms, Sheets y Meet) como proveedores, que pueden tratar datos fuera de la UE con las garantías que ofrece Google [NV: Marco de Privacidad de Datos UE–EE. UU.].
> **Cuánto tiempo:** las grabaciones se borran al terminar el análisis y, como tarde, el [FECHA: 3 meses después de la última sesión]. Tus datos de contacto se borran entonces también. Las notas con código, sin tu nombre, se conservan hasta el [FECHA: 12 meses].
> **Tus derechos:** acceso, rectificación, supresión, oposición, limitación y portabilidad, escribiendo a [CORREO DEL PROYECTO]. Si crees que no se ha respetado, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).
> **Lo que publiquemos** serán conclusiones anónimas y, como mucho, frases tuyas sin tu nombre ni nada que te identifique.

**Casillas:**
- [obligatoria] Tengo entre 20 y 30 años, he leído la información y quiero participar.
- [opcional] Acepto que se grabe mi voz y la pantalla de mi móvil durante la videollamada.
- [opcional] Acepto que me escribáis para invitarme a la liga de 4 semanas.

### 4.2 · Qué decir en voz alta al empezar a grabar
> «Antes de empezar: ¿sigues de acuerdo en que grabe la voz y la pantalla? Solo la veré yo y la borraré cuando acabe el análisis. Puedes pedirme que pare cuando quieras y no pasa nada.» *(Espera un «sí» claro. Pulsa grabar en OBS. Repite la pregunta para que quede grabada la respuesta.)*

**Si alguien no acepta la grabación:** haz la sesión igual, tomando notas a mano en la hoja.

### 4.3 · Cómo guardar los datos
- Una lista aparte (solo para ti) con «P07 = nombre + contacto». Bórrala en la fecha prometida.
- Las grabaciones, en tu ordenador; **no** en una nube compartida.
- Si alguien pide borrar sus datos: borra su fila de las hojas, su grabación y su contacto, y contesta confirmándolo.

---

## 5 · La sesión moderada (60 minutos)

### 5.1 · Antes de cada sesión (5 min)
- Abre: la hoja de resultados en la fila de esa persona, el guion (este archivo), OBS listo y la demo en tu móvil por si hay que enseñar algo.
- **Cambia los datos de ejemplo** si la sesión anterior dejó algo guardado (la demo pierde lo creado al recargar).
- Ten a mano los enlaces de F1 (SUS) y F2 (Kano A) para pegarlos en el chat de Meet.

### 5.2 · Entrevista (25 min): *Jobs to be Done* + *The Mom Test*

**Las reglas que no se rompen (*The Mom Test*):**
1. **Habla de su vida, no de tu idea.** No menciones Klever hasta la prueba de uso.
2. **Pregunta por el pasado concreto**, no por el futuro: «La última vez que…», nunca «¿Usarías…?».
3. **Escucha más de lo que hablas.** Deja silencios de 5 segundos; la gente los rellena con lo importante.
4. **Desconfía de los halagos** («¡qué buena idea!»), de las hipótesis («yo lo usaría seguro») y de lo genérico («normalmente», «siempre»). Si salen, vuelve a lo concreto: «¿Cuándo fue la última vez?».
5. **Pide compromiso al final** (§5.6): tiempo o reputación, nunca dinero.

| En vez de esto (mal) | Pregunta esto (bien) |
|---|---|
| ¿Te gustaría una app para aprender a invertir? | ¿Cuándo fue la última vez que intentaste aprender algo sobre inversión? ¿Qué hiciste exactamente? |
| ¿Jugarías a una liga de carteras con amigos? | Cuéntame la última liga o competición que montaste con amigos. ¿Quién la empezó? ¿Cuánto duró? |
| ¿Pagarías por…? | ¿Has pagado o dedicado tiempo a algo para aprender esto? ¿A qué? |
| ¿Te parece útil ver la concentración de tu cartera? | ¿Cómo decidiste cuánto poner en cada cosa la última vez? |

**Guion (lee las preguntas en negrita; las de debajo son repreguntas):**

**Calentamiento (2 min)**
- **«Gracias por venir. No hay respuestas buenas ni malas: me interesa cómo lo haces tú. Si algo no te apetece contarlo, me lo dices y pasamos.»**
- **«Cuéntame un poco a qué te dedicas y cómo es una semana normal.»**

**Elegir el «momento de cambio» (3 min).** La entrevista de cambio de JTBD reconstruye **una decisión real reciente**. Elige con la persona la más reciente de estas:
- (a) empezó a usar una app de inversión, ahorro o simulador;
- (b) intentó aprender a invertir (vídeos, libro, curso, preguntar a alguien);
- (c) montó o se unió a una liga *fantasy* u otra competición con amigos.
- **«De estas cosas, ¿cuál has hecho más recientemente? Vamos a hablar de esa vez concreta.»**

**Línea temporal (12 min).** Pregunta en orden y anota con fechas aproximadas:
1. **Primer pensamiento:** **«¿Cuándo se te pasó por la cabeza por primera vez? ¿Dónde estabas, qué había pasado?»**
2. **Búsqueda pasiva:** **«Entre que lo pensaste y que hiciste algo, ¿qué pasó? ¿Te fijabas en algo, alguien te habló de ello?»**
3. **Búsqueda activa:** **«¿Qué buscaste o probaste? ¿Qué descartaste y por qué?»**
4. **Decisión:** **«¿Qué te hizo decidirte al final? ¿Ese día qué pasó?»**
5. **Primer uso:** **«Cuéntame la primera vez que lo usaste. ¿Qué esperabas? ¿Qué te encontraste?»**
6. **Después:** **«¿Lo sigues usando? ¿Cuándo fue la última vez? Si lo dejaste, ¿cuándo y por qué?»**

**Las cuatro fuerzas (5 min).** Si no han salido solas, pregunta:
- **Empuje** (lo que no funcionaba antes): **«¿Qué te molestaba o te faltaba antes de eso?»**
- **Atracción** (lo que esperaba ganar): **«¿Qué te imaginabas que iba a ser mejor?»**
- **Ansiedad** (lo que le frenaba): **«¿Qué te daba miedo o reparo? ¿Qué casi te hace no hacerlo?»**
- **Hábito** (lo que le retenía): **«¿Qué hacías antes en su lugar? ¿Qué te costó dejar?»**

**Situación actual (3 min)**
- **«Ahora mismo, si quisieras saber si tu forma de repartir el dinero tiene sentido, ¿qué harías? ¿Lo has hecho alguna vez?»**
- **«¿Has hablado de inversión con amigos en el último mes? ¿Cómo salió el tema?»**
- **«¿Has dedicado tiempo o dinero a aprender esto en el último año? ¿A qué?»** *(es la señal de que el problema importa)*

**Qué anotar en la hoja** (columnas `jtbd_*`): si hay **episodio concreto** en los últimos 12 meses (sí/no), el «trabajo» en una frase con sus palabras («Cuando…, quiero…, para…»), las cuatro fuerzas en pocas palabras, la solución actual, si ha **dedicado tiempo o dinero** (sí/no) y **una cita literal**.

### 5.3 · Prueba de uso moderada (20 min, 6 tareas)

**Qué se prueba:** la demo publicada (`demo/index.html`), en el **móvil de la persona**, compartiendo su pantalla por Meet.

**Antes de empezar, lee esto en voz alta:**
> «Ahora te voy a pedir que pruebes una app. **No te estoy evaluando a ti, sino a la app:** si algo no sale, es culpa de la app y me ayuda muchísimo verlo. Mientras la usas, **di en voz alta lo que piensas**: qué buscas, qué esperas, qué te sorprende. Yo no te voy a ayudar mucho, porque quiero ver cómo sería si estuvieras sola o solo. Los datos son inventados y no hay dinero real.»

**Durante las tareas:**
- Lee la tarea **exactamente** como está escrita y pégala también en el chat.
- **No expliques la app, no señales botones y no digas «muy bien».**
- Si se queda en silencio: «¿Qué estás pensando?». Si pregunta algo: «¿Qué crees tú?».
- **Pista solo tras 2 minutos atascada**, y una sola: «¿Dónde buscarías…?». Si con la pista tampoco, pasa a la siguiente («No pasa nada, es justo lo que necesito ver»).
- Tras cada tarea, la **pregunta de facilidad** (*Single Ease Question*, SEQ): **«Del 1 al 7, ¿cómo de fácil o difícil te ha resultado? 1 es muy difícil y 7, muy fácil.»**

**Cómo puntuar cada tarea** (columnas `T*_exito`): **1** = la completa sin ayuda · **0,5** = la completa con una pista · **0** = no la completa o termina en un sitio equivocado creyendo que está bien. Apunta el tiempo (segundos) y una frase literal.

| # | Tarea (léela tal cual) | Éxito si… | Qué observar |
|---|---|---|---|
| T1 | **«Crea tu propia cartera con al menos 4 empresas que te interesen, de forma que entre todas sumen el 100 %.»** | Ve en pantalla una cartera con 4 o más posiciones y el total al 100 % (guardada o no) | Dónde empieza, si entiende los pesos, qué hace al pasarse del 100 % |
| T2 | **«Mira tu cartera: ¿qué empresa pesa más y qué te dice la app sobre si está muy concentrada?»** | Dice en voz alta la posición mayor y el nivel que muestra la app (Baja / Media / Alta) | Si entiende «concentración» sin ayuda y qué cree que significa |
| T3 | **«Prueba qué pasaría si la empresa que más pesa pesara menos, y luego decide si te quedas con el cambio o lo deshaces.»** | Prueba un peso menor y termina deshaciendo o conservando el cambio a propósito | Si encuentra dónde probar, si entiende que no cambia nada hasta decidir |
| T4 | **«Busca una empresa de un sector que no tengas en tu cartera y mira qué comprobaciones cumple.»** | Abre la ficha de una empresa de un sector nuevo y lee al menos una comprobación | Cómo filtra o busca, qué entiende de «sin datos» |
| T5 | **«Quieres competir con tus amigos: crea una liga para ellos y encuentra cómo invitarles.»** | Llega al código o enlace de una liga creada por ella | Si encuentra la Liga, si entiende que es privada |
| T6 | **«Averigua cuántos puntos te puede dar la Liga a la semana por tener la cartera bien repartida, y qué más tendrías que hacer para sumar puntos.»** | Dice «hasta 50 por el equilibrio» (o 25 + 25) y nombra al menos otra vía (reto, idea o entrar cada semana) | Si encuentra «Cómo se puntúa» y lo entiende |

> **Ensayo obligatorio (§10.2):** comprueba antes que las 6 tareas se pueden hacer en la demo publicada. Si alguna no se puede (por ejemplo, porque esa versión de la demo no tiene la Liga), **no la cambies sobre la marcha**: sustitúyela en **todas** las sesiones por la misma versión en papel (una captura) y anótalo en la hoja.

**Después de las tareas (1 min):** **«¿Qué es lo que más te ha costado? ¿Y lo que menos?»** y **«Si tuvieras que explicarle a un amigo para qué sirve, ¿qué le dirías?»** *(anota la frase literal: muestra si se entiende la propuesta)*.

### 5.4 · Cuestionario SUS (3 min) · versión española validada
Es la **versión española validada** de la *System Usability Scale* (Sevilla-Gonzalez, Moreno Loaeza, Lazaro-Carrera y otros, *JMIR Human Factors*, 2020; validada en México, con alfa de Cronbach 0,812). Los textos se han copiado **literalmente** del anexo 2 del artículo, descargado de Europe PMC el 9 nov 2026. **No los cambies**, ni siquiera para adaptarlos al español de España: la validación vale para esta redacción. Pega el enlace de F1 en el chat; la persona lo rellena sola.

**Instrucciones (literal):**
> Por favor seleccione de cada uno de los enunciados la opción que mejor describa su experiencia con la herramienta electrónica. Un puntaje de 1 significa que usted se encuentra totalmente en desacuerdo con el enunciado, mientras que un puntaje en 5 significa que está totalmente de acuerdo, un puntaje de 3 significaría que usted se encuentra neutral con el enunciado.

Escala lineal de 1 a 5, con las etiquetas **1 = Totalmente en desacuerdo** y **5 = Totalmente de acuerdo**. Todas obligatorias.

| # | Enunciado (literal) |
|---|---|
| 1 | Me gustaría usar esta herramienta frecuentemente. |
| 2 | Considero que esta herramienta es innecesariamente compleja |
| 3 | Considero que la herramienta es fácil de usar. |
| 4 | Considero necesario el apoyo de personal experto para poder utilizar esta herramienta |
| 5 | Considero que las funciones de la herramienta están bien integradas |
| 6 | Considero que la herramienta presenta muchas contradicciones |
| 7 | Imagino que la mayoría de las personas aprenderían a usar esta herramienta rápidamente |
| 8 | Considero que el uso de esta herramienta es tedioso |
| 9 | Me sentí muy confiado al usar la herramienta |
| 10 | Necesité saber bastantes cosas antes de poder empezar a usar esta herramienta |

**Cómo se calcula (método estándar de Brooke):**
- Preguntas impares (1, 3, 5, 7, 9): respuesta **− 1**.
- Preguntas pares (2, 4, 6, 8, 10): **5 −** respuesta.
- Suma las 10 y multiplica por **2,5**. Sale de 0 a 100. **No es un porcentaje.**
- En la hoja de respuestas de F1 (Google Sheets con configuración de España, separador `;`), la columna A es la marca temporal, la B el código y de la C a la L van SUS1 a SUS10. En la celda M2:
  `=(C2-1+5-D2+E2-1+5-F2+G2-1+5-H2+I2-1+5-J2+K2-1+5-L2)*2,5`
  y arrastra hacia abajo. Copia el resultado en la columna `sus_total` de la hoja maestra. Si Sheets da error de fórmula, tu configuración usa `,` como separador: escribe `2.5` en lugar de `2,5`.
- Referencias habituales: 68 es la media de muchos estudios; el artículo de la versión española interpreta de 68 a 84 como buena usabilidad y más de 85 como excelente.

### 5.5 · Encuesta Kano A (7 min)
Pega el enlace de F2 (§7.3). Di: **«Ahora vas a leer funciones que podría tener la app. Para cada una hay dos preguntas: qué te parecería si la tuviera y qué te parecería si no la tuviera. Contesta rápido, lo primero que sientas.»**

### 5.6 · Cierre y compromiso (2 min)
- **«¿Hay algo que no te haya preguntado y creas que debería saber?»**
- **«¿Conoces a alguien a quien le interese hablar conmigo?»** *(compromiso de reputación; anota cuántos contactos te pasa en `compromiso_presenta`)*
- **La propuesta de la Liga (la señal más fuerte):**
> «Voy a montar una liga de 4 semanas, a mano, por [WhatsApp/Telegram] y una hoja compartida: cada semana repartes una cartera simulada y sumas puntos por tenerla equilibrada, por aprender y por constancia. Sin dinero, sin premios y sin recomendaciones. Te lleva unos 10 minutos a la semana. ¿Te apunto? Si te apetece, puedes traer a un amigo o amiga.»
- Anota **sí / no / quizá** en `compromiso_liga` y si trae a alguien en `compromiso_trae_amigo`. Un «quizá» **cuenta como no**.
- Para la grabación en OBS. Envía el mensaje de agradecimiento (§3.3) y, ese mismo día o al siguiente, el enlace de F4 (árbol) y F3 (Kano B).

---

## 6 · Prueba de árbol de las 3 secciones (remota, 10 min)

**Qué mide:** si, solo con los nombres, la gente sabe dónde buscar cada cosa. No hay diseño ni iconos.
**Herramienta:** Treejack (de Optimal Workshop) es la estándar, pero su plan gratuito es muy limitado [NV]; aquí se usa una **alternativa gratuita en Google Forms con secciones** que registra el primer clic y el destino final. Es una aproximación: **registra peor la ruta** que una herramienta específica.

### 6.1 · El árbol (sale de `ronda40/INFORME-APP-FINAL.md` §3)
```
Mi cartera
  ├─ Resumen de la semana
  ├─ Reparto
  ├─ Mapa
  └─ Evolución
La Liga
  ├─ Tu temporada
  ├─ Reto de la semana
  ├─ Clasificaciones
  ├─ Duelo y fantasma
  └─ Final de temporada
Construye
  ├─ Crear una cartera
  ├─ Descubrir empresas
  ├─ Cartera en equipo
  └─ Ideas guardadas
Tu perfil (el círculo con tu inicial, arriba a la derecha)
  ├─ Avisos
  ├─ Privacidad
  └─ Apariencia y accesibilidad
```

### 6.2 · Las 10 tareas y su respuesta correcta
| # | Tarea (léela tal cual en el formulario) | Correcta |
|---|---|---|
| A1 | Quieres ver cómo era tu cartera hace un mes. | Mi cartera › Evolución |
| A2 | Quieres bajar el peso de la empresa que más pesa en tu cartera. | Mi cartera › Reparto |
| A3 | Quieres saber en qué países venden las empresas que tienes. | Mi cartera › Mapa |
| A4 | Una amiga te ha pasado un código para entrar en la liga de su piso. | La Liga › Clasificaciones |
| A5 | Quieres saber qué tienes que hacer esta semana para ganar más puntos. | La Liga › Reto de la semana |
| A6 | Quieres retar a un amigo a ver quién tiene esta semana la cartera mejor repartida. | La Liga › Duelo y fantasma |
| A7 | Quieres empezar una cartera nueva desde cero. | Construye › Crear una cartera |
| A8 | Quieres encontrar empresas de un sector que aún no tienes. | Construye › Descubrir empresas |
| A9 | Llevas una cartera con 3 amigos y quieres proponerles un cambio. | Construye › Cartera en equipo |
| A10 | Quieres dejar de recibir el aviso de los lunes. | Tu perfil › Avisos |

> A6 y A9 son **a propósito** las más dudosas: comprueban si «equipo» y «duelo» se esperan en La Liga o en Construye.

### 6.3 · Cómo montarlo en Google Forms (paso a paso)
1. **Sección 0:** «Tu código de participante» (respuesta corta; quien no tenga código escribe «X») y este texto: «Imagina una app para practicar con carteras de inversión simuladas, sin dinero real. Te diremos qué quieres hacer y tendrás que elegir **dónde lo buscarías**. No hay respuestas malas: estamos probando la app, no a ti.»
2. **Para cada tarea, 3 secciones:**
   - **«A1 · paso 1»**: la tarea y una pregunta de opción múltiple «¿Dónde lo buscarías?» con 4 opciones: *Mi cartera / La Liga / Construye / Tu perfil*. En los tres puntos de la pregunta, activa **«Ir a la sección según la respuesta»** y manda cada opción a su sección de paso 2.
   - **«A1 · Mi cartera»** (y lo mismo para las otras tres): «¿Y dentro de Mi cartera?» con sus subapartados **más** la opción *«No está aquí: lo buscaría en otro sitio»*.
   - **«A1 · segundo intento»** (solo si eligió «No está aquí»): «¿Dónde lo buscarías entonces?» con las 4 secciones principales.
   - Al terminar cualquiera de ellas, «Después de la sección» → ir a «A2 · paso 1».
3. **Haz dos copias del formulario**: versión 1 con las tareas en orden A1→A10 y versión 2 en orden A10→A1. Envía la versión 1 a los participantes impares y la 2 a los pares (evita el efecto del orden y del aprendizaje).
4. **Última sección (opcional, 1 min):** «Con tus palabras, ¿qué esperarías encontrar en…?» *Mi cartera* / *La Liga* / *Construye* (respuesta corta cada una).

### 6.4 · Cómo se puntúa cada tarea (columna `arbol_A*` de la hoja)
- **D (éxito directo):** sección correcta y subapartado correcto a la primera.
- **I (éxito indirecto):** sección equivocada, «No está aquí» y después la sección correcta.
- **F (fallo):** cualquier otra cosa, incluida la sección correcta con el subapartado equivocado.
- **Éxito** = D + I. **Directo** = D. Los dos se calculan por tarea y por sección (media de sus tareas).

---

## 7 · Encuesta Kano (funciones de la app e ideas *fantasy*)

### 7.1 · Cómo funciona
Para cada función hay **dos preguntas**:
- **funcional:** «Si la app **tuviera** esto, ¿qué te parecería?»;
- **disfuncional:** «Si la app **no tuviera** esto, ¿qué te parecería?».

**Las 5 respuestas, iguales en todas (opción múltiple, obligatoria):**
1. Me gusta
2. Lo doy por hecho
3. Me da igual
4. Puedo aceptarlo
5. No me gusta

**Montaje en Google Forms:** cada función es una sección con una frase de descripción (la de las tablas de abajo) y sus dos preguntas. Antes de la primera, este texto: «Vas a leer funciones que podría tener una app **educativa y gratuita** para practicar con carteras de inversión **simuladas, sin dinero real y sin recomendaciones**. Contesta lo primero que sientas.» Primera pregunta del formulario: el código de participante.

> Para 20 personas, el formulario se divide en dos (A: 14 funciones de la app; B: 11 ideas de juego) para que ninguno pase de unos 8 minutos.

### 7.2 · Tabla de evaluación Kano (estándar)
Fila = respuesta **funcional**; columna = respuesta **disfuncional**.

| Funcional ↓ / Disfuncional → | Me gusta | Lo doy por hecho | Me da igual | Puedo aceptarlo | No me gusta |
|---|---|---|---|---|---|
| **Me gusta** | Q | A | A | A | O |
| **Lo doy por hecho** | R | I | I | I | M |
| **Me da igual** | R | I | I | I | M |
| **Puedo aceptarlo** | R | I | I | I | M |
| **No me gusta** | R | R | R | R | Q |

- **M · Obligatoria:** si falta, molesta; si está, no ilusiona.
- **O · Unidimensional:** cuanto mejor, más satisface.
- **A · Atractiva:** si está, ilusiona; si falta, nadie la echa de menos.
- **I · Indiferente.** **R · Inversa:** molesta tenerla. **Q · Cuestionable:** respuesta contradictoria (no se entendió).

**Clasificar en Google Sheets sin hacerlo a mano:**
1. Crea una pestaña llamada `TablaKano` y pega estas 25 filas (columna A, la clave; columna B, la categoría):
```
Me gusta|Me gusta,Q
Me gusta|Lo doy por hecho,A
Me gusta|Me da igual,A
Me gusta|Puedo aceptarlo,A
Me gusta|No me gusta,O
Lo doy por hecho|Me gusta,R
Lo doy por hecho|Lo doy por hecho,I
Lo doy por hecho|Me da igual,I
Lo doy por hecho|Puedo aceptarlo,I
Lo doy por hecho|No me gusta,M
Me da igual|Me gusta,R
Me da igual|Lo doy por hecho,I
Me da igual|Me da igual,I
Me da igual|Puedo aceptarlo,I
Me da igual|No me gusta,M
Puedo aceptarlo|Me gusta,R
Puedo aceptarlo|Lo doy por hecho,I
Puedo aceptarlo|Me da igual,I
Puedo aceptarlo|Puedo aceptarlo,I
Puedo aceptarlo|No me gusta,M
No me gusta|Me gusta,R
No me gusta|Lo doy por hecho,R
No me gusta|Me da igual,R
No me gusta|Puedo aceptarlo,R
No me gusta|No me gusta,Q
```
   (Pégalo en la celda A1 y usa Datos → «Dividir texto en columnas» con la coma como separador.)
2. En la hoja de respuestas del formulario, junto a cada par de columnas (funcional en C, disfuncional en D, por ejemplo):
   `=BUSCARV(C2&"|"&D2;TablaKano!A:B;2;FALSO)`
3. Para cada función, cuenta cada categoría con `=CONTAR.SI(E2:E21;"A")` (y lo mismo con "O", "M", "I", "R", "Q").

**Coeficientes de satisfacción (Berger y otros, 1993):**
- **Satisfacción (CS)** = (A + O) / (A + O + M + I). De 0 a 1: cuánto ilusiona tenerla.
- **Insatisfacción (DS)** = (O + M) / (A + O + M + I). De 0 a 1: cuánto molesta que falte.

### 7.3 · Formulario F2 · Kano A: funciones de la app (`ronda40/INFORME-APP-FINAL.md` §6)
| Código | Descripción que se lee | Si la tuviera… | Si no la tuviera… |
|---|---|---|---|
| K01 | Tu cartera dibujada como una forma por sectores y, detrás, en transparente, cómo era hace 1, 4 u 8 semanas | Si la app te enseñara tu cartera junto a cómo era hace unas semanas, ¿qué te parecería? | Si la app solo te enseñara tu cartera de hoy, sin compararla con antes, ¿qué te parecería? |
| K02 | Tres semáforos que dicen si tu cartera está concentrada, si es variada y si hay datos suficientes | Si la app resumiera tu cartera en tres semáforos, ¿qué te parecería? | Si la app no te dijera nada sobre si tu cartera está concentrada o es variada, ¿qué te parecería? |
| K03 | Cambiar los pesos arrastrando el borde de un anillo con el dedo | Si pudieras repartir los pesos arrastrando con el dedo, ¿qué te parecería? | Si solo pudieras repartir los pesos escribiendo números, ¿qué te parecería? |
| K04 | Probar un peso distinto, ver qué cambia y elegir «Deshacer» o «Quedármelo» | Si pudieras probar un cambio de peso antes de decidir, ¿qué te parecería? | Si cada cambio de peso se aplicara directamente, sin poder probarlo antes, ¿qué te parecería? |
| K05 | Un mapa con dónde tienen la sede tus empresas, dónde venden y en qué monedas informan | Si la app te mostrara en un mapa dónde están y dónde venden tus empresas, ¿qué te parecería? | Si la app no te dijera nada sobre los países de tus empresas, ¿qué te parecería? |
| K06 | Rebobinar las fotos de los últimos 12 lunes y ver la nota que escribiste al cambiar algo | Si pudieras rebobinar tu cartera semana a semana y leer por qué cambiaste cada cosa, ¿qué te parecería? | Si no pudieras ver cómo era tu cartera en semanas anteriores, ¿qué te parecería? |
| K07 | Un reto cada semana para construir mejor (por ejemplo, «llega a 5 sectores») | Si cada semana te propusiera un reto para mejorar el reparto, ¿qué te parecería? | Si no hubiera retos semanales, ¿qué te parecería? |
| K08 | Ligas privadas con tus amigos con un código o un enlace | Si pudieras crear una liga privada con tus amigos, ¿qué te parecería? | Si solo hubiera una clasificación general con desconocidos, ¿qué te parecería? |
| K09 | Un duelo semanal con un amigo a ver quién tiene la cartera mejor repartida | Si pudieras retar a un amigo a un duelo semanal, ¿qué te parecería? | Si no pudieras retar a nadie en concreto, ¿qué te parecería? |
| K10 | Un resumen de tu temporada en historias, al estilo del «Wrapped» de Spotify | Si al acabar la temporada te hiciera un resumen en historias, ¿qué te parecería? | Si al acabar la temporada no hubiera ningún resumen, ¿qué te parecería? |
| K11 | Crear tu primera cartera en menos de un minuto eligiendo de 3 a 5 empresas, sin registrarte | Si pudieras crear tu primera cartera en un minuto sin registrarte, ¿qué te parecería? | Si tuvieras que registrarte antes de crear tu primera cartera, ¿qué te parecería? |
| K12 | Un feed de empresas que se acaba: unas 10 al día y «Has visto las de hoy» | Si el feed de empresas se acabara tras unas 10 al día, ¿qué te parecería? | Si el feed de empresas no se acabara nunca, ¿qué te parecería? |
| K13 | Una cartera común con 3–5 amigos en la que cada cambio se vota y se explica | Si pudieras llevar una cartera con amigos votando cada cambio, ¿qué te parecería? | Si solo pudieras llevar carteras tú solo, ¿qué te parecería? |
| K14 | Una tarjeta para compartir tu cartera en redes, sin importes ni rentabilidad | Si pudieras compartir una tarjeta con tu cartera, sin cantidades, ¿qué te parecería? | Si no pudieras compartir tu cartera, ¿qué te parecería? |

> **Ojo con K12:** aquí «tenerla» es que el feed **se acabe**. Una respuesta R (inversa) significa que la gente prefiere el feed infinito; aunque salga así, el feed con final **se mantiene por diseño justo** (`ronda40` §7) y solo se anota como tensión.

### 7.4 · Formulario F3 · Kano B: ideas de juego (`ronda41/LIGA-FANTASY.md` §3)
| Código | Descripción que se lee | Si la tuviera… | Si no la tuviera… |
|---|---|---|---|
| F01 | **Modo *draft*:** en una liga privada, cada empresa solo puede estar en una cartera; al empezar, se eligen por turnos | Si en tu liga cada empresa solo pudiera tenerla una persona, elegidas por turnos, ¿qué te parecería? | Si todo el mundo pudiera elegir las mismas empresas, ¿qué te parecería? |
| F02 | **Reglas configurables:** quien crea la liga fija reglas como «máximo 25 % por empresa» o «máximo 3 cambios por semana», gratis | Si quien crea la liga pudiera elegir sus reglas, ¿qué te parecería? | Si todas las ligas tuvieran las mismas reglas fijas, ¿qué te parecería? |
| F03 | **Cierre del lunes:** cuenta la foto de tu cartera del lunes a las 00:00, con cuenta atrás visible | Si hubiera una hora de cierre semanal con cuenta atrás, ¿qué te parecería? | Si no hubiera una hora de cierre y contara cualquier momento, ¿qué te parecería? |
| F04 | **Puntos provisionales:** durante la semana ves cuántos puntos sacarías si el cierre fuera ahora | Si vieras tus puntos provisionales cambiar al mover los pesos, ¿qué te parecería? | Si solo supieras tus puntos el lunes, ¿qué te parecería? |
| F05 | **Puntuación abierta:** la fórmula está publicada y hay un botón «¿Por qué tengo estos puntos?» | Si pudieras ver exactamente por qué tienes cada punto, ¿qué te parecería? | Si solo vieras el total de puntos, sin explicación, ¿qué te parecería? |
| F06 | **Tesis de la semana:** marcas una posición, escribes por qué la tienes y, si la revisas 4 semanas después, ganas puntos de aprendizaje | Si ganaras puntos por escribir y revisar por qué tienes una empresa, ¿qué te parecería? | Si no hubiera puntos por explicar tus decisiones, ¿qué te parecería? |
| F07 | **Cartera ideal de la jornada:** en tu liga, la cartera mejor repartida de la semana, mostrando sectores y semáforos, **no empresas** | Si cada semana se mostrara el reparto mejor equilibrado de tu liga, sin nombres de empresas, ¿qué te parecería? | Si no se mostrara ninguna cartera destacada, ¿qué te parecería? |
| F08 | **Modos:** además de la liga de 12 semanas, desafíos exprés de una semana y temporadas temáticas | Si hubiera desafíos cortos de una semana además de la liga larga, ¿qué te parecería? | Si solo existiera la liga de 12 semanas, ¿qué te parecería? |
| F09 | **Divisiones:** Primera y Segunda en ligas públicas de unas 30 personas, con ascensos y descensos sin castigo | Si hubiera divisiones con ascensos y descensos, ¿qué te parecería? | Si hubiera una única clasificación sin divisiones, ¿qué te parecería? |
| F10 | **Fichaje limitado:** solo en modo *draft* y una vez por temporada, te llevas una empresa de un rival y él elige otra | Si una vez por temporada pudieras quitarle una empresa a un rival, ¿qué te parecería? | Si nunca pudieras quitarle una empresa a nadie, ¿qué te parecería? |
| F11 | **Escudo y nombre de equipo:** cada liga y cada equipo tienen nombre y un emblema generado | Si tu equipo tuviera nombre y escudo propios, ¿qué te parecería? | Si tu equipo solo se identificara con tu apodo, ¿qué te parecería? |

> El modo *draft*, el cierre del lunes, los puntos provisionales, la puntuación abierta, la tesis, el fichaje limitado y el nombre de equipo **se viven además en la Liga a mano** (`04-liga-a-mano.md`). Por eso **Kano B se repite** a quien juegue la Liga, al acabar la semana 4, y se compara lo que dijeron antes y después de probarlo.

---

## 8 · Criterios de éxito fijados de antemano

> **Regla de oro:** estos umbrales se fijan **antes** de la primera sesión y **no se tocan después**. Si un resultado queda justo en la frontera, cuenta como **no alcanzado**. Escribe la fecha en la que los congelas: **[FECHA]**.

| # | Qué | Umbral (20 personas) | Si se alcanza | Si no se alcanza |
|---|---|---|---|---|
| C1 | **T1 «Crea tu cartera»** completada **sin ayuda** (éxito = 1) | **≥ 80 % (16 o más de 20)** | El arranque se mantiene como base | **Rediseñar el arranque** («Enciende tu cartera») y repetir la prueba con 5 personas nuevas antes de construir |
| C2 | **SUS** medio | **≥ 70** | Se puede construir sobre esta base | Revisar los 3 problemas más repetidos de la prueba de uso antes de construir; repetir con 5 personas |
| C3 | Cada una de las tareas T2–T6 | ≥ 70 % de éxito (sin ayuda o con una pista) | — | Esa pantalla se rediseña; anota el porqué con las citas |
| C4 | **Prueba de árbol**, cada sección (media de sus tareas) | Éxito ≥ 70 % **y** directo ≥ 60 % | Se mantiene el nombre | **Cambiar el nombre** de esa sección (usar las palabras de §6.3, punto 4) y repetir el árbol |
| C5 | Prueba de árbol, A6 y A9 | Éxito ≥ 60 % cada una | Duelo en La Liga y Equipo en Construye se quedan donde están | Mover esa función a donde la buscó la mayoría |
| C6 | **Trabajo real (JTBD):** episodio concreto en los últimos 12 meses en que intentó aprender o practicar inversión | **≥ 8 de 20** | El problema existe para este público | Señal de que el «trabajo» no es este: revisar la propuesta antes de construir |
| C7 | Ha dedicado **tiempo o dinero** a aprender esto en el último año | ≥ 5 de 20 | El problema importa lo bastante | Riesgo de «interesante, pero no lo usaré» |
| C8 | **Compromiso:** dice «sí» a la Liga a mano y da un apodo en la propia sesión | **≥ 8 de 20 (40 %)** | Arrancar la Liga a mano | Con **menos de 5**, la Liga no es el motor: replantear antes de construirla |
| C9 | **Kano:** decisión por función | M → imprescindible en la v1 · O → v1 si es barata · A → candidata, por orden de CS · I → fuera de la v1 · R ≥ 25 % → quitar o hacerla opcional · Q > 20 % → la pregunta no se entendió: no decidir | — | — |

**Cómo se decide la categoría Kano de una función:** la más votada. Si las dos primeras están a **1 respuesta o menos** de diferencia, es **mixta** y se decide con CS (si CS ≥ 0,5, se trata como A u O; si no, como I).

**Kano no decide sola:** cualquier función que la matriz legal (`02-matriz-legal.md`) marque como problemática queda fuera, guste o no.

---

## 9 · Análisis paso a paso (1 día, en Google Sheets)
1. **Junta todo:** copia en la hoja maestra las puntuaciones SUS (F1), las de árbol (F4) y los recuentos Kano (F2 y F3).
2. **Prueba de uso:** media de `T*_exito` por tarea; cuenta cuántos 1 hay en T1 (C1). Lista los problemas que se repiten en **3 o más** personas, con una cita cada uno.
3. **SUS:** media de la columna `sus_total` (C2). Mira también la dispersión: si hay muchos por debajo de 50, busca qué tienen en común.
4. **Árbol:** por tarea, % de D, % de I y % de F; por sección, la media (C4 y C5). Lee las respuestas de «¿qué esperarías encontrar en…?».
5. **Entrevistas (síntesis por afinidad):**
   - pega en tarjetas (una fila por cita) cada empuje, atracción, ansiedad y hábito;
   - agrúpalas por temas parecidos;
   - un tema cuenta si sale en **3 o más** personas;
   - escribe el «trabajo» más repetido en una frase: «Cuando…, quiero…, para…».
6. **Kano:** categoría, CS y DS por función, y la decisión de la tabla C9. Compara Kano B antes y después de la Liga.
7. **Escribe la conclusión** en 10 líneas: qué criterios se han cumplido y cuáles no, y qué cambia. Distingue siempre **observado** (lo que pasó) de **interpretación** (lo que crees que significa).

---

## 10 · Instrucciones para hacerlo tú solo

### 10.1 · Lista de comprobación de preparación
- [ ] Rellenado lo que va entre corchetes: [NOMBRE Y APELLIDOS], [CORREO DEL PROYECTO], [FECHA] de borrado y de congelación de criterios.
- [ ] Demo publicada y abierta en un móvil que no sea el tuyo.
- [ ] Formularios F0–F4 creados, probados enviándote una respuesta de prueba y **borrada después** esa respuesta.
- [ ] Hoja maestra importada desde `03-hoja-resultados.csv`.
- [ ] OBS Studio instalado: fuente «Captura de pantalla» + «Audio del escritorio» + «Micrófono»; prueba de 1 minuto y comprueba que se oyen las dos voces.
- [ ] Criterios de §8 congelados con fecha.

### 10.2 · Ensayo con una persona de confianza (no cuenta en los resultados)
Haz la sesión completa con alguien cercano. Comprueba: que dura 60 minutos o menos, que **las 6 tareas se pueden hacer en la demo**, que la grabación funciona y que los formularios se envían bien. Corrige lo que falle **antes** de la primera sesión real. Desde la primera sesión real, **no cambies nada**.

### 10.3 · Durante las sesiones
- Haz como mucho **3 sesiones al día**, con 30 minutos entre una y otra para pasar las notas a la hoja mientras las recuerdas.
- Al acabar cada sesión, rellena su fila **ese mismo día**.
- Si a mitad de las sesiones algo es evidentemente un error de la demo (por ejemplo, un botón que no funciona), anótalo, **pero no lo arregles** hasta acabar las 20: si no, las sesiones dejan de ser comparables.

### 10.4 · Errores típicos (y cómo evitarlos)
| Error | Cómo evitarlo |
|---|---|
| Explicar la app cuando la persona se atasca | Cuenta mentalmente hasta 10; usa solo la pista de §5.3 |
| Preguntar «¿te gusta?» o «¿lo usarías?» | Vuelve a «la última vez que…» |
| Entrevistar a amigos | Solo segundo grado y desconocidos |
| Ponerse a la defensiva con una crítica | Responde «Gracias, cuéntame más» y apúntalo literal |
| Cambiar los umbrales al ver los datos | Están congelados con fecha (§8) |
| Apuntar cantidades de dinero que la persona menciona | No se apuntan, aunque las diga |
| Que alguien pida consejo de inversión al final | «No puedo recomendarte nada: la app es solo para practicar con carteras simuladas» |

---

## 11 · Qué está comprobado y qué es supuesto
- **Comprobado** (consultado el 9 nov 2026): los enunciados literales del SUS en español y sus instrucciones, en el anexo 2 del artículo de Sevilla-Gonzalez y otros (2020), descargado de Europe PMC; las reglas de puntos de la Liga (`public/js/liga.js`) y los umbrales de los semáforos (`public/js/senales.js`); las funciones de `ronda40` §6 y las ideas de `ronda41` §3.
- **Método estándar, no comprobado en una fuente en esta ronda:** la tabla de evaluación Kano y los coeficientes CS/DS (Berger y otros, 1993), las reglas de *The Mom Test*, la estructura de la entrevista de cambio de JTBD (línea temporal y cuatro fuerzas) y la SEQ.
- **Supuesto [NV]:** que Google Meet no graba en cuentas personales gratuitas (fuentes secundarias), que Jitsi tiene grabación local, el nombre de los botones de Cloudflare y de la programación de citas de Google, y las garantías de transferencia de datos de Google.
- **Supuesto de producto:** que la demo actual tiene todo lo necesario para las 6 tareas. Se comprueba en el ensayo (§10.2).
- **Sin ejecutar:** todo el kit. No hay resultados.

## Fuentes
- Sevilla-Gonzalez M. R., Moreno Loaeza L., Lazaro-Carrera L. S. y otros (2020). *Spanish Version of the System Usability Scale for the Assessment of Electronic Tools: Development and Validation.* JMIR Human Factors 7(4): e21161. https://humanfactors.jmir.org/2020/4/e21161/ · anexos en https://www.ebi.ac.uk/europepmc/webservices/rest/PMC7773510/supplementaryFiles
- Brooke, J. (1996). *SUS: a «quick and dirty» usability scale.*
- Berger, C. y otros (1993). *Kano's methods for understanding customer-defined quality.* Center for Quality Management Journal.
- Fitzpatrick, R. (2013). *The Mom Test.*
- Moesta, B. y Spiek, C. Entrevista de cambio de *Jobs to be Done* (Re-Wired Group).
- RGPD (Reglamento (UE) 2016/679), arts. 6, 7 y 13; Agencia Española de Protección de Datos, https://www.aepd.es
