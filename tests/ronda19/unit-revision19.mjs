// Ronda 19 · la revisión SIN nota global explica su causa sin repetir un párrafo por activo y deja ver lo que sí existe. Tres motivos distintos: instrumento sin método (ETF, bancos),
// datos ausentes o inválidos y cobertura insuficiente. Casos: plantilla mixta actual (con ETF), solo acciones evaluables, datos inválidos, solo ETF, ETF + banco, ETF + datos ausentes.
// Desde SQLite (semilla íntegra) hasta el texto que se pinta. Ningún cambio modifica posiciones ni pesos. Uso: node tests/ronda19/unit-revision19.mjs
import { readFileSync } from 'node:fs';
import { crearEnv, RAIZ, registro } from '../lib/d1-sqlite.mjs';
import { onRequestGet } from '../../functions/api/universo.js';
import { evaluar } from '../../public/js/nota.js';
import { htmlNotaEstructura, explicarNota } from '../../public/js/nota-ui.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-REV19.json');
const SEMILLA = readFileSync(RAIZ + '/data/seed-prueba.sql', 'utf8'), J = JSON.stringify;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const visible = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const caso = async (cartera, sql) => { const env = crearEnv(); env.sql.exec(SEMILLA); if (sql) env.sql.exec(sql); const u = await (await onRequestGet({ env })).json(), antes = J(cartera), ev = evaluar(cartera, u);
  const html = htmlNotaEstructura(esc, ev, null), sinDetalle = html.replace(/<details[\s\S]*?<\/details>/g, ''), cuenta = (txt, re) => (txt.match(re) || []).length;
  return { ev, html, txt: visible(html), fuera: visible(sinDetalle), expl: explicarNota(ev), intacta: J(cartera) === antes, cuenta }; };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const MIXTA = P(['SCHD', 17], ['VYM', 16.6], ['KO', 16.6], ['PG', 16.6], ['JNJ', 16.6], ['XOM', 16.6]);

let c = await caso(MIXTA);
const ESPERADO = 'Esta cartera no tiene nota global. Los ETF representan el 33,6 % y el método actual no evalúa su composición. Puedes revisar el reparto y la concentración por posición; el detalle explica los límites del análisis.';
t('V1', 'Plantilla MIXTA actual (SCHD 17 % y VYM 16,6 % son ETF; KO, PG, JNJ y XOM, acciones)', 'Sin nota global; la explicación breve empieza EXACTAMENTE con la de la revisión («Esta cartera no tiene nota global. Los ETF representan el 33,6 % y el método actual no evalúa su composición. Puedes revisar el reparto y la concentración por posición; el detalle explica los límites del análisis.») y, adaptada a los datos reales de la semilla, añade que además faltan datos de JNJ y XOM (no se presenta el resto como «cobertura evaluada»)', `publicada ${c.ev.publicada}; «${c.expl.slice(0, 160)}…»`, !c.ev.publicada && c.expl === ESPERADO + ' Además faltan datos de JNJ y XOM: el detalle dice cuáles.' && /^Nota pendiente\. Esta cartera no tiene nota global\./.test(c.fuera.replace(/^.*?(?=Nota pendiente)/, '')));
t('V2', 'Lo que sí existe, a la vista (fuera del desplegable)', 'Asignación total, número de posiciones, mayor posición con su nombre y peso, reparto por instrumento (ETF 33,6 % · acciones 66,4 %) y la distinción «dos ETF no equivalen a dos empresas»', `${c.fuera.match(/Lo que sí podemos decirte[^]*?(?=Instantánea|No es una)/)?.[0].slice(0, 330)}`,
  /Lo que sí podemos decirte: asignado 100 % en 6 posiciones; la mayor es Schwab US Dividend Equity ETF \(SCHD\) con el 17 %/.test(c.fuera) && /Por instrumento: ETF 33,6 % · acciones 66,4 %/.test(c.fuera) && /Dos ETF no equivalen a dos empresas/.test(c.fuera));
t('V3', 'Sin repetir un párrafo por activo', 'Fuera del desplegable no aparece el motivo «sin metodología ni composición válida» (ni una vez por ETF); el aviso naranja ocupa menos de 400 caracteres; el motivo por activo sigue disponible dentro de «Cómo se calcula»', `motivo repetido fuera ${c.cuenta(c.fuera, /sin metodolog[ií]a ni composici[oó]n/g)}; aviso ${c.txt.match(/Nota pendiente\.[^]*?(?=Lo que sí)/)?.[0].length}; dentro ${c.cuenta(c.txt, /sin metodolog[ií]a ni composici[oó]n v[aá]lida/g)}`,
  c.cuenta(c.fuera, /sin metodolog[ií]a ni composici[oó]n/g) === 0 && c.html.match(/<p class="nota-pend">[^]*?<\/p>/)[0].replace(/<[^>]+>/g, '').length < 400 && c.cuenta(c.txt, /sin metodolog[ií]a ni composici[oó]n v[aá]lida/g) === 2 && /Cómo se calcula/.test(c.html));
