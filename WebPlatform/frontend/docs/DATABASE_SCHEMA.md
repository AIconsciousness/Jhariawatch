# 📊 Database Schema / डेटाबेस स्कीमा

## MongoDB Database Design for JhariaWatch

---

## 1. Database Overview

**Database Name:** `jharia_watch_db`

**Collections:**
1. `users` - User accounts
2. `risk_zones` - GeoJSON risk areas
3. `reports` - Photo reports from users
4. `alerts` - System alerts/notifications
5. `satellite_data` - Cached satellite/InSAR data
6. `app_settings` - Application configuration

---

## 2. Collection Schemas

### 2.1 Users Collection

```javascript
// Collection: users
{
  _id: ObjectId,
  
  // Authentication
  firebaseUid: String,           // Firebase Auth UID
  email: String,                 // User email (optional)
  phone: String,                 // Phone number (primary auth)
  
  // Profile
  name: String,                  // Full name
  profileImage: String,          // Profile image URL
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi'],
    default: 'hi'
  },
  
  // Location
  homeLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,               // Human readable address
    locality: String               // Area name (Alkusa, Ena, etc.)
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'bccl_official', 'govt_official'],
    default: 'user'
  },
  
  // Notification Preferences
  notifications: {
    enabled: { type: Boolean, default: true },
    emergencyAlerts: { type: Boolean, default: true },
    weeklyUpdates: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true }
  },
  fcmTokens: [String],           // Firebase Cloud Messaging tokens
  subscribedZones: [String],     // Zone IDs user subscribed to
  
  // Activity Tracking
  lastActive: Date,
  reportsCount: { type: Number, default: 0 },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  isActive: { type: Boolean, default: true }
}

// Indexes
users.createIndex({ firebaseUid: 1 }, { unique: true });
users.createIndex({ phone: 1 }, { unique: true, sparse: true });
users.createIndex({ email: 1 }, { sparse: true });
users.createIndex({ "homeLocation": "2dsphere" });
users.createIndex({ role: 1 });
```

### 2.2 Risk Zones Collection (GeoJSON)

```javascript
// Collection: risk_zones
{
  _id: ObjectId,
  
  // Zone Identification
  zoneId: String,                // Unique zone ID (e.g., "alkusa_critical_01")
  zoneName: {
    en: String,                  // English name
    hi: String                   // Hindi name
  },
  
  // GeoJSON Geometry (Polygon)
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'MultiPolygon'],
      default: 'Polygon'
    },
    coordinates: [[[ Number ]]]  // GeoJSON polygon coordinates
  },
  
  // Risk Classification
  riskLevel: {
    type: String,
    enum: ['critical', 'high', 'moderate', 'low', 'stable', 'uplifting'],
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Subsidence Data (from research papers)
  subsidenceData: {
    averageRate: Number,         // mm/year
    maxRate: Number,             // mm/year
    cumulativeDisplacement: Number, // mm (total observed)
    measurementPeriod: {
      start: Date,
      end: Date
    },
    dataSource: String           // "Sentinel-1", "ENVISAT", etc.
  },
  
  // Zone Details
  description: {
    en: String,
    hi: String
  },
  affectedArea: Number,          // Square kilometers
  estimatedPopulation: Number,   // People in zone
  
  // Key Locations within zone
  landmarks: [{
    name: { en: String, hi: String },
    coordinates: [Number, Number],
    type: String                 // "colliery", "hospital", "temple", etc.
  }],
  
  // Safety Information
  safetyRecommendations: {
    en: [String],
    hi: [String]
  },
  evacuationRoutes: [{
    name: String,
    path: {
      type: String,
      coordinates: [[ Number ]]  // LineString
    }
  }],
  nearestSafeZone: {
    zoneId: String,
    distance: Number             // km
  },
  
  // Administrative
  district: { type: String, default: 'Dhanbad' },
  state: { type: String, default: 'Jharkhand' },
  bccl_area: String,             // BCCL administrative area (e.g., "Area VIII")
  
  // Status
  isActive: { type: Boolean, default: true },
  lastUpdated: Date,
  updatedBy: ObjectId,           // Admin who last updated
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  dataVersion: { type: Number, default: 1 }
}

// Indexes
risk_zones.createIndex({ geometry: "2dsphere" });
risk_zones.createIndex({ zoneId: 1 }, { unique: true });
risk_zones.createIndex({ riskLevel: 1 });
risk_zones.createIndex({ "subsidenceData.averageRate": -1 });
```

### 2.3 Reports Collection

