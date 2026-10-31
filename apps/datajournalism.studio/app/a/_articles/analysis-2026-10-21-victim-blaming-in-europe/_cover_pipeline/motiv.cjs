// Vrstva motivu coveru binga: fotka dlaně pod tmavě modrým závojem + slovo STOP, kde dlaň nahrazuje „O“.
// Vyrobí SVG pro každý formát (motiv/<formát>.svg) pro tools/cover-generator.cjs (motiv.typ 'svg').
// node motiv.cjs  (PW_PATH = balíček playwright)
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const NAVY = '#101432';           // brandNavy.9
const CRIMSON = '#de1743';        // brand.6 – písmena STOP
const SRC = path.join(__dirname, 'src.webp'); // 612×408
// Dlaň ve zdroji (px): dlaň bez prstů, špička palce, vrchol prstů
const DLAN = { x0: 85, x1: 250, y0: 175, y1: 345, palec: 338, prsty: 50 };
const CAP = 0.698;
let POSUN = 0; // homepage: (účaří dlaně − účaří písmen) / velikost písma
const OSA = fs.existsSync(path.join(__dirname, 'osa.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'osa.json'), 'utf8')) : {};                // výška verzálky IBM Plex Serif Bold (em)
// formát: šířka slova, střed slova x, účaří y, rozměry plátna
const F = {
  homepage: { w: 1500, h: 1200, sirka: 1140, cx: 750, base: 965 },
  og:       { w: 1200, h: 630,  sirka: 600,  cx: 600, base: 598 },
  square:   { w: 1080, h: 1080, sirka: 940,  cx: 540, base: 905 },
  instagram:{ w: 1080, h: 1350, sirka: 940,  cx: 540, base: 1135 },
  story:    { w: 1080, h: 1920, sirka: 920,  cx: 540, base: 1460 },
};
(async () => {
  const b = await chromium.launch({ channel: 'msedge' });
  const p = await b.newPage();
  await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@700&display=swap" rel="stylesheet"><span id=a style="font:700 1000px 'IBM Plex Serif';white-space:pre">ST</span><span id=c style="font:700 1000px 'IBM Plex Serif'">P</span>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const m = await p.evaluate(() => ({ st: document.getElementById('a').getBoundingClientRect().width / 1000, p: document.getElementById('c').getBoundingClientRect().width / 1000 }));
  await b.close();
  const img = `data:image/webp;base64,${fs.readFileSync(SRC).toString('base64')}`;
  for (const [k, f] of Object.entries(F)) {
    // s = měřítko fotky tak, aby výška dlaně = výška verzálky a celé slovo mělo šířku f.sirka
    const mezera = 0.05; // mezera mezi písmenem a dlaní (em)
    const s = f.sirka / ((DLAN.y1 - DLAN.y0) / CAP * (m.st + m.p + mezera - 0.16) + (DLAN.palec - DLAN.x0));
    // Osa (Kateřina 25. 10.): písmena S, T, P se centrují svisle na střed mezi spodní okraj podtitulku a horní
    // okraj kolečka loga (osa.json z zmer.cjs). Na homepage zůstává dlaň na místě (f.base); ostatní formáty
    // přebírají z homepage stejný poměr: o kolik výš než dlaň leží písmena (v násobcích velikosti písma).
    const O = OSA[k];
    const fs_ = (DLAN.y1 - DLAN.y0) * s / CAP;
    const x0 = f.cx - f.sirka / 2;
    const dlanX = x0 + (m.st + mezera) * fs_;            // levý okraj dlaně
    const basePismen = O && O.subBot ? Math.round(O.osa + CAP * fs_ / 2) : f.base;
    if (k === 'homepage') POSUN = (f.base - basePismen) / fs_;
    else if (O && O.subBot) { f.base = Math.round(basePismen + POSUN * fs_); }
    const pX = dlanX - DLAN.x0 * s + DLAN.palec * s - 0.16 * fs_;     // P zůstává, kde bylo
    // Dlaň samotná posunutá doleva (Kateřina 25. 10.), aby ukazováček nezasahoval do P; poměrově ve všech formátech
    const POSUN_DLANE = 0.24 * fs_;
    const ix = dlanX - DLAN.x0 * s - POSUN_DLANE, iy = f.base - DLAN.y1 * s;
    const W = 612 * s, H = 408 * s, cx = ix + (DLAN.x0 + DLAN.x1) / 2 * s, cy = iy + (DLAN.y0 + DLAN.y1) / 2 * s;
    // Vše, co patří k fotce, se kreslí v souřadnicích zdroje (612×408) uvnitř skupiny s posunem a měřítkem.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}" viewBox="0 0 ${f.w} ${f.h}">
<defs>
 <filter id="pero-${k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="44 16"/></filter>
 <!-- fotka: vyšší kontrast a teplejší, do červena laděný tón (varovná funkce), bez propadu do černé -->
 <filter id="ruka-${k}" color-interpolation-filters="sRGB">
  <feComponentTransfer><feFuncR type="linear" slope="1.24" intercept="-0.06"/><feFuncG type="linear" slope="1.2" intercept="-0.09"/><feFuncB type="linear" slope="1.16" intercept="-0.09"/></feComponentTransfer>
  <feColorMatrix type="matrix" values="1.08 0.03 0 0 0  0.01 0.95 0 0 0  0 0 0.88 0 0  0 0 0 1 0"/>
  <feColorMatrix type="saturate" values="1.2"/>
 </filter>
 <radialGradient id="tvar-${k}" gradientUnits="userSpaceOnUse" cx="222" cy="112" r="120" gradientTransform="translate(222 112) scale(1 0.75) translate(-222 -112)">
  <stop offset="0" stop-color="#fff"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
 </radialGradient>
 <mask id="m-${k}" maskUnits="userSpaceOnUse" x="-612" y="-408" width="1836" height="1224"><rect x="66" y="16" width="448" height="314" fill="#fff" filter="url(#pero-${k})"/></mask>
 <mask id="obl-${k}" maskUnits="userSpaceOnUse" x="0" y="0" width="612" height="408"><rect width="612" height="408" fill="url(#tvar-${k})"/></mask>
 <linearGradient id="spodek-${k}" gradientUnits="userSpaceOnUse" x1="0" y1="330" x2="0" y2="392"><stop offset="0" stop-color="${NAVY}" stop-opacity="0"/><stop offset="1" stop-color="${NAVY}" stop-opacity="1"/></linearGradient>
 <linearGradient id="vrsek-${k}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="44"><stop offset="0" stop-color="${NAVY}" stop-opacity="1"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></linearGradient>
 <radialGradient id="zavoj-${k}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy - 40 * s}" r="${(DLAN.palec - DLAN.x0) * s * 1.3}">
  <stop offset="0" stop-color="${NAVY}" stop-opacity="0.08"/><stop offset="0.6" stop-color="${NAVY}" stop-opacity="0.38"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0.75"/>
 </radialGradient>
</defs>
<g transform="translate(${ix.toFixed(1)} ${iy.toFixed(1)}) scale(${s.toFixed(4)})">
 <g mask="url(#m-${k})">
  <image href="${img}" width="612" height="408" preserveAspectRatio="none"/>
  <rect width="612" height="408" fill="${NAVY}" opacity="0.38" mask="url(#obl-${k})"/>
  <rect y="320" width="612" height="88" fill="url(#spodek-${k})"/>
  <rect width="612" height="44" fill="url(#vrsek-${k})"/>
 </g>
</g>
<rect width="${f.w}" height="${f.h}" fill="url(#zavoj-${k})"/>
<g font-family="IBM Plex Serif, Georgia, serif" font-weight="700" font-size="${fs_.toFixed(1)}" fill="${CRIMSON}" style="text-shadow:0 4px 24px rgba(16,20,50,.55)">
 <text x="${dlanX - mezera * fs_}" y="${basePismen}" text-anchor="end">ST</text>
 <text x="${pX}" y="${basePismen}">P</text>
</g></svg>`;
    fs.writeFileSync(path.join(__dirname, 'motiv', `${k}.svg`), svg);
    console.log(k, 's=', s.toFixed(2), 'písmo', fs_.toFixed(0), 'prsty nahoře y=', Math.round(iy + DLAN.prsty * s));
  }
})();
