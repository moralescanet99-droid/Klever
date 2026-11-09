# 04 · La Liga a mano: 4 semanas, 20 personas, sin código (ronda 42, C58 + C60)

> **Para qué:** saber, **antes de programar nada**, si la Liga engancha de forma sana: si la gente entra cada semana, entiende cómo se ganan los puntos y si el modo *draft* aporta algo.
> **Cómo:** una liga de verdad durante 4 semanas, llevada por Javier con **Google Forms**, una **hoja compartida de Google Sheets** y un grupo o lista de **WhatsApp o Telegram**.
> **Reglas de puntos:** las **reales** de Klever (`public/js/liga.js` y `ronda36/LIGA.md`): **Equilibrio 50 · Aprendizaje 30 · Constancia 20**, con los umbrales de los semáforos de `public/js/senales.js`. Las únicas diferencias están en §2.8 y son simplificaciones para hacerlo en papel.
> **Umbral fijado de antemano:** si en la **semana 4** están activos **menos del 30 %** de los inscritos, **se rediseña la Liga** antes de construirla (§6).
> **Estado:** **preparado, no ejecutado.**

---

## 0 · Resumen
- **Quién:** las personas de las entrevistas que dijeron «sí» (`03-kit-investigacion.md` §5.6) y los amigos que traigan, **hasta 20**. Todas mayores de 18 (de 20 a 30 años).
- **Dos ligas privadas de 10** para comparar:
  - **Liga A · *Draft*:** cada empresa solo puede estar en una cartera; se reparten por turnos al empezar.
  - **Liga B · Clásica:** cada persona elige las empresas que quiera, aunque se repitan.
  - Mismas reglas de puntos en las dos. Si al final sois **menos de 12**, se hace **una sola liga *draft***.
- **Cuánto dura:** semana 0 (inscripción y *draft*) + 4 semanas de juego + encuesta de salida.
- **Qué hace cada persona por semana (unos 10 min):** rellenar el formulario «Mi foto de la semana» entre el lunes y el domingo.
- **Qué haces tú por semana (unos 45–60 min):** el lunes, calcular los puntos, actualizar la hoja y enviar el mensaje; el miércoles, un recordatorio.
- **Sin dinero, sin premios, sin recomendaciones.** Se gana reconocimiento: puesto, una insignia (emoji) y la «cartera mejor repartida» de la semana (solo sectores y semáforos).

**Calendario (ejemplo con inicio el lunes 7 de diciembre):**
| Semana | Fechas | Qué pasa |
|---|---|---|
| 0 | 30 nov – 6 dic | Inscripción, nombres de equipo, *draft* de la Liga A (domingo 6) |
| 1 | 7 – 13 dic | Primera foto · reto 1 |
| 2 | 14 – 20 dic | Reto 2 |
| 3 | 21 – 27 dic | Reto 3 · ventana de fichaje en la Liga A |
| 4 | 28 dic – 3 ene | Reto 4 |
| Cierre | lunes 4 ene | Clasificación final, insignias, encuesta de salida y Kano B otra vez |

> Evita que las 4 semanas caigan en Navidad si puedes: las fiestas bajan la actividad y confundirían el resultado. Si coinciden, anótalo en el informe.

---

## 1 · Herramientas (todas gratuitas)
| Pieza | Herramienta | Cómo |
|---|---|---|
| Inscripción | Google Forms «Inscripción a la Liga» (§3.1) | Sin recopilar correos |
| Foto semanal | Google Forms «Mi foto de la semana» (§3.2) | Uno para toda la temporada |
| Clasificación y *draft* | Una hoja de Google Sheets «Liga Klever · temporada de prueba» | Compartida **solo en lectura**, con «Cualquier persona con el enlace»; **solo apodos** |
| Tu hoja de cálculo | Otra hoja **privada** con las respuestas del formulario | Nadie más la ve: contiene las tesis y los códigos |
| Mensajes | **Lista de difusión de WhatsApp** o **canal de Telegram** + grupo opcional | Ver §1.1 |

### 1.1 · Privacidad del canal
- **Lista de difusión de WhatsApp:** cada persona recibe tu mensaje en privado y **nadie ve los números de los demás** (solo les llega si te tienen guardado en sus contactos). Es la opción por defecto.
- **Grupo** de WhatsApp o Telegram: da más «pique», pero en WhatsApp **todos ven el número de todos**. Ofrécelo **solo si todos lo aceptan** por escrito (casilla del formulario de inscripción). En Telegram cada persona puede ocultar su número en sus ajustes de privacidad.
- Uno por liga: «Liga A · *Draft*» y «Liga B · Clásica».

---

## 2 · Reglas (texto para enviar y fijar en la hoja)

### 2.1 · Lo básico
1. **Es una simulación:** sin dinero real, sin apuestas, sin premios en dinero y sin compras. **No es consejo de inversión** y nadie recomienda comprar ni vender nada.
2. Cada persona tiene **una cartera simulada** con nombre de equipo y un escudo (un emoji). Sin logotipos de marcas.
3. Solo se pueden usar **las empresas de la lista de §8** (109 acciones de Estados Unidos con su sector, las mismas que usa Klever). **No se usan ETF** en esta prueba (§2.8).
4. Los pesos van en **porcentajes enteros** y la cartera tiene que sumar **exactamente 100 %**.
5. **Cierre semanal:** cuenta la **última foto enviada antes del lunes a las 00:00** (hora peninsular). Lo que envíes después cuenta para la semana siguiente.

