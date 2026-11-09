<script lang="ts" module>
  // Iconos de trazo de Construye (24×24). Decorativos: siempre aria-hidden; el texto va al lado.
  export const ICONOS = {
    ok: 'M5 12.5l4.2 4L19 7',
    no: 'M7 7l10 10M17 7L7 17',
    nd: 'M7 12h10',
    mas: 'M12 5v14M5 12h14',
    menos: 'M5 12h14',
    filtro: 'M4 6h16M7 12h10M10 18h4',
    pin: 'M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11z M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z',
    ojo: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z M12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z',
    capa: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5',
    moneda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15 9.2a3.6 3.6 0 1 0 0 5.6 M8 11h5 M8 13.2h5',
    matraz: 'M9.5 3h5 M10.5 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5.5-10V3 M7.5 15h9',
    izq: 'M15 5l-7 7 7 7',
    der: 'M9 5l7 7-7 7',
    atras: 'M19 12H5 M11 6l-6 6 6 6',
    flecha: 'M5 12h14 M13 6l6 6-6 6',
    lista: 'M8 6h12M8 12h12M8 18h12 M4 6h.01M4 12h.01M4 18h.01',
    chispa: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
    campana: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20.5a2 2 0 0 0 4 0',
    pluma: 'M4 20l4-1 11-11-3-3L5 16z M14 6l3 3',
    hora: 'M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9',
    espera: 'M7 12h.01M12 12h.01M17 12h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    corona: 'M4 8l4 3 4-6 4 6 4-3-2 10H6z',
    libro: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
    quitar: 'M5 7h14M10 7V4.5h4V7 M7 7l1 13h8l1-13',
    equipo: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 14.5a6.5 6.5 0 0 1 3.5 5.5',
  } as const;
  export type NombreIco = keyof typeof ICONOS;
</script>

<script lang="ts">
  let { n, tam = 18 }: { n: NombreIco; tam?: number } = $props();
</script>

<svg class="ico" width={tam} height={tam} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={ICONOS[n]} /></svg>

<style>
  .ico { flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
</style>
