# Design System

## Approach

Tailwind CSS utility classes used directly in JSX. No component library — UI built from primitives (`button`, `input`, `textarea`, etc.) styled with Tailwind.

## Conventions

- Base classes first, conditional override classes last via `cn()` helper from `@/lib/utils`
- Responsive reads well on mobile — use Tailwind breakpoints (`sm:`, `md:`) for layout adjustments
- Consistent spacing scale follows Tailwind defaults
- Colors use Tailwind's built-in palette; no custom theme tokens for MVP

## Component Layers

See `src/components/` structure in `@docs/architecture.md`.

- `src/components/ui/` — Generic, reusable primitives (Button, Input, Card)
- `src/components/domain/` — Business-aware components (StoryCard, ChapterList)
- `src/components/features/` — Full feature composites (StoryDashboard, ChapterReader, StoryEditor)
