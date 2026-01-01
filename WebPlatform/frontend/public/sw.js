const CACHE_NAME = 'jhariawatch-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/images/hero-bg.jpg',
  '/images/coalfield.jpg',
  '/images/mining.jpg',
  '/images/subsidence.jpg',
  '/images/community.jpg'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch resources
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension and other unsupported schemes
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('edge://')) {
    return;
  }

  // Skip caching for POST, PUT, DELETE requests (only cache GET requests)
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip caching for API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip caching for non-http/https URLs
  if (!event.request.url.startsWith('http')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache http/https requests
            if (!event.request.url.startsWith('http')) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Cache put failed:', error);
                }
              });

            return response;
          }
        ).catch((error) => {
          console.warn('Fetch failed:', error);
          return response;
        });
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JhariaWatch Alert';
  const options = {
    body: data.body || 'New subsidence alert in your area',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'jhariawatch-notification',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard/alerts')
    );
  }
});

// Import Firebase scripts for FCM
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(event.data.config);

        const messaging = firebase.messaging();

        // Background message handler
        messaging.onBackgroundMessage((payload) => {
          console.log('[SW] Background message received:', payload);

          const notificationTitle = payload.notification?.title || 'JhariaWatch Alert';
          const notificationOptions = {
            body: payload.notification?.body || 'New notification',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: payload.data,
            tag: 'jhariawatch-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            actions: [
              { action: 'view', title: 'View Details' },
              { action: 'close', title: 'Dismiss' }
            ]
          };

          return self.registration.showNotification(notificationTitle, notificationOptions);
        });

        console.log('[SW] Firebase messaging initialized');
      }
    } catch (error) {
      console.error('[SW] Firebase initialization error:', error);
    }
  }
});