```javascript
// Collection: reports
{
  _id: ObjectId,
  
  // Report Identification
  reportId: String,              // Unique report ID (e.g., "RPT-20251204-001")
  
  // Reporter Information
  userId: ObjectId,              // Reference to users collection
  reporterName: String,          // Name at time of report
  reporterPhone: String,         // Phone for follow-up
  isAnonymous: { type: Boolean, default: false },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number, Number], // [longitude, latitude]
    accuracy: Number,              // GPS accuracy in meters
    address: String,               // Reverse geocoded address
    locality: String,              // Area name
    nearestZone: String            // Nearest risk zone ID
  },
  
  // Report Type
  reportType: {
    type: String,
    enum: ['crack', 'subsidence', 'building_damage', 'road_damage', 'other'],
    required: true
  },
  
  // Photos
  photos: [{
    url: String,                 // Firebase Storage URL
    thumbnailUrl: String,        // Thumbnail URL
    uploadedAt: Date,
    fileSize: Number,            // bytes
    dimensions: {
      width: Number,
      height: Number
    }
  }],
  
  // AI Analysis Results
  aiAnalysis: {
    processed: { type: Boolean, default: false },
    processedAt: Date,
    crackDetected: Boolean,
    crackSeverity: {
      type: String,
      enum: ['none', 'minor', 'moderate', 'severe', 'critical']
    },
    confidence: Number,          // 0-1 confidence score
    detectedFeatures: [{
      type: String,              // "crack", "displacement", etc.
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      confidence: Number
    }],
    modelVersion: String
  },
  
  // User Description
  description: String,           // User's description of the issue
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'resolved', 'rejected'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId,
    notes: String
  }],
  
  // Admin Review
  review: {
    reviewedBy: ObjectId,        // Admin who reviewed
    reviewedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'false_report']
    },
    adminNotes: String,
    actionTaken: String
  },
  
  // Related Alert (if created)
  relatedAlertId: ObjectId,
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  deviceInfo: {
    platform: String,            // "android", "ios"
    appVersion: String,
    deviceModel: String
  }
}

// Indexes
reports.createIndex({ location: "2dsphere" });
reports.createIndex({ userId: 1 });
reports.createIndex({ reportType: 1 });
reports.createIndex({ status: 1 });
reports.createIndex({ createdAt: -1 });
reports.createIndex({ "location.nearestZone": 1 });
reports.createIndex({ "aiAnalysis.crackSeverity": 1 });
```

### 2.4 Alerts Collection

```javascript
// Collection: alerts
{
  _id: ObjectId,
  
  // Alert Identification
  alertId: String,               // Unique alert ID (e.g., "ALT-20251204-001")
  
  // Alert Type
  alertType: {
    type: String,
    enum: ['emergency', 'warning', 'info', 'update'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  
  // Content (Bilingual)
  title: {
    en: String,
    hi: String
  },
  message: {
    en: String,
    hi: String
  },
  
  // Target Zones
  targetZones: [String],         // Zone IDs affected
  targetAll: { type: Boolean, default: false }, // Broadcast to all
  
  // Geographical Scope
  affectedArea: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle']
    },
    coordinates: [[[ Number ]]],
    radius: Number               // For circle type (meters)
  },
  
  // Validity Period
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  isActive: { type: Boolean, default: true },
  
  // Source Information
  source: {
    type: String,
    enum: ['admin', 'system', 'bccl', 'ndma', 'auto_detection'],
    required: true
  },
  createdBy: ObjectId,           // Admin who created
  
  // Notification Status
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: Date,
  recipientCount: Number,        // Number of users notified
  
  // Related Report (if any)
  relatedReportId: ObjectId,
  
  // Instructions
  instructions: {
    en: [String],
    hi: [String]
  },
  evacuationAdvised: { type: Boolean, default: false },
  
  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    phone: String,
    role: String
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

// Indexes
alerts.createIndex({ alertType: 1 });
alerts.createIndex({ severity: 1 });
alerts.createIndex({ isActive: 1 });
alerts.createIndex({ validFrom: 1, validUntil: 1 });
alerts.createIndex({ targetZones: 1 });
alerts.createIndex({ createdAt: -1 });
```

### 2.5 Satellite Data Collection (Cache)

