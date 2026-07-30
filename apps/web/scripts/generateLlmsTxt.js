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
    const { data } = matter(content);
    const parsedDate = data.date ? new Date(data.date) : null;

    return {
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      date: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date(0),
      tags: Array.isArray(data.tags)
        ? data.tags.filter(tag => typeof tag === 'string')
        : [],
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
  
  // Build llms.txt content
  let content = `# Mahdalová & Škop

> Datová žurnalistika, analýzy a komentáře k politice, společnosti a ekonomice. Kateřina Mahdalová a Michal Škop přinášejí fact-checkované analýzy založené na datech.

## O nás

Mahdalová & Škop je projekt datové žurnalistiky zaměřený na politické a společenské analýzy. Kombinujeme datovou vědu, statistiku a žurnalistiku pro hlubší pochopení aktuálních témat.

- Web: ${baseUrl}
- Autoři: Kateřina Mahdalová, Michal Škop
- Zaměření: datová žurnalistika, politické analýzy, fact-checking

## Hlavní sekce

- [Analýzy](${baseUrl}/analyzy): Datově podložené rozbory politických, ekonomických a společenských témat.
- [Kontext](${baseUrl}/kontext): Kontextové články vysvětlující složitá témata a souvislosti.
- [Podcasty](${baseUrl}/podcasty): Audio rozhovory a diskuse k aktuálním tématům.
- [Speciály](${baseUrl}/specialy): Tematické datové projekty, investigace a dlouhodobé série.
- [O autorech](${baseUrl}/kdo-jsme): Redakční profily, kontakty a informace o projektu.

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
        content += `- [${a.title}](${baseUrl}/clanek/${a.slug})\n`;
      });
      content += '\n';
    }
  }

  content += `## Kontakt

- [O autorech a kontakt](${baseUrl}/kdo-jsme)
- [Kateřina Mahdalová](${baseUrl}/autor/katerina-mahdalova)
- [Michal Škop](${baseUrl}/autor/michal-skop)
`;

  const outputPath = path.join(__dirname, '../public/llms.txt');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`llms.txt generated with ${articles.length} articles at ${outputPath}`);
}

generateLlmsTxt();
