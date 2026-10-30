// Společný generátor Instagram carouselu DataTimes (tools/COVER-VIZUALNI-IDENTITA.md → kapitola 8 *Balík výstupů*).
// Každý slide 1080×1350 se kreslí přes html() z cover-generator.cjs, takže má stejné pozadí, štítek, písma
// a logo (nahoře, dole ho překrývá ovládání Instagramu) jako covery a animace. Obsah slidu je buď SVG vrstva
// (graf, motiv), nebo HTML blok (text, velká čísla) v obsahové ploše pod titulkem.
//
// node tools/carousel-generator.cjs <carousel.config.cjs> [čísla slidů…] [--story]
// --story: stejné slidy na výšku 1080×1920 pro stories a Reels (obsah posunutý o 150 px dolů jako text coveru
// story, patička nad spodní zónou ovládání) → <vystup>-story/
// (PW_PATH = cesta k balíčku playwright jako u coverů; prohlížeč: nainstalovaný Microsoft Edge)
// → <vystup>/01.png … NN.png a kontaktní arch <vystup>/../carousel-arch.png (jen ke kontrole)
//
// Konfigurace (module.exports):
//   vystup   složka (u článku social/carousel)
//   cover    konfigurace coveru článku (štítek, barvy); logo se vždy dává nahoru
//   slidy    [{ titulek, pod?, svg?, html?, zdroj?, cover? }]
//            svg  = celé <svg> 1080×1350 (vrstva motivu, kreslí se pod textem), nebo funkce (formát) → <svg> daného formátu
//            html = obsah do plochy [70, obsahOd, 1010, 1210]; třídy .velke, .cislo, .popis, .bod, .male
//            zdroj = řádek dole vlevo („Zdroj: …“); číslo slidu „2 / 8“ dole vpravo doplní generátor
//            cover = úplná vlastní konfigurace (např. první snímek animace); svg pak jde jako motiv
//   obsahOd  horní hrana obsahové plochy pro html (výchozí 560)
//   bezPodekovani  true = nepřidávat závěrečný slide s poděkováním (jen výjimečně)
// Poslední slide každého carouselu je poděkování a výzva k podpoře s QR kódem na Stripe odkaz ze SupportBanneru
// (Kateřina 29. 10. 2026). Generátor ho přidá sám; QR je tools/podpora-qr.svg (segno, viz COVER-VIZUALNI-IDENTITA.md).
// Česká typografie: jednopísmenné předložky a spojky v titulku, podtitulku, zdroji a HTML dostanou
// nezlomitelnou mezeru automaticky (karty mimo web nejdou přes fixCzechTypography).
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { FORMATY, html, upravStitek } = require('./cover-generator.cjs');

const REPO = path.join(__dirname, '..');
const STORY = process.argv.includes('--story');
const KLIC = STORY ? 'story' : 'instagram';
const POSUN = STORY ? FORMATY.story.box[1] - FORMATY.instagram.box[1] : 0; // 150 px: text story začíná níž
const POPIS = '#ffe0c7'; // brandOrange.1, jako podtitulky coverů

