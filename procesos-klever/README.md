# Procesos Klever

Memoria del proyecto. Reúne el contexto que se ha dado, lo que se ha decidido y por qué, lo que se ha hecho, en qué estado está y cómo retomarlo, para que ninguna sesión empiece de cero.

> **Para quien retome el trabajo (persona o Claude):** lee primero este índice, luego `05-estado-actual.md` y `08-entorno-y-trampas.md`. En dos minutos sabes dónde estamos.

## Índice
| Archivo | Qué contiene |
|---|---|
| `01-contexto-y-reglas.md` | Qué es Klever, para quién, restricciones y preferencias de trabajo. |
| `02-plan-original.md` | El plan de partida (documento «Plan web de portafolios (beta gratuita)»). |
| `03-decisiones.md` | Cada decisión técnica y de producto, con su motivo. |
| `04-cronologia.md` | Las rondas de trabajo en orden y qué entregó cada una. |
| `05-estado-actual.md` | **Qué está implementado, probado y pendiente.** Mapa del código. |
| `06-peticiones-del-usuario.md` | Los encargos largos del usuario, **literales**, y el resto en orden. |
| `07-feedback-de-chatgpt.md` | Las críticas recibidas de ChatGPT y qué se hizo con cada una. |
| `08-entorno-y-trampas.md` | Cómo ejecutar y probar, y los errores que ya nos costaron tiempo. |
| `09-registro-de-cambios.md` | Registro cronológico, **solo se añade al final**. |
| `10-referencias.md` | Enlaces, rama, artefactos, paquetes de capturas. |

## Regla de mantenimiento (obligatoria)
Al terminar **cada tarea** que cambie algo:
1. Añadir una entrada al final de `09-registro-de-cambios.md` (fecha, qué, commit).
2. Actualizar `05-estado-actual.md` (implementado, probado, pendiente).
3. Si hubo una decisión nueva, añadirla a `03-decisiones.md` con su motivo.
4. Si el usuario dio un encargo o feedback nuevo, guardarlo en `06-` o `07-` (literal si es largo).
5. Si hay una trampa nueva del entorno, anotarla en `08-`.
6. Hacer commit y push de la carpeta junto con el cambio.

Principios al escribir aquí: distinguir siempre **implementado / probado / pendiente**; no afirmar lo que no se ha comprobado; no guardar datos personales (emails, claves, tokens).