### 2.2 · Puntos de cada semana (hasta 100)
**Equilibrio (hasta 50)**, solo si la cartera está al 100 % y tiene **al menos 4 posiciones** (con peso mayor que 0). Si no, el equilibrio de esa semana es 0.

| Semáforo | Cómo se calcula | Puntos |
|---|---|---|
| **Concentración Alta** | La mayor posición pesa **40 % o más**, o el mayor sector **60 % o más** | 0 |
| **Concentración Media** | No es Alta, y la mayor posición pesa **25 % o más** o el mayor sector **40 % o más** | 12 |
| **Concentración Baja** | La mayor posición pesa **menos del 25 %** y el mayor sector **menos del 40 %** | 25 |
| **Variedad Poca** | **1 o 2** sectores distintos | 0 |
| **Variedad Media** | **3 o 4** sectores distintos | 12 |
| **Variedad Amplia** | **5 o más** sectores distintos | 25 |

> El «sector» es el de la lista de §8. **«Materiales (oro)» cuenta como un sector distinto de «Materiales»**, igual que en Klever.

**Aprendizaje (hasta 30)**
- **Reto de la semana** conseguido: **20** (los retos están en §4).
- **Idea de la semana:** escribir en el formulario una **tesis** sobre una de tus posiciones (por qué la tienes y qué te haría cambiar de opinión), o **revisar** una tesis de una semana anterior y anotar qué ha cambiado: **10**. Es la versión en papel de «una idea guardada o revisada en el Cuaderno». **Las tesis son privadas:** solo las lee Javier y nunca se publican (para que nada se lea como recomendación).

**Constancia (hasta 20)**
- **Enviar la foto esa semana** (aunque sea marcando «mi cartera sigue igual»): **10**.
- **Racha:** **+2 por cada semana seguida** enviando, sin contar la primera, hasta un máximo de +10. En 4 semanas: semana 1 = 10, semana 2 = 12, semana 3 = 14, semana 4 = 16 si no has fallado ninguna. Si fallas una semana, la racha vuelve a empezar.

**Si una semana no envías nada:** no sumas constancia ni aprendizaje, pero **tu equilibrio sigue contando con tu última foto**.

**Clasificación:** la suma de todas las semanas. **Empates:** gana quien tenga **más semanas con concentración Baja**; después, quien se inscribió antes.

### 2.3 · Modo *draft* (solo Liga A)
1. **Cada empresa solo puede estar en una cartera de la liga.**
2. **El *draft*** (el domingo de la semana 0): cada persona elige **6 empresas por turnos**, en **orden de serpiente**: en la ronda 1 se elige del 1 al 10, en la ronda 2 del 10 al 1, y así hasta 6 rondas (60 empresas de las 109).
3. **El orden** se sortea delante de todos (§5.2).
4. **Después del *draft*:** repartes los pesos de tus 6 empresas como quieras (puedes dejar alguna al 0 %, pero necesitas al menos 4 con peso para puntuar en equilibrio).
5. **Agentes libres:** las 49 empresas que nadie eligió. **Cada semana puedes hacer como mucho 1 cambio:** sueltas una de tus empresas y coges una libre. Si dos personas piden la misma, se la queda **quien envió antes** el formulario (marca temporal). La que sueltas queda libre desde el lunes siguiente.
6. **Ventana de fichaje (solo en la semana 3, una vez en toda la temporada y voluntaria):** puedes llevarte **una empresa de un rival**. Ese rival elige a cambio una empresa libre antes del jueves a las 23:59; si no elige, Javier le asigna **la primera libre de ese mismo sector por orden alfabético del nombre** (si no queda ninguna, la primera libre de la lista). A cada persona solo se le puede quitar **una** empresa en la temporada.

### 2.4 · Liga B · Clásica
- Eliges **las empresas que quieras** de la lista, entre 4 y 10, y puedes cambiarlas cada semana sin límite.
- Mismos puntos, mismos retos y mismo cierre.

### 2.5 · Cartera mejor repartida de la semana
Cada lunes se destaca en cada liga la cartera con **más puntos de equilibrio** (si empatan, la que tiene la mayor posición más pequeña). Se muestran **solo sus semáforos y sus sectores con su peso**, **nunca las empresas**, y solo con permiso de su autor (casilla de inscripción).

### 2.6 · Calculadora de puntos provisionales (opcional)
En la hoja compartida hay una pestaña **«Calculadora»**: Archivo → «Hacer una copia», escribes tus pesos y ves cuántos puntos de equilibrio sacarías **si el cierre fuera ahora** (§5.4).

### 2.7 · Juego limpio
- Una cartera por persona. Nada de cuentas dobles.
- **En los grupos no se recomienda comprar ni vender nada real** ni se habla de cuánto dinero tiene nadie. Si pasa, Javier lo recuerda una vez en privado.
- Puedes dejar la Liga cuando quieras con un mensaje: se borran tus datos de la hoja.
- Si Javier se equivoca al calcular, **los puntos se corrigen** en cuanto se detecte y se avisa (cláusula de errores de `ronda41` §4.4).

