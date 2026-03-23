/**
 * investments.js — Investments and withdrawals
 */

function addInvestment() {
  const n = document.getElementById('inv-name').value.trim();
  if (!n) { toast('Enter platform/fund name', 'error'); return; }

  DB.investments.push({
    id:           uid(),
    name:         n,
    type:         document.getElementById('inv-type').value,
    amount:       parseFloat(document.getElementById('inv-amt').value)    || 0,
    date:         document.getElementById('inv-idate').value,
    currentValue: parseFloat(document.getElementById('inv-curval').value) || 0,
    notes:        document.getElementById('inv-notes').value,
  });

  save();
  closeModal('m-investment');
  renderInvestments();
  toast('Investment added');
  ['inv-name','inv-amt','inv-curval','inv-notes'].forEach(id => document.getElementById(id).value = '');
}

function addWithdrawal() {
  const n = document.getElementById('wd-name').value.trim();
  if (!n) { toast('Enter platform name', 'error'); return; }

  DB.withdrawals.push({
    id:     uid(),
    name:   n,
    reason: document.getElementById('wd-reason').value,
    amount: parseFloat(document.getElementById('wd-amt').value) || 0,
    date:   document.getElementById('wd-date').value,
    notes:  document.getElementById('wd-notes').value,
  });

  save();
  closeModal('m-withdrawal');
  renderInvestments();
  toast('Withdrawal added');
  ['wd-name','wd-amt','wd-notes'].forEach(id => document.getElementById(id).value = '');
}

function renderInvestments() {
  // Investments table
  const inv = DB.investments
    .filter(e => inPeriod(e.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById('tb-investment').innerHTML = inv.length
    ? inv.map(e => {
        const g = e.currentValue ? e.currentValue - e.amount : null;
        return `
          <tr>
            <td>${fmtD(e.date)}</td>
            <td><strong>${esc(e.name)}</strong></td>
            <td><span class="badge bb">${esc(e.type)}</span></td>
            <td class="fw6" style="color:var(--blue)">${fmt(e.amount)}</td>
            <td>${e.currentValue ? fmt(e.currentValue) : '—'}</td>
            <td>${g !== null ? `<span class="${g >= 0 ? 'text-green' : 'text-red'} fw6">${g >= 0 ? '+' : ''}${fmt(g)}</span>` : '—'}</td>
            <td class="text-muted">${esc(e.notes) || '—'}</td>
            <td><button class="btn btn-red btn-xs" onclick="del('investments','${e.id}')">✕</button></td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="8"><div class="tbl-empty"><div class="ico">📈</div>No investments this month</div></td></tr>`;

  // Withdrawals table
  const wd = DB.withdrawals
    .filter(e => inPeriod(e.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById('tb-withdrawal').innerHTML = wd.length
    ? wd.map(e => `
        <tr>
          <td>${fmtD(e.date)}</td>
          <td><strong>${esc(e.name)}</strong></td>
          <td><span class="badge bp">${esc(e.reason)}</span></td>
          <td class="fw6" style="color:var(--purple)">${fmt(e.amount)}</td>
          <td class="text-muted">${esc(e.notes) || '—'}</td>
          <td><button class="btn btn-red btn-xs" onclick="del('withdrawals','${e.id}')">✕</button></td>
        </tr>`).join('')
    : `<tr><td colspan="6"><div class="tbl-empty"><div class="ico">🏧</div>No withdrawals this month</div></td></tr>`;
}
