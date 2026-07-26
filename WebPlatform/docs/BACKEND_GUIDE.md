# 🖥️ Backend Guide / बैकएंड गाइड

## JhariaWatch Node.js Backend Implementation

---

## 1. Project Setup

### 1.1 Initialize Project

```bash
# Create project directory
mkdir jharia-backend
cd jharia-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install firebase-admin
npm install multer sharp
npm install @tensorflow/tfjs-node
npm install node-cron
npm install express-validator
npm install express-rate-limit
npm install winston

# Dev dependencies
npm install -D nodemon typescript ts-node @types/node @types/express
npm install -D @types/cors @types/morgan @types/jsonwebtoken @types/multer
```

### 1.2 Project Structure

```
jharia-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── firebase.ts
│   │   └── app.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── RiskZone.ts
│   │   ├── Report.ts
│   │   ├── Alert.ts
│   │   └── SatelliteData.ts
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── riskController.ts
│   │   ├── reportController.ts
│   │   ├── alertController.ts
│   │   └── adminController.ts
│   │
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── riskRoutes.ts
│   │   ├── reportRoutes.ts
│   │   ├── alertRoutes.ts
│   │   └── adminRoutes.ts
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── adminMiddleware.ts
│   │   ├── uploadMiddleware.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   │
│   ├── services/
│   │   ├── firebaseService.ts
│   │   ├── notificationService.ts
│   │   ├── aiService.ts
│   │   └── geoService.ts
│   │
│   ├── ai/
│   │   ├── crackDetectionModel.ts
│   │   └── inference.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   │
│   ├── jobs/
│   │   └── scheduledTasks.ts
│   │
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## 2. Configuration Files

### 2.1 Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/jharia_watch

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# AI Model
AI_MODEL_PATH=./src/ai/models/crack_detection

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.2 TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.3 Nodemon Config (nodemon.json)

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/server.ts"
}
```

---

## 3. Core Server Files

### 3.1 Server Entry Point (server.ts)

```typescript
// src/server.ts
import app from './config/app';
import { connectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { logger } from './utils/logger';
import { startScheduledJobs } from './jobs/scheduledTasks';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✅ MongoDB connected');

    // Initialize Firebase Admin
    initializeFirebase();
    logger.info('✅ Firebase initialized');

    // Start scheduled jobs
    startScheduledJobs();
    logger.info('✅ Scheduled jobs started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
```

### 3.2 Express App Config (config/app.ts)

```typescript
// src/config/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import routes from '../routes';
import { errorHandler } from '../middlewares/errorHandler';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://jhariawatch.in', 'https://admin.jhariawatch.in']
    : '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: { en: 'Too many requests', hi: 'बहुत सारे अनुरोध' }
    }
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: { en: 'Route not found', hi: 'रूट नहीं मिला' }
    }
  });
});

// Error handler
app.use(errorHandler);

export default app;
```

### 3.3 Database Config (config/database.ts)

```typescript
// src/config/database.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jharia_watch';
    
    await mongoose.connect(mongoUri);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};
```

### 3.4 Firebase Config (config/firebase.ts)

```typescript
// src/config/firebase.ts
import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = (): void => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    logger.info('Firebase Admin SDK initialized');
  } catch (error) {
    logger.error('Firebase initialization failed:', error);
    throw error;
  }
};

export const firebaseAdmin = admin;
```

---

## 4. Models

### 4.1 User Model (models/User.ts)

```typescript
// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email?: string;
  phone?: string;
  name: string;
  profileImage?: string;
  preferredLanguage: 'en' | 'hi';
  homeLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    locality?: string;
  };
  role: 'user' | 'admin' | 'bccl_official' | 'govt_official';
  notifications: {
    enabled: boolean;
    emergencyAlerts: boolean;
    weeklyUpdates: boolean;
    reportUpdates: boolean;
  };
  fcmTokens: string[];
  subscribedZones: string[];
  lastActive: Date;
  reportsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  name: { type: String, required: true },
  profileImage: String,
  preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'hi' },
  homeLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
    address: String,
    locality: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'bccl_official', 'govt_official'],
    default: 'user',
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true },
    weeklyUpdates: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true },
  },
  fcmTokens: [String],
  subscribedZones: [String],
  lastActive: Date,
  reportsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ 'homeLocation': '2dsphere' });

export default mongoose.model<IUser>('User', userSchema);
```

