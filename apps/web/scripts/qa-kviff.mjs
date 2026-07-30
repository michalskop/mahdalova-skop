import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
const baseUrl = process.env.KVIFF_QA_BASE_URL ?? 'http://localhost:3001';
const outputDir = process.env.KVIFF_QA_OUTPUT_DIR
  ? path.resolve(process.env.KVIFF_QA_OUTPUT_DIR)
  : path.join(REPO_ROOT, 'test-results', 'kviff');

fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.KVIFF_QA_EXECUTABLE_PATH
    ? { executablePath: process.env.KVIFF_QA_EXECUTABLE_PATH }
    : { channel: process.env.KVIFF_QA_BROWSER_CHANNEL ?? 'chrome' }),
});
const pages = [
  ['landing', '/specialy/kviff'],
  ['oceneni', '/specialy/kviff/oceneni'],
  ['filmy', '/specialy/kviff/filmy-a-svet'],
  ['penize', '/specialy/kviff/festival-a-penize'],
];
const results = [];

for (const [name, path] of pages) {
  for (const [device, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim(),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      emptyLinks: [...document.querySelectorAll('a')].filter((a) => !a.textContent?.trim() && !a.getAttribute('aria-label')).length,
      emptyLinkHrefs: [...document.querySelectorAll('a')]
        .filter((a) => !a.textContent?.trim() && !a.getAttribute('aria-label'))
        .map((a) => a.getAttribute('href')),
      helpCursors: [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).cursor === 'help').length,
    }));
    await page.screenshot({
      path: path.join(outputDir, `qa-${name}-${device}.png`),
      fullPage: true,
    });
    results.push({ name, device, ...metrics, errors });
    await page.close();
  }
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
