# Auditoría de datos (ronda 13): qué es ficticio, qué es real y de dónde viene

| Dato | Origen | ¿Real? | Cómo se muestra |
|---|---|---|---|
| Empresas y fundamentales de la **semilla de prueba** (`data/seed-prueba.sql`, `tests/ronda5/seed.py`) | Generados con semilla fija | **No: inventados** | Fila `datos_meta.origen = 'prueba'` → aviso «Datos de PRUEBA ficticios…» en Explorar y en cada ficha |
| Datos de la **demo** (`scripts/demo/mock.js`) | Generados en el navegador | **No: inventados** | `origen = 'demo'` → «Datos de DEMOSTRACIÓN inventados…» |
| Datos **reales** | `scripts/fetch_fundamentals.mjs` (SEC EDGAR, 10-K) | Previstos, **no comprobados** en este entorno (sin accesos) | Solo si el cargador escribe `origen = 'sec'` (+ `actualizado_en`): «Fuente: SEC EDGAR… actualizados el …». Sin fecha, dice que no está disponible |
| Sin fila `datos_meta` | desconocido | — | «Origen de los datos sin verificar: no se atribuye a ninguna fuente» |
| Carteras públicas de ejemplo (`data/demo.sql`) | Escritas a mano | Ejemplos educativos, no rendimientos | Etiquetadas «ejemplo» |
| Precios y gráficos | TradingView (widgets, con consentimiento) | Reales, de terceros | No se almacenan |

**Antes de esta ronda** la interfaz afirmaba «Cinco comprobaciones con cifras de la SEC», «Fuente: informes anuales (10-K) … SEC (EDGAR)», «Se cargan desde la SEC cada noche» y `legal.html` decía que los datos «proceden de la SEC», aunque en local y en la demo eran inventados y la carga nocturna **no se ha ejecutado nunca** (requiere secretos de GitHub y Cloudflare; `nightly.yml` existe, no está probado). **Ahora** esas frases se han retirado o hecho condicionales: la interfaz solo habla de la SEC cuando el origen declarado es `sec`; no promete actualizaciones nocturnas.
**Quién puede declarar `origen = 'sec'`:** solo el cargador real (`fetch_fundamentals.mjs` añade las dos filas al final de su SQL). Es una declaración del proceso de carga, **no una verificación independiente** de la calidad de las cifras (EBITDA y ROIC siguen siendo cálculos aproximados).
**La ausencia de datos limita el análisis, no se rellena:** un activo sin categoría aparece como «Sin categoría conocida»; una comprobación sin datos no suma ni resta; un dato ausente en la ficha se muestra «No disponible».
**Pendiente (requiere accesos):** ejecutar la carga real, comprobar que el flujo nocturno funciona y registrar fecha de última carga correcta (`ronda10/BLOQUEOS.md`).
