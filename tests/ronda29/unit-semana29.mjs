// Ronda 29 · piezas PURAS de la fase 2.5: huella de empresa (huella.js), retos y «Tu semana» (semana.js). Uso: node tests/ronda29/unit-semana29.mjs
import { puntosHuella, svgHuella, estadoCriterio } from '../../public/js/huella.js';
import { retos, resumenSemana } from '../../public/js/semana.js';
import { registro } from '../lib/d1-sqlite.mjs';
const { t, fin } = registro('evidencias-SEM29.json');
const J = JSON.stringify;
const A = { KO: { sector: 'Consumo básico' }, PG: { sector: 'Consumo básico' }, NVDA: { sector: 'Tecnología' }, MSFT: { sector: 'Tecnología' }, JNJ: { sector: 'Salud' }, XOM: { sector: 'Energía' }, JPM: { sector: 'Finanzas' } };
const P = (...a) => a.map(([ticker, peso]) => ({ ticker, peso }));

// ---- huella
const crit = { deuda_ebitda: { ok: true }, roic: { ok: false }, margen_neto: { ok: true }, flujo_caja: {}, crecimiento: { ok: true } };
const pts = puntosHuella(crit, 100), d = q => Math.round(Math.hypot(q.x - 50, q.y - 50) * 10) / 10;
t('H1', 'Huella: superada en el borde, no superada al 40 %, sin datos en el centro (y distinta de «no superada»)', 'radios 36 · 14,4 · 36 · 0 · 36; estados ok/no/ok/nd/ok', J(pts.map(q => [q.estado, d(q)])),
  J(pts.map(q => q.estado)) === J(['ok', 'no', 'ok', 'nd', 'ok']) && d(pts[0]) === 36 && d(pts[1]) === 14.4 && d(pts[3]) === 0 && estadoCriterio(undefined) === 'nd' && estadoCriterio({ ok: null }) === 'nd');
const svg = svgHuella(crit, { tam: 100, titulo: 'Huella de X: 3 de 5' }), svgDec = svgHuella(crit);
t('H2', 'SVG: accesible con título o decorativo sin él; marca 3 superadas y un punto hueco por el dato que falta', 'role=img + aria-label / aria-hidden; data-superadas=3; un h-nd', `${svg.slice(0, 120)}…`,
  /role="img" aria-label="Huella de X: 3 de 5"/.test(svg) && /aria-hidden="true"/.test(svgDec) && /data-superadas="3"/.test(svg) && (svg.match(/class="h-nd"/g) || []).length === 1 && !/NaN/.test(svg));
t('H3', 'Un título con comillas no rompe el SVG', 'comillas escapadas', svgHuella(crit, { titulo: 'Coca-Cola "KO"' }).slice(0, 110), /aria-label="Coca-Cola &quot;KO&quot;"/.test(svgHuella(crit, { titulo: 'Coca-Cola "KO"' })));

