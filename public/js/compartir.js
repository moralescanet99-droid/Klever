// Ronda 36 · TARJETA PARA COMPARTIR (bucle 1 del plan de marketing, C50–C51). Dibuja una imagen vertical 1080×1350 de tu cartera principal:
// anillo, semáforos, señal principal y el sello «Simulación · sin dinero real · no es consejo». NUNCA euros ni rentabilidad.
// Se comparte con el menú del propio dispositivo (Web Share con archivo) o, si no se puede, se descarga. Klever no envía nada a nadie.
const ANCHO = 1080, ALTO_T = 1350;
const NIV_TXT = { ok: 'Baja', medio: 'Media', alto: 'Alta' }, NIV_VAR = { ok: 'Amplia', medio: 'Media', alto: 'Poca' };
const colorVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
// Dibuja la tarjeta y devuelve el lienzo. m: el modelo de «Hoy» (hoy.js: modeloHoy).
export async function dibujarTarjeta(m) {
  try { await document.fonts.load('600 40px "Inter Klever"'); await document.fonts.load('300 40px "Inter Klever"'); } catch { /* sin la fuente: la del sistema */ }
  const cv = document.createElement('canvas'); cv.width = ANCHO; cv.height = ALTO_T; const g = cv.getContext('2d'), F = (p, t) => `${p} ${t}px "Inter Klever", system-ui, sans-serif`;
  const fondo = g.createLinearGradient(0, 0, ANCHO, ALTO_T); fondo.addColorStop(0, '#1b1411'); fondo.addColorStop(1, '#0b0908'); g.fillStyle = fondo; g.fillRect(0, 0, ANCHO, ALTO_T);
  const halo = g.createRadialGradient(860, 160, 0, 860, 160, 620); halo.addColorStop(0, 'rgba(255,122,47,.28)'); halo.addColorStop(1, 'rgba(255,122,47,0)'); g.fillStyle = halo; g.fillRect(0, 0, ANCHO, ALTO_T);
  g.fillStyle = '#F4EDE0'; g.font = F('300', 34); g.letterSpacing = '12px'; g.fillText('KLEVER', 90, 130); g.letterSpacing = '0px';
  g.fillStyle = '#BDB0A0'; g.font = F('500', 34); g.fillText('Mi cartera simulada', 90, 210);
  g.fillStyle = '#F4EDE0'; g.font = F('600', 64); g.fillText(recortar(g, m.nombre, 900), 90, 290);
  // anillo
  const cx = ANCHO / 2, cy = 620, r = 230, total = Math.max(100, m.pos.reduce((a, p) => a + p.peso, 0)); let a0 = -Math.PI / 2;
  g.lineWidth = 64; g.lineCap = 'butt'; g.strokeStyle = '#241D18'; g.beginPath(); g.arc(cx, cy, r, 0, 2 * Math.PI); g.stroke();
  m.pos.forEach((p, i) => { const ang = p.peso / total * 2 * Math.PI; g.strokeStyle = colorVar(`--c${i % 8}`); g.beginPath(); g.arc(cx, cy, r, a0 + 0.012, a0 + ang - 0.012); g.stroke(); a0 += ang; });
  g.textAlign = 'center'; g.fillStyle = '#F4EDE0'; g.font = F('200', 150); g.fillText(String(m.n), cx, cy + 40); g.fillStyle = '#BDB0A0'; g.font = F('500', 36); g.fillText(m.n === 1 ? 'posición' : 'posiciones', cx, cy + 100);
  // semáforos
  const ind = m.indicadores || [], col = { ok: '#8FD6A4', medio: '#F2C26B', alto: '#FF7A2F' };
  ind.forEach((it, k) => { const x = k === 0 ? ANCHO / 2 - 230 : ANCHO / 2 + 230, y = 960; g.fillStyle = col[it.nivel] || '#BDB0A0'; g.beginPath(); g.arc(x - 120, y - 14, 14, 0, 2 * Math.PI); g.fill();
    g.textAlign = 'left'; g.fillStyle = '#BDB0A0'; g.font = F('500', 32); g.fillText(it.etiqueta, x - 92, y - 26); g.fillStyle = '#F4EDE0'; g.font = F('600', 44); g.fillText(it.id === 'variedad' ? NIV_VAR[it.nivel] : NIV_TXT[it.nivel], x - 92, y + 26); });
  g.textAlign = 'center';
  if (m.senal) { g.fillStyle = '#FFB27A'; g.font = F('600', 40); g.fillText(recortar(g, m.senal.titulo, 900), cx, 1090); }
  g.fillStyle = '#BDB0A0'; g.font = F('500', 30); g.fillText('Simulación · sin dinero real · no es consejo', cx, 1220);
  g.fillStyle = '#FFB88A'; g.font = F('600', 34); g.fillText('Crea la tuya gratis en Klever', cx, 1275);
  return cv;
}
function recortar(g, t, max) { let s = String(t); if (g.measureText(s).width <= max) return s; while (s.length > 1 && g.measureText(s + '…').width > max) s = s.slice(0, -1); return s + '…'; }
// Comparte (o descarga) la tarjeta. Devuelve 'compartida' | 'descargada' | 'cancelada'.
export async function compartirTarjeta(m, { url, medir } = {}) {
  const cv = await dibujarTarjeta(m), blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  const archivo = new File([blob], 'mi-cartera-klever.png', { type: 'image/png' });
  const datos = { files: [archivo], title: 'Mi cartera en Klever', text: 'Así reparto mi cartera simulada en Klever (sin dinero real). ¿Y tú?', url };
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try { await navigator.share(datos); medir?.('compartir'); return 'compartida'; } catch { return 'cancelada'; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = archivo.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  medir?.('compartir'); return 'descargada';
}
