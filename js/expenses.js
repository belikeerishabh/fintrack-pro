/**
 * expenses.js [v4] — bank dropdown
 */
function addExpense() {
  const amt = parseFloat(document.getElementById('e-amt').value) || 0;
  if (!amt) { toast('Enter an amount', 'error'); return; }
  DB.expenses.push({
    id: uid(), date: document.getElementById('e-date').value,
    desc:     document.getElementById('e-desc').value || 'Expense',
    category: document.getElementById('e-cat').value,
    method:   document.getElementById('e-method').value,
    bankId:   document.getElementById('e-bank').value,
    amount:   amt,
    notes:    document.getElementById('e-notes').value,
  });
  save(); closeModal('m-expense'); render();
  ['e-desc','e-amt','e-notes'].forEach(id => document.getElementById(id).value = '');
  toast('Expense added');
}

function renderExpenses() {
  const rows = DB.expenses.filter(e => inPeriod(e.date)).sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('tb-expense').innerHTML = rows.length
    ? rows.map(e => `<tr>
        <td>${fmtD(e.date)}</td>
        <td><strong>${esc(e.desc)}</strong></td>
        <td><span class="badge br">${esc(e.category)}</span></td>
        <td><span class="badge bm">${esc(e.method)}</span></td>
        <td><span class="bank-tag">🏦 ${getBankName(e.bankId)}</span></td>
        <td class="text-muted">${esc(e.notes)||'—'}</td>
        <td class="text-red fw6">${fmt(e.amount)}</td>
        <td><button class="btn btn-red btn-xs" onclick="del('expenses','${e.id}')">✕</button></td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="tbl-empty"><div class="ico">💸</div>No expenses this month</div></td></tr>`;
}
