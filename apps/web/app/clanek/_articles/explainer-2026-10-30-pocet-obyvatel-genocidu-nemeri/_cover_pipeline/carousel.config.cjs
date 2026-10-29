// Instagram carousel k explaineru (tools/COVER-VIZUALNI-IDENTITA.md, kapitola 8 a 8.1): 8 slidů 1080×1350.
// 1 tip (otázka) → 2 definice z Úmluvy → 3 křivky obyvatel → 4 podíl zavražděných → 5 Gaza projekce × odhad PCBS
// → 6 porody × zabití → 7 jak jsme to počítali a co data neříkají → 8 výzva do komentářů.
// Titulky slidů = titulky grafů a mezititulky v článku, čísla přesně podle článku.
// Data: křivky z krivky.json (krivky_export.py ← _data_pipeline/krivky.py), sloupce a Gaza z ../data/*.json
// (stejné soubory, které kreslí grafy v článku). Nic se nepřepisuje ručně.
// PW_PATH=<repo>/node_modules/playwright node tools/carousel-generator.cjs <tento soubor> [čísla slidů]
// → social/carousel/01.png … 08.png, social/carousel-arch.png; text pod carousel v carousel-caption.txt
const path = require('path');
const { graf } = require('./motiv.cjs');
const cover = require('./cover.config.cjs');

const DATA = path.join(__dirname, '..', 'data');
const PODIL = require(path.join(DATA, 'podil-zavrazdenych.json')).data.values;
const GAZA = require(path.join(DATA, 'gaza-projekce-odhad.json')).layer;

const ORANZ = '#f76800'; // brandOrange.6
const TEAL = '#33b9d9'; // brandTeal.4
const KREM = '#f8f6f0'; // background.2
const POPIS = '#d2d8e9'; // brandNavy.1
const NAVY = '#101432'; // brandNavy.9
const W = 1080, H = 1350;
const SANS = 'IBM Plex Sans, Arial, sans-serif';
const f1 = (v) => v.toFixed(1);
const svg = (obsah) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${obsah}</svg>`;
const text = (x, y, obsah, { size = 26, w = 500, fill = POPIS, anchor = 'start', op = 1 } = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="${SANS}" font-weight="${w}" font-size="${size}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}>${obsah}</text>`;
const holy = (s) => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1'); // titulek grafu bez barevných značek {text|#barva}

// --- slide 1 a 3: křivky obyvatel (motiv coveru překreslený pro plochu slidu) ---
const L_KRIVKY = { W, H, plot: [110, 520, 790, 1050], lw: 6.5, fs: 26, fsS: 21, cara: 480, nap: [10, 504, 'start'], osa: true, pozn: [70, 1180, 22], poznZdroj: false,
  poznRadky: ['Rok před začátkem genocidy = 100. Propad ve Rwandě zahrnuje', 'kromě zavražděných i přes dva miliony uprchlíků.'] };
const L_TIP = { W, H, plot: [110, 640, 790, 1130], lw: 7, fs: 26, fsS: 21, cara: 600, nap: [10, 624, 'start'], osa: true, pozn: [70, 1210, 22],
  poznRadky: ['Počet obyvatel pěti zemí kolem začátku genocidy, rok před = 100'], poznZdroj: false };

// --- slide 4: podíl zavražděných z cílové skupiny (%), osa 0–100 % ---
function grafPodil() {
  const [x0, x1] = [70, 1010];
  const x = (v) => x0 + (v / 100) * (x1 - x0);
  let s = '', y = 470;
  for (const v of [0, 25, 50, 75, 100]) s += `<line x1="${f1(x(v))}" x2="${f1(x(v))}" y1="440" y2="1145" stroke="${KREM}" stroke-opacity="${v ? 0.1 : 0.45}"/>` + text(x(v), 1180, `${v} %`, { size: 22, anchor: v === 0 ? 'start' : v === 100 ? 'end' : 'middle', fill: KREM, op: 0.6 });
  for (const r of PODIL) {
    const gaza = r.kat.startsWith('Gaza');
    const b = gaza ? ORANZ : TEAL;
    s += text(x0, y, r.kat, { size: 28, w: 600, fill: gaza ? ORANZ : KREM });
    s += `<rect x="${x0}" y="${y + 13}" width="${f1(Math.max(4, x(r.n) - x0))}" height="34" rx="3" fill="${b}"/>`;
    s += text(x(r.n) + 14, y + 41, r.t, { size: 30, w: 700, fill: KREM });
    s += text(x0, y + 76, r.stav, { size: 21, fill: gaza ? '#ffc89f' : POPIS, op: gaza ? 1 : 0.8 }); // brandOrange.2
    y += 120;
  }
  return svg(s);
}

