// Původní obálka zprávy (logo Volební kalkulačky na ink blue se zářemi v barvách loga) v pěti formátech.
// Kateřina 26. 10. 2026: tenhle cover chce zachovat beze změny, jen ho mít ve všech formátech.
// Logo i záře se berou ze sdílené grafiky speciálu apps/web/public/images/specials/volebni-kalkulacka.svg.
// Použití: PW_PATH=<repo>/node_modules/playwright node puvodni.cjs [výstupní složka]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const REPO = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const zdroj = fs.readFileSync(path.join(REPO, 'apps', 'web', 'public', 'images', 'specials', 'volebni-kalkulacka.svg'), 'utf8');
const defs = zdroj.match(/<defs>[\s\S]*?<\/defs>/)[0];
// dlaždice loga 128 × 128 (vnitřek <g transform="translate(280 225) scale(4.0625)">)
const dlazdice = zdroj.match(/<g transform="translate\(280 225\) scale\(4\.0625\)">([\s\S]*)<\/g>\s*<\/svg>/)[1];

// [w, h, strana loga, střed x, střed y] – na homepage stejné rozměry jako původní cover.png (dlaždice 560 na středu)
const FORMATY = {
  'cover-homepage.png': [1500, 1200, 560, 750, 600],
  'cover-og.jpg': [1200, 630, 330, 600, 315],
  'cover-square.png': [1080, 1080, 520, 540, 540],
  'cover-instagram.png': [1080, 1350, 540, 540, 675],
  'cover-story.png': [1080, 1920, 600, 540, 900], // nad ovládáním Instagramu dole
};

const svg = (w, h, s, cx, cy) => {
  const k = s / 560; // záře podle původního coveru: modrá vlevo nahoře, červená vpravo dole od loga
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs.replace('x="-300" y="-300" width="1680" height="1680"', `x="-600" y="-600" width="${w + 1200}" height="${h + 1200}"`).replace('stdDeviation="90"', `stdDeviation="${125 * k}"`)}
  <rect width="${w}" height="${h}" fill="#101432"/>
  <g filter="url(#vk-glow)" opacity="0.55">
    <circle cx="${cx - 300 * k}" cy="${cy - 210 * k}" r="${320 * k}" fill="#0070F4"/>
    <circle cx="${cx + 300 * k}" cy="${cy + 160 * k}" r="${320 * k}" fill="#D04646"/>
  </g>
  <g transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 128})">${dlazdice}</g>
</svg>`;
};

(async () => {
  const vystup = process.argv[2] || path.join(__dirname, '..', 'images');
  const browser = await chromium.launch({ channel: 'msedge' });
  for (const [soubor, [w, h, s, cx, cy]] of Object.entries(FORMATY)) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(`<html><body style="margin:0">${svg(w, h, s, cx, cy)}</body></html>`);
    const out = path.join(vystup, soubor);
    await page.screenshot(soubor.endsWith('.jpg') ? { path: out, type: 'jpeg', quality: 88 } : { path: out });
    await page.close();
    console.log(soubor, `${w}×${h}`);
  }
  await browser.close();
})();