### 4.2 Risk Zone Model (models/RiskZone.ts)

```typescript
// src/models/RiskZone.ts
import mongoose, { Document, Schema } from 'mongoose';

interface BilingualText {
  en: string;
  hi: string;
}

export interface IRiskZone extends Document {
  zoneId: string;
  zoneName: BilingualText;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'stable' | 'uplifting';
  riskScore: number;
  subsidenceData: {
    averageRate: number;
    maxRate: number;
    cumulativeDisplacement: number;
    measurementPeriod: {
      start: Date;
      end: Date;
    };
    dataSource: string;
  };
  description: BilingualText;
  affectedArea: number;
  estimatedPopulation: number;
  landmarks: Array<{
    name: BilingualText;
    coordinates: [number, number];
    type: string;
  }>;
  safetyRecommendations: {
    en: string[];
    hi: string[];
  };
  evacuationRoutes: Array<{
    name: string;
    path: {
      type: string;
      coordinates: number[][];
    };
  }>;
  nearestSafeZone: {
    zoneId: string;
    distance: number;
  };
  bccl_area: string;
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const riskZoneSchema = new Schema<IRiskZone>({
  zoneId: { type: String, required: true, unique: true },
  zoneName: {
    en: { type: String, required: true },
    hi: { type: String, required: true },
  },
  geometry: {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: true },
  },
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'moderate', 'low', 'stable', 'uplifting'],
    required: true,
  },
  riskScore: { type: Number, min: 0, max: 100 },
  subsidenceData: {
    averageRate: Number,
    maxRate: Number,
    cumulativeDisplacement: Number,
    measurementPeriod: {
      start: Date,
      end: Date,
    },
    dataSource: String,
  },
  description: {
    en: String,
    hi: String,
  },
  affectedArea: Number,
  estimatedPopulation: Number,
  landmarks: [{
    name: { en: String, hi: String },
    coordinates: [Number],
    type: String,
  }],
  safetyRecommendations: {
    en: [String],
    hi: [String],
  },
  evacuationRoutes: [{
    name: String,
    path: {
      type: String,
      coordinates: [[Number]],
    },
  }],
  nearestSafeZone: {
    zoneId: String,
    distance: Number,
  },
  bccl_area: String,
  isActive: { type: Boolean, default: true },
  lastUpdated: Date,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Geospatial index
riskZoneSchema.index({ geometry: '2dsphere' });

export default mongoose.model<IRiskZone>('RiskZone', riskZoneSchema);
```

### 4.3 Report Model (models/Report.ts)

