/**
 * sync.js — Google Sheets OAuth + Sheets API [FIXED v3]
 */

let gToken      = null;
let tokenClient = null;
let syncTimer   = null;

const SHEET_MAPS = {
  income:      { sheet: '💰 Income',      cols: ['date','fromWhom','category','method','account','amount','notes'], startRow: 5 },
  expenses:    { sheet: '💸 Expenses',    cols: ['date','desc','category','method','account','amount','notes'],    startRow: 5 },
  clients:     { sheet: '👤 Clients',     cols: ['_cid','name','phone','email','address','gstin','notes'],         startRow: 5 },
  ledger:      { sheet: '📋 Ledger',      cols: ['_lid','date','clientName','workDetail','price','invoiceNo','status','paidDate','paidMethod','notes'], startRow: 5 },
  assets:      { sheet: '🏆 Assets',      cols: ['_aid','name','type','qty','unit','buyPrice','buyDate','currentPrice','_bv','_cv','_gl','_gp','notes'], startRow: 5 },
  investments: { sheet: '📈 Investments', cols: ['_iid','date','name','type','amount','currentValue','_gl','_gp','notes'], startRow: 5 },
  withdrawals: { sheet: '🏧 Withdrawals', cols: ['_wid','date','name','reason','amount','notes'],                  startRow: 5 },
};

function dbRowToSheetRow(type, entry) {
  return SHEET_MAPS[type].cols.map(c => c.startsWith('_') ? '' : (entry[c] ?? ''));
}

function sheetRowToDbRow(type, row) {
  const obj = { id: uid() };
  SHEET_MAPS[type].cols.forEach((c, i) => {
    if (!c.startsWith('_')) obj[c] = row[i] ?? '';
  });
  if (type === 'ledger') obj.paid = (obj.status === 'Paid');
  return obj;
}

function colLetter(n) {
  let s = '';
  while (n > 0) { s = String.fromCharCode(64 + (n % 26 || 26)) + s; n = Math.floor((n - 1) / 26); }
  return s;
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
  saveLocal();
  render();
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

// Called by Google GSI script once it finishes loading (see index.html)
function gapiLoaded() {
  gapi.load('client', () => {
    gapi.client.init({}).then(() => {
      // Auto reconnect if previously connected
      if (DB.settings.gConnected && DB.settings.gClientId) {
        buildTokenClient(DB.settings.gClientId, true);
      }
    });
  });
}

function buildTokenClient(clientId, silent = false) {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: async (resp) => {
      if (resp.error) {
        toast('Sign-in failed: ' + resp.error, 'error');
        setSyncBadge('disconnected');
        document.getElementById('sheets-status').textContent = '✗ Failed: ' + resp.error;
        return;
      }
      gToken = resp.access_token;
      DB.settings.gConnected = true;
      saveLocal();
      setSyncBadge('syncing');
      await loadFromSheets();
      setSyncBadge('connected');
      document.getElementById('disconnectBtn').style.display = 'inline-flex';
      document.getElementById('sheetsSyncBtn').style.display = 'inline-flex';
      document.getElementById('sheets-status').textContent   = '✓ Connected to Google Sheets';
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
  document.getElementById('sheets-status').textContent = 'Opening Google sign-in…';
  buildTokenClient(cid, false);
}

function disconnectGSheets() {
  gToken = null;
  DB.settings.gConnected = false;
  saveLocal();
  setSyncBadge('disconnected');
  document.getElementById('disconnectBtn').style.display = 'none';
  document.getElementById('sheetsSyncBtn').style.display = 'none';
  document.getElementById('sheets-status').textContent   = '';
  toast('Disconnected from Google Sheets');
}

function setSyncBadge(state) {
  const b = document.getElementById('syncBadge');
  b.className   = 'sync-badge ' + state;
  b.textContent = state === 'connected' ? '☁ Synced' : state === 'syncing' ? '↻ Syncing…' : '☁ Not Synced';
}

// Dummy — scripts now loaded in HTML directly, not dynamically
function loadGoogleScripts() {}
