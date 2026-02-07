# PlayArena Deployment Guide

## Step 1: Setup MongoDB Atlas (FREE)

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a **FREE Cluster** (M0 Sandbox - 512MB)
4. **Database Access**: 
   - Click "Database Access" → "Add New Database User"
   - Username: `playarena`
   - Password: `PlayArena2026Secure` (or choose your own)
   - Database User Privileges: **Read and write to any database**
5. **Network Access**:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" → `0.0.0.0/0`
   - Confirm
6. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://playarena:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add `/playarena` at the end before `?retryWrites`
   - Final format: `mongodb+srv://playarena:PlayArena2026Secure@cluster0.xxxxx.mongodb.net/playarena?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend on Render

### A. Create Web Service

1. Go to [https://render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **`Visheshvd/playarena`**

### B. Configure Service

Fill in these values:

```
Name: playarena-backend

Language: Node

Branch: main

Region: Oregon (US West) [or closest to you]

Root Directory: backend

Build Command: npm install

Start Command: npm start
```

### C. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Copy these **EXACT values** (click "Add" for each):

```
PORT
3000

NODE_ENV
production

MONGODB_URI
mongodb+srv://visheshvishesh91_db_user:18XUx3PBTf8Piu4v@cluster0.ojlrwef.mongodb.net/playarena?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET
pA8xK2nR9mF3qL7wV5yT6hJ4bN1zC0sD9uE3vX8kM2pQ7rY4tG6nB5cA1wF0hL3jZxYwVuTsRqPo

JWT_EXPIRE
7d

MOCK_OTP
1234

BOOKING_START_HOUR
11

BOOKING_END_HOUR
23

VAPID_PUBLIC_KEY
BLyVt_UcIPQ8su-aJq81O26dfl5C0kOBPVOqE90mO2EOdSdfruKSsVDVfQtfgPS7q0pIVw59Zh8TKe9E7829Hsc

VAPID_PRIVATE_KEY
TtO6qu8Pg1blHfVVn488oRsEfAmug3frE1bkBFw4khs

VAPID_SUBJECT
mailto:visheshvd@example.com
```

**IMPORTANT**: Replace the `MONGODB_URI` value with your actual MongoDB Atlas connection string from Step 1!

### D. Deploy

Click **"Create Web Service"** and wait 3-5 minutes.

Your backend will be live at: `https://playarena-backend.onrender.com` (or similar)

**Copy this URL** - you'll need it for the frontend!

---

## Step 3: Deploy Frontend on Vercel (Recommended)

### A. Create Project

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import repository: **`Visheshvd/playarena`**

### B. Configure Build

```
Framework Preset: Vite

Root Directory: frontend

Build Command: npm run build

Output Directory: dist

Install Command: npm install
```

### C. Add Environment Variable

Add ONE environment variable:

```
VITE_API_URL
https://playarena-backend.onrender.com
```

(Replace with your actual Render backend URL from Step 2D)

### D. Deploy

Click **"Deploy"** and wait 2-3 minutes.

Your frontend will be live at: `https://playarena.vercel.app` (or similar)

---

## Step 4: Update Frontend API Configuration

After deployment, you need to update the frontend to use your production backend URL:

1. Open `frontend/src/utils/api.js`
2. Find line: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';`
3. Verify it's correct
4. If needed, update Vercel environment variable with your Render backend URL
5. Redeploy (Vercel auto-redeploys on git push)

---

## Step 5: Seed Database (One-Time)

After backend is deployed:

1. Go to your Render dashboard
2. Click on **"Shell"** tab in your backend service
3. Run: `npm run seed`
4. This creates:
   - Admin user: Mobile `0000000000`, Password `admin123`
   - Sample users and data

---

## Step 6: Test Your Deployment

1. Visit your Vercel frontend URL
2. Click "Admin" → Login with `0000000000` / `admin123`
3. Check if dashboard loads
4. Create a test booking
5. Enable push notifications (click the banner)

---

## Free Tier Limits

| Service | Limit | Cost |
|---------|-------|------|
| **MongoDB Atlas** | 512MB storage | $0 |
| **Render** | 750 hours/month, sleeps after 15min inactivity | $0 |
| **Vercel** | 100GB bandwidth, unlimited requests | $0 |

**Total Monthly Cost: $0**

---

## Important Notes

### Render Free Tier Sleep Behavior

- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds to wake up
- Subsequent requests are instant
- **Solution**: Upgrade to paid plan ($7/month) for 24/7 uptime

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

**Render:**
1. Go to Service Settings → Custom Domains
2. Add domain and update DNS

---

## Troubleshooting

### Backend won't start
- Check environment variables are copied exactly
- Verify MongoDB Atlas connection string has correct password
- Check Render logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` environment variable in Vercel
- Check backend is running (visit backend URL in browser)
- Check backend URL in `frontend/src/utils/api.js`

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Ensure connection string has `/playarena` database name

---

## Default Credentials

**Admin:**
- Mobile: `0000000000`
- Password: `admin123`

**Test Users** (created by seed):
- Rahul Sharma: `9876543211` / `password123`
- Priya Patel: `9876543212` / `password123`
- Amit Kumar: `9876543213` / `password123`

---

## Need Help?

- Check Render logs: Dashboard → Your Service → Logs
- Check Vercel logs: Dashboard → Your Project → Deployments → Click deployment → Logs
- MongoDB Atlas: Database → Browse Collections (see your data)

---

## Upgrade Options

Once you validate everything works, consider:

1. **Render Starter Plan** ($7/month) - No sleep, better performance
2. **MongoDB Atlas Shared Cluster** ($9/month) - More storage, better performance
3. **Custom Domain** - Professional URL for your app

**Total for small production app: ~$16/month**
