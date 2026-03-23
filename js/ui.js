/**
 * ui.js — Shared UI helpers [v5]
 */

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const fmt      = n => '₹' + Math.abs(n||0).toLocaleString('en-IN', {maximumFractionDigits:0});
const fmtD     = d => { if(!d) return '—'; const x=new Date(d); return isNaN(x)?String(d):x.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}); };
const fmtDLong = d => { if(!d) return ''; const x=new Date(d); return isNaN(x)?String(d):x.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}); };
const uid      = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const esc      = s  => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const today    = () => new Date().toISOString().split('T')[0];

function selMonth() { return parseInt(document.getElementById('monthSel').value); }
function selYear()  { return parseInt(document.getElementById('yearSel').value);  }
function inPeriod(d) { if(!d) return false; const x=new Date(d); return !isNaN(x)&&x.getMonth()===selMonth()&&x.getFullYear()===selYear(); }
function getClientName(id) { const c=DB.clients.find(x=>x.id===id); return c?c.name:(id||'Unknown'); }
function getBankShort(id)  { if(!id) return '—'; const b=DB.banks.find(x=>x.id===id); return b?b.name:id; }

function amountInWords(amount) {
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function n2w(n) {
    if(n===0) return '';
    if(n<20) return ones[n]+' ';
    if(n<100) return tens[Math.floor(n/10)]+(n%10?' '+ones[n%10]:'')+' ';
    if(n<1000) return ones[Math.floor(n/100)]+' Hundred '+n2w(n%100);
    if(n<100000) return n2w(Math.floor(n/1000))+'Thousand '+n2w(n%1000);
    if(n<10000000) return n2w(Math.floor(n/100000))+'Lakh '+n2w(n%100000);
    return n2w(Math.floor(n/10000000))+'Crore '+n2w(n%10000000);
  }
  const i=Math.floor(Math.abs(amount)), d=Math.round((Math.abs(amount)-i)*100);
  let w=n2w(i).trim()+' Rupees';
  if(d>0) w+=' and '+n2w(d).trim()+' Paise';
  return w+' Only';
}

function populateBankDropdown(elId, selectedId='') {
  const el=document.getElementById(elId); if(!el) return;
  el.innerHTML='<option value="">— Select Account —</option>'+
    DB.banks.map(b=>`<option value="${b.id}" ${b.id===selectedId?'selected':''}>${b.name} (${b.type})</option>`).join('');
}
function populateAllBankDropdowns() {
  ['i-bank','e-bank','w-pbank','mp-bank'].forEach(id=>populateBankDropdown(id));
}

