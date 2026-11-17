// Cover speciálu „Jací jsme byli, jací jsme – 1989 × 2026“ (NÁVRH ke schválení Kateřinou).
// node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor> --vystup <složka>
// Motiv (v2): Československo 1989, každé město s doloženou demonstrací listopad–prosinec 1989 = stejný svítící bod;
// prstence = Letná a náměstí SNP. Velikost podle účasti opuštěna (Praha by přebila regiony).
// Trikolóra jako u rozcestníku voleb (volby-cr-2026-08-06-komunalni-volby-2026): záře brand.9 × brandRoyalBlue.8,
// světlejší karmínová štítku (brand.2), karmínová na trikolóře zaniká.
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
// Letopočty 1989 a 2026 jako v hlavičce rozcestníku (Kateřina 17. 11. 2026: „hlavně tam mají být ty letopočty“):
// 1989 světle modrofialová #899aeb (jako hero), 2026 bílá s karmínovou linkou brand.6 #de1743. Jdou do prvku „nad“,
// takže je kontrola kompozice hlídá jako text. pod sebou = homepage (vpravo nad legendou), v řádku = ostatní formáty.
const roky = (px, podSebou) => `<span style="display:inline-flex;${podSebou ? 'flex-direction:column;align-items:flex-end;gap:.06em' : 'gap:.4em'};font-size:${px}px;line-height:1;font-weight:700;letter-spacing:-.01em;font-variant-numeric:tabular-nums"><span style="color:#899aeb">1989</span><span style="color:#ffffff;border-bottom:.08em solid #de1743;padding-bottom:.03em">2026</span></span>`;

module.exports = {
  vystup: path.join(__dirname, 'nahled'),
  kicker: { cervene: 'Speciál', dal: '37 let od 17. listopadu 1989' },
  titulek: 'Jací jsme byli,<br>jací jsme',
  nad: roky(64),
  pod: 'Česko tehdy a dnes ve 13 kapitolách:<br>od rodiny a zdraví po svobodu',
  legenda: [['#de1743', 'demonstrace a shromáždění listopad–prosinec<br>1989 (podle dobových pramenů)']],
  logo: 'vpravo',
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  og: 'siroky', ogScrim: false,
  rozlozeni: {
    homepage: [{ prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 124 }, { prvky: ['nad', 'legenda'], x: 1318, y: 300, vpravo: true }, { prvky: ['logo'], x: 180, y: 1078, dole: true }],
    og: [{ prvky: ['kicker', 'titulek'], x: 320, y: 52 }, { prvky: ['nad'], x: 320, y: 580, dole: true }, { prvky: ['logo'], x: 880, y: 580, vpravo: true, dole: true }],
  },
  format: { og: { t: 52 } },
  pro: { homepage: { nad: roky(136, true) }, og: { nad: roky(58) }, square: { nad: roky(100) }, instagram: { nad: roky(108) }, story: { nad: roky(116) } },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
