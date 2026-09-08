#!/usr/bin/env node
// Generates branded stat-card PNGs for social distribution from a per-article
// social.json config. See README.md for the config format and usage.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolvePreset } from './presets.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../..');
const TEMPLATE_PATH = path.join(HERE, 'template.html');

function findChromium() {
  const envPath = process.env.SOCIAL_CARDS_CHROMIUM;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const candidates = [
    '/snap/bin/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    'Nenašel jsem headless Chromium na obvyklých cestách. Nastav ' +
      'SOCIAL_CARDS_CHROMIUM=/cesta/k/chromium a spusť znovu.'
  );
}

function fillTemplate(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value ?? '');
  }
  return out;
}

function resolveArticleDir(arg) {
  if (path.isAbsolute(arg)) return arg;
  return path.join(REPO_ROOT, 'apps/web/app/clanek/_articles', arg);
}

function main() {
  const [articleArg, ...formatFilter] = process.argv.slice(2);
  if (!articleArg) {
    console.error(
      'Použití: node generate.mjs <slug-clanku> [formát ...]\n' +
        '  slug-clanku = název složky v apps/web/app/clanek/_articles/\n' +
        '  formát      = volitelně omezit jen na některé (viz presets.mjs); bez zadání se generují všechny z social.json'
    );
    process.exit(1);
  }

  const articleDir = resolveArticleDir(articleArg);
  const configPath = path.join(articleDir, 'social', 'social.json');
  if (!fs.existsSync(configPath)) {
    console.error(`Chybí konfigurace: ${configPath}`);
    console.error('Vytvoř ji podle tools/social-cards/example.social.json.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const chromium = findChromium();
  // Snap-confined Chromium (/snap/bin/chromium) can only read files under
  // $HOME, so the scratch dir must live inside the repo, not os.tmpdir().
  const tmpDir = path.join(HERE, '.tmp');
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  let count = 0;
  try {
    for (const card of config.cards ?? []) {
      const formats = formatFilter.length
        ? card.formats.filter((f) => formatFilter.includes(f))
        : card.formats;

      for (const formatName of formats) {
        const preset = resolvePreset(formatName);
        const html = fillTemplate(template, {
          WIDTH: preset.width,
          HEIGHT: preset.height,
          SITE: config.site ?? 'mahdalova-skop.cz',
          EYEBROW: card.eyebrow ?? config.eyebrow ?? '',
          HEADLINE_HTML: card.headline ?? '',
          CAPTION_HTML: card.caption ?? '',
          CHART_SVG: card.chartSvg ?? '',
          FOOTER: card.footer ?? config.footer ?? '',
        });

        const htmlPath = path.join(tmpDir, `${card.id}-${formatName}.html`);
        fs.writeFileSync(htmlPath, html, 'utf-8');

        const outDir = path.join(articleDir, 'social', formatName);
        fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, `${card.id}.png`);

        execFileSync(
          chromium,
          [
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--hide-scrollbars',
            `--window-size=${preset.width},${preset.height}`,
            '--virtual-time-budget=4000',
            `--screenshot=${outPath}`,
            `file://${htmlPath}`,
          ],
          { stdio: ['ignore', 'ignore', 'inherit'] }
        );

        // Chromium writes its own "file not found" error page as a normal
        // screenshot on failure (e.g. sandbox can't read htmlPath) instead
        // of exiting non-zero, so a byte-size sanity check catches it here
        // rather than shipping a blank card.
        const stat = fs.statSync(outPath);
        if (stat.size < 3000) {
          throw new Error(
            `${outPath} má jen ${stat.size} B — vypadá to na prázdný/chybový snímek, ne vykreslenou kartu.`
          );
        }

        console.log(
          `✓ ${formatName.padEnd(20)} ${card.id.padEnd(16)} -> ${path.relative(REPO_ROOT, outPath)} (${preset.width}×${preset.height})`
        );
        count++;
      }
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`\nHotovo: ${count} obrázků.`);
}

main();
