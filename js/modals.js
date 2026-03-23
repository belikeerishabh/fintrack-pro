/**
 * modals.js — Injects all modal HTML into #modals-container
 * Keeping modals in JS avoids cluttering index.html
 */

document.getElementById('modals-container').innerHTML = `

<!-- ══ ADD INCOME ══ -->
<div class="modal-overlay" id="m-income">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Income</div><button class="modal-close" onclick="closeModal('m-income')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Date</label><input id="i-date" type="date"/></div>
        <div class="field"><label>From Whom</label><input id="i-from" type="text" placeholder="e.g. Papa, Rahul Client, Tata…"/></div>
        <div class="field"><label>Category</label>
          <select id="i-cat">
            <option>Freelance Project</option><option>Advance Payment</option>
            <option>Family / Personal</option><option>Rental</option>
            <option>Investment Return</option><option>Gift</option>
            <option>Refund</option><option>Other</option>
          </select>
        </div>
        <div class="field"><label>Amount (₹)</label><input id="i-amt" type="number" placeholder="0" min="0"/></div>
        <div class="field"><label>Payment Method</label>
          <select id="i-method">
            <option>UPI</option><option>NEFT</option><option>IMPS</option>
            <option>RTGS</option><option>Cash</option><option>Cheque</option><option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>Account / Wallet <span class="field-hint">(type freely)</span></label>
          <input id="i-acct" type="text" placeholder="e.g. SBI Savings, Paytm, PhonePe"/>
        </div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="i-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-income')">Cancel</button>
      <button class="btn btn-gold" onclick="addIncome()">Save</button>
    </div>
  </div>
</div>

<!-- ══ ADD EXPENSE ══ -->
<div class="modal-overlay" id="m-expense">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Expense</div><button class="modal-close" onclick="closeModal('m-expense')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Date</label><input id="e-date" type="date"/></div>
        <div class="field"><label>Description</label><input id="e-desc" type="text" placeholder="e.g. Groceries, Rent…"/></div>
        <div class="field"><label>Category</label>
          <select id="e-cat">
            <option>Food & Dining</option><option>Rent / Housing</option><option>Transport</option>
            <option>Utilities</option><option>Software / Tools</option><option>Healthcare</option>
            <option>Entertainment</option><option>Shopping</option><option>Education</option>
            <option>EMI / Loan</option><option>Business Expense</option><option>Other</option>
          </select>
        </div>
        <div class="field"><label>Amount (₹)</label><input id="e-amt" type="number" placeholder="0" min="0"/></div>
        <div class="field"><label>Payment Method</label>
          <select id="e-method">
            <option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option>
            <option>Debit Card</option><option>Credit Card</option><option>Cheque</option><option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>Account / Card <span class="field-hint">(type freely)</span></label>
          <input id="e-acct" type="text" placeholder="e.g. HDFC Debit ···1234, PhonePe"/>
        </div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="e-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-expense')">Cancel</button>
      <button class="btn btn-gold" onclick="addExpense()">Save</button>
    </div>
  </div>
</div>

<!-- ══ ADD CLIENT ══ -->
<div class="modal-overlay" id="m-client">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Client</div><button class="modal-close" onclick="closeModal('m-client')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field" style="grid-column:1/-1"><label>Client Name *</label><input id="cl-name" type="text" placeholder="Client or company name"/></div>
        <div class="field"><label>Phone</label><input id="cl-phone" type="text" placeholder="+91 xxxxx"/></div>
        <div class="field"><label>Email</label><input id="cl-email" type="email" placeholder="client@email.com"/></div>
        <div class="field" style="grid-column:1/-1"><label>Address</label><input id="cl-addr" type="text" placeholder="Address"/></div>
        <div class="field"><label>GSTIN</label><input id="cl-gstin" type="text" placeholder="GST number (if any)"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-client')">Cancel</button>
      <button class="btn btn-gold" onclick="addClient()">Save Client</button>
    </div>
  </div>
</div>

<!-- ══ ADD / EDIT WORK ══ -->
<div class="modal-overlay" id="m-work">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title" id="workModalTitle">Add Work Entry</div><button class="modal-close" onclick="closeModal('m-work')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Date</label><input id="w-date" type="date"/></div>
        <div class="field"><label>Invoice No <span class="field-hint">fill later if needed</span></label><input id="w-invno" type="text" placeholder="e.g. INV-001"/></div>
        <div class="field" style="grid-column:1/-1"><label>Work Detail *</label><textarea id="w-detail" placeholder="Describe the work done…"></textarea></div>
        <div class="field"><label>Price (₹)</label><input id="w-price" type="number" placeholder="0"/></div>
        <div class="field"><label>Status</label>
          <select id="w-status" onchange="togglePayFields()">
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div id="w-payfields" style="display:none;grid-column:1/-1">
          <div class="form-grid" style="grid-template-columns:1fr 1fr;background:rgba(61,188,130,.05);border:1px solid rgba(61,188,130,.2);padding:12px;border-radius:8px;margin-top:0">
            <div class="field"><label>Payment Date</label><input id="w-pdate" type="date"/></div>
            <div class="field"><label>Method</label>
              <select id="w-pmethod"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option><option>Cheque</option><option>Other</option></select>
            </div>
            <div class="field" style="grid-column:1/-1">
              <label>Account / Wallet received in</label>
              <input id="w-pacct" type="text" placeholder="e.g. SBI Savings, Paytm"/>
            </div>
          </div>
        </div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="w-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-work')">Cancel</button>
      <button class="btn btn-gold" onclick="saveWork()">Save</button>
    </div>
  </div>
</div>

<!-- ══ MARK PAID ══ -->
<div class="modal-overlay" id="m-markpaid">
  <div class="modal" style="max-width:400px">
    <div class="modal-hdr"><div class="modal-title">Mark as Paid</div><button class="modal-close" onclick="closeModal('m-markpaid')">✕</button></div>
    <div class="modal-body">
      <input type="hidden" id="mp-id"/>
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Payment Date</label><input id="mp-date" type="date"/></div>
        <div class="field"><label>Method</label>
          <select id="mp-method"><option>UPI</option><option>NEFT</option><option>IMPS</option><option>Cash</option><option>Cheque</option><option>Other</option></select>
        </div>
        <div class="field" style="grid-column:1/-1">
          <label>Account / Wallet</label>
          <input id="mp-acct" type="text" placeholder="e.g. SBI Savings, Paytm"/>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-markpaid')">Cancel</button>
      <button class="btn btn-green" onclick="confirmPaid()">✓ Confirm Paid</button>
    </div>
  </div>
</div>

<!-- ══ INVOICE SELECTOR ══ -->
<div class="modal-overlay" id="m-inv-sel">
  <div class="modal" style="max-width:700px">
    <div class="modal-hdr"><div class="modal-title">Generate Invoice</div><button class="modal-close" onclick="closeModal('m-inv-sel')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
        <div class="field"><label>Invoice Number</label><input id="inv-no" type="text" placeholder="INV-001"/></div>
        <div class="field"><label>Invoice Date</label><input id="inv-date" type="date"/></div>
        <div class="field" style="grid-column:1/-1"><label>Notes / Terms</label><input id="inv-terms" type="text" placeholder="e.g. Payment due within 15 days"/></div>
      </div>
      <div class="divider"></div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">Select Work Items</div>
      <div id="inv-work-list" style="display:flex;flex-direction:column;gap:7px;max-height:280px;overflow-y:auto"></div>
      <div class="divider"></div>
      <div style="text-align:right;font-size:14px;font-weight:600">
        Selected: <span id="inv-sel-total" style="color:var(--gold);font-family:'Playfair Display',serif">₹0</span>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-inv-sel')">Cancel</button>
      <button class="btn btn-gold" onclick="generateInvoice()">🧾 Preview</button>
    </div>
  </div>
</div>

<!-- ══ INVOICE PREVIEW ══ -->
<div class="modal-overlay" id="m-inv-preview">
  <div class="modal" style="max-width:800px">
    <div class="modal-hdr no-print">
      <div class="modal-title">Invoice Preview</div>
      <div class="flex gap8">
        <button class="btn btn-green btn-sm" onclick="window.print()">🖨 Print / PDF</button>
        <button class="modal-close" onclick="closeModal('m-inv-preview')">✕</button>
      </div>
    </div>
    <div class="modal-body"><div id="invoice-content" class="invoice-preview"></div></div>
  </div>
</div>

<!-- ══ ADD ASSET ══ -->
<div class="modal-overlay" id="m-asset">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Asset</div><button class="modal-close" onclick="closeModal('m-asset')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Asset Name *</label><input id="a-name" type="text" placeholder="e.g. Gold 22K, Silver"/></div>
        <div class="field"><label>Type</label>
          <select id="a-type"><option>Gold</option><option>Silver</option><option>Property</option><option>Vehicle</option><option>Electronics</option><option>Jewellery</option><option>Other</option></select>
        </div>
        <div class="field"><label>Quantity</label><input id="a-qty" type="number" placeholder="e.g. 10" step="0.001" min="0"/></div>
        <div class="field"><label>Unit</label>
          <select id="a-unit"><option>grams</option><option>tola</option><option>kg</option><option>piece</option><option>sq.ft</option><option>other</option></select>
        </div>
        <div class="field"><label>Buy Price / Unit (₹)</label><input id="a-buyprice" type="number" placeholder="0"/></div>
        <div class="field"><label>Buy Date</label><input id="a-buydate" type="date"/></div>
        <div class="field"><label>Current Price / Unit (₹)</label><input id="a-curprice" type="number" placeholder="0"/></div>
        <div class="field"><label>Notes</label><input id="a-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-asset')">Cancel</button>
      <button class="btn btn-gold" onclick="addAsset()">Save</button>
    </div>
  </div>
</div>

<!-- ══ ADD INVESTMENT ══ -->
<div class="modal-overlay" id="m-investment">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Investment</div><button class="modal-close" onclick="closeModal('m-investment')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Platform / Fund *</label><input id="inv-name" type="text" placeholder="e.g. Zerodha, SBI MF"/></div>
        <div class="field"><label>Type</label>
          <select id="inv-type"><option>Mutual Fund</option><option>Stocks</option><option>Fixed Deposit</option><option>PPF</option><option>NPS</option><option>Gold Bond</option><option>Crypto</option><option>Other</option></select>
        </div>
        <div class="field"><label>Amount Invested (₹)</label><input id="inv-amt" type="number" placeholder="0"/></div>
        <div class="field"><label>Date</label><input id="inv-idate" type="date"/></div>
        <div class="field"><label>Current Value (₹)</label><input id="inv-curval" type="number" placeholder="0"/></div>
        <div class="field"><label>Notes</label><input id="inv-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-investment')">Cancel</button>
      <button class="btn btn-gold" onclick="addInvestment()">Save</button>
    </div>
  </div>
</div>

<!-- ══ ADD WITHDRAWAL ══ -->
<div class="modal-overlay" id="m-withdrawal">
  <div class="modal">
    <div class="modal-hdr"><div class="modal-title">Add Withdrawal</div><button class="modal-close" onclick="closeModal('m-withdrawal')">✕</button></div>
    <div class="modal-body">
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="field"><label>Platform / Fund</label><input id="wd-name" type="text" placeholder="e.g. Zerodha"/></div>
        <div class="field"><label>Reason</label>
          <select id="wd-reason"><option>Profit Booking</option><option>Emergency</option><option>Rebalancing</option><option>Maturity</option><option>Other</option></select>
        </div>
        <div class="field"><label>Amount (₹)</label><input id="wd-amt" type="number" placeholder="0"/></div>
        <div class="field"><label>Date</label><input id="wd-date" type="date"/></div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="wd-notes" type="text" placeholder="Optional"/></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('m-withdrawal')">Cancel</button>
      <button class="btn btn-gold" onclick="addWithdrawal()">Save</button>
    </div>
  </div>
</div>

<!-- ══ SETTINGS ══ -->
<div class="modal-overlay" id="m-settings">
  <div class="modal" style="max-width:620px">
    <div class="modal-hdr"><div class="modal-title">⚙ Settings</div><button class="modal-close" onclick="closeModal('m-settings')">✕</button></div>
    <div class="modal-body">

      <div class="st-section">
        <div class="st-title">Your Business Info (for Invoices)</div>
        <div class="form-grid" style="grid-template-columns:1fr 1fr;margin-bottom:0">
          <div class="field" style="grid-column:1/-1"><label>Your Name / Business Name</label><input id="st-bname" type="text" placeholder="Your name or business"/></div>
          <div class="field" style="grid-column:1/-1"><label>Address</label><input id="st-addr" type="text" placeholder="Your address"/></div>
          <div class="field"><label>Phone</label><input id="st-phone" type="text" placeholder="+91 xxxxx"/></div>
          <div class="field"><label>Email</label><input id="st-email" type="email" placeholder="you@email.com"/></div>
          <div class="field"><label>GSTIN</label><input id="st-gstin" type="text" placeholder="GST number"/></div>
          <div class="field"><label>Invoice Prefix</label><input id="st-prefix" type="text" value="INV" placeholder="INV"/></div>
        </div>
      </div>

      <div class="st-section">
        <div class="st-title">☁ Google Sheets Sync</div>
        <div class="info-box">
          <div style="font-size:12px;color:var(--muted2);margin-bottom:10px">Your data lives in a Google Sheet. The app reads and writes to it directly.</div>
          <ol class="step-list">
            <li>Download <strong>FinTrack-Pro-Template.xlsx</strong> → upload to Google Drive → open in Google Sheets.</li>
            <li>Copy the Sheet ID from the URL: <span style="color:var(--gold);font-family:monospace;font-size:11px">…/spreadsheets/d/<u>SHEET_ID</u>/edit</span></li>
            <li>Go to <a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a> → Enable <strong>Google Sheets API</strong>.</li>
            <li>Create OAuth 2.0 credentials (Web App). Add your GitHub Pages URL to <em>Authorized JavaScript Origins</em>.</li>
            <li>Paste Client ID + Sheet ID below → click Connect.</li>
          </ol>
        </div>
        <div class="form-grid" style="grid-template-columns:1fr;margin-bottom:8px">
          <div class="field"><label>Google OAuth Client ID</label><input id="st-clientid" type="text" placeholder="xxxxxxx.apps.googleusercontent.com"/></div>
          <div class="field"><label>Google Sheet ID</label><input id="st-sheetid" type="text" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"/></div>
        </div>
        <div class="flex gap8 flex-wrap">
          <button class="btn btn-blue" onclick="connectGSheets()">Connect Google Sheets</button>
          <button class="btn btn-outline btn-sm" id="disconnectBtn" onclick="disconnectGSheets()" style="display:none">Disconnect</button>
        </div>
        <div id="sheets-status" style="font-size:12px;color:var(--muted);margin-top:8px"></div>
      </div>

    </div>
    <div class="modal-footer">
      <button class="btn btn-gold" onclick="saveSettings()">Save Settings</button>
    </div>
  </div>
</div>
`;
