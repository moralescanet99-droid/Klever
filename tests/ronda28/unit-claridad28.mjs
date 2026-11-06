// Ronda 28 · piezas puras de la fase 1 del plan: los TRES INDICADORES (senales.js) y el REPARTO A PARTES IGUALES (app.js, función pura exportada).
// Comportamiento, no frases: niveles del semáforo en los bordes de cada umbral, ETF como una sola variedad, «Datos» sin evaluación = «Calculando» (no se inventa una cifra),
// y el reparto igual que siempre suma exactamente 100 % con una decimal. Uso: node tests/ronda28/unit-claridad28.mjs
import { radiografia } from '../../public/js/calculos.js';
import { indicadores } from '../../public/js/senales.js';
import { registro } from '../lib/d1-sqlite.mjs';
import { readFileSync } from 'node:fs';
const { t, fin } = registro('evidencias-CLA28.json');
const J = JSON.stringify;
const A = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, NVDA: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' }, JPM: { sector: 'Finanzas' }, AMZN: { sector: 'Consumo discrecional' }, SCHD: { sector: 'ETF dividendos', tipo: 'etf' }, VYM: { sector: 'ETF dividendos', tipo: 'etf' } };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const niv = (pos, ev = null) => Object.fromEntries(indicadores(radiografia(pos, A), ev).map(i => [i.id, i.nivel]));

t('C1', 'Repartida (5 × 20 %, 5 categorías): concentración baja y variedad amplia', 'ok / ok', J(niv(P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20])) ), J(niv(P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]))) === J({ concentracion: 'ok', variedad: 'ok', datos: 'na' }));
const borde = w => P(['NVDA', w], ['KO', 15], ['JNJ', 15], ['XOM', 15], ['JPM', 15], ['AMZN', Math.round((25 - w) * 10) / 10 + 15]);   // ninguna otra posición ni categoría pasa del umbral
const C2 = [24.9, 25, 39.9, 40].map(w => niv(borde(w)).concentracion);
t('C2', 'Bordes de concentración por posición: 24,9 % → baja; 25 % → media; 39,9 % → media; 40 % → alta', 'ok · medio · medio · alto', J(C2), J(C2) === J(['ok', 'medio', 'medio', 'alto']));
t('C3', 'Concentración por CATEGORÍA aunque ninguna posición llegue al 25 %: Tecnología 44 % (22 + 22) → media', 'medio', niv(P(['NVDA', 22], ['MSFT', 22], ['KO', 20], ['JNJ', 18], ['XOM', 18])).concentracion, niv(P(['NVDA', 22], ['MSFT', 22], ['KO', 20], ['JNJ', 18], ['XOM', 18])).concentracion === 'medio');
t('C4', 'Los ETF cuentan como UNA variedad (dos ETF de dividendos + 2 acciones = 3)', 'variedad media con «3 categorías»', J(indicadores(radiografia(P(['SCHD', 25], ['VYM', 25], ['KO', 25], ['JNJ', 25]), A))[1]),
  (i => i.nivel === 'medio' && i.dato === '3 categorías')(indicadores(radiografia(P(['SCHD', 25], ['VYM', 25], ['KO', 25], ['JNJ', 25]), A))[1]));
t('C5', 'Sin evaluación disponible, «Datos» dice «Calculando» y no inventa un porcentaje', 'nivel na, sin dato', J(indicadores(radiografia(P(['KO', 60], ['PG', 40]), A))[2]),
  (i => i.nivel === 'na' && i.valor === 'Calculando' && i.dato === '')(indicadores(radiografia(P(['KO', 60], ['PG', 40]), A))[2]));
const ev = { reparto: P(['SCHD', 50], ['KO', 30], ['JNJ', 20]), sinEvaluar: [{ ticker: 'SCHD', peso: 50 }] };
t('C6', '«Datos» con evaluación: 50 % del peso analizable → parciales; 100 % → completos; 30 % → escasos', 'medio · ok · alto',
  J([indicadores(radiografia(ev.reparto, A), ev)[2], indicadores(radiografia(ev.reparto, A), { reparto: ev.reparto, sinEvaluar: [] })[2], indicadores(radiografia(ev.reparto, A), { reparto: ev.reparto, sinEvaluar: [{ peso: 70 }] })[2]].map(i => i.nivel)),
  J([indicadores(radiografia(ev.reparto, A), ev)[2], indicadores(radiografia(ev.reparto, A), { reparto: ev.reparto, sinEvaluar: [] })[2], indicadores(radiografia(ev.reparto, A), { reparto: ev.reparto, sinEvaluar: [{ peso: 70 }] })[2]].map(i => i.nivel)) === J(['medio', 'ok', 'alto']));
t('C7', 'Cartera vacía: ningún indicador', '[]', J(indicadores(radiografia([], A))), indicadores(radiografia([], A)).length === 0);

// repartoIgual vive en app.js (que toca el DOM al cargarse): se extrae su texto y se evalúa sola
const src = readFileSync(new URL('../../public/app.js', import.meta.url), 'utf8'), m = src.match(/export function repartoIgual\(n\) \{[^\n]*\}/);
const repartoIgual = m ? new Function(`return (${m[0].replace('export ', '')})`)() : null;
const casos = [1, 2, 3, 6, 7, 9, 11, 30].map(n => [n, repartoIgual ? repartoIgual(n) : null]);
t('C8', 'Reparto a partes iguales: suma EXACTAMENTE 100 %, una decimal, diferencia máxima de 0,1 entre posiciones', 'para n = 1, 2, 3, 6, 7, 9, 11 y 30', J(casos.map(([n, w]) => [n, w && w.slice(0, 3)])),
  !!repartoIgual && casos.every(([n, w]) => w.length === n && Math.round(w.reduce((a, x) => a + x * 10, 0)) === 1000 && w.every(x => Math.abs(x * 10 - Math.round(x * 10)) < 1e-9) && Math.max(...w) - Math.min(...w) <= 0.1 + 1e-9) && repartoIgual(0).length === 0);
await fin();
