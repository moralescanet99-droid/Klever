<script lang="ts">
  // Klever v1 · ENTRAR (beta privada, solo enlace por correo). Admite ?invitacion=XXXX (en el hash o en la URL).
  // Si el correo ya está verificado pero falta el alta, muestra Alta (así no hace falta tocar el armazón).
  import { api } from '../../lib/api';
  import { estado, mensaje } from '../../lib/estado/sesion.svelte';
  import { ruta } from '../../lib/router.svelte';
  import Alta from './Alta.svelte';

  const deUrl = (k: string) => ruta.consulta.get(k) || new URLSearchParams(location.search).get(k) || '';
  let email = $state('');
  let invitacion = $state(deUrl('invitacion').toUpperCase().slice(0, 12));
  let verCodigo = $state(!!deUrl('invitacion'));
  let enviando = $state(false);
  let error = $state(deUrl('error') === 'enlace' ? 'Ese enlace ha caducado o ya se usó. Pide otro.' : '');
  let hecho = $state<{ enviado: boolean; enlacePruebas?: string } | null>(null);
  let campoEmail: HTMLInputElement | undefined = $state();

  async function enviar(e: SubmitEvent) {
    e.preventDefault(); error = '';
    if (!campoEmail?.checkValidity()) { error = 'Escribe un correo válido.'; campoEmail?.focus(); return; }
    enviando = true;
    try { hecho = await api.solicitarAcceso(email.trim(), invitacion.trim() || undefined); }
    catch (x) { error = mensaje(x); if (/invitaci/i.test(error)) verCodigo = true; }
    finally { enviando = false; }
  }
</script>

{#if estado.sesion?.necesitaAlta}
  <Alta />
{:else}
<main class="pagina entrar">
  <header class="cab">
    <p class="eti">Beta privada</p>
    <h1>Entra en Klever</h1>
    <p class="sub">Carteras simuladas para aprender. Sin dinero real y sin consejos.</p>
  </header>

  <div aria-live="polite" class="vivo">
    {#if hecho?.enviado}
      <section class="cristal panel pila" aria-labelledby="t-correo">
        <span class="sobre" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z M3 7l9 6 9-6" /></svg></span>
        <h2 id="t-correo">Revisa tu correo</h2>
        <p>Te hemos enviado un enlace a <b class="correo">{email.trim()}</b>.</p>
        <p class="tenue peq">Caduca en 15 minutos y sirve una sola vez. Mira también en «spam».</p>
        <button class="btn btn-fantasma" type="button" onclick={() => (hecho = null)}>Usar otro correo</button>
      </section>
    {:else if hecho}
      <section class="cristal panel pila" aria-labelledby="t-pruebas">
        <span class="chip pruebas">Modo pruebas</span>
        <h2 id="t-pruebas">Tu enlace está listo</h2>
        <p class="tenue peq">Aún no enviamos correos. Mientras tanto, el enlace sale aquí, solo para cuentas invitadas.</p>
        <a class="btn btn-primario btn-ancho" href={hecho.enlacePruebas}>Entrar ahora</a>
        <button class="btn btn-fantasma" type="button" onclick={() => (hecho = null)}>Usar otro correo</button>
      </section>
    {/if}
  </div>

  {#if !hecho}
    <form class="cristal panel pila" onsubmit={enviar} novalidate>
      <div class="campo">
        <label for="e-email">Tu correo</label>
        <input id="e-email" class="entrada" type="email" autocomplete="email" inputmode="email" required maxlength="200"
          bind:value={email} bind:this={campoEmail} placeholder="tu@correo.es" aria-describedby={error ? 'e-error' : undefined} aria-invalid={!!error && !email} />
      </div>
      {#if verCodigo}
        <div class="campo">
          <label for="e-inv">Código de invitación</label>
          <input id="e-inv" class="entrada mono codigo" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12"
            bind:value={invitacion} oninput={() => (invitacion = invitacion.toUpperCase())} placeholder="ABCD2345" />
          <p class="tenue peq">Solo la primera vez. Si ya tienes cuenta, déjalo vacío.</p>
        </div>
      {:else}
        <button class="btn btn-fantasma enlace" type="button" onclick={() => (verCodigo = true)}>Tengo un código de invitación</button>
      {/if}
      {#if error}<p id="e-error" class="error" role="alert">{error}</p>{/if}
      <button class="btn btn-primario btn-ancho" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviarme el enlace'}</button>
      <p class="tenue peq nota">Sin contraseñas: te mandamos un enlace para entrar.</p>
    </form>

    <section class="tarjeta pila beta" aria-labelledby="t-beta">
      <h2 id="t-beta" class="eti">Cómo entrar en la beta</h2>
      <ol>
        <li>Alguien de la beta te pasa un código.</li>
        <li>Escribe tu correo y el código.</li>
        <li>Abre el enlace y elige tu apodo.</li>
      </ol>
      <p class="tenue peq">Solo para mayores de 18 años.</p>
    </section>
  {/if}

  <nav class="legal" aria-label="Textos legales">
    <a href="#/legal/aviso">Aviso legal</a><a href="#/legal/privacidad">Privacidad</a><a href="#/legal/condiciones">Condiciones</a>
  </nav>
</main>
{/if}

<style>
  .entrar { gap: var(--s4); padding-top: var(--s5); }
  .cab { display: grid; gap: var(--s2); }
  .cab h1 { font-size: var(--t-xxl); font-weight: 450; line-height: 1; }
  .sub { color: var(--noche-2); font-size: var(--t-m); max-width: 32ch; }
  .vivo:empty { display: none; }
  .panel { padding: var(--s5) var(--s4); }
  .panel h2 { font-size: var(--t-xl); }
  .sobre { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--cobre-f), var(--lila-f)); }
  .sobre svg { width: 24px; height: 24px; fill: none; stroke: var(--noche); stroke-width: 1.7; stroke-linejoin: round; }
  .correo { overflow-wrap: anywhere; }
  .pruebas { justify-self: start; background: var(--medio-f); color: var(--medio); border-color: transparent; }
  .codigo { text-transform: uppercase; letter-spacing: .12em; }
  .enlace { justify-self: start; padding: 0 var(--s2); color: var(--lila-t); }
  .nota { text-align: center; }
  .beta ol { margin: 0; padding-left: 1.3em; display: grid; gap: var(--s1); color: var(--noche-2); }
  .legal { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--s1) var(--s4); font-size: var(--t-s); }
  .legal a { color: var(--noche-3); min-height: 44px; display: inline-flex; align-items: center; }
</style>
