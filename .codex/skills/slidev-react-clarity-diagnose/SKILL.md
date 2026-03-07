---
name: slidev-react-clarity-diagnose
description: Diagnose clarity, layering, runtime boundaries, state ownership, evolution pressure, and refactor priorities for the slidev-react repository. Use when Codex is asked to audit this project architecture, explain where responsibilities are mixed, identify reusable hooks worth extracting, propose multi-level decomposition, judge whether the current structure fits the next stage, score maintainability, or respond to prompts like "拆解当前项目", "做诊断", "分析分层", "看清晰度", "看架构问题", "这个项目下一阶段扛不扛得住", or "给重构路线图".
---

# Slidev React Clarity Diagnose

将 `slidev-react` 视为一个会长期演进的前端产品，而不是一次性 demo。优先追求清晰度，具体是降低理解成本、修改成本和协作成本，而不是追求更抽象的概念模型。

这个 skill 不只回答“现在乱不乱”，还要回答三件更高一层的事：

- 这些问题属于局部实现噪音，还是已经上升为系统性结构问题
- 当前结构是否匹配产品的下一阶段，而不只是勉强支撑当前功能
- 现在最值得动的边界是什么，为什么是它，而不是别的地方

## Start

- 确认当前工作目录是 `slidev-react` 仓库。
- 先实时扫描代码，再下判断。优先读取 `package.json`、`src/app`、`src/deck`、`src/features`、`src/theme`、`src/ui`，从当前仓库状态建立项目地图。
- 默认不要把 [references/project-map.md](references/project-map.md) 当成事实来源。它只能作为 repo 背景提示或历史热点提示，不能替代实时扫描。
- 只有在需要 repo 专属术语、历史热点、或补充上下文时，才参考 [references/project-map.md](references/project-map.md)。
- 需要多层次量表、输出结构、评分标准时，读取 [references/diagnostic-rubric.md](references/diagnostic-rubric.md)。
- 先诊断，再方案。除非用户明确要改代码，否则不要一上来进入实现细节。

## Core Stance

- 先问“哪里不清晰”，再问“怎么抽象”。
- 先问“状态归谁”，再问“代码放哪”。
- 先问“运行时边界是什么”，再问“是否抽 hook”。
- 先问“下一阶段会被什么变化击穿”，再问“今天要不要重构”。
- 将 hook 视为边界载体，而不是默认解法。
- 对这个项目，优先区分 authoring/build 与 presentation/runtime 两个大生命周期。

## Higher-Order Lens

除了看代码层面的清晰度，还要补一层“决策视角”：

- 阶段适配度：
  - 当前结构是“对现在够用”，还是“已经阻碍下一阶段”
  - 下一阶段更可能增加的是新 runtime、新协作能力，还是新主题/authoring 能力
- 变化压力：
  - 哪些模块是高频变化区
  - 哪些模块虽然改动少，但一旦出错代价极高
- 改动经济性：
  - 哪些问题只是看起来不优雅
  - 哪些问题会显著放大理解成本、回归成本、联调成本
- 运行可信度：
  - 状态流是否可解释、可调试、可验证
  - 是否存在“功能能跑，但很难稳定演进”的 runtime

如果用户觉得“还不够高维”，默认不是去发明更抽象的分层名词，而是把判断提升到：

1. 产品下一阶段需要什么能力
2. 当前结构会先在哪个 runtime 上失稳
3. 哪个边界最值得先收敛

## Workflow

### 1. Map the current system

- 以当前代码扫描结果为准，而不是以 reference 文档为准。
- 区分编译期与运行期：
  - `src/deck` 更偏 authoring/build pipeline。
  - `src/features/*` 更偏 presentation runtime。
- 识别主要 runtime：
  - deck route/navigation
  - reveal
  - presentation session
  - draw
  - theme/layout resolution
  - presenter/player surfaces
- 识别主要 platform touchpoints：
  - URL/history
  - localStorage
  - BroadcastChannel / WebSocket
  - MediaRecorder
  - Fullscreen / WakeLock
  - ResizeObserver / timers / requestAnimationFrame
- 如果实时扫描和 `references/project-map.md` 冲突，始终以实时扫描为准，并在输出中明确指出“项目地图已漂移”。

