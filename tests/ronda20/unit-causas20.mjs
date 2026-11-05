// Ronda 20 · causas COEXISTENTES con código estable (método no aplicable, dato ausente o inválido, comparables insuficientes), separadas del efecto agregado «no se alcanza la cobertura».
// Los tres casos exactos de la revisión de la ronda 19, el caso conjunto ETF + banco + dato, la plantilla actual, solo ETF y una cartera con nota. Semilla íntegra de SQLite; una semilla nueva por caso.
// Se comprueba también que no se cambian posiciones, pesos ni notas calculadas y que el peso de una posición no se suma dos veces. Uso: node tests/ronda20/unit-causas20.mjs
import { readFileSync } from 'node:fs';
import { crearEnv, RAIZ, registro } from '../lib/d1-sqlite.mjs';
import { onRequestGet } from '../../functions/api/universo.js';
import { evaluar } from '../../public/js/nota.js';
import { explicarNota, estadoNota, causasRelevantes, htmlNotaEstructura } from '../../public/js/nota-ui.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-CAU20.json');
const SEMILLA = readFileSync(RAIZ + '/data/seed-prueba.sql', 'utf8'), J = JSON.stringify, P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), visible = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const caso = async (cartera, sql) => { const env = crearEnv(); env.sql.exec(SEMILLA); if (sql) env.sql.exec(sql); const u = await (await onRequestGet({ env })).json(), antes = J(cartera), ev = evaluar(cartera, u);
  return { ev, expl: explicarNota(ev), estado: estadoNota(ev), html: htmlNotaEstructura(esc, ev, null), intacta: J(cartera) === antes, cod: tk => (ev.sinEvaluar.find(s => s.ticker === tk)?.causas || []).map(c => c.codigo + (c.bloque ? '@' + c.bloque : '')) }; };
const sinDup = (ev) => new Set(ev.sinEvaluar.map(s => s.ticker)).size === ev.sinEvaluar.length;

