import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

let analytics = null;
let firebaseApp = null;

// Initialize Analytics
export const initializeAnalytics = () => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, Analytics unavailable');
      return false;
    }

    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }

    analytics = getAnalytics(firebaseApp);
    console.log('✅ Firebase Analytics initialized');
    return true;
  } catch (error) {
    console.error('Analytics initialization error:', error);
    return false;
  }
};

// Log custom events
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (!analytics) {
    initializeAnalytics();
  }

  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
      console.log(`📊 Analytics event logged: ${eventName}`, eventParams);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }
};

// Set user properties
export const setAnalyticsUserProperties = (properties) => {
  if (!analytics) {
    initializeAnalytics();
  }

  if (analytics) {
    try {
      setUserProperties(analytics, properties);
      console.log('📊 User properties set:', properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }
};

// Set user ID
export const setAnalyticsUserId = (userId) => {
  if (!analytics) {
    initializeAnalytics();
  }

  if (analytics) {
    try {
      setUserId(analytics, userId);
      console.log('📊 User ID set:', userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }
};

// Predefined event helpers
export const analyticsEvents = {
  // User actions
  login: (method) => logAnalyticsEvent('login', { method }),
  signup: (method) => logAnalyticsEvent('sign_up', { method }),

  // Report actions
  reportSubmitted: (reportType) => logAnalyticsEvent('report_submitted', { report_type: reportType }),
  reportViewed: (reportId) => logAnalyticsEvent('report_viewed', { report_id: reportId }),

  // Alert actions
  alertViewed: (alertId, severity) => logAnalyticsEvent('alert_viewed', { alert_id: alertId, severity }),

  // Risk check
  riskCheckPerformed: (zoneId, riskLevel) => logAnalyticsEvent('risk_check_performed', { zone_id: zoneId, risk_level: riskLevel }),

  // Notifications
  notificationPermissionGranted: () => logAnalyticsEvent('notification_permission_granted'),
  notificationPermissionDenied: () => logAnalyticsEvent('notification_permission_denied'),

  // Navigation
  pageView: (pageName) => logAnalyticsEvent('page_view', { page_name: pageName }),
};
