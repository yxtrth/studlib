const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library';
console.log('Attempting to connect to MongoDB at:', mongoURI);

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('✓ MongoDB connected successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});
