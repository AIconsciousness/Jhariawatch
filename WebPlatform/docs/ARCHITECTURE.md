# 🏗️ System Architecture / सिस्टम आर्किटेक्चर

## JhariaWatch - Technical Architecture Document

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JHARIAWATCH SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   MOBILE APP     │     │   WEB DASHBOARD  │     │  SATELLITE DATA  │
│  (React Native)  │     │    (React.js)    │     │   (Sentinel-1)   │
│                  │     │                  │     │                  │
│  • Public Users  │     │  • BCCL Admin    │     │  • ESA Copernicus│
│  • Photo Report  │     │  • Govt Officials│     │  • InSAR Data    │
│  • Risk Check    │     │  • Analytics     │     │  • 6-day revisit │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │         HTTPS          │         HTTPS          │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Express.js)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Auth Routes │  │ Risk Routes │  │Report Routes│  │Alert Routes │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│    MONGODB      │     │   AI SERVICE        │     │    FIREBASE     │
│                 │     │                     │     │                 │
│  • Users        │     │  • Crack Detection  │     │  • Auth         │
│  • Risk Zones   │     │  • TensorFlow.js    │     │  • FCM Push     │
│  • Reports      │     │  • Image Analysis   │     │  • Storage      │
│  • Alerts       │     │                     │     │                 │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
```

---

## 2. Data Flow Architecture

### 2.1 User Risk Check Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  Mobile  │───▶│  Backend │───▶│ MongoDB  │
│ Opens App│    │   App    │    │   API    │    │Risk Zones│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     │◀──────────────────────────────┘
                     │         Risk Level Response
                     ▼
              ┌──────────────┐
              │ Display Risk │
              │ on Map + UI  │
              └──────────────┘
```

### 2.2 Photo Report Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  Camera  │───▶│ Firebase │───▶│  Backend │
│Takes Photo│   │  Module  │    │ Storage  │    │   API    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ AI Service   │
                                              │Crack Analysis│
                                              └──────────────┘
                                                     │
                     ┌───────────────────────────────┘
                     ▼
              ┌──────────────┐    ┌──────────────┐
              │ Save Report  │───▶│ Notify Admin │
              │  to MongoDB  │    │  via FCM     │
              └──────────────┘    └──────────────┘
```

### 2.3 Alert Broadcasting Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Admin   │───▶│   Web    │───▶│  Backend │───▶│ Firebase │
│Creates   │    │Dashboard │    │   API    │    │   FCM    │
│ Alert    │    └──────────┘    └──────────┘    └──────────┘
└──────────┘                                         │
                                                     ▼
                                    ┌────────────────────────────┐
                                    │   Push to All Users in    │
                                    │   Affected Zone (Topic)   │
                                    └────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Mobile App Components (React Native)

```
mobile-app/src/
│
├── components/
│   ├── common/
│   │   ├── Button.js              # Reusable button
│   │   ├── Card.js                # Info cards
│   │   ├── Header.js              # App header with language toggle
│   │   ├── LoadingSpinner.js      # Loading indicator
│   │   └── RiskBadge.js           # Risk level badge (color-coded)
│   │
│   ├── map/
│   │   ├── MapView.js             # Leaflet map wrapper
│   │   ├── RiskZoneLayer.js       # GeoJSON risk zone overlay
│   │   ├── UserMarker.js          # User location marker
│   │   └── ReportMarker.js        # Photo report markers
│   │
│   └── reports/
│       ├── CameraCapture.js       # Camera interface
│       ├── PhotoPreview.js        # Preview before submit
│       └── ReportForm.js          # Report submission form
│
├── screens/
│   ├── HomeScreen.js              # Main map + risk overview
│   ├── RiskCheckScreen.js         # Location-based risk check
│   ├── ReportScreen.js            # Submit photo report
│   ├── AlertsScreen.js            # View alerts/notifications
│   ├── SafetyTipsScreen.js        # Educational content
│   ├── EmergencyScreen.js         # Emergency contacts
│   └── SettingsScreen.js          # Language, notifications
│
├── navigation/
│   ├── AppNavigator.js            # Main navigation setup
│   ├── TabNavigator.js            # Bottom tab navigation
│   └── AuthNavigator.js           # Login/Register flow
│
├── services/
│   ├── api.js                     # Axios API configuration
│   ├── authService.js             # Firebase auth methods
│   ├── locationService.js         # Geolocation handling
│   ├── notificationService.js     # FCM setup
│   └── storageService.js          # AsyncStorage helpers
│
├── i18n/
│   ├── index.js                   # i18n configuration
│   ├── en.json                    # English translations
│   └── hi.json                    # Hindi translations
│
├── utils/
│   ├── constants.js               # App constants
│   ├── helpers.js                 # Utility functions
│   └── riskCalculator.js          # Risk level calculation
│
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

