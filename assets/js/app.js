/**
 * app.js —— 内容站公共层
 * 职责：图标、主题、侧栏、搜索、卡片渲染、收藏、轻提示。
 * 数据来源：window.SITE_DATA（P1 阶段为本地假数据，后续替换为 API 调用即可）。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { projects: [], categories: [], navGroups: [], site: {} };
  var FAV_KEY = 'ws.favs';
  var THEME_KEY = 'ws.theme';

  /* ==================== 图标 ==================== */
  var PATHS = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.3-4.3',
    home: 'M3 10.6 12 3l9 7.6V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    star: 'M12 3.6l2.6 5.5 6 .8-4.4 4.2 1.1 5.9-5.3-3-5.3 3 1.1-5.9L3.4 9.9l6-.8z',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.6 2.6M15.4 15.4 18 18M18 6l-2.6 2.6M8.6 15.4 6 18',
    image: 'M3 5h18v14H3zM3 15l5-4.6 4 3.7 3-2.8L21 17',
    box: 'M12 3l8 4.6v8.8L12 21l-8-4.6V7.6zM4 7.6l8 4.6 8-4.6M12 12.2V21',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
    film: 'M3 5h18v14H3zM7.5 5v14M16.5 5v14M3 9.5h4.5M3 14.5h4.5M16.5 9.5H21M16.5 14.5H21',
    book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H19v18H6.5A2.5 2.5 0 0 1 4 18.5zM4 18.5A2.5 2.5 0 0 1 6.5 16H19',
    upload: 'M12 16V4M7.5 8.5 12 4l4.5 4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    rocket: 'M13.5 3.5c3 0 6 1 7 2s2 4 2 7l-4 4-3-1.5L9.5 9 8 6zM8 6 4 7.5 3 11l3.5.5M18 16l-1.5 4-3.5 1-.5-3.5M9 15l-3 3M6 21l-2-2',
    heart: 'M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20z',
    download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M4 20h16',
    check: 'M5 12.5 9.5 17 19 7',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.6v.1',
    shield: 'M12 3l7 3v5.5c0 4.3-3 7.8-7 9.5-4-1.7-7-5.2-7-9.5V6z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
    tag: 'M3.5 11.5 11 4h8a1 1 0 0 1 1 1v8l-7.5 7.5a1 1 0 0 1-1.4 0L3.5 12.9a1 1 0 0 1 0-1.4z M16 8.2v.1',
    monitor: 'M3 5h18v11H3zM9 20h6M12 16v4',
    male: 'M12 11a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM15.4 8.6 20 4M20 4h-4.6M20 4v4.6',
    phone: 'M6.5 3.5h3L11 8l-2 1.4a12.5 12.5 0 0 0 5.6 5.6L16 13l4.5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5.5a2 2 0 0 1 2-2z',
    mail: 'M3 6h18v12H3zM3.5 7l8.5 6 8.5-6',
    github: 'M9.2 20.4c-4-1.2-6.2-4.4-6.2-8.4a9 9 0 0 1 18 0c0 4-2.2 7.2-6.2 8.4M9.2 20.4v-2.6c0-.7.2-1.2.6-1.6-2-.2-4-1.1-4-4.4 0-1 .3-1.8.9-2.4-.1-.3-.4-1.2.1-2.3 0 0 .7-.2 2.4.9a8 8 0 0 1 4.2 0c1.7-1.1 2.4-.9 2.4-.9.5 1.1.2 2 .1 2.3.6.6.9 1.4.9 2.4 0 3.3-2 4.2-4 4.4.4.4.6.9.6 1.6v2.6',
    x: 'M6 6l12 12M18 6L6 18',
    id: 'M3 6h18v12H3zM7.5 10h2.6v4H7.5zM13 10h4.8M13 13.4h4.8',
    package: 'M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM8 5.2v9.4M16 5.2v9.4',
    link: 'M10.5 13.5a4 4 0 0 0 5.7 0l2-2a4 4 0 0 0-5.7-5.7l-1.2 1.2M13.5 10.5a4 4 0 0 0-5.7 0l-2 2a4 4 0 0 0 5.7 5.7l1.2-1.2',
    back: 'M15 5l-7 7 7 7',
    up: 'M12 19V5M6 11l6-6 6 6'
  };

  function icon(name, cls) {
    var d = PATHS[name];
    if (!d) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : '') + '>' +
      '<path d="' + d + '"/></svg>';
  }

  /* ==================== 工具 ==================== */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function imgUrl(key) {
    if (!key) return '';
    return /^(https?:|\/|\.\/|assets\/)/i.test(key) ? key : 'assets/img/covers/' + key + '.jpg';
  }

  /** 详情页、上传页在 admin/ 子目录下，需要 ../ 前缀才能回到站点根 */
  function rootPrefix() {
    return /\/admin\//.test(location.pathname) ? '../' : '';
  }

  function money(p) {
    return p.free || !p.price ? '免费' : '¥' + p.price;
  }

  function num(n) {
    n = Number(n) || 0;
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  function catName(id) {
    var c = (D.categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.name : '';
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function byId(id) {
    return (D.projects || []).filter(function (p) { return p.id === id; })[0] || null;
  }

  /* ==================== 主题 ==================== */
  function initTheme() {
    var t = null;
    try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
    document.documentElement.setAttribute('data-theme', t || 'dark');
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  /* ==================== 收藏 ==================== */
  function favs() {
    try {
      var a = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }

  function isFav(id) { return favs().indexOf(id) > -1; }

  function toggleFav(id) {
    var list = favs();
    var i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
    return i === -1;
  }

  /* ==================== 轻提示 ==================== */
  var toastTimer = null;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.innerHTML = '<i></i>' + esc(msg);
    requestAnimationFrame(function () { el.classList.add('on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2400);
  }

  /* ==================== 卡片 ==================== */
  function cardHtml(p, opts) {
    opts = opts || {};
    var href = (opts.prefix || rootPrefix()) + 'detail.html?id=' + encodeURIComponent(p.id);
    var fav = isFav(p.id);
    var badge = p.badge
      ? '<span class="card-badge' + (p.free ? '' : ' gold') + '">' + esc(p.badge) + '</span>'
      : (p.free ? '<span class="card-badge">免费</span>' : '');

    return '' +
      '<article class="card' + (p.featured ? ' card--wide' : '') + '" data-id="' + esc(p.id) + '"' +
        ' data-cat="' + esc(p.cat) + '" data-search="' + esc((p.title + ' ' + p.subtitle + ' ' + catName(p.cat)).toLowerCase()) + '">' +
        '<a class="card-media" href="' + href + '">' +
          '<img alt="' + esc(p.title) + '" loading="lazy" src="' + esc(imgUrl(p.cover)) + '">' +
          badge +
        '</a>' +
        '<button class="card-fav' + (fav ? ' on' : '') + '" type="button" data-fav="' + esc(p.id) + '" ' +
          'aria-label="收藏' + esc(p.title) + '" title="收藏">' + icon('heart') + '</button>' +
        '<div class="card-body">' +
          '<a class="card-title" href="' + href + '">' + esc(p.title) + '</a>' +
          '<p class="card-sub">' + esc(p.subtitle || '') + '</p>' +
          '<div class="card-foot">' +
            '<span class="tag">' + esc(catName(p.cat)) + '</span>' +
            '<span class="right">' +
              '<span class="dl">' + icon('download') + num(p.downloads) + '</span>' +
              '<span class="price' + (p.free ? ' free' : '') + '">' + money(p) + '</span>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /** 渲染卡片网格，返回渲染数量 */
  function renderGrid(container, list, opts) {
    if (!container) return 0;
    if (!list.length) {
      container.innerHTML = '<div class="empty">没有匹配的资源。试试其它分类或清空搜索关键词。</div>';
      return 0;
    }
    container.innerHTML = list.map(function (p) { return cardHtml(p, opts); }).join('');
    bindImages(container);
    bindFav(container);
    return list.length;
  }

  function bindImages(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.card-media img'), function (img) {
      img.addEventListener('error', function () { img.classList.add('broken'); });
    });
  }

  function bindFav(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-fav]'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute('data-fav');
        var on = toggleFav(id);
        btn.classList.toggle('on', on);
        toast(on ? '已加入收藏' : '已取消收藏');
      });
    });
  }

  /* ==================== 外壳 ==================== */
  /** 侧栏链接：admin/ 子目录下要改写成相对当前目录的路径 */
  function sideHref(href) {
    var pre = rootPrefix();
    if (!pre) return href;
    if (href.indexOf('admin/') === 0) return href.slice(6);   // admin/upload.html → upload.html
    return pre + href;
  }

  function renderSidebar() {
    var host = document.querySelector('[data-sidebar]');
    if (!host) return;

    var here = location.pathname.replace(/\/+$/, '');
    var cat = param('cat');
    var favOnly = param('fav');

    host.innerHTML = (D.navGroups || []).map(function (g) {
      var items = (g.items || []).map(function (it) {
        var href = sideHref(it.href);
        var path = href.split('?')[0];
        var isIndex = path === 'index.html' || path === '../index.html';

        var active = false;
        if (isIndex) {
          if (it.href === 'index.html' && !cat && !favOnly && it.label === '首页') active = true;
          if (cat && it.href === 'index.html?cat=' + cat) active = true;
          if (favOnly && it.href === 'index.html?fav=1') active = true;
        } else {
          // 用「路径结尾」比较，兼容根目录与 admin/ 子目录两种层级
          var tail = path.replace(/^\.\.\//, '');
          active = here.slice(-tail.length) === tail;
        }
        return '<a class="side-item' + (active ? ' active' : '') + '" href="' + href + '">' +
          icon(it.icon) + '<span>' + esc(it.label) + '</span></a>';
      }).join('');
      return '<div class="side-group">' +
        (g.title ? '<span class="side-label">' + esc(g.title) + '</span>' : '') +
        items + '</div>';
    }).join('');
  }

  /* ==================== 定位条：返回 + 面包屑 + 回到顶部 ==================== */
  var crumbs = [];

  function setCrumbs(items) {
    crumbs = items || [];
    paintCrumbs();
  }

  function paintCrumbs() {
    var nav = document.querySelector('[data-crumb]');
    if (!nav) return;
    if (!crumbs.length) { nav.innerHTML = ''; return; }
    nav.innerHTML = crumbs.map(function (it, i) {
      var last = i === crumbs.length - 1;
      var sep = i ? '<span class="sep">/</span>' : '';
      return sep + (it.href && !last
        ? '<a href="' + esc(it.href) + '">' + esc(it.label) + '</a>'
        : '<span class="cur"' + (last ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</span>');
    }).join('');
  }

  function initSubbar() {
    var bar = document.querySelector('[data-subbar]');
    if (!bar) return;

    var back = bar.querySelector('[data-back]');
    var fromSite = false;
    try {
      fromSite = !!(document.referrer && new URL(document.referrer).origin === location.origin);
    } catch (err) { fromSite = false; }

    // 首页是站点根：没有来路时整条定位条都不显示，避免出现一条只有「首页」的空条
    if (bar.hasAttribute('data-home') && !fromSite) { bar.style.display = 'none'; }
    else if (back && bar.hasAttribute('data-home')) { /* 有来路 → 显示返回 */ }

    if (back) {
      back.innerHTML = icon('back');
      back.setAttribute('aria-label', '返回上一页');
      back.title = '返回';
      back.addEventListener('click', function (e) {
        e.preventDefault();
        var sameOrigin = false;
        try {
          sameOrigin = document.referrer && new URL(document.referrer).origin === location.origin;
        } catch (err) { sameOrigin = false; }

        // 从站内点进来的就回退（保留筛选与滚动），直接打开的就回逻辑父级
        if (sameOrigin && history.length > 1) history.back();
        else {
          var parent = bar.getAttribute('data-parent');
          location.href = parent || 'index.html';
        }
      });
    }

    // 回到顶部
    var top = document.createElement('button');
    top.type = 'button';
    top.className = 'to-top';
    top.setAttribute('aria-label', '回到顶部');
    top.title = '回到顶部';
    top.innerHTML = icon('up');
    document.body.appendChild(top);

    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var onScroll = function () {
      top.classList.toggle('on', window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==================== 页脚（三页共用，只在这里维护一份） ==================== */
  function renderFoot() {
    var hosts = document.querySelectorAll('[data-foot]');
    if (!hosts.length) return;

    var c = (D.site && D.site.contact) || {};
    var pre = rootPrefix();

    var avatar = c.avatar
      ? '<img src="' + esc(pre + c.avatar) + '" alt="' + esc(c.name || '') + '">'
      : '<span>' + esc((c.name || '覃').charAt(0)) + '</span>';

    var rows = [];
    if (c.phone) {
      rows.push('<a class="contact-row" href="tel:' + esc(c.phone) + '">' + icon('phone') +
        '<span>' + esc(c.phoneLabel || c.phone) + '</span></a>');
    }
    if (c.email) {
      rows.push('<a class="contact-row" href="mailto:' + esc(c.email) + '">' + icon('mail') +
        '<span>' + esc(c.email) + '</span></a>');
    }
    if (c.github) {
      rows.push('<a class="contact-row" href="https://github.com/' + esc(c.github) + '" target="_blank" rel="noopener">' +
        icon('github') + '<span>@' + esc(c.github) + '</span></a>');
    }

    var qr = c.wechatQr
      ? '<div class="qr-box"><img src="' + esc(pre + c.wechatQr) + '" alt="' + esc(c.wechatLabel || '微信二维码') + '"' +
          ' title="占位二维码（含姓名/职位/公司/电话），替换 assets/img/wechat-qr.png 即可换成自己的微信码"></div>' +
        '<span class="qr-label">' + esc(c.wechatLabel || '微信扫码') + '</span>'
      : '';

    var html = '' +
      '<div class="foot-inner">' +
        '<section class="contact-card">' +
          '<div class="contact-main">' +
            '<div class="avatar">' + avatar + '</div>' +
            '<div class="ident">' +
              '<div class="ident-top">' +
                '<h3 class="ident-name">' + esc(c.name || '') + '</h3>' +
                (c.title ? '<span class="ident-role">' + esc(c.title) + '</span>' : '') +
              '</div>' +
              (c.company ? '<p class="ident-org">' + esc(c.company) + '</p>' : '') +
            '</div>' +
          '</div>' +
          (rows.length ? '<div class="contact-rows">' + rows.join('') + '</div>' : '<div></div>') +
          (qr ? '<div class="contact-qr">' + qr + '</div>' : '') +
        '</section>' +
        '<div class="foot-bar">' +
          '<span>© <span data-year>' + new Date().getFullYear() + '</span> ' + esc(c.name || (D.site && D.site.owner) || '') + '</span>' +
          '<nav class="foot-links">' +
            '<a href="' + esc(pre) + 'index.html">资源首页</a>' +
            '<a href="' + esc(pre) + 'works.html">我的作品集</a>' +
            '<a href="' + esc(pre) + 'deploy.html">发布中心</a>' +
          '</nav>' +
        '</div>' +
      '</div>';

    Array.prototype.forEach.call(hosts, function (host) { host.innerHTML = html; });
  }

  function initShell() {
    initTheme();

    // 站名
    Array.prototype.forEach.call(document.querySelectorAll('[data-site-name]'), function (el) {
      el.textContent = (D.site && D.site.name) || '';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = new Date().getFullYear();
    });
    // 图标占位
    Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (el) {
      el.innerHTML = icon(el.getAttribute('data-icon'));
    });

    renderSidebar();
    renderFoot();
    initSubbar();

    // 侧栏开关：桌面折叠，窄屏抽屉
    var toggle = document.querySelector('[data-side-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        if (window.innerWidth <= 760) {
          document.body.classList.toggle('side-open');
        } else {
          document.body.classList.toggle('side-collapsed');
          try { localStorage.setItem('ws.side', document.body.classList.contains('side-collapsed') ? '1' : '0'); } catch (e) {}
        }
      });
    }
    try {
      if (localStorage.getItem('ws.side') === '1' && window.innerWidth > 760) {
        document.body.classList.add('side-collapsed');
      }
    } catch (e) {}

    // 主题按钮
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // 登录/会员（P1 无后端，只给反馈）
    Array.prototype.forEach.call(document.querySelectorAll('[data-need-login]'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toast('登录功能待接后端（P1 仅前端）');
      });
    });

    // 相对链接修正：admin/ 子目录下的站内链接
    var prefix = rootPrefix();
    if (prefix) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-root-link]'), function (a) {
        a.setAttribute('href', prefix + a.getAttribute('href'));
      });
    }

    // 搜索框回车 → 首页
    var form = document.querySelector('[data-search-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input');
        var q = (input.value || '').trim();
        location.href = prefix + 'index.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    }

    // 面包屑/页脚年份等
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        var input = document.querySelector('[data-search-form] input');
        if (input) { e.preventDefault(); input.focus(); }
      }
    });
  }

  window.App = {
    icon: icon, esc: esc, imgUrl: imgUrl, money: money, num: num, catName: catName,
    param: param, byId: byId, toast: toast, renderGrid: renderGrid, cardHtml: cardHtml,
    isFav: isFav, toggleFav: toggleFav, initShell: initShell, rootPrefix: rootPrefix,
    setCrumbs: setCrumbs,
    data: D
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initShell);
  else initShell();
})();