function toast(msg, type='ok') {
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.borderColor=type==='error'?'var(--red)':'var(--green)';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

function openModal(id) { document.getElementById(id).classList.add('open'); setDefaultDates(); populateAllBankDropdowns(); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function setDefaultDates() {
  const t=today();
  ['i-date','e-date','w-date','w-pdate','mp-date','inv-idate','wd-date','a-buydate'].forEach(id=>{
    const el=document.getElementById(id); if(el&&!el.value) el.value=t;
  });
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function showOnboarding() {
  document.getElementById('onboarding').style.display = 'flex';
  document.getElementById('app-content').style.display = 'none';
  document.getElementById('pin-lock').style.display = 'none';
}
function hideOnboarding() {
  document.getElementById('onboarding').style.display = 'none';
  // After onboarding, check PIN
  if (DB.settings.pinEnabled && DB.settings.pin) {
    showPinLock();
  } else {
    showApp();
  }
}

// ── PIN LOCK ──────────────────────────────────────────────────────────────────
function showPinLock() {
  document.getElementById('pin-lock').style.display = 'flex';
  document.getElementById('app-content').style.display = 'none';
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('pin-input').value = '';
  document.getElementById('pin-error').textContent = '';
  // Focus input for keyboard
  setTimeout(() => document.getElementById('pin-input').focus(), 100);
}

function showApp() {
  document.getElementById('pin-lock').style.display = 'none';
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';
  updateUserBadge();
}

function pinKeypress(e) {
  const input = document.getElementById('pin-input');
  if (e.key === 'Enter' || input.value.length === 4) checkPin();
}

function checkPin() {
  const input = document.getElementById('pin-input').value;
  if (!input) return;
  if (hashPin(input) === DB.settings.pin) {
    document.getElementById('pin-error').textContent = '';
    showApp();
  } else {
    document.getElementById('pin-error').textContent = 'Incorrect PIN. Try again.';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
  }
}

// PIN numpad input
function pinPad(digit) {
  const el = document.getElementById('pin-input');
  if (el.value.length < 4) {
    el.value += digit;
    if (el.value.length === 4) setTimeout(checkPin, 150);
  }
}
function pinBackspace() {
  const el = document.getElementById('pin-input');
  el.value = el.value.slice(0, -1);
}

// PIN Reset flow
function showPinResetModal() {
  document.getElementById('pin-reset-step1').style.display = 'block';
  document.getElementById('pin-reset-step2').style.display = 'none';
  document.getElementById('pin-reset-step3').style.display = 'none';
  document.getElementById('m-pin-reset').classList.add('open');
}
function hidePinReset() {
  document.getElementById('m-pin-reset').classList.remove('open');
}

// ── NAV ───────────────────────────────────────────────────────────────────────
let currentTab = 'income';
function switchTab(tab, el) {
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  el.classList.add('active'); currentTab=tab; render();
}
function switchSub(showId, el) {
  const panel=el.closest('.panel');
  panel.querySelectorAll('.sub-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  panel.querySelectorAll('[id^="inv-"]').forEach(d=>d.style.display='none');
  document.getElementById(showId).style.display='block';
}

function initDateSelectors() {
  const ms=document.getElementById('monthSel'), ys=document.getElementById('yearSel'), now=new Date();
  MONTHS.forEach((m,i)=>{ const o=new Option(m,i); if(i===now.getMonth()) o.selected=true; ms.appendChild(o); });
  for(let y=now.getFullYear()-4;y<=now.getFullYear()+1;y++){ const o=new Option(y,y); if(y===now.getFullYear()) o.selected=true; ys.appendChild(o); }
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function openSettings() {
  const s=DB.settings;
  document.getElementById('st-bname').value    = s.businessName  ||'';
  document.getElementById('st-btitle').value   = s.businessTitle ||'';
  document.getElementById('st-addr').value     = s.address       ||'';
  document.getElementById('st-phone').value    = s.phone         ||'';
  document.getElementById('st-email').value    = s.email         ||'';
  document.getElementById('st-gstin').value    = s.gstin         ||'';
  document.getElementById('st-pan').value      = s.pan           ||'';
  document.getElementById('st-prefix').value   = s.invoicePrefix ||'INV';
  document.getElementById('st-clientid').value = s.gClientId     ||'';
  document.getElementById('st-sheetid').value  = s.gSheetId      ||'';
  document.getElementById('st-pin-enabled').checked = s.pinEnabled||false;
  const discBtn=document.getElementById('disconnectBtn');
  if(discBtn) discBtn.style.display=s.gConnected?'inline-flex':'none';
  const statusEl=document.getElementById('sheets-status');
  if(statusEl) statusEl.textContent=s.gConnected?`✓ Connected as ${s.gUserEmail}`:'';
  renderBankList();
  openModal('m-settings');
}

function saveSettings() {
  DB.settings.businessName  = document.getElementById('st-bname').value;
  DB.settings.businessTitle = document.getElementById('st-btitle').value;
  DB.settings.address       = document.getElementById('st-addr').value;
  DB.settings.phone         = document.getElementById('st-phone').value;
  DB.settings.email         = document.getElementById('st-email').value;
  DB.settings.gstin         = document.getElementById('st-gstin').value;
  DB.settings.pan           = document.getElementById('st-pan').value;
  DB.settings.invoicePrefix = document.getElementById('st-prefix').value||'INV';
  const cid=document.getElementById('st-clientid').value.trim();
  const sid=document.getElementById('st-sheetid').value.trim();
  if(cid) DB.settings.gClientId=cid;
  if(sid) DB.settings.gSheetId=sid;

  // PIN
  const pinEnabled = document.getElementById('st-pin-enabled').checked;
  const newPin     = document.getElementById('st-new-pin').value.trim();
  if(pinEnabled && /^\d{4}$/.test(newPin)) {
    DB.settings.pin=hashPin(newPin); DB.settings.pinEnabled=true;
    document.getElementById('st-new-pin').value='';
    toast('PIN set successfully 🔒');
  } else if(!pinEnabled) {
    DB.settings.pinEnabled=false; DB.settings.pin='';
  }
  save(); closeModal('m-settings'); toast('Settings saved');
}

// ── BANKS ─────────────────────────────────────────────────────────────────────
function addBank() {
  const name=document.getElementById('b-name').value.trim();
  if(!name){ toast('Enter bank name','error'); return; }
  DB.banks.push({ id:uid(), name, type:document.getElementById('b-type').value,
    accountNumber:document.getElementById('b-accno').value.trim(),
    ifsc:document.getElementById('b-ifsc').value.trim(),
    openingBalance:parseFloat(document.getElementById('b-opening').value)||0 });
  ['b-name','b-accno','b-ifsc','b-opening'].forEach(id=>document.getElementById(id).value='');
  save(); renderBankList(); toast('Bank added');
}
function delBank(id) {
  if(id==='cash'){ toast("Can't delete Cash",'error'); return; }
  DB.banks=DB.banks.filter(b=>b.id!==id); save(); renderBankList();
}
function renderBankList() {
  const bl=document.getElementById('bankList'); if(!bl) return;
  bl.innerHTML=DB.banks.map(b=>`
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--s2);border-radius:6px;padding:9px 12px;margin-bottom:6px">
      <div>
        <span style="font-weight:600;font-size:13px">🏦 ${esc(b.name)}</span>
        <span class="badge bm" style="margin-left:6px">${b.type}</span>
        ${b.accountNumber?`<span style="font-size:11px;color:var(--muted);margin-left:6px">···${b.accountNumber.slice(-4)}</span>`:''}
        ${b.openingBalance?`<span style="font-size:11px;color:var(--gold);margin-left:6px">Opening: ${fmt(b.openingBalance)}</span>`:''}
      </div>
      ${b.id!=='cash'?`<button class="btn btn-red btn-xs" onclick="delBank('${b.id}')">✕</button>`:''}
    </div>`).join('');
}
function del(type, id) { if(!confirm('Delete this entry?')) return; DB[type]=DB[type].filter(e=>e.id!==id); save(); render(); }
