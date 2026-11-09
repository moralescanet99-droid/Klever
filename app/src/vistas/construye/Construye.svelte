<script lang="ts">
  // Klever v1 · CONSTRUYE (pestaña central): Crear · Descubrir · Equipo, más la ficha y el comparador.
  // Rutas: #/construye · /crear · /descubrir · /empresa/T · /comparar/A/B · /equipo
  import { FUENTE_DATOS } from '../../lib/dominio/catalogo';
  import { principal } from '../../lib/estado/sesion.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';
  import Crear from './Crear.svelte';
  import Descubrir from './Descubrir.svelte';
  import Ficha from './Ficha.svelte';
  import Comparar from './Comparar.svelte';
  import Equipo from './Equipo.svelte';

  let { partes = [] }: { partes?: string[] } = $props();

  // Portada: quien aún no tiene cartera empieza en Crear; quien ya la tiene, en Descubrir.
  const sub = $derived(partes[0] || (principal()?.posiciones.length ? 'descubrir' : 'crear'));
  const seg = $derived(sub === 'empresa' || sub === 'comparar' ? 'descubrir' : sub);
  const CONTEXTO: Record<string, [string, string]> = {
    crear: ['Crear', 'en un minuto'],
    descubrir: ['Descubrir', 'el feed tiene final'],
    empresa: ['Ficha', 'datos, no consejos'],
    comparar: ['Comparar dos', 'lado a lado'],
    equipo: ['Equipo', 'próximamente'],
  };
  const ctx = $derived(CONTEXTO[sub] || CONTEXTO.descubrir);
  const SEGMENTOS = [{ id: 'crear', txt: 'Crear' }, { id: 'descubrir', txt: 'Descubrir' }, { id: 'equipo', txt: 'Equipo' }];
</script>

<main class="pagina construye">
  <header class="cab">
    <h1>Construye</h1>
    <div class="fila entre ctx">
      <p><b>{ctx[0]}</b> · {ctx[1]}</p>
      <span class="chip ejemplo" title={FUENTE_DATOS}><Ico n="matraz" tam={14} />Datos de ejemplo</span>
    </div>
  </header>
  <nav class="segmento seg" aria-label="Apartados de Construye">
    {#each SEGMENTOS as s (s.id)}
      <a href="#/construye/{s.id}" aria-current={seg === s.id ? 'page' : undefined}>{s.txt}</a>
    {/each}
  </nav>

  {#if sub === 'crear'}<Crear />
  {:else if sub === 'equipo'}<Equipo />
  {:else if sub === 'empresa'}<Ficha ticker={(partes[1] || '').toUpperCase()} />
  {:else if sub === 'comparar'}<Comparar a={(partes[1] || '').toUpperCase()} b={(partes[2] || '').toUpperCase()} />
  {:else if sub === 'descubrir'}<Descubrir />
  {:else}
    <section class="tarjeta pila" aria-live="polite">
      <h2>Aquí no hay nada</h2>
      <p class="tenue">Esa dirección no existe en Construye.</p>
      <a class="btn btn-primario" href="#/construye/descubrir">Ir a Descubrir</a>
    </section>
  {/if}
</main>

<style>
  .construye { gap: var(--s3); }
  .cab { display: grid; gap: var(--s2); }
  .cab h1 { font-size: var(--t-xxl); font-weight: 450; line-height: 1; }
  .ctx { flex-wrap: nowrap; }
  .ctx p { font-size: var(--t-m); color: var(--noche-2); min-width: 0; }
  .ctx b { color: var(--noche); font-weight: 700; }
  .ejemplo { flex: none; background: var(--lila-f); color: var(--lila-t); border-color: transparent; }
  .seg a { min-height: 44px; }
  @media (max-width: 360px) { .ctx { flex-wrap: wrap; } }
</style>
