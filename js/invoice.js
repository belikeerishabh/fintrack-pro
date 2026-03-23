/**
 * invoice.js — Invoice selector and PDF-ready preview generator
 */

function openInvoiceSel() {
  if (!selectedClient) { toast('Select a client first', 'error'); return; }

  const pfx = DB.settings.invoicePrefix || 'INV';
  const no  = String(DB.settings.nextInvNo || 1).padStart(3, '0');
  document.getElementById('inv-no').value    = `${pfx}-${no}`;
  document.getElementById('inv-date').value  = today();
  document.getElementById('inv-terms').value = '';

  const entries = DB.ledger.filter(e => e.clientId === selectedClient);
  document.getElementById('inv-work-list').innerHTML = entries.length
    ? entries.map(e => `
        <label style="display:flex;align-items:flex-start;gap:10px;background:var(--s2);border-radius:8px;padding:10px;cursor:pointer;border:1px solid var(--border)">
          <input type="checkbox" value="${e.id}" onchange="updateInvTotal()" style="margin-top:2px;accent-color:var(--gold)"/>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:500">${esc(e.workDetail)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">
              ${fmtD(e.date)} ·
              <span class="${e.paid ? 'text-green' : 'text-red'}">${e.paid ? 'Paid' : 'Unpaid'}</span>
              ${e.invoiceNo ? ' · ' + e.invoiceNo : ''}
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

  const invNo  = document.getElementById('inv-no').value;
  const invDate = document.getElementById('inv-date').value;
  const terms  = document.getElementById('inv-terms').value;
  const client = DB.clients.find(c => c.id === selectedClient);
  const entries = checks.map(c => DB.ledger.find(x => x.id === c.value)).filter(Boolean);
  const total  = entries.reduce((s, e) => s + e.price, 0);
  const s      = DB.settings;

  // Tag all selected work entries with this invoice number
  entries.forEach(e => {
    const idx = DB.ledger.findIndex(x => x.id === e.id);
    if (idx >= 0) DB.ledger[idx].invoiceNo = invNo;
  });
  DB.settings.nextInvNo = (DB.settings.nextInvNo || 1) + 1;
  save();

  document.getElementById('invoice-content').innerHTML = `
    <div class="inv-header">
      <div>
        <div class="inv-biz-name">${esc(s.businessName) || 'Your Name'}</div>
        <div class="inv-biz-sub">${esc(s.address) || ''}</div>
        <div class="inv-biz-sub">${s.phone ? '📞 ' + s.phone : ''} ${s.email ? '✉ ' + s.email : ''}</div>
        ${s.gstin ? `<div class="inv-biz-sub">GSTIN: ${s.gstin}</div>` : ''}
      </div>
      <div class="inv-meta">
        <h2>INVOICE</h2>
        <div style="font-size:13px;color:#333;margin-top:4px"># ${invNo}</div>
        <div style="color:#555;font-size:12px;margin-top:2px">Date: ${fmtD(invDate)}</div>
      </div>
    </div>

    <div class="inv-parties">
      <div>
        <div class="inv-party-lbl">Bill To</div>
        <div class="inv-party-name">${esc(client.name)}</div>
        ${client.address ? `<div class="inv-party-sub">${esc(client.address)}</div>` : ''}
        ${client.phone   ? `<div class="inv-party-sub">📞 ${client.phone}</div>`  : ''}
        ${client.email   ? `<div class="inv-party-sub">✉ ${client.email}</div>`   : ''}
        ${client.gstin   ? `<div class="inv-party-sub">GSTIN: ${client.gstin}</div>` : ''}
      </div>
      <div>
        <div class="inv-party-lbl">Invoice Details</div>
        <div class="inv-party-sub">Invoice No: <strong>${invNo}</strong></div>
        <div class="inv-party-sub">Date: ${fmtD(invDate)}</div>
        <div class="inv-party-sub">Items: ${entries.length}</div>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr><th>#</th><th>Date</th><th>Work Description</th><th style="text-align:right">Amount</th></tr>
      </thead>
      <tbody>
        ${entries.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${fmtD(e.date)}</td>
            <td>${esc(e.workDetail)}</td>
            <td style="text-align:right;font-weight:700">${fmt(e.price)}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div class="inv-total-row inv-grand" style="margin-top:4px">
      <span class="inv-total-label" style="font-weight:700">Total</span>
      <span class="inv-total-val">${fmt(total)}</span>
    </div>

    ${terms ? `<div style="margin-top:14px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:12px;color:#555"><strong>Terms:</strong> ${esc(terms)}</div>` : ''}

    <div class="inv-footer">
      Thank you for your business! · ${s.businessName || ''} · ${s.phone || ''} · ${s.email || ''}
    </div>`;

  closeModal('m-inv-sel');
  openModal('m-inv-preview');
  renderLedger();
}
