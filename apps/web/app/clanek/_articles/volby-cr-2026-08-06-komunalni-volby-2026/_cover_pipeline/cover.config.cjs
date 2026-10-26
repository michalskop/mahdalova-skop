// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 1 volby 2026).
// Rozcestník voleb: motiv karty speciálu Komunální a senátní volby 2026 (public/images/specials/volby-2026.svg) –
// tři rozmazaná světla v trikolóře z palety a kolečko loga DataTimes.cz v trikolóře (Kateřina 26. 10.).
// brand.6 #de1743 · background.2 #f8f6f0 · brandRoyalBlue.6 #4a51ab; modré světlo tmavší brandRoyalBlue.7 #383d82
// (Kateřina 26. 10.: světlá modrá se přelévala do bílé „jako vodovka“); světla rozestavená: červené vlevo nahoře,
// bílé vpravo nahoře, tmavě modré z pravého dolního rohu, ať se pod kolečkem nemíchají do fialova; pak celé rozložení
// světel i září pootočené o −90° a pak zpět o +15° a +20°, celkem −55° kolem středu (Kateřina 26. 10.): červená vlevo dole,
// bílá vlevo nad kolečkem, tmavě modrá vpravo nahoře – mimo světle modrý oblouk trikolóry
const path = require('path');
const { vrstva } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const CERVENA = '#de1743', BILA = '#f8f6f0', MODRA = '#4a51ab';

// kolečko loga ze speciálu (datatimes-donut.svg v trikolóře): poloměr 100 + tah 76 v rámu 500 × 500
const kolecko = (cx, cy, R) => `<defs><linearGradient id="fix" x1="1" x2="0.25" y1="0.5" y2="1"><stop offset="50%" stop-color="${MODRA}" stop-opacity="0"/><stop offset="50%" stop-color="${MODRA}" stop-opacity="1"/></linearGradient>
  <filter id="svetla" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><feGaussianBlur stdDeviation="${(R * 0.55).toFixed(0)}"/></filter></defs>
  <g filter="url(#svetla)">
    <circle cx="${cx - R * 1.11}" cy="${cy + R * 0.63}" r="${R * 1.1}" fill="${CERVENA}" opacity="0.5"/>
    <circle cx="${cx - R * 0.34}" cy="${cy - R * 1.34}" r="${R * 0.95}" fill="${BILA}" opacity="0.18"/>
    <circle cx="${cx + R * 1.92}" cy="${cy - R * 0.3}" r="${R * 1.45}" fill="#383d82" opacity="0.85"/>
  </g>
  <g transform="translate(${cx} ${cy}) scale(${(R / 138).toFixed(3)}) translate(-250 -250)">
    <g transform="rotate(-30 250 250)" fill="none" stroke-width="76" stroke-linecap="round">
      <path stroke="${MODRA}" d="M 250 350 A 100 100 0 0 0 336.6 300"/>
      <path stroke="${BILA}" d="M 336.6 300 A 100 100 0 0 0 250 150"/>
      <path stroke="${CERVENA}" d="M 250 150 A 100 100 0 0 0 250 350"/>
      <path stroke="url(#fix)" d="M 250 350 A 100 100 0 0 0 336.6 300"/>
    </g>
  </g>`;

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Volby do obecních zastupitelstev' },
  titulek: 'Komunální<br>volby 2026',
  pod: 'Po čtyřech letech se 9. a&nbsp;10. října volí<br>zastupitelstva všech obcí.<br>Vše podstatné na jednom místě',
  logo: 'vlevo',
  // záře v tónech trikolóry (brand.9 vlevo nahoře, brandRoyalBlue.7 vpravo dole) – navazují na světla motivu
  // i v bocích OG; světlejší červená štítku (brand.2), karmínová na trikolóře zaniká
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 1, svg: vrstva((k, [cx, cy, R]) => kolecko(cx, cy, R * 0.92)) },
};
