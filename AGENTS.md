# Repository Guidelines

1. 尽量用中文回复
2. 如果没有显式要求, 尽量不要写兼容代码.

## Project Structure & Module Organization

The app root is the repository root. Main source code lives under `packages/`:

- `packages/node/src/slides/`: slides parsing, frontmatter handling, MDX compilation, validation, and generated slides artifacts
- `packages/client/src/`: React app assembly, providers, presentation UI, stage, theme, addons, and reusable UI
- `packages/core/src/`: pure presentation models, flow logic, and shared contracts
- `packages/node/src/`: Node-side dev/build/export/lint entry points and local servers
- `packages/cli/`: the `slidev-react` command-line interface

Deck content is authored in `slides.mdx`. Tests live next to source as `*.test.ts`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies
- `pnpm dev`: start the Vite dev server
- `pnpm build`: produce a production build
- `pnpm preview`: preview the built app locally
- `pnpm presentation:server`: start the WebSocket relay for cross-device sync
- `pnpm test`: run the Vitest suite once
- `pnpm test:e2e`: run the Playwright end-to-end suite
- `pnpm test:e2e:headed`: run the Playwright suite with a visible browser
- `pnpm test:e2e:install`: install the Chromium browser used by Playwright
- `pnpm lint`: run type-aware Oxlint on `src/` and `packages/`
- `pnpm format`: format the repository with Oxfmt
- `pnpm format:check`: check repository formatting with Oxfmt

Use pnpm for all local commands; `packageManager` is pinned to `pnpm@10.0.0`.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing style:

- 2-space indentation
- single quotes
- no semicolons
- named exports for shared utilities; default exports only where already established

Name components in PascalCase (`PresenterShell.tsx`), helpers in camelCase (`parseDeck.ts`), and tests as `featureName.test.ts`. Keep new files in the domain folder that owns the behavior; avoid catch-all `utils.ts` or `types.ts`.

## Testing Guidelines

Vitest is the test runner. Add or update tests when changing parsing, compilation, reveal navigation, or presentation session behavior. Prefer colocated tests such as `packages/node/src/slides/parsing/parseSlides.test.ts`. Run `pnpm test` before opening a PR.

## Commit & Pull Request Guidelines

This repository currently has no commit history, so no project-specific convention is established yet. Use short, imperative commit messages such as `Add reveal sync regression test`. Keep PRs focused and include:

- a brief summary of the change
- affected areas (for example `packages/node/src/slides` or `slides.mdx`)
- test results
- screenshots or short recordings for UI or presentation-flow changes

## Contributor Notes

Document only behavior that exists today. If you mention deck syntax in docs, verify it against `slides.mdx`, `packages/node/src/slides/`, and the current runtime rather than legacy Slidev behavior.
