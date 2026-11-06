# Ronda 12 · coherencia visual y exploración completa (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda12-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-12/`) y las **36 imágenes** de `imagenes-ronda12-chatgpt.zip` a **la misma conversación** (si admite pocas por mensaje, en tandas de 12: 01–12, 13–24 y 25–36). Los nombres llevan número, `antes-`/`despues-`, la escena y el ancho en píxeles: las parejas son 01/02, 03/04 … 35/36 (misma escena, mismo ancho, mismo servidor y datos; solo cambia la versión de `public/`).

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–11 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Aprobaste la dirección visual de la ronda 11 (editor) como base. En esta ronda se ha **extendido ese lenguaje a «Mis carteras», «Explorar empresas» y la ficha de empresa**, y se han cerrado tres detalles del editor. Quiero saber si las tres pantallas «pertenecen al mismo producto» que el editor y si el recorrido completo funciona.

## Qué se afirma
1. **Editor, tres detalles** (imágenes 05–08): (a) el % asignado y su barra ya no se repiten (composición = información principal; el resumen lateral solo trae categorías, cobertura y ROIC); (b) cartera pública con cambios inválidos: mensaje principal «Falta asignar un 32 % para actualizar la publicación», «La versión pública sigue igual.» siempre visible y detalle en un `<details>` que no se cierra al teclear; (c) **colores estables por activo** (mapa símbolo → color): quitar o añadir una posición no recolorea las demás; con más de ocho posiciones los colores se repiten, por eso cada fila lleva su símbolo escrito.
2. **Mis carteras** (01–04): tarjetas con la **composición real** guardada (el servidor devuelve ahora las posiciones en `GET /api/portfolios`), las tres mayores posiciones con su peso, estado de asignación en texto, chips, **cambios locales pendientes claramente distintos** (borde, chip, «Continuar editando», cifras separadas «Versión de tu cuenta / de este dispositivo») y estado vacío con explicación y una acción.
3. **Explorar empresas** (09–14): buscador protagonista con recuento y «Borrar búsqueda»; **píldoras ✓ ✗ – de las cinco comprobaciones** por empresa (datos de `/api/ideas`; la prueba las compara con el servidor para las 105 empresas); explicaciones largas **debajo** de los resultados; sin resultados con mensaje y acción; error con reintento; tarjetas móviles propias. La búsqueda se conserva al abrir la ficha, al cambiar de pantalla y al recargar (`sessionStorage`).
4. **Ficha** (15–18, 36): «Datos principales» del último ejercicio (ventas, beneficio neto, EBITDA, caja libre, ROIC) con periodo y unidad; dato ausente = «No disponible»; «Cerrar» táctil (≥ 44 px) y cabecera que no desborda. No se inventa ninguna cifra, tendencia, puntuación ni rentabilidad.
5. **Recorridos probados** (`tests/ronda12/testJ.cjs`, 53 comprobaciones en 320/390/1440): explorar → buscar → abrir ficha → cerrar (búsqueda, listado, recuento y foco conservados); Mis carteras → abrir → editar → guardar → volver (la tarjeta refleja el nuevo reparto, ya sin «pendiente»).
6. **Resultado:** `bash tests/run-all.sh` completo (servidor limpio entre baterías): **337 comprobaciones correctas, 0 fallos, código de salida 0**, commit `212981de3555f2e3813e20b2e13779e34b4e10fc` (los commits posteriores solo añaden resultados, informe, memoria y este paquete). Resultado literal en `ronda12/LEEME.md` y `ronda12/resultado-ejecucion.txt`. **No** se repitió en un clon nuevo ni `test-ejecutor.sh` en esta ronda (sí en la 11; el ejecutor no cambió salvo el valor por defecto de `RONDA` y la lista de baterías).
7. **Comprobaciones antiguas adaptadas por el rediseño** (cambio intencionado de texto, no regresión; dime si alguna rebaja la exigencia): `testB` (filas de empresa 56–96 px en vez de 56–66, por las píldoras; recuento «105 empresas» o «105 de 105 empresas»), `testC` («Asignada al 100 %» en vez de «Asignado: 100 %»; se retira la comprobación del `progressbar` «Porcentaje asignado», ahora oculto en el resumen), `testD` E3 y `testE` F1 (texto de la tarjeta de cartera).
8. **Validación remota: bloqueada** (sin credenciales de Cloudflare ni de Brevo; no se piden secretos por el chat). Un único bloque en `ronda10/BLOQUEOS.md`. Ningún correo real enviado.

