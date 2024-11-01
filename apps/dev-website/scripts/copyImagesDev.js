const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

const sourceDir = path.join(process.cwd(), 'app/clanek/_articles');
const targetDir = path.join(process.cwd(), 'public/clanek/_articles');

// Initial copy
async function copyImages() {
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

// Watch for changes in development
if (process.env.NODE_ENV === 'development') {
  console.log('Watching for image changes...');
  
  const watcher = chokidar.watch(path.join(sourceDir, '**', 'images', '*'), {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  watcher.on('add', (filePath) => {
    const relativePath = path.relative(sourceDir, filePath);
    const targetPath = path.join(targetDir, relativePath);
    fs.copy(filePath, targetPath)
      .then(() => console.log(`Copied new image: ${relativePath}`))
      .catch(err => console.error(`Error copying file ${relativePath}:`, err));
  });

  watcher.on('change', (filePath) => {
    const relativePath = path.relative(sourceDir, filePath);
    const targetPath = path.join(targetDir, relativePath);
    fs.copy(filePath, targetPath)
      .then(() => console.log(`Updated image: ${relativePath}`))
      .catch(err => console.error(`Error updating file ${relativePath}:`, err));
  });
}

// Initial copy
copyImages();