/**
 * db.js — Data model + localStorage [v5]
 */

const DKEY = 'fintrack_pro_v5';

let DB = {
  settings: {
    businessName:  '',
    businessTitle: 'Freelance Graphic Designer',
    address:       '',
    phone:         '',
    email:         '',
    gstin:         '',
    pan:           '',
    invoicePrefix: 'INV',
    nextInvNo:     1,
    gClientId:     '',
    gSheetId:      '',
    gConnected:    false,
    gUserEmail:    '',   // logged-in Google email
    gUserName:     '',   // logged-in Google name
    pinEnabled:    false,
    pin:           '',   // hashed PIN
    onboardingDone: false,
  },
  banks: [
    { id: 'cash', name: 'Cash', type: 'Cash', accountNumber: '', ifsc: '', openingBalance: 0 },
  ],
  income:      [],
  expenses:    [],
  clients:     [],
  ledger:      [],
  assets:      [],
  investments: [],
  withdrawals: [],
  invoices: [],     // saved invoice records
};

function loadLocal() {
  const raw = localStorage.getItem(DKEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      DB = { ...DB, ...parsed, settings: { ...DB.settings, ...parsed.settings } };
      if (!DB.banks || !DB.banks.length) {
        DB.banks = [{ id: 'cash', name: 'Cash', type: 'Cash', accountNumber: '', ifsc: '', openingBalance: 0 }];
      }
    } catch (e) { console.warn('DB parse error', e); }
  }
}

function saveLocal() { localStorage.setItem(DKEY, JSON.stringify(DB)); }

function save() {
  saveLocal();
  if (DB.settings.gConnected && gToken) scheduleSheetSync();
}

// Simple PIN hash
function hashPin(pin) {
  let h = 0;
  for (let i = 0; i < pin.length; i++) h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  return h.toString(36);
}

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── INVOICE NUMBERING ─────────────────────────────────────────────────────────
// Format: INV + YY + MM + seq (e.g. INV260301 = year 26, month 03, invoice #01)
function generateInvoiceNumber() {
  const now   = new Date();
  const yy    = String(now.getFullYear()).slice(2);
  const mm    = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = (DB.settings.invoicePrefix || 'INV') + yy + mm;

  // Count invoices already generated this month
  const thisMonth = DB.invoices.filter(inv => inv.invNo.startsWith(prefix));
  const seq = String(thisMonth.length + 1).padStart(2, '0');
  return prefix + seq;
}
