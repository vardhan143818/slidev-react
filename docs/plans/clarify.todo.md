# slidev-react Runtime Clarity Plan

Last updated: 2026-03-07

## Goal

`slidev-react` should become easier to understand, safer to evolve, and cheaper to debug without doing a big-bang rewrite.

This plan is not about making the codebase look more "architected".
It is about making runtime ownership explicit so future collaboration, presenter, and interaction features do not keep piling into the same files.

## One-Line Read

The repo is not broadly messy.

The authoring/build side is already reasonably clear.
The real problem is that several presentation runtimes currently share ownership of the same behavior, especially around navigation, reveal, session sync, draw sync, and presenter orchestration.

## Problem Classification

This is mainly:

- a runtime boundary problem
- a state ownership problem
- a mild stage mismatch for the next phase of product evolution

This is not mainly:

- a code style problem
- a "need more generic hooks" problem
- a "rewrite the whole repo into layered architecture" problem

## Current Read

### Areas That Are Relatively Healthy

- `src/deck/` is mostly clean authoring/build pipeline code
- `src/theme/` and `src/addons/` are reasonably clear assembly seams
- small platform hooks like fullscreen and wake lock already behave like good adapters

### Areas Where Clarity Is Degrading

- `src/app/providers/DeckProvider.tsx`
- `src/features/presentation/usePresentationSync.ts`
- `src/features/draw/DrawProvider.tsx`
- `src/features/presenter/PresenterShell.tsx`
- interaction rules currently split across `KeyboardController`, `SlideStage`, `PresenterShell`, and sync callbacks

## Higher-Order Judgment

If we do nothing, the first place this project will become expensive is not deck parsing or theme loading.
It will be the live presentation runtime, especially when adding features like:

- richer presenter controls
- stronger cross-device sync
- more viewer/presenter collaboration rules
- remote annotations or session persistence
- replay, audit, or debugging of session state

The reason is simple:
today the project still has working features, but not enough explicit runtime owners.
That means changes are increasingly coordinated by convention, callbacks, refs, and "this component also knows that rule".

## Working Scores

These are directional, not scientific:

| Area | Score | Read |
| ----- | ----- | ---- |
| Authoring/build pipeline | 4.5/5 | Clear enough and not urgent |
| Theme/addon assembly | 4/5 | Reasonably well-shaped |
| Navigation runtime | 2.5/5 | Ownership split across provider, shell, input, sync |
| Draw runtime | 2.5/5 | Local draw and collaboration concerns are mixed |
| Presentation session runtime | 2/5 | Transport, presence, replication, health mixed together |
| Presenter surface/orchestration | 2/5 | Shell owns too many runtimes and side effects |

## Root Problem Map

### 1. Navigation Ownership Is Split

What is happening today:

- `DeckProvider` owns `currentIndex` plus URL/history syncing
- `KeyboardController` translates input into navigation
- `PresenterShell` decides reveal-aware advance/retreat and follow/detach behavior
- `usePresentationSync` can apply remote page changes directly

Why this matters:

- multiple places can effectively decide page movement
- it is harder to explain what "advance" really means
- keyboard, stage click, overview jump, and remote follow do not clearly flow through one use-case boundary

### 2. Session Sync Is Larger Than Its Name

What is happening today:

- `usePresentationSync` is doing transport, presence, replication, reconnect, activity health, and some navigation side effects

Why this matters:

- it is no longer "a hook"
- it is effectively a collaboration runtime without being treated as one
- PresenterShell still has to assemble shared state and manually fan out remote patches

### 3. PresenterShell Is the Real Runtime Composition Root, But Not Yet Treated That Way

What is happening today:

- `PresenterShell` owns reveal counts, timers, local cursor, remote cursor, drawings sync bridge, viewer follow, overlay state, local preferences, and several platform side effects

Why this matters:

- the shell has the largest blast radius in the repo
- interaction changes tend to become presenter-shell changes even when they are really navigation/session/draw changes
- debugging requires understanding too many concerns at once

