const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Netlify and Render domains
    if (
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};