```javascript
// Collection: satellite_data
{
  _id: ObjectId,
  
  // Data Identification
  dataId: String,                // Unique data ID
  dataSource: {
    type: String,
    enum: ['sentinel_1', 'envisat', 'manual_input'],
    required: true
  },
  
  // Time Period
  acquisitionDate: Date,
  processingDate: Date,
  temporalBaseline: Number,      // Days from reference
  
  // Spatial Coverage
  coverage: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: [[[ Number ]]]
  },
  
  // Deformation Data Points
  dataPoints: [{
    pointId: String,
    coordinates: [Number, Number], // [lon, lat]
    
    // Displacement values
    displacement: Number,          // mm (cumulative)
    velocity: Number,              // mm/year
    velocityStdDev: Number,        // Standard deviation
    
    // Quality indicators
    temporalCoherence: Number,     // 0-1
    amplitudeStabilityIndex: Number,
    
    // Classification
    deformationClass: {
      type: String,
      enum: ['critical_subsiding', 'high_subsiding', 'moderate_subsiding', 
             'stable', 'low_uplifting', 'moderate_uplifting', 'high_uplifting']
    }
  }],
  
  // Processing Parameters
  processingParams: {
    masterDate: Date,
    spatialBaseline: Number,       // meters
    referencePoint: [Number, Number],
    asiThreshold: Number,
    coherenceThreshold: Number
  },
  
  // Statistics
  statistics: {
    totalPoints: Number,
    criticalPoints: Number,
    highSubsidingPoints: Number,
    maxSubsidenceRate: Number,
    minSubsidenceRate: Number,
    averageSubsidenceRate: Number
  },
  
  // Metadata
  uploadedBy: ObjectId,
  uploadedAt: { type: Date, default: Date.now },
  isLatest: { type: Boolean, default: true },
  notes: String
}

// Indexes
satellite_data.createIndex({ coverage: "2dsphere" });
satellite_data.createIndex({ acquisitionDate: -1 });
satellite_data.createIndex({ dataSource: 1 });
satellite_data.createIndex({ isLatest: 1 });
```

### 2.6 App Settings Collection

```javascript
// Collection: app_settings
{
  _id: ObjectId,
  
  settingKey: String,            // Unique setting identifier
  
  // Risk Thresholds
  riskThresholds: {
    critical: Number,            // mm/year for critical classification
    high: Number,
    moderate: Number,
    low: Number
  },
  
  // Notification Settings
  notificationSettings: {
    emergencyAlertEnabled: Boolean,
    dailySummaryEnabled: Boolean,
    dailySummaryTime: String,    // "09:00"
    weeklyReportEnabled: Boolean,
    weeklyReportDay: Number      // 0=Sunday, 6=Saturday
  },
  
  // AI Model Settings
  aiSettings: {
    modelVersion: String,
    confidenceThreshold: Number,
    autoProcessEnabled: Boolean
  },
  
  // Emergency Contacts (Global)
  emergencyContacts: [{
    name: { en: String, hi: String },
    phone: String,
    type: String,
    isActive: Boolean
  }],
  
  // App Version Control
  minimumAppVersion: {
    android: String,
    ios: String
  },
  latestAppVersion: {
    android: String,
    ios: String
  },
  forceUpdate: Boolean,
  
  // Maintenance Mode
  maintenanceMode: {
    enabled: Boolean,
    message: { en: String, hi: String },
    expectedEndTime: Date
  },
  
  // Metadata
  updatedAt: Date,
  updatedBy: ObjectId
}
```

---

## 3. Sample Data

### 3.1 Sample Risk Zone (Alkusa Critical Zone)

```javascript
{
  _id: ObjectId("..."),
  zoneId: "alkusa_critical_01",
  zoneName: {
    en: "Alkusa Critical Zone - East of Shankar Road",
    hi: "अल्कुसा क्रिटिकल जोन - शंकर रोड के पूर्व"
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [86.394, 23.765],
      [86.398, 23.765],
      [86.398, 23.769],
      [86.394, 23.769],
      [86.394, 23.765]
    ]]
  },
  riskLevel: "critical",
  riskScore: 95,
  subsidenceData: {
    averageRate: 27,
    maxRate: 29,
    cumulativeDisplacement: 90,
    measurementPeriod: {
      start: new Date("2007-03-17"),
      end: new Date("2010-04-10")
    },
    dataSource: "ENVISAT ASAR / Sentinel-1"
  },
  description: {
    en: "Critical subsidence zone over Alkusa opencast mine overburden dump. High risk of sudden collapse.",
    hi: "अल्कुसा ओपनकास्ट खदान के ऊपर क्रिटिकल धंसाव क्षेत्र। अचानक धंसने का उच्च जोखिम।"
  },
  affectedArea: 0.44,
  estimatedPopulation: 5000,
  landmarks: [{
    name: { en: "Alkusa Opencast Mine", hi: "अल्कुसा ओपनकास्ट खदान" },
    coordinates: [86.396, 23.767],
    type: "colliery"
  }],
  safetyRecommendations: {
    en: [
      "Avoid staying in this area",
      "Regular building inspection required",
      "Keep emergency kit ready",
      "Know evacuation routes"
    ],
    hi: [
      "इस क्षेत्र में रहने से बचें",
      "नियमित भवन निरीक्षण आवश्यक",
      "आपातकालीन किट तैयार रखें",
      "निकासी मार्ग जानें"
    ]
  },
  bccl_area: "Area VIII",
  isActive: true,
  lastUpdated: new Date(),
  createdAt: new Date()
}
```

