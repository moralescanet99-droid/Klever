// Ronda 36 · LIGA, Temporada 0 (sin precios): reglas de ronda36/LIGA.md. PURO (lo usan el servidor y la interfaz).
// Cada semana, hasta 100 puntos: EQUILIBRIO (50) + APRENDIZAJE (30) + CONSTANCIA (20). La clasificación es la suma de las semanas.
// Nada mide rentabilidad. La foto semanal (semana.js) es la del lunes que el servidor ya guarda.
export const SEMANAS_TEMPORADA = 12, MIN_POSICIONES_LIGA = 4;
const P_CONC = { ok: 25, medio: 12, alto: 0 }, P_VAR = { ok: 25, medio: 12, alto: 0 };
const isoMasL = (iso, d) => new Date(Date.parse(iso + 'T00:00:00Z') + d * 864e5).toISOString().slice(0, 10);

// Temporada que contiene una fecha: empieza el lunes `inicio` y dura 12 semanas. semanas: los 12 lunes.
export function temporada(inicio) { const semanas = [...Array(SEMANAS_TEMPORADA)].map((_, i) => isoMasL(inicio, 7 * i)); return { inicio, fin: isoMasL(inicio, 7 * SEMANAS_TEMPORADA - 1), semanas }; }

// Puntos de UNA semana. d = { foto|null, completa (cartera al 100 %), n (posiciones), retoHecho, ideaSemana, entro, racha (semanas seguidas entrando, incluida esta) }
export function puntosSemana(d) {
  const valida = !!d.foto && d.completa && d.n >= MIN_POSICIONES_LIGA;
  const equilibrio = valida ? P_CONC[d.foto.concentracion] + P_VAR[d.foto.variedad] : 0;
  const aprendizaje = (d.retoHecho ? 20 : 0) + (d.ideaSemana ? 10 : 0);
  const constancia = d.entro ? 10 + Math.min(10, 2 * Math.max(0, (d.racha || 1) - 1)) : 0;
  return { equilibrio, aprendizaje, constancia, total: equilibrio + aprendizaje + constancia, valida, motivo: !d.foto ? 'sin foto esa semana' : !d.completa ? 'la cartera no estaba al 100 %' : d.n < MIN_POSICIONES_LIGA ? `menos de ${MIN_POSICIONES_LIGA} posiciones` : '' };
}

// Toda la temporada de una persona. semanas: [{ semana, foto, completa, n, retoHecho, ideaSemana, entro }] (en orden). hasta: el lunes actual (las futuras no cuentan).
// La foto que vale para el equilibrio es la de esa semana; si no entró, se usa la última anterior (regla 4), pero no suma constancia.
export function puntosTemporada(semanas, hasta) {
  let racha = 0, ultima = null; const detalle = [];   // ultima: la última semana CON foto (foto, completa y n), que hereda la semana sin foto
  for (const s of semanas) {
    if (s.semana > hasta) break;
    racha = s.entro ? racha + 1 : 0;
    if (s.foto) ultima = { foto: s.foto, completa: s.completa, n: s.n };
    const base = s.foto ? s : ultima || { foto: null, completa: false, n: 0 };
    const p = puntosSemana({ ...s, foto: base.foto, completa: base.completa, n: base.n, racha });
    detalle.push({ semana: s.semana, ...p, bajas: base.foto?.concentracion === 'ok' ? 1 : 0 });
  }
  return { total: detalle.reduce((a, x) => a + x.total, 0), semanasBajas: detalle.reduce((a, x) => a + x.bajas, 0), detalle };
}

// Clasificación: más puntos; a igualdad, más semanas con concentración baja; después, quien se inscribió antes (regla 5).
export function clasificar(filas) {
  return [...filas].sort((a, b) => b.total - a.total || b.semanasBajas - a.semanasBajas || String(a.inscrito).localeCompare(String(b.inscrito)) || a.id - b.id)
    .map((f, i) => ({ ...f, puesto: i + 1 }));
}

// Insignia al cerrar la temporada según el tramo (regla 6): oro 10 % mejor, plata 25 %, bronce 50 %, y «completada» para quien llega al final.
export function insignia(puesto, total, completo = true) {
  if (!total || !puesto) return null; const q = puesto / total;
  return q <= 0.10 ? 'oro' : q <= 0.25 ? 'plata' : q <= 0.50 ? 'bronce' : completo ? 'completada' : null;
}

// Código de liga privada: 6 letras sin ambigüedades (sin O, I, L, 0, 1). aleatorio: función que devuelve [0,1).
const LETRAS_LIGA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const codigoLiga = (aleatorio = Math.random) => [...Array(6)].map(() => LETRAS_LIGA[Math.floor(aleatorio() * LETRAS_LIGA.length)]).join('');
export const codigoValido = c => /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/.test(String(c || ''));
// Apodo público: 3–20 caracteres, letras (con tildes), números, espacios, punto, guion y guion bajo; nunca un correo.
export const apodoValido = a => { const s = String(a || '').trim(); return s.length >= 3 && s.length <= 20 && /^[\p{L}\p{N} ._-]+$/u.test(s) && !s.includes('@'); };
