# Cómo publicar Klever (beta privada) · guía paso a paso

Para Javier. No hace falta saber programar: son copiar y pegar órdenes y pulsar botones. Tiempo: unos 30 minutos la primera vez.
Coste: **0 €** (plan gratuito de Cloudflare; Brevo también gratis, hasta 300 correos al día).

> **Atajo:** si prefieres no hacerlo tú, ve al final (**«Alternativa: que Claude lo publique»**). Solo necesitas crear la cuenta de Cloudflare (paso 1) y darle a Claude una clave.

---

## Qué vas a montar
- **Cloudflare Pages:** sirve la app en una dirección gratuita tipo `https://klever.pages.dev`.
- **Cloudflare D1:** la base de datos (cuentas, carteras, ligas, invitaciones).
- **Brevo** (opcional al principio): envía los correos con el enlace para entrar. **Mientras no lo actives, la app funciona en «modo pruebas»:** el enlace sale en pantalla, y solo a cuentas invitadas o que ya existen.

---

## 0 · Prepara tu ordenador (una vez)
1. Instala **Node.js 22** desde https://nodejs.org (botón verde «LTS»). Siguiente, siguiente, finalizar.
2. Descarga el repositorio de Klever (en GitHub: botón verde **«Code» → «Download ZIP»**) y descomprímelo.
3. Abre una terminal **dentro de la carpeta `app`**:
   - Windows: abre la carpeta `app`, escribe `cmd` en la barra de direcciones y pulsa Intro.
   - Mac: clic derecho sobre la carpeta `app` → «Nueva terminal en la carpeta».
4. Escribe y pulsa Intro:
   ```
   npm ci
   ```
   *Verás* una lista de paquetes descargándose y al final algo como «added 200 packages». Los avisos amarillos («warn») no importan.

## 1 · Crea la cuenta de Cloudflare
1. Ve a https://dash.cloudflare.com/sign-up, pon tu correo y una contraseña.
2. Confirma el correo que te envían.
3. *Verás* el panel de Cloudflare («Account Home»). No hace falta añadir ningún dominio ni tarjeta.

## 2 · Conecta la terminal con tu cuenta
```
npx wrangler login
```
*Se abre* el navegador con una pantalla «Allow Wrangler to make changes to your Cloudflare account?». Pulsa **Allow**. En la terminal *verás* «Successfully logged in».

## 3 · Crea la base de datos (D1)
```
npx wrangler d1 create klever
```
*Verás* un bloque como este:
```
[[d1_databases]]
binding = "DB"
database_name = "klever"
database_id = "1a2b3c4d-....-...."
```
Copia el valor de **`database_id`** (las letras y números entre comillas).

## 4 · Ajusta `wrangler.toml`
1. Abre el archivo `app/wrangler.toml` con el Bloc de notas (o TextEdit).
2. Cambia `REEMPLAZAR_CON_ID_DE_D1` por el `database_id` que copiaste. Guarda.
   > Ese número **no es secreto**, pero por regla del proyecto **no se sube al repositorio**: déjalo solo en tu copia.
3. Crea las tablas en la base de datos:
   ```
   npx wrangler d1 execute klever --remote --file=schema.sql
   ```
   Responde **y** si pregunta. *Verás* «Executed … commands». (Se puede repetir sin peligro.)

## 5 · Crea el proyecto de Pages
```
npx wrangler pages project create klever --production-branch main
```
*Verás* «Successfully created the 'klever' project» y la dirección: `https://klever.pages.dev` (si ese nombre está cogido, usa otro, p. ej. `klever-beta`, y cámbialo también en `name = ` de `wrangler.toml`).

## 6 · Variables y secretos
El correo de la administración es **secreto**: nunca se escribe en el código.
```
npx wrangler pages secret put ADMIN_EMAIL --project-name klever
```
Te pide el valor: escribe **tu correo** (el que usarás como administrador) y pulsa Intro.

*Alternativa con ratón:* panel de Cloudflare → **Workers y Pages** → **klever** → **Configuración (Settings)** → **Variables y secretos** → **Añadir** → tipo **Secreto**, nombre `ADMIN_EMAIL`, valor tu correo → **Guardar**.

`BREVO_API_KEY` y `BREVO_SENDER` se añaden más tarde (paso 9). Sin ellas, la app está en **modo pruebas**.

