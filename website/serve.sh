#!/bin/bash

# Simple HTTP Server for Promotional Website
# Serves the promotional website on http://localhost:8080

echo "🎣 Starting Fishing App Promotional Website..."
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: This script should be run from the website directory"
    echo "   Run: cd website && ./serve.sh"
    exit 1
fi

# Check if we have Python installed (for SimpleHTTPServer/http.server)
if command -v python3 &> /dev/null; then
    echo "🌐 Starting server at http://localhost:8080"
    echo "   Press Ctrl+C to stop"
    echo ""
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "🌐 Starting server at http://localhost:8080"
    echo "   Press Ctrl+C to stop"
    echo ""
    python -m SimpleHTTPServer 8080
elif command -v npx &> /dev/null; then
    echo "🌐 Starting server at http://localhost:8080"
    echo "   Press Ctrl+C to stop"
    echo ""
    npx serve -p 8080 .
else
    echo "❌ Error: No suitable HTTP server found"
    echo "   Please install Python or Node.js"
    echo "   Or simply open index.html in your browser"
    exit 1
fi
