/**
 * modals.js [v4] — All modal HTML
 */
document.getElementById('modals-container').innerHTML = `

<!-- ADD INCOME -->
<div class="modal-overlay" id="m-income">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Income</div><button class="modal-close" onclick="closeModal('m-income')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Date</label><input id="i-date" type="date"/></div>
    <div class="field"><label>From Whom</label><input id="i-from" type="text" placeholder="e.g. Papa, Rahul Client…"/></div>
    <div class="field"><label>Category</label><select id="i-cat"><option>Freelance Project</option><option>Advance Payment</option><option>Family / Personal</option><option>Rental</option><option>Investment Return</option><option>Gift</option><option>Refund</option><option>Other</option></select></div>
    <div class="field"><label>Amount (₹)</label><input id="i-amt" type="number" placeholder="0" min="0"/></div>
    <div class="field"><label>Payment Method</label><select id="i-method"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>RTGS</option><option>Cash</option><option>Cheque</option><option>Other</option></select></div>
    <div class="field"><label>Bank / Account</label><select id="i-bank"></select></div>
    <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="i-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-income')">Cancel</button><button class="btn btn-gold" onclick="addIncome();populateBankSelect('i-bank')">Save</button></div></div>
</div>

<!-- ADD EXPENSE -->
<div class="modal-overlay" id="m-expense">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Expense</div><button class="modal-close" onclick="closeModal('m-expense')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Date</label><input id="e-date" type="date"/></div>
    <div class="field"><label>Description</label><input id="e-desc" type="text" placeholder="e.g. Groceries, Rent…"/></div>
    <div class="field"><label>Category</label><select id="e-cat"><option>Food & Dining</option><option>Rent / Housing</option><option>Transport</option><option>Utilities</option><option>Software / Tools</option><option>Healthcare</option><option>Entertainment</option><option>Shopping</option><option>Education</option><option>EMI / Loan</option><option>Business Expense</option><option>Other</option></select></div>
    <div class="field"><label>Amount (₹)</label><input id="e-amt" type="number" placeholder="0" min="0"/></div>
    <div class="field"><label>Payment Method</label><select id="e-method"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option><option>Debit Card</option><option>Credit Card</option><option>Cheque</option><option>Other</option></select></div>
    <div class="field"><label>Bank / Account</label><select id="e-bank"></select></div>
    <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="e-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-expense')">Cancel</button><button class="btn btn-gold" onclick="addExpense()">Save</button></div></div>
</div>

<!-- ADD CLIENT -->
<div class="modal-overlay" id="m-client">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Client</div><button class="modal-close" onclick="closeModal('m-client')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field" style="grid-column:1/-1"><label>Client Name *</label><input id="cl-name" type="text" placeholder="Client or company name"/></div>
    <div class="field"><label>Phone</label><input id="cl-phone" type="text" placeholder="+91 xxxxx"/></div>
    <div class="field"><label>Email</label><input id="cl-email" type="email" placeholder="client@email.com"/></div>
    <div class="field" style="grid-column:1/-1"><label>Address</label><input id="cl-addr" type="text" placeholder="Address"/></div>
    <div class="field"><label>GSTIN</label><input id="cl-gstin" type="text" placeholder="GST number (if any)"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-client')">Cancel</button><button class="btn btn-gold" onclick="addClient()">Save Client</button></div></div>
</div>

<!-- ADD/EDIT WORK -->
<div class="modal-overlay" id="m-work">
  <div class="modal"><div class="modal-hdr"><div class="modal-title" id="workModalTitle">Add Work Entry</div><button class="modal-close" onclick="closeModal('m-work')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Date</label><input id="w-date" type="date"/></div>
    <div class="field"><label>Invoice No <span class="field-hint">fill later if needed</span></label><input id="w-invno" type="text" placeholder="e.g. INV-001"/></div>
    <div class="field" style="grid-column:1/-1"><label>Work Detail *</label><textarea id="w-detail" placeholder="Describe the work done…"></textarea></div>
    <div class="field"><label>Price (₹)</label><input id="w-price" type="number" placeholder="0"/></div>
    <div class="field"><label>Status</label><select id="w-status" onchange="togglePayFields()"><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></div>
    <div id="w-payfields" style="display:none;grid-column:1/-1">
      <div class="form-grid" style="grid-template-columns:1fr 1fr;background:rgba(61,188,130,.05);border:1px solid rgba(61,188,130,.2);padding:12px;border-radius:8px;margin-top:0">
        <div class="field"><label>Payment Date</label><input id="w-pdate" type="date"/></div>
        <div class="field"><label>Method</label><select id="w-pmethod"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option><option>Cheque</option><option>Other</option></select></div>
        <div class="field" style="grid-column:1/-1"><label>Bank Received In</label><select id="w-pbank"></select></div>
      </div>
    </div>
    <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="w-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-work')">Cancel</button><button class="btn btn-gold" onclick="saveWork()">Save</button></div></div>
</div>

<!-- MARK PAID -->
<div class="modal-overlay" id="m-markpaid">
  <div class="modal" style="max-width:400px"><div class="modal-hdr"><div class="modal-title">Mark as Paid</div><button class="modal-close" onclick="closeModal('m-markpaid')">✕</button></div>
  <div class="modal-body">
    <input type="hidden" id="mp-id"/>
    <div class="form-grid" style="grid-template-columns:1fr 1fr">
      <div class="field"><label>Payment Date</label><input id="mp-date" type="date"/></div>
      <div class="field"><label>Method</label><select id="mp-method"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option><option>Cheque</option><option>Other</option></select></div>
      <div class="field" style="grid-column:1/-1"><label>Bank Received In</label><select id="mp-bank"></select></div>
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-markpaid')">Cancel</button><button class="btn btn-green" onclick="confirmPaid()">✓ Confirm Paid</button></div></div>
</div>

<!-- INVOICE SELECTOR -->
<div class="modal-overlay" id="m-inv-sel">
  <div class="modal" style="max-width:700px"><div class="modal-hdr"><div class="modal-title">Generate Invoice</div><button class="modal-close" onclick="closeModal('m-inv-sel')">✕</button></div>
  <div class="modal-body">
    <div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
      <div class="field"><label>Invoice Number</label><input id="inv-no" type="text" placeholder="INV-001"/></div>
      <div class="field"><label>Invoice Date</label><input id="inv-date" type="date"/></div>
      <div class="field"><label>Receive Payment In</label><select id="inv-recv-bank"></select></div>
      <div class="field"><label>Notes / Terms</label><input id="inv-terms" type="text" placeholder="e.g. Payment due within 15 days"/></div>
    </div>
    <div class="divider"></div>
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">Select Work Items</div>
    <div id="inv-work-list" style="display:flex;flex-direction:column;gap:7px;max-height:280px;overflow-y:auto"></div>
    <div class="divider"></div>
    <div style="text-align:right;font-size:14px;font-weight:600">Selected: <span id="inv-sel-total" style="color:var(--gold);font-family:'Playfair Display',serif">₹0</span></div>
  </div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-inv-sel')">Cancel</button><button class="btn btn-gold" onclick="generateInvoice()">🧾 Preview</button></div></div>
</div>

<!-- INVOICE PREVIEW -->
<div class="modal-overlay" id="m-inv-preview">
  <div class="modal" style="max-width:860px"><div class="modal-hdr no-print">
    <div class="modal-title">Invoice Preview</div>
    <div class="flex gap8 flex-wrap">
      <button class="btn btn-green btn-sm" onclick="exportPDF()">⬇ PDF</button>
      <button class="btn btn-blue btn-sm" onclick="openEmailModal()">✉ Email</button>
      <button class="btn btn-gold btn-sm" onclick="shareWhatsApp()">💬 WhatsApp</button>
      <button class="modal-close" onclick="closeModal('m-inv-preview')">✕</button>
    </div>
  </div>
  <div class="modal-body" style="padding:0"><div id="invoice-content"></div></div></div>
</div>

<!-- EMAIL MODAL -->
<div class="modal-overlay" id="m-email">
  <div class="modal" style="max-width:600px"><div class="modal-hdr"><div class="modal-title">✉ Send Invoice by Email</div><button class="modal-close" onclick="closeModal('m-email')">✕</button></div>
  <div class="modal-body">
    <div class="form-grid" style="grid-template-columns:1fr">
      <div class="field"><label>To *</label><input id="email-to" type="email" placeholder="client@email.com"/></div>
      <div class="field"><label>CC <span class="field-hint">optional</span></label><input id="email-cc" type="text" placeholder="cc@email.com, another@email.com"/></div>
      <div class="field"><label>BCC <span class="field-hint">optional</span></label><input id="email-bcc" type="text" placeholder="bcc@email.com"/></div>
      <div class="field"><label>Subject</label><input id="email-subject" type="text"/></div>
      <div class="field"><label>Message</label><textarea id="email-body" style="min-height:160px"></textarea></div>
    </div>
    <div id="email-error" style="color:var(--red);font-size:12px;margin-top:8px"></div>
    <div class="info-box mt8" style="font-size:12px">
      <strong style="color:var(--gold)">First time?</strong> Enable Gmail API in Google Cloud Console → APIs & Services → Library → Gmail API → Enable. Then re-connect Google in Settings.
    </div>
  </div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-email')">Cancel</button><button class="btn btn-gold" id="send-email-btn" onclick="sendInvoiceEmail()">✉ Send Email</button></div></div>
</div>

<!-- ADD ASSET -->
<div class="modal-overlay" id="m-asset">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Asset</div><button class="modal-close" onclick="closeModal('m-asset')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Asset Name *</label><input id="a-name" type="text" placeholder="e.g. Gold 22K, Silver"/></div>
    <div class="field"><label>Type</label><select id="a-type"><option>Gold</option><option>Silver</option><option>Property</option><option>Vehicle</option><option>Electronics</option><option>Jewellery</option><option>Other</option></select></div>
    <div class="field"><label>Quantity</label><input id="a-qty" type="number" placeholder="e.g. 10" step="0.001" min="0"/></div>
    <div class="field"><label>Unit</label><select id="a-unit"><option>grams</option><option>tola</option><option>kg</option><option>piece</option><option>sq.ft</option><option>other</option></select></div>
    <div class="field"><label>Buy Price / Unit (₹)</label><input id="a-buyprice" type="number" placeholder="0"/></div>
    <div class="field"><label>Buy Date</label><input id="a-buydate" type="date"/></div>
    <div class="field"><label>Current Price / Unit (₹)</label><input id="a-curprice" type="number" placeholder="0"/></div>
    <div class="field"><label>Notes</label><input id="a-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-asset')">Cancel</button><button class="btn btn-gold" onclick="addAsset()">Save</button></div></div>
</div>

<!-- ADD INVESTMENT -->
<div class="modal-overlay" id="m-investment">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Investment</div><button class="modal-close" onclick="closeModal('m-investment')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Platform / Fund *</label><input id="inv-name" type="text" placeholder="e.g. Zerodha, SBI MF"/></div>
    <div class="field"><label>Type</label><select id="inv-type"><option>Mutual Fund</option><option>Stocks</option><option>Fixed Deposit</option><option>PPF</option><option>NPS</option><option>Gold Bond</option><option>Crypto</option><option>Other</option></select></div>
    <div class="field"><label>Amount Invested (₹)</label><input id="inv-amt" type="number" placeholder="0"/></div>
    <div class="field"><label>Date</label><input id="inv-idate" type="date"/></div>
    <div class="field"><label>Current Value (₹)</label><input id="inv-curval" type="number" placeholder="0"/></div>
    <div class="field"><label>Notes</label><input id="inv-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-investment')">Cancel</button><button class="btn btn-gold" onclick="addInvestment()">Save</button></div></div>
</div>

<!-- ADD WITHDRAWAL -->
<div class="modal-overlay" id="m-withdrawal">
  <div class="modal"><div class="modal-hdr"><div class="modal-title">Add Withdrawal</div><button class="modal-close" onclick="closeModal('m-withdrawal')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr">
    <div class="field"><label>Platform / Fund</label><input id="wd-name" type="text" placeholder="e.g. Zerodha"/></div>
    <div class="field"><label>Reason</label><select id="wd-reason"><option>Profit Booking</option><option>Emergency</option><option>Rebalancing</option><option>Maturity</option><option>Other</option></select></div>
    <div class="field"><label>Amount (₹)</label><input id="wd-amt" type="number" placeholder="0"/></div>
    <div class="field"><label>Date</label><input id="wd-date" type="date"/></div>
    <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="wd-notes" type="text" placeholder="Optional"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-withdrawal')">Cancel</button><button class="btn btn-gold" onclick="addWithdrawal()">Save</button></div></div>
</div>

<!-- PIN SETUP -->
<div class="modal-overlay" id="m-pin-setup">
  <div class="modal" style="max-width:380px"><div class="modal-hdr"><div class="modal-title">🔒 Set PIN</div><button class="modal-close" onclick="closeModal('m-pin-setup')">✕</button></div>
  <div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr">
    <div class="field"><label>New 4-digit PIN</label><input id="new-pin" type="password" maxlength="4" placeholder="••••" inputmode="numeric"/></div>
    <div class="field"><label>Confirm PIN</label><input id="confirm-pin" type="password" maxlength="4" placeholder="••••" inputmode="numeric"/></div>
  </div></div>
  <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal('m-pin-setup')">Cancel</button><button class="btn btn-gold" onclick="setupPin()">Set PIN</button></div></div>
</div>

<!-- SETTINGS -->
<div class="modal-overlay" id="m-settings">
  <div class="modal" style="max-width:640px"><div class="modal-hdr"><div class="modal-title">⚙ Settings</div><button class="modal-close" onclick="closeModal('m-settings')">✕</button></div>
  <div class="modal-body">

    <div class="st-section">
      <div class="st-title">Your Business Info (for Invoices)</div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
        <div class="field" style="grid-column:1/-1"><label>Your Name</label><input id="st-bname" type="text" placeholder="Rishabh Sacheti"/></div>
        <div class="field" style="grid-column:1/-1"><label>Title / Profession</label><input id="st-btitle" type="text" placeholder="Freelance Graphic Designer"/></div>
        <div class="field" style="grid-column:1/-1"><label>Address</label><input id="st-addr" type="text" placeholder="Your address"/></div>
        <div class="field"><label>Phone</label><input id="st-phone" type="text" placeholder="+91 xxxxx"/></div>
        <div class="field"><label>Email</label><input id="st-email" type="email" placeholder="you@email.com"/></div>
        <div class="field"><label>GSTIN</label><input id="st-gstin" type="text" placeholder="GST number"/></div>
        <div class="field"><label>PAN</label><input id="st-pan" type="text" placeholder="PAN number"/></div>
        <div class="field"><label>Invoice Prefix</label><input id="st-prefix" type="text" value="INV" placeholder="INV"/></div>
      </div>
    </div>

    <div class="st-section">
      <div class="st-title">🏦 My Bank Accounts</div>
      <div id="bankList" style="margin-bottom:10px"></div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
        <div class="field" style="grid-column:1/-1"><label>Bank Name *</label><input id="b-name" type="text" placeholder="e.g. Kotak Mahindra Bank"/></div>
        <div class="field"><label>Account Type</label><select id="b-type"><option>Savings</option><option>Current</option><option>Credit Card</option><option>Wallet</option><option>Cash</option></select></div>
        <div class="field"><label>Account Number</label><input id="b-accno" type="text" placeholder="Account number"/></div>
        <div class="field"><label>IFSC Code</label><input id="b-ifsc" type="text" placeholder="e.g. KKBK0000297"/></div>
        <div class="field"><label>Opening Balance (₹)</label><input id="b-opening" type="number" placeholder="0"/></div>
        <div class="field"><label>&nbsp;</label><button class="btn btn-gold" onclick="addBank()" style="width:100%">+ Add Bank</button></div>
      </div>
    </div>

    <div class="st-section">
      <div class="st-title">🔒 Privacy &amp; PIN Lock</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <label class="toggle-wrap">
          <div class="toggle" id="st-pin-toggle" onclick="document.getElementById('st-pin-enabled').checked=!document.getElementById('st-pin-enabled').checked;this.classList.toggle('on')"></div>
          <span style="font-size:13px">Enable PIN lock on open</span>
        </label>
        <input type="checkbox" id="st-pin-enabled" style="display:none"/>
      </div>
      <button class="btn btn-outline btn-sm" onclick="openModal('m-pin-setup')">🔑 Change PIN</button>
    </div>

    <div class="st-section">
      <div class="st-title">☁ Google Sheets Sync</div>
      <div class="info-box">
        <ol class="step-list">
          <li>Upload <strong>FinTrack-Pro-Template.xlsx</strong> to Google Drive → Open in Google Sheets. Copy Sheet ID from URL.</li>
          <li>Go to <a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a> → Enable <strong>Google Sheets API</strong> + <strong>Gmail API</strong>.</li>
          <li>OAuth credentials → Authorized JavaScript Origins → <code>https://belikeerishabh.github.io</code></li>
          <li>Paste Client ID + Sheet ID below → Connect.</li>
        </ol>
      </div>
      <div class="form-grid" style="grid-template-columns:1fr;margin-bottom:8px">
        <div class="field"><label>Google OAuth Client ID</label><input id="st-clientid" type="text" placeholder="xxxxxxx.apps.googleusercontent.com"/></div>
        <div class="field"><label>Google Sheet ID</label><input id="st-sheetid" type="text" placeholder="Sheet ID from URL"/></div>
      </div>
      <div class="flex gap8 flex-wrap">
        <button class="btn btn-blue" onclick="connectGSheets()">Connect Google Sheets</button>
        <button class="btn btn-outline btn-sm" id="disconnectBtn" onclick="disconnectGSheets()" style="display:none">Disconnect</button>
      </div>
      <div id="sheets-status" style="font-size:12px;color:var(--muted);margin-top:8px"></div>
    </div>

  </div>
  <div class="modal-footer"><button class="btn btn-gold" onclick="saveSettings()">Save Settings</button></div></div>
</div>
`;

// Populate bank selects whenever a modal opens
const _origOpenModal = openModal;
window.openModal = function(id) {
  _origOpenModal(id);
  ['i-bank','e-bank','w-pbank','mp-bank','inv-recv-bank'].forEach(sid => populateBankSelect(sid));
};