// --- slide 5: obyvatelé Gazy, předválečná projekce × odhady PCBS (osa od nuly jako v článku) ---
function grafGaza() {
  const rada = (nazev, typ) => GAZA.find((l) => l.mark?.type === typ && l.data.values[0]?.rada === nazev).data.values;
  const proj = rada('Předválečná projekce', 'line'), odh = rada('Odhad PCBS', 'line');
  const [x0, x1, y0, y1] = [170, 850, 560, 1010];
  const X = (r) => x0 + ((r - 2022.3) / (2026.7 - 2022.3)) * (x1 - x0);
  const Y = (n) => y1 - (n / 2.5e6) * (y1 - y0);
  let s = '';
  for (const v of [0, 1e6, 2e6]) s += `<line x1="${x0}" x2="${x1}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="${KREM}" stroke-opacity="${v ? 0.12 : 0.45}"/>` + text(x0 - 16, Y(v) + 8, v ? `${v / 1e6} mil.` : '0', { size: 24, anchor: 'end', fill: KREM, op: 0.6 });
  for (const r of [2022, 2023, 2024, 2025, 2026]) s += text(X(r + 0.5), y1 + 40, r, { size: 24, anchor: 'middle', fill: KREM, op: 0.6 });
  // 7. 10. 2023
  s += `<line x1="${f1(X(2023.77))}" x2="${f1(X(2023.77))}" y1="${y0 - 40}" y2="${y1}" stroke="${KREM}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="8 7"/>`;
  s += text(X(2023.77) + 12, y1 - 20, '7. 10. 2023', { size: 22, w: 600, fill: KREM, op: 0.85 });
  const cara = (body, b, w, dash) => `<polyline points="${body.map((p) => `${f1(X(p.rok))},${f1(Y(p.n))}`).join(' ')}" fill="none" stroke="${b}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
    + body.map((p) => `<circle cx="${f1(X(p.rok))}" cy="${f1(Y(p.n))}" r="${w * 1.3}" fill="${b}"/>`).join('');
  s += cara(proj, TEAL, 6, '14 10') + cara(odh, ORANZ, 7);
  const pk = proj.at(-1), ok = odh.at(-1), p0 = odh[0];
  // popisky konců: projekce nad koncem, odhad pod koncem (zarovnané doprava ke konci čáry)
  s += text(X(pk.rok) + 10, Y(pk.n) - 64, pk.popis, { size: 22, fill: POPIS, anchor: 'end' });
  s += text(X(pk.rok) + 10, Y(pk.n) - 30, `předválečná projekce ${pk.t}`, { size: 28, w: 700, fill: TEAL, anchor: 'end' });
  s += text(X(ok.rok) + 10, Y(ok.n) + 50, `odhad PCBS ${ok.t}`, { size: 28, w: 700, fill: ORANZ, anchor: 'end' });
  s += text(X(ok.rok) + 10, Y(ok.n) + 80, ok.popis, { size: 22, fill: POPIS, anchor: 'end' });
  s += text(X(p0.rok) - 14, Y(p0.n) - 24, p0.t, { size: 24, w: 600, fill: KREM, anchor: 'end' });
  return svg(s);
}

// --- slide 6: porody × zabití za den, 1 tečka = 1 porod / 1 zabitý (stejné měřítko, zarovnáno dole) ---
function teckyDen() {
  const sloupcu = 12, krok = 33, r = 13, dole = 990;
  const blok = (x0, n, b) => Array.from({ length: n }, (_, i) => {
    const c = i % sloupcu, rr = Math.floor(i / sloupcu);
    return `<circle cx="${f1(x0 + c * krok + r)}" cy="${f1(dole - rr * krok - r)}" r="${r}" fill="${b}"/>`;
  }).join('');
  const vyska = (n) => Math.ceil(n / sloupcu) * krok;
  const [xa, xb] = [70, 566];
  let s = blok(xa, 180, TEAL) + blok(xb, 100, ORANZ);
  s += text(xa, dole - vyska(180) - 24, 'asi 180', { size: 60, w: 700, fill: TEAL });
  s += text(xb, dole - vyska(100) - 24, 'zhruba 100', { size: 60, w: 700, fill: ORANZ });
  s += text(xa, dole + 46, 'žen denně rodilo', { size: 27, w: 600, fill: KREM });
  s += text(xa, dole + 80, 'i během války (odhad UNFPA)', { size: 22, fill: POPIS });
  s += text(xb, dole + 46, 'zabitých denně v průměru', { size: 27, w: 600, fill: KREM });
  s += text(xb, dole + 80, '7. 10. 2023 – konec 2024', { size: 22, fill: POPIS });
  s += text(xb, dole + 108, '(ministerstvo zdravotnictví v Gaze)', { size: 22, fill: POPIS });
  s += `<text transform="translate(1046 ${dole - vyska(180) / 2}) rotate(-90)" text-anchor="middle" font-family="${SANS}" font-weight="500" font-size="20" letter-spacing="1" fill="${POPIS}" opacity=".8">1 tečka = 1 porod / 1 zabitý</text>`;
  return svg(s);
}

const ZDROJ_KRIVKY = 'Zdroj: Světová banka (odhady OSN World Population Prospects 2024), výpočet DataTimes.cz';

module.exports = {
  vystup: path.join(__dirname, '..', 'social', 'carousel'),
  cover,
  slidy: [
    {
      cover: { ...cover, titulek: 'Pozná se genocida<br>podle toho, jestli<br>ubývá obyvatel?', pod: 'Tipněte si, pak listujte dál', legenda: null, format: { instagram: { t: 80, sub: 34 } } },
      svg: () => graf('tip', { L: L_TIP, konec: -1, popisky: 0, otaznik: true }),
    },
    {
      titulek: 'Úmluva o genocidě se na počet obyvatel neptá',
      pod: 'Úmluva o genocidě z roku 1948, článek&nbsp;II',
      velikost: 54,
      obsahOd: 420,
      html: `<p class="velke" style="font-size:36px">Genocida jsou činy „spáchané v úmyslu zničit úplně nebo částečně některou národní, ethnickou, rasovou nebo náboženskou skupinu jako takovou“:</p>
        <div class="bod" style="font-size:32px;margin-bottom:.55em"><b>1</b><div>usmrcení příslušníků skupiny</div></div>
        <div class="bod" style="font-size:32px;margin-bottom:.55em"><b>2</b><div>těžké ublížení na těle nebo duševní zdraví</div></div>
        <div class="bod" style="font-size:32px;margin-bottom:.55em"><b>3</b><div>uvedení skupiny do životních podmínek, které ji mají fyzicky zničit</div></div>
        <div class="bod" style="font-size:32px;margin-bottom:.55em"><b>4</b><div>opatření bránící rození dětí</div></div>
        <div class="bod" style="font-size:32px;margin-bottom:.9em"><b>5</b><div>násilné převádění dětí do jiné skupiny</div></div>
        <p class="velke" style="font-size:34px;color:#f8f6f0;font-weight:600">O žádné hranici počtu obětí ani o úbytku obyvatel úmluva nemluví.</p>`,
      zdroj: 'Zdroj: Úmluva o zabránění a trestání zločinu genocidia (vyhláška č. 32/1955 Sb.)',
    },
    {
      titulek: holy(require(path.join(DATA, 'krivky-obyvatel.json')).title.text),
      pod: 'Počet obyvatel země pět let před začátkem genocidy<br>a šest let po něm',
      velikost: 46,
      svg: () => graf('krivky', { L: L_KRIVKY }),
      zdroj: ZDROJ_KRIVKY,
    },
    {
      titulek: holy(require(path.join(DATA, 'podil-zavrazdenych.json')).title.text),
      pod: 'Podíl zavražděných z cílové skupiny (odhady historiků a soudů)',
      velikost: 48,
      svg: grafPodil(),
      zdroj: 'Zdroj: odhady HRW, USHMM, B. Kiernana, ICTY a PLOS Medicine; Gaza: OCHA a PCBS (zabití do 21. 10. 2026 z předválečného počtu obyvatel)',
    },
    {
      titulek: holy(require(path.join(DATA, 'gaza-projekce-odhad.json')).title.text),
      pod: 'Obyvatelé Pásma Gazy: projekce PCBS z doby před válkou a válečné odhady PCBS',
      velikost: 50,
      svg: grafGaza(),
      obsahOd: 1100,
      html: '<div class="male">PCBS uvádí úbytek 254&nbsp;tisíc lidí (10,6&nbsp;%), počítaný ale proti předválečné projekci. Proti skutečnému počtu z poloviny roku 2023 jde zhruba o sto tisíc lidí, asi 4&nbsp;%.</div>',
      zdroj: 'Zdroj: PCBS (Palestinský statistický úřad), projekce obyvatel a zprávy 2024–2025',
    },
    {
      titulek: 'V Gaze se i za války rodilo víc dětí, než kolik lidí ministerstvo hlásilo zabitých',
      pod: 'Proto může počet obyvatel stagnovat,<br>i když umírají desítky tisíc lidí',
      velikost: 50,
      svg: teckyDen(),
      obsahOd: 1132,
      html: '<div class="male">Válka přesto porodnost srazila: v prvním pololetí 2025 se narodilo 17&nbsp;tisíc dětí proti 29&nbsp;tisícům ve stejném období roku 2022, o 41&nbsp;% méně.</div>',
      zdroj: 'Zdroj: UNFPA; ministerstvo zdravotnictví v Gaze (45 541 zabitých do konce roku 2024)',
    },
    {
      titulek: 'Jak jsme to počítali a co data neříkají',
      obsahOd: 390,
      html: `<p class="velke" style="font-size:36px">Křivky ukazují celkový počet obyvatel země podle Světové banky, přepočtený tak, že rok před začátkem genocidy = 100.</p>
        <p class="velke" style="font-size:36px">Počet obyvatel míchá narozené, zabité a odešlé dohromady. Kdo z něj chce vyčíst, zda probíhá genocida, nevidí, co se děje s lidmi.</p>
        <p class="velke" style="font-size:36px">Čísla za Gazu z doby války nejsou sčítání. I odhady PCBS jsou nejisté: domov muselo opustit kolem dvou milionů lidí.</p>
        <p class="velke" style="font-size:36px">Závazně o Gaze rozhodne Mezinárodní soudní dvůr. Rozsudek ve věci samé zatím nepadl.</p>`,
    },
    {
      titulek: 'Na čem by podle vás mělo záviset, jestli soud uzná genocidu?',
      velikost: 64,
      obsahOd: 470,
      html: `<p class="velke" style="font-size:48px;font-weight:600;color:#33b9d9">Napište nám do komentářů.</p>
        <div style="margin-top:120px;padding:40px 44px;border-radius:18px;background:rgba(51,185,217,.12);border:2px solid #33b9d9">
          <div class="male" style="font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#33b9d9">Celý článek</div>
          <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:50px;font-weight:700;line-height:1.15;margin:.3em 0 .35em">Počet obyvatel genocidu neměří</div>
          <div class="male">Proč neobstojí graf, podle kterého v Gaze o genocidu nejde. Na DataTimes.cz, odkaz najdete v biu.</div>
        </div>`,
    },
  ],
};
