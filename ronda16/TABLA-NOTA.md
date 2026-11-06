# Ronda 16 · Tabla de entradas y salidas de la nota (v1, umbrales sin cambiar)

Datos **sintéticos identificados** (`origen: 'sintetico'`). Con datos reales, mixtos o sin origen la nota **no se publica** (habilitación explícita pendiente de calibración).

| Caso | Entrada | Salida esperada | Prueba |
|---|---|---|---|
| EBITDA ausente | Deuda neta positiva, EBITDA `null` | Indicador pendiente: «Falta el EBITDA… (un dato ausente no es un EBITDA cero)» | N20a |
| EBITDA cero | Deuda neta positiva, EBITDA 0 | 1 punto en deuda/EBITDA; deuda y caja = (1 + 10) / 2 = 5,5; se publica | N20b |
| EBITDA negativo | Igual con −5 | Igual que cero | N20c |
| 59 sesiones | Liquidez con 59 sesiones | Tamaño pendiente: «Solo hay 59 sesiones de negociación (hacen falta 60)» | N21 |
| 60 sesiones | Igual con 60 | Se publica | N21 |
| Otra moneda / fuente / sin fecha | Una empresa distinta del resto | Tamaño pendiente con su motivo; el resto del universo no cambia | N22 |
| Datos ausentes en posiciones distintas | Sin EBITDA en un 10 % y sin caja libre en otro 10 % | Cada indicador conserva el 90 %: «Deuda y caja» se publica | N23a |
| 89,9 % en un indicador | Sin EBITDA en un 10,1 % | Pendiente, y el motivo cita «deuda neta / EBITDA: 89,9 %» | N23b |
| Sin origen sintético | Universo sin `origen` o `real` | No se publica: «todavía no está habilitada…» | N24 |
| Guardar y reabrir | Evaluación publicada → JSON → leer | Misma cifra, fecha, cobertura y versión | N25 |

Ejemplos del móvil (datos sintéticos de la semilla): **KO 60 % / PG 40 %** → nota calculada (4,4) con «Coca-Cola (KO) pesa el 60 % de la cartera…»; **KO 50 % / JPM 50 %** → nota pendiente: «Podemos medir «empresas», «sectores y actividades» y «tamaño y liquidez». Faltan datos para valorar «deuda y caja» y «rentabilidad y crecimiento». Causa principal: JPM (50 % de la cartera): sector sin metodología de deuda/EBITDA (banca y seguros).»
