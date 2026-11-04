# Tabla de entradas y salidas esperadas · comparador y nota de estructura v1

Todo lo de esta tabla está comprobado por `tests/ronda15/unit-comparador.mjs` (9) y `tests/ronda15/unit-nota.mjs` (26) con datos **sintéticos rotulados** (universo inventado de 24 empresas por sector; ninguna cifra es real). Código: `public/js/comparador.js` y `public/js/nota.js` (módulos puros, versionados: `estructura-v1`).

## Comparador de dos empresas del mismo sector
Definiciones: **crecimiento de ventas** = ventas del ejercicio / ventas del anterior − 1 (%). **Margen operativo** = resultado operativo / ventas (%), *nunca* el margen neto. **Deuda neta / EBITDA** = años de EBITDA que haría falta para cubrir la deuda neta (veces); negativa = caja neta; EBITDA ≤ 0 → «no comparable». Los ejercicios se alinean (se compara el último común), todo en USD; cada cifra lleva fuente, periodo y fecha de carga. Sin clasificación de ganadores.
| Caso | Entrada | Salida esperada |
|---|---|---|
| P1 caso base | A: ventas 120 (antes 100), resultado operativo 24, deuda 60, EBITDA 30. B: ventas 90 (antes 100), resultado operativo 9, deuda −10, EBITDA 20 | Crecimiento A 20,0 % · B −10,0 %. Margen operativo A 20,0 % · B 10,0 %. Deuda A 2,0 veces · B «Caja neta (−0,5 veces)» |
| P2 | Resultado operativo ausente (beneficio neto 50) | «Sin dato» con motivo «no se sustituye por el margen neto»; texto vacío |
| P3 | EBITDA 0 o negativo | «No comparable»: la ratio no se interpreta |
| P4 | EBITDA o deuda ausentes | «Sin dato» |
| P5 | A llega a FY2024, B a FY2023 | Se alinea en FY2023; el crecimiento de A pide FY2022 (no lo tiene) → «Sin dato» |
| P6 | Sin ningún ejercicio común | Las tres filas «No comparable» |
| P7 | Ventas del ejercicio anterior = 0 | Crecimiento «No comparable» (no se divide por cero) |
| P8 | Fuentes distintas, sectores distintos | Cada celda con su origen (SEC / prueba) y fecha; `mismoSector = false` |

## Nota de estructura y solidez v1 (1 a 10)
Bloques: **Empresas 20 %** · **Sectores y actividades 20 %** · **Tamaño y liquidez 15 %** · **Deuda y caja 25 %** · **Rentabilidad y crecimiento 20 %**. Se publica solo con la cartera al 100 % y ≥ 90 % del peso evaluable en cada bloque; el único redondeo es el de la nota final (un decimal). Los umbrales son **provisionales**; con datos reales la activación queda pendiente de calibración y verificación (no hay datos de mercado reales cargados).
| Caso | Entrada | Salida esperada |
|---|---|---|
| N1 | Dos empresas 50/50 | Empresas efectivas N = 2; puntuación 1 + 9·(2−1)/14 = **1,6429** |
| N1b | 90/10 | N = 1/(0,81+0,01) = **1,2195** ≈ 1,22 |
| N2 | Dos clases del mismo emisor 50/50 | N = **1** (cuentan una vez) |
| N2b | 20 empresas al 5 % | N = 20 ≥ 15 → puntuación **10** |
| N3 | 6 sectores/actividades casi iguales | ½·(1+9·(N_sector−1)/5) + ½·(1+9·(N_act−1)/9) |
| N4 | Empresa pequeña al 2 % frente al 30 % | Su efecto en Tamaño y liquidez es menor al 2 % que al 30 % |
| N5 | Falta un ejercicio en una empresa del 15 % | Deuda y Rentabilidad con cobertura **85,0 %** (< 90 %): nota pendiente; motivo «Faltan ejercicios: hacen falta 5 consecutivos» |
| N5b | Empresa sin evaluar del **10 %** | Cobertura **90,0 %** exacta: **se publica** |
| N5c | Empresa sin evaluar del 10,1 % | Cobertura **89,9 %**: no se publica y lo dice |
| N6 | 19 comparables en el sector | Deuda y Rentabilidad no se calculan: «Solo hay 19 comparables (hacen falta 20)» |
| N6b | 20 comparables | Se calcula y se publica |
| N7 | ETF sin composición verificada (20 %) | Peso sin evaluar en todos los bloques; cobertura 80 %; nota pendiente |
| N8 | Cartera al 95 % (o 110 %) | Sin nota ni bloques; dice «suma 95 %» y que no se reescala (ni se recorta) |
| N9 | Empates | Percentil por rango medio: p(2 en [1,2,2,3]) = 50; p(1) = 12,5; p(3) = 87,5 |
| N10 | Caja neta con EBITDA > 0 y caja libre 5/5 | Deuda y caja = (10 + 10)/2 = **10** |
| N10b | Deuda > 0 con EBITDA < 0 y caja libre 0/5 | (1 + 1)/2 = **1** |
| N10c/d | Deuda y EBITDA nulos, o caja neta con EBITDA negativo | **Sin evaluar** |
| N11 | Banco/aseguradora | Peso sin evaluar en Deuda y Rentabilidad (ROIC); cuenta en Empresas y Sectores |
| N12 | Mayor ROIC del sector (24 comparables) | Percentil 97,9 → ½·9,8125 + ¼·10 + ¼·10 = **9,906** |
| N13 | Sin doble redondeo | nota = round(Σ peso·puntuación/100, 1) con puntuaciones sin redondear |
| N14 | Limitación y fortaleza | Limitación = mayor «peso × (10 − puntuación)»; fortaleza = bloque de mayor puntuación |
| N15 | Cartera y escenario con igual composición, fecha y datos | **Misma nota** y mismo resumen (sin importar el orden) |

## Qué NO hace la nota
No es una previsión de rentabilidad ni una recomendación; no mide riesgo de mercado; una nota alta no garantiza rentabilidad ni idoneidad personal. En un escenario guardado se conserva la **evaluación fechada** que vio la persona y no se recalcula.
