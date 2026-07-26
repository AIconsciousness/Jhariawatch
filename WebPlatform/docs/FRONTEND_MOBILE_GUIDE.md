# 📱 Mobile App Frontend Guide / मोबाइल ऐप फ्रंटएंड गाइड

## JhariaWatch React Native App Development Guide

---

## 1. Project Setup

### 1.1 Initialize Project

```bash
# Create new React Native project
npx react-native init JhariaWatch --template react-native-template-typescript

# Navigate to project
cd JhariaWatch

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install axios @react-native-async-storage/async-storage
npm install react-native-maps react-native-webview
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/messaging @react-native-firebase/storage
npm install react-native-camera react-native-image-picker
npm install react-native-geolocation-service
npm install i18next react-i18next
npm install react-native-vector-icons
npm install react-native-linear-gradient
npm install react-native-modal
npm install @react-native-community/netinfo
```

### 1.2 Project Structure

```
JhariaWatch/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   └── LanguageToggle.tsx
│   │   ├── map/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── RiskZoneOverlay.tsx
│   │   │   └── LocationMarker.tsx
│   │   └── reports/
│   │       ├── CameraCapture.tsx
│   │       ├── PhotoPreview.tsx
│   │       └── ReportCard.tsx
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── RiskCheckScreen.tsx
│   │   ├── ReportScreen.tsx
│   │   ├── AlertsScreen.tsx
│   │   ├── SafetyScreen.tsx
│   │   ├── EmergencyScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── AuthNavigator.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── locationService.ts
│   │   ├── notificationService.ts
│   │   └── offlineService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useRiskZones.ts
│   │   └── useAlerts.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── LocationContext.tsx
│   │
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── en.json
│   │   └── hi.json
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── colors.ts
│   │   └── riskCalculator.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── App.tsx
├── index.js
└── package.json
```

---

## 2. Core Files Implementation

### 2.1 App Entry Point (App.tsx)

