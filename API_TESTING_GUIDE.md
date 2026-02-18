# 🧪 API Testing Guide

## Getting Started

### Prerequisites
- Backend server running (`npm run dev` from backend/)
- Valid JWT token (obtain from login endpoint)
- API testing tool (Postman, Insomnia, or Thunder Client)

### Base URL
```
http://localhost:3000/api
```

---

## Authentication

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Catches

### Get All Catches
```http
GET /catches
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `species` - Filter by species name
- `userId` - Filter by user ID
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

### Get Nearby Catches
```http
GET /catches/nearby?lat=25.7617&lon=-80.1918&radius=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `lat` - Latitude (required)
- `lon` - Longitude (required)
- `radius` - Search radius in miles (default: 25)

### Create Catch
```http
POST /catches
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "species": "Largemouth Bass",
  "weight": 8.5,
  "length": 22,
  "latitude": 25.7617,
  "longitude": -80.1918,
  "location": "Lake Okeechobee",
  "waterTemp": 75,
  "weather": "Sunny, 82°F",
  "bait": "Plastic worm",
  "lure": "Texas rig",
  "technique": "Flipping",
  "catchAndRelease": true,
  "photos": ["url1", "url2"],
  "visibility": "PUBLIC"
}
```

### Update Catch
```http
PUT /catches/:catchId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "weight": 9.0,
  "notes": "Updated weight after verification"
}
```

### Delete Catch
```http
DELETE /catches/:catchId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Social Features

### Follow User
```http
POST /social/follow/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Unfollow User
```http
DELETE /social/follow/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Like Catch
```http
POST /social/like
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "catchId": "catch_id_here"
}
```

### Comment on Catch
```http
POST /social/comment
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "catchId": "catch_id_here",
  "content": "Awesome catch!"
}
```

### Get Social Feed
```http
GET /social/feed?limit=20&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Weather

### Get Current Weather
```http
GET /weather/current?lat=25.7617&lon=-80.1918
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Weather Forecast
```http
GET /weather/forecast?lat=25.7617&lon=-80.1918
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Solunar Data
```http
GET /weather/solunar?lat=25.7617&lon=-80.1918
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Locations

### Get Fishing Locations
```http
GET /locations?lat=25.7617&lon=-80.1918&radius=50
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Location
```http
POST /locations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Secret Bass Spot",
  "description": "Great for largemouth bass",
  "latitude": 25.7617,
  "longitude": -80.1918,
  "type": "LAKE",
  "isPrivate": false
}
```

### Rate Location
```http
POST /locations/:locationId/rate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "review": "Best fishing spot in the area!"
}
```

---

## Tournaments

### Get All Tournaments
```http
GET /tournaments
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get My Tournaments
```http
GET /tournaments/my
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Tournament
```http
POST /tournaments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Spring Bass Classic",
  "description": "Annual bass tournament",
  "startDate": "2026-04-15T00:00:00Z",
  "endDate": "2026-04-17T23:59:59Z",
  "entryFee": 50,
  "rules": "Largemouth bass only. Min 12 inches.",
  "prizes": "1st: $5,000, 2nd: $2,500, 3rd: $1,000",
  "maxParticipants": 100
}
```

### Join Tournament
```http
POST /tournaments/:tournamentId/join
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Tournament Leaderboard
```http
GET /tournaments/:tournamentId/leaderboard
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Marketplace

### Get Marketplace Items
```http
GET /marketplace?lat=25.7617&lon=-80.1918&radius=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `type` - SALE, RENT, or TRADE
- `category` - Filter by category
- `search` - Search query
- `lat`, `lon`, `radius` - Location filter

### Create Listing
```http
POST /marketplace
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Shimano Reel",
  "description": "Barely used",
  "price": 249.99,
  "type": "SALE",
  "category": "Reels",
  "condition": "EXCELLENT",
  "latitude": 25.7617,
  "longitude": -80.1918,
  "images": ["url1", "url2"]
}
```

### Update Listing
```http
PUT /marketplace/:itemId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "price": 229.99,
  "description": "Price reduced!"
}
```

### Delete Listing
```http
DELETE /marketplace/:itemId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Community

### Get Clubs
```http
GET /community/clubs?search=bass
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Club
```http
POST /community/clubs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Austin Bass Club",
  "description": "Local bass fishing community",
  "location": "Austin, TX",
  "isPrivate": false
}
```

### Join Club
```http
POST /community/clubs/:clubId/join
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Events
```http
GET /community/events
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create Event
```http
POST /community/events
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "clubId": "club_id_here",
  "title": "Weekend Fishing Trip",
  "description": "Group trip to Lake Travis",
  "date": "2026-05-15T08:00:00Z",
  "location": "Lake Travis",
  "maxParticipants": 20
}
```

---

## Subscriptions

### Get Available Plans
```http
GET /subscriptions/plans
```

### Create Subscription
```http
POST /subscriptions/subscribe
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "tier": "PRO",
  "paymentMethodId": "pm_card_visa"
}
```

### Cancel Subscription
```http
POST /subscriptions/cancel
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## AI Features

### Identify Species (Image Upload)
```http
POST /ai/identify
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- image: [file]
```

### AI Fishing Assistant
```http
POST /ai/ask
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "question": "What's the best bait for bass in spring?",
  "context": {
    "location": "Lake Okeechobee",
    "season": "spring"
  }
}
```

### Get Recommendations
```http
GET /ai/recommendations
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Users

### Get User Profile
```http
GET /users/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "New bio",
  "location": "Miami, FL"
}
```

### Search Users
```http
GET /users/search?q=john
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": ["Field 'email' is required"]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Testing Tips

### 1. Get JWT Token First
Always start by logging in and saving the token:
```bash
# Save response to get token
POST /auth/login
# Copy token from response
# Use in Authorization header for other requests
```

### 2. Test in Order
1. Register/Login
2. Create catches, posts
3. Test social features (like, comment, follow)
4. Test advanced features (tournaments, marketplace)

### 3. Use Environment Variables
In Postman/Thunder Client:
```
BASE_URL = http://localhost:3000/api
TOKEN = your_jwt_token_here
```

Then use:
```
{{BASE_URL}}/catches
Authorization: Bearer {{TOKEN}}
```

### 4. Seed Database First
```bash
cd backend
npm run seed
```

This creates sample data for testing.

### 5. Monitor Backend Logs
Watch terminal for errors and debug info while testing.

---

## Quick Test Script

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  | jq -r '.token')

# 3. Get catches
curl -X GET http://localhost:3000/api/catches \
  -H "Authorization: Bearer $TOKEN"

# 4. Create catch
curl -X POST http://localhost:3000/api/catches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "species": "Bass",
    "weight": 5,
    "latitude": 25.7,
    "longitude": -80.2
  }'
```

---

## Postman Collection

Import this collection URL:
```
[Create a Postman collection and share link]
```

Or manually create requests using the examples above.

---

**Happy Testing! 🧪**
