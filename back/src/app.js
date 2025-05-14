const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


require('dotenv').config();

// Initialize the table
initDatabase();

// Create the express app:
const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowsMs: 15*60*1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


// CORS
app.use(cors({
  origin: 'http://localhost:8090',
  methods: ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE'],
  allowedHeaders: ['Content-type' , 'Authorization']
}));

// Parse json bodies
app.use(express.json());

// Routes
app.use('/api/auth' , authRoutes);
app.use('/api/users' , userRoutes);

// Health check endpoint
app.get('/health' , (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
// Start server 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
