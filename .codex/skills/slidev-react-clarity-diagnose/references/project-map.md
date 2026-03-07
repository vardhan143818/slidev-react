# Project Map

## Purpose

`slidev-react` 是一个 React + MDX 演示系统，不只是页面渲染器。它同时包含：

- deck 解析与编译
- slide runtime 播放
- presenter / viewer 协作会话
- reveal 点击步进
- draw 标注
- print/export/recording

诊断时，优先把它当作“小型演示 runtime”来看，而不是普通内容站点。

## Top-Level Areas

- `src/app`
  - 应用装配、providers、入口 wiring
- `src/deck`
  - frontmatter、解析、编译、deck model、生成物
- `src/features/navigation`
  - 基础翻页与键盘导航
- `src/features/reveal`
  - reveal 规则与上下文
- `src/features/presentation`
  - 会话、路径、同步、录制、打印导出
- `src/features/draw`
  - 标注状态与覆盖层
- `src/features/presenter`
  - presenter 体验层、控制台、side preview、notes
- `src/features/player`
  - slide stage 渲染与交互
- `src/theme`
  - 布局、视觉主题、layout 解析
- `src/ui`
  - 可复用 UI 与 MDX helper 组件

## Runtime Clusters

### 1. Deck route / navigation runtime

- Main files:
  - `src/app/providers/DeckProvider.tsx`
  - `src/features/navigation/useDeckNavigation.ts`
  - `src/features/navigation/KeyboardController.tsx`
- Typical concerns:
  - 当前页索引
  - URL / history 同步
  - 基础导航动作

### 2. Reveal runtime

- Main files:
  - `src/features/reveal/RevealContext.tsx`
  - `src/features/reveal/navigation.ts`
  - state currently coordinated partly inside `src/features/presenter/PresenterShell.tsx`
- Typical concerns:
  - clicks
  - clicksTotal
  - registerStep
  - advance / retreat reveal
  - 跨页 reveal 决策

### 3. Presentation session runtime

- Main files:
  - `src/features/presentation/usePresentationSync.ts`
  - `src/features/presentation/session.ts`
  - `src/features/presentation/path.ts`
  - `src/features/presentation/types.ts`
- Typical concerns:
  - presenter / viewer role
  - peer presence
  - remote state replication
  - WebSocket + BroadcastChannel
  - follow presenter

### 4. Draw runtime

- Main files:
  - `src/features/draw/DrawProvider.tsx`
  - `src/features/draw/DrawOverlay.tsx`
- Typical concerns:
  - stroke state
  - drawing tools
  - keyboard controls
  - local persistence
  - remote drawings apply

### 5. Presenter / player surfaces

- Main files:
  - `src/features/presenter/PresenterShell.tsx`
  - `src/features/player/SlideStage.tsx`
  - `src/features/presentation/PresentationStatus.tsx`
- Typical concerns:
  - 视觉编排
  - 用户交互
  - runtime 数据汇总后的展示

## Platform Touchpoints

优先检查这些是否被隔离在 adapter/platform 边界内：

- `localStorage`
  - `DrawProvider.tsx`
  - `PresenterShell.tsx`
- URL / history
  - `DeckProvider.tsx`
- `BroadcastChannel` / `WebSocket`
  - `usePresentationSync.ts`
- `MediaRecorder`
  - `usePresentationRecorder.ts`
- `requestFullscreen`
  - `useFullscreen.ts`
- `navigator.wakeLock`
  - `useWakeLock.ts`
- `ResizeObserver`, timers, `requestAnimationFrame`
  - `SlideStage.tsx`
  - `PresenterShell.tsx`
  - `PrintDeckView.tsx`

## Known Clarity Hotspots

- `src/features/presenter/PresenterShell.tsx`
  - 容易同时承担 UI、reveal、session orchestration、draw bridge、本地偏好、全局快捷键
- `src/features/presentation/usePresentationSync.ts`
  - 容易同时承担 transport、presence、replication、reconnect、diffing
- `src/features/draw/DrawProvider.tsx`
  - 容易同时承担状态、快捷键、持久化、remote apply
- `src/app/providers/DeckProvider.tsx`
  - 命名上像 app provider，职责上更接近 navigation runtime

## Repeated Patterns Worth Watching

- 重复的 `isTypingElement`
- 多处全局 `keydown` 监听
- 多处 `localStorage` 读写
- 多处 “最新值镜像到 ref” 的写法

这些模式本身不是 bug，但往往是诊断“是否需要更清晰边界”的信号。
