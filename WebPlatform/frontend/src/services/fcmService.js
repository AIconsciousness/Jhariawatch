import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let messaging = null;
let firebaseApp = null;

// Initialize FCM
export const initializeFCM = async () => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, FCM unavailable');
      return false;
    }

    // Check if service worker is registered
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    // Check notification permission
    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    // Initialize Firebase app if not already
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }

    // Initialize messaging
    messaging = getMessaging(firebaseApp);

    console.log('✅ FCM initialized');
    return true;
  } catch (error) {
    console.error('FCM initialization error:', error);
    return false;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const initialized = await initializeFCM();
    if (!initialized) return null;

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Get FCM token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Send FCM token to backend
export const saveFCMTokenToBackend = async (fcmToken, authToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ FCM token saved to backend');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Setup foreground message handler
export const setupForegroundMessageHandler = (onMessageCallback) => {
  if (!messaging) {
    console.warn('FCM not initialized, cannot setup message handler');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);

    const notificationTitle = payload.notification?.title || 'JhariaWatch Alert';
    const notificationOptions = {
      body: payload.notification?.body || 'New notification',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: payload.data,
      tag: 'jhariawatch-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }

    // Call custom callback
    if (onMessageCallback) {
      onMessageCallback(payload);
    }
  });
};

// Get current FCM token
export const getCurrentFCMToken = async () => {
  try {
    if (!messaging) {
      await initializeFCM();
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    return token;
  } catch (error) {
    console.error('Error getting current FCM token:', error);
    return null;
  }
};
