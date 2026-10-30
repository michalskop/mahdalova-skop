// Sada coverů – PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <tento soubor>
// 26. 10. 2026 (Kateřina): návrat k původnímu coveru – fotka Merze u pultu CDU, původní texty, titulek v pruhu –
// převedený do sady pěti formátů. Fotka: podklad-merz-cdu.jpg = zdroj původního coveru
// (Desktop/Mahdalova & Skop/Volby/Německo 2026/merz-debakel-meklenburg-datatimes-2026.webp), bez zapečených textů.
// Barvy: žlutý pruh titulku (brandYellow.8) na čistém ink blue bez záře – žlutá k Merzovi, červená k Putinovi (Kateřina 26. 10.).
// Kompozice: text vlevo rozvolněný do výšky, Merz vpravo celý (hlava nikdy pod textem). Merzův obličej leží ve fotce
// na (0,56 šířky, 0,13 výšky); FOTO[k].bod = [cílové X, Y obličeje, šířka fotky], plocha = ořez.
const path = require('path');
const { vrstva, podkres } = require(path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'tools', 'cover-tecky.cjs'));

const MERZ = path.join(__dirname, 'podklad-merz-cdu.jpg');
const POMER = 1080 / 1643;
const FOTO = {
  homepage: { bod: [1150, 400, 1700], plocha: [720, 0, 780, 1200] },
  square: { bod: [850, 520, 1250], plocha: [560, 0, 520, 1080] },
  instagram: { bod: [850, 640, 1350], plocha: [560, 0, 520, 1350] },
  story: { bod: [700, 980, 1600], plocha: [0, 0, 1080, 1480] }, // fotka hned pod textem, končí nad logem
  og: { bod: [745, 67, 790], plocha: [520, 0, 575, 525] }, // Merz v pravé části středního čtverce, text smí na rameno, ne na obličej
};

module.exports = {
  logoText: 'DataTimes.org', // anglický web datajournalism.studio
  vystup: path.join(__dirname, '..', 'images'),
  kicker: { cervene: 'Elections', dal: 'in&nbsp;Germany', oddelovac: '' },
  nad: 'Clear after 45 minutes:<br>in&nbsp;Mecklenburg-Western Pomerania',
  titulek: 'CDU out of<br>the state<br>parliament',
  titulekPruh: '#bd9103', // brandYellow.8
  pod: 'The DataTimes.cz model caught the debacle<br>right at the start of the count',
  rozestup: { homepage: 2, square: 1.4, instagram: 2.2, story: 1 }, // text rovnoměrně do výšky levé strany
  logo: 'vlevo',
  // OG naležato (Kateřina 26. 10.): štítek, nadtitulek a dvouřádkový titulek se stejnými mezerami, podtitulek
  // uprostřed mezi titulkem a logem; Merz vpravo za středním čtvercem
  og: 'siroky', ogScrim: false,
  format: { og: { t: 42, box: [285, 48, 915, 548] }, story: { t: 84 } },
  // story (Kateřina 26. 10.): titulek na dva řádky menším písmem, Merz se tím posune výš
  pro: { og: { titulek: 'CDU out of<br>the state parliament' }, story: { titulek: 'CDU out of<br>the state parliament' } },
  mezery: { og: [28, 28, 28] },
  // čisté ink blue pozadí bez záře (Kateřina 26. 10.): žlutá je v pruhu titulku, záře by jen zhoršila čitelnost štítku
  barvy: { glowA: '#101432', glowB: '#101432', kick: '#f8f6f0', sub: '#f8f6f0', stitek: '#de1743' },
  motiv: {
    typ: 'svg', opacityOg: 1,
    svg: vrstva((k) => {
      const { bod: [X, Y, sirka], plocha: [px, , pw, ph] } = FOTO[k];
      // ořez začíná horní hranou fotky, aby tam šel měkký přechod (žádná tvrdá hrana nad hlavou)
      const horni = Y - 0.13 * sirka * POMER;
      const plocha = [px, horni, pw, ph - horni];
      return podkres(MERZ, plocha, { sytost: 0.9, jas: 0.8, id: `pk${k}`, vlevo: k === 'story' ? 0 : k === 'og' ? 0.1 : 0.3, vpravo: k === 'og' ? 0.12 : 0, nahore: k === 'og' ? 0 : 0.05, dole: k === 'og' ? 0.3 : 0.15, bod: { fx: 0.56, fy: 0.13, X, Y, sirka, pomer: POMER } });
    }),
  },
};
