// Motiv coveru „Počet obyvatel genocidu neměří“: spojnicový graf z dat článku – index počtu obyvatel pěti zemí
// kolem začátku uznané genocidy (rok před začátkem = 100), od 5 let před do 6 let po začátku.
// Data: krivky.json = výstup krivky_export.py z funkce rady() v ../_data_pipeline/krivky.py (Světová banka WDI
// SP.POP.TOTL). Čísla se ručně nepřepisují.
// Věta coveru: „Křivka obyvatel genocidu neukáže“ – u Kambodže a Rwandy křivka padá (oranžové odstíny), u Guatemaly,
// Iráku a Myanmaru i po začátku genocidy roste (tyrkysové odstíny). Svislá čárkovaná linka = začátek genocidy.
// Citlivé téma: jen abstraktní datový motiv, žádné postavy, vlajky ani mapy.
// node motiv.cjs  → motiv-<formát>.svg pro cover.config.cjs (motiv.typ 'svg'); funkce graf() sdílí carousel a animace.
const fs = require('fs');
const path = require('path');

const D = require('./krivky.json');

// barvy jen z palety (packages/ui/DESIGN.md)
const B = {
  Kambodža: '#f76800', // brandOrange.6
  Rwanda: '#ff934d', // brandOrange.4
  Guatemala: '#5fcce6', // brandTeal.3
  Irák: '#33b9d9', // brandTeal.4
  Myanmar: '#1a9fbd', // brandTeal.5
};
// u rostoucích křivek i skupina, na kterou genocida mířila (text článku)
const SKUPINA = { Guatemala: 'Ixilové', Irák: 'Jezídové', Myanmar: 'Rohingové' };
const KREM = '#f8f6f0'; // background.2
const POPIS = '#d2d8e9'; // brandNavy.1
const NAVY = '#101432'; // brandNavy.9
const SANS = 'IBM Plex Sans, Arial, sans-serif';

const ZEME = D.pripady.map((p) => p.zeme);
const RADY = Object.fromEntries(ZEME.map((z) => [z, D.rady.filter((r) => r.zeme === z).sort((a, b) => a.t - b.t)]));
const T0 = D.od, T1 = D.do; // −5 … +6
const IMIN = 70, IMAX = 122; // osa indexu (minimum dat 71,1 Rwanda 1995, maximum 120,2 Guatemala 1987)

// Rozvržení pro každý formát:
//   plot  = [x0, y0, x1, y1] plocha grafu (y0 = index IMAX, y1 = index IMIN)
//   lw    = tloušťka čar, fs/fsS = písmo popisku země / skupiny
//   cara  = horní konec svislé linky „začátek genocidy“, nap = [dx, y, anchor] nápis u ní
//   pozn  = [x, účaří posledního řádku, velikost] poznámka a zdroj vlevo dole (POZN = řádky, poslední je zdroj)
const POZN = ['Počet obyvatel země kolem začátku', 'genocidy, rok před = 100', 'Zdroj: Světová banka'];
const FORMATY = {
  // homepage: graf vpravo dole pod titulkem (konec křivek Guatemaly a Iráku pod koncem titulku), text vlevo nahoře
  homepage: { W: 1500, H: 1200, plot: [470, 545, 1130, 1010], lw: 7, fs: 27, fsS: 22, cara: 660, nap: [-14, 1000, 'end'], pozn: [180, 1000, 22] },
  square: { W: 1080, H: 1080, plot: [110, 525, 790, 900], lw: 6, fs: 25, fsS: 20, cara: 500, nap: [10, 522, 'start'], pozn: [70, 1002, 20] },
  instagram: { W: 1080, H: 1350, plot: [110, 600, 790, 1110], lw: 6.5, fs: 26, fsS: 21, cara: 565, nap: [10, 588, 'start'], pozn: [70, 1232, 21] },
  story: { W: 1080, H: 1920, plot: [120, 790, 780, 1390], lw: 7.5, fs: 29, fsS: 23, cara: 740, nap: [12, 766, 'start'], pozn: [80, 1562, 24] },
};

