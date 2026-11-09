<script lang="ts">
  // Mi cartera › Evolución: rebobinar las fotos de los lunes (api.historial) con un cabezal arrastrable y una tira de miniaturas.
  // En cada foto: anillo pequeño con su radar, semáforos y puntos de Equilibrio que sumaba. Debajo, tus marcas personales.
  import { analizar, fmtPct } from '../../lib/dominio/cartera';
  import type { Foto } from '../../lib/dominio/tipos';
  import Retrato from '../../componentes/cartera/Retrato.svelte';
  import Semaforos from '../../componentes/cartera/Semaforos.svelte';
  import { arco, colorSector, fechaCorta, puntosEquilibrio, tramos } from '../../componentes/cartera/util';

  let { fotos, error, lunes, proximoLunes, onReintentar }: { fotos: Foto[] | null; error: string; lunes: string; proximoLunes: string; onReintentar: () => void } = $props();

  let i = $state(-1);
  $effect(() => { if (fotos && (i < 0 || i >= fotos.length)) i = fotos.length - 1; });
  const f = $derived(fotos && i >= 0 ? fotos[i] : null);
  const fa = $derived(f ? analizar(f.posiciones) : null);
  const previa = $derived(fotos && i > 0 ? fotos[i - 1] : null);
  const pts = $derived(fa ? puntosEquilibrio(fa) : null);
  const etiquetaSemana = (s: string) => (s === lunes ? `Hoy, lunes ${fechaCorta(s)}` : `Lunes ${fechaCorta(s)}`);

  // Marcas personales
  const marcas = $derived.by(() => {
    if (!fotos?.length) return null;
    const an = fotos.map(x => ({ s: x.semana, a: analizar(x.posiciones), c: x.concentracion }));
    let racha = 0, mejor = 0; for (const x of an) { racha = x.c === 'ok' ? racha + 1 : 0; mejor = Math.max(mejor, racha); }
    const maxS = an.reduce((m, x) => (x.a.sectores.length > m.a.sectores.length ? x : m), an[0]);
    const menorMayor = an.filter(x => x.a.mayor).reduce<typeof an[number] | null>((m, x) => (!m || x.a.mayor!.decimas < m.a.mayor!.decimas ? x : m), null);
    return { bajas: an.filter(x => x.c === 'ok').length, mejor, maxS, menorMayor, total: an.length };
  });

  // La tira sigue al cabezal (deslizador nativo: arrastre, teclado y lector de pantalla).
  let tira: HTMLElement | undefined = $state();
  $effect(() => {
    const el = tira && i >= 0 ? tira.querySelector<HTMLElement>(`[data-i="${i}"]`) : null; if (!el || !tira) return;
    tira.scrollTo({ left: el.offsetLeft - tira.clientWidth / 2 + el.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
</script>

{#if error}
  <section class="tarjeta pila" role="alert">
    <h2>No he podido cargar tus fotos</h2>
    <p class="error">{error}</p>
    <button class="btn" onclick={onReintentar}>Reintentar</button>
  </section>
{:else if !fotos}
  <section class="tarjeta" aria-busy="true"><p class="tenue">Cargando tus lunes…</p></section>
{:else if !fotos.length}
  <section class="cristal vacia" aria-labelledby="ev-vacia">
    <span class="eti">Rebobinar</span>
    <h2 id="ev-vacia">Tu primera foto será el lunes {proximoLunes}</h2>
    <p class="tenue">Cada lunes a las 00:00 guardamos cómo está tu cartera. Aquí podrás rebobinarlas.</p>
  </section>
{:else if f && fa}
  <section class="cristal rebobinar" aria-labelledby="ev-titulo">
    <div class="fila entre"><span class="eti">Rebobinar · {fotos.length} {fotos.length === 1 ? 'lunes' : 'lunes'}</span><span class="tenue peq">Foto a las 00:00</span></div>
    <h2 id="ev-titulo" class="titulo" aria-live="polite">{etiquetaSemana(f.semana)}</h2>

    <div class="detalle">
      <Retrato posiciones={f.posiciones} fantasma={previa?.posiciones || null} antiguedad={1} compacto etiqueta="Cartera del lunes {fechaCorta(f.semana)}" />
      <div class="datos">
        <p><span class="num grande">{fa.n}</span> posiciones · <span class="num grande">{fa.sectores.length}</span> sectores</p>
        {#if fa.mayor}<p class="tenue peq">Mayor: <span class="mono">{fa.mayor.ticker}</span> {fmtPct(fa.mayor.decimas)}</p>{/if}
        <p class="peq">Equilibrio: <b class="num">{pts!.puntos}</b> de 50{#if !pts!.valida} <span class="tenue">({pts!.motivo})</span>{/if}</p>
        {#if previa}<p class="tenue peq"><span class="linea-f" aria-hidden="true"></span>En discontinuo, el lunes anterior.</p>{/if}
      </div>
    </div>
    <Semaforos a={fa} posiciones={f.posiciones} compacto />

    <div class="tira" bind:this={tira} role="group" aria-label="Lunes guardados">
      {#each fotos as x, k (x.semana)}
        {@const ts = tramos(x.posiciones)}
        <button data-i={k} class="mini" aria-pressed={k === i} onclick={() => (i = k)} aria-label={etiquetaSemana(x.semana)}>
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="15" class="pista" />
            {#each ts as t (t.ticker)}<path d={arco(20, 20, 15, t.a0 + (ts.length > 1 ? 2 : 0), Math.max(t.a0 + 2.5, t.a1 - (ts.length > 1 ? 2 : 0)))} style="stroke: {colorSector(t.sector)}" />{/each}
            {#if x.concentracion === 'ok'}<circle cx="20" cy="20" r="3.5" class="baja" />{/if}
          </svg>
          <span>{fechaCorta(x.semana)}</span>
        </button>
      {/each}
    </div>
    <label class="cabezal">
      <span class="sr">Semana que se ve</span>
      <input type="range" min="0" max={fotos.length - 1} step="1" bind:value={i} aria-valuetext={etiquetaSemana(f.semana)} disabled={fotos.length < 2} />
    </label>
    <p class="tenue peq centro">Arrastra el cabezal para rebobinar. Punto central: concentración baja.</p>
  </section>

  {#if marcas}
    <section class="pila" aria-labelledby="ev-marcas">
      <h2 id="ev-marcas" class="eti">Tus marcas personales</h2>
      <ul class="marcas">
        <li><span class="num valor">{marcas.bajas}</span><span>{marcas.bajas === 1 ? 'lunes' : 'lunes'} con concentración baja <span class="tenue">de {marcas.total}</span></span></li>
        <li><span class="num valor">{marcas.mejor}</span><span>mejor racha seguida con concentración baja</span></li>
        <li><span class="num valor">{marcas.maxS.a.sectores.length}</span><span>sectores como máximo <span class="tenue">(lunes {fechaCorta(marcas.maxS.s)})</span></span></li>
        {#if marcas.menorMayor}<li><span class="num valor">{Math.round(marcas.menorMayor.a.mayor!.decimas / 10)} %</span><span>tu mayor posición más pequeña <span class="tenue">(lunes {fechaCorta(marcas.menorMayor.s)})</span></span></li>{/if}
      </ul>
    </section>
  {/if}
{/if}

<style>
  .vacia { padding: var(--s5) var(--s4); display: grid; gap: var(--s2); }
  .rebobinar { padding: var(--s4); display: grid; gap: var(--s3); min-width: 0; }
  .titulo { font-size: 1.3rem; font-weight: 440; }
  .detalle { display: grid; grid-template-columns: 132px 1fr; gap: var(--s3); align-items: center; }
  .datos { display: grid; gap: 4px; min-width: 0; }
  .grande { font-size: var(--t-l); }
  .linea-f { display: inline-block; width: 16px; border-top: 2px dashed var(--cobre); vertical-align: middle; margin-right: 6px; }
  .tira { position: relative; display: flex; gap: 4px; overflow-x: auto; scroll-snap-type: x proximity; padding: 2px; margin: 0 calc(-1 * var(--s1)); scrollbar-width: thin; }
  .mini { flex: none; scroll-snap-align: center; display: grid; justify-items: center; gap: 2px; width: 52px; min-height: 64px; padding: 4px 0; border-radius: var(--r-s); border: 1px solid transparent; background: transparent; cursor: pointer; font-size: var(--t-xs); color: var(--noche-2); }
  .mini[aria-pressed="true"] { background: var(--blanco); border-color: var(--linea-2); color: var(--noche); font-weight: 700; }
  .mini svg { width: 36px; height: 36px; }
  .mini path { fill: none; stroke-width: 6; }
  .mini .pista { fill: none; stroke: var(--noche); stroke-opacity: .06; stroke-width: 6; }
  .mini .baja { fill: var(--ok); }
  .cabezal input { width: 100%; min-height: 44px; accent-color: var(--lila); cursor: grab; }
  .centro { text-align: center; }
  .marcas { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
  .marcas li { display: grid; gap: 2px; align-content: start; padding: var(--s3); border-radius: var(--r); background: var(--blanco); border: 1px solid var(--linea); font-size: var(--t-s); }
  .valor { font-size: var(--t-xl); line-height: 1; }
</style>
