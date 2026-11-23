# RYH-Intro · 个人简介作品集落地页

深色主题的单页作品集：首屏大标题 → 图片跑马灯 → 关于我 → 经历时间线 → 粘性堆叠项目卡片。

## 内容口径（2026-11-23 按简历更新）

文案以 `src/data/content.ts` 为唯一来源，均按简历（《产品经理-茹禹辉》）对齐：

- 首屏小字：`Vision Model PM · Beijing` / `Baidu · Feed Content Quality`
- 关于我：城大计算机硕士 → 百度 Feed 内容质量多模态 → 「把模型好不好拆成评测标准，再变成数据策略」
- 经历时间线（6 条）：百度 2026.01–至今 · 平安 2023.07–2024.04 · 网易互娱实习 2025.05–2025.08 · 金山实习 2025.02–2025.05 · 城大 2024.09–2025.10 · 北交 2018.09–2022.06
- 4 张项目卡：Caption Model / AI Video Call / Data Platform / Code Quality AI（卡片副标题写项目一句话）
- 联系方式：`ruyuhui0624@163.com`

图片口径：12 张项目封面为深色抽象风格生成图（非真实截图，可按同名文件替换）；`portrait.jpg` 由简历证件照抠图后合成 3:4 深炭底（2026-11-23 已按要求从首屏移除，文件保留在 `public/images/`，想恢复时在 `HelloSection.tsx` 里加回即可）。
## 技术栈

- React 18.3.1 + TypeScript
- Vite 5
- TailwindCSS 3.4.1（默认断点 sm 640 / md 768 / lg 1024）
- Framer Motion 12.38.0（FadeIn / AnimatedText / 粘性卡片滚动动画）
- lucide-react 0.344.0
- three 0.128.0（3D 星云背景）

## 本地运行

```bash
npm install
npm run dev      # 开发调试，默认 http://localhost:5173
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 预览打包结果
```

`vite.config.ts` 里 `base: './'`，打包产物可部署到任意子路径。

### 只想快速看一眼效果

双击 **`预览版/index.html`** 就能打开（JS/CSS 已内联，`images` 文件夹必须和它放在同一层）。这是单独的预览副本，`npm run build` 不会把它删掉；改了代码后想刷新预览，需要重新生成一次内联版本。

`dist/index.html` 不一样：它引用外部的 ES module 文件，浏览器不允许从 `file://` 加载，所以双击会白屏，要用 `npm run preview` 或部署后再看。

## 目录结构

```
ryh-intro/
├── index.html                 # 页面标题「RYH · 茹禹辉 | 视觉模型策略产品经理」、字体预连接
├── public/images/             # 34 张图（21 张跑马灯 + 12 张项目封面 + 1 张人像，人像当前未在首屏展示，文件保留）
├── src/
│   ├── index.css              # 字体、全局重置、.hello-heading / .hero-heading / .stack-card
│   ├── App.tsx                # 外层容器（背景 #0C0C0C + overflow-x: clip）+ 5 个章节
│   ├── data/content.ts        # ★ 全部文案：heroTagline / aboutText / timeline / projects / 联系方式
│   └── components/
│       ├── ContactButton.tsx  # 多色渐变药丸按钮
│       ├── FadeIn.tsx         # whileInView 入场（once、margin 50px）
│       ├── AnimatedText.tsx   # 逐字符滚动透明度（0.2 → 1）
│       ├── HelloSection.tsx
│       ├── MarqueeSection.tsx
│       ├── AboutSection.tsx
│       ├── ExperienceSection.tsx  # 经历时间线（work / intern / edu）
│       ├── ProjectsSection.tsx
│       ├── StarfieldBackground.tsx  # Three.js 星云背景（fixed 最底层）
│       ├── ClothWarp.tsx           # 鼠标按压布料变形（包裹整页内容）
│       └── InkCursor.tsx           # 点击/拖拽霓虹墨迹（fixed 最上层）
```

## 三组视觉动效

三层叠加，互不干扰：`StarfieldBackground`（fixed，z-0）→ `ClothWarp`（包裹全部页面内容，z-10）→ `InkCursor`（fixed，z-50，`pointer-events-none`）。

### 1. 星云星空背景（`StarfieldBackground.tsx`）

- 在 1200×1200×1200 的立方体内随机撒 6000 个点（`THREE.Points` + `PointsMaterial`，半透明、`size≈1.4`，additive 混合）
- 相机 `PerspectiveCamera(58, aspect, 1, 4000)`，`z=220`，挂在场景内
- 每帧 `rotation.y += 0.0012`、`rotation.x += 0.0004`，整团极缓慢转动
- 粒子贴图为运行时生成的 64×64 径向渐变 sprite（避免默认方块点）
- `resize` 自适应、DPR 上限 2、切到后台（`visibilitychange`）暂停渲染省电

### 2. 鼠标按压布料（`ClothWarp.tsx`）

- 14×10 弹簧网格（K=0.11 / DAMP=0.9 / 半径 250px / 最大位移 58px），鼠标对最近节点施加斥力，再做两次邻域扩散，松手后按阻尼回弹
- 位移场每 2 帧编码成 72×48 位移贴图，交给 SVG `feDisplacementMap`（scale=116）实时形变**真实 DOM**（文字、图片、按钮都跟着凹陷、拉扯，仍可点击/可选中）
- filter 区域按 `userSpaceOnUse` 跟随当前视口（`y=scrollY`），只在有位移时挂 filter，停手自动摘掉，避免白耗性能
- 仅在 `(hover:hover) and (pointer:fine)` 且未开启「减少动态效果」时启用

