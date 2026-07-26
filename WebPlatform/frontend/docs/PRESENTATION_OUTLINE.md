# 🎤 Presentation Outline / प्रेजेंटेशन आउटलाइन

## Hack4Sustain 2025 - JhariaWatch Presentation Strategy

---

## 🎯 Presentation Structure (10-15 mins)

### Slide 1: Title (30 sec)
```
JHARIAWATCH
झरियावॉच

Coal Mine Subsidence Risk Prediction & Monitoring System
कोयला खदान धंसाव जोखिम भविष्यवाणी और निगरानी प्रणाली

Team: higgsboson | BIT Sindri
```

### Slide 2: The Problem (1 min)
```
JHARIA IS SINKING
झरिया डूब रहा है

• India's largest coking coal field - 450 sq km
• Underground fires burning for 100+ years
• Subsidence rate: up to 57 cm/year in critical areas
• 100,000+ people living in danger zones
• NO PUBLIC WARNING SYSTEM EXISTS

[Show image: Jharia cracks/damage]
[Show map: Dhanbad-Jharia location]

"IIT Dhanbad is literally IN this danger zone"
```

### Slide 3: Scientific Evidence (1 min)
```
RESEARCH-BACKED DATA
अनुसंधान-समर्थित डेटा

From peer-reviewed papers (IIT Roorkee, IIT Bombay, IIT ISM):

Critical Zones Identified:
• Alkusa: 27-29 mm/year subsidence
• Ena Colliery: up to 28 mm/year
• Tisra, Bera-Dobari, CK-Siding

[Show: Subsidence map from research paper]

Data Source: Sentinel-1 SAR satellite, InSAR processing
```

### Slide 4: Our Solution (1.5 min)
```
JHARIAWATCH - EARLY WARNING SYSTEM

📱 PUBLIC MOBILE APP
• Real-time risk zone map
• Location-based risk alerts
• Photo reporting with AI analysis
• Emergency contacts
• Bilingual: Hindi + English

🖥️ ADMIN DASHBOARD  
• For BCCL officials & government
• Report management
• Alert broadcasting
• Analytics & monitoring

🤖 AI-POWERED
• Automatic crack detection from photos
• Crowd-sourced ground truth data
```

### Slide 5: Live Demo (3-4 mins)
```
DEMO FLOW:

1. Open App → Show Jharia map with risk zones
   "Dekho, red zones are critical areas"

2. Navigate to Alkusa → Get CRITICAL alert
   "If someone is here, they'll know immediately"

3. Take photo of crack → AI analyzes
   "AI detected moderate severity crack"

4. Open Admin Dashboard → Show new report
   "BCCL officials can see all reports"

5. Create Alert → Show notification on phone
   "Instant warning to all residents"

6. Show Emergency contacts → One-tap calling
   "Quick access to BCCL, DC, NDMA"
```

### Slide 6: Technical Architecture (1 min)
```
TECH STACK

┌─────────────────┐
│  Mobile App     │ React Native
│  (Public)       │ Firebase Auth
└────────┬────────┘ Leaflet Maps
         │
┌────────▼────────┐
│  Node.js API    │ Express, JWT
│  Backend        │ AI Inference
└────────┬────────┘
         │
┌────────▼────────┐
│  MongoDB        │ GeoJSON Data
│  Database       │ Risk Zones
└────────┬────────┘
         │
┌────────▼────────┐
│  Web Dashboard  │ React, Charts
│  (Admin)        │ Leaflet Maps
└─────────────────┘

All open-source, free tools!
```

### Slide 7: Impact (1 min)
```
IMPACT & SCALABILITY

IMMEDIATE IMPACT:
✓ Warn 100,000+ Jharia residents
✓ Enable crowd-sourced monitoring
✓ Reduce disaster response time
✓ Provide data for researchers

SCALABILITY:
→ Any coal mining region in India
→ Raniganj, Bokaro, Singrauli coalfields
→ International mining areas

SUSTAINABILITY:
• Uses FREE satellite data (Sentinel-1)
• Open-source technology
• Minimal infrastructure needed
• Community participation model
```

### Slide 8: Future Roadmap (30 sec)
```
FUTURE ENHANCEMENTS

Phase 2:
• Real-time InSAR processing
• Predictive ML model
• Integration with IoT sensors

Phase 3:
• Government API integration
• Automated evacuation planning
• Multi-hazard system (fire + subsidence)
```

