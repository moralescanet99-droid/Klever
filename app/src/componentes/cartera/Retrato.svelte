<script lang="ts">
  // Retrato de la cartera: anillo de pesos iridiscente (un tramo por posición, color por sector) con el radar por sectores dentro
  // y el «fantasma» (la cartera de hace 1/4/8 semanas) en discontinuo. A escala: 360° = 100 %; el radar llega al 50 % (o al 100 %).
  // Interactivo: tocas un tramo y arrastras para cambiar su peso; el resto se reajusta en proporción (fijarPeso).
  // Alternativa accesible: los botones − / + de la lista de posiciones y del tramo elegido (en la vista Reparto).
  import { fijarPeso, TOTAL } from '../../lib/dominio/cartera';
  import type { Posicion } from '../../lib/dominio/tipos';
  import { anguloDe, arco, colorSector, ejesRadar, pesoPorSector, polar, tramos } from './util';

  let {
    posiciones, fantasma = null, antiguedad = 4, interactivo = false, compacto = false,
    seleccionado = $bindable(null), onCambiar, etiqueta = 'Retrato de la cartera',
  }: {
    posiciones: Posicion[]; fantasma?: Posicion[] | null; antiguedad?: number; interactivo?: boolean; compacto?: boolean;
    seleccionado?: string | null; onCambiar?: (p: Posicion[]) => void; etiqueta?: string;
  } = $props();

  const uid = `r${Math.random().toString(36).slice(2, 8)}`;
  const W = $derived(compacto ? 140 : 330), H = $derived(compacto ? 140 : 270);
  const cx = $derived(W / 2), cy = $derived(H / 2);
  const R = $derived(compacto ? 58 : 84), G = $derived(compacto ? 11 : 16); // radio de la línea central y grosor
  const rMax = $derived(R - G / 2 - (compacto ? 5 : 7));

  let rot = $state(0);
  const ts = $derived(tramos(posiciones, rot));
  const hueco = $derived(ts.length > 1 ? 0.9 : 0);
  const hoyS = $derived(pesoPorSector(posiciones)), fanS = $derived(fantasma ? pesoPorSector(fantasma) : new Map());
  const ejes = $derived(ejesRadar(ts, [...fanS.keys()]));
  const tope = $derived(Math.max(0, ...hoyS.values(), ...fanS.values()) > 500 ? TOTAL : 500); // escala del radar
  const escala = $derived(tope === TOTAL ? 100 : 50);
  const punto = (ang: number, decimas: number) => polar(cx, cy, (Math.min(decimas, tope) / tope) * rMax, ang);
  function poligono(m: Map<string, number>) {
    const pts = ejes.map(e => punto(e.ang, m.get(e.sector) || 0));
    if (pts.length < 3) pts.unshift([cx, cy]);
    return pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  }
  const colorFantasma = $derived(antiguedad >= 8 ? 'var(--alto)' : 'var(--cobre)');
  const opFantasma = $derived(antiguedad >= 8 ? 1 : antiguedad >= 4 ? 0.85 : 0.6);

  const conEtiquetas = $derived(!compacto && ts.length <= 10);
  const tonoTexto = (c: string) => `color-mix(in srgb, ${c} 68%, var(--noche))`;

  // ── Arrastre ──
  let svg: SVGSVGElement | undefined = $state();
  let arrastre: { ticker: string; base: Posicion[]; w0: number; ang0: number; acc: number; ancla: number; max: number; movido: boolean } | null = null;
  let animando = 0;
  const angPuntero = (e: PointerEvent) => {
    const r = svg!.getBoundingClientRect(), k = W / r.width;
    return anguloDe(cx, cy, (e.clientX - r.left) * k, (e.clientY - r.top) * k);
  };
  function empezar(e: PointerEvent, ticker: string) {
    if (!interactivo || posiciones.length < 2) { seleccionado = ticker; return; }
    cancelAnimationFrame(animando);
    const t = ts.find(x => x.ticker === ticker)!; seleccionado = ticker;
    const otros = posiciones.filter(p => p.ticker !== ticker), resto = otros.reduce((a, p) => a + p.decimas, 0), menor = Math.min(...otros.map(p => p.decimas));
    const max = resto ? Math.max(10, TOTAL - Math.ceil((10 * resto) / Math.max(1, menor))) : TOTAL;
    arrastre = { ticker, base: posiciones.map(p => ({ ...p })), w0: t.decimas, ang0: angPuntero(e), acc: 0, ancla: t.a0, max, movido: false };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }
  function mover(e: PointerEvent) {
    if (!arrastre) return;
    const a = angPuntero(e); let d = a - arrastre.ang0; d = ((d + 540) % 360) - 180; arrastre.ang0 = a; arrastre.acc += d;
    if (Math.abs(arrastre.acc) > 2) arrastre.movido = true;
    if (!arrastre.movido) return;
    const w = Math.max(10, Math.min(arrastre.max, Math.round((arrastre.w0 + (arrastre.acc / 360) * TOTAL) / 10) * 10));
    const nuevas = fijarPeso(arrastre.base, arrastre.ticker, w);
    const t0 = tramos(nuevas, 0).find(x => x.ticker === arrastre!.ticker);
    if (t0) rot = arrastre.ancla - t0.a0; // el inicio del tramo se queda quieto bajo el dedo
    onCambiar?.(nuevas);
  }
  function soltar() {
    if (!arrastre) return; arrastre = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { rot = 0; return; }
    // Muelle suave: el anillo vuelve a su sitio (solo transform).
    let v = 0, x = ((rot % 360) + 540) % 360 - 180, prev = performance.now();
    const paso = (t: number) => {
      const dt = Math.min(0.032, (t - prev) / 1000); prev = t;
      v += (-170 * x - 24 * v) * dt; x += v * dt; rot = x;
      if (Math.abs(x) < 0.05 && Math.abs(v) < 0.05) { rot = 0; return; }
      animando = requestAnimationFrame(paso);
    };
    animando = requestAnimationFrame(paso);
  }
  const sel = $derived(ts.find(t => t.ticker === seleccionado) || null);
  const resumen = $derived(`${etiqueta}: ${ts.map(t => `${t.ticker} ${Math.round(t.decimas / 10)} %`).join(', ')}.` + (fantasma ? ` En discontinuo, la cartera de hace ${antiguedad} ${antiguedad === 1 ? 'semana' : 'semanas'}.` : ''));
