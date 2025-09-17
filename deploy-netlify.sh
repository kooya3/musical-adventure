#!/bin/bash

# Netlify deployment script for Next.js app

echo "🚀 Starting Netlify deployment process..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if already logged in
if ! netlify status 2>/dev/null | grep -q "Logged in"; then
    echo "📝 Please log in to Netlify..."
    netlify login
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
echo "Using .next directory as publish directory"

# Try to deploy directly if site exists, otherwise prompt for init
if [ -f ".netlify/state.json" ]; then
    echo "📦 Deploying to existing site..."
    netlify deploy --prod --dir=.next
else
    echo "📝 No existing site found. Please run:"
    echo "1. netlify init (select 'Create & configure a new site')"
    echo "2. netlify deploy --prod --dir=.next"
    echo ""
    echo "Site configuration:"
    echo "  - Site name: elyees-3d-portfolio (or your choice)"
    echo "  - Build command: npm run build"
    echo "  - Publish directory: .next"
fi

echo "✅ Deployment script complete!"