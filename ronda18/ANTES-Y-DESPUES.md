# Ronda 18 · Antes y después de los contraejemplos exactos de la revisión

Mismo guion contra **la ronda 17** (commit `fd424f8`, en un árbol de trabajo aparte) y contra el código actual: `node tests/ronda18/antes-despues-r18.mjs <raíz>`. Resultado literal en `ronda18/antes-despues-resultado.txt`. Son pruebas de **módulo y servidor sobre SQLite real**, no de navegador ni de entorno remoto.

| Caso | ANTES (ronda 17) | DESPUÉS (ronda 18) |
|---|---|---|
| **I1.** Resumen guardado con nota 5,5 y bloques 5,44 / 5,44 / 5,47 / 5,44 / 5,44 (suma 5,4445; el máximo posible es 5,4495) | `POST` → **201** | `POST` → **400** («no puede salir de sus bloques») |
| I1. Mismo resumen con nota 5,4 (compatible) | 201 | 201 |
| **I2.** Fecha de mercado `2026-11-04basura` | origen sintético, **4,4** | origen **incompleto**, nota pendiente |
| I2. Fecha `2026-11-04 25:00:00` (hora imposible) | sintético, **4,4** | incompleto, pendiente |
| I2. Marca de SQLite `2026-11-04 10:00:00` (formato admitido) | sintético, 4,4 | sintético, 4,4 (sin cambio) |
| **I4.** Evaluador directo, origen sintético: un comparable ajeno a la cartera con fecha «ayer» | publica **4,4** | pendiente |
| I4. Evaluador directo: todos los comparables del sector sin fuente en sus ejercicios | publica **4,4** | pendiente |
| I4. Mismo objeto `empresas` evaluado como sintético y luego como real habilitado (caché) | reutiliza las **126** empresas (21 ficticias) | solo las **105** reales; pendiente |
| **M1.** Escenario de «otra-historia» con la referencia `hidrogeno-norte:1` | estado «**responde**» | «sin vínculo» (referencia inválida identificada) |

## Pruebas que lo demuestran
`unit-integridad18` (18): I1 (contraejemplo, vecinos válidos, extremos 1 y 10, bloques con tres decimales, fila histórica, compatibilidad con todo lo que calcula el módulo), I2 (`normalizarFecha` con 15 entradas; desde SQLite para mercado y ejercicio), I4 (evaluador directo, ruta de API, caché con el mismo objeto, copia nueva), M1 (par discordante, PATCH, desvincular una respuesta con control de revisión), M2 (propiedad propia, ancho cero con ZWJ/ZWNJ legítimos), M3 (fecha en la explicación) y M4 (título). `paridad-demo` (5): la demo y el módulo dan las mismas salidas con las mismas entradas y la demo se reconstruye con la misma huella.

## Qué no demuestra
- No prueba el comportamiento del DOM del «antes» ni nada en D1 remota.
- La coherencia aritmética de la nota guardada **no acredita que el cálculo lo hiciera el módulo**: un cliente puede enviar un resumen coherente pero inventado (bloques y total compatibles). El servidor comprueba la forma y la coherencia, no recalcula.
