// Dlaždice speciálu pro titulku a /specialy (1080×1080, bez textu – titulek na dlaždici vypisuje web).
// Pozadí = trikolórové záře coveru, motiv = motiv-dlazdice.svg z motiv.cjs. node dlazdice.cjs → nahled/dlazdice-v2.png
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PW_PATH || 'playwright');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'motiv-dlazdice.svg'), 'utf8');
  const html = `<html><body style="margin:0;width:1080px;height:1080px;background:
    radial-gradient(circle at -19% 62%, #8b0e2b 0%, transparent 62%),
    radial-gradient(circle at 119% 38%, #272a59 0%, transparent 62%), #101432">${svg}</body></html>`;
  const b = await chromium.launch({ channel: 'msedge' }); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.setContent(html);
  await p.screenshot({ path: path.join(__dirname, 'nahled', 'dlazdice-v2.png') });
  await b.close();
})();
