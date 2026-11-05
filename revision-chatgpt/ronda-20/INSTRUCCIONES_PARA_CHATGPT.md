# Ronda 20 · cierre técnico y visual: causas coexistentes, código de salida de las pruebas y Revisión de escritorio (para pegar en ChatGPT)

Sube el zip del proyecto `klever-ronda20-chatgpt.zip` (este texto está dentro, en `revision-chatgpt/ronda-20/`) y las **9 imágenes** de `imagenes-ronda20-chatgpt.zip` a **la misma conversación** (00 = maqueta aprobada; 01 Distribución de escritorio; 02–04 Revisión de escritorio con nota, con cambios sin guardar y sin nota; 05–08 Revisión móvil a 390 y 320 px con nota y sin nota). Todas son **capturas de viewport**, tomadas tras estabilizarse el desplazamiento, sin preparar nada a mano.

---

Actúa como revisor senior de producto, UI/UX para finanzas personales y calidad de software. Ya revisaste las rondas 1–19 de **Klever** (beta gratuita de carteras simuladas; Cloudflare Pages Functions + D1; JavaScript y CSS sin dependencias). Tu revisión de la ronda 19 aceptó el arreglo de redondeo y **rechazó el cierre** técnico y visual por I1 (causas mezcladas), I2 (código de salida 0 tras un fallo), I3 (Revisión de escritorio sin contexto), M1 (aviso ámbar dominante) y M2 (pruebas que prueban menos de lo que dicen), y pidió una ronda 20 limitada a tres bloques. Esta ronda **no añade funcionalidades, no cambia la metodología numérica ni la identidad visual**; los datos siguen siendo inventados.

## Qué se afirma
1. **I1 · causas** (`public/js/nota.js`, `public/js/nota-ui.js`): cada posición sin evaluar lleva `causas: [{codigo, bloque, indicador, texto}]` con `metodo_no_aplicable`, `dato_ausente`, `dato_invalido` y `comparables_insuficientes`, **asignados en el origen** (sin deducirlos del texto) y coexistentes. La explicación nombra primero las familias que, resueltas solas, arreglarían un indicador (si ninguna basta, todas las que le afectan) y deja el resto para «Además»; cada porcentaje es de su familia y no se suman. `unit-causas20` (10): los tres casos exactos de tu tabla, el caso conjunto ETF + banco + dato, la plantilla, solo ETF, una cartera con nota y una espera real. **Cambia una afirmación de la ronda 19:** en la plantilla mixta JNJ y XOM no tienen «datos ausentes» sino comparables insuficientes en su sector.
2. **M1 · aviso:** «Nota pendiente» solo para una espera real; «Evaluación parcial» (hay bloques evaluados) o «Sin nota global»; el aviso es texto normal con un filete, no un bloque ámbar. Se elimina la frase «el detalle explica/dice…».
3. **I2 · código de salida** (`tests/ronda5/h.cjs`, `tests/run-all.sh`): aserción fallida → 1; código previo distinto de cero se conserva; navegadores abiertos se cierran en `finally` con plazo; cierre anómalo o forzado → **código 3** con `CIERRE ANÓMALO`/`CIERRE FORZADO`. `unit-cierre20` (10) lo verifica en **subprocesos reales** y comprueba que `run-all.sh` rechaza cada caso. `run-all.sh` conserva el log íntegro de `demotest`.
4. **M2 · pruebas:** `testF` solo acepta `beforeunload`, registra el resto como inesperado y **exige** que el aviso aparezca; `testR` falla si el desplazamiento no se estabiliza, usa Tab real desde el nombre y acota los diálogos. Redondeo: se retira «no hace falta tolerar empates binarios» (las 4.800 salidas se aceptan; ninguna cae en la franja de la frontera).
5. **I3 · Revisión de escritorio** (imágenes 02–04): la página ya no salta a la nota; se ven nombre, pasos, «Volver a la distribución», resultado y acción de guardado o «Guardada»; con cambios sin guardar, «Guardar cartera» activo. En móvil (05–08) el resultado breve y «Volver» siguen libres de la barra. `testR` (16).
6. **Un fallo REAL de la aplicación hallado al repetir** (no estaba en tu encargo): pulsar «Revisar» a menos de 300 ms de editar un peso dejaba la página desplazada ≈ 520 px; el `scrollBy` diferido del centrado del campo (`app.js`, `focusin`) llegaba tras el cambio de paso. Corregido (se cancela si el campo ya no tiene el foco) con regresión determinista (`testR` R4-1440: falla sin la corrección, scrollY 516 ×6; pasa con ella). Mi primera hipótesis (que fuera la prueba) era incorrecta.
7. **Guion de personas** (`ronda20/PRUEBA-CON-USUARIOS.md`) y **M86** ajustados según tu revisión; **no se ha probado con personas.**

## Resultado e incidencias
8. `bash tests/run-all.sh` completo sobre el commit `9c1eda3` con el árbol limpio: **827 comprobaciones correctas, 0 fallos, código 0** (41 baterías + demo), **locales del autor**, sin `CIERRE FORZADO` ni `ANÓMALO`. Repeticiones de `testE`, `testF` y `testC` con latencia 0 y 300 ms: **12/12**. *Aserciones ≠ entradas.* Entornos: módulo/servidor sobre SQLite real, subprocesos de Node y Chromium con servidor local; **remoto: nada**.
9. **Intentos fallidos conservados con su log íntegro** (`ronda20/logs-pasada1/`, `logs-pasada2-fallo-Q3/`, `logs-pasada3-fallo-E5/`, `resultado-pasada*.txt`): pasada 2 (825, fallo `testQ` Q3-1440 = el fallo real del punto 6); pasada 3 (826, fallo `testD` E5 = carrera de la **prueba**, demostrada con las cajas medidas: el mismo desplazamiento diferido en curso; ahora espera 700 ms, 12/12 después). Mis errores: un primer `unit-cierre20` lanzó por accidente las baterías reales (variable de entorno vacía recupera su valor por defecto) y se corrigió; un falso fallo de `testR` por comparar «50» con «50,0».
10. **`testK` (goto abortado) y `testO` (sin salir del proceso) NO se reprodujeron** en esta ronda; su causa sigue sin demostrar y el cierre forzado no es una explicación.

