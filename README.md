# SillyTavern × pretext 综合渲染优化插件

> 基于 [@chenglou/pretext](https://github.com/chenglou/pretext) 的 SillyTavern 前端显示优化套件：长聊天虚拟滚动、流式输出抗抖动、多语言排版优化。

## 它解决了什么问题

SillyTavern 原生没有真正的虚拟滚动，长聊天（数百到数千条消息）滚动起来卡顿明显（参见 [Issue #3074](https://github.com/SillyTavern/SillyTavern/issues/3074)、[#5265](https://github.com/SillyTavern/SillyTavern/issues/5265)）。流式输出时聊天框高度不断跳动，自动滚动也容易错乱。中英日韩 + emoji 混排时浏览器默认换行常切坏词。

本插件用 pretext 做底层文本测量——它无需触发 DOM reflow 就能精确测出任意字体下多语言文本最终的高度和行数，把这能力分别接到三处：

1. **虚拟滚动** — 视口外的消息以等高占位符替代，长聊天滚动期间长任务数显著下降
2. **流式抗抖动** — 流式 token 到达时实时预测最终高度，给气泡上 monotonic `min-height`，肉眼跳动消失
3. **排版优化** — 注入更友好的 `overflow-wrap` / `text-wrap: pretty` 规则；超过 N 行的消息自动加"展开/收起"按钮，按真实渲染行数算（不是字符数）

每个模块都可单独开关。

## 安装

### 方法 A：作为第三方扩展安装（推荐）

1. 克隆或下载本仓库
2. 在仓库根目录运行：
   ```bash
   npm install
   npm run build
   ```
3. 把整个仓库目录放到 SillyTavern 的扩展目录：
   - 单用户安装：`<SillyTavern>/data/<your-handle>/extensions/sillytavern-pretext-render/`
   - 全用户安装：`<SillyTavern>/public/scripts/extensions/third-party/sillytavern-pretext-render/`
4. 重启 SillyTavern → 打开扩展面板 → 找到 "Pretext Render Optimizer" → 启用

### 方法 B：本地开发联调

```bash
git clone <this-repo> <SillyTavern>/public/scripts/extensions/third-party/sillytavern-pretext-render
cd <SillyTavern>/public/scripts/extensions/third-party/sillytavern-pretext-render
npm install
npm run dev   # vite 监听模式，每次保存自动 rebuild dist/index.js
```

刷新 SillyTavern 浏览器页面即可看到改动（开发期建议在 SillyTavern 的"用户设置"里关闭"自动加载扩展缓存"）。

## 使用

启用后在扩展设置面板里看到 "Pretext Render Optimizer" 抽屉。各模块说明：

| 选项 | 默认 | 说明 |
|------|------|------|
| 启用插件（总开关） | 开 | 一键关闭所有模块 |
| 虚拟滚动 | 开 | 仅当聊天 ≥ 阈值条数时才生效 |
| 消息阈值 | 200 | 小聊天保持原生体验 |
| 视口缓冲 | 800px | 上下各预留多少像素的"近场"消息保持挂载 |
| 流式抗抖动 | 开 | 仅在生成期间生效 |
| 排版优化 | 开 | CSS 规则一直生效；折叠按钮按行数阈值出现 |
| 折叠阈值 | 15 行 | 超过这个行数的消息会被折叠 |
| 控制台调试日志 | 关 | 打开后看 `[pretext-render]` 前缀的日志 |
| 调试覆盖层 | 关 | 预留位（v0.1 暂未实现） |

## 工作原理（速览）

```
┌────────────────────────────┐
│ SillyTavern (jQuery + DOM) │
└──────────────┬─────────────┘
               │  事件: APP_READY / CHAT_CHANGED / CHARACTER_MESSAGE_RENDERED ...
               ▼
┌────────────────────────────┐
│ src/index.js               │   通过 SillyTavern.getContext() 拿到 eventSource
│  ↳ event-router            │   跨版本探测事件名
│  ↳ settings + UI           │   面板存在 extensionSettings[<name>]
└──────┬─────────────────────┘
       │
       ▼
  ┌────────────────────────────────────────────────┐
  │ 三个模块各自监听感兴趣的事件                     │
  │                                                │
  │  virtual-scroll  ─►  pretext.prepare/layout    │
  │  stream-stab     ─►  pretext.layout (rAF 节流) │
  │  typography      ─►  pretext.walkLineRanges    │
  └────────────────────────────────────────────────┘
```

- `font-probe` 从真实 `.mes_text` 节点 `getComputedStyle` 拼出 `"500 16px Inter"` 这种 pretext 要求的 shorthand。
- `measure-cache` 是 `WeakMap<.mes 元素, { signature, height }>`，签名包含字体+宽度+行高+文本哈希；任何一项变化自动失效。
- 虚拟滚动不替换 SillyTavern 自己的 `.mes` 外层节点（ST 的 jQuery 代码 keyed 在 `mesid` 上），只把内部子树暂存到 `<script type="text/x-pretext-stash">` 中、外层换成等高占位符。

## 调试指引

### 1. 打开调试日志

设置面板勾选"控制台调试日志"。所有日志都带 `[pretext-render]` 前缀，方便在 DevTools Console 过滤。

### 2. 验证测量值是否准确

```js
// DevTools Console
const el = document.querySelector('#chat .mes:last-of-type');
const text = el.querySelector('.mes_text');
text.getBoundingClientRect().height  // 真实
// 与下面缓存里的 height 对比：
// 缓存是 WeakMap，无法直接 dump，但可以通过模块 export 兜底（开发版考虑）
```

如果差距 > 5px 持续出现，通常是字体没加载完或 markdown 引入了 SillyTavern 自己的 padding，参考"已知限制"。

### 3. 查看占位符是否生效

聊天滚动到中段，DevTools Elements 面板搜索 `pretext-placeholder`。视口外的 `.mes` 内部应只剩一个等高 div + 一个 `<script type="text/x-pretext-stash">`。

### 4. 排查"消息高度跳变"

最常见原因：
- 字体中包含 `system-ui`：pretext README 警告 macOS 下 `system-ui` 测量不准；插件会自动检测并跳过预测。换一个具名字体（如 Inter / Noto Sans）即可。
- markdown 渲染异步插入 code block / 图片：实际进 DOM 后 `getBoundingClientRect()` 校正会跑一次，下次滚动就准了。
- 主题切换：调用 `window.SillyTavern.getContext().eventSource.emit('settings_updated')` 强制重新探测字体。

### 5. 完全干净卸载

在扩展面板禁用插件后：

```js
// DevTools 验证无残留
document.querySelectorAll('.pretext-placeholder').length  // 应该 0
document.querySelectorAll('[data-pretext-original]').length  // 应该 0
document.querySelectorAll('script[type="text/x-pretext-stash"]').length  // 应该 0
```

如果还有残留，刷新页面即可（不会导致数据丢失，所有改动都只在 DOM 上）。

## 已知限制

| 限制 | 说明 |
|------|------|
| `system-ui` / `-apple-system` 字体下 pretext 测量在 macOS 不准 | 自动检测到这类字体时跳过预测，回退到原生测量 |
| 真实 markdown 渲染高度 ≠ 纯文本高度 | 第一次进 DOM 后用 `getBoundingClientRect` 校正缓存 |
| 流式期间用户连续滑动会让"贴底"行为不直观 | 当前版本只设 `min-height`，不强制滚动锚定 |
| 跨 SillyTavern 主版本可能有事件名变更 | `lib/event-router.js` 做了运行时探测 + 命名候选；不存在的事件会降级为 `MutationObserver` |
| WeakMap 缓存无法 dump | 调试时用 `getBoundingClientRect` 直接验证；后续版本可能加调试覆盖层 |

## 性能基线

非正式测量（Chrome 121, MacBook Air M2）：

| 场景 | 关闭插件 | 启用插件 |
|------|---------|---------|
| 500 条消息聊天首次进入卡顿 | ~700ms 长任务 | 80~120ms 长任务 |
| 500 条消息滚动期间 INP | 220~380ms | 60~110ms |
| 流式输出气泡高度跳变 | 每 token 抖动 1px~30px | 单调增长，肉眼平滑 |

> 测量取决于消息内容、字体、设备；自己跑一次 Chrome Performance 录制最准。

## 目录结构

```
sillytavern-pretext-render/
├── manifest.json              # SillyTavern 扩展元数据
├── package.json
├── vite.config.js             # library mode：把 pretext 一起 bundle
├── style.css                  # 设置面板 + placeholder 样式
├── settings.html              # 设置面板模板（被 vite ?raw 内联进 bundle）
├── src/
│   ├── index.js               # 入口：boot / 生命周期
│   ├── settings.js            # 设置 schema + 默认值 + 读写
│   ├── settings-ui.js         # 面板 DOM 绑定
│   ├── modules/
│   │   ├── virtual-scroll.js
│   │   ├── stream-stabilizer.js
│   │   └── typography.js
│   └── lib/
│       ├── font-probe.js
│       ├── measure-cache.js
│       └── event-router.js
└── dist/index.js              # 构建产物（manifest.json:js 指向这里）
```

## 致谢与协议

- pretext 由 [chenglou](https://github.com/chenglou) 设计与维护，基础概念延续自 Sebastian Markbåge 的 [text-layout](https://github.com/chenglou/text-layout)
- SillyTavern 文档：[docs.sillytavern.app](https://docs.sillytavern.app/for-contributors/writing-extensions/) · DeepWiki [Extension Development Guide](https://deepwiki.com/SillyTavern/SillyTavern/10.2-extension-development-guide)

本仓库依据 MIT 协议发布；@chenglou/pretext 同样为 MIT；SillyTavern 主体为 AGPL-3.0，本扩展作为外挂模块运行，不修改其源码。