### 2.8 · Diferencias con la app (honestidad)
| En la app | En la versión a mano | Por qué |
|---|---|---|
| Se pueden usar ETF; los fondos cuentan como una variedad más | **Solo acciones** de la lista | Simplifica el cálculo de sectores |
| «Entrar» = abrir la app esa semana | «Entrar» = **enviar el formulario** esa semana | No hay app |
| El reto se comprueba con la foto del lunes | Igual, pero **solo cuenta si enviaste el formulario esa semana** | Evita retos «heredados» de una foto antigua |
| La idea se guarda en el Cuaderno | Se escribe en el formulario | No hay Cuaderno |
| Temporada de 12 semanas | **4 semanas** | Es una prueba |
| Inscripción hasta la semana 2 | Inscripción solo en la semana 0 | El *draft* necesita saber quién juega |

---

## 3 · Formularios (textos para copiar)

### 3.1 · «Inscripción a la Liga Klever (prueba de 4 semanas)»
Texto inicial:
> Liga de **4 semanas** con carteras **simuladas**: sin dinero real, sin apuestas, sin premios en dinero y sin compras. No es consejo de inversión. Solo para mayores de 18.
> **Datos:** tu apodo, tu nombre de equipo, tu contacto (para enviarte los mensajes) y lo que envíes cada semana. Responsable: Javier [NOMBRE Y APELLIDOS], [CORREO DEL PROYECTO]. Base legal: tu consentimiento (art. 6.1.a RGPD), que puedes retirar cuando quieras. En la hoja compartida **solo aparece tu apodo**. Las tesis que escribas solo las lee Javier. Todo se borra el [FECHA: 2 meses después del cierre]. Derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad en [CORREO DEL PROYECTO]; reclamaciones en www.aepd.es.

Preguntas:
1. [Obligatoria] Casilla: «Soy mayor de 18 años, he leído la información y quiero participar.»
2. Tu código de participante (si hiciste la entrevista; si no, deja «X»).
3. Apodo (3–20 caracteres, letras, números, espacios, punto o guion; **nunca tu correo**).
4. Nombre de tu equipo.
5. Tu escudo: elige un emoji.
6. Código secreto de 4 cifras (lo escribirás cada semana para que nadie envíe la foto por ti).
7. ¿Con quién vienes? (apodo de la persona que te invitó, o «nadie»).
8. Casilla opcional: «Acepto estar en un grupo donde los demás vean mi número de teléfono.»
9. Casilla opcional: «Si mi cartera es la mejor repartida de la semana, se pueden mostrar sus sectores y semáforos (nunca las empresas).»
10. Liga A (*draft*): ¿prefieres hacer el *draft* en directo por videollamada (40 min, domingo [HORA]) o enviar una lista? En directo / Lista / Me da igual.

### 3.2 · «Mi foto de la semana» (uno para toda la temporada)
1. Apodo. 2. Código secreto. 3. Semana: 1 / 2 / 3 / 4.
4. **¿Ha cambiado tu cartera desde tu última foto?** «No, sigue igual» → saltar a la pregunta 7 / «Sí» → pregunta 5.
5. **Tus posiciones** (8 pares de respuesta corta; deja en blanco las que no uses): «Empresa 1 (código, por ejemplo KO)» y «Peso 1 (%)», con validación numérica de 0 a 100… hasta la 8. *(La Liga B puede necesitar hasta 10: añade 2 pares más en su versión.)*
6. **Solo Liga A · cambio con agentes libres** (opcional): «Suelto…» y «Cojo…» (código). **Semana 3:** «Fichaje: me llevo (código) del equipo (apodo)».
7. **Idea de la semana** (opcional, 10 puntos): «Elige una de tus posiciones. ¿Por qué la tienes? ¿Qué te haría cambiar de opinión?» o «Revisa una idea de otra semana: ¿qué ha cambiado?» *(párrafo)*.
8. **Reto de la semana:** «¿Crees que lo has conseguido? Sí / No / No lo sé» (lo comprueba Javier; esta respuesta solo sirve para medir si se entiende).
9. ¿Has usado la calculadora esta semana? Sí / No.
10. ¿Cuántos minutos le has dedicado a la Liga esta semana? *(número)*
11. ¿Alguna duda o queja? *(opcional)*

---

## 4 · Retos de las 4 semanas (sacados de los retos reales de Klever, `public/js/semana.js`)
| Semana | Reto (texto del mensaje) | Cómo lo compruebas en la foto | Puntos |
|---|---|---|---|
| 1 | **Deja tu cartera sin alertas de concentración** | Mayor posición **< 25 %** y mayor sector **< 40 %** | 20 |
| 2 | **Añade una categoría (sector) que no tenías** | Hay al menos un sector que no estaba en tu foto de la semana 1 (o en la última que enviaste) | 20 |
| 3 | **Mejora un indicador respecto a otra semana** | Tu Concentración o tu Variedad de esta semana es **mejor que en alguna semana anterior** (Alta → Media → Baja; Poca → Media → Amplia) | 20 |
| 4 | **Escribe en una idea qué te haría cambiar de opinión** | La pregunta 7 del formulario contesta de forma reconocible «qué me haría cambiar de opinión» | 20 |

