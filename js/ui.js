/**
 * ui.js — Shared UI helpers
 * Toast, modals, navigation, date selectors, utility functions
 */

// ── UTILITY ──────────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const fmt    = n  => '₹' + Math.abs(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtD   = d  => {
  if (!d) return '—';
  const x = new Date(d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};
const uid    = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const esc    = s  => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const today  = () => new Date().toISOString().split('T')[0];

function selMonth() { return parseInt(document.getElementById('monthSel').value); }
function selYear()  { return parseInt(document.getElementById('yearSel').value);  }
function inPeriod(d) {
  if (!d) return false;
  const x = new Date(d);
  return !isNaN(x) && x.getMonth() === selMonth() && x.getFullYear() === selYear();
}

function getClientName(id) {
  const c = DB.clients.find(x => x.id === id);
  return c ? c.name : (id || 'Unknown');
}

// ── TOAST ─────────────────────────────────────────────────────────────────────

function toast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = type === 'error' ? 'var(--red)' : 'var(--green)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

function openModal(id) {
  document.getElementById(id).classList.add('open');
  setDefaultDates();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function setDefaultDates() {
  const t = today();
  ['i-date','e-date','w-date','w-pdate','mp-date',
   'inv-idate','wd-date','a-buydate'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = t;
  });
}

// ── NAV ───────────────────────────────────────────────────────────────────────

let currentTab = 'income';

function switchTab(tab, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  el.classList.add('active');
  currentTab = tab;
  render();
}

function switchSub(showId, el) {
  const panel = el.closest('.panel');
  panel.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  panel.querySelectorAll('[id^="inv-"]').forEach(d => d.style.display = 'none');
  document.getElementById(showId).style.display = 'block';
}

// ── DATE SELECTORS ────────────────────────────────────────────────────────────

function initDateSelectors() {
  const ms  = document.getElementById('monthSel');
  const ys  = document.getElementById('yearSel');
  const now = new Date();

  MONTHS.forEach((m, i) => {
    const o = new Option(m, i);
    if (i === now.getMonth()) o.selected = true;
    ms.appendChild(o);
  });

  for (let y = now.getFullYear() - 4; y <= now.getFullYear() + 1; y++) {
    const o = new Option(y, y);
    if (y === now.getFullYear()) o.selected = true;
    ys.appendChild(o);
  }
}

// ── SETTINGS MODAL ────────────────────────────────────────────────────────────

function openSettings() {
  const s = DB.settings;
  document.getElementById('st-bname').value    = s.businessName   || '';
  document.getElementById('st-addr').value     = s.address        || '';
  document.getElementById('st-phone').value    = s.phone          || '';
  document.getElementById('st-email').value    = s.email          || '';
  document.getElementById('st-gstin').value    = s.gstin          || '';
  document.getElementById('st-prefix').value   = s.invoicePrefix  || 'INV';
  document.getElementById('st-clientid').value = s.gClientId      || '';
  document.getElementById('st-sheetid').value  = s.gSheetId       || '';

  const discBtn = document.getElementById('disconnectBtn');
  if (discBtn) discBtn.style.display = s.gConnected ? 'inline-flex' : 'none';

  const statusEl = document.getElementById('sheets-status');
  if (statusEl) statusEl.textContent = s.gConnected ? '✓ Connected' : '';

  openModal('m-settings');
}

function saveSettings() {
  DB.settings.businessName  = document.getElementById('st-bname').value;
  DB.settings.address       = document.getElementById('st-addr').value;
  DB.settings.phone         = document.getElementById('st-phone').value;
  DB.settings.email         = document.getElementById('st-email').value;
  DB.settings.gstin         = document.getElementById('st-gstin').value;
  DB.settings.invoicePrefix = document.getElementById('st-prefix').value || 'INV';

  const cid = document.getElementById('st-clientid').value.trim();
  const sid = document.getElementById('st-sheetid').value.trim();
  if (cid) DB.settings.gClientId = cid;
  if (sid) DB.settings.gSheetId  = sid;

  save();
  closeModal('m-settings');
  toast('Settings saved');
}

// ── DELETE ────────────────────────────────────────────────────────────────────

function del(type, id) {
  if (!confirm('Delete this entry?')) return;
  DB[type] = DB[type].filter(e => e.id !== id);
  save();
  render();
}
