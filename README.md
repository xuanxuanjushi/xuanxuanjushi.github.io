# 个人站 + 资源站

**线上地址**：https://xuanxuanjushi.github.io/ （仓库为 `xuanxuanjushi.github.io`，Pages 自动发布 `main` 根目录）

两套并存的形态：

- **资源站（新，P1）**：`index.html` 列表 + `detail.html` 详情 + `admin/upload.html` 上传后台。全屏宽版布局，深色 + 酸性黄绿，数据来自 `assets/js/data.js`（假数据，后端未接）。
- **作品集 + 发布中心（原有）**：`works.html` 作品集、`deploy.html` 用浏览器把网页应用部署到 GitHub Pages。零依赖零构建。

```
Web station/
├─ index.html              ★ 资源列表页（顶栏 + 侧栏 + 瀑布流网格）
├─ detail.html             资源详情页（预览 / 下载卡 / 四个 Tab / 同类推荐）
├─ about.html              个人简介（简历数据驱动：时间线 / 教育 / 技能 / 荣誉）
├─ works.html              我的作品集（image / video / link / pdf 四种媒介 + 灯箱）
├─ notes.html / note.html  学习笔记（列表 + 富内容正文，可内嵌可运行的 demo）
├─ admin/
│  └─ upload.html          上传资源（P1：只存本机草稿，不落库）
├─ deploy.html             发布中心（GitHub 部署面板）
├─ test.html               发布流程自测（假 GitHub API 驱动真实 UI）
├─ start.bat               Windows 一键本地预览（127.0.0.1:5173）
├─ assets/
│  ├─ css/
│  │  ├─ site.css          ★ 资源站样式（外壳 / 列表 / 详情 / 后台）
│  │  └─ style.css         作品集样式（works.html 专用，两者互不影响）
│  ├─ img/covers/          占位封面（p01–p19，见下方版权说明）
│  ├─ img/works/           作品集图片（从作品集 PDF 提取，w01–w12）
│  └─ js/
│     ├─ data.js           ★ 资源站数据：站点信息 / 导航 / 分类 / 18 件资源
│     ├─ app.js            公共层：图标、主题、侧栏、卡片渲染、收藏、Toast
│     ├─ list.js           列表页：筛选 / 搜索 / 排序 / 加载更多
│     ├─ detail.js         详情页渲染
│     ├─ upload.js         上传页交互（本地草稿）
│     ├─ about.js          个人简介渲染
│     ├─ works.js          作品集渲染与灯箱
│     ├─ notes.js          笔记列表与标签筛选
│     ├─ note.js           笔记正文富块渲染（含 demo iframe）
│     ├─ config.js         作品集配置（站点名、个人信息、手写作品）
│     ├─ store.js          部署记录的 localStorage 读写
│     ├─ site.js           作品集渲染
│     └─ deploy.js         发布中心：GitHub API 封装与部署流程
└─ apps/hello-card/        可直接部署的示例应用（单文件番茄钟）
```

## 0. 资源站（P1）

### 页面与分工

| 页面 | 内容 | 数据来源 |
| --- | --- | --- |
| `index.html` | 顶栏（logo / 搜索 / 会员 / 登录）、可折叠侧栏、分类 chips、卡片网格、加载更多 | `data.js` → `list.js` |
| `detail.html?id=` | 面包屑、标题、元信息（版本/作者/更新/编号）、大图 + 缩略图、右侧获取卡、四个 Tab、同类推荐 | `data.js` → `detail.js` |
| `admin/upload.html` | 基础信息、价格与授权、详情内容、封面多图上传、资源文件 | `upload.js`（本地草稿） |

URL 参数即状态：`?cat=ai`、`?q=海报`、`?fav=1` 都能直接分享/刷新复现。

### 联系方式与「点击下载」

页脚名片（头像 / 姓名 / 职位 / 公司 / 电话 / 微信码）由 `app.js` 的 `renderFoot()` 统一渲染，
数据在 `data.js` 的 `site.contact` 里改一处，三个页面同步：

```js
contact: {
  avatar: '',                                 // 填 'assets/img/avatar.jpg' 就换成真头像，留空用姓名首字
  title: '高级设计师',
  company: '深圳市智领未来电子科技有限公司',
  phone: '19114719734',
  wechatQr: 'assets/img/wechat-qr.png',       // 换成自己的微信二维码截图即可
  github: 'xuanxuanjushi'
}
```

> `assets/img/wechat-qr.png` 目前是**占位码**：内容是含姓名/职位/公司/电话的 vCard，扫出来能存联系人。
> 换成真微信码只需覆盖这张图，代码不用动。

详情页的「点击下载」读 `项目.download`，为空时回落到 `site.downloadDefault`：

```js
{ id: 'p01', ... , download: 'https://pan.example.com/xxx' }   // 网盘 / Release / CDN 任意直链
```

