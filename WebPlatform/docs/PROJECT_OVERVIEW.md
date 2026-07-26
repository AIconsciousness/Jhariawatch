# 🏔️ JhariaWatch - Coal Mine Subsidence Risk Prediction & Monitoring System

## Project Overview / परियोजना अवलोकन

**JhariaWatch** is a comprehensive mobile and web-based application designed to predict, monitor, and alert residents about land subsidence risks in the Jharia Coalfield region of Dhanbad, Jharkhand, India.

---

## 🎯 Problem Statement / समस्या विवरण

### English:
Jharia Coalfield, spanning approximately 450 sq km in Dhanbad district, is India's largest coking coal producer. The region faces severe land subsidence due to:
- Underground coal mining activities
- Subsurface coal fires (burning for over 100 years)
- Seasonal soil variations (monsoon swelling/summer shrinking)

**Impact:**
- Over 100,000 people living in subsidence-prone areas
- Buildings collapsing without warning
- Loss of life and property
- No real-time public warning system exists

### Hindi:
झरिया कोलफील्ड, धनबाद जिले में लगभग 450 वर्ग किमी में फैला, भारत का सबसे बड़ा कोकिंग कोल उत्पादक है। इस क्षेत्र में भूमि धंसाव की गंभीर समस्या है:
- भूमिगत कोयला खनन गतिविधियों के कारण
- भूमिगत कोयला आग (100 से अधिक वर्षों से जल रही)
- मौसमी मिट्टी भिन्नता (मानसून में सूजन/गर्मी में सिकुड़न)

---

## 📊 Scientific Data from Research (Reference Papers)

### Subsidence Rates in Jharia (from uploaded papers):

| Zone Type | Rate (cm/year) | Area Coverage | Risk Level |
|-----------|----------------|---------------|------------|
| Critical Subsiding | >7 | 0.44 sq km | 🔴 Extreme |
| High Subsiding | 3-7 | 2.78 sq km | 🟠 High |
| Moderate Subsiding | 1-3 | 5.18 sq km | 🟡 Medium |
| Stable | -1 to 1 | 55.74 sq km | 🟢 Low |
| Uplifting | >1 (positive) | 3.79 sq km | 🔵 Monitor |

### Critical Subsidence Locations (from research):

1. **Alkusa Opencast Mines** (23.767°N, 86.396°E) - Rate: 27-29 mm/year
2. **Ena Colliery** (23.758°N, 86.401°E) - Rate: 10-28 mm/year
3. **B.R. Company Jayrampur Colliery, Tisra** (23.715°N, 86.434°E)
4. **Jeenagora BCCL Hospital Area** (23.702°N, 86.452°E)
5. **Kuzama Kali Mandir, Tisra** (23.734°N, 86.432°E)
6. **Begariya More, Jorapokhar** (23.699°N, 86.427°E)
7. **Bastacola** - Rate: ~10 mm/year
8. **Bera-Dobari** - Rate: up to 28 mm/year
9. **CK-Siding** - Rate: 10-21 mm/year

### Seasonal Patterns:
- **May to September (Monsoon)**: Soil swelling, reduced subsidence rate
- **October to April (Dry)**: Soil shrinking, increased subsidence rate
- Maximum cumulative displacement observed: **285.9 mm** (Point ID: 14959)

---

## 💡 Solution / समाधान

### Features:

#### For Public Users (Mobile App):
1. **Real-time Risk Map** - View subsidence risk zones on interactive map
2. **Location-based Alerts** - Get notified when entering high-risk zones
3. **Personal Risk Assessment** - Check risk level of your home/area
4. **Photo Reporting** - Capture and submit ground cracks/damage photos
5. **AI Crack Detection** - Automatic analysis of submitted photos
6. **Emergency Contacts** - Quick access to BCCL, NDMA, local authorities
7. **Educational Content** - Learn about subsidence, safety measures

#### For Authorities (Web Dashboard):
1. **Comprehensive Risk Dashboard** - Overview of all zones
2. **Satellite Data Integration** - View InSAR processed data
3. **Crowd-sourced Reports Management** - Review user submissions
4. **Alert Broadcasting** - Send mass notifications
5. **Historical Analysis** - Track subsidence trends over time
6. **Evacuation Planning Tools** - Mark safe zones, evacuation routes
7. **Report Generation** - Generate PDF reports for government