```typescript
// src/models/Report.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  userId: mongoose.Types.ObjectId;
  reporterName: string;
  reporterPhone: string;
  isAnonymous: boolean;
  location: {
    type: string;
    coordinates: [number, number];
    accuracy?: number;
    address?: string;
    locality?: string;
    nearestZone?: string;
  };
  reportType: 'crack' | 'subsidence' | 'building_damage' | 'road_damage' | 'other';
  photos: Array<{
    url: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    fileSize?: number;
    dimensions?: { width: number; height: number };
  }>;
  aiAnalysis: {
    processed: boolean;
    processedAt?: Date;
    crackDetected?: boolean;
    crackSeverity?: 'none' | 'minor' | 'moderate' | 'severe' | 'critical';
    confidence?: number;
    detectedFeatures?: Array<{
      type: string;
      boundingBox: { x: number; y: number; width: number; height: number };
      confidence: number;
    }>;
    modelVersion?: string;
  };
  description?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'under_review' | 'verified' | 'resolved' | 'rejected';
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  review?: {
    reviewedBy: mongoose.Types.ObjectId;
    reviewedAt: Date;
    verificationStatus: 'unverified' | 'verified' | 'false_report';
    adminNotes?: string;
    actionTaken?: string;
  };
  relatedAlertId?: mongoose.Types.ObjectId;
  deviceInfo?: {
    platform: string;
    appVersion: string;
    deviceModel?: string;
  };
}

const reportSchema = new Schema<IReport>({
  reportId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: String,
  reporterPhone: String,
  isAnonymous: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    accuracy: Number,
    address: String,
    locality: String,
    nearestZone: String,
  },
  reportType: {
    type: String,
    enum: ['crack', 'subsidence', 'building_damage', 'road_damage', 'other'],
    required: true,
  },
  photos: [{
    url: { type: String, required: true },
    thumbnailUrl: String,
    uploadedAt: { type: Date, default: Date.now },
    fileSize: Number,
    dimensions: { width: Number, height: Number },
  }],
  aiAnalysis: {
    processed: { type: Boolean, default: false },
    processedAt: Date,
    crackDetected: Boolean,
    crackSeverity: { type: String, enum: ['none', 'minor', 'moderate', 'severe', 'critical'] },
    confidence: Number,
    detectedFeatures: [{
      type: String,
      boundingBox: { x: Number, y: Number, width: Number, height: Number },
      confidence: Number,
    }],
    modelVersion: String,
  },
  description: String,
  urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'resolved', 'rejected'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  }],
  review: {
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    verificationStatus: { type: String, enum: ['unverified', 'verified', 'false_report'] },
    adminNotes: String,
    actionTaken: String,
  },
  relatedAlertId: { type: Schema.Types.ObjectId, ref: 'Alert' },
  deviceInfo: {
    platform: String,
    appVersion: String,
    deviceModel: String,
  },
}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', reportSchema);
```

---

## 5. Controllers

### 5.1 Risk Controller (controllers/riskController.ts)

