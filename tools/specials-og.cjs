// OG obrázky speciálů z obrázků karet na titulce (public/images/specials/*.svg).
// Sítě a messengery SVG neumějí, proto JPEG 1200×630: uprostřed čtverec 630×630
// přesně jako na kartě (WhatsApp a messengery ořezávají na střední čtverec).
// Boky = gradient od barvy kraje čtverce do nejtmavšího odstínu téže škály
// závazné palety (ThemeProvider.tsx, index 9). Žádné rozmazané kopie obrázku
// (Kateřina 14. 10. 2026: působí zdvojeně a rušivě).
//   NODE_PATH=<repo>/node_modules node tools/specials-og.cjs   (prohlížeč Edge)
// Po změně obrázku karty spustit znovu – výstup: public/images/specials/og/<název>.jpg
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const DIR = path.join(__dirname, '..', 'apps', 'web', 'public', 'images', 'specials');
const SPECIALY = ['volby-2026', 'data-pro-budouci-premierku', 'svobodna-media', 'klima', 'investigace', 'karlovy-vary'];

// Škály palety z ThemeProvider.tsx (bez krémové `background`).
const theme = fs.readFileSync(path.join(__dirname, '..', 'apps', 'web', 'app', 'providers', 'ThemeProvider.tsx'), 'utf8');
const SKALY = {};
// Pole škál obsahují i komentáře s „[6]“, proto po kouscích mezi názvy škál.
const kusy = theme.split(/(\w+): \[/);
for (let i = 1; i < kusy.length; i += 2) {
  const hexy = (kusy[i + 1].match(/#[0-9a-fA-F]{6}/g) || []).slice(0, 10);
  if (hexy.length === 10 && kusy[i] !== 'background') SKALY[kusy[i]] = hexy;
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function hue([r, g, b]) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
// Nejtmavší odstín (index 9) škály se stejným tónem (hue) jako barva kraje;
// tón škály = její hlavní odstín [6]. Gradient musí jít do tmavšího: když je
// [9] nejbližší škály světlejší než kraj (žlutá u tmavé vinety), vezme se
// další nejbližší škála; když žádná, zůstane barva kraje.
const jas = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function tmavy(barva) {
  const poradi = Object.entries(SKALY)
    .map(([nazev, hexy]) => {
      const dh = Math.abs(hue(rgb(hexy[6])) - hue(barva));
      return { skala: nazev, hex: hexy[9], d: Math.min(dh, 360 - dh) };
    })
    .sort((a, b) => a.d - b.d);
  return poradi.find((s) => jas(rgb(s.hex)) <= jas(barva) + 4)
    ?? { skala: 'kraj', hex: `rgb(${barva.map(Math.round)})` };
}

(async () => {
  fs.mkdirSync(path.join(DIR, 'og'), { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const nazev of SPECIALY) {
    const src = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(DIR, `${nazev}.svg`)).toString('base64');
    await page.setContent(`<body style="margin:0"><canvas id="c" width="1200" height="630"></canvas></body>`);
    // 1) čtverec jako na kartě (object-fit cover, střed) + průměrné barvy krajů po řádcích
    const kraje = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const s = Math.min(img.width, img.height);
      const sq = document.createElement('canvas');
      sq.width = sq.height = 630;
      const q = sq.getContext('2d');
      q.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 630, 630);
      window.__sq = sq;
      // Barva kraje na řádek: průměr 8 px u kraje, vyhlazený přes ±60 řádků
      // (tečky a drobné motivy u kraje nesmí dělat pruhy).
      const radky = (x0) => {
        const d = q.getImageData(x0, 0, 8, 630).data;
        const r = [];
        for (let y = 0; y < 630; y++) {
          const c = [0, 0, 0];
          for (let x = 0; x < 8; x++) for (let k = 0; k < 3; k++) c[k] += d[(y * 8 + x) * 4 + k] / 8;
          r.push(c);
        }
        return r.map((_, y) => {
          const c = [0, 0, 0];
          let n = 0;
          for (let j = Math.max(0, y - 60); j <= Math.min(629, y + 60); j++, n++) for (let k = 0; k < 3; k++) c[k] += r[j][k];
          return c.map((v) => Math.round(v / n));
        });
      };
      return { L: radky(1), R: radky(621) }; // krajní sloupec SVG je vyhlazený, vynechat
    }, src);
    const prumer = (rows) => [0, 1, 2].map((k) => rows.reduce((a, c) => a + c[k], 0) / rows.length);
    const tL = tmavy(prumer(kraje.L)), tR = tmavy(prumer(kraje.R));
    // 2) boky: po řádcích gradient od barvy kraje do tmavého odstínu škály, pak čtverec
    await page.evaluate(({ kraje, dL, dR }) => {
      const ctx = document.getElementById('c').getContext('2d');
      for (let y = 0; y < 630; y++) {
        const gL = ctx.createLinearGradient(286, 0, 0, 0);
        gL.addColorStop(0, `rgb(${kraje.L[y]})`);
        gL.addColorStop(1, dL);
        ctx.fillStyle = gL;
        ctx.fillRect(0, y, 286, 1);
        const gR = ctx.createLinearGradient(914, 0, 1200, 0);
        gR.addColorStop(0, `rgb(${kraje.R[y]})`);
        gR.addColorStop(1, dR);
        ctx.fillStyle = gR;
        ctx.fillRect(914, y, 286, 1);
      }
      ctx.drawImage(window.__sq, 1, 0, 628, 630, 286, 0, 628, 630);
    }, { kraje, dL: tL.hex, dR: tR.hex });
    const out = path.join(DIR, 'og', `${nazev}.jpg`);
    await page.locator('#c').screenshot({ path: out, type: 'jpeg', quality: 90 });
    console.log(`${nazev}.jpg`, Math.round(fs.statSync(out).size / 1024), 'kB', '→', tL.skala, tL.hex, '/', tR.skala, tR.hex);
  }
  await browser.close();
})();
