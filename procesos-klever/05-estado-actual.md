# 05 · Estado actual

**Última actualización:** 2026-11-03, tras la ronda 5 (informe `ronda5/LEEME.md`).
Leyenda: ✅ implementado y probado · 🟡 implementado, comprobado solo de forma aproximada · ⬜ pendiente · ⛔ no probado.

## Resumen en cinco líneas
1. La web está **completa para la beta en código** (portada, editor, empresas, carteras públicas, ficha, acceso por enlace, métricas), pero **todavía no está desplegada**: faltan las cuentas del usuario (Cloudflare, Brevo, secretos de GitHub).
2. Todo se ha probado **en local** con D1 simulada, datos inventados y un navegador automático (**161 comprobaciones** en la ejecución final de la ronda 5). No se ha probado con servicios reales.
3. Hay una **demo autónoma** (`demo/index.html`) lista para publicar en Cloudflare Pages y una privada en un artefacto.
4. La ronda 5 (cerrar los problemas de la ronda 4) está implementada y probada en local; **falta entregar su paquete a ChatGPT y recibir su feedback**.
5. Lo siguiente razonable: desplegar la demo pública, crear la cuenta de Brevo, desplegar la web real, revisar términos de TradingView y texto legal.

## Mapa del código
```
public/            index.html · app.js · style.css · legal.html       (interfaz, sin dependencias)
functions/         _lib.js (auth, hash, correo, reglas de composición)
  api/             assets · assets/[ticker] · ideas · login · verify · logout
                   portfolios/index · portfolios/[id] · public/index · public/[id]
schema.sql         esquema D1 completo (base nueva)
migrations/        0002 tesis · 0003 enlace mágico · 0004 consentimiento y acceso · 0005 aviso de borrador · 0006 fecha de última modificación
scripts/           fetch_fundamentals.mjs (SEC → SQL) · metrics.sql (decisión de la beta)
data/              universe.json (125 activos) · demo.sql (3 carteras públicas de ejemplo)
.github/workflows/ nightly.yml (carga nocturna de la SEC en D1)
demo/              index.html (demo autónoma) · LEEME.md
tests/ronda5/      baterías A–D (161 comprobaciones), ejecutor limpio, generador del informe y datos de prueba (tests/ronda4: histórico)
ronda5/ ronda4/ rediseno/  informes LEEME.md de cada ronda · ronda5/pruebas-manuales.md (pendientes reales)
revision-chatgpt/  instrucciones para cada ronda de crítica de ChatGPT
procesos-klever/   esta memoria · CLAUDE.md (raíz) apunta aquí
```

### Interfaz (vistas por hash)
`#inicio` portada · `#empresas` explorar empresas (+ screener) · `#publicas` carteras públicas · `#carteras` mis carteras (con sesión) · `#cartera` borrador · `#cartera-<id>` cartera guardada.

### API
`GET /api/assets`, `GET /api/assets/:ticker`, `GET /api/ideas`, `POST /api/login` (email, acepto, con_borrador), `POST /api/verify`, `POST /api/logout`, `GET|POST /api/portfolios`, `GET|PUT|PATCH|DELETE /api/portfolios/:id`, `GET /api/public`, `GET /api/public/:id`.

### Base de datos (D1)
`usuarios` (+`acepto_en`) · `enlaces` (+`con_borrador`) · `sesiones` (+`ultimo_acceso`) · `activos` · `fundamentales` · `portafolios` (+`tesis`, +`actualizado_en`) · `posiciones` · `ideas`. Sin tabla de precios.

