# Ronda 19: frontera del redondeo cerrada, revisión a 320 px medida por el resultado y revisión sin nota explicada

Parte de la revisión de la ronda 18 (`procesos-klever/06-`, C16). Versión revisada: rama `ccr-b652a7eb-uukhdy`.

> **Código de la última pasada completa: commit `ca9b1ae`** (después solo cambió la documentación, un script de repetición movido de carpeta y se añadió el script de antes/después). Resultado literal al final. Guía única para abrir el recorrido: `ronda19/ABRIR-EN-MOVIL.md`. Antes/después: `ronda19/ANTES-Y-DESPUES.md`.

# 1. Cambios
| Punto del encargo | Qué se hizo | Evidencia |
|---|---|---|
| **Redondeo** (bloques 5,44/5,44/5,44/5,46/5,44 con nota 5,5) | Antes se aceptaba; ahora se rechaza. Los bloques guardados son `Math.round(x·100)/100`, de modo que cada real está en [b − 0,005; b + 0,005); el total real está en [S − 0,005; S + 0,005) y la nota n exige T ∈ [n − 0,05; n + 0,05). Compatibles ⇔ `S4 + 50 > n10·1000 − 500` **y** `S4 − 50 < n10·1000 + 500` (ambas estrictas). Cambio aislado en `validarResumen`. | `unit-redondeo19` **6**: el caso exacto y sus vecinos (por validador, por POST y por lectura de fila histórica), un **oráculo independiente** por fuerza bruta en millonésimas contra el validador, y una barrida de carteras del evaluador (ninguna salida legítima rechazada) |
| **Revisión a 320 px** | Se mide el **rectángulo del resultado** (cifra + titular; el aviso completo sin nota), no su panel: debe quedar entre la parte superior y el inicio de la barra fija. Etiqueta «Paso 3 de 3 · Revisión» y «Volver» visibles, foco en la nota, pesos intactos. `pasoActual` desplaza en dos fotogramas, de forma instantánea. | `testR` **9** (320 y 390; con y sin nota; ratón y teclado; movimiento reducido on/off; 1440) y `testQ` Q3 endurecido |
| **Revisión sin nota** | Se separan tres causas: instrumento sin método (ETF, bancos), datos ausentes o inválidos, cobertura insuficiente. Explicación breve; el detalle por activo, en «Cómo se calcula». Se muestra lo que sí existe (asignación, mayor posición, reparto por instrumento). Sin cambiar posiciones ni pesos. | `unit-revision19` **10** (plantilla mixta, solo acciones, datos inválidos, solo ETF, ETF + banco, ETF + dato ausente, pocos comparables) |
| **Regresión** | Pasada completa con registro íntegro por batería (comando, entorno, código, tiempo agotado y toda la salida, también de los intentos fallidos); repeticiones con latencia 0 y 300 ms. Aserciones **no rebajadas**. | `ronda19/logs/`, `logs-intento1/`, `logs-intento2/`, `intermitentes.txt` |

# 2. Fallos de la propia ronda (intentos conservados)
1. **Intento 1** (`logs-intento1/`, código `3d0eb22`): `testF` terminó sin resultado. Causa **demostrada** con un experimento: la app registra `onbeforeunload` cuando hay cambios sin guardar; un `page.reload()` con el editor sucio abre un diálogo y, si el ejecutor no lo acepta, no termina (agota 30 s). No es un fallo de la aplicación. Corrección **solo de la prueba**: `testF` acepta el diálogo y deja constancia (F9: los diálogos son todos `beforeunload`). Otras baterías con `reload` pasaron sin esto, pero conviene vigilarlo.
2. **Intento 2** (`logs-intento2/`, `resultado-intento2.txt`, 4 problemas): (a) `testK` sin resultado: `page.goto: net::ERR_ABORTED` en una navegación del visitante; **no reproducido** al repetirlo (75/0 y luego 75/0 en la pasada definitiva); causa **no demostrada**, probable carrera de navegación; (b) `testO` 18/0 pero **no salía del proceso** (900 s): no reproducido (13 s dos veces); se añadió a `fin` de `h.cjs` una salida forzada a los 10 s con el mismo código; la causa del cuelgue **no está demostrada**; (c) `testQ` Q3-320: la medición ocurría antes de que el desplazamiento se estabilizara; la prueba espera ahora cinco fotogramas sin cambio de `scrollY`.
3. **Intento 3 (definitivo):** todo correcto, ver abajo.

