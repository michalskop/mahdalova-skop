const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

function checkVerificationStatus() {
  const slugs = getArticleSlugs();
  const unverified = [];

  slugs.forEach(slug => {
    const indexPath = path.join(articlesDir, slug, 'index.md');
    try {
      const { data } = matter(fs.readFileSync(indexPath, 'utf8'));
      const checkedBy = data.verification?.checkedBy;
      const checkedAt = data.verification?.checkedAt;
      if (!checkedBy || !checkedAt) {
        unverified.push({ slug, title: data.title || slug });
      }
    } catch (error) {
      console.error(`Error reading verification status for ${slug}:`, error);
    }
  });

  if (unverified.length > 0) {
    console.warn(`\n⚠ ${unverified.length}/${slugs.length} articles are missing an editorial "verification" sign-off (see docs/fact-checking-proces.md):`);
    unverified.forEach(({ slug, title }) => console.warn(`  - ${slug} — ${title}`));
    console.warn('  Add to frontmatter once checked: verification: { checkedBy: "...", checkedAt: "YYYY-MM-DD" }\n');
  } else {
    console.log(`All ${slugs.length} articles have an editorial verification sign-off.`);
  }
}

checkVerificationStatus();
