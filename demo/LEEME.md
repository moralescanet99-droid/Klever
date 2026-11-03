# Demo pública de Klever

`index.html` es un **único archivo** autónomo: la misma interfaz de Klever con un servidor simulado dentro de la página. No necesita base de datos, Brevo, SEC ni TradingView. **Todos los datos son inventados** y lo que se crea se pierde al recargar (el aviso amarillo de la página lo dice).

## Publicarla (una vez, con una cuenta gratuita de Cloudflare)
```bash
npm i -g wrangler
wrangler login
wrangler pages deploy demo --project-name klever-demo
```
Te devuelve una dirección pública tipo `https://klever-demo.pages.dev`, que se puede abrir sin cuenta e interactuar con ella. La página lleva `noindex` para que los buscadores no indexen datos de ejemplo.

## Qué puede hacer quien la abra
Probar una plantilla, editar pesos, añadir y quitar activos, ver los estados de guardado y los errores (por ejemplo, un 103 %), «entrar» con el botón que simula el enlace del email, guardar, publicar y despublicar, explorar las 105 empresas y abrir sus fichas.

## Qué NO es
No es el producto real: no hay cuentas ni datos reales, el email no se envía y los gráficos de TradingView salen como recuadros. Se regenera con el script de construcción de la demo.