### 4. Draw Runtime Boundary Is Too Wide

What is happening today:

- `DrawProvider` owns local tool state and stroke state
- it also owns keyboard shortcuts
- it also owns `localStorage` persistence
- it also applies remote revisions

Why this matters:

- local draw behavior and collaboration behavior are not clearly separable
- this makes draw harder to test, reuse, and reason about

### 5. Interaction Policy Is Distributed Across DOM Conventions

What is happening today:

- `SlideStage` blocks click-advance when draw mode is on
- `KeyboardController` blocks keys based on `document.body.dataset.presenterOverlay`
- `PresenterShell` writes that dataset

Why this matters:

- interaction policy is encoded across UI + DOM + controller layers
- the rule exists, but the owner of the rule is unclear

## Target Model

Prefer `feature-first + layers-inside-feature`.
Do not do a repo-wide technical-layer rewrite.

### Navigation

Target shape:

- `model`: reveal/page movement rules
- `runtime`: current page, current reveal state, navigation intents
- `adapters`: URL/history, keyboard input, remote navigation intents
- `ui`: navbar and any thin controls

What this should own:

- `advance`
- `retreat`
- `goTo`
- `goToSlideStart`
- `syncFromLocation`
- `applyRemotePage`

### Presentation Session

Target shape:

- `model`: protocol types, snapshot/patch rules, peer state
- `runtime`: session lifecycle, follow/detach, health, replication flow
- `adapters`: `BroadcastChannel`, `WebSocket`, URL/bootstrap helpers
- `ui`: status, sharing, connection controls

What this should not do:

- directly behave like presenter UI orchestration
- rely on presenter shell to manually distribute patches field by field

### Draw

Target shape:

- `runtime`: local draw tools and local stroke state
- `adapters`: persistence only
- collaboration integration should sit beside session runtime, not inside the generic draw provider

### Presenter

Target shape:

- a presenter shell that consumes prepared state and commands
- not a place that invents or owns several runtimes ad hoc

## Priority Plan

| Phase | Theme | Why now | Main areas |
| ----- | ----- | ------- | ---------- |
| P0 | Navigation and session ownership | Highest blast radius and clearest evolution risk | `src/app/providers`, `src/features/navigation`, `src/features/presentation`, `src/features/presenter` |
| P1 | Draw/runtime separation and interaction policy cleanup | Reduces coupling and hidden behavior rules | `src/features/draw`, `src/features/player`, `src/features/presentation` |
| P2 | Naming, directory clarity, debug visibility | Improves long-term maintainability after boundaries are real | `src/features/**`, docs, tests |

## P0

### 1. Create an Explicit Navigation Runtime

Why this matters:

- page movement is currently decided in too many places
- reveal-aware navigation is core runtime behavior, not presenter-only glue

Scope:

- define one owner for page + reveal movement
- move reveal-aware `advance` and `retreat` logic behind that owner
- make keyboard, stage click, overview select, and remote follow send intents into the same boundary

Implementation touchpoints:

- `src/app/providers/DeckProvider.tsx`
- `src/features/navigation/useDeckNavigation.ts`
- `src/features/navigation/KeyboardController.tsx`
- `src/features/reveal/navigation.ts`
- `src/features/presenter/PresenterShell.tsx`

Done when:

- there is one clear runtime owner for current page and current reveal state
- input adapters no longer need to know fallback chains like "advance reveal else next slide"
- remote page apply does not bypass the navigation use case

### 2. Promote Session Sync Into a Real Runtime Boundary

Why this matters:

- collaboration is now a first-class runtime, not a small effect wrapper

Scope:

- isolate transport logic from replication logic
- isolate presence/health state from presenter UI
- stop making `PresenterShell` build and manually fan out session state patches

Implementation touchpoints:

- `src/features/presentation/usePresentationSync.ts`
- `src/features/presentation/session.ts`
- `src/features/presentation/types.ts`
- `src/features/presentation/PresentationStatus.tsx`
- `src/features/presenter/PresenterShell.tsx`

