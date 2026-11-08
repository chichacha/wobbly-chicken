/* 居酒家あつこ — 出張クレープ特集。Static JSON + no dependencies. */
(() => {
  'use strict';
  const DATA_URL = 'data/crepes.json';
  const gallery = document.getElementById('crepe-cards');
  const filters = document.getElementById('crepe-filters');
  const status = document.getElementById('gallery-status');
  const viewer = document.getElementById('crepe-viewer');
  const viewerImage = document.getElementById('viewer-image');
  const viewerTitle = document.getElementById('viewer-title');
  const viewerCategory = document.getElementById('viewer-category');
  const viewerCaption = document.getElementById('viewer-caption');
  const viewerIngredients = document.getElementById('viewer-ingredients');
  const viewerPosition = document.getElementById('viewer-position');
  const closeButton = document.getElementById('viewer-close');
  const prevButton = document.getElementById('viewer-prev');
  const nextButton = document.getElementById('viewer-next');
  let all = [];
  let visible = [];
  let selectedCategory = 'すべて';
  let activeIndex = 0;
  let previouslyFocused = null;

  function element(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = String(content);
    return el;
  }

  function buildCard(crepe) {
    const card = element('button', 'crepe-card');
    card.type = 'button';
    card.setAttribute('aria-label', crepe.name + 'の写真と材料を見る');
    const img = element('img');
    img.src = crepe.image;
    img.alt = crepe.alt || crepe.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      img.alt = crepe.name + '（画像を読み込めませんでした）';
    }, {once: true});
    const body = element('span', 'crepe-card-body');
    body.append(element('span', 'crepe-card-category', crepe.category));
    body.append(element('span', 'crepe-card-name', crepe.name));
    if (crepe.caption) body.append(element('span', 'crepe-card-caption', crepe.caption));
    card.append(img, body);
    card.addEventListener('click', () => openViewer(crepe.id, card));
    return card;
  }

  function displayList() {
    visible = all.filter(crepe => selectedCategory === 'すべて' || crepe.category === selectedCategory);
    const fragment = document.createDocumentFragment();
    visible.forEach(crepe => fragment.append(buildCard(crepe)));
    gallery.replaceChildren(fragment);
    status.textContent = visible.length + '種類のクレープを表示中 🥞';
  }

  function setupFilters(categories) {
    const options = [{id:'すべて', label:'✨ すべて'}].concat(categories);
    const fragment = document.createDocumentFragment();
    options.forEach(option => {
      const button = element('button', 'crepe-filter', option.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(option.id === selectedCategory));
      button.addEventListener('click', () => {
        selectedCategory = option.id;
        filters.querySelectorAll('.crepe-filter').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
        displayList();
      });
      fragment.append(button);
    });
    filters.replaceChildren(fragment);
  }

  function renderViewer() {
    const crepe = visible[activeIndex];
    if (!crepe) return;
    viewerImage.src = crepe.image;
    viewerImage.alt = crepe.alt || crepe.name;
    viewerTitle.textContent = crepe.name;
    viewerCategory.textContent = crepe.category;
    viewerCaption.textContent = crepe.caption || '';
    viewerIngredients.replaceChildren();
    if (crepe.ingredients.length) {
      viewerIngredients.append(element('strong', '', '入れるもの：'));
      viewerIngredients.append(document.createTextNode(crepe.ingredients.join(' ・ ')));
    }
    if (crepe.optional.length) {
      viewerIngredients.append(element('br'));
      viewerIngredients.append(element('strong', '', 'お好みで：'));
      viewerIngredients.append(document.createTextNode(crepe.optional.join(' ・ ')));
    }
    viewerPosition.textContent = (activeIndex + 1) + ' / ' + visible.length;
  }

  function openViewer(id, trigger) {
    const index = visible.findIndex(crepe => crepe.id === id);
    if (index < 0) return;
    activeIndex = index;
    previouslyFocused = trigger;
    renderViewer();
    viewer.hidden = false;
    document.body.classList.add('crepe-modal-open');
    closeButton.focus();
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove('crepe-modal-open');
    viewerImage.removeAttribute('src');
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  }

  function moveViewer(direction) {
    if (!visible.length) return;
    activeIndex = (activeIndex + direction + visible.length) % visible.length;
    renderViewer();
  }

  closeButton.addEventListener('click', closeViewer);
  prevButton.addEventListener('click', () => moveViewer(-1));
  nextButton.addEventListener('click', () => moveViewer(1));
  viewer.addEventListener('click', event => {
    if (event.target === viewer) closeViewer();
  });
  document.addEventListener('keydown', event => {
    if (viewer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); moveViewer(1); return; }
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveViewer(-1); return; }
    if (event.key === 'Tab') {
      const focusables = [closeButton, prevButton, nextButton];
      const at = focusables.indexOf(document.activeElement);
      if (event.shiftKey && (at === 0 || at < 0)) { event.preventDefault(); nextButton.focus(); }
      else if (!event.shiftKey && (at === focusables.length - 1 || at < 0)) { event.preventDefault(); closeButton.focus(); }
    }
  });

  function setupScrollStory() {
    const steps = [...document.querySelectorAll('.story-step')];
    const stage = document.getElementById('crepe-stage');
    const label = document.getElementById('stage-label');
    const labels = ['まずは、材料を並べます。','あれもこれも、のせちゃおう。','きれいじゃなくても、大成功。','完成！ いただきます 🥞'];
    function activate(index) {
      stage.dataset.step = String(index);
      label.textContent = labels[index];
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    }
    activate(0);
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const candidates = entries.filter(e => e.isIntersecting);
      if (!candidates.length) return;
      candidates.sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      activate(Math.max(0, Math.min(labels.length - 1, Number(candidates[0].target.dataset.step) || 0)));
    }, {rootMargin:'-20% 0px -32% 0px', threshold:[0, .25, .5, .75]});
    steps.forEach(step => observer.observe(step));
  }

  async function loadGallery() {
    try {
      const response = await fetch(DATA_URL, {cache:'no-store'});
      if (!response.ok) throw new Error('crepes.json: HTTP ' + response.status);
      const data = await response.json();
      if (!data || !Array.isArray(data.crepes)) throw new Error('JSONにcrepes配列がありません');
      all = data.crepes.map((item, i) => ({
        id: String(item.id || 'crepe-' + i),
        name: String(item.name || '名前未設定'),
        category: String(item.category || 'その他'),
        image: String(item.image || ''),
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.map(String) : [],
        optional: Array.isArray(item.optional) ? item.optional.map(String) : [],
        caption: String(item.caption || ''),
        alt: String(item.alt || item.name || 'クレープの写真'),
        order: Number.isFinite(Number(item.order)) ? Number(item.order) : i + 1
      })).filter(item => item.image).sort((a,b) => a.order - b.order);
      if (!all.length) throw new Error('クレープのデータがありません');
      const known = new Map((Array.isArray(data.categories) ? data.categories : []).map((c,i) => [
        c.id, {id:c.id, label:c.label || c.id, order:Number(c.order) || i + 1}
      ]));
      all.forEach(c => { if (!known.has(c.category)) known.set(c.category, {id:c.category,label:c.category,order:known.size + 1}); });
      const categories = [...known.values()].filter(c => all.some(item => item.category === c.id)).sort((a,b) => a.order-b.order);
      setupFilters(categories);
      displayList();
    } catch (error) {
      console.error('クレープギャラリーを読み込めません:', error);
      status.textContent = 'あれれ、クレープが見つかりません。data/crepes.json と画像のパスを確認してね。';
      gallery.replaceChildren();
    }
  }

  setupScrollStory();
  loadGallery();
})();