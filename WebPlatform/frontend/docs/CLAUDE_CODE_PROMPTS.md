# 🤖 Claude Code CLI Prompts Guide / क्लॉड कोड प्रॉम्प्ट्स

## Ready-to-Use Prompts for JhariaWatch Implementation

**ये prompts directly Claude Code CLI में paste करो और code generate करवाओ!**

---

## 📁 Phase 1: Project Setup (15 mins)

### Prompt 1.1: Backend Setup
```
Create a Node.js Express backend project with TypeScript for a subsidence monitoring app called "JhariaWatch". 

Setup:
- Express with TypeScript
- MongoDB with Mongoose
- Firebase Admin SDK for auth and notifications
- Multer for file uploads
- JWT authentication
- CORS, Helmet, Morgan middleware
- Environment variables with dotenv

Create folder structure:
src/config, src/models, src/controllers, src/routes, src/middlewares, src/services, src/utils

Include package.json with all dependencies and tsconfig.json
```

### Prompt 1.2: Mobile App Setup
```
Create a React Native project structure for "JhariaWatch" mobile app with:
- React Navigation (stack + bottom tabs)
- i18n for Hindi/English bilingual support
- Firebase SDK (auth, messaging, storage)
- Axios for API calls
- React Native Maps with Leaflet WebView fallback
- AsyncStorage for offline data

Create folder structure:
src/screens, src/components, src/services, src/i18n, src/hooks, src/context, src/utils

Include all navigation setup and basic App.tsx
```

### Prompt 1.3: Web Dashboard Setup
```
Create a React.js admin dashboard project for "JhariaWatch" with:
- React Router DOM
- TailwindCSS for styling
- Leaflet.js for maps
- Recharts for analytics
- Firebase Auth for admin login
- Axios for API

Create folder structure:
src/pages, src/components, src/services, src/utils

Include basic routing setup with sidebar layout
```

---

## 📊 Phase 2: Database Models (20 mins)

### Prompt 2.1: User Model
```
Create MongoDB Mongoose model for User with fields:
- firebaseUid (unique)
- phone, email, name
- preferredLanguage: enum ['en', 'hi'] default 'hi'
- homeLocation: GeoJSON Point with coordinates, address, locality
- role: enum ['user', 'admin', 'bccl_official', 'govt_official']
- notifications preferences object
- fcmTokens array
- subscribedZones array
- timestamps

Add 2dsphere index on homeLocation
```

### Prompt 2.2: RiskZone Model
```
Create MongoDB model for RiskZone (GeoJSON) with:
- zoneId (unique), zoneName {en, hi}
- geometry: GeoJSON Polygon
- riskLevel: enum ['critical', 'high', 'moderate', 'low', 'stable', 'uplifting']
- riskScore: 0-100
- subsidenceData: {averageRate, maxRate, cumulativeDisplacement, measurementPeriod, dataSource}
- description {en, hi}
- affectedArea (sq km), estimatedPopulation
- landmarks array, safetyRecommendations {en[], hi[]}
- bccl_area, isActive

Add 2dsphere index on geometry
```

### Prompt 2.3: Report Model
```
Create MongoDB model for photo Report with:
- reportId (unique auto-generated)
- userId (ref User), reporterName, reporterPhone, isAnonymous
- location: GeoJSON Point with nearestZone
- reportType: enum ['crack', 'subsidence', 'building_damage', 'road_damage', 'other']
- photos array: {url, thumbnailUrl, uploadedAt}
- aiAnalysis: {processed, crackDetected, crackSeverity, confidence, detectedFeatures[]}
- description, urgencyLevel, status, statusHistory[]
- review object for admin
- timestamps

Add indexes on location (2dsphere), status, createdAt
```

### Prompt 2.4: Alert Model
```
Create MongoDB model for Alert with:
- alertId (unique), alertType: enum ['emergency', 'warning', 'info', 'update']
- severity: enum ['critical', 'high', 'medium', 'low']
- title {en, hi}, message {en, hi}
- targetZones array, targetAll boolean
- affectedArea (GeoJSON)
- validFrom, validUntil, isActive
- source, createdBy (ref User)
- notificationSent, recipientCount
- instructions {en[], hi[]}, evacuationAdvised
- emergencyContacts array
- timestamps
```

---

## 🔌 Phase 3: API Routes (30 mins)

