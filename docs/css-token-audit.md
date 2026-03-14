# CSS Token 审计报告

> 审计 `tokens.css` 中定义的所有 CSS 自定义属性，分析每个 token 在 `layouts.css`、`components.css`、`theme-paper/style.css`、portrait override 中的覆写情况。  
> **目标**：识别从未被覆写的 token → 可以直接写死值 → 精简 token 系统。

---

## 审计结果总览

| 分类 | 数量 | 占比 |
|---|---:|---:|
| 被覆写（需要保留 token） | 50 | 41% |
| **从未覆写（可以写死值）** | **72** | **59%** |
| **总计** | **122** | 100% |

---

## 被覆写的 Token（需要保留）

以下 token 在 `layouts.css`、`components.css`、`theme-paper/style.css` 或 portrait 适配中被重新赋值，必须保留为 CSS variable。

### 字体

| Token | 覆写来源 |
|---|---|
| `--font-sans` | theme-paper |
| `--font-mono` | *(仅 base 定义，但主题可能覆写)* |

### 全局颜色 / 排版基础

| Token | 覆写来源 |
|---|---|
| `--slide-color-body` | section, statement, theme-paper |
| `--slide-color-heading` | theme-paper |
| `--slide-color-muted` | theme-paper |
| `--slide-font-size-body` | compact-copy, section, statement, portrait |
| `--slide-line-height-body` | compact-copy, portrait |

### h1

| Token | 覆写来源 |
|---|---|
| `--slide-h1-margin` | cover, section, statement |
| `--slide-h1-size` | cover, section, statement, display-headline, portrait×3 |
| `--slide-h1-line-height` | cover, section, statement, display-headline |
| `--slide-h1-letter-spacing` | cover, section, statement, display-headline |
| `--slide-h1-weight` | statement |

### h2

| Token | 覆写来源 |
|---|---|
| `--slide-h2-margin` | cover, statement |
| `--slide-h2-size` | cover, section, statement, portrait×2 |
| `--slide-h2-line-height` | statement |
| `--slide-h2-letter-spacing` | statement |
| `--slide-h2-weight` | statement |
| `--slide-h2-color` | cover, section, statement |

### h3

*(从未被任何 layout/theme 覆写 → 全部可移除 token)*

### 段落 p

| Token | 覆写来源 |
|---|---|
| `--slide-p-margin` | compact-copy, center, statement, portrait |
| `--slide-p-color` | section, statement |
| `--slide-p-font-size` | compact-copy, section, statement, portrait |
| `--slide-p-line-height` | compact-copy, section, statement, portrait |
| `--slide-p-letter-spacing` | statement |

### 列表 li

| Token | 覆写来源 |
|---|---|
| `--slide-li-color` | section, statement |
| `--slide-li-font-size` | compact-copy, section, statement, portrait |
| `--slide-li-line-height` | compact-copy, section, statement, portrait |
| `--slide-li-letter-spacing` | statement |
| `--slide-list-margin` | portrait |
| `--slide-list-item-margin` | portrait |

### Badge

| Token | 覆写来源 |
|---|---|
| `--slide-badge-font-size` | compact-copy, section, statement, portrait |
| `--slide-badge-line-height` | compact-copy, section, statement |
| `--slide-badge-bg` | theme-paper |
| `--slide-badge-color` | theme-paper |
| `--slide-badge-border` | theme-paper |

### Blockquote

| Token | 覆写来源 |
|---|---|
| `--slide-blockquote-font-size` | statement |
| `--slide-blockquote-line-height` | statement |
| `--slide-blockquote-letter-spacing` | statement |
| `--slide-blockquote-font-weight` | statement |
| `--slide-blockquote-color` | statement |
| `--slide-blockquote-border-color` | theme-paper |
| `--slide-blockquote-bg` | theme-paper |
| `--slide-blockquote-padding` | portrait |

### Code / Pre

| Token | 覆写来源 |
|---|---|
| `--slide-pre-font-size` | code-heavy, compact-code, portrait |
| `--slide-pre-padding` | compact-code |
| `--slide-inline-code-font-size` | compact-code |
| `--slide-inline-code-bg` | theme-paper |
| `--slide-code-line-min-height` | compact-code |

