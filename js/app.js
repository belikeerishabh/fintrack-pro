/**
 * app.js [v4] — Boot + PIN check + PWA
 */
loadLocal();
initDateSelectors();
render();

// PIN check on load
if (DB.settings.pinEnabled && DB.settings.pin) {
  showPinScreen();
} else {
  hidePinScreen();
}

if (DB.settings.gConnected) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
