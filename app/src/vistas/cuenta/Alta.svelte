<script lang="ts">
  // Klever v1 · ALTA: apodo + declaración obligatoria de mayoría de edad + aceptar condiciones.
  import { api } from '../../lib/api';
  import { apodoValido } from '../../lib/dominio/liga';
  import { cargarSesion, mensaje } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';

  let apodo = $state('');
  let mayor18 = $state(false);
  let acepto = $state(false);
  let enviando = $state(false);
  let error = $state('');
  const valido = $derived(apodoValido(apodo));
  const listo = $derived(valido && mayor18 && acepto && !enviando);

  async function crear(e: SubmitEvent) {
    e.preventDefault(); error = '';
    if (!valido) { error = 'El apodo debe tener de 3 a 20 caracteres: letras, números, espacio, punto o guion.'; return; }
    if (!mayor18) { error = 'Para usar Klever tienes que tener 18 años o más.'; return; }
    if (!acepto) { error = 'Acepta las condiciones para continuar.'; return; }
    enviando = true;
    try { await api.completarAlta(apodo.trim(), true); ir('#/cartera'); await cargarSesion(); }
    catch (x) { error = mensaje(x); }
    finally { enviando = false; }
  }
  async function otroCorreo() { try { await api.salir(); } catch { /* da igual: volvemos a Entrar */ } ir('#/entrar'); await cargarSesion(); }
</script>

<main class="pagina alta">
  <header class="cab">
    <p class="eti">Último paso</p>
    <h1>¿Cómo te llamamos?</h1>
    <p class="sub">Tu apodo es lo que verán en las ligas. Tu correo, nunca.</p>
  </header>

  <form class="cristal panel pila" onsubmit={crear} novalidate>
    <div class="campo">
      <label for="a-apodo">Apodo</label>
      <input id="a-apodo" class="entrada" autocomplete="nickname" maxlength="20" spellcheck="false" bind:value={apodo} placeholder="p. ej. marea_baja"
        aria-describedby="a-ayuda" aria-invalid={apodo.length > 0 && !valido} />
      <p id="a-ayuda" class="peq" class:tenue={!apodo || valido} class:error={!!apodo && !valido}>
        {apodo && !valido ? 'De 3 a 20: letras, números, espacio, punto o guion.' : 'De 3 a 20 caracteres. Sin datos personales.'}
      </p>
    </div>

    <label class="casilla">
      <input type="checkbox" bind:checked={mayor18} required />
      <span><b>Tengo 18 años o más</b><small class="tenue">Klever es solo para mayores de edad.</small></span>
    </label>
    <label class="casilla">
      <input type="checkbox" bind:checked={acepto} required />
      <span>Acepto las <a href="#/legal/condiciones">condiciones de uso</a> y he leído la <a href="#/legal/privacidad">privacidad</a></span>
    </label>

    <div aria-live="assertive">{#if error}<p class="error" role="alert">{error}</p>{/if}</div>
    <button class="btn btn-primario btn-ancho" type="submit" disabled={!listo}>{enviando ? 'Creando…' : 'Crear mi cuenta'}</button>
  </form>

  <section class="tarjeta recuerda" aria-label="Recuerda">
    <p><b>Simulación educativa.</b> Sin dinero real, sin apuestas, sin premios en dinero y sin consejos de inversión.</p>
  </section>

  <button class="btn btn-fantasma otro" type="button" onclick={otroCorreo}>Entrar con otro correo</button>
</main>

<style>
  .alta { gap: var(--s4); padding-top: var(--s5); }
  .cab { display: grid; gap: var(--s2); }
  .cab h1 { font-size: var(--t-xxl); font-weight: 450; line-height: 1; }
  .sub { color: var(--noche-2); max-width: 34ch; }
  .panel { padding: var(--s5) var(--s4); gap: var(--s4); }
  .casilla { display: grid; grid-template-columns: 28px 1fr; gap: var(--s3); align-items: start; min-height: 44px; padding: var(--s3); border-radius: var(--r); border: 1px solid var(--linea); background: var(--perla-hi); cursor: pointer; font-size: var(--t-s); }
  .casilla input { width: 22px; height: 22px; margin: 1px 0 0; accent-color: var(--lila-t); cursor: pointer; }
  .casilla b { display: block; font-size: var(--t-m); }
  .casilla small { display: block; font-size: var(--t-s); }
  .casilla:has(input:checked) { border-color: var(--lila); background: var(--lila-f); }
  .recuerda { font-size: var(--t-s); color: var(--noche-2); }
  .otro { justify-self: center; color: var(--noche-3); }
</style>
