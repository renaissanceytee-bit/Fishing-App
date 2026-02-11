#!/bin/bash

# Web App Startup Script
# This script starts the Fishing App web version

echo "🎣 Starting Fishing App Web Version..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script should be run from the mobile directory"
    echo "   Run: cd mobile && ./start-web.sh"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting Expo web server..."
echo ""
echo "The web app will open in your browser at http://localhost:8081"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the web app
npm run web