### Slide 9: Call to Action (30 sec)
```
WHY JHARIAWATCH MATTERS

"We study in IIT Dhanbad.
 Jharia is our neighbour.
 This technology can save lives."

• Unique problem-solution fit
• Scientific foundation
• Immediately deployable
• Scalable nationwide

THANK YOU | धन्यवाद
Questions?
```

---

## 🎯 Judge Interaction Hints

### Expected Questions & Answers:

**Q: How accurate is the AI crack detection?**
```
A: For hackathon demo, we use a simplified model. 
In production, we'd train on Jharia-specific crack images.
Current mock shows 75-95% confidence - realistic for CNN models.
The key is crowdsourcing - humans verify AI suggestions.
```

**Q: How do you get satellite data?**
```
A: Sentinel-1 data is FREE from ESA Copernicus.
For this hackathon, we used pre-processed data from 
IIT Roorkee research (2024 paper).
Full InSAR processing requires specialized software 
but the methodology is proven.
```

**Q: What if there's no internet in affected areas?**
```
A: App caches risk zone data for offline use.
Emergency contacts work offline.
Reports queue and sync when online.
Critical alerts cached locally.
```

**Q: How will BCCL/government adopt this?**
```
A: We can present to BCCL Environment Department.
IIT Dhanbad Mining Dept has existing BCCL connections.
NDMA has schemes for early warning systems.
Open-source = no vendor lock-in.
```

**Q: Why not just use Google Maps?**
```
A: Google Maps doesn't have:
• Subsidence risk data
• Real-time zone alerts
• Crowdsourced ground reports
• BCCL official data integration
• Local emergency contacts
```

**Q: How is this different from existing solutions?**
```
A: NO public-facing subsidence warning system exists in India.
BCCL has internal monitoring but no public app.
Our innovation: making scientific data accessible to common people.
```

---

## 🏆 Winning Points to Emphasize

1. **LOCAL RELEVANCE** - Judges are from IIT Dhanbad, they KNOW Jharia
2. **SCIENTIFIC BACKING** - Real research papers, real data
3. **WORKING PROTOTYPE** - Not just slides, actual app
4. **SOCIAL IMPACT** - Lives saved, not just convenience
5. **FEASIBILITY** - All free tools, deployable today
6. **SCALABILITY** - Model works for any mining region
7. **BILINGUAL** - Hindi makes it accessible to locals

---

## 📊 Demo Preparation Checklist

Before presentation:
- [ ] Backend server running
- [ ] Database seeded with Jharia zones
- [ ] Mobile app installed on phone
- [ ] Web dashboard open in browser
- [ ] Sample photos ready (crack images)
- [ ] Location spoofed to Jharia coordinates
- [ ] Hindi/English both tested
- [ ] Offline mode tested
- [ ] Emergency contacts working (without actually calling!)

---

## 🎬 Demo Script

**Time: 3-4 minutes**

```
[Open mobile app]
"Yeh hai JhariaWatch - Jharia ke residents ke liye 
subsidence warning app."

[Show map]
"Map par dekho - red zones critical hai, orange high risk.
Yeh data actual satellite research se hai."

[Tap on Alkusa zone]
"Alkusa - 27 mm per year sink ho raha hai.
Agar koi yahan hai, unhe immediately pata chalega."

[Click Check Risk]
"Main apna risk check kar sakta hoon.
Dekho - Critical zone, subsidence rate, safety tips
sab Hindi mein."

[Switch to Report tab]
"Agar ground pe crack dikhe, photo le sakte ho."

[Take photo or select sample]
"AI automatically analyze karega - moderate severity crack detected."

[Submit report]
"Report seedha BCCL dashboard pe jayega."

[Open admin dashboard on laptop]
"Admin dashboard - BCCL officials ke liye.
New report aaya hai, let me review..."

[Review report, create alert]
"Main warning alert broadcast kar sakta hoon
sab affected zone ke residents ko."

[Show notification on phone]
"Dekho - phone pe notification aa gaya.
Real-time warning!"

[Show Emergency screen]
"Emergency contacts - ek tap se call.
BCCL, DC office, NDMA, sab readily available."

"Thank you - any questions?"
```

---

*Practice this flow 2-3 times before presentation*
*Keep backup screenshots in case of technical issues*
