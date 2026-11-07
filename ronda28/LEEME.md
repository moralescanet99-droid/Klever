# Ronda 28 · Fases 1 y 2 del plan: claridad, lenguaje, móvil y descubrir

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
**Commit `f0334db`, árbol limpio, 2026-11-06 23:48 UTC, local del autor (registro sustituido después por el de la fase 2): 1042 correctas, 0 fallos, código de salida 0** (53 baterías con resultado: las 1010 de la ronda 27 + 8 de `unit-claridad28` + 24 de `testX`). Una primera ejecución se cortó por un reinicio del contenedor y se repitió entera. Registro en `resultado-ejecucion.txt` y `logs/`.

---

# Fase 2 del plan: móvil y descubrir

**Encargo (Javier, 2026-11-07):** «sí» a seguir con la fase 2 (`PLAN.md`).

## Qué se ha hecho (implementado)
| Punto | Cambio |
|---|---|
| 10 · Móvil | **Barra inferior** (< 720 px) con tres destinos: Carteras, Descubrir y Cuaderno; marca el actual. No aparece en el editor ni en el laboratorio (tienen su propia barra de acciones). La Revista sale de la barra principal; sigue en el menú. |
| 3 · Crear cartera | **«Pega tu cartera»:** escribir o pegar «KO 40, PG 60» en el buscador del editor crea o actualiza esas posiciones de una vez (`public/js/pegado.js`, puro). Lo que no está en el universo se dice («sin reconocer: ZZZZ») y no se sustituye; pesos fuera de rango o con más de una decimal se rechazan. |
| 7 · Descubrir | Botón **«Probar»** en cada empresa de Explorar: abre el laboratorio con esa empresa al 10 % y el deslizador listo. |
| 5 · Señales | Al pulsar una señal, **tres niveles**: qué es, por qué importa y qué probar. **Umbrales propios** (en «Qué mide»): la persona fija desde qué % una posición o un sector «pesa mucho». Se guardan solo en su navegador, se validan (si no valen, se usan los de Klever) y el detalle dice «tu referencia». «Mis carteras» también los usa. |
| 8 · Cuaderno | **Renombrados visibles:** «escenario» → «idea» y «radar» → «empresas que sigo» (interfaz, avisos y mensajes del servidor). **Preguntas de ejemplo** al guardar una idea («¿Sigue creciendo NVDA?»…). |

## Qué se ha probado
- **`tests/ronda28/unit-fase2-28.mjs` (10):** lectura de listas (formatos, símbolo con punto, desconocidos, pesos no válidos, repetidos, «¿parece una lista?») y umbrales propios (cambian las señales, se validan, cada señal trae su «por qué importa»).
- **`tests/ronda28/testY.cjs` (21, servidor real, 1440/390/320):** barra inferior (y su ausencia en escritorio, editor y laboratorio), pegar una lista, «Probar» desde Explorar, señal en tres niveles y umbrales propios, renombrados (sin «escenario» ni «radar» a la vista en el Cuaderno y la ficha), preguntas de ejemplo, sin errores ni desbordes.
- **Primera pasada completa de la fase 2** (`d545fca`): 1071 correctas, **2 fallos**, ambos por cambios intencionados: `testN` N9 buscaba «escenario guardado» (ahora «idea guardada») y `testB` exigía que, tras 12 tabulaciones desde el buscador, el foco estuviera en un «Ver ficha»; con el glosario y el botón «Probar» por fila, cae en un control de fila distinto. Se adaptan: N9 al texto nuevo; testB exige un control (Ver ficha o Probar) **de una fila** de la tabla. Ninguna otra condición cambia.
- **Pruebas antiguas adaptadas a propósito (se declara):** 8 archivos buscaban textos literales que cambian («Aún no has guardado ningún escenario», «Guardar en mi radar», «Mis escenarios», «Mi radar», «No encontramos ese escenario», «★ En tu radar»…). Solo cambia el texto buscado.

## Cierre de la fase 2 (encargo: «termina la fase 2»)
| Punto | Cambio |
|---|---|
| 6 · Comparar | **Varios cambios a la vez:** tras simular, «+ Añadir otro cambio» acumula ese cambio y el siguiente se prueba sobre el resultado; un aviso muestra los cambios acumulados con «Deshacer el último» y «Empezar de nuevo». La comparación (barras, cifras clave, «Quién cede el peso») es **siempre contra la cartera original**. **«Aplicar a mi cartera»** (solo si la base es la cartera abierta en el editor): pide confirmación con la composición final y la pasa al editor como cambios sin guardar; la cuenta no cambia hasta pulsar «Guardar cartera». Una idea del Cuaderno sigue guardando **un solo cambio** (el servidor no cambia): con varios, se explica y se ofrece aplicar. |
| 11 · Texto | **Sello único de avisos** en el laboratorio: «Simulación · sin dinero real · no es una recomendación», con el detalle propio de cada sitio al pulsar «Más». Sustituye a los dos párrafos de advertencia. Los avisos que exigen las pruebas por su texto (portada, Explorar, nota) se mantienen. |
| 8 · Cuaderno | **Línea de tiempo** en cada idea: arriba la próxima revisión (o «Toca revisar»), en medio tus revisiones y abajo «Guardaste la idea» con la fecha y la pregunta. |
| 7 · Descubrir | **Monograma** por empresa (dos letras del símbolo con el color de su sector). Sin logotipos externos: serían una fuente externa, y la regla del proyecto lo impide. |

- **`tests/ronda28/testZ.cjs` (21, servidor real, 1440/390/320):** dos cambios encadenados contra la original, «Deshacer el último», sin guardado como idea con varios cambios, «Aplicar a mi cartera» con confirmación (el editor queda con NVDA 17,5, JNJ 10 y un 20 % sin asignar, igual que la simulación), sello con detalle al pulsar, línea de tiempo, monogramas, sin errores ni desbordes. Una primera versión de la prueba esperaba que el total sumara 100 %; era un error de la prueba: el método proporcional deja sin asignar lo que libera al bajar un peso.
- Comprobadas además `testD` (geometría de las tarjetas de empresas con el monograma) y `testS` (aviso «Tu cartera base no cambia»): en verde.

## Lo que queda fuera de la fase 2 (se declara)
- **Revista:** sin contenido nuevo (depende de Javier).
- **Guardar en el Cuaderno una idea con varios cambios:** exigiría cambiar el formato que valida el servidor y los datos guardados. Hoy se resuelve aplicando los cambios a la cartera.

## Sin comprobar
Teléfono real (la barra inferior con zonas seguras de iPhone se ha escrito, no probado), lector de pantalla, Safari/Firefox, personas.

## Resultado de la pasada completa de la fase 2 (antes del cierre)
**Commit `cadb826`, árbol limpio, 2026-11-07 07:34 UTC, local del autor: 1073 correctas, 0 fallos, código de salida 0** (55 baterías con resultado: 1042 de la fase 1 + 10 de `unit-fase2-28` + 21 de `testY`). Registro en `resultado-ejecucion.txt` y `logs/` (sustituyen a los de la fase 1).

## Resultado de la pasada completa del cierre de la fase 2
*(pendiente)*
