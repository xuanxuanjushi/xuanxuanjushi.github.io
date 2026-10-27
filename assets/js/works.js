/**
 * works.js —— 作品集（多媒介）
 * 支持四种媒介：image（灯箱浏览 gallery）/ video（内嵌播放或外链）/ link（外链）/ pdf（新窗口打开）。
 * 新增作品只需往 data.js 的 works 里加一条，type 决定打开方式。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { works: [] };
  var App = window.App;
  var WORKS = D.works || [];

  var TYPE = {
    image: { label: '图片', icon: 'image' },
    video: { label: '视频', icon: 'film' },
    link: { label: '外链', icon: 'link' },
    pdf: { label: 'PDF', icon: 'book' }
  };

  var el = {
    grid: document.getElementById('worksGrid'),
    chips: document.getElementById('worksChips'),
    sub: document.getElementById('worksSub'),
    lb: document.getElementById('lightbox'),
    stage: document.getElementById('lbStage'),
    lbTitle: document.getElementById('lbTitle'),
    lbMeta: document.getElementById('lbMeta'),
    prev: document.getElementById('lbPrev'),
    next: document.getElementById('lbNext'),
    close: document.getElementById('lbClose')
  };

  var state = { type: 'all', index: 0, list: [] };

  /* ---------- 卡片 ---------- */
  function cardHtml(w) {
    var meta = TYPE[w.type || 'image'] || TYPE.image;
    var cover = w.cover || (w.gallery && w.gallery[0]) || '';
    var count = (w.gallery || []).length;

    return '<article class="work-card" data-id="' + App.esc(w.id) + '">' +
      '<button class="work-media" type="button" data-open="' + App.esc(w.id) + '">' +
        (cover
          ? '<img src="' + App.esc(cover) + '" alt="' + App.esc(w.title) + '" loading="lazy">'
          : '<span class="work-ph">' + App.esc(w.title) + '</span>') +
        '<span class="work-type">' + App.icon(meta.icon) + meta.label +
          (w.type === 'image' && count > 1 ? ' · ' + count : '') + '</span>' +
      '</button>' +
      '<div class="work-body">' +
        '<div class="work-head">' +
          '<h3>' + App.esc(w.title) + '</h3>' +
          '<span class="work-year">' + App.esc(w.year || '') + '</span>' +
        '</div>' +
        '<p class="work-desc">' + App.esc(w.desc) + '</p>' +
        '<div class="tag-row">' + (w.tags || []).map(function (t) {
          return '<span class="tag">' + App.esc(t) + '</span>';
        }).join('') + '</div>' +
      '</div>' +
    '</article>';
  }

  function paint() {
    var list = state.type === 'all'
      ? WORKS
      : WORKS.filter(function (w) { return (w.type || 'image') === state.type; });

    state.list = list;

    el.grid.innerHTML = list.length
      ? list.map(cardHtml).join('')
      : '<div class="empty">这个媒介下还没有作品。</div>';

    el.sub.textContent = '共 ' + WORKS.length + ' 件 · 当前显示 ' + list.length + ' 件';
  }

  function paintChips() {
    var types = ['all'].concat(Object.keys(TYPE).filter(function (t) {
      return WORKS.some(function (w) { return (w.type || 'image') === t; });
    }));

    el.chips.innerHTML = types.map(function (t) {
      var n = t === 'all' ? WORKS.length : WORKS.filter(function (w) { return (w.type || 'image') === t; }).length;
      var label = t === 'all' ? '全部' : TYPE[t].label;
      return '<button class="chip' + (state.type === t ? ' on' : '') + '" type="button" data-type="' + t + '">' +
        label + ' <b>' + n + '</b></button>';
    }).join('');

    Array.prototype.forEach.call(el.chips.querySelectorAll('[data-type]'), function (btn) {
      btn.addEventListener('click', function () {
        state.type = btn.getAttribute('data-type');
        paintChips();
        paint();
      });
    });
  }

  /* ---------- 灯箱 ---------- */
  function openWork(id) {
    var w = WORKS.filter(function (x) { return x.id === id; })[0];
    if (!w) return;

    if (w.type === 'link' || w.type === 'pdf') {
      window.open(w.href || w.cover, '_blank', 'noopener');
      return;
    }

    state.index = WORKS.indexOf(w);
    el.lb.hidden = false;
    document.body.style.overflow = 'hidden';
    renderSlide();
  }

  function renderSlide() {
    var w = state.list[state.index] || WORKS[state.index];
    if (!w) return;

    el.stage.innerHTML = '';

    if (w.type === 'video') {
      if (/\.(mp4|webm|ogg)(\?|$)/i.test(w.video || '')) {
        var v = document.createElement('video');
        v.src = w.video;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        el.stage.appendChild(v);
      } else {
        el.stage.innerHTML = '<a class="lb-link" href="' + App.esc(w.video || w.href || '#') + '" target="_blank" rel="noopener">在外部打开视频 ↗</a>';
      }
    } else {
      var img = document.createElement('img');
      img.src = w.gallery[state.galleryIdx] || w.cover;
      img.alt = w.title;
      el.stage.appendChild(img);
    }

    el.lbTitle.textContent = w.title;
    var total = w.type === 'image' ? (w.gallery || []).length : 1;
    el.lbMeta.textContent = (state.galleryIdx + 1) + ' / ' + total + ' · ' + (w.year || '') +
      ' · ' + (TYPE[w.type || 'image'] || TYPE.image).label;

    el.prev.style.display = state.list.length > 1 ? '' : 'none';
    el.next.style.display = state.list.length > 1 ? '' : 'none';
  }

  function step(dir) {
    if (!state.list.length) return;
    var w = state.list[state.index];
    var gallery = w.gallery || [];

    // 同一作品多图时先翻图，翻完再切下一件
    if (w.type === 'image' && gallery.length > 1 && dir > 0 && state.galleryIdx < gallery.length - 1) {
      state.galleryIdx++;
      renderSlide();
      return;
    }
    if (w.type === 'image' && gallery.length > 1 && dir < 0 && state.galleryIdx > 0) {
      state.galleryIdx--;
      renderSlide();
      return;
    }

    state.index = (state.index + dir + state.list.length) % state.list.length;
    state.galleryIdx = 0;
    renderSlide();
  }

  function closeLb() {
    el.lb.hidden = true;
    el.stage.innerHTML = '';
    document.body.style.overflow = '';
  }

  function bind() {
    el.grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open]');
      if (!btn) return;
      state.galleryIdx = 0;
      openWork(btn.getAttribute('data-open'));
    });

    el.close.addEventListener('click', closeLb);
    el.prev.addEventListener('click', function () { step(-1); });
    el.next.addEventListener('click', function () { step(1); });

    el.lb.addEventListener('click', function (e) {
      if (e.target === el.lb) closeLb();
    });

    document.addEventListener('keydown', function (e) {
      if (el.lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  function boot() {
    if (!el.grid) return;
    App.setCrumbs([{ label: '首页', href: 'index.html' }, { label: '我的作品集' }]);
    paintChips();
    paint();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
