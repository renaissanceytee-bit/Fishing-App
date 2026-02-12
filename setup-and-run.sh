#!/bin/bash

echo "🎣 Fishing App - Complete Setup Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Navigate to project root
cd /home/runner/work/Fishing-App/Fishing-App

# 1. Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create .env file
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL="******localhost:5432/fishing_app"
JWT_SECRET="dev-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_BUCKET_NAME=""
WEATHER_API_KEY=""
GOOGLE_MAPS_API_KEY=""
OPENAI_API_KEY=""
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
EOF
    print_status "Created .env file"
else
    print_status ".env file already exists"
fi

# Install dependencies
if [ ! -d node_modules ]; then
    print_warning "Installing backend dependencies..."
    npm install > /tmp/backend-install.log 2>&1
    if [ $? -eq 0 ]; then
        print_status "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        tail -20 /tmp/backend-install.log
        exit 1
    fi
else
    print_status "Backend dependencies already installed"
fi

# Generate Prisma client
print_warning "Generating Prisma client..."
npx prisma generate > /tmp/prisma-gen.log 2>&1
if [ $? -eq 0 ]; then
    print_status "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    tail -10 /tmp/prisma-gen.log
    exit 1
fi

# 2. Setup Mobile
echo ""
echo "📱 Setting up Mobile App..."
cd ../mobile

if [ ! -d node_modules ]; then
    print_warning "Installing mobile dependencies..."
    npm install > /tmp/mobile-install.log 2>&1
    if [ $? -eq 0 ]; then
        print_status "Mobile dependencies installed"
    else
        print_error "Failed to install mobile dependencies"
        tail -20 /tmp/mobile-install.log
        exit 1
    fi
else
    print_status "Mobile dependencies already installed"
fi

# 3. Start Servers
echo ""
echo "🚀 Starting Servers..."
cd /home/runner/work/Fishing-App/Fishing-App

# Kill any existing processes
pkill -f "tsx.*index.ts" 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 2

# Start backend
echo "Starting backend on port 3000..."
cd backend
setsid bash -c "npx tsx src/index.ts >> /tmp/backend.log 2>&1" < /dev/null &
BACKEND_PID=$!
sleep 5

# Check if backend started
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_status "Backend started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check /tmp/backend.log"
    tail -20 /tmp/backend.log
    exit 1
fi

# Start mobile web
echo "Starting mobile web app on port 8081..."
cd ../mobile
setsid bash -c "npx expo start --web >> /tmp/mobile-web.log 2>&1" < /dev/null &
MOBILE_PID=$!
sleep 15

# Check if mobile started
if curl -s http://localhost:8081/ > /dev/null 2>&1; then
    print_status "Mobile web app started successfully (PID: $MOBILE_PID)"
else
    print_error "Mobile web app failed to start. Check /tmp/mobile-web.log"
    tail -30 /tmp/mobile-web.log
    exit 1
fi

# 4. Display Status
echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "🔧 Backend API:  http://localhost:3000"
echo "   Health Check: $(curl -s http://localhost:3000/health 2>&1 | head -1)"
echo ""
echo "🌐 Web App:      http://localhost:8081"
echo "   Status:       $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/ 2>&1)"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Mobile:   tail -f /tmp/mobile-web.log"
echo ""
echo "🔄 To restart servers, run:"
echo "   bash setup-and-run.sh"
echo ""
