/**
 * invoice.js — Invoice generator, exact design replica, list panel [v8]
 * Font: Inter (Google Fonts)
 * Design: matches Rishabh's sample invoice exactly
 */

// ── INVOICE SELECTOR ─────────────────────────────────────────────────────────
function openInvoiceSel() {
  if (!selectedClient) { toast('Select a client first', 'error'); return; }

  // Auto-generate invoice number
  document.getElementById('inv-no').value    = generateInvoiceNumber();
  document.getElementById('inv-date').value  = today();
  const dueDateEl = document.getElementById('inv-due-date');
  if (dueDateEl) dueDateEl.value = '';
  document.getElementById('inv-terms').value = '';
  populateBankDropdown('inv-bank');

  const entries = DB.ledger.filter(e => e.clientId === selectedClient);
  document.getElementById('inv-work-list').innerHTML = entries.length
    ? entries.map(e => `
        <label style="display:flex;align-items:flex-start;gap:10px;background:var(--s2);border-radius:8px;padding:10px;cursor:pointer;border:1px solid var(--border)">
          <input type="checkbox" value="${e.id}" onchange="updateInvTotal()" style="margin-top:2px;accent-color:var(--gold)"/>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:500">${esc(e.workDetail)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">
              ${fmtD(e.date)} · Qty: ${e.qty||1} · Rate: ${fmt(e.unitPrice||e.price)} ·
              <span class="${e.paid?'text-green':'text-red'}">${e.paid?'Paid':'Unpaid'}</span>
            </div>
          </div>
          <div class="fw6 text-gold">${fmt(e.price)}</div>
        </label>`).join('')
    : `<div class="tbl-empty">No work entries for this client.</div>`;

  document.getElementById('inv-sel-total').textContent = '₹0';
  openModal('m-inv-sel');
}

function updateInvTotal() {
  const checks = [...document.querySelectorAll('#inv-work-list input:checked')];
  const total  = checks.reduce((s, c) => {
    const e = DB.ledger.find(x => x.id === c.value);
    return s + (e ? e.price : 0);
  }, 0);
  document.getElementById('inv-sel-total').textContent = fmt(total);
}

function generateInvoice() {
  const checks = [...document.querySelectorAll('#inv-work-list input:checked')];
  if (!checks.length) { toast('Select at least one work item', 'error'); return; }

  const invNo   = document.getElementById('inv-no').value;
  const invDate = document.getElementById('inv-date').value;
  const dueDate = document.getElementById('inv-due-date').value;
  const terms   = document.getElementById('inv-terms').value;
  const bankId  = document.getElementById('inv-bank').value;
  const client  = DB.clients.find(c => c.id === selectedClient);
  const entries = checks.map(c => DB.ledger.find(x => x.id === c.value)).filter(Boolean);
  const subtotal = entries.reduce((s, e) => s + e.price, 0);
  const bank    = DB.banks.find(b => b.id === bankId);
  const s       = DB.settings;

  // Tag invoice number on ledger entries
  entries.forEach(e => {
    const idx = DB.ledger.findIndex(x => x.id === e.id);
    if (idx >= 0) DB.ledger[idx].invoiceNo = invNo;
  });

  // Save invoice record
  const existingIdx = DB.invoices.findIndex(i => i.invNo === invNo);
  const invoiceRecord = {
    id:       existingIdx >= 0 ? DB.invoices[existingIdx].id : uid(),
    invNo,
    invDate,
    dueDate,
    clientId:   client.id,
    clientName: client.name,
    subtotal,
    bankId,
    terms,
    entryIds:   entries.map(e => e.id),
    paid:       false,
    paidDate:   '',
    createdAt:  new Date().toISOString(),
  };
  if (existingIdx >= 0) DB.invoices[existingIdx] = invoiceRecord;
  else DB.invoices.push(invoiceRecord);

  save();

  // Build and show invoice
  const html = buildInvoiceHTML({ invNo, invDate, dueDate, terms, bank, client, entries, subtotal, s });
  document.getElementById('invoice-content').innerHTML = html;
  window._lastInvoice = { invNo, invDate, client, subtotal, entries, bank, s };

  closeModal('m-inv-sel');
  openModal('m-inv-preview');
  renderLedger();
  renderInvoiceList();
}

