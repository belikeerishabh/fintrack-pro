/**
 * invoice.js [v4] — Rishabh's invoice design, WhatsApp share, Gmail send, PDF export
 */

let currentInvoiceData = null;

function openInvoiceSel() {
  if (!selectedClient) { toast('Select a client first', 'error'); return; }
  const pfx = DB.settings.invoicePrefix || 'INV';
  const no  = String(DB.settings.nextInvNo || 1).padStart(3, '0');
  document.getElementById('inv-no').value    = `${pfx}-${no}`;
  document.getElementById('inv-date').value  = today();
  document.getElementById('inv-terms').value = '';
  populateBankSelect('inv-recv-bank');

  const entries = DB.ledger.filter(e => e.clientId === selectedClient);
  document.getElementById('inv-work-list').innerHTML = entries.length
    ? entries.map(e => `
        <label style="display:flex;align-items:flex-start;gap:10px;background:var(--s2);border-radius:8px;padding:10px;cursor:pointer;border:1px solid var(--border)">
          <input type="checkbox" value="${e.id}" onchange="updateInvTotal()" style="margin-top:2px;accent-color:var(--gold)"/>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:500">${esc(e.workDetail)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">${fmtD(e.date)} · <span class="${e.paid?'text-green':'text-red'}">${e.paid?'Paid':'Unpaid'}</span>${e.invoiceNo?' · '+e.invoiceNo:''}</div>
          </div>
          <div class="fw6 text-gold">${fmt(e.price)}</div>
        </label>`).join('')
    : `<div class="tbl-empty">No work entries for this client.</div>`;
  document.getElementById('inv-sel-total').textContent = '₹0';
  openModal('m-inv-sel');
}

function updateInvTotal() {
  const total = [...document.querySelectorAll('#inv-work-list input:checked')]
    .reduce((s,c) => { const e = DB.ledger.find(x => x.id===c.value); return s+(e?e.price:0); }, 0);
  document.getElementById('inv-sel-total').textContent = fmt(total);
}

function generateInvoice() {
  const checks = [...document.querySelectorAll('#inv-work-list input:checked')];
  if (!checks.length) { toast('Select at least one work item', 'error'); return; }

  const invNo    = document.getElementById('inv-no').value;
  const invDate  = document.getElementById('inv-date').value;
  const terms    = document.getElementById('inv-terms').value;
  const bankId   = document.getElementById('inv-recv-bank').value;
  const client   = DB.clients.find(c => c.id === selectedClient);
  const entries  = checks.map(c => DB.ledger.find(x => x.id===c.value)).filter(Boolean);
  const total    = entries.reduce((s,e) => s+e.price, 0);
  const bank     = DB.banks.find(b => b.id === bankId);
  const s        = DB.settings;

  // Tag entries with invoice number
  entries.forEach(e => { const idx = DB.ledger.findIndex(x => x.id===e.id); if(idx>=0) DB.ledger[idx].invoiceNo = invNo; });
  DB.settings.nextInvNo = (DB.settings.nextInvNo||1)+1;
  save();

  // Store for sharing/emailing
  currentInvoiceData = { invNo, invDate, terms, client, entries, total, bank, settings: s };

  renderInvoicePreview(currentInvoiceData);
  closeModal('m-inv-sel');
  openModal('m-inv-preview');
  renderLedger();
}