</script>

<div class="retrato" class:compacto style="aspect-ratio: {W} / {H}">
  <svg bind:this={svg} viewBox="0 0 {W} {H}" role="img" aria-label={resumen}>
    <defs>
      <radialGradient id="{uid}-rg" cx="50%" cy="50%" r="60%"><stop offset="0" style="stop-color: var(--cobre-f)" /><stop offset=".55" style="stop-color: var(--lila-f)" /><stop offset="1" style="stop-color: var(--agua-f)" /></radialGradient>
      <linearGradient id="{uid}-rs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--cobre)" /><stop offset=".5" style="stop-color: var(--lila)" /><stop offset="1" style="stop-color: var(--agua)" /></linearGradient>
      {#each ts as t, i (t.ticker)}
        {@const p0 = polar(cx, cy, R, t.a0)}{@const p1 = polar(cx, cy, R, Math.max(t.a1, t.a0 + 1))}
        <linearGradient id="{uid}-g{i}" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}>
          <stop offset="0" style="stop-color: {colorSector(t.sector)}" />
          <stop offset="1" style="stop-color: color-mix(in srgb, {colorSector(t.sector)} 48%, var(--perla-hi))" />
        </linearGradient>
      {/each}
    </defs>

    <!-- radar -->
    <g aria-hidden="true">
      {#each [0.25, 0.5, 0.75, 1] as f}
        <circle cx={cx} cy={cy} r={f * rMax} class="guia" class:borde={f === 1} />
      {/each}
      {#each ejes as e (e.sector)}
        {@const q = polar(cx, cy, rMax, e.ang)}<line x1={cx} y1={cy} x2={q[0]} y2={q[1]} class="eje" />
      {/each}
      {#if !compacto}<text x={cx + 4} y={cy - rMax + 11} class="escala">{escala} %</text>{/if}
      {#if fantasma && fanS.size}
        <polygon points={poligono(fanS)} class="fantasma" style="stroke: {colorFantasma}; fill: {colorFantasma}; opacity: {opFantasma}" />
      {/if}
      {#if hoyS.size}
        <polygon points={poligono(hoyS)} fill="url(#{uid}-rg)" stroke="url(#{uid}-rs)" class="hoy" />
        {#each ejes as e (e.sector)}
          {#if hoyS.get(e.sector)}{@const q = punto(e.ang, hoyS.get(e.sector) || 0)}<circle cx={q[0]} cy={q[1]} r={compacto ? 2.4 : 3.3} class="vertice" style="stroke: {colorSector(e.sector)}" />{/if}
        {/each}
      {/if}
    </g>

    <!-- anillo -->
    <circle cx={cx} cy={cy} r={R} class="pista" style="stroke-width: {G}" />
    {#each ts as t, i (t.ticker)}
      <path
        d={arco(cx, cy, R, t.a0 + hueco, Math.max(t.a0 + hueco + 0.2, t.a1 - hueco))}
        stroke="url(#{uid}-g{i})" style="stroke-width: {seleccionado === t.ticker ? G + 5 : G}"
        class="tramo" class:apagado={seleccionado && seleccionado !== t.ticker} class:toca={interactivo}
        onpointerdown={e => empezar(e, t.ticker)} onpointermove={mover} onpointerup={soltar} onpointercancel={soltar}
        role="presentation"
      />
    {/each}
    {#if interactivo && sel && ts.length > 1}
      {@const k = polar(cx, cy, R, sel.a1 - hueco)}
      <g class="tirador" onpointerdown={e => empezar(e, sel.ticker)} onpointermove={mover} onpointerup={soltar} onpointercancel={soltar} role="presentation">
        <circle cx={k[0]} cy={k[1]} r="20" class="zona" />
        <circle cx={k[0]} cy={k[1]} r="9" class="bola" style="stroke: {colorSector(sel.sector)}" />
        <circle cx={k[0]} cy={k[1]} r="2.6" style="fill: {colorSector(sel.sector)}" />
      </g>
    {/if}

    {#if conEtiquetas}
      {#each ts as t (t.ticker)}
        {#if t.decimas >= 50}
          {@const m = (t.a0 + t.a1) / 2}{@const q = polar(cx, cy, R + G / 2 + 20 + Math.abs(Math.sin((m * Math.PI) / 180)) * 14, m)}
          <g aria-hidden="true" class="etq" class:apagado={seleccionado && seleccionado !== t.ticker}>
            <text x={q[0]} y={q[1] - 3} class="tk">{t.ticker}</text>
            <text x={q[0]} y={q[1] + 15} class="vl" style="fill: {tonoTexto(colorSector(t.sector))}">{Math.round(t.decimas / 10)} %</text>
          </g>
        {/if}
      {/each}
    {/if}
  </svg>
  <span class="brillo" aria-hidden="true" style="left: {((cx - R - G / 2) / W) * 100}%; top: {((cy - R - G / 2) / H) * 100}%; width: {((2 * R + G) / W) * 100}%; --ri: {((R - G / 2) / (R + G / 2)) * 50}%"></span>
</div>

<style>
  .retrato { position: relative; width: 100%; max-width: 420px; margin: 0 auto; }
  .retrato.compacto { max-width: 140px; }
  svg { display: block; width: 100%; height: 100%; overflow: visible; user-select: none; -webkit-user-select: none; }
  .guia { fill: none; stroke: var(--noche); stroke-opacity: .09; stroke-dasharray: 1.5 3; }
  .guia.borde { stroke-opacity: .16; stroke-dasharray: none; }
  .eje { stroke: var(--noche); stroke-opacity: .1; }
  .escala { font: 650 10px var(--f-txt); fill: var(--noche-3); }
  .fantasma { fill-opacity: .12; stroke-width: 1.6; stroke-dasharray: 4 3; stroke-linejoin: round; }
  .hoy { fill-opacity: .92; stroke-width: 2.2; stroke-linejoin: round; }
  .vertice { fill: var(--blanco); stroke-width: 2; }
  .pista { fill: none; stroke: var(--noche); stroke-opacity: .06; }
  .tramo { fill: none; transition: opacity var(--rapido) var(--suave); }
  .tramo.toca { cursor: grab; touch-action: none; }
  .tramo.toca:active { cursor: grabbing; }
  .apagado { opacity: .42; }
  .tirador { cursor: grab; touch-action: none; }
  .zona { fill: transparent; }
  .bola { fill: var(--blanco); stroke-width: 3; filter: drop-shadow(0 2px 3px var(--linea-2)); }
  .etq { transition: opacity var(--rapido) var(--suave); }
  .tk { font: 600 11.5px var(--f-mono); fill: var(--noche-2); text-anchor: middle; letter-spacing: .02em; }
  .vl { font: 500 17px var(--f-disp); font-variation-settings: "SOFT" 100, "opsz" 30; text-anchor: middle; }
  .compacto .vertice { stroke-width: 1.5; }
  /* brillo nacarado fijo sobre el anillo (no se anima) */
  .brillo { position: absolute; aspect-ratio: 1; border-radius: 50%; pointer-events: none; mix-blend-mode: soft-light; opacity: .9;
    background: conic-gradient(from 300deg, transparent, var(--cristal-borde) 9%, transparent 20%, transparent 45%, var(--cristal-borde) 55%, transparent 66%, transparent);
    -webkit-mask: radial-gradient(circle closest-side, transparent calc(var(--ri) * 2 - 1px), #000 calc(var(--ri) * 2), #000 99%, transparent 100%);
    mask: radial-gradient(circle closest-side, transparent calc(var(--ri) * 2 - 1px), #000 calc(var(--ri) * 2), #000 99%, transparent 100%); }
</style>