// ── INVOICE HTML — exact replica of Rishabh's design ─────────────────────────
function buildInvoiceHTML({ invNo, invDate, dueDate, terms, bank, client, entries, subtotal, s }) {
  const formatDateInv = d => {
    if (!d) return '';
    const x = new Date(d);
    if (isNaN(x)) return d;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return x.getDate() + '-' + months[x.getMonth()] + '-' + x.getFullYear();
  };

  const itemRows = entries.map((e, i) => {
    const qty       = e.qty || 1;
    const unitPrice = e.unitPrice || e.price;
    const qtyDisplay = e.qty ? String(e.qty) + (e.qtyUnit ? ' ' + e.qtyUnit : '') : '\u2014';
    return `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:10px 0;color:#888;font-size:12px">${i+1}.</td>
        <td style="padding:10px 0">${esc(e.workDetail)}</td>
        <td style="padding:10px 0;text-align:right;color:#555">${qtyDisplay}</td>
        <td style="padding:10px 0;text-align:right;color:#555">\u20b9${unitPrice.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
        <td style="padding:10px 0;text-align:right;font-weight:600">\u20b9${e.price.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr>`;
  }).join('');

  const bankSection = bank && bank.accountNumber ? `
    <div>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px">Bank Details</div>
      <div style="font-size:12px;color:#555;line-height:1.8">
        ${esc(bank.name)}<br/>
        Acc: ${esc(bank.accountNumber)}${bank.ifsc ? ' | IFSC: ' + esc(bank.ifsc) : ''}<br/>
        ${s.pan ? 'PAN: ' + esc(s.pan) : ''}
      </div>
    </div>` : '<div></div>';

  return `
<div id="printable-invoice" style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:white;padding:48px 56px;max-width:820px;margin:0 auto;line-height:1.6;box-sizing:border-box">

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div style="font-size:22px;font-weight:700;color:#1a1a1a">${esc(s.businessName||'Your Name')}</div>
      <div style="font-size:12px;color:#666;margin-top:3px">${esc(s.businessTitle||'')}</div>
      <div style="font-size:12px;color:#666;margin-top:2px">${s.email?esc(s.email):''}${s.email&&s.phone?' | ':''}${s.phone?esc(s.phone):''}</div>
      ${s.address ? '<div style="font-size:12px;color:#666;margin-top:2px">'+esc(s.address)+'</div>' : ''}
      ${s.gstin ? '<div style="font-size:12px;color:#666;margin-top:2px">GSTIN: '+esc(s.gstin)+'</div>' : ''}
    </div>
    <div style="text-align:right">
      <div style="font-size:20px;font-weight:700;color:#1a1a1a">INVOICE</div>
      <div style="font-size:12px;color:#666;margin-top:4px"># ${esc(invNo)}</div>
      <div style="font-size:12px;color:#666;margin-top:2px">Date: ${formatDateInv(invDate)}</div>
      ${dueDate ? '<div style="font-size:12px;color:#666;margin-top:2px">Due: '+formatDateInv(dueDate)+'</div>' : ''}
    </div>
  </div>

  <hr style="border:none;border-top:1px solid #ccc;margin:0 0 20px 0"/>

  <div style="margin-bottom:24px">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px">Bill To</div>
    <div style="font-size:14px;font-weight:600;color:#1a1a1a">${esc(client.name)}</div>
    ${client.email ? '<div style="font-size:12px;color:#555;margin-top:3px">'+esc(client.email)+'</div>' : ''}
    ${client.phone ? '<div style="font-size:12px;color:#555">'+esc(client.phone)+'</div>' : ''}
    ${client.address ? '<div style="font-size:12px;color:#555">'+esc(client.address)+'</div>' : ''}
    ${client.gstin ? '<div style="font-size:12px;color:#555">GSTIN: '+esc(client.gstin)+'</div>' : ''}
  </div>

  <table style="width:100%;border-collapse:collapse;font-family:'Inter',Arial,sans-serif">
    <thead>
      <tr style="border-bottom:2px solid #1a1a1a">
        <th style="padding:8px 0;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#555;width:24px">#</th>
        <th style="padding:8px 0;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#555">Description</th>
        <th style="padding:8px 0;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#555;width:70px">Qty</th>
        <th style="padding:8px 0;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#555;width:90px">Rate</th>
        <th style="padding:8px 0;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#555;width:100px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr>
        <td colspan="3"></td>
        <td style="padding:10px 0;text-align:right;font-size:12px;color:#888;border-top:1px solid #eee">Subtotal</td>
        <td style="padding:10px 0;text-align:right;border-top:1px solid #eee;font-weight:600">\u20b9${subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr>
      <tr>
        <td colspan="3"></td>
        <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:700;border-top:2px solid #1a1a1a">Total</td>
        <td style="padding:6px 0;text-align:right;font-size:16px;font-weight:700;border-top:2px solid #1a1a1a">\u20b9${subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      </tr>
    </tbody>
  </table>

  <div style="text-align:right;font-size:11px;color:#888;font-style:italic;margin-top:6px">${amountInWords(subtotal)}</div>
  ${terms ? '<div style="margin-top:14px;font-size:12px;color:#555;font-style:italic">'+esc(terms)+'</div>' : ''}

  <hr style="border:none;border-top:1px solid #ccc;margin:24px 0"/>

  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    ${bankSection}
    <div style="text-align:right">
      <div style="font-size:13px;font-weight:700;color:#1a1a1a">Balance Due: \u20b9${subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
      <div style="font-size:11px;color:#888;margin-top:4px;font-style:italic">${amountInWords(subtotal)}</div>
    </div>
  </div>

  <hr style="border:none;border-top:1px solid #eee;margin:20px 0 14px"/>
  <div style="text-align:center;font-size:12px;color:#aaa">Thank you for your business</div>

</div>`;
}