const f1 = (v) => v.toFixed(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// popisky na koncích křivek rozestoupit, aby se nepřekrývaly (výšky podle počtu řádků)
function rozestup(polozky, mezera) {
  const p = polozky.slice().sort((a, b) => a.y - b.y);
  for (let k = 0; k < 40; k++) {
    let hotovo = true;
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1], b = p[i];
      const min = a.h / 2 + b.h / 2 + mezera;
      if (b.y - a.y < min) { const d = (min - (b.y - a.y)) / 2; a.y -= d; b.y += d; hotovo = false; }
    }
    if (hotovo) break;
  }
  return polozky;
}

// graf(klic, { konec, popisky, cara }) – SVG motivu daného formátu.
//   konec   = do kterého roku (t, desetinné) se křivky kreslí (animace); výchozí T1 = plný stav
//   popisky = krytí popisků zemí 0–1 (animace je nechá naběhnout až na konci)
//   rozmer  = [W, H] vlastní rozměr plátna (carousel), L = vlastní rozvržení
function graf(klic, { konec = T1, popisky = 1, L: Lx, rozmer, poznamka = true, otaznik = false } = {}) {
  const L = Lx ?? FORMATY[klic];
  const [W, H] = rozmer ?? [L.W, L.H];
  const [x0, y0, x1, y1] = L.plot;
  const X = (t) => x0 + ((t - T0) / (T1 - T0)) * (x1 - x0);
  const Y = (v) => y1 - ((v - IMIN) / (IMAX - IMIN)) * (y1 - y0);
  const halo = (size) => `stroke="${NAVY}" stroke-width="${f1(size * 0.3)}" stroke-linejoin="round" paint-order="stroke"`;
  let s = `<defs>
    <linearGradient id="nabeh-${klic}" gradientUnits="userSpaceOnUse" x1="${x0}" x2="${f1(X(-1))}" y1="0" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <mask id="m-${klic}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#nabeh-${klic})"/></mask>
    <clipPath id="c-${klic}"><rect x="0" y="0" width="${f1(X(Math.min(konec, T1)) + L.lw)}" height="${H}"/></clipPath>
  </defs>`;
  // období po začátku genocidy: pás v brandNavy.8, který od svislé linky doprava mizí
  s += `<linearGradient id="pas-${klic}" gradientUnits="userSpaceOnUse" x1="${f1(X(0))}" x2="${f1(x1 + L.fs * 2)}" y1="0" y2="0"><stop offset="0" stop-color="#2f325c" stop-opacity=".55"/><stop offset="1" stop-color="#2f325c" stop-opacity="0"/></linearGradient>`;
  // … a nahoře měkce naběhne (bez tvrdé horní hrany)
  s += `<linearGradient id="pasv-${klic}" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${L.cara}" y2="${f1(L.cara + (y1 - L.cara) * 0.35)}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`;
  s += `<mask id="pasm-${klic}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#pasv-${klic})"/></mask>`;
  s += `<rect x="${f1(X(0))}" y="${L.cara}" width="${f1(x1 + L.fs * 2 - X(0))}" height="${f1(y1 - L.cara)}" fill="url(#pas-${klic})" mask="url(#pasm-${klic})"/>`;
  // výchozí úroveň 100 (rok před začátkem)
  s += `<line x1="${x0}" x2="${x1}" y1="${f1(Y(100))}" y2="${f1(Y(100))}" stroke="${KREM}" stroke-opacity=".28" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`;
  // svislá čárkovaná linka „začátek genocidy“
  s += `<line x1="${f1(X(0))}" x2="${f1(X(0))}" y1="${L.cara}" y2="${y1}" stroke="${KREM}" stroke-opacity=".7" stroke-width="2.5" stroke-dasharray="9 8"/>`;
  const [ndx, ny, nanch] = L.nap;
  s += `<text x="${f1(X(0) + ndx)}" y="${ny}" text-anchor="${nanch}" font-family="${SANS}" font-weight="600" font-size="${f1(L.fsS)}" letter-spacing=".5" fill="${KREM}" ${halo(L.fsS)}>začátek genocidy</text>`;
  // křivky: rostoucí vespod, padající navrch (hlavní kontrast); náběh před začátkem tlumeně
  const poradi = ['Myanmar', 'Irák', 'Guatemala', 'Rwanda', 'Kambodža'];
  let cary = '', tecky = '';
  for (const z of poradi) {
    const r = RADY[z];
    const body = [];
    for (const b of r) {
      if (b.t <= konec) body.push([X(b.t), Y(b.index)]);
      else { // rozkreslený úsek mezi dvěma roky
        const a = r[r.indexOf(b) - 1];
        if (a && a.t < konec) { const k = konec - a.t; body.push([X(konec), Y(a.index + (b.index - a.index) * k)]); }
        break;
      }
    }
    if (body.length < 1) continue;
    cary += `<polyline points="${body.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" fill="none" stroke="${B[z]}" stroke-width="${L.lw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    const [hx, hy] = body.at(-1);
    tecky += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(L.lw * 1.25)}" fill="${B[z]}" stroke="${NAVY}" stroke-width="${f1(L.lw * 0.45)}"/>`;
  }
  s += `<g mask="url(#m-${klic})">${cary}</g>${tecky}`;
  // popisky zemí na koncích křivek
  if (popisky > 0) {
    const pol = ZEME.map((z) => ({ z, y0: Y(RADY[z].at(-1).index), y: Y(RADY[z].at(-1).index), h: SKUPINA[z] ? L.fs * 1.05 + L.fsS * 1.15 : L.fs * 1.05 }));
    rozestup(pol, L.fs * 0.25);
    const lx = x1 + L.lw * 1.25 + L.fs * 0.45;
    let p = '';
    for (const o of pol) {
      const top = o.y - o.h / 2;
      p += `<text x="${f1(lx)}" y="${f1(top + L.fs * 0.82)}" font-family="${SANS}" font-weight="600" font-size="${L.fs}" fill="${B[o.z]}" ${halo(L.fs)}>${esc(o.z)}</text>`;
      if (SKUPINA[o.z]) p += `<text x="${f1(lx)}" y="${f1(top + L.fs * 1.05 + L.fsS * 0.92)}" font-family="${SANS}" font-weight="500" font-size="${L.fsS}" fill="${POPIS}" ${halo(L.fsS)}>${esc(SKUPINA[o.z])}</text>`;
    }
    s += `<g opacity="${popisky}">${p}</g>`;
  }
  // otázka (úvodní slide carouselu): co se s křivkou stane po začátku genocidy?
  if (otaznik) {
    const fz = (y1 - L.cara) * 0.62;
    s += `<text x="${f1((X(0) + x1) / 2)}" y="${f1(L.cara + (y1 - L.cara) * 0.5 + fz * 0.36)}" text-anchor="middle" font-family="IBM Plex Serif, Georgia, serif" font-weight="700" font-size="${f1(fz)}" fill="${KREM}" opacity=".9">?</text>`;
  }
  // popisky osy času na krajích (carousel, animace): „5 let před“ … „6 let po“
  if (L.osa) {
    const oy = y1 + L.fsS * 1.6;
    s += `<text x="${x0}" y="${f1(oy)}" font-family="${SANS}" font-weight="500" font-size="${L.fsS}" fill="${POPIS}" opacity=".8">${-T0} let před</text>`;
    s += `<text x="${x1}" y="${f1(oy)}" text-anchor="end" font-family="${SANS}" font-weight="500" font-size="${L.fsS}" fill="${POPIS}" opacity=".8">${T1} let po</text>`;
  }
  // poznámka a zdroj vlevo dole
  if (poznamka && L.pozn) {
    const [px, py, pf] = L.pozn;
    const radky = L.poznRadky ?? POZN;
    radky.forEach((r, i) => {
      const zdroj = L.poznZdroj !== false && i === radky.length - 1; // poslední řádek = zdroj (menší, tlumeně)
      s += `<text x="${px}" y="${f1(py - (radky.length - 1 - i) * pf * 1.38 + (zdroj ? pf * 0.12 : 0))}" font-family="${SANS}" font-weight="500" font-size="${f1(zdroj ? pf * 0.92 : pf)}" fill="${POPIS}"${zdroj ? ' opacity=".75"' : ''} ${halo(pf)}>${esc(r)}</text>`;
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

module.exports = { FORMATY, graf, RADY, ZEME, B, SKUPINA, T0, T1, barvy: { KREM, POPIS, NAVY } };

if (require.main === module) {
  for (const klic of Object.keys(FORMATY)) fs.writeFileSync(path.join(__dirname, `motiv-${klic}.svg`), graf(klic));
  console.log('motiv hotový:', ZEME.map((z) => `${z} ${RADY[z].at(-1).index}`).join(', '));
}