// mezera za jednopísmenným slovem → nezlomitelná (jen v textu, ne uvnitř HTML značek)
const nbsp = (s) => s && s.replace(/(<[^>]*>)|(^|[\s>(„])([ksvzouaiKSVZOUAI]) /g, (m, tag, pred, pis) => (tag ? tag : `${pred}${pis}&nbsp;`));

const CSS = `
  .obsah{position:absolute;left:70px;right:70px;font-family:'IBM Plex Sans',Arial,sans-serif;color:#f8f6f0}
  .obsah .velke{font-size:40px;font-weight:500;line-height:1.35;margin:0 0 .7em}
  .obsah .cislo{font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:700;font-size:150px;line-height:1;letter-spacing:-.01em}
  .obsah .popis{font-size:32px;font-weight:500;line-height:1.3;color:${POPIS};margin-top:.3em}
  .obsah .bod{display:flex;gap:28px;align-items:baseline;font-size:36px;font-weight:500;line-height:1.35;margin:0 0 1.1em}
  .obsah .bod b{font-family:'IBM Plex Serif',Georgia,serif;font-weight:700;font-size:64px;line-height:.8;color:#f76800;flex:none;width:52px}
  .obsah .male{font-size:28px;line-height:1.4;color:${POPIS}}
  .paticka{position:absolute;left:70px;right:70px;bottom:52px;display:flex;justify-content:space-between;align-items:flex-end;gap:40px;
    font-family:'IBM Plex Sans',Arial,sans-serif;font-weight:500;font-size:21px;line-height:1.35;color:${POPIS};opacity:.85}
  .paticka .strana{flex:none;letter-spacing:.08em}
  .obsah .podpora{display:flex;flex-direction:column;align-items:center;margin-top:20px}
  .obsah .podpora .qr{width:380px;height:380px;padding:18px;background:#f8f6f0;border-radius:24px;box-sizing:content-box}
  .obsah .podpora .qr svg{width:100%;height:100%;display:block}
  .obsah .podpora .male{margin-top:18px;font-weight:600;letter-spacing:.04em}
`;

// závěrečný slide: poděkování a výzva k podpoře s QR kódem (Stripe odkaz ze SupportBanner.tsx)
const QR = fs.readFileSync(path.join(__dirname, 'podpora-qr.svg'), 'utf8');
const PODEKOVANI = {
  titulek: 'Máme vás rádi. Bez vaší podpory to nepůjde.',
  pod: 'DataTimes dělá nezávislou datovou žurnalistiku díky čtenářům, jako jste vy.',
  obsahOd: 600,
  html: `<div class="podpora"><div class="qr">${QR}</div><div class="male">Podpořte nás · naskenujte QR kód</div></div>`,
  zdroj: 'DataTimes.cz',
};

(async () => {
  const cfg = require(path.resolve(process.argv[2]));
  if (!cfg.bezPodekovani) cfg.slidy = [...cfg.slidy, PODEKOVANI];
  const jen = process.argv.slice(3).filter((a) => a !== '--story').map(Number);
  const vystup = STORY ? `${cfg.vystup}-story` : cfg.vystup;
  fs.mkdirSync(vystup, { recursive: true });
  const f = FORMATY[KLIC];
  const browser = await chromium.launch({ channel: 'msedge' });
  const soubory = [];
  for (const [i, s] of cfg.slidy.entries()) {
    const out = path.join(vystup, `${String(i + 1).padStart(2, '0')}.png`);
    soubory.push(out);
    if (jen.length && !jen.includes(i + 1)) continue;
    const prazdne = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}"></svg>`;
    // SVG navržené na 1080×1350 se ve story jen posune dolů; funkce kreslí přímo pro formát
    const vrstva = typeof s.svg === 'function' ? s.svg(KLIC)
      : s.svg && STORY ? `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}"><g transform="translate(0 ${POSUN})">${s.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></svg>`
      : s.svg;
    const c = s.cover
      ? { ...s.cover, logo: 'nahore', motiv: { typ: 'svg', svg: { [KLIC]: vrstva ?? prazdne } } }
      : { ...cfg.cover, titulek: nbsp(s.titulek), pod: nbsp(s.pod), legenda: null, ikona: null, logo: 'nahore',
          format: { [KLIC]: { t: s.velikost ?? 66, sub: 32, kick: 24 } }, motiv: { typ: 'svg', svg: { [KLIC]: vrstva ?? prazdne } } };
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(c, KLIC).replace('</style>', `${CSS}</style>`), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await upravStitek(page, KLIC, { ...f, ...(c.format?.[KLIC] ?? {}) });
    await page.evaluate(({ obsah, top, zdroj, strana, dole }) => {
      if (obsah) document.body.insertAdjacentHTML('beforeend', `<div class="obsah" style="top:${top}px">${obsah}</div>`);
      document.body.insertAdjacentHTML('beforeend', `<div class="paticka" style="bottom:${dole}px"><span>${zdroj ?? ''}</span><span class="strana">${strana}</span></div>`);
    }, { obsah: nbsp(s.html), top: (s.obsahOd ?? cfg.obsahOd ?? 560) + POSUN, zdroj: nbsp(s.zdroj),
      strana: STORY ? '' : `${i + 1}&thinsp;/&thinsp;${cfg.slidy.length}`, dole: STORY ? f.h - f.box[3] : 52 });
    // kontrola: obsah nesmí přetéct do patičky a titulek nesmí vjet do obsahu
    const kolize = await page.evaluate(() => {
      const r = (el) => el?.getBoundingClientRect();
      const ob = r(document.querySelector('.obsah')), pa = r(document.querySelector('.paticka')), sub = r(document.querySelector('.sub') ?? document.querySelector('h1'));
      const chyby = [];
      if (ob && pa && ob.bottom > pa.top - 20) chyby.push(`obsah končí na ${Math.round(ob.bottom)}, patička začíná na ${Math.round(pa.top)}`);
      if (ob && sub && sub.bottom > ob.top - 20) chyby.push(`titulek/podtitulek končí na ${Math.round(sub.bottom)}, obsah začíná na ${Math.round(ob.top)}`);
      return chyby;
    });
    await page.screenshot({ path: out });
    await page.close();
    console.log(path.relative(REPO, out), kolize.length ? `– POZOR: ${kolize.join('; ')}` : '');
  }

  // kontaktní arch: všechny slidy vedle sebe (zmenšené), jen ke kontrole
  const arch = await browser.newPage({ viewport: { width: 270 * Math.min(5, soubory.length) + 20, height: (STORY ? 490 : 360) * Math.ceil(soubory.length / 5) + 20 } });
  const img = soubory.filter(fs.existsSync).map((p) => `<img src="data:image/png;base64,${fs.readFileSync(p).toString('base64')}" style="width:260px;margin:5px">`).join('');
  await arch.setContent(`<body style="margin:5px;background:#ddd;line-height:0">${img}</body>`);
  const archOut = path.join(cfg.vystup, '..', STORY ? 'carousel-story-arch.png' : 'carousel-arch.png');
  await arch.screenshot({ path: archOut, fullPage: true });
  console.log(path.relative(REPO, archOut), '(kontaktní arch)');
  await browser.close();
})();
