<script lang="ts">
  // Mi cartera: «cómo es y cómo cambia» (ronda40/INFORME-APP-FINAL.md §3.1, diseño Nácar 01 y 02).
  // Cabecera de la semana, selector de cartera, y tres partes: Reparto · Mapa · Evolución (#/cartera/<parte>?c=<id>).
  // El «borrador» (Probar un peso) vive aquí para que Mapa y Reparto vean los mismos pesos hasta «Quedármelo» o «Deshacer».
  import { api } from '../../lib/api';
  import { analizar } from '../../lib/dominio/cartera';
  import { FUENTE_DATOS } from '../../lib/dominio/catalogo';
  import { lunesDe, numeroSemana, SEMANAS_TEMPORADA, sumarDias } from '../../lib/dominio/liga';
  import type { Foto, Posicion, Temporada } from '../../lib/dominio/tipos';
  import { avisar, estado, mensaje, principal, recargarCarteras } from '../../lib/estado/sesion.svelte';
  import { ir, ruta } from '../../lib/router.svelte';
  import { duracion, fechaCorta, fraseEstado, msHastaFoto } from '../../componentes/cartera/util';
  import Reparto from './Reparto.svelte';
  import Mapa from './Mapa.svelte';
  import Evolucion from './Evolucion.svelte';

  let { partes = [] }: { partes?: string[] } = $props();
  const PARTES = [{ id: 'reparto', txt: 'Reparto' }, { id: 'mapa', txt: 'Mapa' }, { id: 'evolucion', txt: 'Evolución' }] as const;
  const parte = $derived(PARTES.some(p => p.id === partes[0]) ? partes[0] : 'reparto');

  // ── Cartera elegida (?c=<id>) ──
  const pedida = $derived(Number(ruta.consulta.get('c')) || null);
  const cartera = $derived(estado.carteras.find(c => c.id === pedida) || principal() || estado.carteras[0] || null);
  const propias = $derived(estado.carteras.filter(c => !c.ligaId)), drafts = $derived(estado.carteras.filter(c => c.ligaId));
  const enlace = (p: string, id = cartera?.id) => `#/cartera/${p}${id ? `?c=${id}` : ''}`;

  // ── Semana y temporada ──
  const lunes = lunesDe();
  let temporada = $state<Temporada | null>(null), errTemporada = $state('');
  async function cargarTemporada() { errTemporada = ''; try { temporada = await api.temporadaActual(); } catch (e) { errTemporada = mensaje(e); } }
  cargarTemporada();
  const nSemana = $derived(temporada ? numeroSemana(temporada.inicio, lunes) : 0);
  const textoSemana = $derived(!temporada ? '' : nSemana === 0 ? `la temporada empieza el ${fechaCorta(temporada.inicio)}` : nSemana > SEMANAS_TEMPORADA ? 'temporada terminada' : `semana ${nSemana} de ${SEMANAS_TEMPORADA}`);
  let ahora = $state(Date.now());
  $effect(() => { const t = setInterval(() => (ahora = Date.now()), 30_000); return () => clearInterval(t); });
  const cuenta = $derived(duracion(msHastaFoto(lunes, ahora)));
  const proximoLunes = fechaCorta(sumarDias(lunes, 7));

  // ── Historial (fotos de los lunes) de la cartera elegida ──
  let fotos = $state<Foto[] | null>(null), errHist = $state('');
  let pedidoHist = 0;
  async function cargarHistorial(id: number) {
    const yo = ++pedidoHist; fotos = null; errHist = '';
    try { const h = await api.historial(id); if (yo === pedidoHist) fotos = h.fotos; }
    catch (e) { if (yo === pedidoHist) errHist = mensaje(e); }
  }
  const idCartera = $derived(cartera?.id ?? null);
  $effect(() => { if (idCartera != null) cargarHistorial(idCartera); });

  // ── Borrador («Probar un peso») ──
  let borrador = $state<Posicion[] | null>(null), borradorDe = $state<number | null>(null), guardando = $state(false);
  $effect(() => { if (idCartera !== borradorDe) { borrador = null; borradorDe = idCartera; } });
  const base = $derived(cartera?.posiciones || []);
  const posiciones = $derived(borrador || base);
  const a = $derived(analizar(posiciones));
  function probar(p: Posicion[] | null) { borrador = p; }
  async function quedarmelo() {
    if (!cartera || !borrador) return; guardando = true;
    try { await api.guardarCartera(cartera.id, borrador.filter(p => p.decimas > 0)); await recargarCarteras(); borrador = null; avisar('Guardado. Contará en la foto del lunes.'); }
    catch (e) { avisar(mensaje(e)); }
    finally { guardando = false; }
  }

  // ── Selector y principal ──
  function elegir(e: Event) { const id = Number((e.currentTarget as HTMLSelectElement).value); if (id) ir(`/cartera/${parte}?c=${id}`); }
  let haciendoPrincipal = $state(false);
  async function hacerPrincipal() {
    if (!cartera) return; haciendoPrincipal = true;
    try { await api.marcarPrincipal(cartera.id); await recargarCarteras(); avisar(`«${cartera.nombre}» es ahora tu cartera principal.`); }
    catch (e) { avisar(mensaje(e)); }
    finally { haciendoPrincipal = false; }
  }
