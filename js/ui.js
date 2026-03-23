/**
 * ui.js — Shared UI helpers [v4]
 */

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const fmt    = n  => '₹' + Math.abs(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtD   = d  => {
  if (!d) return '—';
  const x = new Date(d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};
const fmtFull = d => {
  if (!d) return '';
  const x = new Date(d);
  return isNaN(x) ? String(d) : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
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

function getBankName(id) {
  if (!id) return '—';
  const b = DB.banks.find(x => x.id === id);
  return b ? b.name : id;
}

// Populate a <select> with banks
function populateBankSelect(elId, selectedId = '') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<option value="">— Select —</option>' +
    DB.banks.map(b => `<option value="${b.id}" ${b.id === selectedId ? 'selected' : ''}>${b.name} (${b.type})</option>`).join('');
}

// Number to words (Indian system)
function numberToWords(n) {
  if (n === 0) return 'Zero Rupees';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function words(num) {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' ' + words(num%100) : '');
    if (num < 100000) return words(Math.floor(num/1000)) + ' Thousand' + (num%1000 ? ' ' + words(num%1000) : '');
    if (num < 10000000) return words(Math.floor(num/100000)) + ' Lakh' + (num%100000 ? ' ' + words(num%100000) : '');
    return words(Math.floor(num/10000000)) + ' Crore' + (num%10000000 ? ' ' + words(num%10000000) : '');
  }
  const rupees = Math.floor(n);
  const paise  = Math.round((n - rupees) * 100);
  let result = words(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + words(paise) + ' Paise';
  return result + ' Only';
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
  ['i-date','e-date','w-date','w-pdate','mp-date','inv-idate','wd-date','a-buydate'].forEach(id => {
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
  const ms = document.getElementById('monthSel');
  const ys = document.getElementById('yearSel');
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

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function openSettings() {
  const s = DB.settings;
  document.getElementById('st-bname').value    = s.businessName   || '';
  document.getElementById('st-btitle').value   = s.businessTitle  || '';
  document.getElementById('st-addr').value     = s.address        || '';
  document.getElementById('st-phone').value    = s.phone          || '';
  document.getElementById('st-email').value    = s.email          || '';
  document.getElementById('st-gstin').value    = s.gstin          || '';
  document.getElementById('st-pan').value      = s.pan            || '';
  document.getElementById('st-prefix').value   = s.invoicePrefix  || 'INV';
  document.getElementById('st-clientid').value = s.gClientId      || '';
  document.getElementById('st-sheetid').value  = s.gSheetId       || '';
  document.getElementById('st-pin-enabled').checked = s.pinEnabled || false;

  const discBtn = document.getElementById('disconnectBtn');
  if (discBtn) discBtn.style.display = s.gConnected ? 'inline-flex' : 'none';
  const statusEl = document.getElementById('sheets-status');
  if (statusEl) statusEl.textContent = s.gConnected ? '✓ Connected' : '';

  renderBankList();
  openModal('m-settings');
}

function saveSettings() {
  DB.settings.businessName  = document.getElementById('st-bname').value;
  DB.settings.businessTitle = document.getElementById('st-btitle').value;
  DB.settings.address       = document.getElementById('st-addr').value;
  DB.settings.phone         = document.getElementById('st-phone').value;
  DB.settings.email         = document.getElementById('st-email').value;
  DB.settings.gstin         = document.getElementById('st-gstin').value;
  DB.settings.pan           = document.getElementById('st-pan').value;
  DB.settings.invoicePrefix = document.getElementById('st-prefix').value || 'INV';
  DB.settings.pinEnabled    = document.getElementById('st-pin-enabled').checked;

  const cid = document.getElementById('st-clientid').value.trim();
  const sid = document.getElementById('st-sheetid').value.trim();
  if (cid) DB.settings.gClientId = cid;
  if (sid) DB.settings.gSheetId  = sid;

  save();
  closeModal('m-settings');
  toast('Settings saved');
}

// ── BANKS ─────────────────────────────────────────────────────────────────────
function addBank() {
  const name = document.getElementById('b-name').value.trim();
  if (!name) { toast('Enter bank name', 'error'); return; }
  DB.banks.push({
    id:             uid(),
    name,
    type:           document.getElementById('b-type').value,
    accountNo:      document.getElementById('b-accno').value.trim(),
    ifsc:           document.getElementById('b-ifsc').value.trim(),
    openingBalance: parseFloat(document.getElementById('b-opening').value) || 0,
  });
  save();
  renderBankList();
  toast('Bank added');
  ['b-name','b-accno','b-ifsc','b-opening'].forEach(id => document.getElementById(id).value = '');
}

function deleteBank(id) {
  if (!confirm('Remove this bank?')) return;
  DB.banks = DB.banks.filter(b => b.id !== id);
  save(); renderBankList();
}

function renderBankList() {
  const bl = document.getElementById('bankList');
  if (!bl) return;
  bl.innerHTML = DB.banks.map(b => `
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--s2);border-radius:6px;padding:9px 12px;margin-bottom:6px">
      <div>
        <span style="font-weight:600;font-size:13px">🏦 ${esc(b.name)}</span>
        <span class="badge bm" style="margin-left:8px">${b.type}</span>
        ${b.accountNo ? `<span style="font-size:11px;color:var(--muted);margin-left:8px">···${b.accountNo.slice(-4)}</span>` : ''}
        ${b.openingBalance ? `<span style="font-size:11px;color:var(--gold);margin-left:8px">Opening: ${fmt(b.openingBalance)}</span>` : ''}
      </div>
      ${b.id !== 'cash' ? `<button class="btn btn-red btn-xs" onclick="deleteBank('${b.id}')">✕</button>` : ''}
    </div>`).join('');
}

// ── PIN LOCK ──────────────────────────────────────────────────────────────────
function showPinScreen() {
  document.getElementById('pin-screen').style.display = 'flex';
  document.getElementById('app-content').style.display = 'none';
  document.getElementById('pin-display').textContent = '';
  document.getElementById('pin-error').textContent = '';
  window._pinEntry = '';
}

function hidePinScreen() {
  document.getElementById('pin-screen').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
}

function pinKey(val) {
  if (window._pinEntry === undefined) window._pinEntry = '';
  if (val === 'del') {
    window._pinEntry = window._pinEntry.slice(0, -1);
  } else if (window._pinEntry.length < 4) {
    window._pinEntry += val;
  }
  document.getElementById('pin-display').textContent = '●'.repeat(window._pinEntry.length) + '○'.repeat(4 - window._pinEntry.length);
  if (window._pinEntry.length === 4) {
    setTimeout(() => checkPin(), 200);
  }
}

function checkPin() {
  if (window._pinEntry === DB.settings.pin) {
    hidePinScreen();
  } else {
    document.getElementById('pin-error').textContent = 'Wrong PIN. Try again.';
    window._pinEntry = '';
    document.getElementById('pin-display').textContent = '○○○○';
  }
}

function setupPin() {
  const p1 = document.getElementById('new-pin').value;
  const p2 = document.getElementById('confirm-pin').value;
  if (p1.length !== 4 || !/^\d{4}$/.test(p1)) { toast('PIN must be exactly 4 digits', 'error'); return; }
  if (p1 !== p2) { toast('PINs do not match', 'error'); return; }
  DB.settings.pin = p1;
  DB.settings.pinEnabled = true;
  document.getElementById('st-pin-enabled').checked = true;
  save();
  closeModal('m-pin-setup');
  toast('PIN set successfully ✓');
}

// ── DELETE ────────────────────────────────────────────────────────────────────
function del(type, id) {
  if (!confirm('Delete this entry?')) return;
  DB[type] = DB[type].filter(e => e.id !== id);
  save(); render();
}
