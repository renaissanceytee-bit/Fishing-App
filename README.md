# Fishing App 🎣

A comprehensive community-focused fishing application with affordable subscription plans.

**Now Available on Web! 🌐** - Use it in your browser without downloading anything!

## 🎯 Quick Links

- **[Mobile Testing Guide](MOBILE_TESTING.md)** - Test the mobile app quickly ⭐ NEW!
- **[Web Deployment Guide](WEB_DEPLOYMENT_GUIDE.md)** - Run on web and deploy
- **[Installation Guide](INSTALLATION_GUIDE.md)** - Detailed setup instructions
- **[API Testing Guide](API_TESTING_GUIDE.md)** - Test all API endpoints
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Contributing Guide](CONTRIBUTING.md)** - Contribute to the project
- **[Project Structure](PROJECT_STRUCTURE.md)** - Architecture details
- **[Completion Summary](COMPLETION_SUMMARY.md)** - Features checklist
- **[Changelog](CHANGELOG.md)** - Version history

## ✨ Features

### Core Features
- ✅ User authentication and profiles
- ✅ Social feed for sharing catches
- ✅ Photo/video upload with catch details
- ✅ Species identification AI
- ✅ GPS location mapping
- ✅ Interactive fishing maps
- ✅ Weather forecast integration
- ✅ Logbook to track catches
- ✅ Statistics and analytics dashboard

### Social Features
- ✅ Follow/followers system
- ✅ Like and comment on catches
- ✅ Messaging between anglers
- ✅ Community forums/groups
- ✅ Share to social media

### Community Features
- ✅ Local fishing clubs/chapters
- ✅ Mentor/mentee matching system
- ✅ Group fishing trip organizer
- ✅ Event calendar (tournaments/meetups)
- ✅ Volunteer cleanup coordination

### Marketplace
- ✅ Gear marketplace (buy/sell/trade)
- ✅ Gear rental system
- ✅ Charter boat booking integration
- ✅ Local guide directory

### Premium Features
- ✅ Pro subscription features
- ✅ Offline mode capability
- ✅ Advanced search filters
- ✅ AI fishing assistant
- ✅ Species identification AI

### Conservation
- ✅ Conservation tracking (catch & release)
- ✅ Environmental impact score
- ✅ Educational certification programs

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Socket.IO for real-time features
- JWT authentication
- Stripe for payments
- OpenAI for AI features

### Mobile & Web App
- React Native + Expo (iOS, Android, Web)
- TypeScript
- React Navigation
- React Native Paper (Material Design)
- React Query for data fetching
- Socket.IO client
- React Native Web for browser support

## 🚀 Quick Start

### Try it on Web (No Installation!)

```bash
# Start the backend
cd backend
cp .env.example .env
# Edit .env with your configuration
npx prisma migrate dev
npm run dev

# In another terminal, start the web app
cd mobile
npm run web
```

Your browser will open to `http://localhost:8081` - the app is ready to use! 🎉

See [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) for web deployment.

### Mobile Development Setup
```bash
# Run setup script
./setup.sh

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Setup database
cd backend
npx prisma migrate dev
npm run seed

# Start development
./start-dev.sh
```

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed instructions.

### Quick Mobile Testing ⚡

Want to test the mobile app right now? Use our automated testing script:

```bash
# One command to test the mobile app
chmod +x test-mobile.sh
./test-mobile.sh
```

This interactive script will:
1. Install all dependencies automatically
2. Let you choose: Web browser, Physical device, iOS simulator, or Android emulator
3. Launch the app for testing immediately

See [MOBILE_TESTING.md](MOBILE_TESTING.md) for comprehensive testing guide.

---

## 📚 Documentation

- **[WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md)** - Web deployment guide ⭐ NEW!
- **[INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)** - Complete setup guide
- **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - API testing documentation  
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture overview
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - All completed features
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## 🎉 What's Included

✅ **Complete Backend API** (Node.js + Express + TypeScript)
- 12 route modules with 50+ endpoints
- PostgreSQL database with Prisma ORM
- JWT authentication & authorization
- Real-time messaging (Socket.IO)
- File upload handling
- Payment integration (Stripe)
- AI features (OpenAI)
- Weather integration

✅ **Complete Mobile & Web App** (React Native + Expo + Web)
- 10+ fully functional screens
- Bottom tab + stack navigation
- Material Design 3 UI
- Image capture & upload
- GPS location tracking
- Real-time updates
- Offline support
- **Web browser support** ⭐ NEW!

✅ **Promotional Website** ⭐ NEW!
- Beautiful landing page
- Feature showcase
- Pricing comparison
- Responsive design
- SEO optimized

✅ **Comprehensive Documentation**
- Installation guides
- API documentation
- Testing guides
- Deployment instructions
- Contributing guidelines

