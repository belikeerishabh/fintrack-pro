/**
 * sync.js — Google Sheets OAuth + API [v6]
 */

let gToken      = null;
let tokenClient = null;
let syncTimer   = null;

const SHEET_MAPS = {
  income:      { sheet: '💰 Income',      cols: ['date','fromWhom','category','method','bankId','amount','notes'], startRow: 5 },
  expenses:    { sheet: '💸 Expenses',    cols: ['date','desc','category','method','bankId','amount','notes'],    startRow: 5 },
  clients:     { sheet: '👤 Clients',     cols: ['_cid','name','phone','email','address','gstin','notes'],         startRow: 5 },
  ledger:      { sheet: '📋 Ledger',      cols: ['_lid','date','clientName','workDetail','qty','unitPrice','price','invoiceNo','status','paidDate','paidMethod','paidBankId','notes'], startRow: 5 },
  assets:      { sheet: '🏆 Assets',      cols: ['_aid','name','type','qty','unit','buyPrice','buyDate','currentPrice','_bv','_cv','_gl','_gp','notes'], startRow: 5 },
  investments: { sheet: '📈 Investments', cols: ['_iid','date','name','type','amount','currentValue','_gl','_gp','notes'], startRow: 5 },
  withdrawals: { sheet: '🏧 Withdrawals', cols: ['_wid','date','name','reason','amount','notes'],                  startRow: 5 },
};

function dbRowToSheetRow(type, entry) {
  return SHEET_MAPS[type].cols.map(c => c.startsWith('_') ? '' : (entry[c] ?? ''));
}
function sheetRowToDbRow(type, row) {
  const obj = { id: uid() };
  SHEET_MAPS[type].cols.forEach((c, i) => { if (!c.startsWith('_')) obj[c] = row[i] ?? ''; });
  if (type === 'ledger') obj.paid = (obj.status === 'Paid');
  return obj;
}
function colLetter(n) {
  let s = ''; while (n > 0) { s = String.fromCharCode(64 + (n % 26 || 26)) + s; n = Math.floor((n - 1) / 26); } return s;
}
async function sheetsRequest(method, range, body = null) {
  const sid  = DB.settings.gSheetId;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sid}`;
  const url  = method === 'GET'
    ? `${base}/values/${encodeURIComponent(range)}?majorDimension=ROWS`
    : `${base}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const opts = { method, headers: { Authorization: `Bearer ${gToken}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  return (await fetch(url, opts)).json();
}
async function pushToSheets() {
  if (!gToken || !DB.settings.gSheetId) return;
  for (const type of Object.keys(SHEET_MAPS)) {
    const m    = SHEET_MAPS[type];
    const rows = DB[type].map(e => dbRowToSheetRow(type, e));
    while (rows.length < 200) rows.push(Array(m.cols.length).fill(''));
    const range = `${m.sheet}!B${m.startRow}:${colLetter(m.cols.length)}${m.startRow + rows.length - 1}`;
    await sheetsRequest('PUT', range, { range, majorDimension: 'ROWS', values: rows });
  }
  setSyncBadge('connected');
}
async function loadFromSheets() {
  if (!gToken || !DB.settings.gSheetId) return;
  for (const type of Object.keys(SHEET_MAPS)) {
    const m     = SHEET_MAPS[type];
    const range = `${m.sheet}!B${m.startRow}:${colLetter(m.cols.length)}${m.startRow + 299}`;
    const resp  = await sheetsRequest('GET', range);
    if (resp.values) {
      DB[type] = resp.values
        .filter(r => r.some(c => c && c.toString().trim() !== ''))
        .map(r => sheetRowToDbRow(type, r));
    }
  }
  saveLocal(); render();
}
function scheduleSheetSync() {
  clearTimeout(syncTimer);
  setSyncBadge('syncing');
  syncTimer = setTimeout(() => pushToSheets(), 2000);
}
async function sheetsManualSync() {
  if (!gToken) { toast('Not connected to Google Sheets', 'error'); return; }
  setSyncBadge('syncing');
  await pushToSheets();
  await loadFromSheets();
  setSyncBadge('connected');
  toast('✓ Synced with Google Sheets');
}

// ── OAUTH ─────────────────────────────────────────────────────────────────────
function gapiLoaded() {
  gapi.load('client', () => {
    gapi.client.init({}).then(() => {
      // Auto-reconnect silently if previously connected
      if (DB.settings.gConnected && DB.settings.gClientId) {
        buildTokenClient(true);
      }
    });
  });
}

function buildTokenClient(silent = false) {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    setTimeout(() => buildTokenClient(silent), 400);
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: DB.settings.gClientId,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.send',
    ].join(' '),
    callback: async (resp) => {
      if (resp.error) {
        toast('Sign-in failed: ' + resp.error, 'error');
        setSyncBadge('disconnected');
        const st = document.getElementById('sheets-status');
        if (st) st.textContent = '✗ Sign-in failed';
        return;
      }
      gToken = resp.access_token;
      DB.settings.gConnected = true;
      saveLocal();
      setSyncBadge('syncing');
      await loadFromSheets();
      setSyncBadge('connected');
      const syncBtn  = document.getElementById('sheetsSyncBtn');
      const discBtn  = document.getElementById('disconnectBtn');
      const statusEl = document.getElementById('sheets-status');
      if (syncBtn)  syncBtn.style.display  = 'inline-flex';
      if (discBtn)  discBtn.style.display  = 'inline-flex';
      if (statusEl) statusEl.textContent   = '✓ Connected to Google Sheets';
      toast('✓ Google Sheets connected');
    },
  });
  tokenClient.requestAccessToken({ prompt: silent ? '' : 'consent' });
}

function connectGSheets() {
  const cid = document.getElementById('st-clientid').value.trim();
  const sid = document.getElementById('st-sheetid').value.trim();
  if (!cid) { toast('Enter your Google Client ID', 'error'); return; }
  if (!sid) { toast('Enter your Google Sheet ID',  'error'); return; }
  DB.settings.gClientId = cid;
  DB.settings.gSheetId  = sid;
  saveLocal();
  const st = document.getElementById('sheets-status');
  if (st) st.textContent = 'Connecting…';
  buildTokenClient(false);
}

function disconnectGSheets() {
  gToken = null;
  DB.settings.gConnected = false;
  saveLocal();
  setSyncBadge('disconnected');
  const discBtn  = document.getElementById('disconnectBtn');
  const syncBtn  = document.getElementById('sheetsSyncBtn');
  const statusEl = document.getElementById('sheets-status');
  if (discBtn)  discBtn.style.display  = 'none';
  if (syncBtn)  syncBtn.style.display  = 'none';
  if (statusEl) statusEl.textContent   = '';
  toast('Disconnected from Google Sheets');
}

function setSyncBadge(state) {
  const b = document.getElementById('syncBadge');
  if (!b) return;
  b.className   = 'sync-badge ' + state;
  b.textContent = state === 'connected' ? '☁ Synced'
                : state === 'syncing'   ? '↻ Syncing…'
                                        : '☁ Not Synced';
}
