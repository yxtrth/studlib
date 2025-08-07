const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
