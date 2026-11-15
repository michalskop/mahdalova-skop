// Motiv coveru kapitoly Ovzduší (speciál Jací jsme byli, jací jsme – 1989 × 2026), ilustruje titulek
// „Síra zmizela, kouř z komínů zůstal“ (Kateřina 15. 11.: mapě obcí nerozuměla):
// vlevo tovární komín, vpravo rodinný domek s komínem, nad každým oblak kouře ze 100 teček,
// 1 tečka = 1 % emisí v roce 1990. Plné karmínové tečky = co zůstalo dnes, prázdná kolečka s konturou = co ubylo
// (stejný jazyk jako srdce v analyza-2026-11-17-jaci-jsme-zdravi).
//  - síra: emise oxidu siřičitého celkem 1990 → 2024 (ČSÚ Tab. 02.04, cisla.json → so2_emise; v článku 2. odstavec)
//  - benzo[a]pyren z domácností 1990 → 2023 (inventura ČHMÚ, cisla.json → emise[].BaP_domacnosti_t; v článku
//    odstavec pod „Benzo[a]pyren dnes skoro celý pochází z domácností“)
// node motiv.cjs → motiv-<formát>.svg (mimo git, viz .gitignore článku)
const fs = require('fs');
const path = require('path');

const cisla = require(path.join(__dirname, '..', '_data_pipeline', 'cisla.json'));
const so2 = cisla.so2_emise;
const bap = Object.fromEntries(cisla.emise.map((r) => [r.rok, r.BaP_domacnosti_t]));
const SO2_DNES = Math.round((so2['2024'] / so2['1990']) * 100); // 46,9 / 1 753,8 → 3
const BAP_DNES = Math.round((bap[2023] / bap[1990]) * 100); // 14,3 / 29,1 → 49
if (SO2_DNES !== 3 || BAP_DNES !== 49) throw new Error(`nečekané počty teček: SO2 ${SO2_DNES}, BaP ${BAP_DNES}`);

const RED = '#de1743', ZARE = '#ff8099', TELO = '#4c4f8e', SVETLA = '#6267a3', KREM = '#f8f6f0', SUB = '#d2d8e9';
const f = (v) => v.toFixed(1);

// ---- oblak kouře: 100 bodů šestiúhelníkové mřížky uvnitř sjednocení kruhů (souřadnice od ústí komína, y dolů)
function oblak(smer) {
  const kruhy = [[0, -36, 42], [22, -110, 74], [70, -200, 96], [-28, -222, 78], [140, -268, 86], [40, -300, 92]].map(([x, y, r]) => [x * smer, y, r]);
  const uvnitr = (x, y) => kruhy.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r);
  const mrizka = (s) => {
    const h = (s * Math.sqrt(3)) / 2, b = [];
    for (let j = 0; j < 80; j++) {
      const y = -s * 0.6 - j * h;
      for (let i = -40; i <= 40; i++) { const x = i * s + (j % 2 ? s / 2 : 0); if (uvnitr(x, y)) b.push([x, y]); }
    }
    return b;
  };
  let lo = 5, hi = 120;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (mrizka(m).length >= 100) lo = m; else hi = m; }
  // přebytek uberou body nejdál od ústí; pak odspodu (od ústí) nahoru, v řádku od osy ven
  let b = mrizka(lo).sort((p, q) => Math.hypot(...p) - Math.hypot(...q)).slice(0, 100);
  b.sort((p, q) => q[1] - p[1] || Math.abs(p[0]) - Math.abs(q[0]));
  return { body: b, s: lo };
}
const kreslitOblak = (o, dnes, ox, oy) => {
  const r = o.s * 0.37;
  return o.body.map(([x, y], i) => (i < dnes
    ? `<circle cx="${f(ox + x)}" cy="${f(oy + y)}" r="${f(r)}" fill="${RED}" stroke="${ZARE}" stroke-width="${f(o.s * 0.05)}"/>`
    : `<circle cx="${f(ox + x)}" cy="${f(oy + y)}" r="${f(r * 0.85)}" fill="none" stroke="${ZARE}" stroke-width="${f(o.s * 0.09)}"/>`)).join('');
};

