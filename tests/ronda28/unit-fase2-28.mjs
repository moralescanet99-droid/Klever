// Ronda 28 · fase 2: piezas PURAS. «Pega tu cartera» (pegado.js) y umbrales propios de las señales (senales.js). Uso: node tests/ronda28/unit-fase2-28.mjs
import { leerPegado, pareceLista } from '../../public/js/pegado.js';
import { senales, umbralesValidos, UMBRALES } from '../../public/js/senales.js';
import { radiografia } from '../../public/js/calculos.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-F2-28.json');
const J = JSON.stringify;
const U = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, AAPL: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, 'BRK.B': { sector: 'Finanzas' }, NVDA: { sector: 'Tecnología' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' } };

let r = leerPegado('KO 40, PG 60', U);
t('P1', 'Lista simple «KO 40, PG 60»', 'dos pares exactos, nada desconocido', J(r), J(r.pares) === J([{ ticker: 'KO', peso: 40 }, { ticker: 'PG', peso: 60 }]) && !r.desconocidos.length && !r.invalidos.length);
r = leerPegado('aapl: 25,5 %; msft=30\nBRK.B 10%', U);
t('P2', 'Minúsculas, «:», «=», coma decimal, «%», saltos de línea y símbolo con punto', 'AAPL 25,5 · MSFT 30 · BRK.B 10', J(r.pares), J(r.pares) === J([{ ticker: 'AAPL', peso: 25.5 }, { ticker: 'MSFT', peso: 30 }, { ticker: 'BRK.B', peso: 10 }]));
r = leerPegado('KO 40, ZZZZ 20, PG 60', U);
t('P3', 'Un símbolo fuera del universo se declara y NO se sustituye por otro', 'ZZZZ en desconocidos; KO y PG sí', J(r), J(r.desconocidos) === J(['ZZZZ']) && r.pares.length === 2);
r = leerPegado('KO 0, PG 150, AAPL 10,55', U);
t('P4', 'Pesos fuera de rango o con más de una decimal se rechazan (no se redondean en silencio)', 'ningún par; tres inválidos', J(r), r.pares.length === 0 && r.invalidos.length === 3);
r = leerPegado('KO 10, KO 30', U);
t('P5', 'Un símbolo repetido conserva el ÚLTIMO peso (una sola posición)', 'KO 30', J(r.pares), J(r.pares) === J([{ ticker: 'KO', peso: 30 }]));
t('P6', '¿Parece una lista? Una búsqueda normal no; dos pares sí', 'Apple / KO / «KO 40, PG 60»', J([pareceLista('Apple'), pareceLista('KO'), pareceLista('KO 40'), pareceLista('KO 40, PG 60')]), J([pareceLista('Apple'), pareceLista('KO'), pareceLista('KO 40'), pareceLista('KO 40, PG 60')]) === J([false, false, false, true]));

const rad = radiografia([{ ticker: 'NVDA', peso: 35 }, { ticker: 'MSFT', peso: 5 }, { ticker: 'KO', peso: 20 }, { ticker: 'JNJ', peso: 20 }, { ticker: 'XOM', peso: 20 }], U);
const ids = u => senales(rad, 3, u).map(s => s.id);
t('U1', 'Sin umbrales propios: NVDA 35 % se señala (25 % de Klever)', 'posicion', J(ids(null)), ids(null).includes('posicion'));
t('U2', 'Con umbral propio de posición 50 %: NVDA 35 % ya no se señala y el detalle habla de «tu referencia»', 'sin posicion; Tecnología 40 % sigue siendo categoría (40 de Klever)', J(senales(rad, 3, { posicion: 50 }).map(s => [s.id, s.detalle])),
  !ids({ posicion: 50 }).includes('posicion') && ids({ posicion: 50 }).includes('categoria') && senales(rad, 3, { posicion: 50 }).find(s => s.id === 'categoria').detalle.includes('Tu referencia: más del 40 %'));
t('U3', 'Umbrales no válidos (texto, 0, 200) se ignoran y se usan los de Klever', J(UMBRALES), J([umbralesValidos({ posicion: 'x', categoria: 0 }), umbralesValidos({ posicion: 200 })]),
  J(umbralesValidos({ posicion: 'x', categoria: 0 })) === J({ ...UMBRALES }) && umbralesValidos({ posicion: 200 }).posicion === 25);
t('U4', 'Cada señal trae su «por qué importa» (segundo nivel del detalle)', 'todas con porque', J(senales(rad).map(s => !!s.porque)), senales(rad).every(s => typeof s.porque === 'string' && s.porque.length > 10));
await fin();
