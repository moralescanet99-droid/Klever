import { describe, expect, it } from 'vitest';
import { anadirConPeso, cuenta, empresasDeHoy, ordenDelDia, quitarYReescalar, textoHuella, POR_DIA } from './construye';
import { empresa } from '../../lib/dominio/catalogo';

const suma = (p: { decimas: number }[]) => p.reduce((a, x) => a + x.decimas, 0);

describe('Construye', () => {
  it('Descubrir: 10 al día, deterministas por fecha y usuario', () => {
    const a = empresasDeHoy('2026-11-09', 1), b = empresasDeHoy('2026-11-09', 1);
    expect(a).toHaveLength(POR_DIA);
    expect(a.map(e => e.ticker)).toEqual(b.map(e => e.ticker));
    expect(new Set(a.map(e => e.ticker)).size).toBe(POR_DIA);
    expect(empresasDeHoy('2026-11-10', 1).map(e => e.ticker)).not.toEqual(a.map(e => e.ticker));
    expect(empresasDeHoy('2026-11-09', 2).map(e => e.ticker)).not.toEqual(a.map(e => e.ticker));
    expect(ordenDelDia('2026-11-09', 1)).toHaveLength(48);
  });
  it('Descubrir: los filtros respetan el orden del día y el final', () => {
    const s = empresasDeHoy('2026-11-09', 1, { sector: 'Salud' });
    expect(s.length).toBeLessThanOrEqual(POR_DIA);
    expect(s.every(e => e.sector === 'Salud')).toBe(true);
    expect(empresasDeHoy('2026-11-09', 1, { pais: 'España', sector: 'Tecnología' }).map(e => e.ticker)).toEqual(['BITA']);
  });
  it('Probar en mi cartera: entra con un 10 % y sigue sumando el 100 %', () => {
    const p = anadirConPeso([{ ticker: 'NUBE', decimas: 500 }, { ticker: 'VITA', decimas: 500 }], 'SOLR');
    expect(p.find(x => x.ticker === 'SOLR')!.decimas).toBe(100); expect(suma(p)).toBe(1000);
    expect(anadirConPeso([], 'SOLR')).toEqual([{ ticker: 'SOLR', decimas: 1000 }]);
  });
  it('Quitar reparte su peso en proporción', () => {
    const p = quitarYReescalar([{ ticker: 'NUBE', decimas: 400 }, { ticker: 'VITA', decimas: 300 }, { ticker: 'SOLR', decimas: 300 }], 'NUBE');
    expect(p.map(x => x.ticker)).toEqual(['VITA', 'SOLR']); expect(suma(p)).toBe(1000);
  });
  it('Huella: cumple, no cumple y sin datos', () => {
    expect(cuenta(empresa('ORBE')!.huella)).toEqual({ si: 1, no: 3, nd: 1 });
    expect(textoHuella(empresa('KAED')!.huella)).toBe('Cumple 4 de 5');
  });
});
