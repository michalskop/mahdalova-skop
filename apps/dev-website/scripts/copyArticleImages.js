const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

async function verifyAndCreateDirectories() {
  const baseDir = process.cwd();
  console.log('Current working directory:', baseDir);
  
  const requiredPaths = {
    public: path.join(baseDir, 'public'),
    clanek: path.join(baseDir, 'public', 'clanek'),
    articles: path.join(baseDir, 'public', 'clanek', '_articles')
  };

  // Create directories synchronously to ensure order
  for (const [name, dirPath] of Object.entries(requiredPaths)) {
    try {
      console.log(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
      
      // Verify directory was created
      const stats = fs.statSync(dirPath);
      console.log(`Successfully created ${name} directory:`, {
        path: dirPath,
        isDirectory: stats.isDirectory(),
        permissions: stats.mode.toString(8)
      });
    } catch (error) {
      console.error(`Error creating ${name} directory:`, error);
      throw error;
    }
  }
  
  // List contents of public directory to verify
  console.log('\nContents of public directory:');
  try {
    const publicContents = fs.readdirSync(requiredPaths.public);
    console.log(publicContents);
  } catch (error) {
    console.error('Error listing public directory:', error);
  }
}

// Run everything synchronously to maintain order
try {
  console.log('Starting directory creation process...');
  verifyAndCreateDirectories();
  console.log('Directory creation complete!');
} catch (error) {
  console.error('Fatal error during directory creation:', error);
  process.exit(1);
}