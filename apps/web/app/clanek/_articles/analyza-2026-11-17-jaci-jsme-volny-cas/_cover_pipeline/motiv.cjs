// Motiv coveru kapitoly Volný čas a spotřeba (speciál Jací jsme byli, jací jsme – 1989 × 2026): kinosál ze 100 sedadel
// pod velkým svítícím plátnem. Celý sál = návštěvy kin v roce 1989 (51,5 mil.), 1 sedadlo = 1 %. Karmínová (brand.6 #de1743)
// obsazená sedadla = dnešní návštěvy (2024: 13,0 mil., tedy 25 %), rozesetá po sále jako diváci v poloprázdném kině;
// prázdná sedadla brandNavy.6 #6267a3 („tehdy“) = návštěvy, které od roku 1989 ubyly.
// Plátno (Kateřina 15. 11. 2026: „není dobře vidět plátno“): velký obdélník background.2 #f8f6f0 se září, karmínový
// rám a opona brand.9 #8b0e2b (záhyby brand.8 #a81134), slabý kužel světla od promítačky zezadu sálu ke plátnu.
// Čísla: _data_pipeline/vystup.txt (grafy.py, ČSÚ Česko od roku 1989 v číslech, Tab. 12.10):
//   „Návštěvy kin (tis.): 1989 51 453 → 2024 13 041 tis. (× 0.25)“, „kino minus: pokles návštěv 1989 → posl. %: 74.7“,
//   „návštěvy kina na obyvatele: 1989 4.97 | 2024 1.2“; v článku 2. odstavec a kapitola „Kina ztratila tři čtvrtiny diváků“.
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

const DNES = '#de1743'; // brand.6
const TEHDY = '#6267a3'; // brandNavy.6
const PLATNO = '#f8f6f0'; // background.2
const OPONA = '#8b0e2b'; // brand.9
const ZAHYB = '#a81134'; // brand.8
const vystup = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8');
const m = vystup.match(/Návštěvy kin \(tis\.\): 1989 ([\d ]+) → 2024 ([\d ]+) tis\./);
if (!m) throw new Error('V vystup.txt chybí řádek „Návštěvy kin (tis.)“');
const cislo = (t) => Number(t.replace(/ /g, ''));
const NAVSTEVY_1989 = cislo(m[1]), NAVSTEVY_2024 = cislo(m[2]); // tis.
const OBSAZENO = Math.round((100 * NAVSTEVY_2024) / NAVSTEVY_1989); // 25
const RADY = [9, 10, 11, 12, 13, 14, 15, 16]; // 100 sedadel, sál se dozadu rozšiřuje (pohled od zadní řady)
if (RADY.reduce((a, b) => a + b, 0) !== 100) throw new Error('sál nemá 100 sedadel');

