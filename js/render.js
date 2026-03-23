/**
 * render.js — Summary cards + main render dispatcher
 */

function renderSummary() {
  const inc = DB.income     .filter(e => inPeriod(e.date)).reduce((s, e) => s + e.amount, 0);
  const exp = DB.expenses   .filter(e => inPeriod(e.date)).reduce((s, e) => s + e.amount, 0);
  const inv = DB.investments.filter(e => inPeriod(e.date)).reduce((s, e) => s + e.amount, 0);
  const wd  = DB.withdrawals.filter(e => inPeriod(e.date)).reduce((s, e) => s + e.amount, 0);
  const sav = inc - exp - inv + wd;
  const savPct  = inc > 0 ? Math.round(sav / inc * 100) : 0;
  const astVal  = DB.assets.reduce((s, a) => s + ((a.currentPrice || a.buyPrice || 0) * (a.qty || 0)), 0);

  document.getElementById('s-inc').textContent     = fmt(inc);
  document.getElementById('s-inc-sub').textContent = DB.income.filter(e => inPeriod(e.date)).length + ' tx';

  document.getElementById('s-exp').textContent     = fmt(exp);
  document.getElementById('s-exp-sub').textContent = DB.expenses.filter(e => inPeriod(e.date)).length + ' entries';

  document.getElementById('s-inv').textContent     = fmt(inv);
  document.getElementById('s-inv-sub').textContent = DB.investments.filter(e => inPeriod(e.date)).length + ' investments';

  document.getElementById('s-sav').textContent     = fmt(sav);
  document.getElementById('s-sav-sub').textContent = savPct + '% of income';

  document.getElementById('s-ast').textContent     = fmt(astVal);
  document.getElementById('s-ast-sub').textContent = DB.assets.length + ' assets';
}

function render() {
  renderSummary();
  if      (currentTab === 'income')   renderIncome();
  else if (currentTab === 'expense')  renderExpenses();
  else if (currentTab === 'ledger')   renderLedger();
  else if (currentTab === 'assets')   renderAssets();
  else if (currentTab === 'invest')   renderInvestments();
}
