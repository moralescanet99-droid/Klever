// Ronda 26 · SEÑALES de la cartera (public/js/senales.js) sobre la radiografía real (calculos.js). Módulo puro: sin servidor ni navegador.
// Se comprueba el COMPORTAMIENTO que promete la interfaz: qué señal sale con cada reparto, que no se repite la misma idea, que los ETF no cuentan
// como exposición sectorial, que una cartera incompleta o con exceso se declara, que la hipótesis del laboratorio siempre propone un peso MENOR
// sobre un activo QUE YA ESTÁ (nunca elige un activo nuevo por la persona) y que la simulación resultante es viable. Uso: node tests/ronda26/unit-senales26.mjs
import { radiografia, simular } from '../../public/js/calculos.js';
import { senales, hipotesis, pesoHipotesis, UMBRALES } from '../../public/js/senales.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-SEN26.json');
const J = JSON.stringify;
const A = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, NVDA: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, AMZN: { sector: 'Consumo discrecional' }, TSLA: { sector: 'Consumo discrecional' },
  GOOGL: { sector: 'Comunicaciones' }, META: { sector: 'Comunicaciones' }, SCHD: { sector: 'ETF dividendos', tipo: 'etf' }, VYM: { sector: 'ETF dividendos', tipo: 'etf' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' }, JPM: { sector: 'Finanzas' } };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const caso = pos => { const r = radiografia(pos, A), s = senales(r); return { r, s, ids: s.map(x => x.id), h: s.map(x => hipotesis(x, r, pos)) }; };

let c = caso(P(['NVDA', 40], ['MSFT', 20], ['AMZN', 15], ['KO', 15], ['JNJ', 10]));
t('S1', 'Tecnología 60 % y NVDA 40 %: dos alertas distintas, la de categoría primero', 'ids [categoria, posicion]; títulos cortos; hipótesis NVDA → 20 % proporcional', `${J(c.ids)} ${J(c.s.map(x => x.titulo))} ${J(c.h[0])}`,
  J(c.ids) === J(['categoria', 'posicion']) && c.s[0].titulo === 'Exposición alta: Tecnología' && c.s[1].titulo === 'NVDA pesa el 40 %' && J(c.h[0]) === J({ ticker: 'NVDA', peso: 20, fin: 'proporcional' }) && c.s.every(x => x.titulo.length <= 40));
const sim = simular(c.r.categorias.length && P(['NVDA', 40], ['MSFT', 20], ['AMZN', 15], ['KO', 15], ['JNJ', 10]), c.h[0], c.h[0].fin);
t('S2', 'La hipótesis propuesta se puede simular y deja el peso liberado sin asignar (no lo reparte en otra empresa)', 'viable; NVDA 20; las demás igual; 20 % libre', `${sim.viable} ${J(sim.despues)}`,
  sim.viable && sim.despues.find(p => p.ticker === 'NVDA').peso === 20 && sim.despues.find(p => p.ticker === 'MSFT').peso === 20 && Math.round(sim.despues.reduce((a, p) => a + p.peso, 0)) === 80);

c = caso(P(['KO', 50], ['JNJ', 20], ['XOM', 30]));
t('S3', 'Una categoría alta con UNA sola empresa (KO 50 %): no se repite la idea como «KO pesa el 50 %»', 'solo la de categoría (sin «posicion»)', J(c.ids), c.ids.includes('categoria') && !c.ids.includes('posicion'));

c = caso(P(['SCHD', 50], ['VYM', 30], ['KO', 20]));
t('S4', 'Los ETF no cuentan como exposición sectorial (ETF dividendos 80 % no es «Exposición alta»)', 'sin «categoria»; SCHD 50 % sí se señala como posición', J(c.s.map(x => x.titulo)), !c.ids.includes('categoria') && c.ids.includes('posicion') && c.s.find(x => x.id === 'posicion').titulo === 'SCHD pesa el 50 %');

c = caso(P(['NVDA', 17], ['MSFT', 16.6], ['AMZN', 16.6], ['GOOGL', 16.6], ['META', 16.6], ['TSLA', 16.6]));
t('S5', 'Plantilla Crecimiento (3 categorías de ~33 %): aviso «Solo 3 categorías», sin alertas inventadas', 'un único aviso; su acción no elige activo (ticker vacío, 10 %)', `${J(c.s.map(x => [x.nivel, x.titulo]))} ${J(c.h[0])}`,
  J(c.ids) === J(['sectores']) && c.s[0].nivel === 'aviso' && c.s[0].titulo === 'Solo 3 categorías' && c.h[0].ticker === '' && c.h[0].peso === 10);

c = caso(P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 5]));
t('S6', 'Cartera incompleta (85 %): se declara lo que falta y la acción usa el porcentaje sin asignar', '«Falta asignar 15 %»; hipótesis sin_asignar 15', `${J(c.s.map(x => x.titulo))} ${J(c.h.at(-1))}`, c.s.some(x => x.titulo === 'Falta asignar 15 %') && J(c.h.at(-1)) === J({ ticker: '', peso: 15, fin: 'sin_asignar' }));

