<script lang="ts">
  // Buscador de empresas LIBRES en un draft (con sector y mini huella). Klever no recomienda: orden alfabético.
  import type { Sector } from '../../lib/dominio/tipos';
  import { empresa, FUENTE_DATOS, SECTORES } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import MiniHuella from './MiniHuella.svelte';
  let { libres, etiqueta = 'Elegir', ocupado = false, seleccionado = null, onelegir }: { libres: string[]; etiqueta?: string; ocupado?: boolean; seleccionado?: string | null; onelegir: (ticker: string) => void } = $props();
  let q = $state(''), sector = $state<Sector | ''>('');
  const uid = Math.random().toString(36).slice(2, 7);
  const todas = $derived(libres.map(t => empresa(t)!).filter(Boolean).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
  const lista = $derived(todas.filter(e => (!sector || e.sector === sector) && (!q.trim() || `${e.ticker} ${e.nombre}`.toLowerCase().includes(q.trim().toLowerCase()))));
  const sectoresLibres = $derived(SECTORES.filter(s => todas.some(e => e.sector === s)));
</script>

<div class="buscador">
  <div class="filtros">
    <label class="sr" for="bus-{uid}">Buscar empresa libre</label>
    <input id="bus-{uid}" class="entrada" type="search" placeholder="Buscar por nombre o ticker" bind:value={q} autocomplete="off" />
    <label class="sr" for="sec-{uid}">Sector</label>
    <select id="sec-{uid}" class="entrada" bind:value={sector}>
      <option value="">Todos los sectores</option>
      {#each sectoresLibres as s}<option value={s}>{s}</option>{/each}
    </select>
  </div>
  <p class="tenue cuenta" aria-live="polite">{lista.length} {lista.length === 1 ? 'empresa libre' : 'empresas libres'} · {FUENTE_DATOS}</p>
  {#if !lista.length}
    <p class="tenue peq vacio">No hay empresas libres con ese filtro.</p>
  {:else}
    <ul>
      {#each lista as e (e.ticker)}
        <li class:sel={seleccionado === e.ticker}>
          <span class="raya" style="background:{COLOR_SECTOR[e.sector]}" aria-hidden="true"></span>
          <span class="txt">
            <span class="l1"><b class="mono">{e.ticker}</b> <span class="nom">{e.nombre}</span></span>
            <span class="l2"><span class="tenue">{e.sector} · {e.pais}</span><MiniHuella huella={e.huella} /></span>
          </span>
          <button class="btn {seleccionado === e.ticker ? 'btn-primario' : ''}" type="button" disabled={ocupado} aria-pressed={seleccionado != null ? seleccionado === e.ticker : undefined} onclick={() => onelegir(e.ticker)}>
            {etiqueta}<span class="sr"> {e.nombre}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .buscador { display: grid; gap: var(--s2); }
  .filtros { display: grid; grid-template-columns: 1fr; gap: var(--s2); }
  @media (min-width: 520px) { .filtros { grid-template-columns: 1.4fr 1fr; } }
  .entrada { width: 100%; min-width: 0; }
  .cuenta { font-size: var(--t-xs); }
  ul { list-style: none; margin: 0; padding: 0 2px 0 0; display: grid; grid-auto-rows: max-content; gap: 6px; max-height: 420px; overflow-y: auto; position: relative; overscroll-behavior: contain; }
  li { position: relative; display: grid; grid-template-columns: 4px 1fr auto; gap: var(--s3); align-items: center; padding: 8px var(--s3) 8px 0; border-radius: var(--r); background: var(--blanco); border: 1px solid var(--linea); overflow: hidden; }
  li.sel { border-color: var(--lila); }
  .raya { align-self: stretch; margin: -8px 0; }
  .txt { display: grid; gap: 3px; min-width: 0; }
  .l1 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .l1 .mono { font-size: var(--t-s); }
  .nom { font-weight: 600; }
  .l2 { display: flex; align-items: center; gap: var(--s2); font-size: var(--t-xs); flex-wrap: wrap; }
  .vacio { padding: var(--s3) 0; }
</style>
