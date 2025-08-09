const CACHE_NAME = 'pallab-saha-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/assets/PallabSaha.webp',
  '/assets/Cognizant.svg',
  '/assets/IIT-Jodhpur-logo.webp',
  '/assets/Makaut.jpg',
  '/assets/DESC.png',
  '/assets/igmhs.png',
  '/assets/jds.jpg'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update cache when service worker is updated
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
