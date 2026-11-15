// Sada coverů kapitoly Svoboda (speciál Jací jsme byli, jací jsme – 1989 × 2026).
// node motiv.cjs, pak z kořene repa: PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Titulek a podtitulek bere generátor z frontmatteru článku (coverTitulek, coverPodtitulek).
// Motiv (motiv.cjs): 2 × 100 postav, 2019 a 2024, svoboda projevu lepší / horší / stejná než před rokem 1989
// (CVVM tab. 4, _data_pipeline/vystup.txt). Legenda: položky v jednom řádku (puntíky jako inline <i> ve stylu .leg i),
// „stejná / neví“ jako prázdný kroužek stejně jako prázdné postavy v motivu.
// Pozadí: trikolóra coveru speciálu (specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_cover_pipeline/cover.config.cjs).
const path = require('path');
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
const tecka = (styl, text) => `<i style="${styl};margin:0 .35em 0 0"></i>${text}`;
const POLOZKY = [tecka('background:#6267a3', 'lepší'), tecka('background:#de1743', 'horší'),
  tecka('background:transparent;box-shadow:inset 0 0 0 3px #4c4f8e', 'stejná / neví (CVVM)')].join('&emsp;');
const POD3 = 'Za lepší než před rokem 1989 ji má 57 % lidí,<br>v roce 2019 to bylo 74 %.<br>Za horší ji má 21 %, dvakrát víc než tehdy';
const LEGENDA = (zlom) => [[null, `1 postava = 1 % lidí, svoboda projevu${zlom}proti době před rokem 1989:`], [null, POLOZKY]];
const LEGENDA2 = [[null, '1 postava = 1 % lidí,<br>svoboda projevu proti době<br>před rokem 1989:'], [null, POLOZKY.replace(/&emsp;(?=<i[^>]*transparent)/, '<br>')]];
module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: '1989 × 2026', dal: 'Svoboda' },
  barvy: { glowA: '#8b0e2b', glowPosA: '-19% 62%', glowB: '#272a59', glowPosB: '119% 38%', glowDosah: 62, kick: '#f8f6f0', kickCervena: '#ff8099', sub: '#d2d8e9', stitek: '#de1743' },
  logo: 'vlevo',
  og: 'siroky',
  ogScrim: false,
  legenda: LEGENDA('<br>'),
  rozlozeni: {
    // homepage: text a legenda ve sloupci vlevo, obě skupiny postav pod sebou vpravo (motiv přes celou výšku)
    homepage: [
      { prvky: ['kicker', 'titulek', 'pod'], x: 180, y: 120 },
      { prvky: ['legenda'], x: 180, y: 975, dole: true },
      { prvky: ['logo'], x: 180, y: 1080, dole: true },
    ],
    // čtverec: stejně jako homepage, postavy pod sebou vpravo (vedle sebe pod textem by byly malé)
    square: [
      { prvky: ['kicker', 'titulek', 'pod'], x: 70, y: 70 },
      { prvky: ['legenda'], x: 70, y: 920, dole: true },
      { prvky: ['logo'], x: 70, y: 1010, dole: true },
    ],
    // OG: logo vpravo nahoře, ať dole nezakryje karmínové řady „horší“
    og: [
      { prvky: ['kicker', 'titulek'], x: 320, y: 48 },
      { prvky: ['logo'], x: 880, y: 48, vpravo: true },
    ],
  },
  format: { homepage: { t: 80 }, og: { t: 40, sub: 18 }, square: { t: 58 }, story: { t: 84 } },
  mezery: { homepage: [36, 64, 28] },
  // podtitulek zalomený ručně po větách (automatické zalomení nechávalo „74 %.“ samotné na řádku)
  pro: {
    homepage: { pod: 'Za lepší než před rokem 1989 ji má<br>57 % lidí, v roce 2019 to bylo 74 %.<br>Za horší ji má 21 %, dvakrát víc<br>než tehdy' },
    square: { pod: 'Za lepší než před rokem<br>1989 ji má 57 % lidí,<br>v roce 2019 to bylo 74 %.<br>Za horší ji má 21 %,<br>dvakrát víc než tehdy', legenda: LEGENDA2 },
    instagram: { pod: POD3 },
    story: { pod: POD3 },
  },
  motiv: { typ: 'svg', opacityOg: 1, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
