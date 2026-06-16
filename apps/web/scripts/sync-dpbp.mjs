#!/usr/bin/env node
/**
 * sync-dpbp.mjs — Sync content from data-pro-premierku source project to web.
 *
 * Configuration:
 *   - Chapter structure: edit dpbp-config.json at the web root
 *   - Source path: run `npm run setup:dpbp` once per machine, or set DPBP_SOURCE
 *
 * Usage:
 *   npm run sync:dpbp
 *   DPBP_SOURCE=/path/to/source npm run sync:dpbp   # override for one run
 *
 * Outputs:
 *   app/specialy/data-pro-budouci-premierku/_content/[chapter-slug]/
 *   public/dpbp/charts/[CHART_ID].json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');

// ── Resolve source path ───────────────────────────────────────────────────────
// Priority: DPBP_SOURCE env var → .env.local → error with instructions

function readEnvLocal() {
  const envPath = path.join(WEB_ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return vars;
}

const envLocal = readEnvLocal();
const SOURCE = process.env.DPBP_SOURCE || envLocal.DPBP_SOURCE;

if (!SOURCE) {
  console.error(`
  ✗ DPBP_SOURCE is not configured.

  Run once to set your local path:
    npm run setup:dpbp

  Or set it directly for a single run:
    DPBP_SOURCE=/path/to/data-pro-premierku npm run sync:dpbp
`);
  process.exit(1);
}

if (!fs.existsSync(SOURCE)) {
  console.error(`
  ✗ Source directory not found: ${SOURCE}

  Check your DPBP_SOURCE path (run \`npm run setup:dpbp\` to reconfigure).
`);
  process.exit(1);
}

// ── Load chapter config ───────────────────────────────────────────────────────

const CONFIG_PATH = path.join(WEB_ROOT, 'dpbp-config.json');
const { chapters: CHAPTERS } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const CONTENT_OUT = path.join(WEB_ROOT, 'app/specialy/data-pro-budouci-premierku/_content');
const CHARTS_OUT  = path.join(WEB_ROOT, 'public/dpbp/charts');

// ── Load impact cards from BOOK.md ────────────────────────────────────────────
// BOOK.md has YAML frontmatter with chapters[].impact_cards for all chapters.

function loadBookCards() {
  const bookPath = path.join(SOURCE, 'BOOK.md');
  if (!fs.existsSync(bookPath)) return new Map();
  const { data } = matter(fs.readFileSync(bookPath, 'utf8'));
  const map = new Map();
  for (const ch of (data.chapters ?? [])) {
    if (ch.id && ch.impact_cards?.length) {
      map.set(String(ch.id), ch.impact_cards);
    }
  }
  return map;
}

// Split BOOK.md label ("53 %", "7,6 let", "1 : 200") into number + unit.
function parseLabel(label) {
  if (!label) return { number: '', unit: '' };
  if (label.includes(':')) return { number: label, unit: '' };
  const m = String(label).match(/^([+\-±]?\s*\d[\d\s,.]*)\s*(.*)?$/u);
  if (m) return { number: m[1].trim(), unit: (m[2] ?? '').trim() };
  return { number: String(label), unit: '' };
}

function convertBookCard(bookCard, accent) {
  const { number, unit } = parseLabel(bookCard.label);
  return {
    id: bookCard.id,
    number,
    unit,
    perUnit: '',
    label: bookCard.sublabel ?? '',
    sublabel: bookCard.sublabel ?? '',
    context: bookCard.description ?? '',
    source: (bookCard.source_note ?? '').replace(/^Zdroj:\s*/i, ''),
    accent,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mkdir(p) {
  fs.mkdirSync(p, { recursive: true });
}

/**
 * Transform source markdown to MDX for the web:
 * - Extract title (H1), excerpt (Příběh:), and primaryChart
 * - Strip BOOK-EXCLUDE blocks and inline markers
 * - Replace chart placeholder blocks with <VegaChart> JSX
 * - Build YAML frontmatter
 */
