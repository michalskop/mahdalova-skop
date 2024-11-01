#!/bin/bash
set -e

# Create necessary directories
mkdir -p public/clanek/_articles

# Run the image copy script
node scripts/copyArticleImages.js

# Run the Next.js build
next build
