#!/bin/bash

echo "Starting Cloudflare build process..."

# Create necessary directory structure
mkdir -p public/clanek/_articles

# Run Next.js build using npx to ensure we use the local installation
npx next build