/**
 * excel.js — Excel import / export using SheetJS
 * Matches the FinTrack-Pro-Template.xlsx column layout exactly.
 */

function exportExcel() {
  const wb = XLSX.utils.book_new();

  addSheet(wb, '💰 Income',
    ['Date','From Whom','Category','Payment Method','Account / Wallet','Amount (₹)','Notes'],
    DB.income.map(e => [e.date, e.fromWhom, e.category, e.method, e.account, e.amount, e.notes])
  );

  addSheet(wb, '💸 Expenses',
    ['Date','Description','Category','Payment Method','Account / Card','Amount (₹)','Notes'],
    DB.expenses.map(e => [e.date, e.desc, e.category, e.method, e.account, e.amount, e.notes])
  );

  addSheet(wb, '👤 Clients',
    ['Client Name','Phone','Email','Address','GSTIN','Notes'],
    DB.clients.map(c => [c.name, c.phone, c.email, c.address, c.gstin, c.notes])
  );

  addSheet(wb, '📋 Ledger',
    ['Date','Client Name','Work Detail','Price (₹)','Invoice No.','Status','Paid Date','Payment Method','Account','Notes'],
    DB.ledger.map(e => [
      e.date,
      e.clientName || getClientName(e.clientId),
      e.workDetail,
      e.price,
      e.invoiceNo,
      e.paid ? 'Paid' : 'Unpaid',
      e.paidDate,
      e.paidMethod,
      e.paidAccount || '',
      e.notes,
    ])
  );

  // Invoice log — unique invoice numbers extracted from ledger
  const seenInv = new Set();
  const invRows = [];
  DB.ledger.filter(e => e.invoiceNo).forEach(e => {
    if (!seenInv.has(e.invoiceNo)) {
      seenInv.add(e.invoiceNo);
      invRows.push([e.invoiceNo, '', getClientName(e.clientId), '', '', '', '', '']);
    }
  });
  addSheet(wb, '🧾 Invoices',
    ['Invoice No.','Invoice Date','Client','Total','Status','Due Date','Payment Date','Notes'],
    invRows
  );

  addSheet(wb, '🏆 Assets',
    ['Asset Name','Type','Quantity','Unit','Buy Price/Unit (₹)','Buy Date','Current Price/Unit (₹)','Notes'],
    DB.assets.map(a => [a.name, a.type, a.qty, a.unit, a.buyPrice, a.buyDate, a.currentPrice, a.notes])
  );

  addSheet(wb, '📈 Investments',
    ['Date','Platform / Fund','Type','Amount Invested (₹)','Current Value (₹)','Notes'],
    DB.investments.map(i => [i.date, i.name, i.type, i.amount, i.currentValue, i.notes])
  );

  addSheet(wb, '🏧 Withdrawals',
    ['Date','Platform / Fund','Reason','Amount (₹)','Notes'],
    DB.withdrawals.map(w => [w.date, w.name, w.reason, w.amount, w.notes])
  );

  XLSX.writeFile(wb, `FinTrack-${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Excel exported!');
}

function addSheet(wb, name, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Auto column widths
  ws['!cols'] = headers.map((h, i) => ({
    wch: Math.max(
      h.length,
      ...rows.map(r => String(r[i] ?? '').length)
    ) + 4,
  }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function importExcel(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'array' });

      // Helper: find sheet by partial name (handles emoji prefix)
      const findSheet = keyword => {
        const key = Object.keys(wb.Sheets).find(k => k.includes(keyword));
        return key ? wb.Sheets[key] : null;
      };

      const toRows = ws => {
        if (!ws) return [];
        return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }).slice(1)
          .filter(r => r.some(c => c !== ''));
      };

      DB.income = toRows(findSheet('Income')).map(r => ({
        id: uid(), date: r[0]||'', fromWhom: r[1]||'', category: r[2]||'',
        method: r[3]||'', account: r[4]||'', amount: parseFloat(r[5])||0, notes: r[6]||'',
      }));

      DB.expenses = toRows(findSheet('Expenses')).map(r => ({
        id: uid(), date: r[0]||'', desc: r[1]||'', category: r[2]||'',
        method: r[3]||'', account: r[4]||'', amount: parseFloat(r[5])||0, notes: r[6]||'',
      }));

      DB.clients = toRows(findSheet('Clients')).map(r => ({
        id: uid(), name: r[0]||'', phone: r[1]||'', email: r[2]||'',
        address: r[3]||'', gstin: r[4]||'', notes: r[5]||'',
      }));

      DB.ledger = toRows(findSheet('Ledger')).map(r => ({
        id: uid(), date: r[0]||'', clientName: r[1]||'', workDetail: r[2]||'',
        price: parseFloat(r[3])||0, invoiceNo: r[4]||'',
        paid: r[5] === 'Paid', status: r[5]||'Unpaid',
        paidDate: r[6]||'', paidMethod: r[7]||'', paidAccount: r[8]||'', notes: r[9]||'',
      }));

      DB.assets = toRows(findSheet('Assets')).map(r => ({
        id: uid(), name: r[0]||'', type: r[1]||'', qty: parseFloat(r[2])||0,
        unit: r[3]||'', buyPrice: parseFloat(r[4])||0, buyDate: r[5]||'',
        currentPrice: parseFloat(r[6])||0, notes: r[7]||'',
      }));

      DB.investments = toRows(findSheet('Investments')).map(r => ({
        id: uid(), date: r[0]||'', name: r[1]||'', type: r[2]||'',
        amount: parseFloat(r[3])||0, currentValue: parseFloat(r[4])||0, notes: r[5]||'',
      }));

      DB.withdrawals = toRows(findSheet('Withdrawals')).map(r => ({
        id: uid(), date: r[0]||'', name: r[1]||'', reason: r[2]||'',
        amount: parseFloat(r[3])||0, notes: r[4]||'',
      }));

      save();
      render();
      toast('✓ Excel imported successfully');
    } catch (err) {
      console.error(err);
      toast('Import failed: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = ''; // reset input
}
