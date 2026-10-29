// Article gate: enforces the measurable rules of docs/redakcni-styl/REDAKCNI_MANUAL.md
// for every article dated on or after ENFORCED_FROM. Runs in `prebuild`, so a failing
// article stops the Cloudflare Pages deploy instead of going live.
//
//   node scripts/checkArticles.js                 – check enforced articles (exit 1 on error)
//   node scripts/checkArticles.js <slug> [...]     – check given articles regardless of date
//   node scripts/checkArticles.js --staged         – pre-commit: enforced articles in the staged changes
//
// Rules that need judgement (thesis headline, fact-checking people, reading data before
// the story) cannot be automated; they stay in the manual and in CLAUDE.md / AGENTS.md.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ENFORCED_FROM = '2026-10-13';
const articlesDir = path.join(__dirname, '../app/clanek/_articles');

const SLUG_RE = /^(kontext|analyza|explainer|komentar|cislo-dne|podcast(-[a-z]+)?|europarlament|volby-[a-z]+|mandaty)-(\d{4}-\d{2}-\d{2})-[a-z0-9-]+$/;

// REDAKCNI_MANUAL.md → Část II „Jazyk bez berliček“ and Část III „Zakázané u dat“.
const BANNED = [
  ['fascinující', 'klišé'], ['pozoruhodn', 'klišé'], ['anatomi[ei] ', 'klišé „anatomie čehokoli“'],
  ['rentgen', 'klišé „rentgen čehokoli“'], ['pod povrchem', 'klišé'], ['za oponou', 'klišé'],
  ['v neposlední řadě', 'vata'], ['v tomto kontextu', 'vata'], ['jak jsme viděli', 'vata'],
  ['stojí za zmínku', 'vata'], ['je třeba podotknout', 'vata'],
  ['není to o tom', 'anglický kalk'], ['na denní bázi', 'anglický kalk'], ['adresovat problém', 'anglický kalk'],
  ['game.?changer', 'anglický kalk'], ['měnit hru', 'anglický kalk'], ['narativ', 'anglický kalk'],
  ['bezprecedentní', 'hodnotící přívlastek bez vymezení'], ['pouhých \\d', 'hodnotící přívlastek u čísla'],
  ['dramatick[ýé] (propad|nárůst|pokles)', 'dramatizace čísla'], ['alarmující', 'dramatizace čísla'],
  ['závratn', 'dramatizace čísla'], ['odehrálo se něco mimořádného', 'dramatizace'],
];

const errors = [];
const warnings = [];
const err = (slug, msg) => errors.push(`${slug}: ${msg}`);
const warn = (slug, msg) => warnings.push(`${slug}: ${msg}`);

function stripCode(body) {
  // Ignore fenced code and MDX component attributes when scanning prose.
  return body.replace(/```[\s\S]*?```/g, '').replace(/<[A-Z][^>]*\/?>/g, '');
}