### Prompt 3.1: Auth Routes
```
Create Express auth routes and controller:

POST /api/auth/register
- Accept: firebaseUid, phone, name, preferredLanguage, homeLocation, fcmToken
- Create user, generate JWT token
- Return user data and token

POST /api/auth/login
- Accept: firebaseUid, fcmToken
- Find user, update fcmToken, update lastActive
- Return JWT token and user

PUT /api/auth/profile (protected)
- Update user profile fields
- Handle homeLocation update
- Handle notification preferences

Include JWT middleware for protected routes
```

### Prompt 3.2: Risk Zone Routes
```
Create Express risk routes and controller:

GET /api/risk/zones
- Query params: riskLevel, bounds (bbox)
- Return GeoJSON FeatureCollection
- Include metadata: totalZones, criticalZones count

GET /api/risk/check?lat=&lng=
- Find zone containing point using $geoIntersects
- If not in zone, find nearest zone
- Return risk assessment with:
  - isInRiskZone, zone details
  - subsidenceData, riskDescription {en, hi}
  - safetyRecommendations, nearestSafeZone
- Use bilingual responses

GET /api/risk/zones/:zoneId
- Return full zone details
- Include recent reports and active alerts for zone
```

### Prompt 3.3: Report Routes
```
Create Express report routes and controller:

POST /api/reports (protected, multipart)
- Accept: photos (max 5), reportType, description, lat, lng, urgencyLevel
- Upload photos to Firebase Storage
- Find nearest risk zone
- Create report with status 'pending'
- Trigger async AI analysis
- Send notification to admins
- Return reportId and status

GET /api/reports (protected)
- Get user's own reports
- Filter by status, paginate
- Return with pagination metadata

GET /api/reports/:reportId (protected)
- Check ownership or admin role
- Return full report details
```

### Prompt 3.4: Alert Routes
```
Create Express alert routes:

GET /api/alerts
- Get active alerts (isActive true, validUntil > now)
- Filter by zoneId, severity
- Return sorted by severity and createdAt

GET /api/alerts/:alertId
- Return full alert with affected zones details
```

### Prompt 3.5: Admin Routes
```
Create Express admin routes (admin middleware protected):

GET /api/admin/dashboard
- Return stats: totalUsers, activeToday, totalReports, pendingReports, activeAlerts
- Include riskZoneStats, reportsTrend, topAffectedAreas

POST /api/admin/alerts
- Create new alert
- If sendNotification true, send FCM to affected zone subscribers
- Return alertId and notification count

PUT /api/admin/zones/:zoneId
- Update risk zone data
- Log change in history

PUT /api/admin/reports/:reportId/review
- Update report status
- Add admin review
- Optionally create alert from report

GET /api/admin/reports
- Get all reports with filters
- Include AI analysis results
```

---

## 📱 Phase 4: Mobile Screens (45 mins)

### Prompt 4.1: Home Screen
```
Create React Native HomeScreen with:
- Header with app title and language toggle (EN/हिं)
- Current risk status card (color-coded by level)
- Mini map preview showing user location and nearby zones
- Quick action buttons: Check Risk, Submit Report, View Alerts, Safety Tips
- Active alerts preview (latest 2)
- Emergency button at bottom (red, prominent)

Use react-native-linear-gradient for header
Use i18n for all text (t('home.title'))
Handle loading states and pull-to-refresh
```

### Prompt 4.2: Risk Check Screen
```
Create RiskCheckScreen with:
- Get user location using Geolocation
- Show location on map
- Call /api/risk/check API
- Display results:
  - Large risk level badge (color-coded)
  - Risk score
  - Zone name (bilingual)
  - Subsidence rate with unit
  - Risk description paragraph
  - Safety recommendations list
  - Nearest safe zone with distance
- Handle loading and error states
```

### Prompt 4.3: Report Screen
```
Create ReportScreen for photo submission:
- Camera capture button (react-native-image-picker)
- Gallery selection option
- Photo preview with remove option
- Report type selector (radio buttons)
- Description text input (optional)
- Urgency level picker
- Current location display
- Submit button with loading state
- Show success message with AI processing status

Handle permissions, offline queue
```

