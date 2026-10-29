// Motiv coveru: tečkový graf – čtyři patra krajské politiky (shora hejtmanky, radní, zastupitelky, kandidátky).
// Každá řada = 10 teček = 100 %, 1 tečka = 10 %, poslední tečka se vyplní zčásti; červeně podíl žen.
// Podíly z článku (scrollytelling.yaml, volby.cz, krajské volby 2024): hejtmanky 2 ze 14 = 14 %, radní 20 %,
// zastupitelky 22 %, kandidátky 29 %. Popisky jsou v SVG (vkládá se inline, IBM Plex Sans bere ze stránky generátoru).
// node motiv.cjs → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg')
const fs = require('fs');
const path = require('path');

const ZENY = '#ff3f30'; // brandCoralRed.5 – vivid red
const OSTATNI = '#2f325c'; // brandNavy.8 – zbytek míst, tlumeně
const POPIS = '#d2d8e9'; // brandNavy.1
const PATRA = [['Hejtmanky', 14], ['Radní', 20], ['Zastupitelky', 22], ['Kandidátky', 29]];

// x = levý okraj, y = horní okraj grafu, popis = šířka sloupce popisků, w = celková šířka, krok = výška řady
const FORMATY = {
  homepage: { W: 1500, H: 1200, x: 180, y: 585, popis: 360, w: 1140, krok: 94 },
  square: { W: 1080, H: 1080, x: 70, y: 505, popis: 290, w: 940, krok: 84 },
  instagram: { W: 1080, H: 1350, x: 70, y: 690, popis: 290, w: 940, krok: 112 },
  story: { W: 1080, H: 1920, x: 90, y: 880, popis: 320, w: 900, krok: 150 },
  og: { W: 1200, H: 630, x: 300, y: 300, popis: 190, w: 600, krok: 64 },
};
const f1 = (v) => v.toFixed(1);
module.exports = { FORMATY, ZENY };

if (require.main === module) {
  for (const [klic, F] of Object.entries(FORMATY)) {
    const s = (F.w - F.popis) / 10, r = s * 0.4, pismo = Math.min(F.krok * 0.36, s * 0.62);
    let svg = '';
    PATRA.forEach(([nazev, podil], j) => {
      const cy = F.y + j * F.krok + F.krok / 2;
      svg += `<text x="${f1(F.x)}" y="${f1(cy - pismo * 0.1)}" font-family="IBM Plex Sans" font-size="${f1(pismo)}" fill="${POPIS}">${nazev}</text>`;
      svg += `<text x="${f1(F.x)}" y="${f1(cy + pismo * 1.0)}" font-family="IBM Plex Sans" font-weight="700" font-size="${f1(pismo)}" fill="${ZENY}">${podil}&#160;%</text>`;
      for (let i = 0; i < 10; i++) {
        const cx = F.x + F.popis + r + i * s;
        const plne = Math.max(0, Math.min(1, podil / 10 - i)); // kolik z tečky patří ženám
        svg += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${OSTATNI}"/>`;
        if (plne > 0) {
          const id = `c${klic}${j}${i}`;
          svg += `<clipPath id="${id}"><rect x="${f1(cx - r)}" y="${f1(cy - r)}" width="${f1(2 * r * plne)}" height="${f1(2 * r)}"/></clipPath>`
            + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${ZENY}" clip-path="url(#${id})"/>`;
        }
      }
    });
    const yPozn = F.y + PATRA.length * F.krok + pismo * 0.2;
    svg += `<text x="${f1(F.x + F.w)}" y="${f1(yPozn)}" text-anchor="end" font-family="IBM Plex Sans" font-size="${f1(pismo * 0.62)}" fill="${POPIS}" opacity=".75">1 tečka = 10 % míst, červeně ženy</text>`;
    fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${F.W}" height="${F.H}" viewBox="0 0 ${F.W} ${F.H}">${svg}</svg>`);
  }
  console.log('motiv hotový');
}