两者都为空时按钮仍显示，点击提示去配置，不会是个死链。

### 全站导航原则

每个页面都有：**图标式返回**（从站内点进来的走 `history.back()`，直接打开的回逻辑父级）+ **面包屑**（知道自己在哪）+ **回到顶部**（滚动 360px 后出现）。
首页是站点根，没有来路时整条定位条不显示，避免出现只有「首页」的空条。

### 个人简介与作品集

`about.html` 全部由 `data.js` 的 `about` 渲染（内容取自简历）：首屏身份 + 工作/校园时间线 + 教育 + 侧栏基本信息/技能/证书。
改简历只需改数据，不动结构。

`works.html` 支持四种媒介，靠 `type` 决定打开方式：

```js
{ id: 'w01', title: '…', type: 'image', cover: 'assets/img/works/w02.jpg',
  gallery: ['assets/img/works/w02.jpg'], desc: '…', tags: ['电商详情'], year: '2025' }

type: 'image'  → 灯箱浏览 gallery（多图可左右翻）
type: 'video'  → video 字段填 mp4 直链则内嵌播放，填外链则跳转
type: 'link'   → 新窗口打开 href
type: 'pdf'    → 新窗口打开
```

现有 10 件作品图片由 `assets/img/works/` 提供，来自作品集 PDF 的图片提取（`.workbuddy/tmp` 下未保留脚本，需要重跑见提交记录）。

### 学习笔记（富内容）

`notes.html` 列表 + `note.html?id=` 正文。正文由 `data.js` 的 `notes[].blocks` 渲染，支持 8 种块：

| t | 用途 | 关键字段 |
| --- | --- | --- |
| `h2` | 小标题（自动进右侧目录） | `text` |
| `p` | 段落 | `text` |
| `quote` | 引用 | `text` / `by` |
| `list` | 列表 | `items[]` / `ordered` |
| `code` | 代码块 | `lang` / `code` |
| `img` | 图片（点击看原图） | `src` / `caption` |
| `video` | 视频：mp4 直链内嵌播放，其它地址按 iframe 嵌入 | `src` / `poster` |
| `demo` | **直接运行的前端效果**（iframe） | `src` / `title` / `height` |

`demo` 块现在挂的是 `apps/hello-card/`（番茄钟），所以笔记里能直接操作真实页面。
新增一篇笔记 = 往 `notes` 数组里加一条，不改代码。

### 「收藏网站」分类是链接区

`data.js` 的 `sites` 数组渲染成站点卡（色块图标 + 名称 + 介绍 + 域名），与资源卡分开：

```js
sites: [{ name: '站酷 ZCOOL', url: 'https://www.zcool.com.cn/', desc: '一句话介绍', hue: 8 }]
```

`icon` 可选（填图片地址），留空则用名称首字 + `hue` 色相生成，不依赖外部 favicon 请求。

### ⚠ 封面图的版权

`assets/img/covers/` 内 18 张图抓取自竞品站点，**仅用于版式占位**，版权属原权利人。
正式对外运营前必须逐条替换为自有图片（或停用），替换时把 `data.js` 里 `cover` / `gallery` 的短键
（如 `'p01'`）换成完整路径（如 `'assets/img/covers/my-cover.jpg'`）即可，渲染层两种都支持。

### 还没做的（P2 / P3）

- **P2 后端**：登录、项目表、文件存储、上传接口、分类管理后台
- **P3 打通**：列表/详情改读接口、搜索结果落库、收藏与下载记录

当前登录、购买、上传都只给前端反馈（`App.toast` 提示），不要误以为已经可用。

---

## 1. 改自己的信息（作品集）

只动 `assets/js/config.js`：

| 字段 | 说明 |
| --- | --- |
| `name` / `role` / `tagline` / `intro` | 首屏文案 |
| `location` / `email` / `github` | 联系信息与 GitHub 用户名 |
| `skills` | 关于页右侧的分组技能 |
| `projects` | 手写作品卡片（部署成功的会自动追加） |

`projects` 里每一项：`id`、`title`、`desc`、`tags[]`、`year`、`hue`（封面色相 0–360）、
`path`（左上角路径标签）、`demo`（在线地址，留空则显示「未部署」）、`repo`。

## 2. 本地预览

双击 `start.bat`（需要 Python 3），或手动：

```bash
python -m http.server 5173 --bind 127.0.0.1
# 打开 http://localhost:5173/
```

> 直接双击 `index.html` 也能看，但 `file://` 下浏览器会拦截 `fetch`，
> 发布中心的「载入站内示例」会失败——拖入文件夹不受影响。

## 3. 用发布中心部署一个网页应用

流程：**填 Token → 选文件 → 填仓库 → 开始部署**。

### 3.1 生成 Token（只需一次）

GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
→ Generate new token，勾选：

