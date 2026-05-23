# Docs-First Local Design System

TreeTales will define its design language in a docs-first style guide, enforce
stable patterns through local UI primitives, and keep TreeTales-specific
surfaces in domain or feature components until reuse proves they belong lower
in the component stack. We chose this over adopting a third-party component
library, starting with Storybook, or building a generic Material-like system
because TreeTales needs a small enforceable interface standard with literary
character, not a broad multi-product design system.

## Consequences

- `docs/design/style-guide.md` owns product and visual language.
- `docs/design/implementation.md` owns implementation contracts for tokens,
  primitives, component boundaries, and verification.
- Generic primitives should enforce repeated interaction patterns without
  absorbing Story, Chapter, Character, or Branch-specific surfaces.
- A living style-guide route may be added later as a dev-only surface, but it
  is not required before the docs and primitive contracts stabilize.
