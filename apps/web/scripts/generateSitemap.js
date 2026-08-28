const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const baseUrl = 'https://www.mahdalova-skop.cz';
const articlesDir = path.join(__dirname, '../app/clanek/_articles');

// Kept in sync with EXCLUDED_SLUGS in app/clanek/[slug]/page.tsx – these
// folders are content sources only; their canonical page lives under
// /specialy/, and /clanek/[slug] deliberately won't generate a static route
// for them (output: export would 500 if it tried).
const EXCLUDED_SLUGS = [
  'data-pro-budouci-premierku-02-demografie',
  'data-pro-budouci-premierku-02-demografie-plodnost',
];

function getArticleSlugs() {
  try {
    const items = fs.readdirSync(articlesDir, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory() && !item.name.startsWith('zzz-') && !EXCLUDED_SLUGS.includes(item.name))
      .map(item => item.name)
      .sort();
  } catch (error) {
    console.error('Error reading articles directory:', error);
    return [];
  }
}

function getArticleDate(slug) {
  try {
    const indexPath = path.join(articlesDir, slug, 'index.md');
    const content = fs.readFileSync(indexPath, 'utf8');
    const { data } = matter(content);
    const value = data.dateModified ?? data.modified ?? data.date;
    const parsedDate = value ? new Date(value) : null;

    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  } catch (error) {
    console.error(`Error reading date for ${slug}:`, error);
  }
  return null;
}

function generateSitemap() {
  const slugs = getArticleSlugs();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';
  
  // Main sections
  const sections = ['analyzy', 'kontext', 'podcasty', 'kdo-jsme', 'klub'];
  sections.forEach(section => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${section}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Articles
  slugs.forEach(slug => {
    const lastmod = getArticleDate(slug);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/clanek/${slug}</loc>\n`;
    if (lastmod) {
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
    }
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated with ${slugs.length} articles at ${outputPath}`);
}

generateSitemap();
