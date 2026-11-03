# Pruebas manuales pendientes (ronda 13)
Las M1–M40 de las rondas 11 y 12 siguen pendientes. Nuevas (⬜ = pendiente; ninguna se ha ejecutado):
| # | Prueba | Dispositivo / herramienta | Resultado esperado | Estado |
|---|---|---|---|---|
| M41 | Recorrido completo con teclado y lector de pantalla | VoiceOver/TalkBack/NVDA | Radiografía → ficha → radar → laboratorio → escenario: se anuncian los resultados (`aria-live`), el foco queda donde se espera y las tablas se leen por filas | ⬜ |
| M42 | Laboratorio en móvil real con teclado abierto | iPhone y Android | El campo de peso se ve; las tablas antes/después caben o se desplazan sin perder la cabecera | ⬜ |
| M43 | Simular con una cartera real propia (≥ 8 posiciones) | Ordenador | Los totales cuadran; el redondeo no sorprende | ⬜ |
| M44 | Radar de visitante → entrar con correo real | Navegador + bandeja real | El radar y las notas pasan a la cuenta y desaparecen de «solo en este dispositivo» | ⬜ |
| M45 | Dos dispositivos con la misma cuenta: editar la nota de un escenario en ambos | Dos navegadores | El segundo guardado recibe el aviso de conflicto; no se pisa | ⬜ |
| M46 | Aislamiento entre dos cuentas en un despliegue real (D1 remoto) | Dos cuentas de prueba | La cuenta B no ve ni modifica radar, escenarios ni límites de A | ⬜ |
| M47 | Migración 0008 en una D1 real con datos | Cloudflare D1 | Carteras intactas; tablas nuevas creadas; límites vacíos | ⬜ |
| M48 | Aviso de origen de los datos con una carga SEC real | Despliegue de prueba | Dice «SEC EDGAR» y la fecha real solo tras una carga correcta | ⬜ |
| M49 | Revisión visual en tema oscuro de Seguimiento, Laboratorio y radiografía | Teléfono y ordenador | Legible y coherente | ⬜ |
