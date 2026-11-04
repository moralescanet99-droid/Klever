# Cómo abrir y probar la ronda 14 desde el móvil (para Javier)

**Lo que se puede abrir en el móvil es la DEMO**: la misma interfaz que la versión completa, con un servidor simulado dentro de la página. Todo se pierde al recargar y el «correo» de acceso se simula con un botón. **No es la app remota validada**: la versión completa (servidor + base de datos) solo se ha ejecutado en un ordenador, en local.

## Opción A · Enlace del artefacto (lo más rápido)
`https://claude.ai/artifact/6MEdsYjnZaUPwXtUxriEiD` — el artefacto es **privado**: solo lo abre quien tenga acceso. Para que Javier lo abra, quien lo publicó debe darle acceso desde el menú «Compartir» del artefacto. Abre el enlace en el móvil y navega por el menú.

## Opción B · El archivo `demo/index.html` (autónomo)
Un solo archivo HTML. Se puede (1) enviar al móvil y abrirlo con el navegador (algunos móviles no abren HTML locales: entonces, la opción siguiente), o (2) subir a cualquier alojamiento estático (por ejemplo Cloudflare Pages: «subir carpeta» con `demo/`). No necesita base de datos ni correo ni claves.

## Opción C · La versión completa en un ordenador
Requiere Node ≥ 22.13: `git clone … && cd Klever && npm ci && npx playwright install chromium && bash scripts/local/arrancar.sh` → `http://localhost:8788` (el acceso por correo aparece como enlace en pantalla; no se envía ningún correo). Para verla desde el móvil en la misma red habría que exponer ese puerto: no está preparado ni probado.

## Qué probar (guion de 5 minutos, en el móvil)
1. **Primera visita sin cuenta.** Portada → «Lee una historia de ejemplo» → lee la historia (es un **caso ficticio**: se dice en el título) → «Leer la opinión de El Superespeculador» → mira la revisión (desenlace simulado) → vuelve a la opinión original (sigue ahí) → **«Probar en mi cartera»**: te ofrece una cartera de ejemplo (KO 60 % · PG 40 %). Pon un 10 % de HNORT y elige «Reducir proporcionalmente»: debe salir **KO 54 % · PG 36 % · HNORT 10 %**, y lo primero que se explica es de dónde sale el peso (KO cede 6 puntos, PG cede 4). La simulación es temporal.
2. **Regreso con cuenta.** «Entrar» → «Simular enlace del email» → repite «Probar en mi cartera» desde la historia → «Crear la cartera de ejemplo en mi cuenta» → guarda el escenario (la pregunta «¿Se han firmado los dos contratos anunciados?» viene precargada; pon una fecha de revisión y una nota) → «Mi seguimiento»: ahí están tu pregunta, la fecha, la base original y los enlaces a la historia y a la revisión editorial.
3. Prueba «Editar nota y pregunta», «Marcar como descartado» (se conserva) y «Eliminar definitivamente» (se borra).
4. Prueba el radar: «Explorar empresas» → una ficha → «Guardar en mi radar» → «Añadir nota». Comprueba que el aviso de origen dice **datos de demostración inventados**.
5. Gira el móvil, amplía el texto del sistema y mira que nada se corte.

**Límites de la demo:** sin persistencia (recargar la borra todo), correo simulado, sin TradingView (recuadro explicativo), datos inventados (incluida «Hidrógeno Norte (empresa ficticia)»).
