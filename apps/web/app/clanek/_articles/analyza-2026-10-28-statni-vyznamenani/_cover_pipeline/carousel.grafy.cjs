// Společné kreslení grafů pro oba carousely (carousel.config.cjs = ženy, carousel.prezidenti.config.cjs = komu).
// Slide 1080×1350, obsahová plocha pod titulkem zhruba y 600–1190. Barvy z palety DataTimes.
const fs = require('fs');
const path = require('path');

const W = 1080, H = 1350;
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const KREM = '#f8f6f0'; // background.2
const POPIS = '#ffe0c7'; // brandOrange.1
const ZENY = '#33b9d9'; // brandTeal.4 – ženy jako v grafech článku
const MUZI = '#b57ac8'; // brandAmethyst.4 – muži (v článku #522a7a, na tmavém pozadí světlejší odstín téže škály)
const PREZ_BARVY = { Havel: '#697fe6', Klaus: '#ff4970', Zeman: '#f8f6f0', Pavel: '#1a9fbd' }; // jako tečky coveru
const PREZ_JMENA = { Havel: 'Havel', Klaus: 'Klaus', Zeman: 'Zeman', Pavel: 'Pavel' };
const PORADI = ['Havel', 'Klaus', 'Zeman', 'Pavel'];

const f1 = (v) => (+v).toFixed(1);
const cislo = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '&#160;');
const svg = (obsah) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${obsah}</svg>`;
const text = (x, y, obsah, { size = 26, w = 500, fill = POPIS, anchor = 'start', opacity = 1 } = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="${SANS}" font-weight="${w}" font-size="${size}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}>${obsah}</text>`;

// záznamy [rok, pohlaví, prezident] 1995–2025 z 02_analyza.py
const zaznamy = JSON.parse(fs.readFileSync(path.join(__dirname, 'tecky.json'), 'utf8'));

// Vodorovné pruhy: radky = [{ popis, hodnota (0–1 nebo počet), stitek, barva }], max = hodnota pro plnou šířku
function pruhy(radky, { y0 = 640, vyska = 70, mezera = 62, max = 1, x0 = 70, x1 = 860, popisVelikost = 32 } = {}) {
  let s = '', y = y0;
  for (const r of radky) {
    s += text(x0, y, r.popis, { size: popisVelikost, w: 600, fill: KREM });
    y += 18;
    const sirka = Math.max(4, (r.hodnota / max) * (x1 - x0));
    s += `<rect x="${x0}" y="${f1(y)}" width="${f1(sirka)}" height="${vyska}" rx="5" fill="${r.barva}"/>`;
    s += text(x0 + sirka + 18, y + vyska / 2 + 14, r.stitek, { size: 38, w: 700, fill: KREM });
    if (r.male) s += text(x0 + sirka + 18, y + vyska / 2 + 50, r.male, { size: 26, fill: POPIS, opacity: 0.9 });
    y += vyska + mezera;
  }
  return s;
}

// Sloupce po letech 1995 až poslední ročník v datech. hodnoty(rok) → [{ n, barva }] skládané odspodu; popisy = { rok: text nad sloupcem }
function sloupceRoky(hodnoty, { y0 = 640, y1 = 1150, max = 110, popisy = {}, mrizka = [25, 50, 75, 100] } = {}) {
  const posledni = Math.max(...zaznamy.map((z) => +z[0]));
  const roky = Array.from({ length: posledni - 1994 }, (_, i) => 1995 + i);
  const x0 = 120, x1 = 1010, krok = (x1 - x0) / roky.length, sirka = krok * 0.74;
  const y = (v) => y1 - (v / max) * (y1 - y0);
  let s = '';
  for (const v of mrizka) s += `<line x1="${x0}" x2="${x1}" y1="${f1(y(v))}" y2="${f1(y(v))}" stroke="${KREM}" stroke-opacity=".12"/>` + text(x0 - 14, y(v) + 8, v, { size: 22, anchor: 'end', fill: KREM, opacity: 0.55 });
  roky.forEach((rok, i) => {
    const x = x0 + i * krok + (krok - sirka) / 2;
    let zaklad = 0;
    for (const { n, barva } of hodnoty(rok)) {
      if (!n) continue;
      s += `<rect x="${f1(x)}" y="${f1(y(zaklad + n))}" width="${f1(sirka)}" height="${f1(y(zaklad) - y(zaklad + n))}" fill="${barva}"/>`;
      zaklad += n;
    }
    if (popisy[rok]) s += text(x + sirka / 2, y(zaklad) - 14, popisy[rok], { size: 26, w: 600, fill: KREM, anchor: 'middle' });
    if (rok % 5 === 0) s += text(x + sirka / 2, y1 + 38, rok, { size: 24, anchor: 'middle', fill: KREM });
  });
  s += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${KREM}" stroke-opacity=".5"/>`;
  return s;
}