```typescript
// src/controllers/riskController.ts
import { Request, Response, NextFunction } from 'express';
import RiskZone from '../models/RiskZone';
import { findNearestZone, isPointInPolygon } from '../services/geoService';
import { logger } from '../utils/logger';

// Get all risk zones as GeoJSON
export const getRiskZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { riskLevel, bounds } = req.query;

    const query: any = { isActive: true };
    
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    // If bounds provided, filter by bounding box
    if (bounds) {
      const [minLng, minLat, maxLng, maxLat] = (bounds as string).split(',').map(Number);
      query.geometry = {
        $geoWithin: {
          $box: [[minLng, minLat], [maxLng, maxLat]]
        }
      };
    }

    const zones = await RiskZone.find(query).lean();

    // Convert to GeoJSON FeatureCollection
    const geoJson = {
      type: 'FeatureCollection',
      features: zones.map(zone => ({
        type: 'Feature',
        properties: {
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          riskLevel: zone.riskLevel,
          riskScore: zone.riskScore,
          subsidenceRate: zone.subsidenceData?.averageRate,
          description: zone.description,
          color: getRiskColor(zone.riskLevel),
        },
        geometry: zone.geometry,
      })),
      metadata: {
        totalZones: zones.length,
        criticalZones: zones.filter(z => z.riskLevel === 'critical').length,
        highZones: zones.filter(z => z.riskLevel === 'high').length,
        lastUpdated: new Date().toISOString(),
      },
    };

    res.json({ success: true, data: geoJson });
  } catch (error) {
    next(error);
  }
};

// Check risk at specific location
export const checkRiskAtLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: { en: 'Latitude and longitude required', hi: 'अक्षांश और देशांतर आवश्यक है' } }
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const point = [longitude, latitude];

    // Find zone containing the point
    const containingZone = await RiskZone.findOne({
      isActive: true,
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: point,
          }
        }
      }
    }).lean();

    // If not in any zone, find nearest zone
    let nearestZone = null;
    if (!containingZone) {
      nearestZone = await findNearestZone(latitude, longitude);
    }

    const response: any = {
      location: {
        coordinates: point,
      },
      riskAssessment: {
        isInRiskZone: !!containingZone,
      }
    };

    if (containingZone) {
      response.riskAssessment.zone = {
        zoneId: containingZone.zoneId,
        zoneName: containingZone.zoneName,
        riskLevel: containingZone.riskLevel,
        riskScore: containingZone.riskScore,
      };
      response.riskAssessment.subsidenceData = containingZone.subsidenceData;
      response.riskAssessment.riskDescription = getRiskDescription(containingZone.riskLevel);
      response.safetyRecommendations = containingZone.safetyRecommendations;
      
      if (containingZone.nearestSafeZone) {
        response.nearestSafeZone = containingZone.nearestSafeZone;
      }
    } else {
      response.riskAssessment.riskLevel = 'stable';
      response.riskAssessment.riskScore = 15;
      response.riskAssessment.riskDescription = {
        en: 'This location is in a stable zone with minimal subsidence risk.',
        hi: 'यह स्थान न्यूनतम धंसाव जोखिम वाले स्थिर क्षेत्र में है।'
      };
      
      if (nearestZone) {
        response.riskAssessment.nearestRiskZone = {
          zoneName: nearestZone.zoneName,
          distance: nearestZone.distance,
          unit: 'km',
        };
      }
    }

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// Get zone details
export const getZoneDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { zoneId } = req.params;

    const zone = await RiskZone.findOne({ zoneId, isActive: true }).lean();

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: { en: 'Zone not found', hi: 'क्षेत्र नहीं मिला' } }
      });
    }

    res.json({ success: true, data: { zone } });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const getRiskColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    critical: '#dc2626',
    high: '#ea580c',
    moderate: '#ca8a04',
    low: '#65a30d',
    stable: '#16a34a',
    uplifting: '#2563eb',
  };
  return colors[level] || '#6b7280';
};

const getRiskDescription = (level: string) => {
  const descriptions: { [key: string]: { en: string; hi: string } } = {
    critical: {
      en: 'You are in a CRITICAL subsidence zone. This area has recorded significant ground movement. Please exercise extreme caution and consider evacuation.',
      hi: 'आप एक गंभीर धंसाव क्षेत्र में हैं। इस क्षेत्र में महत्वपूर्ण जमीन की गति दर्ज की गई है। कृपया अत्यधिक सावधानी बरतें और निकासी पर विचार करें।'
    },
    high: {
      en: 'You are in a HIGH risk subsidence zone. Regular monitoring and caution advised.',
      hi: 'आप उच्च जोखिम वाले धंसाव क्षेत्र में हैं। नियमित निगरानी और सावधानी की सलाह दी जाती है।'
    },
    moderate: {
      en: 'You are in a MODERATE risk zone. Stay alert and report any ground changes.',
      hi: 'आप मध्यम जोखिम वाले क्षेत्र में हैं। सतर्क रहें और किसी भी जमीन परिवर्तन की रिपोर्ट करें।'
    },
    low: {
      en: 'You are in a LOW risk zone. Minimal subsidence activity recorded.',
      hi: 'आप कम जोखिम वाले क्षेत्र में हैं। न्यूनतम धंसाव गतिविधि दर्ज की गई है।'
    },
    stable: {
      en: 'This location is in a stable zone with minimal subsidence risk.',
      hi: 'यह स्थान न्यूनतम धंसाव जोखिम वाले स्थिर क्षेत्र में है।'
    },
  };
  return descriptions[level] || descriptions.stable;
};
```

### 5.2 Report Controller (controllers/reportController.ts)

