<script lang="ts">
  // Mini huella: 5 puntos (deuda, ROIC, margen, caja, crece). Lleno = cumple · hueco = no cumple · discontinuo = sin datos.
  import { EJES_HUELLA, type Huella } from '../../lib/dominio/tipos';
  let { huella }: { huella: Huella } = $props();
  const txt = $derived(EJES_HUELLA.map(e => `${e.etiqueta}: ${huella[e.clave] === true ? 'cumple' : huella[e.clave] === false ? 'no cumple' : 'sin datos'}`).join(', '));
</script>
<span class="huella" role="img" aria-label="Huella. {txt}">
  {#each EJES_HUELLA as e (e.clave)}<i class={huella[e.clave] === true ? 'si' : huella[e.clave] === false ? 'no' : 'nd'}></i>{/each}
</span>
<style>
  .huella { display: inline-grid; grid-template-columns: repeat(5, 7px); gap: 3px; align-items: center; }
  i { width: 7px; height: 7px; border-radius: 50%; box-sizing: border-box; }
  .si { background: var(--ok); }
  .no { border: 1.5px solid var(--alto); }
  .nd { border: 1.5px dashed var(--noche-3); opacity: .7; }
</style>
