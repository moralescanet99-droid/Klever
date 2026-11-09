<script lang="ts">
  // Etiquetas de una empresa: sector (con su color), país de la sede y moneda en la que informa.
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import type { Empresa } from '../../lib/dominio/tipos';
  import Ico from './Ico.svelte';
  let { e }: { e: Empresa } = $props();
</script>

<ul class="meta" aria-label="Datos básicos">
  <li><span class="punto" style="color:{COLOR_SECTOR[e.sector]}" aria-hidden="true"></span><span class="sr">Sector: </span>{e.sector}</li>
  <li><Ico n="pin" tam={15} /><span class="sr">Sede: </span>{e.pais}</li>
  <li><Ico n="moneda" tam={15} /><span class="sr">Informa en </span>{e.moneda}</li>
</ul>

<style>
  .meta { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .meta li { min-height: 28px; padding: 0 10px; border-radius: var(--r-pildora); display: inline-flex; align-items: center; gap: 6px; font-size: var(--t-s); font-weight: 600; color: var(--noche-2); background: var(--perla-hi); border: 1px solid var(--linea); }
</style>