> Si alguien ya tenía en la semana 3 Concentración Baja y Variedad Amplia desde el principio, no puede mejorar: en ese caso el reto 3 se da por conseguido si **mantiene** los dos niveles. Esta excepción se anuncia en el mensaje de la semana 3, para todos por igual.

---

## 5 · Cómo llevarlo tú (paso a paso)

### 5.1 · La hoja compartida «Liga Klever · temporada de prueba»
| Pestaña | Contenido |
|---|---|
| **Reglas** | El texto de §2 |
| **Empresas** | La lista de §8 con una columna «Liga A: equipo que la tiene» (vacía = libre) |
| **Draft** | Ronda · turno · equipo · empresa · sector (60 filas) |
| **Semana 1 … Semana 4** | Una fila por persona con la hoja de puntuación de §5.3 (sin tesis ni códigos) |
| **Clasificación** | Liga A y Liga B: puesto, escudo, equipo, apodo, puntos totales, semanas con concentración Baja |
| **Calculadora** | §5.4 |

### 5.2 · El *draft* de la Liga A (domingo de la semana 0)
- **Sorteo del orden** (en directo o grabado en vídeo): en una hoja, escribe los 10 apodos en la columna A y en la B `=ALEATORIO()`; ordena por la columna B. Comparte una captura en el grupo.
- **En directo (recomendado, 40 min):** videollamada; cada persona tiene **2 minutos** por turno; tú escribes cada elección en la pestaña «Draft» y la marcas en «Empresas». Si alguien no está o se le acaba el tiempo, se usa su lista (siguiente punto).
- **Por listas (si no se puede en directo):** cada persona envía antes del sábado una **lista ordenada de 15 empresas**. Tú vas turno a turno, en serpiente, dando a cada uno **la primera de su lista que siga libre**. Si se le acaba la lista, la primera libre de un sector que aún no tenga, por orden de la lista de §8. Tardas unos 30 minutos.
- Comparte la pestaña «Draft» completa en el mensaje del domingo.

### 5.3 · Hoja de puntuación (una fila por persona y semana)
| Columna | Qué escribes |
|---|---|
| A · Apodo | |
| B · ¿Envió esta semana? | Sí / No |
| C · Foto que cuenta | «Esta semana» o «La de la semana N» (si no envió) |
| D · ¿Suma 100 %? | Sí / No |
| E · Nº de posiciones con peso | |
| F · Mayor posición (%) | |
| G · Mayor sector (%) | Suma los pesos de cada sector y quédate con el mayor |
| H · Nº de sectores | |
| I · Concentración | Alta / Media / Baja (tabla de §2.2) |
| J · Puntos de concentración | 0 / 12 / 25 (0 si D = No o E < 4) |
| K · Variedad | Poca / Media / Amplia |
| L · Puntos de variedad | 0 / 12 / 25 (0 si D = No o E < 4) |
| M · **Equilibrio** | J + L |
| N · Reto conseguido | Sí / No (No si B = No) → 20 / 0 |
| O · Idea | Sí / No (No si B = No) → 10 / 0 |
| P · **Aprendizaje** | N + O |
| Q · Racha | Semanas seguidas enviando, incluida esta (0 si B = No) |
| R · **Constancia** | Si B = Sí: 10 + el menor entre 10 y 2 × (Q − 1). Si B = No: 0 |
| S · **Total de la semana** | M + P + R |
| T · Acumulado | Total de la semana anterior + S |
| U · Semanas con concentración Baja | Acumulado de las semanas con I = Baja |

**Fórmulas opcionales (Google Sheets en español, separador `;`):**
- I (Concentración): `=SI(O(F2>=40;G2>=60);"Alta";SI(O(F2>=25;G2>=40);"Media";"Baja"))`
- J: `=SI(O(D2="No";E2<4);0;SI(I2="Baja";25;SI(I2="Media";12;0)))`
- K (Variedad): `=SI(H2>=5;"Amplia";SI(H2>=3;"Media";"Poca"))`
- L: `=SI(O(D2="No";E2<4);0;SI(K2="Amplia";25;SI(K2="Media";12;0)))`
- R (Constancia): `=SI(B2="Sí";10+MIN(10;2*(Q2-1));0)`

**Ejemplo resuelto (Liga A, apodo «Nube», 6 empresas del *draft*):**
| Semana | Qué envía | Equilibrio | Aprendizaje | Constancia | Total | Acumulado |
|---|---|---|---|---|---|---|
| 1 | AAPL 20 · KO 20 · JNJ 20 · JPM 15 · NEE 15 · CAT 10. Mayor posición 20 %, mayor sector 20 %, 6 sectores → Baja (25) + Amplia (25). Reto 1 sí; escribe una tesis | 50 | 20 + 10 = 30 | racha 1 → 10 | **90** | 90 |
| 2 | No envía. Cuenta la foto de la semana 1 | 50 | 0 | 0 (racha 0) | **50** | 140 |
| 3 | AAPL 30 · KO 20 · JNJ 20 · JPM 10 · NEE 10 · CAT 10. Mayor posición 30 % → Media (12); 6 sectores → Amplia (25). Reto 3 no (ha empeorado); revisa su tesis | 37 | 0 + 10 = 10 | racha 1 → 10 | **57** | 197 |
| 4 | «Sigue igual». Escribe qué le haría cambiar de opinión sobre AAPL | 37 | 20 + 10 = 30 | racha 2 → 12 | **79** | **276** |

