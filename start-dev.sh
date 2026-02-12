#!/bin/bash

echo "🎣 Starting Fishing App..."
echo ""

# Start backend in background
echo "🔧 Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start mobile app
echo "📱 Starting mobile app..."
cd ../mobile
npm start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
