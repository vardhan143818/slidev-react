# `@slidev-react/cli`

`@slidev-react/cli` 提供 `slidev-react` 命令行入口。

当前定位已经收口成一层更低的执行接口：

- 推荐用户入口已经切到 `create-slidev-react`
- `@slidev-react/cli` 主要作为模板项目 scripts 背后的内部执行层
- 命令实现继续收口到 `@slidev-react/node`

也就是说，普通使用者更推荐这样开始：

```bash
npm create slidev-react@latest
cd my-deck
pnpm install
pnpm dev
```

而不是直接记忆裸 CLI 命令。

当前命令：

- `slidev-react dev [file]`
- `slidev-react build [file]`
- `slidev-react export [file]`
- `slidev-react lint [file]`

其中：

- `dev` / `build` 走程序化 Vite API
- `export` 会按需拉起临时 dev server 后再走 Playwright 导出
- `lint` 直接调用 slides parsing + authoring validation

如果你在当前 monorepo 内做 dogfood、调试模板脚本背后的执行层，可以这样用：

```bash
pnpm slidev-react -- dev
pnpm slidev-react -- build slides-ar-3-4.mdx
pnpm slidev-react -- export slides-ar-3-4.mdx --format png
pnpm slidev-react -- lint slides.mdx --strict
```
