# 📚 JhariaWatch Documentation

## Hack4Sustain 2025 - Complete Technical Docs

---

## 📁 Files Index

| File | Description | Use When |
|------|-------------|----------|
| **PROJECT_OVERVIEW.md** | Complete project summary, features, tech stack | Start here! |
| **CLAUDE_CODE_PROMPTS.md** | ⭐ Ready prompts for Claude Code CLI | Copy-paste to generate code |
| **ARCHITECTURE.md** | System design, data flow diagrams | Understanding structure |
| **DATABASE_SCHEMA.md** | MongoDB collections, indexes | Setting up database |
| **API_DOCUMENTATION.md** | All API endpoints with examples | Backend development |
| **FRONTEND_MOBILE_GUIDE.md** | React Native app guide | Mobile app development |
| **BACKEND_GUIDE.md** | Node.js server guide | Server development |
| **WEB_DASHBOARD_GUIDE.md** | Admin dashboard guide | Web app development |
| **SATELLITE_DATA_GUIDE.md** | Jharia data, coordinates | Data & maps |
| **PRESENTATION_OUTLINE.md** | Demo script, slides, Q&A prep | Hackathon presentation |

---

## 🚀 Quick Start Order

### Step 1: Read Overview (5 mins)
```
Open PROJECT_OVERVIEW.md - understand the full project
```

### Step 2: Start with Claude Code (Main implementation)
```
Open CLAUDE_CODE_PROMPTS.md
Copy prompts one by one into Claude Code CLI
Start with Phase 1 → Phase 9
```

### Step 3: Reference docs as needed
```
- Building backend? → BACKEND_GUIDE.md + API_DOCUMENTATION.md
- Building mobile? → FRONTEND_MOBILE_GUIDE.md
- Building admin? → WEB_DASHBOARD_GUIDE.md
- Setting up DB? → DATABASE_SCHEMA.md
- Need Jharia data? → SATELLITE_DATA_GUIDE.md
```

### Step 4: Prepare Presentation
```
Open PRESENTATION_OUTLINE.md
Practice demo flow
Prepare for Q&A
```

---

## 🎯 36-Hour Hackathon Timeline

| Hours | Task | Files to Use |
|-------|------|--------------|
| 0-2 | Setup projects | CLAUDE_CODE_PROMPTS (Phase 1) |
| 2-4 | Database models | DATABASE_SCHEMA, Prompts (Phase 2) |
| 4-8 | Backend APIs | Prompts (Phase 3), API_DOCUMENTATION |
| 8-16 | Mobile app screens | Prompts (Phase 4), FRONTEND_GUIDE |
| 16-22 | Admin dashboard | Prompts (Phase 5), WEB_DASHBOARD |
| 22-28 | Integration & testing | All docs for reference |
| 28-32 | Seed data & demo prep | SATELLITE_DATA, Prompts (Phase 8) |
| 32-36 | Presentation prep | PRESENTATION_OUTLINE |

---

## 📱 Key Features Checklist

### Mobile App
- [ ] Home screen with risk map
- [ ] Risk check at location
- [ ] Photo report submission
- [ ] AI crack detection display
- [ ] Alerts list
- [ ] Emergency contacts
- [ ] Hindi/English toggle
- [ ] Offline mode

### Admin Dashboard
- [ ] Login page
- [ ] Dashboard with stats
- [ ] Reports management
- [ ] Alert creation
- [ ] Map view
- [ ] Zone editing

### Backend
- [ ] Auth routes (register, login)
- [ ] Risk zone APIs
- [ ] Report submission
- [ ] Alert management
- [ ] Admin routes
- [ ] Firebase notifications

---

## 🔧 Tech Stack Summary

```
Mobile:     React Native + Firebase + Leaflet
Web:        React + TailwindCSS + Recharts + Leaflet
Backend:    Node.js + Express + MongoDB + Firebase Admin
Database:   MongoDB (GeoJSON for zones)
Maps:       Leaflet + OpenStreetMap (FREE)
Auth:       Firebase Authentication
Push:       Firebase Cloud Messaging
AI:         TensorFlow.js (mock for hackathon)
```

---

## 📞 Emergency Data (Hardcode in app)

```
BCCL Control Room: 0326-XXXXXXX
Dhanbad DC Office: 0326-XXXXXXX
NDMA Helpline: 1078
Fire Services: 101
Ambulance: 102
```

---

## 🗺️ Jharia Coordinates (For maps)

```javascript
// Center of Jharia
const JHARIA_CENTER = { lat: 23.75, lng: 86.42 };

// Map bounds
const JHARIA_BOUNDS = [[23.58, 86.08], [23.91, 86.55]];

// Default zoom
const DEFAULT_ZOOM = 12;
```

---

## 💡 Tips for Hackathon

1. **Start with Claude Code Prompts** - fastest way to generate code
2. **Test incrementally** - don't build everything then test
3. **Use mock data** - real satellite processing too slow
4. **Focus on demo flow** - working demo > perfect code
5. **Prepare offline backup** - screenshots if server fails
6. **Practice presentation** - at least 2-3 times

---

## 🏆 Good Luck!

Team higgsboson - BIT Sindri
Hack4Sustain 2025 - IIT Dhanbad

*"Technology that can save lives in Jharia"*
