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

Story-management screens use a shared workbench layout. The page header groups
the screen title, concise description, and primary page action in one clear
hierarchy. Compact navigation belongs above or beside that header, while
section-specific actions belong in the section header that owns them. Avoid
duplicating the same primary action in multiple places within the first
viewport. Reader and chapter authoring screens remain document-first rather
than adopting this workbench layout.

Story-management detail pages should separate route-level navigation from page
content. On mobile, use a slim top bar for back or Dashboard navigation and
reserved secondary route actions, then let the page header focus on the current
object's type, title, and primary actions. Avoid placing Dashboard navigation as
the first content element inside the page body.

When a management page has exactly two page-level actions and one is clearly the
primary path, keep the actions paired on one row when the viewport can fit them.
Give the primary action more visual weight through width, fill, or placement,
and keep the secondary action available but subordinate. Stack only when the
viewport is too narrow to keep both actions legible.

When a section eyebrow already names the content type, do not repeat the same
noun in the section heading immediately below it. Omit the heading when the
eyebrow, action, and content make the section clear; add a heading only when it
contributes distinct meaning.

When a section-scoped action sits beside an unambiguous section label, prefer a
concise visible verb such as "Add" over repeating the object noun. Keep
page-level destructive and navigation actions explicit, and use explicit
accessible labels when the visible label is shortened.

For missing editable content on management pages, prefer an intentional empty
affordance over passive placeholder text when there is a clear existing edit
workflow. The affordance may navigate to the relevant edit page; it does not
need to provide inline editing. Do not make a surface look actionable unless it
actually opens the edit path.

Management screens should not read as stacks of unrelated cards. Use unframed
sections separated by vertical rhythm and subtle dividers for page structure
inside the workbench column, and reserve bordered cards for repeated items,
dialogs, empty states, destructive confirmation areas, and other bounded
objects.

Use a bounded Danger Zone for destructive actions that remove a top-level object
or cascade-delete related content. Keep the panel after normal page content,
state the consequence inside the panel, and separate the destructive command in
a footer row within the same boundary. Danger styling should be clear but quiet
until the user intentionally interacts.

Management pages should keep the first viewport oriented around the constructive
job: identifying the current object, primary navigation or editing actions, and
normal content review or creation. Destructive actions may require scrolling as
long as they remain discoverable at the bottom of the relevant page.

On mobile, story-management screens keep the same workbench hierarchy instead
of adding sticky bottom actions. Stack the page title and description above a
full-width primary page action, then place content below. Reserve sticky
toolbars and fixed controls for reader and chapter authoring surfaces where
navigation or Save access must remain persistent.

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

On story-management screens, read-only user-authored object names may use a
restrained literary serif or display voice to distinguish content identity from
interface chrome. This applies to headings such as Story titles and Character
names, while labels, buttons, navigation, forms, and metadata remain in the app
chrome font. Do not use Reader Appearance for these management headings; Reader
Appearance owns **Chapter** document text only.

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
  and preserve essential Save controls without relying on extra navigation.
- Reader toolbar actions stay icon-only with accessible labels and titles so
  reading chrome remains minimal. Chapter writing and creation keep explicit
  text labels on the primary Save action because it commits user work; secondary
  writing actions may stay compact and icon-led.
- Reader Branch choices are narrative navigation and should look like
  story-choice rows rather than generic app buttons. The Add Branch action is
  an authoring command and remains a normal app button placed below the Branch
  choices.

## Component Layers

See `src/components/` structure in `@docs/architecture.md`.

- `src/components/ui/` — Generic, reusable primitives currently including
  `Alert`, `Button`, `MarkdownContent`, `MarkdownEditor`, `TextArea`, and
  `TextInput`
- `src/components/domain/` — Domain-language-aware, self-contained components
  shared across feature surfaces without owning feature state or service calls,
  currently including `ReaderAppearanceControl`
- `src/components/features/` — Full feature composites currently including
  `StoryDashboard`, `StoryDetail`, `StoryEditor`, and `StoryReader`

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
inline writing slip placed directly below the dashboard header, not a modal or
competing standalone card. Empty states should invite authors into the product,
with the example **Story** presented as the stronger first action when no
stories exist. In the empty dashboard state, Add Example Story is the primary
action and New Story is secondary; once saved **Stories** exist, New Story
becomes the primary dashboard action.

## Story Editor

Story editing is metadata management, not document editing. Keep Story title
and description editing in a conventional form rather than using the inline
document-title pattern from Chapter writing. Avoid presenting the same Story
title as both the dominant page heading and the editable field label/value; use
the page header for "Edit Story" context and let the form own the editable
title.

## Character Cards

Story detail Character cards are feature-owned UI in `StoryDetail`. Keep cards
fixed-height in multi-column grids so the grid remains even as custom-property
content varies. In single-column mobile lists, cards may use content-led height
when that improves use of space, while still truncating long names and
custom-property previews. Place compact metadata such as Character Gender in
the card's upper-right area when space allows so the card uses both horizontal
edges and the name remains the primary left-aligned anchor.

Story detail treats Read and Edit as page-level navigation actions, so they
belong in the story workbench header action area. Delete is a destructive
maintenance action and should be visually separated from normal navigation,
placed after the primary Story detail content, and styled quieter than the main
summary and Character sections.

Character dialogs use standard TreeTales dialog styling: a dim page overlay,
white rounded dialog panel, title block, close action, and footer actions.
Property reordering uses compact icon buttons beside each property row.
