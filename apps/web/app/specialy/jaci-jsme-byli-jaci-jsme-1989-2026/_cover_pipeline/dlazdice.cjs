// Dlaždice speciálu pro karusel Speciály na titulce a /specialy (1080×1080; titulek dole vypisuje web).
// v3 (17. 11. 2026): nahoře mapa Československa z motiv.cjs (motiv-dlazdice.svg), pod ní web vkládá
// animované letopočty 1989 → 2026 (RokyHlavicka dlazdice) a titulek. Pozadí = trikolórové záře coveru.
// node dlazdice.cjs → nahled/dlazdice-v3.png
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PW_PATH || 'playwright');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'motiv-dlazdice.svg'), 'utf8');
  const html = `<html><body style="margin:0;position:relative;width:1080px;height:1080px;overflow:hidden;background:
    radial-gradient(circle at -19% 62%, #8b0e2b 0%, transparent 62%),
    radial-gradient(circle at 119% 38%, #272a59 0%, transparent 62%), #101432">${svg}</body></html>`;
  const b = await chromium.launch({ channel: 'msedge' }); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(__dirname, 'nahled', 'dlazdice-v3.png') });
  await b.close();
})();
