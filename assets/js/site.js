/**
 * site.js —— 首页渲染逻辑
 * 职责：把 SITE_CONFIG（静态作品）与 WSStore（部署记录）合并成作品集列表，
 *       绑定文案、技能、主题。无第三方依赖。
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var THEME_KEY = 'ws.theme';

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** 过滤危险协议（javascript:/data:），允许 http(s)、mailto、根路径与相对路径 */
  function safeHref(url) {
    if (!url) return '';
    var u = String(url).trim();
    return /^(javascript|data|vbscript|file):/i.test(u) ? '' : u;
  }

  function firstChar(s) {
    var str = String(s || '·').trim();
    return str ? str[0] : '·';
  }

  /* ---------- 文案绑定 ---------- */
  function bindText() {
    var map = {
      siteName: CFG.siteName,
      name: CFG.name,
      tagline: CFG.tagline,
      intro: CFG.intro,
      role: CFG.role,
      location: CFG.location,
      year: new Date().getFullYear()
    };

    Object.keys(map).forEach(function (key) {
      document.querySelectorAll('[data-bind="' + key + '"]').forEach(function (el) {
        el.textContent = map[key] == null ? '' : map[key];
      });
    });

    // 邮箱 / GitHub 链接
    var mail = CFG.email || '';
    var gh = CFG.github ? 'https://github.com/' + CFG.github : '';
    document.querySelectorAll('[data-bind-href="mailto"]').forEach(function (el) {
      el.setAttribute('href', mail ? 'mailto:' + mail : '#');
    });
    document.querySelectorAll('[data-bind-text="email"]').forEach(function (el) {
      el.textContent = mail || '未填写邮箱';
    });
    document.querySelectorAll('[data-bind-href="github"]').forEach(function (el) {
      el.setAttribute('href', gh || '#');
    });
    document.querySelectorAll('[data-bind-text="githubLabel"]').forEach(function (el) {
      el.textContent = CFG.github ? '@' + CFG.github : 'GitHub';
    });

    document.title = (CFG.siteName || CFG.name || '个人站') + ' · 作品集';
  }

  /* ---------- 技能 ---------- */
  function renderSkills() {
    var box = document.getElementById('skillList');
    if (!box) return;
    var groups = CFG.skills || [];
    box.innerHTML = groups.map(function (g) {
      var items = (g.items || []).map(function (i) {
        return '<li>' + esc(i) + '</li>';
      }).join('');
      return '<div class="skill-group"><h3>' + esc(g.group) + '</h3><ul>' + items + '</ul></div>';
    }).join('');
  }

  /* ---------- 作品列表 ---------- */
  function collectedProjects() {
    var builtin = (CFG.projects || []).map(function (p) {
      return Object.assign({ source: 'builtin' }, p);
    });

    var deployed = (window.WSStore ? WSStore.list() : []).map(function (p) {
      return Object.assign({ source: 'local' }, p);
    });

    // 已部署记录优先覆盖同名内置作品（避免重复卡片）
    var deployedIds = {};
    deployed.forEach(function (p) { deployedIds[p.id] = true; });

    var merged = deployed.concat(builtin.filter(function (p) { return !deployedIds[p.id]; }));

    merged.sort(function (a, b) {
      var liveDiff = (b.demo ? 1 : 0) - (a.demo ? 1 : 0);
      if (liveDiff !== 0) return liveDiff;
      return String(b.year || '').localeCompare(String(a.year || ''));
    });

    return merged;
  }

  function cardHtml(p) {
    var hue = Number(p.hue) || 210;
    var demo = safeHref(p.demo);
    var repo = safeHref(p.repo);
    var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; });
    if (demo) tags.unshift('<span class="tag live">已上线</span>');

    var actions = demo
      ? '<a class="link-btn" href="' + esc(demo) + '" target="_blank" rel="noopener">↗ 在线演示</a>'
      : '<span class="link-btn muted">未部署</span>';

    actions += repo
      ? '<a class="link-btn" href="' + esc(repo) + '" target="_blank" rel="noopener">源码</a>'
      : '';

    var del = p.source === 'local'
      ? '<button class="card-del" type="button" data-del="' + esc(p.id) + '" aria-label="移除这条记录" title="仅从本机记录中移除">&times;</button>'
      : '';

    return '' +
      '<article class="card" data-id="' + esc(p.id) + '">' +
        del +
        '<div class="card-cover" style="--h:' + hue + '">' +
          '<span class="card-path">' + esc(p.path || ('apps/' + p.id)) + '</span>' +
          '<span class="card-initial" aria-hidden="true">' + esc(firstChar(p.title)) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-title-row">' +
            '<h3 class="card-title">' + esc(p.title) + '</h3>' +
            '<span class="card-year">' + esc(p.year || '') + '</span>' +
          '</div>' +
          '<p class="card-desc">' + esc(p.desc) + '</p>' +
          '<div class="tag-row">' + tags.join('') + '</div>' +
          '<div class="card-actions">' + actions + '</div>' +
        '</div>' +
      '</article>';
  }

  function renderWorks() {
    var grid = document.getElementById('workGrid');
    if (!grid) return;

    var list = collectedProjects();
    grid.innerHTML = list.length
      ? list.map(cardHtml).join('')
      : '<div class="empty-state">还没有作品。到「发布中心」把第一个网页应用部署上去，它会自动出现在这里。</div>';

    var liveCount = list.filter(function (p) { return !!p.demo; }).length;
    var elLive = document.getElementById('liveCount');
    var elTotal = document.getElementById('totalCount');
    if (elLive) elLive.textContent = liveCount;
    if (elTotal) elTotal.textContent = list.length;

    grid.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-del');
        if (!window.confirm('从本机作品集记录中移除「' + id + '」？\n（只删本地记录，不会影响 GitHub 上的仓库和已上线的站点）')) return;
        if (window.WSStore) WSStore.remove(id);
        renderWorks();
      });
    });
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initTheme();
    bindText();
    renderSkills();
    renderWorks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
