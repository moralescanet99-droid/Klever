<script lang="ts">
  // Código de la liga con «Copiar código» y «Compartir» (navigator.share; si no hay, copia el texto de invitación).
  import type { Liga } from '../../lib/dominio/tipos';
  import { copiar, compartir, textoInvitacion } from './util';
  let { liga, grande = false }: { liga: Liga; grande?: boolean } = $props();
  let estadoTxt = $state('');
  const texto = $derived(textoInvitacion(liga.nombre, liga.codigo));
  async function copiarCodigo() { estadoTxt = (await copiar(liga.codigo)) ? 'Código copiado' : 'No he podido copiar: apúntalo a mano.'; }
  async function compartirlo() {
    const r = await compartir({ title: `Liga ${liga.nombre} en Klever`, text: texto });
    estadoTxt = r === 'compartido' ? 'Invitación compartida' : r === 'copiado' ? 'Invitación copiada: pégala donde quieras' : r === 'cancelado' ? '' : 'No he podido compartir: copia el código.';
  }
</script>

<div class="invitar" class:grande>
  <p class="eti">Código de la liga</p>
  <p class="codigo mono" aria-label="Código: {liga.codigo.split('').join(' ')}">{liga.codigo}</p>
  <div class="botones">
    <button class="btn" type="button" onclick={copiarCodigo}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>Copiar código
    </button>
    <button class="btn btn-primario" type="button" onclick={compartirlo}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>Compartir
    </button>
  </div>
  {#if grande}
    <div class="texto">
      <p class="eti">Invitación lista para enviar</p>
      <p class="peq">{texto}</p>
    </div>
  {/if}
  <p class="estado peq" role="status" aria-live="polite">{estadoTxt}</p>
</div>

<style>
  .invitar { display: grid; gap: var(--s2); justify-items: center; width: 100%; }
  .codigo { font-size: 1.6rem; font-weight: 600; letter-spacing: .28em; padding: 6px 4px 6px calc(4px + .28em); border-radius: var(--r); background: var(--perla-hi); border: 1px dashed var(--linea-2); }
  .grande .codigo { font-size: 2.2rem; padding: 10px 14px 10px calc(14px + .28em); }
  .botones { display: flex; gap: var(--s2); flex-wrap: wrap; justify-content: center; }
  .btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .texto { width: 100%; text-align: left; display: grid; gap: 4px; padding: var(--s3); border-radius: var(--r); background: var(--blanco); border: 1px solid var(--linea); overflow-wrap: anywhere; }
  .estado { min-height: 1.4em; color: var(--ok); font-weight: 600; }
</style>
