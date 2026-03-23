/**
 * assets.js — Physical & financial assets tracker
 */

const ASSET_ICONS = {
  Gold: '🥇', Silver: '🥈', Property: '🏠',
  Vehicle: '🚗', Electronics: '💻', Jewellery: '💎', Other: '📦',
};

function addAsset() {
  const name = document.getElementById('a-name').value.trim();
  if (!name) { toast('Enter asset name', 'error'); return; }

  DB.assets.push({
    id:           uid(),
    name,
    type:         document.getElementById('a-type').value,
    qty:          parseFloat(document.getElementById('a-qty').value)      || 0,
    unit:         document.getElementById('a-unit').value,
    buyPrice:     parseFloat(document.getElementById('a-buyprice').value) || 0,
    buyDate:      document.getElementById('a-buydate').value,
    currentPrice: parseFloat(document.getElementById('a-curprice').value) || 0,
    notes:        document.getElementById('a-notes').value,
  });

  save();
  closeModal('m-asset');
  renderAssets();
  toast('Asset added');
  ['a-name','a-qty','a-buyprice','a-curprice','a-notes'].forEach(id => document.getElementById(id).value = '');
}

function updateAssetPrice(id) {
  const a = DB.assets.find(x => x.id === id);
  if (!a) return;
  const p = parseFloat(prompt(`Update current price per ${a.unit} for "${a.name}":`, a.currentPrice));
  if (isNaN(p)) return;
  a.currentPrice = p;
  save();
  renderAssets();
  toast('Price updated');
}

function renderAssets() {
  const grid = document.getElementById('assetGrid');
  const tb   = document.getElementById('tb-assets');

  if (!DB.assets.length) {
    grid.innerHTML = '';
    tb.innerHTML   = `<tr><td colspan="9"><div class="tbl-empty"><div class="ico">🏆</div>No assets yet</div></td></tr>`;
    return;
  }

  grid.innerHTML = DB.assets.map(a => {
    const bv = (a.buyPrice     || 0) * (a.qty || 0);
    const cv = (a.currentPrice || 0) * (a.qty || 0);
    const g  = cv - bv;
    const gp = bv ? (g / bv * 100).toFixed(1) : 0;

    return `
      <div class="asset-card">
        <div style="font-size:26px;margin-bottom:6px">${ASSET_ICONS[a.type] || '📦'}</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:3px">${esc(a.name)}</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:10px">${a.qty} ${a.unit} · ${fmtD(a.buyDate)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
          <div style="background:var(--s2);border-radius:6px;padding:8px">
            <div style="font-size:10px;color:var(--muted);text-transform:uppercase">Buy Value</div>
            <div style="font-weight:700;font-size:13px;margin-top:2px">${fmt(bv)}</div>
          </div>
          <div style="background:var(--s2);border-radius:6px;padding:8px">
            <div style="font-size:10px;color:var(--muted);text-transform:uppercase">Cur Value</div>
            <div style="font-weight:700;font-size:13px;margin-top:2px;color:var(--orange)">${fmt(cv)}</div>
          </div>
        </div>
        <div class="${g >= 0 ? 'text-green' : 'text-red'}" style="font-size:12px;margin-top:8px">
          ${g >= 0 ? '▲' : '▼'} ${fmt(Math.abs(g))} (${Math.abs(gp)}%)
        </div>
        <div class="flex gap8 mt8">
          <button class="btn btn-outline btn-xs" onclick="updateAssetPrice('${a.id}')">Update Price</button>
          <button class="btn btn-red btn-xs" onclick="del('assets','${a.id}')">Remove</button>
        </div>
      </div>`;
  }).join('');

  tb.innerHTML = DB.assets.map(a => {
    const bv = (a.buyPrice     || 0) * (a.qty || 0);
    const cv = (a.currentPrice || 0) * (a.qty || 0);
    const g  = cv - bv;
    return `
      <tr>
        <td><strong>${esc(a.name)}</strong></td>
        <td><span class="badge bo">${a.type}</span></td>
        <td>${a.qty} ${a.unit}</td>
        <td>${fmt(a.buyPrice)}/unit</td>
        <td>${fmtD(a.buyDate)}</td>
        <td><span class="editable" onclick="updateAssetPrice('${a.id}')" title="Click to update">${fmt(a.currentPrice)}/unit</span></td>
        <td class="fw6 text-orange">${fmt(cv)}</td>
        <td class="${g >= 0 ? 'text-green' : 'text-red'} fw6">${g >= 0 ? '+' : ''}${fmt(g)}</td>
        <td><button class="btn btn-red btn-xs" onclick="del('assets','${a.id}')">✕</button></td>
      </tr>`;
  }).join('');
}
