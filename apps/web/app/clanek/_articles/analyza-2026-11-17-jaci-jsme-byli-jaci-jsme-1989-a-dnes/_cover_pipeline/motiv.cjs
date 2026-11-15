// Motiv coveru kapitoly Přehled speciálu „Jací jsme byli, jací jsme – 1989 × 2026“:
// „čára života“ ze svíček – dvě vodorovné časové osy (ženy, muži), 1 svíčka = 1 rok věku od 0 do 85 let.
// Svíčky v barvě „tehdy“ (#6267a3) = roky, které člověk mohl čekat podle naděje dožití v roce 1989; karmínové
// hořící = roky, které od té doby přibyly; prázdné obrysy do konce osy jen dokreslují čáru. Nad koncem řady „75 → 83“.
// (Nahrazuje „kalendář života“ ze dvou tečkových mřížek, který Kateřina 15. 11. 2026 zamítla.)
// Data: _data_pipeline/dvojice.json (řada ČSÚ Tab. 01.01; vystup.txt: „Naděje dožití žen 1989 75.5 → 2025 83.2“,
// mužů 68.1 → 77.5), v textu článku hned v první větě. Celé roky: ženy 75,46 → 83,19 = 75 → 83 (+8),
// muži 68,14 → 77,49 = 68 → 77 (+9).
// node motiv.cjs → motiv-<formát>.svg (mimo git), pak tools/cover-generator.cjs cover.config.cjs
const fs = require('fs');
const path = require('path');

// přesné hodnoty z řady ČSÚ (vystup.txt má jen jedno desetinné místo: 75,46 by se zaokrouhlilo na 76)
const dvojice = require(path.join(__dirname, '..', '_data_pipeline', 'dvojice.json'));
const dozit = (kdo) => {
  const r = dvojice.find((d) => d.ukazatel === `Naděje dožití při narození – ${kdo}`);
  if (!r) throw new Error(`v dvojice.json chybí naděje dožití (${kdo})`);
  return [Math.round(r.rada['1989']), Math.round(r.rada['2025'])];
};
const SKUPINY = [['ženy', dozit('ženy')], ['muži', dozit('muži')]];

const TEHDY = '#6267a3', DNES = '#de1743', DNES_OBRYS = '#ff8099', PRAZDNO = '#4c4f8e', TEXT = '#f8f6f0', OSA = '#d2d8e9';
const PISMO = 'IBM Plex Sans, Arial, sans-serif';
const f = (v) => v.toFixed(2);

