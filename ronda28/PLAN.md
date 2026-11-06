# Plan para llevar Klever a 10 (puntos 1–13; el 14, «volver y valor», queda aparcado)

**Origen:** valoración del 2026-11-06 (notas de partida entre paréntesis) y encargo de Javier: «haz un plan para mejorarlos todos a 10 y empieza ya, todos menos el 14».
**Regla de oro:** un 10 se declara solo cuando se cumple su **criterio de 10** con evidencia. Si el criterio depende de personas, de un teléfono real o de producción, el punto puede estar «implementado» pero no «en 10» hasta comprobarlo.
**Piloto:** la versión congelada `piloto-r27` es el commit `f991fd8`. Para el piloto: `git checkout f991fd8` y después `bash scripts/piloto/abrir-piloto.sh`. Los cambios de este plan no la tocan; si el piloto se hace después, se congela una versión nueva.

## Fases
| Fase | Qué | Quién | Depende de |
|---|---|---|---|
| **1 (ronda 28, ya)** | Lenguaje y claridad: una sola palabra («cartera»), indicadores sencillos en la revisión, laboratorio con opción por defecto y palabras llanas, «Reparte a partes iguales», glosario y filtro «sectores que no tienes» en Explorar, página «Cómo funciona Klever», portada con un botón principal | Claude Code | — |
| **2** | Móvil y descubrir: barra inferior fija con 3 destinos, tarjetas de empresas, pegar «KO 40, PG 60», varios cambios a la vez en el laboratorio, renombrar escenario → idea y radar → «empresas que sigo», menos avisos repetidos (un sello único) | Claude Code | Fase 1 |
| **3** | Validación con personas: piloto con 5 (versión congelada) y, tras la fase 2, una segunda ronda corta | Javier (+ guion de Claude) | Fases 1–2 |
| **4** | Producción: despliegue en Cloudflare, datos reales de la SEC, correo con Brevo, copia de seguridad, revisión legal, pruebas en 2–3 teléfonos reales | Javier (cuentas) + Claude Code | Cuentas externas |
| — | Punto 14 (resumen semanal, recordatorios, progreso) | — | **Aparcado** |

## Punto por punto
| # | Aspecto (nota) | Cambios | Fase | Criterio de 10 |
|---|---|---|---|---|
| 1 | Primera impresión (7) | Un botón principal «Crea tu cartera en 1 minuto»; las otras entradas como opciones secundarias; ejemplo interactivo arriba | 1 | 4 de 5 explican para qué sirve tras 10 s |
| 2 | Estética (8) | Mismos componentes en todas las pantallas; una transición «antes → después» en la barra; contraste revisado con brillo bajo en móvil real | 2 + 4 | Nadie señala algo «roto» o fuera de lugar; coherencia en todas las pantallas |
| 3 | Crear cartera (8) | «Cartera» en toda la web; «Reparte a partes iguales»; pegar «KO 40, PG 60» | 1 (palabra, reparto) · 2 (pegar) | Cartera completa en < 2 min sin ayuda |
| 4 | Revisión y nota (5) | Tres indicadores con semáforo (Concentración, Variedad, Información) en lenguaje llano; la nota técnica queda como detalle | 1 | Las personas explican qué le pasa a su cartera sin jerga |
| 5 | Señales (7) | Detalle en tres niveles (qué es · por qué importa · qué probar); sello «referencia, no consejo»; umbrales ajustables por la persona | 2 | Nadie dice «Klever me dice que venda» |
| 6 | Comparar (7) | Opción por defecto «del resto de posiciones», palabras llanas; después varios cambios a la vez y «aplicar a mi cartera» con confirmación | 1 (llano) · 2 (varios) | Prueban 2+ alternativas por iniciativa propia |
| 7 | Descubrir (5) | Glosario al pulsar (ROIC, EBITDA, caja libre…); filtro «sectores que no tienes»; después tarjetas visuales | 1 (glosario, filtro) · 2 (tarjetas) | Encuentran una empresa nueva y la prueban |
| 8 | Cuaderno (6) | Renombrar a «idea» y «empresas que sigo»; línea de tiempo por idea; preguntas plantilla | 2 | Al día siguiente todas encuentran su idea y saben qué revisar |
| 9 | Revista (4) | Fuera del menú principal hasta tener 5–6 piezas reales; formato corto en tarjetas con «Probar en mi cartera» | 2 (menú) · contenido: Javier | Pasan de un artículo a una prueba |
| 10 | Móvil (7) | Barra inferior con 3 destinos; pantallas más cortas; prueba en iPhone y Android; instalable | 2 + 4 | Recorrido del piloto entero en móvil sin fallos |
| 11 | Texto (5) | Máximo una frase visible por bloque; avisos en un sello único | 1 (cabeceras) · 2 (sello) | Ninguna pantalla necesita desplazarse para entender su idea principal |
| 12 | Confianza (9) | Página «Cómo funciona Klever» en 4 pasos; revisión legal | 1 (página) · 4 (legal) | Nadie confunde simulación con dinero real; texto legal revisado |
| 13 | Técnica (9) | Despliegue, SEC real, correo real, copias, velocidad en móvil | 4 | Una semana en producción sin errores ni pérdidas |

## Reglas de cada ronda (sin cambios)
Pasada completa (`bash tests/run-all.sh`) en verde; cada cambio de interfaz intencionado que obligue a adaptar una prueba se declara; cada regresión, con una prueba que falla sin la corrección; informe `rondaNN/LEEME.md`; memoria en `procesos-klever/`.
