/**
 * ledger.js — Client management and work entry log
 */

let selectedClient = null;
let editingWorkId  = null;

// ── CLIENTS ───────────────────────────────────────────────────────────────────

function addClient() {
  const name = document.getElementById('cl-name').value.trim();
  if (!name) { toast('Enter a client name', 'error'); return; }

  DB.clients.push({
    id:      uid(),
    name,
    phone:   document.getElementById('cl-phone').value,
    email:   document.getElementById('cl-email').value,
    address: document.getElementById('cl-addr').value,
    gstin:   document.getElementById('cl-gstin').value,
  });

  save();
  closeModal('m-client');
  renderLedger();
  toast('Client added');
  ['cl-name','cl-phone','cl-email','cl-addr','cl-gstin'].forEach(id => document.getElementById(id).value = '');
}

function selectClient(id) {
  selectedClient = id;
  document.getElementById('addWorkBtn').style.display = 'inline-flex';
  document.getElementById('genInvBtn').style.display  = 'inline-flex';
  renderLedger();
}

// ── WORK ENTRIES ─────────────────────────────────────────────────────────────

function openAddWork() {
  if (!selectedClient) { toast('Select a client first', 'error'); return; }
  editingWorkId = null;
  document.getElementById('workModalTitle').textContent = 'Add Work Entry';
  ['w-date','w-invno','w-detail','w-price','w-notes','w-pdate','w-pacct'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('w-status').value = 'unpaid';
  document.getElementById('w-payfields').style.display = 'none';
  openModal('m-work');
}

function editWork(id) {
  const e = DB.ledger.find(x => x.id === id);
  if (!e) return;
  editingWorkId = id;
  document.getElementById('workModalTitle').textContent = 'Edit Work Entry';
  document.getElementById('w-date').value    = e.date       || '';
  document.getElementById('w-detail').value  = e.workDetail || '';
  document.getElementById('w-price').value   = e.price      || '';
  document.getElementById('w-invno').value   = e.invoiceNo  || '';
  document.getElementById('w-notes').value   = e.notes      || '';
  document.getElementById('w-status').value  = e.paid ? 'paid' : 'unpaid';
  document.getElementById('w-payfields').style.display = e.paid ? 'block' : 'none';
  if (e.paid) {
    document.getElementById('w-pdate').value  = e.paidDate   || '';
    document.getElementById('w-pmethod').value = e.paidMethod || 'UPI';
    document.getElementById('w-pacct').value  = e.paidAccount || '';
  }
  openModal('m-work');
}

function togglePayFields() {
  const paid = document.getElementById('w-status').value === 'paid';
  document.getElementById('w-payfields').style.display = paid ? 'block' : 'none';
}

function saveWork() {
  const detail = document.getElementById('w-detail').value.trim();
  if (!detail) { toast('Enter work detail', 'error'); return; }

  const paid   = document.getElementById('w-status').value === 'paid';
  const client = DB.clients.find(c => c.id === selectedClient);

  const entry = {
    id:          editingWorkId || uid(),
    clientId:    selectedClient,
    clientName:  client ? client.name : '',
    date:        document.getElementById('w-date').value,
    workDetail:  detail,
    price:       parseFloat(document.getElementById('w-price').value) || 0,
    invoiceNo:   document.getElementById('w-invno').value.trim(),
    paid,
    status:      paid ? 'Paid' : 'Unpaid',
    paidDate:    paid ? document.getElementById('w-pdate').value  : '',
    paidMethod:  paid ? document.getElementById('w-pmethod').value : '',
    paidAccount: paid ? document.getElementById('w-pacct').value   : '',
    notes:       document.getElementById('w-notes').value,
  };

  if (editingWorkId) {
    const idx = DB.ledger.findIndex(e => e.id === editingWorkId);
    DB.ledger[idx] = entry;
  } else {
    DB.ledger.push(entry);
  }

  editingWorkId = null;
  save();
  closeModal('m-work');
  renderLedger();
  toast('Work entry saved');
}

function openMarkPaid(id) {
  document.getElementById('mp-id').value   = id;
  document.getElementById('mp-date').value = today();
  openModal('m-markpaid');
}

function confirmPaid() {
  const id  = document.getElementById('mp-id').value;
  const idx = DB.ledger.findIndex(e => e.id === id);
  if (idx < 0) return;

  DB.ledger[idx].paid        = true;
  DB.ledger[idx].status      = 'Paid';
  DB.ledger[idx].paidDate    = document.getElementById('mp-date').value;
  DB.ledger[idx].paidMethod  = document.getElementById('mp-method').value;
  DB.ledger[idx].paidAccount = document.getElementById('mp-acct').value;

  save();
  closeModal('m-markpaid');
  renderLedger();
  toast('Marked as paid ✓');
}

// ── RENDER ────────────────────────────────────────────────────────────────────

function renderLedger() {
  // Client sidebar
  const cl = document.getElementById('clientList');
  cl.innerHTML = DB.clients.length
    ? DB.clients.map(c => {
        const entries = DB.ledger.filter(e => e.clientId === c.id);
        const pending = entries.filter(e => !e.paid).reduce((s, e) => s + e.price, 0);
        return `
          <div class="client-item ${c.id === selectedClient ? 'active' : ''}" onclick="selectClient('${c.id}')">
            <div class="cn">${esc(c.name)}</div>
            <div class="cs">${entries.length} entries${pending ? ` · <span style="color:var(--red)">${fmt(pending)} pending</span>` : ' · all clear'}</div>
          </div>`;
      }).join('')
    : `<div style="color:var(--muted);font-size:12px;padding:8px">No clients yet. Add one!</div>`;

  // Right panel
  const lr = document.getElementById('ledgerRight');
  if (!selectedClient) {
    lr.innerHTML = `<div class="tbl-empty"><div class="ico">👈</div>Select a client to view their log</div>`;
    return;
  }

  const client = DB.clients.find(c => c.id === selectedClient);
  if (!client) { selectedClient = null; return; }

  const entries = DB.ledger
    .filter(e => e.clientId === selectedClient)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalBilled = entries.reduce((s, e) => s + e.price, 0);
  const totalPaid   = entries.filter(e => e.paid).reduce((s, e) => s + e.price, 0);
  const pending     = totalBilled - totalPaid;

  lr.innerHTML = `
    <div class="flex justify-between items-center flex-wrap gap8" style="margin-bottom:12px">
      <div>
        <div style="font-size:15px;font-weight:700">${esc(client.name)}</div>
        <div style="font-size:11px;color:var(--muted)">${client.email || ''} ${client.phone ? '· ' + client.phone : ''}</div>
      </div>
      <div class="flex gap8 flex-wrap">
        <div style="text-align:right"><div style="font-size:10px;color:var(--muted);text-transform:uppercase">Billed</div><div class="fw6 text-gold">${fmt(totalBilled)}</div></div>
        <div style="text-align:right"><div style="font-size:10px;color:var(--muted);text-transform:uppercase">Received</div><div class="fw6 text-green">${fmt(totalPaid)}</div></div>
        <div style="text-align:right"><div style="font-size:10px;color:var(--muted);text-transform:uppercase">Pending</div><div class="fw6 text-red">${fmt(pending)}</div></div>
      </div>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Work Detail</th><th>Invoice</th><th>Price</th><th>Status</th><th>Payment Info</th><th></th></tr>
        </thead>
        <tbody>
          ${entries.length
            ? entries.map(e => `
                <tr>
                  <td>${fmtD(e.date)}</td>
                  <td style="max-width:200px"><span class="editable" onclick="editWork('${e.id}')" title="Click to edit">${esc(e.workDetail)}</span></td>
                  <td>${e.invoiceNo ? `<span class="badge bp">${esc(e.invoiceNo)}</span>` : `<span class="text-muted" style="font-size:11px">—</span>`}</td>
                  <td class="fw6"><span class="editable" onclick="editWork('${e.id}')" title="Click to edit">${fmt(e.price)}</span></td>
                  <td>${e.paid
                    ? `<span class="badge bg">✓ Paid</span>`
                    : `<button class="btn btn-red btn-xs" onclick="openMarkPaid('${e.id}')">Mark Paid</button>`}
                  </td>
                  <td style="font-size:11px;color:var(--muted)">${e.paid ? `${fmtD(e.paidDate)} · ${e.paidMethod || ''} · ${e.paidAccount || ''}` : '—'}</td>
                  <td>
                    <button class="btn btn-outline btn-xs" onclick="editWork('${e.id}')" style="margin-right:4px">✏</button>
                    <button class="btn btn-red btn-xs" onclick="del('ledger','${e.id}')">✕</button>
                  </td>
                </tr>`).join('')
            : `<tr><td colspan="7"><div class="tbl-empty"><div class="ico">📋</div>No entries yet</div></td></tr>`}
        </tbody>
      </table>
    </div>`;
}
