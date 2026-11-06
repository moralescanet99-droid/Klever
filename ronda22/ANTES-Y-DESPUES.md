# Ronda 22 · antes y después (corto)

«Antes» = ronda 21; «después» = ronda 22. Capturas de viewport en `ronda22/capturas/` (T1 pendiente, T3/T4 recuperación, T5 revisado, T6 archivado, T7 manual con cuenta, S5 comparación móvil).

| Momento | Antes (R21) | Después (R22) |
|---|---|---|
| **Registrar revisión, POST bien y relectura mal** | Mensaje falso «no se ha registrado nada» (el reintento usaba otra clave y la versión vieja → 409) aunque la revisión estaba guardada | «Tu revisión **sí** está guardada»; «Actualizar la vista» solo lee; una sola revisión (`C2`, `T3`) |
| **Respuesta perdida** | Resultado incierto tratado como fallo | «No hemos podido confirmar»; «Reintentar el mismo envío» (misma clave y contenido); una sola fila (`C3`) |
| **Texto nuevo con un envío incierto** | Podía confundirse con lo guardado | El texto nuevo **no se da por guardado** y se conserva (`C4`, `T3`) |
| **Dos pestañas** | «Recarga; no se ha registrado nada» | Se carga la versión actual, el texto se conserva y se puede añadir sin pisar (`C5`, `T4`) |
| **Cuaderno con cuenta** | «Tus preguntas» (tarjeta completa) y «Mis escenarios» (otra tarjeta) del mismo objeto; «Para revisar» debajo | «Para revisar» primero; **una tarjeta por idea** con «Tu seguimiento», «Respuesta editorial» y «Registrar revisión» (`T1`) |
| **Pregunta propia tras revisar** | «Sigue pendiente hasta que la revises tú» | «1 revisión personal registrada»; la respuesta editorial no cambia (`T5`) |
| **Idea archivada** | Podía aparecer entre las pendientes | Fuera de lo pendiente; visible en su filtro (`T6`) |
| **Comparación en móvil** | «Alternativa simulada» partida en varias líneas | Etiqueta encima de la barra |
| **Cuaderno (cabecera)** | «Formará parte del futuro plan de pago» | «En beta» |
| **Mis portafolios con cuenta nueva** | Solo plantilla (cuarta entrada vieja) | Empezar desde cero / Recrear la que ya tengo / plantilla (`T7`) |
| **Editor vacío** | Ofrecía «Más acciones» para una plantilla inexistente | Texto según el origen; aviso «sin conexión con bróker» visible |
| **Avisos de condiciones normales** | Bloques ámbar | Superficie neutra con filete |
| **Demo** | Sin recorrido del Cuaderno probado | Se registra una revisión y **se pierde al recargar** (`testDemo22`) |