function renderInvoicePreview(data) {
  const { invNo, invDate, client, entries, total, bank, settings: s, terms } = data;
  const totalWords = numberToWords(total);

  // Build items rows
  let itemRows = '';
  entries.forEach((e, i) => {
    itemRows += `
      <tr class="inv-item-row">
        <td class="inv-td-num">${i+1}.</td>
        <td class="inv-td-desc">${esc(e.workDetail)}</td>
        <td class="inv-td-center">1</td>
        <td class="inv-td-right">${e.price.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
        <td class="inv-td-right">₹ ${e.price.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      </tr>`;
  });

  document.getElementById('invoice-content').innerHTML = `
<div class="inv-wrap" id="inv-printable">
  <div class="inv-top-label">INVOICE</div>

  <div class="inv-header-row">
    <div class="inv-sender">
      <div class="inv-sender-name">${esc(s.businessName||'Your Name')}</div>
      <div class="inv-sender-title">${esc(s.businessTitle||'')}</div>
      <div class="inv-sender-contact">${esc(s.email||'')}${s.email&&s.phone?' | ':''}${esc(s.phone||'')}</div>
    </div>
    <div class="inv-meta-block">
      <div class="inv-meta-row"><span class="inv-meta-label">Invoice #</span><span class="inv-meta-val">${esc(invNo)}</span></div>
      <div class="inv-meta-row"><span class="inv-meta-label">Date</span><span class="inv-meta-val">${fmtFull(invDate)}</span></div>
    </div>
  </div>

  <div class="inv-divider"></div>

  <div class="inv-client-block">
    <div class="inv-client-row"><span class="inv-cl-label">Invoice to</span><span class="inv-cl-val">${esc(client.name)}</span></div>
    ${client.email ? `<div class="inv-client-row"><span class="inv-cl-label">Email</span><span class="inv-cl-val">${esc(client.email)}</span></div>` : ''}
    ${client.phone ? `<div class="inv-client-row"><span class="inv-cl-label">Mobile</span><span class="inv-cl-val">${esc(client.phone)}</span></div>` : ''}
    ${client.gstin ? `<div class="inv-client-row"><span class="inv-cl-label">GSTIN</span><span class="inv-cl-val">${esc(client.gstin)}</span></div>` : ''}
  </div>

  <div class="inv-divider"></div>

  <table class="inv-items-table">
    <thead>
      <tr class="inv-thead-row">
        <th class="inv-th-num" colspan="2">Description</th>
        <th class="inv-th-center">Quantity</th>
        <th class="inv-th-right">Unit Price</th>
        <th class="inv-th-right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr class="inv-subtotal-row">
        <td colspan="3"></td>
        <td class="inv-td-right inv-subtotal-label">Subtotal</td>
        <td class="inv-td-right inv-subtotal-val">₹ ${total.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr>
      <tr class="inv-total-row">
        <td colspan="2"></td>
        <td class="inv-total-label" colspan="2">Total</td>
        <td class="inv-total-val">₹ ${total.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr>
    </tfoot>
  </table>

  <div class="inv-words-row">
    <span class="inv-words-label">Total amount in words:</span>
    <span class="inv-words-val">${totalWords}</span>
  </div>

  <div class="inv-divider" style="margin-top:32px"></div>

  <div class="inv-footer-row">
    <div class="inv-balance-block">
      <div class="inv-balance-label">Balance Due</div>
      <div class="inv-balance-amount">₹ ${total.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
      <div class="inv-balance-words-label">Due amount in words:</div>
      <div class="inv-balance-words">${totalWords}</div>
    </div>
    <div class="inv-bank-block">
      <div class="inv-bank-title">Beneficiary Bank Details</div>
      ${bank ? `
        <div class="inv-bank-row"><span class="inv-bank-label">Bank Name</span><span class="inv-bank-val">${esc(bank.name)}</span></div>
        ${bank.accountNo ? `<div class="inv-bank-row"><span class="inv-bank-label">Account Number</span><span class="inv-bank-val">${esc(bank.accountNo)}</span></div>` : ''}
        ${bank.ifsc ? `<div class="inv-bank-row"><span class="inv-bank-label">IFSC</span><span class="inv-bank-val">${esc(bank.ifsc)}</span></div>` : ''}
        ${s.pan ? `<div class="inv-bank-row"><span class="inv-bank-label">Pan No.</span><span class="inv-bank-val">${esc(s.pan)}</span></div>` : ''}
      ` : '<div style="color:#999;font-size:12px">No bank selected</div>'}
    </div>
  </div>

  <div class="inv-divider"></div>
  <div class="inv-thankyou">Thank you for your business</div>
  ${terms ? `<div class="inv-terms">Terms: ${esc(terms)}</div>` : ''}
</div>`;
}

// ── SHARE VIA WHATSAPP ────────────────────────────────────────────────────────
function shareWhatsApp() {
  if (!currentInvoiceData) return;
  const { invNo, total, client, settings: s } = currentInvoiceData;
  const msg = `Hi ${client.name},\n\nPlease find attached Invoice *${invNo}* for ₹${total.toLocaleString('en-IN')}.\n\nKindly confirm receipt.\n\nThank you,\n${s.businessName}`;
  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ── SEND EMAIL VIA GMAIL API ──────────────────────────────────────────────────
function openEmailModal() {
  if (!currentInvoiceData) return;
  const { invNo, total, client, settings: s } = currentInvoiceData;
  document.getElementById('email-to').value      = client.email || '';
  document.getElementById('email-subject').value = `Invoice ${invNo} — ${s.businessName}`;
  document.getElementById('email-body').value    =
`Hi ${client.name},

Please find attached Invoice ${invNo} for ₹${total.toLocaleString('en-IN')}.

Kindly acknowledge receipt and arrange payment at the earliest.

Thank you for your business!

Best regards,
${s.businessName}
${s.phone||''}`;
  document.getElementById('email-cc').value  = '';
  document.getElementById('email-bcc').value = '';
  openModal('m-email');
}

async function sendInvoiceEmail() {
  if (!gToken) { toast('Connect Google Sheets first to enable Gmail', 'error'); return; }
  const to      = document.getElementById('email-to').value.trim();
  const subject = document.getElementById('email-subject').value.trim();
  const body    = document.getElementById('email-body').value.trim();
  const cc      = document.getElementById('email-cc').value.trim();
  const bcc     = document.getElementById('email-bcc').value.trim();
  if (!to) { toast('Enter recipient email', 'error'); return; }

  const headers = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
  ];
  if (cc)  headers.push(`Cc: ${cc}`);
  if (bcc) headers.push(`Bcc: ${bcc}`);

  const raw = btoa(unescape(encodeURIComponent(headers.join('\r\n') + '\r\n\r\n' + body)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

  try {
    document.getElementById('send-email-btn').textContent = 'Sending…';
    const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    const result = await resp.json();
    if (result.id) {
      toast('✓ Email sent successfully!');
      closeModal('m-email');
    } else if (result.error && result.error.status === 'PERMISSION_DENIED') {
      toast('Enable Gmail API & re-connect Google', 'error');
      document.getElementById('email-error').textContent = 'Gmail permission needed. See instructions below.';
    } else {
      toast('Email failed: ' + (result.error?.message || 'Unknown error'), 'error');
    }
  } catch(e) {
    toast('Email error: ' + e.message, 'error');
  }
  document.getElementById('send-email-btn').textContent = '✉ Send Email';
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
function exportPDF() {
  window.print();
}
