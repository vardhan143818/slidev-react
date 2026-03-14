# CSS → Tailwind 审计报告

> 项目当前已引入 Tailwind v4（`@import "tailwindcss"` 在 `index.css` 开头），组件中广泛使用 Tailwind utility class。  
> 本报告审计了项目内 **10 个手写 CSS 文件（共 1,525 行）**，逐一评估每个文件中哪些规则适合迁移到 Tailwind utility class 放到 JSX 上，哪些必须留在 CSS 中。

---

## 总览

| 文件 | 行数 | 迁移建议 |
|---|---:|---|
| [tokens.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/tokens.css) | 149 | ❌ 保留 |
| [base.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/base.css) | 15 | ❌ 保留 |
| [prose.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/prose.css) | 264 | ❌ 保留 |
| [mark.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/mark.css) | 380 | ❌ 保留 |
| [transitions.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/transitions.css) | 142 | ❌ 保留 |
| [layouts.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/layouts.css) | 134 | ❌ 保留 |
| [print.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/print.css) | 107 | ⚠️ 部分可迁移 |
| [components.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/theme/components.css) | 232 | ✅ 大部分可迁移 |
| [g2/style.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/addons/g2/style.css) | 32 | ❌ 保留 |
| [insight/style.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/client/src/addons/insight/style.css) | 35 | ✅ 部分可迁移 |
| [theme-paper/style.css](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/packages/theme-paper/style.css) | 35 | ❌ 保留 |

---

## 必须保留的 CSS（不可迁移）

### 1. `tokens.css`（149 行） — 设计令牌

全部是 `:root` CSS 自定义属性，定义排版、颜色、间距等令牌。这是整个 slide theme 的基础设施。

**不可迁移原因**：Tailwind 不替代 CSS custom properties，这些 tokens 被 prose/components/layouts 引用。

### 2. `prose.css`（264 行） — 排版系统

为 `.slide-prose` 下的 `h1-h3`、`p`、`li`、`a`、`blockquote`、`table`、`code`、`pre` 等 HTML 元素设置排版样式，**全部通过 `var(--slide-*)` 消费 tokens**。

**不可迁移原因**：
- 这些规则针对 **MDX 编译输出的原生 HTML 元素**（用户写 markdown，编译后就是 `<h1>`、`<p>`、`<li>`），不经过 JSX 组件，无法添加 className
- 大量使用 `::before`/`::after` 伪元素（自定义有序/无序列表标记）
- CSS 变量间接引用（`var(--slide-li-font-size)` → `var(--slide-p-font-size)`）
- 复杂选择器：`tbody tr:nth-child(odd) td`、`:not(pre) > code`

### 3. `mark.css`（380 行） — 标注动画系统

实现 6 种手绘风格的文字标注（highlight、underline、box、circle、strike-through、crossed-off），每种都有多层 `::before`/`::after` 伪元素叠加纹理和手绘偏移。

**不可迁移原因**：
- 多层伪元素 + `repeating-linear-gradient` + `color-mix()` 纹理 — Tailwind 无法表达
- 6 组 `@keyframes` 动画（clip-path 绘制效果）
- `calc()` 链式变量计算
- 这是最精细的视觉实现，留在 CSS 中维护性最好

### 4. `transitions.css`（142 行） — 过渡/动画

4 种 slide transition + 3 种 reveal 动画 + `prefers-reduced-motion` 媒体查询。

**不可迁移原因**：`@keyframes` 定义只能在 CSS 中。trigger class 可以用 Tailwind 的 `animate-*` 自定义，但增加复杂度无收益。

### 5. `layouts.css`（134 行） — 布局令牌 override

每种 layout（cover、center、section、statement、two-cols、image-right）用 CSS class 覆盖 tokens 和定义 portrait 适配。

**不可迁移原因**：
- 规则本质是 **token override**（`--slide-h1-size: ...`），不是实际样式属性
- `:root[data-slide-viewport-orientation="portrait"]` 属性选择器
- Layout 组件已经使用 Tailwind 做布局，这里只是 token 层

### 6. `base.css`（15 行） — 根元素 reset

`html, body, #root` 全屏 + body margin 清零。最基础的全局设置。

**不可迁移原因**：全局 reset 天然属于 CSS 文件。

### 7. `g2/style.css`（32 行） — G2 图表 tooltip 覆写

全部带 `!important` 的样式覆写 G2 库内部渲染的 tooltip DOM。

**不可迁移原因**：这些 DOM 节点由 G2 库内部生成，完全不受我们的 JSX 控制，只能通过全局 CSS 选择器覆写。