```typescript
// src/controllers/reportController.ts
import { Request, Response, NextFunction } from 'express';
import Report from '../models/Report';
import User from '../models/User';
import { uploadToFirebase } from '../services/firebaseService';
import { analyzeImage } from '../services/aiService';
import { findNearestZone } from '../services/geoService';
import { sendNotificationToAdmins } from '../services/notificationService';
import { generateReportId } from '../utils/helpers';
import { logger } from '../utils/logger';

// Submit new report
export const submitReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { reportType, description, latitude, longitude, urgencyLevel, isAnonymous } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PHOTOS', message: { en: 'At least one photo required', hi: 'कम से कम एक फोटो आवश्यक है' } }
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' } }
      });
    }

    // Upload photos to Firebase Storage
    const photos = await Promise.all(
      files.map(async (file) => {
        const { url, thumbnailUrl } = await uploadToFirebase(file);
        return {
          url,
          thumbnailUrl,
          uploadedAt: new Date(),
          fileSize: file.size,
        };
      })
    );

    // Find nearest risk zone
    const nearestZone = await findNearestZone(parseFloat(latitude), parseFloat(longitude));

    // Create report
    const report = new Report({
      reportId: generateReportId(),
      userId,
      reporterName: isAnonymous ? 'Anonymous' : user.name,
      reporterPhone: isAnonymous ? undefined : user.phone,
      isAnonymous: isAnonymous === 'true',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        nearestZone: nearestZone?.zoneId,
      },
      reportType,
      photos,
      description,
      urgencyLevel: urgencyLevel || 'medium',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
      }],
    });

    await report.save();

    // Update user's report count
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });

    // Trigger AI analysis asynchronously
    processAIAnalysis(report._id.toString(), photos[0].url);

    // Notify admins
    sendNotificationToAdmins({
      title: { en: 'New Report Submitted', hi: 'नई रिपोर्ट जमा' },
      body: { 
        en: `New ${reportType} report from ${nearestZone?.zoneName?.en || 'unknown area'}`,
        hi: `${nearestZone?.zoneName?.hi || 'अज्ञात क्षेत्र'} से नई ${reportType} रिपोर्ट`
      },
      data: { reportId: report.reportId },
    });

    res.status(201).json({
      success: true,
      message: {
        en: 'Report submitted successfully. Our team will review it shortly.',
        hi: 'रिपोर्ट सफलतापूर्वक जमा हो गई। हमारी टीम जल्द ही इसकी समीक्षा करेगी।'
      },
      data: {
        reportId: report.reportId,
        status: report.status,
        aiProcessing: {
          status: 'processing',
          estimatedTime: '30 seconds',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's reports
export const getUserReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get report details
export const getReportDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const userId = (req as any).userId;

    const report = await Report.findOne({ reportId }).lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: { en: 'Report not found', hi: 'रिपोर्ट नहीं मिली' } }
      });
    }

    // Check ownership (unless admin)
    if (report.userId.toString() !== userId && !(req as any).isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: { en: 'Access denied', hi: 'पहुंच अस्वीकृत' } }
      });
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

// Process AI analysis (async function)
const processAIAnalysis = async (reportId: string, imageUrl: string) => {
  try {
    const result = await analyzeImage(imageUrl);
    
    await Report.findByIdAndUpdate(reportId, {
      aiAnalysis: {
        processed: true,
        processedAt: new Date(),
        ...result,
      },
    });
    
    logger.info(`AI analysis completed for report ${reportId}`);
  } catch (error) {
    logger.error(`AI analysis failed for report ${reportId}:`, error);
  }
};
```

---

## 6. Routes

### 6.1 Main Routes Index (routes/index.ts)

```typescript
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import riskRoutes from './riskRoutes';
import reportRoutes from './reportRoutes';
import alertRoutes from './alertRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/risk', riskRoutes);
router.use('/reports', reportRoutes);
router.use('/alerts', alertRoutes);
router.use('/admin', adminRoutes);

export default router;
```

### 6.2 Risk Routes (routes/riskRoutes.ts)

```typescript
// src/routes/riskRoutes.ts
import { Router } from 'express';
import { getRiskZones, checkRiskAtLocation, getZoneDetails } from '../controllers/riskController';

const router = Router();

// Public routes
router.get('/zones', getRiskZones);
router.get('/check', checkRiskAtLocation);
router.get('/zones/:zoneId', getZoneDetails);

export default router;
```

---

## 7. Services

### 7.1 AI Service (services/aiService.ts)

```typescript
// src/services/aiService.ts
import * as tf from '@tensorflow/tfjs-node';
import { logger } from '../utils/logger';

let model: tf.GraphModel | null = null;

// Load model on startup
export const loadModel = async () => {
  try {
    model = await tf.loadGraphModel(`file://${process.env.AI_MODEL_PATH}/model.json`);
    logger.info('AI crack detection model loaded');
  } catch (error) {
    logger.warn('AI model not loaded, using mock analysis:', error);
  }
};