### Prompt 4.4: Alerts Screen
```
Create AlertsScreen:
- List of active alerts
- Each alert card shows:
  - Alert type badge (Emergency/Warning/Info)
  - Title (in current language)
  - Affected areas
  - Time ago / valid until
- Tap to expand full message and instructions
- Pull to refresh
- Empty state when no alerts
```

### Prompt 4.5: Map Screen (Full)
```
Create FullMapScreen with Leaflet WebView:
- Full screen map centered on Jharia (23.75°N, 86.42°E)
- Load risk zones as GeoJSON polygons
- Color code by risk level
- Show user location marker
- Tap zone to see popup with:
  - Zone name, risk level, subsidence rate
  - "Check Details" button
- Legend showing color meanings
- Zoom controls
```

### Prompt 4.6: Emergency Screen
```
Create EmergencyScreen with:
- Large emergency contact cards
- Each card: icon, name (bilingual), phone number, "Call" button
- Contacts:
  - BCCL Control Room
  - Dhanbad DC Office  
  - NDMA Helpline (1078)
  - Fire Services (101)
  - Ambulance (102)
- Direct dial using Linking.openURL('tel:')
- Works offline (hardcoded numbers)
```

---

## 🖥️ Phase 5: Admin Dashboard (30 mins)

### Prompt 5.1: Dashboard Page
```
Create React admin Dashboard page with:
- Stats cards row: Total Users, Active Today, Pending Reports, Active Alerts
- Risk zones pie chart (by level)
- Reports trend line chart (last 7 days)
- Recent reports table (last 10)
- Top affected areas bar chart
- Quick action buttons: Create Alert, View All Reports

Use Recharts for charts
Use TailwindCSS for styling
Auto-refresh every 30 seconds
```

### Prompt 5.2: Reports Management Page
```
Create Reports page with:
- Filters: status, reportType, zone, date range, AI severity
- Table with columns: ID, Type, Location, Status, AI Result, Date, Actions
- Status badge (color-coded)
- AI severity badge
- Click row to open detail modal
- Detail modal shows:
  - Photos gallery
  - AI analysis visualization
  - Location on mini map
  - Status change buttons
  - Admin notes input
  - Action taken input
```

### Prompt 5.3: Alert Creation Page
```
Create Alert creation page with:
- Alert type selector
- Severity selector
- Title input (EN and HI fields)
- Message textarea (EN and HI)
- Target zones multi-select (from API)
- Or "Broadcast to All" checkbox
- Valid until date picker
- Instructions list input
- Evacuation advised toggle
- Preview card
- Submit with notification toggle
- Show notification count after submit
```

### Prompt 5.4: Map Management Page
```
Create admin Map page with:
- Full Leaflet map
- All zones displayed
- Click zone to select
- Side panel shows zone details
- Edit form for:
  - Risk level
  - Risk score
  - Subsidence rate
  - Description (EN/HI)
- Save changes button
- View reports in zone
- Zone history log
```

---

## 🔧 Phase 6: Services (20 mins)

### Prompt 6.1: Firebase Service
```
Create firebaseService.ts with:
- Firebase Admin initialization
- uploadToFirebase(file) - upload to Storage, return URL
- generateThumbnail(file) - create thumbnail using sharp
- verifyFirebaseToken(idToken) - verify auth token
- Helper to get download URLs
```

### Prompt 6.2: Notification Service
```
Create notificationService.ts with:
- sendNotificationToUser(userId, payload) - send to user's FCM tokens
- sendNotificationToAdmins(payload) - notify all admin users
- sendAlertToZone(zoneId, payload) - send to zone subscribers via topic
- broadcastNotification(payload) - send to all users
- Payload format: {title: {en, hi}, body: {en, hi}, data}
- Handle language preference
```

### Prompt 6.3: AI Service (Mock for Hackathon)
```
Create aiService.ts with:
- analyzeImage(imageUrl) function
- For hackathon: return mock results after 2 second delay
- Mock result: {crackDetected, crackSeverity, confidence, detectedFeatures[]}
- Random but realistic values for demo
- Log analysis for debugging
- Comment where real TensorFlow inference would go
```

### Prompt 6.4: Geo Service
```
Create geoService.ts with:
- findNearestZone(lat, lng) - find closest risk zone
- isPointInZone(lat, lng, zoneId) - check if point in zone
- calculateDistance(lat1, lng1, lat2, lng2) - haversine formula
- getRiskColor(level) - return hex color for risk level
- Use MongoDB $geoNear for nearest zone query
```

