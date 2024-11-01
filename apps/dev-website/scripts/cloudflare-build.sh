#!/bin/bash
set -ex

echo "Starting Cloudflare build process..."

# Print current directory
pwd
ls -la

# Create directories manually first
mkdir -p public
mkdir -p public/clanek
mkdir -p public/clanek/_articles

# List directories to verify
ls -la public
ls -la public/clanek

# Run our directory creation script
node scripts/copyArticleImages.js

# Run Next.js build
next build
