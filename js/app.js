/**
 * app.js — Boot [v7 - no PIN]
 */

const YOUR_CLIENT_ID = ''; // Paste your Google OAuth Client ID here if needed

// ── SCREEN ROUTER ─────────────────────────────────────────────────────────────
function showScreen(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
loadLocal();

if (YOUR_CLIENT_ID && !DB.settings.gClientId) {
  DB.settings.gClientId = YOUR_CLIENT_ID;
  saveLocal();
}

initDateSelectors();
render();

// Go straight to app — no PIN
document.getElementById('screen-app').style.display = 'block';

if (DB.settings.gConnected) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
}

// PWA service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
