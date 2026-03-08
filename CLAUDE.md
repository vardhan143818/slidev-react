# Design Context

## Users

Developers and technical teams creating presentation slides. The product is a React+MDX based slide framework, targeting users comfortable with code-based authoring.

## Brand Personality

**Professional · Restrained · Clean**

The interface should feel confident but not loud. Prioritize content over decoration. Think "developer tool" aesthetic—functional, minimal, no unnecessary flourish.

## Aesthetic Direction

- **Style**: Chrome browser / system UI inspired, utilitarian
- **Theme**: Light mode primary (with dark mode support)
- **Colors**:
  - Primary: slate grays (50-900)
  - Accent: green (#22c55e / emerald)
  - No neon, no gradients as decoration
- **Typography**:
  - Sans: Inter
  - Mono: JetBrains Mono
- **Borders**: Subtle, consistent `border-slate-200/80`
- **Radius**: Unified `rounded-[6px]`

## Anti-Patterns to Avoid

- ❌ AI-generated "slop" aesthetics (glassmorphism, glowing accents, gradient text)
- ❌ Over-decoration (unnecessary shadows, animated backgrounds)
- ❌ Identical card grids, hero metric layouts
- ❌ Generic Inter/Roboto with rounded corners + icons
- ❌ Dark mode with cyan/neon accents

## Design Principles

1. **Content first**: UI should recede, letting slide content shine
2. **Consistency over variety**: Reuse primitives (ChromeIconButton, ChromeTag, ChromePanel, FormSelect)
3. **Restrained animations**: Subtle transitions only, no bouncy/elastic easing
4. **Clear hierarchy**: One primary action, few secondary actions
5. **Accessibility**: WCAG compliant, reduced motion support

## Existing Design System

Located in `packages/client/src/ui/primitives/`:

- `ChromeIconButton` - Icon buttons with tone variants (default, active, danger, success, info, violet)
- `ChromeTag` - Labels with tone variants
- `ChromePanel` - Container panels with tone variants (glass, solid, inset, frame, dashed)
- `FormSelect` - Label + select compound component

All primitives use:
- `border-slate-200/80`
- `rounded-[6px]`
- Tailwind CSS for styling
