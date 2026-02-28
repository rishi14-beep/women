const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const authRoutes = require('../routes/authRoutes');
const emergencyRoutes = require('../routes/emergencyRoutes');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Enable CORS for client
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5500',
  credentials: true,
}));

// Simple health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/women_safety';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