- `repo`（必须：建仓、推代码、开 Pages）
- 其它勾选项都不需要

把 token 贴进第一步的输入框。token 只存在当前标签页的 `sessionStorage`，
关掉标签页即失效；点「断开并清除令牌」可立刻清空。

### 3.2 选择文件

三种方式，任选其一：

1. **拖入文件夹**（推荐）：把应用目录整体拖进虚线框，自动去掉根目录名，
   `index.html` 直接落在发布根。
2. **选择文件夹 / 多个文件**：会忽略 `node_modules`、`.git`、`.vscode`、`dist`、隐藏文件、`.DS_Store`。
3. **载入站内示例**：把 `apps/hello-card` 的番茄钟作为一条 index.html 推送，用于试跑流程。

单文件超过 **25 MB** 会被跳过；入口必须是 `index.html`（否则首页 404，日志会警告）。

### 3.3 目标仓库

| 字段 | 说明 |
| --- | --- |
| 仓库名 | 不存在会自动创建；只允许字母、数字、`-` `_` `.` |
| 分支 | 默认 `main`；仓库非空且该分支不存在时会新建分支 |
| 子目录 | 一个仓库放多个应用时填，如 `apps/pomodoro`；留空 = 仓库根 |
| 可见性 | 免费账号只有 **public** 仓库能开 Pages |
| 自动开启 Pages | 勾选后推送完自动建 Pages 站点并轮询构建状态 |

### 3.4 部署做了什么

1. `GET /user` 校验身份，`GET /repos/{owner}/{repo}` 判断仓库是否存在，不存在则创建。
2. 每个文件 → `POST /git/blobs`（base64）。
3. 汇总成 tree（带 `base_tree`，保留仓库里已有文件）→ `POST /git/trees`。
4. `POST /git/commits` 生成**单个 commit**，再 `PATCH /git/refs/heads/{branch}` 移动分支。
5. `POST /repos/{owner}/{repo}/pages` 开启 Pages，`GET .../pages/builds/latest` 轮询到 `built`。
6. 结果写入 `localStorage`，回首页即出现带「已上线」标记的卡片，可一键复制成 `config.js` 条目。

一次部署 = 一个 commit，出问题直接 revert 即可回滚。

## 4. 把这个站自己也部署上去

发布中心本身就是个网页应用，用「选择文件夹」选本目录 → 仓库名如 `my-site`
→ 推到 `main`，再到仓库 Settings → Pages 选 `main` / root，站点即上线。

命令行等价操作：

```bash
git init && git add -A && git commit -m "init: personal site"
git branch -M main
git remote add origin https://github.com/<你>/<仓库>.git
git push -u origin main
```

## 5. 自测

打开 `test.html`（需本地服务），它会自动跑一遍部署流程：

- 在隐藏 iframe 里加载**真实的** `deploy.html`，把 `fetch` 换成假的 GitHub API
- 用真实 UI 操作（填表 → 选文件 → 点「开始部署」）驱动完整流程
- 两个用例：**首次部署（空仓库建仓建分支）**、**增量部署（已有分支上追加提交）**
- 断言请求序列、`base_tree` / `parents` 语义、日志、结果面板地址、本机记录写入
- 不联网、不创建真实仓库；结束后清理测试写入的记录与令牌

改动 `deploy.js` 后跑一次，21 项断言全绿再提交。

## 6. 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 401 令牌无效 | token 过期或被撤销，重新生成；注意别多复制空格 |
| 403 权限不足 | classic token 未勾 `repo`；或触发了 API 限流，等几分钟 |
| 404 建仓失败 | 组织仓库需要该组织的建仓权限；先在组织里给 token 授权 |
| 422 on Pages | 私有仓库在免费账号下不能开 Pages；或仓库为空（先推一次代码） |
| 站点 404 | 缺少 `index.html`；或访问路径不对（用了子目录时要带路径） |
| 站点 404 但日志显示 built | Pages 首次生效有延迟，等 1 分钟；也确认 `Settings → Pages` 的 source 是 `main /` |
| 打开是源码不是页面 | 分支/目录选错，或文件名大小写与引用不一致（Pages 区分大小写） |
| 上传很慢 | 文件个数多时是串行请求（避免触发二级限流），大项目建议先精简产物目录 |

## 7. 已知边界

- 只走浏览器直连 GitHub API，因此**没有**服务端能力：不能跑构建、不能装依赖、不能做 SSR。
  需要构建的项目请先本地 `npm run build`，再把 `dist/` 目录上传。
- 增量部署不删文件：GitHub 上手动删除，或在本地清空仓库后重推。
- 部署记录存在浏览器本地，换设备/清缓存就没了；重要作品请写进 `config.js`。
- 展示层按「一个仓库 = 一个卡片」处理，子目录部署会共用同一仓库地址。
