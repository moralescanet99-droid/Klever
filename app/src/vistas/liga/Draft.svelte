<script lang="ts">
  // Draft de una liga (foto 04). Abierta → miembros y «Empezar draft». En marcha → tablero en serpiente y, si me toca, elegir.
  // Terminado → mis 6 empresas, enlace a la cartera de draft y cambio de agente libre (1 por semana).
  import { onMount, tick } from 'svelte';
  import { api } from '../../lib/api';
  import type { DetalleLiga, Liga } from '../../lib/dominio/tipos';
  import { empresa } from '../../lib/dominio/catalogo';
  import { COLOR_SECTOR } from '../../lib/dominio/colores';
  import { lunesDe, medianocheMadrid } from '../../lib/dominio/liga';
  import { estado, avisar, mensaje } from '../../lib/estado/sesion.svelte';
  import Cabecera from '../../componentes/liga/Cabecera.svelte';
  import TableroDraft from '../../componentes/liga/TableroDraft.svelte';
  import BuscadorLibres from '../../componentes/liga/BuscadorLibres.svelte';
  import MiniHuella from '../../componentes/liga/MiniHuella.svelte';
  import Avatar from '../../componentes/liga/Avatar.svelte';
  import Invitar from '../../componentes/liga/Invitar.svelte';
  import Reglas from '../../componentes/liga/Reglas.svelte';

  let { id }: { id: number } = $props();
  let d = $state<DetalleLiga | null>(null), ligas = $state<Liga[]>([]), cambiosSemana = $state(0);
  let cargando = $state(true), error = $state(''), ocupado = $state(false), errAccion = $state(''), refrescado = $state('');
  let sale = $state(''), entra = $state<string | null>(null), confirmarCambio = $state(false);
  let estadoEl = $state<HTMLElement>();

  const miId = $derived(estado.sesion?.usuario?.id ?? -1);
  const liga = $derived(d?.liga);
  const draft = $derived(d?.draft ?? null);
  const soyCreador = $derived(!!liga && liga.creadorId === miId);
  const creador = $derived(d?.clasificacion.find(f => f.usuarioId === liga?.creadorId)?.apodo);
  const meToca = $derived(liga?.estado === 'draft' && draft?.turnoDe === miId);
  const turnoApodo = $derived(draft?.orden.find(o => o.usuarioId === draft?.turnoDe)?.apodo ?? '');
  const misPicks = $derived(draft ? draft.picks.filter(p => p.usuarioId === miId).sort((a, b) => a.ronda - b.ronda) : []);
  const terminado = $derived(liga?.estado === 'en_juego' || liga?.estado === 'terminada');
  const pickNum = $derived(draft ? draft.picks.length + 1 : 0);
  const totalPicks = $derived(draft ? draft.orden.length * draft.rondas : 0);

  async function cargar(manual = false) {
    if (!d) cargando = true; error = '';
    try {
      const [det, ls] = await Promise.all([api.detalleLiga(id), api.misLigas()]);
      d = det; ligas = ls;
      if (det.liga.tipo === 'draft' && det.carteraInscrita) {
        try { const h = await api.historial(det.carteraInscrita.id); const desde = medianocheMadrid(lunesDe()); cambiosSemana = h.versiones.filter(v => v.desde >= desde).length; } catch { cambiosSemana = 0; }
      }
      if (manual) refrescado = `Actualizado a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) { error = mensaje(e); }
    finally { cargando = false; }
  }
  onMount(() => cargar());

  async function accion(f: () => Promise<void>, ok: string) {
    ocupado = true; errAccion = '';
    try { await f(); avisar(ok); await cargar(); await tick(); estadoEl?.focus(); }
    catch (e) { errAccion = mensaje(e); }
    finally { ocupado = false; }
  }
  const empezar = () => accion(() => api.empezarDraft(id), 'El draft ha empezado');
  const elegir = (t: string) => accion(() => api.elegirDraft(id, t), `Has elegido ${t}`);
  async function hacerCambio() {
    if (!sale || !entra) return;
    const s = sale, e = entra;
    await accion(() => api.cambioDraft(id, s, e), `Sale ${s}, entra ${e}`);
    if (!errAccion) { sale = ''; entra = null; confirmarCambio = false; }
  }
</script>

<main class="pagina">
  {#if cargando}
    <Cabecera>{#snippet contexto()}Cargando el draft…{/snippet}</Cabecera>
    <div class="cristal hueco" aria-busy="true" aria-label="Cargando"></div>
  {:else if error || !d || !liga}
    <Cabecera>{#snippet contexto()}<b>Draft</b>{/snippet}</Cabecera>
    <div class="tarjeta pila" role="alert">
      <p class="error">{error || 'No encuentro esa liga.'}</p>
      <div class="fila"><button class="btn" onclick={() => cargar()}>Reintentar</button><a class="btn btn-fantasma" href="#/liga">Mis ligas</a></div>
    </div>
  {:else if liga.tipo !== 'draft'}
    <Cabecera {liga} {ligas} seccion="draft">{#snippet contexto()}<b>{liga.nombre}</b>{/snippet}</Cabecera>
    <div class="tarjeta pila"><p>Esta liga es {liga.tipo === 'general' ? 'la general' : 'clásica'}: no tiene draft.</p><a class="btn" href="#/liga/{id}">Ver la liga</a></div>
  {:else}
    <Cabecera {liga} {ligas} seccion="draft">
      {#snippet contexto()}<b>Modo draft</b> · {liga!.estado === 'abierta' ? 'sin empezar' : liga!.estado === 'draft' ? `elección ${pickNum} de ${totalPicks}` : '6 empresas por persona'}{/snippet}
    </Cabecera>

    {#if liga.estado === 'abierta'}
      <section class="cristal caja" aria-labelledby="ab-t">
        <h2 id="ab-t">Antes de empezar</h2>
        <p class="peq">Cuando empiece, se sortea el orden. Se eligen 6 empresas por persona, en serpiente: quien elige último en una ronda, elige primero en la siguiente.</p>
        <p class="peq">Cada empresa solo puede estar en una cartera de la liga.</p>
        <h3 class="eti">En la liga ({d.clasificacion.length})</h3>
        <ul class="miembros">
          {#each d.clasificacion as m (m.usuarioId)}
            <li><Avatar apodo={m.apodo} id={m.usuarioId} tu={m.tu} tam={30} /><span>@{m.apodo}{m.tu ? ' · tú' : ''}{m.usuarioId === liga.creadorId ? ' · crea la liga' : ''}</span></li>
          {/each}
        </ul>
        <div tabindex="-1" bind:this={estadoEl} class="pila">
          {#if soyCreador}
            {#if d.clasificacion.length < 2}<p class="tenue peq" role="status">Hacen falta al menos 2 personas. Invita con el código.</p>{/if}
            <button class="btn btn-primario btn-ancho" onclick={empezar} disabled={ocupado || d.clasificacion.length < 2}>{ocupado ? 'Empezando…' : 'Empezar draft'}</button>
          {:else}
            <p class="peq" role="status">Esperando a que @{creador ?? 'quien creó la liga'} empiece el draft.</p>
            <button class="btn" onclick={() => cargar(true)}>Actualizar</button>
          {/if}
          {#if errAccion}<p class="error" role="alert">{errAccion}</p>{/if}
        </div>
      </section>
      <section class="tarjeta"><Invitar {liga} /></section>
    {:else if draft}
      <div class="turno" class:mio={meToca} tabindex="-1" bind:this={estadoEl} role="status" aria-live="polite">
        {#if liga.estado === 'draft'}
          {#if meToca}<b>¡Te toca!</b> Ronda {draft.ronda} de {draft.rondas}. Elige una empresa libre.
          {:else}Ronda {draft.ronda} de {draft.rondas} · le toca a <b>@{turnoApodo}</b>{/if}
        {:else}<b>Draft terminado.</b> Cada persona tiene sus 6 empresas.{/if}
      </div>

      <TableroDraft {draft} {miId} />

      {#if liga.estado === 'draft'}
        {#if meToca}
          <section class="pila" aria-labelledby="eleg-t">
            <h2 id="eleg-t" class="eti">Empresas libres</h2>
            {#if errAccion}<p class="error" role="alert">{errAccion}</p>{/if}
            <BuscadorLibres libres={draft.libres} {ocupado} onelegir={elegir} />
          </section>
        {:else}
          <section class="tarjeta pila espera">
            <p><b>Esperando a @{turnoApodo}.</b></p>
            {#if estado.sesion?.demo}<p class="tenue peq">En la demo, las demás personas no eligen solas.</p>{/if}
            <div class="fila"><button class="btn" onclick={() => cargar(true)}>Actualizar</button><span class="tenue peq" aria-live="polite">{refrescado}</span></div>
          </section>
        {/if}
      {:else}
        <section class="tarjeta pila" aria-labelledby="mias-t">
          <div class="fila entre"><h2 id="mias-t" class="eti">Mis 6 empresas</h2>
            {#if d.carteraInscrita}<a class="btn" href="#/cartera?c={d.carteraInscrita.id}">Ver mi cartera de draft</a>{/if}</div>
          <ul class="mias">
            {#each misPicks as p (p.ticker)}
              {@const e = empresa(p.ticker)}
              {@const peso = d.carteraInscrita?.posiciones.find(x => x.ticker === p.ticker)?.decimas}
              <li>
                <span class="raya" style="background:{e ? COLOR_SECTOR[e.sector] : 'var(--linea-2)'}" aria-hidden="true"></span>
                <span class="txt"><span><b class="mono">{p.ticker}</b> {e?.nombre}</span><span class="tenue l2">{e?.sector}{#if e}<MiniHuella huella={e.huella} />{/if}</span></span>
                <span class="mono peso">{peso != null ? `${(peso / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %` : '—'}</span>
              </li>
            {/each}
          </ul>
          <p class="tenue nota">Los pesos son libres: ajústalos en tu cartera de draft.</p>
        </section>

        {#if liga.estado === 'en_juego'}
          <section class="cristal caja" aria-labelledby="ag-t">
            <h2 id="ag-t">Cambio de agente libre</h2>
            <p class="tenue peq">Uno por semana: sale una tuya y entra una libre con el mismo peso.</p>
            {#if draft.cambioUsadoEstaSemana}
              <p class="hecho-sem" role="status">Ya has hecho tu cambio esta semana. El lunes tendrás otro.</p>
            {:else}
              <div class="campo">
                <label for="sale">Sale</label>
                <select id="sale" class="entrada" bind:value={sale}>
                  <option value="">Elige una de tus empresas</option>
                  {#each misPicks as p}<option value={p.ticker}>{p.ticker} · {empresa(p.ticker)?.nombre}</option>{/each}
                </select>
              </div>
              <p class="campo-t">Entra</p>
              <BuscadorLibres libres={draft.libres} etiqueta={entra ? 'Elegida' : 'Elegir'} seleccionado={entra} {ocupado} onelegir={t => { entra = t; confirmarCambio = false; }} />
              {#if errAccion}<p class="error" role="alert">{errAccion}</p>{/if}
              {#if !confirmarCambio}
                <button class="btn btn-primario btn-ancho" disabled={!sale || !entra || ocupado} onclick={() => (confirmarCambio = true)}>
                  {sale && entra ? `Cambiar: sale ${sale}, entra ${entra}` : 'Elige la que sale y la que entra'}
                </button>
              {:else}
                <div class="tarjeta pila confirmar" role="group" aria-label="Confirmar cambio">
                  <p><b>¿Seguro?</b> Sale {sale} y entra {entra}. No podrás hacer otro cambio hasta el lunes.</p>
                  <div class="fila">
                    <button class="btn btn-primario" onclick={hacerCambio} disabled={ocupado}>{ocupado ? 'Cambiando…' : 'Sí, cambiar'}</button>
                    <button class="btn" onclick={() => (confirmarCambio = false)}>Cancelar</button>
                  </div>
                </div>
              {/if}
            {/if}
          </section>
        {/if}

        <Reglas reglas={liga.reglas} posiciones={d.carteraInscrita?.posiciones ?? null} cambios={cambiosSemana} carteraId={d.carteraInscrita?.id ?? null} />
      {/if}
    {/if}
  {/if}
</main>

<style>
  .hueco { height: 320px; }
  h2.eti, h3.eti { font-family: var(--f-txt); font-size: var(--t-xs); }
  .caja { padding: var(--s4); display: grid; gap: var(--s3); }
  .miembros { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .miembros li { display: flex; align-items: center; gap: var(--s2); font-weight: 600; min-height: 36px; }
  .turno { padding: var(--s3) var(--s4); border-radius: var(--r); background: var(--blanco); border: 1px solid var(--linea); font-size: var(--t-s); }
  .turno.mio { background: var(--noche); color: var(--perla); border-color: var(--noche); }
  .turno.mio b { color: var(--perla); }
  .espera { gap: var(--s2); }
  .mias { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .mias li { display: grid; grid-template-columns: 4px 1fr auto; gap: var(--s3); align-items: center; padding: 8px var(--s3) 8px 0; border-radius: var(--r); border: 1px solid var(--linea); background: var(--perla-hi); overflow: hidden; }
  .raya { align-self: stretch; margin: -8px 0; }
  .txt { display: grid; gap: 2px; min-width: 0; }
  .l2 { display: flex; align-items: center; gap: var(--s2); font-size: var(--t-xs); }
  .peso { font-weight: 600; }
  .nota { font-size: var(--t-xs); }
  .campo-t { font-size: var(--t-s); font-weight: 600; margin-bottom: -4px; }
  .hecho-sem { padding: var(--s3); border-radius: var(--r); background: var(--ok-f); color: var(--ok); font-weight: 600; font-size: var(--t-s); }
  .confirmar { border-color: var(--lila); }
</style>
