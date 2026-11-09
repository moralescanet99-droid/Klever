<script lang="ts">
  // Klever v1 · CUENTA (#/cuenta): apodo, tema, mis invitaciones (crear y copiar enlace), textos legales y salir.
  import { onMount } from 'svelte';
  import { api } from '../../lib/api';
  import type { Invitacion } from '../../lib/dominio/tipos';
  import { avisar, cargarSesion, estado, mensaje } from '../../lib/estado/sesion.svelte';
  import { fijarTema, temaGuardado, type Tema } from '../../lib/estado/tema';
  import { ir } from '../../lib/router.svelte';
  import { enlaceInvitacion, copiar, fechaCorta } from './cuenta-util';

  let { partes = [] }: { partes?: string[] } = $props();
  void partes;
  const u = $derived(estado.sesion?.usuario);
  let tema = $state<Tema>(temaGuardado());
  const TEMAS: { id: Tema; txt: string }[] = [{ id: 'claro', txt: 'Claro' }, { id: 'oscuro', txt: 'Oscuro' }, { id: 'sistema', txt: 'Sistema' }];
  function elegirTema(t: Tema) { tema = t; fijarTema(t); }
  function teclaTema(e: KeyboardEvent) {
    const i = TEMAS.findIndex(t => t.id === tema), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return; e.preventDefault(); const n = TEMAS[(i + d + TEMAS.length) % TEMAS.length];
    elegirTema(n.id); (document.getElementById('tema-' + n.id) as HTMLElement | null)?.focus();
  }

  let invs = $state<Invitacion[] | null>(null);
  let errorInv = $state('');
  let nota = $state('');
  let creando = $state(false);
  let vivo = $state('');
  const libres = $derived(u?.esAdmin ? Infinity : Math.max(0, (u?.invitacionesLibres ?? 0)));
  async function cargar() { errorInv = ''; try { invs = await api.misInvitaciones(); } catch (e) { errorInv = mensaje(e); } }
  onMount(cargar);
  async function crear(e: SubmitEvent) {
    e.preventDefault(); creando = true; errorInv = '';
    try { const i = await api.crearInvitacion(nota.trim() || undefined); nota = ''; invs = [...(invs || []), i]; await cargarSesion(); vivo = `Invitación ${i.codigo} creada.`; }
    catch (x) { errorInv = mensaje(x); }
    finally { creando = false; }
  }
  async function copiarEnlace(i: Invitacion) {
    const ok = await copiar(enlaceInvitacion(i.codigo));
    vivo = ok ? `Enlace de ${i.codigo} copiado.` : 'No he podido copiar. Copia el código a mano.'; avisar(vivo);
  }
  let saliendo = $state(false);
  async function salir() {
    saliendo = true;
    try { await api.salir(); ir('#/entrar'); await cargarSesion(); } catch (e) { avisar(mensaje(e)); } finally { saliendo = false; }
  }
</script>

