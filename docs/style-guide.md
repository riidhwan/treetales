# Style Guide

TreeTales uses an interface standard with literary character. The product
should feel calm, readable, tactile, and author-owned before it feels
decorative. Literary details should support writing and reading, not compete
with the user's **Story**, **Chapters**, or **Characters**.

This guide defines product and visual language. Implementation contracts,
component ownership, and allowed primitive APIs live in `docs/design-system.md`.

## Design Philosophy

TreeTales is a branching story writing and reading app, not a marketing site,
fantasy game interface, or generic SaaS dashboard. The UI should feel like a
quiet literary workspace: warm paper-like surfaces, ink-like text, restrained
accents, clear controls, and enough atmosphere to make the app distinct.

The product interface standard comes first. Literary character comes second.
When those goals conflict, choose readability, predictability, and author
control.

The **Story** is the product anchor: users create, organize, and return to
Stories. The **Chapter Document** is the visual anchor: reading and authoring
must protect the presented Chapter title and content from unnecessary chrome or
decoration.

Avoid:

- Generic Bootstrap-like or SaaS-neutral styling
- Fantasy game styling
- Decorative scenes, hero art, stock-like imagery, or large illustrations
- Marketing landing-page composition for product surfaces
- Visual details that imply hidden Story state such as genre, progress, status,
  or recency

## Experience Modes

TreeTales has four canonical experience modes. These are product design terms,
not implementation components.

**Library Mode** is the collection-oriented experience where a user finds or
starts **Stories**. It may carry the strongest brand atmosphere, editorial
rhythm, and expressive empty-state copy.

**Management Mode** is the workbench-like experience where a user reviews and
changes **Story** structure and related objects. It should prioritize scanning,
clear hierarchy, and efficient changes over decorative presentation.

**Document Mode** is the document-first experience where a user reads or
authors **Chapter** text. The Chapter Document is primary, app chrome is slim,
and Reader Appearance owns Chapter Document typography.

**System Mode** is the utility experience for app-level states such as
unavailable paths, installation choices, confirmations, failures, loading, and
empty states that are not specific to a content workflow. It should be direct,
quiet, and unambiguous.

Do not split the visual language into broad "reading mode" and "writing mode"
systems. Chapter reading, creation, editing, and preview share Document Mode,
with authoring-specific controls layered around the Chapter Document.

## Visual Foundations

### Color

TreeTales has one canonical app theme. Reader Appearance is not an app theme
system; it customizes Chapter Document typography only.

Use the TreeTales palette by semantic role, not by taste:

| Semantic role | Palette token |
|---|---|
| `background.app` | `tt-parchment` |
| `surface.paper` | `tt-paper` |
| `surface.paperDeep` | `tt-paper-deep` |
| `text.primary` | `tt-ink` |
| `text.muted` | `tt-muted` |
| `border.subtle` | `tt-line` |
| `action.primary` | `tt-moss` |
| `action.primaryHover` | `tt-moss-dark` |
| `action.destructive` | `tt-oxblood` |
| `state.destructiveSoft` | `tt-oxblood-soft` |
| `focus.ring` | `tt-gold` |
| `highlight.soft` | `tt-gold-soft` |
| `state.successSoft` | `tt-moss-soft` |

Moss is constructive and primary. Oxblood is destructive or warning-oriented.
Gold is focus, highlight, and small affordance. Parchment and paper own warmth.
Ink and muted text own readability.

### Typography

Choose typography by role:

| Role | Use |
|---|---|
| App Chrome Text | Interface labels, buttons, navigation, metadata, forms |
| Object Display Text | Read-only Story titles and Character names in Library and Management Mode |
| Chapter Document Text | Chapter title, content, authoring fields, previews, and document placeholders |
| Editorial Accent Text | Small expressive copy, dashboard subtitles, and occasional italic lines |
| Code or Markdown Utility Text | Source-like or utility surfaces when needed |

App Chrome Text uses the app chrome font. Object Display Text and Editorial
Accent Text may use the restrained literary display voice. Chapter Document
Text is controlled by Reader Appearance.

Use role-based type ranges:

- App Chrome Text: `text-sm` to `text-base`, rarely `text-lg`
- Management headings: `text-xl` to `text-3xl`
- Library display headings: up to `text-5xl` to `text-7xl` when the viewport and
  hierarchy justify it
- Object Display Text: usually `text-2xl` to `text-4xl`
- Chapter Document Text: Reader Appearance size with relative `em` headings
- Buttons and fields: stable `text-sm` or `text-base`

Do not scale font size with viewport width. Letter spacing should remain `0`
unless uppercase metadata needs a conventional tracking treatment.

### Spacing, Radius, and Elevation

Use Tailwind's spacing scale. Prefer `gap` and padding over ad hoc margins.
Workbench sections should use vertical rhythm and subtle dividers before
framed cards.

Touch targets should be at least `2.5rem`, with `2.75rem` preferred for primary
mobile actions.

Default controls use restrained radius. Larger radii are allowed for bounded
expressive objects in Library Mode, but they are exceptions, not the default.
Avoid letting large arbitrary radii become the base visual language.

Elevation should be rare and soft. Use it for bounded objects, dialogs, sticky
toolbars, and active affordances. Do not nest framed surfaces unless there is a
real modal, form, or object boundary.

### Icons

Use `lucide-react` for UI icons. Icons are required for icon-only actions,
encouraged for commands where they aid scanning, and avoided in dense prose or
document content.

