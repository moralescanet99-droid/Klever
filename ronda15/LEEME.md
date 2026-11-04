# Ronda 15: privacidad cerrada, tres destinos, comparador, nota de estructura y seguimiento con preguntas

Parte de la ronda 14 y conserva sus avances. Orden del encargo: **1)** cerrar privacidad y regresiones; **2)** cinco cambios en la web móvil; **3)** comparador de dos empresas; **4)** nota de estructura y solidez v1; **5)** seguimiento de decisiones en la primera demo; **6)** entrega.

> **Código de la última pasada completa: commit `a4ce6d11e06466435a71dbb5d1f22e5c76cdd935`** (árbol limpio al ejecutar). Después solo cambiaron dos retoques de texto de la tarjeta de seguimiento («Sin novedades» repetido y un guion suelto); tras ellos repetí `testN` (41/0) y reconstruí la demo, **no** repetí la batería completa. Resultado literal al final. **Cómo abrirlo en el móvil:** `ronda15/ABRIR-EN-MOVIL.md`.

## 1. Privacidad y regresiones (primero)
Evidencia del fallo y del arreglo en `ronda15/ANTES-Y-DESPUES.md`.
| Hallazgo | Arreglo | Prueba |
|---|---|---|
| **Migración del radar escribía bajo otra cuenta** (crítico) | `migrarLocal()` atada a la generación y a la **identidad de la sesión**: antes de cada lectura, escritura y borrado del original se comprueba que sigue siendo la misma; si no, se corta y no se borra lo local | `unit-almacen` A1, A2: el código de la ronda 14 **escribía `B:PUT` con las notas de A**; ahora ninguna escritura sale |
| **Respuesta de A tras salir** y **401 retrasado** (crítico) | `limpiarPrivado()` síncrono al pulsar «Salir» (sin esperar al servidor), guardas de sesión y de navegación antes de tocar el estado, cierre de diálogos abiertos; `api()` compara el 401 con el token **de la petición** | `testM` M1–M3; antes/después: el 401 retrasado **desconectaba a B** (token borrado), ahora no |
| **Copias `klever_edit_*`** | Aviso al salir («Volver para guardarlos» / «Descartar y salir»), purga de las de otra cuenta al entrar, caducidad a 7 días | `testM` M4–M7 |
| **GET retrasado vacío tras guardar; borrado que falla en silencio** | Contador de escrituras (una lectura anterior no se aplica), borrado **estricto**, almacenamiento bloqueado desde el inicio, datos dañados ≠ vacío | `unit-almacen` A4–A7 (9 en total) |
| **Procedencia y carga** | Selección anual que distingue **flujos y saldos**, valida duración (350–380 días), elige cierre y revisión más recientes, guarda el **identificador del informe**, extrae **cinco ejercicios**; `sqlCarga` **exige declarar la fuente** (sin «sec» por defecto) y guarda el **resultado operativo** | `unit-carga` L10–L12 (18 en total) |
**Honestidad:** el fallo «salir con el detalle de A en vuelo» **no pude reproducirlo visiblemente en el navegador** con el código antiguo (lo demostró la revisión con la función aislada); lo declaro en `ANTES-Y-DESPUES.md`. **Limitación:** en una caducidad involuntaria, las copias locales se conservan (para recuperarlas) hasta que otra cuenta entre o pasen 7 días.

## 2. Cinco cambios en la web móvil (probados en 320/390/1440 con `testN`)
Navegación de **tres destinos** (Cartera · Ideas · Seguimiento; Ideas agrupa Historias, Empresas y Carteras públicas). Crema, azul tinta y verde petróleo conservados.
1. **Cartera.** Portada con «Crea tu primera cartera» y «Explora una cartera de ejemplo» (nombre, peso y una frase de por qué está cada posición; aviso de que es un ejemplo) y la frase del seguimiento. A quien vuelve, «Mis carteras» enseña su reparto y «Continuar editando».
2. **Ideas.** La historia abre con «En breve» (qué hace el negocio, por qué estudiarla, qué puede salir mal), después la lectura extensa y las fuentes **plegadas**.
3. **Ficha.** «Nombre (SÍMBOLO)» juntos; arriba, la **pregunta investigada** con «Probar en mi cartera» y «Comparar con otra empresa»; el botón «atrás» del navegador cierra la ficha y conserva la búsqueda y la posición (sin atascar el historial).
4. **Laboratorio.** «Cuánto espacio ocuparía» + dos barras antes/después, «de dónde sale el peso» y qué cambia en los **bloques evaluables** de la nota; el mismo ejemplo (KO 60 / PG 40) a lo largo del recorrido; se guarda sin tocar la cartera.
5. **Seguimiento.** Abre con **«Tus preguntas»** (pregunta pendiente y fecha), después escenarios y radar; etiqueta **«En beta · Formará parte del futuro plan de pago»**. Se quitó de la primera vista el radar vacío y los filtros desplegados (Explorar los pliega).