### 3.2 Sample Alert

```javascript
{
  _id: ObjectId("..."),
  alertId: "ALT-20251204-001",
  alertType: "warning",
  severity: "high",
  title: {
    en: "Increased Subsidence Activity in Alkusa Area",
    hi: "अल्कुसा क्षेत्र में धंसाव गतिविधि में वृद्धि"
  },
  message: {
    en: "Recent monitoring shows increased ground movement in Alkusa critical zone. Residents are advised to stay alert and report any cracks or unusual ground behavior.",
    hi: "हाल की निगरानी में अल्कुसा क्रिटिकल जोन में जमीन की बढ़ी हुई गतिविधि दिखाई दी है। निवासियों को सतर्क रहने और किसी भी दरार या असामान्य जमीन व्यवहार की रिपोर्ट करने की सलाह दी जाती है।"
  },
  targetZones: ["alkusa_critical_01"],
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  isActive: true,
  source: "admin",
  notificationSent: true,
  recipientCount: 4500,
  instructions: {
    en: [
      "Monitor walls and floors for new cracks",
      "Keep important documents ready",
      "Know your nearest safe assembly point"
    ],
    hi: [
      "दीवारों और फर्श पर नई दरारों की निगरानी करें",
      "महत्वपूर्ण दस्तावेज तैयार रखें",
      "अपने निकटतम सुरक्षित सभा स्थल को जानें"
    ]
  },
  evacuationAdvised: false,
  emergencyContacts: [
    { name: "BCCL Control Room", phone: "0326-2222XXX", role: "Primary Contact" },
    { name: "Dhanbad DC Office", phone: "0326-2222XXX", role: "Administration" }
  ],
  createdAt: new Date()
}
```

---

## 4. Database Indexes Summary

```javascript
// Performance-critical indexes

// Users
db.users.createIndex({ firebaseUid: 1 }, { unique: true });
db.users.createIndex({ "homeLocation": "2dsphere" });

// Risk Zones
db.risk_zones.createIndex({ geometry: "2dsphere" });
db.risk_zones.createIndex({ riskLevel: 1 });

// Reports
db.reports.createIndex({ location: "2dsphere" });
db.reports.createIndex({ status: 1, createdAt: -1 });

// Alerts
db.alerts.createIndex({ isActive: 1, validUntil: 1 });
db.alerts.createIndex({ targetZones: 1 });

// Satellite Data
db.satellite_data.createIndex({ coverage: "2dsphere" });
```

---

## 5. Data Migration Script

```javascript
// scripts/seedDatabase.js
// Run: node scripts/seedDatabase.js

const mongoose = require('mongoose');
const RiskZone = require('../models/RiskZone');

// Jharia Risk Zones Data (from research papers)
const riskZonesData = [
  {
    zoneId: "alkusa_critical_01",
    zoneName: { en: "Alkusa Critical Zone", hi: "अल्कुसा क्रिटिकल जोन" },
    geometry: {
      type: "Polygon",
      coordinates: [[[86.394, 23.765], [86.398, 23.765], [86.398, 23.769], [86.394, 23.769], [86.394, 23.765]]]
    },
    riskLevel: "critical",
    riskScore: 95,
    subsidenceData: { averageRate: 27, maxRate: 29, cumulativeDisplacement: 90 },
    bccl_area: "Area VIII"
  },
  {
    zoneId: "ena_critical_01",
    zoneName: { en: "Ena Colliery Critical Zone", hi: "एना कोलियरी क्रिटिकल जोन" },
    geometry: {
      type: "Polygon",
      coordinates: [[[86.399, 23.756], [86.403, 23.756], [86.403, 23.760], [86.399, 23.760], [86.399, 23.756]]]
    },
    riskLevel: "critical",
    riskScore: 90,
    subsidenceData: { averageRate: 28, maxRate: 28, cumulativeDisplacement: 85 },
    bccl_area: "Area VIII"
  },
  // Add more zones...
];

async function seedDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  await RiskZone.insertMany(riskZonesData);
  console.log('Database seeded successfully');
  process.exit(0);
}

seedDatabase();
```

---

*Document Version: 1.0*
*For Claude Code implementation*
