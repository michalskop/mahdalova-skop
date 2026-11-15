// Souhrnný arch: homepage covery všech kapitol speciálu v pořadí z kapitoly.json (ke schválení najednou).
// PW_PATH=<repo>/node_modules/playwright node prehled-kapitol.cjs → nahled/prehled-kapitol.png
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const SPECIAL = path.join(__dirname, '..');
const CLANKY = path.join(SPECIAL, '..', '..', 'clanek', '_articles');
const { kapitoly } = JSON.parse(fs.readFileSync(path.join(SPECIAL, 'kapitoly.json'), 'utf8'));

const karty = kapitoly.map((k, i) => {
  const img = path.join(CLANKY, k.zdroj, 'images', 'cover-homepage.png');
  const src = fs.existsSync(img) ? `${pathToFileURL(img).href}?t=${fs.statSync(img).mtimeMs}` : '';
  return `<figure><div class="n">${i + 1}. ${k.nazev}</div>${src ? `<img src="${src}">` : '<div class="chybi">cover chybí</div>'}</figure>`;
}).join('');

const html = `<html><head><style>
  body { margin: 0; padding: 40px; background: #f8f6f0; font-family: 'IBM Plex Sans', Arial, sans-serif; width: 1720px; }
  h1 { margin: 0 0 24px; font: 700 34px 'IBM Plex Serif', Georgia, serif; color: #101432; }
  .g { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  figure { margin: 0; }
  .n { font-weight: 700; font-size: 22px; color: #101432; margin-bottom: 8px; }
  img { width: 100%; display: block; border-radius: 8px; }
  .chybi { aspect-ratio: 5 / 4; background: #d4d4c8; display: grid; place-items: center; border-radius: 8px; }
</style></head><body><h1>Jací jsme byli, jací jsme – covery kapitol</h1><div class="g">${karty}</div></body></html>`;

(async () => {
  const tmp = path.join(__dirname, 'nahled', '_prehled.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
  await p.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await p.screenshot({ path: path.join(__dirname, 'nahled', 'prehled-kapitol.png'), fullPage: true });
  await b.close();
  fs.unlinkSync(tmp);
  console.log('nahled/prehled-kapitol.png');
})();
