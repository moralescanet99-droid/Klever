# Ronda 28 · Fase 1 del plan: claridad y lenguaje

**Encargo (Javier, 2026-11-06):** «haz un plan para mejorar todos los aspectos a 10 y empieza ya, todos menos el 14». Plan completo en `PLAN.md` (4 fases). Esta ronda es la **fase 1**: lo que se puede hacer sin cuentas externas ni personas.
**Piloto:** la versión congelada `piloto-r27` es el commit `f991fd8` (`git checkout f991fd8` antes de abrir el piloto). Esta ronda no la cambia.

## Qué se ha hecho (implementado)
| Punto del plan | Cambio |
|---|---|
| 1 · Primera impresión | Un **único botón principal** visible también para quien llega por primera vez («Crear desde cero», abre el editor vacío). Las tres entradas quedan debajo como «O empieza de otra forma». Enlace a «Cómo funciona Klever». |
| 3 · Crear cartera | **«Cartera» en toda la web** (antes también «portafolio»: menú, títulos, botones, aviso legal). Botón **«Reparte a partes iguales»** en el editor (suma exactamente 100 %; solo aparece cuando cambia algo). |
| 4 · Revisión | **Tres indicadores con semáforo** en lenguaje llano: **Concentración** (baja/media/alta), **Variedad** (amplia/media/poca) y **Datos** (completos/parciales/escasos: qué parte del peso puede analizar Klever). Sustituyen a la línea de cifras; la mayor posición y las tres mayores siguen en «Qué mide». La nota técnica sigue debajo, sin cambios. |
| 6 · Comparar | El laboratorio llega con **«Del resto de posiciones» elegido por defecto** y la pregunta llana **«3 · ¿De dónde sale el peso?»** (antes «Cómo se financia», sin opción marcada). |
| 7 · Descubrir | **Glosario al pulsar** (Deuda, ROIC, Margen, Caja libre, Crecimiento en palabras llanas) y filtro **«Solo sectores que no tengo»** (según la cartera abierta o el borrador). |
| 11 · Texto | Cabeceras de una frase (ya en la ronda 26); «Tres formas de empezar» pasa a secundario. |
| 12 · Confianza | Página **«Cómo funciona Klever»** (`#como-funciona`): qué hace, qué no hace, de dónde salen los datos y qué guardamos. Enlazada desde la portada y el pie. |

## Qué se ha probado
- **Toda la batería existente con los cambios:** 1010/0 (pasada de control antes de añadir las pruebas nuevas).
- **`tests/ronda28/unit-claridad28.mjs` (8):** bordes exactos del semáforo (24,9 → baja, 25 → media, 40 → alta), concentración por categoría, ETF como una sola variedad, «Datos» sin evaluación = «Calculando» (no inventa cifra), reparto igual que suma 100 % con una decimal para n = 1…30.
- **`tests/ronda28/testX.cjs` (24, servidor real, 1440/390/320):** un único botón principal visible; reparto igual; indicadores con el nivel esperado; laboratorio con opción por defecto; glosario y filtro; «Cómo funciona»; **ninguna pantalla principal dice «portafolio»**; sin errores ni desbordes.
- **Pruebas antiguas adaptadas a propósito (se declara):** las que buscaban el texto literal «Mis portafolios», «Revisar portafolio», «Crear portafolio», «Tu portafolio» o «el portafolio pasaría» ahora buscan «cartera» (7 archivos; solo el texto, ninguna condición relajada).
- Revisión visual en escritorio y 390 px: corregidos tres detalles (etiqueta «Concentración» cortada en móvil, botón y enlace desalineados en la portada, tarjetas de «Cómo funciona» desalineadas).
- **Pasada completa oficial:** ver el final.

## Sin comprobar
Personas (¿se entienden los semáforos?, ¿el botón único reduce la duda inicial?), teléfono real, lector de pantalla con los indicadores (llevan el detalle como texto para lectores), Safari/Firefox.

## Qué queda del plan
Fase 2 (móvil con barra inferior, tarjetas de empresas, pegar «KO 40, PG 60», varios cambios a la vez, renombrar escenario/radar, sello único de avisos, Revista fuera del menú, señales en tres niveles con umbrales ajustables), fase 3 (personas) y fase 4 (producción). El punto 14 sigue aparcado.

## Resultado de la pasada completa
**Commit `f0334db`, árbol limpio, 2026-11-06 23:48 UTC, local del autor: 1042 correctas, 0 fallos, código de salida 0** (53 baterías con resultado: las 1010 de la ronda 27 + 8 de `unit-claridad28` + 24 de `testX`). Una primera ejecución se cortó por un reinicio del contenedor y se repitió entera. Registro en `resultado-ejecucion.txt` y `logs/`.
