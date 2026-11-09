<script lang="ts">
  // Mapa de puntos del mundo (máscara de tierra de ronda42/fotos/2-nacar/fuente). Proyección equirectangular: 3° por columna.
  // Vista «sede»: un marcador por país de sede (tamaño ∝ peso). Vista «ventas»: los puntos de cada región, más intensos cuanto más venden.
  import type { Parte } from '../../lib/dominio/cartera';
  import type { Region } from '../../lib/dominio/tipos';
  import { MASCARA } from './mascara';
  import { COLOR_REGION, PAISES, regionDe } from './util';

  let { vista, paises, ventas, suma }: { vista: 'sede' | 'ventas'; paises: Parte[]; ventas: { region: Region; decimas: number }[]; suma: number } = $props();

  const C0 = 15, C1 = 112, F0 = 2, F1 = 43, W = 330, c = W / (C1 - C0), H = Math.round((F1 - F0) * c);
  const X = (lon: number) => ((lon + 180) / 3 - C0) * c, Y = (lat: number) => (((80 - lat) / 136) * 54 - F0) * c;
  // Puntos de tierra (se calculan una vez).
  const PUNTOS: { x: number; y: number; r: Region }[] = [];
  MASCARA.split('|').slice(F0, F1).forEach((fila, k) => {
    const bits = [...fila].map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
    for (let i = C0; i < C1; i++) if (bits[i] === '1') {
      const lat = 80 - (136 * (k + F0 + 0.5)) / 54, lon = -180 + 3 * (i + 0.5);
      PUNTOS.push({ x: +((i - C0 + 0.5) * c).toFixed(1), y: +((k + 0.5) * c).toFixed(1), r: regionDe(lat, lon) });
    }
  });
  // Dónde poner la etiqueta de cada región en la vista de ventas.
  const ANCLA_REGION: Record<Region, [number, number]> = {
    'España': [40, -4], 'Resto de Europa': [52, 18], 'Norteamérica': [44, -100], 'Latinoamérica': [-12, -58], 'Asia-Pacífico': [32, 108], 'Otros': [6, 22],
  };

  const maxV = $derived(Math.max(1, ...ventas.map(v => v.decimas)));
  const opacidad = (r: Region) => (vista === 'sede' ? 0.2 : 0.16 + (0.84 * (ventas.find(v => v.region === r)?.decimas || 0)) / maxV);
  const color = (r: Region) => (vista === 'sede' ? 'var(--noche)' : COLOR_REGION[r]);

  // Etiquetas sin solaparse: se prueban varias posiciones alrededor del punto y se coge la primera libre.
  interface Etq { x: number; y: number; px: number; py: number; texto: string; valor: string; anc: 'start' | 'middle' | 'end'; r: number; lx: number; ly: number }
  const ancho = (s: string) => s.length * 7.2 + 8;
  const CANDIDATOS: [number, number][] = [[1, -1], [-1, -1], [1, 1], [-1, 1], [0, -1.4], [0, 1.6], [1.6, 0], [-1.6, 0]];
  function colocar(items: { px: number; py: number; texto: string; valor: string; r: number }[]): Etq[] {
    const cajas: [number, number, number, number][] = [], out: Etq[] = [];
    for (const it of items) {
      const w = ancho(`${it.texto} ${it.valor}`), h = 15;
      let hecho: Etq | null = null;
      for (const esc of [1, 1.7, 2.5]) {
        for (const [ux, uy] of CANDIDATOS) {
          const dx = ux * (14 + it.r) * esc, dy = uy * (14 + it.r) * esc;
          const anc = ux > 0.5 ? 'start' : ux < -0.5 ? 'end' : 'middle';
          const x0 = anc === 'start' ? it.px + dx : anc === 'end' ? it.px + dx - w : it.px + dx - w / 2, y0 = it.py + dy - (uy > 0 ? 0 : h);
          if (x0 < 2 || x0 + w > W - 2 || y0 < 2 || y0 + h > H - 2) continue;
          if (cajas.some(([a, b, cc, d]) => x0 < cc && x0 + w > a && y0 < d && y0 + h > b)) continue;
          cajas.push([x0, y0, x0 + w, y0 + h]);
          const ty = y0 + h - 3, lx = anc === 'start' ? x0 : anc === 'end' ? x0 + w : x0 + w / 2, ly = uy > 0 ? y0 : y0 + h;
          hecho = { ...it, x: anc === 'start' ? x0 + 2 : anc === 'end' ? x0 + w - 2 : x0 + w / 2, y: ty, anc, lx, ly }; break;
        }
        if (hecho) break;
      }
      if (hecho) out.push(hecho);
    }
    return out;
  }
  const marcas = $derived(paises.filter(p => PAISES[p.clave]).map(p => ({ px: X(PAISES[p.clave].lon), py: Y(PAISES[p.clave].lat), texto: p.clave, valor: `${Math.round((p.decimas / Math.max(1, suma)) * 100)} %`, r: 4 + 7 * Math.sqrt(p.decimas / Math.max(1, suma)) })));
  const etiquetas = $derived(vista === 'sede'
    ? colocar(marcas.slice(0, 5))
    : colocar(ventas.filter(v => v.decimas >= 15).sort((a, b) => b.decimas - a.decimas).map(v => ({ px: X(ANCLA_REGION[v.region][1]), py: Y(ANCLA_REGION[v.region][0]), texto: v.region, valor: `${Math.round(v.decimas / 10)} %`, r: 0 }))));
  const resumen = $derived(vista === 'sede'
    ? `Mapa de las sedes: ${marcas.map(m => `${m.texto} ${m.valor}`).join(', ')}.`
    : `Mapa de las ventas por región: ${ventas.filter(v => v.decimas).map(v => `${v.region} ${Math.round(v.decimas / 10)} %`).join(', ')}.`);
</script>

<svg viewBox="0 0 {W} {H}" role="img" aria-label={resumen}>
  {#each PUNTOS as p}<circle cx={p.x} cy={p.y} r={c * 0.34} style="fill: {color(p.r)}; fill-opacity: {opacidad(p.r).toFixed(2)}" />{/each}
  {#each etiquetas as e}<path d="M{e.px.toFixed(1)} {e.py.toFixed(1)}L{e.lx.toFixed(1)} {e.ly.toFixed(1)}" class="guia" />{/each}
  {#if vista === 'sede'}
    {#each marcas as m}
      <circle cx={m.px} cy={m.py} r={m.r} class="sede" />
      <circle cx={m.px} cy={m.py} r="1.5" class="centro" />
    {/each}
  {/if}
  {#each etiquetas as e}
    <text x={e.x} y={e.y} text-anchor={e.anc} class="etq">{e.texto} <tspan class="v">{e.valor}</tspan></text>
  {/each}
</svg>

<style>
  svg { display: block; width: 100%; height: auto; }
  .guia { stroke: var(--noche); stroke-opacity: .5; stroke-width: 1; fill: none; }
  .sede { fill: var(--blanco); fill-opacity: .85; stroke: var(--noche); stroke-width: 2; }
  .centro { fill: var(--noche); }
  .etq { font: 700 12px var(--f-txt); fill: var(--noche); stroke: var(--perla-hi); stroke-width: 4; stroke-linejoin: round; paint-order: stroke; }
  .v { font-family: var(--f-disp); font-weight: 600; }
</style>
