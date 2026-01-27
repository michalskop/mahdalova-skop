const fs = require('fs-extra');
const path = require('path');

async function copyImages() {
  const sourceDir = path.join(process.cwd(), 'app/clanek/_articles');
  const targetDir = path.join(process.cwd(), 'public/clanek/_articles');

  try {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    
    // Copy all images from article directories
    const articleDirs = await fs.readdir(sourceDir);
    for (const articleDir of articleDirs) {
      const sourcePath = path.join(sourceDir, articleDir, 'images');
      const targetPath = path.join(targetDir, articleDir, 'images');

      const articleSourceDir = path.join(sourceDir, articleDir);
      const articleTargetDir = path.join(targetDir, articleDir);
      await fs.ensureDir(articleTargetDir);
      
      if (await fs.pathExists(sourcePath)) {
        console.log(`Copying images from ${sourcePath} to ${targetPath}`);
        await fs.copy(sourcePath, targetPath);
      }

      // Copy any top-level JSON files (e.g. data.json for htmlInclude embeds)
      const entries = await fs.readdir(articleSourceDir);
      for (const entry of entries) {
        if (!entry.toLowerCase().endsWith('.json')) continue;
        const jsonSourcePath = path.join(articleSourceDir, entry);
        const jsonTargetPath = path.join(articleTargetDir, entry);
        await fs.copy(jsonSourcePath, jsonTargetPath);
      }
    }
    console.log('Images copied successfully');
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

copyImages();