# `@slidev-react/cli`

`@slidev-react/cli` 提供 `slidev-react` 命令行入口。

当前已经完成两层收口：

- 用户入口统一成 `slidev-react`
- 命令实现收口到 `@slidev-react/node`

当前命令：

- `slidev-react dev [file]`
- `slidev-react build [file]`
- `slidev-react export [file]`
- `slidev-react lint [file]`

其中：

- `dev` / `build` 走程序化 Vite API
- `export` 会按需拉起临时 dev server 后再走 Playwright 导出
- `lint` 直接调用 slides parsing + authoring validation

在当前仓库内做 dogfood 时，可以这样用：

```bash
pnpm slidev-react -- dev
pnpm slidev-react -- build slides-ar-3-4.mdx
pnpm slidev-react -- export slides-ar-3-4.mdx --format png
pnpm slidev-react -- lint slides.mdx --strict
```