function transformArticle(raw, articleCfg, chapterCfg) {
  // Normalize CRLF → LF first — source files are sometimes saved with Windows
  // line endings, which breaks every regex below that matches a literal \n
  // (e.g. the chart-placeholder fence below silently fails to match and the
  // raw ```markdown fence + placeholder text leaks onto the page instead of
  // becoming a <VegaChart>).
  let text = raw.replace(/\r\n/g, '\n');

  // ── Extract title from H1 ──────────────────────────────────────────────────
  const titleMatch = text.match(/^#[^\n]+?:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // ── Extract excerpt from Příběh: ──────────────────────────────────────────
  const pribehMatch = text.match(/\*\*Příběh:\*\*\s*([^<\n]+)/);
  const excerpt = pribehMatch ? pribehMatch[1].trim() : '';

  // ── Strip BOOK-EXCLUDE-START … BOOK-EXCLUDE-END blocks ────────────────────
  text = text.replace(/<!--\s*BOOK-EXCLUDE-START\s*-->[\s\S]*?<!--\s*BOOK-EXCLUDE-END\s*-->/g, '');

  // ── Strip lines with <!-- BOOK-EXCLUDE --> ────────────────────────────────
  text = text.replace(/^.*<!--\s*BOOK-EXCLUDE\s*-->.*$/gm, '');

  // ── Strip verification/OK comments ────────────────────────────────────────
  text = text.replace(/^\*<!--.*?-->\*$/gm, '');
  text = text.replace(/<!--.*?-->/g, '');

  // ── Remove H1 title line ──────────────────────────────────────────────────
  text = text.replace(/^#[^\n]+\n/m, '');

  // ── Remove the leading --- separator ─────────────────────────────────────
  text = text.replace(/^---\n/m, '');

  // ── Replace chart placeholders ────────────────────────────────────────────
  text = text.replace(
    /```markdown\n>?\s*📊\s*\*\*VIZUALIZACE:\s*(\w+)\*\*[\s\S]*?```/g,
    (_, chartId) => `<VegaChart chartId="${chartId}" />`
  );
  text = text.replace(
    /^>?\s*📊\s*\*\*VIZUALIZACE:\s*(\w+)\*\*[^\n]*\n(?:>[^\n]*\n)*/gm,
    (_, chartId) => `<VegaChart chartId="${chartId}" />\n`
  );

  // ── Safety net: unwrap a stray ```markdown fence directly around a
  // <VegaChart /> tag. Catches any chart-placeholder formatting variant the
  // two replacements above don't anticipate, so a fence never leaks onto
  // the live page as raw text instead of rendering a chart.
  text = text.replace(
    /```markdown\n(<VegaChart[^\n]*\/>)\n```/g,
    (_, tag) => tag
  );

  // ── Clean up excessive blank lines ────────────────────────────────────────
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // ── Build frontmatter ─────────────────────────────────────────────────────
  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `author: "${chapterCfg.author}"`,
    `date: "${chapterCfg.date}"`,
    `primaryChart: "${articleCfg.primaryChart}"`,
    '---',
    '',
  ].join('\n');

  return fm + text;
}

function transformOnePager(raw, onePagerCfg, chapterCfg) {
  // Normalize CRLF → LF first — see comment in transformArticle.
  let text = raw.replace(/\r\n/g, '\n');

  // ── Extract title from H1 (flexible — handles all known formats) ──────────
  // Formats seen:  # EXECUTIVE ONE-PAGER: Topic (V2)
  //                # 🏥 PM ONE-PAGER: Topic
  //                # PM_ONE_PAGER_v2.md: Topic
  //                # PM ONE-PAGER: Topic (Kapitola 05)
  const h1Line = (text.match(/^#[^\n]+$/m)?.[0] ?? '').replace(/^#+\s*/, '').replace(/^[^\w\d"«(]+/, '');
  const colonMatch = h1Line.match(/(?:EXECUTIVE\s+ONE[-_\s]PAGER|PM[-_\s]ONE[-_\s]PAGER[^:]*|PM_ONE_PAGER[^:]*):\s*(.+)/i);
  let title = '';
  if (colonMatch) {
    title = colonMatch[1].trim()
      .replace(/^\d+\s+/, '')              // strip leading chapter number: "07 Oligarchizace" → "Oligarchizace"
      .replace(/\s*\([^)]*\)\s*$/, '')    // strip trailing (v2.0), (Kapitola 05)
      .replace(/\s+v\d[\w.]*\s*$/i, '')   // strip trailing v2.0
      .trim();
    if (title.length > 3 && title === title.toUpperCase()) {
      title = title.charAt(0) + title.slice(1).toLowerCase();
    }
  }
  if (!title) title = chapterCfg.title;

  // ── Extract excerpt: first key statement after the header separator ────────
  // Tries: **ZÁVĚR:** → first bold paragraph after --- → first bold key-value
  let excerpt = '';
  const zaveřMatch = text.match(/\*\*ZÁVĚR:\*\*\s*(.+)$/m);
  if (zaveřMatch) {
    excerpt = zaveřMatch[1].trim();
  } else {
    const afterSep = text.replace(/^[\s\S]*?^---$/m, '');
    for (const line of afterSep.split('\n')) {
      const clean = line.trim().replace(/^>\s*/, '');
      if (!clean.startsWith('**')) continue;
      // Key-value pair: **Short label:** long content
      const kvMatch = clean.match(/^\*\*([^*]{1,35})\*\*\s*[:：]\s*(.+)/);
      if (kvMatch) {
        const val = kvMatch[2].replace(/\*\*/g, '').trim();
        if (val.length >= 60) { excerpt = val.length > 250 ? val.slice(0, 247) + '…' : val; break; }
        continue;
      }
      // Full bold paragraph — use full content (not just first sentence) up to 250 chars
      const content = clean.replace(/\*\*/g, '').trim();
      if (content.length >= 60) {
        excerpt = content.length > 250 ? content.slice(0, 247) + '…' : content;
        break;
      }
    }
  }

  // ── Strip BOOK-EXCLUDE-START … BOOK-EXCLUDE-END blocks ────────────────────
  text = text.replace(/<!--\s*BOOK-EXCLUDE-START\s*-->[\s\S]*?<!--\s*BOOK-EXCLUDE-END\s*-->/g, '');
  text = text.replace(/^.*<!--\s*BOOK-EXCLUDE\s*-->.*$/gm, '');
  text = text.replace(/<!--.*?-->/g, '');

  // ── Strip STRATEGICKÝ GRAF blocks (chart specs, not renderable on web) ────
  text = text.replace(/^## (?:📊\s+)?STRATEGICKÝ GRAF:[\s\S]*?\n---\n/m, '');

  // Strip H1
  text = text.replace(/^#[^\n]+\n/m, '');

  // Strip leading --- separator
  text = text.replace(/^---\n/m, '');

  // Strip emoji prefixes from headings (## 🔋 Heading → ## Heading)
  text = text.replace(/^(#{1,4}\s+)[^\w\s[\(]*\s*/gmu, '$1');

  // Clean up excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `author: "${chapterCfg.author}"`,
    `date: "${chapterCfg.date}"`,
    `type: "one-pager"`,
    ...(onePagerCfg.logo ? [`logo: "${onePagerCfg.logo}"`] : []),
    '---',
    '',
  ].join('\n');

  return fm + text;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\nDPBP Sync`);
console.log(`  Source : ${SOURCE}`);
console.log(`  Config : ${CONFIG_PATH}`);
console.log(`  Content: ${CONTENT_OUT}`);
console.log(`  Charts : ${CHARTS_OUT}\n`);

mkdir(CHARTS_OUT);

const bookCards = loadBookCards();
let warnings = 0;

for (const ch of CHAPTERS) {
  const chSrc = path.join(SOURCE, ch.sourceDir);
  const chOut = path.join(CONTENT_OUT, ch.slug);
  mkdir(path.join(chOut, 'articles'));
  mkdir(path.join(chOut, 'cards'));

  // ── Impact cards from BOOK.md ─────────────────────────────────────────────
  const bookChapterCards = bookCards.get(ch.id) ?? [];
  const cardOrder = bookChapterCards.map(c => c.id);
  for (const bookCard of bookChapterCards) {
    const cardJson = convertBookCard(bookCard, ch.accent);
    fs.writeFileSync(path.join(chOut, 'cards', `${bookCard.id}.json`), JSON.stringify(cardJson, null, 2));
    console.log(`  [${ch.id}] cards/${bookCard.id}.json`);
  }

  // ── _meta.json ──────────────────────────────────────────────────────────
  const meta = {
    id: ch.id,
    slug: ch.slug,
    title: ch.title,
    accent: ch.accent,
    author: ch.author,
    date: ch.date,
    cardOrder,
    onePager: ch.onePager ? { slug: ch.onePager.slug, logo: ch.onePager.logo || null } : null,
    articles: ch.articles.map(a => ({
      slug: a.slug,
      primaryChart: a.primaryChart,
    })),
    ...(ch.intro ? { intro: ch.intro } : {}),
  };
  fs.writeFileSync(path.join(chOut, '_meta.json'), JSON.stringify(meta, null, 2));
  console.log(`  [${ch.id}] _meta.json`);

  // ── One-pager ────────────────────────────────────────────────────────────
  if (ch.onePager) {
    const srcPath = path.join(chSrc, '02_executive_briefs', ch.onePager.sourceFile);
    if (fs.existsSync(srcPath)) {
      const raw = fs.readFileSync(srcPath, 'utf8');
      const mdx = transformOnePager(raw, ch.onePager, ch);
      fs.writeFileSync(path.join(chOut, 'articles', `${ch.onePager.slug}.mdx`), mdx);
      console.log(`  [${ch.id}] articles/${ch.onePager.slug}.mdx (one-pager)`);
    } else {
      console.warn(`  [${ch.id}] MISSING one-pager: ${ch.onePager.sourceFile}`);
      warnings++;
    }
  }

  // ── Articles ─────────────────────────────────────────────────────────────
  for (const art of ch.articles) {
    const srcPath = path.join(chSrc, '03_primary_content', art.sourceFile);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  [${ch.id}] MISSING article: ${art.sourceFile}`);
      warnings++;
      continue;
    }
    const raw = fs.readFileSync(srcPath, 'utf8');
    const mdx = transformArticle(raw, art, ch);
    fs.writeFileSync(path.join(chOut, 'articles', `${art.slug}.mdx`), mdx);
    console.log(`  [${ch.id}] articles/${art.slug}.mdx`);
  }

  // ── Charts → public/ ─────────────────────────────────────────────────────
  const allCharts = ch.articles.flatMap(a => a.charts);
  for (const chartFile of allCharts) {
    const srcPath = path.join(chSrc, '_source_data/charts', `${chartFile}.json`);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  [${ch.id}] MISSING chart: ${chartFile}.json`);
      warnings++;
      continue;
    }
    // Strip _v1 suffix for the public filename (CHART_COAL_PRICE_v1 → CHART_COAL_PRICE)
    const pubName = chartFile.replace(/_v\d+$/, '');
    fs.copyFileSync(srcPath, path.join(CHARTS_OUT, `${pubName}.json`));
    console.log(`  [${ch.id}] public/dpbp/charts/${pubName}.json`);
  }
}

if (warnings > 0) {
  console.log(`\n⚠  Sync complete with ${warnings} missing file(s) — check warnings above.\n`);
} else {
  console.log('\n✓ Sync complete.\n');
}
