/**
 * WSStore —— 部署记录的唯一读写入口
 * 首页（site.js）与发布中心（deploy.js）都只通过这里访问 localStorage，
 * 避免两处各写一份 key / 结构不一致。
 */
(function () {
  'use strict';

  var KEY = (window.SITE_CONFIG && window.SITE_CONFIG.storageKey) || 'ws.deployments';

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  window.WSStore = {
    KEY: KEY,

    list: read,

    /** 按 id 覆盖写入（同一应用重复部署只保留最新一条） */
    add: function (item) {
      if (!item || !item.id) return false;
      var list = read().filter(function (x) { return x.id !== item.id; });
      list.unshift(item);
      return write(list);
    },

    remove: function (id) {
      return write(read().filter(function (x) { return x.id !== id; }));
    },

    clear: function () {
      return write([]);
    }
  };
})();
