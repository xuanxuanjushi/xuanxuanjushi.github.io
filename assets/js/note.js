/**
 * note.js —— 笔记正文（富内容块）
 * 支持的块类型见 data.js 注释：h2 / p / quote / list / code / img / video / demo。
 * demo 块会把前端页面塞进 iframe 直接跑起来——这就是「把效果做出来」的那部分。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { notes: [] };
  var App = window.App;
  var NOTES = D.notes || [];

  var el = {
    head: document.getElementById('noteHead'),
    body: document.getElementById('noteBody'),
    foot: document.getElementById('noteFoot'),
    side: document.getElementById('noteSide')
  };

  /* ---------- 各类型块 ---------- */
  var RENDER = {
    h2: function (b, i) {
      return '<h2 class="nb-h2" id="sec-' + i + '">' + App.esc(b.text) + '</h2>';
    },
    p: function (b) {
      return '<p class="nb-p">' + App.esc(b.text) + '</p>';
    },
    quote: function (b) {
      return '<blockquote class="nb-quote"><p>' + App.esc(b.text) + '</p>' +
        (b.by ? '<cite>' + App.esc(b.by) + '</cite>' : '') + '</blockquote>';
    },
    list: function (b) {
      var tag = b.ordered ? 'ol' : 'ul';
      return '<' + tag + ' class="nb-list' + (b.ordered ? ' is-ordered' : '') + '">' +
        (b.items || []).map(function (t) { return '<li>' + App.esc(t) + '</li>'; }).join('') +
        '</' + tag + '>';
    },
    code: function (b) {
      return '<div class="nb-code">' +
        '<div class="nb-code-bar"><span>' + App.esc(b.lang || 'code') + '</span></div>' +
        '<pre><code>' + App.esc(b.code) + '</code></pre></div>';
    },
    img: function (b) {
      return '<figure class="nb-fig">' +
        '<img src="' + App.esc(b.src) + '" alt="' + App.esc(b.alt || '') + '" loading="lazy" data-zoom="' + App.esc(b.src) + '">' +
        (b.caption ? '<figcaption>' + App.esc(b.caption) + '</figcaption>' : '') +
        '</figure>';
    },
    video: function (b) {
      var isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(b.src || '');
      if (isFile) {
        return '<figure class="nb-fig">' +
          '<video src="' + App.esc(b.src) + '"' + (b.poster ? ' poster="' + App.esc(b.poster) + '"' : '') +
          ' controls playsinline preload="metadata"></video>' +
          (b.caption ? '<figcaption>' + App.esc(b.caption) + '</figcaption>' : '') +
          '</figure>';
      }
      return '<div class="nb-demo"><div class="nb-demo-bar"><b>' + App.esc(b.caption || '视频') + '</b></div>' +
        '<div class="nb-embed" style="height:' + (Number(b.height) || 420) + 'px">' +
        '<iframe src="' + App.esc(b.src) + '" allowfullscreen loading="lazy" title="视频"></iframe></div></div>';
    },
    demo: function (b) {
      return '<div class="nb-demo">' +
        '<div class="nb-demo-bar">' +
          '<b>' + App.esc(b.title || '效果预览') + '</b>' +
          '<span class="nb-demo-tag">可直接操作</span>' +
          '<a href="' + App.esc(b.src) + '" target="_blank" rel="noopener">新窗口打开 ↗</a>' +
        '</div>' +
        '<iframe src="' + App.esc(b.src) + '" loading="lazy" title="' + App.esc(b.title || '效果预览') + '"' +
          ' style="height:' + (Number(b.height) || 520) + 'px"></iframe>' +
      '</div>';
    }
  };

  /* ---------- 页面 ---------- */
  function renderHead(n) {
    document.title = n.title + ' · 学习笔记';
    el.head.innerHTML =
      '<div class="article-meta">' +
        '<span>' + App.esc(n.date) + '</span>' +
        '<span class="dot"></span>' +
        '<span>' + App.esc(n.minutes || 5) + ' 分钟读完</span>' +
        '<span class="dot"></span>' +
        '<span>' + (n.tags || []).map(function (t) { return '<span class="tag">' + App.esc(t) + '</span>'; }).join('') + '</span>' +
      '</div>' +
      '<h1>' + App.esc(n.title) + '</h1>' +
      '<p class="article-lead">' + App.esc(n.summary) + '</p>';
  }

  function renderBody(n) {
    var blocks = n.blocks || [];
    el.body.innerHTML = blocks.map(function (b, i) {
      var fn = RENDER[b.t];
      return fn ? fn(b, i) : '';
    }).join('');

    // 图片点击放大
    Array.prototype.forEach.call(el.body.querySelectorAll('[data-zoom]'), function (img) {
      img.addEventListener('click', function () {
        window.open(img.getAttribute('data-zoom'), '_blank', 'noopener');
      });
    });
  }

  function renderSide(n) {
    var heads = (n.blocks || []).map(function (b, i) {
      return b.t === 'h2' ? { text: b.text, id: 'sec-' + i } : null;
    }).filter(Boolean);

    var toc = heads.length
      ? '<section class="panel"><div class="panel-head"><h2>本文目录</h2></div>' +
        '<div class="panel-body"><nav class="toc">' +
        heads.map(function (h) {
          return '<a href="#' + h.id + '">' + App.esc(h.text) + '</a>';
        }).join('') + '</nav></div></section>'
      : '';

    var related = NOTES.filter(function (x) { return x.id !== n.id; }).slice(0, 3);
    var rel = related.length
      ? '<section class="panel"><div class="panel-head"><h2>接着看</h2></div><div class="panel-body"><div class="rel-list">' +
        related.map(function (r) {
          return '<a href="note.html?id=' + encodeURIComponent(r.id) + '">' +
            '<span>' + App.esc(r.title) + '</span><em>' + App.esc(r.date) + '</em></a>';
        }).join('') + '</div></div></section>'
      : '';

    el.side.innerHTML = toc + rel;

    // 目录平滑滚动
    Array.prototype.forEach.call(el.side.querySelectorAll('.toc a'), function (a) {
      a.addEventListener('click', function (e) {
        var t = document.getElementById(a.getAttribute('href').slice(1));
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      });
    });
  }

  function renderFoot(n) {
    var i = NOTES.indexOf(n);
    var prev = NOTES[i + 1];
    var next = NOTES[i - 1];

    el.foot.innerHTML =
      (prev ? '<a href="note.html?id=' + encodeURIComponent(prev.id) + '"><em>← 上一篇</em><span>' + App.esc(prev.title) + '</span></a>' : '<span></span>') +
      (next ? '<a class="next" href="note.html?id=' + encodeURIComponent(next.id) + '"><em>下一篇 →</em><span>' + App.esc(next.title) + '</span></a>' : '<span></span>');
  }

  function boot() {
    if (!el.head) return;

    var id = App.param('id');
    var n = id
      ? NOTES.filter(function (x) { return x.id === id; })[0]
      : NOTES.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); })[0];

    if (!n) {
      el.head.innerHTML = '<h1>笔记不存在</h1><p class="article-lead">链接可能已失效，返回列表重新选择。</p>';
      el.body.innerHTML = '<p class="nb-p"><a href="notes.html" style="color:var(--accent-text)">← 返回学习笔记</a></p>';
      el.side.innerHTML = '';
      App.setCrumbs([{ label: '首页', href: 'index.html' }, { label: '学习笔记', href: 'notes.html' }, { label: '不存在' }]);
      return;
    }

    App.setCrumbs([
      { label: '首页', href: 'index.html' },
      { label: '学习笔记', href: 'notes.html' },
      { label: n.title }
    ]);

    renderHead(n);
    renderBody(n);
    renderSide(n);
    renderFoot(n);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