---

## 🌐 Phase 7: i18n Setup (10 mins)

### Prompt 7.1: Translation Files
```
Create i18n setup for React Native:
- Initialize i18next with react-i18next
- Language detector from AsyncStorage
- Default language: 'hi'

Create en.json with keys:
- app.name, app.tagline
- nav.* (home, riskCheck, report, alerts, safety)
- home.* (title, subtitle, riskStatus, quickActions, etc)
- risk.* (checking, riskLevel, critical/high/moderate/low/stable, etc)
- report.* (takePhoto, reportType, types.*, submit, success)
- alerts.* (title, noAlerts, emergency/warning/info, etc)
- emergency.* (title, bccl, dc, ndma, fire, ambulance, call)
- common.* (loading, error, retry, cancel, km, mm)

Create hi.json with Hindi translations for all keys
```

---

## 🗄️ Phase 8: Seed Data (15 mins)

### Prompt 8.1: Seed Risk Zones
```
Create database seed script with Jharia risk zones data:

Critical zones (from research papers):
1. Alkusa (23.767°N, 86.396°E) - rate: 27mm/year
2. Ena Colliery (23.758°N, 86.401°E) - rate: 28mm/year  
3. Tisra - Jayrampur (23.715°N, 86.434°E)
4. Jeenagora area (23.702°N, 86.452°E)
5. Kuzama area (23.734°N, 86.432°E)
6. Jorapokhar (23.699°N, 86.427°E)

High zones:
- Bera-Dobari (23.758°N, 86.435°E) - rate: 28mm/year
- Bastacola - rate: 10mm/year
- CK-Siding - rate: 10-21mm/year
- Areas peripheral to critical zones

Create polygon geometries (approximate squares around points)
Include bilingual names, descriptions, safety recommendations
BCCL areas: Area VIII, Area IX
```

### Prompt 8.2: Seed Sample Alerts
```
Create sample alerts for demo:
1. Emergency alert for Alkusa area - recent increased activity
2. Warning for Ena colliery - monitoring advisory
3. Info alert - monsoon season soil swelling expected

Include bilingual title, message, instructions
Set validity for 7 days from now
```

---

## 🚀 Phase 9: Deployment Prep (10 mins)

### Prompt 9.1: Environment Configs
```
Create .env.example files for:
- Backend: PORT, MONGODB_URI, JWT_SECRET, FIREBASE_* credentials
- Mobile: API_BASE_URL, FIREBASE_* config
- Web: REACT_APP_API_URL, REACT_APP_FIREBASE_*

Create README.md with:
- Project description
- Setup instructions
- Environment variables list
- Run commands
- API documentation link
```

### Prompt 9.2: Docker Setup (Optional)
```
Create Dockerfile for backend:
- Node 18 alpine base
- Copy package.json, install deps
- Copy source, build TypeScript
- Expose port 5000
- CMD node dist/server.js

Create docker-compose.yml:
- Backend service
- MongoDB service
- Environment variables from .env
```

---

## 📝 Quick Reference: API Endpoints

```
Auth:
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/profile [Auth]

Risk:
GET  /api/risk/zones
GET  /api/risk/check?lat=&lng=
GET  /api/risk/zones/:zoneId

Reports:
POST /api/reports [Auth] [Multipart]
GET  /api/reports [Auth]
GET  /api/reports/:reportId [Auth]

Alerts:
GET  /api/alerts
GET  /api/alerts/:alertId

Admin:
GET  /api/admin/dashboard [Admin]
POST /api/admin/alerts [Admin]
PUT  /api/admin/zones/:zoneId [Admin]
PUT  /api/admin/reports/:reportId/review [Admin]
GET  /api/admin/reports [Admin]
```

---

## 🎯 Demo Flow Prompts

### Final Integration Test
```
Test the complete flow:
1. Open mobile app, see home screen with map
2. Check risk at Alkusa location - should show CRITICAL
3. Take photo, submit report as crack
4. Open admin dashboard, see new report
5. Review report, verify it
6. Create warning alert for Alkusa
7. Check mobile app receives notification
8. View alert in alerts screen
```

---

*Use these prompts sequentially in Claude Code CLI*
*Each prompt should generate working code*
*Test after each phase before moving to next*