# 3. Pruebas realmente ejecutadas (separadas por entorno)
**Módulo / servidor (SQLite real, sin navegador):** `unit-redondeo19` 6 y `unit-revision19` 10 (nuevos), `unit-integridad18` 18, `unit-guardada17` 20, `unit-procedencia17` 13, `unit-nota` 35 y las anteriores.
**Navegador (Chromium, servidor local):** `testR` **9** (nuevo), `testQ` 25, `testP` 28, `testO` 18, `paridad-demo` 5, `testF` 10 y las anteriores; demo autónoma (`demotest`) correcta.
**Total de la pasada completa definitiva: 800 comprobaciones correctas, 0 fallos, código 0** (39 baterías + demo; *aserciones ≠ entradas*: una comprobación puede cubrir varias carteras o fechas).
**Repeticiones** (`tests/ronda19/repetir-intermitentes.sh 2 300`): `testE` 15/0, `testF` 10/0 y `testC` 50/0, **dos veces con latencia 0 y dos con 300 ms: 12/12**.
**Entorno remoto:** nada ejecutado. **Móvil físico, lector de pantalla, Safari/Firefox, D1 remota, correo real y comprensión por personas: no probados.**

# 4. Prueba con personas
**No realizada.** Guion para cinco principiantes con cartera con ETF y la distinción datos ficticios / evaluación parcial / nota global en `ronda19/PRUEBA-CON-USUARIOS.md`; «cerrar y volver» exige persistencia verificada (la demo no sirve). Registro: todo «pendiente».

# 5. Capturas
`ronda19/capturas/` (viewport, no página completa): Distribución y Revisión a 1440×900, 390×780 y 320×780; en móvil, con nota (KO 60 % / PG 40 %: 4,4) y sin nota (plantilla mixta). Generadas por `testR` tras estabilizarse el desplazamiento.

# 6. Limitaciones
- La nota solo existe con datos **sintéticos**; nada es real ni recomendación.
- La comprobación de redondeo asume bloques de dos decimales; si cambiara el redondeo del evaluador, debe cambiar a la vez el validador.
- No hay medición «antes» de la geometría a 320 px con el criterio nuevo (el criterio antiguo medía otra cosa).
- Las causas de dos fallos intermitentes (`testK` goto abortado, `testO` sin salir) **no están demostradas**; hay mitigación para el segundo y ninguna para el primero.

# 7. Resultado literal de la última pasada (`resultado-ejecucion.txt`)
```
Ejecución: 2026-11-05 08:12 UTC
Código: commit ca9b1aee14263195623d639c3a150bf20edb576c; árbol de trabajo limpio
Node v22.23.4 · wrangler 3.114.17 · playwright 1.63.0

=== unit-servidor ===
RESULTADO: 11 correctas, 0 fallos
=== unit-carreras ===
RESULTADO: 8 correctas, 0 fallos
=== unit-migracion ===
RESULTADO: 14 correctas, 0 fallos
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
RESULTADO: 35 correctas, 0 fallos
=== unit-comparador ===
RESULTADO: 9 correctas, 0 fallos
=== unit-almacen ===
RESULTADO: 9 correctas, 0 fallos
=== unit-escenarios16 ===
RESULTADO: 11 correctas, 0 fallos
=== unit-procedencia17 ===
RESULTADO: 13 correctas, 0 fallos
=== unit-guardada17 ===
RESULTADO: 20 correctas, 0 fallos
=== unit-integridad18 ===
RESULTADO: 18 correctas, 0 fallos
=== unit-redondeo19 ===
RESULTADO: 6 correctas, 0 fallos
=== unit-revision19 ===
RESULTADO: 10 correctas, 0 fallos
=== test-zip ===
RESULTADO: 8 correctas, 0 fallos
=== testA ===
RESULTADO: 31 correctas, 0 fallos
=== testB ===
RESULTADO: 53 correctas, 0 fallos
=== testC ===
RESULTADO: 50 correctas, 0 fallos
=== testD ===
RESULTADO: 29 correctas, 0 fallos
=== testE ===
RESULTADO: 15 correctas, 0 fallos
=== testF ===
RESULTADO: 10 correctas, 0 fallos
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
=== testO ===
RESULTADO: 18 correctas, 0 fallos
=== testP ===
RESULTADO: 28 correctas, 0 fallos
=== testQ ===
RESULTADO: 25 correctas, 0 fallos
=== testR ===
RESULTADO: 9 correctas, 0 fallos
=== paridad-demo ===
RESULTADO: 5 correctas, 0 fallos
=== seguridad-http (servidor sin enlace de acceso en pantalla) ===
RESULTADO: 6 correctas, 0 fallos
=== demo (demotest) ===
DEMO OK
RESUMEN: todo correcto. Código de salida 0.
```
