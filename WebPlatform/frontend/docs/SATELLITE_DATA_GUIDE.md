# 🛰️ Satellite Data Guide / सैटेलाइट डेटा गाइड

## Jharia Subsidence Data Sources & Integration

---

## 1. Data Sources Overview

### Primary: Sentinel-1 SAR Data (FREE)
- **Provider:** European Space Agency (ESA) Copernicus
- **Access:** https://scihub.copernicus.eu/
- **Type:** C-band SAR (5.6 cm wavelength)
- **Revisit:** 6 days (constellation)
- **Resolution:** 5m x 20m (IW mode)
- **Use:** InSAR processing for subsidence detection

### For Hackathon (Pre-processed Data)
Since InSAR processing requires specialized software (SARPROZ, SNAP), use:
1. **Research paper data** (already in your PDFs)
2. **Static GeoJSON** with known subsidence points
3. **Mock API** returning realistic values

---

## 2. Key Data from Research Papers

### Subsidence Rates (Use in seed data):

| Location | Coordinates | Rate (mm/year) | Cumulative (mm) | Zone |
|----------|-------------|----------------|-----------------|------|
| Alkusa | 23.767°N, 86.396°E | 27-29 | 90 | Critical |
| Ena | 23.758°N, 86.401°E | 10-28 | 85 | Critical |
| Bera-Dobari | 23.758°N, 86.435°E | 28 | 87 | High |
| Bastacola | 23.745°N, 86.420°E | 10 | 30 | High |
| CK-Siding | 23.730°N, 86.410°E | 10-21 | 60 | High |
| Tisra | 23.715°N, 86.434°E | 20+ | 70 | Critical |

### Zone Areas (from papers):
- Critical subsiding: 0.44 sq km
- High subsiding: 2.78 sq km  
- Moderate subsiding: 5.18 sq km
- Stable: 55.74 sq km
- Uplifting: 3.79 sq km

### Seasonal Pattern:
- May-September: Soil swelling (monsoon) → reduced subsidence
- October-April: Soil shrinking (dry) → increased subsidence

---

## 3. Creating Static Risk Zone Data

### Claude Code Prompt:
```
Create a GeoJSON file with Jharia risk zones.

For each zone create approximate polygon (0.5-1 km squares):
1. alkusa_critical_01: center 23.767, 86.396
2. ena_critical_01: center 23.758, 86.401
3. tisra_critical_01: center 23.715, 86.434
4. bera_dobari_high_01: center 23.758, 86.435
5. bastacola_high_01: center 23.745, 86.420
6. ck_siding_high_01: center 23.730, 86.410

Properties for each:
- zoneId, zoneName {en, hi}
- riskLevel, riskScore
- subsidenceRate (mm/year)
- cumulativeDisplacement
- bccl_area
- description {en, hi}

Function to generate square polygon from center point and size
```

### Helper Function Hint:
```javascript
// Generate square polygon from center
function createSquarePolygon(centerLat, centerLng, sizeKm) {
  const offset = sizeKm / 111; // approx degrees
  return [
    [centerLng - offset, centerLat - offset],
    [centerLng + offset, centerLat - offset],
    [centerLng + offset, centerLat + offset],
    [centerLng - offset, centerLat + offset],
    [centerLng - offset, centerLat - offset] // close polygon
  ];
}
```

---

## 4. Map Integration with Leaflet

### Claude Code Prompt for Map Component:
```
Create a React/React Native component that displays Jharia risk zones on Leaflet map.

Requirements:
- Center on Jharia: [23.75, 86.42], zoom 12
- Load GeoJSON risk zones
- Style polygons by riskLevel:
  - critical: red (#dc2626), fillOpacity 0.4
  - high: orange (#ea580c)
  - moderate: yellow (#ca8a04)
  - low: light green (#65a30d)
  - stable: green (#16a34a)
- Add popup on click showing zone info
- Add legend in corner
- Show user location marker if available
- Use OpenStreetMap tiles (free)

For React Native: use WebView with Leaflet HTML
For React Web: use react-leaflet
```

### Leaflet Tile URL (FREE):
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 5. Real Satellite Data (Future/Production)

### If you want to actually fetch Sentinel data:

#### Step 1: Register at Copernicus
- URL: https://scihub.copernicus.eu/dhus/#/self-registration
- Free account required

#### Step 2: Search for Jharia Data
```
Query parameters:
- Platform: Sentinel-1
- Product Type: SLC (for InSAR) or GRD
- Area: POLYGON((86.3 23.6, 86.5 23.6, 86.5 23.85, 86.3 23.85, 86.3 23.6))
- Date: last 3 years
```

#### Step 3: Processing (Advanced - Not for Hackathon)
- Use SNAP (ESA free software) or SARPROZ
- InSAR processing requires 20+ images
- Output: displacement velocity maps

---

## 6. Mock Satellite Data API

### Claude Code Prompt:
```
Create a mock satellite data service for demo:

GET /api/satellite/latest
- Return mock InSAR data points
- Each point: {coordinates, velocity, cumDisplacement, coherence}
- Use realistic values from research papers
- Add lastUpdated timestamp

GET /api/satellite/timeseries/:pointId  
- Return mock time series for a point
- Monthly values from Jan 2018 to Dec 2024
- Show seasonal variation pattern
- Cumulative displacement graph data

Generate 50-100 random points within Jharia bounds
Higher density in critical zones
```

---

## 7. Data Visualization Hints

### For Mobile App Map:
```
Use react-native-webview with embedded Leaflet:
- Create HTML template with Leaflet setup
- Pass GeoJSON data via injectedJavaScript
- Handle marker clicks via postMessage
- Lightweight, works on low-end phones
```

### For Admin Dashboard Charts:
```
Use Recharts for:
- Subsidence trend line chart (time vs displacement)
- Risk zone pie chart (area by level)
- Reports bar chart (by location)
- Heatmap overlay on map (report density)
```

---

## 8. Jharia Geographic Bounds

```javascript
const JHARIA_BOUNDS = {
  north: 23.91,
  south: 23.58,
  east: 86.55,
  west: 86.08,
  center: { lat: 23.75, lng: 86.42 }
};

const STUDY_AREA = {
  // Eastern Jharia (from research paper)
  north: 23.788,
  south: 23.682,
  east: 86.461,
  west: 86.362,
  area: 67.93 // sq km
};
```

---

## 9. Important Colliery Locations

Include these as landmarks in your data:

| Colliery/Location | Lat | Lng | BCCL Area |
|-------------------|-----|-----|-----------|
| Alkusa OC | 23.767 | 86.396 | Area VIII |
| Ena Colliery | 23.758 | 86.401 | Area VIII |
| Dobari OC | 23.758 | 86.435 | Area IX |
| Lodna Colliery | 23.724 | 86.438 | Area IX |
| Bastacola | 23.745 | 86.420 | Area IX |
| Kusunda | 23.780 | 86.410 | Area VIII |
| Jorapokhar | 23.699 | 86.427 | Area IX |

---

## 10. Quick Data Summary for Presentation

**Key stats to mention:**
- Jharia Coalfield: 450 sq km area
- Coal fires burning: 100+ years
- Max subsidence rate: 56.72 cm/year (extreme cases)
- Typical critical zone: 7-30 mm/year
- Population at risk: ~100,000
- Sentinel-1 revisit: 6 days
- Data period analyzed: 2018-2021 (papers)

---

*Use this data to populate your database and create realistic demo*
