// Sada coverů – python _data_pipeline/vypocet.py (zapíše toky-cr.json), pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: Sankey přesunů voličů 2021 → 2025 za celé Česko (stejná data jako graf v článku), všechny strany ve svých
// barvách, přechod barva strany 2021 → barva strany 2025, žádná strana zvýrazněná (Kateřina 6. 11. 2026: článek je
// o všech stranách). Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
const D = require('./toky-cr.json');

const PAPIR = '#f8f6f0'; // background.0
const f1 = (v) => (Math.round(v * 10) / 10).toString();
// barvy stran na tmavém pozadí: ANO a Piráti mají v grafech tmavou barvu, která by na coveru zanikla
const NA_TMAVE = { ANO: '#8f9dc9', Piráti: '#d2d8e9', Nevoliči: '#4c4f8e', Ostatní: '#6267a3' }; // brandNavy.4 / .1 / .7 / .6
const barva = (n) => NA_TMAVE[n] ?? D.barvy[n];

// plocha motivu [x, y, w, h] pro každý formát; text vlevo / nahoře, pravý horní roh volný pro štítek rubriky
const PLOCHA = {
  homepage: [860, 300, 600, 840],
  og: [900, 95, 270, 470], // OG: text vlevo (široké rozvržení), motiv vpravo
  square: [540, 330, 500, 680],
  instagram: [540, 560, 500, 700],
  story: [120, 960, 840, 760],
};
const ROZ = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };

function sankey(klic) {
  const [x, y, w, h] = PLOCHA[klic];
  const T = D.t.filter(([a, b]) => !(a === 'Nevoliči' && b === 'Nevoliči')); // obří „nevoliči zůstali“ by motiv přehlušil
  const tl = {}, tr = {};
  for (const [a, b, v] of T) { tl[a] = (tl[a] || 0) + v; tr[b] = (tr[b] || 0) + v; }
  const Ln = D.L.filter((n) => tl[n]), Rn = D.R.filter((n) => tr[n]);
  const sum = Object.values(tl).reduce((s, v) => s + v, 0);
  const gap = h * 0.016, nw = Math.max(6, w * 0.016), k = (h - gap * (Math.max(Ln.length, Rn.length) - 1)) / sum;
  const pos = (ns, tot) => { const o = {}; let c = y; for (const n of ns) { o[n] = c; c += Math.max(tot[n] * k, 2) + gap; } return o; };
  const yl = pos(Ln, tl), yr = pos(Rn, tr), oL = { ...yl }, oR = { ...yr };
  const popisky = klic !== 'og';
  const x0 = x + (popisky ? w * 0.2 : 0), x1 = x + w - (popisky ? w * 0.22 : 0) - nw, cx = (x0 + nw + x1) / 2, fs = Math.max(15, h * 0.026);
  let defs = '', cesty = '', i = 0;
  for (const s of Ln) for (const t of Rn) for (const [a, b, v] of T) {
    if (a !== s || b !== t) continue;
    const hh = v * k, a0 = oL[s], b0 = oR[t]; oL[s] += hh; oR[t] += hh;
    const id = `g${klic}${i++}`;
    defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x0 + nw)}" y1="0" x2="${f1(x1)}" y2="0"><stop offset="0" stop-color="${barva(s)}"/><stop offset="1" stop-color="${barva(t)}"/></linearGradient>`;
    cesty += `<path d="M${f1(x0 + nw)},${f1(a0)} C${f1(cx)},${f1(a0)} ${f1(cx)},${f1(b0)} ${f1(x1)},${f1(b0)} L${f1(x1)},${f1(b0 + hh)} C${f1(cx)},${f1(b0 + hh)} ${f1(cx)},${f1(a0 + hh)} ${f1(x0 + nw)},${f1(a0 + hh)} Z" `
      + `fill="url(#${id})" fill-opacity="${s === t ? 0.32 : 0.72}"/>`;
  }
  const txt = (tx, ty, s, a) => `<text x="${f1(tx)}" y="${f1(ty)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs)}" fill="${PAPIR}" fill-opacity="0.9" text-anchor="${a}" dominant-baseline="middle">${s}</text>`;
  const POPIS = new Set(['ANO', 'SPOLU', 'PirSTAN', 'SPD', 'STAN', 'Piráti', 'Motoristé', 'Nevoliči']);
  let uzly = '';
  for (const n of Ln) {
    const hh = Math.max(tl[n] * k, 2);
    uzly += `<rect x="${f1(x0)}" y="${f1(yl[n])}" width="${f1(nw)}" height="${f1(hh)}" fill="${barva(n)}"/>`;
    if (popisky && POPIS.has(n) && hh > fs * 0.9) uzly += txt(x0 - fs * 0.5, yl[n] + hh / 2, n === 'Nevoliči' ? 'nevoliči' : n, 'end');
  }
  for (const n of Rn) {
    const hh = Math.max(tr[n] * k, 2);
    uzly += `<rect x="${f1(x1)}" y="${f1(yr[n])}" width="${f1(nw)}" height="${f1(hh)}" fill="${barva(n)}"/>`;
    if (popisky && POPIS.has(n) && hh > fs * 0.9) uzly += txt(x1 + nw + fs * 0.5, yr[n] + hh / 2, n === 'Nevoliči' ? 'nevoliči' : n, 'start');
  }
  uzly += `<text x="${f1(x0 + nw)}" y="${f1(y - fs * 1.1)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs)}" fill="${PAPIR}" fill-opacity="0.6" text-anchor="end">2021</text>`
    + `<text x="${f1(x1)}" y="${f1(y - fs * 1.1)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs)}" fill="${PAPIR}" fill-opacity="0.6">2025</text>`;
  const [W, H] = ROZ[klic];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${cesty}${uzly}</svg>`;
}

module.exports = {
  vystup: require('path').join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Přesuny voličů' },
  logo: 'vlevo',
  og: 'siroky', // OG: text vlevo, motiv (svg.og) vpravo
  // brand.9 / brandNavy.7 záře jako u volebních coverů, brandNavy.1 nadtitulek, brandRoyalBlue.2 podtitulek
  barvy: { glowA: '#8b0e2b', glowB: '#4c4f8e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(PLOCHA).map((k) => [k, sankey(k)])) },
};
