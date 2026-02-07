# PlayArena Backend API

Node.js + Express backend for PlayArena sports venue booking system.

## 📋 Features

- RESTful API architecture
- JWT-based authentication
- MongoDB database
- OTP-based login (mock)
- Real-time slot availability checking
- Booking management
- Match tracking

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start MongoDB
```bash
mongod
```

### Seed Database
```bash
npm run seed
```

### Start Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & Login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Pricing

- `GET /api/pricing` - Get all pricing

### Booking

- `POST /api/booking/create` - Create booking (protected)
- `GET /api/booking/available-slots` - Get available time slots
- `GET /api/booking/my-bookings` - Get user's bookings (protected)

### Matches

- `GET /api/matches/ongoing` - Get ongoing matches
- `GET /api/matches/past` - Get past matches (protected)
- `GET /api/matches/records` - Get user's records (protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄 Database Models

- **User** - User accounts
- **Booking** - Table bookings
- **Match** - Match records
- **Pricing** - Game pricing

## ⚙️ Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/playarena
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
MOCK_OTP=1234
BOOKING_START_HOUR=11
BOOKING_END_HOUR=23
```

## 📝 Sample Requests

### Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"1234"}'
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/booking/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "gameType": "pool",
    "bookingDate": "2026-02-05",
    "startTime": "14:00",
    "duration": 2,
    "playerName": "John"
  }'
```

## 🧪 Testing

Health check:
```bash
curl http://localhost:3000/api/health
```

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- dotenv - Environment variables
- cors - CORS middleware
- express-validator - Input validation

## 🛠 Scripts

- `npm start` - Start server
- `npm run dev` - Start with nodemon
- `npm run seed` - Seed database

## 📄 License

MIT
