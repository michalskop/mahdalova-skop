// Instagram carousel k článku o koalicích ANO ve velkých městech (tools/COVER-VIZUALNI-IDENTITA.md → kapitola 8).
// 1 tip (mapa z coveru) → 2 Sankey se zvýrazněným ANO (animovaná verze: animace.config.cjs, nahrát jako 2. položku
// místo 02.png) → 3 graf z článku → 4 Sankey ODS → 5 primátoři z ANO → 6 „0 z 23“ → 7 metoda → 8 výzva → poděkování (generátor).
// PW_PATH=<repo>/node_modules/playwright node grafy-z-clanku.cjs        (→ social/grafy/koalice.png)
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// Čísla v titulcích kontroluje proti sankey.json a _data_pipeline/vystup.txt (stejná čísla jako text článku).
const fs = require('fs');
const path = require('path');
const cover = require('./cover.config.cjs');
const { kresli, par, D } = require('./sankey.cjs');

const W = 1080, H = 1350;
const svg = (obsah) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${obsah}</svg>`;
const POPIS = '#ffe0c7';

// --- kontrola čísel proti datům článku ---
const vystup = fs.readFileSync(path.join(__dirname, '..', '_data_pipeline', 'vystup.txt'), 'utf8');
const chyba = (m) => { throw new Error(`carousel: ${m} nesedí s článkem`); };
if (D.koalic !== 23) chyba('počet koalic');
if (par('ANO', 'ODS') !== 5 || par('ANO', 'místní hnutí') !== 6 || par('ANO', 'STAN') !== 4 || par('ANO', 'KDU-ČSL') !== 4) chyba('partneři ANO');
if (par('ODS', 'STAN') !== 9 || par('ODS', 'KDU-ČSL') !== 9 || par('ODS', 'TOP 09') !== 9 || par('STAN', 'TOP 09') !== 10) chyba('opoziční dvojice');
if (!vystup.includes('ANO v koalici: 10:') || !vystup.includes('z toho se stranou opozice (ČSÚ složení kandidátek): 8:')) chyba('10 a 8 měst');
if (!vystup.includes('SPD, Motoristé nebo PRO v dohodnuté koalici: 0')) chyba('SPD, Motoristé, PRO');
if (!vystup.includes('zvoleno 8 z 27; z ANO 4; ANO v koalici 4; z toho s opozicí 4')) chyba('zvolení primátoři');

// graf z článku na béžové kartě (jako kartaGrafu u vyznamenání)
function kartaGrafu(soubor, top, spodek = 1215) {
  if (!fs.existsSync(soubor)) throw new Error(`chybí ${soubor} – spusť nejdřív grafy-z-clanku.cjs`);
  const png = fs.readFileSync(soubor);
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  const pad = 22, k = Math.min((940 - 2 * pad) / w, (spodek - top - 2 * pad) / h), iw = w * k, ih = h * k, x = (W - iw) / 2;
  return `<rect x="${(x - pad).toFixed(1)}" y="${top}" width="${(iw + 2 * pad).toFixed(1)}" height="${(ih + 2 * pad).toFixed(1)}" rx="16" fill="#f8f6f0"/>`
    + `<image x="${x.toFixed(1)}" y="${top + pad}" width="${iw.toFixed(1)}" height="${ih.toFixed(1)}" href="data:image/png;base64,${png.toString('base64')}"/>`;
}

const ZDROJ = 'Zdroj: ČSÚ, složení kandidátek KV 2026; koalice podle ČTK a regionálních médií ke 4. 11. 2026; výpočet DataTimes';
const POD_SANKEY = 'Kdo s kým vládne ve 23 dohodnutých koalicích ve 26 statutárních městech a v Praze. Šířka pruhu = počet společných koalic.';
const SANKEY_BOX = { x: 70, y: 470, w: 940, h: 760 };

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  obsahOd: 470,
  slidy: [
    {
      cover: { ...cover, titulek: 'Se kterou opoziční stranou vládne ANO ve&#160;městech nejčastěji?', pod: 'Tipněte si. Odpověď najdete na dalších slidech.', format: { instagram: { t: 70, sub: 34 } } },
    },
    {
      titulek: 'Nejčastěji s&#160;ODS, v&#160;pěti velkých městech',
      pod: `${POD_SANKEY} Zvýrazněné je ANO.`,
      svg: svg(kresli({ ...SANKEY_BOX, fokus: 'ANO', strana: 'L', sila: 1 })),
      zdroj: ZDROJ,
    },
    {
      titulek: 'ANO vládne v&#160;deseti městech, v&#160;osmi se sněmovní opozicí',
      pod: 'Mandáty v zastupitelstvech; plně kandidátky v koalici, světle ostatní',
      velikost: 54,
      svg: svg(kartaGrafu(path.join(__dirname, '..', 'social', 'grafy', 'koalice.png'), 400, 1235)),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Opoziční strany vládnou spolu častěji než s&#160;ANO',
      pod: `ODS je se STAN, s lidovci i s TOP 09 v devíti koalicích, s ANO v pěti. Zvýrazněná je ODS.`,
      svg: svg(kresli({ ...SANKEY_BOX, fokus: 'ODS', strana: 'L', sila: 1 })),
      zdroj: ZDROJ,
    },
    {
      titulek: 'Všichni čtyři noví primátoři z&#160;ANO vládnou se sněmovní opozicí',
      html: `<div class="bod"><b>●</b><div><strong>Přerov, Petr Vrána:</strong> s ODS a s lidovci. ANO a SPD by přitom měly většinu samy, 19 z 35.</div></div>
        <div class="bod"><b>●</b><div><strong>Plzeň, Roman Zarzycký:</strong> se STAN a s kandidátkou Pro Plzeň s podporou lidovců.</div></div>
        <div class="bod"><b>●</b><div><strong>Mladá Boleslav, Jiří Bouška:</strong> se STAN, s ODS s podporou TOP 09 a s místním Hlasem pro Boleslav.</div></div>
        <div class="bod"><b>●</b><div><strong>Teplice, Jiří Štábl:</strong> s Volbou pro Teplice, kterou tvoří KDU-ČSL, Zelení, Piráti a nezávislí.</div></div>`,
      zdroj: 'Zvoleni 2. a 3. 11. 2026 na ustavujících zasedáních. ' + ZDROJ.replace('Zdroj: ', 'Zdroj: '),
    },
    {
      titulek: 'Vládní partneři ANO na radnicích chybí',
      obsahOd: 520,
      html: `<div class="cislo">0 z&#160;23</div>
        <p class="popis">dohodnutých koalic ve velkých městech, ve kterých je SPD, Motoristé nebo PRO</p>
        <p class="velke" style="margin-top:1.2em">Ve Sněmovně vládne ANO se SPD a s Motoristy. Na radnicích 27 největších měst se s nimi nespojilo nikde.</p>`,
      zdroj: ZDROJ,
    },
    {
      titulek: 'Jak jsme počítali',
      obsahOd: 470,
      html: `<p class="velke">Prošli jsme koalice ve 26 statutárních městech a v Praze ke 4. listopadu podle zpráv ČTK, ČT24 a regionálních médií.</p>
        <p class="velke">Která strana je na které kandidátce, bereme z registru ČSÚ. Na radnicích ostatních obcí koalice nikdo souhrnně neeviduje a většina vedení teprve volí.</p>`,
    },
    {
      titulek: 'Kdo vládne ve vašem městě?',
      obsahOd: 470,
      html: `<p class="velke">Napište nám do komentářů, jestli vás koalice na vaší radnici překvapila.</p>
        <p class="velke">Primátory dalších měst zastupitelé zvolí v příštích dnech a týdnech.</p>
        <p class="velke" style="color:${POPIS}">Celý článek najdete na DataTimes.cz</p>`,
    },
  ],
};