let c = await caso(P(['JPM', 50], ['KO', 50]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
t('C1', 'JPM 50 % + KO 50 %, KO sin EBITDA (caso 1 de la revisión)', 'Coexisten las dos causas: método no aplicable (banco, 50 %) Y dato ausente (KO). El resumen dice las dos y no sustituye una por otra', `${c.estado} · ${c.expl} · JPM ${c.cod('JPM')} · KO ${c.cod('KO')}`,
  c.expl === 'El método no analiza la deuda y los beneficios del banco (50 %) y faltan datos de KO.' && c.cod('JPM').includes('metodo_no_aplicable@deuda') && c.cod('KO').includes('dato_ausente@deuda') && c.estado === 'Evaluación parcial' && c.intacta && sinDup(c.ev));

c = await caso(P(['SCHD', 1], ['AAPL', 99]));
t('C2', 'SCHD 1 % + AAPL 99 %, sin tocar la semilla (caso 2)', 'La causa es la población de comparables de AAPL (no un «dato ausente» ni el ETF del 1 %): el ETF solo se menciona al final, como otra limitación, sin culparle del umbral de cobertura', `${c.expl} · AAPL ${c.cod('AAPL')}`,
  /^No hay comparables suficientes en su sector para valorar «deuda y caja» y «rentabilidad y crecimiento» de AAPL \(99 %\)\. Además, el método no analiza la composición de los ETF \(1 %\)\.$/.test(c.expl) && c.cod('AAPL').every(x => x.startsWith('comparables_insuficientes')) && !/faltan datos/.test(c.expl));

c = await caso(P(['JPM', 50], ['PG', 50]), "UPDATE mercado SET capitalizacion=NULL WHERE ticker='JPM'");
t('C3', 'JPM 50 % + PG 50 %, JPM sin capitalización (caso 3)', 'La falta de capitalización YA NO queda relegada al detalle: el resumen menciona el método bancario y los datos de JPM; JPM conserva las dos causas (método y dato ausente en «tamaño y liquidez»)', `${c.expl} · JPM ${c.cod('JPM')}`,
  c.expl === 'El método no analiza la deuda y los beneficios del banco (50 %) y faltan datos de JPM.' && c.cod('JPM').includes('metodo_no_aplicable@deuda') && c.cod('JPM').includes('dato_ausente@tamano'));

c = await caso(P(['SCHD', 20], ['JPM', 40], ['KO', 40]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
t('C4', 'Caso conjunto ETF 20 % + banco 40 % + dato ausente de KO 40 %', 'Una sola frase con las tres causas, cada porcentaje una vez y ninguno sumado a otro (20 + 40 + 40 no se mezcla)', c.expl, c.expl === 'El método no analiza la composición de los ETF (20 %) ni la deuda y los beneficios del banco (40 %) y faltan datos de KO.' && c.estado === 'Sin nota global');

c = await caso(P(['SCHD', 17], ['VYM', 16.6], ['KO', 16.6], ['PG', 16.6], ['JNJ', 16.6], ['XOM', 16.6]));
t('C5', 'Plantilla mixta actual (con ETF)', 'JNJ y XOM tienen datos, pero su sector no alcanza los comparables exigidos: se dice «no hay comparables suficientes», no «faltan datos». El encabezado es «Sin nota global», no «pendiente»; encabezado y texto en el HTML', `${c.estado} · ${c.expl}`,
  c.expl === 'El método no analiza la composición de los ETF (33,6 %) y no hay comparables suficientes en su sector para valorar «deuda y caja» y «rentabilidad y crecimiento» de JNJ y XOM (33,2 %).' && c.estado === 'Sin nota global' && /<b>Sin nota global\.<\/b>/.test(c.html) && !/pendiente/i.test(c.html.match(/<p class="nota-pend">[^]*?<\/p>/)[0]) && c.cod('JNJ').every(x => x.startsWith('comparables_insuficientes')));

c = await caso(P(['SCHD', 50], ['VYM', 50]));
t('C6', 'Solo ETF', 'Todo el peso son ETF; sin cifra; «Sin nota global»; sin culpar a datos', `${c.estado} · ${c.expl}`, c.expl === 'Todo el peso son ETF y el método no analiza su composición.' && c.estado === 'Sin nota global' && c.ev.sinEvaluar.every(s => s.causas.length === 1 && s.causas[0].codigo === 'metodo_no_aplicable'));

c = await caso(P(['KO', 60], ['PG', 40]));
t('C7', 'Cartera con nota (KO 60 % / PG 40 %)', 'Se conserva la nota 4,4, el titular y los pesos; sin estado de «sin nota»', `nota ${c.ev.nota} · ${c.expl} · estado ${c.estado}`, c.ev.publicada && c.ev.nota === 4.4 && c.estado === null && c.expl === 'Toda la cartera está en Consumo básico y Coca-Cola concentra el 60 %.' && J(c.ev.reparto.map(r => [r.ticker, r.peso])) === J([['KO', 60], ['PG', 40]]) && c.intacta);

c = await caso(P(['KO', 50], ['JPM', 50]));
t('C8', 'KO 50 % + JPM 50 % (evaluación parcial con un banco)', 'Se conserva la explicación del banco («Podemos medir cómo repartes tu cartera…») y el encabezado pasa a «Evaluación parcial»', `${c.estado} · ${c.expl.slice(0, 120)}`, c.estado === 'Evaluación parcial' && /^Podemos medir cómo repartes tu cartera\. La mitad está en un banco/.test(c.expl) && /<b>Evaluación parcial\.<\/b>/.test(c.html));

c = await caso(P(['KO', 60], ['PG', 40]), "UPDATE fundamentales SET fuente=NULL WHERE ticker='KO' AND periodo='FY2024'");
t('C9', 'Espera real (procedencia incompleta)', 'Sin bloques calculados: el único caso en que se conserva «Nota pendiente»', c.estado, c.estado === 'Nota pendiente' && /<b>Nota pendiente\.<\/b>/.test(c.html));

// ninguna clasificación por texto: todas las causas de todos los casos anteriores llevan uno de los cuatro códigos y la relevancia sale de la cobertura, no del mensaje
const CODIGOS = new Set(['metodo_no_aplicable', 'dato_ausente', 'dato_invalido', 'comparables_insuficientes']);
c = await caso(P(['SCHD', 20], ['JPM', 30], ['KO', 20], ['AAPL', 30]), "UPDATE fundamentales SET ebitda=NULL WHERE ticker='KO'");
const rel = causasRelevantes(c.ev), todas = c.ev.sinEvaluar.flatMap(s => s.causas);
t('C10', 'Cuatro familias a la vez (ETF 20 %, banco 30 %, KO 20 % sin EBITDA, AAPL 30 %)', 'Todas las causas llevan un código estable; el resumen nombra cada familia una vez; los pesos de cada una aparecen una vez y sin sumarse entre sí', c.expl,
  todas.length > 4 && todas.every(x => CODIGOS.has(x.codigo)) && rel.relevantes.metodo.has('SCHD') && rel.relevantes.comparables.has('AAPL') && rel.relevantes.datos.has('KO') && (c.expl.match(/ETF/g) || []).length === 1 && (c.expl.match(/\(30 %\)/g) || []).length <= 2);
await fin();
