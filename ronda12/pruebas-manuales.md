# Pruebas manuales pendientes (ronda 12)

Las **M1–M32 de la ronda 11 siguen pendientes** (`ronda11/pruebas-manuales.md`). Aquí solo las nuevas de esta ronda. Estado: **⬜ pendiente** hasta que alguien las ejecute y anote el resultado; ninguna se ha ejecutado.

| # | Prueba | Dispositivo / herramienta | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|
| M33 | «Mis carteras» en móvil real con varias carteras | iPhone y Android | Crear tres carteras (una pública y una incompleta), editar una sin guardar y volver a «Mis carteras». | Se reconoce cada una por nombre, privacidad y composición; la que tiene cambios locales se distingue y dice «Continuar editando»; nada se corta con nombres de ~70 caracteres. | ⬜ |
| M34 | Colores de la composición con daltonismo | Simulador de daltonismo del navegador (deuteranopía/protanopía) y una persona con daltonismo si es posible | Abrir una cartera de 8–10 posiciones. | Se identifica cada posición por su símbolo escrito; el color es un apoyo, no la única pista. | ⬜ |
| M35 | Búsqueda conservada con el botón «atrás» del navegador y del móvil | Chrome, Safari y Firefox; Android con gesto «atrás» | Explorar → buscar «bank» → Ver ficha → cerrar → ir a «Carteras públicas» → volver. | La búsqueda y el listado siguen; el «atrás» no deja la ficha abierta ni pierde la búsqueda. | ⬜ |
| M36 | Ficha con lector de pantalla | VoiceOver, TalkBack, NVDA | Abrir una ficha y recorrerla. | Se anuncia el título, el periodo y cada dato con su unidad; los criterios dicen «superada / no superada / sin datos»; un dato ausente se anuncia como «No disponible». | ⬜ |
| M37 | Píldoras de comprobaciones con lector de pantalla | VoiceOver, TalkBack, NVDA | Recorrer la lista de empresas. | Cada empresa anuncia «Comprobaciones de …» y cada píldora «Deuda: superada», etc. | ⬜ |
| M38 | Texto ampliado REAL (200 %) en «Mis carteras», «Explorar» y ficha | Chrome, Firefox y Safari (Ctrl/Cmd +) y tamaño de texto del sistema | Recorrer las tres pantallas a 320 px de ancho efectivo. | Sin desplazamiento horizontal, «Cerrar» alcanzable, sin texto cortado. (La prueba automática solo simula el 200 % con `font-size`.) | ⬜ |
| M39 | Revisión visual en tema oscuro de las tres pantallas | Teléfono y ordenador con tema oscuro | Revisar tarjetas, píldoras y datos de la ficha. | Legible y coherente (los contrastes de los tokens se calculan en ambos temas; las pantallas nuevas no se han capturado en oscuro). | ⬜ |
| M40 | Cabecera del editor con el desplegable «Detalle» y teclado | Escritorio, solo teclado | En una cartera pública, dejar el reparto en 68 %, tabular hasta «Detalle», abrirlo con Intro y seguir editando pesos. | El detalle abierto no se cierra al teclear, el foco no se pierde y el mensaje principal se actualiza. | ⬜ |
