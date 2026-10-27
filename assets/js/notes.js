/**
 * notes.js —— 学习笔记列表
 * 卡片按日期倒序，按标签筛选。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { notes: [] };
  var App = window.App;
  var NOTES = (D.notes || []).slice().sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });

  var el = {
    grid: document.getElementById('notesGrid'),
    chips: document.getElementById('notesChips'),
    sub: document.getElementById('notesSub')
  };

  var state = { tag: 'all' };

  function card(n) {
    return '<a class="note-card" href="note.html?id=' + encodeURIComponent(n.id) + '">' +
      '<span class="note-cover">' +
        (n.cover ? '<img src="' + App.esc(n.cover) + '" alt="" loading="lazy">' : '') +
        '<span class="note-date">' + App.esc(n.date) + '</span>' +
      '</span>' +
      '<span class="note-main">' +
        '<span class="note-title">' + App.esc(n.title) + '</span>' +
        '<span class="note-summary">' + App.esc(n.summary) + '</span>' +
        '<span class="note-foot">' +
          (n.tags || []).map(function (t) { return '<span class="tag">' + App.esc(t) + '</span>'; }).join('') +
          '<span class="note-min">' + App.esc(n.minutes || 5) + ' 分钟</span>' +
        '</span>' +
      '</span>' +
    '</a>';
  }

  function paint() {
    var list = state.tag === 'all'
      ? NOTES
      : NOTES.filter(function (n) { return (n.tags || []).indexOf(state.tag) > -1; });

    el.grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="empty">这个标签下还没有笔记。</div>';

    el.sub.textContent = '共 ' + NOTES.length + ' 篇 · 写下来才算真懂';
  }

  function paintChips() {
    var tags = [];
    NOTES.forEach(function (n) {
      (n.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });

    var list = ['all'].concat(tags);
    el.chips.innerHTML = list.map(function (t) {
      var n = t === 'all' ? NOTES.length : NOTES.filter(function (x) { return (x.tags || []).indexOf(t) > -1; }).length;
      return '<button class="chip' + (state.tag === t ? ' on' : '') + '" type="button" data-tag="' + App.esc(t) + '">' +
        (t === 'all' ? '全部' : App.esc(t)) + ' <b>' + n + '</b></button>';
    }).join('');

    Array.prototype.forEach.call(el.chips.querySelectorAll('[data-tag]'), function (btn) {
      btn.addEventListener('click', function () {
        state.tag = btn.getAttribute('data-tag');
        paintChips();
        paint();
      });
    });
  }

  function boot() {
    if (!el.grid) return;
    App.setCrumbs([{ label: '首页', href: 'index.html' }, { label: '学习笔记' }]);
    paintChips();
    paint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
