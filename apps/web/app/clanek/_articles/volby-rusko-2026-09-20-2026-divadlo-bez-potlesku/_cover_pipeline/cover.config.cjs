// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// Přepracováno 26. 10. 2026 podle tools/COVER-VIZUALNI-IDENTITA.md (dávka 2 volby v zahraničí).
// Motiv: fotka Putina při elektronickém hlasování v Kremlu (v článku s popiskem) a původní texty coveru: titulek
// „Divadlo bez potlesku“ a podtitulek v pruhu; barvy prohozené s CDU – červená k Putinovi (Kateřina 26. 10.).
// Kompozice (Kateřina 26. 10.): titulek s pruhem na úrovni hrudníku vlevo od Putina, nikdy přes hlavu.
// Putinův obličej leží ve fotce na (0,62 šířky, 0,39 výšky); FOTO[k].bod = [cílové X, Y obličeje, šířka fotky].
const path = require('path');
const { vrstva, podkres } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const PUTIN = path.join(__dirname, '..', 'images', 'putin-voting-2026.webp');
const POMER = 580 / 940;
const FOTO = {
  homepage: { bod: [1130, 360, 1750], plocha: [0, 0, 1500, 1010] },
  square: { bod: [800, 300, 1300], plocha: [0, 0, 1080, 860] },
  instagram: { bod: [790, 360, 1550], plocha: [0, 0, 1080, 1100] },
  story: { bod: [620, 600, 2500], plocha: [0, 0, 1080, 1180] }, // fotka nahoře, text a logo pod ní
  og: { bod: [960, 250, 1000], plocha: [0, 0, 1200, 630] },
};

module.exports = {
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Analýza', dal: 'Volby v&nbsp;Rusku 2026' },
  titulek: 'Divadlo<br>bez potlesku',
  pod: 'Proč Kreml potřebuje volby,<br>jejichž výsledek si sám nadiktoval',
  podPruh: '#de1743', // brand.6
  // text níž – titulek v úrovni Putinova hrudníku (homepage, čtverec, 4:5); ve story pod fotkou
  // (Kateřina 26. 10. večer): štítek těsně na horní hraně monitoru (na podkladu kvůli světlé stěně), titulek přes
  // monitor a kus vlajky, podtitulek pod ním; story beze změny (text pod fotkou)
  format: { homepage: { box: [180, 170, 1320, 1080] }, square: { box: [70, 150, 1010, 1010] }, instagram: { box: [70, 220, 1010, 1240] }, story: { box: [80, 1180, 1000, 1800] } },
  kickPodklad: '#101432e6',
  // dvojnásobná mezera mezi titulkem a podtitulkem v pruhu (Kateřina 26. 10.)
  mezery: { homepage: [, , 60], square: [, , 53], instagram: [, , 55], story: [, , 62] },
  logo: 'vlevo',
  barvy: { glowA: '#7d1810', glowB: '#24150b', kick: '#ffcec6', sub: '#d2d8e9', stitek: '#de1743', titulek: '#ff8099' }, // titulek brand.2
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k) => {
      const { bod: [X, Y, sirka], plocha } = FOTO[k];
      return podkres(PUTIN, plocha, { sytost: 0.45, jas: 0.6, id: `pk${k}`, vlevo: 0.12, nahore: 0.06, dole: 0.25, bod: { fx: 0.62, fy: 0.39, X, Y, sirka, pomer: POMER } });
    }),
  },
};