✅ **Developer Tools**
- Database seeding script
- Setup automation
- CI/CD workflows
- GitHub issue templates
- Pull request templates

---

## 🏆 Advantages Over Competitors

### vs Fishbrain
- ✅ **50% More Affordable** - $2.99-$9.99/mo vs $9.99-$14.99/mo
- ✅ **Web Access** - Use in browser, no download needed ⭐ NEW!
- ✅ **Enhanced Community** - Clubs, events, mentorship
- ✅ **Gear Marketplace** - Buy/sell/rent equipment
- ✅ **Guide Booking** - Find and book fishing guides
- ✅ **Conservation Focus** - Environmental impact tracking
- ✅ **AI Assistant** - Personalized fishing advice
- ✅ **FREE Tier** - Full basic features at no cost

---

## 💻 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Real-time:** Socket.IO
- **Payments:** Stripe
- **AI:** OpenAI API
- **Weather:** OpenWeatherMap

### Mobile & Web
- **Framework:** React Native + Expo 50
- **Language:** TypeScript
- **UI Library:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation 6
- **State:** React Context + React Query
- **Maps:** React Native Maps
- **HTTP:** Axios
- **Storage:** AsyncStorage
- **Web Support:** React Native Web ⭐ NEW!
- **DOM:** React DOM (for web) ⭐ NEW!

### Promotional Website ⭐ NEW!
- **HTML5:** Semantic markup
- **CSS3:** Modern responsive design
- **Vanilla JS:** No framework needed
- **SEO:** Optimized meta tags

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Railway/Render/Heroku
- **Database Hosting:** Supabase/Neon
- **Monitoring:** Built-in logging

---

## 📱 Screenshots

[Add screenshots here]

---

## 🔑 API Keys Required

Get free API keys from:
- **PostgreSQL:** Local installation or [Supabase](https://supabase.com) (free tier)
- **Weather:** [OpenWeatherMap](https://openweathermap.org/api) (free tier)
- **Maps:** [Google Cloud](https://console.cloud.google.com) (free tier)
- **Payments:** [Stripe](https://stripe.com) (test mode free)
- **AI:** [OpenAI](https://platform.openai.com) (optional)

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Coding standards
- Submitting pull requests
- Reporting bugs
- Requesting features

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React Native community
- Expo team
- Prisma team
- All open-source contributors

---

## 📞 Support

- 📧 **Email:** support@fishingapp.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/renaissanceytee-bit/Fishing-App/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/renaissanceytee-bit/Fishing-App/discussions)

---

## 🗺️ Roadmap

### v1.1 (Coming Soon)
- [ ] Push notifications
- [ ] Video upload support
- [ ] Advanced analytics
- [ ] Multi-language support

### v1.2 (Future)
- [ ] Offline mode with sync
- [ ] AR fish measurement
- [ ] Live streaming
- [ ] Social media integrations

---

**Built with ❤️ for the fishing community**

**Happy Fishing! 🎣**

## Subscription Pricing

### FREE
- Basic catch logging
- Public profile
- Limited map access
- Community access

### BASIC - $2.99/month
- Unlimited catches
- Weather forecasts
- Advanced stats
- Priority support

### PRO - $5.99/month
- AI species identification
- Offline mode
- Advanced filters
- Live streaming
- Pro badge

### ELITE - $9.99/month
- All Pro features
- AI fishing assistant
- Tournament hosting
- Premium support
- Early feature access

**50% cheaper than competitors!**

## API Documentation

API runs on `http://localhost:3000/api`

### Endpoints

#### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout

#### Catches
- GET `/api/catches/feed` - Get public catches feed
- GET `/api/catches/nearby` - Get nearby catches
- POST `/api/catches` - Create catch
- GET `/api/catches/:id` - Get catch details
- GET `/api/catches/stats` - Get user statistics

#### Social
- POST `/api/social/follow/:userId` - Follow user
- POST `/api/social/like` - Like catch/post
- POST `/api/social/comment` - Comment on catch/post
- GET `/api/social/feed` - Get social feed

#### Community
- GET `/api/community/clubs` - Get fishing clubs
- POST `/api/community/clubs` - Create club
- GET `/api/community/events` - Get events
- GET `/api/community/mentorship` - Get mentorship opportunities

#### Marketplace
- GET `/api/marketplace` - Get marketplace items
- POST `/api/marketplace` - Create listing

#### Weather
- GET `/api/weather` - Get current weather
- GET `/api/weather/forecast` - Get forecast (Pro)
- GET `/api/weather/solunar` - Get solunar data

## Development

### Database Migrations

```bash
cd backend
npm run prisma:migrate
```

### Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### View Database

```bash
cd backend
npm run prisma:studio
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Contact

For support or inquiries, contact us at support@fishingapp.com

---

Built with ❤️ by the Fishing App Team