### 2. Diagnose across three levels

- 战略级：
  - 当前结构是否匹配产品阶段与下一阶段目标
  - 复杂度是在支撑核心能力，还是在为历史路径买单
  - 如果未来 3-6 个月增加新能力，最先失稳的边界在哪里
- 系统级：
  - 项目的主边界是否清楚
  - 复杂度主要来自哪里
  - 依赖方向是否稳定
- 功能级：
  - 每个 feature 是否有明确职责
  - 是否存在多个 runtime 混在同一个 feature 或 hook 中
  - 状态所有权是否清楚
- 文件级：
  - 哪些文件已经承担过多职责
  - 哪些 hooks/provider/component 已经同时在做规则、编排、展示三件事

### 3. Analyze by clarity dimensions

- 领域边界是否清楚
- 状态所有权是否清楚
- 副作用是否被隔离
- hooks 是否表达“用例”而不只是隐藏 `useEffect`
- 命名是否准确表达真实职责
- 是否匹配下一阶段演进压力
- 是否具备足够的调试与验证友好度
- 哪些点最容易造成改动连锁反应
- 哪些重构收益最高且成本最低

### 3.5 Make the higher-order judgment explicit

在给建议前，先明确回答下面几个问题：

1. 这是清晰度问题、边界问题，还是阶段错配问题
2. 如果现在不动，未来最可能在哪类需求上付出指数级代价
3. 这个问题更像“局部修复”还是“需要重新定义 runtime owning boundary”
4. 这次建议是在降低未来变化成本，还是只是在提高代码观感

### 4. Recommend the target model

- 优先使用 `feature-first + layers-inside-feature` 的思路，而不是全局按技术形态平铺。
- 在 feature 内优先区分：
  - `model`: 纯类型、纯规则、纯计算
  - `runtime`: 状态所有权、hooks、use case 编排
  - `adapters` 或 `platform`: 浏览器 API、传输层、存储适配
  - `ui`: 组件和展示
- 只在确实跨 feature 且无业务语义时，才放到全局 `ui` 或通用 hooks。

### 5. Produce a decision-oriented answer

默认按下面结构输出：

1. 一句话总判断
2. 更高维判断
3. 当前项目的问题地图
4. 最关键的 3-5 个清晰度问题及根因
5. 更清晰的目标分层模型
6. 分阶段重构建议，按收益/成本排序
7. 明确不建议做的事，避免过度设计

如果用户只问某一个视角，就只展开那个视角，但仍然保持“现状 -> 根因 -> 建议”的节奏。

## Repo-Specific Heuristics

下面这些是启发式检查点，不是当前结构的真相声明。默认先看代码，再决定这些启发是否仍然成立。

- 将 `PresenterShell` 视为高概率热点。优先检查它是否同时承载 reveal、session、draw bridge、local preferences、overlay hotkeys、UI orchestration。
- 将 `usePresentationSync` 视为协作 runtime，而不是普通小 hook。优先检查 transport、presence、replication 是否混在一起。
- 将 `DrawProvider` 视为 draw runtime 的边界。优先检查绘图状态、快捷键、持久化、remote apply 是否耦合。
- 将 `DeckProvider` 视为 navigation runtime，而不是简单 app provider。优先检查 URL 同步与页面状态是否混层。
- 对“是否抽 hooks”这类问题，默认先判断是否在表达稳定的 runtime 边界。只有答案是肯定的，才建议抽。
- 如果用户问“是不是还该有更高维度的判断”，优先补：
  - 阶段适配度判断
  - 变化压力与爆炸半径判断
  - runtime 可信度与调试成本判断
  - 下一阶段能力接入成本判断

## Anti-Goals

- 不要为了“高级架构”而发明过多新层次。
- 不要把所有问题都改写成“抽通用 hooks”。
- 不要只盯代码风格或组件大小，忽略状态边界和副作用边界。
- 不要把“更高维”误解成“更抽象”。
- 不要脱离产品阶段去谈理想架构。
- 不要只说未来风险，不判断它是否真的值得现在支付重构成本。
- 不要给出全仓库大搬家的方案，除非用户明确要做大重构。
- 不要把本项目特有的 reveal/session/draw runtime 简化成泛化前端模板问题。
