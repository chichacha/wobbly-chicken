# 🏮 居酒家あつこ — V1.8 (Google Sheets + 傾いたお品書き + A4)

**小さなお店に、小さな遊び心。**

A mobile-first, invitation-only home-izakaya microsite built using **Quarto + vanilla JS + CSS + two published Google Sheets CSV tabs**. It has **no prices**, no account system, no guest data, no Google Sheets API key, and **no QR code yet**.

## What's included

- **Home** (`index.qmd`) — Atsuko's logo, animated little noren, newest menu, owner note, dynamic categories, funny one-liners, random dish picker, friendly house rules.
- **A4 printable menu** (`print.qmd`) — black-and-white, date-specific, printable from either the latest menu or an archive date; save as PDF via browser print dialog. Out-of-stock dishes are omitted.
- **Archive** (`archive.qmd`) — a date picker and browsable preserved menus, with original category names and descriptions for each night.
- **Mobile-first design** — readable on small phones; horizontal scroll for dynamic menu categories; touch-friendly controls; respects *reduced motion*.
- **Branding** — handmade paper / brown / cheerful red, with the supplied 「あ」 favicon as an upper-left sticker and monochrome print accent. Google Fonts: Zen Maru Gothic + DM Sans (the original V1.6 pairing). The lightly tilted cards and 「あ」 favicon sticker remain.

## Preview the Quarto site

```bash
quarto preview
```

Or render the website for a static host:

```bash
quarto render
```

Quarto builds the complete site in `docs/` (including `index.html`, `archive.html`, `print.html`, CSS, JS, fallback CSV and logo images). For a personal friends-only hobby site, you can publish this folder through a static hosting service such as GitHub Pages. **The site is not access-controlled**: do not put the home address or private guest details in public CSVs.

**Without Quarto:** there are also self-contained markup previews of the two pages. From this directory run:

```bash
python3 -m http.server 8000
```

Then open:
- http://localhost:8000/preview.html
- http://localhost:8000/preview-archive.html
- http://localhost:8000/preview-print.html

The browser's `file://` mode won't reliably load CSV because it blocks local `fetch` requests. The preview HTML files are just development aids; the source of truth is the `.qmd` pages.

## 🖨 Print a date-specific A4 お品書き (monochrome)

1. Open the homepage and click **「A4のお品書きを印刷・PDF保存」**. Or open **お品書き帳**, select a past date, and click its print link.
2. The site opens `print.html?edition=<edition_id>` (or `preview-print.html` when running the local preview). This reads the **same CSV data** as the rest of the site, so no duplicate print data is maintained.
3. Click **「印刷・PDF保存」** in the print view. In your browser print dialog, choose **Save as PDF**, **A4**, **portrait**, and **black-and-white/grayscale**. Disable browser headers and footers if they appear. The print layout hides its own buttons.
4. Take the saved PDF to a convenience-store printing service (コンビニ); select A4 black-and-white printing.

The print layout is optimized for normal-size menus on **one A4 sheet**, but larger menus may naturally flow to a second page to avoid unreadably small text. The date comes from the `editions` tab — not the visitor's computer clock. Fictional archive examples display a サンプル disclaimer. If an item's `available` is set to `no`, it won't print.

## How the Google Sheets data works (mirrored in local CSV fixtures)

### 1. `editions` tab (`data/editions.csv` for local testing)

| Column | Purpose |
|---|---|
| `edition_id` | Unique ID, e.g. `atsuko-20261107` (must match dish rows below) |
| `date` | Gathering date as `YYYY-MM-DD` |
| `title` | Little title for the night |
| `owner_note` | 店主のひとこと; also preserved in the archive |
| `noren_message` | Extra warm welcome under the note |
| `status` | Exactly **one** row must say `current`; past gatherings say `archived` |
| `demo` | `yes` makes the archive display a visible **サンプル** disclaimer |

### 2. `menu` tab (`data/menu.csv` for local testing)

| Column | Purpose |
|---|---|
| `edition_id` | Must match the edition for this dish |
| `category` | Completely free text, e.g. `お通し`, `麺`, `お椀サイズ` |
| `category_emoji` | Emoji beside the category (defaults to 🍽️) |
| `category_note` | Optional one-liner about the section |
| `item` | Dish or drink name |
| `one_liner` | Funny little caption |
| `available` | `yes` or blank = available; `no`, `×`, `売り切れ` = crossed out and excluded from the randomizer |
| `category_order` | Display order of the category (numeric) |
| `item_order` | Display order of the item within its category (numeric) |

**Adding a category requires no changes to HTML, JS, or CSS:** just add rows with a new `category` string. The category links and cards appear automatically.

## 📝 How Atsuko changes tonight's menu

For a quick change **to the current evening**, edit rows with the current `edition_id` in the Google Sheets `menu` tab; change `owner_note` in the `editions` tab as needed. **No Quarto rebuild or GitHub push is required.** Google’s published CSV updates may take a few minutes.

