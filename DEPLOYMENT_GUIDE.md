# 🚀 Deployment Guide - Fishing App

This guide covers deploying your Fishing App to production.

## Table of Contents
- [Overview](#overview)
- [Backend Deployment](#backend-deployment)
- [Database Deployment](#database-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)

---

## Overview

### Architecture
```
┌─────────────────┐
│   Mobile App    │ (iOS/Android via Expo)
│  React Native   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│   Backend API   │ (Node.js + Express)
│   Railway/Render │
└────────┬────────┘
         │
         │ PostgreSQL
         ▼
┌─────────────────┐
│    Database     │ (Supabase/Neon)
│   PostgreSQL    │
└─────────────────┘
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Step 1: Prepare Backend**
```bash
cd backend

# Ensure build script works
npm run build

# Test production build
npm start
```

**Step 2: Deploy to Railway**

1. **Sign up:** [railway.app](https://railway.app)
2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Configure:**
   ```yaml
   # railway.json (create in backend/)
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "npm install && npx prisma generate && npm run build"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

4. **Add PostgreSQL:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

5. **Set Environment Variables:**
   Go to Variables tab and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here
   PORT=3000
   WEATHER_API_KEY=your-weather-key
   STRIPE_SECRET_KEY=sk_live_...
   OPENAI_API_KEY=sk-...
   FRONTEND_URL=https://your-app-url
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

**Step 3: Run Migrations**
```bash
# In Railway's terminal or locally with production DATABASE_URL
DATABASE_URL="railway-postgres-url" npx prisma migrate deploy
```

---

### Option 2: Render

**Step 1: Create Web Service**

1. **Sign up:** [render.com](https://render.com)
2. **New Web Service:**
   - Connect GitHub repository
   - Select your repo
   - Configure:
     - **Name:** fishing-app-backend
     - **Root Directory:** backend
     - **Environment:** Node
     - **Build Command:** `npm install && npx prisma generate && npm run build`
     - **Start Command:** `npm start`

**Step 2: Add Database**
- Create PostgreSQL database in Render
- Connect to your service

**Step 3: Environment Variables**
Same as Railway (see above)

---

### Option 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create fishing-app-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

---

## Database Deployment

### Option 1: Supabase (Recommended)

**Benefits:**
- Free tier available
- Auto backups
- Built-in authentication
- Real-time subscriptions
- PostgreSQL 14+

**Setup:**
1. **Sign up:** [supabase.com](https://supabase.com)
2. **Create Project:**
   - Click "New Project"
   - Enter project details
   - Choose region
3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy connection string
   - Format: `postgresql://[user]:[password]@[host]:5432/postgres`
4. **Run Migrations:**
   ```bash
   DATABASE_URL="supabase-url" npx prisma migrate deploy
   ```

---

### Option 2: Neon

**Benefits:**
- Serverless PostgreSQL
- Generous free tier
- Instant cold starts
- Branching for dev/staging

**Setup:**
1. **Sign up:** [neon.tech](https://neon.tech)
2. **Create Project**
3. **Get connection string**
4. **Deploy migrations** (same as above)

---

### Option 3: Railway PostgreSQL

If using Railway for backend, use their PostgreSQL add-on (already covered above).

---

## Mobile App Deployment

### Prepare for Production

**Update app.json:**
```json
{
  "expo": {
    "name": "Fishing App",
    "slug": "fishing-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e90ff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.fishingapp",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.fishingapp",
      "versionCode": 1
    }
  }
}
```

**Update API URL:**
```typescript
// mobile/src/services/api.ts
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-backend.railway.app/api'; // Your production URL
```

---

### Build with EAS

**Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2: Login to Expo**
```bash
eas login
```

**Step 3: Configure EAS**
```bash
cd mobile
eas build:configure
```

**Step 4: Build for iOS**
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

**Step 5: Build for Android**
```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

---

### Submit to App Stores

**iOS App Store:**
```bash
eas submit --platform ios
```

**Requirements:**
- Apple Developer account ($99/year)
- App Store Connect configured
- App icons and screenshots
- Privacy policy URL
- App description

**Google Play Store:**
```bash
eas submit --platform android
```

**Requirements:**
- Google Play Developer account ($25 one-time)
- Play Console configured
- App icons and screenshots
- Privacy policy URL
- App description

---

## Environment Configuration

### Production Environment Variables

**Backend (.env for production):**
```bash
# Database
DATABASE_URL="postgresql://[production-db-url]"

# Server
NODE_ENV="production"
PORT=3000

# JWT
JWT_SECRET="[generate-strong-secret]"
JWT_EXPIRES_IN="7d"

# Stripe (Production keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (for media storage)
AWS_ACCESS_KEY_ID="[your-key]"
AWS_SECRET_ACCESS_KEY="[your-secret]"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="fishing-app-production"

# Weather
WEATHER_API_KEY="[your-key]"

# Google Maps
GOOGLE_MAPS_API_KEY="[your-key]"

# OpenAI
OPENAI_API_KEY="sk-..."

# CORS
CORS_ORIGINS="https://your-app.com,exp://exp.host"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="[sendgrid-api-key]"
```

### Security Best Practices

1. **Use strong secrets:**
   ```bash
   # Generate strong JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Enable HTTPS only**
3. **Set secure CORS origins**
4. **Use production API keys**
5. **Enable rate limiting**
6. **Set up monitoring**

---

## Post-Deployment

### 1. Test Production Deployment

**Backend Health Check:**
```bash
curl https://your-backend.railway.app/health
```

**Test API Endpoints:**
```bash
# Register test user
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

### 2. Monitor Application

**Railway/Render:**
- Check logs for errors
- Monitor CPU/Memory usage
- Set up alerts

**Database:**
- Monitor connection count
- Check query performance
- Set up backups

### 3. Set Up Analytics

**Backend:**
- Install analytics (e.g., Google Analytics, Mixpanel)
- Track API usage
- Monitor error rates

**Mobile:**
```bash
# Install Expo Analytics
expo install expo-analytics
```

### 4. Configure CDN (Optional)

For static assets and images:
- Cloudflare CDN
- AWS CloudFront
- Vercel Edge Network

### 5. Set Up CI/CD

**GitHub Actions** (already configured in `.github/workflows/ci.yml`)

**Add deployment on push:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push if connected
          echo "Deployed via Railway GitHub integration"
```

---

## Monitoring & Maintenance

### Check regularly:
- [ ] Server uptime
- [ ] API response times
- [ ] Database performance
- [ ] Error rates
- [ ] User feedback
- [ ] App store reviews

### Monthly tasks:
- [ ] Update dependencies
- [ ] Security patches
- [ ] Database backup verification
- [ ] Performance optimization
- [ ] Cost analysis

---

## Rollback Plan

**Backend:**
```bash
# Railway: Rollback in dashboard
# Or redeploy previous version
git revert HEAD
git push
```

**Mobile:**
```bash
# Publish OTA update (for minor changes)
eas update

# Or rebuild and resubmit to stores
eas build --platform all
```

**Database:**
```bash
# Rollback migration
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## Cost Estimates

### Free Tier (Development/Small Scale)
- **Railway:** $5/month (free trial available)
- **Supabase:** Free up to 500MB
- **Expo:** Free for development
- **Total:** ~$5-10/month

### Production (Moderate Scale)
- **Railway/Render:** $20-50/month
- **Database (Supabase/Neon):** $25/month
- **Stripe:** 2.9% + $0.30 per transaction
- **AWS S3:** $5-10/month
- **Total:** ~$50-100/month + transaction fees

### Enterprise (High Scale)
- **Dedicated servers:** $200+/month
- **Database:** $100+/month
- **CDN:** $50+/month
- **Total:** $350+/month

---

## Support & Resources

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Expo Docs:** [docs.expo.dev](https://docs.expo.dev)
- **Prisma Deployment:** [prisma.io/docs/guides/deployment](https://www.prisma.io/docs/guides/deployment)

---

**Happy Deploying! 🚀🎣**
