#!/bin/bash

echo "🎣 Fishing App - Mobile Testing Setup"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"
echo ""

# Install root dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing root dependencies...${NC}"
    npm install
    echo ""
fi

# Install mobile dependencies if needed
if [ ! -d "mobile/node_modules" ]; then
    echo -e "${BLUE}📱 Installing mobile dependencies...${NC}"
    cd mobile
    npm install
    cd ..
    echo ""
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}🔧 Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
    echo ""
fi

# Ask user what they want to test
echo -e "${YELLOW}How would you like to test the mobile app?${NC}"
echo ""
echo "1) Web Browser (Fastest - No phone needed)"
echo "2) Physical Device (Scan QR code with Expo Go)"
echo "3) iOS Simulator (macOS only)"
echo "4) Android Emulator"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🌐 Starting mobile app in web browser...${NC}"
        echo ""
        echo -e "${YELLOW}📝 Note: Backend is NOT started. App will work with mock data only.${NC}"
        echo -e "${YELLOW}   To test full features, start backend separately:${NC}"
        echo -e "${YELLOW}   cd backend && npm run dev${NC}"
        echo ""
        echo -e "${BLUE}Opening browser at http://localhost:8081 ...${NC}"
        echo ""
        cd mobile
        npm run web
        ;;
    2)
        echo ""
        echo -e "${GREEN}📱 Starting Expo development server...${NC}"
        echo ""
        echo -e "${YELLOW}📝 Instructions:${NC}"
        echo "   1. Install 'Expo Go' app on your phone"
        echo "      - iOS: https://apps.apple.com/app/expo-go/id982107779"
        echo "      - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
        echo "   2. Make sure your phone and computer are on the same WiFi"
        echo "   3. Scan the QR code that appears below"
        echo ""
        echo -e "${YELLOW}💡 Tip: Backend is NOT started. For full features, run in another terminal:${NC}"
        echo -e "${YELLOW}   cd backend && npm run dev${NC}"
        echo ""
        cd mobile
        npm start
        ;;
    3)
        echo ""
        echo -e "${GREEN}📱 Starting iOS Simulator...${NC}"
        echo ""
        if [[ "$OSTYPE" != "darwin"* ]]; then
            echo -e "${RED}❌ iOS Simulator is only available on macOS${NC}"
            exit 1
        fi
        echo -e "${YELLOW}💡 Tip: Backend is NOT started. For full features, run in another terminal:${NC}"
        echo -e "${YELLOW}   cd backend && npm run dev${NC}"
        echo ""
        cd mobile
        npm run ios
        ;;
    4)
        echo ""
        echo -e "${GREEN}📱 Starting Android Emulator...${NC}"
        echo ""
        echo -e "${YELLOW}💡 Make sure Android Studio and an emulator are set up${NC}"
        echo -e "${YELLOW}💡 Tip: Backend is NOT started. For full features, run in another terminal:${NC}"
        echo -e "${YELLOW}   cd backend && npm run dev${NC}"
        echo ""
        cd mobile
        npm run android
        ;;
    *)
        echo -e "${RED}Invalid choice. Please run the script again and select 1-4.${NC}"
        exit 1
        ;;
esac