// ---- scéna v jednotkách scény, zem y = 0; mezera = vzdálenost osy továrního komína a osy domku
function scena(mezera) {
  const FX = 0, FV = 260; // tovární komín: osa, výška
  const HX = mezera, HS = 220, HV = 130, HR = 95; // domek: střed, šířka, výška stěny, výška střechy
  const KX = HX + 52, KV = HV + HR + 22; // komín domku (na pravé straně střechy)
  let g = '';
  // hala továrny za komínem (pilová střecha)
  const h0 = FX + 14, h1 = FX + 190, hv = 105, zub = (h1 - h0) / 3;
  let d = `M${f(h0)} 0 V${-hv}`;
  for (let i = 0; i < 3; i++) d += ` L${f(h0 + i * zub)} ${-hv - 34} L${f(h0 + (i + 1) * zub)} ${-hv}`;
  g += `<path d="${d} V0 Z" fill="${TELO}" opacity="0.75"/>`;
  for (let i = 0; i < 3; i++) g += `<rect x="${f(h0 + 18 + i * zub)}" y="-62" width="${f(zub - 36)}" height="26" fill="${SVETLA}" opacity="0.7"/>`;
  // komín: zužující se, dva pruhy
  g += `<path d="M${FX - 34} 0 L${FX - 22} ${-FV} L${FX + 22} ${-FV} L${FX + 34} 0 Z" fill="${TELO}"/>`;
  for (const v of [FV - 28, FV - 62]) {
    const w = 22 + (12 * v) / FV;
    g += `<rect x="${f(FX - w)}" y="${-v - 14}" width="${f(2 * w)}" height="14" fill="${SVETLA}"/>`;
  }
  g += `<rect x="${FX - 26}" y="${-FV - 10}" width="52" height="12" rx="2" fill="${SVETLA}"/>`;
  // domek: stěna, střecha, komín, okno a dveře
  g += `<path d="M${KX - 16} ${-HV - HR * 0.15} V${-KV} H${KX + 16} V${-HV - HR * 0.15 - 40} Z" fill="${TELO}"/>`;
  g += `<rect x="${KX - 20}" y="${-KV - 10}" width="40" height="12" rx="2" fill="${SVETLA}"/>`;
  g += `<rect x="${HX - HS / 2}" y="${-HV}" width="${HS}" height="${HV}" fill="${TELO}"/>`;
  g += `<path d="M${HX - HS / 2 - 22} ${-HV + 2} L${HX} ${-HV - HR} L${HX + HS / 2 + 22} ${-HV + 2} Z" fill="${SVETLA}"/>`;
  g += `<rect x="${HX - 70}" y="${-HV + 34}" width="52" height="46" fill="${SVETLA}" opacity="0.8"/>`;
  g += `<rect x="${HX + 22}" y="${-HV + 44}" width="44" height="86" fill="${SVETLA}" opacity="0.8"/>`;
  // oblaky (tovární se stáčí doprava, domácí doleva – k sobě, ať scéna drží pohromadě)
  const oT = oblak(1), oD = oblak(-1);
  g += kreslitOblak(oT, SO2_DNES, FX, -FV - 12) + kreslitOblak(oD, BAP_DNES, KX, -KV - 12);
  // rozměry scény
  const vse = [...oT.body.map(([x, y]) => [FX + x, -FV - 12 + y]), ...oD.body.map(([x, y]) => [KX + x, -KV - 12 + y])];
  const x0 = Math.min(FX - 40, ...vse.map((p) => p[0])) - oT.s / 2, x1 = Math.max(HX + HS / 2 + 24, ...vse.map((p) => p[0])) + oT.s / 2;
  const y0 = Math.min(...vse.map((p) => p[1])) - oT.s / 2;
  return { g, x0, x1, y0, y1: 0, FX, HX, s: oT.s };
}

