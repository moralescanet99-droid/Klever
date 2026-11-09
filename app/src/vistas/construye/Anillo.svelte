<script lang="ts">
  // Anillo de la cartera que se está creando: un tramo por empresa, a escala de su peso y con el color de su sector.
  // «enciende»: los tramos aparecen uno tras otro (solo opacity/transform; nada con «reducir movimiento»).
  import { TOTAL } from '../../lib/dominio/cartera';
  import { empresa } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import type { Posicion } from '../../lib/dominio/tipos';

  let { posiciones, tam = 120, grosor = 14, enciende = false, children }: {
    posiciones: Posicion[]; tam?: number; grosor?: number; enciende?: boolean; children?: import('svelte').Snippet;
  } = $props();

  const r = 50 - 8, C = 2 * Math.PI * r, HUECO = 1.4;
  const tramos = $derived.by(() => {
    let acc = 0;
    return posiciones.filter(p => p.decimas > 0).map(p => {
      const ini = acc / TOTAL; acc += p.decimas;
      const largo = Math.max(0, p.decimas / TOTAL * C - (posiciones.length > 1 ? HUECO : 0));
      return { ticker: p.ticker, color: COLOR_SECTOR[empresa(p.ticker)!.sector], dash: `${largo} ${C - largo}`, rot: ini * 360 - 90 };
    });
  });
</script>

<div class="anillo" class:enciende style="width:{tam}px;height:{tam}px">
  <svg viewBox="0 0 100 100" width={tam} height={tam} aria-hidden="true" focusable="false">
    <circle cx="50" cy="50" {r} class="base" style="stroke-width:{grosor * 100 / tam}" />
    {#each tramos as t, i (t.ticker)}
      <g transform="rotate({t.rot} 50 50)">
        <circle cx="50" cy="50" {r} class="tramo" style="stroke:{t.color};stroke-dasharray:{t.dash};stroke-width:{grosor * 100 / tam};animation-delay:{180 + i * 110}ms" />
      </g>
    {/each}
  </svg>
  {#if children}<div class="centro">{@render children()}</div>{/if}
</div>

<style>
  .anillo { position: relative; flex: none; }
  .base { fill: none; stroke: var(--linea); }
  .tramo { fill: none; stroke-linecap: butt; }
  .centro { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
  .enciende .tramo { animation: tramo var(--lento) var(--muelle) backwards; transform-box: fill-box; transform-origin: center; }
  .enciende svg { animation: gira var(--lento) var(--suave) backwards; }
  @keyframes tramo { from { opacity: 0; transform: scale(.82); } }
  @keyframes gira { from { transform: rotate(-40deg) scale(.9); opacity: .4; } }
  @media (prefers-reduced-motion: reduce) { .enciende .tramo, .enciende svg { animation: none; } }
</style>
