# Design System

## Approach

Tailwind CSS utility classes are used directly in JSX. There is no third-party
component library; local UI primitives wrap native elements where shared styling
or variants are useful.

TreeTales should feel like a quiet literary writing desk with subtle storybook
character. Prefer warm paper-like surfaces, ink-like text, restrained accent
colors, and tactile but simple controls over generic SaaS, Bootstrap-like, or
fantasy game styling. Reading and writing surfaces stay calm and document-first;
library and story-management surfaces may carry more of the app's atmosphere
without becoming decorative landing pages.

The visual identity uses one restrained global brand palette across app chrome,
applied with different intensity by surface type. Dashboard and story-management
views may use richer atmospheric backgrounds and stronger accents, while reader
and chapter authoring views keep paper-like document surfaces with minimal
accent use. Shared controls, forms, dialogs, alerts, and toolbars should remain
consistent rather than using feature-specific color treatments.

The style revamp should rely on typography, color, spacing, paper-like
surfaces, borders, icons, and small CSS-only literary details rather than large
illustrations or image assets. Do not add hero art, decorative scenes, or
stock-like imagery for the first visual identity pass.

App chrome should use custom TreeTales typography distinct from browser-default
fonts. Navigation, forms, buttons, dashboards, dialogs, and metadata may use the
custom app font, while **Chapter** document text continues to follow Reader
Appearance. Do not let app typography choices override user-selected Reader
Appearance fonts for chapter titles, chapter content, write fields, or preview
content.

Use bundled `NV Jost` as the app-chrome font before falling back to system
sans-serif fonts. `NV Jost` may appear in app chrome even though it also remains
available as a Reader Appearance option; Reader Appearance still owns **Chapter**
document typography.

## Conventions

- Base classes first, conditional override classes last via `cn()` helper from `@/lib/utils`
- Responsive reads well on mobile — use Tailwind breakpoints (`sm:`, `md:`) for layout adjustments
- Consistent spacing scale follows Tailwind defaults
- Colors use a TreeTales brand palette: warm parchment for app backgrounds
  and document-adjacent surfaces, ink for primary text and icons, moss for
  primary actions and navigation accents, oxblood for destructive or warning
  actions, and aged gold for focus, highlights, and small affordances. Avoid
  returning to generic emerald/stone defaults as the dominant identity.
- Define the TreeTales brand palette as custom theme tokens in `src/styles.css`
  and consume those tokens through Tailwind utilities. Use token names such as
  `tt-parchment`, `tt-paper`, `tt-ink`, `tt-muted`, `tt-moss`, `tt-oxblood`,
  and `tt-gold` instead of scattering one-off arbitrary color values across JSX.
- Long-form writing views should use a document-first layout: a centered
  readable-width writing column, no surrounding form card around the primary
  editor, and a slim sticky toolbar for navigation, context, and primary
  actions.
- Long-form reading views should use the same document-first shell as writing
  views while remaining view-only: centered readable document, slim sticky
  toolbar, and no form controls inside the chapter body.
- Reader and chapter authoring views should receive the TreeTales visual
  identity through the surrounding shell and paper treatment, not through a
  different interaction model. Use parchment app backgrounds, paper-like
  document surfaces, slim ink/moss toolbar styling, and quiet branch or mode
  controls. Avoid decorative panels inside the **Chapter** body or styling that
  competes with Reader Appearance.
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

For broad style passes, centralize repeated control styling in shared primitives
such as buttons, inputs, textareas, alerts, and focus treatments. Keep
dashboard rows, story detail sections, reader documents, branch controls, and
chapter authoring surfaces feature-owned unless they become genuinely reusable.
Do not turn a visual refresh into a broad component-library abstraction pass.

The first TreeTales visual identity pass is visual-only. Keep routes, workflows,
labels, persistence, Reader Appearance behavior, Prompt Builder behavior, and
PWA install behavior unchanged. Behavior-adjacent changes should be limited to
accessibility-preserving styling improvements such as contrast, focus rings,
spacing, hover states, and active states.

## Dashboard

The dashboard remains the usable story library, not a marketing landing page.
Use a warm full-page background, a compact TreeTales header with a concise
purpose statement, and saved **Story** rows that feel like shelf labels or paper
slips rather than generic white cards. The new-story form should feel like an
inline writing slip. Empty states should invite authors into the product, with
the example **Story** presented as the stronger first action when no stories
exist.

## Character Cards

Story detail Character cards are feature-owned UI in `StoryDetail`. Keep cards
fixed-height so the grid remains even as custom-property content varies. The
card content should start at the top, with long names and custom-property
previews truncated instead of expanding the card.

Character dialogs use standard TreeTales dialog styling: a dim page overlay,
white rounded dialog panel, title block, close action, and footer actions.
Property reordering uses compact icon buttons beside each property row.
