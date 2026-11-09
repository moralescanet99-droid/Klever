<script lang="ts">
  // Detalle de una liga (foto 03): marcador, reto, motivos, reglas, clasificación, cartera inscrita, cómo se puntúa y salir.
  import { onMount, tick } from 'svelte';
  import { api } from '../../lib/api';
  import type { DetalleLiga, Foto, Liga, VersionCartera } from '../../lib/dominio/tipos';
  import { lunesDe, medianocheMadrid } from '../../lib/dominio/liga';
  import { analizar } from '../../lib/dominio/cartera';
  import { estado, avisar, mensaje, recargarCarteras } from '../../lib/estado/sesion.svelte';
  import { ir } from '../../lib/router.svelte';
  import Cabecera from '../../componentes/liga/Cabecera.svelte';
  import Marcador from '../../componentes/liga/Marcador.svelte';
  import Clasificacion from '../../componentes/liga/Clasificacion.svelte';
  import Reglas from '../../componentes/liga/Reglas.svelte';
  import ComoPuntua from '../../componentes/liga/ComoPuntua.svelte';
  import Invitar from '../../componentes/liga/Invitar.svelte';
  import { hayReglas } from '../../componentes/liga/util';

  let { id }: { id: number } = $props();
  let d = $state<DetalleLiga | null>(null), ligas = $state<Liga[]>([]);
  let versiones = $state<VersionCartera[]>([]), fotos = $state<Foto[]>([]);
  let cargando = $state(true), error = $state('');
  let cambiando = $state(false), eleccion = $state<number | null>(null), guardando = $state(false), errCambio = $state('');
  let confirmarSalir = $state(false), saliendo = $state(false), errSalir = $state('');
  let btnSalir = $state<HTMLButtonElement>(), btnSiSalir = $state<HTMLButtonElement>();

  const n = $derived(d?.semanaActual ?? 0);
  const general = $derived(d?.liga.tipo === 'general');
  const esDraft = $derived(d?.liga.tipo === 'draft');
  const fotoActual = $derived(d && n >= 1 && n <= 12 ? fotos.find(f => f.semana === d!.liga.temporada.semanas[n - 1]) ?? null : null);
  const cambiosSemana = $derived.by(() => { const desde = medianocheMadrid(lunesDe()); return versiones.filter(v => v.desde >= desde).length; });
  const sinEquilibrio = $derived(d ? d.mias.map((p, i) => ({ ...p, n: i + 1 })).filter(p => !p.valida) : []);
  const opciones = $derived(estado.carteras.filter(c => !c.ligaId));
  const puedeElegirCartera = $derived(!!d && !esDraft && (d.puedeCambiarCartera || !d.carteraInscrita));
  const resumenCartera = $derived(d?.carteraInscrita ? analizar(d.carteraInscrita.posiciones) : null);

  async function cargar() {
    cargando = !d; error = '';
    try {
      const [det, ls] = await Promise.all([api.detalleLiga(id), api.misLigas()]);
      d = det; ligas = ls;
      if (det.carteraInscrita) {
        try { const h = await api.historial(det.carteraInscrita.id); versiones = h.versiones; fotos = h.fotos; } catch { versiones = []; fotos = []; }
      } else { versiones = []; fotos = []; }
    } catch (e) { error = mensaje(e); }
    finally { cargando = false; }
  }
  onMount(cargar);

  async function abrirCambio() { cambiando = true; errCambio = ''; eleccion = d?.carteraInscrita?.id ?? opciones[0]?.id ?? null; try { await recargarCarteras(); } catch { /* usa las que ya hay */ } }
  async function guardarCambio() {
    if (eleccion == null) return; guardando = true; errCambio = '';
    try { await api.inscribirCartera(id, eleccion); avisar('Cartera inscrita'); cambiando = false; await cargar(); }
    catch (e) { errCambio = mensaje(e); }
    finally { guardando = false; }
  }
  async function pedirSalir() { confirmarSalir = true; errSalir = ''; await tick(); btnSiSalir?.focus(); }
  async function cancelarSalir() { confirmarSalir = false; await tick(); btnSalir?.focus(); }
  async function salir() {
    saliendo = true; errSalir = '';
    try { await api.salirLiga(id); avisar('Has salido de la liga'); ir('/liga'); }
    catch (e) { errSalir = mensaje(e); }
    finally { saliendo = false; }
  }
</script>