## Imágenes (36)
- 01-antes-M0-mis-carteras-vacia-390.png
- 02-despues-M0-mis-carteras-vacia-390.png
- 03-antes-M2-mis-carteras-varias-1440.png
- 04-despues-M2-mis-carteras-varias-1440.png
- 05-antes-M2-mis-carteras-varias-390.png
- 06-despues-M2-mis-carteras-varias-390.png
- 07-antes-T1-mis-carteras-texto-ampliado-320.png
- 08-despues-T1-mis-carteras-texto-ampliado-320.png
- 09-antes-E1-editor-publica-invalida-1440.png
- 10-despues-E1-editor-publica-invalida-1440.png
- 11-antes-E1-editor-publica-invalida-390.png
- 12-despues-E1-editor-publica-invalida-390.png
- 13-antes-E2-editor-diez-posiciones-1440.png
- 14-despues-E2-editor-diez-posiciones-1440.png
- 15-antes-E2-editor-diez-posiciones-390.png
- 16-despues-E2-editor-diez-posiciones-390.png
- 17-antes-X1-explorar-1440.png
- 18-despues-X1-explorar-1440.png
- 19-antes-X1-explorar-390.png
- 20-despues-X1-explorar-390.png
- 21-antes-X2-explorar-busqueda-390.png
- 22-despues-X2-explorar-busqueda-390.png
- 23-antes-X3-explorar-sin-resultados-390.png
- 24-despues-X3-explorar-sin-resultados-390.png
- 25-antes-X4-explorar-error-390.png
- 26-despues-X4-explorar-error-390.png
- 27-antes-T2-explorar-texto-ampliado-320.png
- 28-despues-T2-explorar-texto-ampliado-320.png
- 29-antes-F1-ficha-1440.png
- 30-despues-F1-ficha-1440.png
- 31-antes-F1-ficha-390.png
- 32-despues-F1-ficha-390.png
- 33-antes-F2-ficha-sin-datos-390.png
- 34-despues-F2-ficha-sin-datos-390.png
- 35-antes-T3-ficha-texto-ampliado-320.png
- 36-despues-T3-ficha-texto-ampliado-320.png

## Qué quiero que evalúes
### Visual (con las imágenes)
1. **Coherencia:** ¿las tres pantallas comparten identidad con el editor (tokens, jerarquía, componentes)? ¿Qué sigue pareciendo de otro producto?
2. **Mis carteras (01–04):** ¿se reconoce y se retoma una cartera de un vistazo? ¿La mini-composición aporta o es ruido? ¿El estado «pendiente local» se distingue sin saturar? ¿El estado vacío es útil? ¿Una sola tarjeta (03/04) queda equilibrada?
3. **Explorar (09–14):** ¿las píldoras hacen comparables los resultados o saturan (cinco por fila × 105 filas)? ¿Se conserva superadas / no superadas / sin datos? ¿Las explicaciones debajo de la lista se encuentran? ¿Móvil (10–14): lectura y toques?
4. **Ficha (15–18, 36):** ¿jerarquía identidad → datos principales → criterios → explicaciones? ¿Unidades, periodos y fuente claros? ¿Se identifican los datos ausentes (17/18)? ¿Visibilidad de las acciones?
5. **Editor (05–08):** ¿la cabecera de una pública con cambios inválidos tiene ahora jerarquía clara título/estado/acción? ¿Los colores estables y la repetición a partir de la 9.ª posición (07/08) son aceptables?
6. **Texto ampliado a 320 px (04, 14, 18/36, **simulado**):** ¿usable?
7. **Regresiones:** ¿algo era mejor antes?

