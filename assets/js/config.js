/**
 * 站点配置 —— 唯一需要手改的文件
 * 说明：纯数据，不含逻辑。修改后刷新页面即可生效。
 */
window.SITE_CONFIG = {
  /* ---------- 个人信息 ---------- */
  // TODO 上线后请把 name / email 换成你自己的真名与邮箱（其余位置会自动跟着变）
  name: 'xuanxuanjushi',
  role: '前端工程师 · 独立开发者',
  tagline: '把想法做成能用的网页。',
  intro:
    '我做界面、写交互，也折腾数据和自动化。喜欢把一个小问题拆到能被验证的程度，然后把它交付出去——不是一个能跑的 demo，而是一个能长期维护的东西。',
  location: '中国 · 杭州',
  email: 'hello@example.com',
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

  /* ---------- 手写作品（部署成功的会自动追加，见 assets/js/site.js） ---------- */
  projects: [
    {
      id: 'hello-card',
      title: '番茄钟',
      desc: '单文件番茄工作法计时器，支持任务队列与桌面通知，无任何依赖。',
      tags: ['原生 JS', 'CSS', '单文件'],
      year: '2026',
      hue: 158,
      path: 'apps/hello-card',
      demo: '',            // 已上线地址（部署后可留空，由发布中心自动记录）
      repo: ''             // 仓库地址
    },
    {
      id: 'notes-board',
      title: '便签看板',
      desc: '拖拽排序的轻量看板，数据落在 localStorage，支持导入导出 JSON。',
      tags: ['交互设计', '拖拽', '本地存储'],
      year: '2025',
      hue: 220,
      path: 'src/board',
      demo: '',
      repo: ''
    },
    {
      id: 'csv-lab',
      title: 'CSV 分析台',
      desc: '浏览器内解析 CSV，做分组聚合与图表预览，文件不出本机。',
      tags: ['数据处理', 'Chart', '隐私'],
      year: '2025',
      hue: 32,
      path: 'src/csv-lab',
      demo: '',
      repo: ''
    }
  ],

  /* ---------- 存储键（发布中心与首页共用） ---------- */
  storageKey: 'ws.deployments'
};