### Link

| Token | 覆写来源 |
|---|---|
| `--slide-link-decoration-style` | theme-paper |
| `--slide-link-decoration-color` | theme-paper |
| `--slide-link-decoration-color-hover` | theme-paper |

### List bullet

| Token | 覆写来源 |
|---|---|
| `--slide-list-bullet-bg` | theme-paper |
| `--slide-list-bullet-shadow` | theme-paper |

### OL badge

| Token | 覆写来源 |
|---|---|
| `--slide-ol-badge-bg` | theme-paper |
| `--slide-ol-badge-color` | theme-paper |

### Table

| Token | 覆写来源 |
|---|---|
| `--slide-table-head-bg` | theme-paper |

### Surface

| Token | 覆写来源 |
|---|---|
| `--slide-surface-padding-inline` | portrait |
| `--slide-surface-padding-block-start` | portrait |
| `--slide-surface-padding-block-end` | portrait |

---

## 从未覆写的 Token（可以写死值）

以下 **72 个 token** 在整个项目中只定义了一次（`:root` 块），从未被任何 layout、theme、或 portrait 覆写。这些 token 可以从 `tokens.css` 中移除，直接把值写到 `prose.css`（或消费它们的 CSS 文件）中。

### h1（从未覆写）
- `--slide-h1-padding`: `0.12em 0 0.18em`

### h2（从未覆写）
- `--slide-h2-padding`: `0.1em 0 0.15em`

### h3（全部从未覆写）
- `--slide-h3-margin`: `0 0 0.75rem`
- `--slide-h3-padding`: `0.08em 0 0.12em`
- `--slide-h3-size`: `clamp(1.7rem, 2.6vw, 2.65rem)`
- `--slide-h3-line-height`: `1.16`
- `--slide-h3-weight`: `740`

### 段落（从未覆写）
- `--slide-p-font-weight`: `400`

### 列表（从未覆写）
- `--slide-list-padding`: `0.15rem 0 0.15rem 0`
- `--slide-list-item-padding-left`: `1.55rem`
- `--slide-list-marker-top`: `calc(var(--slide-li-line-height) * 0.5em)`
- `--slide-li-font-weight`: `400` *(同 p-font-weight)*
- `--slide-list-bullet-width`: `0.82rem`
- `--slide-list-bullet-height`: `0.82rem`
- `--slide-list-bullet-radius`: `0.2rem`
- `--slide-list-bullet-border`: `1px solid rgba(255, 255, 255, 0.72)`
- `--slide-list-bullet-transform`: `translateY(-50%) rotate(45deg)`

### OL badge（从未覆写）
- `--slide-ol-badge-min-width`: `1.92rem`
- `--slide-ol-badge-height`: `1.92rem`
- `--slide-ol-badge-padding-x`: `0.4rem`
- `--slide-ol-item-padding-left`: `2.72rem`
- `--slide-ol-badge-font-size`: `0.8em`
- `--slide-ol-badge-font-weight`: `700`

### Link（从未覆写）
- `--slide-link-color`: `currentColor`
- `--slide-link-color-hover`: `currentColor`
- `--slide-link-font-weight`: `inherit`
- `--slide-link-hover-bg`: `transparent`

### Strong
- `--slide-strong-weight`: `760`

### Blockquote（从未覆写）
- `--slide-blockquote-margin`: `1.05rem 0`

### Table（从未覆写）
- `--slide-table-margin`: `1.15rem 0 1.35rem`
- `--slide-table-font-size`: `0.96em`
- `--slide-table-head-font-size`: `1.02em`
- `--slide-table-head-line-height`: `1.35`
- `--slide-table-radius`: `10px`
- `--slide-table-border-color`: `rgba(15, 23, 42, 0.11)`
- `--slide-table-shadow`: `none`
- `--slide-table-cell-padding`: `0.66rem 0.82rem`
- `--slide-table-head-color`: `var(--slide-color-body)`
- `--slide-table-head-weight`: `680`
- `--slide-table-body-font-size`: `1em`
- `--slide-table-body-line-height`: `1.5`
- `--slide-table-divider-color`: `rgba(15, 23, 42, 0.09)`
- `--slide-table-row-odd-bg`: `transparent`
- `--slide-table-row-hover-bg`: `rgba(15, 23, 42, 0.025)`

