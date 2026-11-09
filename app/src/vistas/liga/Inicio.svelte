<script lang="ts">
  // Inicio de La Liga: temporada actual, mis ligas (puesto y puntos) y acciones.
  import { onMount } from 'svelte';
  import { api } from '../../lib/api';
  import type { DetalleLiga, Liga, Temporada } from '../../lib/dominio/tipos';
  import { lunesDe, numeroSemana } from '../../lib/dominio/liga';
  import { estado, avisar, mensaje } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import Cabecera from '../../componentes/liga/Cabecera.svelte';
  import { TIPO_TXT } from '../../componentes/liga/util';

  let temp = $state<Temporada | null>(null);
  let ligas = $state<Liga[]>([]);
  let detalles = $state<Record<number, DetalleLiga | null>>({});
  let cargando = $state(true), error = $state(''), apuntando = $state(false);
  const miId = $derived(estado.sesion?.usuario?.id ?? -1);
  const semana = $derived(temp ? numeroSemana(temp.inicio, lunesDe()) : 0);
  const enGeneral = $derived(ligas.some(l => l.tipo === 'general'));
  const ordenadas = $derived([...ligas].sort((a, b) => Number(a.tipo === 'general') - Number(b.tipo === 'general')));

  async function cargar() {
    cargando = true; error = '';
    try {
      [temp, ligas] = await Promise.all([api.temporadaActual(), api.misLigas()]);
      const ds = await Promise.all(ligas.map(l => api.detalleLiga(l.id).catch(() => null)));
      detalles = Object.fromEntries(ligas.map((l, i) => [l.id, ds[i]]));
    } catch (e) { error = mensaje(e); }
    finally { cargando = false; }
  }
  onMount(cargar);

  async function apuntarme() {
    apuntando = true;
    try { const l = await api.unirseGeneral(); avisar('Ya estás en la clasificación general'); ir(`/liga/${l.id}`); }
    catch (e) { avisar(mensaje(e)); }
    finally { apuntando = false; }
  }
  function estadoTxt(l: Liga, d: DetalleLiga | null): string {
    if (l.tipo === 'draft' && l.estado === 'abierta') return 'Draft sin empezar';
    if (l.tipo === 'draft' && l.estado === 'draft') return d?.draft?.turnoDe === miId ? 'Draft en marcha · te toca' : 'Draft en marcha';
    if (l.estado === 'terminada') return 'Temporada terminada';
    return `${l.miembros} ${l.miembros === 1 ? 'persona' : 'personas'}`;
  }
</script>

<main class="pagina">
  <Cabecera>
    {#snippet contexto()}{#if temp}<b>{temp.nombre}</b> · {semana >= 1 && semana <= 12 ? `semana ${semana} de 12` : semana === 0 ? 'aún no ha empezado' : 'terminada'}{:else}Temporadas de 12 semanas{/if}{/snippet}
  </Cabecera>

  <p class="lema">Compite por cuidar tu cartera, no por ganar dinero.</p>

  {#if cargando}
    <div class="pila" aria-busy="true" aria-label="Cargando tus ligas">
      {#each [1, 2] as _}<div class="tarjeta hueco"></div>{/each}
    </div>
  {:else if error}
    <div class="tarjeta pila" role="alert">
      <p class="error">{error}</p>
      <button class="btn" onclick={cargar}>Reintentar</button>
    </div>
  {:else}
    <section class="pila" aria-labelledby="mis-t">
      <h2 id="mis-t" class="eti">Mis ligas</h2>
      {#if !ligas.length}
        <div class="vacio cristal">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8l4 3 4-6 4 6 4-3-2 10H6z M6 21h12" /></svg>
          <h3>Aún no estás en ninguna liga</h3>
          <p class="tenue peq">Crea una con tus amigos o únete con su código.</p>
        </div>
      {:else}
        <ul class="ligas">
          {#each ordenadas as l (l.id)}
            {@const d = detalles[l.id]}
            {@const yo = d?.clasificacion.find(f => f.tu)}
            <li>
              <a class="liga tarjeta" href="#/liga/{l.id}">
                <span class="info">
                  <span class="nom">{l.nombre}</span>
                  <span class="meta"><span class="chip">{TIPO_TXT[l.tipo]}</span><span class="tenue peq">{estadoTxt(l, d ?? null)}</span></span>
                </span>
                {#if yo}
                  <span class="pos">
                    <span class="num p">{yo.puesto}.º</span>
                    <span class="tenue peq">de {d!.clasificacion.length} · <b class="mono">{yo.total}</b> pts</span>
                  </span>
                {/if}
                <svg class="flecha" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="acciones" aria-label="Acciones">
      <a class="btn btn-primario btn-ancho" href="#/liga/nueva">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Crear liga
      </a>
      <a class="btn btn-ancho" href="#/liga/unirse">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></svg>Unirme con código
      </a>
      {#if !enGeneral}
        <button class="btn btn-fantasma btn-ancho general" onclick={apuntarme} disabled={apuntando}>
          {apuntando ? 'Apuntándote…' : 'Apuntarme a la clasificación general (opcional)'}
        </button>
        <p class="tenue nota">La general reúne a toda la beta. Solo se ven apodos.</p>
      {/if}
    </section>
  {/if}
</main>

<style>
  .lema { font-family: var(--f-disp); font-size: var(--t-l); line-height: 1.25; color: var(--noche-2); font-style: italic; font-variation-settings: "SOFT" 100, "opsz" 30; }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  .ligas { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); }
  .liga { display: flex; align-items: center; gap: var(--s3); text-decoration: none; color: inherit; min-height: 76px; transition: transform var(--rapido) var(--muelle); }
  .liga:active { transform: scale(.985); }
  .info { flex: 1; min-width: 0; display: grid; gap: 6px; }
  .nom { font-family: var(--f-disp); font-size: var(--t-l); line-height: 1.15; overflow-wrap: anywhere; }
  .meta { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; }
  .pos { display: grid; justify-items: end; text-align: right; }
  .p { font-size: var(--t-xl); line-height: 1; }
  .pos b { color: var(--noche); }
  .flecha { width: 16px; height: 16px; flex: none; fill: none; stroke: var(--noche-3); stroke-width: 1.8; }
  .vacio { padding: var(--s5) var(--s4); display: grid; justify-items: center; gap: var(--s2); text-align: center; }
  .vacio svg { width: 40px; height: 40px; fill: none; stroke: var(--lila); stroke-width: 1.5; stroke-linejoin: round; }
  .acciones { display: grid; gap: var(--s2); }
  .acciones svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .general { color: var(--lila-t); text-decoration: underline; text-underline-offset: 3px; white-space: normal; text-align: center; }
  .nota { font-size: var(--t-xs); text-align: center; }
  .hueco { height: 76px; background: linear-gradient(90deg, var(--perla-hi), var(--blanco), var(--perla-hi)); }
</style>
