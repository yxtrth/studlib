# 24/7 Deployment Configuration

This document provides multiple strategies to keep your application running 24/7 on free hosting services.

## 🌐 Current Deployment Status
- **Backend**: Render (Free tier - sleeps after 15 minutes of inactivity)
- **Frontend**: Netlify (Always active - no sleep mode)
- **Database**: MongoDB Atlas (Always active)

## 🚀 Keep-Alive Strategies

### 1. Local Keep-Alive Service (Immediate Solution)

Run the `keep-alive-service.js` file locally:

```bash
node keep-alive-service.js
```

**Pros**: 
- Immediate solution
- Full control
- No additional costs

**Cons**: 
- Requires your computer to stay on
- Manual management

### 2. GitHub Actions (Recommended)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://your-app-name.onrender.com/api/health || \
          curl -f https://your-app-name.onrender.com/
```

### 3. UptimeRobot (Free External Service)

1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Create free account (up to 50 monitors)
3. Add HTTP(s) monitor for your Render URL
4. Set check interval to 5 minutes
5. Enable notifications for downtime

### 4. Render Environment Variables

Add these to your Render service:

```env
KEEP_ALIVE_URL=https://your-app-name.onrender.com
NODE_ENV=production
```

### 5. Self-Ping Route (Add to Backend)

Add this to your backend `server.js`:

```javascript
// Self-ping to prevent sleep
if (process.env.NODE_ENV === 'production') {
    const SELF_PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
    setInterval(() => {
        http.get(`${process.env.KEEP_ALIVE_URL || 'http://localhost:5000'}/api/health`);
    }, SELF_PING_INTERVAL);
}
```

## 🛠️ Implementation Priority

1. **Immediate**: Run local keep-alive service
2. **Short-term**: Set up UptimeRobot
3. **Long-term**: GitHub Actions workflow

## 📊 Monitoring Your Uptime

### Check Backend Status
```bash
curl https://your-app-name.onrender.com/api/health
```

### Expected Response
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "2 hours, 15 minutes"
}
```

## 🚨 Troubleshooting

### Backend Not Responding
1. Check Render dashboard for errors
2. Verify environment variables
3. Check database connection
4. Review application logs

### Keep-Alive Service Issues
1. Verify backend URL is correct
2. Check network connectivity
3. Ensure health endpoint exists
4. Monitor console output for errors

## 💡 Pro Tips

1. **Multiple Monitors**: Use both UptimeRobot and GitHub Actions
2. **Health Endpoint**: Ensure `/api/health` returns proper status
3. **Logging**: Monitor keep-alive logs for patterns
4. **Backup Strategy**: Have multiple ping sources

## 🎯 Next Steps

1. Update `keep-alive-service.js` with your actual Render URL
2. Choose and implement one or more keep-alive strategies
3. Monitor for 24-48 hours to ensure effectiveness
4. Set up alerts for any downtime

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify MongoDB Atlas connection
3. Test endpoints manually
4. Review environment variables
