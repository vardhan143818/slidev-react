# `@slidev-react/node`

`@slidev-react/node` 提供 `slidev-react` 的 Node 侧命令 API。

当前导出分两层：

高层命令 API：

- `runSlidesDev`
- `runSlidesBuild`
- `runSlidesExport`
- `runSlidesLint`

更底层的 programmatic API：

- `startSlidesDevServer`
- `buildSlidesApp`
- `exportSlidesArtifacts`
- `lintSlides`

这一层的目标是把 CLI 和根仓库脚本解耦，同时把 slides authoring/build 生命周期沉到可复用的 Node 侧能力。
