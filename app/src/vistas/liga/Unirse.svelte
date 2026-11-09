<script lang="ts">
  // Unirse con código de 6 caracteres. Admite ?codigo=XXXXXX (enlace de invitación).
  import { api } from '../../lib/api';
  import { codigoValido } from '../../lib/dominio/liga';
  import { avisar, mensaje } from '../../lib/estado/sesion.svelte';
  import { ir, ruta } from '../../lib/router.svelte';
  import Cabecera from '../../componentes/liga/Cabecera.svelte';

  let codigo = $state((ruta.consulta.get('codigo') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  let enviando = $state(false), error = $state(''), tocado = $state(false);
  const valido = $derived(codigoValido(codigo));
  const desdeEnlace = $derived(!!ruta.consulta.get('codigo'));

  function limpiar(e: Event) { const el = e.currentTarget as HTMLInputElement; codigo = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); el.value = codigo; }
  async function unirse(e: SubmitEvent) {
    e.preventDefault(); tocado = true; error = '';
    if (!valido) { error = 'El código tiene 6 caracteres (letras y números).'; return; }
    enviando = true;
    try { const l = await api.unirseLiga(codigo); avisar(`Te has unido a «${l.nombre}»`); ir(l.tipo === 'draft' ? `/liga/${l.id}/draft` : `/liga/${l.id}`); }
    catch (err) { error = mensaje(err); }
    finally { enviando = false; }
  }
</script>

<main class="pagina">
  <Cabecera>{#snippet contexto()}<b>Unirme con código</b>{/snippet}</Cabecera>
  <a class="volver" href="#/liga"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>La Liga</a>
  <form class="cristal caja" onsubmit={unirse} novalidate>
    <h2>{desdeEnlace ? 'Te han invitado a una liga' : 'Escribe el código de la liga'}</h2>
    <p class="tenue peq">Te lo da quien creó la liga. Son 6 letras o números.</p>
    <div class="campo">
      <label for="codigo-liga" class="sr">Código de la liga</label>
      <input id="codigo-liga" class="entrada codigo mono" value={codigo} oninput={limpiar} maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false"
        inputmode="text" placeholder="ABC123" aria-invalid={tocado && !valido} aria-describedby="codigo-err" />
    </div>
    <p id="codigo-err" class="error" role="alert">{error}</p>
    <button class="btn btn-primario btn-ancho" type="submit" disabled={enviando || codigo.length < 6}>{enviando ? 'Uniéndote…' : 'Unirme'}</button>
    <p class="tenue nota">Solo se verá tu apodo en la clasificación.</p>
  </form>
</main>

<style>
  .volver { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; font-weight: 600; text-decoration: none; justify-self: start; }
  .volver svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
  .caja { padding: var(--s5) var(--s4); display: grid; gap: var(--s3); }
  .codigo { width: 100%; min-width: 0; font-size: 1.8rem; text-align: center; letter-spacing: .3em; text-transform: uppercase; min-height: 60px; }
  .codigo::placeholder { color: var(--noche-3); opacity: .5; }
  .error:empty { display: none; }
  .nota { font-size: var(--t-xs); text-align: center; }
</style>
