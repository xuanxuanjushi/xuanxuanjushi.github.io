/**
 * detail.js —— 详情页渲染
 * 所有内容来自 SITE_DATA.projects（按 ?id= 取），无 id 时回落到第一件。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { projects: [] };
  var App = window.App;

  var el = {
    crumbs: document.getElementById('crumbs'),
    title: document.getElementById('title'),
    subtitle: document.getElementById('subtitle'),
    meta: document.getElementById('meta'),
    mainImg: document.getElementById('mainImg'),
    thumbs: document.getElementById('thumbs'),
    previewHint: document.getElementById('previewHint'),
    buy: document.getElementById('buyHost'),
    related: document.getElementById('related'),
    moreLink: document.getElementById('moreLink')
  };

  function galleryOf(p) {
    var list = (p.gallery && p.gallery.length ? p.gallery : [p.cover]).slice(0, 5);
    return list;
  }

  function renderCrumbs(p) {
    el.crumbs.innerHTML =
      '<a href="index.html">首页</a><span class="sep">/</span>' +
      '<a href="index.html?cat=' + encodeURIComponent(p.cat) + '">' + App.esc(App.catName(p.cat)) + '</a>' +
      '<span class="sep">/</span><span class="cur">' + App.esc(p.title) + '</span>';
  }

  function renderHead(p) {
    document.title = p.title + ' · 覃露雨的闺房';
    el.title.textContent = p.title;
    el.subtitle.textContent = p.subtitle || '';

    var items = [
      '<span><b>' + App.esc(p.version) + '</b></span>',
      '<span class="dot"></span>',
      '<span>' + App.esc(p.author) + '</span>',
      '<span class="dot"></span>',
      '<span>' + App.icon('clock') + '更新 ' + App.esc(p.updated) + '</span>',
      '<span class="dot"></span>',
      '<span>编号 <b>' + App.esc(p.code) + '</b></span>',
      '<span class="dot"></span>',
      '<span class="state">● 已发布</span>',
      '<span class="dot"></span>',
      '<span>' + App.icon('download') + App.num(p.downloads) + ' 次下载</span>'
    ];
    el.meta.innerHTML = items.join('');
  }

  function renderPreview(p) {
    var list = galleryOf(p);
    el.mainImg.src = App.imgUrl(list[0]);
    el.mainImg.alt = p.title + ' 预览';
    el.thumbs.innerHTML = list.map(function (k, i) {
      return '<button class="thumb' + (i === 0 ? ' on' : '') + '" type="button" data-img="' + App.esc(App.imgUrl(k)) + '">' +
        '<img src="' + App.esc(App.imgUrl(k)) + '" alt="预览 ' + (i + 1) + '" loading="lazy"></button>';
    }).join('');
    el.previewHint.textContent = '共 ' + list.length + ' 张预览';

    Array.prototype.forEach.call(el.thumbs.querySelectorAll('.thumb'), function (btn) {
      btn.addEventListener('click', function () {
        el.mainImg.src = btn.getAttribute('data-img');
        Array.prototype.forEach.call(el.thumbs.children, function (c) { c.classList.remove('on'); });
        btn.classList.add('on');
      });
    });

    // 点大图看原图
    el.mainImg.addEventListener('click', function () {
      window.open(el.mainImg.src, '_blank', 'noopener');
    });
    el.mainImg.style.cursor = 'zoom-in';
  }

  function renderTabs(p) {
    var desc = document.getElementById('panel-desc');
    desc.innerHTML =
      '<h4>这套资源解决什么问题</h4>' +
      '<p>' + App.esc(p.desc) + '</p>' +
      '<div class="spec-grid">' +
        spec('user', '适用人群', '设计师、内容创作者、需要快速出图或出片的个人与团队。') +
        spec('box', '包含内容', App.esc(p.title) + ' 工程文件、素材包、使用说明 PDF。') +
        spec('monitor', '运行环境', p.cat === 'ai' ? 'Chrome 118+ / Edge 最新版；本地服务需 Node 18+。' : 'Windows 10+ / macOS 12+；对应设计软件 2021 以上版本。') +
        spec('info', '注意事项', '包内字体为开源字体；商用前请阅读「授权与使用」一节。') +
      '</div>';

    var gal = document.getElementById('panel-gallery');
    gal.innerHTML = '<div class="gallery-grid">' + galleryOf(p).map(function (k) {
      return '<img src="' + App.esc(App.imgUrl(k)) + '" alt="内容预览" loading="lazy">';
    }).join('') + '</div>';

    document.getElementById('panel-install').innerHTML =
      '<h4>安装 / 使用步骤</h4>' +
      '<p>' + App.esc(p.install) + '</p>' +
      '<ul class="bullets" style="margin-top:12px">' +
        '<li>下载后先解压，保持目录结构不变（贴图与字体使用相对路径）。</li>' +
        '<li>提示字体缺失时，安装包内 <code>fonts/</code> 目录的字体后重新打开。</li>' +
        '<li>首次运行如遇权限提示，允许后重启一次软件即可。</li>' +
      '</ul>';

    document.getElementById('panel-license').innerHTML =
      '<h4>授权范围</h4>' +
      '<p>' + App.esc(p.license) + '</p>' +
      '<ul class="bullets" style="margin-top:12px">' +
        '<li><b>可以</b>：用于个人作品、客户交付、商业宣传物料。</li>' +
        '<li><b>不可以</b>：转售、二次分发源文件，或打包进付费课程 / 素材站。</li>' +
        '<li>需要更大范围授权（如品牌方长期使用）请单独联系。</li>' +
      '</ul>';

    Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-tab');
        Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (b) { b.classList.remove('on'); });
        Array.prototype.forEach.call(document.querySelectorAll('.tab-panel'), function (pn) { pn.classList.remove('on'); });
        btn.classList.add('on');
        var panel = document.getElementById('panel-' + key);
        if (panel) panel.classList.add('on');
      });
    });
  }

  function spec(iconName, title, text) {
    return '<div class="spec"><h5>' + App.icon(iconName) + App.esc(title) + '</h5><p>' + text + '</p></div>';
  }

  function renderBuy(p) {
    var isFree = !!p.free;
    var wasPrice = isFree ? '' : Math.round((p.price || 0) * 1.35);
    var fav = App.isFav(p.id);

    el.buy.innerHTML =
      '<div class="buy">' +
        '<div class="buy-head"><h3>获取与使用</h3><span class="members">MEMBERS ACCESS</span></div>' +
        '<div class="buy-body">' +
          '<div class="price-row">' +
            '<span class="num">' + (isFree ? '免费' : '¥' + p.price) + (isFree ? '' : '<small>起</small>') + '</span>' +
            (isFree ? '' : '<span class="was">¥' + wasPrice + '</span><span class="save">限时 -26%</span>') +
          '</div>' +
          '<button class="btn acid block lg" type="button" data-need-login>' +
            (isFree ? '登录后免费获取' : '登录后获取') +
          '</button>' +
          '<p class="buy-note">登录后资源永久保存在账号，可随时重新下载</p>' +
          '<ul class="perks">' +
            '<li>' + App.icon('check') + '一次获取，永久可下载</li>' +
            '<li>' + App.icon('check') + '后续版本更新免费获取</li>' +
            '<li>' + App.icon('check') + '含商用授权（详见授权说明）</li>' +
            '<li>' + App.icon('check') + '支持 2 台设备同时使用</li>' +
          '</ul>' +
          '<div class="buy-foot">' +
            '<div>资源类型<b>' + App.esc(p.cat === 'ai' ? '工具 / 工作流' : '工程文件 + 素材') + '</b></div>' +
            '<div>授权方式<b>' + (isFree ? '免费 / 开源' : '个人 + 商业') + '</b></div>' +
            '<div>最近更新<b>' + App.esc(p.updated) + '</b></div>' +
            '<div>当前版本<b>' + App.esc(p.version) + '</b></div>' +
          '</div>' +
          '<div class="owner-line">' +
            '<span class="owner-avatar">' + App.esc((p.author || '覃')[0]) + '</span>' +
            '<span class="who">' + App.esc(p.author) + '<small>共 ' + (D.projects || []).length + ' 件资源</small></span>' +
            '<button class="btn sm ghost" type="button" data-fav-btn="' + App.esc(p.id) + '">' +
              (fav ? '已收藏' : '收藏') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 收藏按钮（复用 App 的存储，但要在本页更新按钮文案）
    var favBtn = el.buy.querySelector('[data-fav-btn]');
    favBtn.addEventListener('click', function () {
      var on = App.toggleFav(p.id);
      favBtn.textContent = on ? '已收藏' : '收藏';
      App.toast(on ? '已加入收藏' : '已取消收藏');
    });

    // 登录按钮提示
    var loginBtn = el.buy.querySelector('[data-need-login]');
    loginBtn.addEventListener('click', function () {
      App.toast('登录功能待接后端（P1 仅前端）');
    });
  }

  function renderRelated(p) {
    var list = (D.projects || []).filter(function (x) {
      return x.cat === p.cat && x.id !== p.id;
    });
    if (list.length < 3) {
      list = list.concat((D.projects || []).filter(function (x) {
        return x.cat !== p.cat && x.id !== p.id;
      }));
    }
    App.renderGrid(el.related, list.slice(0, 4));
    el.moreLink.href = 'index.html?cat=' + encodeURIComponent(p.cat);
  }

  function boot() {
    if (!el.title) return;

    var id = App.param('id');
    var p = id ? App.byId(id) : (D.projects || [])[0];

    // 带 ?id= 但查不到时不要静默回落到第一件，否则用户会以为点错了资源
    if (!p) {
      document.title = '资源不存在 · 覃露雨的闺房';
      el.title.textContent = '资源不存在';
      el.subtitle.textContent = '链接可能已失效或资源已下架。返回列表重新选择。';
      el.meta.innerHTML = '<span><a href="index.html" style="color:var(--accent-text)">← 返回全部资源</a></span>';
      var grid = document.querySelector('.detail-grid');
      var rel = document.querySelector('.related');
      if (grid) grid.style.display = 'none';
      if (rel) rel.style.display = 'none';
      if (el.crumbs) el.crumbs.innerHTML = '<a href="index.html">首页</a><span class="sep">/</span><span class="cur">资源不存在</span>';
      return;
    }

    renderCrumbs(p);
    renderHead(p);
    renderPreview(p);
    renderTabs(p);
    renderBuy(p);
    renderRelated(p);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
