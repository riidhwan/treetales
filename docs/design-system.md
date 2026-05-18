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
- Long-form writing views should use a document-first layout: a centered
  readable-width writing column, no surrounding form card around the primary
  editor, and a slim sticky toolbar for navigation, context, and primary
  actions.
- Long-form writing documents should scroll as one page. The title, validation
  feedback, and body editor belong to the same paper-like surface; avoid fixed
  body panes or nested editor scrollbars inside that document.
- On mobile, paper-like long-form writing surfaces should use the full viewport
  width without grey side gutters. Keep only enough internal padding for text
  selection and comfortable edge spacing.
- Long-form writing views keep Write/Preview mode switching in a floating
  bottom control and writing metadata such as word count in a quiet fixed
  bottom-right position.
- On mobile, long-form writing toolbars should keep secondary navigation terse
  and preserve essential save or create controls without relying on extra
  navigation.

## Component Layers

See `src/components/` structure in `@docs/architecture.md`.

- `src/components/ui/` — Generic, reusable primitives currently including
  `Alert`, `Button`, `MarkdownContent`, `MarkdownEditor`, `TextArea`, and
  `TextInput`
- `src/components/features/` — Full feature composites currently including
  `StoryDashboard`, `StoryDetail`, `StoryEditor`, and `StoryReader`
- `src/components/domain/` — Optional future layer for self-contained
  business-aware components once a component is reused across features

Feature components may contain feature-specific cards, empty states, labels, and
layout sections directly. Extract a UI primitive only when styling or behavior
is genuinely shared and remains business-agnostic.
