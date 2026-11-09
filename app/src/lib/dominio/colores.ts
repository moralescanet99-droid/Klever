// Color estable por sector (tokens --s-*). Úsalo para anillos, barras y puntos.
import type { Sector } from './tipos';
export const COLOR_SECTOR: Record<Sector, string> = {
  'Tecnología': 'var(--s-tec)', 'Salud': 'var(--s-sal)', 'Energía': 'var(--s-ene)', 'Finanzas': 'var(--s-fin)',
  'Consumo': 'var(--s-con)', 'Industria': 'var(--s-ind)', 'Servicios públicos': 'var(--s-ser)', 'Comunicación': 'var(--s-com)',
};
