# Cue Flow Design

Last updated: 2026-03-07

## Goal

Define a runtime model that is broader than today's reveal flow, but still simple enough to ship incrementally.

This design should let `slidev-react` grow from:

- incremental reveal
- click pacing
- presenter/viewer sync

into richer step-driven presentation behavior such as:

- typewriter text
- typing sound effects
- staged emphasis
- export policies that flatten or expand steps

## One-Line Read

`Reveal` should remain an authoring primitive.

The higher-order runtime concept should become `presentation-flow`, and its smallest progression unit should be a `cue`.

## Why Change the Naming

`reveal` is a good author-facing word, but it is too narrow for the runtime we are moving toward.

Future behavior is no longer just "show this block later".
It includes "when the slide reaches this step, trigger one or more effects and decide which of them matter for export".

That is closer to presentation flow than to a single reveal feature.

## Core Terms

### `presentation-flow`

The runtime that owns how a presentation progresses.

It should answer:

- where the deck currently is
- what the current in-slide step is
- what it means to advance or retreat
- which cues are active at the current position

### `flow position`

The current logical position of the presentation.

Minimal shape:

```ts
type FlowPosition = {
  pageIndex: number;
  cueIndex: number;
};
```

### `cue`

The smallest progression unit inside a slide.

A cue is not tied to one visual effect.
It represents "something becomes active at this step".

Examples:

- reveal a block
- start a typewriter effect
- play a typing sound
- show an annotation
- focus part of the slide

### `Reveal`

An authoring primitive that maps content visibility to one cue.

`Reveal` should be treated as one kind of cue-driven behavior, not as the system-wide architecture name.

## Design Rules

1. Page navigation and in-slide progression together form one presentation flow.
2. `cue` is a runtime concept, not necessarily a public authoring component.
3. A cue may affect final document state, live presentation effects, or both.
4. Export should consume cues through explicit policy, not by replaying live behavior blindly.
5. `Reveal` stays supported as a simple authoring API even if the runtime becomes cue-based.

## Cue Categories

### Semantic cues

These change the meaningful final state of the slide.

Examples:

- reveal a paragraph
- show a diagram layer
- display an annotation mark

These usually matter for `steps` export and often collapse into the final state for `final` export.

### Presentation-only cues

These improve the live experience but do not change the final document meaning.

Examples:

- typewriter animation
- typing sound
- flash or pulse
- delay before auto-advance

These should usually be ignored by `final` export.

## Runtime Boundary

The target owner is not `app/`.
`app/` should remain an assembly layer.

The target owner is a first-class runtime boundary inside features, for example:

```txt
src/features/presentation-flow/
```

Suggested internal shape:

```txt
presentation-flow/
  model/
  runtime/
  adapters/
  ui/
```

Where:

- `model`: cue definitions, flow position, advance/retreat rules
- `runtime`: current flow state, active cue resolution, orchestration
- `adapters`: keyboard, stage click, URL, sync bridge, export bridge
- `ui`: thin controls or debug views if needed

## Relationship to Navigation

Navigation should not be modeled as a separate authority that sometimes falls back to reveal.

Instead:

- `presentation-flow` owns `advance`, `retreat`, `goTo`
- page movement is one dimension of flow
- cue movement is the other dimension of flow

This makes "next" easier to explain:

- if the current slide has remaining cues, advance cue
- otherwise advance page and reset cue position

## Relationship to Sync

Presenter/viewer sync should replicate flow position, not just page plus a special reveal field.

That means the shared state should evolve toward:

```ts
type SharedPresentationState = {
  page: number;
  cue: number;
  cueTotal: number;
  timer: number;
  cursor: PresentationCursorState | null;
  drawings: PresentationDrawingsState;
  drawingsRevision: number;
  lastUpdate: number;
};
```

We do not need a big-bang rename immediately, but the runtime should start thinking in this shape.

## Export Policy

`cue` should not force one export behavior.

Export should choose a policy:

- `final`: flatten cues into the final semantic state and ignore presentation-only effects
- `steps`: emit one snapshot per meaningful cue position
- `live`: execute full presentation effects in an interactive runtime only

This distinction matters because future cues may contain typewriter or sound behavior that should not affect PDF output.

## Timeline Preview

Once flow is modeled explicitly, the project should be able to offer a timeline-style preview or inspector.

This is not a separate state system.
It is a read-only consumer of `presentation-flow`.

The preview should help answer:

- what cues exist on the current slide
- which cue is active now
- what the slide looks like at a given cue position
- how `live`, `steps`, and `final` views differ

Suggested capabilities:

- show cue nodes for the current slide
- label cue kinds such as `reveal`, `annotate`, `typewriter`, `sound`
- jump to a selected `flow position`
- preview the resolved slide state at that position
- switch export preview between `live`, `steps`, and `final`

This matters because cue-driven flow becomes much easier to author, debug, and export once the presenter can inspect progression directly instead of advancing one click at a time.

## Authoring Direction

Near term:

- keep `<Reveal />` and `<RevealGroup />`
- keep `step` as the visible authoring affordance
- let `Annotate step={n}` continue to align with the same flow model

Later, if needed, add higher-order authoring constructs that compile to cues.

Examples:

- `<Typewriter step={2} />`
- `<SoundCue step={2} />`
- slide metadata that declares auto-advance or timing hints

## Migration Strategy

### Phase 1

Treat current reveal clicks as the first generation of cues.

Do not change public authoring syntax yet.

### Phase 2

Move runtime ownership out of presenter-only orchestration and into one explicit flow runtime.

### Phase 3

Add new cue types and explicit export policies once the ownership boundary is stable.

## Non-Goals

- Not a full animation timeline engine
- Not a frame-based scheduler
- Not a requirement to expose every cue type as MDX syntax immediately
- Not a forced rewrite of existing `Reveal` decks

## Decision

Use:

- architecture name: `presentation-flow`
- runtime unit: `cue`
- position model: `flow position`
- existing public primitive: `Reveal`

Avoid using `reveal` as the top-level architecture name for future runtime work.
