<script lang="ts">
  // Barras de las 12 semanas, A ESCALA (100 puntos = altura completa), apiladas: Equilibrio · Aprendizaje · Constancia.
  import type { PuntosSemana } from '../../lib/dominio/tipos';
  import { SEMANAS_TEMPORADA } from '../../lib/dominio/liga';
  let { semanas, actual }: { semanas: PuntosSemana[]; actual: number } = $props();
  const H = 80, W = 22, G = 6, X0 = 2, TOP = 12;
  const y = (v: number) => (v / 100) * H;
  const cols = $derived([...Array(SEMANAS_TEMPORADA)].map((_, i) => ({ n: i + 1, p: semanas[i] as PuntosSemana | undefined })));
  const ancho = X0 * 2 + SEMANAS_TEMPORADA * W + (SEMANAS_TEMPORADA - 1) * G;
</script>

<figure class="semanas">
  <svg viewBox="0 0 {ancho} {TOP + H + 16}" role="img" aria-label="Puntos por semana; la tabla siguiente tiene los datos.">
    <line x1="0" x2={ancho} y1={TOP + H} y2={TOP + H} class="base" />
    <line x1="0" x2={ancho} y1={TOP} y2={TOP} class="tope" />
    {#each cols as c}
      {@const x = X0 + (c.n - 1) * (W + G)}
      {#if c.p}
        {@const e = y(c.p.equilibrio)}
        {@const a = y(c.p.aprendizaje)}
        {@const k = y(c.p.constancia)}
        <rect x={x} y={TOP + H - e} width={W} height={e} class="eq" />
        <rect x={x} y={TOP + H - e - a} width={W} height={a} class="ap" />
        <rect x={x} y={TOP + H - e - a - k} width={W} height={k} class="co" />
        {#if !c.p.valida}<circle cx={x + W / 2} cy={TOP + H - e - a - k - 6} r="3" class="aviso" />{/if}
      {:else}
        <rect x={x} y={TOP + H - 3} width={W} height="3" rx="1.5" class="futura" />
      {/if}
      {#if c.n === actual}<rect x={x - 2} y={TOP - 2} width={W + 4} height={H + 4} rx="5" class="hoy" />{/if}
      <text x={x + W / 2} y={TOP + H + 12} class:act={c.n === actual}>{c.n}</text>
    {/each}
  </svg>
  <figcaption class="ley">
    <span><i class="eq"></i>Equilibrio</span><span><i class="ap"></i>Aprendizaje</span><span><i class="co"></i>Constancia</span>
    {#if semanas.some(s => !s.valida)}<span><i class="avi"></i>Sin equilibrio</span>{/if}
  </figcaption>
</figure>
<div class="sr"><table>
  <caption>Puntos por semana</caption>
  <thead><tr><th>Semana</th><th>Equilibrio</th><th>Aprendizaje</th><th>Constancia</th><th>Total</th></tr></thead>
  <tbody>{#each semanas as s, i}<tr><td>{i + 1}</td><td>{s.equilibrio}</td><td>{s.aprendizaje}</td><td>{s.constancia}</td><td>{s.total}{s.valida ? '' : ` (${s.motivo})`}</td></tr>{/each}</tbody>
</table></div>

<style>
  .semanas { margin: 0; display: grid; gap: var(--s2); }
  svg { width: 100%; height: auto; display: block; overflow: visible; }
  .base { stroke: var(--linea-2); stroke-width: 1; }
  .tope { stroke: var(--linea); stroke-width: 1; stroke-dasharray: 2 3; }
  .eq { fill: var(--lila); } .ap { fill: var(--cobre); } .co { fill: var(--agua); }
  .futura { fill: var(--linea-2); }
  .hoy { fill: none; stroke: var(--noche); stroke-width: 1.2; stroke-dasharray: 3 2; }
  .aviso { fill: var(--medio); }
  text { font: 600 9px var(--f-mono); fill: var(--noche-3); text-anchor: middle; }
  text.act { fill: var(--noche); font-weight: 700; }
  .ley { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: var(--t-xs); font-weight: 600; color: var(--noche-2); }
  .ley span { display: inline-flex; align-items: center; gap: 5px; }
  .ley i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .ley i.eq { background: var(--lila); } .ley i.ap { background: var(--cobre); } .ley i.co { background: var(--agua); } .ley i.avi { background: var(--medio); border-radius: 50%; }
</style>
