<script lang="ts">
  // Ventas por región de UNA empresa: barra apilada a escala (SVG) + lista con los porcentajes (alternativa en texto).
  import type { Empresa } from '../../lib/dominio/tipos';
  import { COLOR_REGION, ventasOrdenadas } from '../../vistas/construye/construye';
  let { e }: { e: Empresa } = $props();
  const partes = $derived(ventasOrdenadas(e));
  const tramos = $derived(partes.reduce<{ region: string; pct: number; x: number; color: string }[]>((acc, p) => {
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].pct : 0;
    return [...acc, { region: p.region, pct: p.pct, x, color: COLOR_REGION[p.region] }];
  }, []));
</script>

{#if !partes.length}
  <p class="sin">Sin desglose: esta empresa no publica sus ventas por región.</p>
{:else}
  <svg class="barra" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    {#each tramos as t (t.region)}<rect x={t.x} y="0" width={Math.max(0, t.pct - 0.6)} height="10" rx="1.2" style="fill:{t.color}" />{/each}
  </svg>
  <ul class="ley" aria-label="Ventas por región">
    {#each partes as p (p.region)}
      <li><span class="punto" style="color:{COLOR_REGION[p.region]}" aria-hidden="true"></span>{p.region}<b class="mono">{p.pct} %</b></li>
    {/each}
  </ul>
{/if}

<style>
  .barra { width: 100%; height: 14px; display: block; border-radius: 7px; overflow: hidden; }
  .ley { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 168px), 1fr)); gap: 6px 14px; }
  .ley li { display: flex; align-items: center; gap: 8px; font-size: var(--t-s); color: var(--noche-2); }
  .ley b { margin-left: auto; white-space: nowrap; color: var(--noche); font-weight: 600; }
  .sin { font-size: var(--t-s); color: var(--noche-3); padding: 10px 12px; border-radius: var(--r); border: 1px dashed var(--linea-2); }
</style>
