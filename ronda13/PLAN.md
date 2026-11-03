# Plan de la ronda 13 (escrito antes de implementar)

## Reutilizable
`validarComposicion` (servidor), `r1`/`pesoCorto`/`nf`/`esc`/`api`/`store`/`toast` (app.js), `by` (mapa de activos), `calcResumen` (categorías y ROIC), `<dialog>` de la ficha, lista de carteras con posiciones (ronda 12), revisión por escritura, adaptador D1/SQLite de pruebas.

## Contratos de datos (migración aditiva 0008 y `schema.sql`)
- `radar(usuario_id, ticker, nota ≤ 500, creado_en, actualizado_en)`, PK `(usuario_id, ticker)`, FK a usuarios y activos → imposible duplicar.
- `escenarios(id, usuario_id, nombre ≤ 80, nota ≤ 600, estado CHECK en_estudio|descartado|archivado, metodo CHECK sin_asignar|proporcional, cartera_id, cartera_nombre, base_revision, ticker, peso_objetivo, base_json, propuesta_json, creado_en, actualizado_en)`. La base y la propuesta son **copias**: no se recalculan nunca. `cartera_id` sin FK de borrado (si se borra la cartera, el escenario sobrevive y avisa).
- `portafolios.limite_peso REAL NULL CHECK (limite_peso > 0 AND limite_peso <= 100)`: preferencia personal; endpoint propio, **sin** subir la revisión (no es composición, no entra en conflictos ni toca lo público).
- `datos_meta(clave PK, valor)`: `origen` (`sec` | `prueba` | otro) y `actualizado_en`. La interfaz solo habla de la SEC si `origen = sec`.
## API (todas con `auth` y comprobación de propiedad en la consulta: `WHERE usuario_id = ?`)
`GET /api/radar` · `PUT|DELETE /api/radar/:ticker` · `GET|POST /api/escenarios` · `GET|PATCH|DELETE /api/escenarios/:id` · `PUT /api/portfolios/:id/limite` · `GET /api/datos`.
El servidor **recalcula** la propuesta con el mismo módulo que el cliente y rechaza (400) un escenario cuya propuesta no coincide: no se puede guardar una cifra distinta de la que sale del método.
## Cálculos (`public/js/calculos.js`, puro, compartido por cliente, servidor y pruebas)
Todo en **décimas de punto** (enteros) para que el redondeo sea exacto y determinista.
- `radiografia(pos, activos, limite)`: total, estado (vacía/incompleta/completa/exceso), pendiente, exceso, mayor, tres mayores (o las que haya), categorías (sector o tipo de fondo, rotuladas «categoría comercial»), límites superados, cobertura (posiciones sin categoría conocida; ETF listados aparte).
- `simular(base, {ticker, peso}, financiacion)`: `delta = nuevo − actual`. **sin_asignar**: viable si `delta ≤ pendiente`; el resto no cambia. **proporcional**: las demás bajan en total `delta` (si `delta ≤ 0`, lo liberado queda sin asignar: no se reparte al alza); reparto por **mayor resto** en décimas, desempate por símbolo; inviable si `delta > suma de las demás`, si una posición quedaría < 0,1 % o si la base excede 100 %. No se normaliza una cartera incompleta (A 60/B 40 + C 10 → 54/36/10; con base 80 % queda 80 %).
- `comparar(antes, despues, activos, limite)`: radiografías y diferencias.
## Módulos
`public/js/calculos.js` (cálculo) · `public/js/almacen.js` (radar/escenarios: cuenta por API, visitante en `localStorage`) · `public/js/lab.js` (presentación del radar, laboratorio y seguimiento; recibe las utilidades de `app.js` por un contexto) · `public/style-r13.css` (estilos nuevos, **sin pisar** reglas antiguas). `app.js` solo se toca para enrutar, el panel de radiografía del editor, los filtros de Explorar y la ficha.
## Visitantes
Radar en `localStorage` marcado «solo en este dispositivo» y migrado al iniciar sesión (PUT idempotente). Simulación temporal con etiqueta; guardar un escenario exige cuenta (no se afirma guardado).
## Orden de trabajo
1 migración+API+cálculo y sus pruebas de unidad → 2 cliente (radiografía → radar/ficha → laboratorio → seguimiento) → 3 datos ficticios vs reales → 4 demo → 5 pruebas de navegador del recorrido y capturas → 6 batería completa, informe, memoria, paquete.