// Jedna řada v jednotkách rozteče (1 jednotka = 1 rok): nahoře popisek řádku a „75 → 83“, pak řada svíček
// (1 svíčka = 1 rok věku), pod nimi osa věku. Přibylé roky jsou karmínové svíčky, které hoří.
const ROKY = 85;
function rada(y0, [nazev, [tehdy, dnes]], o) {
  const yPop = y0 + 2.2, yPlamen = y0 + 3.6, ySv = y0 + 4.35, yDno = ySv + o.svicka, yO = yDno + 0.25;
  let s = '';
  // popisek řádku vlevo, čísla vpravo nad koncem řady
  // (OG: popisek řádku u čísel vpravo, ať ho ořez messengerů na střední čtverec neusekne)
  const vpravo = o.popisekVpravo ? `<tspan font-weight="600" font-size="${f(o.popisek)}">${nazev}</tspan><tspan dx="${f(o.popisek * 0.6)}">${tehdy}</tspan>` : tehdy;
  if (!o.popisekVpravo) s += `<text x="0" y="${f(yPop)}" font-family="${PISMO}" font-weight="600" font-size="${f(o.popisek)}" fill="${TEXT}">${nazev}</text>`;
  s += `<text x="${ROKY}" y="${f(yPop)}" text-anchor="end" font-family="${PISMO}" font-weight="700" font-size="${f(o.cislo)}" fill="${TEXT}">${vpravo} → <tspan fill="${DNES_OBRYS}">${dnes}</tspan></text>`;
  for (let i = 0; i < ROKY; i++) {
    const x = i + 0.5, sv = (barva, extra = '') => `<rect x="${f(x - 0.26)}" y="${f(ySv)}" width="0.52" height="${f(o.svicka)}" rx="0.2" ${barva}${extra}/>`;
    if (i < tehdy) s += sv(`fill="${TEHDY}"`);
    else if (i < dnes) {
      s += `<ellipse cx="${f(x)}" cy="${f(yPlamen)}" rx="1.1" ry="1.3" fill="url(#zare)"/>`;
      s += `<path d="M${f(x)} ${f(yPlamen - 0.85)} C${f(x + 0.44)} ${f(yPlamen - 0.15)} ${f(x + 0.36)} ${f(yPlamen + 0.45)} ${f(x)} ${f(yPlamen + 0.45)} C${f(x - 0.36)} ${f(yPlamen + 0.45)} ${f(x - 0.44)} ${f(yPlamen - 0.15)} ${f(x)} ${f(yPlamen - 0.85)}Z" fill="${DNES_OBRYS}"/>`;
      s += sv(`fill="${DNES}"`, ` stroke="${DNES_OBRYS}" stroke-width="0.08"`);
    } else s += `<rect x="${f(x - 0.22)}" y="${f(ySv + 0.04)}" width="0.44" height="${f(o.svicka - 0.08)}" rx="0.18" fill="none" stroke="${PRAZDNO}" stroke-width="0.08"/>`;
  }
  // osa věku
  s += `<line x1="0" y1="${f(yO)}" x2="${ROKY}" y2="${f(yO)}" stroke="${OSA}" stroke-opacity="0.5" stroke-width="0.08"/>`;
  for (const v of [0, 20, 40, 60, 80]) {
    s += `<line x1="${v}" y1="${f(yO)}" x2="${v}" y2="${f(yO + 0.6)}" stroke="${OSA}" stroke-opacity="0.75" stroke-width="0.1"/>`;
    s += `<text x="${v}" y="${f(yO + 0.9 + o.osa)}" text-anchor="${v === 0 ? 'start' : 'middle'}" font-family="${PISMO}" font-size="${f(o.osa)}" fill="${OSA}" fill-opacity="0.85">${v === 80 ? '80 let' : v}</text>`;
  }
  return { svg: s, h: yO + 1.2 + o.osa - y0 };
}
function motiv(o) {
  const a = rada(0, SKUPINY[0], o);
  const b = rada(a.h + o.mezera, SKUPINY[1], o);
  return { w: ROKY, h: a.h + o.mezera + b.h, svg: a.svg + b.svg };
}

// [šířka, výška formátu, plocha motivu x0, y0, x1, y1, písmo v px: popisek řádku, čísla, osa; mezera mezi řadami
//  a výška svíčky (jednotky rozteče), popisek řádku vpravo u čísel]
const POLOHA = {
  homepage: [1500, 1200, [180, 520, 1320, 950], [30, 40, 19], 2.2, 5.5],
  og: [1200, 630, [80, 222, 880, 492], [21, 26, 14], 1.2, 4, true],
  square: [1080, 1080, [70, 480, 1010, 870], [28, 36, 18], 2, 4.8],
  instagram: [1080, 1350, [70, 570, 1010, 1100], [30, 40, 19], 3, 9],
  story: [1080, 1920, [70, 760, 1010, 1440], [32, 44, 20], 4, 14],
};

for (const [k, [W, H, [x0, y0, x1, y1], [pp, pc, po], mezera, svicka, popisekVpravo]] of Object.entries(POLOHA)) {
  const sc = (x1 - x0) / ROKY;
  const m = motiv({ mezera, svicka, popisekVpravo, popisek: pp / sc, cislo: pc / sc, osa: po / sc });
  const tx = x0, ty = y0 + (y1 - y0 - m.h * sc) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="zare"><stop offset="0" stop-color="${DNES_OBRYS}" stop-opacity="0.5"/><stop offset="1" stop-color="${DNES_OBRYS}" stop-opacity="0"/></radialGradient></defs><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sc)})">${m.svg}</g></svg>`;
  fs.writeFileSync(path.join(__dirname, `motiv-${k}.svg`), svg);
  if (m.h * sc > y1 - y0 + 0.5) console.warn(`⚠ ${k}: motiv (${Math.round(m.h * sc)} px) je vyšší než plocha (${y1 - y0} px)`);
}
console.log('motiv hotový:', SKUPINY.map(([n, [a, b]]) => `${n} ${a} → ${b} (+${b - a})`).join(', '));
