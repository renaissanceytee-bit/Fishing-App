# Web Deployment Guide

This guide explains how to run and deploy the Fishing App on the web.

## 🌐 Web App Overview

The Fishing App now supports web deployment through Expo's web support. The project includes:

1. **Mobile App (Web Version)** - The full React Native app running on web via `react-native-web`
2. **Promotional Website** - A landing page showcasing features and pricing

## 📁 Project Structure

```
Fishing-App/
├── mobile/                    # React Native app with web support
│   ├── web/
│   │   └── index.html        # Custom web HTML
│   ├── app.json              # Expo config (includes web settings)
│   └── ...
├── website/                   # Promotional landing page
│   ├── index.html            # Landing page
│   ├── styles.css            # Styling
│   └── README.md             # Website documentation
└── backend/                   # API server
```

## 🚀 Running Locally

### Prerequisites

```bash
# Install dependencies (if not already done)
npm install

# Install mobile dependencies
cd mobile
npm install
```

### Start the Backend (Required)

The mobile app needs the backend API running:

```bash
# In the backend directory
cd backend

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start the backend
npm run dev
```

The backend will run on `http://localhost:3000`.

### Start the Web App

```bash
# In the mobile directory
cd mobile

# Start Expo for web
npm run web
```

This will:
- Bundle the React Native app for web
- Start a development server (usually on `http://localhost:8081`)
- Automatically open your browser

### View the Promotional Website

Simply open the promotional website in your browser:

```bash
# Navigate to the website directory
cd website

# Open in browser (or use a local server)
# On macOS:
open index.html

# Or use a simple HTTP server:
npx serve .
```

## 🏗️ Building for Production

### Build the Mobile App for Web

```bash
cd mobile

# Build for production
npx expo export:web

# This creates a 'web-build' directory with static files
```

The built files will be in `mobile/web-build/`.

### Deploy the Promotional Website

The promotional website is already static HTML/CSS and needs no build step.

## 🌍 Deployment Options

### Option 1: Deploy Both on Same Domain

**Recommended Structure:**
- `yourdomain.com/` → Promotional website
- `yourdomain.com/app/` → Mobile web app

**Steps:**

1. Build the mobile app:
```bash
cd mobile
npx expo export:web
```

2. Organize files:
```bash
mkdir deploy
cp -r website/* deploy/
mkdir deploy/app
cp -r mobile/web-build/* deploy/app/
```

3. Update links in `website/index.html`:
   - Change `../mobile/index.html` to `/app/`

4. Deploy the `deploy` directory to your hosting service.

### Option 2: Deploy on Separate Domains

**Promotional Site:** `fishingapp.com`
**Web App:** `app.fishingapp.com`

Deploy each directory separately to different subdomains or services.

### Hosting Providers

#### Vercel (Recommended)

**For the Web App:**
```bash
cd mobile
npx expo export:web
cd web-build
vercel deploy
```

**For the Promotional Website:**
```bash
cd website
vercel deploy
```

#### Netlify

1. Build the mobile app: `cd mobile && npx expo export:web`
2. Drag and drop `mobile/web-build/` to Netlify
3. Drag and drop `website/` to Netlify (separate site)

#### GitHub Pages

1. Enable GitHub Pages in repository settings
2. Build the mobile app
3. Commit `web-build` directory
4. Configure Pages to serve from `web-build` directory

#### AWS S3 + CloudFront

1. Build the mobile app
2. Upload `web-build/` to S3 bucket
3. Enable static website hosting
4. Configure CloudFront for CDN
5. Upload `website/` to a separate bucket or subfolder

## ⚙️ Configuration

### Environment Variables for Web

Create `.env.local` in the mobile directory:

```bash
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

This will override the default localhost API URL.

### Update API Configuration

Edit `mobile/src/services/api.ts` to set your production API URL:

```typescript
const API_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL)
  : 'https://your-production-api.com/api';  // Update this
```

## 🔧 Web-Specific Considerations

### Features That Work on Web

✅ Authentication
✅ Feed and social features
✅ Profile management
✅ Catch logging (with browser file upload)
✅ Maps (using web maps)
✅ Weather data
✅ Marketplace
✅ Messaging

### Features That Need Alternatives on Web

⚠️ **Camera**: Browser uses `<input type="file" accept="image/*" capture="camera">`
⚠️ **GPS**: Browser uses Geolocation API (requires HTTPS and user permission)
⚠️ **Push Notifications**: Use web push notifications or service workers

### Progressive Web App (PWA)

To make the web app installable:

1. Expo generates a manifest automatically
2. Users can "Add to Home Screen" on mobile browsers
3. Works offline with service workers (if configured)

## 📱 Responsive Design

The app is responsive and works on:
- Desktop browsers (1920px+)
- Tablets (768px - 1024px)
- Mobile browsers (320px - 767px)

## 🐛 Troubleshooting

### Issue: White Screen on Web

**Solution:**
- Check browser console for errors
- Ensure backend is running
- Verify API_URL is correct
- Clear browser cache

### Issue: Map Not Loading

**Solution:**
- Ensure you have a Google Maps API key
- Add API key to environment variables
- Enable Maps JavaScript API in Google Cloud Console

### Issue: File Upload Not Working

**Solution:**
- Web uses different file upload APIs than native
- Ensure you're using `expo-image-picker` which handles web automatically
- Check browser console for permission errors

### Issue: CORS Errors

**Solution:**
Add CORS headers to your backend (already configured in the backend):

```javascript
app.use(cors({
  origin: ['http://localhost:8081', 'https://yourdomain.com'],
  credentials: true
}));
```

## 📊 Performance Optimization

### For Production

1. **Enable compression** in your hosting provider
2. **Use CDN** for static assets
3. **Optimize images** before upload
4. **Enable caching** for static files
5. **Use code splitting** (Expo handles this)

### Bundle Size

Monitor bundle size:

```bash
cd mobile
npx expo export:web --dump-assetmap
```

## 🔐 Security

### HTTPS

Always use HTTPS in production:
- Required for geolocation
- Required for camera access
- Required for service workers
- Recommended for all web apps

### Content Security Policy

Add CSP headers to prevent XSS:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## 📖 Additional Resources

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [API Testing Guide](../API_TESTING_GUIDE.md)

## 🎉 Success!

Your Fishing App is now ready for the web! Users can:

1. Visit your promotional website
2. Learn about features and pricing
3. Click "Launch Web App" to use it in browser
4. Or download mobile apps for iOS/Android

Happy fishing! 🎣
