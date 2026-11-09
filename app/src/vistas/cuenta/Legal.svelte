<script lang="ts">
  // Klever v1 · TEXTOS LEGALES (#/legal/aviso | privacidad | condiciones). BORRADORES para la beta privada,
  // con las cláusulas de ronda41/LIGA-FANTASY.md §4. Sin datos del titular: no se inventan (pendiente de decidir).
  import { estado } from '../../lib/estado/sesion.svelte';

  let { partes = [] }: { partes?: string[] } = $props();
  type Doc = 'aviso' | 'privacidad' | 'condiciones';
  const DOCS: { id: Doc; titulo: string; resumen: string }[] = [
    { id: 'aviso', titulo: 'Aviso legal', resumen: 'Quién está detrás y qué es Klever.' },
    { id: 'privacidad', titulo: 'Privacidad', resumen: 'Qué datos guardamos y para qué.' },
    { id: 'condiciones', titulo: 'Condiciones de uso', resumen: 'Las reglas para usar la beta.' },
  ];
  const doc = $derived(DOCS.find(d => d.id === partes[0]) || null);
  const volver = $derived(estado.sesion?.usuario ? '#/cuenta' : '#/entrar');
</script>

<main class="pagina legal">
  <p class="borrador" role="note"><b>Borrador</b> · beta privada · pendiente de revisión legal</p>

  {#if !doc}
    <header class="cab"><p class="eti">Textos legales</p><h1>Lo legal, claro</h1></header>
    <nav class="tarjeta indice" aria-label="Textos legales">
      {#each DOCS as d (d.id)}
        <a href="#/legal/{d.id}"><span><b>{d.titulo}</b><br /><span class="tenue peq">{d.resumen}</span></span><span aria-hidden="true">›</span></a>
      {/each}
    </nav>
  {:else}
    <header class="cab"><p class="eti">Textos legales</p><h1>{doc.titulo}</h1></header>
    <nav class="segmento" aria-label="Textos legales">
      {#each DOCS as d (d.id)}<a href="#/legal/{d.id}" aria-current={doc.id === d.id ? 'page' : undefined}>{d.id === 'condiciones' ? 'Condiciones' : d.titulo}</a>{/each}
    </nav>

    <article class="tarjeta texto">
      {#if doc.id === 'aviso'}
        <section>
          <h2>Titular</h2>
          <p><b>Pendiente — beta privada.</b> Antes de abrir Klever al público se publicarán aquí el nombre o la razón social, el NIF, el domicilio y un correo de contacto.</p>
        </section>
        <section>
          <h2>Qué es Klever</h2>
          <p>Una herramienta educativa para construir carteras <b>simuladas</b> y comparar cómo están repartidas, sola o en ligas con amigos.</p>
        </section>
        <section>
          <h2>No es asesoramiento</h2>
          <p>Klever no recomienda comprar ni vender nada. No presta servicios de inversión ni da consejos personalizados.</p>
        </section>
        <section>
          <h2>No es un juego de azar</h2>
          <p>Sin dinero real, sin apuestas, sin premios en dinero y sin compra necesaria. Nada de lo que hagas en Klever tiene valor económico.</p>
        </section>
        <section>
          <h2>Datos de ejemplo</h2>
          <p>Las empresas, sus códigos y sus cifras son <b>inventados</b>. No se usan logotipos de marcas reales.</p>
        </section>
        <section>
          <h2>Ley aplicable</h2>
          <p>Ley española, sin perjuicio de las normas de protección de las personas consumidoras.</p>
        </section>
      {:else if doc.id === 'privacidad'}
        <section>
          <h2>Responsable</h2>
          <p><b>Pendiente — beta privada.</b> Los datos del responsable se publicarán antes de abrir al público.</p>
        </section>
        <section>
          <h2>Qué guardamos</h2>
          <ul>
            <li><b>Tu correo</b>, para enviarte el enlace de acceso.</li>
            <li><b>Tu apodo</b> y cuándo declaraste tener 18 años o más.</li>
            <li>El <b>código de invitación</b> con el que entraste.</li>
            <li>Tus <b>carteras simuladas</b>, sus versiones y tus ligas.</li>
            <li>Las <b>semanas</b> en que entras o revisas una empresa, para los puntos.</li>
          </ul>
          <p>Tu correo no se muestra a nadie. En las ligas solo se ve tu apodo.</p>
        </section>
        <section>
          <h2>Sin rastreo</h2>
          <p>Sin publicidad, sin rastreadores y sin cookies de terceros. No cruzamos tus datos con nadie.</p>
          <p>Usamos <b>una cookie técnica</b> para mantener tu sesión (30 días). El tema claro u oscuro se guarda solo en tu dispositivo.</p>
          <p>Medimos el uso con contadores <b>anónimos</b> por día; no identifican a nadie.</p>
        </section>
        <section>
          <h2>Quién nos ayuda</h2>
          <p>Cloudflare aloja la app y la base de datos. Cuando se active, Brevo enviará los correos de acceso.</p>
        </section>
        <section>
          <h2>Cuánto tiempo</h2>
          <p>Mientras tengas cuenta. Los enlaces de acceso se borran a los 2 días; las sesiones, al caducar.</p>
        </section>
        <section>
          <h2>Tus derechos</h2>
          <p>Puedes pedir acceso, corrección o borrado de tus datos, y oponerte a su uso. El canal de contacto está <b>pendiente</b>; mientras tanto, díselo a quien te invitó. También puedes reclamar ante la Agencia Española de Protección de Datos.</p>
        </section>
        <section>
          <h2>Permisos</h2>
          <p>Si algún día pedimos un permiso del dispositivo, lo haremos en el momento y diciendo para qué.</p>
        </section>
      {:else}
        <section>
          <h2>1 · Qué aceptas</h2>
          <p>Klever es una <b>simulación educativa</b> en beta privada. Al crear tu cuenta aceptas estas condiciones.</p>
        </section>
        <section>
          <h2>2 · Sin dinero real</h2>
          <p>Sin dinero real, sin apuestas, sin premios en dinero y sin compra necesaria. Si algún día hay algo de pago, será solo estético y nunca dará ventaja en la Liga.</p>
        </section>
        <section>
          <h2>3 · No es asesoramiento</h2>
          <p>Nada en Klever es una recomendación de inversión. Las decisiones con tu dinero real son solo tuyas.</p>
        </section>
        <section>
          <h2>4 · Solo mayores de 18</h2>
          <p>Para usar Klever debes tener 18 años o más. Podemos pedirte que lo acredites.</p>
        </section>
        <section>
          <h2>5 · Tu cuenta es tuya</h2>
          <p>Las cuentas son personales e intransferibles. Una por persona. No se permiten varias cuentas ni trampas en las ligas.</p>
        </section>
        <section>
          <h2>6 · Invitaciones</h2>
          <p>La beta es por invitación. Comparte tus códigos solo con personas que conozcas.</p>
        </section>
        <section>
          <h2>7 · Moderación</h2>
          <p>Podemos revisar apodos y textos, sin obligarnos a ello. Podemos suspender cuentas que incumplan estas condiciones.</p>
        </section>
        <section>
          <h2>8 · Lo que publicas</h2>
          <p>Nos das permiso limitado para mostrar tu apodo y tus textos dentro de Klever. Siguen siendo tuyos.</p>
        </section>
        <section>
          <h2>9 · Datos y puntos</h2>
          <p>Los datos de empresas son <b>de ejemplo</b>. Si hay un error en los datos o en el cálculo, <b>los puntos se pueden recalcular</b>.</p>
        </section>
        <section>
          <h2>10 · Beta</h2>
          <p>Es una versión de prueba: puede tener errores, cambiar o interrumpirse sin aviso.</p>
        </section>
        <section>
          <h2>11 · Ley aplicable</h2>
          <p>Ley española, sin perjuicio de las normas de consumo que te protejan.</p>
        </section>
        <section>
          <h2>12 · Titular</h2>
          <p><b>Pendiente — beta privada.</b></p>
        </section>
      {/if}
    </article>
  {/if}
  <a class="btn btn-fantasma volver" href={volver}>‹ Volver</a>
</main>

<style>
  .legal { gap: var(--s4); }
  .borrador { justify-self: start; padding: 6px 12px; border-radius: var(--r-pildora); background: var(--medio-f); color: var(--medio); font-size: var(--t-xs); font-weight: 600; }
  .cab { display: grid; gap: var(--s1); }
  .cab h1 { font-size: var(--t-xxl); font-weight: 450; line-height: 1.05; }
  .segmento a { min-height: 44px; padding: 0 var(--s2); text-align: center; }
  .indice { display: grid; padding: var(--s1) var(--s4); }
  .indice a { display: flex; justify-content: space-between; align-items: center; gap: var(--s3); min-height: 64px; color: var(--noche); text-decoration: none; border-top: 1px solid var(--linea); }
  .indice a:first-child { border-top: 0; }
  .texto { display: grid; gap: var(--s5); padding: var(--s5) var(--s4); }
  .texto section { display: grid; gap: var(--s2); }
  .texto h2 { font-size: var(--t-l); }
  .texto p, .texto li { color: var(--noche-2); max-width: 62ch; }
  .texto b { color: var(--noche); }
  .texto ul { margin: 0; padding-left: 1.2em; display: grid; gap: var(--s1); }
  .volver { justify-self: start; }
</style>
