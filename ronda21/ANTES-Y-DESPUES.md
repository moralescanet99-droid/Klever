# Ronda 21 · antes y después (corto)

«Antes» = ronda 20; «después» = ronda 21. Evidencias en `ronda21/capturas/` (viewport, sin desplazamiento manual) y en `ronda21/logs/`.

| Momento | Antes (R20) | Después (R21) |
|---|---|---|
| **Portada** | «Crea, entiende y sigue tu portafolio»; una acción y una lista de plantillas | Promesa «Construye tu cartera, entiende sus puntos débiles y prueba cambios antes de decidir», «sin dinero real» y «datos de prueba» visibles, y **tres entradas** (desde cero, ejemplo, recrear la mía) al mismo editor. Capturas `S1-portada-*` |
| **Origen de la cartera** | Plantilla; un «ejemplo» y una cartera propia no se distinguían | `origen` guardado (vacia / ejemplo / manual); la copia de ejemplo se rotula «Ejemplo simulado»; «Recrear mi cartera» dice que no hay conexión con bróker y no sustituye activos. Capturas `S2-*`, `S10-*` |
| **Revisión** | Resultado y nota; sin nota, el aviso explicaba causas | Empieza por **«Tu cartera de un vistazo»**; la nota es un indicador dentro del análisis; **«Probar un cambio»** como siguiente paso. Capturas `S4-*`, `S10-ejemplo-sin-nota-*` |
| **Comparación** | Columnas «Antes»/«Después» | **«Cartera base»** / **«Alternativa simulada»**, quién cede el peso, frase que no dice que sea mejor, «tu cartera base no cambia». Capturas `S5-*` |
| **Guardado** | «Guardar escenario» con pregunta, nota y fecha | **«Guardar en mi Cuaderno»**: qué quiero averiguar, por qué lo estudio, **qué me haría cambiar de opinión (nuevo)** y cuándo revisarlo; la cartera base conserva posiciones y revisión (`S6`) |
| **Cuaderno** | Lista «En estudio» por fecha | Grupos **«Para revisar»**, «Próximas revisiones» y «Sin fecha»; **«Registrar revisión»** con historial que se **suma** (no sustituye la hipótesis). Capturas `S7-*`, `S8-*` |
| **Portada de quien vuelve** | Igual que la de un nuevo | Aviso «Tienes N ideas para revisar» solo si se puede leer |
| **Revista** | «Probar en mi cartera»; sin «qué no sabemos» | «Explorar esta idea en una simulación», «Qué no sabemos», fecha prevista de revisión y «Volver a la lectura» |
| **Código de salida de módulos** | `registro()` → `process.exit(0)` (error previo 2 → 0) | Se conserva el código previo; 3 con `CIERRE FORZADO` (`unit-registro21`) |

**Una regresión real que el cambio introdujo y la pasada completa detectó:** la columna `origen` hacía que el `ORDER BY` de las carteras públicas ordenara por la columna y no por el alias → los ejemplos de Klever dejaban de ir primero. Corregido y con prueba que falla sin la corrección (`unit-cuaderno21` K20).
