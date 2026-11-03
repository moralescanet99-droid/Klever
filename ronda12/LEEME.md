# Ronda 12: coherencia visual y experiencia completa de exploración

El lenguaje visual del editor (ronda 11) se extiende a **«Mis carteras», «Explorar empresas» y la ficha**, y se cierran tres detalles del editor. No se tocó el servidor salvo para que la lista de carteras traiga las posiciones (composición real). Sin dependencias nuevas, sin servicios de pago. Sistema visual extendido: `ronda11/SISTEMA-VISUAL.md` (sección «Ronda 12»).

> **Código probado: commit `212981de3555f2e3813e20b2e13779e34b4e10fc`** (árbol de trabajo limpio al ejecutar). Resultado literal al final. Capturas antes/después: `ronda12/capturas/` (54 + 54, 320/390/1440).

## 1. Mejoras visibles y de uso
**Editor (tres detalles)**
- El % asignado y su barra ya **no se repiten**: la composición es la información principal; el resumen lateral conserva categorías, cobertura y ROIC.
- Cartera pública con cambios inválidos: mensaje principal **«Falta asignar un 32 % para actualizar la publicación»**, «La versión pública sigue igual.» siempre visible, y el texto largo en un desplegable «Detalle» que no se cierra al teclear. Jerarquía título → estado → acción.
- **Colores estables por activo**: quitar o añadir una posición no recolorea las demás (probado con diez posiciones, más de ocho). El color complementa: cada fila lleva su símbolo. Un peso de 0,5 % conserva un tramo mínimo visible (3 px).

**Mis carteras**: tarjetas con la composición real guardada, las tres mayores posiciones con su peso («+N más»), estado de asignación escrito, chips de privacidad y **cambios locales claramente distintos** (borde reforzado, «Continuar editando», cifras separadas «Versión de tu cuenta / de este dispositivo»). Cuadrícula que no estira una sola tarjeta. Estado vacío con explicación y una acción.

**Explorar empresas**: buscador protagonista con recuento y «Borrar búsqueda»; **píldoras ✓ ✗ – de las cinco comprobaciones** (datos de `/api/ideas`, comprobadas contra el servidor para las 105 empresas); las explicaciones largas pasan **debajo** de los resultados; sin resultados dice qué se buscó; tarjetas móviles propias. La búsqueda se conserva al abrir la ficha, cambiar de pantalla y recargar (`sessionStorage`).

**Ficha**: «Datos principales» del último ejercicio (ventas, beneficio, EBITDA, caja libre, ROIC) con periodo y unidad; dato ausente = «No disponible»; «Cerrar» táctil y visible; cabecera que no desborda con texto ampliado. Deuda/EBITDA muy pequeña se muestra con dos decimales (antes «-0,0»).

## 2. Pruebas realmente ejecutadas
`bash tests/run-all.sh` completo sobre un servidor limpio entre baterías: **337 comprobaciones, 0 fallos, código de salida 0** (unidad 41, zip 8, A 31, B 51, C 50, D 29, E 15, F 9, G 3, API 8, H 25, I 16, **J 53 nuevas**, seguridad 6, demo OK). `testJ` cubre, en 320/390/1440: estado vacío, composición real de las tarjetas, pendiente local, % asignado una vez, cabecera pública inválida, detalle abierto al teclear, colores estables, pesos pequeños y nombre largo, recorrido Mis carteras→editar→guardar→volver, píldoras vs servidor, búsqueda→ficha→volver con búsqueda y foco, persistencia, sin resultados, ficha con datos ausentes, texto ampliado (simulado), error de carga.
**Revisión visual de capturas** hecha sobre escritorio y móvil de las cuatro pantallas; corrigió: cabecera del editor apretada, ROIC en una fila aparte, desbordes a 320 px con texto ampliado (tarjetas de empresa y cabecera de la ficha) y tramos de 1,2 px.
**Comprobaciones antiguas adaptadas** (cambio intencionado de texto, no regresión): testB (filas de empresa 56–96 px por las píldoras; recuento «105 empresas»), testC («Asignada al 100 %»; se retira la barra de progreso oculta del resumen), testD y testE (texto de la tarjeta).
Los comandos y requisitos están en `LEEME-PRUEBAS.md`.

## 3. Limitaciones y bloqueos
- **Siguen pendientes** (no ejecutados): validación en Cloudflare D1 remoto y correo real (`ronda10/BLOQUEOS.md`, faltan accesos); navegadores reales, lector de pantalla, zoom real, daltonismo: `ronda12/pruebas-manuales.md` (M33–M40; M1–M32 de la ronda 11 también).
- El texto ampliado es una **simulación** (`font-size` 200 %).
- Las pantallas nuevas **no se han capturado en tema oscuro** (los tokens sí tienen contraste calculado en ambos).
- En móvil, el «Asignado: N %» aparece en la barra inferior y en la composición; se ha quitado del resumen, pero no se ha unificado más.
- Con más de ocho posiciones los colores se repiten (hay ocho).
- La demo es simulada (sin persistencia); el plan de pago sigue reservado.

## 4. Pantallas que faltan por adaptar
Portada, carteras públicas (lista y detalle), acceso (diálogo), pie legal y gráficos de precio.

## 5. Resultado de la ejecución (literal)
```
Ejecución: 2026-11-03 22:18 UTC
Código: commit 212981de3555f2e3813e20b2e13779e34b4e10fc; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 6 correctas, 0 fallos
=== unit-acceso ===
RESULTADO: 8 correctas, 0 fallos
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
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