### Técnico (con el código)
8. **Estado y colores:** `asignarColores` / `colorDe` (mapa que se poda y se limpia al abrir otra cartera): ¿casos límite (más de 8, quitar y volver a añadir, cambio de cartera, conflicto/recuperación local)? Coherencia entre colores de la tarjeta (`composicionMini`) y los del editor (se apoya en el orden `peso desc, ticker` del servidor, la lista y el mock).
9. **API:** `GET /api/portfolios` ahora lee lista y posiciones en un `D1.batch` de lecturas; ¿consistencia, coste y error 500? ¿Cambia algo la separación público/privado?
10. **Persistencia de la búsqueda** (`sessionStorage`, sin servidor): ¿privacidad, caducidad, fallos de almacenamiento?
11. **Pruebas:** `testJ`: ¿alguna comprobación puede pasar en vacío o medir lo equivocado (p. ej. colores por `backgroundColor` del punto, píldoras contra `/api/ideas`, foco devuelto al botón, texto ampliado simulado)? ¿Falta algo para «sin resultados», errores o nombres largos? ¿Las adaptaciones del punto 7 rebajan algo?
12. **CSS:** sigue la técnica de bloques «ronda N» **al final** que pisan reglas previas (ahora también 10/11/12) y el uso de `!important`. ¿Es ya deuda grave? ¿Qué limpiarías antes de rediseñar las pantallas que faltan?
13. **Accesibilidad:** píldoras (símbolo + texto, `sr` con «superada/no superada/sin datos»), composición como `role="img"`, `<details>` «Detalle», tarjeta de cartera como `<button>` con `aria-label` («Continuar editando …»), ficha en `<dialog>`.
14. **Honestidad del informe (`ronda12/LEEME.md`):** ¿alguna afirmación que las pruebas no respalden? ¿Está bien separado ejecutado / simulado / bloqueado / pendiente?
15. Todo lo que debería probar yo a mano (`ronda12/pruebas-manuales.md`, M33–M40, más las M1–M32 de la ronda 11).

## Limitaciones (no las critiques, pero dime si cambian tus conclusiones)
- Todo se probó en **Chromium** con servidor local (D1 simulada con Miniflare) y SQLite real; **nada en Cloudflare D1 remoto**, **ningún correo real**, **ningún Safari, Firefox, dispositivo físico ni lector de pantalla**. El texto ampliado (`font-size` del documento) es una **simulación**. **No se revisó el tema oscuro** de las pantallas nuevas (solo se calculan los contrastes de los tokens).
- **Faltan por adaptar:** portada, carteras públicas (lista y detalle), acceso (diálogo), pie legal y gráficos de precio.
- Los datos son inventados. Con más de ocho posiciones los colores se repiten. En móvil, «Asignado: N %» sigue apareciendo en la barra inferior y en la composición del editor (se quitó del resumen).
- Las capturas «antes» y «después» se tomaron con el mismo servidor y los mismos datos; en las capturas del editor y de Mis carteras el nombre de prueba más largo mide 86 caracteres y el servidor lo recorta a 80.

## Formato de respuesta
- **Veredicto de 3 líneas** y notas del 1 al 10 en visual, interacción, confianza, móvil y claridad del recorrido, **comparadas con tu valoración anterior**.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- **Los 5 cambios que más mejorarían estas tres pantallas** antes de adaptar las que faltan, **3 cosas que quitaría**, las **pruebas que añadirías** y las **afirmaciones que rebajarías**.
- Lista final de **lo que no has podido comprobar** con imágenes fijas y lectura de código.

*Fuera de alcance (no lo critiques ni lo propongas):* conexiones con Revolut y Trade Republic, artículo diario personalizado y consejo diario de inversión (futuro plan de pago).