// ---- retos
const base = { activos: A, umb: null, hoy: '2026-11-07' };
let r = retos({ ...base, carteras: [{ id: 1, nombre: 'C', pos: P(['KO', 60], ['PG', 40]) }], ideas: [], sigues: 0 });
t('R1', 'Cartera concentrada y sin ideas: ningún reto conseguido', '0 de 5; cada uno con su pista', J(r.lista.map(x => [x.id, x.hecho])), r.hechos === 0 && r.total === 5 && r.lista.every(x => x.hecho === false && x.pista));
r = retos({ ...base, carteras: [{ id: 1, nombre: 'C', pos: P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]) }], ideas: [{ estado: 'en_estudio', n_revisiones: 1 }], sigues: 3 });
t('R2', 'Repartida en 5 categorías, una idea revisada y 3 empresas seguidas: 5 de 5', '5 de 5', J(r.lista.map(x => [x.id, x.hecho])), r.hechos === 5);
r = retos({ ...base, carteras: [{ id: null, nombre: 'Borrador', pos: P(['KO', 20], ['JNJ', 20], ['XOM', 20], ['NVDA', 20], ['JPM', 20]) }], ideas: null, sigues: null });
t('R3', 'Sin poder leer ideas ni empresas seguidas: esos retos quedan «sin datos» (null), nunca conseguidos ni suspendidos', 'idea/seguir/revisar = null; 2 conseguidos', J(r.lista.map(x => [x.id, x.hecho])), r.lista.filter(x => x.hecho === null).length === 3 && r.hechos === 2);
r = retos({ ...base, carteras: [], ideas: [], sigues: 0 });
t('R4', 'Sin carteras: nada conseguido y la pista invita a crear la primera', 'pista «Crea tu primera cartera»', J(r.lista.slice(0, 2)), r.hechos === 0 && /primera cartera/.test(r.lista[0].pista) && /primera cartera/.test(r.lista[1].pista));
r = retos({ ...base, umb: { posicion: 70 }, carteras: [{ id: 1, nombre: 'C', pos: P(['KO', 60], ['PG', 40]) }], ideas: [], sigues: 0 });
t('R5', 'El reto de concentración usa los umbrales PROPIOS (70 %): KO 60 % lo cumple', 'concentracion hecho; título «más del 70 %»', J(r.lista[0]), r.lista[0].hecho === true && /70 %/.test(r.lista[0].titulo));

// ---- resumen semanal
const ideas = [{ estado: 'en_estudio', revisar_en: '2026-11-07' }, { estado: 'en_estudio', revisar_en: '2026-11-12' }, { estado: 'en_estudio', revisar_en: '2026-11-20' }, { estado: 'descartado', revisar_en: '2026-11-08' }];
let s = resumenSemana({ ...base, carteras: [{ id: 1, nombre: 'Concentrada', pos: P(['NVDA', 40], ['MSFT', 20], ['KO', 20], ['JNJ', 20]) }], ideas });
t('S1', 'Ideas de los próximos 7 días (en estudio): 2, una de ellas hoy; la descartada no cuenta', 'tocan 2, vencidas 1', J({ tocan: s.tocan.map(e => e.revisar_en), vencidas: s.vencidas }), s.tocan.length === 2 && s.vencidas === 1);
t('S2', 'Señal principal de cada cartera y sin «cambios» la primera vez (no hay instantánea anterior)', 'Exposición alta: Tecnología; sin cambios; desde null', J({ s: s.carteras[0].senal?.titulo, c: s.cambios, d: s.desde }), s.carteras[0].senal?.titulo === 'Exposición alta: Tecnología' && s.cambios.length === 0 && s.desde === null);
const previo = { fecha: '2026-11-01', carteras: s.instantanea.carteras };
s = resumenSemana({ ...base, carteras: [{ id: 1, nombre: 'Concentrada', pos: P(['NVDA', 15], ['MSFT', 15], ['KO', 20], ['JNJ', 20], ['XOM', 20], ['JPM', 10]) }], ideas: [] }, previo);
t('S3', 'Desde la última visita: la exposición alta se resolvió (cambio de la persona, no del mercado)', 'una «resuelta» con el texto de la señal; desde 2026-11-01', J({ c: s.cambios, d: s.desde }), s.desde === '2026-11-01' && s.cambios.some(x => x.tipo === 'resuelta' && /Exposición alta: Tecnología/.test(x.texto)));
s = resumenSemana({ ...base, carteras: [{ id: 1, nombre: 'Concentrada', pos: P(['NVDA', 40], ['MSFT', 20], ['KO', 20], ['JNJ', 20]) }], ideas: [] }, { fecha: '2026-11-07', carteras: previo.carteras });
t('S4', 'Una instantánea del MISMO día no se usa como «última visita»', 'sin cambios, desde null', J({ c: s.cambios, d: s.desde }), s.cambios.length === 0 && s.desde === null);
await fin();
