<script lang="ts">
  // Cabecera de La Liga (fotos 03/04): título, selector de liga, contexto y segmento Semana · Draft · Resumen.
  import type { Liga } from '../../lib/dominio/tipos';
  import { FUENTE_DATOS } from '../../lib/dominio/catalogo';
  import { ir } from '../../lib/router.svelte';
  import type { Snippet } from 'svelte';
  let { liga = null, ligas = [], seccion = 'semana', contexto }: { liga?: Liga | null; ligas?: Liga[]; seccion?: 'semana' | 'draft' | 'resumen'; contexto?: Snippet } = $props();
  function cambiar(e: Event) {
    const v = (e.currentTarget as HTMLSelectElement).value;
    if (v === 'inicio') ir('/liga'); else if (v) ir(`/liga/${v}`);
  }
</script>

<header class="cab">
  <div class="fila1">
    <h1>La Liga</h1>
    {#if liga}
      <label class="selector">
        <span class="sr">Cambiar de liga</span>
        <select value={String(liga.id)} onchange={cambiar}>
          {#each ligas.length ? ligas : [liga] as l (l.id)}<option value={String(l.id)}>{l.nombre}</option>{/each}
          <option value="inicio">Todas mis ligas…</option>
        </select>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
      </label>
    {/if}
  </div>
  <div class="fila2">
    <p class="ctx">{@render contexto?.()}</p>
    <span class="chip ejemplo" title={FUENTE_DATOS}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2" /></svg>Datos de ejemplo</span>
  </div>
  {#if liga}
    <nav class="segmento" aria-label="Secciones de la liga">
      <a href="#/liga/{liga.id}" aria-current={seccion === 'semana' ? 'page' : undefined}>Semana</a>
      {#if liga.tipo === 'draft'}<a href="#/liga/{liga.id}/draft" aria-current={seccion === 'draft' ? 'page' : undefined}>Draft</a>{/if}
      <a href="#/liga/{liga.id}/resumen" aria-current={seccion === 'resumen' ? 'page' : undefined}>Resumen</a>
    </nav>
  {/if}
</header>

<style>
  .cab { display: grid; gap: var(--s3); }
  .fila1 { display: flex; align-items: center; gap: var(--s3); min-width: 0; }
  h1 { font-size: 2.3rem; line-height: 1; letter-spacing: -.02em; flex: none; }
  .selector { position: relative; min-width: 0; flex: 0 1 auto; }
  select { appearance: none; -webkit-appearance: none; max-width: 100%; min-height: 44px; padding: 0 38px 0 16px; border-radius: var(--r-pildora); border: 1px solid var(--linea-2); background: var(--blanco); font-weight: 650; font-size: var(--t-m); color: var(--noche); text-overflow: ellipsis; cursor: pointer; }
  .selector svg { position: absolute; right: 14px; top: 50%; width: 16px; height: 16px; transform: translateY(-50%); fill: none; stroke: currentColor; stroke-width: 1.8; pointer-events: none; }
  .fila2 { display: flex; align-items: center; justify-content: space-between; gap: var(--s2); flex-wrap: wrap; }
  .ctx { font-size: var(--t-m); color: var(--noche-2); }
  .ctx :global(b) { color: var(--noche); font-weight: 700; }
  .ejemplo { background: var(--lila-f); color: var(--lila-t); border-color: transparent; }
  .ejemplo svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; }
  .segmento a { min-height: 40px; }
  @media (max-width: 380px) { h1 { font-size: 2rem; } select { font-size: var(--t-s); } }
</style>
