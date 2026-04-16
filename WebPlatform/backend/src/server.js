const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const riskRoutes = require('./routes/riskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const alertRoutes = require('./routes/alertRoutes');
const seedRoutes = require('./routes/seedRoutes');
const geeRoutes = require('./routes/geeRoutes');
const satelliteRoutes = require('./routes/satelliteRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS configuration - more explicit for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development, specific origins in production
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://jhariyawatch.onrender.com',
      'https://jhariyawatch.vercel.app',
      'https://*.vercel.app',
      'https://*.netlify.app'
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure JSON responses have proper headers
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: { en: 'Too many requests', hi: 'बहुत सारे अनुरोध' } }
  }
});
app.use(limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', seedRoutes);
app.use('/api/gee', geeRoutes);
app.use('/api/satellite', satelliteRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: { en: 'Route not found', hi: 'रूट नहीं मिला' } }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: { en: err.message || 'Internal server error', hi: 'आंतरिक सर्वर त्रुटि' }
    }
  });
});

const { seedDatabase } = require('./data/seedData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    const RiskZone = require('./models/RiskZone');
    const count = await RiskZone.countDocuments();
    if (count === 0) {
      console.log('No data found, seeding database...');
      await seedDatabase();
    } else {
      console.log(`Database has ${count} risk zones, skipping seed`);
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Setup cron job for weekly email updates
const cron = require('node-cron');
const { sendWeeklyUpdates } = require('./controllers/notificationController');

// Schedule weekly updates (Every Monday at 9 AM IST)
cron.schedule(process.env.WEEKLY_UPDATE_CRON || '0 9 * * 1', async () => {
  console.log('📧 Running weekly email updates...');
  try {
    await sendWeeklyUpdates();
  } catch (error) {
    console.error('❌ Weekly update cron error:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});

console.log('✅ Weekly email cron job scheduled');

const startServer = async () => {
  await connectDB();
  await initializeDatabase();

  // Initialize Google Earth Engine
  const geeService = require('./services/geeService');
  try {
    await geeService.initialize();
  } catch (error) {
    console.log('⚠️ GEE initialization failed, using fallback data');
  }

  // Initialize Satellite Processing Service
  const satelliteProcessingService = require('./services/satelliteProcessingService');
  try {
    await satelliteProcessingService.initialize();
    console.log('✅ Satellite Processing Service initialized');
  } catch (error) {
    console.error('❌ Satellite Processing Service initialization failed:', error);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
