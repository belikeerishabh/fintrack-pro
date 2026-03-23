# FinTrack Pro

> Freelancer Finance Tracker — Income · Expenses · Client Ledger · Invoices · Assets · Investments  
> PWA · Google Sheets sync · Excel import/export · Works on mobile, tablet & desktop

---

## Features

| Section | What you can do |
|---|---|
| 💰 **Income** | Log money from any source — client name, family, anyone. Free-text account/wallet field |
| 💸 **Expenses** | Track every expense with method (UPI/Cash/Card), account label, category |
| 📋 **Ledger** | Per-client work log — description, price, invoice number, paid/unpaid indicator |
| 🧾 **Invoices** | Select work items → generate printable invoice PDF in one click |
| 🏆 **Assets** | Gold, silver, property, electronics — quantity, buy price, current price, gain/loss |
| 📈 **Investments** | Mutual funds, stocks, FDs, PPF — invested amount vs current value |
| 🏧 **Withdrawals** | Track every withdrawal with reason |
| ☁️ **Google Sheets** | Full two-way sync — data lives in your Google Sheet on Drive |
| ⬇️ **Excel** | Export all data to `.xlsx` / import back at any time |

---

## Folder Structure

```
fintrack-pro/
├── index.html          ← App shell (HTML only, no logic)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service worker (offline support)
│
├── css/
│   └── style.css       ← All styles (CSS variables, layout, components)
│
├── js/
│   ├── db.js           ← Data model + localStorage
│   ├── sync.js         ← Google Sheets OAuth + Sheets API read/write
│   ├── excel.js        ← SheetJS Excel import/export
│   ├── ui.js           ← Shared helpers: toast, modal, nav, date selectors
│   ├── income.js       ← Income add + render
│   ├── expenses.js     ← Expense add + render
│   ├── ledger.js       ← Client management + work entries
│   ├── invoice.js      ← Invoice selector + preview generator
│   ├── assets.js       ← Assets add + render
│   ├── investments.js  ← Investments + withdrawals
│   ├── render.js       ← Summary cards + render dispatcher
│   ├── modals.js       ← All modal HTML (injected at runtime)
│   └── app.js          ← Boot, PWA service worker registration
│
└── assets/
    ├── icon-192.svg    ← PWA icon (192×192)
    └── icon-512.svg    ← PWA icon (512×512)
```

---

## Deploy to GitHub Pages (free hosting)

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set Source → **Deploy from a branch** → `main` → `/ (root)`
4. Your app is live at `https://YOUR_USERNAME.github.io/REPO_NAME/`

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fintrack-pro.git
git push -u origin main
```

---

## Connect Google Sheets Sync

### Step 1 — Prepare your Sheet
1. Download **FinTrack-Pro-Template.xlsx** (provided separately)
2. Upload it to Google Drive
3. Right-click → **Open with → Google Sheets**
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  ← THIS PART →  /edit
   ```

### Step 2 — Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `FinTrack`)
3. Go to **APIs & Services → Library** → search **Google Sheets API** → Enable it
4. Go to **APIs & Services → Credentials** → **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Under **Authorized JavaScript Origins**, add your GitHub Pages URL:
   ```
   https://YOUR_USERNAME.github.io
   ```
7. Click **Create** — copy the **Client ID**

### Step 3 — Connect in the app
1. Open the app → tap **⚙ Settings**
2. Paste your **OAuth Client ID**
3. Paste your **Google Sheet ID**
4. Tap **Connect Google Sheets**
5. Approve Google sign-in — done! ✓

Data now syncs automatically every time you save an entry. Use the **↻ Sync Sheets** button to force a manual sync.

---

## Install as Mobile / Desktop App (PWA)

**Android (Chrome):**  
Open the app URL in Chrome → tap the menu (⋮) → **Add to Home Screen**

**iPhone / iPad (Safari):**  
Open the app URL → tap the Share button → **Add to Home Screen**

**Desktop (Chrome / Edge):**  
Look for the install icon (⊕) in the address bar → **Install**

The app works fully offline after first load (Service Worker caches all files).

---

## Excel Backup

- **⬇ Excel** — exports all your data into a `.xlsx` file with 8 sheets  
- **⬆ Import Excel** — reads the `.xlsx` back into the app  
- The Excel file matches the **FinTrack-Pro-Template.xlsx** column layout exactly

Use this as a manual backup or to edit data in bulk in Google Sheets / Excel.

---

## Data Storage

| Location | What's stored |
|---|---|
| Browser `localStorage` | Always — instant load, works offline |
| Google Sheets | When connected — your master database, accessible from any device |

Your data is **never sent to any server** except your own Google Sheet.

---

## Tech Stack

| Library | Purpose |
|---|---|
| Vanilla JS (ES6) | No framework — fast, no build step needed |
| [SheetJS (xlsx)](https://sheetjs.com) | Excel import/export |
| Google Sheets API v4 | Cloud sync |
| Google Identity Services | OAuth 2.0 |
| Service Worker API | Offline PWA |
| CSS Custom Properties | Theming |

---

## Customisation

**Change currency symbol:**  
In `js/ui.js`, find the `fmt` function and replace `₹` with your symbol.

**Add new income/expense categories:**  
In `js/modals.js`, find the relevant `<select>` and add `<option>` tags.

**Change colour scheme:**  
In `css/style.css`, edit the `:root` CSS variables at the top of the file.

---

## License

Personal use. Do not redistribute without permission.
