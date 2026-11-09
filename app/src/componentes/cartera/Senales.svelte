<script lang="ts">
  // Señales orientativas de lib/dominio/cartera.ts (no son normas ni recomendaciones).
  import type { Senal } from '../../lib/dominio/cartera';
  let { senales }: { senales: Senal[] } = $props();
</script>
<ul class="senales" aria-live="polite">
  {#each senales as s (s.id)}
    <li class="senal {s.nivel}">
      <span class="ico" aria-hidden="true">{s.nivel === 'ok' ? '✓' : s.nivel === 'alerta' ? '!' : 'i'}</span>
      <span><b>{s.titulo}</b><span class="sr"> ({s.nivel === 'alerta' ? 'alerta' : s.nivel === 'aviso' ? 'aviso' : 'bien'})</span><br /><span class="det">{s.detalle}</span></span>
    </li>
  {/each}
</ul>
<style>
  .senales { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  .senal { display: flex; gap: var(--s3); align-items: flex-start; padding: var(--s3); border-radius: var(--r); background: var(--blanco); border: 1px solid var(--linea); font-size: var(--t-s); line-height: 1.4; }
  .ico { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: var(--t-xs); }
  .ok .ico { background: var(--ok-f); color: var(--ok); }
  .aviso .ico { background: var(--medio-f); color: var(--medio); }
  .alerta .ico { background: var(--alto-f); color: var(--alto); }
  .det { color: var(--noche-2); }
</style>