### 3.2 Web Dashboard Components (React.js)

```
web-dashboard/src/
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.js             # Navigation sidebar
│   │   ├── Header.js              # Top header
│   │   └── Footer.js              # Footer
│   │
│   ├── dashboard/
│   │   ├── StatsCard.js           # Statistics cards
│   │   ├── RiskChart.js           # Recharts risk visualization
│   │   ├── RecentReports.js       # Latest reports table
│   │   └── AlertsWidget.js        # Recent alerts
│   │
│   ├── map/
│   │   ├── AdminMap.js            # Full-featured admin map
│   │   ├── ZoneEditor.js          # Edit risk zones
│   │   └── HeatmapLayer.js        # Risk heatmap
│   │
│   └── reports/
│       ├── ReportTable.js         # All reports list
│       ├── ReportDetail.js        # Single report view
│       └── AIAnalysisView.js      # AI detection results
│
├── pages/
│   ├── Dashboard.js               # Main dashboard
│   ├── MapManagement.js           # Risk zone management
│   ├── Reports.js                 # Photo reports management
│   ├── Alerts.js                  # Alert creation/management
│   ├── Users.js                   # User management
│   ├── Analytics.js               # Detailed analytics
│   ├── Settings.js                # System settings
│   └── Login.js                   # Admin login
│
├── services/
│   ├── api.js                     # API configuration
│   ├── authService.js             # Admin authentication
│   └── reportService.js           # Report management
│
└── utils/
    ├── constants.js
    └── formatters.js
```

### 3.3 Backend Components (Node.js)

```
backend/src/
│
├── controllers/
│   ├── authController.js          # User authentication
│   ├── riskZoneController.js      # Risk zone CRUD
│   ├── reportController.js        # Photo reports handling
│   ├── alertController.js         # Alert management
│   ├── userController.js          # User management
│   └── analyticsController.js     # Statistics & analytics
│
├── models/
│   ├── User.js                    # User schema
│   ├── RiskZone.js                # Risk zone schema (GeoJSON)
│   ├── Report.js                  # Photo report schema
│   ├── Alert.js                   # Alert schema
│   └── SatelliteData.js           # Cached satellite data
│
├── routes/
│   ├── index.js                   # Route aggregator
│   ├── authRoutes.js              # /api/auth/*
│   ├── riskRoutes.js              # /api/risk/*
│   ├── reportRoutes.js            # /api/reports/*
│   ├── alertRoutes.js             # /api/alerts/*
│   └── adminRoutes.js             # /api/admin/*
│
├── middlewares/
│   ├── authMiddleware.js          # JWT verification
│   ├── adminMiddleware.js         # Admin role check
│   ├── uploadMiddleware.js        # Multer file upload
│   ├── rateLimiter.js             # API rate limiting
│   └── errorHandler.js            # Global error handler
│
├── services/
│   ├── firebaseService.js         # Firebase Admin SDK
│   ├── notificationService.js     # Push notification logic
│   ├── aiService.js               # Crack detection AI
│   ├── satelliteService.js        # Sentinel-1 data fetching
│   └── geoService.js              # Geospatial calculations
│
├── ai/
│   ├── crackDetectionModel.js     # TensorFlow.js model loader
│   ├── imageProcessor.js          # Image preprocessing
│   └── inference.js               # Run inference
│
├── utils/
│   ├── constants.js               # System constants
│   ├── validators.js              # Input validation
│   ├── logger.js                  # Winston logger
│   └── helpers.js                 # Utility functions
│
├── config/
│   ├── database.js                # MongoDB connection
│   ├── firebase.js                # Firebase config
│   └── app.js                     # Express app config
│
└── jobs/
    ├── satelliteSync.js           # Cron job for satellite data
    └── alertCleanup.js            # Old alerts cleanup
```

