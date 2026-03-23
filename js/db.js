/**
 * db.js — Data model, localStorage persistence
 */

const DKEY = 'fintrack_pro_v3';

let DB = {
  settings: {
    businessName: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    invoicePrefix: 'INV',
    nextInvNo: 1,
    gClientId: '',
    gSheetId: '',
    gConnected: false,
  },
  income:      [],
  expenses:    [],
  clients:     [],
  ledger:      [],
  assets:      [],
  investments: [],
  withdrawals: [],
};

function loadLocal() {
  const raw = localStorage.getItem(DKEY);
  if (raw) {
    try { DB = JSON.parse(raw); } catch (e) { console.warn('DB parse error', e); }
  }
}

function saveLocal() {
  localStorage.setItem(DKEY, JSON.stringify(DB));
}

function save() {
  saveLocal();
  if (DB.settings.gConnected && gToken) scheduleSheetSync();
}
