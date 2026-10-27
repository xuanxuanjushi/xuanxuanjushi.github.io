/**
 * data.js —— 前端假数据（P1 阶段不接后端）
 *
 * ⚠ 封面图来自竞品站点，仅作版式占位使用，版权属原权利人。
 *   正式对外上线前必须逐条替换为自有图片，或将 assets/img/covers/ 整体删除。
 *   替换方式：把 cover / gallery 里的短键换成 'assets/img/xxx.jpg' 完整路径即可，
 *   渲染层（app.js 的 imgUrl）同时支持短键与完整路径。
 */
window.SITE_DATA = {
  site: {
    name: '覃露雨的设计小院儿',
    owner: '覃露雨',
    tagline: '设计资产 · AI 工具 · 学习资料',
    vip: false,
    loggedIn: false,           // 接后端后由会话决定

    /* 页脚联系方式（三个页面共用，由 app.js 统一渲染，避免每页复制一份） */
    contact: {
      avatar: 'assets/img/avatar.jpg',                   // 人物照（圆形裁切），留空则回落到姓名首字
      name: '覃露雨',
      title: '高级设计师',
      company: '深圳市智领未来电子科技有限公司',
      phone: '15873329367',
      phoneLabel: '158 7332 9367',
      wechatId: 'Congratulate-5',                        // 微信号（直接展示，扫不出码也能加）
      wechatNick: 'rainrainrain',
      wechatQr: 'assets/img/wechat-qr.png',              // 二维码图：换成微信「我的二维码」截图即可
      wechatLabel: '微信扫码',
      email: '',                                         // 填了就出现邮箱入口
      github: 'xuanxuanjushi'
    },

    /* 下载链接的兜底值：资源自身的 download 为空时才用它（可放网盘、GitHub Release、CDN 等任意地址） */
    downloadDefault: ''
  },

  /* 左侧栏分组；type: link 直接跳转，cat 走分类筛选 */
  navGroups: [
    {
      title: '',
      items: [
        { label: '首页', icon: 'home', href: 'index.html', active: true },
        { label: '所有资源', icon: 'grid', href: 'index.html' },
        { label: '我的收藏', icon: 'star', href: 'index.html?fav=1' }
      ]
    },
    {
      /* 独立成组：它是「我写的文章」，不属于资源分类 */
      title: '专栏',
      items: [
        { label: '学习笔记', icon: 'note', href: 'notes.html' }
      ]
    },
    {
      title: '内容分类',
      items: [
        /* 顺序即认知顺序：工具 → 可直接用的素材 → 学习 → 外部收藏 */
        { label: 'AI 工具', icon: 'spark', href: 'index.html?cat=ai' },
        { label: 'Skills 技能包', icon: 'package', href: 'index.html?cat=skills' },
        { label: '设计素材', icon: 'image', href: 'index.html?cat=asset' },
        { label: '3D 素材', icon: 'box', href: 'index.html?cat=threed' },
        { label: '海报与模板', icon: 'layers', href: 'index.html?cat=post' },
        { label: '男模审美', icon: 'male', href: 'index.html?cat=male' },
        { label: '学习资料', icon: 'book', href: 'index.html?cat=study' },
        { label: '收藏网站', icon: 'link', href: 'index.html?cat=sites' }
      ]
    },
    {
      title: '我的',
      items: [
        /* 由「我是谁」到「我做过什么」再到「我能做什么」 */
        { label: '个人简介', icon: 'id', href: 'about.html' },
        { label: '我的作品集', icon: 'folder', href: 'works.html' },
        { label: '上传资源', icon: 'upload', href: 'admin/upload.html' },
        { label: '发布中心', icon: 'rocket', href: 'deploy.html' }
      ]
    }
  ],

  categories: [
    { id: 'all', name: '全部' },
    { id: 'ai', name: 'AI 工具' },
    { id: 'asset', name: '设计素材' },
    { id: 'threed', name: '3D 素材' },
    { id: 'skills', name: 'Skills 技能包' },
    { id: 'male', name: '男模审美' },
    { id: 'post', name: '海报与模板' },
    { id: 'sites', name: '收藏网站' },
    { id: 'study', name: '学习资料' }
  ],

  /* ---------- 学习笔记 ----------
   * blocks 是富内容块，渲染器支持：
   *   { t:'h2', text }                      小标题
   *   { t:'p', text }                       段落
   *   { t:'quote', text, by }               引用
   *   { t:'list', items:[...], ordered }    列表
   *   { t:'code', lang, code }              代码块
   *   { t:'img', src, alt, caption }        图片（点击放大）
   *   { t:'video', src, poster, caption }   视频：src 填 mp4 直链或嵌入地址
   *   { t:'demo', src, title, height }      直接跑起来的前端效果（iframe）
   */
  notes: [
    {
      id: 'n01',
      title: '单文件番茄钟：把状态收进一个对象',
      summary: '一个计时器最容易写成 spaghetti，这篇拆的是状态怎么收口、渲染怎么只做一件事。',
      tags: ['原生 JS', '状态管理'],
      date: '2026-10-26',
      minutes: 6,
      cover: 'assets/img/covers/p01.jpg',
      blocks: [
        { t: 'p', text: '计时器的复杂度不在「每秒减一」，而在开始/暂停/重置/切换阶段这四件事同时改状态。把状态收进一个对象，渲染函数只读不写，逻辑就塌不下去了。' },
        { t: 'h2', text: '状态只有五个字段' },
        { t: 'code', lang: 'js', code: "var st = {\n  mode: 'focus',   // focus | short | long\n  left: 1500,      // 剩余秒数\n  total: 1500,     // 本轮总长，用于画进度环\n  running: false,\n  done: 0          // 已完成番茄数\n};" },
        { t: 'p', text: '渲染函数只做一件事：把 st 映射成 DOM。不做判断以外的任何副作用，也不反向修改 st。' },
        { t: 'list', items: ['所有会改 st 的地方，只允许出现在 tick / start / pause / reset / next 五个函数里', 'DOM 更新集中在 paint()，它不判断业务，只读状态', '进度环用 stroke-dashoffset 而不是重画 SVG，避免每帧布局'] },
        { t: 'quote', text: '先想清楚「谁有权改状态」，再想界面怎么画——顺序反了就要返工。', by: '实现笔记' },
        { t: 'demo', src: 'apps/hello-card/index.html', title: '番茄钟（可直接操作）', height: 560 },
        { t: 'h2', text: '换成你自己的计时器' },
        { t: 'p', text: '想改时长只动三个常量：FOCUS / SHORT / LONG；想加「跳过本阶段」，复制 next() 的调用即可，其余不用碰。' }
      ]
    },
    {
      id: 'n02',
      title: '电商详情页的信息层级怎么排',
      summary: '同一张图，卖点顺序错了转化就差一截。拆解「痛点—证据—行动」三段式在长图里怎么落地。',
      tags: ['电商视觉', '排版'],
      date: '2026-10-24',
      minutes: 8,
      cover: 'assets/img/works/w03.jpg',
      blocks: [
        { t: 'p', text: '长图不是把卖点堆满，而是控制读者的注意力落点。经验是按三段推进：先让读者认出「这跟我有关」，再给「凭什么信」，最后才是「现在买」。' },
        { t: 'h2', text: '一屏只留一个信息点' },
        { t: 'img', src: 'assets/img/works/w03.jpg', alt: '护肤精华详情页', caption: '清透绿调强调修护感，首屏只讲一件事' },
        { t: 'p', text: '色块分隔比分割线更有效：视觉上形成「可以停一下」的顿点，又不会把版面切碎。' },
        { t: 'list', items: ['首屏：产品 + 一句话价值，字号最大', '第二屏：成分/参数，用对照表而不是大段文字', '第三屏：使用步骤，图多字少', '末屏：规格与购买信息，弱化但不缺席'], ordered: true },
        { t: 'quote', text: '信息层级不是「哪个重要就放大」，而是「读者此刻需要什么」。', by: '排版笔记' },
        { t: 'img', src: 'assets/img/works/w05.jpg', alt: '长图详情节奏', caption: '一屏一个信息点，靠留白控制节奏' }
      ]
    },
    {
      id: 'n03',
      title: '栅格与留白：三个能立刻改掉的习惯',
      summary: '页面看起来「差点意思」，多半不是素材不够好，而是间距不成体系。',
      tags: ['排版', '基础'],
      date: '2026-10-20',
      minutes: 5,
      cover: 'assets/img/works/w11.jpg',
      blocks: [
        { t: 'p', text: '留白不是剩余空间，是主动设计出来的分隔。间距一旦不成体系，再好的素材也会显得乱。' },
        { t: 'h2', text: '一、间距只用四档' },
        { t: 'p', text: '4 / 8 / 16 / 32。所有 margin、padding 从这四档里选，写 CSS 时不要出现 13px、23px 这种数。' },
        { t: 'h2', text: '二、同级元素等距，跨级元素翻倍' },
        { t: 'p', text: '标题与正文之间用 8，段落之间用 16，模块之间用 32。读者靠这个差距判断「哪些是一伙的」——这就是格式塔的接近性原则。' },
        { t: 'h2', text: '三、焦点只能有一个' },
        { t: 'quote', text: '如果整页都在强调，那就等于什么都没强调。', by: '格式塔 · 图形与背景' },
        { t: 'p', text: '把次要信息降一档（字号小 0.1rem、颜色降 15% 不透明度），焦点自然浮出来，不需要加粗加色加描边。' }
      ]
    }
  ],

  /* ---------- 个人简介（内容取自个人简历 PDF） ---------- */
  about: {
    name: '覃露雨',
    enName: 'QIN LUYU',
    portrait: 'assets/img/portrait.jpg',   // 简介页首屏竖幅肖像
    updated: '2026-10',
    stats: [
      { n: '4', unit: '段', label: '实习与工作' },
      { n: '10', unit: '件', label: '作品收录' },
      { n: '7', unit: '项', label: '证书与荣誉' },
      { n: '4', unit: '年', label: '视觉传达专业' }
    ],
    title: '高级设计师',
    company: '深圳市智领未来电子科技有限公司',
    intro: '视觉传达设计本科毕业。做过品牌视觉全流程：从服饰、广告物料到电商详情页，能把需求翻译成可落地的平面方案，也用过 AE / PR 做动态表达。相信电商视觉要靠持续迭代，愿意在项目里把每一个细节磨到可交付。',
    tags: ['电商视觉', '品牌物料', '详情页设计', '动态表达', '摄影'],
    facts: [
      { k: '现居', v: '深圳' },
      { k: '学历', v: '本科 · 视觉传达设计' },
      { k: '经验', v: '1 年（含实习）' },
      { k: '方向', v: '电商美工 / 品牌视觉' }
    ],
    education: {
      school: '广西民族大学相思湖学院',
      major: '视觉传达设计 · 本科',
      period: '2021.09 — 2025.06',
      courses: '字体设计 / 图形设计 / VI 设计 / IP 形象设计 / LOGO 设计 / 书籍装帧 / 包装设计 / 版式设计 / 交互设计 / 海报设计'
    },
    experience: [
      {
        period: '2025 — 至今',
        company: '深圳市智领未来电子科技有限公司',
        role: '高级设计师',
        points: [
          '负责品牌视觉与电商物料的设计输出，覆盖详情页、主图、活动页。',
          '与运营、产品对齐卖点优先级，把「先看什么、再看什么」落成版面结构。'
        ]
      },
      {
        period: '2024.12 — 2025.06',
        company: '兴趣岛信息科技有限公司',
        role: '平面美工设计师',
        points: [
          '聚焦产品详情页设计，按电商消费心理排布信息层级，输出契合产品特性的平面方案。',
          '承担线下实体物料排版，覆盖品牌运营与推广场景，统一视觉风格强化品牌触点。'
        ]
      },
      {
        period: '2024.06 — 2024.09',
        company: '平南卓动运动服饰',
        role: '电商设计师',
        points: [
          '主导定制球服设计排版，把创意图案转化为可落地生产的视觉元素。',
          '搭建运动服饰电商视觉规范，优化头图与详情页架构，沉淀设计模板与素材库。'
        ]
      },
      {
        period: '2024.01 — 2024.03',
        company: '林丰广告装饰公司',
        role: '广告设计师',
        points: [
          '负责门头、喷绘布、标识、名片等广告物料的排版设计，从品牌获客角度提炼诉求。',
          '兼顾打印资料等事务，多任务并行推进设计与客户服务。'
        ]
      }
    ],
    campus: {
      period: '2021.10 — 2023.10',
      org: '新媒体中心',
      role: '设计兼摄影负责人',
      points: [
        '参与校园微电影项目，跟进拍摄与剪辑全流程，积累视频策划与后期经验。',
        '为赛事与公益组织设计海报与场景，实践品牌化宣传逻辑。'
      ]
    },
    skills: [
      { group: '平面与排版', tier: '熟练', items: ['Photoshop', 'Illustrator', 'CorelDRAW', 'InDesign'] },
      { group: '动态与后期', tier: '掌握', items: ['After Effects', 'Premiere', '剪映'] },
      { group: '三维与原型', tier: '了解', items: ['KeyShot', 'Dimension', 'Rhino', 'Axure'] },
      { group: '办公', tier: '熟练', items: ['Word', 'Excel', 'PowerPoint'] }
    ],
    awards: [
      '普通话二级甲等',
      '计算机 WPS 一级证书',
      '高等学校英语应用能力 B 级',
      'C1 / D 驾驶证',
      '校园微电影大赛入围奖',
      '新媒体工作人员优秀奖',
      '班级优秀班干部'
    ]
  },

  /* ---------- 我的作品集（支持 image / video / link / pdf 四种媒介） ----------
   * type: 'image' 用 gallery 走灯箱；'video' 填 video（mp4 直链或 b 站/YouTube 嵌入地址）；
   *       'link' 外链跳转；'pdf' 打开 PDF。cover 必填，其余按类型派生。
   */
  works: [
    { id: 'w01', title: 'QIANKU 洁面美容仪', type: 'image', year: '2025',
      desc: '电商主图与详情页：把「85% OFF」做成视觉锚点，产品置于柔光台面，突出机身质感。',
      tags: ['电商详情', '主图'], cover: 'assets/img/works/w02.jpg', gallery: ['assets/img/works/w02.jpg'] },
    { id: 'w02', title: '护肤精华 · 详情页', type: 'image', year: '2025',
      desc: '清透绿色调强调「修护」的天然感，信息按痛点—成分—用法三段推进。',
      tags: ['详情页', '护肤'], cover: 'assets/img/works/w03.jpg', gallery: ['assets/img/works/w03.jpg'] },
    { id: 'w03', title: '耳机活动 Banner', type: 'image', year: '2024',
      desc: '橙白撞色做促销节奏，主体居中留出安全区，适配多尺寸投放。',
      tags: ['Banner', '3C'], cover: 'assets/img/works/w04.jpg', gallery: ['assets/img/works/w04.jpg'] },
    { id: 'w04', title: '护肤系列 · 长图详情', type: 'image', year: '2025',
      desc: '长图详情的节奏控制：一屏一个信息点，色块分隔替代分割线。',
      tags: ['长图', '排版'], cover: 'assets/img/works/w05.jpg', gallery: ['assets/img/works/w05.jpg'] },
    { id: 'w05', title: '咖啡机 · 品牌详情', type: 'image', year: '2024',
      desc: '深色底 + 金属高光，用产品局部特写建立「精密」的印象。',
      tags: ['品牌详情', '家电'], cover: 'assets/img/works/w06.jpg', gallery: ['assets/img/works/w06.jpg'] },
    { id: 'w06', title: '品牌标志合集', type: 'image', year: '2024',
      desc: '9 组标志的结构练习：几何化、负空间、中英文字标的搭配与栅格对齐。',
      tags: ['LOGO', '品牌'], cover: 'assets/img/works/w07.jpg',
      gallery: ['assets/img/works/w07.jpg', 'assets/img/works/w08.jpg'] },
    { id: 'w07', title: 'IP 形象设计', type: 'image', year: '2024',
      desc: '一个角色的三视图与表情延展，保证不同角度下特征可识别。',
      tags: ['IP 形象', '插画'], cover: 'assets/img/works/w09.jpg', gallery: ['assets/img/works/w09.jpg'] },
    { id: 'w08', title: '包装设计', type: 'image', year: '2024',
      desc: '成套包装的结构与展开面设计，统一色系区分口味。',
      tags: ['包装', '印刷'], cover: 'assets/img/works/w11.jpg', gallery: ['assets/img/works/w11.jpg'] },
    { id: 'w09', title: '书籍装帧与画册', type: 'image', year: '2024',
      desc: '《川西之旅》旅行画册：封面主图 + 内页留白节奏，附书签设计。',
      tags: ['装帧', '画册'], cover: 'assets/img/works/w12.jpg',
      gallery: ['assets/img/works/w12.jpg', 'assets/img/works/w10.jpg'] },
    { id: 'w10', title: '人像摄影', type: 'image', year: '2023',
      desc: '逆光环境下的肤色还原与高光控制，用于活动宣传与个人作品。',
      tags: ['摄影', '后期'], cover: 'assets/img/works/w01.jpg', gallery: ['assets/img/works/w01.jpg'] }
  ],

  /* 「收藏网站」分类：链接收藏，渲染成站点卡（图标 + 名称 + 介绍 + 域名）
   * icon 可留空（用首字母 + hue 色块），也可填图片地址，如 'assets/img/sites/zcool.png'
   */
  sites: [
    { name: '站酷 ZCOOL', url: 'https://www.zcool.com.cn/', desc: '国内设计师社区，作品、教程与素材市场的起点。', hue: 8 },
    { name: 'Behance', url: 'https://www.behance.net/', desc: 'Adobe 旗下作品集平台，看商业项目的完整推导过程。', hue: 220 },
    { name: 'Dribbble', url: 'https://dribbble.com/', desc: 'UI 与插画灵感流，适合找趋势和配色参考。', hue: 340 },
    { name: 'Figma Community', url: 'https://www.figma.com/community', desc: '免费设计文件、组件库与插件，可直接复制到自己的文件。', hue: 20 },
    { name: 'Mobbin', url: 'https://mobbin.com/', desc: 'App 与网页的真实界面截图库，按流程和组件检索。', hue: 250 },
    { name: 'Awwwards', url: 'https://www.awwwards.com/', desc: '网页设计评奖站，看交互与动效的具体手法。', hue: 0 },
    { name: 'Unsplash', url: 'https://unsplash.com/', desc: '免费可商用高清图库，适合找氛围图和背景。', hue: 200 },
    { name: 'Iconify', url: 'https://icon-sets.iconify.design/', desc: '20 万+ 开源图标统一检索，一套代码调所有图标库。', hue: 150 },
    { name: 'Coolors', url: 'https://coolors.co/', desc: '配色生成器，一键出五色方案并可导出变量。', hue: 280 },
    { name: 'Can I use', url: 'https://caniuse.com/', desc: '前端特性兼容性查询，做响应式与降级前先查这里。', hue: 100 },
    { name: '优设 UISDC', url: 'https://www.uisdc.com/', desc: '中文设计文章与教程，偏方法论与行业观察。', hue: 45 },
    { name: 'Fonts In Use', url: 'https://fontsinuse.com/', desc: '真实场景里的字体使用案例，找排版参照。', hue: 320 }
  ],

  /* cover / gallery 使用 assets/img/covers 下的短键。
   * 每件资源可加 download 字段（网盘 / Release / CDN 任意直链），详情页的「点击下载」直接用它；
   * 不填则回落到 SITE_DATA.site.downloadDefault；两者都空时点击只提示去配置。
   */
  projects: [
    {
      id: 'p01', title: '细密点阵 PPT 模板', cat: 'post', featured: true,
      subtitle: '点阵视觉体系，24 页母版与 3 套配色，支持一键换色',
      cover: 'p01', gallery: ['p01', 'p11', 'p13'],
      version: 'v1.2.0', author: '覃露雨', updated: '2026-10-24', code: 'PT-1024',
      free: true, price: 0, badge: '免费', downloads: 1286,
      desc: '一套以点阵秩序为核心的演示母版，包含封面、目录、数据页、过渡页与结尾共 24 页。所有元素均为可编辑矢量，字体、色板、栅格已做成母版变量，改一处全篇跟随。',
      install: '解压后双击 .pptx 打开，或导入 Keynote。字体缺失时替换为「思源黑体 / Inter」即可保持版式不变。',
      license: '可用于个人与商业项目，不可转售模板本身，不可作为模板合集二次分发。'
    },
    {
      id: 'p02', title: '数字人资产配置台', cat: 'ai',
      subtitle: '虚拟形象 + 语音合成 + 分镜脚本，一套跑通短口播',
      cover: 'p02', gallery: ['p02', 'p09', 'p16'],
      version: 'v2.0.1', author: '覃露雨', updated: '2026-10-22', code: 'AI-2201',
      free: false, price: 24, badge: '会员', downloads: 862,
      desc: '面向短口播场景的数字人工作台：形象库、音色库、分镜脚本三段式流程，输出 1080P 成片。内置 12 套口播脚本骨架，改文案即可出片。',
      install: '需要 Chrome 118+ 或 Edge 最新版；建议 16G 内存以上，导出 1080P 视频时关闭其它重型应用。',
      license: '仅限购买者本人使用，生成的成片可商用；不得转售资产包或用于二次训练。'
    },
    {
      id: 'p03', title: 'AI 提示词宝典', cat: 'ai',
      subtitle: '按场景归档的 320 条提示词，含结构与调试记录',
      cover: 'p03', gallery: ['p03', 'p04', 'p10'],
      version: 'v1.8.0', author: '覃露雨', updated: '2026-10-21', code: 'AI-1808',
      free: false, price: 18, badge: '热销', downloads: 2043,
      desc: '不是词库堆叠，而是「结构 + 变量 + 反例」三段式写法。覆盖电商图、海报、分镜、角色设定四类场景，每条都附失败案例与修正思路。',
      install: '纯文档 + 可复制代码块，用任意 Markdown 编辑器打开即可；配套 JSON 可直接导入脚本工具。',
      license: '个人与团队内部使用；不得整包转售或作为课程讲义分发。'
    },
    {
      id: 'p04', title: 'AI 设计工作台', cat: 'ai',
      subtitle: '多模型并排出图、批量重绘、参数面板一次调完',
      cover: 'p04', gallery: ['p04', 'p08', 'p17'],
      version: 'v1.4.3', author: '覃露雨', updated: '2026-10-20', code: 'AI-1403',
      free: false, price: 32, badge: '新品', downloads: 517,
      desc: '把「试参数」这件事做成流水线：同一提示词分发到多个模型，结果并排对比，选中的图直接进入批量重绘队列。参数面板支持保存预设，团队可共享。',
      install: '本地启动 Node 18+ 服务，浏览器访问 127.0.0.1:8787。首次运行需在设置页填入你自己的 API Key。',
      license: '单机授权，可安装于 2 台设备；不得去除版权信息后转售。'
    },
    {
      id: 'p05', title: '角色风格转绘 Skill', cat: 'skills',
      subtitle: '写实人像转二次元，保留五官比例与光影关系',
      cover: 'p05', gallery: ['p05', 'p06', 'p12'],
      version: 'v1.1.0', author: '覃露雨', updated: '2026-10-19', code: 'CH-1101',
      free: false, price: 28, badge: '会员', downloads: 943,
      desc: '重点解决「转完不像本人」：先用关键点锁定五官位置，再做风格迁移，最后用局部重绘修发丝与边缘。附 6 组对照参数。',
      install: '将 .json 工作流拖入 ComfyUI 画布，按提示安装两个自定义节点（已在包内附离线副本）。',
      license: '生成的图像可商用；工作流文件不可转售，不可打包进付费课程。'
    },
    {
      id: 'p06', title: '超写实人偶 Skill', cat: 'skills',
      subtitle: '瓷感肤质与绒面材质，含三组打光预设',
      cover: 'p06', gallery: ['p06', 'p05', 'p07'],
      version: 'v1.0.4', author: '覃露雨', updated: '2026-10-18', code: 'CH-1004',
      free: false, price: 26, badge: '会员', downloads: 731,
      desc: '针对「人偶感」的三件事：次表面散射强度、高光锐度、绒毛边缘。三组打光预设分别对应棚拍、窗光、逆光。',
      install: 'SDXL 底模 + 本包 LoRA；建议 12G 显存以上，8G 可用低显存模式但细节会损失。',
      license: '仅限个人创作与商业出图；模型权重不得二次分发。'
    },
    {
      id: 'p07', title: '3D 角色渲染工程', cat: 'threed',
      subtitle: '完整工程文件：拓扑、材质、灯光、渲染参数',
      cover: 'p07', gallery: ['p07', 'p11', 'p12'],
      version: 'v1.0.0', author: '覃露雨', updated: '2026-10-17', code: '3D-1000',
      free: false, price: 48, badge: '工程文件', downloads: 302,
      desc: '含模型源文件与最终渲染工程，材质球可单独取用。灯光按「主光 + 边缘光 + 环境补光」三层搭建，附参数截图。',
      install: 'C4D R25+ / Blender 4.x 均可打开（提供两份工程）；贴图路径为相对路径，解压后勿移动目录结构。',
      license: '工程文件仅限学习与自有项目使用；模型不得用于游戏发行或 NFT。'
    },
    {
      id: 'p08', title: '灵狐工作流界面', cat: 'ai',
      subtitle: '节点式编排界面，含 18 个预设节点组',
      cover: 'p08', gallery: ['p08', 'p04', 'p09'],
      version: 'v0.9.6', author: '覃露雨', updated: '2026-10-16', code: 'AI-0960',
      free: true, price: 0, badge: '免费', downloads: 1560,
      desc: '把常用链路做成了带注释的节点组：清理提示词、批量落盘、尺寸规整、失败重试。适合当作自己工作流的底座。',
      install: '拖入 ComfyUI 即可；节点组依赖的模型需自行准备，包内附清单与下载指引。',
      license: 'MIT，自由修改与分发，保留出处即可。'
    },
    {
      id: 'p09', title: '全自动出图 Agent', cat: 'ai',
      subtitle: '一句话需求 → 分镜 → 出图 → 归档，全链路自动',
      cover: 'p09', gallery: ['p09', 'p16', 'p17'],
      version: 'v1.3.2', author: '覃露雨', updated: '2026-10-15', code: 'AI-1302',
      free: false, price: 36, badge: '新品', downloads: 448,
      desc: '接入口播文案或商品链接，自动拆成分镜、生成提示词、批量出图并按项目归档。中间产物可人工干预，改完继续跑。',
      install: 'Node 18+，需配置一个支持函数调用的模型 Key；默认输出到 ./output，可在配置里改。',
      license: '单团队授权；不得用于生成违法违规内容，违规后果由使用者承担。'
    },
    {
      id: 'p10', title: '提词术移动端', cat: 'ai',
      subtitle: '手机端滚动提词 + 语速跟随，录制时不抖',
      cover: 'p10', gallery: ['p10', 'p03', 'p09'],
      version: 'v1.0.2', author: '覃露雨', updated: '2026-10-14', code: 'AI-1002',
      free: true, price: 0, badge: '免费', downloads: 1104,
      desc: '单页应用，手机浏览器直接打开就能用。字号、行距、滚动速度独立调节，支持镜像显示给提词器用。',
      install: '用手机打开页面后「添加到主屏幕」，可离线使用；无需登录。',
      license: 'MIT，自由使用与修改。'
    },
    {
      id: 'p11', title: '3D 场景资产库', cat: 'threed',
      subtitle: '32 组常用场景构件，带材质与 LOD',
      cover: 'p11', gallery: ['p11', 'p07', 'p12'],
      version: 'v2.1.0', author: '覃露雨', updated: '2026-10-13', code: '3D-2100',
      free: false, price: 56, badge: '合集', downloads: 268,
      desc: '桌面、展台、货架、灯带等 32 组高频构件，每个带 3 级 LOD 与烘焙好的 AO，直接拖进场景即可用。',
      install: '提供 .blend / .c4d / .fbx 三种格式；.fbx 不含材质节点，需重新指定贴图。',
      license: '可用于商业项目与客户交付；不得作为资产库转售。'
    },
    {
      id: 'p12', title: '暗调渲染工程', cat: 'threed',
      subtitle: '低照度氛围打光，蓝紫冷调与体积光',
      cover: 'p12', gallery: ['p12', 'p11', 'p07'],
      version: 'v1.0.1', author: '覃露雨', updated: '2026-10-12', code: '3D-1001',
      free: false, price: 38, badge: '工程文件', downloads: 195,
      desc: '专门拆解「黑而不闷」：用三层体积光拉开空间，材质粗糙度控制在 0.35–0.5 之间保留反射细节。',
      install: 'C4D + Octane 2023 以上；Redshift 用户可参考附带的转换说明。',
      license: '工程仅限学习参考，不得直接交付客户作为成品。'
    },
    {
      id: 'p13', title: '中式海报工作台', cat: 'post', featured: true,
      subtitle: '21 套版式 + 宣纸纹理 + 印章组件，可导出 300dpi',
      cover: 'p13', gallery: ['p13', 'p01', 'p17'],
      version: 'v1.0.0', author: '覃露雨', updated: '2026-10-11', code: 'PS-1000',
      free: false, price: 24, badge: '会员', downloads: 1248,
      desc: '中式留白不好做，问题多在「字与物的关系」。这套把标题、印章、留白比例做成可拖拽组件，改文案不用重排。',
      install: 'Photoshop 2021+ 打开 .psd；字体为开源字体（包内附），安装后再打开可避免字体缺失。',
      license: '可用于商业海报与电商详情页；模板本身不得转售。'
    },
    {
      id: 'p14', title: '烟雾模拟系统', cat: 'threed',
      subtitle: '流体解算预设，含 6 组风力与温度参数',
      cover: 'p14', gallery: ['p14', 'p12', 'p11'],
      version: 'v1.2.1', author: '覃露雨', updated: '2026-10-10', code: 'VD-1201',
      free: false, price: 42, badge: '工程文件', downloads: 176,
      desc: '不用手调每一帧：6 组预设覆盖「青烟上浮」「爆冲出膛」「贴地流散」，解算缓存已附带前 60 帧。',
      install: 'Blender 4.1+ 打开工程；解算建议 32G 内存，缓存目录已设为相对路径。',
      license: '工程与预设可商用；不得重新打包为素材包出售。'
    },
    {
      id: 'p15', title: '设计师进阶课', cat: 'study',
      subtitle: '从执行到决策：8 讲拆解作品集与商业项目',
      cover: 'p15', gallery: ['p15', 'p18', 'p03'],
      version: '2026 版', author: '覃露雨', updated: '2026-10-09', code: 'ST-2026',
      free: false, price: 68, badge: '课程', downloads: 402,
      desc: '讲的是「怎么判断」而不是「怎么做」：需求怎么拆、方案怎么选、作品集怎么讲清楚一页的取舍。附 4 个真实项目的复盘。',
      install: '在线观看 + 可下载讲义 PDF；建议配合自己的项目边看边改。',
      license: '仅限个人学习，不得录制传播或二次售卖。'
    },
    {
      id: 'p16', title: 'AI 影视 Agent', cat: 'ai',
      subtitle: '剧本 → 分镜 → 图生视频，一条链路出 30 秒片',
      cover: 'p16', gallery: ['p16', 'p09', 'p05'],
      version: 'v1.1.0', author: '覃露雨', updated: '2026-10-08', code: 'VD-1100',
      free: false, price: 45, badge: '新品', downloads: 356,
      desc: '把「文字到视频」拆成可校对的三步，每步都能改。分镜阶段输出镜头表（景别、时长、运动），避免一次性生成不可控。',
      install: '需要可访问图生视频模型的 API；本地仅做编排与拼接，成片用 ffmpeg 合成（包内附脚本）。',
      license: '单机授权，成片可商用；不得转售编排模板。'
    },
    {
      id: 'p17', title: '全自动资产面板', cat: 'asset',
      subtitle: '资产检索、去重、批量改名，一个面板管完',
      cover: 'p17', gallery: ['p17', 'p11', 'p01'],
      version: 'v1.0.5', author: '覃露雨', updated: '2026-10-07', code: 'AS-1005',
      free: true, price: 0, badge: '免费', downloads: 1873,
      desc: '本地文件夹扫描 + 预览缩略图 + 相似图去重。支持按尺寸、色相、创建时间筛选，批量改名可套规则。',
      install: 'Windows / macOS 桌面端，解压即用；首次启动会让你选一个素材根目录。',
      license: '免费使用；源码可见，允许修改。'
    },
    {
      id: 'p19', title: '男模审美图集', cat: 'male',
      subtitle: '60 组男性人像参考：姿态、光位与构图拆解',
      cover: 'p19', gallery: ['p19', 'p06', 'p05'],
      version: 'v1.0.0', author: '覃露雨', updated: '2026-10-26', code: 'ML-1000',
      free: true, price: 0, badge: '新品', downloads: 216,
      desc: '挑的是「耐看」而不是「好看」：同一套光位下不同体态的气质差异、肩颈与下颌的角度、留白与裁切的关系。每张都标注了镜头焦段与主光方向。',
      install: 'PDF + 图片文件夹，按「姿态 / 光位 / 构图」三类分目录，直接拖进参考板即可。',
      license: '仅限个人学习与内部提案参考，不得直接商用或二次分发。'
    },
    {
      id: 'p18', title: '头脑风暴导图', cat: 'post',
      subtitle: '深色思维导图模板，节点即卡片，可导出 SVG',
      cover: 'p18', gallery: ['p18', 'p15', 'p13'],
      version: 'v1.1.2', author: '覃露雨', updated: '2026-10-06', code: 'PT-1102',
      free: true, price: 0, badge: '免费', downloads: 967,
      desc: '深色底 + 低饱和节点色，长时间看不累。三套层级样式（发散 / 流程 / 对比），导出 SVG 可继续在 Figma 里改。',
      install: 'XMind 2023+ 或 MindNode 打开 .xmind；也提供纯 SVG 版本供 Figma 导入。',
      license: '个人与商业演示均可使用；不得作为模板转售。'
    }
  ]
};
