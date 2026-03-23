/**
 * income.js — Add and render income entries
 */

function addIncome() {
  const amt = parseFloat(document.getElementById('i-amt').value) || 0;
  if (!amt) { toast('Enter an amount', 'error'); return; }

  DB.income.push({
    id:       uid(),
    date:     document.getElementById('i-date').value,
    fromWhom: document.getElementById('i-from').value || 'Unknown',
    category: document.getElementById('i-cat').value,
    method:   document.getElementById('i-method').value,
    account:  document.getElementById('i-acct').value,
    amount:   amt,
    notes:    document.getElementById('i-notes').value,
  });

  save();
  closeModal('m-income');
  render();
  ['i-from','i-amt','i-notes','i-acct'].forEach(id => document.getElementById(id).value = '');
  toast('Income added');
}

function renderIncome() {
  const rows = DB.income
    .filter(e => inPeriod(e.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById('tb-income').innerHTML = rows.length
    ? rows.map(e => `
        <tr>
          <td>${fmtD(e.date)}</td>
          <td><strong>${esc(e.fromWhom)}</strong></td>
          <td><span class="badge bg">${esc(e.category)}</span></td>
          <td><span class="badge bm">${esc(e.method)}</span></td>
          <td style="color:var(--muted2);font-size:12px">${esc(e.account) || '—'}</td>
          <td class="text-muted">${esc(e.notes) || '—'}</td>
          <td class="text-green fw6">${fmt(e.amount)}</td>
          <td><button class="btn btn-red btn-xs" onclick="del('income','${e.id}')">✕</button></td>
        </tr>`).join('')
    : `<tr><td colspan="8"><div class="tbl-empty"><div class="ico">💰</div>No income this month</div></td></tr>`;
}