> 注：没有采用「把页面切成上百个网格、逐节点 `matrix3d`」的做法——单个 `matrix3d` 只能做整块仿射变换，做不出局部凹陷；切成网格会把页面复制成一堆不可交互的图片切片。SVG 位移贴图同样是把网格位移映射成形变，但保留了 DOM 的真实交互。

### 3. 点击霓虹墨迹（`InkCursor.tsx`）

- 全屏透明 canvas，**只画彩色像素、不铺任何底色**，`pointer-events-none` 所以不挡点击、不挡滚动
- 单击：16 个径向墨瓣 + 7 个外围溅射 + 1 个中心高光，错峰 0–120ms 出生；0.5s 内 ease-out 扩散到约 200px 后停住，再在 2s 内淡出
- 按住拖动：每 18ms 补一枚墨团，`sin/cos` 驱动横向扭动 + 缓慢漂移，寿命 2–2.6s 自然消散
- 颜色每次点击从 8 色霓虹色相池随机取主色，同簇内轻微色相抖动；两遍绘制（实体 + `lighter` 放大柔光）做出发光边缘
- 拖动时禁用文本选区（`userSelect` / `removeAllRanges`），避免拖出一片蓝色高亮

实测（Chrome，1440×900）：空闲 59.9 FPS，持续移动鼠标 51 FPS 左右；粘性卡片、滚动、按钮点击均正常。



1. **文案**
   - `src/data/content.ts` 的 `aboutText`（关于我正文）、`heroTagline`（首屏左下两行小字）
   - 首屏标题在 `HelloSection.tsx` 的 `h1`（`RYH` + `个人简介`，后半段 `0.82em` 是为了与 RYH 视觉等重、避免裁字）
   - 首屏左下角小字、导航文案在 `HelloSection.tsx` 顶部
2. **图片**
   - 直接替换 `public/images/` 下的同名文件即可，不用改代码；也可以改 `src/data/content.ts` 里的文件名。
   - 跑马灯：`marquee-01.jpg` ~ `marquee-21.jpg`（第 1 行 1-11，第 2 行 12-21，卡片 420×270，建议出 2x 图 840×540）
   - 项目图：`project-01/02/03/04-a|b|c.jpg`（a、b 放左侧 40% 堆叠，c 放右侧 60% 高图）
   - 人像：`portrait.jpg`（3:4 竖图）
3. **项目数据**：`src/data/content.ts` 的 `projects`，改 `name`、`subtitle`、`index` 和图片即可；`timeline` 数组是经历时间线（period / org / role / kind / note）。
4. **联系方式**：`src/data/content.ts` 里的 `contactHref` / `contactEmail`（当前 `ruyuhui0624@163.com`）。

## 动效参数（按需求原样保留）

- `HelloSection` 入场：导航 0 / 标题 0.15(y40) / 左小字 0.35(y20) / 按钮 0.5(y20) / 人像 0.6(y30)
- `MarqueeSection`：`offset = (scrollY - sectionTop + innerHeight) * 0.3`，第 1 行 `translateX(offset - 200)`，第 2 行 `translateX(-(offset - 200))`，数组三倍复制无缝循环，scroll 监听 `passive`
- `AnimatedText`：`offset: ['start 0.8', 'end 0.2']`，字符 opacity 0.2 → 1
- `ProjectsSection`：`targetScale = 1 - (total - 1 - index) * 0.03`，每张 `sticky top-24 md:top-32` 再叠加 `index * 28px`

## 一个环境说明

部分 Windows 机器装了应用控制策略（Application Control / Smart App Control），会拦截 rollup 的 `.node` 原生二进制，导致 `vite` 启动报 `ERR_DLOPEN_FAILED`。
因此 `package.json` 里加了：

```json
"overrides": { "rollup": "npm:@rollup/wasm-node@^4.30.0" }
```

用官方 WASM 版 rollup 代替原生版，功能一致、构建稍慢。如果你的机器没有这个限制，想换回原生版：删掉 `overrides`、删掉 `package-lock.json` 和 `node_modules` 后重新 `npm install` 即可。

## 部署到 GitHub Pages

仓库分两条分支：

- `main`：源码（`dist`、`node_modules`、`预览版` 均被 `.gitignore` 排除）
- `gh-pages`：只放 `npm run build` 的打包产物 + `.nojekyll`，GitHub Pages 直接发布这条分支

已上线（2026-11-23）：

- 仓库：<https://github.com/ruyuhui0624-design/ryh-intro>
- 线上地址：<https://ruyuhui0624-design.github.io/ryh-intro/>
- Pages 配置：Source = Deploy from a branch，Branch = `gh-pages` / `/ (root)`

`gh-pages` 分支由 `deploy.ps1` 自动生成并推送（脚本会 `npm run build` → 同步 `dist/` 到 `../ryh-intro-deploy` → 提交 → `git push origin gh-pages --force`）。

之后每次更新内容，只要在项目根目录执行：

```powershell
.\deploy.ps1
```

脚本推完约 1 分钟，`gh api repos/ruyuhui0624-design/ryh-intro/pages --jq .status` 变成 `built` 后刷新线上地址即可看到更新。

> 因为 `vite.config.ts` 里是 `base: './'`，放在 `/<仓库名>/` 子路径下也能正常加载资源，不用改成绝对路径。

## 部署

- **Vercel / Netlify**：导入仓库，构建命令 `npm run build`，产物目录 `dist`。
- **静态服务器 / GitHub Pages / 对象存储**：把 `dist/` 整个目录上传即可（`base: './'` 已经适配子路径）。
- 部署前把 `index.html` 的 `title`、`meta description` 换成你自己的。
