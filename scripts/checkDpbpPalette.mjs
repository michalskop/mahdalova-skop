// Ověří, že paleta zadrátovaná v generátoru poutáků (tools/poutak-editor.html)
// souhlasí s kanonickým zdrojem apps/web/components/dpbp/dpbpChapters.json.
// Generátor je samostatné HTML otevírané přes file://, nemůže tedy JSON načíst
// za běhu a drží si vlastní kopii palety. Tento skript hlídá, aby se ty dvě
// kopie nikdy tiše nerozešly. Spouští se `npm run check:palette`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(root, 'apps/web/components/dpbp/dpbpChapters.json');
const htmlPath = path.join(root, 'tools/poutak-editor.html');

const canonical = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).chapters;
const html = fs.readFileSync(htmlPath, 'utf8');

// Řádky palety v generátoru mají tvar:  ['01','#de1743','Demografie','01-demografie'],
const rowRe = /\[\s*'(\d{2})'\s*,\s*'(#[0-9a-fA-F]{6})'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\]/g;
const inEditor = new Map();
for (const m of html.matchAll(rowRe)) {
  inEditor.set(m[1], { accent: m[2].toLowerCase(), title: m[3], slug: m[4] });
}

const problems = [];
if (inEditor.size !== canonical.length) {
  problems.push(`Počet kapitol: JSON ${canonical.length}, generátor ${inEditor.size}.`);
}
for (const ch of canonical) {
  const e = inEditor.get(ch.id);
  if (!e) { problems.push(`Kapitola ${ch.id} chybí v generátoru.`); continue; }
  if (e.accent !== ch.accent.toLowerCase())
    problems.push(`Kapitola ${ch.id}: barva JSON ${ch.accent} ≠ generátor ${e.accent}.`);
  if (e.slug !== ch.slug)
    problems.push(`Kapitola ${ch.id}: slug JSON ${ch.slug} ≠ generátor ${e.slug}.`);
  if (e.title !== ch.title)
    problems.push(`Kapitola ${ch.id}: název JSON „${ch.title}" ≠ generátor „${e.title}".`);
}

if (problems.length) {
  console.error('✗ Paleta generátoru se rozešla s dpbpChapters.json:\n  ' + problems.join('\n  '));
  console.error('\n  Sjednoťte pole CHAPTERS v tools/poutak-editor.html s kanonickým JSONem.');
  process.exit(1);
}
console.log(`✓ Paleta souhlasí – ${canonical.length} kapitol shodných v JSONu i generátoru.`);
