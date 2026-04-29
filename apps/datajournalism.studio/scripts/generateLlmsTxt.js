const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.datajournalism.studio';
const articlesDir = path.join(__dirname, '../app/a/_articles');

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
    const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
    
    return {
      slug,
      title: titleMatch ? titleMatch[1] : slug,
      date: dateMatch ? new Date(dateMatch[1]) : new Date(),
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
  
  // Build llms.txt content
  let content = `# DataJournalism.Studio

> Election forecasting, data analysis, and electoral forensics by Michal Škop. Unique models for predicting election results worldwide.

## About

DataJournalism.Studio specializes in election forecasting and data-driven political analysis. We develop proprietary models for predicting election outcomes and analyzing electoral data.

- Web: ${baseUrl}
- Author: Michal Škop
- Focus: election forecasting, electoral forensics, data visualization

## Main Sections

### Election Models
${baseUrl}/a/unique-election-model
Our unique methodology for election forecasting and predictions.

### Real-Time Predictions
${baseUrl}/a/elections-real-time-predictions
Live election prediction systems that update as results come in.

### Electoral Forensics
${baseUrl}/a/elections-forensic-analysis
Statistical methods for detecting electoral irregularities.

### Data Visualization
${baseUrl}/a/elections-maps-of-results
Interactive maps and visualizations of election results.

## Featured Articles

`;

  // Add articles by topic
  const topicsMap = {
    'Election Models & Methodology': ['model', 'prediction', 'forecast', 'methodology'],
    'Czech Elections': ['czech', 'česk', 'volby-cr'],
    'International Elections': ['usa', 'canada', 'romania', 'austria', 'germany', 'uk'],
    'Electoral Forensics': ['forensic', 'fraud', 'irregularit'],
    'Data Visualization': ['map', 'cartogram', 'visualization', 'chart']
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
        content += `- ${baseUrl}/a/${a.slug}\n`;
      });
      content += '\n';
    }
  }

  // Add recent articles
  content += `### Recent Articles\n`;
  articles.slice(0, 5).forEach(a => {
    content += `- ${baseUrl}/a/${a.slug}\n`;
  });
  content += '\n';

  content += `## Contact

- Email: michal@datajournalism.studio
- Web: ${baseUrl}
`;

  const outputPath = path.join(__dirname, '../public/llms.txt');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`llms.txt generated with ${articles.length} articles at ${outputPath}`);
}

generateLlmsTxt();
