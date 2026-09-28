// Pre-commit: nově přidaný článek (apps/*/app/{clanek,a}/_articles/<slug>/index.md)
// bez `time` dostane do frontmatteru aktuální pražský čas, např. `time: "14:30"`.
// Pole je skryté – slouží jen k řazení (getArticles, pořadí Volby × Výběr na
// homepage) a nikam se nevypisuje. Existující `time` se nikdy nepřepisuje;
// článek s budoucím datem (naplánovaný / testovací) se přeskočí.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ARTICLE_RE = /^apps\/[^/]+\/app\/(clanek|a)\/_articles\/[^/]+\/index\.md$/;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const root = git('rev-parse', '--show-toplevel').trim();
const added = git('diff', '--cached', '--name-only', '--diff-filter=A', '-z')
  .split('\0')
  .filter((f) => ARTICLE_RE.test(f));

if (added.length === 0) process.exit(0);

const now = Object.fromEntries(
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Prague',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .map((p) => [p.type, p.value]),
);
const today = `${now.year}-${now.month}-${now.day}`;
const time = `${now.hour}:${now.minute}`;

for (const rel of added) {
  const file = path.join(root, rel);
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm || /^time\s*:/m.test(fm[1])) continue;

  const dateLine = fm[1].match(/^date\s*:\s*["']?(\d{4}-\d{2}-\d{2})["']?.*$/m);
  if (!dateLine || dateLine[1] > today) continue;

  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const newFm = fm[1].replace(dateLine[0], `${dateLine[0]}${eol}time: "${time}"`);
  fs.writeFileSync(file, src.replace(fm[1], newFm));
  git('add', '--', rel);
  console.log(`[publish-time] ${rel}: time: "${time}" (Praha)`);
}
