# Design Style Guide

TreeTales uses a calm literary workspace standard: readable, tactile, and
author-owned before decorative. This guide is the design-grill-owned source of
truth for reusable UI/UX decisions; implementation contracts remain in
`docs/design/implementation.md`.

## Source References

- `docs/design/implementation.md`: implementation contracts, primitives,
  tokens, and component ownership.
- `CONTEXT.md`: product vocabulary and experience-mode language.

## Design Principles

- Product interface clarity comes before literary atmosphere.
- Literary details should support writing and reading, not compete with the
  user's Story, Chapters, or Characters.
- Do not introduce visual details that imply hidden Story state such as genre,
  progress, status, or recency.
- Prefer documented surface, action, and typography roles over ad hoc visual
  treatments.

## Product / Experience Modes

**Library Mode**:
The collection-oriented experience where a user finds or starts Stories. It may
carry the strongest brand atmosphere, editorial rhythm, and expressive
empty-state copy.

**Management Mode**:
The workbench-like experience where a user reviews and changes Story structure
and related objects. It prioritizes scanning, clear hierarchy, and efficient
changes over decorative presentation.

**Document Mode**:
The document-first experience where a user reads or authors Chapter text. The
Chapter Document is primary, app chrome is slim, and Reader Appearance owns
Chapter Document typography.

**System Mode**:
The utility experience for app-level states such as unavailable paths,
installation choices, confirmations, failures, loading, and non-workflow empty
states. It should be direct, quiet, and unambiguous.

## Visual Foundations

### Color

- TreeTales has one canonical app theme.
- Use palette tokens by semantic role rather than taste.
- Moss is constructive and primary.
- Oxblood is destructive or warning-oriented.
- Gold is focus, highlight, and small affordance.
- Parchment and paper own warmth; ink and muted text own readability.
- Reader Appearance is not an app theme system and customizes Chapter Document
  typography only.

### Typography

- App chrome text is for labels, buttons, navigation, metadata, and forms.
- Object display text is for read-only Story titles and Character names.
- Chapter Document text is for Chapter title, content, authoring fields,
  previews, and document placeholders.
- Editorial accent text is for small expressive copy and occasional supporting
  lines.
- Code or markdown utility text is only for source-like or utility surfaces.
- Do not scale font size with viewport width.
- Letter spacing should remain `0` unless uppercase metadata needs conventional
  tracking.

### Spacing, Radius, and Elevation

- Prefer gap and padding over ad hoc margins.
- Workbench sections should use vertical rhythm and subtle dividers before
  framed cards.
- Default controls use restrained radius.
- Larger radii are exceptions for bounded expressive objects, mainly in Library
  Mode.
- Elevation should be rare and soft, used for bounded objects, dialogs, sticky
  toolbars, and active affordances.
- Avoid nested framed surfaces unless there is a real modal, form, or object
  boundary.

### Icons and Imagery

- Use `lucide-react` for UI icons.
- Toolbar actions should usually be icon-only with accessible labels and
  titles.
- Primary and secondary buttons may include leading icons when the icon
  clarifies intent.
- Do not add decorative icons to headings or paragraphs only to create
  atmosphere.
- Product surfaces should not use decorative scenes, stock-like imagery, or
  marketing-page composition.

## Surface Patterns

**App Background**:
The full-page parchment field that gives TreeTales warmth and separates the app
from generic white interfaces.

**Workbench**:
The main constrained column for Library and Management Mode. It is mostly
unframed page structure with clear rhythm, not a stack of nested cards.

**Paper Document**:
The central Chapter Document surface. It has the highest readability standard
and must not compete with Reader Appearance.

**Bounded Object**:
A repeated or self-contained object such as a Story row, Character card, empty
state, or form panel. Borders and soft elevation are allowed, but bounded
objects should not become the default wrapper for every section.

**Dialog Surface**:
A focused task surface for modal or popover-style work. It must have clear
title hierarchy, keyboard-accessible behavior, and obvious dismissal or
completion actions.

**Danger Surface**:
An explicit destructive area. It should be visually distinct, quiet by default,
and clear about consequences.

**Toolbar Surface**:
A slim persistent or sticky action surface, especially in Document Mode. It
should preserve essential navigation or commit actions without overwhelming the
content.

## Actions and Controls

- Primary actions are constructive main actions and use the moss role.
- Secondary actions are available but subordinate.
- Destructive actions remove content or cascade deletion and must use explicit
  copy when scope could be unclear.
- Icon actions are compact toolbar or control actions with accessible labels and
  titles.
- Story rows, Branch choices, and similar domain actions may keep
  product-specific presentation when that protects meaning.
- Commands should use direct verbs such as Save, Edit, Delete, Add, Create, and
  Read.

## Interaction States

- Every interactive component needs visible focus, hover, active, disabled, and
  loading behavior where applicable.
- Focus should be obvious and consistent, using the gold focus role.
- Disabled controls should stay readable while clearly inactive.
- Destructive styling should become stronger through context and interaction
  rather than making the whole page feel alarming.
- Empty states should show a clear next step when one exists.
- Loading and error states should preserve the current experience mode's
  surface language.

## Responsive Rules

- Mobile layouts should preserve the same mode hierarchy rather than inventing
  separate mobile products.
- Library and Management Mode stack content and actions when needed.
- Document Mode should keep the Chapter Document readable and avoid grey side
  gutters on small screens.
- Reserve sticky or fixed controls for surfaces where navigation or commit
  access must remain persistent.
- Text must fit within its parent element across mobile and desktop viewports.

## Content Voice

- Product vocabulary must follow `CONTEXT.md`.
- Library Mode empty states and supporting copy may be warmer and more literary,
  but they still need clear actions.
- Document Mode copy should be quiet and functional so it does not interrupt
  the author or reader.
- Avoid scaffolding labels when user-facing product language is clearer.

## Open Questions

- None.
