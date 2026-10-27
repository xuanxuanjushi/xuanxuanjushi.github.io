/**
 * deploy.js —— 发布中心
 * 浏览器端直连 GitHub REST API：建仓 → Git Data 单 commit 提交 → 开启 Pages → 轮询构建。
 *
 * 设计要点：
 * 1. 用 Git Data API（blob/tree/commit/ref）而不是逐个 Contents PUT——
 *    一次提交是原子操作，失败不会留下半截仓库；请求数也更少。
 * 2. 令牌只放 sessionStorage（关掉标签页即失效），不写日志、不进 URL。
 * 3. 所有网络错误在这里统一翻译成人话，UI 只负责展示。
 */
(function () {
  'use strict';

  /* ==================== 常量 ==================== */
  var API = 'https://api.github.com';
  var TOKEN_KEY = 'ws.gh_token';
  var MAX_BLOB = 25 * 1024 * 1024;          // GitHub 单 blob 上限 100MB，留足余量
  var IGNORE_DIRS = ['node_modules', '.git', '.idea', '.vscode', 'dist', '__MACOSX', '.cache'];
  var IGNORE_FILES = ['.DS_Store', 'Thumbs.db', 'desktop.ini'];
  var PAGES_TIMEOUT = 150000;
  // test.html 用 ?norestore=1 打开本页，避免自测时复用真实令牌发起真实请求
  var NORESTORE = /(\?|&)norestore=1/.test(location.search);

  /* ==================== DOM ==================== */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    token: $('token'), owner: $('owner'), repo: $('repo'), branch: $('branch'),
    prefix: $('prefix'), visibility: $('visibility'), commitMsg: $('commitMsg'),
    enablePages: $('enablePages'),
    dropZone: $('dropZone'), dirInput: $('dirInput'), fileInput: $('fileInput'),
    fileList: $('fileList'), fileSummary: $('fileSummary'),
    log: $('log'), progressBar: $('progressBar'), authState: $('authState'),
    result: $('result'), resultUrl: $('resultUrl'), resultRepo: $('resultRepo'), resultSite: $('resultSite'),
    btnVerify: $('btnVerify'), btnDeploy: $('btnDeploy'), btnPickDir: $('btnPickDir'),
    btnPickFiles: $('btnPickFiles'), btnLoadSample: $('btnLoadSample'), btnClearFiles: $('btnClearFiles'),
    btnClearLog: $('btnClearLog'), btnForget: $('btnForget'), btnClearRecords: $('btnClearRecords'),
    btnCopyJson: $('btnCopyJson'), deployHint: $('deployHint')
  };

  /* ==================== 状态 ==================== */
  var state = { files: [], token: '', user: null, busy: false, lastRecord: null };

  /* ==================== 通用工具 ==================== */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function now() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0') + ':' +
           String(d.getSeconds()).padStart(2, '0');
  }

  function log(msg, level) {
    var line = document.createElement('div');
    line.className = level ? 'l-' + level : '';
    line.innerHTML = '<span class="l-time">' + now() + '</span>  ' + escapeHtml(msg).replace(/&lt;br&gt;/g, '<br>');
    el.log.appendChild(line);
    el.log.scrollTop = el.log.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setProgress(pct) {
    el.progressBar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function slugifyRepo(name) {
    return String(name || '').trim()
      .replace(/[^\w.\-]+/g, '-')     // 只保留字母数字 _ . -
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  }

  /* ==================== GitHub 客户端 ==================== */
  function createApi(token) {
    function translate(status, data) {
      var msg = (data && data.message) || '';
      if (status === 401) return '令牌无效或已过期（401）。请重新生成 token。';
      if (status === 403) {
        if (/rate limit/i.test(msg)) return '触发了 GitHub API 限流（403）。等一会儿再试，或换用令牌。';
        if (/resource not accessible/i.test(msg)) return '令牌权限不足（403）。classic token 需要勾选 repo 权限。';
        return '权限被拒绝（403）：' + msg;
      }
      if (status === 404) return '资源不存在或无权限（404）：' + (msg || '检查仓库名、账号名与令牌权限。');
      if (status === 422) return '请求参数不合法（422）：' + msg;
      if (status === 409) return '仓库为空或状态冲突（409）：' + msg;
      return '请求失败（' + status + '）：' + (msg || '未知错误');
    }

    function request(path, opts) {
      opts = opts || {};
      var headers = {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      };
      if (opts.body) headers['Content-Type'] = 'application/json';

      return fetch(API + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      }).then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = { message: text }; }
          if (!res.ok) {
            var err = new Error(translate(res.status, data));
            err.status = res.status;
            err.data = data;
            throw err;
          }
          return data;
        });
      });
    }

    return {
      get: function (p) { return request(p); },
      tryGet: function (p) {
        return request(p).catch(function (e) { if (e.status === 404) return null; throw e; });
      },
      post: function (p, b) { return request(p, { method: 'POST', body: b }); },
      patch: function (p, b) { return request(p, { method: 'PATCH', body: b }); }
    };
  }

  /* ==================== 文件收集 ==================== */
  function isIgnored(path) {
    var parts = path.split('/');
    for (var i = 0; i < parts.length - 1; i++) {
      if (IGNORE_DIRS.indexOf(parts[i]) !== -1) return true;
      if (parts[i].charAt(0) === '.' && parts[i] !== '.well-known') return true;
    }
    var name = parts[parts.length - 1];
    if (IGNORE_FILES.indexOf(name) !== -1) return true;
    if (name.charAt(0) === '.' && name !== '.nojekyll') return true;
    return false;
  }

  function fromFileList(fileList, stripRoot) {
    var out = [];
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      var rel = f.webkitRelativePath || f.name;
      var parts = rel.split('/').filter(Boolean);
      if (stripRoot && parts.length > 1) parts.shift();   // 去掉用户选中的根目录名
      var p = parts.join('/');
      if (!p || isIgnored(p)) continue;
      out.push({ path: p, file: f });
    }
    return out;
  }

  function readAllEntries(reader) {
    return new Promise(function (resolve, reject) {
      var all = [];
      function next() {
        reader.readEntries(function (batch) {
          if (!batch.length) return resolve(all);
          all = all.concat(Array.prototype.slice.call(batch));
          next();                       // Chrome 单次最多返回 100 条，需循环读完
        }, reject);
      }
      next();
    });
  }

  function walkEntry(entry, parentPath, out) {
    var path = parentPath ? parentPath + '/' + entry.name : entry.name;
    if (entry.isFile) {
      if (isIgnored(path)) return Promise.resolve();
      return new Promise(function (resolve) {
        entry.file(function (file) {
          out.push({ path: path, file: file });
          resolve();
        }, function () { resolve(); });
      });
    }
    if (entry.isDirectory) {
      if (IGNORE_DIRS.indexOf(entry.name) !== -1 || entry.name.charAt(0) === '.') return Promise.resolve();
      return readAllEntries(entry.createReader()).then(function (list) {
        return list.reduce(function (p, child) {
          return p.then(function () { return walkEntry(child, path, out); });
        }, Promise.resolve());
      });
    }
    return Promise.resolve();
  }

  function renderFiles() {
    var total = state.files.reduce(function (s, f) { return s + f.file.size; }, 0);
    el.fileList.innerHTML = state.files.map(function (f) {
      return '<div><span>' + escapeHtml(f.path) + '</span><span>' + humanSize(f.file.size) + '</span></div>';
    }).join('');

    if (!state.files.length) {
      el.fileSummary.innerHTML = '尚未选择文件。入口文件需要命名为 <code>index.html</code>，否则 Pages 打开是 404。';
      return;
    }

    var prefix = slugPrefix();
    var entry = prefix ? prefix + '/index.html' : 'index.html';
    var hasEntry = state.files.some(function (f) { return f.path === entry; });
    el.fileSummary.innerHTML = '共 <b>' + state.files.length + '</b> 个文件，' + humanSize(total) +
      (hasEntry ? ' · 入口 <code>' + escapeHtml(entry) + '</code> 已就绪'
                : ' · <span style="color:var(--danger)">缺少入口 ' + escapeHtml(entry) + '</span>');
  }

  function slugPrefix() {
    return String(el.prefix.value || '').trim().replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  }

  function setFiles(list, sourceLabel) {
    var kept = [], skipped = [];
    list.forEach(function (item) {
      if (item.file.size > MAX_BLOB) { skipped.push(item.path); return; }
      kept.push(item);
    });
    kept.sort(function (a, b) { return a.path.localeCompare(b.path); });
    state.files = kept;
    renderFiles();
    log('已载入 ' + kept.length + ' 个文件' + (sourceLabel ? '（' + sourceLabel + '）' : ''), 'dim');
    if (skipped.length) log('跳过 ' + skipped.length + ' 个超过 25MB 的文件：' + skipped.slice(0, 3).join(', '), 'warn');
  }

  /* ==================== base64 ==================== */
  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var chunk = 0x8000, bin = '';
    for (var i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(arrayBufferToBase64(reader.result)); };
      reader.onerror = function () { reject(new Error('读取文件失败：' + file.name)); };
      reader.readAsArrayBuffer(file);
    });
  }

  /* ==================== 部署主流程 ==================== */
  function getToken() {
    return String(el.token.value || '').trim();
  }

  async function verifyToken(silent) {
    var token = getToken();
    if (!token) {
      if (!silent) log('请先填写 Personal Access Token', 'err');
      return null;
    }
    if (!silent) { el.btnVerify.disabled = true; log('验证令牌…', 'dim'); }
    try {
      var api = createApi(token);
      var user = await api.get('/user');
      state.token = token;
      state.user = user;
      try { sessionStorage.setItem(TOKEN_KEY, token); } catch (e) {}
      if (!el.owner.value) el.owner.value = user.login;
      el.authState.style.display = 'inline-flex';
      el.authState.innerHTML = '<i></i>' + escapeHtml(user.login);
      if (!silent) log('令牌有效，已登录为 @' + user.login, 'ok');
      return user;
    } catch (e) {
      if (!silent) log(e.message, 'err');
      el.authState.style.display = 'none';
      return null;
    } finally {
      el.btnVerify.disabled = false;
    }
  }

  async function ensureRepo(api, owner, repo, isPrivate) {
    var existing = await api.tryGet('/repos/' + owner + '/' + repo);
    if (existing) {
      log('仓库已存在：' + existing.full_name, 'dim');
      return existing;
    }
    log('创建仓库 ' + owner + '/' + repo + '（' + (isPrivate ? 'private' : 'public') + '）…', 'dim');
    var payload = {
      name: repo,
      private: !!isPrivate,
      description: 'Deployed from personal site · ' + new Date().toISOString().slice(0, 10),
      auto_init: false,
      has_issues: true, has_wiki: false, has_projects: false
    };
    var isSelf = state.user && owner.toLowerCase() === state.user.login.toLowerCase();
    try {
      return isSelf ? await api.post('/user/repos', payload)
                    : await api.post('/orgs/' + owner + '/repos', payload);
    } catch (e) {
      if (!isSelf && (e.status === 404 || e.status === 403)) {
        log('组织建仓失败，尝试以个人账号创建…', 'warn');
        return await api.post('/user/repos', payload);
      }
      throw e;
    }
  }

  async function pushFiles(api, owner, repo, branch, files) {
    // 1) 当前分支 head（空仓库/新分支时为 null）
    var refPath = '/repos/' + owner + '/' + repo + '/git/ref/heads/' + branch;
    var ref = await api.tryGet(refPath);
    var headSha = ref && ref.object ? ref.object.sha : null;
    var baseTree = null;

    if (headSha) {
      var headCommit = await api.get('/repos/' + owner + '/' + repo + '/git/commits/' + headSha);
      baseTree = headCommit.tree.sha;
      log('当前 ' + branch + ' 指向 ' + headSha.slice(0, 7) + '，将基于它做增量提交', 'dim');
    } else {
      var info = await api.get('/repos/' + owner + '/' + repo);
      if (info.size > 0) log('分支 ' + branch + ' 不存在，将新建该分支', 'warn');
      else log('空仓库，写入首个提交', 'dim');
    }

    // 2) 逐个文件建 blob
    var tree = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var b64 = await fileToBase64(f.file);
      var blob = await api.post('/repos/' + owner + '/' + repo + '/git/blobs', {
        content: b64, encoding: 'base64'
      });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
      setProgress(18 + Math.round(((i + 1) / files.length) * 42));
      if ((i + 1) % 5 === 0 || i === files.length - 1) {
        log('已上传 ' + (i + 1) + '/' + files.length + ' 个文件（' + f.path + '）', 'dim');
      }
    }

    // 3) tree（带 base_tree 保留仓库里其他文件）
    var treeBody = { tree: tree };
    if (baseTree) treeBody.base_tree = baseTree;
    var newTree = await api.post('/repos/' + owner + '/' + repo + '/git/trees', treeBody);
    setProgress(64);

    // 4) commit（空仓库时不带 parents，GitHub 才会认作首个提交）
    var msg = String(el.commitMsg.value || '').trim() || 'deploy: publish web app';
    var commitBody = { message: msg, tree: newTree.sha };
    if (headSha) commitBody.parents = [headSha];
    var newCommit = await api.post('/repos/' + owner + '/' + repo + '/git/commits', commitBody);
    setProgress(70);

    // 5) 更新 / 创建分支引用
    if (headSha) {
      await api.patch('/repos/' + owner + '/' + repo + '/git/refs/heads/' + branch, {
        sha: newCommit.sha, force: false
      });
    } else {
      await api.post('/repos/' + owner + '/' + repo + '/git/refs', {
        ref: 'refs/heads/' + branch, sha: newCommit.sha
      });
    }
    setProgress(74);
    log('提交完成 ' + newCommit.sha.slice(0, 7) + ' → refs/heads/' + branch, 'ok');
    return newCommit;
  }

  async function enablePages(api, owner, repo, branch) {
    var existing = await api.tryGet('/repos/' + owner + '/' + repo + '/pages');
    if (existing && existing.html_url) {
      log('Pages 已开启：' + existing.html_url, 'dim');
      return existing;
    }
    try {
      var created = await api.post('/repos/' + owner + '/' + repo + '/pages', {
        source: { branch: branch, path: '/' }
      });
      log('GitHub Pages 已开启（source: ' + branch + ' /）', 'ok');
      return created;
    } catch (e) {
      if (e.status === 409 || e.status === 422) {
        var again = await api.tryGet('/repos/' + owner + '/' + repo + '/pages');
        if (again) return again;
      }
      throw e;
    }
  }

  async function waitPagesBuild(api, owner, repo) {
    var deadline = Date.now() + PAGES_TIMEOUT;
    var last = '';
    while (Date.now() < deadline) {
      var build = await api.tryGet('/repos/' + owner + '/' + repo + '/pages/builds/latest');
      if (build && build.status) {
        if (build.status !== last) {
          log('Pages 构建状态：' + build.status, 'dim');
          last = build.status;
        }
        if (build.status === 'built') { setProgress(100); return true; }
        if (build.status === 'errored') throw new Error('Pages 构建失败：' + (build.error && build.error.message || '未知原因'));
      }
      await sleep(5000);
    }
    log('等待构建超时（' + Math.round(PAGES_TIMEOUT / 1000) + 's），站点可能仍在构建中，稍后刷新看地址。', 'warn');
    return false;
  }

  function buildRecord(owner, repo, prefix, files, pagesUrl) {
    var id = repo + (prefix ? ':' + prefix : '');
    var pathLabel = prefix || '.';
    return {
      id: id,
      title: repo.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }),
      desc: '由发布中心部署 · ' + files.length + ' 个文件 · 分支 ' + el.branch.value.trim(),
      tags: ['GitHub Pages', prefix || 'root'],
      year: String(new Date().getFullYear()),
      hue: Math.abs(hash(id)) % 360,
      path: pathLabel,
      demo: pagesUrl || '',
      repo: 'https://github.com/' + owner + '/' + repo,
      deployedAt: new Date().toISOString()
    };
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h;
  }

  async function runDeploy() {
    if (state.busy) return;

    /* --- 前置校验 --- */
    var token = getToken();
    if (!token) { log('请先填写 Personal Access Token（步骤 1）', 'err'); el.token.focus(); return; }
    if (!state.files.length) { log('请先选择要部署的应用文件（步骤 2）', 'err'); return; }

    var repo = slugifyRepo(el.repo.value);
    if (!repo) { log('仓库名不合法：只能包含字母、数字、- _ .', 'err'); el.repo.focus(); return; }
    el.repo.value = repo;

    var branch = String(el.branch.value || 'main').trim() || 'main';
    var prefix = slugPrefix();
    var isPrivate = el.visibility.value === 'private';

    if (prefix && !/^[\w.\-\/]+$/.test(prefix)) {
      log('子目录只能包含字母、数字、- _ . /', 'err'); return;
    }

    /* 入口文件检查：缺 index.html 只警告 */
    var entryPath = prefix ? prefix + '/index.html' : 'index.html';
    if (!state.files.some(function (f) { return f.path === entryPath; })) {
      log('警告：找不到 ' + entryPath + '，站点首页会 404（除非你用子路径访问）', 'warn');
    }

    state.busy = true;
    el.btnDeploy.disabled = true;
    el.btnDeploy.textContent = '部署中…';
    el.result.classList.remove('show');
    setProgress(4);
    log('—— 开始部署 ——', 'dim');

    try {
      var api = createApi(token);

      /* 1. 身份 */
      if (!state.user) {
        state.user = await api.get('/user');
        log('登录账号 @' + state.user.login, 'dim');
      }
      var owner = String(el.owner.value || state.user.login).trim();
      el.owner.value = owner;
      setProgress(10);

      /* 2. 仓库 */
      if (isPrivate) log('提醒：免费账号的私有仓库无法开启 Pages，站点地址会不可用', 'warn');
      await ensureRepo(api, owner, repo, isPrivate);
      setProgress(16);

      /* 3. 上传 */
      var commit = await pushFiles(api, owner, repo, branch, state.files);

      /* 4. Pages */
      var pagesUrl = '';
      if (el.enablePages.checked) {
        if (isPrivate) {
          log('私有仓库跳过自动开启 Pages，可在仓库 Settings → Pages 手动尝试', 'warn');
        } else {
          var pages = await enablePages(api, owner, repo, branch);
          pagesUrl = (pages && pages.html_url) || ('https://' + owner + '.github.io/' + repo + '/');
          setProgress(80);
          await waitPagesBuild(api, owner, repo);
        }
      } else {
        log('已跳过 Pages 开启（仅推送代码）', 'dim');
      }
      if (!pagesUrl) pagesUrl = 'https://' + owner + '.github.io/' + repo + '/';
      setProgress(100);

      /* 5. 记录 + 展示 */
      var record = buildRecord(owner, repo, prefix, state.files, el.enablePages.checked && !isPrivate ? pagesUrl : '');
      record.repo = 'https://github.com/' + owner + '/' + repo;
      state.lastRecord = record;
      if (window.WSStore) {
        WSStore.add(record);
        log('已写入本机作品集记录，回首页即可看到新卡片', 'dim');
      }

      showResult(pagesUrl, record.repo, el.enablePages.checked && !isPrivate);
      log('—— 部署完成 ——', 'ok');
      log('在线地址：' + pagesUrl + '（首次生效可能需要 1 分钟）', 'ok');
    } catch (e) {
      setProgress(0);
      log('部署失败：' + e.message, 'err');
      if (e.status === 404 && /git\/ref/.test(String(e.message))) {
        log('提示：仓库可能刚创建，稍等 2 秒重试即可。', 'dim');
      }
    } finally {
      state.busy = false;
      el.btnDeploy.disabled = false;
      el.btnDeploy.textContent = '开始部署';
    }
  }

  function showResult(url, repoUrl, live) {
    el.resultUrl.textContent = url;
    el.resultUrl.href = url;
    el.resultRepo.href = repoUrl;
    el.resultSite.href = url;
    el.resultSite.style.display = live ? '' : 'none';
    el.result.classList.add('show');
  }

  /* ==================== 事件绑定 ==================== */
  function bind() {
    /* 令牌：恢复本标签页上次输入 */
    if (!NORESTORE) {
      try {
        var saved = sessionStorage.getItem(TOKEN_KEY);
        if (saved) { el.token.value = saved; verifyToken(true); }
      } catch (e) {}
    }

    el.btnVerify.addEventListener('click', function () { verifyToken(false); });

    el.token.addEventListener('change', function () {
      state.user = null;
      el.authState.style.display = 'none';
    });

    /* 选择文件夹 / 文件 */
    el.btnPickDir.addEventListener('click', function () { el.dirInput.click(); });
    el.btnPickFiles.addEventListener('click', function () { el.fileInput.click(); });

    el.dirInput.addEventListener('change', function () {
      if (!el.dirInput.files.length) return;
      setFiles(fromFileList(el.dirInput.files, true), '文件夹');
      el.dirInput.value = '';
    });

    el.fileInput.addEventListener('change', function () {
      if (!el.fileInput.files.length) return;
      setFiles(fromFileList(el.fileInput.files, false), '多选文件');
      el.fileInput.value = '';
    });

    el.btnClearFiles.addEventListener('click', function () {
      state.files = [];
      renderFiles();
      log('已清空文件列表', 'dim');
    });

    /* 拖拽 */
    ['dragenter', 'dragover'].forEach(function (ev) {
      el.dropZone.addEventListener(ev, function (e) {
        e.preventDefault(); el.dropZone.classList.add('hot');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      el.dropZone.addEventListener(ev, function (e) {
        e.preventDefault(); el.dropZone.classList.remove('hot');
      });
    });

    el.dropZone.addEventListener('click', function () { el.dirInput.click(); });
    el.dropZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dirInput.click(); }
    });

    el.dropZone.addEventListener('drop', async function (e) {
      var dt = e.dataTransfer;
      if (!dt) return;
      var items = dt.items ? Array.prototype.slice.call(dt.items) : [];
      var entries = items
        .map(function (it) { return it.webkitGetAsEntry ? it.webkitGetAsEntry() : null; })
        .filter(Boolean);

      if (!entries.length) {
        setFiles(fromFileList(dt.files, false), '拖入文件');
        return;
      }

      log('正在读取拖入的内容…', 'dim');
      var out = [];
      for (var i = 0; i < entries.length; i++) await walkEntry(entries[i], '', out);
      // 若拖入的是单个文件夹，去掉它的根目录名，让 index.html 落在发布根
      if (entries.length === 1 && entries[0].isDirectory) {
        var root = entries[0].name + '/';
        out = out.map(function (f) {
          return { path: f.path.indexOf(root) === 0 ? f.path.slice(root.length) : f.path, file: f.file };
        });
      }
      setFiles(out, '拖入');
    });

    /* 站内示例 */
    el.btnLoadSample.addEventListener('click', function () {
      log('读取站内示例 apps/hello-card/index.html …', 'dim');
      fetch('apps/hello-card/index.html')
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(function (html) {
          var file = new File([html], 'index.html', { type: 'text/html' });
          setFiles([{ path: 'index.html', file: file }], '站内示例');
          if (!el.repo.value) el.repo.value = 'pomodoro-clock';
        })
        .catch(function (e) {
          log('读取失败：' + e.message + '。用 file:// 直接打开页面时浏览器会拦截本地 fetch，请用本地服务（双击 start.bat）或直接拖入文件夹。', 'err');
        });
    });

    /* 部署 */
    el.btnDeploy.addEventListener('click', runDeploy);

    /* 日志 / 令牌 / 记录 */
    el.btnClearLog.addEventListener('click', function () {
      el.log.innerHTML = '';
      setProgress(0);
    });

    el.btnForget.addEventListener('click', function () {
      try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {}
      el.token.value = '';
      state.token = '';
      state.user = null;
      el.authState.style.display = 'none';
      log('已清除本页令牌', 'dim');
    });

    el.btnClearRecords.addEventListener('click', function () {
      if (!window.confirm('清空本机保存的部署记录？\n首页的「已上线」卡片会一起消失，GitHub 上的仓库不受影响。')) return;
      if (window.WSStore) WSStore.clear();
      log('已清空本机部署记录', 'dim');
    });

    el.btnCopyJson.addEventListener('click', function () {
      if (!state.lastRecord) return;
      var json = JSON.stringify(state.lastRecord, null, 2);
      var done = function () { log('作品 JSON 已复制，可粘贴到 assets/js/config.js 的 projects 数组里长期保存', 'ok'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(done, function () { log('复制失败，请手动复制：' + json, 'warn'); });
      } else {
        log('当前环境不支持剪贴板，JSON：' + json, 'warn');
      }
    });

    /* 子目录变更时重算入口提示 */
    el.prefix.addEventListener('input', renderFiles);

    /* 主题 */
    var THEME_KEY = 'ws.theme';
    try {
      var t = localStorage.getItem(THEME_KEY);
      document.documentElement.setAttribute('data-theme', t || 'dark');
    } catch (e) {}
    var tg = document.getElementById('themeToggle');
    if (tg) tg.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });

    var yn = document.getElementById('yearNow');
    if (yn) yn.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