Done when:

- session lifecycle, peer state, replication, and connection health are owned together
- presenter shell consumes a prepared runtime output instead of assembling one
- session UI can become a thin consumer instead of a semi-orchestrator

### 3. Shrink PresenterShell Back to a Real Surface

Why this matters:

- current presenter-shell complexity is a symptom and a risk multiplier

Scope:

- move non-UI state ownership out of the shell
- keep layout, visual orchestration, and local presenter-only interactions in the shell
- reduce direct platform effects in the shell where practical

Implementation touchpoints:

- `src/features/presenter/PresenterShell.tsx`
- `src/features/presenter/PresenterSidePreview.tsx`
- `src/features/presenter/PresenterTopProgress.tsx`
- `src/features/presentation/PresentationStatus.tsx`

Done when:

- shell mostly composes view model + commands
- shell no longer owns the bulk of reveal/session/draw-sync logic

## P1

### 4. Separate Local Draw Runtime From Collaboration Apply

Why this matters:

- draw is a legitimate feature runtime on its own
- collaboration should integrate with it, not define it

Scope:

- keep local tool state and local strokes in draw runtime
- move remote-strokes apply semantics out of the generic provider
- keep persistence separate from collaboration concerns

Implementation touchpoints:

- `src/features/draw/DrawProvider.tsx`
- `src/features/draw/DrawOverlay.tsx`
- `src/features/presentation/usePresentationSync.ts`
- `src/features/presenter/PresenterShell.tsx`

Done when:

- draw provider can be understood without also understanding remote replication
- remote drawings arrive through a clearer adapter/runtime seam

### 5. Centralize Interaction Policy

Why this matters:

- hidden interaction rules are one of the fastest ways to increase change cost

Scope:

- define where overlay-open, draw-enabled, typing-target, and click-advance rules live
- remove reliance on DOM dataset handshakes for core runtime behavior where possible

Implementation touchpoints:

- `src/features/navigation/KeyboardController.tsx`
- `src/features/player/SlideStage.tsx`
- `src/features/presenter/PresenterShell.tsx`

Done when:

- interaction blocking rules are traceable to one runtime policy layer
- UI components stop coordinating through implicit DOM flags

### 6. Add Runtime-Focused Tests

Why this matters:

- current tests skew toward pure utilities and build logic
- the biggest risk now lives in runtime coordination

Scope:

- add tests around navigation ownership
- add tests around session patch/apply behavior
- add tests around presenter interaction policy

Implementation touchpoints:

- `src/features/navigation/`
- `src/features/presentation/`
- `src/features/presenter/`
- `src/features/draw/`

Done when:

- the repo has tests for the highest-blast-radius runtime seams, not only for pure helpers

## P2

### 7. Naming Cleanup After Boundaries Stabilize

Examples:

- consider whether `DeckProvider` should become `NavigationProvider`
- avoid hook names that sound smaller than their real responsibility

Rule:

- rename after ownership is clarified, not before

### 8. Debug Visibility

Possible scope:

- lightweight runtime logs in development
- better status labels for follow/detach and connection state
- clearer failure points for remote session behavior

Do this only after P0 ownership is clearer.

## Suggested First Slice

If we want the highest return with the lowest rewrite risk, start here:

1. define the navigation runtime API and owner
2. route presenter advance/retreat and remote page apply through that boundary
3. then split session runtime around that stable navigation boundary
4. only after that separate draw collaboration from local draw state

## Non-Goals

Do not do these as the first move:

- repo-wide folder reorganization
- extracting many generic hooks just to reduce file length
- introducing a global store before runtime ownership is clear
- refactoring the deck/build pipeline, which is not the current bottleneck
- inventing elaborate architectural vocabulary with no direct runtime payoff

## Decision Rule

When choosing what to refactor next, prefer the change that:

1. makes state ownership more explicit
2. reduces blast radius for interaction changes
3. removes platform details from feature logic
4. improves testability of real runtime behavior

Do not prioritize changes that only improve visual neatness.