// [W, H, plocha scény x0, y0, x1, y1 (bez popisků), mezera komín–domek, písmo popisků, y řádku legendy | null]
// Na výšku (čtverec, 4:5, story) je legenda v jednom řádku nad oblaky (část motivu), na homepage a OG ji sází
// generátor (cover.config.cjs: pro.<formát>.legenda: null).
const POLOHA = {
  homepage: [1500, 1200, [560, 585, 1440, 975], 540, 26, null],
  og: [1200, 630, [585, 165, 905, 470], 520, 14, null],
  square: [1080, 1080, [70, 475, 1010, 840], 560, 23, 445],
  instagram: [1080, 1350, [70, 612, 1010, 1050], 560, 26, 580],
  story: [1080, 1920, [70, 795, 1010, 1345], 560, 30, 750],
};

for (const [k, [W, H, [bx0, by0, bx1, by1], mezera, fp, legY]] of Object.entries(POLOHA)) {
  const sc = scena(mezera);
  const w0 = sc.x1 - sc.x0, h0 = sc.y1 - sc.y0;
  const m = Math.min((bx1 - bx0) / w0, (by1 - by0) / h0);
  const tx = bx0 + (bx1 - bx0 - w0 * m) / 2 - sc.x0 * m, ty = by1;
  const X = (x) => tx + x * m;
  const radek = (x, i, t, tucne) => `<text x="${f(X(x))}" y="${f(ty + fp * (1.5 + i * 1.22))}" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="${tucne ? 700 : 500}" font-size="${f(tucne ? fp : fp * 0.92)}" fill="${tucne ? KREM : SUB}">${t}</text>`;
  const popisek = (x, a, b, c) => radek(x, 0, a, 1) + radek(x, 1, b, 1) + radek(x, 2, c, 0);
  // legenda v jednom řádku, vycentrovaná nad scénou: text | ● zůstalo dnes | ○ ubylo
  let leg = '';
  if (legY) {
    const lf = fp * 0.95, r = lf * 0.36, t = (x, s) => `<text x="${f(x)}" y="${f(legY)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f(lf)}" fill="${KREM}">${s}</text>`;
    const w1 = lf * 15.6, w2 = lf * 6.6, w3 = lf * 3.0, mez = lf * 1.3, kr = r * 2 + lf * 0.35;
    let x = (W - (w1 + mez + kr + w2 + mez + kr + w3)) / 2;
    leg += t(x, '1 tečka = 1 % emisí v roce 1990'); x += w1 + mez;
    leg += `<circle cx="${f(x + r)}" cy="${f(legY - lf * 0.34)}" r="${f(r)}" fill="${RED}" stroke="${ZARE}" stroke-width="${f(lf * 0.06)}"/>`; x += kr;
    leg += t(x, 'zůstalo dnes'); x += w2 + mez;
    leg += `<circle cx="${f(x + r)}" cy="${f(legY - lf * 0.34)}" r="${f(r * 0.88)}" fill="none" stroke="${ZARE}" stroke-width="${f(lf * 0.12)}"/>`; x += kr;
    leg += t(x, 'ubylo');
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + leg
    + `<g transform="translate(${f(tx)} ${f(ty)}) scale(${(m).toFixed(4)})">${sc.g}</g>`
    + popisek(sc.FX + 60, 'síra', 'hlavně z továren', '−97 % od roku 1990')
    + popisek(sc.HX, 'benzo[a]pyren', 'z domácností', 'zůstala polovina')
    + `</svg>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), svg);
}
console.log(`motiv Ovzduší: síra ${SO2_DNES} plných ze 100 (${so2['2024']} / ${so2['1990']} kt), benzo[a]pyren domácnosti ${BAP_DNES} ze 100 (${bap[2023].toFixed(1)} / ${bap[1990].toFixed(1)} t)`);
