# Student Library Web Application

A comprehensive MERN stack web application for students to access books, videos, chat with peers, and manage their learning resources.

## 🚀 Features

### Frontend Features
- **React 18** with modern hooks and functional components
- **Redux Toolkit** for state management
- **React Router** for navigation and protected routes
- **Tailwind CSS** for responsive styling
- **Real-time chat** using Socket.IO
- **Authentication flow** with JWT tokens
- **File upload** support with image previews
- **Responsive design** for all devices

### Backend Features
- **Express.js** REST API with comprehensive routes
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with protected routes
- **Socket.IO** for real-time messaging
- **Cloudinary** integration for file uploads
- **Rate limiting** and security middleware
- **CORS** configured for frontend integration
- **Admin panel** for content management

### Core Functionality
- 📚 **Books Library**: Browse, search, rate, and favorite books
- 🎥 **Video Library**: Watch educational videos with custom player
- 💬 **Real-time Chat**: Multi-room chat system with typing indicators
- 👤 **User Profiles**: Editable profiles with avatar upload
- 🔐 **Authentication**: Secure login/register with JWT
- 👨‍💼 **Admin Panel**: Manage users, books, and videos
- ❤️ **Favorites**: Save favorite books and videos
- ⭐ **Rating System**: Rate and review content
- 🔍 **Search & Filter**: Advanced search across all content

## 📁 Project Structure

```
student-library/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, upload, validation
│   ├── utils/           # Cloudinary, helpers
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── store/       # Redux store and slices
    │   ├── context/     # React contexts
    │   ├── App.js       # Main app component
    │   └── index.js     # App entry point
    ├── public/          # Static assets
    └── package.json     # Frontend dependencies
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas account
- Cloudinary account (for file uploads)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-library
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_APP_NAME=Student Library
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Set build command**: `npm install`
4. **Set start command**: `npm start`
5. **Add environment variables** in Render dashboard
6. **Update CLIENT_URL** to your frontend domain

### Frontend Deployment (Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder, or
   - Connect your GitHub repository for automatic deployments

3. **Update environment variables**
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

## 🎯 Usage

### For Students
1. **Register** with your student credentials
2. **Browse** the books and videos library
3. **Search** for specific content using filters
4. **Rate and favorite** content you like
5. **Join chat rooms** to discuss with peers
6. **Update your profile** with bio and avatar

### For Administrators
1. **Login** with admin credentials
2. **Access admin panel** from the navigation
3. **Manage users** - view, edit roles, delete accounts
4. **Manage content** - add, edit, delete books and videos
5. **Monitor statistics** - view user activity and content metrics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books with filtering
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create new book (admin)
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)
- `POST /api/books/:id/rate` - Rate a book

### Videos
- `GET /api/videos` - Get all videos with filtering
- `GET /api/videos/:id` - Get specific video
- `POST /api/videos` - Create new video (admin)
- `PUT /api/videos/:id` - Update video (admin)
- `DELETE /api/videos/:id` - Delete video (admin)
- `POST /api/videos/:id/rate` - Rate a video

### Messages
- `GET /api/messages` - Get messages for a room
- `POST /api/messages` - Send a new message

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get system statistics

## 🛠️ Built With

### Frontend Technologies
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library
- **Vite** - Build tool

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Cloudinary** - Image/video hosting
- **Multer** - File upload middleware
- **Bcrypt** - Password hashing
- **Express Rate Limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce the problem
4. Provide error logs if applicable

## 🎉 Demo Credentials

For testing purposes, you can use these demo accounts:

**Admin Account:**
- Email: admin@studentlibrary.com
- Password: admin123456

**Student Account:**
- Email: student@example.com
- Password: student123

---

**Happy Learning! 📚🎓**
