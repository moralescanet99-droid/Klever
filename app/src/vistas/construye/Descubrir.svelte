<script lang="ts">
  // DESCUBRIR: feed de tarjetas con FINAL (10 empresas al día, deterministas por fecha + usuario; sin «lo más popular»).
  // Gestos: deslizar entre tarjetas, con botones Anterior/Siguiente y flechas del teclado como alternativa.
  import { CATALOGO } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import { estado, mensaje } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import HuellaFlor from '../../componentes/empresa/HuellaFlor.svelte';
  import EmpresaMeta from '../../componentes/empresa/EmpresaMeta.svelte';
  import Ico from '../../componentes/empresa/Ico.svelte';
  import ConstruyeFiltros from '../../componentes/base/ConstruyeFiltros.svelte';
  import { cuenta, diaMadrid, empresasDeHoy, POR_DIA } from './construye';
  import { feed, probarEnMiCartera } from './acciones.svelte';

  const hoy = diaMadrid();
  if (feed.dia !== hoy) { feed.dia = hoy; feed.indice = 0; feed.fin = false; }

  const uid = $derived(estado.sesion?.usuario?.id ?? 0);
  const lista = $derived(empresasDeHoy(hoy, uid, { sector: feed.sector, pais: feed.pais }));
  const n = $derived(lista.length);
  const i = $derived(Math.min(feed.indice, Math.max(0, n - 1)));
  const actual = $derived(lista[i]);
  const filtrado = $derived(!!(feed.sector || feed.pais));

  let dir = $state(1);
  let ocupado = $state(false), error = $state('');
  let comparando = $state(false), compA = $state(''), compB = $state('');
  const ORDEN_NOMBRE = [...CATALOGO].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  function siguiente() { error = ''; dir = 1; if (i >= n - 1) feed.fin = true; else feed.indice = i + 1; }
  function anterior() { error = ''; dir = -1; if (feed.fin) feed.fin = false; else if (i > 0) feed.indice = i - 1; }
  function deNuevo() { dir = 1; feed.indice = 0; feed.fin = false; }
  function cambiaFiltro() { feed.indice = 0; feed.fin = false; error = ''; }
  function quitarFiltros() { feed.sector = ''; feed.pais = ''; cambiaFiltro(); }
  function abrirComparar() {
    comparando = !comparando;
    if (comparando) { compA = actual?.ticker || lista[0]?.ticker || CATALOGO[0].ticker; compB = lista.find(e => e.ticker !== compA)?.ticker || CATALOGO[1].ticker; }
  }
  async function probar(t: string) {
    ocupado = true; error = '';
    try { await probarEnMiCartera(t); } catch (e) { error = mensaje(e); } finally { ocupado = false; }
  }

  // ── Deslizar (puntero) ──
  let dx = $state(0), arrastrando = $state(false);
  let x0 = 0, y0 = 0, puntero: number | null = null, horizontal = false;
  function abajo(e: PointerEvent) {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, a, select, input')) return;
    x0 = e.clientX; y0 = e.clientY; puntero = e.pointerId; horizontal = false; arrastrando = true; dx = 0;
  }
  function mueve(e: PointerEvent) {
    if (!arrastrando || e.pointerId !== puntero) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (!horizontal) {
      if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) { arrastrando = false; dx = 0; return; }
      if (Math.abs(mx) > 8) { horizontal = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }
    }
    if (horizontal) dx = mx;
  }
  function arriba() {
    if (!arrastrando) return;
    arrastrando = false;
    if (dx < -80) siguiente(); else if (dx > 80 && (i > 0 || feed.fin)) anterior();
    dx = 0;
  }
  function tecla(e: KeyboardEvent) {
    if ((e.target as HTMLElement).closest('select, input')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
  }
</script>

<section class="descubrir" aria-labelledby="t-desc">
  <h2 id="t-desc" class="sr">Descubrir empresas</h2>
  <div class="fila entre prog">
    <p aria-live="polite"><b class="num-txt">{feed.fin ? n : i + 1} de {n}</b> <span class="tenue">empresas de hoy</span></p>
    <ol class="puntos" aria-hidden="true">
      {#each Array(POR_DIA) as _, k}<li class:on={k < (feed.fin ? n : i + 1)} class:fuera={k >= n}></li>{/each}
    </ol>
  </div>

  <ConstruyeFiltros bind:sector={feed.sector} bind:pais={feed.pais} cambia={cambiaFiltro}>
    <button class="filtro" type="button" aria-expanded={comparando} aria-controls="comparar-dos" onclick={abrirComparar}><Ico n="ojo" tam={16} />Comparar dos</button>
  </ConstruyeFiltros>

  {#if comparando}
    <form id="comparar-dos" class="tarjeta comparar" onsubmit={(e) => { e.preventDefault(); if (compA !== compB) ir(`#/construye/comparar/${compA}/${compB}`); }}>
      <div class="campo"><label for="ca">Primera</label>
        <select id="ca" class="entrada" bind:value={compA}>{#each ORDEN_NOMBRE as e}<option value={e.ticker}>{e.nombre} · {e.ticker}</option>{/each}</select></div>
      <div class="campo"><label for="cb">Segunda</label>
        <select id="cb" class="entrada" bind:value={compB}>{#each ORDEN_NOMBRE as e}<option value={e.ticker}>{e.nombre} · {e.ticker}</option>{/each}</select></div>
      {#if compA === compB}<p class="error" role="alert">Elige dos empresas distintas.</p>{/if}
      <button class="btn btn-primario" type="submit" disabled={compA === compB}><Ico n="ojo" />Comparar</button>
    </form>
  {/if}

  {#if !n}
    <div class="tarjeta vacio" aria-live="polite">
      <h3>Hoy no hay empresas con esos filtros</h3>
      <p class="tenue peq">Prueba con otro sector u otro país.</p>
      <button class="btn" type="button" onclick={quitarFiltros}>Quitar filtros</button>
    </div>
  {:else if feed.fin}
    <div class="tarjeta final" aria-live="polite">
      <div class="final-ico" aria-hidden="true"><HuellaFlor huella={{ deuda: true, roic: true, margen: true, caja: true, crecimiento: true }} tamano="medio" /></div>
      <h3>Has visto las de hoy</h3>
      <p class="tenue">Mañana habrá {POR_DIA} empresas nuevas. Aquí el feed termina.</p>
      <div class="fila centrada">
        <button class="btn" type="button" onclick={deNuevo}>Volver a verlas</button>
        {#if filtrado}<button class="btn" type="button" onclick={quitarFiltros}>Quitar filtros</button>{/if}
        <a class="btn btn-primario" href="#/cartera">Ir a Mi cartera</a>
      </div>
    </div>
  {:else if actual}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="mazo" role="region" aria-roledescription="carrusel" aria-label="Tarjetas de empresas" onkeydown={tecla}>
      <div class="tras2" aria-hidden="true"></div><div class="tras" aria-hidden="true"></div>
      {#key actual.ticker}
        <article class="carta cristal" class:suelta={!arrastrando} style="--dir:{dir};transform:translateX({dx}px) rotate({dx / 40}deg)"
          aria-roledescription="tarjeta" aria-label="{actual.nombre}, {i + 1} de {n}"
          onpointerdown={abajo} onpointermove={mueve} onpointerup={arriba} onpointercancel={() => { arrastrando = false; dx = 0; }}>
          <div class="fila entre cabeza">
            <h3 class="nombre">{actual.nombre}</h3>
            <span class="mono ticker" style="--c:{COLOR_SECTOR[actual.sector]}">{actual.ticker}</span>
          </div>
          <EmpresaMeta e={actual} />
          <p class="desc tenue">{actual.descripcion}</p>
          <div class="fila entre huella-cab">
            <span class="eti">Huella en flor</span>
            <span class="cumple">Cumple <b>{cuenta(actual.huella).si} de 5</b>{#if cuenta(actual.huella).nd}<small> · {cuenta(actual.huella).nd} sin datos</small>{/if}</span>
          </div>
          <HuellaFlor huella={actual.huella} nombre={actual.nombre} animar />
          <p class="leyenda">Lleno: cumple · pequeño: no cumple · hueco: sin datos</p>
          <div class="acc">
            <a class="btn" href="#/construye/empresa/{actual.ticker}">Ver ficha</a>
            <button class="btn btn-primario" type="button" disabled={ocupado} onclick={() => probar(actual.ticker)}><Ico n="mas" />{ocupado ? 'Añadiendo…' : 'Probar en mi cartera'}</button>
          </div>
          {#if error}<p class="error" role="alert">{error}</p>{/if}
        </article>
      {/key}
    </div>
    <div class="nav">
      <button class="btn" type="button" onclick={anterior} disabled={i === 0}><Ico n="izq" />Anterior</button>
      <button class="btn" type="button" onclick={siguiente}>{i === n - 1 ? 'Terminar' : 'Siguiente'}<Ico n="der" /></button>
    </div>
  {/if}
  <p class="neutra">Klever enseña datos, no recomienda empresas.</p>
</section>

<style>
  .descubrir { display: grid; gap: var(--s3); min-width: 0; }
  .prog p { font-size: var(--t-m); }
  .num-txt { font-weight: 700; }
  .puntos { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; }
  .puntos li { width: 11px; height: 5px; border-radius: 3px; background: var(--linea-2); }
  .puntos li.on { background: linear-gradient(90deg, var(--cobre), var(--lila)); }
  .puntos li.fuera { opacity: .35; }

  .comparar { display: grid; gap: var(--s3); }
  .comparar .entrada { width: 100%; }

  .mazo { position: relative; margin-top: 14px; }
  .tras, .tras2 { position: absolute; height: 60px; border-radius: var(--r-l); background: var(--cristal); border: 1px solid var(--cristal-borde); box-shadow: 0 6px 16px -10px rgba(19, 32, 59, .3); }
  .tras { left: 12px; right: 12px; top: -9px; }
  .tras2 { left: 26px; right: 26px; top: -17px; opacity: .7; }
  .carta { position: relative; padding: 18px 18px 16px; display: grid; gap: var(--s3); touch-action: pan-y; user-select: none; animation: entra var(--medio-t) var(--suave) backwards; }
  .carta.suelta { transition: transform var(--lento) var(--muelle); }
  @keyframes entra { from { opacity: 0; transform: translateX(calc(var(--dir) * 36px)); } }
  .cabeza { flex-wrap: nowrap; align-items: flex-start; }
  .nombre { font-size: var(--t-xl); font-weight: 450; line-height: 1.1; min-width: 0; overflow-wrap: anywhere; }
  .ticker { flex: none; font-size: var(--t-s); font-weight: 600; padding: 6px 9px; border-radius: 9px; color: var(--noche); background: color-mix(in srgb, var(--c) 18%, transparent); }
  .desc { font-size: var(--t-s); }
  .huella-cab { align-items: baseline; margin-top: 2px; }
  .cumple { font-family: var(--f-disp); font-variation-settings: "SOFT" 100, "opsz" 36; font-size: var(--t-l); }
  .cumple b { font-weight: 620; }
  .cumple small { font-family: var(--f-txt); font-size: var(--t-xs); color: var(--noche-3); font-weight: 600; }
  .leyenda { text-align: center; font-size: var(--t-xs); color: var(--noche-2); }
  .acc { display: grid; grid-template-columns: .8fr 1.4fr; gap: var(--s2); }
  .acc .btn { white-space: nowrap; padding: 0 10px; }
  .nav { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s2); }
  .neutra { text-align: center; font-size: var(--t-s); color: var(--noche-2); }

  .vacio, .final { display: grid; gap: var(--s3); justify-items: center; text-align: center; padding: var(--s5) var(--s4); }
  .centrada { justify-content: center; }
  .final h3 { font-size: var(--t-xl); font-weight: 450; }
  @media (prefers-reduced-motion: reduce) { .carta { animation: none; } .carta.suelta { transition: none; } }
</style>
