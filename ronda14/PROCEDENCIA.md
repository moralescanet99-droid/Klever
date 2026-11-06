# Procedencia de los datos (ronda 14): fuente, periodo y fecha por dato

**El fallo de la ronda 13.** Con un catálogo de la SEC vacío (simulado), `scripts/fetch_fundamentals.mjs` no generaba ninguna fila financiera y aun así escribía `datos_meta.origen = 'sec'` y `actualizado_en = hoy`: la interfaz habría dicho «Fuente: SEC EDGAR, actualizado hoy» sin que se hubiera cargado nada. Demostración en `ronda14/ANTES-Y-DESPUES.md` (§2).

## Qué cambia
| Pieza | Antes (ronda 13) | Ahora (ronda 14) |
|---|---|---|
| Dónde vive la procedencia | Una declaración global (`datos_meta`) | **En cada fila** de `fundamentales`: `fuente` (`sec` / `prueba` / `demo` / NULL) y `actualizado_en` (fecha de la carga que la escribió) + el periodo (`FY2024`) que ya tenía |
| Lote de carga | No existía | Tabla `cargas` (origen, fecha, empresas correctas / sin datos / fallidas, estado `correcta` / `parcial` / `vacia`) |
| Empresa que falla o no devuelve años | Se ignoraba pero la declaración global ya decía «SEC» | **No se toca ninguna de sus filas**: conserva su fuente y su fecha anteriores |
| Carga vacía | Declaraba «SEC hoy» | Solo deja el lote `vacia`; no declara fuente alguna |
| `/api/datos` | Leía la declaración global | **Se deriva de las filas** (último periodo de cada empresa agrupado por fuente: cuántas empresas y entre qué fechas) |
| Ficha | «Datos de prueba…» global | La fuente y la fecha **de esa ficha** (`fundamentales[0]`): «Fuente: SEC EDGAR, informe anual 10-K (ejercicio FY2024). Cargado el 4 nov 2026» / «Datos de PRUEBA ficticios…» / «Sin fuente verificada…» |
| Explorar | Un único aviso | «Fuente: SEC EDGAR… para las N empresas, cargadas entre X y Y» solo si TODAS son `sec`; **«Datos mixtos…»** si hay de más de un origen |
| Filas antiguas sin fuente | — | Quedan con fuente NULL: «sin fuente verificada» (nunca se atribuyen a la SEC) |

## Ausencia ≠ cero (métricas derivadas, `scripts/lib/carga.mjs`)
Una métrica derivada exige **todos** sus insumos; si falta uno es NULL («sin datos»), nunca 0 ni un supuesto:
- EBITDA = resultado operativo + amortizaciones: sin amortizaciones es **desconocido** (antes se confundía con el EBIT).
- Caja libre = flujo operativo − inversiones: sin inversiones declaradas es **desconocida** (antes se tomaba el flujo operativo). Una inversión **declarada** de 0 sí cuenta.
- Deuda neta: sin deuda a largo plazo o sin caja declaradas no se supone 0 (una deuda declarada de 0 sí cuenta).
- ROIC aproximado: exige también el tipo impositivo (antes se suponía un 21 % en silencio).
- Criterios: beneficio 0 → margen 0 y «no superada»; beneficio ausente → «sin datos». EBITDA ausente → deuda/EBITDA «sin datos». Crecimiento con año anterior ausente o con ingresos 0 → «sin datos».
**Coste honesto:** con datos reales habrá **más comprobaciones «sin datos»** que antes (los supuestos ya no las rellenan). No se ha podido medir con datos reales (sin accesos).

## Pruebas (`tests/ronda14/unit-carga.mjs`, 11)
Sobre SQLite real con datos previos (una empresa `sec` antigua, una `prueba`): carga **vacía** (nada cambia; lote `vacia`; el origen sigue siendo el de cada fila), **todas fallidas o sin años**, **parcial** (la fallida conserva fuente y fecha), **correcta y repetida** (idempotente), sin filas, filas antiguas sin fuente, y las reglas de ausencia/cero. La migración 0009 se prueba sobre una base antigua con filas (`unit-migracion`, M1c y M7).

## Mientras falte la validación real
Los datos de **prueba** (semilla) se rotulan «PRUEBA ficticios» y los de la **demo**, «DEMOSTRACIÓN inventados». Solo `scripts/fetch_fundamentals.mjs` puede escribir `fuente = 'sec'`, y esa afirmación significa «la carga la escribió», **no** «las cifras están verificadas» (EBITDA y ROIC siguen siendo aproximaciones). **Pendiente (requiere accesos):** ejecutar la carga real, comprobar que `nightly.yml` funciona y contrastar una muestra con los informes 10-K.