function checkArticle(slug) {
  const dir = path.join(articlesDir, slug);
  const file = path.join(dir, 'index.md');
  if (!fs.existsSync(file)) return;
  const { data: fm, content } = matter(fs.readFileSync(file, 'utf8'));

  // URL and metadata
  const m = SLUG_RE.exec(slug);
  if (!m) err(slug, 'slug nemá tvar <rubrika>-RRRR-MM-DD-<popis> (manuál, Část VII → URL a rubrika)');
  else if (fm.date && m[3] !== String(fm.date)) err(slug, `datum ve slugu (${m[3]}) nesedí s frontmatter date (${fm.date})`);
  for (const k of ['title', 'date', 'author', 'excerpt', 'filter', 'tags']) if (!fm[k]) err(slug, `chybí frontmatter „${k}“`);
  if (slug.startsWith('volby-') && !(fm.tags || []).includes('volby')) err(slug, 'volební článek musí mít tag „volby“');
  if (/\baneb\b/i.test(fm.title || '')) err(slug, 'spojka „aneb“ je v titulku zakázaná');

  // Cover set (tools/COVER-EDITOR.md)
  const img = (p) => p && path.join(dir, p);
  for (const k of ['coverImage', 'ogImage']) {
    if (!fm[k]) err(slug, `chybí frontmatter „${k}“ (sada coverů)`);
    else if (!fs.existsSync(img(fm[k]))) err(slug, `${k} ukazuje na neexistující soubor ${fm[k]}`);
  }
  if (fm.ogImage && fs.existsSync(img(fm.ogImage)) && fs.statSync(img(fm.ogImage)).size > 300 * 1024) {
    err(slug, 'ogImage je větší než 300 kB (WhatsApp ho nenačte)');
  }
  const imagesDir = path.join(dir, 'images');
  const files = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
  for (const name of ['cover-square', 'cover-instagram', 'cover-story']) {
    if (!files.some((f) => f.startsWith(name + '.'))) err(slug, `chybí ${name} (sada pěti coverů)`);
  }
  // A cover must be a real cover, not a copy of an in-text image or a tool screenshot.
  if (fm.coverImage && fs.existsSync(img(fm.coverImage))) {
    const cover = fs.readFileSync(img(fm.coverImage));
    for (const f of files) {
      if (f.startsWith('cover')) continue;
      const other = fs.readFileSync(path.join(imagesDir, f));
      if (other.length === cover.length && other.equals(cover)) err(slug, `cover je kopie obrázku images/${f} – cover se dělá generátorem (tools/COVER-EDITOR.md)`);
    }
  }

  checkCoverStamps(slug, dir, fm);

  // Mandatory embedded elements (manuál, Část II → Povinné vložené prvky)
  const lines = content.trim().split('\n').filter((l) => l.trim());
  const last = lines[lines.length - 1] || '';
  if (!/^<RelatedArticles[^>]*heading="🔻🔻🔻"/.test(last.trim())) err(slug, 'poslední prvek musí být <RelatedArticles heading="🔻🔻🔻" … />');
  if (!content.includes('<SupportBanner')) err(slug, 'chybí inline <SupportBanner />');
  if (/heading="(Doporučujeme|Napsali jsme)"/.test(content)) err(slug, 'nadpis related boxu je vždy 🔻🔻🔻');
  for (const [, slugs] of content.matchAll(/slugs=\{\[([^\]]*)\]\}/g)) {
    for (const s of slugs.match(/"([^"]+)"/g) || []) {
      const target = s.slice(1, -1);
      if (!fs.existsSync(path.join(articlesDir, target))) err(slug, `RelatedArticles odkazuje na neexistující článek ${target}`);
    }
  }

  // Language (manuál, Část II and III)
  const prose = stripCode(content);
  for (const [re, why] of BANNED) {
    const hit = new RegExp(re, 'i').exec(prose);
    if (hit) err(slug, `zakázaný výraz „${hit[0].trim()}“ (${why})`);
  }
  if (prose.includes('—')) err(slug, 'em-dash „—“: používáme en-dash „–“');
  if (/^#{1,3} .*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/mu.test(prose)) err(slug, 'emoji v mezititulku');
  if (/^#{2,3} +Zdroje\s*$/m.test(prose)) err(slug, 'souhrnný oddíl „Zdroje“ na konci: zdroje patří k tvrzením');
  if (/\bteaser\b/i.test(content)) err(slug, 'v textu zůstalo pracovní slovo „teaser“');
  if (!/\]\(https?:\/\//.test(content)) warn(slug, 'v textu není žádný odkaz na zdroj');
}

// Razítko coveru (tools/cover-generator.cjs → <config>.razitko.json, od 28. 10. 2026): generátor do něj zapíše
// texty coveru, titulek článku, otisky vstupů i obrázků a výsledek kontroly kompozice. Tady se z něj pozná cover,
// který neodpovídá článku (změněný titulek nebo coverTitulek), nebyl po změně konfigurace znovu vyrenderovaný,
// byl přepsaný mimo generátor, nebo neprošel kontrolou kompozice. Bez razítka (starší covery) se nic nekontroluje.
const crypto = require('crypto');
const REPO = path.join(__dirname, '../../..');
const holy = (s) => String(s ?? '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();
const otisk = (p) => {
  let b = fs.readFileSync(p);
  if (/\.(c?js|mjs|json|svg|md|mdx|txt|html|css)$/i.test(p)) b = Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'));
  return crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
};

function checkCoverStamps(slug, dir, fm) {
  const pipeline = path.join(dir, '_cover_pipeline');
  if (!fs.existsSync(pipeline)) return;
  for (const name of fs.readdirSync(pipeline).filter((n) => n.endsWith('.razitko.json'))) {
    const r = JSON.parse(fs.readFileSync(path.join(pipeline, name), 'utf8'));
    const co = `cover (${name.replace('.razitko.json', '')})`, coveru = `coveru (${name.replace('.razitko.json', '')})`;
    // článek, ke kterému cover patří (u speciálů může být jinde než ve složce)
    const clanekFm = r.clanek && path.join(REPO, r.clanek) !== path.join(dir, 'index.md') && fs.existsSync(path.join(REPO, r.clanek))
      ? matter(fs.readFileSync(path.join(REPO, r.clanek), 'utf8')).data : fm;
    const coverTitulek = clanekFm.coverTitulek ? holy(clanekFm.coverTitulek) : null;
    if (coverTitulek && coverTitulek !== r.texty?.titulek) {
      err(slug, `${co} má titulek „${r.texty?.titulek}“, ale coverTitulek ve frontmatteru je „${coverTitulek}“ – vyrenderuj covery znovu (tools/cover-generator.cjs)`);
    } else if (!coverTitulek && r.titulekClanku && holy(clanekFm.title) !== r.titulekClanku) {
      err(slug, `titulek článku se od vyrenderování ${coveru} změnil („${r.titulekClanku}“ → „${holy(clanekFm.title)}“), na coveru zůstává „${r.texty?.titulek}“. Zkontroluj text coveru a vyrenderuj znovu, nebo schválený text coveru zapiš do frontmatteru jako coverTitulek`);
    }
    const zmenene = new Set(), formaty = [];
    for (const [format, z] of Object.entries(r.formaty ?? {})) {
      const soubor = path.join(REPO, z.soubor);
      if (!fs.existsSync(soubor)) continue;
      const vstupy = Object.entries(z.vstupy ?? {}).filter(([p, h]) => !fs.existsSync(path.join(REPO, p)) || otisk(path.join(REPO, p)) !== h);
      if (vstupy.length) { vstupy.forEach(([p]) => zmenene.add(p.split('/').pop())); formaty.push(format); }
      else if (otisk(soubor) !== z.otisk) err(slug, `${co}: obrázek ${z.soubor.split('/').pop()} se změnil mimo generátor – covery se dělají jen generátorem (tools/COVER-EDITOR.md)`);
      if (z.kontrola?.chyby?.length) err(slug, `${co} ${format} neprošel kontrolou kompozice: ${z.kontrola.chyby.join('; ')}`);
    }
    if (zmenene.size) err(slug, `${co}: od vyrenderování se změnilo ${[...zmenene].join(', ')} (${formaty.join(', ')}) – vyrenderuj covery znovu`);
  }
}

const args = process.argv.slice(2);
const staged = args[0] === '--staged';
let candidates = fs.readdirSync(articlesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('zzz-'))
  .map((d) => d.name);
if (staged) {
  // pre-commit: only articles touched by this commit
  const out = require('child_process').execSync('git diff --cached --name-only', { encoding: 'utf8' });
  const touched = new Set(out.split('\n').map((l) => (l.match(/_articles\/([^/]+)\//) || [])[1]).filter(Boolean));
  candidates = candidates.filter((s) => touched.has(s));
}
const slugs = args.length && !staged
  ? args
  : candidates
      .filter((slug) => {
        const f = path.join(articlesDir, slug, 'index.md');
        if (!fs.existsSync(f)) return false;
        // The slug date decides (some old articles carry a future frontmatter date to stay pinned).
        const date = (slug.match(/\d{4}-\d{2}-\d{2}/) || [String(matter(fs.readFileSync(f, 'utf8')).data.date || '')])[0];
        return date >= ENFORCED_FROM;
      });

slugs.forEach(checkArticle);

// YAML soubory, na které článek odkazuje (yamlFile="…", např. key-stats.yaml pro <KeyNumbers>), musí jít načíst –
// rozbitý YAML shodí stránku článku („Article Not Found“). Platí pro všechny články bez ohledu na datum, protože
// rozbít ho může i úprava starého článku (29. 10. 2026: dvojtečka s mezerou v neuzavřeném popisku).
const yamlSlugs = args.length && !staged ? args : candidates;
for (const slug of yamlSlugs) {
  const f = path.join(articlesDir, slug, 'index.md');
  if (!fs.existsSync(f)) continue;
  for (const [, soubor] of fs.readFileSync(f, 'utf8').matchAll(/yamlFile="([^"]+)"/g)) {
    const p = path.join(articlesDir, slug, soubor);
    if (!fs.existsSync(p)) { err(slug, `yamlFile="${soubor}" neexistuje`); continue; }
    try {
      require('js-yaml').load(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      err(slug, `${soubor} nejde načíst: ${String(e.message).split('\n')[0]} (text s „: “ dej do uvozovek)`);
    }
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`\nKontrola článků podle redakčního manuálu (docs/redakcni-styl/REDAKCNI_MANUAL.md) neprošla:\n`);
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\nOprav článek, nebo se zeptej Kateřiny. Build se zastavil, aby se chyba nedostala na web.`);
  process.exit(1);
}
console.log(`Kontrola článků: ${slugs.length} zkontrolováno, bez chyb.`);