Semanas con concentración Baja: **2** (la 1 y la 2, que hereda la foto de la 1). **Máximo posible en 4 semanas:** 90 + 92 + 94 + 96 = **372**.

### 5.4 · Pestaña «Calculadora»
Celdas para escribir hasta 10 pares empresa–peso; al lado, `=BUSCARV(A2;Empresas!A:C;3;FALSO)` para el sector; abajo, la suma de pesos, la mayor posición (`=MAX(B2:B11)`), el mayor sector (una tabla con `=SUMAR.SI(C2:C11;"Tecnología";B2:B11)` por sector), el número de sectores con peso, y los semáforos y puntos con las fórmulas de §5.3. Arriba, en grande: «**Simulación · sin dinero real · no es consejo**».

### 5.5 · Rutina semanal
| Cuándo | Qué | Tiempo |
|---|---|---|
| **Lunes, mañana** | Descarga las respuestas. Para cada persona, quédate con la **última foto antes del lunes 00:00**. Rellena su fila. Aplica los cambios de agentes libres por orden de llegada. Actualiza «Clasificación» y «Empresas» | 30–45 min |
| **Lunes, mediodía** | Envía el mensaje del lunes (§7). Apunta las métricas de la semana (§6.1) | 10 min |
| **Miércoles, tarde** | **Un solo** recordatorio, solo a quien no ha enviado la foto | 5 min |
| **Cualquier día** | Contesta dudas. Anota cuántas hay y de qué | — |

**Nunca:** recordatorios diarios, «fulano te ha adelantado», cuentas atrás falsas o mensajes a quien ha dicho que lo deja (más allá del único mensaje de §7.9).

---

## 6 · Qué medir y umbrales fijados de antemano

### 6.1 · Cada lunes (pestaña privada «Métricas»)
| Métrica | Definición exacta | Liga A | Liga B |
|---|---|---|---|
| Inscritos | Personas que terminaron la semana 0 (en la Liga A, que tienen equipo tras el *draft*). **Es el denominador fijo de todo** | | |
| **Activos** | Inscritos que **enviaron al menos una foto** entre el lunes 00:00 y el domingo 23:59 de esa semana | | |
| % activos | Activos / inscritos | | |
| Carteras válidas | Activos con foto al 100 % y 4 o más posiciones | | |
| Reto conseguido | % de activos | | |
| Idea escrita | % de activos | | |
| «Creo que lo he conseguido» acertado | % de activos cuya respuesta 8 coincide con tu comprobación (mide si se entiende el reto) | | |
| Calculadora usada | % de activos | | |
| Minutos declarados | Mediana | | |
| Cambios de empresa | Media de empresas distintas respecto a la semana anterior (vigila que la Liga **no anime a operar mucho**) | | |
| Dudas sobre las reglas | Número | | |
| Errores de cálculo detectados | Número (los que encuentra alguien o tú) | | |
| Mensajes espontáneos en el grupo | Número (si hay grupo) | | |
| Incidencias «de consejo» | Mensajes que recomiendan comprar o vender algo real, o que dicen haber operado con dinero real por la Liga | | |
| Tu tiempo | Minutos que te ha llevado la semana | | |
| Bajas | Personas que han dicho que lo dejan, con su motivo | | |

### 6.2 · Umbrales (se congelan con fecha antes de la semana 0: **[FECHA]**)
| # | Qué | Umbral | Decisión |
|---|---|---|---|
| **U1** | **% activos en la semana 4**, las dos ligas juntas | **≥ 30 %** de los inscritos (con 20 inscritos, **6 o más**) | **Si no se alcanza: rediseñar la Liga** antes de programarla (motivos de las bajas + encuesta de salida). Si se alcanza, seguir. Con ≥ 50 % (10 o más de 20), señal fuerte |
| U2 | % activos en la semana 1 | ≥ 70 % (14 o más de 20) | Si no se alcanza, el problema está en el arranque (inscripción, *draft*, primer formulario), no en la retención: revisar eso primero |
| U3 | *Draft* frente a clásica | Activos en la semana 4 de la Liga A − activos de la Liga B **≥ 3 personas** (con 10 y 10) | Indicio a favor del *draft*. Con menos de 3, **no hay diferencia demostrable** (con 10 personas por liga es solo orientativo) |
| U4 | Comprensión: en la encuesta de salida, explica bien cómo se ganan los puntos (nombra al menos 2 de los 3 bloques) | ≥ 70 % de quienes la contestan | Si no, la puntuación es demasiado complicada: simplificarla o mostrar el desglose («¿Por qué tengo estos puntos?») |
| U5 | Cambios de empresa | Media ≤ 2 por persona y semana | Si se supera, la Liga anima a «operar»: revisar reglas (por ejemplo, limitar cambios) |
| U6 | Incidencias «de consejo» | 0–2 en total | Con 3 o más, la parte social necesita diseño de moderación: refuerza «sin chat libre» |
| U7 | Errores de cálculo | ≤ 2 en total | Si hay más, las reglas son demasiado difíciles de calcular a mano y probablemente de entender |
| U8 | Tu tiempo | ≤ 60 min por semana | Si se supera, no es un fallo del producto, pero anótalo: indica qué hay que automatizar primero |

