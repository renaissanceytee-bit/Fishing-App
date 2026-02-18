# Quick Start - Web Version 🌐

Get the Fishing App running on web in under 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or use a cloud database)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/renaissanceytee-bit/Fishing-App.git
cd Fishing-App

# Install all dependencies
npm install
```

## Step 2: Setup Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
# DATABASE_URL="postgresql://user:password@localhost:5432/fishing_app"
# JWT_SECRET="your-secret-key-here"

# Setup database
npx prisma migrate dev
npx prisma generate

# Seed with sample data (optional)
npm run seed
```

## Step 3: Start Backend

```bash
# In the backend directory
npm run dev
```

The backend will start on `http://localhost:3000` ✅

## Step 4: Start Web App

Open a new terminal:

```bash
cd mobile

# Start the web app
npm run web

# Or use the convenience script
./start-web.sh
```

The web app will automatically open in your browser at `http://localhost:8081` 🎉

## Step 5: View Promotional Website (Optional)

```bash
cd website

# Option 1: Use the serve script
./serve.sh

# Option 2: Use any HTTP server
npx serve .

# Option 3: Just open in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

## 🎣 You're Ready!

### Web App Features:
- ✅ Browse fishing catches
- ✅ View interactive maps
- ✅ Check weather forecasts
- ✅ Join the community
- ✅ Log your own catches (after login)

### Default Login (if using seed data):
- **Email:** `user@example.com`
- **Password:** `password123`

## Common Issues

### Port Already in Use

If port 8081 is already in use:

```bash
# Kill the process using the port
lsof -ti:8081 | xargs kill -9

# Or specify a different port
EXPO_DEV_SERVER_PORT=8082 npm run web
```

### Backend Not Running

Make sure the backend is running on port 3000:

```bash
cd backend
npm run dev
```

### Database Connection Error

Check your DATABASE_URL in `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fishing_app"
```

## Next Steps

- 📖 Read [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) for deployment
- 🧪 Try [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) to test endpoints
- 💻 Check [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for mobile setup
- 🤝 See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Production Deployment

Ready to deploy? See the [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) for:
- Building for production
- Deploying to Vercel/Netlify
- Configuring custom domains
- Performance optimization

Happy Fishing! 🎣
