# PlayArena - Snooker & Pool Club Management System

A comprehensive booking and match management system for snooker and pool clubs with real-time statistics tracking, push notifications, and competitive leaderboards.

## Features

### Admin Features
- **Dashboard**: Overview with today's metrics (matches, bookings, revenue)
- **Booking Management**: Create, approve, decline bookings with notification system
- **Match Management**: Two-player matches with live scoring and automatic stats accumulation
- **User Management**: Search, view, and edit player statistics
- **Leaderboards**: Track top players by wins, points, and highest breaks
- **Push Notifications**: Real-time alerts for booking requests and match completions

### Customer Features
- **Booking Requests**: Submit table booking requests for approval
- **Match History**: View personalized game history with opponents
- **Push Notifications**: Get notified of booking approvals/declines and match results
- **Leaderboards**: View competitive rankings and records

## Tech Stack

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Web Push Notifications (VAPID)
- RESTful API

### Frontend
- React 18 with Vite
- React Router v6
- Tailwind CSS
- Service Workers for Push Notifications
- Responsive Design (mobile-first)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following:
```env
MONGODB_URI=mongodb://localhost:27017/playarena
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=3000
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com
```

4. Generate VAPID keys (for push notifications):
```bash
npx web-push generate-vapid-keys
```

5. Seed the database:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm start
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Default Admin Credentials
- Mobile: `0000000000`
- Password: `admin123`

## Project Structure

```
playarena/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Utility functions (push notifications)
│   ├── seed.js          # Database seeding
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   ├── public/
│   │   └── service-worker.js  # Push notification service worker
│   └── vite.config.js   # Vite configuration
└── README.md
```

## API Endpoints

### Admin Routes (`/api/admin`)
- `POST /login` - Admin authentication
- `GET /stats` - Dashboard statistics
- `GET /users` - List all users
- `PATCH /user/:id` - Edit user stats
- `POST /booking` - Create booking
- `PATCH /booking/:id` - Update booking
- `POST /booking/:id/accept` - Accept booking request
- `POST /booking/:id/decline` - Decline booking request
- `POST /match` - Create match
- `PATCH /match/:id` - Update match

### User Routes (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /matches` - Get user's matches
- `GET /leaderboard` - Get leaderboard data

### Booking Routes (`/api/booking`)
- `POST /` - Create booking request
- `GET /user/:userId` - Get user's bookings

### Notification Routes (`/api/notification`)
- `GET /vapid-public-key` - Get VAPID public key
- `POST /subscribe` - Subscribe to push notifications
- `DELETE /unsubscribe` - Unsubscribe from notifications
- `GET /status` - Check subscription status

## Deployment

### MongoDB Atlas (Free)
1. Create account at mongodb.com
2. Create cluster and get connection string
3. Update `MONGODB_URI` in backend `.env`

### Vercel (Frontend - Free)
1. Push code to GitHub
2. Import project on vercel.com
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/dist`

### Render (Backend - Free)
1. Create new Web Service on render.com
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env`

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.
