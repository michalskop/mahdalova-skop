const fs = require('fs-extra');
const path = require('path');

async function copyImages() {
  const sourceDir = path.join(process.cwd(), 'app/a/_articles');
  const targetDir = path.join(process.cwd(), 'public/a/_articles');

  try {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    
    // Copy all images from article directories
    const articleDirs = await fs.readdir(sourceDir);
    for (const articleDir of articleDirs) {
      const sourcePath = path.join(sourceDir, articleDir, 'images');
      const targetPath = path.join(targetDir, articleDir, 'images');
      
      if (await fs.pathExists(sourcePath)) {
        console.log(`Copying images from ${sourcePath} to ${targetPath}`);
        await fs.copy(sourcePath, targetPath);
      }

      const articleSourceDir = path.join(sourceDir, articleDir);
      const articleTargetDir = path.join(targetDir, articleDir);
      const files = await fs.readdir(articleSourceDir);
      for (const file of files) {
        if (!file.toLowerCase().endsWith('.json')) continue;
        const jsonSourcePath = path.join(articleSourceDir, file);
        const jsonTargetPath = path.join(articleTargetDir, file);

        console.log(`Copying JSON from ${jsonSourcePath} to ${jsonTargetPath}`);
        await fs.copy(jsonSourcePath, jsonTargetPath);
      }
    }
    console.log('Images copied successfully');
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

copyImages();