export interface AIAnalysisResult {
  crackDetected: boolean;
  crackSeverity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  detectedFeatures: Array<{
    type: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  modelVersion: string;
}

export const analyzeImage = async (imageUrl: string): Promise<AIAnalysisResult> => {
  try {
    // For hackathon demo, return mock analysis
    // In production, this would use actual TensorFlow inference
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI result (randomized for demo)
    const crackDetected = Math.random() > 0.3;
    const severityLevels: AIAnalysisResult['crackSeverity'][] = ['none', 'minor', 'moderate', 'severe', 'critical'];
    
    return {
      crackDetected,
      crackSeverity: crackDetected 
        ? severityLevels[Math.floor(Math.random() * 4) + 1] 
        : 'none',
      confidence: crackDetected ? 0.75 + Math.random() * 0.2 : 0.9,
      detectedFeatures: crackDetected ? [{
        type: 'crack',
        boundingBox: {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
          width: 150 + Math.floor(Math.random() * 100),
          height: 30 + Math.floor(Math.random() * 50),
        },
        confidence: 0.75 + Math.random() * 0.2,
      }] : [],
      modelVersion: '1.0.0-demo',
    };
  } catch (error) {
    logger.error('AI analysis error:', error);
    throw error;
  }
};
```

### 7.2 Notification Service (services/notificationService.ts)

```typescript
// src/services/notificationService.ts
import { firebaseAdmin } from '../config/firebase';
import User from '../models/User';
import { logger } from '../utils/logger';

interface NotificationPayload {
  title: { en: string; hi: string };
  body: { en: string; hi: string };
  data?: { [key: string]: string };
}

// Send to specific user
export const sendNotificationToUser = async (userId: string, payload: NotificationPayload) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens.length) return;

    const lang = user.preferredLanguage || 'hi';
    
    const message = {
      notification: {
        title: payload.title[lang],
        body: payload.body[lang],
      },
      data: payload.data || {},
      tokens: user.fcmTokens,
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    logger.info(`Notification sent to user ${userId}: ${response.successCount} success`);
  } catch (error) {
    logger.error('Send notification error:', error);
  }
};

// Send to all admins
export const sendNotificationToAdmins = async (payload: NotificationPayload) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'bccl_official', 'govt_official'] },
      'notifications.enabled': true,
    });

    for (const admin of admins) {
      await sendNotificationToUser(admin._id.toString(), payload);
    }
  } catch (error) {
    logger.error('Send admin notification error:', error);
  }
};

// Send to zone subscribers (for alerts)
export const sendAlertToZone = async (zoneId: string, payload: NotificationPayload) => {
  try {
    const topic = `zone_${zoneId}`;
    
    // Send to both language versions
    const messageEn = {
      notification: {
        title: payload.title.en,
        body: payload.body.en,
      },
      data: payload.data || {},
      topic: topic,
      condition: `'${topic}' in topics && 'lang_en' in topics`,
    };

    const messageHi = {
      notification: {
        title: payload.title.hi,
        body: payload.body.hi,
      },
      data: payload.data || {},
      topic: topic,
      condition: `'${topic}' in topics && 'lang_hi' in topics`,
    };

    await Promise.all([
      firebaseAdmin.messaging().send(messageEn),
      firebaseAdmin.messaging().send(messageHi),
    ]);

    logger.info(`Alert sent to zone ${zoneId}`);
  } catch (error) {
    logger.error('Send zone alert error:', error);
  }
};

// Broadcast to all users
export const broadcastNotification = async (payload: NotificationPayload) => {
  try {
    await Promise.all([
      firebaseAdmin.messaging().send({
        notification: { title: payload.title.en, body: payload.body.en },
        data: payload.data || {},
        topic: 'all_users_en',
      }),
      firebaseAdmin.messaging().send({
        notification: { title: payload.title.hi, body: payload.body.hi },
        data: payload.data || {},
        topic: 'all_users_hi',
      }),
    ]);

    logger.info('Broadcast notification sent');
  } catch (error) {
    logger.error('Broadcast notification error:', error);
  }
};
```

---

## 8. Running the Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# With PM2
pm2 start dist/server.js --name jharia-api
```

---

## 9. Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "ts-node src/scripts/seedDatabase.ts",
    "lint": "eslint src/**/*.ts"
  }
}
```

---

*Document Version: 1.0*
*For Claude Code CLI implementation*
