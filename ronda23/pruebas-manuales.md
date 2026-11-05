# Pruebas manuales pendientes (ronda 23) — nada de esto se ha hecho

| # | Prueba | Dónde | Esperado | Estado |
|---|---|---|---|---|
| M101 | Registrar una revisión y **cortar la red justo después** de enviar; recuperar | Navegador o móvil con red limitada | Dice que la revisión **sí está guardada** (si lo está) o que no se ha podido confirmar; nunca «no se ha registrado nada» sin saberlo; «Actualizar la vista» no duplica | ⬜ |
| M102 | **Sesión caducada de verdad** (esperar a la caducidad real) con el formulario de revisión ya escrito; volver a entrar con la misma cuenta y con otra | Dispositivo real | Con la misma cuenta el texto está en el formulario; con otra cuenta no aparece nada ajeno. *(Probado en `testU` U4/U5 revocando la sesión en el servidor; falta la caducidad real y el formulario de «guardar en el Cuaderno», que no se persiste.)* | ⬜ parcial |
| M103 | «Para revisar» en un móvil real de 320–390 px con varias ideas | Móvil físico | Lo que toca revisar se ve primero y se entiende; «Registrar revisión» alcanzable con el pulgar | ⬜ |
| M104 | Archivar y descartar desde la ficha y recuperar con el filtro | Navegador | Desaparecen de lo pendiente, siguen en su filtro y la cartera no cambia | ⬜ |
| M105 | Lector de pantalla en el Cuaderno (grupos, «Toca revisar», «Tu seguimiento», «Respuesta editorial») | VoiceOver/TalkBack | El orden es lógico y no se confunde seguimiento personal con respuesta editorial | ⬜ |
M85–M100 (rondas 19–21) siguen pendientes. M96 (correo y D1 reales) queda para una fase autorizada posterior.
| M106 | Escribir texto **mientras** una revisión se guarda con red lenta (3G simulada) | Móvil con red limitada | El texto escrito durante la espera no se borra y el aviso dice que no se envió | ⬜ |
| M107 | Conflicto entre dos dispositivos con lectura fallida (modo avión justo después del 409) | Dos dispositivos | «Reintentar la lectura» no envía nada; al recuperar la red se ve la versión actual con el texto intacto | ⬜ |
