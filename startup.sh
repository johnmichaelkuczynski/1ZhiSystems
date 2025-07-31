#!/bin/bash

# Render deployment startup script
echo "🚀 Starting Zhi Systems Website"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ No dist directory found. Building..."
    npm run build
fi

# Start the application
echo "✅ Starting production server..."
NODE_ENV=production node dist/index.js