Toolbar actions should usually be icon-only with accessible labels and titles.
Primary and secondary buttons may include leading icons when the icon clarifies
intent. Story rows may use a trailing chevron to signal navigation. Branch
choices may use a subtle chevron, but should still read as narrative choices
before generic app navigation.

Do not add decorative icons to headings or paragraphs only to create atmosphere.

## Surface System

Use named surfaces by role. Avoid vague primary design terms such as "card",
"panel", and "container" when a role-based term is available.

**App Background** is the full-page parchment field. It provides the global
TreeTales warmth and separates the app from generic white interfaces.

**Workbench** is the main constrained column for Library and Management Mode.
It is mostly unframed page structure with clear rhythm, not a stack of nested
cards.

**Paper Document** is the central Chapter Document surface. It has the highest
readability standard and must not compete with Reader Appearance.

**Bounded Object** is a repeated or self-contained object such as a Story row,
Character card, empty state, or form panel. Borders and soft elevation are
allowed, but bounded objects should not become the default wrapper for every
section.

**Dialog Surface** is a focused task surface for modal or popover-style work.
It must have clear title hierarchy, keyboard-accessible behavior, and obvious
dismissal or completion actions.

**Danger Surface** is an explicit destructive area. It should be visually
distinct, quiet by default, and clear about consequences.

**Toolbar Surface** is a slim persistent or sticky action surface, especially
in Document Mode. It should preserve essential navigation or commit actions
without overwhelming the content.

Treat these surfaces as design contracts first. Do not start by creating a
generic `Surface` component; each surface may need different semantic elements
and accessibility behavior.

## Actions

Choose action styling by intent and context:

| Action type | Standard |
|---|---|
| Primary Action | Main constructive next step on a surface; filled moss |
| Secondary Action | Available but subordinate; paper or outline treatment |
| Destructive Action | Removes content or cascades deletion; oxblood, explicit copy |
| Icon Action | Compact toolbar or control action with accessible label and title |
| Navigation Row Action | Bounded object that opens a detail view |
| Narrative Choice Action | Branch choice in Document Mode |
| Inline Text Link | Rare support navigation inside prose-like copy or error states |

`Button` should not cover every action. Story rows, Branch choices, and other
domain actions should keep product-specific presentation when that protects
meaning.

## Interaction States

Every interactive component needs visible focus, hover, active, disabled, and
loading behavior where applicable. Focus should be obvious and consistent,
using the gold focus role. Disabled controls should stay readable while clearly
inactive.

Destructive actions should be explicit in copy and visually separated from
constructive workflows. Danger styling should become stronger through context
and interaction rather than making the whole page feel alarming.

Empty states should show a clear next step when a next step exists. Loading and
error states should preserve the current mode's surface language without
creating a separate visual world.

## Content Voice

Product vocabulary must follow `CONTEXT.md`: **Story**, **Chapter**,
**Chapter Document**, **Branch**, **Character**, **Reader Appearance**,
**Prompt Builder**, and **Rough Plot**.

Commands should be direct verbs: Save, Edit, Delete, Add, Create, Read.
Destructive actions should be explicit when scope could be unclear, such as
"Delete Story" or "Delete Character". Section-scoped actions can be concise
when the surrounding label is unambiguous.

Library Mode empty states and supporting copy may be warmer and more literary,
but they still need clear actions. Document Mode copy should be quiet and
functional so it does not interrupt the author or reader.

Avoid scaffolding labels such as "Story dashboard" when user-facing labels can
use the product's language, such as "Your Library" or "Your stories".

## Component Boundaries

Generic UI primitives enforce stable interaction patterns, but TreeTales should
not turn every surface into a generic component.

Use `src/components/ui/` for business-agnostic primitives such as buttons,
icon buttons, fields, dialogs, alerts, text inputs, text areas, segmented
controls, toolbars, and reusable empty-state shells.

Use `src/components/domain/` for reusable TreeTales concepts or cross-feature
patterns that can use domain language, such as Reader Appearance controls or a
future Chapter Document shell.

Use `src/components/features/` for workflow-owned composition, screen-specific
layout, and one-off product surfaces such as Story rows, Character cards,
dashboard creation affordances, Branch choice lists, and Story danger zones
unless reuse proves otherwise.

Moving a component into `ui/` should make it less domain-aware, not just easier
to import.

## Responsive Standard

Mobile layouts should preserve the same mode hierarchy rather than inventing
separate mobile products. Library and Management Mode stack content and actions
when needed. Document Mode should keep the Chapter Document readable and avoid
grey side gutters on small screens.

Reserve sticky or fixed controls for surfaces where navigation or commit access
must remain persistent, especially reader and chapter authoring surfaces. Do
not add sticky bottom actions to management pages by default.

Text must fit within its parent element across mobile and desktop viewports.
Prefer stable dimensions, wrapping, and constrained layout over viewport-scaled
type.

## Examples and Limits

The dashboard may be the most expressive Library Mode surface, but it remains a
usable story library, not a landing page.

Story detail and Story editor are Management Mode surfaces. They should feel
like a clear workbench for reviewing and changing Story structure.

Reader, Chapter creation, Chapter editing, and markdown preview are Document
Mode surfaces. They should share the same Paper Document standard while keeping
read-only and authoring controls distinct.

Not found, install choice, confirmation, loading, and error flows use System
Mode. They should be direct, calm, and action-oriented.
