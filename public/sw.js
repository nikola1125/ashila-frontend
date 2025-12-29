// Background service worker for keeping the app responsive
const CACHE_NAME = 'ashila-pharmacy-v1';
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