**Intervalos (para no sobreinterpretar):** con 20 personas, 6 activos (30 %) es compatible con un valor real de entre el 15 % y el 52 % aproximadamente (Wilson, 95 %). Por eso el umbral es una regla de decisión, no una predicción de la retención de la app.

### 6.3 · Encuesta de salida (Google Forms, el lunes de cierre, a **todos**, también a quien lo dejó)
1. Código o apodo.
2. ¿Hasta qué semana participaste? 1 / 2 / 3 / 4.
3. **Con tus palabras: ¿cómo se ganaban los puntos?** *(párrafo; mide U4)*
4. ¿Qué te hacía enviar la foto cada semana? *(párrafo)*
5. Si lo dejaste, ¿qué pasó la semana en que no enviaste nada? *(párrafo; pregunta por lo que pasó, no por opiniones)*
6. ¿Has mirado empresas o sectores que no conocías por la Liga? Sí / No. ¿Cuáles? *(opcional)*
7. ¿En algún momento sentiste que la Liga te empujaba a comprar o vender algo de verdad? Sí / No. ¿Cuándo? *(señal legal)*
8. ¿Alguien te recomendó comprar o vender algo real durante la Liga? Sí / No.
9. Liga A: ¿qué te pareció el *draft*? ¿Y el fichaje de la semana 3? *(párrafo)*
10. **Si mañana empezara una temporada de 12 semanas, ¿te apuntarías?** Sí, apúntame ya / No / Quizá. *(«Sí» con apodo = compromiso; «quizá» cuenta como no)*
11. ¿A quién invitarías? Número de personas.
12. Después, el enlace al **Kano B** otra vez (`03-kit-investigacion.md` §7.4).

---

## 7 · Mensajes listos para copiar
Todos acaban con: **«Simulación · sin dinero real · no es consejo.»**

### 7.1 · Invitación (a quien dijo «sí» en la entrevista)
> ¡Hola, [nombre]! Como te conté, arranco la **Liga Klever de prueba**: 4 semanas, con carteras **simuladas**, sin dinero, sin premios y sin recomendaciones. Cada semana repartes tu cartera y sumas puntos por tenerla **equilibrada** (hasta 50), por **aprender** (hasta 30) y por **constancia** (hasta 20). Unos 10 minutos a la semana.
> Inscríbete aquí antes del [día]: [ENLACE INSCRIPCIÓN]. Y si quieres, **trae a un amigo o amiga**: pásale este mismo mensaje.
> Simulación · sin dinero real · no es consejo.

### 7.2 · Bienvenida (al cerrar la inscripción)
> ¡Ya estamos! Sois [N]. Os he repartido en dos ligas: **Liga A · *Draft*** (cada empresa solo puede tenerla una persona) y **Liga B · Clásica** (cada uno elige las que quiera).
> Las reglas, la lista de empresas y la clasificación están aquí: [ENLACE HOJA]. Lo más importante:
> - Cuenta la **última foto antes del lunes a las 00:00**.
> - Mínimo **4 empresas** y la cartera al **100 %**.
> - Concentración baja = ninguna empresa del 25 % o más y ningún sector del 40 % o más.
> - 5 sectores o más = variedad amplia.
> Liga A: el *draft* es el **domingo a las [hora]** por videollamada ([ENLACE]) o por lista antes del sábado ([ENLACE LISTA]).
> Simulación · sin dinero real · no es consejo.

### 7.3 · Domingo, tras el *draft* (Liga A)
> ¡*Draft* terminado! Así han quedado los equipos: [ENLACE pestaña Draft]. Las empresas que nadie eligió son **agentes libres**: cada semana puedes cambiar **una** de las tuyas por una libre.
> Ahora reparte los pesos de tus 6 empresas y envía tu primera foto esta semana: [ENLACE FOTO].
> Simulación · sin dinero real · no es consejo.

### 7.4 · Lunes de la semana 1
> **Semana 1 de 4.** Desde hoy y hasta el domingo a las 23:59 puedes enviar tu foto: [ENLACE FOTO].
> **Reto de la semana (20 puntos):** deja tu cartera **sin alertas de concentración**: ninguna empresa del 25 % o más y ningún sector del 40 % o más.
> **Idea de la semana (10 puntos):** elige una de tus empresas y escribe por qué la tienes y qué te haría cambiar de opinión. Solo la leo yo.
> ¿Quieres ver tus puntos antes del cierre? Haz una copia de la **Calculadora**: [ENLACE].
> Simulación · sin dinero real · no es consejo.

### 7.5 · Recordatorio del miércoles (solo a quien no ha enviado)
> ¡Hola! Aún no tengo tu foto de esta semana. Tienes hasta el domingo a las 23:59: [ENLACE FOTO]. Si tu cartera sigue igual, basta con marcar «sigue igual» (30 segundos). Si prefieres dejar la Liga, dímelo sin problema.

