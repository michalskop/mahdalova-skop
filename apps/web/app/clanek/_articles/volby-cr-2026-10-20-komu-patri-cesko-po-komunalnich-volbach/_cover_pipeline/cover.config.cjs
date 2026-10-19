// Sada coverů – python body.py, node motiv.cjs, pak PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Motiv (motiv.cjs): bublinová mapa obcí přes nenápadný modrý stín republiky. Každá obec = kolečko, plocha ∝ počet
// obyvatel; barva podle toho, kdo má v zastupitelstvu většinu křesel: nezávislí (brandNavy.4) × strany a hnutí
// (brandYellow.6). Tisíce drobných teček nezávislých proti pár velkým žlutým městům = titulek článku.
const path = require('path');

const NK = '#8f9dc9'; // brandNavy.4
const STRANY = '#ffcf02'; // brandYellow.6
const SVETLA = '#d2d8e9'; // brandNavy.1
const soubor = (k) => path.join(__dirname, `motiv-${k}.svg`);
// velikostní legenda: malé a velké prázdné kolečko na místě barevné tečky (tečka řádku se skryje)
const velikost = `velikost = počet obyvatel<svg width="1.5em" height="0.9em" viewBox="0 0 30 18" style="vertical-align:-0.12em;margin-left:.35em"><circle cx="5" cy="12" r="3.5" fill="none" stroke="${SVETLA}" stroke-width="2"/><circle cx="20" cy="9" r="8" fill="none" stroke="${SVETLA}" stroke-width="2"/></svg>`;

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Explainer', dal: 'Komunální volby 2026' },
  titulek: 'Nepoměr<br>na radnicích', // Kateřina 19. 10.; dva řádky ve všech formátech
  pod: 'Valnou většinu křesel obsadili nezávislí,<br>fakticky ale zastupují jen třetinu lidí', // jedno souvětí (Kateřina 19. 10.), zalomené za čárkou, jinak zůstává „lidí“ samo
  legenda: [[NK, 'nezávislí'], [STRANY, 'strany a hnutí'], ['transparent;display:none', velikost]], // Kateřina 19. 10.
  logo: 'vlevo', // mapa ČR: volněji vlevo dole pod Šumavou, legenda vpravo
  // brandYellow.8 / brandNavy.7 záře, brandYellow.2 / brandNavy.1 texty, brand.6 štítek
  barvy: { glowA: '#bd9103', glowB: '#4c4f8e', kick: '#fff0b3', sub: SVETLA, stitek: '#de1743' },
  motiv: { typ: 'svg', opacityOg: 0.35, soubory: Object.fromEntries(['homepage', 'og', 'square', 'instagram', 'story'].map((k) => [k, soubor(k)])) },
};
