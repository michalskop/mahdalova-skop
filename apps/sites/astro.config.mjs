import { defineConfig } from 'astro/config';
import { sites, currentSiteId } from './src/sites/index.ts';

// One app, built once per domain: SITE=org|eu|at (default org).
// Independent of apps/web on purpose: separate package.json, no article pipeline.
const site = sites[currentSiteId(process.env.SITE)];

export default defineConfig({
  site: `https://${site.domain}`,
  output: 'static',
  // usePolling: avoids "EMFILE: too many open files" when several dev servers run at once.
  vite: { server: { fs: { allow: ['../..'] }, watch: { usePolling: true, interval: 500 } } },
});