```typescript
// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import './src/i18n';

const App: React.FC = () => {
  React.useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <NavigationContainer>
              <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
              <AppNavigator />
            </NavigationContainer>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

### 2.2 i18n Configuration

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import hi from './hi.json';

const LANGUAGE_KEY = 'preferred_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    callback(savedLanguage || 'hi'); // Default to Hindi
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 2.3 English Translations (en.json)

```json
{
  "app": {
    "name": "JhariaWatch",
    "tagline": "Subsidence Monitoring & Alert System"
  },
  "nav": {
    "home": "Home",
    "riskCheck": "Risk Check",
    "report": "Report",
    "alerts": "Alerts",
    "safety": "Safety"
  },
  "home": {
    "title": "Jharia Subsidence Monitor",
    "subtitle": "Real-time risk monitoring for your safety",
    "currentLocation": "Your Location",
    "riskStatus": "Risk Status",
    "viewMap": "View Full Map",
    "quickActions": "Quick Actions",
    "checkRisk": "Check Risk",
    "submitReport": "Submit Report",
    "viewAlerts": "View Alerts"
  },
  "risk": {
    "title": "Risk Check",
    "checking": "Checking risk level...",
    "yourLocation": "Your Location",
    "riskLevel": "Risk Level",
    "critical": "CRITICAL",
    "high": "HIGH",
    "moderate": "MODERATE",
    "low": "LOW",
    "stable": "STABLE",
    "subsidenceRate": "Subsidence Rate",
    "perYear": "per year",
    "recommendations": "Safety Recommendations",
    "nearestSafe": "Nearest Safe Zone"
  },
  "report": {
    "title": "Submit Report",
    "takePhoto": "Take Photo",
    "selectFromGallery": "Select from Gallery",
    "reportType": "Report Type",
    "types": {
      "crack": "Ground Crack",
      "subsidence": "Land Subsidence",
      "building_damage": "Building Damage",
      "road_damage": "Road Damage",
      "other": "Other"
    },
    "description": "Description (Optional)",
    "descriptionPlaceholder": "Describe what you observed...",
    "urgency": "Urgency Level",
    "submit": "Submit Report",
    "submitting": "Submitting...",
    "success": "Report submitted successfully!",
    "aiAnalyzing": "AI analyzing your photo..."
  },
  "alerts": {
    "title": "Active Alerts",
    "noAlerts": "No active alerts",
    "emergency": "EMERGENCY",
    "warning": "WARNING",
    "info": "INFO",
    "validUntil": "Valid until",
    "instructions": "Instructions",
    "affectedAreas": "Affected Areas"
  },
  "safety": {
    "title": "Safety Information",
    "tips": "Safety Tips",
    "dosDonts": "Do's and Don'ts",
    "emergency": "Emergency Contacts",
    "evacuation": "Evacuation Guide"
  },
  "emergency": {
    "title": "Emergency Contacts",
    "bccl": "BCCL Control Room",
    "dc": "Dhanbad DC Office",
    "ndma": "NDMA Helpline",
    "fire": "Fire Services",
    "ambulance": "Ambulance",
    "call": "Call"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "close": "Close",
    "km": "km",
    "mm": "mm"
  }
}
```

### 2.4 Hindi Translations (hi.json)

```json
{
  "app": {
    "name": "झरियावॉच",
    "tagline": "धंसाव निगरानी और अलर्ट सिस्टम"
  },
  "nav": {
    "home": "होम",
    "riskCheck": "जोखिम जांच",
    "report": "रिपोर्ट",
    "alerts": "अलर्ट",
    "safety": "सुरक्षा"
  },
  "home": {
    "title": "झरिया धंसाव मॉनिटर",
    "subtitle": "आपकी सुरक्षा के लिए रियल-टाइम जोखिम निगरानी",
    "currentLocation": "आपका स्थान",
    "riskStatus": "जोखिम स्थिति",
    "viewMap": "पूरा नक्शा देखें",
    "quickActions": "त्वरित कार्य",
    "checkRisk": "जोखिम जांचें",
    "submitReport": "रिपोर्ट करें",
    "viewAlerts": "अलर्ट देखें"
  },
  "risk": {
    "title": "जोखिम जांच",
    "checking": "जोखिम स्तर जांचा जा रहा है...",
    "yourLocation": "आपका स्थान",
    "riskLevel": "जोखिम स्तर",
    "critical": "गंभीर",
    "high": "उच्च",
    "moderate": "मध्यम",
    "low": "कम",
    "stable": "स्थिर",
    "subsidenceRate": "धंसाव दर",
    "perYear": "प्रति वर्ष",
    "recommendations": "सुरक्षा सिफारिशें",
    "nearestSafe": "निकटतम सुरक्षित क्षेत्र"
  },
  "report": {
    "title": "रिपोर्ट जमा करें",
    "takePhoto": "फोटो लें",
    "selectFromGallery": "गैलरी से चुनें",
    "reportType": "रिपोर्ट प्रकार",
    "types": {
      "crack": "जमीन में दरार",
      "subsidence": "भूमि धंसाव",
      "building_damage": "भवन क्षति",
      "road_damage": "सड़क क्षति",
      "other": "अन्य"
    },
    "description": "विवरण (वैकल्पिक)",
    "descriptionPlaceholder": "आपने जो देखा उसका वर्णन करें...",
    "urgency": "तात्कालिकता स्तर",
    "submit": "रिपोर्ट जमा करें",
    "submitting": "जमा हो रहा है...",
    "success": "रिपोर्ट सफलतापूर्वक जमा हो गई!",
    "aiAnalyzing": "AI आपकी फोटो का विश्लेषण कर रहा है..."
  },
  "alerts": {
    "title": "सक्रिय अलर्ट",
    "noAlerts": "कोई सक्रिय अलर्ट नहीं",
    "emergency": "आपातकालीन",
    "warning": "चेतावनी",
    "info": "सूचना",
    "validUntil": "वैध तक",
    "instructions": "निर्देश",
    "affectedAreas": "प्रभावित क्षेत्र"
  },
  "safety": {
    "title": "सुरक्षा जानकारी",
    "tips": "सुरक्षा टिप्स",
    "dosDonts": "क्या करें और क्या न करें",
    "emergency": "आपातकालीन संपर्क",
    "evacuation": "निकासी गाइड"
  },
  "emergency": {
    "title": "आपातकालीन संपर्क",
    "bccl": "BCCL नियंत्रण कक्ष",
    "dc": "धनबाद DC कार्यालय",
    "ndma": "NDMA हेल्पलाइन",
    "fire": "अग्निशमन सेवा",
    "ambulance": "एम्बुलेंस",
    "call": "कॉल करें"
  },
  "common": {
    "loading": "लोड हो रहा है...",
    "error": "कुछ गलत हो गया",
    "retry": "पुनः प्रयास करें",
    "cancel": "रद्द करें",
    "confirm": "पुष्टि करें",
    "save": "सहेजें",
    "close": "बंद करें",
    "km": "किमी",
    "mm": "मिमी"
  }
}
```

---

## 3. Key Screens Implementation

### 3.1 Home Screen

```typescript
// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import MapContainer from '../components/map/MapContainer';
import RiskBadge from '../components/common/RiskBadge';
import { useLocation } from '../hooks/useLocation';
import { useRiskZones } from '../hooks/useRiskZones';
import { useAlerts } from '../hooks/useAlerts';
import { COLORS } from '../utils/colors';

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { location, loading: locationLoading } = useLocation();
  const { riskZones, currentRisk, loading: riskLoading } = useRiskZones(location);
  const { alerts, unreadCount } = useAlerts();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data
    setRefreshing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.high;
      case 'moderate': return COLORS.moderate;
      case 'low': return COLORS.low;
      default: return COLORS.stable;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.languageBtn}
            onPress={() => {
              const newLang = i18n.language === 'en' ? 'hi' : 'en';
              i18n.changeLanguage(newLang);
            }}
          >
            <Text style={styles.languageText}>
              {i18n.language === 'en' ? 'हिं' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Risk Status */}
        {currentRisk && (
          <View style={[styles.riskCard, { backgroundColor: getRiskColor(currentRisk.level) + '20' }]}>
            <Icon name="alert-circle" size={24} color={getRiskColor(currentRisk.level)} />
            <View style={styles.riskInfo}>
              <Text style={styles.riskLabel}>{t('home.riskStatus')}</Text>
              <Text style={[styles.riskLevel, { color: getRiskColor(currentRisk.level) }]}>
                {t(`risk.${currentRisk.level}`)}
              </Text>
            </View>
            <RiskBadge level={currentRisk.level} />
          </View>
        )}
      </LinearGradient>

      {/* Map Preview */}
      <View style={styles.mapContainer}>
        <MapContainer
          style={styles.map}
          riskZones={riskZones}
          userLocation={location}
          interactive={false}
        />
        <TouchableOpacity
          style={styles.expandMapBtn}
          onPress={() => navigation.navigate('FullMap')}
        >
          <Icon name="fullscreen" size={20} color={COLORS.white} />
          <Text style={styles.expandMapText}>{t('home.viewMap')}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.danger + '15' }]}
            onPress={() => navigation.navigate('RiskCheck')}
          >
            <Icon name="map-marker-alert" size={32} color={COLORS.danger} />
            <Text style={styles.actionText}>{t('home.checkRisk')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.primary + '15' }]}
            onPress={() => navigation.navigate('Report')}
          >
            <Icon name="camera-plus" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>{t('home.submitReport')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.warning + '15' }]}
            onPress={() => navigation.navigate('Alerts')}
          >
            <View style={styles.alertBadgeContainer}>
              <Icon name="bell-alert" size={32} color={COLORS.warning} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionText}>{t('home.viewAlerts')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.success + '15' }]}
            onPress={() => navigation.navigate('Safety')}
          >
            <Icon name="shield-check" size={32} color={COLORS.success} />
            <Text style={styles.actionText}>{t('safety.title')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Alerts Preview */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alerts.title')}</Text>
          {alerts.slice(0, 2).map((alert) => (
            <TouchableOpacity
              key={alert.alertId}
              style={[styles.alertCard, { borderLeftColor: getRiskColor(alert.severity) }]}
              onPress={() => navigation.navigate('AlertDetail', { alertId: alert.alertId })}
            >
              <View style={styles.alertHeader}>
                <Text style={[styles.alertType, { color: getRiskColor(alert.severity) }]}>
                  {t(`alerts.${alert.alertType}`)}
                </Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN')}
                </Text>
              </View>
              <Text style={styles.alertTitle}>
                {alert.title[i18n.language] || alert.title.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Emergency Button */}
      <TouchableOpacity
        style={styles.emergencyBtn}
        onPress={() => navigation.navigate('Emergency')}
      >
        <Icon name="phone-alert" size={24} color={COLORS.white} />
        <Text style={styles.emergencyText}>{t('emergency.title')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    marginTop: 4,
  },
  languageBtn: {
    backgroundColor: COLORS.white + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  languageText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  riskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  riskLabel: {
    color: COLORS.white + 'AA',
    fontSize: 12,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    flex: 1,
  },
  expandMapBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expandMapText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 12,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: {
    marginTop: 10,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  alertBadgeContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertType: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  alertTime: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  alertTitle: {
    color: COLORS.text,
    fontSize: 14,
  },
  emergencyBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.danger,
    margin: 15,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default HomeScreen;
```

### 3.2 Risk Check Screen

```typescript
// src/screens/RiskCheckScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../hooks/useLocation';
import { checkRiskAtLocation } from '../services/api';
import { COLORS } from '../utils/colors';
import MapContainer from '../components/map/MapContainer';

interface RiskData {
  isInRiskZone: boolean;
  zone?: {
    zoneName: { en: string; hi: string };
    riskLevel: string;
    riskScore: number;
  };
  subsidenceData?: {
    averageRate: number;
    unit: string;
  };
  riskDescription: { en: string; hi: string };
  safetyRecommendations: { en: string[]; hi: string[] };
  nearestSafeZone?: {
    name: string;
    distance: number;
    direction: string;
  };
}

const RiskCheckScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      fetchRiskData();
    }
  }, [location]);

  const fetchRiskData = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await checkRiskAtLocation(location.latitude, location.longitude);
      setRiskData(response.data.riskAssessment);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.high;
      case 'moderate': return COLORS.moderate;
      case 'low': return COLORS.low;
      default: return COLORS.stable;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return 'alert-octagon';
      case 'high': return 'alert';
      case 'moderate': return 'alert-circle';
      case 'low': return 'information';
      default: return 'check-circle';
    }
  };

  if (locationLoading || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('risk.checking')}</Text>
      </View>
    );
  }

  const lang = i18n.language as 'en' | 'hi';

  return (
    <ScrollView style={styles.container}>
      {/* Location Display */}
      {location && (
        <View style={styles.locationCard}>
          <Icon name="crosshairs-gps" size={24} color={COLORS.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>{t('risk.yourLocation')}</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </Text>
          </View>
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapContainer
          style={styles.map}
          userLocation={location}
          showUserLocation
          zoomLevel={15}
        />
      </View>

      {/* Risk Assessment */}
      {riskData && (
        <>
          <View
            style={[
              styles.riskCard,
              { backgroundColor: getRiskColor(riskData.zone?.riskLevel || 'stable') + '15' },
            ]}
          >
            <Icon
              name={getRiskIcon(riskData.zone?.riskLevel || 'stable')}
              size={48}
              color={getRiskColor(riskData.zone?.riskLevel || 'stable')}
            />
            <Text style={styles.riskLevelLabel}>{t('risk.riskLevel')}</Text>
            <Text
              style={[
                styles.riskLevelValue,
                { color: getRiskColor(riskData.zone?.riskLevel || 'stable') },
              ]}
            >
              {t(`risk.${riskData.zone?.riskLevel || 'stable'}`)}
            </Text>

            {riskData.zone && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={styles.scoreValue}>{riskData.zone.riskScore}/100</Text>
              </View>
            )}
          </View>

          {/* Zone Name */}
          {riskData.zone && (
            <View style={styles.infoCard}>
              <Icon name="map-marker" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Zone</Text>
                <Text style={styles.infoValue}>
                  {riskData.zone.zoneName[lang]}
                </Text>
              </View>
            </View>
          )}

          {/* Subsidence Rate */}
          {riskData.subsidenceData && (
            <View style={styles.infoCard}>
              <Icon name="arrow-collapse-down" size={24} color={COLORS.danger} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('risk.subsidenceRate')}</Text>
                <Text style={styles.infoValue}>
                  {riskData.subsidenceData.averageRate} {t('common.mm')} {t('risk.perYear')}
                </Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {riskData.riskDescription[lang]}
            </Text>
          </View>

          {/* Safety Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('risk.recommendations')}</Text>
            {riskData.safetyRecommendations[lang].map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Nearest Safe Zone */}
          {riskData.nearestSafeZone && (
            <View style={styles.safeZoneCard}>
              <Icon name="shield-check" size={24} color={COLORS.success} />
              <View style={styles.safeZoneInfo}>
                <Text style={styles.safeZoneLabel}>{t('risk.nearestSafe')}</Text>
                <Text style={styles.safeZoneName}>{riskData.nearestSafeZone.name}</Text>
                <Text style={styles.safeZoneDistance}>
                  {riskData.nearestSafeZone.distance} {t('common.km')} ({riskData.nearestSafeZone.direction})
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.textLight,
    fontSize: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationLabel: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  locationCoords: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  riskCard: {
    margin: 15,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  riskLevelLabel: {
    marginTop: 10,
    color: COLORS.textLight,
    fontSize: 14,
  },
  riskLevelValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  scoreContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  scoreLabel: {
    color: COLORS.textLight,
  },
  scoreValue: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  descriptionText: {
    color: COLORS.text,
    lineHeight: 22,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
  },
  safeZoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  safeZoneInfo: {
    marginLeft: 12,
  },
  safeZoneLabel: {
    color: COLORS.success,
    fontSize: 12,
  },
  safeZoneName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  safeZoneDistance: {
    color: COLORS.textLight,
    fontSize: 14,
  },
});

export default RiskCheckScreen;
```

---

## 4. Services

### 4.1 API Service

```typescript
// src/services/api.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://api.jhariawatch.in/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (data: any) => api.post('/auth/register', data);
export const loginUser = (data: any) => api.post('/auth/login', data);
export const updateProfile = (data: any) => api.put('/auth/profile', data);

// Risk APIs
export const getRiskZones = (params?: any) => api.get('/risk/zones', { params });
export const checkRiskAtLocation = (lat: number, lng: number) =>
  api.get('/risk/check', { params: { lat, lng } });
export const getZoneDetails = (zoneId: string) => api.get(`/risk/zones/${zoneId}`);

// Report APIs
export const submitReport = (formData: FormData) =>
  api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getUserReports = (params?: any) => api.get('/reports', { params });
export const getReportDetails = (reportId: string) => api.get(`/reports/${reportId}`);

// Alert APIs
export const getActiveAlerts = (params?: any) => api.get('/alerts', { params });
export const getAlertDetails = (alertId: string) => api.get(`/alerts/${alertId}`);

export default api;
```

### 4.2 Notification Service

```typescript
// src/services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

export const initializeNotifications = async () => {
  // Request permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted');
    await getFCMToken();
    setupMessageHandlers();
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    await AsyncStorage.setItem('fcm_token', token);
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

const setupMessageHandlers = () => {
  // Foreground messages
  messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground message:', remoteMessage);
    // Show local notification or update UI
  });

  // Background/quit message opens
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    // Navigate to appropriate screen
  });

  // Check if app was opened from notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Initial notification:', remoteMessage);
      }
    });
};

// Subscribe to zone topics
export const subscribeToZone = async (zoneId: string) => {
  try {
    await messaging().subscribeToTopic(`zone_${zoneId}`);
    console.log(`Subscribed to zone: ${zoneId}`);
  } catch (error) {
    console.error('Subscribe error:', error);
  }
};

export const unsubscribeFromZone = async (zoneId: string) => {
  try {
    await messaging().unsubscribeFromTopic(`zone_${zoneId}`);
    console.log(`Unsubscribed from zone: ${zoneId}`);
  } catch (error) {
    console.error('Unsubscribe error:', error);
  }
};
```

---

## 5. Color Constants

```typescript
// src/utils/colors.ts
export const COLORS = {
  // Primary
  primary: '#1a1a2e',
  primaryDark: '#16213e',
  primaryLight: '#0f3460',

  // Risk Levels
  critical: '#dc2626',  // Red
  high: '#ea580c',      // Orange
  moderate: '#ca8a04',  // Yellow
  low: '#65a30d',       // Light Green
  stable: '#16a34a',    // Green
  uplifting: '#2563eb', // Blue

  // Status
  danger: '#dc2626',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',

  // Neutrals
  white: '#ffffff',
  background: '#f3f4f6',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
};
```

---

## 6. Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
cd ios && pod install && cd ..
npm run ios
```

---

*Document Version: 1.0*
*For Claude Code CLI implementation*
