#!/usr/bin/env node
/**
 * setup-dpbp.mjs — Configure the local path to the data-pro-premierku source repo.
 *
 * Saves DPBP_SOURCE to .env.local (gitignored). Run once per machine.
 *
 * Usage:
 *   npm run setup:dpbp
 *   npm run setup:dpbp -- /absolute/path/to/data-pro-premierku
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(WEB_ROOT, '.env.local');

function save(sourcePath) {
  const resolved = path.resolve(sourcePath);
  if (!fs.existsSync(resolved)) {
    console.error(`\n  ✗ Directory not found: ${resolved}\n`);
    process.exit(1);
  }

  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  // Replace existing DPBP_SOURCE line or append
  if (/^DPBP_SOURCE=/m.test(content)) {
    content = content.replace(/^DPBP_SOURCE=.*$/m, `DPBP_SOURCE=${resolved}`);
  } else {
    content = content.replace(/\n*$/, '') + `\nDPBP_SOURCE=${resolved}\n`;
  }
  fs.writeFileSync(ENV_PATH, content);
  console.log(`\n  ✓ DPBP_SOURCE saved to .env.local\n    ${resolved}\n`);
  console.log(`  Run \`npm run sync:dpbp\` to pull content into the web project.\n`);
}

// Accept path as CLI argument: npm run setup:dpbp -- /path
const arg = process.argv[2];
if (arg) {
  save(arg);
  process.exit(0);
}

// Interactive prompt
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Show current value if set
function readEnvLocal() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const vars = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return vars;
}

const current = readEnvLocal().DPBP_SOURCE;
const prompt = current
  ? `  Path to data-pro-premierku [current: ${current}]: `
  : `  Path to data-pro-premierku: `;

console.log('\n  DPBP Setup — configure your local source directory\n');
rl.question(prompt, answer => {
  rl.close();
  const input = answer.trim() || current;
  if (!input) {
    console.error('\n  ✗ No path provided.\n');
    process.exit(1);
  }
  save(input);
});
