// Catálogo COMPARTIDO (cliente y servidor) de las cuestiones editoriales que una persona puede seguir. Cada identificador «historia:n» es INMUTABLE: nunca se reutiliza
// para otra pregunta (si la cuestión cambia de fondo se crea otro identificador). Un vínculo nuevo solo se acepta si el par historia/identificador existe aquí.
export const CATALOGO_PREGUNTAS = Object.freeze({
  'hidrogeno-norte:1': Object.freeze({ historia: 'hidrogeno-norte', tesis: 1, texto: '¿Se han firmado los dos contratos anunciados?' }),
  'hidrogeno-norte:2': Object.freeze({ historia: 'hidrogeno-norte', tesis: 2, texto: '¿Se firmará el contrato de D antes de que acabe el primer trimestre de 2027?' }),
});
export const refExiste = ref => typeof ref === 'string' && Object.hasOwn(CATALOGO_PREGUNTAS, ref);
export const refDeHistoria = (ref, historia) => refExiste(ref) && CATALOGO_PREGUNTAS[ref].historia === historia;
