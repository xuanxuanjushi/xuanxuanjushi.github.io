/**
 * about.js —— 个人简介页
 * 数据来自 SITE_DATA.about（内容取自个人简历），渲染成「首屏身份 + 时间线 + 侧栏信息」。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || {};
  var App = window.App;
  var A = D.about || {};

  var el = {
    hero: document.getElementById('hero'),
    main: document.getElementById('main'),
    side: document.getElementById('side')
  };

  function initials(name) {
    return (name || '覃').trim().charAt(0);
  }

  /* ---------- 首屏 ---------- */
  function renderHero() {
    var contact = (D.site && D.site.contact) || {};
    var av = contact.avatar
      ? '<img src="' + App.esc(contact.avatar) + '" alt="' + App.esc(A.name) + '">'
      : '<span>' + App.esc(initials(A.name)) + '</span>';

    el.hero.innerHTML =
      '<div class="about-avatar">' + av + '</div>' +
      '<div class="about-id">' +
        '<span class="mono">Visual Designer · ' + App.esc(A.enName || '') + '</span>' +
        '<h1>' + App.esc(A.name) + '</h1>' +
        '<p class="about-role">' +
          '<b>' + App.esc(A.title) + '</b>' +
          (A.company ? '<span class="dot"></span><span>' + App.esc(A.company) + '</span>' : '') +
        '</p>' +
        '<p class="about-intro">' + App.esc(A.intro) + '</p>' +
        '<div class="tag-row about-tags">' +
          (A.tags || []).map(function (t) { return '<span class="tag">' + App.esc(t) + '</span>'; }).join('') +
        '</div>' +
        '<div class="about-actions">' +
          '<a class="btn acid" href="works.html">看作品集' + App.icon('link') + '</a>' +
          (contact.phone ? '<a class="btn" href="tel:' + App.esc(contact.phone) + '">' + App.icon('phone') + App.esc(contact.phoneLabel || contact.phone) + '</a>' : '') +
          '<button class="btn ghost" type="button" data-need-login>' + App.icon('mail') + '发消息</button>' +
        '</div>' +
      '</div>';

    App.setCrumbs([{ label: '首页', href: 'index.html' }, { label: '个人简介' }]);
    document.title = A.name + ' · 个人简介';
  }

  /* ---------- 时间线 ---------- */
  function timelineHtml(list, kind) {
    return '<div class="tl">' + (list || []).map(function (it) {
      var head = kind === 'campus'
        ? '<span class="tl-org">' + App.esc(it.org) + '</span><span class="tl-role">' + App.esc(it.role) + '</span>'
        : '<span class="tl-org">' + App.esc(it.company) + '</span><span class="tl-role">' + App.esc(it.role) + '</span>';

      return '<article class="tl-item">' +
        '<div class="tl-period">' + App.esc(it.period) + '</div>' +
        '<div class="tl-body">' +
          '<div class="tl-head">' + head + '</div>' +
          '<ul class="tl-points">' +
            (it.points || []).map(function (p) { return '<li>' + App.esc(p) + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
      '</article>';
    }).join('') + '</div>';
  }

  function renderMain() {
    el.main.innerHTML =
      '<section class="panel">' +
        '<div class="panel-head"><h2>工作经历</h2><span class="tip">' + (A.experience || []).length + ' 段</span></div>' +
        '<div class="panel-body">' + timelineHtml(A.experience, 'work') + '</div>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel-head"><h2>校园经历</h2></div>' +
        '<div class="panel-body">' + timelineHtml([A.campus], 'campus') + '</div>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel-head"><h2>教育背景</h2></div>' +
        '<div class="panel-body">' +
          '<div class="edu">' +
            '<div class="edu-main">' +
              '<h3>' + App.esc(A.education.school) + '</h3>' +
              '<p class="edu-major">' + App.esc(A.education.major) + '</p>' +
            '</div>' +
            '<span class="edu-period">' + App.esc(A.education.period) + '</span>' +
          '</div>' +
          '<p class="edu-courses"><b>主修课程</b>' + App.esc(A.education.courses) + '</p>' +
        '</div>' +
      '</section>';
  }

  /* ---------- 侧栏 ---------- */
  function renderSide() {
    var facts = (A.facts || []).map(function (f) {
      return '<div class="fact"><span>' + App.esc(f.k) + '</span><b>' + App.esc(f.v) + '</b></div>';
    }).join('');

    var skills = (A.skills || []).map(function (g) {
      return '<div class="skill-row">' +
        '<div class="skill-head"><span>' + App.esc(g.group) + '</span><em>' + App.esc(g.tier) + '</em></div>' +
        '<div class="skill-items">' + (g.items || []).map(function (i) {
          return '<span>' + App.esc(i) + '</span>';
        }).join('') + '</div>' +
      '</div>';
    }).join('');

    var awards = (A.awards || []).map(function (a) {
      return '<li>' + App.icon('check') + '<span>' + App.esc(a) + '</span></li>';
    }).join('');

    el.side.innerHTML =
      '<section class="panel">' +
        '<div class="panel-head"><h2>基本信息</h2></div>' +
        '<div class="panel-body"><div class="facts">' + facts + '</div></div>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel-head"><h2>技能</h2><span class="tip">软件与工具</span></div>' +
        '<div class="panel-body">' + skills + '</div>' +
      '</section>' +

      '<section class="panel">' +
        '<div class="panel-head"><h2>证书与荣誉</h2></div>' +
        '<div class="panel-body"><ul class="award-list">' + awards + '</ul></div>' +
      '</section>' +

      '<section class="panel about-cta">' +
        '<div class="panel-body">' +
          '<p class="cta-title">想看实际产出？</p>' +
          '<p class="cta-sub">作品集里按媒介分类，图片可直接放大看细节。</p>' +
          '<a class="btn acid block" href="works.html">打开作品集</a>' +
        '</div>' +
      '</section>';
  }

  function boot() {
    if (!el.hero) return;
    renderHero();
    renderMain();
    renderSide();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
