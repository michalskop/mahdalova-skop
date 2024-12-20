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
      
      if (await fs.pathExists(sourcePath)) {
        console.log(`Copying images from ${sourcePath} to ${targetPath}`);
        await fs.copy(sourcePath, targetPath);
      }
    }
    console.log('Images copied successfully');
  } catch (error) {
    console.error('Error copying images:', error);
  }
}

copyImages();