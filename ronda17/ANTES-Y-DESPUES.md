# Ronda 17 · Antes y después de los casos reproducibles

Mismo guion contra **la ronda 16** (commit `0aea105`, en un árbol de trabajo aparte) y contra el código actual: `node tests/ronda17/antes-despues-r17.mjs <raíz>`. Resultado literal en `ronda17/antes-despues-resultado.txt`. Son pruebas de **módulo y servidor sobre SQLite real**: desde la fila hasta el resultado que calcularía la pantalla, **no** de navegador ni de entorno remoto (la parte visible de cada caso se prueba en `unit-procedencia17`, que genera el HTML de la nota, y en `testO`/`testP`).

| Caso (KO 60 % / PG 40 %, misma semilla) | ANTES (ronda 16) | DESPUÉS (ronda 17) |
|---|---|---|
| Semilla íntegra | origen sintético, **4,4** | origen sintético, **4,4** (sin cambio) |
| KO con la **fuente NULL** | sintético, **4,4** (publica datos sin procedencia) | **incompleto**, nota pendiente: «KO FY…: la fila no tiene fuente» |
| Fecha de mercado de KO = **«ayer»** | sintético, **4,4** | **incompleto**, pendiente; la instantánea no adopta «ayer» |
| Fecha imposible **2026-02-31** en un ejercicio | sintético, **4,4** | **incompleto**, pendiente: «la fecha de la fila no es una fecha real» |
| Origen **mixto** (PG con fuente «sec») | mixto, pendiente | mixto, pendiente (con el motivo de la mezcla) |
| Nota guardada: **4,4 → 10** (bloques intactos) | **201** | **400** (no cuadra con sus bloques) |
| Nota guardada: versión **«foo»** | **201** | **400** (versión no conocida) |
| Texto con control bidireccional (U+202E) | **201** | **400** |
| Evaluación coherente | 201 | 201 |
| Vínculo a **hidrogeno-norte:99** (inexistente) | **201** | **400** |
| Vínculo a **hidrogeno-norte:1** (existe) | 201 | 201 |

## Qué no demuestra
- No prueba el comportamiento del DOM del «antes» (no se cargó la ronda 16 en un navegador).
- «Antes» y «después» usan la misma semilla (la de la ronda 17, con fecha fija); lo que cambia es el código de `/api/universo`, `nota.js` y las rutas de escenarios.
- No prueba exposición entre cuentas de una nota manipulada ni nada en D1 remota.