<main class="pagina">
  {#if cargando}
    <Cabecera>{#snippet contexto()}Cargando la liga…{/snippet}</Cabecera>
    <div class="cristal hueco" aria-busy="true" aria-label="Cargando"></div>
  {:else if error || !d}
    <Cabecera>{#snippet contexto()}<b>Liga</b>{/snippet}</Cabecera>
    <div class="tarjeta pila" role="alert">
      <p class="error">{error || 'No encuentro esa liga.'}</p>
      <div class="fila"><button class="btn" onclick={cargar}>Reintentar</button><a class="btn btn-fantasma" href="#/liga">Mis ligas</a></div>
    </div>
  {:else}
    <Cabecera liga={d.liga} {ligas} seccion="semana">
      {#snippet contexto()}<b>{d!.liga.temporada.nombre}</b> · {n >= 1 && n <= 12 ? `semana ${n} de 12` : n === 0 ? 'aún no empieza' : 'terminada'}{/snippet}
    </Cabecera>

    {#if esDraft && d.liga.estado !== 'en_juego' && d.liga.estado !== 'terminada'}
      <a class="banner tarjeta" href="#/liga/{id}/draft">
        <span><b>{d.liga.estado === 'abierta' ? 'El draft aún no ha empezado' : d.draft?.turnoDe === estado.sesion?.usuario?.id ? '¡Te toca elegir en el draft!' : 'El draft está en marcha'}</b>
          <span class="tenue peq">Hasta que termine, no tienes cartera en esta liga.</span></span>
        <span class="btn btn-primario">Ir al draft</span>
      </a>
    {/if}

    <Marcador detalle={d} foto={fotoActual} />

    <div class="dos">
      <section class="tarj reto" aria-labelledby="reto-t">
        <h2 id="reto-t" class="eti">Reto · {d.reto.hecho ? 'hecho' : 'pendiente'}</h2>
        <p class="reto-t">
          <span class="marca" class:hecho={d.reto.hecho} aria-hidden="true">{#if d.reto.hecho}<svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>{/if}</span>
          <span>{d.reto.titulo}</span>
        </p>
        {#if !d.reto.hecho}<p class="tenue peq pista">Pista: {d.reto.pista}</p>{/if}
        <p class="tenue vale">Vale 20 puntos. Se comprueba con la foto del lunes.</p>
      </section>
      {#if sinEquilibrio.length}
        <section class="tarj motivos" aria-labelledby="mot-t">
          <h2 id="mot-t" class="eti">Semanas sin Equilibrio</h2>
          <ul>
            {#each sinEquilibrio as s}
              <li><b class="mono">S{s.n}</b> {s.motivo}{#if s.incumple.length}<span class="tenue">: {s.incumple.join('; ')}</span>{/if}</li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>

    <Clasificacion filas={d.clasificacion} />

    {#if !general}
      <Reglas reglas={d.liga.reglas} posiciones={d.carteraInscrita?.posiciones ?? null} cambios={cambiosSemana} carteraId={d.carteraInscrita?.id ?? null} />
    {/if}

    <section class="tarjeta inscrita" aria-labelledby="ins-t">
      <h2 id="ins-t" class="eti">Cartera inscrita</h2>
      {#if d.carteraInscrita}
        <div class="fila entre">
          <span class="ci">
            <b>{d.carteraInscrita.nombre}</b>
            <span class="tenue peq">{resumenCartera?.n} posiciones · {resumenCartera?.sectores.length} sectores{resumenCartera && !resumenCartera.completa ? ' · no está al 100 %' : ''}</span>
          </span>
          <span class="fila">
            <a class="btn" href="#/cartera?c={d.carteraInscrita.id}">Ver</a>
            {#if puedeElegirCartera && !cambiando}<button class="btn" onclick={abrirCambio}>Cambiar</button>{/if}
          </span>
        </div>
      {:else if esDraft}
        <p class="tenue peq">Tendrás tu cartera de draft cuando termine el draft.</p>
      {:else}
        <p class="tenue peq">No tienes cartera inscrita: esta semana no suma Equilibrio.</p>
        {#if !cambiando}<button class="btn btn-primario" onclick={abrirCambio}>Inscribir una cartera</button>{/if}
      {/if}
      {#if !esDraft && d.carteraInscrita && !d.puedeCambiarCartera}
        <p class="tenue nota">Solo se puede cambiar en las semanas 1 y 2 de la temporada.</p>
      {:else if esDraft}
        <p class="tenue nota">En draft juegas con tus 6 empresas; los pesos son libres.</p>
      {/if}
      {#if cambiando}
        <div class="cambio">
          {#if !opciones.length}
            <p class="tenue peq">Aún no tienes carteras. <a href="#/construye">Crea una en Construye</a>.</p>
          {:else}
            <fieldset>
              <legend class="peq">Elige la cartera que juega en esta liga</legend>
              {#each opciones as c (c.id)}
                <label class="opc"><input type="radio" name="cartera-liga" value={c.id} bind:group={eleccion} /><span><b>{c.nombre}</b><span class="tenue peq"> · {c.posiciones.length} posiciones{c.principal ? ' · principal' : ''}</span></span></label>
              {/each}
            </fieldset>
          {/if}
          {#if errCambio}<p class="error" role="alert">{errCambio}</p>{/if}
          <div class="fila">
            {#if opciones.length}<button class="btn btn-primario" onclick={guardarCambio} disabled={guardando || eleccion == null}>{guardando ? 'Guardando…' : 'Inscribir esta'}</button>{/if}
            <button class="btn btn-fantasma" onclick={() => (cambiando = false)}>Cancelar</button>
          </div>
        </div>
      {/if}
    </section>

    {#if !general}
      <details class="tarjeta invitar">
        <summary>Invitar a la liga <span class="tenue peq">· código {d.liga.codigo}</span></summary>
        <div class="inv-c"><Invitar liga={d.liga} /></div>
      </details>
    {/if}

    <a class="tarjeta resumen" href="#/liga/{id}/resumen">
      <span><b>Resumen de temporada</b><span class="tenue peq">Tu temporada en 6 historias</span></span>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
    </a>

    <ComoPuntua {general} />

    <section class="salir" aria-label="Salir de la liga">
      {#if !confirmarSalir}
        <button class="btn btn-fantasma rojo" bind:this={btnSalir} onclick={pedirSalir}>Salir de la liga</button>
      {:else}
        <div class="confirmar tarjeta" role="group" aria-labelledby="conf-t">
          <p id="conf-t"><b>¿Salir de «{d.liga.nombre}»?</b></p>
          <p class="tenue peq">Dejarás de aparecer en su clasificación. {general ? 'Puedes volver a apuntarte cuando quieras.' : 'Para volver necesitarás el código.'}</p>
          {#if errSalir}<p class="error" role="alert">{errSalir}</p>{/if}
          <div class="fila">
            <button class="btn btn-peligro" bind:this={btnSiSalir} onclick={salir} disabled={saliendo}>{saliendo ? 'Saliendo…' : 'Sí, salir'}</button>
            <button class="btn" onclick={cancelarSalir}>Cancelar</button>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</main>

<style>
  .hueco { height: 320px; }
  h2.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  .banner { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); text-decoration: none; color: inherit; border-color: var(--lila); flex-wrap: wrap; }
  .banner > span:first-child { display: grid; gap: 2px; }
  .dos { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--s3); }
  .tarj { border-radius: 18px; padding: var(--s3) var(--s4); background: var(--blanco); border: 1px solid var(--linea); display: grid; gap: 6px; align-content: start; }
  .reto-t { display: flex; gap: 8px; align-items: flex-start; font-weight: 600; line-height: 1.3; }
  .marca { flex: none; width: 20px; height: 20px; border-radius: 50%; margin-top: 1px; display: grid; place-items: center; box-shadow: inset 0 0 0 1.5px var(--linea-2); }
  .marca.hecho { background: var(--ok-f); color: var(--ok); box-shadow: none; }
  .marca svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .vale { font-size: var(--t-xs); }
  .motivos ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; font-size: var(--t-s); }
  .motivos b { color: var(--medio); margin-right: 4px; }
  .inscrita { display: grid; gap: var(--s3); }
  .ci { display: grid; gap: 2px; min-width: 0; }
  .nota { font-size: var(--t-xs); }
  .cambio { display: grid; gap: var(--s3); border-top: 1px solid var(--linea); padding-top: var(--s3); }
  fieldset { border: 0; margin: 0; padding: 0; display: grid; gap: 4px; }
  legend { margin-bottom: 4px; font-weight: 600; }
  .opc { display: flex; align-items: center; gap: var(--s3); min-height: 44px; cursor: pointer; }
  .opc input { width: 20px; height: 20px; accent-color: var(--lila-t); flex: none; }
  .invitar { padding: 0; }
  .invitar summary { min-height: 52px; display: flex; align-items: center; gap: 6px; padding: 0 var(--s4); font-weight: 700; cursor: pointer; flex-wrap: wrap; }
  .inv-c { padding: 0 var(--s4) var(--s4); }
  .resumen { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); text-decoration: none; color: inherit; background: linear-gradient(120deg, var(--cobre-f), var(--lila-f) 55%, var(--agua-f)); border: 0; }
  .resumen > span { display: grid; gap: 2px; }
  .resumen svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; flex: none; }
  .salir { display: grid; justify-items: center; }
  .rojo { color: var(--alto); }
  .confirmar { width: 100%; display: grid; gap: var(--s2); border-color: var(--alto); }
  .btn-peligro { background: var(--alto); color: var(--blanco); border-color: var(--alto); }
</style>
