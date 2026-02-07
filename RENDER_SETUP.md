# Render Static Site Setup Guide

## Critical Configuration for Render Dashboard

### Option 1: Deploy from Root (Recommended)
```
Service Type: Static Site
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Root Directory: (leave blank)
```

### Option 2: Deploy Frontend Only
```
Service Type: Static Site
Build Command: npm install && npm run build
Publish Directory: dist
Root Directory: frontend
```

## Important Files for SPA Routing

1. **frontend/dist/_redirects** - Already configured with:
   ```
   /* /index.html 200
   ```

2. **render.yaml** (optional, in root) - Already configured

## Troubleshooting 404 Errors

### If you still get 404s on refresh:

1. **Verify Service Type is "Static Site"** (NOT Web Service)
2. **Check Publish Directory** matches the build output
3. **Verify _redirects file** exists in the publish directory
4. **Clear cache** in Render dashboard and trigger manual deploy
5. **Check Render logs** for any build errors

### Manual Deploy Steps:
1. Go to Render Dashboard → Your Service
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Wait for deployment to complete
4. Test the routes

## Testing After Deploy:
- Homepage: https://your-site.onrender.com/
- Direct route: https://your-site.onrender.com/dashboard
- Refresh on any route - should NOT show 404

## Common Mistakes:
- ❌ Service type is "Web Service" instead of "Static Site"
- ❌ Publish directory doesn't point to the actual dist folder
- ❌ _redirects file is missing or not in publish directory
- ❌ Using old cached build

---
**Need help?** Share your Render dashboard settings and deployed URL.
