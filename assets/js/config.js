/**
 * 站点配置 —— 唯一需要手改的文件
 * 说明：纯数据，不含逻辑。修改后刷新页面即可生效。
 */
window.SITE_CONFIG = {
  /* ---------- 站点名与个人信息 ---------- */
  siteName: '覃露雨的设计小院儿',        // 导航品牌 / 浏览器标题 / 页脚
  name: '覃露雨',                  // 首屏「你好，我是 X」
  role: '前端工程师 · 独立开发者',
  tagline: '把想法做成能用的网页。',
  intro:
    '我做界面、写交互，也折腾数据和自动化。喜欢把一个小问题拆到能被验证的程度，然后把它交付出去——不是一个能跑的 demo，而是一个能长期维护的东西。',
  location: '中国 · 杭州',
  email: 'hello@example.com',      // TODO 换成真实邮箱，全站 mailto 会自动跟随
  github: 'xuanxuanjushi',

  /* 导航右侧的次要链接，可增删 */
  links: [
    { label: 'GitHub', href: 'https://github.com/xuanxuanjushi' },
    { label: '邮箱', href: 'mailto:hello@example.com' }
  ],

  /* ---------- 技能 ---------- */
  skills: [
    { group: '前端', items: ['JavaScript / TypeScript', 'React', 'Vite', 'CSS 架构', 'Canvas / SVG'] },
    { group: '后端', items: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] },
    { group: '工程', items: ['Git / GitHub Actions', 'Docker', '自动化测试', '性能调优'] }
  ],

  /* ---------- 作品（长期清单） ----------
   * 放在本仓库 apps/<slug>/ 的应用，demo 用相对路径即可，例如 'apps/hello-card/'；
   * 独立仓库的应用，demo 写完整地址，如 'https://<用户名>.github.io/<仓库名>/'。
   * 发布中心部署成功的应用会临时追加（存浏览器 localStorage），不必写在这里；
   * 想让它长期保留、换设备也在，就点发布中心的「复制作品 JSON」把结果粘进来。
   */
  projects: [
    {
      id: 'hello-card',
      title: '番茄钟',
      desc: '单文件番茄工作法计时器，支持任务队列与桌面通知，无任何依赖。',
      tags: ['原生 JS', 'CSS', '单文件'],
      year: '2026',
      hue: 158,
      path: 'apps/hello-card',
      demo: 'apps/hello-card/',
      repo: ''
    }

    /* 复制粘贴模板：
    ,{
      id: 'repo:apps/demo',
      title: 'Demo App',
      desc: '一句话说清它解决什么问题。',
      tags: ['GitHub Pages'],
      year: '2026',
      hue: 210,
      path: 'apps/demo',
      demo: 'https://xuanxuanjushi.github.io/demo/',
      repo: 'https://github.com/xuanxuanjushi/demo'
    }
    */
  ],

  /* ---------- 存储键（发布中心与首页共用） ---------- */
  storageKey: 'ws.deployments'
};