// deterministický „náhodný“ výběr obsazených sedadel (stejný při každém běhu)
function obsazena() {
  let s = 1989;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const idx = Array.from({ length: 100 }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return new Set(idx.slice(0, OBSAZENO));
}
const PLNA = obsazena();
const f = (n) => n.toFixed(1);

function sedadlo(x, y, s, barva) {
  // opěradlo + sedák, s = šířka sedadla, y = horní hrana sedáku
  const w = s, h = s * 0.62;
  return `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" rx="${f(s * 0.22)}" fill="${barva}"/>`
    + `<rect x="${f(x - w * 0.56)}" y="${f(y + s * 0.06)}" width="${f(w * 1.12)}" height="${f(s * 0.26)}" rx="${f(s * 0.12)}" fill="${barva}"/>`;
}

// Opona po straně plátna: svislý pruh se záhyby, dole mírně rozevřený.
function opona(x, y, w, h, smer) {
  const dole = w * 0.35 * smer;
  let g = `<path d="M ${f(x)} ${f(y)} L ${f(x + w * smer)} ${f(y)} Q ${f(x + w * smer * 0.7)} ${f(y + h * 0.6)} ${f(x + w * smer + dole)} ${f(y + h)} L ${f(x)} ${f(y + h)} Z" fill="${OPONA}"/>`;
  for (let k = 1; k <= 3; k++) {
    const xx = x + (w * smer * k) / 4.2;
    g += `<path d="M ${f(xx)} ${f(y)} Q ${f(xx - w * 0.05 * smer)} ${f(y + h * 0.6)} ${f(xx + dole * k / 4)} ${f(y + h)}" stroke="${ZAHYB}" stroke-width="${f(w * 0.09)}" fill="none" stroke-linecap="round"/>`;
  }
  return g;
}

// p: cx = střed, pY/pW/pH = horní hrana, šířka a výška plátna, sY0/sY1 = první a poslední řada sedadel,
// sW = šířka zadní řady; promítačka (zdroj kuželu) stojí hned za zadní řadou.
function sal(id, { cx, pY, pW, pH, sY0, sY1, sW }) {
  const prom = sY1 + 4;
  const n = RADY.length, maxN = RADY[n - 1];
  const mer = RADY.map((_, r) => 0.6 + (0.4 * r) / (n - 1)); // měřítko řady (přední menší)
  const krokZ = sW / maxN;
  const ram = pH * 0.07, oponaW = pW * 0.11, nahore = pH * 0.16;
  const pX = cx - pW / 2;
  let g = `<defs>`
    + `<filter id="zare${id}" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="${f(pH * 0.22)}"/></filter>`
    + `<linearGradient id="kuzel${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${PLATNO}" stop-opacity="0.16"/><stop offset="1" stop-color="${PLATNO}" stop-opacity="0.05"/></linearGradient>`
    + `<linearGradient id="platno${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${PLATNO}"/></linearGradient>`
    + `</defs>`;
  // kužel světla od promítačky (za zadní řadou) na plátno – slabý, plátno nepřebije
  // záře plátna
  // bez plátna (Kateřina 15. 11.: kinosál zezadu jako cover Kalendáře filmových událostí 2026; každý pozná sedačky)
  void opona; void oponaW; void nahore; void OPONA;
  // řady sedadel: rozestupy úměrné měřítku řad, od první (u plátna) po zadní
  const suma = mer.slice(1).reduce((a, b) => a + b, 0);
  const ys = [sY0]; mer.slice(1).forEach((mm) => ys.push(ys[ys.length - 1] + ((sY1 - sY0) * mm) / suma));
  let i = 0;
  RADY.forEach((pocet, r) => {
    const krok = krokZ * mer[r], s = Math.min(krok * 0.68, (((sY1 - sY0) * mer[r]) / suma) * 1.18);
    for (let j = 0; j < pocet; j++) {
      const u = (j - (pocet - 1) / 2) / (maxN / 2);
      const x = cx + (j - (pocet - 1) / 2) * krok;
      g += sedadlo(x, ys[r] - s * 0.12 * (1 - u * u), s, PLNA.has(i) ? DNES : TEHDY);
      i++;
    }
  });
  return g;
}

const POLOHA = {
  homepage: [1500, 1200, { cx: 800, pY: 565, pW: 380, pH: 142, sY0: 585, sY1: 895, sW: 1000 }],
  og: [1200, 630, { cx: 600, pY: 205, pW: 340, pH: 128, sY0: 245, sY1: 495, sW: 540 }],
  square: [1080, 1080, { cx: 540, pY: 472, pW: 440, pH: 165, sY0: 520, sY1: 895, sW: 960 }],
  instagram: [1080, 1350, { cx: 540, pY: 520, pW: 500, pH: 190, sY0: 585, sY1: 1095, sW: 990 }],
  story: [1080, 1920, { cx: 540, pY: 770, pW: 560, pH: 215, sY0: 820, sY1: 1440, sW: 1000 }],
};

for (const [k, [W, H, p]] of Object.entries(POLOHA)) {
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${sal(k, p)}</svg>`);
  console.log(`motiv-${k}.svg`);
}
console.log('obsazeno', OBSAZENO);
