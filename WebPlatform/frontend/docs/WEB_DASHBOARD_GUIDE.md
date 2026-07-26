# 🖥️ Web Dashboard Guide / वेब डैशबोर्ड गाइड

## Admin Dashboard for BCCL & Government Officials

---

## 1. Quick Setup Prompt

```
Create a React admin dashboard with:
- Vite + React + TypeScript
- TailwindCSS for styling  
- React Router for navigation
- Axios for API calls
- Recharts for charts
- React-Leaflet for maps
- Firebase Auth for admin login

Pages: Login, Dashboard, Reports, Alerts, Map, Settings
Layout: Sidebar navigation + Header + Main content
```

---

## 2. Page-wise Prompts

### Login Page
```
Create admin login page:
- Email/password form
- Firebase authentication
- Redirect to dashboard on success
- Show error messages
- "Forgot password" link
- BCCL/Govt branding (dark theme)
```

### Dashboard Page
```
Create dashboard with:
- 4 stat cards: Total Users, Pending Reports, Active Alerts, Critical Zones
- Risk zones pie chart (by level)
- Reports line chart (last 7 days)
- Recent reports table (5 rows)
- Quick actions: Create Alert, View Reports

Auto-refresh every 30 seconds
Use mock data initially, connect to API later
```

### Reports Page
```
Create reports management page:
- Filter bar: status, type, zone, date range
- Table: ID, Type, Location, AI Result, Status, Date
- Status badges: pending(yellow), verified(green), rejected(red)
- Click row to open modal with:
  - Photo gallery
  - AI analysis result
  - Mini map with location
  - Status change dropdown
  - Admin notes textarea
  - Save button
```

### Alerts Page
```
Create alerts page with:
- List of all alerts (active first)
- Create New Alert button
- Alert form modal:
  - Type selector (emergency/warning/info)
  - Severity selector
  - Title (EN + HI inputs)
  - Message (EN + HI textareas)
  - Target zones multi-select
  - Valid until date picker
  - Send notification checkbox
- Show success with recipient count
```

### Map Page
```
Create full-screen Leaflet map:
- All risk zones as colored polygons
- Report markers
- Click zone to show info panel
- Zone info panel with:
  - Name, risk level, subsidence rate
  - Edit button (opens form)
  - View reports in zone
- Zoom to Jharia bounds on load
```

---

## 3. Component Hints

### Sidebar Component
```
Sidebar with:
- Logo at top
- Nav items with icons:
  - Dashboard (home icon)
  - Reports (document icon)
  - Alerts (bell icon)
  - Map (map icon)
  - Settings (gear icon)
- Active state highlighting
- Collapse button for mobile
```

### Stat Card Component
```
Props: title, value, icon, trend, color
Show: icon, title, large value
Optional: trend indicator (+5%, -3%)
Use color for left border accent
```

### Risk Badge Component
```
Props: level
Return colored badge:
- critical: red bg
- high: orange bg
- moderate: yellow bg
- low: green bg
- stable: blue bg
Text: level name (capitalize)
```

---

## 4. API Integration Hints

```javascript
// services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// API calls
export const getDashboardStats = () => api.get('/admin/dashboard');
export const getReports = (params) => api.get('/admin/reports', { params });
export const updateReport = (id, data) => api.put(`/admin/reports/${id}/review`, data);
export const createAlert = (data) => api.post('/admin/alerts', data);
export const getZones = () => api.get('/risk/zones');
export const updateZone = (id, data) => api.put(`/admin/zones/${id}`, data);
```

---

## 5. Styling Guide (TailwindCSS)

### Color Palette
```
Primary: bg-slate-900, bg-slate-800
Accent: bg-blue-600
Danger: bg-red-600
Warning: bg-orange-500
Success: bg-green-600
Text: text-slate-100, text-slate-400
```

### Common Classes
```
Card: bg-slate-800 rounded-lg p-4 shadow
Button: px-4 py-2 rounded-lg font-medium
Input: bg-slate-700 border-slate-600 rounded-lg p-2
Table: bg-slate-800 rounded-lg overflow-hidden
Header row: bg-slate-700
```

---

## 6. Quick Mockup Layout

```
┌─────────────────────────────────────────────────────────┐
│  🏔️ JhariaWatch Admin                      👤 Admin ▼  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  📊 Dash   │  ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  📄 Reports│  │ Users   │ │ Reports │ │ Alerts  │     │
│  🔔 Alerts │  │ 15,234  │ │ 45      │ │ 3       │     │
│  🗺️ Map    │  └─────────┘ └─────────┘ └─────────┘     │
│  ⚙️ Settings│                                           │
│            │  ┌───────────────┐ ┌──────────────────┐   │
│            │  │ Risk Zones    │ │ Recent Reports   │   │
│            │  │ [Pie Chart]   │ │ ┌──────────────┐ │   │
│            │  │               │ │ │ Report #123  │ │   │
│            │  │               │ │ │ Report #122  │ │   │
│            │  └───────────────┘ │ │ Report #121  │ │   │
│            │                    │ └──────────────┘ │   │
│            │                    └──────────────────┘   │
└────────────┴────────────────────────────────────────────┘
```

---

## 7. Charts with Recharts

### Pie Chart Prompt
```
Create RiskZonesPieChart component:
- Data: [{name: 'Critical', value: 6, color: '#dc2626'}, ...]
- Use PieChart, Pie, Cell, Legend from recharts
- Show percentage labels
- Responsive container
```

### Line Chart Prompt
```
Create ReportsTrendChart component:
- Data: [{date: 'Dec 1', reports: 12}, ...]
- Last 7 days
- Use LineChart, Line, XAxis, YAxis, Tooltip
- Blue line, area fill
```

---

## 8. Firebase Auth Setup

```
Create authService.js:
- signInWithEmailAndPassword for login
- signOut for logout
- onAuthStateChanged listener
- Store token in localStorage
- Redirect logic

Create AuthContext for app-wide auth state
Protect routes with PrivateRoute component
```

---

## 9. Run Commands

```bash
# Create project
npm create vite@latest jharia-admin -- --template react-ts
cd jharia-admin

# Install dependencies
npm install react-router-dom axios recharts react-leaflet leaflet
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure tailwind.config.js
# Add to content: ["./src/**/*.{js,ts,jsx,tsx}"]

# Run
npm run dev
```

---

*Use these hints with Claude Code CLI*
*Build incrementally - test each page before moving on*