## 7 · Primera publicación
```
npx vite build
npx wrangler pages deploy dist --project-name klever --branch main
```
*Verás* «✨ Deployment complete! Take a peek over at https://….klever.pages.dev». Abre **`https://klever.pages.dev`**.

**Entra tú el primero:** escribe tu correo (el de `ADMIN_EMAIL`), sin código, y pulsa «Enviarme el enlace». En modo pruebas *verás* «Tu enlace está listo» → **Entrar ahora** → elige tu apodo, marca «Tengo 18 años o más» y acepta las condiciones. Ya eres administrador: en **tu cuenta** (círculo con tus iniciales, arriba a la derecha) aparece «Panel de administración».

Para publicar cambios más adelante, repite solo el paso 7.

## 8 · Cómo invitar a gente
- **Desde el panel de administración** (`#/admin`): elige cuántos **usos** tiene el código (p. ej. 20 para una clase) y una **nota** para acordarte («Clase de Economía»). Pulsa **Copiar** y envía el enlace por WhatsApp o correo. El enlace lleva el código ya puesto: `https://klever.pages.dev/#/entrar?invitacion=ABCD2345`.
- **Cada persona** puede crear **5 invitaciones** de un uso desde su cuenta («Invita a tus amigos»).
- En el panel ves cuántas veces se ha usado cada código.

> ⚠️ **Modo pruebas = confianza.** Sin Brevo no se comprueba que el correo sea de quien lo escribe: quien conozca el correo de una cuenta podría entrar en ella. Úsalo solo con gente de confianza y **activa Brevo antes de invitar a desconocidos.**

## 9 · Activar Brevo (correos de verdad)
1. Crea una cuenta gratuita en https://www.brevo.com («Sign up free»).
2. **Remitente:** menú **Senders, Domains & Dedicated IPs → Senders → Add a sender**. Pon un nombre («Klever») y un correo tuyo. Brevo te envía un correo para confirmarlo: ábrelo y confirma. (Con dominio propio, más adelante, se verifica el dominio y llega mejor.)
3. **Clave de la API:** menú de tu perfil → **SMTP & API → API Keys → Generate a new API key**. Ponle nombre («klever») y **copia la clave** (empieza por `xkeysib-`). Solo se ve una vez.
4. Guarda los dos secretos:
   ```
   npx wrangler pages secret put BREVO_API_KEY --project-name klever
   npx wrangler pages secret put BREVO_SENDER --project-name klever
   ```
   En el primero pega la clave; en el segundo, el correo remitente que confirmaste.
5. Publica otra vez (paso 7). Ahora, al pedir el enlace, *verás* «Revisa tu correo» y llegará un correo «Tu enlace para entrar en Klever». El modo pruebas se apaga solo.

## Si algo falla
| Ves esto | Qué hacer |
|---|---|
| «Falta la base de datos (D1)» | Revisa el `database_id` del paso 4 y vuelve a publicar (paso 7). |
| «no such table» | Repite `npx wrangler d1 execute klever --remote --file=schema.sql`. |
| «Klever está en beta privada: necesitas un código» siendo tú | El correo no coincide con `ADMIN_EMAIL` (repite el paso 6, sin espacios) y vuelve a publicar. |
| «No he podido enviar el correo» | Revisa la clave de Brevo y que el remitente esté confirmado. |
| «Espera un minuto…» | Límite de seguridad: 1 enlace por minuto y 5 al día por correo. |

---

## Alternativa: que Claude lo publique
1. Haz solo el **paso 1** (cuenta de Cloudflare).
2. Crea una clave para Claude: panel → icono de perfil → **Mi perfil → Tokens de API → Crear token → Plantilla personalizada** con permisos **Cuenta · Cloudflare Pages · Editar** y **Cuenta · D1 · Editar**. Copia el token.
3. Dile a Claude «publica Klever». Claude te mostrará un **formulario seguro** (no lo pegues en el chat) para guardar el token para `api.cloudflare.com`, y te pedirá el **ID de cuenta** (panel → columna derecha, «Account ID»; no es secreto) y el correo de administración, que guardará como secreto.
4. Claude hará los pasos 3 a 7 y te dará la dirección. Brevo se puede añadir igual, cuando quieras.
