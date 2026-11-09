<script lang="ts">
  // Filtros de Construye (Sector y País) como píldoras de 44 px con un <select> nativo dentro (accesible y sin JS extra).
  import type { Snippet } from 'svelte';
  import { SECTORES } from '../../lib/dominio/catalogo';
  import type { Sector } from '../../lib/dominio/tipos';
  import { PAISES } from '../../vistas/construye/construye';
  import Ico from '../empresa/Ico.svelte';

  let { sector = $bindable(''), pais = $bindable(''), cambia = () => {}, children }: {
    sector?: Sector | ''; pais?: string; cambia?: () => void; children?: Snippet;
  } = $props();
</script>

<div class="filtros">
  <label class="filtro" class:activo={!!sector}>
    <Ico n="filtro" tam={16} /><span class="sr">Filtrar por sector</span>
    <select bind:value={sector} onchange={cambia}>
      <option value="">Sector</option>
      {#each SECTORES as s}<option value={s}>{s}</option>{/each}
    </select>
  </label>
  <label class="filtro" class:activo={!!pais}>
    <Ico n="pin" tam={16} /><span class="sr">Filtrar por país</span>
    <select bind:value={pais} onchange={cambia}>
      <option value="">País</option>
      {#each PAISES as p}<option value={p}>{p}</option>{/each}
    </select>
  </label>
  {@render children?.()}
</div>

<style>
  .filtros { display: flex; gap: 6px; flex-wrap: wrap; }
  .filtros :global(.filtro) { position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: var(--r-pildora); border: 1px solid var(--linea); background: var(--blanco); color: var(--noche); font-weight: 600; font-size: var(--t-s); cursor: pointer; }
  .filtro select { appearance: none; -webkit-appearance: none; border: 0; background: transparent; font-weight: 600; color: inherit; cursor: pointer; padding: 10px 0; max-width: 9.5rem; field-sizing: content; }
  .filtro select option { color: var(--noche); background: var(--blanco); }
  .filtro:focus-within { outline: 2px solid var(--foco); outline-offset: 2px; }
  .filtro select:focus-visible { outline: none; }
  .filtro.activo { background: var(--lila-f); border-color: transparent; color: var(--lila-t); }
  .filtros :global(.filtro[aria-expanded="true"]), .filtros :global(.filtro[aria-pressed="true"]) { background: var(--noche); color: var(--perla); border-color: var(--noche); }
</style>
