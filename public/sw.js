// Background service worker for keeping the app responsive
const CACHE_NAME = 'ashila-pharmacy-v3'; // Updated version to force cache refresh

// Clear old caches on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Install event - cache essential resources
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.keys().then((requests) => {
        requests.forEach((request) => {
          if (request.url.includes('localhost:5001')) {
            cache.delete(request);
          }
        });
      });
    })
  );
});

const API_BASE_URL = 'https://your-backend.onrender.com';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/api/health' // Pre-cache health endpoint
        ]);
      })
  );
});

// Fetch event - handle API calls with offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page for navigation requests
              return new Response('Offline', { status: 503 });
            });
        })
    );
  } else {
    // Handle non-API requests normally
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
        .catch((error) => {
          // Silently handle fetch errors for missing resources
          console.log('Failed to fetch resource:', event.request.url);
          // Return a basic response for failed fetches
          return new Response('Resource not available', {
            status: 404,
            statusText: 'Not Found'
          });
        })
    );
  }
});

// Periodic sync for background updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks
      caches.open(CACHE_NAME).then((cache) => {
        return cache.add('/api/health');
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NEW_ORDER') {
    const options = {
      body: event.data.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'medi-mart-order',
      requireInteraction: false,
      silent: false,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        count: event.data.count
      },
      actions: [
        {
          action: 'view-orders',
          title: 'View Orders',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ]
    };

    self.registration.showNotification('New Order - Farmaci Ashila', options);
  }
});

// Handle push notifications for new orders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'A customer has placed a new order',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'medi-mart-order',
    requireInteraction: false,
    silent: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view-orders',
        title: 'View Orders',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('New Order - Farmaci Ashila', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view-orders') {
    // Open the admin orders page
    event.waitUntil(
      clients.openWindow('/admin/orders')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - focus the existing window or open new one
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url && client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/admin/orders');
        }
      })
    );
  }
});
