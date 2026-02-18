#!/bin/bash

echo "🎣 Fishing App - Complete Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Backend setup
echo ""
echo "🔧 Setting up backend..."
cd backend
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database and API credentials"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

echo ""
echo "⚠️  Don't forget to run database migrations:"
echo "   cd backend && npx prisma migrate dev"

cd ..

# Mobile setup
echo ""
echo "📱 Setting up mobile app..."
cd mobile
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo ""
echo "1. Start backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start mobile app (in new terminal):"
echo "   cd mobile && npm start"
echo ""
echo "3. Setup database (first time only):"
echo "   cd backend && npx prisma migrate dev"
echo ""
echo "📚 Check README.md for more details!"
