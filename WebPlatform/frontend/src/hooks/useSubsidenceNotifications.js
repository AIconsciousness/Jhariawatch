import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { riskAPI } from '../services/api';

// Notification permission check and request
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show browser notification
const showNotification = (title, body, icon = '/icon-192x192.png') => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon,
      badge: '/icon-192x192.png',
      tag: 'jhariawatch-subsidence-alert',
      requireInteraction: true,
      vibrate: [200, 100, 200]
    });
  }
};

// Check for dangerous subsidence trends
const checkDangerousTrend = (data) => {
  if (!data || data.length < 3) return null;

  const recent = data.slice(-3);
  const older = data.slice(0, 3);

  const recentAvg = recent.reduce((sum, d) => sum + d.rate, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.rate, 0) / older.length;

  const trendPercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  // Dangerous if: rate > 7 mm/year OR trend increasing > 20%
  if (recentAvg > 7 || trendPercent > 20) {
    return {
      dangerous: true,
      rate: recentAvg,
      trend: trendPercent,
      message: recentAvg > 7 
        ? `Critical subsidence rate detected: ${recentAvg.toFixed(1)} mm/year`
        : `Rapid increase detected: ${trendPercent.toFixed(1)}% increase in subsidence rate`
    };
  }

  return null;
};

export const useSubsidenceNotifications = (zoneId, chartData) => {
  const { language } = useLanguage();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    const setupNotifications = async () => {
      await requestNotificationPermission();
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    if (!zoneId || !chartData || chartData.length === 0) return;

    const danger = checkDangerousTrend(chartData);
    
    if (danger && !notifiedRef.current.has(zoneId)) {
      notifiedRef.current.add(zoneId);

      const title = language === 'hi' 
        ? '⚠️ झरिया धंसाव चेतावनी' 
        : '⚠️ Jharia Subsidence Alert';
      
      const body = language === 'hi'
        ? `इस क्षेत्र में खतरनाक धंसाव दर का पता चला है। कृपया सावधानी बरतें। दर: ${danger.rate.toFixed(1)} mm/वर्ष`
        : `Dangerous subsidence rate detected in this area. Please exercise caution. Rate: ${danger.rate.toFixed(1)} mm/year`;

      showNotification(title, body);
      
      // Also log to console for debugging
      console.warn('🚨 Dangerous subsidence detected:', danger);
    }
  }, [zoneId, chartData, language]);

  return null;
};


