# 多个应用放在哪

两种放法，按"这个项目要不要独立迭代"来选。

| 方式 | 位置 | 线上地址 | 适合 |
| --- | --- | --- | --- |
| **A 同仓子目录** | 本仓库 `apps/<slug>/` | `https://xuanxuanjushi.github.io/apps/<slug>/` | 轻量 demo、和站点一起备份、共用风格 |
| **B 独立仓库** | 另一个仓库的根目录 | `https://xuanxuanjushi.github.io/<仓库名>/` | 正式应用、要单独迭代 / 独立 README / issue |

> 一句话：**小工具走 A，正经产品走 B。** 不要在一个仓库里堆十几个无关项目，也不要为一个 80 行的 demo 单开仓库。

---

## A：放进本仓库

1. 目录：`apps/<slug>/`，必须有一个 `index.html` 作为入口，其它资源同级或子目录。
2. 在 `assets/js/config.js` 的 `projects` 里登记一条，`demo` 用**相对路径**：

```js
{
  id: 'my-tool',
  title: '我的小工具',
  desc: '一句话说清它解决什么问题。',
  tags: ['原生 JS'],
  year: '2026',
  hue: 210,                    // 封面色相 0–360
  path: 'apps/my-tool',
  demo: 'apps/my-tool/',       // 相对路径，换域名也不用改
  repo: 'https://github.com/xuanxuanjushi/xuanxuanjushi.github.io/tree/main/apps/my-tool'
}
```

3. 提交推送，Pages 会自动更新：

```bash
git add -A && git commit -m "feat(apps): 新增 my-tool" && git push
```

## B：独立仓库

用 `deploy.html` 发布中心：选文件夹 → 仓库名填 slug → 勾选自动开启 Pages。
部署成功后点「复制作品 JSON」，把内容粘进 `config.js` 的 `projects`，
再把 `demo` 改成完整地址 `https://xuanxuanjushi.github.io/<仓库名>/`。

命令行等价做法：

```bash
cd <你的项目目录>
git init -b main && git add -A && git commit -m "init"
git remote add origin https://github.com/xuanxuanjushi/<仓库名>.git
git push -u origin main
# 然后到仓库 Settings → Pages 选 main / root
```

---

## 硬性约定

- **slug 规则**：全小写，只用 `a-z` `0-9` `-`。URL 会区分大小写，`MyTool` 和 `mytool` 是两个地址。
- **入口文件名必须是 `index.html`**，否则 `apps/<slug>/` 打开是 404（`apps/<slug>/index.html` 能打开，但目录路径不行）。
- **资源引用一律相对**：写 `./style.css` 或 `assets/app.js`，**不要**写 `/style.css`——子目录部署时根路径会指到站点根，直接 404。
- **不引入构建步骤**：这些应用是直接跑的静态文件。需要 `npm run build` 的，本地构建完把产物目录上传（提交 `dist/` 内容，不是源码）。
- **不放重复文件**：两个应用都要用的库，要么各自内联（小），要么放 `apps/shared/` 并写清楚谁在用。

## 上线前自查

- 本地打开 `apps/<slug>/index.html` 能跑（或 `start.bat` 后访问 `/apps/<slug>/`）。
- 手机宽度下不横向滚动。
- 推送后访问 `https://xuanxuanjushi.github.io/apps/<slug>/` 返回 200 且样式正常（Pages 首次生效约 40 秒）。
