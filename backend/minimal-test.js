const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Test server is running!'
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
