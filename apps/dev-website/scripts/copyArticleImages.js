const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function createRequiredDirectories(websitePath) {
  const directories = [
    'public',
    'public/clanek',
    'public/clanek/_articles'
  ];

  for (const dir of directories) {
    const fullPath = path.join(websitePath, dir);
    console.log(`Ensuring directory exists: ${fullPath}`);
    await fs.ensureDir(fullPath);
  }
}

async function copyArticleImages() {
  // Define paths for monorepo structure
  const websitePath = path.join(process.cwd(), 'apps/dev-website');
  const articlesPath = path.join(websitePath, 'app/clanek/_articles');
  const publicPath = path.join(websitePath, 'public/clanek/_articles');
  
  try {
    console.log('Starting image copy process...');
    console.log('Website path:', websitePath);
    console.log('Articles path:', articlesPath);
    console.log('Public path:', publicPath);

    // First ensure all required directories exist
    await createRequiredDirectories(websitePath);
    
    // Check if articles directory exists
    if (!await fs.pathExists(articlesPath)) {
      console.log('No articles directory found at:', articlesPath);
      console.log('Creating empty articles directory structure...');
      await fs.ensureDir(articlesPath);
      return;
    }
    
    // Find all article directories
    const articleDirs = glob.sync('*/', { cwd: articlesPath });
    
    console.log('Found article directories:', articleDirs);
    
    if (articleDirs.length === 0) {
      console.log('No article directories found. Creating basic structure...');
      await fs.ensureDir(publicPath);
      return;
    }
    
    for (const articleDir of articleDirs) {
      const sourceImagesPath = path.join(articlesPath, articleDir, 'images');
      const targetImagesPath = path.join(publicPath, articleDir, 'images');
      
      // Ensure the article directory exists in public
      await fs.ensureDir(path.join(publicPath, articleDir));
      
      // Check if the source images directory exists
      if (await fs.pathExists(sourceImagesPath)) {
        console.log(`Copying images from ${sourceImagesPath} to ${targetImagesPath}`);
        
        // Ensure the target directory exists
        await fs.ensureDir(targetImagesPath);
        
        // Copy all files from images directory
        await fs.copy(sourceImagesPath, targetImagesPath);
        
        console.log(`Successfully copied images for ${articleDir}`);
      } else {
        console.log(`No images directory found for ${articleDir}, creating empty directory`);
        await fs.ensureDir(targetImagesPath);
      }
    }
    
    console.log('Image copying complete!');
    
    // Double check that the public directory exists after all operations
    await fs.ensureDir(publicPath);
  } catch (error) {
    console.error('Error during image copy process:', error);
    // Create the minimum required structure even if there's an error
    try {
      await createRequiredDirectories(websitePath);
    } catch (dirError) {
      console.error('Failed to create required directories:', dirError);
    }
    process.exit(1);
  }
}

// Execute with error handling
copyArticleImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});