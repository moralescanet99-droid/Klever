// Enrutado por hash (#/seccion/sub/param). Funciona igual en Pages y en el HTML del modo demo.
export const ruta = $state({ partes: [] as string[], consulta: new URLSearchParams() });
function leer() {
  const h = location.hash.replace(/^#\/?/, ''), [camino, q = ''] = h.split('?');
  ruta.partes = camino.split('/').filter(Boolean).map(decodeURIComponent); ruta.consulta = new URLSearchParams(q);
}
leer(); addEventListener('hashchange', () => { leer(); scrollTo({ top: 0 }); });
export const ir = (destino: string) => { location.hash = destino.startsWith('#') ? destino : '#' + destino; };
