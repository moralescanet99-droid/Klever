# Klever · instrucciones para Claude

**Antes de hacer nada, lee `procesos-klever/README.md`, `procesos-klever/05-estado-actual.md` y `procesos-klever/08-entorno-y-trampas.md`.** Ahí está el contexto del proyecto, las decisiones, el estado y los errores que ya cometimos.

## Reglas permanentes
- Idioma: **español de España** en interfaz, documentación y respuestas.
- Distinguir siempre **implementado / probado / pendiente**; no afirmar lo que no se ha comprobado.
- Restricciones del producto: coste 0 €, sin dinero real, sin recomendaciones, precios solo con widgets de TradingView intactos, cookies de TradingView con consentimiento donde se usan, sin dependencias de pago ni fuentes externas, sin testimonios ni rentabilidades inventadas.
- Trabajar en la rama designada; **no crear pull requests** salvo petición expresa; commits con los pies de firma que indique el sistema.
- Antes de commitear: `git diff wrangler.toml` vacío (el `database_id` debe seguir siendo el marcador) y sin `.dev.vars`.
- No guardar claves, tokens ni correos personales.

## Mantener la memoria del proyecto (obligatorio al terminar cada tarea)
1. Añadir una fila al final de `procesos-klever/09-registro-de-cambios.md`.
2. Actualizar `procesos-klever/05-estado-actual.md`.
3. Decisión nueva → `03-decisiones.md` (con su motivo). Encargo o feedback nuevo → `06-` o `07-` (literal si es largo). Trampa nueva → `08-`.
4. Commit y push de la carpeta junto con el cambio.
