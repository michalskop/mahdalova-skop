#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.join(__dirname, '..', '_content');
const CHARTS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'public', 'specialy', 'dpbp', 'charts');

let hasError = false;

try {
  const chapters = fs.readdirSync(CONTENT_ROOT).filter(d =>
    fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory()
  );

  // ---------- 1. Article reference validation ----------
  console.log('=== 1. Article references (openerArticle, tiles, postSupportTiles, onePager -> articles/*.mdx) ===');

  let totalRefs = 0;
  let missingRefs = 0;
  const referencedSlugsByChapter = {};
  const chartRefs = new Set();

  const collectTileRefs = (tiles, refs) => {
    if (!Array.isArray(tiles)) return;
    for (const tile of tiles) {
      if (tile.slug) refs.push(tile.slug);
      if (Array.isArray(tile.related)) {
        for (const rel of tile.related) {
          if (rel.slug) refs.push(rel.slug);
        }
      }
    }
  };

  for (const chapter of chapters) {
    referencedSlugsByChapter[chapter] = new Set();

    const metaPath = path.join(CONTENT_ROOT, chapter, '_meta.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`  WARNING: No _meta.json for chapter ${chapter}`);
      continue;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const refs = [];

    if (meta.openerArticle) refs.push(meta.openerArticle);
    collectTileRefs(meta.tiles, refs);
    collectTileRefs(meta.postSupportTiles, refs);
    if (meta.onePager && meta.onePager.slug) refs.push(meta.onePager.slug);

    if (meta.introChart) chartRefs.add(meta.introChart);

    for (const slug of refs) {
      totalRefs++;
      referencedSlugsByChapter[chapter].add(slug);
      const articlePath = path.join(CONTENT_ROOT, chapter, 'articles', `${slug}.mdx`);
      if (!fs.existsSync(articlePath)) {
        console.error(`  MISSING: ${chapter}/${slug}.mdx`);
        missingRefs++;
      }
    }
  }

  console.log(`  ${totalRefs} references checked, ${missingRefs} missing.`);
  if (missingRefs > 0) hasError = true;

  // ---------- 2. Chart validation ----------
  console.log('\n=== 2. Charts (chartId=, primaryChart:, introChart -> public/specialy/dpbp/charts/*.json) ===');

  for (const chapter of chapters) {
    const articlesDir = path.join(CONTENT_ROOT, chapter, 'articles');
    if (!fs.existsSync(articlesDir)) continue;

    for (const file of fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'))) {
      const text = fs.readFileSync(path.join(articlesDir, file), 'utf8');

      for (const m of text.matchAll(/chartId=["']([^"']+)["']/g)) {
        chartRefs.add(m[1]);
      }

      const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (frontmatter) {
        const primaryChart = frontmatter[1].match(/primaryChart:\s*["']([^"']*)["']/);
        if (primaryChart && primaryChart[1]) chartRefs.add(primaryChart[1]);
      }
    }
  }

  let availableCharts = [];
  try {
    availableCharts = fs.readdirSync(CHARTS_ROOT)
      .filter(f => f.endsWith('.json'))
      .map(f => f.slice(0, -'.json'.length));
  } catch (e) {
    console.error(`  ERROR reading charts directory ${CHARTS_ROOT}: ${e.message}`);
    hasError = true;
  }
  const availableChartSet = new Set(availableCharts);

  let danglingCharts = 0;
  for (const id of chartRefs) {
    if (!availableChartSet.has(id)) {
      console.error(`  DANGLING: chart id "${id}" is referenced but has no matching public/specialy/dpbp/charts/${id}.json`);
      danglingCharts++;
    }
  }
  if (danglingCharts > 0) hasError = true;

  const orphanCharts = availableCharts.filter(id => !chartRefs.has(id));

  console.log(`  ${chartRefs.size} chart ids referenced, ${availableCharts.length} spec files found, ${danglingCharts} dangling, ${orphanCharts.length} orphan.`);
  if (orphanCharts.length > 0) {
    console.warn(`  WARNING (orphan, not referenced by any chartId/primaryChart/introChart): ${orphanCharts.join(', ')}`);
  }

  // ---------- 3. Orphan article validation ----------
  console.log('\n=== 3. Orphan articles (articles/*.mdx not referenced by any _meta.json field) ===');

  const orphanArticles = [];
  for (const chapter of chapters) {
    const articlesDir = path.join(CONTENT_ROOT, chapter, 'articles');
    if (!fs.existsSync(articlesDir)) continue;

    const referenced = referencedSlugsByChapter[chapter] ?? new Set();
    for (const file of fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'))) {
      const slug = file.slice(0, -'.mdx'.length);
      if (!referenced.has(slug)) {
        orphanArticles.push(`${chapter}/${slug}.mdx`);
      }
    }
  }

  console.log(`  ${orphanArticles.length} orphan article(s) found.`);
  if (orphanArticles.length > 0) {
    console.warn(`  WARNING: ${orphanArticles.join(', ')}`);
  }

  // ---------- Summary ----------
  console.log('\n=== SUMMARY ===');
  console.log(`  Article references : ${totalRefs} checked, ${missingRefs} missing`);
  console.log(`  Charts              : ${chartRefs.size} referenced, ${availableCharts.length} spec files, ${danglingCharts} dangling, ${orphanCharts.length} orphan`);
  console.log(`  Orphan articles     : ${orphanArticles.length}`);
  console.log(`\n${hasError ? 'FAIL' : 'PASS'}`);

  process.exit(hasError ? 1 : 0);
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(1);
}
