# Chart 组件语义化 & 风格固化设计建议

> 基于 G2 官方文档和完整 Gallery（35+ 图表品类）的深度分析。

---

## 1 G2 能力全景

G2 是一套**图形语法（Grammar of Graphics）**引擎，它的能力远不止 bar / line / pie 三件套。核心架构有 7 层：

| 语法层 | 作用 | 典型用法 |
|--------|------|----------|
| **Mark** | 最小视觉单元 | `interval` `line` `point` `area` `cell` `rect` `link` `image` `text` `vector` `box` `connector` `polygon` `density` `heatmap` `wordCloud` `gauge` `liquid` … |
| **Transform** | 数据派生 | `binX` `stackY` `normalizeY` `sortX` `groupX` `jitter` `kde` … |
| **Scale** | 抽象数据 → 视觉通道 | 线性 / 对数 / 幂 / 时间 / 分位数 / band / point … |
| **Coordinate** | 坐标变换 | 直角 / 极坐标 / 平行坐标 / 转置 / 径向 / 鱼眼 |
| **Composition** | 多视图编排 | `facetRect` `facetCircle` `repeatMatrix` `spaceFlex` `spaceLayer` |
| **Animation** | 动画语法 | 入场动画 / 离场动画 / `timingKeyframe`（状态转场） |
| **Interaction** | 交互语法 | tooltip / brush / highlight / select / elementPointMove / slider / legend / fisheye |

### 1.1 Gallery 全品类清单

```
基础图表    Interval · Line · Point · Area · Histogram · Cell · Pie · Dual · Rose
极坐标      Radial · Radar · Nightingale
统计分析    Box · Violin · Beeswarm · Bin · Regression(5 种) · Heatmap · Density
关系 / 层级  Sankey · Chord · ForceGraph · Treemap · Sunburst · CirclePacking · Tree · FlameChart
地理        Choropleth · Flights · TubeLines · WorldMap · HexbinMap
指标        Gauge · Liquid · Bullet · Funnel · Progress · Mini(line/area/column/pie/ring)
文字 / 图像  WordCloud · Paragraph · Text Annotation · Image Mark
组合        StepLine · Slope · Streamgraph · Candlestick · Waterfall · Pareto
场景级      AudioPlayer · HeartbeatMonitor · StockRealtime · WeatherForecast · RadarScan
风格        Theme(classic/dark/academy) · Rough(手绘风) · Pattern(条纹/圆点/方块)
3D          3D Scatter · 3D Line · 3D Bar · 3D Surface
叙事        Storytelling · Unit Visualization · Auto Chart
```

**结论：当前 `<Chart />` 只用了 `interval` 和 `line` 这两个 mark，冰山一角。**

---

## 2 设计方向：三层抽象

```
┌──────────────────────────────────────────────┐
│  L3  语义组件（Semantic Components）           │  ← slide 作者日常用
│  <BarChart> <LineChart> <PieChart> ...        │
├──────────────────────────────────────────────┤
│  L2  预设系统（Presets / Recipes）             │  ← 固定风格 + 默认交互
│  chartPresets.waterfall  chartPresets.funnel  │
├──────────────────────────────────────────────┤
│  L1  基础 Chart（G2Spec 透传）                │  ← 高级用户 escape hatch
│  <Chart type="..." encode={...} ... />       │
└──────────────────────────────────────────────┘
```

### 2.1 L1 — 基础 Chart（已有）

保持现有 `<Chart />` 接受完整 G2Spec。但需要补：
- 默认尺寸（不再每次写 `width={1280}`）
- 主题对齐（色彩从 CSS token 读取，不硬编码）
- `autoFit`——自动充满父容器

### 2.2 L2 — 预设系统

把 G2 的复杂组合（mark + transform + coordinate + interaction 联合配置）封装成**命名预设**：

```ts
// chartPresets.ts
export const presets = {
  // --- 基础 ---
  bar:       { type: 'interval' },
  column:    { type: 'interval', coordinate: { transform: [{ type: 'transpose' }] } },
  line:      { type: 'line' },
  area:      { type: 'area' },
  scatter:   { type: 'point' },
  pie:       { type: 'interval', coordinate: { type: 'theta' } },
  donut:     { type: 'interval', coordinate: { type: 'theta' }, style: { innerRadius: 0.6 } },

  // --- 统计 ---
  histogram: { type: 'rect', transform: [{ type: 'binX', y: 'count' }] },
  boxplot:   { type: 'boxplot' },
  heatmap:   { type: 'cell' },

  // --- 极坐标 ---
  radar:     { type: 'line', coordinate: { type: 'polar' } },
  rose:      { type: 'interval', coordinate: { type: 'polar' } },
  radial:    { type: 'interval', coordinate: { type: 'radial' } },

  // --- 层级 / 关系 ---
  treemap:   { type: 'treemap' },
  sunburst:  { type: 'sunburst' },
  sankey:    { type: 'sankey' },
  wordcloud: { type: 'wordCloud' },

  // --- 指标 ---
  gauge:     { type: 'gauge' },
  liquid:    { type: 'liquid' },
  funnel:    { type: 'funnel' },
  bullet:    { type: 'bullet' },
  progress:  { type: 'interval', /* mini progress config */ },

  // --- 组合 ---
  waterfall: { type: 'interval', transform: [{ type: 'diffY' }] },
  candlestick: { /* box + line composite */ },
  dualAxis:  { /* spaceFlex + interval + line */ },
}
```