## 📖 How to preserve an evening and start a new one

1. Open the Google Sheets `editions` tab and change the old `current` row's `status` to `archived`.
2. Add a new row with a **new** `edition_id`, its date, title, note and `status=current`.
3. **Do not delete or alter old dish rows.** In the Google Sheets `menu` tab, copy dishes you want to reuse into **new rows** using the new `edition_id`. Edit/add/remove only the new edition's rows.
4. Wait for Google Sheets to republish the CSV tabs. The old rows become a permanent snapshot, visible at `archive.html`; the new edition becomes the homepage menu.

**Important:** The current date is *not* calculated from the visitor's clock. The `current` flag controls which edition appears. If Atsuko opens on an irregular schedule, this is safer than guessing which menu should be today's.

### Included mock data

- **Current**: 2026-11-07 with **all 17 requested dishes** in お通し / お野菜 / お肉＆お魚 / ドリンク.
- **Archive**: two completely **fictional** sample nights (2026-10-25 and 2026-10-10), visibly labelled サンプル and including examples of `麺`, `本日のスペシャル`, and `お椀サイズ`. Delete these rows when ready for real memories.

The site reads **published Google Sheets tabs** by default. The two local UTF-8 CSV files are sample fixtures, not the live source.

## Tests

```bash
node tests/smoke.test.cjs
```

## Structure

```text
izakaya-atsuko-v1.5/
├── _quarto.yml
├── index.qmd
├── archive.qmd
├── print.qmd
├── _includes/scripts.html
├── css/atsuko.css
├── js/site.js
├── data/editions.csv
├── data/menu.csv
├── assets/atsuko-logo.png
├── assets/favicon.png
├── preview-print.html        # A4 web preview
├── preview.html              # Optional local preview without Quarto
├── preview-archive.html      # Optional local preview without Quarto
└── tests/smoke.test.cjs
```

### Later (not in V1.8)

- Optionally switch to a private backend if you later want protected guest data or authenticated stamp cards
- A printable QR code once the deployed URL is final
- Guest stamps / guest cards (Atsuko would authorize a physical/digital 「あ」 stamp)

*また来てね。次は何が出るか、店主にもわかりません。*

## V1.8 — Google Sheets source and original fonts

**Source tabs (already configured in `js/site.js`):**

```js
const SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGbxO5nCUJlMOzt5tksGU_tM3uvCdgfMrFdxxqi6gdIimWY9mJmJNr_7dQg1tinfkGGiZy5hFmaUb0/pub";
const DATA_URLS = {
  editions: `${SHEET_BASE}?gid=0&single=true&output=csv`,
  menu: `${SHEET_BASE}?gid=581424739&single=true&output=csv`
};
```

The **first row of each tab must contain column headers**:

- `editions` (`gid=0`): `edition_id,date,title,owner_note,noren_message,status,demo`
- `menu` (`gid=581424739`): `edition_id,category,category_emoji,category_note,item,one_liner,available,category_order,item_order`

Column order is flexible, but the header spelling matters. Exactly **one `editions` record should have `status=current`**, and at least one `menu` row must have the matching `edition_id`. Dates can use `YYYY-MM-DD` or `YYYY/M/D`; format date cells as **Plain text** in Sheets if you want to avoid automatic formatting. Old menu editions are preserved as separate rows.

### Publishing settings

In the Google spreadsheet, choose **File → Share → Publish to web**, select the `editions` tab as CSV and publish it; repeat for the `menu` tab. Confirm that **Automatically republish when changes are made** is enabled. Published tabs are public, so do not put private guest names, addresses, or personal information in either tab.

When a browser opens the website it **fetches both published CSV feeds**. If Google Sheets is unreachable or the tab headings are invalid, the site visibly warns that it has fallen back to **local sample CSV**. It will **not allow printing a potentially stale fallback menu**. This is intentional: Atsuko should not accidentally print the wrong dishes.

For development / offline checks, append `?source=local` to any page URL (such as `index.html?source=local`, `archive.html?source=local`, `print.html?source=local`). This explicitly loads the included local CSV fixtures instead of Google Sheets, allowing local print testing.

### What stayed the same

- Zen Maru Gothic (body) + DM Sans (small English labels), matching V1.6. **Yuji Boku and Yomogi were removed.**
- Tilted, irregular menu boards and the favicon sticker at top left are kept from V1.7.
- Today's menu, date archive, interactive random pick, noren, and A4 black-and-white printing all use the same data source.

### Verification

```bash
node tests/smoke.test.cjs
node tests/sheets.test.cjs
quarto preview
```

The remote Google Sheet was supplied by the project owner. This build could not verify the live published CSV responses from this environment; use the site console/network tab and the `editions`/`menu` header list above if the page shows the visible fallback warning.
