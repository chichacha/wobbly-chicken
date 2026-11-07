/* 居酒家あつこ V1.8 — Google Sheets published CSV for tonight, archive, and A4 printing. */
(() => {
  'use strict';

  // Atsuko edits these two tabs in Google Sheets; no API key or rebuild is necessary.
  const SHEET_BASE =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGbxO5nCUJlMOzt5tksGU_tM3uvCdgfMrFdxxqi6gdIimWY9mJmJNr_7dQg1tinfkGGiZy5hFmaUb0/pub';

  const DATA_URLS = {
    editions: `${SHEET_BASE}?gid=0&single=true&output=csv`,
    menu: `${SHEET_BASE}?gid=581424739&single=true&output=csv`
  };

  // Local CSVs remain as development fixtures and a clearly labelled fallback.
  const LOCAL_URLS = {
    editions: 'data/editions.csv',
    menu: 'data/menu.csv'
  };
  const unavailable = /^(no|false|0|x|×|売り切れ|なし|休み|sold\s*out)$/i;

  // Small RFC4180-style CSV parser. Supports UTF-8 BOM, quoted commas, doubled quotes and newlines.
  function parseCSV(text) {
    const rows = [];
    let cells = [], cell = '', inQuotes = false;
    text = String(text).replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') { cell += '"'; i += 1; }
        else if (!inQuotes && cell !== '') { cell += char; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        cells.push(cell); cell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        cells.push(cell);
        if (cells.some(v => v.trim() !== '')) rows.push(cells);
        cells = []; cell = '';
      } else { cell += char; }
    }
    if (inQuotes) throw new Error('CSVの引用符が閉じられていません');
    cells.push(cell);
    if (cells.some(v => v.trim() !== '')) rows.push(cells);
    if (!rows.length) return [];
    const headers = rows.shift().map(s => s.trim());
    return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, (values[i] || '').trim()])));
  }

  const available = (value = '') => !unavailable.test(String(value).trim());
  const orderOf = (value, fallback) => value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;

  // Create section headers and sort both categories & individual dishes with no fixed list of names.
  function buildGroups(items) {
    const map = new Map();
    items.forEach((row, i) => {
      if (!row.category || !row.item) return;
      if (!map.has(row.category)) {
        map.set(row.category, {
          title: row.category, emoji: row.category_emoji || '🍽️',
          note: row.category_note || '', order: orderOf(row.category_order || '', i + 1),
          first: i, items: []
        });
      }
      map.get(row.category).items.push({
        title: row.item, line: row.one_liner || '', available: available(row.available || ''),
        order: orderOf(row.item_order || '', i + 1), first: i
      });
    });
    return [...map.values()].sort((a, b) => a.order - b.order || a.first - b.first)
      .map(g => ({...g, items: g.items.sort((a, b) => a.order - b.order || a.first - b.first)}));
  }

  // Google Sheets sometimes reformats dates from YYYY-MM-DD to YYYY/M/D.
  function normalizeDate(value) {
    const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(String(value || '').trim());
    if (!m) return String(value || '').trim();
    const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return String(value || '').trim();
    return `${m[1]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function jaDate(value) {
    const iso = normalizeDate(value);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return iso || '日付未設定';
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return new Intl.DateTimeFormat('ja-JP', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(d);
  }

  function el(tag, cls, content) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = String(content); // User data never interpreted as markup.
    return node;
  }

  function renderGroups(groups, grid, nav = null, prefix = 'cat') {
    grid.replaceChildren();
    if (nav) nav.replaceChildren();
    groups.forEach((g, i) => {
      const id = `${prefix}-${i + 1}`;
      if (nav) {
        const link = el('a', 'category-chip', `${g.emoji} ${g.title}`);
        link.href = `#${id}`;
        nav.append(link);
      }
      const card = el('section', 'menu-card');
      card.id = id; card.setAttribute('aria-labelledby', `${id}-title`);
      const header = el('div', 'card-heading');
      header.append(el('span', 'card-emoji', g.emoji));
      const wrap = el('div', 'card-heading-copy');
      const title = el('h3', 'card-title', g.title);
      title.id = `${id}-title`;
      wrap.append(title);
      if (g.note) wrap.append(el('p', 'card-description', g.note));
      header.append(wrap); card.append(header);
      const list = el('ul', 'dish-list');
      g.items.forEach(item => {
        const li = el('li', item.available ? 'dish' : 'dish dish--unavailable');
        li.append(el('p', 'dish-name', item.title));
        if (item.line) li.append(el('p', 'dish-line', item.line));
        if (!item.available) li.append(el('span', 'sold-out', '今日はお休み'));
        list.append(li);
      });
      card.append(list); grid.append(card);
    });
  }

  async function fetchPair(urls) {
    const keys = ['editions', 'menu'];
    const responses = await Promise.all(keys.map(key => fetch(urls[key], { cache: 'no-store' })));
    responses.forEach((response, i) => {
      if (!response.ok) throw new Error(`${keys[i]}: HTTP ${response.status}`);
    });
    const texts = await Promise.all(responses.map(response => response.text()));
    const [editions, items] = texts.map(parseCSV);
    // Explicit header checks: a Google sign-in / error page is not a valid menu CSV.
    const headers = texts.map(text => String(text).replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0].split(',').map(s => s.trim().replace(/^"|"$/g, '')));
    [['edition_id','date','status'], ['edition_id','category','item']].forEach((required, i) => {
      if (!required.every(name => headers[i].includes(name))) {
        throw new Error(`${keys[i]} tab: 必要な列名が見つかりません (${required.join(', ')})`);
      }
    });
    if (!editions.length || !items.length) throw new Error('お品書きのデータが空です');
    const current = currentEdition(editions);
    if (!items.some(item => item.edition_id === current.edition_id && item.category && item.item)) {
      throw new Error('現在のお品書きに一致する料理がありません。edition_id を確認してください');
    }
    return { editions, items };
  }

  async function loadData(mode = '') {
    // ?source=local is a deliberate offline/development mode; regular pages use Google Sheets.
    if (mode === 'local') return { ...await fetchPair(LOCAL_URLS), source: 'local', fallback: false, localMode: true };
    try {
      return { ...await fetchPair(DATA_URLS), source: 'sheets', fallback: false, localMode: false };
    } catch (sheetError) {
      console.warn('Google Sheetsの読み込みに失敗。ローカルのサンプルを使います:', sheetError);
      return {
        ...await fetchPair(LOCAL_URLS), source: 'local', fallback: true, localMode: false,
        sheetError: sheetError.message
      };
    }
  }

  // Keep explicit local test mode when following internal links, including the print view.
  function preserveLocalLinks(root) {
    if (new URLSearchParams(window.location.search).get('source') !== 'local') return;
    root.querySelectorAll('a[href]').forEach(anchor => {
      const url = new URL(anchor.getAttribute('href'), window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.endsWith('.html')) return;
      url.searchParams.set('source', 'local');
      anchor.href = url.href;
    });
  }

  function sourceNotice(data, page) {
    if (!data.fallback && !data.localMode) return;
    const root = document.querySelector('[data-page]');
    if (!root) return;
    preserveLocalLinks(root);
    const message = data.fallback
      ? '⚠️ Google Sheets に接続できません。いま表示しているのはサンプルCSVで、最新のメニューではありません。'
      : '🧪 開発用CSVを表示中です。Google Sheetsに戻すには URL の「?source=local」を外してください。';
    root.prepend(el('div', 'data-source-warning', message));
    if (data.fallback && page === 'print') {
      // Never accidentally print a stale menu as if it were Atsuko's current menu.
      const printButton = document.getElementById('print-button');
      if (printButton) {
        printButton.disabled = true;
        printButton.title = 'Google Sheetsを読み込めないため印刷できません';
      }
      document.getElementById('print-sheet')?.classList.add('print-sheet--fallback');
      const status = document.getElementById('print-status');
      if (status) status.textContent = '最新のデータを取得できなかったため、印刷は停止しています。';
    }
  }

  function currentEdition(editions) {
    const currents = editions.filter(e => (e.status || '').toLowerCase() === 'current');
    if (currents.length !== 1) throw new Error('editions シートには status=current をちょうど1行にしてください');
    return currents[0];
  }

  function home(data) {
    const edition = currentEdition(data.editions);
    const groups = buildGroups(data.items.filter(item => item.edition_id === edition.edition_id));
    if (!groups.length) throw new Error('最新のお品書きに料理がありません');
    document.getElementById('owner-note').textContent = edition.owner_note || '今日も、気楽にかんぱい！';
    document.getElementById('noren-message').textContent = edition.noren_message || '';
    document.getElementById('current-edition-title').textContent = edition.title || '';
    document.getElementById('current-edition-date').textContent = jaDate(edition.date);
    const printLink = document.getElementById('print-current-link');
    if (printLink) printLink.href = `${window.location.pathname.endsWith('preview.html') ? 'preview-print.html' : 'print.html'}?edition=${encodeURIComponent(edition.edition_id)}`;
    const status = document.getElementById('menu-status');
    renderGroups(groups, document.getElementById('menu-grid'), document.getElementById('category-nav'), 'today');
    status.textContent = `${groups.length}つのカテゴリー・${groups.reduce((sum, g) => sum + g.items.length, 0)}品 🍽️`;
    status.classList.add('menu-status--ready');

    const options = groups.flatMap(g => g.items.filter(item => item.available));
    const random = document.getElementById('random-pick');
    const result = document.getElementById('random-result');
    if (options.length) random.disabled = false;
    random.addEventListener('click', () => {
      if (!options.length) return;
      const chosen = options[Math.floor(Math.random() * options.length)];
      result.textContent = `${chosen.title} ✨ ${chosen.line || '今日はこれに決まり！'}`;
      result.classList.remove('random-result--pop');
      void result.offsetWidth;
      result.classList.add('random-result--pop');
    });
  }

  function archive(data) {
    const entries = data.editions.filter(e => (e.status || '').toLowerCase() === 'archived')
      .sort((a, b) => normalizeDate(b.date).localeCompare(normalizeDate(a.date)));
    const select = document.getElementById('archive-date-select');
    const list = document.getElementById('archive-date-list');
    const detail = document.getElementById('archive-detail');
    const status = document.getElementById('archive-status');
    select.replaceChildren();
    list.replaceChildren();
    if (!entries.length) {
      select.disabled = true;
      status.textContent = '過去のお品書きはまだありません。最初の思い出ができたら、ここに登場します。 🍶';
      return;
    }
    select.disabled = false;
    const buttons = new Map();
    entries.forEach(entry => {
      const option = el('option', '', `${jaDate(entry.date)}｜${entry.title || '無題'}`);
      option.value = entry.edition_id;
      select.append(option);
      const button = el('button', 'archive-date-button');
      button.type = 'button';
      button.append(el('span', 'archive-date-main', jaDate(entry.date)));
      button.append(el('span', 'archive-date-caption', entry.title || '気まぐれな夜'));
      if ((entry.demo || '').toLowerCase() === 'yes') button.append(el('span', 'sample-badge', 'サンプル'));
      button.addEventListener('click', () => show(entry.edition_id));
      buttons.set(entry.edition_id, button);
      list.append(button);
    });

    function show(id) {
      const entry = entries.find(e => e.edition_id === id) || entries[0];
      const groups = buildGroups(data.items.filter(item => item.edition_id === entry.edition_id));
      select.value = entry.edition_id;
      buttons.forEach((button, key) => {
        button.classList.toggle('is-selected', key === entry.edition_id);
        button.setAttribute('aria-pressed', String(key === entry.edition_id));
      });
      detail.replaceChildren();
      const heading = el('div', 'archive-detail-heading');
      heading.append(el('p', 'tiny-label', 'A NIGHT TO REMEMBER'));
      heading.append(el('h2', 'archive-detail-title', entry.title || '気まぐれな夜'));
      heading.append(el('p', 'archive-detail-date', jaDate(entry.date)));
      if ((entry.demo || '').toLowerCase() === 'yes') heading.append(el('p', 'archive-demo-note', '※ これはレイアウト確認用の架空のメニューです。'));
      if (entry.owner_note) heading.append(el('blockquote', 'archive-quote', `「${entry.owner_note}」`));
      const printLink = el('a', 'print-menu-link', '🖨 この日のお品書きを印刷・PDF保存 ↗');
      printLink.href = `${window.location.pathname.endsWith('preview-archive.html') ? 'preview-print.html' : 'print.html'}?edition=${encodeURIComponent(entry.edition_id)}`;
      printLink.target = '_blank';
      printLink.rel = 'noopener';
      heading.append(printLink);
      preserveLocalLinks(heading);
      detail.append(heading);
      if (groups.length) {
        const grid = el('div', 'menu-grid archive-grid');
        renderGroups(groups, grid, null, 'past');
        detail.append(grid);
      } else { detail.append(el('p', 'empty-state', 'この日の料理はまだ登録されていません。')); }
      status.textContent = '';
      // Shareable deep-link, while keeping the archive readable without URL parameters.
      const url = new URL(window.location.href);
      url.searchParams.set('date', normalizeDate(entry.date));
      window.history.replaceState(null, '', url);
    }

    select.addEventListener('change', () => show(select.value));
    const requestedDate = new URL(window.location.href).searchParams.get('date');
    const initial = entries.find(e => normalizeDate(e.date) === normalizeDate(requestedDate)) || entries[0];
    show(initial.edition_id);
  }

  // A4 is a dedicated print view: shares exactly the same CSV sources and edition IDs.
  // Avoids printing navigation, animations, color backgrounds or interactive widgets.
  function printMenu(data) {
    document.body.classList.add('atsuko-print-page');
    const params = new URL(window.location.href).searchParams;
    const requestedId = params.get('edition');
    const edition = requestedId
      ? data.editions.find(e => e.edition_id === requestedId)
      : currentEdition(data.editions);
    if (!edition) throw new Error('指定された日付のお品書きが見つかりません');

    const groups = buildGroups(data.items.filter(item => item.edition_id === edition.edition_id));
    if (!groups.length) throw new Error('この日の料理はまだ登録されていません');
    const categoryRoot = document.getElementById('print-categories');
    categoryRoot.replaceChildren();
    let printedCount = 0;
    groups.forEach(group => {
      // Out-of-stock dishes do not appear on the paper menu.
      const dishes = group.items.filter(item => item.available);
      if (!dishes.length) return;
      const section = el('section', 'print-category');
      section.append(el('h2', 'print-category-title', group.title));
      if (group.note) section.append(el('p', 'print-category-note', group.note));
      const list = el('ul', 'print-dish-list');
      dishes.forEach(dish => {
        const item = el('li', 'print-dish');
        item.append(el('p', 'print-dish-name', dish.title));
        if (dish.line) item.append(el('p', 'print-dish-line', dish.line));
        list.append(item); printedCount += 1;
      });
      section.append(list);
      categoryRoot.append(section);
    });
    if (!printedCount) throw new Error('印刷できる料理がありません（available を確認してください）');

    document.getElementById('print-edition-title').textContent = edition.title || '';
    document.getElementById('print-date').textContent = jaDate(edition.date);
    document.title = `居酒家あつこ｜お品書き｜${edition.date}`;
    document.getElementById('print-demo').hidden = (edition.demo || '').toLowerCase() !== 'yes';
    const status = document.getElementById('print-status');
    status.textContent = '';
    document.getElementById('print-sheet').hidden = false;

    const back = document.getElementById('print-back');
    const preview = window.location.pathname.endsWith('preview-print.html');
    back.href = (edition.status || '').toLowerCase() === 'current'
      ? (preview ? 'preview.html' : 'index.html')
      : `${preview ? 'preview-archive.html' : 'archive.html'}?date=${encodeURIComponent(edition.date)}`;
    const button = document.getElementById('print-button');
    button.disabled = false;
    button.addEventListener('click', () => window.print());
  }

  async function init() {
    const page = document.querySelector('[data-page]')?.dataset.page;
    if (!page) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const data = await loadData(params.get('source') || '');
      if (page === 'home') home(data);
      if (page === 'archive') archive(data);
      if (page === 'print') printMenu(data);
      sourceNotice(data, page);
    } catch (error) {
      console.error('居酒家あつこのお品書き読み込みに失敗:', error);
      const status = document.getElementById(page === 'home' ? 'menu-status' : page === 'archive' ? 'archive-status' : 'print-status');
      if (status) { status.textContent = 'あれれ、お品書きが見つかりません。Google Sheetsの公開設定と列名を確認してね 🍶'; status.classList.add('menu-status--error'); }
      const note = document.getElementById('owner-note');
      if (note) note.textContent = '店主からのお便りは、ただいま準備中。';
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
  if (typeof module !== 'undefined' && module.exports) module.exports = { parseCSV, buildGroups, available, jaDate, normalizeDate, currentEdition, fetchPair, loadData, DATA_URLS, LOCAL_URLS };
})();
