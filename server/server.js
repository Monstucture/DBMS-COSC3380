const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

// Load environment variables
require('dotenv').config();

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});
app.use(cors({
    origin: [
      'https://dbms-cosc-3380client.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

app.use(express.json());

// Routers
const authRouter = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const customerRouter = require('./routes/customers');
const reportsRouter = require('./routes/reports');

// Use Routes
app.use('/shop', shopRoutes);
app.use('/auth', authRouter);
app.use('/acc', customerRouter);
app.use('/reports', reportsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something broke!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Listening to server changes
if (process.env.NODE_ENV === 'production') {
    // Serve static files if you have them
    if (process.env.SERVE_STATIC === 'true') {
      app.use(express.static('public'));
    
      app.get('*',limiter, (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
      });
    }
  }
  
  // Server startup 
  const PORT = process.env.PORT || 5000;
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
  
  module.exports = app;