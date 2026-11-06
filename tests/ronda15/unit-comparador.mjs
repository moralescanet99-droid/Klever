// Ronda 15: comparador de dos empresas (módulo puro). Tabla de entradas y salidas esperadas en ronda15/TABLA-CASOS.md. Uso: node tests/ronda15/unit-comparador.mjs
import { compararEmpresas } from '../../public/js/comparador.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-COMP.json');
const J = JSON.stringify;
const f = (p, o) => ({ periodo: p, ingresos: 100, beneficio_neto: 10, resultado_operativo: 20, ebitda: 30, deuda_neta: 60, fuente: 'prueba', actualizado_en: '2026-11-04', ...o });
const E = (nombre, sector, fundamentales) => ({ ticker: nombre, nombre, sector, fundamentales });
const fila = (r, id) => r.filas.find(x => x.id === id);
let r = compararEmpresas(E('A', 'S', [f('FY2024', { ingresos: 120, resultado_operativo: 24, deuda_neta: 60, ebitda: 30 }), f('FY2023', { ingresos: 100 })]), E('B', 'S', [f('FY2024', { ingresos: 90, resultado_operativo: 9, deuda_neta: -10, ebitda: 20 }), f('FY2023', { ingresos: 100 })]));
t('P1', 'Caso base: A crece +20 %, B cae −10 %', 'Crecimiento A 20,0 % y B −10,0 %; margen operativo A 20,0 % y B 10,0 % (resultado operativo / ventas); deuda A 2,0 veces y B «Caja neta (−0,5 veces)»', J(r.filas.map(x => [x.a.texto, x.b.texto])),
  fila(r, 'crecimiento').a.texto === '20,0 %' && fila(r, 'crecimiento').b.texto === '-10,0 %' && fila(r, 'margen_operativo').a.texto === '20,0 %' && fila(r, 'margen_operativo').b.texto === '10,0 %' && fila(r, 'deuda').a.texto === '2,0 veces' && fila(r, 'deuda').b.texto === 'Caja neta (-0,5 veces)' && r.ejercicio === 'FY2024');
t('P1b', 'Solo tres filas y ninguna clasificación de «ganadores»', '3 filas; ninguna propiedad ganador/mejor/puntuación', J(Object.keys(r.filas[0])), r.filas.length === 3 && !JSON.stringify(r).match(/ganador|mejor|puntuaci/i) && r.moneda === 'USD');
r = compararEmpresas(E('A', 'S', [f('FY2024', { resultado_operativo: null, beneficio_neto: 50 }), f('FY2023')]), E('B', 'S', [f('FY2024'), f('FY2023')]));
t('P2', 'Sin resultado operativo (aunque haya beneficio neto)', 'sin_dato con motivo; NO se sustituye por el margen neto (50 %)', `${fila(r, 'margen_operativo').a.estado}: ${fila(r, 'margen_operativo').a.motivo}`, fila(r, 'margen_operativo').a.estado === 'sin_dato' && /no se sustituye por el margen neto/.test(fila(r, 'margen_operativo').a.motivo) && fila(r, 'margen_operativo').a.texto === null);
r = compararEmpresas(E('A', 'S', [f('FY2024', { ebitda: 0 }), f('FY2023')]), E('B', 'S', [f('FY2024', { ebitda: -5 }), f('FY2023')]));
t('P3', 'EBITDA cero o negativo', 'no_comparable con el motivo (la ratio no se interpreta)', `${fila(r, 'deuda').a.estado} / ${fila(r, 'deuda').b.estado}`, fila(r, 'deuda').a.estado === 'no_comparable' && fila(r, 'deuda').b.estado === 'no_comparable' && /nulo o negativo/.test(fila(r, 'deuda').a.motivo));
r = compararEmpresas(E('A', 'S', [f('FY2024', { ebitda: null }), f('FY2023')]), E('B', 'S', [f('FY2024', { deuda_neta: null }), f('FY2023')]));
t('P4', 'EBITDA o deuda sin dato', 'sin_dato en ambos casos', `${fila(r, 'deuda').a.estado} / ${fila(r, 'deuda').b.estado}`, fila(r, 'deuda').a.estado === 'sin_dato' && fila(r, 'deuda').b.estado === 'sin_dato');
r = compararEmpresas(E('A', 'S', [f('FY2024'), f('FY2023')]), E('B', 'S', [f('FY2023'), f('FY2022', { ingresos: 50 })]));
t('P5', 'Ejercicios desalineados (A llega a FY2024; B a FY2023)', 'Se alinea en FY2023, el último en común; crecimiento de A: 100/100−1 = 0 pero necesita FY2022 (A no lo tiene) → sin_dato', `ejercicio ${r.ejercicio}; ${fila(r, 'crecimiento').a.estado}; B ${fila(r, 'crecimiento').b.texto}`, r.ejercicio === 'FY2023' && fila(r, 'crecimiento').a.estado === 'sin_dato' && fila(r, 'crecimiento').b.texto === '100,0 %' && fila(r, 'deuda').a.origen.periodo === 'FY2023' && fila(r, 'deuda').b.origen.periodo === 'FY2023');
r = compararEmpresas(E('A', 'S', [f('FY2024')]), E('B', 'S', [f('FY2021')]));
t('P6', 'Sin ningún ejercicio en común', 'Las tres filas no_comparable con motivo', J(r.filas.map(x => x.a.estado)), r.ejercicio === null && r.filas.every(x => x.a.estado === 'no_comparable' && x.b.estado === 'no_comparable' && /ningún ejercicio en común/.test(x.a.motivo)));
r = compararEmpresas(E('A', 'S', [f('FY2024'), f('FY2023', { ingresos: 0 })]), E('B', 'S', [f('FY2024'), f('FY2023')]));
t('P7', 'Ventas del ejercicio anterior iguales a 0', 'no_comparable (no se divide por cero)', fila(r, 'crecimiento').a.estado, fila(r, 'crecimiento').a.estado === 'no_comparable' && fila(r, 'crecimiento').b.estado === 'ok');
r = compararEmpresas(E('A', 'S', [f('FY2024', { fuente: 'sec', actualizado_en: '2026-11-02' }), f('FY2023')]), E('B', 'T', [f('FY2024', { fuente: 'prueba' }), f('FY2023')]));
t('P8', 'Fuente, periodo y fecha por cifra; sector distinto', 'A: sec · FY2024 · 2026-11-02; B: prueba; mismoSector = false', J([fila(r, 'deuda').a.origen, fila(r, 'deuda').b.origen, r.mismoSector]), fila(r, 'deuda').a.origen.fuente === 'sec' && fila(r, 'deuda').a.origen.fecha === '2026-11-02' && fila(r, 'deuda').b.origen.fuente === 'prueba' && r.mismoSector === false);
await fin();
