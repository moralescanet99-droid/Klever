# Cálculos de la ronda 13: qué hacen, cómo y qué NO hacen

Código único: `public/js/calculos.js` (puro, sin DOM ni red). Lo usan la interfaz, **el servidor** (recalcula y rechaza escenarios cuya propuesta no coincida) y las pruebas (`tests/ronda13/unit-calculos.mjs`). Todo se calcula en **décimas de punto porcentual (enteros)**: 54,0 % = 540. Así el redondeo es exacto y determinista y los totales siempre cuadran.

## Radiografía (`radiografia`)
Entrada: una composición (la **guardada** o la de **cambios locales**: la interfaz dice cuál), los activos y un límite personal opcional.
| Salida | Cómo se calcula |
|---|---|
| Mayor posición | el mayor peso; empate → orden alfabético del símbolo |
| Tres mayores | suma de los tres mayores pesos; con menos de tres se indica «solo hay N» |
| Estado | vacía · incompleta (< 100 %) · completa (= 100 %) · exceso (> 100 %) |
| Pendiente / exceso | `100 − total` o `total − 100`; **no se normaliza** una cartera incompleta |
| Categorías | suma de pesos por la categoría del universo (sector de una empresa, tipo de fondo de un ETF). Es una categoría **comercial**; para un fondo no es su exposición sectorial real |
| Límite personal | posiciones con `peso > límite`; se muestra el hecho («esta posición supera el límite del 20 % que has definido»). Klever no propone ningún umbral |
| Cobertura | posiciones sin categoría conocida y fondos (cuya categoría es solo comercial) |
**No hace:** medir riesgo (la concentración no es riesgo), puntuar «salud» o «diversificación», deducir países o divisas del mercado de cotización, calcular solapamientos entre fondos (no hay composiciones verificadas y fechadas), rellenar o reescalar una cartera incompleta.

## Simulación (`simular`)
Operación: poner el activo `T` en `peso_nuevo` % (añadirlo o cambiar su peso). `delta = peso_nuevo − peso_actual` (décimas).
**Método 1 · usar el porcentaje sin asignar.** Viable si `delta ≤ 100 % − total`. Las demás posiciones no cambian.
**Método 2 · reducir proporcionalmente las otras.** Si `delta > 0`, las otras deben bajar en total `delta`: sea `S` lo que suman y `O = S − delta` lo que deben sumar; cada una pasa a `peso · O / S`. **Redondeo** a una décima por el método del **mayor resto**: se toma el suelo de cada resultado y las décimas que faltan hasta `O` se reparten a quienes tienen mayor resto; a igualdad, por orden de símbolo. Si `delta ≤ 0`, lo liberado queda **sin asignar** (no se reparte al alza).
**Inviable (con motivo escrito):** peso fuera de 0,1–100 %; base con exceso; sin asignar insuficiente; las otras no bastan (`delta > S`); alguna otra quedaría por debajo de 0,1 %; el peso propuesto es el que ya tiene. Nunca hay pesos negativos ni ajustes ocultos.
**Ejemplo verificable** (prueba C1 y K9): A 60 / B 40 + C 10 reduciendo proporcionalmente → `S = 100, O = 90`, factor `90/100 = 0,9` → **A 54 · B 36 · C 10**, total 100 %.
**Cartera incompleta** (prueba C2): A 50 / B 30 (80 %) + C 10 proporcional → las otras pasan de 80 a 70: A 43,8 · B 26,2 · C 10 → total 80 %, **sigue incompleta**.
**Propiedad comprobada en 2000 casos al azar** (C7): si es viable, el total cuadra, no supera 100 %, ningún peso es menor de 0,1 %, el activo queda en su peso y el resultado es idéntico en dos ejecuciones.

## Comparación (`comparar`) y escenarios guardados
Compara pesos, mayor posición, tres mayores, categorías, límites (nuevos, resueltos, que siguen) y porcentaje sin asignar. Un escenario guardado **no se recalcula nunca**: conserva copia de la base (con la revisión de la cartera), la propuesta y el método; si la cartera cambia después, se avisa de la versión posterior y se muestra todo tal como se guardó. El servidor usa la composición **guardada** (no cambios locales) como base y exige que la revisión coincida con la que vio la persona.

## Límites de esta primera versión
Porcentajes, no patrimonio: no hay precios, rentabilidades esperadas, costes, impuestos ni operaciones. Guardar un escenario no ejecuta nada, no cambia la cartera ni actualiza su publicación.
