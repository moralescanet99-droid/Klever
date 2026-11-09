<script lang="ts">
  // Tablero del draft en serpiente (foto 04): filas = rondas, columnas = orden. Mi columna resaltada; la casilla en juego, marcada.
  import type { EstadoDraft, Sector } from '../../lib/dominio/tipos';
  import { empresa } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import Avatar from './Avatar.svelte';
  let { draft, miId }: { draft: EstadoDraft; miId: number } = $props();

  const rondas = $derived([...Array(draft.rondas)].map((_, i) => i + 1));
  const pick = (r: number, u: number) => draft.picks.find(p => p.ronda === r && p.usuarioId === u)?.ticker;
  const sectores = $derived([...new Set(draft.picks.map(p => empresa(p.ticker)?.sector).filter(Boolean))] as Sector[]);
  const flecha = (r: number) => (r % 2 ? '→' : '←');
</script>

<section class="tablero cristal" aria-labelledby="tab-t">
  <div class="cab"><h2 id="tab-t" class="eti">Tablero del draft</h2><span class="lema">1 empresa = 1 sola cartera</span></div>
  <div class="desliza">
    <table style="--cols:{draft.orden.length}">
      <caption class="sr">Elecciones por ronda. Orden en serpiente: las rondas impares van de izquierda a derecha y las pares al revés.</caption>
      <thead>
        <tr>
          <th scope="col"><span class="sr">Ronda</span></th>
          {#each draft.orden as o (o.usuarioId)}
            <th scope="col" class:mia={o.usuarioId === miId}><Avatar apodo={o.apodo} id={o.usuarioId} tu={o.usuarioId === miId} tam={28} /><span class="sr">@{o.apodo}{o.usuarioId === miId ? ' (tú)' : ''}</span></th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rondas as r}
          <tr>
            <th scope="row" class="r mono"><span>{r}</span><span class="fl" aria-hidden="true">{flecha(r)}</span></th>
            {#each draft.orden as o (o.usuarioId)}
              {@const t = pick(r, o.usuarioId)}
              {@const e = t ? empresa(t) : undefined}
              {@const ahora = !t && draft.turnoDe === o.usuarioId && draft.ronda === r}
              <td class:mia={o.usuarioId === miId}>
                {#if t}
                  <span class="cel mono" style="--c:{e ? COLOR_SECTOR[e.sector] : 'var(--linea-2)'}" title="{e?.nombre} · {e?.sector}">{t}<span class="sr"> ({e?.sector})</span></span>
                {:else if ahora}
                  <span class="cel ahora"><span aria-hidden="true">···</span><span class="sr">le toca elegir ahora</span></span>
                {:else}
                  <span class="cel vacia"><span class="sr">pendiente</span></span>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if sectores.length}
    <ul class="ley" aria-label="Sectores">
      {#each sectores as s}<li><i style="background:{COLOR_SECTOR[s]}"></i>{s}</li>{/each}
    </ul>
  {/if}
</section>

<style>
  .tablero { padding: var(--s4) var(--s3) var(--s3); display: grid; gap: var(--s2); }
  .cab { display: flex; justify-content: space-between; align-items: baseline; gap: var(--s2); padding: 0 4px; flex-wrap: wrap; }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  .lema { font-size: var(--t-xs); font-weight: 650; color: var(--lila-t); }
  .desliza { position: relative; overflow-x: auto; overscroll-behavior-x: contain; }
  table { width: 100%; min-width: calc(24px + var(--cols) * 46px); border-collapse: separate; border-spacing: 3px; table-layout: fixed; }
  thead th:first-child, .r { width: 22px; }
  th { padding: 0; font-weight: 600; }
  thead th { height: 34px; }
  thead th :global(.av) { margin: 0 auto; }
  .r { font-size: 11px; color: var(--noche-3); }
  .r span { display: block; line-height: 1; }
  .fl { font-size: 9px; opacity: .7; }
  td { padding: 0; position: relative; }
  td.mia, th.mia { background: linear-gradient(180deg, var(--cobre-f), var(--lila-f) 55%, var(--agua-f)); }
  thead th.mia { border-radius: 10px 10px 0 0; }
  tbody tr:last-child td.mia { border-radius: 0 0 10px 10px; }
  .cel { position: relative; overflow: hidden; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 600; letter-spacing: -.02em; background: var(--perla-hi); box-shadow: inset 0 0 0 1px var(--linea); }
  .cel::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--c, transparent); }
  td.mia .cel { background: var(--blanco); font-weight: 700; }
  .vacia { background: transparent; box-shadow: inset 0 0 0 1px var(--linea); }
  .vacia::before, .ahora::before { display: none; }
  td .cel.ahora { background: var(--noche); color: var(--perla); box-shadow: none; font-weight: 700; }
  .ley { list-style: none; margin: 4px 4px 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: var(--t-xs); font-weight: 600; color: var(--noche-2); }
  .ley li { display: inline-flex; align-items: center; gap: 5px; }
  .ley i { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }
</style>