## Limitaciones y lo que NO se afirma
- **Prueba con cinco principiantes: NO realizada.** **No probado:** móvil físico, lector de pantalla, texto al 200 % real, Safari/Firefox, D1 remota, correo real, datos reales. **Remoto: nada.**
- No hay medición «antes» de la geometría de escritorio con el criterio nuevo.
- La inspección visual de las capturas es mía; no sustituye a pruebas de interacción ni de accesibilidad real.
- El mismo desplazamiento diferido de 300 ms puede afectar a otras pruebas que midan cajas justo después de editar un peso; se corrigió donde falló.
- **Datos inventados**; la nota solo existe con el conjunto sintético; nada es una recomendación ni una previsión.

## Casos que te pido repetir (tú, no yo)
Sin navegador (Node ≥ 22.13, tras `npm ci`): `node tests/ronda20/unit-causas20.mjs`, `node tests/ronda20/unit-cierre20.mjs` (lanza subprocesos y un `run-all.sh` mínimo; necesita Playwright para un caso), `node tests/ronda19/unit-revision19.mjs`, `node tests/ronda19/unit-redondeo19.mjs`, `node tests/ronda15/unit-nota.mjs`. Ejemplo literal de I2: `node -e "const h=require('./tests/ronda5/h.cjs'); h.ok('fallo intencionado',false); h.fin();"; echo $?` (debe imprimir 1). Antes/después: **este ZIP no lleva historial Git**; `tests/ronda20/antes-despues-r20.mjs <raíz>` necesita un árbol de la ronda 19 (commit `9a1e272`); su salida literal está en `ronda20/antes-despues-resultado.txt`. Con navegador: `npx playwright install chromium`, `bash scripts/local/servidor.sh start` y `RONDA=ronda20 node tests/ronda19/testR.cjs`.

## Qué quiero que evalúes
### Reparación técnica (aceptar o rechazar su CIERRE)
1. **I1:** ¿las causas coexistentes y la selección de familias relevantes son correctas? Busca combinaciones que aún mientan u omitan (varias carencias en una posición, ETF pequeño + banco + comparables, datos inválidos frente a ausentes, indicadores distintos que fallan por familias distintas). ¿El peso se cuenta una vez por familia?
2. **I2:** ¿`h.cjs` y `run-all.sh` garantizan que fallo o cierre anómalo nunca terminen con éxito? ¿Algún camino (batería que no usa `h.cjs`, `registro` de las pruebas de módulo, un `process.exit` previo) escapa?
3. **M2 y registros:** ¿`testF` F9, `testR` R0e/R0t/R0d y `testD` E5 son ahora honestos? ¿La corrección de E5 (más espera) rebaja algo? ¿Los logs de las 41 baterías, `demotest` y los intentos fallidos bastan?
4. **El fallo real del punto 6:** ¿la corrección y su regresión son suficientes? ¿Quedan otros desplazamientos diferidos que puedan actuar tras un cambio de paso?
### Aplicación visual (aceptar o rechazar su CIERRE)
5. **Revisión de escritorio** (02–04 frente a 00 y 01): ¿se ven contexto, resultado, «Volver» y guardado? ¿El orden del resultado a la derecha y las posiciones a la izquierda se entiende?
6. **Aviso sin nota** (03 y 07–08): ¿ha dejado de dominar? ¿Los encabezados «Evaluación parcial» / «Sin nota global» son claros?
7. **Móvil** (05–08): resultado breve y «Volver» libres de la barra.
8. **Honestidad del informe** (`ronda20/LEEME.md`, `ANTES-Y-DESPUES.md`) y del guion de personas.
9. Lo que debería probar yo a mano (`ronda20/pruebas-manuales.md`, M85–M93).

## Formato de respuesta
- **Veredicto de 3 líneas** y **dos decisiones separadas: aceptar/rechazar el cierre técnico y aceptar/rechazar el cierre visual**, con notas del 1 al 10 en confianza/privacidad, procedencia de datos, claridad del recorrido en móvil, honestidad del contenido, solidez técnica y calidad de las pruebas, **comparadas con las de tu revisión de la ronda 19 (7/8/8/7/7,5/7)**.
- **Qué casos has repetido y con qué resultado**, y cuáles no.
- **Problemas por gravedad** (crítico / importante / menor): qué ocurre (imagen o archivo y línea), por qué y arreglo concreto.
- Si el ciclo técnico y visual queda cerrado, dilo y propón el **protocolo mínimo de la prueba con personas**; si no, **solo** los puntos que impiden el cierre (sin abrir otra ronda de retoques menores).
- Lista final de **lo que no has podido comprobar**.

*Fuera de alcance:* Revolut/Trade Republic, pagos, suscripciones, artículos o consejos diarios personalizados, datos de mercado reales, recomendaciones de compra/venta, despliegue público; no enviar comunicaciones ni publicar.