// ── WHATSAPP SHARE ────────────────────────────────────────────────────────────
function shareWhatsApp() {
  const inv = window._lastInvoice;
  if (!inv) { toast('Generate invoice first', 'error'); return; }

  // Step 1: Download PDF
  window.print();

  // Step 2: Open WhatsApp with message (after slight delay for print dialog)
  setTimeout(() => {
    const msg = `Hi ${inv.client.name},\n\nPlease find attached Invoice *${inv.invNo}* for ₹${inv.subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}.\n\nKindly confirm receipt.\n\nThank you,\n${inv.s.businessName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  }, 500);
}

// ── EMAIL ─────────────────────────────────────────────────────────────────────
function openEmailModal() {
  const inv = window._lastInvoice;
  if (!inv) { toast('Generate invoice first', 'error'); return; }
  document.getElementById('email-to').value      = inv.client.email || '';
  document.getElementById('email-cc').value      = '';
  document.getElementById('email-bcc').value     = '';
  document.getElementById('email-subject').value = `Invoice ${inv.invNo} — ${inv.s.businessName}`;
  document.getElementById('email-body').value    =
    `Hi ${inv.client.name},\n\nPlease find attached Invoice ${inv.invNo} dated ${fmtD(inv.invDate)} for a total of ₹${inv.subtotal.toLocaleString('en-IN',{minimumFractionDigits:2})}.\n\nKindly review and confirm.\n\nThank you,\n${inv.s.businessName}\n${inv.s.phone||''}`;
  document.getElementById('email-status').textContent = '';
  openModal('m-email');
}

async function sendGmail() {
  if (!gToken) { toast('Connect Google Sheets first', 'error'); return; }
  const to      = document.getElementById('email-to').value.trim();
  const cc      = document.getElementById('email-cc').value.trim();
  const bcc     = document.getElementById('email-bcc').value.trim();
  const subject = document.getElementById('email-subject').value;
  const body    = document.getElementById('email-body').value;
  if (!to) { toast('Enter recipient email', 'error'); return; }
  document.getElementById('email-status').textContent = 'Sending…';
  document.getElementById('email-status').style.color = 'var(--gold)';
  const invHtml = document.getElementById('invoice-content').innerHTML;
  let hdrs = `To: ${to}\nSubject: ${subject}\nContent-Type: text/html; charset=utf-8`;
  if (cc)  hdrs += `\nCc: ${cc}`;
  if (bcc) hdrs += `\nBcc: ${bcc}`;
  const encoded = btoa(unescape(encodeURIComponent(`${hdrs}\n\n${invHtml}`)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  try {
    const res  = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encoded }),
    });
    const data = await res.json();
    if (data.id) {
      document.getElementById('email-status').textContent = '✓ Email sent!';
      document.getElementById('email-status').style.color = 'var(--green)';
      toast('✓ Email sent!');
    } else throw new Error(data.error?.message || 'Send failed');
  } catch (err) {
    document.getElementById('email-status').textContent = '✗ ' + err.message;
    document.getElementById('email-status').style.color = 'var(--red)';
    toast('Email failed: ' + err.message, 'error');
  }
}

function exportInvoicePDF() { window.print(); }

// ── INVOICE LIST PANEL ────────────────────────────────────────────────────────
function renderInvoiceList() {
  const container = document.getElementById('invoice-list-panel');
  if (!container) return;

  if (!DB.invoices || !DB.invoices.length) {
    container.innerHTML = `<div class="tbl-empty"><div class="ico">🧾</div>No invoices generated yet</div>`;
    return;
  }

  const sorted = [...DB.invoices].sort((a,b) => b.createdAt.localeCompare(a.createdAt));

  container.innerHTML = `
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice No.</th>
            <th>Date</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Paid Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(inv => `
            <tr>
              <td><strong style="color:var(--gold)">${esc(inv.invNo)}</strong></td>
              <td>${fmtD(inv.invDate)}</td>
              <td>${esc(inv.clientName)}</td>
              <td class="fw6">${fmt(inv.subtotal)}</td>
              <td>${inv.paid
                ? `<span class="badge bg">✓ Paid</span>`
                : `<span class="badge br">Unpaid</span>`}
              </td>
              <td style="font-size:12px;color:var(--muted)">${inv.paid ? fmtD(inv.paidDate) : '—'}</td>
              <td>
                <div class="flex gap6">
                  <button class="btn btn-outline btn-xs" onclick="previewSavedInvoice('${inv.id}')">👁 View</button>
                  ${!inv.paid ? `<button class="btn btn-green btn-xs" onclick="markInvoicePaid('${inv.id}')">Mark Paid</button>` : ''}
                  <button class="btn btn-red btn-xs" onclick="deleteInvoice('${inv.id}')">✕</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function markInvoicePaid(id) {
  const idx = DB.invoices.findIndex(i => i.id === id);
  if (idx < 0) return;
  const paidDate = prompt('Enter payment date (YYYY-MM-DD):', today());
  if (!paidDate) return;
  DB.invoices[idx].paid     = true;
  DB.invoices[idx].paidDate = paidDate;
  // Also mark ledger entries as paid
  if (DB.invoices[idx].entryIds) {
    DB.invoices[idx].entryIds.forEach(eid => {
      const li = DB.ledger.findIndex(e => e.id === eid);
      if (li >= 0) { DB.ledger[li].paid = true; DB.ledger[li].status = 'Paid'; DB.ledger[li].paidDate = paidDate; }
    });
  }
  save(); renderInvoiceList(); renderLedger(); toast('Invoice marked as paid ✓');
}

function deleteInvoice(id) {
  if (!confirm('Delete this invoice record?')) return;
  DB.invoices = DB.invoices.filter(i => i.id !== id);
  save(); renderInvoiceList(); toast('Invoice deleted');
}

function previewSavedInvoice(id) {
  const inv = DB.invoices.find(i => i.id === id);
  if (!inv) return;
  const client  = DB.clients.find(c => c.id === inv.clientId) || { name: inv.clientName, email:'', phone:'' };
  const entries = (inv.entryIds || []).map(eid => DB.ledger.find(e => e.id === eid)).filter(Boolean);
  const bank    = DB.banks.find(b => b.id === inv.bankId);
  const s       = DB.settings;
  if (!entries.length) { toast('Work entries no longer available', 'error'); return; }
  const html = buildInvoiceHTML({ invNo: inv.invNo, invDate: inv.invDate, dueDate: inv.dueDate, terms: inv.terms, bank, client, entries, subtotal: inv.subtotal, s });
  document.getElementById('invoice-content').innerHTML = html;
  window._lastInvoice = { invNo: inv.invNo, invDate: inv.invDate, client, subtotal: inv.subtotal, entries, bank, s };
  openModal('m-inv-preview');
}
