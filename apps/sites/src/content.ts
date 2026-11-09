// Content lookup: site folder first, then the site's language folder.
//   texts/<site>/<name>.md  →  texts/<lang>/<name>.md
import { site } from './sites/index.ts';

const files = import.meta.glob('./texts/*/*.md', { eager: true }) as Record<string, any>;

export function getPage(name: string) {
  return files[`./texts/${site.id}/${name}.md`] ?? files[`./texts/${site.lang}/${name}.md`] ?? null;
}

// Impact materials: this site's language folder + this site's own folder.
// A material can limit itself with `domains: [org, eu]`.
export function getImpact() {
  return Object.entries(files)
    .filter(([p]) => /\/impact-[^/]+\.md$/.test(p))
    .filter(([p]) => p.includes(`/texts/${site.lang}/`) || p.includes(`/texts/${site.id}/`))
    .map(([, m]) => m)
    .filter((m) => !m.frontmatter.domains || m.frontmatter.domains.includes(site.id))
    .sort((a, b) => String(b.frontmatter.date).localeCompare(String(a.frontmatter.date)));
}
