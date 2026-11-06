# Pruebas manuales pendientes (ronda 20) — nada de esto se ha hecho

M85–M90 vienen de la ronda 19. M91–M93 son nuevas.

| # | Prueba | Dónde | Esperado | Estado |
|---|---|---|---|---|
| M85 | Revisión con y sin nota a 320 px reales (iPhone SE / Android pequeño): resultado entero sobre la barra, etiqueta y «Volver» | Móvil físico | Se ve el resultado completo sin desplazar a mano | ⬜ |
| M86 | Lo mismo con el teclado de pantalla abierto y con texto al 200 % | Móvil físico | **Puede ser físicamente imposible que todo el resultado quepa a la vez.** Se exige: se puede leer completo **desplazándose**, no hay solapamiento **persistente** de la barra o del teclado sobre el contenido, el foco es visible y los controles son alcanzables. No se reduce la letra para aprobar | ⬜ |
| M87 | Movimiento reducido del sistema activado: Distribución → Revisión → Volver | Móvil físico | Sin animación; mismo resultado | ⬜ |
| M88 | Lector de pantalla en la revisión sin nota (VoiceOver/TalkBack): explicación breve → «lo que sí podemos decirte» → detalle | Móvil físico | Orden lógico; se entiende que no hay nota y por qué | ⬜ |
| M89 | Prueba con cinco principiantes (`ronda20/PRUEBA-CON-USUARIOS.md`) | Personas reales | Criterios (a)–(e) | ⬜ |
| M90 | «Cerrar y volver» con persistencia verificada en entorno privado | Servidor local accesible desde el móvil | La cartera guardada reaparece | ⬜ |
| M91 | Revisión de escritorio (1440×900 y una ventana de 1280×720) con y sin cambios sin guardar | Ordenador | Se ven el nombre, los pasos, «Volver», el resultado y la acción de guardado (o «Guardada») sin desplazar | ⬜ |
| M92 | Recorrido por teclado de la Revisión de escritorio (Tab desde el nombre hasta «Guardar») | Ordenador | El foco es visible y el orden coincide con el visual | ⬜ |
| M93 | Leer en voz alta la explicación sin nota de varios casos (ETF, banco + dato ausente, comparables insuficientes) | VoiceOver/TalkBack | Se entiende la causa sin ver el detalle | ⬜ |
