// Contenido editorial de la versión interna: UNA historia, UNA opinión firmada y UNA revisión fechada vinculada a la tesis inicial.
// El caso es FICTICIO y se identifica como tal desde el título: la empresa, las cifras y los documentos están inventados para probar Klever.
// Nada de este archivo es información real ni una recomendación. Estructura pensada para pasar después a la base de datos (ver ronda13/EDITORIAL.md).
// Las fechas del caso son coherentes entre sí y anteriores a la fecha de entrega de la ronda 14; el desenlace de la revisión es SIMULADO.

export const AVISO_FICTICIO = 'Caso ficticio: la empresa, las cifras y los documentos están inventados para probar Klever. No es información real ni una recomendación.';

export const HISTORIAS = [{
  id: 'hidrogeno-norte',
  ficticia: true,
  titulo: 'Caso ficticio: cómo Hidrógeno Norte convierte proyectos anunciados en contratos',
  bajada: 'Cuatro proyectos anunciados, dos contratos firmados y dos promesas con fecha límite. Qué dicen los documentos de ejemplo y qué falta por saber.',
  autor: 'Ana Ejemplo (autora ficticia)',
  fecha: '2026-10-20',
  ticker: 'HNORT',
  empresa: 'Hidrógeno Norte (empresa ficticia)',
  pregunta: '¿Se han firmado los dos contratos anunciados?',
  fuentes: [
    { n: 1, titulo: 'Comunicado de ejemplo: cartera de cuatro proyectos de hidrógeno verde', fecha: '2026-08-12', tipo: 'Documento de ejemplo (ficticio)' },
    { n: 2, titulo: 'Contrato de ejemplo del proyecto A (40 MW), resumen público', fecha: '2026-09-03', tipo: 'Documento de ejemplo (ficticio)' },
    { n: 3, titulo: 'Contrato de ejemplo del proyecto B (25 MW), resumen público', fecha: '2026-09-24', tipo: 'Documento de ejemplo (ficticio)' },
    { n: 4, titulo: 'Memorando de ejemplo no vinculante del proyecto C (100 MW)', fecha: '2026-09-30', tipo: 'Documento de ejemplo (ficticio)' },
    { n: 5, titulo: 'Comunicado de ejemplo: «los contratos de C y D se firmarán antes del 31 de octubre»', fecha: '2026-10-12', tipo: 'Documento de ejemplo (ficticio)' },
    { n: 6, titulo: 'Resumen de ejemplo del contrato del proyecto C, firmado', fecha: '2026-10-29', tipo: 'Documento de ejemplo (ficticio); aparece en la revisión simulada' },
  ],
  bloques: [
    { t: 'h2', x: 'Qué anunció la empresa' },
    { t: 'p', x: 'El 12 de agosto de 2026, Hidrógeno Norte presentó una cartera de cuatro proyectos de producción de hidrógeno verde: A (40 MW), B (25 MW), C (100 MW) y D (60 MW), en total 225 MW [1]. Un anuncio no es un ingreso: para que cuente hace falta un contrato con precio, volumen y calendario.' },
    { t: 'h2', x: 'Qué muestran los documentos' },
    { t: 'p', x: 'A 20 de octubre, dos de los cuatro proyectos tienen contrato publicado: A [2] y B [3]. El proyecto C solo tiene un memorando no vinculante [4] y para D no hay ningún documento.' },
    { t: 'tabla', cab: ['Proyecto', 'Potencia', 'Estado a 20 oct 2026', 'Documento'], filas: [
      ['A', '40 MW', 'Contrato firmado', '[2]'], ['B', '25 MW', 'Contrato firmado', '[3]'], ['C', '100 MW', 'Memorando no vinculante', '[4]'], ['D', '60 MW', 'En negociación (sin documento)', '—'] ] },
    { t: 'p', x: 'Contado por proyectos, 2 de 4 (50 %) tienen contrato. Contado por potencia, 65 de 225 MW (28,9 %): los dos proyectos pequeños están cerrados y los dos grandes, no.' },
    { t: 'h2', x: 'La promesa con fecha' },
    { t: 'p', x: 'El 12 de octubre la empresa comunicó que los contratos de C y D se firmarían antes del 31 de octubre [5]. Es la pregunta que esta historia deja abierta: ¿se han firmado los dos contratos anunciados?' },
    { t: 'h2', x: 'Qué falta por saber' },
    { t: 'ul', x: ['El precio y las penalizaciones de los contratos A y B: los resúmenes de ejemplo no las incluyen.', 'Cómo se financiará C: el memorando no compromete financiación.', 'Si D tiene cliente identificado: no hay ningún documento.'] },
    { t: 'p', x: 'Lo que sigue es una opinión sobre estos hechos, firmada y con su revisión. Antes, una advertencia: sea cual sea el desenlace, un caso no demuestra nada sobre otras empresas.' },
  ],
  tesis: [
    { n: 1, fecha: '2026-10-20', firma: 'El Superespeculador (personaje de ejemplo)',
      titulo: 'Creo que solo uno de los dos contratos se firmará a tiempo',
      hecho: ['Dos de cuatro proyectos (A y B, 65 de 225 MW) tienen contrato publicado [2][3].', 'C tiene un memorando no vinculante [4] y D no tiene documento.', 'La empresa prometió firmar C y D antes del 31 de octubre [5].'],
      interpretacion: ['Los proyectos pequeños se cierran rápido; los grandes dependen de financiación que todavía no se ha publicado.', 'Mi lectura: C llegará a contrato antes que D, porque ya hay un memorando; D no tiene ni documento. Lo más probable es que se firme uno y el otro se aplace.'],
      cambiaria: ['Un contrato firmado para D, con precio y volumen, antes del 31 de octubre.', 'La publicación de financiación comprometida para C: reforzaría que C se firma.', 'Que el memorando de C se retire o caduque.'],
      pregunta: '¿Se han firmado los dos contratos anunciados?' },
    { n: 2, fecha: '2026-11-03', firma: 'El Superespeculador (personaje de ejemplo)', revisa: 1, simulada: true,
      titulo: 'Revisión: se firmó C, D se aplazó (desenlace simulado)',
      resultado: 'DESENLACE SIMULADO en esta demo: el 29 de octubre se firmó el contrato de C [6] y el de D se aplazó sin fecha. Es un final inventado para probar la revisión, no un hecho.',
      hecho: ['Se publicó el resumen del contrato de C, firmado el 29 de octubre [6].', 'No hay documento nuevo de D; la empresa lo mantiene «en negociación».'],
      interpretacion: ['Acerté en que no se firmarían los dos a tiempo, pero me equivoqué en el orden que esperaba solo a medias: acerté en que C iría primero.', 'Lo que no sé: si el aplazamiento de D es una cuestión de calendario o de falta de cliente.'],
      cambiaria: ['Si en el próximo trimestre se publica un contrato de D, revisaré de nuevo.', 'Si la empresa no vuelve a mencionar D, lo daré por cancelado.'],
      pregunta: '¿Se firmará el contrato de D antes de que acabe el primer trimestre de 2027?' },
  ],
}];

export const historia = id => HISTORIAS.find(h => h.id === id) || null;
export const historiasDeTicker = t => HISTORIAS.filter(h => h.ticker === t);
export const tesisDe = (h, n) => h?.tesis.find(x => x.n === Number(n)) || null;
export const revisionDe = (h, n) => h?.tesis.find(x => x.revisa === Number(n)) || null;   // revisión posterior vinculada a la tesis n
export const ultimaTesis = h => h?.tesis[h.tesis.length - 1] || null;
// Fecha «AAAA-MM-DD» (de calendario, sin hora) → «20 oct 2026». No usa el reloj ni zonas horarias.
export const fechaCorta = iso => { const d = new Date(String(iso) + 'T00:00:00Z'); return isNaN(d) ? '' : new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d); };