<main class="pagina cuenta">
  <header class="cab">
    <p class="eti">Tu cuenta</p>
    <h1 class="apodo">{u?.apodo || '—'}</h1>
    <p class="sub">{u?.esAdmin ? 'Administración de la beta' : 'Beta privada'} · sin dinero real</p>
  </header>

  <section class="cristal bloque pila" aria-labelledby="t-tema">
    <h2 id="t-tema">Tema</h2>
    <div class="segmento" role="radiogroup" aria-labelledby="t-tema">
      {#each TEMAS as t (t.id)}
        <button id="tema-{t.id}" type="button" role="radio" aria-checked={tema === t.id} tabindex={tema === t.id ? 0 : -1} onclick={() => elegirTema(t.id)} onkeydown={teclaTema}>{t.txt}</button>
      {/each}
    </div>
    <p class="tenue peq">Se recuerda solo en este dispositivo.</p>
  </section>

  <section class="tarjeta bloque pila" aria-labelledby="t-inv">
    <div class="fila entre">
      <h2 id="t-inv">Invita a tus amigos</h2>
      <span class="chip">{libres === Infinity ? 'Sin límite' : `${libres} de 5 libres`}</span>
    </div>
    <p class="tenue peq">Cada código sirve para una persona. Comparte el enlace.</p>

    {#if invs === null && !errorInv}
      <p class="tenue" aria-busy="true">Cargando invitaciones…</p>
    {:else if invs && invs.length}
      <ul class="lista">
        {#each invs as i (i.codigo)}
          {@const usada = i.usos >= i.usosMax}
          <li class="inv" class:usada>
            <div class="inv-txt">
              <span class="mono codigo">{i.codigo}</span>
              <span class="tenue peq">{i.nota || 'Sin nota'} · {fechaCorta(i.creada)}</span>
            </div>
            {#if usada}<span class="chip fondo-ok">Usada</span>
            {:else}<button class="btn" type="button" onclick={() => copiarEnlace(i)} aria-label="Copiar enlace de la invitación {i.codigo}">Copiar enlace</button>{/if}
          </li>
        {/each}
      </ul>
    {:else if invs}
      <p class="vacio tenue">Aún no has creado invitaciones.</p>
    {/if}

    {#if libres > 0}
      <form class="crear" onsubmit={crear}>
        <label class="sr" for="c-nota">Para quién (opcional)</label>
        <input id="c-nota" class="entrada" maxlength="60" bind:value={nota} placeholder="Para quién" />
        <button class="btn btn-primario" type="submit" disabled={creando}>{creando ? 'Creando…' : 'Crear invitación'}</button>
      </form>
    {:else}
      <p class="tenue peq">Ya has usado tus 5 invitaciones.</p>
    {/if}
    {#if errorInv}<p class="error" role="alert">{errorInv} <button class="btn btn-fantasma" type="button" onclick={cargar}>Reintentar</button></p>{/if}
    <p class="sr" aria-live="polite">{vivo}</p>
  </section>

  {#if u?.esAdmin}
    <a class="tarjeta fila entre admin" href="#/admin"><span><b>Panel de administración</b><br /><span class="tenue peq">Códigos de invitación de la beta</span></span><span aria-hidden="true">›</span></a>
  {/if}

  <nav class="tarjeta legal" aria-label="Textos legales">
    <a href="#/legal/aviso">Aviso legal <span aria-hidden="true">›</span></a>
    <a href="#/legal/privacidad">Privacidad <span aria-hidden="true">›</span></a>
    <a href="#/legal/condiciones">Condiciones de uso <span aria-hidden="true">›</span></a>
  </nav>

  <button class="btn btn-ancho salir" type="button" onclick={salir} disabled={saliendo}>{saliendo ? 'Saliendo…' : 'Salir'}</button>
  <p class="tenue peq pie">Klever · beta privada · simulación sin dinero real · no es consejo</p>
</main>

<style>
  .cuenta { gap: var(--s4); }
  .cab { display: grid; gap: var(--s1); }
  .apodo { font-size: var(--t-xxl); font-weight: 450; line-height: 1.05; overflow-wrap: anywhere; }
  .sub { color: var(--noche-2); }
  .bloque { padding: var(--s4); }
  .segmento button { min-height: 44px; }
  .segmento button[aria-checked="true"] { background: linear-gradient(135deg, var(--cobre-f), var(--lila-f)); color: var(--noche); box-shadow: inset 0 0 0 1px var(--linea-2); }
  .lista { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
  .inv { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); padding: var(--s2) 0; border-top: 1px solid var(--linea); }
  .inv:first-child { border-top: 0; }
  .inv-txt { display: grid; min-width: 0; }
  .inv-txt .tenue { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .codigo { font-size: var(--t-m); font-weight: 600; letter-spacing: .1em; }
  .usada .codigo { color: var(--noche-3); text-decoration: line-through; text-decoration-thickness: 1px; }
  .inv .btn { flex: none; }
  .vacio { padding: var(--s3); border: 1px dashed var(--linea-2); border-radius: var(--r); text-align: center; }
  .crear { display: grid; grid-template-columns: 1fr auto; gap: var(--s2); }
  .crear .entrada { min-width: 0; }
  @media (max-width: 380px) { .crear { grid-template-columns: 1fr; } }
  .admin { text-decoration: none; color: var(--noche); min-height: 64px; flex-wrap: nowrap; background: linear-gradient(135deg, var(--cobre-f), var(--lila-f)); border-color: transparent; }
  .legal { display: grid; padding: var(--s1) var(--s4); }
  .legal a { display: flex; justify-content: space-between; align-items: center; min-height: 48px; color: var(--noche); text-decoration: none; border-top: 1px solid var(--linea); }
  .legal a:first-child { border-top: 0; }
  .salir { color: var(--alto); }
  .pie { text-align: center; }
</style>
