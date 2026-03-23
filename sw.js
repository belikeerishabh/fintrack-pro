/**
 * sw.js — Service Worker [v7 - cache busted]
 */
const CACHE_NAME = 'fintrack-pro-v7';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/db.js',
  './js/sync.js',
  './js/excel.js',
  './js/ui.js',
  './js/income.js',
  './js/expenses.js',
  './js/ledger.js',
  './js/invoice.js',
  './js/assets.js',
  './js/investments.js',
  './js/render.js',
  './js/modals.js',
  './js/app.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete ALL old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first, cache fallback — always gets fresh files
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
