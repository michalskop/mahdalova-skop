// Sada coverů – python _data_pipeline/vypocet.py (zapíše toky-cr.json), pak
// PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv: Sankey přesunů voličů 2021 → 2025 za celé Česko (stejná data jako graf v článku). Pruhy, které vedou k ANO,
// svítí karmínově s přechodem od barvy původní strany, ostatní přesuny jsou tlumené. Titulek a podtitulek bere
// generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
const D = require('./toky-cr.json');

const AKCENT = '#ff1a4a'; // brand.4 – voliči, kteří přišli k ANO
const PAPIR = '#f8f6f0'; // background.0
const f1 = (v) => (Math.round(v * 10) / 10).toString();

// plocha motivu [x, y, w, h] pro každý formát; text vlevo / nahoře, pravý horní roh volný pro štítek rubriky
const PLOCHA = {
  homepage: [880, 300, 540, 840],
  og: [905, 95, 250, 470], // OG: text a logo ve středním čtverci x 320–880, motiv vpravo za ním
  square: [560, 330, 440, 680],
  instagram: [560, 560, 440, 700],
  story: [140, 960, 800, 760],
};
const ROZ = { homepage: [1500, 1200], og: [1200, 630], square: [1080, 1080], instagram: [1080, 1350], story: [1080, 1920] };

function sankey(klic) {
  const [x, y, w, h] = PLOCHA[klic];
  const T = D.t.filter(([a, b]) => !(a === 'Nevoliči' && b === 'Nevoliči')); // obří „nevoliči zůstali“ by motiv přehlušil
  const tl = {}, tr = {};
  for (const [a, b, v] of T) { tl[a] = (tl[a] || 0) + v; tr[b] = (tr[b] || 0) + v; }
  const Ln = D.L.filter((n) => tl[n]), Rn = D.R.filter((n) => tr[n]);
  const sum = Object.values(tl).reduce((s, v) => s + v, 0);
  const gap = h * 0.018, nw = Math.max(6, w * 0.016), k = (h - gap * (Math.max(Ln.length, Rn.length) - 1)) / sum;
  const pos = (ns, tot) => { const o = {}; let c = y; for (const n of ns) { o[n] = c; c += Math.max(tot[n] * k, 2) + gap; } return o; };
  const yl = pos(Ln, tl), yr = pos(Rn, tr), oL = { ...yl }, oR = { ...yr };
  const x0 = x + w * 0.2, x1 = x + w * 0.8 - nw, cx = (x0 + nw + x1) / 2, fs = Math.max(15, h * 0.03);
  let defs = '', cesty = '', i = 0;
  for (const s of Ln) for (const t of Rn) for (const [a, b, v] of T) {
    if (a !== s || b !== t) continue;
    const hh = v * k, a0 = oL[s], b0 = oR[t]; oL[s] += hh; oR[t] += hh;
    const kAno = t === 'ANO';
    const id = `g${klic}${i++}`;
    if (kAno) defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(x0 + nw)}" y1="0" x2="${f1(x1)}" y2="0"><stop offset="0" stop-color="${s === 'ANO' ? AKCENT : D.barvy[s]}"/><stop offset="1" stop-color="${AKCENT}"/></linearGradient>`;
    cesty += `<path d="M${f1(x0 + nw)},${f1(a0)} C${f1(cx)},${f1(a0)} ${f1(cx)},${f1(b0)} ${f1(x1)},${f1(b0)} L${f1(x1)},${f1(b0 + hh)} C${f1(cx)},${f1(b0 + hh)} ${f1(cx)},${f1(a0 + hh)} ${f1(x0 + nw)},${f1(a0 + hh)} Z" `
      + (kAno ? `fill="url(#${id})" fill-opacity="${s === 'ANO' ? 0.55 : 0.9}"` : `fill="${PAPIR}" fill-opacity="0.09"`) + '/>';
  }
  const txt = (tx, ty, s, a, op = 0.92) => `<text x="${f1(tx)}" y="${f1(ty)}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="600" font-size="${f1(fs)}" fill="${PAPIR}" fill-opacity="${op}" text-anchor="${a}" dominant-baseline="middle">${s}</text>`;
  let uzly = '';
  const POPIS_L = new Set(['ANO', 'Nevoliči', 'SPD', 'SOCDEM', 'KSČM']);
  for (const n of Ln) {
    const hh = Math.max(tl[n] * k, 2), barva = n === 'ANO' ? AKCENT : n === 'Nevoliči' || n === 'Ostatní' ? '#8f9dc9' : D.barvy[n];
    uzly += `<rect x="${f1(x0)}" y="${f1(yl[n])}" width="${f1(nw)}" height="${f1(hh)}" fill="${barva}"/>`;
    if (klic !== 'og' && POPIS_L.has(n) && hh > fs * 0.9) uzly += txt(x0 - fs * 0.5, yl[n] + hh / 2, n === 'Nevoliči' ? 'nevoliči' : n, 'end', n === 'ANO' || n === 'Nevoliči' || n === 'SPD' ? 0.92 : 0.7);
  }
  for (const n of Rn) {
    const hh = Math.max(tr[n] * k, 2), barva = n === 'ANO' ? AKCENT : n === 'Nevoliči' || n === 'Ostatní' ? '#8f9dc9' : D.barvy[n];
    uzly += `<rect x="${f1(x1)}" y="${f1(yr[n])}" width="${f1(nw)}" height="${f1(hh)}" fill="${barva}" fill-opacity="${n === 'ANO' ? 1 : 0.55}"/>`;
    if (n === 'ANO') uzly += `<text x="${f1(x1 + nw + fs * 0.5)}" y="${f1(yr[n] + hh / 2)}" font-family="IBM Plex Serif, Georgia, serif" font-weight="700" font-size="${f1(fs * 1.6)}" fill="${PAPIR}" dominant-baseline="middle">ANO</text>`;
  }
  uzly += txt(x0 + nw, y - fs * 1.1, '2021', 'end', 0.6) + txt(x1, y - fs * 1.1, '2025', 'start', 0.6);
  const [W, H] = ROZ[klic];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${cesty}${uzly}</svg>`;
}

module.exports = {
  vystup: require('path').join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Přesuny voličů' },
  legenda: [[AKCENT, 'přešli k ANO'], ['#5c6082', 'ostatní přesuny']],
  legendaPodTextem: true,
  logo: 'vlevo',
  og: 'siroky', // OG: text vlevo, motiv (svg.og) vpravo
  // brand.9 / brandNavy.7 záře jako u volebních coverů, brandNavy.1 nadtitulek, brandRoyalBlue.2 podtitulek
  barvy: { glowA: '#8b0e2b', glowB: '#4c4f8e', kick: '#d2d8e9', sub: '#a9b5f0', stitek: '#de1743' },
  motiv: { typ: 'svg', svg: Object.fromEntries(Object.keys(PLOCHA).map((k) => [k, sankey(k)])) },
};
