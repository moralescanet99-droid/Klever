// Tema claro/oscuro. Preferencia del sistema por defecto; la elección manual se recuerda solo en este dispositivo (localStorage, opcional).
export type Tema = 'claro' | 'oscuro' | 'sistema';
const CLAVE = 'klever.tema';
export function temaGuardado(): Tema { try { return (localStorage.getItem(CLAVE) as Tema) || 'sistema'; } catch { return 'sistema'; } }
export function aplicarTema(t: Tema = temaGuardado()) {
  const oscuro = t === 'oscuro' || (t === 'sistema' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', oscuro ? '#121628' : '#f5efe7');
}
export function fijarTema(t: Tema) { try { localStorage.setItem(CLAVE, t); } catch { /* sin almacenamiento: solo esta sesión */ } aplicarTema(t); }