## Funcionalidad
| Área | Estado |
|---|---|
| Portada: titular, acción principal, plantillas, vista previa real, muestra de carteras públicas | ✅ (sin cambios en la ronda 5) |
| «Mis carteras»: lista primero (nombre, privada/pública, posiciones, total asignado, fecha real), «Nueva cartera» a petición, creación como acción principal si no hay carteras | ✅ |
| Botones desactivados con aspecto de desactivados y motivo al lado (Guardar y Publicar) | ✅ |
| Cartera pública con edición inválida: versión publicada intacta, sin despublicar | ✅ (interfaz y servidor) |
| Copia local de cambios sin guardar de carteras de la cuenta (recuperación, conflicto, descartar) | ✅ |
| Estado en tres planos con texto explícito de persistencia | ✅ |
| Probar sin registro, borrador local, migración a la cuenta | ✅ |
| Editor: nombre y pesos editables, buscador accesible, resumen, menú de acciones con confirmación | ✅ |
| Regla única de composición (guardar/publicar), estados en tres conceptos | ✅ (también comprobado contra el servidor) |
| Móvil: cabecera 61 px, barra inferior 72 px, lista plana, orden en una columna | ✅ · teclado virtual 🟡 (emulado) |
| Explorar empresas (105), ficha con 5 comprobaciones, metodología, glosario | ✅ |
| Carteras públicas con etiquetas de origen | ✅ |
| Acceso por enlace: pedir, reenviar, cambiar email, caducidad, un solo uso, otro dispositivo | ✅ en local con el enlace devuelto en pantalla · envío real por Brevo ⛔ |
| Cookies de TradingView con consentimiento en el punto de uso | ✅ (sin consentimiento no hay peticiones) · widgets reales ⛔ |
| Métricas (`scripts/metrics.sql`): registros, carteras, usuarios que vuelven a 7 días | ✅ en local sin datos reales |
| Carga nocturna de la SEC | ✅ el script y el flujo existen · **nunca se ha ejecutado contra la SEC real** ⛔ |
| Accesibilidad: roles, foco, contraste ≥ 4,5:1 / 3:1 | ✅ con el árbol de accesibilidad · lector de pantalla real ⛔ |
| Ampliación al 200 % | 🟡 aproximada (tamaño de texto y anchuras de 320/720 px) |
| Safari, Firefox, móviles reales | ⛔ |

## Pruebas
- `tests/ronda5/`: **161 comprobaciones** en la ejecución limpia final (A: 31 validaciones, estados y resumen · B: 51 móvil, orden, empresas, ficha y portada · C: 50 recorrido, otro navegador, errores, teclado, anchuras 320–1440 en ambos temas · D: 29 escenarios con evidencia). La tabla esperado/observado/evidencia está en `ronda5/LEEME.md`. Cómo ejecutarlas: `08-entorno-y-trampas.md`.
- Mediciones (390 px): cabecera global 61 px (antes 105); barra inferior 72 px; tres plantillas 357 px (antes 649).

## Pendiente del usuario (ver `PENDIENTES.md`)
0. Publicar la demo: `wrangler pages deploy demo --project-name klever-demo`.
1. Cuenta de Brevo: remitente verificado, clave API, secretos `BREVO_API_KEY` y `MAIL_FROM`.
2. Cloudflare: `wrangler d1 create klever`, pegar el `database_id` en `wrangler.toml`, cargar `schema.sql`, secretos de GitHub (`SEC_USER_AGENT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), lanzar el flujo nocturno, cargar `data/demo.sql`, desplegar, activar Web Analytics.
3. Antes de abrir al público: leer los términos de TradingView (secciones 3 y 4) completos; abogado para `legal.html` y contacto de derechos de datos.
4. Con usuarios: ejecutar `scripts/metrics.sql`; aplicar migraciones 0002–0006 en bases antiguas; recargar `data/demo.sql` si ya estaba cargado.

## Decisiones abiertas / dudas
- **Feedback de ChatGPT sobre la ronda 5** pendiente (hay que entregarle su paquete). Para la ronda 4 se preguntó por: regla del reparto incompleto, estado en tres conceptos (ⓘ en móvil), redundancia del resumen breve y la barra, etiquetas técnicas, nombre «Carteras públicas», mensajes cortos de la barra.
- Los **umbrales de las 5 comprobaciones** son una propuesta inicial.
- Al reabrir una cartera el servidor devuelve las posiciones **ordenadas por peso**; mientras se edita mantienen el orden de inserción.
- La lista de 105 empresas es una página larga (sin paginación, a petición expresa).
- Los cambios sin guardar de una cartera de la cuenta **sí sobreviven a recargar** (copia local, ronda 5); si la cartera cambió desde otro dispositivo se pregunta qué conservar (probado con la lógica; el caso con dos dispositivos reales está en las pruebas manuales). El aviso del navegador al salir está implementado y no probado.
- ChatGPT quizá no pueda **interactuar** con la demo aunque sea pública; las capturas siguen siendo la vía segura.

## Siguientes pasos sugeridos
1. Preparar el paquete de la ronda 5 para ChatGPT, pegar su feedback y revisarlo contra el código antes de tocar nada.
2. Publicar la demo en Cloudflare Pages y comprobar que carga.
3. Crear la cuenta de Brevo y desplegar la web real; probar el acceso por email real (spam en Gmail, otro proveedor).
4. Ejecutar la carga nocturna con la SEC real y revisar qué empresas no devuelven datos.
5. Leer términos de TradingView y revisar el texto legal con un abogado.
6. Ejecutar las pruebas manuales pendientes de `ronda5/pruebas-manuales.md` (teclado móvil real, lector de pantalla real, zoom real, Safari/Firefox, email real).