### 8. `theme-paper/style.css`（35 行） — Paper 主题令牌

和 `tokens.css` 一样是纯 token 覆写（换字体、换配色），通过 `[data-slide-theme="paper"]` 属性选择器生效。

**不可迁移原因**：token 层，无法迁移到 Tailwind。

---

## 可迁移的 CSS

### 9. `components.css`（232 行） — ✅ 最大收益

这个文件包含两大块：

#### 9a. `.slide-badge`（~16 行） — ⚠️ 保留更佳

虽然是组件级样式，但 100% 消费 `var(--slide-*)` 令牌，migrate 到 Tailwind 后会变成大量 `[var(--slide-*)]` arbitrary value，可读性反而下降。

#### 9b. `.course-cover`（~178 行） — ✅ 推荐迁移

这是一个完整的 course cover 组件样式，包含 header、content、footer、progress-badge、series-name、author-info 等子元素。特点：

- 引用它的组件只有 [CourseCover.tsx](file:///Users/lucasay/Workspace/Projects/project-revidcraft/slidev-react/components/CourseCover.tsx)
- 大量**硬编码的 px/rem 值**、色值（`#1c1c1c`、`#ededed`、`#999`），没有走 token 系统
- 有 `data-tone="light"` 变体，可以用 Tailwind 的 `data-[tone=light]:` modifier 替代
- `color-mix()` 函数需要 arbitrary value，但大部分属性都是标准 Tailwind utility

**迁移方案**：将 `.course-cover` 及子元素的样式全部内联到 `CourseCover.tsx`，使用 Tailwind + `data-*` modifier。预计可从 `components.css` 中移除 ~178 行。

#### 9c. `.compact-copy` / `.compact-code` / `.code-heavy` / `.display-headline`（~24 行） — ⚠️ 保留更佳

这些是 frontmatter 在 slide className 上触发的 token override 类，用户在 MDX 中通过 `className: compact-copy` 使用。本质是 token 覆写，迁移到 Tailwind 无意义。

### 10. `insight/style.css`（35 行） — ✅ 部分可迁移

- `:root` token 声明（7 行）— 保留
- `.slide-layout-spotlight` radial-gradient（4 行）— 保留（复合 gradient）
- `.slide-insight` / `.slide-insight-title` / `.slide-insight-body`（~20 行）— **可迁移到 `Insight.tsx` 组件**

---

## 可迁移量化

| 区域 | 可迁移行数 | 说明 |
|---|---:|---|
| `course-cover` → `CourseCover.tsx` | ~178 | 最大块，独立组件 |
| `slide-insight-*` → `Insight.tsx` | ~20 | 小块，影响小 |
| **合计** | **~198** | 占总 CSS 的 **13%** |

### 11. `print.css`（107 行） — ⚠️ 部分可迁移

- `@media print` 块中的规则（~60 行）— 必须用 CSS 的 `@media print`，不过 Tailwind v4 支持 `print:` modifier，**理论上可迁移**部分属性
- `.print-slide-*` 类的非 print 样式（~20 行）— 可迁移到对应组件

**建议**：优先级低。Print 样式通常调试困难，频繁改动风险高，保持在 CSS 中更安全。

---

## 结论与建议

### 推荐动作

1. **迁移 `course-cover` 到 `CourseCover.tsx`**（优先级 🟢 高）
   - 178 行 → 0 行 CSS，全部转 Tailwind utility
   - 唯一消费者，改动安全
   - 消除 `data-tone` 选择器 → Tailwind `data-[tone=light]:` modifier

2. **迁移 `slide-insight-*` 到 `Insight.tsx`**（优先级 🟡 中）
   - 20 行 CSS → Tailwind
   - 小改动，简单直接

3. **其余 CSS 保留原样**（~1,307 行，87%）
   - Token 系统、Prose 排版、Mark 动画、Transition 等全部依赖 CSS-only 特性
   - 强行迁移到 Tailwind 会引入大量 arbitrary value，降低可读性

### 不建议的动作

- ❌ 不要迁移 `prose.css` — MDX 编译输出的原生 HTML 元素无法加 className
- ❌ 不要迁移 `mark.css` — 多层伪元素 + 纹理 gradient + 动画 keyframes
- ❌ 不要迁移 `tokens.css` / `layouts.css` — 纯 CSS 变量定义
- ❌ 不要迁移 `g2/style.css` — 三方库内部 DOM，只能 CSS 覆写
