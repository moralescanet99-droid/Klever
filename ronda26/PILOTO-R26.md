# Piloto con cinco principiantes sobre `piloto-r27` (antes `piloto-r26`) — qué cambia respecto al guion de la ronda 24

> **Ronda 27:** la versión pasa a **`piloto-r27`** (mismo producto + corrección de la duplicación por un envío incierto). Donde aquí ponga `piloto-r26`, léase `piloto-r27`. La sección «Incidencia conocida» de `ronda24/PRUEBA-CON-USUARIOS.md` **ya no aplica**: ver `ronda27/LEEME.md`.

**Estado: NO realizado.** No hay participantes ni resultados. Este documento **completa** (no sustituye) el guion, las instrucciones y la verificación previa de `ronda24/`: todo lo de allí sigue valiendo, cambiando `piloto-r23` por **`piloto-r26`**.

## Versión
- `scripts/piloto/VERSION-PILOTO.txt` → `piloto-r26` (código del commit `cdae3ee`, pasada completa 998/0). `bash scripts/piloto/abrir-piloto.sh` debe decir **«VERSIÓN piloto-r26 CORRECTA»**; `verificar-version.sh` ya lee el nombre del archivo.
- Comprobado aquí (lado servidor): `bash scripts/piloto/comprobar-persistencia.sh` → «PERSISTENCIA DEL SERVIDOR CORRECTA». **Falta** la verificación previa en el dispositivo previsto (`ronda24/VERIFICACION-PREVIA-DISPOSITIVO.md`, comprobación 6 con «piloto-r26»).
- `piloto-r23` sigue intacto en la rama `ccr-b652a7eb-uukhdy` como **alternativa declarada**; no se mezclan participantes de las dos versiones.

## Un solo grupo de cinco
Se prueba **solo** `piloto-r26`. Motivo: `piloto-r23` defiende una promesa que Javier ya ha sustituido («entender» → «comparar antes de invertir»); medir la versión abandonada no ayuda a decidir. Dos grupos exigirían diez personas y no hay ninguna reclutada.

## Cambios en las tareas (sin enseñar el recorrido)
- **T0 (nueva, 10 segundos):** enseñar la portada 10 s y taparla. Preguntar: «¿Para qué sirve esto?» y «¿Hay dinero de verdad?». Anotar literal.
- **T2:** tras «Revisar», pedir que diga qué le dicen las fichas de colores (p. ej. «Exposición alta: …»). **Preguntar sin sugerir: «¿Klever te está diciendo qué hacer?»** Anotar literal.
- **T3:** dejar que llegue a la comparación por donde quiera (normalmente «Ver qué cambiaría»). Observar si usa el deslizador sin que se lo digan y si entiende el tramo «libre». Mantener la pregunta «¿Qué ha cambiado en tu cartera?».
- T1, T4 y T5 sin cambios. La incidencia conocida del envío incierto sigue igual (ronda 24, sección 3).

## Columnas añadidas al registro
| Persona | T0 «¿Para qué sirve?» (literal) | T0 «¿Dinero de verdad?» | T2 «¿Te dice qué hacer?» (literal) | T3 ¿usó el deslizador solo? | T3 ¿entendió «libre»? |
|---|---|---|---|---|---|
| 1 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 | ⬜ pendiente | ⬜ | ⬜ | ⬜ | ⬜ |

## Criterio de éxito (se mantiene y se añade uno)
Se mantiene: **4 de 5** completan sin ayuda sustancial, comprenden la simulación y **todas** recuperan lo guardado.
**Se añade:** si **2 o más** personas entienden una señal o la hipótesis como una **recomendación u orden** («me dice que venda NVDA»), eso tiene prioridad sobre todo lo demás: se reescriben las señales antes de cualquier integración o beta. Lo mismo si 2 o más creen que hay dinero real.
