/**
 * app.js — App bootstrap, PWA service worker registration [FIXED v2]
 */

// ── BOOT ──────────────────────────────────────────────────────────────────────

loadLocal();
initDateSelectors();
render();

// ALWAYS load Google scripts on page load so "Connect" works first time
loadGoogleScripts();

// Show sync button if previously connected
if (DB.settings.gConnected) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
}

// ── SERVICE WORKER ────────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    const swCode = `
      const CACHE = 'fintrack-v1';
      self.addEventListener('install', e =>
        e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])))
      );
      self.addEventListener('fetch', e =>
        e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
      );
    `;
    navigator.serviceWorker.register(
      URL.createObjectURL(new Blob([swCode], { type: 'application/javascript' }))
    ).catch(() => {});
  });
}
