<script lang="ts">
  // Avatar de apodo: dos letras sobre un fondo estable. Decorativo (el apodo se lee al lado).
  import { iniciales, fondoAvatar } from './util';
  let { apodo, id, tu = false, tam = 28 }: { apodo: string; id: number; tu?: boolean; tam?: number } = $props();
</script>
<span class="av" class:tu style="--tam:{tam}px; background:{tu ? 'conic-gradient(from 140deg, var(--cobre-f), var(--lila-f), var(--agua-f), var(--medio-f), var(--cobre-f))' : fondoAvatar(id)}" aria-hidden="true">{iniciales(apodo)}</span>
<style>
  .av { flex: none; width: var(--tam); height: var(--tam); border-radius: 50%; display: grid; place-items: center; font: 750 calc(var(--tam) * .36)/1 var(--f-txt); color: var(--noche); letter-spacing: .02em; }
  .tu { box-shadow: 0 0 0 2px var(--noche); text-transform: lowercase; }
</style>