在 `<Chart />` 上通过 `preset` prop 引用即可：

```mdx
<Chart preset="waterfall" data={revenueFlowData} />
<Chart preset="radar" data={skillData} x="dimension" y="score" />
```

### 2.3 L3 — 语义化组件

日常高频用的包一层显式组件名，减少心智负担：

```
组件名           底层 preset       语义化 props
─────────────────────────────────────────────────
<BarChart />     bar              x, y, color, group, stack
<LineChart />    line             x, y, color, curve, area
<AreaChart />    area             x, y, color, stack, gradient
<PieChart />     pie              value, label, color, donut
<ScatterChart /> scatter          x, y, color, size, shape
<RadarChart />   radar            dimensions[], series, area
<HeatmapChart /> heatmap          x, y, color (continuous scale)
<TreemapChart /> treemap          value, label, color
<WordCloud />    wordcloud        text, value, color
<FunnelChart />  funnel           stage, value
<GaugeChart />   gauge            value, min, max, target
<WaterfallChart/> waterfall       x, y, total
```

这些组件的 props 按**数据语义**命名——不暴露 `encode`、`coordinate`、`transform` 等 G2 底层概念：

```mdx
<!-- 改前：要理解 G2 -->
<Chart
  type="interval"
  data={[...]}
  encode={{ x: 'genre', y: 'sold', color: 'genre' }}
  coordinate={{ type: 'theta' }}
  style={{ innerRadius: 0.6 }}
/>

<!-- 改后：语义清晰 -->
<PieChart
  data={[...]}
  value="sold"
  label="genre"
  donut
/>
```

---

## 3 风格固化

### 3.1 色彩系统

**当前问题**：`slidevPalette` 是 10 个散装色值，没语义。

**目标**：建立一套与 slide 主题同源的 chart 色彩语义：

```ts
// chartThemeTokens.ts
export const chartTokens = {
  // === 功能色 ===
  accent:     'var(--slide-blockquote-border-color)', // #22c55e — 主题 accent
  text:       'var(--slide-color-body)',               // #0f172a
  textMuted:  'var(--slide-color-muted)',              // #475569
  grid:       '#e2e8f0',
  font:       'var(--font-sans)',

  // === 分类色板（10 色，适用于 categorical data）===
  category: [
    '#60a5fa',  // blue
    '#34d399',  // emerald
    '#a78bfa',  // violet
    '#f472b6',  // pink
    '#fbbf24',  // amber
    '#f87171',  // red
    '#22d3ee',  // cyan
    '#fb923c',  // orange
    '#818cf8',  // indigo
    '#2dd4bf',  // teal
  ],

  // === 连续色板（适用于 heatmap / 密度图等）===
  sequential: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#052e16'],

  // === 发散色板（适用于正负偏差）===
  diverging: ['#ef4444', '#fca5a5', '#fefce8', '#86efac', '#22c55e'],

  // === 语义色（用于业务含义）===
  semantic: {
    positive: '#22c55e',
    negative: '#ef4444',
    warning:  '#f59e0b',
    neutral:  '#94a3b8',
  },
}
```

**关键点**：功能色从 CSS variable 读取 → 换主题时全局联动。

### 3.2 排版规则

| 元素 | 字号 | 字重 | 颜色 | 来源 |
|------|------|------|------|------|
| 图表标题 | 22px | bold | `var(--slide-color-body)` | 与 h3 对齐 |
| 副标题 | 17px | normal | `var(--slide-color-muted)` | 与正文对齐 |
| 轴标签 | 17px | normal | `var(--slide-color-muted)` | 可读但不抢焦 |
| 轴标题 | 19px | bold | `var(--slide-color-body)` | 比标签重要 |
| 图例 | 18px | normal | `var(--slide-color-muted)` | 与轴标签接近 |
| 数据标签 | 18px | normal | `var(--slide-color-muted)` | 直接标注在图形上 |
| 字体 | — | — | — | `var(--font-sans)` 全局统一 |

### 3.3 尺寸策略

| 模式 | 宽度 | 高度 | 使用场景 |
|------|------|------|----------|
| `full`（默认） | 100% 父容器 | 600px | 独占一页 |
| `wide` | 1280px | 500px | 带标题的主图 |
| `half` | 600px | 400px | 两列布局 |
| `compact` | 400px | 300px | 辅助小图 |
| `mini` | 200px | 80px | inline 迷你图 |

**推荐默认行为**：`autoFit: true` + 高度从 slide 剩余空间自适应。

### 3.4 交互默认值

在 slide 场景下，交互应该**克制**——辅助理解而非探索：

