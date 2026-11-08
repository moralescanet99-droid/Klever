// Fase 2 (ronda 34) · lógica PURA de «Hoy» (public/js/hoy.js). Uso: node tests/ronda34/unit-hoy34.mjs
import { carteraPrincipal, modeloHoy, svgAnillo } from '../../public/js/hoy.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-HOY34.json');
const J = JSON.stringify;
const A = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, NVDA: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' }, JPM: { sector: 'Finanzas' } };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const L = [{ id: 1, nombre: 'Vieja', creado_en: '2026-11-01 10:00:00', actualizado_en: '2026-11-02 10:00:00', posiciones: P(['KO', 100]) },
  { id: 2, nombre: 'Nueva vacía', creado_en: '2026-11-08 10:00:00', actualizado_en: null, posiciones: [] },
  { id: 3, nombre: 'Tocada ayer', creado_en: '2026-10-01 10:00:00', actualizado_en: '2026-11-07 10:00:00', posiciones: P(['NVDA', 40], ['MSFT', 20], ['KO', 20], ['JNJ', 20]) }];
t('H1', 'Cartera principal: la última tocada CON posiciones', '«Tocada ayer» (no la vacía más reciente)', carteraPrincipal(L)?.nombre, carteraPrincipal(L)?.id === 3);
t('H2', 'Si ninguna tiene posiciones, la última tocada; sin carteras, nada', '«Nueva vacía»; null', J([carteraPrincipal([L[1]])?.id, carteraPrincipal([])]), carteraPrincipal([L[1]])?.id === 2 && carteraPrincipal([]) === null);
let m = modeloHoy(L[2], A);
t('H3', 'Concentrada: semáforos, señal y la acción «Ver qué cambiaría» con la hipótesis de la señal', 'Concentración y Variedad (sin «Datos»); señal de alerta; acción lab con NVDA y un peso menor que 40', J(m),
  m.indicadores.map(i => i.id).join() === 'concentracion,variedad' && m.senal.nivel === 'alerta' && m.accion.tipo === 'lab' && m.accion.ticker === 'NVDA' && m.accion.peso < 40 && m.n === 4);
m = modeloHoy({ id: 9, nombre: 'Repartida', posiciones: P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]) }, A);
t('H4', 'Sin alertas: la acción es abrir la cartera (no se inventa un cambio)', 'acción «Abrir mi cartera»', J(m.accion), m.accion.tipo === 'abrir' && /Abrir mi cartera/.test(m.accion.texto));
m = modeloHoy(L[1], A);
t('H5', 'Cartera vacía: invita a añadir empresas', 'vacia y «Añadir empresas»', J(m), m.vacia && /Añadir/.test(m.accion.texto));
const svg = svgAnillo(P(['A', 50], ['B', 30], ['C', 20]));
t('H6', 'Anillo: un tramo por posición con el color por orden (como la lista y el editor) y decorativo', 'var(--c0), var(--c1), var(--c2); aria-hidden', svg.slice(0, 160), /aria-hidden="true"/.test(svg) && ['--c0', '--c1', '--c2'].every(c => svg.includes(`var(${c})`)) && !/NaN/.test(svg));
t('H7', 'Nada de importes ni rentabilidad en el modelo', 'sin «€», «rentab» ni «ganan»', '', !/€|rentab|ganan/i.test(J(modeloHoy(L[2], A))));
await fin();
