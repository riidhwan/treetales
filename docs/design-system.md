# Design System

TreeTales uses local UI primitives, Tailwind CSS utility classes, and custom
TreeTales theme tokens. The visual and product language is defined in
`docs/style-guide.md`; this document defines implementation contracts for
turning that language into code.

## Approach

Use Tailwind CSS utility classes directly in JSX. There is no third-party
component library. Local primitives wrap native elements where shared behavior,
accessibility, or variants are useful.

Do not turn a style pass into a broad component-library abstraction pass.
Extract a primitive only when the behavior or styling is genuinely reusable and
business-agnostic. Feature-owned Story, Chapter, Character, and Branch surfaces
may stay close to their feature until reuse proves otherwise.

The first docs-first design-system direction is recorded in
`docs/adr/0004-docs-first-local-design-system.md`.

## Theme Tokens

TreeTales palette tokens and semantic color aliases are defined in
`src/styles.css` and consumed through Tailwind utilities. Use these tokens
instead of scattering arbitrary color values across JSX.

Palette tokens carry the raw TreeTales color names:

- `tt-parchment`
- `tt-paper`
- `tt-paper-deep`
- `tt-ink`
- `tt-muted`
- `tt-line`
- `tt-moss`
- `tt-moss-dark`
- `tt-moss-soft`
- `tt-oxblood`
- `tt-oxblood-soft`
- `tt-gold`
- `tt-gold-soft`

Semantic aliases carry the design roles from `docs/style-guide.md`:

| Semantic role | Tailwind token |
|---|---|
| `background.app` | `background-app` |
| `surface.paper` | `surface-paper` |
| `surface.paperDeep` | `surface-paper-deep` |
| `text.primary` | `text-primary` |
| `text.muted` | `text-muted` |
| `border.subtle` | `border-subtle` |
| `action.primary` | `action-primary` |
| `action.primaryHover` | `action-primary-hover` |
| `action.destructive` | `action-destructive` |
| `state.destructiveSoft` | `state-destructive-soft` |
| `focus.ring` | `focus-ring` |
| `highlight.soft` | `highlight-soft` |
| `state.successSoft` | `state-success-soft` |

Generic primitives should prefer semantic aliases when the role is clear, such
as `bg-surface-paper`, `text-text-primary`, `border-border-subtle`,
`bg-action-primary`, and `focus-visible:outline-focus-ring`. Feature-owned
surfaces may still use palette tokens directly when a visual treatment has not
settled into a reusable semantic role.

Bundled `NV Jost` is the app-chrome font before system sans-serif fallbacks.
Reader Appearance owns **Chapter Document** typography and must not be
overridden by app typography choices.

## Component Layers

See `docs/architecture.md` for the full layer-first component structure.

- `src/components/ui/`: Generic, reusable primitives with no TreeTales business
  nouns or workflow ownership.
- `src/components/domain/`: Business-aware, self-contained TreeTales
  components shared across feature surfaces without owning feature state or
  service calls.
- `src/components/features/`: Full feature composites and feature-owned
  sections, cards, dialogs, rows, forms, and helpers.

Moving a component into `ui/` should make it less domain-aware. Do not promote
screen-specific UI only to make imports shorter.

## Current Primitives

Current generic primitives include:

- `Alert`
- `Button`
- `Dialog`
- `Field`
- `IconButton`
- `MarkdownContent`
- `MarkdownEditor`
- `TextArea`
- `TextInput`
- `Toolbar`

Near-term primitive candidates include:

- `SegmentedControl`
- `EmptyState`

Defer generic `Surface`, `Card`, `StoryRow`, `CharacterCard`,
`ChapterDocumentShell`, and `BranchChoiceList` until their semantics and reuse
are clear. Surface names in `docs/style-guide.md` are design contracts first,
not a requirement to create a single generic wrapper.

## Primitive Contracts

### Buttons

Use `Button` for primary, secondary, and destructive command actions. Do not
hand-roll new button treatments in feature JSX when the action is a normal app
command.

Allowed command variants:

- Primary: constructive main action
- Secondary: subordinate action
- Danger: destructive action

Use icons when they improve scanning. Keep icon spacing consistent through the
primitive instead of custom per-feature spacing when possible.

Use `IconButton` for compact toolbar and control actions. Icon-only actions
must have accessible labels and titles.

### Fields

Use `TextInput` and `TextArea` for standard app-chrome forms. Use `Field` for
business-agnostic label, help text, validation message, and control layout.

Document authoring fields are part of **Document Mode** and may need
domain-specific treatment because Reader Appearance can apply to Chapter
Document text.

### Alerts and States

Use `Alert` for neutral, error, and success messages. Add warning only when a
real warning state exists. Error and destructive states should use oxblood roles
without overwhelming the surface.

Loading, missing, empty, and unavailable states should keep the surrounding
experience mode rather than inventing one-off visual systems.

### Dialogs

Use `Dialog` for repeated modal surfaces. The primitive owns the modal overlay,
labelled dialog surface, title semantics, close action, Escape dismissal, focus
return, basic focus containment, scroll boundary, and footer action layout.

Feature-specific dialog content, such as Character forms or Prompt Builder
content, remains feature-owned.

`Dialog` requires a stable `titleId` from the owning component so tests and
assistive technology can rely on the same labelled surface. Keep the dialog
title specific to the user task; use the optional eyebrow only for compact
context such as `Character`.

### Toolbars

Toolbars are slim action surfaces. Reader and chapter authoring toolbars may be
sticky when persistent navigation or Save access is required. Management pages
should not add sticky toolbars by default.

Toolbar actions should use icons or compact labels according to
`docs/style-guide.md`.

Use `Toolbar` for repeated sticky action shells. The primitive owns the labelled
navigation landmark, sticky paper surface, max-width content row, action
grouping, and optional truncated context text. Feature components own which
actions appear, their labels, workflow state, and any domain-specific menus or
panels.

Use `IconButton` for icon-only toolbar commands so accessible labels and titles
stay consistent. Use compact text `Button` actions when the command needs
visible text, such as the primary Save/Create action in Chapter authoring.

## Feature-Owned Surfaces

Keep these feature-owned unless repeated cross-feature needs justify extraction:

- Dashboard Story rows
- Dashboard creation affordances
- Story detail sections
- Character cards and Character dialog content
- Branch choice rows
- Chapter Document composition
- Danger Zone content and copy

These surfaces may still follow the style guide strictly. They just do not need
to be generic UI primitives.

## Implementation Rules

- Base classes first, conditional override classes last via `cn()` from
  `@/lib/utils`.
- Use Tailwind breakpoints for responsive layout.
- Use stable dimensions for fixed-format controls, grids, toolbars, tiles, and
  rows so hover states, labels, icons, and dynamic text do not shift layout.
- Avoid one-off arbitrary colors in JSX.
- Avoid repeated arbitrary shadows, radii, and gradients unless they are
  documented as a surface exception.
- Avoid nested framed surfaces unless there is a real modal, form, or bounded
  object boundary.
- Do not add generic cards or panels where the style guide calls for unframed
  Workbench structure.
- Do not let Reader Appearance affect app chrome, metadata, toolbars, buttons,
  navigation, or non-document form labels.
- Do not edit `src/routeTree.gen.ts` by hand for design changes.

## Verification

Run the narrowest relevant tests first. For route, store, service, or UI
changes, also run the repository verification commands named in `AGENTS.md`
unless the task explicitly narrows verification.

For docs-only design-system changes with no source changes, `git diff --check`
is sufficient unless the docs edit also changes generated documentation or
introduces examples that need code validation.
