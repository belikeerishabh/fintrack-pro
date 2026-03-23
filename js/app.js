/**
 * app.js — App bootstrap [FIXED v3]
 */

loadLocal();
initDateSelectors();
render();

if (DB.settings.gConnected) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