| 交互 | 默认 | 说明 |
|------|------|------|
| `tooltip` | ✅ 开启 | hover 看数值 |
| `legend` | ✅ 开启 | 分类图例 |
| `highlight` | ✅ 开启 | hover 高亮对比 |
| `brush` | ❌ 关闭 | 太重了，slide 不适合 |
| `slider` | ❌ 关闭 | 同上 |
| `fisheye` | ❌ 关闭 | 同上 |
| `elementPointMove` | ❌ 关闭 | 演示幻灯片不应可编辑数据 |

### 3.5 动画默认值

| 属性 | 值 | 说明 |
|------|-----|------|
| `enterType` | `fadeIn` | 柔和入场 |
| `enterDuration` | 600ms | 与 slide Reveal 节奏一致 |
| `enterDelay` | 按元素递增 50ms | 顺序感 |
| `updateDuration` | 400ms | 数据更新过渡 |

---

## 4 G2 高级能力的 slide 适配

G2 还有很多高级能力值得挖掘，但在 slide 场景需要做适当裁剪：

### 4.1 值得做的

| 能力 | slide 场景价值 | 实现方式 |
|------|---------------|----------|
| **Composition（facetRect）** | 对比分面图，一页展示多维度 | 在 `<Chart />` 支持 `children` spec |
| **Keyframe Animation** | PPT 过渡式的图表变形 | 新组件 `<ChartTransition />` |
| **Annotation（lineX/lineY/range/text）** | 标注均值线、阈值区间、关键点 | 在语义组件上加 `annotations` prop |
| **Dark Theme** | 暗色幻灯片 | `slidevThemeDark` 变体 |
| **Rough 手绘风** | 非正式演讲风格 | `rough` renderer 切换 |
| **Pattern 填充** | 打印友好 / 色盲友好 | `pattern` prop |
| **WordCloud** | 关键词展示 | `<WordCloud />` 组件 |
| **Gauge / Liquid** | KPI 指标展示 | `<GaugeChart />` / `<LiquidChart />` |
| **Treemap / Sunburst** | 层级数据一览 | `<TreemapChart />` |
| **Sankey** | 流量 / 转化路径 | `<SankeyChart />` |

### 4.2 暂不做 / 低优先

| 能力 | 原因 |
|------|------|
| Geo 地图 | 需要 GeoJSON 数据，体积大，slide 场景少 |
| 3D | 依赖 WebGL，增加包体积，场景有限 |
| Brush / Fisheye | 交互太重，观众端不一定能操作 |
| ForceGraph | 依赖 d3-force，计算开销大 |
| EMA / Candlestick | 太专业，按需再加 |

---

## 5 实施路线图

### Phase 1：风格固化（小工作量，大收益）

- [ ] `chartThemeTokens.ts`：色彩从 CSS variable 派生
- [ ] 三套色板：categorical / sequential / diverging
- [ ] 尺寸默认值 + `autoFit`
- [ ] 交互 / 动画默认值
- [ ] 字体统一读 `var(--font-sans)`

### Phase 2：预设 + 语义组件（核心价值）

- [ ] `chartPresets.ts`：把 20+ 高频 G2 配置封装成命名预设
- [ ] 语义组件第一批：`BarChart` `LineChart` `PieChart` `ScatterChart` `AreaChart`
- [ ] 语义组件第二批：`RadarChart` `HeatmapChart` `FunnelChart` `GaugeChart` `WordCloud`
- [ ] 语义组件第三批：`TreemapChart` `SunbursChart` `SankeyChart` `WaterfallChart`

### Phase 3：高级能力（差异化）

- [ ] `<ChartTransition />`：keyframe 动画
- [ ] Annotation 系统（均值线、阈值区间、关键点标注）
- [ ] Composition 支持（facet 分面 + spaceFlex 多视图）
- [ ] Dark theme 自动切换
- [ ] Rough 手绘风 renderer 选项
- [ ] Pattern 填充

---

## 6 最终效果预览

理想的 slide 写法体验：

```mdx
---
title: Sales Dashboard
---

# 📊 销售数据

<BarChart data={salesData} x="genre" y="sold" color="genre" />

---

# 🍩 市场份额

<PieChart data={marketData} value="share" label="brand" donut />

---

# 🌊 用户增长趋势

<AreaChart data={growthData} x="month" y="users" color="channel" stack gradient />

---

# 🕸️ 能力雷达

<RadarChart data={skillData} dimensions={["前端","后端","设计","产品","测试"]} series="team" area />

---

# 🏷️ 关键词

<WordCloud data={keywordData} text="word" value="count" />

---

# 🎯 KPI

<GaugeChart value={85} min={0} max={100} target={90} />

---

# 📈 复杂场景 → 直接用 G2Spec

<Chart preset="waterfall" data={revenueFlow} x="item" y="value" />

<Chart
  type="spaceFlex"
  children={[
    { type: 'interval', data: barData, encode: { x: 'x', y: 'y' } },
    { type: 'line', data: lineData, encode: { x: 'x', y: 'y' } },
  ]}
/>
```

**slide 作者只需要关注：数据是什么、想表达什么。**  
**风格、交互、动画、排版由系统统一保证。**
