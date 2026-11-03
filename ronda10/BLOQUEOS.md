# Lo imprescindible para continuar con la validación real (un único bloque)

## Qué se ha comprobado en el entorno de trabajo (2026-11-03)
| Comprobación | Resultado |
|---|---|
| `wrangler whoami` | **No autenticado** («You are not authenticated») |
| Variables de entorno `CLOUDFLARE_*`, `BREVO_*`, `MAIL_FROM`, `SEC_USER_AGENT`, `CF_*` | **Ninguna definida** |
| `.dev.vars` | No existe (correcto: no se guardan secretos) |
| Salida de red a `api.cloudflare.com` y `api.brevo.com` | **Alcanzables** (responden 400 y 401 sin credenciales); solo faltan credenciales |

Por tanto **no se ha ejecutado nada contra Cloudflare ni Brevo** y no se ha enviado ningún correo. Todo lo que figura como «remoto» en los informes está **bloqueado**, no probado.

## Lo que hay que aportar (y nada más)
Todo con cuentas **gratuitas**, datos **ficticios** y recursos **desechables**; nada de producción.

1. **Token de API de Cloudflare** (variable `CLOUDFLARE_API_TOKEN`) y **`CLOUDFLARE_ACCOUNT_ID`**, con permisos *solo* para: D1 (editar) y Cloudflare Pages (editar) en esa cuenta. Se usará para crear **una D1 `klever-prueba` y un proyecto de Pages `klever-prueba`** (y borrarlos al terminar). Si prefieres no dar un token, ejecuta tú la sección A de `GUION-VALIDACION-REMOTA.md` y pásame la dirección del proyecto de prueba.
2. **Brevo gratuito**: `BREVO_API_KEY` y un remitente **ya verificado** (`MAIL_FROM`). Se guardan como secretos del proyecto de prueba (`wrangler pages secret put`), nunca en el repositorio.
3. **Un buzón de pruebas que pueda leer** (`TEST_EMAIL`): o bien me pasas el enlace que llega a ese buzón cuando te lo pida el script (`tests/ronda10/validar-acceso-real.mjs`), o bien acceso de solo lectura a ese buzón. Con uno basta; el script necesita 3 enlaces (la comprobación de caducidad, un cuarto, y 16 min de espera).
4. **Autorización expresa** de que se despliegue el proyecto de prueba y se creen/borren esos recursos. Sin tocar el proyecto ni la base de producción, si existen.

## Qué se ejecutaría en cuanto existan
`ronda10/GUION-VALIDACION-REMOTA.md`: secciones A (recursos de prueba), B (`verificar-api.mjs`, 8 comprobaciones), C (migración 0007 sobre una base antigua con datos), D (`validar-acceso-real.mjs`: correo real, un solo uso, persistencia al recargar y tras cerrar sesión, dos sesiones independientes, fallo y recuperación, público/privado, caducidad con `CADUCIDAD=1`) y E (limpieza).

## Qué NO se podrá probar ni siquiera con esos accesos
Safari, dispositivos físicos, lectores de pantalla, zoom real del navegador y teclado móvil real: requieren a una persona con esos dispositivos (`ronda10/pruebas-manuales.md`).
