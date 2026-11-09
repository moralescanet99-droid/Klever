# 08 · Qué cambia del informe de la ronda 40 según la evidencia

**Fuentes:** los entregables 01 a 07 de esta carpeta. Lo marcado **comprobado** sale de textos legales originales, datos reales de la SEC, una prueba que funciona o reseñas reales. Lo marcado **pendiente** depende de personas, del abogado o de la CNMV.

## Cambios en el diseño (comprobado con textos y datos)
| # | Antes (ronda 40) | Ahora | Por qué (evidencia) |
|---|---|---|---|
| 1 | Perfil de 3 preguntas (para qué, horizonte, inquietud ante las caídas) que adapta retos y avisos | **Se quita.** Como mucho, una pregunta sobre **cuántos avisos quieres** | Son las «circunstancias personales» de la definición de asesoramiento: ESMA35-43-3861 §67, parecido a su caso práctico 2. Es el **riesgo legal más alto** (02) |
| 2 | La pista de Klever «¿y si la mayor bajara al 24 %?» | Se mantiene **sin nombrar empresas**: «tu mayor posición», «el sector que más pesa». En Descubrir, orden neutro, sin «rellena tu hueco con X» | Una pista que nombra una empresa concreta y va dirigida a ti puede ser una recomendación implícita (02, §29–31 y §61) |
| 3 | «Por qué» libre en propuestas de equipo, tesis de la semana y tarjetas | **Plantillas de motivo** («reduce la concentración», «añade un sector», «mejora la huella media») con un texto corto opcional que solo ve tu equipo. **Nada de empresas en lo público** | Lo que se dicen los usuarios entre sí puede ser «recomendación de inversión» según MAR (guía de la CNMV, p. 5) (02) |
| 4 | «Copiar carteras públicas» (fase 4) | **Se quita** | Es el caso más claro de recomendación entre usuarios (02) |
| 5 | Mapa por zonas de ventas para todas las empresas | **Dato común: «% de ingresos fuera del país de sede»** (28–29 de 30 empresas). Mapa por zonas **solo donde exista** (13 de 30, el 43 %), con una tabla de equivalencias de regiones mantenida a mano y el rótulo «sin desglose» | Experimento EDGAR (05): el desglose útil por zonas solo existe en el 43 % y 15 de 26 usan regiones inventadas por la propia empresa |
| 6 | «Moneda» | **«Moneda en la que informa la empresa»**, rotulado así. Disponible en 30 de 30 | Companyfacts da la moneda de informe, no la de cotización (05) |
| 7 | Sede | Combinar dos fuentes (`submissions` + `dei:EntityAddressCountry`), con 30 de 30. **Nunca** usar el estado de constitución | Experimento EDGAR (05): el estado de constitución no coincide con la sede en 14 de 27 |
| 8 | Votación de equipo en tiempo real con Durable Objects | **Confirmado como viable**, con **hibernación obligatoria** (sin ella costaría unas 17,7 veces el límite gratuito). Además, vigilar el límite de 100.000 peticiones diarias del Worker, que comparte toda la web | Prueba en local (06): aprobada, rechazada, caducada, voto doble y reconexión funcionan; 6 ms por votación |
| 9 | Puntos provisionales en directo y cuenta atrás al cierre (ideas de la *fantasy*) | Se mantienen **con calma**: provisionales solo al abrir la Liga (sin avisos push del tipo «te han adelantado») y cuenta atrás **informativa**, sin rojo ni urgencia | ESMA (DP §95) señala las cuentas atrás y la urgencia como prácticas de enganche (02) |
| 10 | Cierre del lunes | Se convierte en **el minuto más fiable de la app**: la foto se calcula en el servidor y se reintenta, con un registro de «foto hecha» | En las reseñas de *fantasy*, el 43 % se queja de fallos, y 10 reseñas hablan de fallos justo a la hora del cierre (07) |
| 11 | Puntuación | Botón «**¿Por qué tengo estos puntos?**» obligatorio en cada semana, y cláusula de recálculo si hay un error en los datos | En las reseñas de *fantasy*, el 8 % critica la puntuación opaca (07); ronda 41 §4 |
| 12 | Datos de empresas | Cada dato muestra **fuente y fecha** («SEC, informe anual 2025») | Simuladores criticados por datos que no cuadran (07) |
| 13 | Ligas de clase o universidad | Solo **universidad y mayores de 18**; nada de institutos | La regla de solo mayores de 18 choca con las ligas de instituto (02) |
| 14 | Monetización futura | **Sin anuncios.** Si algún día hay algo de pago, que se note y sea solo estético | El 43 % de las quejas de *fantasy* son sobre publicidad y el 14 %, sobre pagar y seguir viendo anuncios (07) |

## Lo que se confirma tal cual
- **Ley del juego:** el riesgo es bajo mientras no se arriesgue nada de valor y no haya que pagar para optar a un premio (Ley 13/2011, art. 3 a y e).
- **La Liga puntúa la diversificación:** es justo el ejemplo bueno que pone ESMA (DP §97).
- **Ligas privadas entre amigos como motor:** se confirma con las reseñas («el grupo de amigos es lo que retiene») y con los 1,5 millones de ligas privadas de LaLiga Fantasy.
- **Sede y moneda de informe:** se pueden obtener para todas las empresas de la SEC.

## Lo que sigue pendiente (no se puede decidir sin estos datos)
| Supuesto (01) | Cómo se resuelve | Quién |
|---|---|---|
| ¿Quieren practicar sin precios ni rentabilidad? (el de más riesgo, 25) | Entrevistas, prueba de uso y **Liga a mano** de 4 semanas (03 y 04) | Javier, con 20 personas |
| ¿Se entiende «Construye»? ¿Encuentran el mapa? | Prueba de árbol (03) | Javier |
| ¿Draft o liga clásica? ¿Qué ideas *fantasy* gustan? | Liga A frente a Liga B y encuesta Kano (03 y 04) | Javier |
| ¿Un simulador sin dinero real se dirige a «posibles inversores»? | Consulta al Portal FinTech de la CNMV (02) | Javier envía la consulta |
| Texto legal final | Abogado o clínica jurídica (02) | Javier |
| Rendimiento en un móvil real | Medición en un Android de gama media | Javier (o un móvil prestado) |
| Votación en Cloudflare real | Prueba con una cuenta de Cloudflare | Cuando haya cuenta |
| Correo de contacto para la SEC | Buzón genérico del proyecto (no personal) | Javier |

## Orden recomendado
1. **Esta semana:** enviar la consulta a la CNMV (gratuita) y empezar a reclutar (03).
2. **Semanas 1–2:** 8–10 entrevistas y pruebas de uso, más la prueba de árbol.
3. **Semanas 2–6:** Liga a mano (A *draft* frente a B clásica).
4. **Semana 6:** reunión de decisión con los criterios fijados de antemano. Solo entonces se empieza a construir.
