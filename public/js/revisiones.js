// Registro de una revisión del Cuaderno: la lógica del CLIENTE, separada de la pantalla para poder probarla sin navegador (ronda 22).
// Distingue cuatro cosas que la ronda 21 mezclaba: el BORRADOR (lo que la persona escribe), el INTENTO de envío (clave + contenido congelados), el resultado CONFIRMADO por el servidor y la ACTUALIZACIÓN DE LA VISTA.
//   · Un intento se envía SIEMPRE con su propia clave y su propio contenido: si el resultado es incierto (corte de red, respuesta perdida, 5xx) se reintenta ESE intento —nunca uno nuevo ni con otro texto—;
//     el servidor es idempotente por clave y devuelve el registro ya guardado.
//   · Una lectura posterior fallida NO es una escritura fallida: el servidor ya confirmó, así que se informa «guardada» y solo se ofrece recuperar la vista (sin reenviar).
//   · Un 409 de conflicto de revisión significa que la clave NO existía (el servidor comprueba la clave antes que la revisión): no se registró nada y el texto de la persona se conserva.
// No toca el DOM. `alm` es el almacén de escenarios (`revisar(id, cuerpo)`, `leer(id)`, `nuevaClave()`).

export const CAMPOS_REVISION = ['fecha', 'observacion', 'aprendizaje', 'decision', 'proxima_fecha'];
const copiaCongelada = o => Object.freeze({ ...o });
const esIncierto = e => !e || e.obsoleta || e.status == null || e.status === 0 || e.status >= 500;   // sin respuesta del servidor o error de infraestructura: NO se sabe si llegó

// intento = { escId, clave, revision, cuerpo }  (todo congelado al enviar; `revision` es la versión del escenario que vio la persona)
export function nuevoIntento(alm, esc, borrador) {
  return Object.freeze({ escId: esc.id, clave: alm.nuevaClave(), revision: esc.revision, cuerpo: copiaCongelada(borrador) });
}

// ¿El borrador actual es el mismo contenido que el del intento pendiente? (si no, hay texto nuevo que NO se ha enviado)
export const mismoContenido = (intento, borrador) => !!intento && CAMPOS_REVISION.every(k => (intento.cuerpo[k] ?? '') === (borrador[k] ?? ''));

// Envía el intento. Resultados:
//   { tipo: 'confirmada', revision, escenario, vista: 'actualizada' | 'pendiente' }  el servidor confirmó; `vista: 'pendiente'` = no se pudo releer el escenario (solo recuperar la vista)
//   { tipo: 'rechazada', mensaje }  el servidor respondió que NO lo registra (validación, otra clave…): con certeza no se guardó
//   { tipo: 'conflicto', mensaje }  el escenario cambió desde otra pestaña: con certeza no se registró este intento
//   { tipo: 'incierto', mensaje }   no se sabe si se registró: conservar el intento y reintentar el MISMO
export async function enviarIntento(alm, intento, escActual) {
  let r;
  try { r = await alm.revisar(intento.escId, { clave: intento.clave, revision: intento.revision, ...intento.cuerpo }); }
  catch (e) {
    if (esIncierto(e)) return { tipo: 'incierto', mensaje: 'No hemos podido confirmar si la revisión se registró (sin conexión o sin respuesta del servidor).' };
    if (e.status === 409 && e.data?.conflicto) return { tipo: 'conflicto', mensaje: 'Este escenario cambió en otra pestaña o dispositivo después de la versión que ves. No se ha registrado esta revisión; tu texto sigue aquí.' };
    return { tipo: 'rechazada', mensaje: e.message || 'No se pudo registrar la revisión.' };
  }
  // el servidor confirmó (201 con el escenario actualizado, o 200 «duplicado» si ese mismo intento ya estaba guardado)
  const fila = { id: r.id, fecha: r.fecha, observacion: r.observacion, aprendizaje: r.aprendizaje, decision: r.decision, proxima_fecha: r.proxima_fecha, creado_en: r.creado_en };
  if (r.escenario) {                                                    // datos confirmados por el propio POST: no hace falta otra lectura
    const previas = (escActual?.revisiones || []).filter(x => x.id !== fila.id);
    return { tipo: 'confirmada', revision: fila, escenario: { ...r.escenario, revisiones: [fila, ...previas].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id) }, vista: 'actualizada', duplicado: false };
  }
  const v = await actualizarVista(alm, intento.escId);                  // duplicado: la respuesta no trae el escenario; se relee
  return v.ok ? { tipo: 'confirmada', revision: fila, escenario: v.escenario, vista: 'actualizada', duplicado: true } : { tipo: 'confirmada', revision: fila, escenario: null, vista: 'pendiente', duplicado: true };
}

// Recuperar la vista NUNCA escribe: solo lee.
export async function actualizarVista(alm, escId) {
  try { return { ok: true, escenario: await alm.leer(escId) }; } catch (e) { return { ok: false, mensaje: e?.message || 'No se pudo leer el escenario.' }; }
}
