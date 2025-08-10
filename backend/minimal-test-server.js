const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

const port = 3000;

app.listen(port, () => {
    console.log(`Minimal test server running on http://localhost:${port}`);
});
