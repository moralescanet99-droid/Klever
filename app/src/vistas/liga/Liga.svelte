<script lang="ts">
  // La Liga · enrutado interno: [] inicio · ['nueva'] · ['unirse'] · [id] detalle · [id,'draft'] · [id,'resumen'].
  import Inicio from './Inicio.svelte';
  import Nueva from './Nueva.svelte';
  import Unirse from './Unirse.svelte';
  import Detalle from './Detalle.svelte';
  import Draft from './Draft.svelte';
  import Resumen from './Resumen.svelte';
  let { partes = [] }: { partes?: string[] } = $props();
  const id = $derived(/^\d+$/.test(partes[0] || '') ? Number(partes[0]) : null);
</script>

{#if !partes.length}<Inicio />
{:else if partes[0] === 'nueva'}<Nueva />
{:else if partes[0] === 'unirse'}<Unirse />
{:else if id != null && partes[1] === 'draft'}{#key id}<Draft {id} />{/key}
{:else if id != null && partes[1] === 'resumen'}{#key id}<Resumen {id} />{/key}
{:else if id != null && !partes[1]}{#key id}<Detalle {id} />{/key}
{:else}
  <main class="pagina">
    <h1>No encuentro esa página</h1>
    <p class="tenue">El enlace no corresponde a ninguna liga.</p>
    <a class="btn btn-primario" href="#/liga">Volver a La Liga</a>
  </main>
{/if}
