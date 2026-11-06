# Piloto con cinco principiantes — guion y registro (ronda 24 · piloto-r23)

**Estado: NO realizado.** Documento preparado; ninguna casilla está rellena y no hay participantes. No se simulan resultados. Versión del producto: **`piloto-r23`** (`scripts/piloto/VERSION-PILOTO.txt`); no cambia entre participantes. La demo (que pierde los datos al recargar) **no sirve** para el segundo contacto.

## Antes de empezar (lista de comprobación del facilitador)
- [ ] Piloto abierto con `bash scripts/piloto/abrir-piloto.sh` y **«VERSIÓN piloto-r23 CORRECTA»** (instrucciones: `PILOTO-INSTRUCCIONES-JAVIER.md`).
- [ ] **Verificación previa en el dispositivo previsto** hecha y anotada (`VERIFICACION-PREVIA-DISPOSITIVO.md`: cartera/escenario, edición durante un envío, lectura recuperada, regreso tras sesión inválida, salida voluntaria). Si algo falla, no empezar.
- [ ] «Para revisar» legible en el móvil de la persona (M94–M100 de `ronda21/pruebas-manuales.md`, M101–M104 de `ronda22/pruebas-manuales.md`).
- [ ] **Antes de cada sesión**, portada y Cuaderno abiertos una vez. Si falla el arranque: **incidencia de entorno, nunca atribuida al participante.**
- [ ] Un correo ficticio distinto por participante, apuntado en el registro. Sin correo real, sin publicar.

## Quién y cómo
Cinco principiantes del **público previsto** (sin franja de edad), con su dispositivo cuando sea posible. Se informa **una vez** de que los datos son ficticios y se observa **sin enseñar el recorrido**. Citas literales con consentimiento si se graba. Preguntar qué usan hoy, qué les cuesta hacer y qué volverían a consultar.

## Dos contactos
1. **Sesión inicial (20–30 min):** tareas 1–4.
2. **Regreso al día siguiente (≈10 min), concertado:** tarea 5. Demuestra **recuperación y comprensión, no retención espontánea.**

## Tareas
1. Crear una cartera (la entrada que prefiera) y explicar cómo ha repartido el capital simulado.
2. Explicar qué sabe y qué desconoce tras la revisión, con o sin nota global.
3. Probar un cambio y señalar de dónde sale el peso. **Después de comparar, preguntar sin anticipar la respuesta: «¿Qué ha cambiado en tu cartera?»**
4. Guardar una pregunta y una fecha de revisión. Pedir que explique **qué conclusión permite la simulación y cuál no**.
5. (Día siguiente) Volver, encontrar su pregunta, decir qué falta revisar y registrar una revisión.


## Incidencia conocida (apartado 3 de la revisión R23): envío incierto seguido de un nuevo acceso
**Qué es.** Si un envío de «Registrar revisión» queda con resultado **incierto** (se corta la red o la respuesta no llega) **y después** la persona vuelve a entrar o recarga, la aplicación conserva el texto pero **no** la clave del intento anterior: puede enviarlo de nuevo y quedar **dos anotaciones iguales** en el historial. No cambia la cartera ni duplica ninguna operación; solo el historial. Está **declarada y se corrige antes de una beta pública** (no en este piloto).
**Qué hace el facilitador:**
1. **Detiene esa tarea** en cuanto vea una interrupción con resultado incierto (aviso de «no sabemos si se guardó», red cortada, sesión pedida de nuevo) seguida de un nuevo acceso o recarga.
2. **Comprueba el historial de la idea** (ficha → historial) **antes** de permitir otro envío. Si la anotación ya está, la persona **no** la reenvía.
3. **No borra automáticamente** anotaciones por tener el mismo texto (pueden ser legítimas). Si hay un duplicado real, **se deja y se anota**.
4. **No enseña antes** a los participantes el recorrido correcto ni les avisa de esto de antemano; solo interviene cuando ocurre.
**Cómo se registra** (columna «Intervención y duda exacta» y una línea aparte debajo de la tabla):
- Se anota como **incidencia del producto** (qué pasó, a qué hora, si hay duplicado) **y como intervención del facilitador**.
- La tarea **no cuenta como «completada sin ayuda»**: queda «con ayuda» (o «no evaluable» si no se pudo completar), aunque la persona hubiese terminado bien.
- **No se oculta** el duplicado ni se «limpia» para que el registro quede bonito.
Una incidencia así no invalida la sesión, pero **es dato del piloto**: cuenta como incidencia del producto aunque el resultado final sea correcto.

## Registro por tarea
Para cada persona y tarea: **completada sin ayuda · con ayuda · fallida · no evaluable**; la **intervención exacta del facilitador** y el **punto exacto de duda**. **Separar ejecución mecánica de comprensión:** que pulse «Guardar» no prueba que entienda qué guardó. No juzgar como mala decisión que decida mantener la composición inicial.

| Persona | T1 | T2 | T3 | T4 | T5 | ¿Qué ha cambiado en tu cartera? (literal) | Conclusión que permite / no permite la simulación | Intervención y duda exacta | Tiempo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ | | | | |
| 2 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ | | | | |
| 3 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ | | | | |
| 4 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ | | | | |
| 5 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ | | | | |

## Incidencias del producto y de entorno (rellenar solo si ocurren)
| Persona | Hora | Tipo (producto / intervención / entorno) | Qué pasó, exactamente | ¿Duplicado en el historial? | Qué hizo el facilitador |
|---|---|---|---|---|---|
| | | | | | |

## Preguntas abiertas al cierre (no sugerir respuestas)
1. «¿Qué te ha aportado?»
2. «¿En qué situación volverías a usarlo?»

## Cómo leer el resultado
El objetivo **4 de 5 completando el recorrido sin ayuda sustancial** es una señal de usabilidad para decidir qué reparar, **no** una estimación estadística; además deben **comprender qué se guardó y que la simulación no cambia la cartera**, y **todas** deben poder **recuperar lo guardado**. **Pérdida de datos o confusión recurrente entre simulación y orden real tienen prioridad** aunque la mayoría termine. **Fuera de este piloto:** conversión a pago, rentabilidad de las carteras, eficacia de inversión o encaje de mercado (los datos son ficticios).
