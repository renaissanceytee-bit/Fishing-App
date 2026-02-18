# 📱 Mobile App Testing Guide

Quick guide to test the Fishing App mobile application.

## 🚀 Quick Start (Fastest Way to Test)

```bash
# Run the automated test script
chmod +x test-mobile.sh
./test-mobile.sh
```

This will:
1. Install all dependencies
2. Set up the backend with a test database
3. Start the mobile app for testing
4. Open it in your web browser (no phone needed!)

## 📋 Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher (optional, can use mock data)
- **Web Browser** (Chrome, Firefox, Safari, Edge)

For mobile device testing:
- **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🧪 Testing Options

### Option 1: Web Browser Testing (Recommended for Quick Testing)

Test the app instantly in your browser without any mobile device:

```bash
# Install dependencies (first time only)
npm install
cd mobile && npm install && cd ..
cd backend && npm install && cd ..

# Start backend
cd backend
npm run dev &

# Start mobile app on web
cd ../mobile
npm run web
```

Your browser will open at `http://localhost:8081` 🎉

### Option 2: Mobile Device Testing (Real Device)

Test on your actual phone using Expo Go:

```bash
# Install dependencies (if not done)
npm install
cd mobile && npm install && cd ..

# Start the mobile app
cd mobile
npm start
```

Then:
1. Install **Expo Go** from App Store or Google Play
2. Scan the QR code shown in terminal
3. App loads on your phone!

### Option 3: iOS Simulator (macOS only)

```bash
cd mobile
npm run ios
```

### Option 4: Android Emulator

```bash
cd mobile
npm run android
```

## 🔧 Backend Setup (Optional for Full Testing)

The app works with mock data, but for full functionality:

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your database URL:
# DATABASE_URL="postgresql://user:pass@localhost:5432/fishing_app"

# Run database migrations
npx prisma migrate dev

# (Optional) Add sample data
npm run seed

# Start backend
npm run dev
```

Backend runs on: `http://localhost:3000`

## 📱 What You Can Test

### Without Backend (Frontend Only)
- ✅ UI/UX design and layout
- ✅ Navigation between screens
- ✅ Form inputs and validation
- ✅ Responsive design
- ✅ Theme and styling
- ✅ Component interactions

### With Backend (Full Features)
- ✅ User registration and login
- ✅ Creating and viewing catches
- ✅ Social feed interactions
- ✅ Profile management
- ✅ Maps and locations
- ✅ Weather data
- ✅ Real-time messaging
- ✅ All API integrations

## 🧪 Testing Checklist

### Basic UI Testing
- [ ] App launches successfully
- [ ] Navigation tabs work (Home, Map, Add Catch, Profile)
- [ ] Forms accept input
- [ ] Buttons respond to clicks
- [ ] Images load properly
- [ ] Text is readable and properly styled

### Authentication Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Token persistence
- [ ] Protected routes work

### Core Features
- [ ] View social feed
- [ ] Create new catch post
- [ ] Upload photos
- [ ] Add location
- [ ] View catch details
- [ ] Like/comment on catches
- [ ] View user profiles
- [ ] Follow/unfollow users

### Maps & Location
- [ ] Map loads and displays
- [ ] User location shows (if permitted)
- [ ] Catch markers appear
- [ ] Tap markers for details
- [ ] Search locations

### Performance
- [ ] App loads quickly
- [ ] Smooth scrolling
- [ ] No crashes or freezes
- [ ] Memory usage acceptable
- [ ] Network requests complete

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Backend (port 3000)
lsof -ti:3000 | xargs kill -9

# Metro bundler (port 8081)
lsof -ti:8081 | xargs kill -9
```

### Can't Connect to Backend
Update the API URL in `mobile/src/services/api.ts`:
```typescript
// Change from localhost to your IP
const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
```

Find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### Metro Bundler Issues
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete lock files and node_modules
rm -rf package-lock.json node_modules
npm install
```

## 📊 Test Data

### Sample User Credentials
After running `npm run seed` in backend:

```
Email: test@example.com
Password: password123
```

### Creating Test Data

Use the app to:
1. Register a new user
2. Create catch posts
3. Upload photos
4. Add locations
5. Interact with other users

## 🔍 Debugging Tools

### React Native Debugger
1. Press `Cmd + D` (iOS) or `Cmd + M` (Android)
2. Select "Debug JS Remotely"
3. Open Chrome DevTools at `http://localhost:8081/debugger-ui`

### Console Logs
```bash
# View all logs
npx react-devtools

# Filter logs
npm start -- --clear
```

### Inspect Element (Web)
Right-click → Inspect in your browser (when using web mode)

## 🚀 Next Steps

After testing:
1. Review all features work as expected
2. Check responsive design on different screen sizes
3. Test on multiple devices/browsers
4. Report any bugs or issues
5. Suggest improvements

## 📝 Reporting Issues

When reporting bugs, include:
- Device/browser being used
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Console error messages
- Network request failures

## 💡 Tips for Best Testing Experience

1. **Start with web testing** - fastest and easiest
2. **Test on real devices** - for accurate mobile experience
3. **Use latest Expo Go** - ensure compatibility
4. **Clear cache** - if experiencing weird issues
5. **Check network** - ensure backend is running
6. **Monitor console** - for error messages
7. **Test offline mode** - disconnect network

## 🎯 Quick Commands Reference

```bash
# Install everything
npm install
cd backend && npm install && cd ..
cd mobile && npm install && cd ..

# Start backend
cd backend && npm run dev

# Test on web
cd mobile && npm run web

# Test on device
cd mobile && npm start

# Test on iOS simulator
cd mobile && npm run ios

# Test on Android emulator
cd mobile && npm run android

# Clear metro cache
cd mobile && npm start -- --reset-cache
```

## 📞 Need Help?

- 📖 Check [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- 📖 Check [README.md](README.md)
- 🐛 Open an issue on GitHub
- 💬 Join our discussions

---

**Happy Testing! 🎣**

*The mobile app is built with React Native + Expo and works on iOS, Android, and Web browsers.*
