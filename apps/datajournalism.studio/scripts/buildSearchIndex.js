// Build pagefind search index from MDX source files.
// Article content is client-side rendered so pagefind can't crawl the HTML output.
// This script reads the source MDX directly, strips markup, and feeds it to pagefind.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

const articlesDir = path.join(process.cwd(), 'app/a/_articles');
const tempDir = path.join(process.cwd(), 'out/_search_temp');
const outputDir = path.join(process.cwd(), 'out/pagefind');

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')           // fenced code blocks
    .replace(/`[^`\n]+`/g, '')                 // inline code
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')    // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links → keep text
    .replace(/<[^>]+>/g, ' ')                  // HTML/JSX tags
    .replace(/^#{1,6}\s+/gm, '')               // headings
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')       // bold
    .replace(/\*([^*\n]+)\*/g, '$1')           // italic
    .replace(/^[-*+]\s+/gm, '')                // unordered list markers
    .replace(/^\d+\.\s+/gm, '')                // ordered list markers
    .replace(/\|[^\n]+\|/g, ' ')               // table rows
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const slugs = fs.readdirSync(articlesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

fs.mkdirSync(path.join(tempDir, 'a'), { recursive: true });

let count = 0;
for (const slug of slugs) {
  const mdPath = path.join(articlesDir, slug, 'index.md');
  if (!fs.existsSync(mdPath)) continue;

  const raw = fs.readFileSync(mdPath, 'utf8');
  const { data, content } = matter(raw);

  // Skip demo/test articles
  if (slug.startsWith('zzz-')) continue;

  const title = escapeHtml(data.title || slug);
  const excerpt = escapeHtml(data.excerpt || '');
  const body = escapeHtml(stripMarkdown(content));

  const html = `<!DOCTYPE html>
<html lang="en">
<head><title>${title}</title></head>
<body>
<article data-pagefind-body>
<h1 data-pagefind-meta="title">${title}</h1>
<p>${excerpt}</p>
<div>${body}</div>
</article>
</body>
</html>`;

  fs.writeFileSync(path.join(tempDir, 'a', `${slug}.html`), html);
  count++;
}

console.log(`[search index] Generated HTML for ${count} articles`);

try {
  execSync(
    `npx pagefind --site "${tempDir}" --output-path "${outputDir}"`,
    { stdio: 'inherit' }
  );
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