</script>

<main class="pagina mc">
  <header class="cab">
    <h1>Mi cartera</h1>
    {#if estado.carteras.length}
      <label class="selector">
        <span class="sr">Elegir cartera</span>
        <select value={cartera?.id} onchange={elegir}>
          <optgroup label="Tus carteras">
            {#each propias as c (c.id)}<option value={c.id}>{c.principal ? `${c.nombre} · principal` : c.nombre}</option>{/each}
          </optgroup>
          {#if drafts.length}
            <optgroup label="Ligas de draft">
              {#each drafts as c (c.id)}<option value={c.id}>{c.nombre}</option>{/each}
            </optgroup>
          {/if}
          <optgroup label="En equipo"><option disabled value="">Cartera en equipo · Próximamente</option></optgroup>
        </select>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6" /></svg>
      </label>
    {/if}
  </header>

  <div class="ctx">
    <span><b>Lunes {fechaCorta(lunes)}</b>{#if textoSemana} · {textoSemana}{/if}{#if errTemporada}<span class="sr"> (no se pudo cargar la temporada: {errTemporada})</span>{/if}</span>
    <span class="ejemplo" title={FUENTE_DATOS}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6L4.6 18.2A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.8L14 9V3M7.5 15h9" /></svg>Datos de ejemplo</span>
  </div>

  {#if cartera && (cartera.ligaId || !cartera.principal)}
    <div class="tipo">
      {#if cartera.ligaId}
        <span class="chip draft">Cartera de draft</span><span class="tenue peq">Solo con tus empresas de esa liga.</span>
      {:else}
        <span class="tenue peq">No es tu principal.</span>
        <button class="btn btn-fantasma mini" onclick={hacerPrincipal} disabled={haciendoPrincipal}>{haciendoPrincipal ? 'Guardando…' : 'Hacer principal'}</button>
      {/if}
    </div>
  {/if}

  {#if !estado.carteras.length}
    <section class="vacio cristal" aria-labelledby="mc-vacio">
      <span class="eti">Tu retrato</span>
      <h2 id="mc-vacio">Aún no tienes cartera</h2>
      <p class="tenue">Elige de 3 a 5 empresas y verás aquí su retrato.</p>
      <a class="btn btn-primario" href="#/construye/crear">Crear mi cartera</a>
      <p class="tenue peq">Tu primera foto será el lunes {proximoLunes}.</p>
    </section>
  {:else if cartera}
    <nav class="segmento" aria-label="Partes de Mi cartera">
      {#each PARTES as p (p.id)}<a href={enlace(p.id)} aria-current={parte === p.id ? 'page' : undefined}>{p.txt}</a>{/each}
    </nav>

    {#if parte !== 'reparto' && a.n}
      <p class="estado-linea" aria-live="polite">
        <span class="frase-estado">{fraseEstado(a)}</span>
        <span class="reloj"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>Foto del lunes en {cuenta}</span>
      </p>
    {/if}
    {#if borrador && parte !== 'reparto'}
      <p class="aviso-borrador" role="status">Estás viendo un peso de prueba. <a href={enlace('reparto')}>Volver a Reparto</a> para quedártelo o deshacerlo.</p>
    {/if}

    {#if parte === 'mapa'}
      <Mapa {a} />
    {:else if parte === 'evolucion'}
      <Evolucion {fotos} error={errHist} {lunes} {proximoLunes} onReintentar={() => cargarHistorial(cartera.id)} />
    {:else}
      <Reparto {cartera} {posiciones} {base} {a} {borrador} {fotos} errorFotos={errHist} {lunes} {cuenta} {proximoLunes} {guardando}
        onProbar={probar} onQuedarmelo={quedarmelo} onReintentar={() => cargarHistorial(cartera.id)} />
    {/if}
  {/if}
  <p class="fuente tenue">{FUENTE_DATOS}. Describe el reparto: no mide riesgo ni rentabilidad.</p>
</main>

<style>
  .mc { gap: var(--s3); }
  .cab { display: flex; align-items: center; gap: var(--s3); flex-wrap: wrap; }
  .cab h1 { font-size: 1.9rem; font-weight: 420; letter-spacing: -.02em; font-variation-settings: "SOFT" 100, "opsz" 96; }
  .selector { position: relative; display: inline-flex; align-items: center; min-width: 0; max-width: 60%; }
  .selector select { appearance: none; -webkit-appearance: none; min-height: 44px; max-width: 100%; padding: 0 36px 0 14px; border-radius: var(--r-pildora); border: 1px solid var(--linea-2); background: var(--cristal); font-weight: 600; font-size: var(--t-s); color: var(--noche); text-overflow: ellipsis; cursor: pointer; }
  .selector svg { position: absolute; right: 12px; width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
  .ctx { display: flex; align-items: center; justify-content: space-between; gap: var(--s2); flex-wrap: wrap; font-size: var(--t-s); color: var(--noche-2); margin-top: calc(-1 * var(--s2)); }
  .ctx b { color: var(--noche); }
  .ejemplo { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px 5px 8px; border-radius: var(--r-pildora); background: var(--lila-f); color: var(--lila-t); font-size: var(--t-xs); font-weight: 600; white-space: nowrap; }
  .ejemplo svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  .tipo { display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap; margin-top: calc(-1 * var(--s1)); }
  .draft { background: var(--lila-f); color: var(--lila-t); border-color: transparent; }
  .mini { min-height: 44px; padding: 0 var(--s3); color: var(--lila-t); text-decoration: underline; text-underline-offset: 3px; }
  .estado-linea { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s2); flex-wrap: wrap; }
  .frase-estado { font-family: var(--f-disp); font-variation-settings: "SOFT" 100, "opsz" 40; font-size: var(--t-l); line-height: 1.2; }
  .reloj { display: inline-flex; align-items: center; gap: 5px; font-size: var(--t-xs); font-weight: 650; color: var(--cobre-t); white-space: nowrap; }
  .reloj svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }
  .aviso-borrador { font-size: var(--t-s); padding: var(--s2) var(--s3); border-radius: var(--r); background: var(--lila-f); color: var(--lila-t); }
  .vacio { padding: var(--s5) var(--s4); display: grid; gap: var(--s3); justify-items: start; }
  .fuente { font-size: var(--t-xs); text-align: center; }
</style>
