# Student Library - 24/7 Deployment Guide

## 🚀 Deploy to Render (Free 24/7 Hosting)

### Step 1: Prepare for Deployment

Your backend is already configured for production with:
- ✅ Environment variables in .env
- ✅ MongoDB Atlas connection
- ✅ CORS configured for Netlify frontend
- ✅ Email service working

### Step 2: Deploy Backend to Render

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with your GitHub account
3. **Connect your repository**: studlib
4. **Create New Web Service**:
   - Repository: `yxtrth/studlib`
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Step 3: Environment Variables on Render

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=5003
MONGODB_URI=mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-minimum-32-characters-long
JWT_EXPIRE=7d
CLIENT_URL=https://inquisitive-kashata-b3ac7e.netlify.app
FRONTEND_URL=https://inquisitive-kashata-b3ac7e.netlify.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=libyatharth@gmail.com
EMAIL_PASS=untdnciohccycvwu
```

### Step 4: Update Frontend API URL

After Render gives you a URL (like https://your-app.onrender.com), update your frontend:

In `frontend/src/store/slices/authSlice.js`:
```javascript
const API_URL = 'https://your-app.onrender.com/api';
```

### Step 5: Redeploy Frontend

1. Update the API URL in frontend
2. Commit and push changes
3. Netlify will auto-deploy

## 🌟 Alternative: Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Deploy from `backend` folder
4. Add same environment variables
5. Get your live URL

## 🌐 Alternative: Heroku

1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set environment variables: `heroku config:set VAR=value`
4. Deploy: `git push heroku main`

## ✅ Final Steps

1. ✅ Backend deployed on Render/Railway/Heroku
2. ✅ Frontend on Netlify (already done)
3. ✅ Database on MongoDB Atlas (already done)
4. ✅ Email service configured (already done)

## 🎯 Your App Will Be Live 24/7:

- **Frontend**: https://inquisitive-kashata-b3ac7e.netlify.app
- **Backend**: https://your-backend.onrender.com (after deployment)
- **Database**: MongoDB Atlas (always online)
- **Email**: Gmail SMTP (always available)

## 🚀 Benefits:

- ✅ **24/7 Uptime**: Render/Railway provide free 24/7 hosting
- ✅ **Auto-scaling**: Handles traffic automatically  
- ✅ **SSL Certificate**: HTTPS by default
- ✅ **Git Integration**: Auto-deploy on push
- ✅ **Health Monitoring**: Built-in monitoring
- ✅ **Global CDN**: Fast worldwide access

## 📧 Post-Deployment:

Your enhanced chat system will be live with:
- Email OTP verification working globally
- Users can register and verify from anywhere
- Global chat accessible 24/7
- Direct messaging always available
- Real-time features ready for global users

## 🎉 Result:

Your Student Library with Enhanced Chat will be **LIVE 24/7** for users worldwide!