// legenda v jednom řádku: [[barva, popis], …]
function legenda(polozky, x, y, size = 26) {
  let s = '';
  for (const [barva, popis] of polozky) {
    s += `<rect x="${x}" y="${y - size * 0.75}" width="${size * 0.8}" height="${size * 0.8}" rx="3" fill="${barva}"/>`;
    s += text(x + size * 1.15, y, popis, { size, w: 500, fill: KREM });
    x += size * 1.15 + popis.length * size * 0.55 + 40;
  }
  return s;
}

// Graf z článku (PNG z grafy-z-clanku.cjs) na béžové kartě jako v článku; vejde se do [70, top]–[1010, spodek]
function kartaGrafu(soubor, top, spodek = 1215) {
  if (!fs.existsSync(soubor)) throw new Error(`chybí ${soubor} – spusť nejdřív grafy-z-clanku.cjs`);
  const png = fs.readFileSync(soubor);
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  const pad = 22, maxW = 940 - 2 * pad, maxH = spodek - top - 2 * pad;
  const k = Math.min(maxW / w, maxH / h), iw = w * k, ih = h * k;
  const x = (W - iw) / 2;
  return `<rect x="${f1(x - pad)}" y="${top}" width="${f1(iw + 2 * pad)}" height="${f1(ih + 2 * pad)}" rx="16" fill="#f8f6f0"/>`
    + `<image x="${f1(x)}" y="${top + pad}" width="${f1(iw)}" height="${f1(ih)}" href="data:image/png;base64,${png.toString('base64')}"/>`;
}

// Zakulacená šipka od poznámky k hodnotě (Kateřina 28. 10.: místo kroužku kolem čísla): text vedle a nad hodnotou,
// oblouk (kubická Bézierova křivka) končí nad číslem, hrot ze dvou čar s kulatými konci. strana 1 = text vpravo.
function sipka(cx, cy, poznamka, strana = 1, barva = '#ffcf02') {
  const tx = cx + strana * 110, ty = cy - 95; // účaří poznámky
  const [sx, sy] = [tx - strana * 14, ty - 10]; // začátek u textu
  const [ex, ey] = [cx + strana * 10, cy - 8]; // konec nad hodnotou
  const c1 = [sx - strana * 75, sy - 6], c2 = [ex + strana * 12, ey - 70];
  const d = Math.hypot(ex - c2[0], ey - c2[1]), ux = (ex - c2[0]) / d, uy = (ey - c2[1]) / d;
  const hrot = (uhel) => { const c = Math.cos(uhel), sn = Math.sin(uhel); return [ex - 20 * (ux * c - uy * sn), ey - 20 * (ux * sn + uy * c)]; };
  const [h1, h2] = [hrot(0.55), hrot(-0.55)];
  const tah = `stroke="${barva}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  return `<path d="M${f1(sx)},${f1(sy)} C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(ex)},${f1(ey)}" ${tah}/>`
    + `<path d="M${f1(h1[0])},${f1(h1[1])} L${f1(ex)},${f1(ey)} L${f1(h2[0])},${f1(h2[1])}" ${tah}/>`
    + text(tx, ty, poznamka, { size: 30, w: 600, fill: barva, anchor: strana > 0 ? 'start' : 'end' });
}

// Sloupce ročníků jednoho prezidenta (podle karuselu Moravec.cz): hodnota nad sloupcem, u rekordu poznámka se šipkou
function sloupcePrezidenta(roky, barva, { y0 = 640, y1 = 1130, max = 110, kruh, poznamka } = {}) {
  const x0 = 90, x1 = 990, krok = (x1 - x0) / roky.length, sirka = Math.min(90, krok * 0.72);
  const y = (v) => y1 - (v / max) * (y1 - y0);
  let s = '';
  roky.forEach(({ popis, n, tlumene }, i) => {
    const cx = x0 + i * krok + krok / 2;
    s += `<rect x="${f1(cx - sirka / 2)}" y="${f1(y(n))}" width="${f1(sirka)}" height="${f1(Math.max(2, y1 - y(n)))}" rx="3" fill="${barva}"${tlumene ? ' opacity=".45"' : ''}/>`;
    s += text(cx, y(n) - 16, n, { size: 34, w: 700, fill: KREM, anchor: 'middle' });
    const radky = String(popis).split('|');
    radky.forEach((r, j) => { s += text(cx, y1 + 40 + j * 28, r, { size: j ? 22 : 26, w: j ? 500 : 600, fill: j ? POPIS : KREM, anchor: 'middle' }); });
    if (kruh === i && poznamka) s += sipka(cx, y(n) - 52, poznamka, cx > 600 ? -1 : 1);
  });
  s += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${KREM}" stroke-opacity=".5"/>`;
  return s;
}

module.exports = { W, H, KREM, POPIS, ZENY, MUZI, PREZ_BARVY, PREZ_JMENA, PORADI, f1, cislo, svg, text, zaznamy, pruhy, sloupceRoky, legenda, kartaGrafu, sloupcePrezidenta };
