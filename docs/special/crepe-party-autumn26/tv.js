/* 居酒家あつこ — 10-second TV carousel. Reuses the mobile gallery's crepes.json and images. */
(() => {
  'use strict';

  const SLIDE_MS = 10_000;
  const DATA_URL = 'data/crepes.json';
  const photos = [
    document.getElementById('tv-photo-a'),
    document.getElementById('tv-photo-b')
  ];
  const status = document.getElementById('tv-status');
  const category = document.getElementById('tv-category');
  const caption = document.getElementById('tv-caption');
  const counter = document.getElementById('tv-count');
  const progress = document.getElementById('tv-progress');
  const toggle = document.getElementById('tv-toggle');
  const prev = document.getElementById('tv-prev');
  const next = document.getElementById('tv-next');

  let slides = [];
  let categoryLabels = new Map();
  let index = 0;
  let activeSlot = 0;
  let timer = null;
  let paused = false;
  let switching = false;

  function stopTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    progress.style.animationPlayState = 'paused';
  }

  function startTimer() {
    stopTimer();
    if (paused || document.hidden || !slides.length) return;
    // Rewind the timer bar to exactly ten seconds on each new slide.
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = 'tv-fill ' + SLIDE_MS + 'ms linear forwards';
    progress.style.animationPlayState = 'running';
    timer = window.setTimeout(() => { void move(1); }, SLIDE_MS);
  }

  async function readyImage(img, src) {
    if (img.getAttribute('src') !== src) img.src = src;
    if (typeof img.decode === 'function') {
      await img.decode();
    } else if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, {once: true});
        img.addEventListener('error', reject, {once: true});
      });
    }
    if (!img.naturalWidth) throw new Error('画像を読み込めません: ' + src);
  }

  async function showSlide(target, first = false) {
    if (switching || !slides.length) return;
    switching = true;
    stopTimer();
    const newIndex = (target + slides.length) % slides.length;
    const item = slides[newIndex];
    const targetSlot = first ? 0 : 1 - activeSlot;
    const incoming = photos[targetSlot];
    try {
      incoming.alt = item.alt || item.name;
      await readyImage(incoming, item.image);

      if (!first) photos[activeSlot].classList.remove('is-visible');
      incoming.classList.add('is-visible');
      photos[1 - targetSlot].setAttribute('aria-hidden', 'true');
      incoming.removeAttribute('aria-hidden');

      activeSlot = targetSlot;
      index = newIndex;
      category.textContent = categoryLabels.get(item.category) || item.category;
      caption.textContent = item.caption || '';
      counter.textContent = String(newIndex + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      status.hidden = true;

      // Cache the next image before its turn (all photos remain uncropped).
      const upcoming = slides[(newIndex + 1) % slides.length];
      const preload = new Image();
      preload.src = upcoming.image;
    } catch (error) {
      console.error('TV slide:', error);
      status.hidden = false;
      status.textContent = '写真を読み込めませんでした。画像のパスを確認してください。';
    } finally {
      switching = false;
      startTimer();
    }
  }

  async function move(delta) {
    if (switching || !slides.length) return;
    await showSlide(index + delta);
  }

  function setPaused(value) {
    paused = value;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '再生 ▶' : '一時停止 Ⅱ';
    if (paused) stopTimer();
    else startTimer();
  }

  toggle.addEventListener('click', () => setPaused(!paused));
  prev.addEventListener('click', () => { void move(-1); });
  next.addEventListener('click', () => { void move(1); });

  document.addEventListener('keydown', (event) => {
    const node = document.activeElement;
    const typing = node && /INPUT|TEXTAREA|SELECT/.test(node.tagName);
    if (typing || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); void move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); void move(-1); }
    if (event.key === ' ' && node !== toggle && node !== prev && node !== next) {
      event.preventDefault();
      setPaused(!paused);
    }
    if (event.key.toLowerCase() === 'f' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else startTimer();
  });

  async function init() {
    try {
      const response = await fetch(DATA_URL, {cache: 'no-store'});
      if (!response.ok) throw new Error('crepes.json HTTP ' + response.status);
      const data = await response.json();
      if (!data || !Array.isArray(data.crepes)) throw new Error('crepes 配列がありません');

      categoryLabels = new Map(
        (Array.isArray(data.categories) ? data.categories : [])
          .map(group => [String(group.id), String(group.label || group.id)])
      );
      slides = data.crepes
        .filter(item => item && item.image)
        .map((item, i) => ({
          name: String(item.name || 'クレープ'),
          category: String(item.category || 'その他'),
          caption: String(item.caption || ''),
          image: String(item.image),
          alt: String(item.alt || item.name || 'クレープの写真'),
          order: Number.isFinite(Number(item.order)) ? Number(item.order) : i + 1
        }))
        .sort((a, b) => a.order - b.order);

      if (!slides.length) throw new Error('表示できるクレープがありません');
      await showSlide(0, true);
    } catch (error) {
      console.error('TV gallery load:', error);
      status.hidden = false;
      status.textContent = 'クレープを読み込めません。data/crepes.json と配信設定を確認してください。';
      toggle.disabled = true;
      prev.disabled = true;
      next.disabled = true;
    }
  }

  void init();
})();
