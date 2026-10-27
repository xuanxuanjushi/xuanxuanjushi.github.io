/**
 * list.js —— 列表页：分类筛选、搜索、排序、加载更多、收藏视图
 * 状态全部走 URL 参数（cat / q / fav），刷新与分享都能复现。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { projects: [] };
  var App = window.App;
  var PAGE = 12;

  var state = {
    cat: App.param('cat') || 'all',
    q: App.param('q') || '',
    sort: 'new',
    shown: PAGE,
    favOnly: App.param('fav') === '1'
  };

  var el = {
    grid: document.getElementById('grid'),
    chips: document.getElementById('chips'),
    title: document.getElementById('pageTitle'),
    sub: document.getElementById('pageSub'),
    count: document.getElementById('count'),
    more: document.getElementById('loadMore'),
    sort: document.getElementById('sortSel'),
    q: document.getElementById('q')
  };

  /* ---------- 数据筛选 ---------- */
  function searchFiltered() {
    var list = (D.projects || []).slice();
    if (state.favOnly) list = list.filter(function (p) { return App.isFav(p.id); });
    if (state.q) {
      var q = state.q.toLowerCase();
      list = list.filter(function (p) {
        return (p.title + ' ' + p.subtitle + ' ' + App.catName(p.cat)).toLowerCase().indexOf(q) > -1;
      });
    }
    return list;
  }

  function sorted(list) {
    var copy = list.slice();
    if (state.sort === 'hot') {
      copy.sort(function (a, b) { return (b.downloads || 0) - (a.downloads || 0); });
    } else if (state.sort === 'free') {
      copy.sort(function (a, b) {
        if (!!a.free !== !!b.free) return a.free ? -1 : 1;
        return (b.downloads || 0) - (a.downloads || 0);
      });
    } else if (state.sort === 'price') {
      copy.sort(function (a, b) {
        return (a.free ? 0 : a.price || 0) - (b.free ? 0 : b.price || 0);
      });
    } else {
      copy.sort(function (a, b) { return String(b.updated).localeCompare(String(a.updated)); });
    }
    return copy;
  }

  function currentList() {
    var list = searchFiltered();
    if (state.cat !== 'all') list = list.filter(function (p) { return p.cat === state.cat; });
    return sorted(list);
  }

  /* ---------- 渲染 ---------- */
  function renderChips(pool) {
    var counts = {};
    pool.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });

    var siteCount = (D.sites || []).length;
    var items = (D.categories || []).map(function (c) {
      var n = c.id === 'all' ? pool.length
        : c.id === 'sites' ? siteCount
        : (counts[c.id] || 0);
      return '<button class="chip' + (state.cat === c.id ? ' on' : '') + '" type="button" data-cat="' + c.id + '">' +
        App.esc(c.name) + ' <b>' + n + '</b></button>';
    });

    el.chips.innerHTML = items.join('');
    Array.prototype.forEach.call(el.chips.querySelectorAll('[data-cat]'), function (btn) {
      btn.addEventListener('click', function () {
        state.cat = btn.getAttribute('data-cat');
        state.shown = PAGE;
        syncUrl();
        paint();
      });
    });
  }

  function paint() {
    var pool = searchFiltered();
    var list = currentList();

    // 收藏网站：渲染站点链接卡（图标 + 名称 + 介绍 + 域名）
    if (state.cat === 'sites') { paintSites(); return; }
    el.grid.className = 'grid-cards';
    if (el.sort) el.sort.style.display = '';

    renderChips(pool);

    // 标题
    var title = '全部资源';
    if (state.favOnly) title = '我的收藏';
    else if (state.q) title = '搜索：' + state.q;
    else if (state.cat !== 'all') title = App.catName(state.cat);

    el.title.textContent = title;
    // 标题已经显示分类名，这里不再重复一次
    el.sub.textContent = '共 ' + list.length + ' 件资源';

    App.setCrumbs(state.favOnly || state.q || state.cat !== 'all'
      ? [{ label: '首页', href: 'index.html' }, { label: title }]
      : [{ label: '首页' }]);

    var shownList = list.slice(0, state.shown);
    App.renderGrid(el.grid, shownList);

    el.count.textContent = '已显示 ' + shownList.length + ' / ' + list.length + ' 件';
    el.more.style.display = list.length > state.shown ? '' : 'none';
  }

  function siteCard(it) {
    var host = '';
    try { host = new URL(it.url).host.replace(/^www\./, ''); } catch (e) { host = it.url; }
    var ini = (it.name || '?').trim().charAt(0).toUpperCase();
    var ico = it.icon
      ? '<img src="' + App.esc(it.icon) + '" alt="">'
      : '<span>' + App.esc(ini) + '</span>';

    return '<a class="site-card" href="' + App.esc(it.url) + '" target="_blank" rel="noopener">' +
      '<span class="site-ico" style="--h:' + (Number(it.hue) || 210) + '">' + ico + '</span>' +
      '<span class="site-main">' +
        '<span class="site-name">' + App.esc(it.name) + App.icon('link') + '</span>' +
        '<span class="site-desc">' + App.esc(it.desc) + '</span>' +
        '<span class="site-host">' + App.esc(host) + '</span>' +
      '</span>' +
    '</a>';
  }

  function paintSites() {
    var q = state.q.toLowerCase();
    var list = (D.sites || []).filter(function (it) {
      return !q || (it.name + ' ' + it.desc + ' ' + it.url).toLowerCase().indexOf(q) > -1;
    });

    renderChips((D.projects || []).slice());

    el.title.textContent = '收藏网站';
    el.sub.textContent = '常用设计资源与开发工具，点开即走';
    App.setCrumbs([{ label: '首页', href: 'index.html' }, { label: '收藏网站' }]);

    el.grid.className = 'site-grid';
    el.grid.innerHTML = list.length
      ? list.map(siteCard).join('')
      : '<div class="empty">没有匹配的站点。</div>';

    el.count.textContent = '共 ' + list.length + ' 个站点';
    el.more.style.display = 'none';
    if (el.sort) el.sort.style.display = 'none';
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.cat !== 'all') p.set('cat', state.cat);
    if (state.q) p.set('q', state.q);
    if (state.favOnly) p.set('fav', '1');
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  /* ---------- 事件 ---------- */
  function bind() {
    el.more.addEventListener('click', function () {
      state.shown += PAGE;
      paint();
    });

    el.sort.addEventListener('change', function () {
      state.sort = el.sort.value;
      state.shown = PAGE;
      paint();
    });

    if (el.q) {
      if (state.q) el.q.value = state.q;
      var timer = null;
      el.q.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = el.q.value.trim();
          state.shown = PAGE;
          syncUrl();
          paint();
        }, 160);
      });
    }

    // 从详情页返回时（bfcache）重新读收藏状态
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) paint();
    });
  }

  function boot() {
    if (!el.grid) return;
    bind();
    paint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
