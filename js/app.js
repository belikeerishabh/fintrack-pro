/**
 * app.js — Boot, PIN logic, screen routing [v6 - personal use]
 */

const YOUR_CLIENT_ID = ''; // Paste your Google OAuth Client ID here

// ── SCREEN ROUTER ─────────────────────────────────────────────────────────────
function showScreen(id) {
  ['screen-pin', 'screen-forgot-pin', 'screen-app'].forEach(s => {
    const el = document.getElementById(s);
    if (!el) return;
    el.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) target.style.display = (id === 'screen-app') ? 'block' : 'flex';
}

// ── PIN BUFFER ────────────────────────────────────────────────────────────────
let pinBuffer    = '';
let newPinBuffer = '';
let resetCode    = null;

// ── PIN ENTRY ─────────────────────────────────────────────────────────────────
function pinKey(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updateDots(pinBuffer, 'dot');
  updateEnterBtn();
  // Auto-submit when 4 digits entered
  if (pinBuffer.length === 4) setTimeout(submitPin, 200);
}

function pinBackspace() {
  if (!pinBuffer.length) return;
  pinBuffer = pinBuffer.slice(0, -1);
  updateDots(pinBuffer, 'dot');
  updateEnterBtn();
  document.getElementById('pin-error').textContent = '';
}

function updateEnterBtn() {
  const btn = document.getElementById('pin-enter-btn');
  if (!btn) return;
  btn.disabled = pinBuffer.length < 4;
}

function updateDots(val, prefix) {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`${prefix}-${i}`);
    if (!dot) continue;
    dot.classList.toggle('filled', i < val.length);
    dot.classList.remove('error');
  }
}

function submitPin() {
  if (!pinBuffer || pinBuffer.length < 4) return;
  if (hashPin(pinBuffer) === DB.settings.pin) {
    // Correct PIN — open app
    pinBuffer = '';
    updateDots('', 'dot');
    updateEnterBtn();
    showScreen('screen-app');
  } else {
    // Wrong PIN — shake red, clear, let retry
    for (let i = 0; i < 4; i++) {
      const d = document.getElementById(`dot-${i}`);
      if (d) { d.classList.remove('filled'); d.classList.add('error'); }
    }
    document.getElementById('pin-error').textContent = 'Incorrect PIN. Try again.';
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        const d = document.getElementById(`dot-${i}`);
        if (d) d.classList.remove('error');
      }
      document.getElementById('pin-error').textContent = '';
    }, 900);
    pinBuffer = '';
    updateEnterBtn();
  }
}

// ── NEW PIN ENTRY (forgot PIN flow) ──────────────────────────────────────────
function newPinKey(digit) {
  if (newPinBuffer.length >= 4) return;
  newPinBuffer += digit;
  updateDots(newPinBuffer, 'ndot');
  if (newPinBuffer.length === 4) setTimeout(saveNewPin, 150);
}

function newPinBackspace() {
  newPinBuffer = newPinBuffer.slice(0, -1);
  updateDots(newPinBuffer, 'ndot');
}

function saveNewPin() {
  DB.settings.pin        = hashPin(newPinBuffer);
  DB.settings.pinEnabled = true;
  newPinBuffer = '';
  resetCode    = null;
  saveLocal();
  showScreen('screen-app');
  toast('✓ New PIN set successfully!');
}

// ── KEYBOARD SUPPORT ──────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const pinVisible    = document.getElementById('screen-pin')?.style.display === 'flex';
  const forgotVisible = document.getElementById('screen-forgot-pin')?.style.display === 'flex';
  const step3Visible  = document.getElementById('forgot-step-3')?.style.display !== 'none';

  if (pinVisible) {
    if (e.key >= '0' && e.key <= '9') pinKey(e.key);
    if (e.key === 'Backspace') pinBackspace();
  }
  if (forgotVisible && step3Visible) {
    if (e.key >= '0' && e.key <= '9') newPinKey(e.key);
    if (e.key === 'Backspace') newPinBackspace();
  }
});

