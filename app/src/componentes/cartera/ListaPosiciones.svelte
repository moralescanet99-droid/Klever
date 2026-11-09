<script lang="ts">
  // Lista de posiciones: mini huella, sector y peso, con − / + (paso 1 %) y «Quitar».
  // Gesto: deslizar a la izquierda para quitar (alternativa: tocar la fila y pulsar «Quitar»).
  import { fmtPct } from '../../lib/dominio/cartera';
  import { empresa } from '../../lib/dominio/catalogo';
  import type { Posicion } from '../../lib/dominio/tipos';
  import Huella from './Huella.svelte';
  import { colorSector, sectorDe } from './util';

  let { posiciones, base, seleccionado = $bindable(null), onPaso, onQuitar }: {
    posiciones: Posicion[]; base: Posicion[]; seleccionado?: string | null; onPaso: (t: string, delta: number) => void; onQuitar: (t: string) => void;
  } = $props();
  const filas = $derived([...posiciones].filter(p => p.decimas > 0).sort((a, b) => b.decimas - a.decimas || a.ticker.localeCompare(b.ticker)));
  const antes = (t: string) => base.find(p => p.ticker === t)?.decimas ?? 0;

  // Deslizar para quitar
  const UMBRAL = 110;
  let gesto: { t: string; x0: number; y0: number; dx: number; activo: boolean; id: number } | null = $state(null);
  function abajo(e: PointerEvent, t: string) {
    if ((e.target as Element).closest('.peso')) return;
    gesto = { t, x0: e.clientX, y0: e.clientY, dx: 0, activo: false, id: e.pointerId };
  }
  function mueve(e: PointerEvent) {
    if (!gesto || e.pointerId !== gesto.id) return;
    const dx = e.clientX - gesto.x0, dy = e.clientY - gesto.y0;
    if (!gesto.activo) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesto = null; return; } if (Math.abs(dx) > 8) { gesto.activo = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); } }
    if (gesto.activo) gesto.dx = Math.min(0, dx);
  }
  function arriba(t: string) {
    if (!gesto) return; const g = gesto; gesto = null;
    if (g.activo && g.dx < -UMBRAL) onQuitar(t); // si no llega al umbral, la fila vuelve con un muelle (transición CSS)
  }
  const desplaza = (t: string) => (gesto && gesto.t === t && gesto.activo ? gesto.dx : 0);
</script>

<ul class="lista">
  {#each filas as p (p.ticker)}
    {@const e = empresa(p.ticker)!}{@const dx = desplaza(p.ticker)}{@const cambio = p.decimas !== antes(p.ticker)}
    <li class:sel={seleccionado === p.ticker}>
      <div class="fondo" aria-hidden="true" style="opacity: {Math.min(1, -dx / UMBRAL)}">Quitar</div>
      <div class="fila-p" class:arrastrando={dx !== 0} style="transform: translateX({dx}px)"
        onpointerdown={ev => abajo(ev, p.ticker)} onpointermove={mueve} onpointerup={() => arriba(p.ticker)} onpointercancel={() => (gesto = null)} role="presentation">
        <button class="info" onclick={() => (seleccionado = seleccionado === p.ticker ? null : p.ticker)} aria-expanded={seleccionado === p.ticker} aria-label="{p.ticker}, {e.nombre}, {e.sector}, {fmtPct(p.decimas)}. Ver opciones">
          <span class="l1"><span class="mono tk">{p.ticker}</span><span class="nom">{e.nombre}</span></span>
          <span class="l2"><span class="punto" style="color: {colorSector(sectorDe(p.ticker))}"></span><span class="sec">{e.sector}</span><Huella huella={e.huella} /></span>
        </button>
        <div class="peso">
          <button class="btn btn-icono paso" onclick={() => onPaso(p.ticker, -10)} disabled={filas.length < 2 || p.decimas <= 10} aria-label="Bajar {p.ticker} un 1 %">−</button>
          <span class="num pct" class:cambio aria-live="polite">{fmtPct(p.decimas)}</span>
          <button class="btn btn-icono paso" onclick={() => onPaso(p.ticker, 10)} disabled={filas.length < 2} aria-label="Subir {p.ticker} un 1 %">+</button>
        </div>
      </div>
      {#if seleccionado === p.ticker}
        <div class="extra">
          <p class="tenue peq">{e.descripcion} Sede: {e.pais.replace(/\.$/, "")}.{cambio ? ` Antes: ${fmtPct(antes(p.ticker))}.` : ''}</p>
          <button class="btn quitar" onclick={() => onQuitar(p.ticker)}>Quitar</button>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .lista { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  li { position: relative; border-radius: var(--r); overflow: hidden; background: var(--alto-f); }
  .fondo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; padding-right: var(--s4); color: var(--alto); font-weight: 700; font-size: var(--t-s); }
  .fila-p { position: relative; display: flex; align-items: center; gap: var(--s2); padding: var(--s1) var(--s1) var(--s1) var(--s3); background: var(--blanco); border: 1px solid var(--linea); border-radius: var(--r); touch-action: pan-y; transition: transform var(--medio-t) var(--muelle); }
  .fila-p.arrastrando { transition: none; }
  li.sel .fila-p { border-color: var(--lila); }
  .info { flex: 1; min-width: 0; display: grid; gap: 3px; text-align: left; background: none; border: 0; padding: 6px 0; cursor: pointer; min-height: 44px; }
  .l1 { display: flex; align-items: baseline; gap: var(--s2); min-width: 0; }
  .tk { font-weight: 600; font-size: var(--t-s); }
  .nom { font-size: var(--t-s); color: var(--noche-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .l2 { display: flex; align-items: center; gap: 6px; font-size: var(--t-xs); color: var(--noche-3); min-width: 0; }
  .sec { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .peso { display: flex; align-items: center; flex: none; }
  .paso { border-color: transparent; background: transparent; font-size: 1.25rem; }
  .pct { min-width: 3.6ch; text-align: center; font-size: 1.12rem; }
  .pct.cambio { color: var(--lila-t); }
  .extra { position: relative; background: var(--blanco); border: 1px solid var(--linea); border-top: 0; margin-top: -8px; padding: var(--s3) var(--s3) var(--s2); border-radius: 0 0 var(--r) var(--r); display: flex; align-items: center; gap: var(--s3); }
  .extra p { flex: 1; }
  .quitar { color: var(--alto); flex: none; }
</style>
