/**
 * app.js — App bootstrap, PWA service worker registration
 */

// ── BOOT ──────────────────────────────────────────────────────────────────────

loadLocal();
initDateSelectors();
render();

// Auto-connect Google Sheets if previously connected
if (DB.settings.gConnected && DB.settings.gClientId) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
  loadGoogleScripts();
}

// ── SERVICE WORKER (PWA offline support) ──────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Fallback: inline blob SW if sw.js isn't found (e.g. local file:// usage)
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
