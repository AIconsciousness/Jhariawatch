const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized');
    }
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    return null;
  }
};

// Verify Firebase ID token from frontend
const verifyFirebaseToken = async (idToken) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin) return null;

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Send push notification to single device
const sendPushNotification = async (fcmToken, notification, data = {}) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin) return { success: false };

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        clickAction: data.clickAction || '/dashboard/alerts',
      },
      webpush: {
        headers: {
          Urgency: notification.urgency || 'high',
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          tag: 'jhariawatch-alert',
        },
      },
    };

    const response = await firebaseAdmin.messaging().send(message);
    console.log('✅ Push notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send push notifications to multiple devices
const sendMulticastPushNotification = async (fcmTokens, notification, data = {}) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin || !fcmTokens.length) return { success: false };

    const message = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        clickAction: data.clickAction || '/dashboard/alerts',
      },
      webpush: {
        headers: {
          Urgency: notification.urgency || 'high',
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          tag: 'jhariawatch-alert',
        },
      },
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    console.log(`✅ Push notifications sent: ${response.successCount}/${fcmTokens.length}`);

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('❌ Multicast push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send push notification by topic
const sendTopicNotification = async (topic, notification, data = {}) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin) return { success: false };

    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data,
      webpush: {
        headers: {
          Urgency: notification.urgency || 'high',
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          requireInteraction: true,
        },
      },
    };

    const response = await firebaseAdmin.messaging().send(message);
    console.log('✅ Topic notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Topic notification error:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe tokens to topic
const subscribeToTopic = async (fcmTokens, topic) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin) return { success: false };

    const response = await firebaseAdmin.messaging().subscribeToTopic(fcmTokens, topic);
    console.log(`✅ Subscribed to topic ${topic}:`, response);
    return { success: true, ...response };
  } catch (error) {
    console.error('❌ Topic subscription error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeFirebaseAdmin,
  verifyFirebaseToken,
  sendPushNotification,
  sendMulticastPushNotification,
  sendTopicNotification,
  subscribeToTopic,
};
