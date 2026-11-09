<script lang="ts">
  // Mini huella: 5 puntos (deuda, ROIC, margen, caja, crece). Lleno = cumple, hueco = no cumple, raya = sin datos.
  import { EJES_HUELLA, type Huella } from '../../lib/dominio/tipos';
  let { huella }: { huella: Huella } = $props();
  const txt = $derived(EJES_HUELLA.map(e => `${e.etiqueta}: ${huella[e.clave] === true ? 'cumple' : huella[e.clave] === false ? 'no cumple' : 'sin datos'}`).join(', '));
</script>
<span class="mh" role="img" aria-label="Huella. {txt}">
  {#each EJES_HUELLA as e}
    {@const v = huella[e.clave]}
    <i class:si={v === true} class:no={v === false} class:na={v === null} title="{e.etiqueta}: {v === true ? 'cumple' : v === false ? 'no cumple' : 'sin datos'}"></i>
  {/each}
</span>
<style>
  .mh { display: inline-flex; gap: 3px; align-items: center; }
  i { width: 8px; height: 8px; border-radius: 50%; display: block; }
  .si { background: var(--ok); }
  .no { box-shadow: inset 0 0 0 1.5px var(--alto); }
  .na { height: 2px; border-radius: 1px; background: var(--noche-3); }
</style>