---

## 4. Database Design (MongoDB)

### 4.1 Collections Overview

```
jharia_watch_db/
├── users                  # User accounts
├── risk_zones            # GeoJSON risk areas
├── reports               # Photo reports
├── alerts                # System alerts
├── satellite_data        # Cached InSAR data
└── app_settings          # Configuration
```

### 4.2 Detailed Schema (see DATABASE_SCHEMA.md)

---

## 5. API Design Overview

### 5.1 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | User login | No |
| GET | /api/risk/zones | Get all risk zones | No |
| GET | /api/risk/check | Check risk at location | No |
| POST | /api/reports | Submit photo report | Yes |
| GET | /api/reports | Get user's reports | Yes |
| GET | /api/alerts | Get active alerts | No |
| POST | /api/admin/alerts | Create alert (Admin) | Admin |
| PUT | /api/admin/zones | Update risk zones | Admin |

### 5.2 Detailed API Docs (see API_DOCUMENTATION.md)

---

## 6. Security Architecture

### 6.1 Authentication Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│ Firebase │───▶│  Get     │───▶│  Backend │
│  Login   │    │   Auth   │    │ID Token  │    │ Verify   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ Issue JWT    │
                                              │ Access Token │
                                              └──────────────┘
```

### 6.2 Security Measures
- **Firebase Authentication** - Secure user auth
- **JWT Tokens** - API access tokens (24h expiry)
- **HTTPS Only** - All API calls encrypted
- **Rate Limiting** - Prevent abuse (100 req/min)
- **Input Validation** - Sanitize all inputs
- **Role-Based Access** - User vs Admin permissions

---

## 7. Notification Architecture

### 7.1 FCM Topic Structure
```
Topics:
├── all_users                    # Broadcast to everyone
├── zone_critical_alkusa         # Alkusa critical zone subscribers
├── zone_critical_ena            # Ena critical zone subscribers
├── zone_high_bera_dobari        # Bera-Dobari high zone
├── zone_high_bastacola          # Bastacola high zone
└── zone_moderate_*              # Moderate zones
```

### 7.2 Notification Types
1. **Emergency Alert** - Immediate danger notification
2. **Risk Update** - Zone status change
3. **Report Status** - User report updates
4. **Weekly Summary** - Risk area summary

---

## 8. Scalability Considerations

### 8.1 Current Design (Hackathon MVP)
- Single MongoDB instance
- Single Node.js server
- Firebase free tier

### 8.2 Production Scaling Path
```
Future Architecture:
│
├── Load Balancer (Nginx)
│   ├── API Server 1
│   ├── API Server 2
│   └── API Server 3
│
├── MongoDB Replica Set
│   ├── Primary
│   ├── Secondary 1
│   └── Secondary 2
│
├── Redis Cache
│   └── Risk zone data caching
│
└── CDN (CloudFront)
    └── Static assets, images
```

---

## 9. Offline Capabilities

### 9.1 Mobile App Offline Features
- **Cached Risk Zones** - Last downloaded zones available offline
- **Offline Reports** - Queue reports for later upload
- **Emergency Contacts** - Always available offline
- **Safety Tips** - Cached educational content

### 9.2 Implementation
```javascript
// React Native AsyncStorage for offline data
AsyncStorage.setItem('cached_risk_zones', JSON.stringify(zones));
AsyncStorage.setItem('pending_reports', JSON.stringify(reports));
```

---

## 10. Monitoring & Logging

### 10.1 Logging Strategy
- **Winston Logger** - Structured logging
- **Log Levels** - error, warn, info, debug
- **Log Storage** - File rotation, cloud backup

### 10.2 Health Checks
```
GET /api/health
Response: {
  "status": "healthy",
  "database": "connected",
  "firebase": "connected",
  "uptime": "24h 30m"
}
```

---

## 11. Development Environment

### 11.1 Prerequisites
- Node.js 18+
- MongoDB 6+
- React Native CLI
- Android Studio / Xcode
- Firebase Project

### 11.2 Environment Variables
```
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jharia_watch
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
JWT_SECRET=your-jwt-secret

# Mobile App (.env)
API_BASE_URL=http://localhost:5000/api
FIREBASE_API_KEY=your-api-key
```

---

*Document Version: 1.0*
*Architecture designed for Hack4Sustain 2025*