## 3. Comparador de dos empresas (`public/js/comparador.js`; `unit-comparador` 9; `testN` N5)
Desde la ficha, otra empresa del **mismo sector**; tres filas: crecimiento de ventas, **margen operativo = resultado operativo / ventas** (nunca el neto) y **deuda neta / EBITDA** (definida, con su unidad y su lectura: años de EBITDA para cubrir la deuda neta; negativa = caja neta; EBITDA ≤ 0 → «no comparable»). Ejercicios alineados, misma moneda, fuente y periodo **por cifra**, «sin dato»/«no comparable» explicados, **sin ganadores**; la acción final abre el laboratorio con la empresa elegida. Tabla de entradas y salidas: `ronda15/TABLA-CASOS.md`.

## 4. Nota de estructura y solidez v1 (`public/js/nota.js`, módulo puro y versionado; `unit-nota` 26)
Cinco bloques (20/20/15/25/20 %) con las reglas del encargo; se publica solo con la cartera al 100 % y ≥ 90 % de cobertura por bloque; un solo redondeo final; fortaleza y limitación (`peso × (10 − puntuación)`); «¿Por qué esta nota?»; cartera y escenario con la misma composición, fecha y datos dan **la misma nota**; el escenario guarda su **evaluación fechada** (`nota_json`) y no la recalcula. **Todos los casos del encargo** pasan (50/50 → 2 empresas efectivas; 90/10 → 1,22; mismo emisor; empresa pequeña; falta un ejercicio; 19 comparables; 89,9 % y 90 % exacto; ETF sin composición; cartera al 95 %; empates; sin doble redondeo). **Los umbrales son provisionales y la activación con datos reales queda pendiente de calibración y verificación**: la nota se muestra solo con datos **sintéticos rotulados** («Datos de PRUEBA ficticios: esta nota solo sirve para probar el método»); con datos reales faltaría cargar el mercado (capitalización e importe negociado), que hoy no tiene fuente.

## 5. Seguimiento de decisiones (`testN` N7–N9)
Una tarjeta reúne la **pregunta original**, **qué ha ocurrido desde entonces** (C firmado el 29 oct, D aplazado; fuente y fecha; desenlace **simulado**), la **fecha de revisión**, el **peso de la empresa en el escenario guardado** distinguido del de la **cartera actual**, y enlaces a la revisión y a la simulación; si la fuente no permite responder, dice qué sigue pendiente (**caso sin novedades**). Un visitante ve el **ejemplo ficticio**; con cuenta, solo las preguntas y posiciones del propietario (`testN` N9b). A 390 px se lee la etiqueta de beta y la referencia al futuro plan de pago.

## 6. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** unidad 11+8+12+8+23+30+18+14+**26+9+9** (cálculos, servidor, migración 0008–0010, procedencia, escenarios, **nota, comparador y almacén**); zip 8.
**Navegador (Chromium, servidor local):** A–L de rondas anteriores (adaptadas) + **`testM` 7** (privacidad con cuentas A y B) + **`testN` 41** (interfaz y recorridos) en 320/390/1440; API 8; seguridad 6; **demo OK**.
**Total de la pasada completa: 623 comprobaciones correctas, 0 fallos, código 0** (29 baterías + demo).
**Entorno remoto:** nada ejecutado.
**Antes de esa pasada hubo tres fallidas, declaradas:** la primera (9 problemas) por **mis errores**: nombres duplicados al concatenar los módulos de la demo (`esNum`, `x`, `c`), un alias de importación inexistente en la demo y comprobaciones antiguas atadas a textos/estructura que cambió a propósito; la segunda, por un **identificador mal renombrado en `ideas.js`** (`x()` → `xi()`), que rompía el ejemplo y el comparador; y en `testC`, una **carrera** entre el `history.back()` de cerrar la ficha y una navegación inmediata de la prueba (arreglada con una espera y `scrollRestoration='manual'`). Los resultados parciales están en `ronda15/resultado-ejecucion-intento1.txt`. **No se repitió** la batería completa tras los dos retoques de texto finales (solo `testN` y la demo).
**Pruebas antiguas adaptadas por el rediseño:** `testA` (la palabra «efectivo» ya aparece en «número efectivo de empresas»), `testB` (lead de la portada, tres enlaces de menú, la lista de posiciones visible al medir el orden, espera a la nota asíncrona, 106 empresas), `testC` (tres destinos; espera tras cerrar la ficha), `testL` (la revista se alcanza desde «Ideas»), `testK`/`testJ` (filtros plegados), `unit-migracion` (M1d, M8) y `demotest`.

