/**
 * upload.js —— 后台上传页交互（P1：无后端，只做本地草稿）
 * 图片用 FileReader 变成 dataURL 存在内存里，保存草稿时写 localStorage。
 * 接后端时把 save() 换成 fetch 即可，表单结构不用动。
 */
(function () {
  'use strict';

  var D = window.SITE_DATA || { categories: [] };
  var App = window.App;
  var DRAFT_KEY = 'ws.drafts';
  var MAX_IMAGES = 6;
  var MAX_SIZE = 5 * 1024 * 1024;

  var state = { images: [], pkg: null };

  var el = {
    title: document.getElementById('fTitle'),
    sub: document.getElementById('fSub'),
    cat: document.getElementById('fCat'),
    ver: document.getElementById('fVer'),
    badge: document.getElementById('fBadge'),
    author: document.getElementById('fAuthor'),
    code: document.getElementById('fCode'),
    price: document.getElementById('fPrice'),
    free: document.getElementById('fFree'),
    license: document.getElementById('fLicense'),
    download: document.getElementById('fDownload'),
    desc: document.getElementById('fDesc'),
    install: document.getElementById('fInstall'),
    dz: document.getElementById('dz'),
    fileInput: document.getElementById('fileInput'),
    uploads: document.getElementById('uploads'),
    pkgInput: document.getElementById('pkgInput'),
    pkgHint: document.getElementById('pkgHint'),
    agree: document.getElementById('fAgree')
  };

  /* ---------- 分类下拉 ---------- */
  function fillCategories() {
    el.cat.innerHTML = (D.categories || [])
      .filter(function (c) { return c.id !== 'all'; })
      .map(function (c) { return '<option value="' + c.id + '">' + App.esc(c.name) + '</option>'; })
      .join('');
  }

  /* ---------- 图片 ---------- */
  function addFiles(files) {
    var room = MAX_IMAGES - state.images.length;
    if (room <= 0) { App.toast('最多 ' + MAX_IMAGES + ' 张'); return; }

    Array.prototype.slice.call(files).slice(0, room).forEach(function (file) {
      if (!/^image\//.test(file.type)) { App.toast('已跳过非图片文件：' + file.name); return; }
      if (file.size > MAX_SIZE) { App.toast('已跳过超过 5MB 的文件：' + file.name); return; }

      var reader = new FileReader();
      reader.onload = function () {
        state.images.push({ name: file.name, size: file.size, url: reader.result });
        renderUploads();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderUploads() {
    el.uploads.innerHTML = state.images.map(function (img, i) {
      return '<div class="upload-item">' +
        '<img src="' + img.url + '" alt="' + App.esc(img.name) + '">' +
        (i === 0 ? '<span class="tag-main">封面</span>' : '') +
        '<button class="del" type="button" data-del="' + i + '" aria-label="移除">×</button>' +
        '</div>';
    }).join('');

    Array.prototype.forEach.call(el.uploads.querySelectorAll('[data-del]'), function (btn) {
      btn.addEventListener('click', function () {
        state.images.splice(Number(btn.getAttribute('data-del')), 1);
        renderUploads();
      });
    });

    if (state.images.length) {
      App.toast('已添加 ' + state.images.length + ' 张图');
    }
  }

  /* ---------- 文件 ---------- */
  function renderPkg() {
    if (!state.pkg) {
      el.pkgHint.textContent = '未选择文件。上传后前台会显示文件大小与格式。';
      return;
    }
    var mb = (state.pkg.size / 1024 / 1024).toFixed(1);
    el.pkgHint.innerHTML = '<b style="color:var(--ink-2)">' + App.esc(state.pkg.name) + '</b> · ' + mb + ' MB';
  }

  /* ---------- 收集与校验 ---------- */
  function collect(status) {
    var title = (el.title.value || '').trim();
    if (!title) {
      App.toast('请先填写标题');
      el.title.focus();
      return null;
    }

    var cat = el.cat.value;
    var isFree = el.free.checked || !Number(el.price.value);
    var code = (el.code.value || '').trim() ||
      cat.toUpperCase() + '-' + String(Date.now()).slice(-4);

    return {
      id: 'draft-' + Date.now(),
      status: status,
      title: title,
      subtitle: (el.sub.value || '').trim(),
      cat: cat,
      cover: state.images[0] ? state.images[0].url : '',
      gallery: state.images.slice(1).map(function (i) { return i.url; }),
      version: (el.ver.value || '').trim() || 'v1.0.0',
      author: (el.author.value || '').trim() || (D.site && D.site.owner) || '匿名',
      badge: el.badge.value || '',
      code: code,
      free: !!isFree,
      price: isFree ? 0 : Number(el.price.value),
      desc: (el.desc.value || '').trim(),
      install: (el.install.value || '').trim(),
      license: (el.license.value || '').trim() || '详见授权说明。',
      download: (el.download.value || '').trim(),
      updated: new Date().toISOString().slice(0, 10),
      downloads: 0
    };
  }

  function save(status) {
    var payload = collect(status);
    if (!payload) return;

    if (status === 'published' && !el.agree.checked) {
      App.toast('请先勾选素材使用权确认');
      el.agree.focus();
      return;
    }

    var drafts = [];
    try { drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]'); } catch (e) { drafts = []; }
    if (!Array.isArray(drafts)) drafts = [];

    drafts.unshift(payload);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
      App.toast(status === 'published'
        ? '已记录为「已发布」（P1 仅存本机，未进入前台）'
        : '草稿已保存到本机');
    } catch (e) {
      App.toast('保存失败：本地存储可能已满（图片太大）');
    }
  }

  /* ---------- 预览卡片 ---------- */
  function preview() {
    var payload = collect('draft');
    if (!payload) return;
    var url = payload.cover || '';
    var w = window.open('', '_blank');
    if (!w) { App.toast('浏览器拦截了弹窗'); return; }
    // 简单预览：不入库，直接把卡片渲染成一张页面
    w.document.write(
      '<!doctype html><meta charset="utf-8"><title>卡片预览</title>' +
      '<body style="margin:0;padding:32px;background:#0b0c0c;color:#f2f3f4;font-family:-apple-system,\'PingFang SC\',sans-serif">' +
      '<p style="font-size:12px;color:#83888e;letter-spacing:.08em;text-transform:uppercase">卡片预览</p>' +
      '<div style="max-width:280px;border:1px solid #262828;border-radius:10px;overflow:hidden;background:#161717;margin-top:12px">' +
        (url ? '<img src="' + url + '" style="width:100%;height:150px;object-fit:cover;display:block">' : '<div style="height:150px;background:#262728"></div>') +
        '<div style="padding:10px 11px">' +
          '<div style="font-size:13px;font-weight:600">' + App.esc(payload.title) + '</div>' +
          '<div style="font-size:11px;color:#83888e;margin-top:5px;line-height:1.5">' + App.esc(payload.subtitle) + '</div>' +
          '<div style="display:flex;justify-content:space-between;margin-top:9px;padding-top:7px;border-top:1px solid #262828;font-size:11px;color:#83888e">' +
            '<span>' + App.esc(App.catName(payload.cat)) + '</span>' +
            '<span style="color:#e2ff1a;font-weight:600">' + (payload.free ? '免费' : '¥' + payload.price) + '</span>' +
          '</div>' +
        '</div>' +
      '</div></body>'
    );
    w.document.close();
  }

  /* ---------- 事件 ---------- */
  function bind() {
    el.dz.addEventListener('click', function () { el.fileInput.click(); });
    el.dz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.fileInput.click(); }
    });
    el.fileInput.addEventListener('change', function () {
      if (el.fileInput.files.length) addFiles(el.fileInput.files);
      el.fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      el.dz.addEventListener(ev, function (e) { e.preventDefault(); el.dz.classList.add('hot'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      el.dz.addEventListener(ev, function (e) { e.preventDefault(); el.dz.classList.remove('hot'); });
    });
    el.dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    el.pkgInput.addEventListener('change', function () {
      state.pkg = el.pkgInput.files[0] || null;
      renderPkg();
    });

    el.btnDraft = document.getElementById('btnDraft');
    el.btnPublish = document.getElementById('btnPublish');
    el.btnPublish2 = document.getElementById('btnPublish2');
    el.btnPreview = document.getElementById('btnPreview');

    el.btnDraft.addEventListener('click', function () { save('draft'); });
    el.btnPublish.addEventListener('click', function () { save('published'); });
    el.btnPublish2.addEventListener('click', function () { save('published'); });
    el.btnPreview.addEventListener('click', preview);

    // 免费开关与价格联动
    el.free.addEventListener('change', function () {
      el.price.disabled = el.free.checked;
      if (el.free.checked) el.price.value = '0';
    });

    // 版本号默认值
    if (!el.ver.value) el.ver.value = 'v1.0.0';
    if (!el.author.value && D.site) el.author.value = D.site.owner || '';
  }

  function boot() {
    fillCategories();
    bind();
    App.setCrumbs([
      { label: '首页', href: '../index.html' },
      { label: '后台' },
      { label: '上传资源' }
    ]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
