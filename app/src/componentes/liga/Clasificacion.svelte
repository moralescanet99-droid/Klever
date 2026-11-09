<script lang="ts">
  // Clasificación de la liga: solo apodos, la mía resaltada, desempate explicado.
  import type { FilaClasificacion } from '../../lib/dominio/tipos';
  import Avatar from './Avatar.svelte';
  let { filas }: { filas: FilaClasificacion[] } = $props();
</script>

<section class="clas" aria-labelledby="clas-t">
  <div class="cab"><h2 id="clas-t" class="eti">Clasificación · total</h2><span class="tenue peq">solo apodos</span></div>
  {#if !filas.length}
    <p class="tenue peq">Aún no hay nadie en la clasificación.</p>
  {:else}
    <ol>
      {#each filas as f (f.usuarioId)}
        <li class:tu={f.tu} aria-current={f.tu ? 'true' : undefined}>
          <span class="p mono">{f.puesto}</span>
          <Avatar apodo={f.apodo} id={f.usuarioId} tu={f.tu} tam={24} />
          <span class="ap">@{f.apodo}{#if f.tu}<span class="tu-t"> · tú</span>{/if}</span>
          <span class="pt mono" aria-label="{f.total} puntos">{f.total}</span>
        </li>
      {/each}
    </ol>
    <p class="tenue desempate">Si hay empate, gana quien tuvo más semanas con concentración baja.</p>
  {/if}
</section>

<style>
  .clas { display: grid; gap: var(--s1); }
  .cab { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--s1); }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  li { display: grid; grid-template-columns: 22px 24px 1fr auto; align-items: center; gap: 10px; min-height: 36px; padding: 0 10px; margin: 0 -10px; border-radius: var(--r-pildora); font-weight: 550; }
  li .ap { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p { font-size: var(--t-s); font-weight: 600; color: var(--noche-3); text-align: right; }
  .pt { font-size: var(--t-m); font-weight: 600; }
  li.tu { background: linear-gradient(90deg, var(--cobre-f), var(--lila-f) 60%, var(--agua-f)); font-weight: 750; }
  .tu-t { font-weight: 600; color: var(--noche-2); }
  .desempate { font-size: var(--t-xs); margin-top: var(--s1); }
</style>