### 7.6 · Lunes de la semana 2
> **Resultados de la semana 1** 🏁 Clasificación y desglose de cada uno: [ENLACE HOJA].
> - Liga A: 1.º [escudo] [equipo] ([puntos]) · 2.º … · 3.º …
> - Liga B: 1.º … · 2.º … · 3.º …
> - **Cartera mejor repartida:** [escudo] [equipo], [N] sectores, concentración Baja (sin empresas, solo el reparto).
> Esta semana enviasteis la foto [X] de [N].
> **Semana 2 · reto:** **añade un sector que no tenías**. Liga A: recuerda que puedes hacer **un cambio** con los agentes libres.
> Foto: [ENLACE FOTO]. Hasta el domingo a las 23:59.
> Simulación · sin dinero real · no es consejo.

### 7.7 · Lunes de la semana 3
> **Resultados de la semana 2:** [ENLACE HOJA] · 1.º … · 2.º … · 3.º …
> **Semana 3 · reto:** **mejora un indicador** (Concentración o Variedad) respecto a alguna semana anterior. Si ya tienes Concentración Baja y Variedad Amplia desde el principio, te vale con **mantenerlos**.
> **Liga A · ventana de fichaje** (solo esta semana, una vez en la temporada y voluntaria): puedes llevarte **una empresa de un rival**, que elegirá otra libre a cambio. Se pide en el formulario. A cada equipo solo se le puede quitar una.
> Foto: [ENLACE FOTO].
> Simulación · sin dinero real · no es consejo.

### 7.8 · Lunes de la semana 4
> **Resultados de la semana 3:** [ENLACE HOJA] · 1.º … · 2.º … · 3.º …
> **Última semana · reto:** en tu idea, **escribe qué te haría cambiar de opinión** sobre una de tus empresas.
> Foto: [ENLACE FOTO]. El lunes que viene, clasificación final.
> Simulación · sin dinero real · no es consejo.

### 7.9 · A quien deja de enviar dos semanas seguidas (una sola vez)
> ¡Hola, [nombre]! He visto que llevas dos semanas sin enviar la foto, y no pasa nada. Solo una pregunta, si te apetece contestar: **¿qué pasó esas semanas?** Me ayuda mucho saberlo. Si quieres volver, el enlace sigue aquí: [ENLACE FOTO]. Y si prefieres que borre tus datos, dímelo.

### 7.10 · Cierre (lunes final)
> **Clasificación final** 🏆 [ENLACE HOJA]
> - Liga A: 🥇 [equipo] · 🥈 … · 🥉 …
> - Liga B: 🥇 … · 🥈 … · 🥉 …
> **Insignias:** 🥇 oro (el 10 % mejor), 🥈 plata (25 %), 🥉 bronce (50 %) y ✅ «Temporada completada» para todo el que llegue al final (siga inscrito), como en `liga.js`.
> Me ayudaría muchísimo que contestes esta encuesta de 5 minutos, **también si lo dejaste a medias**: [ENLACE ENCUESTA DE SALIDA].
> ¡Gracias por jugar! Borraré vuestros datos el [FECHA].
> Simulación · sin dinero real · no es consejo.

---

## 8 · Lista de empresas y sectores (copia en la pestaña «Empresas»)
Sale de `data/universe.json` (solo las 109 acciones; los 20 ETF no se usan en esta prueba). Código · nombre · sector.

