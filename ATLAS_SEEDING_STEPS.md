# 🚀 Quick Atlas Seeding Instructions

## Your Connection Details:
- **Host:** yathsdatabase.7fir4sd.mongodb.net
- **Password:** bb
- **Database:** student-library
- **Missing:** Your database username

## Step 1: Find Your MongoDB Atlas Username

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login to your account  
3. Go to **Database Access** (left sidebar)
4. Your username will be listed there (something like "admin", "user", "yaths", etc.)

## Step 2: Update Connection String

Edit the file: `backend/seed-atlas.js`
Replace `<db_username>` with your actual username.

For example, if your username is "yaths":
```javascript
const ATLAS_CONNECTION = "mongodb+srv://yaths:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE";
```

## Step 3: Run Seeding

```bash
cd backend
node seed-atlas.js
```

## Step 4: Check Your Netlify App

After seeding completes:
1. Visit your Netlify URL
2. Login with: admin@studentlibrary.com / admin123456  
3. Browse Books and Videos sections
4. Should see 14 books + 15 videos!

---

**What's your MongoDB Atlas username?** Once you tell me, I can update the script and run it for you! 🎯
