// Generate the motif with motiv.cjs and the original article chart with carousel-chart.cjs first.
// Render with: node tools/carousel-generator.cjs <this file>.
// API keys follow the shared generator's existing Czech names; slide copy is Czech.
const fs = require('fs');
const path = require('path');
const originalCover = require('./cover.config.cjs');
const fees = require('../data/poplatky.json');
const timeline = require('js-yaml').load(fs.readFileSync(path.join(__dirname, '..', 'timeline.yaml'), 'utf8'));
const article = path.join(__dirname, '..');
const cover = { ...originalCover, pro: {} };
const source = dates => 'Zdroj: ' + dates.map(date => {
  const event = timeline.events.find(event => event.date === date);
  if (!event) throw new Error(`Timeline event missing: ${date}`);
  return event.linkText;
}).join('; ');
const paragraph = text => `<p class="velke">${text}</p>`;
const note = text => `<p class="male">${text}</p>`;
const block = (year, text) => `<p class="popis">${year}</p>${paragraph(text)}`;
const chart = fs.readFileSync(path.join(article, 'social', 'grafy', 'poplatky.png')).toString('base64');

// Exact statutory amounts and planned fee revenue, reproduced by _data_pipeline/verify_facts.py.
// Bill 231/0: https://www.psp.cz/sqw/text/orig2.sqw?idd=277414
const funding = { CT: 5741826000, CRO: 2065766000 };
const plannedFees = { CT: 6730000000, CRO: 2476200000 };
const total = funding.CT + funding.CRO;
const reduction = 100 * (1 - total / (plannedFees.CT + plannedFees.CRO));
const billions = (value, digits) => (value / 1e9).toLocaleString('cs-CZ', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const plateau = fees.data.values.filter(row => row.s === 'televizní' && row.od === '2008-01-01');
if (plateau.length !== 2 || plateau.some(row => row.v !== 135) || plateau[1].d !== '2025-05-01') throw new Error('TV fee plateau differs from the article');
if (Math.round(reduction) !== 15) throw new Error('Funding comparison differs from the article');

module.exports = {
  vystup: path.join(article, 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Kolik let se nezměnil<br>televizní poplatek<br>135 korun?', pod: 'Tipněte si.<br>Odpověď je na dalším slidu.', format: { instagram: { t: 76, sub: 34 } } },
      svg: fs.readFileSync(path.join(__dirname, 'motiv-instagram.svg'), 'utf8'),
    },
    {
      titulek: fees.title.text,
      pod: 'Měsíčně za domácnost, nominálně v korunách<br>(do roku 1992 Kčs). Stav k 3. 11. 2026.',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><image x="70" y="570" width="940" height="550" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${chart}"/></svg>`,
      obsahOd: 1140,
      html: note('135 Kč platilo od ledna 2008 do dubna 2025 — více než 17 let.'),
      zdroj: `Zdroj: ${fees._source}`,
    },
    {
      titulek: 'Klausova vláda platby z rozpočtu odmítla. Senátor ODS je navrhl.',
      obsahOd: 570,
      html: block('1994 · Klausova vláda', 'Financování ze státního rozpočtu odmítla jako rozporné s nezávislostí médií na státu.')
        + block('2009 · senátor ODS Richard Svoboda', 'Navrhl zrušení poplatků a financování z daní. Návrh ze Senátu do Sněmovny nepostoupil.'),
      zdroj: source(['1994-12-08', '2009-11-05']),
    },
    {
      titulek: 'V roce 2017 chtěli poplatky zrušit Piráti i Okamura',
      obsahOd: 530,
      html: block('Piráti · volební program', 'Příjem ČT a ČRo chtěli nahradit pevným podílem na výběru DPH.')
        + block('Tomio Okamura · SPD', 'Z ČT a ČRo chtěl udělat státní příspěvkové organizace.')
        + note('Stejný záměr zrušit poplatky, odlišný návrh financování.'),
      zdroj: source(['2017', '2017-10-25']),
    },
    {
      titulek: 'Babišova vláda slibovala zachování, Motoristé odmítali financování z rozpočtu',
      velikost: 60,
      obsahOd: 570,
      html: block('2018 · vláda ANO a ČSSD', '„Zachováme stávající úpravu postavení veřejnoprávních médií.“')
        + block('2025 · volební program Motoristů', '„Nechceme, aby veřejnoprávní média byla financována přímo ze státního rozpočtu – tím by se stala vládními.“'),
      zdroj: 'Zdroj: programové prohlášení vlády 2018; volební program Motoristů 2025, s. 36',
    },
    {
      titulek: 'Vládní návrh na zrušení už prošel prvním čtením',
      obsahOd: 530,
      html: block('15. června 2026', 'Babišova vláda schválila návrh ministra Oty Klempíře za Motoristy: poplatky má od roku 2027 nahradit státní příspěvek.')
        + block('24. října 2026 · po nočním jednání', 'Sněmovna návrh poslala do výboru. Zákon ještě není schválený; poplatky se dál platí.'),
      zdroj: source(['2026-06-15', '2026-10-24']),
    },
    {
      titulek: 'Návrh: 7,8 miliardy, asi o 15 % méně než plánované poplatky',
      obsahOd: 520,
      html: `<div class="cislo">${billions(total, 1)} mld.</div><p class="popis">státní příspěvek pro obě média v roce 2027</p>`
        + paragraph(`<strong>ČT ${billions(funding.CT, 2)} mld. Kč</strong><br><strong>ČRo ${billions(funding.CRO, 3)} mld. Kč</strong>`)
        + paragraph('Asi o 1,4 miliardy méně než plánované příjmy z poplatků v roce 2026.')
        + note('Srovnáváme příjmy z poplatků, nikoli celé rozpočty. Výši příspěvku a jeho valorizaci stanoví návrh zákona.'),
      zdroj: 'Zdroj: sněmovní tisk 231/0; rozpočty ČT a ČRo na rok 2026',
    },
    {
      titulek: 'Porovnali jsme návrhy, hlasování i volební sliby',
      obsahOd: 520,
      html: paragraph('Prošli jsme sněmovní tisky, hlasování, programy stran a vlád i dobové zpravodajství od roku 1991.')
        + paragraph('Graf ukazuje nominální poplatky: nezohledňuje inflaci.')
        + note('Starší veřejně ohlášené záměry, které se nestaly návrhem zákona, mohou v přehledu chybět. Zdroje najdete přímo v článku.'),
    },
    {
      titulek: 'Co podle vás lépe chrání nezávislost ČT a rozhlasu?',
      obsahOd: 520,
      html: paragraph('Poplatky, nebo zákonem stanovený příspěvek ze státního rozpočtu?')
        + paragraph('Napište nám do komentářů, proč.')
        + note('Celý článek najdete na DataTimes.cz.<br>Odkaz je v biu.'),
    },
  ],
};
