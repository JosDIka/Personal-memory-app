/**
 * Personal Memory — Service Worker
 * Provides offline caching for static assets so the app installs on Android / desktop.
 */

const CACHE_NAME = 'personal-memory-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for everything else (API calls, etc.)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and cross-origin API calls
  if (request.method !== 'GET') return;

  // For same-origin requests: cache-first strategy
  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;

          return fetch(request).then(response => {
            // Only cache successful responses
            if (!response || response.status !== 200) return response;

            // Clone and cache the response
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });

            return response;
          });
        })
        .catch(() => {
          // Offline fallback: return index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // For cross-origin requests (Gemini API): network-only
  // The API requires a key and returns dynamic data — don't cache it
});
