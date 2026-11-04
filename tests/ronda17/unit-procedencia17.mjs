// Ronda 17 · procedencia y fechas, DESDE SQLITE HASTA EL RESULTADO VISIBLE: semilla → /api/universo (manejador real) → evaluar() → htmlNotaEstructura().
// Cada caso inválido debe dejar la nota pendiente y la pantalla debe decir por qué; la semilla íntegra debe dar EXACTAMENTE 4,4 para KO 60 / PG 40.
// Uso: node tests/ronda17/unit-procedencia17.mjs
import { readFileSync } from 'node:fs';
import { crearEnv, RAIZ, registro } from '../lib/d1-sqlite.mjs';
import { onRequestGet } from '../../functions/api/universo.js';
import { evaluar } from '../../public/js/nota.js';
import { htmlNotaEstructura } from '../../public/js/nota-ui.js';
process.removeAllListeners('warning');
const { t, fin } = registro('evidencias-PROC17.json');
const SEMILLA = readFileSync(RAIZ + '/data/seed-prueba.sql', 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const visible = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const KP = [{ ticker: 'KO', peso: 60 }, { ticker: 'PG', peso: 40 }];
const caso = async (sql, cartera = KP, extra = {}) => { const env = crearEnv(); env.sql.exec(SEMILLA); if (sql) env.sql.exec(sql);
  const r = await onRequestGet({ env }), u = await r.json(), ev = evaluar(cartera, { ...u, ...extra }), txt = visible(htmlNotaEstructura(esc, ev, null)); return { s: r.status, u, ev, txt }; };
const J = JSON.stringify;

let c = await caso('');
t('Q1', 'Semilla íntegra, KO 60 % / PG 40 %', 'Origen «sintetico», nota EXACTAMENTE 4,4 (no «una cifra con un decimal»), fecha 2026-11-04 y la pantalla muestra «4,4 de 10»', `HTTP ${c.s}; origen ${c.u.origen}; nota ${c.ev.nota}; fecha ${c.ev.fecha}; «${c.txt.match(/\d,\d de 10/)?.[0]}»`, c.s === 200 && c.u.origen === 'sintetico' && c.ev.nota === 4.4 && c.ev.fecha === '2026-11-04' && /4,4 de 10/.test(c.txt) && c.u.procedencia.problemas === 0);
t('Q1b', 'La instantánea y el periodo efectivo se exponen', 'El universo declara instantánea y periodos; la nota lista hasta qué ejercicio llega cada empresa', `${c.u.instantanea}; ${J(c.u.periodos)}; ${J(c.ev.periodos)}`, c.u.instantanea === '2026-11-04' && c.u.periodos.hasta === 'FY2024' && c.ev.periodos.length === 2 && c.ev.periodos.every(p => p.hasta === 'FY2024'));
c = await caso("UPDATE fundamentales SET fuente=NULL WHERE ticker='KO'");
t('Q2', 'KO con la fuente de todas sus filas a NULL', 'El universo se declara «incompleto»; la nota queda PENDIENTE y la pantalla dice que KO tiene filas sin fuente (el 4,4 ya no sale)', `origen ${c.u.origen}; publicada ${c.ev.publicada}; «${c.txt.match(/Nota pendiente\..{0,160}/)?.[0]}»`, c.u.origen === 'incompleto' && !c.ev.publicada && c.ev.nota === null && /Nota pendiente/.test(c.txt) && /KO FY\d{4}: la fila no tiene fuente/.test(c.txt));
c = await caso("UPDATE fundamentales SET actualizado_en='2026-02-31' WHERE ticker='KO' AND periodo='FY2024'");
t('Q3', 'Fecha IMPOSIBLE (2026-02-31) en un ejercicio de KO', 'Incompleto y pendiente; la pantalla dice que la fecha no es una fecha válida', `origen ${c.u.origen}; «${c.txt.match(/Nota pendiente\..{0,140}/)?.[0]}»`, c.u.origen === 'incompleto' && !c.ev.publicada && /KO FY2024: la fecha de la fila no es una fecha válida/.test(c.txt));
c = await caso("UPDATE fundamentales SET actualizado_en='ayer' WHERE ticker='KO' AND periodo='FY2023'");
t('Q4', 'Texto «ayer» como fecha de un ejercicio', 'Incompleto y pendiente (no se acepta una fecha que no es de calendario)', `origen ${c.u.origen}; publicada ${c.ev.publicada}`, c.u.origen === 'incompleto' && !c.ev.publicada && /fecha de la fila no es una fecha válida/.test(c.txt));
c = await caso("UPDATE mercado SET fecha='ayer' WHERE ticker='KO'");
t('Q4b', '«ayer» como fecha de los datos de mercado de KO', 'Incompleto y pendiente; la instantánea del universo NO adopta «ayer» como fecha máxima', `origen ${c.u.origen}; instantánea ${c.u.instantanea}; publicada ${c.ev.publicada}`, c.u.origen === 'incompleto' && c.u.instantanea === '2026-11-04' && !c.ev.publicada && /datos de mercado no es una fecha válida/.test(c.txt));
c = await caso("UPDATE mercado SET fuente=NULL WHERE ticker='PG'");
t('Q5', 'Datos de mercado de PG sin fuente', 'Incompleto y pendiente; la pantalla lo atribuye a PG', `origen ${c.u.origen}; «${c.txt.match(/Nota pendiente\..{0,120}/)?.[0]}»`, c.u.origen === 'incompleto' && !c.ev.publicada && /PG: los datos de mercado no tienen fuente/.test(c.txt));
c = await caso("UPDATE fundamentales SET fuente='sec' WHERE ticker='PG'");
t('Q6', 'Origen MIXTO desde SQL (PG con fuente «sec», el resto de prueba)', 'Origen «mixto»; pendiente con el motivo de la mezcla (distinto de «incompleto» y de «real»)', `origen ${c.u.origen}; «${c.txt.match(/Nota pendiente\..{0,160}/)?.[0]}»`, c.u.origen === 'mixto' && !c.ev.publicada && /mezcla datos sintéticos y datos con otra fuente/.test(c.txt));
c = await caso("UPDATE fundamentales SET fuente='sec'; UPDATE mercado SET fuente='mercado'");
t('Q7', 'Todo con fuente real (sec / mercado)', 'Origen «real»; sin habilitación explícita la nota NO se publica y se dice que falta habilitarla', `origen ${c.u.origen}; «${c.txt.match(/Nota pendiente\..{0,140}/)?.[0]}»`, c.u.origen === 'real' && !c.ev.publicada && /no está habilitada con datos reales/.test(c.txt));
const base = (await caso('')).u, cons = Object.entries(base.empresas).filter(([, e]) => e.sector === 'Consumo básico').length;
c = await caso("UPDATE fundamentales SET fuente='sec'; UPDATE mercado SET fuente='mercado'", KP, { habilitada: true });
t('Q8', 'Con datos reales HABILITADOS a mano, las empresas ficticias no son comparables', `El sector tiene ${cons} empresas en la semilla (20 ficticias), pero con origen real solo cuentan las reales (10 < 20): pendiente por falta de comparables`, `origen ${c.u.origen}; poblacion ${J(c.ev.poblacion)}; «${(c.ev.sinEvaluar[0]?.motivos || []).join(' | ').slice(0, 110)}»`, !c.ev.publicada && /Solo hay 10 comparables/.test((c.ev.sinEvaluar[0]?.motivos || []).join(' ')));
c = await caso('', [{ ticker: 'KO', peso: 50 }, { ticker: 'JPM', peso: 50 }]);
t('Q9', 'KO 50 % / JPM 50 % (semilla íntegra)', 'Pendiente, y la pantalla explica POR QUÉ: el banco no tiene metodología de deuda/EBITDA ni de ROIC (no «faltan datos» que llegarán)', `origen ${c.u.origen}; «${c.txt.match(/Nota pendiente\..{0,260}/)?.[0]}»`, c.u.origen === 'sintetico' && !c.ev.publicada && /Podemos medir cómo repartes tu cartera\. La mitad está en un banco y este método todavía no evalúa bien la deuda y los beneficios de los bancos\. Por eso no damos una nota total\./.test(c.txt));
// cambio cosmético: no cambia la cifra
c = await caso("UPDATE activos SET nombre='Coca-Cola Company' WHERE ticker='KO'");
const orden = await caso('', [{ ticker: 'PG', peso: 40 }, { ticker: 'KO', peso: 60 }]);
t('Q10', 'Cambios cosméticos (renombrar KO; invertir el orden de las posiciones)', 'La nota sigue siendo EXACTAMENTE 4,4 y la pendiente del banco sigue pendiente', `renombrar ${c.ev.nota}; orden ${orden.ev.nota}`, c.ev.nota === 4.4 && orden.ev.nota === 4.4);
// conjuntos de tickers (no solo el total)
const u0 = base, reales = JSON.parse(readFileSync(RAIZ + '/data/universe.json', 'utf8')), fict = JSON.parse(readFileSync(RAIZ + '/data/ficticios.json', 'utf8'));
const tk = new Set(Object.keys(u0.empresas)), faltan = reales.filter(a => !tk.has(a.ticker)).map(a => a.ticker), ficEnReal = reales.filter(a => a.ficticia || /ficticia/i.test(a.nombre) || /^EJB[A-T]$/.test(a.ticker) || a.ticker === 'HNORT');
t('Q11', 'Conjuntos de tickers (no solo recuentos): las originales siguen y las ficticias están aparte', 'Todas las empresas de data/universe.json están en la semilla; ninguna ficticia (HNORT, EJBA–EJBT) figura en data/universe.json (la lista de la importación real); el universo marca como ficticias exactamente las de data/ficticios.json', `originales ${reales.length}; faltan ${J(faltan)}; ficticias en la lista real ${J(ficEnReal.map(a => a.ticker))}; marcadas ${Object.values(u0.empresas).filter(e => e.ficticia).length}/${fict.length}`,
  faltan.length === 0 && ficEnReal.length === 0 && Object.entries(u0.empresas).filter(([, e]) => e.ficticia).map(([k]) => k).sort().join() === fict.map(a => a.ticker).sort().join());
await fin();
