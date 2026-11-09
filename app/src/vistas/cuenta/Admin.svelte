<script lang="ts">
  // Klever v1 · ADMINISTRACIÓN (#/admin): códigos de invitación de la beta (crear con usos y nota; ver todos). Solo si esAdmin.
  import { onMount } from 'svelte';
  import { api } from '../../lib/api';
  import type { Invitacion } from '../../lib/dominio/tipos';
  import { avisar, estado, mensaje } from '../../lib/estado/sesion.svelte';
  import { copiar, enlaceInvitacion, fechaCorta } from './cuenta-util';

  const esAdmin = $derived(!!estado.sesion?.usuario?.esAdmin);
  let lista = $state<Invitacion[] | null>(null);
  let error = $state('');
  let usos = $state(5);
  let nota = $state('');
  let creando = $state(false);
  let errorCrear = $state('');
  let vivo = $state('');
  const totalUsos = $derived((lista || []).reduce((a, i) => a + i.usos, 0));
  const abiertas = $derived((lista || []).filter(i => i.usos < i.usosMax).length);
  const ordenada = $derived([...(lista || [])].sort((a, b) => b.creada.localeCompare(a.creada)));

  async function cargar() { error = ''; try { lista = await api.adminInvitaciones(); } catch (e) { error = mensaje(e); } }
  onMount(() => { if (esAdmin) cargar(); });
  async function crear(e: SubmitEvent) {
    e.preventDefault(); errorCrear = '';
    const n = Math.floor(Number(usos)); if (!(n >= 1 && n <= 500)) { errorCrear = 'Los usos van de 1 a 500.'; return; }
    creando = true;
    try { const i = await api.adminCrearInvitacion(n, nota.trim()); lista = [...(lista || []), i]; nota = ''; vivo = `Código ${i.codigo} creado con ${i.usosMax} usos.`; }
    catch (x) { errorCrear = mensaje(x); }
    finally { creando = false; }
  }
  async function copiarEnlace(i: Invitacion) { const ok = await copiar(enlaceInvitacion(i.codigo)); vivo = ok ? `Enlace de ${i.codigo} copiado.` : 'No he podido copiar.'; avisar(vivo); }
</script>

<main class="pagina admin">
  <header class="cab">
    <p class="eti">Administración</p>
    <h1>Invitaciones</h1>
    <p class="sub">Códigos para entrar en la beta privada.</p>
  </header>

  {#if !esAdmin}
    <section class="tarjeta pila" aria-live="polite">
      <h2>Solo para la administración</h2>
      <p class="tenue">Esta página no está disponible para tu cuenta.</p>
      <a class="btn btn-primario" href="#/cuenta">Volver a tu cuenta</a>
    </section>
  {:else}
    <form class="cristal bloque pila" onsubmit={crear} aria-labelledby="t-nuevo">
      <h2 id="t-nuevo">Nuevo código</h2>
      <div class="dos">
        <div class="campo">
          <label for="ad-usos">Usos</label>
          <input id="ad-usos" class="entrada num-campo" type="number" inputmode="numeric" min="1" max="500" step="1" bind:value={usos} />
        </div>
        <div class="campo">
          <label for="ad-nota">Nota</label>
          <input id="ad-nota" class="entrada" maxlength="60" bind:value={nota} placeholder="p. ej. Clase de Economía" />
        </div>
      </div>
      {#if errorCrear}<p class="error" role="alert">{errorCrear}</p>{/if}
      <button class="btn btn-primario btn-ancho" type="submit" disabled={creando}>{creando ? 'Creando…' : 'Crear código'}</button>
    </form>

    <section class="pila" aria-labelledby="t-todos">
      <div class="fila entre">
        <h2 id="t-todos">Todos los códigos</h2>
        {#if lista}<span class="chip">{lista.length} {lista.length === 1 ? 'código' : 'códigos'} · {totalUsos} {totalUsos === 1 ? 'alta' : 'altas'} · {abiertas} {abiertas === 1 ? 'abierto' : 'abiertos'}</span>{/if}
      </div>
      {#if error}
        <div class="tarjeta pila"><p class="error" role="alert">{error}</p><button class="btn" type="button" onclick={cargar}>Reintentar</button></div>
      {:else if lista === null}
        <p class="tenue" aria-busy="true">Cargando códigos…</p>
      {:else if !lista.length}
        <p class="tarjeta vacio tenue">Aún no hay códigos. Crea el primero arriba.</p>
      {:else}
        <ul class="lista tarjeta">
          {#each ordenada as i (i.codigo)}
            {@const lleno = i.usos >= i.usosMax}
            <li>
              <div class="txt">
                <span class="mono codigo">{i.codigo}</span>
                <span class="tenue peq">{i.nota || 'Sin nota'} · {fechaCorta(i.creada)}</span>
              </div>
              <div class="usos" aria-label="{i.usos} de {i.usosMax} usos">
                <span class="num">{i.usos}<span class="tenue">/{i.usosMax}</span></span>
                <span class="barra" aria-hidden="true"><span style:transform="scaleX({Math.min(1, i.usos / i.usosMax)})"></span></span>
              </div>
              {#if lleno}<span class="chip fondo-ok">Completo</span>
              {:else}<button class="btn" type="button" onclick={() => copiarEnlace(i)} aria-label="Copiar enlace del código {i.codigo}">Copiar</button>{/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
    <p class="sr" aria-live="polite">{vivo}</p>
  {/if}
  <a class="btn btn-fantasma volver" href="#/cuenta">‹ Volver a tu cuenta</a>
</main>

<style>
  .admin { gap: var(--s4); }
  .cab { display: grid; gap: var(--s1); }
  .cab h1 { font-size: var(--t-xxl); font-weight: 450; line-height: 1; }
  .sub { color: var(--noche-2); }
  .bloque { padding: var(--s4); }
  .dos { display: grid; grid-template-columns: 96px 1fr; gap: var(--s3); }
  .dos .entrada { min-width: 0; width: 100%; }
  .num-campo { font-family: var(--f-mono); }
  .lista { list-style: none; margin: 0; padding: var(--s1) var(--s4); display: grid; }
  .lista li { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--s3); padding: var(--s3) 0; border-top: 1px solid var(--linea); }
  .lista li:first-child { border-top: 0; }
  .txt { display: grid; min-width: 0; }
  .txt .tenue { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .codigo { font-weight: 600; letter-spacing: .1em; }
  .usos { display: grid; gap: 4px; justify-items: end; min-width: 56px; }
  .usos .num { font-size: var(--t-l); line-height: 1; }
  .barra { width: 56px; height: 4px; border-radius: 2px; background: var(--linea); overflow: hidden; }
  .barra span { display: block; height: 100%; background: linear-gradient(90deg, var(--cobre), var(--lila)); transform-origin: left; }
  .vacio { text-align: center; }
  .volver { justify-self: start; }
  @media (max-width: 380px) { .lista li { grid-template-columns: 1fr auto; } .lista li > :last-child { grid-column: 1 / -1; justify-self: start; } }
</style>