| Código | Empresa | Sector |
|---|---|---|
| T | AT&T | Comunicaciones |
| GOOGL | Alphabet | Comunicaciones |
| CMCSA | Comcast | Comunicaciones |
| META | Meta Platforms | Comunicaciones |
| NFLX | Netflix | Comunicaciones |
| TMUS | T-Mobile US | Comunicaciones |
| VZ | Verizon | Comunicaciones |
| DIS | Walt Disney | Comunicaciones |
| MO | Altria | Consumo básico |
| KO | Coca-Cola | Consumo básico |
| CL | Colgate-Palmolive | Consumo básico |
| COST | Costco | Consumo básico |
| KMB | Kimberly-Clark | Consumo básico |
| MDLZ | Mondelez | Consumo básico |
| PEP | PepsiCo | Consumo básico |
| PM | Philip Morris International | Consumo básico |
| PG | Procter & Gamble | Consumo básico |
| WMT | Walmart | Consumo básico |
| AMZN | Amazon | Consumo discrecional |
| BKNG | Booking Holdings | Consumo discrecional |
| F | Ford | Consumo discrecional |
| GM | General Motors | Consumo discrecional |
| HD | Home Depot | Consumo discrecional |
| LOW | Lowe's | Consumo discrecional |
| MCD | McDonald's | Consumo discrecional |
| NKE | Nike | Consumo discrecional |
| SBUX | Starbucks | Consumo discrecional |
| TJX | TJX Companies | Consumo discrecional |
| TSLA | Tesla | Consumo discrecional |
| CVX | Chevron | Energía |
| COP | ConocoPhillips | Energía |
| EOG | EOG Resources | Energía |
| XOM | Exxon Mobil | Energía |
| OXY | Occidental Petroleum | Energía |
| SLB | Schlumberger | Energía |
| AXP | American Express | Finanzas |
| BAC | Bank of America | Finanzas |
| BLK | BlackRock | Finanzas |
| SCHW | Charles Schwab | Finanzas |
| C | Citigroup | Finanzas |
| GS | Goldman Sachs | Finanzas |
| JPM | JPMorgan Chase | Finanzas |
| MA | Mastercard | Finanzas |
| MS | Morgan Stanley | Finanzas |
| USB | U.S. Bancorp | Finanzas |
| V | Visa | Finanzas |
| WFC | Wells Fargo | Finanzas |
| MMM | 3M | Industria |
| BA | Boeing | Industria |
| CAT | Caterpillar | Industria |
| DE | Deere | Industria |
| FDX | FedEx | Industria |
| GE | GE Aerospace | Industria |
| HON | Honeywell | Industria |
| LMT | Lockheed Martin | Industria |
| RTX | RTX | Industria |
| UNP | Union Pacific | Industria |
| UPS | United Parcel Service | Industria |
| AMT | American Tower | Inmobiliario |
| PLD | Prologis | Inmobiliario |
| O | Realty Income | Inmobiliario |
| SPG | Simon Property Group | Inmobiliario |
| APD | Air Products | Materiales |
| FCX | Freeport-McMoRan | Materiales |
| LIN | Linde | Materiales |
| SHW | Sherwin-Williams | Materiales |
| NEM | Newmont | Materiales (oro) |
| ABBV | AbbVie | Salud |
| ABT | Abbott | Salud |
| AMGN | Amgen | Salud |
| BMY | Bristol-Myers Squibb | Salud |
| CVS | CVS Health | Salud |
| DHR | Danaher | Salud |
| LLY | Eli Lilly | Salud |
| GILD | Gilead Sciences | Salud |
| ISRG | Intuitive Surgical | Salud |
| JNJ | Johnson & Johnson | Salud |
| MDT | Medtronic | Salud |
| MRK | Merck | Salud |
| PFE | Pfizer | Salud |
| TMO | Thermo Fisher | Salud |
| UNH | UnitedHealth | Salud |
| AEP | American Electric Power | Servicios públicos |
| D | Dominion Energy | Servicios públicos |
| DUK | Duke Energy | Servicios públicos |
| NEE | NextEra Energy | Servicios públicos |
| SO | Southern Company | Servicios públicos |
| ACN | Accenture | Tecnología |
| ADBE | Adobe | Tecnología |
| AMD | Advanced Micro Devices | Tecnología |
| AAPL | Apple | Tecnología |
| AMAT | Applied Materials | Tecnología |
| AVGO | Broadcom | Tecnología |
| CSCO | Cisco | Tecnología |
| IBM | IBM | Tecnología |
| INTC | Intel | Tecnología |
| INTU | Intuit | Tecnología |
| MU | Micron | Tecnología |
| MSFT | Microsoft | Tecnología |
| NVDA | NVIDIA | Tecnología |
| ORCL | Oracle | Tecnología |
| QCOM | Qualcomm | Tecnología |
| CRM | Salesforce | Tecnología |
| NOW | ServiceNow | Tecnología |
| TXN | Texas Instruments | Tecnología |

**Total: 105 acciones en 12 sectores** (Comunicaciones 8, Consumo básico 10, Consumo discrecional 11, Energía 6, Finanzas 12, Industria 11, Inmobiliario 4, Materiales 4, Materiales (oro) 1, Salud 15, Servicios públicos 5, Tecnología 18).

---

## 9 · Cuidados legales de la versión a mano
- **No es juego** según la Ley 13/2011 (art. 3): no se arriesga dinero ni nada de valor, no hay premios y no hay que pagar nada. **No ofrezcas ningún premio material**, ni siquiera pequeño: las insignias son emojis.
- **No es asesoramiento:** nadie recomienda empresas. La «cartera mejor repartida» enseña **sectores y semáforos, no empresas**. Las tesis **no se publican**.
- **Solo mayores de 18**, declarado en la inscripción.
- **Datos:** solo apodos en la hoja compartida; tesis y códigos en tu hoja privada; borrado en la fecha prometida. El análisis de riesgos legales completo está en `02-matriz-legal.md`.

## 10 · Qué está comprobado y qué es supuesto
- **Comprobado en el código** (`public/js/liga.js`, `public/js/senales.js`, `public/js/semana.js`, leídos el 9 nov 2026):
  - los puntos 25/12/0 de concentración y variedad;
  - los umbrales: Alta con mayor posición ≥ 40 % o mayor sector ≥ 60 %; Media con ≥ 25 % o ≥ 40 %; variedad Amplia con 5 o más sectores y Media con 3 o 4;
  - el mínimo de 4 posiciones y la cartera al 100 %;
  - reto 20 e idea 10;
  - constancia 10 + 2 por semana seguida, con un máximo de +10;
  - la herencia de la última foto sin constancia;
  - el desempate y los tramos de las insignias;
  - los textos de los 4 retos.
- **Comprobado con los datos:** la lista de 109 acciones y sus sectores, en `data/universe.json`.
- **Decisiones de esta prueba, no de la app** (§2.8):
  - sin ETF;
  - retos y aprendizaje solo si se envía el formulario;
  - la excepción del reto 3;
  - 6 empresas por persona en el *draft*, agentes libres con 1 cambio por semana y las reglas del fichaje;
  - el desempate de la «cartera mejor repartida».
- **Supuesto [NV]:** que en una lista de difusión de WhatsApp los destinatarios no ven los números de los demás y solo reciben el mensaje si tienen guardado tu número; la opción de Telegram para ocultar el número.
- **Sin ejecutar:** toda la Liga. No hay datos.
