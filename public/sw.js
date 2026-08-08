/**
 * Personal Memory — Service Worker
 * Network-first strategy so deployments show fresh content immediately.
 * Falls back to cache only when offline.
 */

const CACHE_NAME = 'personal-memory-v4';
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

// Activate: clean up ALL old caches immediately and take control
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

// Fetch: NETWORK-FIRST for all same-origin requests.
// This ensures fresh content after every deploy — no more blank screens.
// Falls back to cache only when the network is unavailable (offline support).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and cross-origin API calls (Gemini, Google Fonts, etc.)
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Got a fresh response — cache it for offline use
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache (offline fallback)
        return caches.match(request).then(cached => {
          return cached || caches.match('/index.html');
        });
      })
  );
});
