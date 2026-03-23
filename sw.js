/**
 * sw.js — Service Worker for offline PWA support
 * Caches all app files on install, serves from cache on fetch.
 */

const CACHE_NAME = 'fintrack-pro-v1';

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
  './assets/icon-192.svg',
  './assets/icon-512.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
