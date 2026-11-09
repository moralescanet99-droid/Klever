<script lang="ts">
  // Klever v1 · armazón: cabecera (marca, sello, avatar), contenido según la ruta y barra inferior de 3 pestañas.
  // Orden de pestañas (decisión C63): Mi cartera · Construye · La Liga.
  import { onMount } from 'svelte';
  import { ruta } from './lib/router.svelte';
  import { estado, cargarSesion } from './lib/estado/sesion.svelte';
  import Sello from './componentes/base/Sello.svelte';
  import MiCartera from './vistas/cartera/MiCartera.svelte';
  import Construye from './vistas/construye/Construye.svelte';
  import Liga from './vistas/liga/Liga.svelte';
  import Cuenta from './vistas/cuenta/Cuenta.svelte';
  import Admin from './vistas/cuenta/Admin.svelte';
  import Legal from './vistas/cuenta/Legal.svelte';
  import Entrar from './vistas/cuenta/Entrar.svelte';
  import Alta from './vistas/cuenta/Alta.svelte';

  onMount(cargarSesion);
  const seccion = $derived(ruta.partes[0] || 'cartera');
  const resto = $derived(ruta.partes.slice(1));
  const publica = $derived(seccion === 'legal');
  const TABS = [
    { id: 'cartera', txt: 'Mi cartera', d: 'M12 3a9 9 0 1 0 9 9h-9z M14 2.5V10h7.5A8 8 0 0 0 14 2.5z' },
    { id: 'construye', txt: 'Construye', d: 'M12 2l8.66 5v10L12 22l-8.66-5V7zM12 8v8M8 12h8' },
    { id: 'liga', txt: 'La Liga', d: 'M4 8l4 3 4-6 4 6 4-3-2 10H6z M6 21h12' },
  ];
  const inicial = $derived((estado.sesion?.usuario?.apodo || '?').slice(0, 2));
</script>

{#if estado.sesion?.demo}<div class="demo" role="note">Demo con datos de ejemplo · nada se guarda al recargar</div>{/if}
<header class="cabecera">
  <a class="marca" href="#/cartera" aria-label="Klever, inicio"><span class="logo" aria-hidden="true"></span>klever</a>
  <span class="chip beta">Beta privada</span>
  {#if estado.sesion?.usuario}<a class="avatar" href="#/cuenta" aria-label="Tu cuenta, {estado.sesion.usuario.apodo}">{inicial}</a>{/if}
</header>
<Sello />

{#if estado.cargando}
  <main class="pagina" aria-busy="true"><p class="tenue">Cargando…</p></main>
{:else if publica}
  <Legal partes={resto} />
{:else if !estado.sesion?.usuario}
  <Entrar />
{:else if estado.sesion.necesitaAlta}
  <Alta />
{:else}
  {#if seccion === 'construye'}<Construye partes={resto} />
  {:else if seccion === 'liga'}<Liga partes={resto} />
  {:else if seccion === 'cuenta'}<Cuenta partes={resto} />
  {:else if seccion === 'admin'}<Admin />
  {:else}<MiCartera partes={resto} />{/if}
  <nav class="tabbar cristal" aria-label="Secciones">
    {#each TABS as t}
      <a href="#/{t.id}" aria-current={seccion === t.id ? 'page' : undefined}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.d} /></svg><span>{t.txt}</span>
      </a>
    {/each}
  </nav>
{/if}
{#if estado.aviso}<div class="aviso" role="status">{estado.aviso}</div>{/if}

<style>
  .demo { background: var(--lila-f); color: var(--lila-t); text-align: center; font-size: var(--t-xs); font-weight: 600; padding: 6px 16px; }
  .cabecera { max-width: var(--ancho); margin: 0 auto; display: flex; align-items: center; gap: var(--s2); padding: calc(var(--s3) + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) var(--s1) max(16px, env(safe-area-inset-left)); }
  .marca { display: flex; align-items: center; gap: 8px; font-family: var(--f-disp); font-variation-settings: "SOFT" 100; font-weight: 600; font-size: 1.45rem; color: var(--noche); text-decoration: none; letter-spacing: -.02em; }
  .logo { width: 22px; height: 22px; border-radius: 50%; background: conic-gradient(from 200deg, var(--cobre), var(--lila), var(--agua), var(--cobre)); box-shadow: inset 0 0 0 5px var(--perla-hi); }
  .beta { margin-right: auto; }
  .avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--cobre-f), var(--lila-f)); color: var(--noche); font-weight: 700; text-decoration: none; border: 1px solid var(--linea); text-transform: lowercase; }
  .tabbar { position: fixed; z-index: 20; left: 50%; transform: translateX(-50%); bottom: calc(var(--s3) + env(safe-area-inset-bottom)); width: min(calc(100% - 24px), 420px); display: grid; grid-template-columns: repeat(3, 1fr); padding: 6px; border-radius: var(--r-xl); }
  .tabbar a { display: grid; justify-items: center; gap: 2px; padding: 8px 4px; border-radius: var(--r-l); color: var(--noche-3); text-decoration: none; font-size: var(--t-xs); font-weight: 600; }
  .tabbar a[aria-current="page"] { color: var(--noche); background: linear-gradient(135deg, var(--cobre-f), var(--lila-f)); }
  .tabbar svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
  .aviso { position: fixed; z-index: 30; left: 50%; transform: translateX(-50%); bottom: calc(var(--barra) + var(--s5) + env(safe-area-inset-bottom)); max-width: calc(100% - 32px); background: var(--noche); color: var(--perla); padding: 10px 18px; border-radius: var(--r-pildora); font-size: var(--t-s); font-weight: 600; box-shadow: var(--cristal-sombra); }
</style>
