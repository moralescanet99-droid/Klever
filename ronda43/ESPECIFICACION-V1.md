# Klever v1 · especificación acordada con Javier (C63, 2026-11-09)

Fuente: `ronda40/INFORME-APP-FINAL.md` **tal cual**, con el diseño **Nácar** (`ronda42/fotos/2-nacar/`) y las respuestas de Javier en C63. **No se aplican los 14 cambios de `ronda42/validacion/08-que-cambia.md`** («construir sin esos cambios»), **salvo uno**: el perfil de 3 preguntas queda fuera.

## Decisiones de Javier
| Tema | Decisión |
|---|---|
| Qué es «lista» | **Funcionando y publicada** en Cloudflare. Javier **aún no tiene cuenta** de Cloudflare ni de Brevo: se deja todo listo para publicar, con una guía paso a paso, y se publica cuando las tenga |
| Dónde | Mismo repositorio, **carpeta nueva `app/`**. El repositorio sigue siendo público hasta que Javier lo cambie |
| Datos | **De ejemplo y rotulados**: empresas inventadas |
| Validación | Construir **sin** los cambios de la validación |
| Perfil de 3 preguntas | **Fuera** por ahora |
| Titular legal | Todavía no hay. **Beta privada**: el aviso legal completo se añade antes de abrir al público |
| Acceso | **Solo enlace por correo** (Brevo). Mientras no haya Brevo: **modo pruebas**, con el enlace en pantalla y solo para cuentas invitadas |
| Dirección web | Gratuita de Cloudflare (`*.pages.dev`). Dominio propio, más adelante |
| Ideas *fantasy* en la v1 | **Modo *draft*** y **reglas de liga configurables**. Sin cierre visible ni puntos provisionales, sin tesis de la semana |
| Cartera en equipo | **Para la próxima versión**, pero **aparece en la beta** como «Próximamente» |
| Entrada a la beta | **Código de invitación**. El administrador los genera desde un panel y cada usuario puede invitar a amigos |
| Administrador | Un correo que dará Javier. Se guarda como **secreto** (`ADMIN_EMAIL`), nunca en el código |
| Orden de las pestañas | **Mi cartera · Construye · La Liga** (Construye en el centro) |
| Extras | **Modo oscuro** y **Resumen de temporada** (tipo «Wrapped»). **Sin** ideas guardadas y **sin** duelo semanal |

## Consecuencias de diseño (decididas por Claude, anotadas en 03-decisiones)
- **Sin Durable Objects:** no hay votaciones en tiempo real, así que se sigue con **Cloudflare Pages + Functions + D1**.
- **Aprendizaje (30):** el reto de la semana vale 20. Como no hay ideas guardadas, los otros 10 se ganan **revisando una empresa** (abrir su ficha o comparar dos) esa semana.
- **Foto del lunes sin tareas programadas:** se guarda el historial de versiones de cada cartera. La foto de una semana es la versión vigente el lunes a las 00:00 (hora de Madrid). Así se puede reconstruir exacta en cualquier momento.
- **Reglas de liga:** si la foto del lunes incumple una regla, ese lunes no suma puntos de Equilibrio. La app lo avisa antes.
- **Draft:** se elige en serpiente, 6 empresas por persona. Cada empresa es exclusiva dentro de la liga. Hay un cambio por agente libre por semana. Los pesos son libres.
