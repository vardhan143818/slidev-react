# `create-slidev-react`

`create-slidev-react` 提供 `npm create slidev-react@latest` 的项目初始化入口，也是当前推荐的产品主入口。

当前目标很克制：

- 只负责创建一个最小可跑的 slides 项目
- 不和 `@slidev-react/cli` 混职责
- 默认生成一个意见化 starter，而不是空壳目录
- 模板默认包含 `charts + mermaid` 能力，开箱即用

## Usage

```bash
npm create slidev-react@latest
```

也可以直接指定目录：

```bash
npm create slidev-react@latest my-slides
```

创建完成后，在项目目录里运行：

```bash
pnpm install
pnpm dev
```

生成出来的项目默认包含：

- `slides.mdx`
- `README.md`
- `.gitignore`
- `package.json` scripts：`dev / build / export / lint`

这些 scripts 目前仍然通过 `slidev-react` 命令调用底层能力，但用户主叙事已经切换到“先创建 app，再在 app 内运行脚本”。