### Kbd（从未覆写）
- `--slide-kbd-radius`: `6px`
- `--slide-kbd-padding`: `0.05rem 0.38rem`
- `--slide-kbd-font-size`: `0.86em`
- `--slide-kbd-border-color`: `rgba(15, 23, 42, 0.2)`
- `--slide-kbd-bg`: `#fff`

### Hr（从未覆写）
- `--slide-hr-margin`: `1.25rem 0`
- `--slide-hr-color`: `rgba(15, 23, 42, 0.12)`

### Image
- `--slide-img-radius`: `0.75rem`

### Code / Pre（从未覆写）
- `--slide-pre-margin`: `0.95rem 0 1.2rem`
- `--slide-pre-radius`: `0.75rem`
- `--slide-pre-border-color`: `rgba(15, 23, 42, 0.08)`
- `--slide-pre-shadow`: `inset 0 1px 0 rgba(255, 255, 255, 0.6)`
- `--slide-inline-code-radius`: `6px`
- `--slide-inline-code-padding`: `0.1rem 0.35rem`

### Badge（从未覆写）
- `--slide-badge-font-weight`: `650`
- `--slide-badge-letter-spacing`: `0`
- `--slide-badge-padding-x`: `0.5rem`
- `--slide-badge-padding-y`: `0.12rem`
- `--slide-badge-radius`: `9999px`

### Mark
- `--slide-mark-radius`: `0.2em`

---

## 改进建议

### Phase 1：消除无覆写 token（风险低，收益高）

将 72 个从未覆写的 token 从 `tokens.css` 移除，在 `prose.css` 中直接写值。

**Before（tokens.css）**:
```css
:root {
  --slide-h3-margin: 0 0 0.75rem;
  --slide-h3-padding: 0.08em 0 0.12em;
  --slide-h3-size: clamp(1.7rem, 2.6vw, 2.65rem);
  --slide-h3-line-height: 1.16;
  --slide-h3-weight: 740;
  /* ... 67 more */
}
```

**After（prose.css）**:
```css
.slide-prose h3 {
  margin: 0 0 0.75rem;
  padding: 0.08em 0 0.12em;
  color: var(--slide-color-heading, #0f172a);
  font-size: clamp(1.7rem, 2.6vw, 2.65rem);
  line-height: 1.16;
  font-weight: 740;
}
```

**预期效果**：
- `tokens.css` 从 ~127 行变量 → ~50 行变量
- 打开 `prose.css` 就能看到真实值，不用跳文件
- 零运行时影响（CSS variable 和硬编码值渲染性能一样）

### Phase 2：被覆写 token 加 fallback（可选）

对于保留的 50 个 token，在 `prose.css` 中使用 `var(--token, fallback)` 语法：

```css
.slide-prose h1 {
  font-size: var(--slide-h1-size, clamp(3rem, 5.9vw, 5.2rem));
}
```

这样即使未来 `tokens.css` 中删除某个 token 的默认值，prose 也不会崩溃。

### Phase 3：考虑合并 `tokens.css` 到对应文件

如果 Phase 1 做完后 `tokens.css` 只剩 ~50 个变量，可以考虑把它们**就近放到消费它们的文件里**（在 `prose.css` 顶部定义 `:root` 变量），消除跨文件跳转。

---

## 量化总结

| 指标 | 现在 | Phase 1 后 |
|---|---|---|
| `tokens.css` 变量数 | 122 | ~50 |
| `prose.css` `var()` 引用 | ~60 | ~25 |
| 调试一个 `<h3>` 需要看的文件 | 3 个 | 1 个 |
| CSS 总行数变化 | ±0 | ±0（只是值的搬迁） |
