// Společný generátor animací DataTimes (tools/COVER-VIZUALNI-IDENTITA.md → kapitola 8 *Balík výstupů*).
// Z konfigurace článku vykreslí animaci snímek po snímku přes Playwright – se stejným pozadím, písmy, štítkem,
// titulkem a logem jako cover (bere html() z cover-generator.cjs) – a zakóduje ji ffmpegem z tools/media/:
//   <nazev>-<formát>.mp4   H.264, 30 fps, bez zvuku (story 1080×1920, instagram 1080×1350, square 1080×1080)
//   <nazev>.gif            odvozený z MP4 jednoho formátu: šířka ≤ 800 px, ≤ 8 s, ≤ 5 MB, paleta palettegen/paletteuse
//
// node tools/animation-generator.cjs <animace.config.cjs> [formát…] [--nahledy <složka>]
// (PW_PATH = cesta k balíčku playwright jako u coverů; prohlížeč: nainstalovaný Microsoft Edge)
// --nahledy uloží PNG snímky v časech config.nahledy (ke kontrole, nepublikují se);
// --jen-nahledy jen ty snímky, bez videa (rychlé ladění rozvržení)
//
// Konfigurace (module.exports):
//   nazev     základ názvu souborů, např. 'slunecnice'
//   cover     konfigurace coveru článku (require('./cover.config.cjs')), případně upravená (jiný podtitulek…)
//   vystup    složka výstupu (u článku social/animace)
//   fps, trvani   snímky za sekundu (30) a délka v sekundách (5–15, kvůli GIFu nejlépe ≤ 8)
//   formaty   ['story', 'instagram', 'square'] – klíče z FORMATY v cover-generator.cjs
//   snimek(t, klic)  → SVG vrstvy motivu (celé <svg> o rozměrech formátu) v čase t sekund
//   coverPro  { homepage: { logo: 'vlevo', … } } – úprava coveru jen pro jeden formát (homepage karta webu má logo
//             dole a volný pravý horní roh kvůli štítku rubriky)
//   gif       { format: 'square', sirka: 800, fps: 15, cil? } nebo pole takových; cil = vlastní cesta GIFu
//             delka = délka GIFu v s (výchozí ≤ 8 s; delší jen výjimečně, např. pomalá smyčka na homepage)
//             (např. images/ článku pro homepage kartu), jinak <vystup>/<nazev>.gif
//   nahledy   [časy v s] pro --nahledy
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { FORMATY, html, upravStitek, vykresliZnak } = require('./cover-generator.cjs');

const REPO = path.join(__dirname, '..');

function ffmpegCesta() {
  try {
    return require(path.join(__dirname, 'media', 'node_modules', 'ffmpeg-static'));
  } catch {
    console.error('ffmpeg chybí: spusť jednou `npm install` ve složce tools/media (viz tools/media/README.md).');
    process.exit(1);
  }
}

function ffmpeg(args, vstup) {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegCesta(), ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: [vstup ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('error', reject);
    p.on('close', (k) => (k === 0 ? resolve() : reject(new Error(`ffmpeg skončil s kódem ${k}`))));
    if (vstup) vstup(p.stdin);
  });
}

const zapis = (stdin, buf) => new Promise((res) => (stdin.write(buf) ? res() : stdin.once('drain', res)));
const kb = (p) => `${Math.round(fs.statSync(p).size / 1024)} kB`;

(async () => {
  const argv = process.argv.slice(2);
  const iN = argv.indexOf('--nahledy');
  const nahledyDir = iN >= 0 ? path.resolve(argv[iN + 1]) : null;
  const jenNahledy = argv.includes('--jen-nahledy');
  const pozicni = argv.filter((a, i) => (iN < 0 || (i !== iN && i !== iN + 1)) && a !== '--jen-nahledy');
  const cfg = require(path.resolve(pozicni[0]));
  const jen = pozicni.slice(1);
  const fps = cfg.fps ?? 30;
  const pocet = Math.round(cfg.trvani * fps);
  fs.mkdirSync(cfg.vystup, { recursive: true });
  if (nahledyDir) fs.mkdirSync(nahledyDir, { recursive: true });
  const nahledySnimky = new Set((cfg.nahledy ?? []).map((t) => Math.min(pocet - 1, Math.round(t * fps))));

  const browser = await chromium.launch({ channel: 'msedge' });
  for (const klic of cfg.formaty.filter((k) => !jen.length || jen.includes(k))) {
    const cover = { ...cfg.cover, ...(cfg.coverPro?.[klic] ?? {}) };
    const f = { ...FORMATY[klic], ...(cover.format?.[klic] ?? {}) };
    const c = { ...cover, motiv: { typ: 'svg', svg: { [klic]: cfg.snimek(0, klic) } } };
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h } });
    await page.setContent(html(c, klic), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(vykresliZnak);
    await upravStitek(page, klic, f);

    if (jenNahledy) {
      for (const i of nahledySnimky) {
        await page.evaluate((svg) => { document.getElementById('motiv').innerHTML = svg; }, cfg.snimek(i / fps, klic));
        await page.screenshot({ path: path.join(nahledyDir, `${cfg.nazev}-${klic}-${(i / fps).toFixed(1)}s.png`) });
      }
      await page.close();
      continue;
    }
    const out = path.join(cfg.vystup, `${cfg.nazev}-${klic}.mp4`);
    const t0 = Date.now();
    await ffmpeg(['-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', '-an', out],
    async (stdin) => {
      for (let i = 0; i < pocet; i++) {
        await page.evaluate((svg) => { document.getElementById('motiv').innerHTML = svg; }, cfg.snimek(i / fps, klic));
        const png = await page.screenshot({ type: 'png' });
        if (nahledyDir && nahledySnimky.has(i)) fs.writeFileSync(path.join(nahledyDir, `${cfg.nazev}-${klic}-${(i / fps).toFixed(1)}s.png`), png);
        await zapis(stdin, png);
      }
      stdin.end();
    });
    await page.close();
    console.log(path.relative(REPO, out), `${f.w}×${f.h}`, `${cfg.trvani} s`, kb(out), `(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  await browser.close();

  for (const gif of [cfg.gif ?? []].flat()) {
    if (jenNahledy || (jen.length && !jen.includes(gif.format))) continue;
    const g = { sirka: 800, fps: 15, ...gif };
    const zdroj = path.join(cfg.vystup, `${cfg.nazev}-${g.format}.mp4`);
    const out = g.cil ?? path.join(cfg.vystup, `${cfg.nazev}.gif`);
    // ploché barvy palety se do 256 barev vejdou; dither jen jemný kvůli záři v pozadí
    await ffmpeg(['-i', zdroj, '-t', String(g.delka ?? Math.min(cfg.trvani, 8)), '-vf',
      `fps=${g.fps},scale=${g.sirka}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', out]);
    const mb = fs.statSync(out).size / 1024 / 1024;
    console.log(path.relative(REPO, out), `šířka ${g.sirka}`, kb(out), mb > 5 ? '– POZOR: nad 5 MB, zkrátit nebo zmenšit' : '');
  }
})();
