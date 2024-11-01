#!/bin/bash
set -x  # Keep debugging output
# Don't use set -e as we want to continue even if directories exist

echo "Starting Cloudflare build process..."

# Print current directory and contents
pwd
ls -la

# Create directories if they don't exist (using -p won't error if they exist)
mkdir -p public
mkdir -p public/clanek
mkdir -p public/clanek/_articles

# List directories to verify
echo "Checking public directory structure:"
ls -la public || true
ls -la public/clanek || true

# Run our directory creation script
node scripts/copyArticleImages.js

# Run Next.js build
next build
