# Email Authentication & Enhanced Chat Setup Guide

## 🔧 **Backend Configuration**

### 1. Environment Variables
Add these to your `.env` file in the backend folder:

```env
# Email Configuration (choose one option)

# Option 1: Gmail (Recommended for development)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # Generate this in Gmail settings

# Option 2: Outlook/Hotmail
# EMAIL_USER=your-email@outlook.com
# EMAIL_PASS=your-app-password

# Option 3: Custom SMTP (for production)
# EMAIL_HOST=smtp.yourdomain.com
# EMAIL_PORT=587
# EMAIL_USER=noreply@yourdomain.com
# EMAIL_PASS=your-smtp-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail App Password Setup (Recommended)
1. Go to Google Account settings: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already enabled)
3. App passwords → Generate new app password for "Mail"
4. Copy the 16-character password to `EMAIL_PASS` in your `.env`

### 3. Database Migration
Run this in MongoDB Atlas or your local MongoDB to add verification fields to existing users:

```javascript
// Make all existing users verified (one-time migration)
db.users.updateMany(
  { isEmailVerified: { $exists: false } },
  { 
    $set: { 
      isEmailVerified: true  // Set to true for existing users
    } 
  }
)
```

## 🚀 **Features Implemented**

### ✅ **Email OTP Verification**
- 6-digit OTP sent on registration
- 10-minute expiration time
- Resend functionality with cooldown
- Welcome email after verification
- Login blocked until email verified

### ✅ **Enhanced Chat System**
- **Global Group Chat**: All verified users automatically added
- **Direct Messages**: Users can message each other privately
- **User Directory**: Browse and connect with all verified users
- **Real-time Features**: Typing indicators, online status, instant messaging
- **Welcome Messages**: System messages when users join
- **Chat Statistics**: Message counts, conversation tracking

## 📱 **User Flow**

### New User Registration:
1. User registers → Gets user ID and email
2. OTP sent to email (6 digits, 10min expiry)
3. User enters OTP → Email verified → Welcome email sent
4. User can now login and access all features
5. Automatically added to global chat with welcome message

### Existing User Login:
1. Email verified users → Direct access to all features
2. Unverified users → Redirected to email verification

## 🔒 **Security Features**

- Email verification required for all engagement
- OTP expiration and rate limiting
- Account status checks (active/deactivated)
- Protected routes with verification checks
- Session management and token validation

## 🎯 **Testing the System**

### 1. Test Email Verification:
```bash
# Register a new user - should receive OTP email
POST /api/auth/register

# Verify OTP - should get welcome email
POST /api/auth/verify-otp

# Try login before verification - should be blocked
POST /api/auth/login
```

### 2. Test Enhanced Chat:
```bash
# Initialize user in global chat
POST /api/messages/initialize

# Get user directory
GET /api/messages/users

# Start conversation
POST /api/messages/start-conversation
```

## 📧 **Email Templates**

The system sends two types of emails:

1. **OTP Verification Email**: Professional template with 6-digit code
2. **Welcome Email**: Congratulations with feature highlights and CTA

## 🛠 **Customization Options**

### Email Service Provider:
- Currently configured for Gmail/Outlook
- Easily adaptable to SendGrid, Mailgun, etc.
- SMTP settings configurable via environment variables

### OTP Settings:
- Length: 6 digits (configurable in `emailService.js`)
- Expiry: 10 minutes (configurable in auth routes)
- Resend cooldown: 60 seconds (configurable in frontend)

### Chat Features:
- Room list is configurable in `EnhancedChat.js`
- Direct message limits can be added
- File sharing can be enabled in future updates

## 🚨 **Important Notes**

1. **Set EMAIL_USER and EMAIL_PASS** in backend/.env before testing
2. **Update FRONTEND_URL** to match your deployment domain
3. **Run database migration** for existing users
4. **Test email delivery** in development before deploying
5. **Consider email rate limits** for production (implement queuing if needed)

## 🎉 **Ready to Launch!**

Your Student Library now has:
- ✅ Secure email verification
- ✅ Global community chat
- ✅ Private direct messaging
- ✅ User discovery and connection
- ✅ Real-time communication
- ✅ Complete authentication system

All verified users are automatically part of the community and can engage with content and each other!
