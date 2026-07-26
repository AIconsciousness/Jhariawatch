# Render Deployment Guide for JhariaWatch

Complete step-by-step guide to deploy both Backend and Frontend on Render.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - For database (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas

### 1.1 Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Click **"Build a Database"**
4. Choose **FREE** tier (M0 Sandbox)
5. Select **Cloud Provider**: AWS
6. Choose **Region**: Closest to your location (e.g., Mumbai for India)
7. Cluster Name: `JhariaWatch`
8. Click **"Create"**

### 1.2 Setup Database Access
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `jhariawatch-admin` (or any name)
5. Password: Generate a secure password or create your own
6. **IMPORTANT**: Save this password - you'll need it later
7. Database User Privileges: **Read and write to any database**
8. Click **"Add User"**

### 1.3 Setup Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Confirm: **"0.0.0.0/0"**
5. Click **"Confirm"**

### 1.4 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **Latest**
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` with your database username
8. Replace `<password>` with your database password
9. Add database name after `.net/`: `jhariawatch`

Final connection string should look like:
```
mongodb+srv://jhariawatch-admin:YourPassword@cluster0.xxxxx.mongodb.net/jhariawatch?retryWrites=true&w=majority
```

---

## 🔧 Step 2: Deploy Backend on Render

### 2.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. Authorize Render to access your GitHub
5. Select repository: `AIconsciousness/Jhariyawatch`

### 2.2 Backend Configuration

Fill in the following details **EXACTLY**:

| Field | Value |
|-------|-------|
| **Name** | `jhariawatch-backend` |
| **Region** | `Singapore (Southeast Asia)` or closest to you |
| **Branch** | `master` |
| **Root Directory** | `WebPlatform/backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | `Free` |

### 2.3 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **5 environment variables**:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1.4 |
| `JWT_SECRET` | `jhariawatch_secret_key_2025_production` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` (Change this after frontend deployment) |

**Example:**
```
MONGODB_URI = mongodb+srv://jhariawatch-admin:YourPassword@cluster0.xxxxx.mongodb.net/jhariawatch?retryWrites=true&w=majority
JWT_SECRET = jhariawatch_secret_key_2025_production
PORT = 3001
NODE_ENV = production
CORS_ORIGIN = *
```

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Once deployed, you'll see: **"Your service is live 🎉"**
4. Copy your backend URL, it will be like:
   ```
   https://jhariawatch-backend.onrender.com
   ```
5. Test it by visiting:
   ```
   https://jhariawatch-backend.onrender.com/api/risk/zones
   ```
   You should see JSON data of risk zones.

---

## 🎨 Step 3: Deploy Frontend on Render

### 3.1 Create Static Site
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Select repository: `AIconsciousness/Jhariyawatch` (already connected)

### 3.2 Frontend Configuration

Fill in the following details **EXACTLY**:

| Field | Value |
|-------|-------|
| **Name** | `jhariawatch-frontend` |
| **Branch** | `master` |
| **Root Directory** | `WebPlatform/frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3.3 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add **1 environment variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL from Step 2.4 |

**Example:**
```
VITE_API_URL = https://jhariawatch-backend.onrender.com
```

### 3.4 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build and deployment
3. Once deployed, you'll see: **"Your site is live 🎉"**
4. Copy your frontend URL, it will be like:
   ```
   https://jhariawatch-frontend.onrender.com
   ```

---

## 🔄 Step 4: Update Backend CORS

### 4.1 Update CORS_ORIGIN
1. Go back to **Backend Web Service** on Render
2. Go to **"Environment"** tab
3. Find `CORS_ORIGIN` variable
4. Click **"Edit"**
5. Change value from `*` to your frontend URL:
   ```
   https://jhariawatch-frontend.onrender.com
   ```
6. Click **"Save Changes"**
7. Backend will **automatically redeploy** with new CORS settings

---

## 🔗 Step 5: Update Frontend API URL

### 5.1 Update api.js file locally

1. Open `WebPlatform/frontend/src/services/api.js`
2. Update the baseURL:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jhariawatch-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ... rest of the code
```

3. Save the file
4. Commit and push to GitHub:
```bash
git add .
git commit -m "Update API URL for production"
git push origin master
```

5. Render will **automatically redeploy** both services

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Backend
Visit: `https://your-backend-url.onrender.com/api/risk/zones`

Should return JSON:
```json
{
  "success": true,
  "data": {
    "zones": [...]
  }
}
```

### 6.2 Test Frontend
1. Visit: `https://your-frontend-url.onrender.com`
2. You should see the **JhariaWatch landing page**
3. Try to **Register** a new user
4. Try to **Login**
5. Check if **maps and alerts** are loading

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend deployment fails
**Solution**: Check if `Root Directory` is set to `WebPlatform/backend`

### Issue 2: Frontend shows blank page
**Solution**:
- Check browser console for errors
- Verify `VITE_API_URL` environment variable is set correctly
- Make sure backend is running

### Issue 3: CORS errors
**Solution**:
- Update backend `CORS_ORIGIN` with correct frontend URL
- Don't include trailing slash in URLs

### Issue 4: MongoDB connection error
**Solution**:
- Check MongoDB Atlas IP whitelist (should have 0.0.0.0/0)
- Verify connection string has correct username, password, and database name
- Make sure password doesn't have special characters that need URL encoding

### Issue 5: API calls failing
**Solution**:
- Open browser DevTools → Network tab
- Check if API calls are going to correct backend URL
- Verify backend is responding (test with direct URL)

---

## 🎉 Success!

Your JhariaWatch application is now live on Render!

**URLs:**
- Frontend: `https://jhariawatch-frontend.onrender.com`
- Backend: `https://jhariawatch-backend.onrender.com`

### Free Tier Limitations:
- Backend may **sleep after 15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** to wake up
- **750 hours/month free** (enough for one service running 24/7)

### To Keep Backend Always Active (Paid):
- Upgrade to **Starter Plan** ($7/month)
- Backend stays active 24/7
- No cold starts

---

## 📞 Support

If you face any issues:
1. Check Render **Logs** tab for error messages
2. Check **Events** tab for deployment history
3. Visit Render documentation: https://render.com/docs

---

**Deployment Date:** December 2024
**Version:** 1.0.0
