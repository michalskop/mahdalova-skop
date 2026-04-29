const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.mahdalova-skop.cz';
const articlesDir = path.join(__dirname, '../app/clanek/_articles');

function getArticleSlugs() {
  try {
    const items = fs.readdirSync(articlesDir, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory() && !item.name.startsWith('zzz-'))
      .map(item => item.name);
  } catch (error) {
    console.error('Error reading articles directory:', error);
    return [];
  }
}

function getArticleDate(slug) {
  try {
    const indexPath = path.join(articlesDir, slug, 'index.md');
    const content = fs.readFileSync(indexPath, 'utf8');
    const dateMatch = content.match(/date:\s*["']([^"']+)["']/);
    if (dateMatch) {
      return new Date(dateMatch[1]).toISOString();
    }
  } catch (error) {
    console.error(`Error reading date for ${slug}:`, error);
  }
  return new Date().toISOString();
}

function generateSitemap() {
  const slugs = getArticleSlugs();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';
  
  // Main sections
  const sections = ['analyzy', 'kontext', 'podcasty', 'kdo-jsme'];
  sections.forEach(section => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${section}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Articles
  slugs.forEach(slug => {
    const lastmod = getArticleDate(slug);
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/clanek/${slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
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
