<script lang="ts" module>
  let siguiente = 0; // ids únicos para los degradados (varias flores en la misma pantalla)
</script>

<script lang="ts">
  // HUELLA EN FLOR: 5 pétalos, uno por comprobación (EJES_HUELLA, en orden).
  // Lleno y largo = cumple · pequeño = no cumple · hueco (solo contorno) = sin datos. Sin datos ≠ no cumple.
  import { EJES_HUELLA, type Huella } from '../../lib/dominio/tipos';
  import { estadoCheck, textoHuella } from '../../vistas/construye/construye';
  import Ico from './Ico.svelte';

  let { huella, nombre = '', tamano = 'grande', animar = false }: {
    huella: Huella; nombre?: string; tamano?: 'grande' | 'medio' | 'mini'; animar?: boolean;
  } = $props();

  const id = `hf${++siguiente}`;
  const L = 72, R_ETI = 90, CY = 104;
  const lado = $derived(tamano === 'grande' ? 200 : tamano === 'medio' ? 150 : 34);
  const petalos = $derived(EJES_HUELLA.map((e, i) => {
    const v = huella[e.clave], ang = i * 72, len = v === false ? L * 0.48 : L, w = v === false ? 13 : 22;
    const d = `M0 0 C ${-w} ${-len * 0.35}, ${-w * 0.7} ${-len * 0.9}, 0 ${-len} C ${w * 0.7} ${-len * 0.9}, ${w} ${-len * 0.35}, 0 0 Z`;
    const rad = ang * Math.PI / 180, x = R_ETI * Math.sin(rad), y = -R_ETI * Math.cos(rad) - (i === 0 ? 4 : 0);
    const ancla = Math.abs(Math.sin(rad)) < 0.2 ? 'arriba' : Math.sin(rad) > 0 ? 'inicio' : 'fin';
    return { ...e, v, ang, len, d, x, y, ancla };
  }));
  const etiqueta = $derived(`Huella${nombre ? ` de ${nombre}` : ''}: ${textoHuella(huella)}. ` + petalos.map(p => `${p.etiqueta}: ${estadoCheck(p.v).toLowerCase()}`).join(', ') + '.');
</script>

<div class="flor {tamano}" class:anima={animar} role="img" aria-label={etiqueta} style="--lado:{lado}px">
  <svg width={lado} height={lado} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="{id}-si" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" style="stop-color:var(--cobre);stop-opacity:.42" />
        <stop offset=".55" style="stop-color:var(--lila);stop-opacity:.42" />
        <stop offset="1" style="stop-color:var(--agua);stop-opacity:.5" />
      </linearGradient>
      <linearGradient id="{id}-no" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" style="stop-color:var(--alto);stop-opacity:.14" />
        <stop offset="1" style="stop-color:var(--cobre);stop-opacity:.5" />
      </linearGradient>
    </defs>
    {#if tamano !== 'mini'}
      <circle r={L + 6} class="aro" />
      <circle r={L * 0.5} class="aro2" />
    {/if}
    {#each petalos as p, i (p.clave)}
      <g transform="rotate({p.ang})">
        <g class="petalo" style="animation-delay:{i * 60}ms">
          {#if p.v === null}
            <path d={p.d} class="hueco" />
          {:else}
            <path d={p.d} fill="url(#{id}-{p.v ? 'si' : 'no'})" class={p.v ? 'lleno' : 'corto'} />
            {#if tamano !== 'mini'}<path d="M0 0 L0 {-p.len * 0.8}" class="nervio" />{/if}
          {/if}
        </g>
      </g>
    {/each}
    <circle r={tamano === 'mini' ? 12 : 7} class="centro" />
  </svg>
  {#if tamano === 'grande'}
    {#each petalos as p (p.clave)}
      <span class="comp {p.v === true ? 'si' : p.v === false ? 'no' : 'nd'} {p.ancla}" style="left:calc(50% + {p.x}px);top:{CY + p.y}px" aria-hidden="true">
        <span class="m"><Ico n={p.v === true ? 'ok' : p.v === false ? 'no' : 'nd'} tam={12} /></span>{p.etiqueta}
      </span>
    {/each}
  {/if}
</div>

<style>
  .flor { position: relative; display: grid; place-items: center; }
  .flor.grande { width: 100%; height: 200px; }
  .flor.grande svg { position: absolute; left: 50%; top: 104px; transform: translate(-50%, -50%); }
  .flor.mini, .flor.medio { width: var(--lado); height: var(--lado); }
  .aro { fill: none; stroke: var(--noche); stroke-opacity: .12; stroke-dasharray: 1.5 3.5; }
  .aro2 { fill: none; stroke: var(--noche); stroke-opacity: .08; }
  .lleno { stroke: var(--lila); stroke-opacity: .6; stroke-width: 1.3; }
  .corto { stroke: var(--alto); stroke-opacity: .65; stroke-width: 1.3; }
  .hueco { fill: none; stroke: var(--noche-3); stroke-width: 1.4; stroke-dasharray: 4 3.5; }
  .mini .lleno, .mini .corto { stroke-width: 6; }
  .mini .hueco { stroke-width: 6; stroke-dasharray: 10 8; }
  .nervio { stroke: var(--blanco); stroke-opacity: .85; stroke-width: 1.1; }
  .centro { fill: var(--blanco); stroke: var(--noche); stroke-opacity: .25; }
  .mini .centro { stroke-width: 5; }

  .anima .petalo { animation: brote var(--lento) var(--muelle) both; transform-box: view-box; transform-origin: 0 0; }
  @keyframes brote { from { transform: scale(.25); opacity: 0; } }

  .comp { position: absolute; display: inline-flex; align-items: center; gap: 7px; font-size: var(--t-s); font-weight: 600; line-height: 1; white-space: nowrap; color: var(--noche); transform: translate(-6px, -50%); }
  .comp.arriba { transform: translate(-50%, -50%); }
  .comp.fin { transform: translate(calc(-100% + 6px), -50%); }
  .comp .m { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; }
  .comp.si .m { background: var(--ok-f); color: var(--ok); }
  .comp.no .m { background: var(--alto-f); color: var(--alto); }
  .comp.nd .m { background: var(--perla-hi); color: var(--noche-3); box-shadow: inset 0 0 0 1.5px var(--linea-2); }
  .comp.no, .comp.nd { color: var(--noche-2); }
  @media (prefers-reduced-motion: reduce) { .anima .petalo { animation: none; } }
</style>
