const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const eventController = require('./controllers/eventController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/analyze-event', eventController.analyzeEvent);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running smoothly.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