// ── FORGOT PIN ────────────────────────────────────────────────────────────────
function openForgotPin() {
  resetCode    = null;
  newPinBuffer = '';
  document.getElementById('forgot-step-1').style.display = 'block';
  document.getElementById('forgot-step-2').style.display = 'none';
  document.getElementById('forgot-step-3').style.display = 'none';
  document.getElementById('forgot-error').textContent      = '';
  document.getElementById('send-code-status').textContent  = '';
  document.getElementById('forgot-email-display').textContent = DB.settings.email || 'your connected Gmail';
  document.getElementById('send-code-btn').disabled = false;
  updateDots('', 'ndot');
  showScreen('screen-forgot-pin');
}

async function sendResetCode() {
  const email = DB.settings.email;
  if (!email) {
    document.getElementById('forgot-error').textContent = 'No email found. Add your email in ⚙ Settings first.';
    return;
  }
  if (!gToken) {
    document.getElementById('forgot-error').textContent = 'Not connected to Google. Open app → ⚙ Settings → Connect Google Sheets first.';
    return;
  }

  resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById('send-code-btn').disabled = true;
  document.getElementById('send-code-status').textContent = 'Sending code…';
  document.getElementById('forgot-error').textContent = '';

  const msgBody = `Your FinTrack Pro PIN reset code is:\n\n${resetCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.\n\n— FinTrack Pro`;
  const raw = btoa(unescape(encodeURIComponent(
    `To: ${email}\nSubject: FinTrack Pro — PIN Reset Code\nContent-Type: text/plain; charset=utf-8\n\n${msgBody}`
  ))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const res  = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method:  'POST',
      headers: { Authorization: `Bearer ${gToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ raw }),
    });
    const data = await res.json();
    if (data.id) {
      document.getElementById('send-code-status').textContent = '✓ Code sent to ' + email;
      setTimeout(() => {
        document.getElementById('forgot-step-1').style.display = 'none';
        document.getElementById('forgot-step-2').style.display = 'block';
        document.getElementById('reset-code-input').value = '';
        document.getElementById('reset-code-input').focus();
      }, 1000);
      // Expire after 10 min
      setTimeout(() => { resetCode = null; }, 10 * 60 * 1000);
    } else {
      throw new Error(data.error?.message || 'Failed to send');
    }
  } catch (err) {
    document.getElementById('forgot-error').textContent = 'Error: ' + err.message;
    document.getElementById('send-code-btn').disabled = false;
  }
}

function verifyResetCode() {
  const entered = document.getElementById('reset-code-input').value.trim();
  if (!resetCode) {
    document.getElementById('forgot-error').textContent = 'Code expired. Please request a new one.';
    return;
  }
  if (entered === resetCode) {
    document.getElementById('forgot-step-2').style.display = 'none';
    document.getElementById('forgot-step-3').style.display = 'block';
    document.getElementById('forgot-error').textContent = '';
    newPinBuffer = '';
    updateDots('', 'ndot');
  } else {
    document.getElementById('forgot-error').textContent = 'Incorrect code. Try again.';
    document.getElementById('reset-code-input').value = '';
    document.getElementById('reset-code-input').focus();
  }
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
loadLocal();

// Set your Client ID here once (or enter it in ⚙ Settings)
if (YOUR_CLIENT_ID && !DB.settings.gClientId) {
  DB.settings.gClientId = YOUR_CLIENT_ID;
  saveLocal();
}

initDateSelectors();
render();

// Show correct screen on load
if (DB.settings.pinEnabled && DB.settings.pin) {
  showScreen('screen-pin');
  pinBuffer = '';
  // Disable enter button until 4 digits entered
  setTimeout(() => updateEnterBtn(), 100);
} else {
  showScreen('screen-app');
}

// Restore Google connection if previously connected
if (DB.settings.gConnected) {
  setSyncBadge('syncing');
  document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
}

// PWA service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