---

## 🛠️ Technology Stack

### Mobile App (React Native)
```
- React Native 0.72+
- React Navigation 6
- React Native Maps (Leaflet integration)
- Firebase SDK (Auth, FCM, Storage)
- Axios for API calls
- i18n for Hindi/English
- React Native Camera
```

### Web Dashboard (React.js)
```
- React 18
- React Router DOM
- Leaflet.js for maps
- Recharts for analytics
- TailwindCSS
- Firebase Admin SDK
```

### Backend (Node.js)
```
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- Firebase Admin (notifications)
- Multer (file uploads)
- TensorFlow.js (crack detection)
- node-cron (scheduled tasks)
```

### Database (MongoDB)
```
- User data
- Risk zone data
- Photo reports
- Alert history
- Satellite data cache
```

### External APIs & Data Sources
```
- Copernicus Open Access Hub (Sentinel-1 SAR)
- OpenStreetMap / Leaflet
- Firebase Cloud Messaging
- TensorFlow.js for AI inference
```

---

## 📁 Project Structure

```
jharia-subsidence-system/
├── mobile-app/               # React Native Mobile App
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── i18n/
│   │   ├── utils/
│   │   └── assets/
│   └── package.json
│
├── web-dashboard/            # React Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/                  # Node.js API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ai/
│   └── package.json
│
├── ai-model/                 # Crack Detection Model
│   ├── model/
│   ├── training/
│   └── inference/
│
└── docs/                     # Documentation
    └── *.md files
```

---

## 🎯 Hackathon Demo Strategy

### Round 1 - Ideation (15 mins)
- Present problem with Jharia-specific data
- Show research paper citations
- Demonstrate prototype wireframes
- Explain technical approach

### Round 2 - Prototype Demo
1. Open app → Show real Jharia map with risk zones
2. Navigate to Alkusa area → Show "Critical Risk" alert
3. Take photo of crack → AI analyzes and classifies
4. Switch to Admin dashboard → Show alert broadcasting
5. Generate PDF report

### Round 3 - Jury Interaction
- Emphasize local relevance (IIT Dhanbad is IN Jharia!)
- Show scientific backing from research papers
- Discuss scalability to other mining regions
- Present government adoption pathway

---

## 👥 Target Users

1. **Jharia Residents** (~100,000 people in risk zones)
2. **BCCL Officials** (Bharat Coking Coal Limited)
3. **District Administration** (Dhanbad DC office)
4. **NDMA** (National Disaster Management Authority)
5. **Researchers** (IIT Dhanbad, ISM)

---

## 📈 Impact Metrics

- **Lives Protected**: Early warning to 100,000+ residents
- **Response Time**: Reduce disaster response from hours to minutes
- **Data Collection**: Crowdsourced ground truth for researchers
- **Cost Savings**: Prevent property damage worth crores

---

## 🏆 Unique Selling Points

1. **Hyper-local Focus** - Specifically designed for Jharia
2. **Scientific Foundation** - Based on peer-reviewed research
3. **Bilingual** - Hindi + English for local accessibility
4. **AI-Powered** - Automatic crack detection from photos
5. **Real-time Alerts** - Firebase-based instant notifications
6. **Crowdsourced Data** - Community participates in monitoring
7. **Open Data** - Uses free satellite data (Sentinel-1)

---

## 📞 Emergency Contacts (To be included in app)

- BCCL Control Room: 0326-XXXXXXX
- Dhanbad DC Office: 0326-XXXXXXX
- NDMA Helpline: 1078
- Fire Services: 101
- Ambulance: 102

---

## 📚 References

1. Thakur et al. (2024). "Temporal and Spatial Dynamics of Subsidence in Eastern Jharia, India." ISPRS Annals, Vol X-4-2024.

2. Kumar et al. (2020). "Land subsidence mapping and monitoring using modified persistent scatterer interferometric synthetic aperture radar in Jharia Coalfield, India." J. Earth Syst. Sci. 129:146.

3. BCCL Master Plan (2008). "Master Plan for dealing with fire, subsidence and rehabilitation."

---

*Document Version: 1.0*
*Created for: Hack4Sustain 2025, IIT Dhanbad*
*Team: higgsboson*