t('V4', 'Las posiciones y los pesos no cambian', 'La cartera de entrada es idéntica después de evaluar y de pintar', J(MIXTA).slice(0, 80), c.intacta);

c = await caso(P(['KO', 60], ['PG', 40]));
t('V5', 'Cartera SOLO de acciones evaluables (KO 60 % / PG 40 %)', 'Se publica la nota 4,4 con su titular; no aparece el bloque de «lo que sí podemos decirte» ni mensaje de ETF', `nota ${c.ev.nota}; ${c.expl}`, c.ev.publicada && c.ev.nota === 4.4 && /Toda la cartera está en Consumo básico y Coca-Cola concentra el 60 %/.test(c.expl) && !/Lo que sí podemos decirte|ETF/.test(c.fuera) && c.intacta);

c = await caso(P(['KO', 60], ['PG', 40]), "UPDATE fundamentales SET fuente=NULL WHERE ticker='KO' AND periodo='FY2024'");
t('V6', 'Datos INVÁLIDOS (una fila de KO sin fuente)', 'Pendiente por procedencia, con su causa concreta; no se habla de ETF ni de método; sin párrafo largo', `«${c.fuera.match(/Nota pendiente\..{0,170}/)?.[0]}»`, !c.ev.publicada && /Procedencia incompleta: KO FY2024: la fila no tiene fuente/.test(c.fuera) && !/ETF|no evalúa su composición/.test(c.fuera) && c.intacta);

c = await caso(P(['SCHD', 50], ['VYM', 50]));
t('V7', 'Cartera SOLO de ETF (SCHD 50 % / VYM 50 %)', 'Dice que todo el peso son ETF y que el método no evalúa su composición; lo que sí existe: 2 posiciones, mayor 50 %, solo ETF', `«${c.expl}»; ${c.fuera.match(/Lo que sí podemos decirte[^]*?(?=Instantánea|No es una)/)?.[0].slice(0, 200)}`,
  /^Esta cartera no tiene nota global\. Todo el peso son ETF y el método actual no evalúa su composición\. Puedes revisar el reparto y la concentración por posición/.test(c.expl) && /asignado 100 % en 2 posiciones/.test(c.fuera) && !/Por instrumento/.test(c.fuera) && /Dos ETF no equivalen a dos empresas/.test(c.fuera) && c.cuenta(c.fuera, /sin metodolog[ií]a ni composici[oó]n/g) === 0);

c = await caso(P(['SCHD', 50], ['JPM', 50]));
t('V8', 'ETF + banco (SCHD 50 % / JPM 50 %): dos instrumentos sin método', 'Una sola frase para los dos: «Los ETF representan el 50 % y el banco el 50 %…»', `«${c.expl.slice(0, 230)}»`, /Los ETF representan el 50 % y el banco el 50 %: el método actual no evalúa la composición de los ETF ni la deuda y los beneficios de los bancos/.test(c.expl));

c = await caso(P(['SCHD', 40], ['KO', 30], ['PG', 30]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
t('V9', 'ETF + datos ausentes en una acción evaluable (KO sin EBITDA)', 'Menciona los ETF y, además, que faltan datos de KO (el detalle dice cuáles); no convierte el resto en «cobertura evaluada»', `«${c.expl.slice(0, 260)}»`, /Los ETF representan el 40 % y el método actual no evalúa su composición/.test(c.expl) && /Además faltan datos de KO/.test(c.expl) && !/cobertura evaluada/.test(c.txt));

// la misma explicación se conserva con la lista de causas agrupada (cobertura insuficiente: pocos comparables)
c = await caso(P(['AAPL', 50], ['MSFT', 50]));
t('V10', 'Cobertura insuficiente por pocos comparables (AAPL y MSFT, sector con 18 empresas)', 'Un solo grupo de causa para los dos («AAPL y MSFT (100 % de la cartera): solo hay …»), no un párrafo por activo', `«${c.expl.slice(0, 260)}»`, !c.ev.publicada && /Causa principal: AAPL y MSFT \(100 % de la cartera\): solo hay \d+ comparables/.test(c.expl) && (c.expl.match(/solo hay/g) || []).length <= 2);
await fin();
