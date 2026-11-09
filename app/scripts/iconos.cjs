// Genera los iconos PNG de la PWA desde public/icono.svg con el Chromium de Playwright (sin dependencias nuevas).
// Uso: node scripts/iconos.cjs   → public/icono-192.png, icono-512.png, icono-maskable-512.png, apple-touch-icon.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const PUB = path.resolve(__dirname, '..', 'public');
const svg = fs.readFileSync(path.join(PUB, 'icono.svg'), 'utf8');
// Versión a sangre (sin esquinas transparentes) para «maskable» y Apple: fondo perla completo y el anillo dentro de la zona segura (80 %).
const aSangre = escala => svg.replace('<rect width="64" height="64" rx="16" fill="#f5efe7"/>', '<rect width="64" height="64" fill="#f5efe7"/>')
  .replace(/<circle[^>]*\/>/, m => `<g transform="translate(32 32) scale(${escala}) translate(-32 -32)">${m}</g>`);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const hacer = async (nombre, tam, codigo) => {
    await p.setViewportSize({ width: tam, height: tam });
    await p.setContent(`<html><body style="margin:0;background:transparent">${codigo.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body></html>`);
    await p.screenshot({ path: path.join(PUB, nombre), omitBackground: true, clip: { x: 0, y: 0, width: tam, height: tam } });
    console.log('✓', nombre);
  };
  await hacer('icono-192.png', 192, svg);
  await hacer('icono-512.png', 512, svg);
  await hacer('icono-maskable-512.png', 512, aSangre(0.8));
  await hacer('apple-touch-icon.png', 180, aSangre(0.9));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
