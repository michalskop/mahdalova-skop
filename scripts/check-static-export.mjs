// scripts/check-static-export.mjs
//
// Static-export smoke test. Run after `npm run build`:
//
//   node scripts/check-static-export.mjs
//
// Verifies that the exported HTML in apps/*/out contains real, server-rendered
// editorial content – not just an application shell. Guards against
// regressions such as client-only "mounted" gates that blank the whole page
// during static generation.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Minimum visible text length (chars) for a content page to count as non-empty. */
const MIN_TEXT_LENGTH = 1500;

/**
 * Route matrix. `mustContain` strings are checked against visible text
 * (HTML tags stripped), `mustContainHtml` against the raw HTML.
 */
const apps = [
  {
    name: 'web',
    outDir: path.join(repoRoot, 'apps', 'web', 'out'),
    articlesDir: path.join(repoRoot, 'apps', 'web', 'app', 'clanek', '_articles'),
    routes: [
      {
        file: 'index.html',
        label: 'homepage',
        mustContain: ['Analýzy', 'Kontext', 'Podcasty'],
        mustContainHtml: ['<h1', 'href="/analyzy'],
      },
      {
        file: 'kdo-jsme.html',
        label: 'about page + ContactsBlock',
        mustContain: ['Kontakty', 'Kateřina Mahdalová', 'Michal Škop'],
      },
      {
        file: 'analyzy.html',
        label: 'article listing',
        mustContain: ['Analýzy'],
        mustContainHtml: ['href="/clanek/'],
      },
      {
        file: 'specialy/kviff.html',
        label: 'special-project landing page',
        minTextLength: 800,
      },
      // Articles: expected <h1> text is read from the article front matter, so
      // the assertions stay in sync with the content files.
      {
        article: 'komentar-2025-01-09-hitler-nebyl-komunista',
        label: 'plain markdown article',
      },
      {
        article: 'analyza-2026-03-18-poslanci-chteji-zprisnit-dohled-nad-neziskovkami',
        label: 'article with custom MDX components (PartyFace, StyledTable, RelatedArticles)',
      },
      {
        article: 'explainer-2026-02-18-jak-zmanipulovane-video-rozhybalo-pet-evropskych-vlad',
        label: 'article with Timeline component',
      },
      {
        article: 'analyza-2026-06-29-ucast-na-snemovnich-vyborech',
        label: 'article with chart component (AttendanceSwarm)',
      },
      {
        file: '404.html',
        label: 'not-found page',
        minTextLength: 50,
      },
    ],
    articleRoute: (slug) => path.join('clanek', `${slug}.html`),
  },
  {
    name: 'datajournalism.studio',
    outDir: path.join(repoRoot, 'apps', 'datajournalism.studio', 'out'),
    articlesDir: path.join(repoRoot, 'apps', 'datajournalism.studio', 'app', 'a', '_articles'),
    routes: [
      {
        file: 'index.html',
        label: 'homepage',
        mustContain: ['Featured Work', 'Articles'],
        mustContainHtml: ['<h1'],
      },
      {
        file: 'about.html',
        label: 'about page + ContactsBlock',
        mustContain: ['Kateřina Mahdalová', 'Michal Škop'],
      },
      {
        article: '2025-05-20-money-from-nowhere-the-mysterious-millions-of-mep-turek',
        label: 'standard article',
      },
      {
        article: 'zzz-demo-scrollytelling-v1',
        label: 'article with ScrollyTelling component',
      },
      {
        file: '404.html',
        label: 'not-found page',
        minTextLength: 50,
      },
    ],
    articleRoute: (slug) => path.join('a', `${slug}.html`),
  },
];

/** Crude but dependency-free: strip scripts/styles/tags, decode a few entities. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function readFrontMatterTitle(articlesDir, slug) {
  const mdPath = path.join(articlesDir, slug, 'index.md');
  const raw = fs.readFileSync(mdPath, 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) throw new Error(`No front matter in ${mdPath}`);
  const title = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (!title) throw new Error(`No title in front matter of ${mdPath}`);
  return title[1];
}

let failures = 0;
let checks = 0;

function fail(appName, label, message) {
  failures += 1;
  console.error(`  FAIL [${appName}] ${label}: ${message}`);
}

for (const app of apps) {
  console.log(`\n== ${app.name} (${path.relative(repoRoot, app.outDir)}) ==`);

  if (!fs.existsSync(app.outDir)) {
    fail(app.name, 'export directory', `${app.outDir} does not exist – run the build first`);
    continue;
  }

  for (const route of app.routes) {
    checks += 1;
    const relFile = route.article ? app.articleRoute(route.article) : route.file;
    const label = route.label + (route.article ? ` (${route.article})` : ` (${route.file})`);
    const filePath = path.join(app.outDir, relFile);

    if (!fs.existsSync(filePath)) {
      fail(app.name, label, `missing file ${relFile}`);
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf8');
    const text = visibleText(html);
    const problems = [];

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (!titleMatch || titleMatch[1].trim().length === 0) {
      problems.push('missing or empty <title>');
    }

    const minLength = route.minTextLength ?? MIN_TEXT_LENGTH;
    if (text.length < minLength) {
      problems.push(`visible text too short (${text.length} < ${minLength} chars) – page is an empty shell`);
    }

    const mustContain = [...(route.mustContain ?? [])];
    if (route.article) {
      const title = readFrontMatterTitle(app.articlesDir, route.article);
      mustContain.push(title);
      if (!new RegExp('<h1[^>]*>').test(html)) {
        problems.push('no <h1> element in exported HTML');
      }
    }

    for (const needle of mustContain) {
      if (!text.includes(needle)) {
        problems.push(`visible text missing ${JSON.stringify(needle)}`);
      }
    }

    for (const needle of route.mustContainHtml ?? []) {
      if (!html.includes(needle)) {
        problems.push(`HTML missing ${JSON.stringify(needle)}`);
      }
    }

    if (problems.length > 0) {
      fail(app.name, label, problems.join('; '));
    } else {
      console.log(`  ok   ${label} – ${text.length} chars of visible text`);
    }
  }
}

console.log(`\n${checks} routes checked, ${failures} failure(s)`);
if (failures > 0) {
  process.exit(1);
}