## 7. Límites, bloqueos y pendiente
- **Bloqueado (faltan accesos; no se piden secretos):** D1 remoto y migraciones 0008–0010 con copia de seguridad y restauración, correo real, **carga SEC real** (la lógica nueva solo se probó con datos simulados) y **datos de mercado reales** para la nota (`ronda10/BLOQUEOS.md`).
- **No probado:** móvil físico, Safari/Firefox, lector de pantalla, tema oscuro de las pantallas nuevas, recuperación tras recarga en dos dispositivos reales (`ronda15/pruebas-manuales.md`, M59–M66, más M1–M58). **La prueba con cinco principiantes (`ronda15/PRUEBA-CON-USUARIOS.md`) NO se ha realizado**: «se entiende en móvil» sigue sin demostrarse con personas.
- **La empresa «Hidrógeno Norte», la historia, la opinión, la revisión y su desenlace son ficticios**; el universo de la semilla y de la demo es inventado (106 empresas, incluida la ficticia, que aparece en «Explorar» rotulada). Una prueba de composición del catálogo real (que la ficticia nunca entre en comparables reales) queda pendiente de la carga real.
- **Nota:** con datos reales habrá más «sin evaluar» (la regla «ausencia ≠ cero» no rellena); los umbrales (15 empresas efectivas, 6 sectores, 10 actividades, 20 comparables, 90 % de cobertura) son los del encargo y **provisionales**.
- **Honestidad de las afirmaciones:** la revisión pidió bajar «se descarta toda respuesta en vuelo» y «solo una carga real puede marcar SEC». Queda así: se descartan las respuestas en vuelo **que pasan por `api()` y por las guardas añadidas** (no hay garantía sobre cualquier código futuro) y `sqlCarga` **exige** declarar la fuente, pero **no puede verificar** que la carga sea real (eso depende de quien la ejecute).
- **Reservado para después (no tocado):** piloto de tres piezas, revista con categorías, publicaciones semanales, avisos automáticos, comparación de escenarios, análisis interno de ETF, Revolut/Trade Republic, artículo y tip diarios, suscripciones, apertura pública.

## 8. Capturas (en `ronda15/capturas/`, 320 y 390 px)
**Mismo caso, cuatro pasos:** empiezo la cartera `C2-ejemplo` → descubro la empresa `C3-historia` → entiendo qué aportaría `C4-ficha` → pruebo su peso `C6-laboratorio`. **Regreso:** `C8-seguimiento-regreso`. **Nota pendiente con su motivo:** `C9-nota-pendiente`. Además `C1-portada`, `C5-comparar`, `C7-seguimiento-visitante`.

## 9. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-04 13:41 UTC
Código: commit a4ce6d11e06466435a71dbb5d1f22e5c76cdd935; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 12 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
=== unit-calculos ===
RESULTADO: 23 correctas, 0 fallos
=== unit-r13 ===
RESULTADO: 30 correctas, 0 fallos
=== unit-carga ===
RESULTADO: 18 correctas, 0 fallos
=== unit-r14 ===
RESULTADO: 14 correctas, 0 fallos
=== unit-nota ===
RESULTADO: 26 correctas, 0 fallos
=== unit-comparador ===
RESULTADO: 9 correctas, 0 fallos
=== unit-almacen ===
RESULTADO: 9 correctas, 0 fallos
=== test-zip ===
RESULTADO: 8 correctas, 0 fallos
=== testA ===
RESULTADO: 31 correctas, 0 fallos
=== testB ===
RESULTADO: 51 correctas, 0 fallos
=== testC ===
RESULTADO: 50 correctas, 0 fallos
=== testD ===
RESULTADO: 29 correctas, 0 fallos
=== testE ===
RESULTADO: 15 correctas, 0 fallos
=== testF ===
RESULTADO: 9 correctas, 0 fallos
=== testG ===
RESULTADO: 3 correctas, 0 fallos
=== verificar-api ===
RESULTADO: 8 correctas, 0 fallos
=== testH ===
RESULTADO: 25 correctas, 0 fallos
=== testI ===
RESULTADO: 16 correctas, 0 fallos
=== testJ ===
RESULTADO: 53 correctas, 0 fallos
=== testK ===
RESULTADO: 75 correctas, 0 fallos
=== testL ===
RESULTADO: 28 correctas, 0 fallos
=== testM ===
RESULTADO: 7 correctas, 0 fallos
=== testN ===
RESULTADO: 41 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
