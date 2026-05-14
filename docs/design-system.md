# Design System

## Approach

Tailwind CSS utility classes are used directly in JSX. There is no third-party
component library; local UI primitives wrap native elements where shared styling
or variants are useful.

## Conventions

- Base classes first, conditional override classes last via `cn()` helper from `@/lib/utils`
- Responsive reads well on mobile — use Tailwind breakpoints (`sm:`, `md:`) for layout adjustments
- Consistent spacing scale follows Tailwind defaults
- Colors use Tailwind's built-in palette; there are no custom theme tokens

## Component Layers

See `src/components/` structure in `@docs/architecture.md`.

- `src/components/ui/` — Generic, reusable primitives currently including
  `Alert`, `Button`, `MarkdownContent`, `MarkdownEditor`, `TextArea`, and
  `TextInput`
- `src/components/features/` — Full feature composites currently including
  `StoryDashboard`, `StoryEditor`, and `StoryReader`
- `src/components/domain/` — Optional future layer for self-contained
  business-aware components once a component is reused across features

Feature components may contain feature-specific cards, empty states, labels, and
layout sections directly. Extract a UI primitive only when styling or behavior
is genuinely shared and remains business-agnostic.