c = caso(P(['KO', 70], ['PG', 50]));
t('S7', 'Exceso (120 %): la primera señal es el exceso y no tiene acción de laboratorio (no se puede simular)', 'exceso primero; accion null', `${J(c.s.map(x => x.titulo))}`, c.ids[0] === 'exceso' && c.s[0].accion === null && hipotesis(c.s[0], c.r, []) === null);

c = caso(P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]));
t('S8', 'Reparto sin concentraciones (5 × 20 %, 5 categorías): estado correcto, sin alarmas', 'una señal «ok»; detalle que dice que no mide riesgo', `${J(c.s)}`, J(c.ids) === J(['ok']) && c.s[0].nivel === 'ok' && /No mide riesgo/.test(c.s[0].detalle));

c = caso(P(['KO', 100]));
t('S9', 'Una sola posición: alerta propia (no «Exposición alta» ni «KO pesa el 100 %»)', 'ids [unica]', J(c.ids), J(c.ids) === J(['unica']));
t('S10', 'Cartera vacía: ninguna señal', '[]', J(senales(radiografia([], A))), senales(radiografia([], A)).length === 0 && senales(null).length === 0);

const pesos = [100, 60, 40, 25, 3, 2, 1.5, 1, 0.5];
t('S11', 'El peso hipotético siempre es MENOR que el actual, ≥ 0,1 %, como mucho 20 % y con una decimal', J(pesos.map(pesoHipotesis)), J(pesos.map(pesoHipotesis)),
  pesos.every(w => { const h = pesoHipotesis(w); return h < w && h >= 0.1 && h <= 20 && Math.abs(h * 10 - Math.round(h * 10)) < 1e-9; }));
t('S12', 'Ninguna hipótesis propone un activo que no esté ya en la cartera (sin recomendaciones)', 'para todos los casos anteriores', 'revisado en S1–S9',
  [P(['NVDA', 40], ['MSFT', 20], ['AMZN', 15], ['KO', 15], ['JNJ', 10]), P(['KO', 50], ['JNJ', 20], ['XOM', 30]), P(['SCHD', 50], ['VYM', 30], ['KO', 20]), P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 5])]
    .every(pos => { const r = radiografia(pos, A); return senales(r).every(s => { const h = hipotesis(s, r, pos); return !h || h.ticker === '' || pos.some(p => p.ticker === h.ticker); }); }));
t('S13', 'Los umbrales son los declarados en la interfaz (25 % posición, 40 % categoría, ≤ 3 categorías, < 4 posiciones) y no se pueden cambiar en tiempo de ejecución', J(UMBRALES), J(UMBRALES),
  UMBRALES.posicion === 25 && UMBRALES.categoria === 40 && UMBRALES.sectores === 3 && UMBRALES.posiciones === 4 && Object.isFrozen(UMBRALES));
await fin();
