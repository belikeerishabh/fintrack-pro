/**
 * db.js — Data model + localStorage [v4]
 */

const DKEY = 'fintrack_pro_v4';

let DB = {
  settings: {
    businessName: 'Rishabh Sacheti',
    businessTitle: 'Freelance Graphic Designer',
    address: '',
    phone: '+91 8302786214',
    email: 'sacheti.rishabh.09@gmail.com',
    gstin: '',
    pan: '',
    invoicePrefix: 'INV',
    nextInvNo: 1,
    gClientId: '',
    gSheetId: '',
    gConnected: false,
    pin: '',
    pinEnabled: false,
  },
  banks: [
    { id: 'cash', name: 'Cash', type: 'Cash', accountNo: '', ifsc: '', openingBalance: 0 },
  ],
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
    try {
      const parsed = JSON.parse(raw);
      // Deep merge to preserve new default fields
      DB = { ...DB, ...parsed };
      DB.settings = { ...DB.settings, ...(parsed.settings || {}) };
      if (!DB.banks || !DB.banks.length) {
        DB.banks = [{ id: 'cash', name: 'Cash', type: 'Cash', accountNo: '', ifsc: '', openingBalance: 0 }];
      }
    } catch (e) { console.warn('DB parse error', e); }
  }
}

function saveLocal() {
  localStorage.setItem(DKEY, JSON.stringify(DB));
}

function save() {
  saveLocal();
  if (DB.settings.gConnected && gToken) scheduleSheetSync();
}
