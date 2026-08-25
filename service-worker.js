// service-worker.js - Dynamic versioning with your file list
const CACHE_VERSION = 'v1.0.2'; // ⚠️ CHANGE THIS NUMBER (e.g., to v2.0.2) EVERY TIME YOU UPDATE YOUR APP
const CACHE_NAME = `iraqi-teaching-hospital-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './Home.html',
  './admin.html',
  './index.html',
  './s.html',
  './manifest.webmanifest',
  './pwa.js',
  './pwa-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        // Forces the new service worker to activate immediately
        self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[Service Worker] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // Takes control of all open pages immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
