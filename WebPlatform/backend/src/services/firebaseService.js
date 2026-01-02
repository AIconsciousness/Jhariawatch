const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    if (!admin.apps.length) {
      // Check if required environment variables are set
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error('❌ Missing Firebase environment variables');
        console.error('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
        console.error('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
        console.error('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET');
        return null;
      }

      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log('  - Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('  - Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    }
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('Error code:', error.code);
    return null;
  }
};

// Verify Firebase ID token from frontend
const verifyFirebaseToken = async (idToken) => {
  try {
    console.log('🔐 Verifying Firebase token...');

    // Check if Firebase Admin is initialized
    const firebaseAdmin = initializeFirebaseAdmin();
    if (!firebaseAdmin) {
      console.error('❌ Firebase Admin not initialized');
      return null;
    }

    console.log('✅ Firebase Admin initialized, verifying token');
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    console.log('✅ Token verified successfully for user:', decodedToken.email);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
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
