# 🎣 Fishing App - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Quick Start (Automated)

### Step 1: Clone & Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd Fishing-App

# Run automated setup
chmod +x setup.sh QUICKSTART.sh start-dev.sh
./setup.sh
```

### Step 2: Configure Environment

Edit `backend/.env` with your credentials:

```bash
# Required: Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/fishing_app"

# Required: JWT secret (change this!)
JWT_SECRET="your-super-secret-key-here"

# Optional but recommended
WEATHER_API_KEY="get-from-openweathermap.org"
STRIPE_SECRET_KEY="sk_test_your-stripe-key"
OPENAI_API_KEY="sk-your-openai-key"
```

### Step 3: Setup Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # Optional: Add sample data
cd ..
```

### Step 4: Start Development

```bash
# Option 1: Automated (both backend & mobile)
./start-dev.sh

# Option 2: Manual (recommended for debugging)
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile (new terminal)
cd mobile && npm start
```

### Step 5: Open Mobile App

1. **Install Expo Go** on your phone
2. **Scan QR code** displayed in terminal
3. **Wait for app to load**
4. **Enjoy fishing!** 🎣

---

## Detailed Setup Instructions

### 1. Database Setup (PostgreSQL)

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE fishing_app;
CREATE USER fishing_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE fishing_app TO fishing_user;

# Exit
\q
```

#### Update DATABASE_URL

Edit `backend/.env`:
```
DATABASE_URL="postgresql://fishing_user:your-password@localhost:5432/fishing_app"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on: `http://localhost:3000`

### 3. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start
```

#### Run on Device (Recommended)

1. Install **Expo Go** from App Store or Google Play
2. Scan QR code in terminal with your phone camera
3. App will open in Expo Go

#### Run on Simulator

**iOS (macOS only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### 4. API Keys Setup (Optional but Recommended)

#### OpenWeatherMap (Weather Features)

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get free API key
3. Add to `backend/.env`: `WEATHER_API_KEY="your-key"`

#### Stripe (Subscription Payments)

1. Sign up at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Add to `backend/.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

#### OpenAI (AI Species Identification)

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to `backend/.env`: `OPENAI_API_KEY="sk-..."`

#### Google Maps (Enhanced Maps)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps SDK
3. Create API key
4. Add to `backend/.env`: `GOOGLE_MAPS_API_KEY="your-key"`

---

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in backend/.env
PORT=3001
```

**Database connection error:**
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Verify DATABASE_URL in backend/.env
```

**Prisma migration failed:**
```bash
cd backend
npx prisma migrate reset  # WARNING: Deletes all data!
npx prisma migrate dev
```

### Mobile App Issues

**Metro bundler error:**
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

**Can't connect to backend:**
```bash
# Update mobile/src/services/api.ts
# Change localhost to your computer's IP address
const API_URL = 'http://YOUR_IP:3000/api';
```

**Find your IP:**
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**Expo Go won't connect:**
- Ensure phone and computer are on same WiFi
- Disable VPN
- Allow firewall access for Node.js

### Common Errors

**"Module not found":**
```bash
npm install
```

**"Prisma Client not generated":**
```bash
cd backend
npx prisma generate
```

**"Invalid JWT token":**
Clear app data in Expo Go and restart

---

## Development Tools

### Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### API Testing

Use **Postman** or **Thunder Client** (VS Code extension)

Import collection:
- Base URL: `http://localhost:3000/api`
- Add header: `Authorization: Bearer YOUR_JWT_TOKEN`

### Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npx prisma studio    # Open database GUI

# Mobile
cd mobile
npm start            # Start Expo
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web browser

# Root
npm run dev          # Run both backend & mobile
npm run build        # Build all workspaces
```

---

## Project Structure

```
Fishing-App/
├── backend/              # Node.js + Express API
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── routes/      # API endpoints (12 modules)
│   │   ├── middleware/  # Auth, errors, rate limiting
│   │   └── services/    # Business logic
│   └── .env             # Environment variables
│
├── mobile/              # React Native + Expo
│   ├── src/
│   │   ├── screens/     # App screens (10+)
│   │   ├── navigation/  # Stack & tab navigation
│   │   ├── context/     # Auth & location state
│   │   └── services/    # API client
│   └── app.json         # Expo config
│
├── shared/              # Shared TypeScript types
└── setup.sh             # Automated setup script
```

---

## Features Checklist

### Core Features
- ✅ User authentication (JWT)
- ✅ Catch logging with photos
- ✅ Social feed & following
- ✅ Interactive maps
- ✅ Weather forecasts
- ✅ Real-time messaging
- ✅ Species identification (AI)
- ✅ GPS location tracking

### Community Features
- ✅ Fishing clubs
- ✅ Events & tournaments
- ✅ Mentorship matching
- ✅ Group trip organizer

### Marketplace
- ✅ Buy/sell/trade gear
- ✅ Gear rentals
- ✅ Guide booking
- ✅ Location-based search

### Premium Features
- ✅ Tiered subscriptions ($2.99-$9.99/mo)
- ✅ Stripe payment integration
- ✅ Advanced analytics
- ✅ AI fishing assistant

---

## API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Catch Endpoints

```bash
GET    /api/catches
POST   /api/catches
GET    /api/catches/:id
PUT    /api/catches/:id
DELETE /api/catches/:id
GET    /api/catches/nearby
GET    /api/catches/feed
```

### Social Endpoints

```bash
POST   /api/social/follow/:userId
DELETE /api/social/unfollow/:userId
POST   /api/social/like/:catchId
POST   /api/social/comment/:catchId
GET    /api/social/feed
```

[See full API documentation in PROJECT_STRUCTURE.md]

---

## Deployment

### Backend (Node.js)

**Recommended Hosting:**
- [Railway](https://railway.app) - Easy Node.js hosting
- [Render](https://render.com) - Free tier available
- [Heroku](https://heroku.com) - Established platform
- [DigitalOcean](https://digitalocean.com) - VPS option

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables
4. Deploy!

### Database (PostgreSQL)

**Recommended Hosting:**
- [Supabase](https://supabase.com) - Free PostgreSQL + Auth
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Bundled with app
- Your hosting provider's PostgreSQL addon

### Mobile App

**Production Build:**

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for stores
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Support

### Documentation
- `README.md` - Project overview
- `PROJECT_STRUCTURE.md` - Architecture details
- `COMPLETION_SUMMARY.md` - Features checklist
- `QUICKSTART.sh` - Quick reference guide

### Getting Help
- Check documentation files
- Review error messages carefully
- Search issues on GitHub
- Contact support

---

## Next Steps

1. ✅ Complete setup
2. 📝 Add sample data
3. 🧪 Test all features
4. 🎨 Customize branding
5. 🔐 Add real API keys
6. 🚀 Deploy to production
7. 📱 Submit to app stores

---

**Happy Fishing! 🎣**

*Your complete fishing app is ready to use and has all the features of Fishbrain PLUS enhanced community features and 50% cheaper pricing!*
