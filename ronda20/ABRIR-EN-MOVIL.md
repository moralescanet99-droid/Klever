# Cómo abrir el recorrido de la ronda 20 (una sola guía)

**Qué verás:** entrada → creador por pasos («Distribución» → «Revisión») → guardado → cuaderno, con el diseño carbón y cobre. Datos **ficticios**; la nota solo existe con el conjunto **sintético** y, con la semilla, **KO 60 % / PG 40 % = 4,4** (también en la demo, que ahora usa los mismos números que el servidor local).

## A. Demo autónoma (rápida; sin servidor)
1. Abre el enlace privado de la demo en el móvil o el ordenador (una sola página).
2. **Primera visita:** «Crea tu primer portafolio» → elige una plantilla. En el móvil verás arriba el estado compacto del reparto con **«Revisar →»**, y justo debajo las posiciones con su deslizador y su campo numérico. «Añadir un activo» está **después** de la lista.
3. **Revisión (paso 3, etiqueta «Paso 3 de 3 · Revisión»):** pulsa «Revisar»; abre con el resultado y su motivo, el resumen del anillo, la radiografía, la publicación y los gráficos; «← Volver a la distribución» conserva cada peso. En escritorio las dos columnas siguen enteras y «Revisar portafolio» está arriba.
4. **Dos notas:** menú → «Crear portafolio» → «Explora una cartera de ejemplo» → selector «KO + PG · con nota» / «KO + JPM · pendiente» (el segundo se titula «Ejemplo con evaluación parcial»).
5. **Cuaderno y Revista:** menú → «Cuaderno» (ejemplo ficticio) y «Revista» («Leer la opinión de «El Superespeculador» (ejemplo)»).
6. **Límite:** la demo **pierde todo al recargar** y simula el correo; no sirve para «mañana, cierra y vuelve».

## B. Servidor local completo (persistencia real)
`npm ci` y `bash scripts/local/servidor.sh start` (Node ≥ 22.13) → http://localhost:8788; el enlace de acceso aparece en pantalla solo en este servidor de pruebas. Allí sí se puede cerrar sesión y volver.

## C. Reproducir los casos propios (sin navegador)
`node tests/ronda20/unit-causas20.mjs` (causas coexistentes), `node tests/ronda20/unit-cierre20.mjs` (código de salida de las pruebas), `node tests/ronda19/unit-redondeo19.mjs` y `node tests/ronda19/unit-revision19.mjs`; antes/después contra un árbol de la ronda 19: `node tests/ronda20/antes-despues-r20.mjs <raíz>` (ver `ANTES-Y-DESPUES.md`).

## Qué NO debes dar por probado con esta guía
Móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, D1 remota, correo real y la comprensión por personas (prueba con cinco principiantes: **pendiente**).
