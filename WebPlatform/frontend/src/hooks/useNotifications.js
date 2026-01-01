import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  requestNotificationPermission,
  saveFCMTokenToBackend,
  setupForegroundMessageHandler,
  initializeFCM
} from '../services/fcmService';
import { initializeAnalytics } from '../services/analyticsService';
import { analyticsEvents } from '../services/analyticsService';

export const useNotifications = () => {
  const { user, token } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [fcmToken, setFcmToken] = useState(null);

  // Initialize FCM and Analytics on mount
  useEffect(() => {
    const init = async () => {
      // Initialize Analytics
      initializeAnalytics();

      // Initialize FCM
      await initializeFCM();

      // Setup foreground message handler
      setupForegroundMessageHandler((payload) => {
        console.log('Notification received:', payload);
        // You can add custom UI notification here
      });
    };

    init();
  }, []);

  // Request notification permission and save FCM token
  useEffect(() => {
    const setupNotifications = async () => {
      if (!user || !token) return;

      // Request permission and get FCM token
      const token_fcm = await requestNotificationPermission();

      if (token_fcm) {
        setFcmToken(token_fcm);
        setNotificationPermission('granted');

        // Save to backend
        await saveFCMTokenToBackend(token_fcm, token);

        // Log analytics
        analyticsEvents.notificationPermissionGranted();
      } else if (Notification.permission === 'denied') {
        setNotificationPermission('denied');
        analyticsEvents.notificationPermissionDenied();
      }
    };

    setupNotifications();
  }, [user, token]);

  const requestPermission = async () => {
    const token_fcm = await requestNotificationPermission();

    if (token_fcm) {
      setFcmToken(token_fcm);
      setNotificationPermission('granted');

      if (user && token) {
        await saveFCMTokenToBackend(token_fcm, token);
      }

      analyticsEvents.notificationPermissionGranted();
      return true;
    }

    analyticsEvents.notificationPermissionDenied();
    return false;
  };

  return {
    notificationPermission,
    fcmToken,
    requestPermission,
    isGranted: notificationPermission === 'granted',
    isDenied: notificationPermission === 'denied',
    isDefault: notificationPermission === 'default',
  };
};
