const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function copyArticleImages() {
  // Define paths for monorepo structure
  const websitePath = path.join(process.cwd(), 'apps/dev-website');
  const articlesPath = path.join(websitePath, 'app/clanek/_articles');
  const publicPath = path.join(websitePath, 'public/clanek/_articles');
  
  try {
    // Ensure the public directory exists
    await fs.ensureDir(publicPath);
    
    // Find all article directories
    const articleDirs = glob.sync('*/', { cwd: articlesPath });
    
    console.log('Found article directories:', articleDirs);
    
    for (const articleDir of articleDirs) {
      const sourceImagesPath = path.join(articlesPath, articleDir, 'images');
      const targetImagesPath = path.join(publicPath, articleDir, 'images');
      
      // Check if the source images directory exists
      if (await fs.pathExists(sourceImagesPath)) {
        console.log(`Copying images from ${sourceImagesPath} to ${targetImagesPath}`);
        
        // Ensure the target directory exists
        await fs.ensureDir(targetImagesPath);
        
        // Copy all files from images directory
        await fs.copy(sourceImagesPath, targetImagesPath);
        
        console.log(`Successfully copied images for ${articleDir}`);
      } else {
        console.log(`No images directory found for ${articleDir}`);
      }
    }
    
    console.log('Image copying complete!');
  } catch (error) {
    console.error('Error copying images:', error);
    process.exit(1);
  }
}

copyArticleImages();