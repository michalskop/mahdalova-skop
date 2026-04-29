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

function getArticleMetadata(slug) {
  try {
    const indexPath = path.join(articlesDir, slug, 'index.md');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const dateMatch = content.match(/date:\s*["']([^"']+)["']/);
    const filterMatch = content.match(/filter:\s*["']([^"']+)["']/);
    const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
    
    return {
      slug,
      title: titleMatch ? titleMatch[1] : slug,
      date: dateMatch ? new Date(dateMatch[1]) : new Date(),
      filter: filterMatch ? filterMatch[1] : 'Ostatní',
      tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')) : []
    };
  } catch (error) {
    console.error(`Error reading metadata for ${slug}:`, error);
    return null;
  }
}

function generateLlmsTxt() {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map(getArticleMetadata)
    .filter(a => a !== null)
    .sort((a, b) => b.date - a.date); // Sort by date, newest first
  
  // Group articles by category
  const categories = {
    'Analýzy': articles.filter(a => a.filter === 'Analýzy'),
    'Kontext': articles.filter(a => a.filter === 'Kontext'),
    'Komentáře': articles.filter(a => a.filter === 'Komentář'),
    'Podcasty': articles.filter(a => a.filter === 'Podcast'),
  };
  
  // Build llms.txt content
  let content = `# Mahdalová & Škop

> Datová žurnalistika, analýzy a komentáře k politice, společnosti a ekonomice. Kateřina Mahdalová a Michal Škop přinášejí fact-checkované analýzy založené na datech.

## O nás

Mahdalová & Škop je projekt datové žurnalistiky zaměřený na politické a společenské analýzy. Kombinujeme datovou vědu, statistiku a žurnalistiku pro hlubší pochopení aktuálních témat.

- Web: ${baseUrl}
- Autoři: Kateřina Mahdalová, Michal Škop
- Zaměření: datová žurnalistika, politické analýzy, fact-checking

## Hlavní sekce

### Analýzy
${baseUrl}/analyzy
Datově podložené rozbory politických, ekonomických a společenských témat.

### Kontext
${baseUrl}/kontext
Kontextové články vysvětlující složitá témata a souvislosti.

### Komentáře
${baseUrl}/komentar
Názorové komentáře k aktuálnímu dění.

### Podcasty
${baseUrl}/podcasty
Audio rozhovory a diskuse k aktuálním tématům.

### Volby
${baseUrl}/volby
Volební modely, kalkulačky a predikce výsledků voleb.

## Vybrané články

`;

  // Add top articles from each category
  const topicsMap = {
    'Volební analýzy a modely': ['volby', 'voleb', 'kalkulačka', 'predikce', 'mandaty'],
    'Ekonomika a ceny': ['benzin', 'ceny', 'inflace', 'ekonom', 'rozpočet'],
    'Mezinárodní politika': ['izrael', 'palestin', 'ukrajin', 'usa', 'eu', 'nato'],
    'Dezinformace a média': ['dezinformace', 'video', 'média', 'fake'],
    'Vzdělávání a společnost': ['vzdělávání', 'škol', 'student', 'zdraví'],
    'Technologie a AI': ['ai', 'technolog', 'umělá inteligence']
  };

  for (const [topic, keywords] of Object.entries(topicsMap)) {
    const topicArticles = articles.filter(a => 
      keywords.some(kw => 
        a.slug.toLowerCase().includes(kw) || 
        a.title.toLowerCase().includes(kw) ||
        a.tags.some(tag => tag.toLowerCase().includes(kw))
      )
    ).slice(0, 3); // Top 3 per topic

    if (topicArticles.length > 0) {
      content += `### ${topic}\n`;
      topicArticles.forEach(a => {
        content += `- ${baseUrl}/clanek/${a.slug}\n`;
      });
      content += '\n';
    }
  }

  content += `## Kontakt

- Email: info@mahdalova-skop.cz
- Twitter/X: @data_zurnalist
- Podpora: ${baseUrl}/podporte-nas
`;

  const outputPath = path.join(__dirname, '../public/llms.txt');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`llms.txt generated with ${articles.length} articles at ${outputPath}`);
}

generateLlmsTxt();
