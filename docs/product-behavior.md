# Product Behaviour

## MVP User Flows

### Story Dashboard (Home)
- User arrives at the home page and sees their Saved Stories and a separate
  Starter Section of Built-in Example Stories.
- The dashboard story creation action opens a form for title + description.
- After creating a story, user is redirected to the story editor.
- When there are no Saved Stories, the Starter Section is prominent so the
  first-run library does not look empty at first glance.
- Once Saved Stories exist, the Starter Section remains available as a secondary
  area below the Saved Stories list.
- Choosing a Built-in Example Story creates or reuses an editable Example Story
  Copy in this browser and opens it in the reader.
- Built-in example story source works should be verifiably U.S. public domain,
  less obvious than the most famous public-domain classics, substantial enough
  to support meaningful branches, and suitable for a first-run product
  experience without relying on offensive stereotypes, colonial framing, dated
  assumptions, modern translations, modern illustrations, or another
  interactive/gamebook brand association. The initial source set should use
  English-language public-domain source texts rather than translated works.
- Each story appears as a fixed-height list row with title and description.
  Long titles and descriptions truncate to keep rows even.
- Selecting a story row opens the story detail page.

### Story Detail
- User opens an existing story from the dashboard and lands on the story detail page.
- Story detail shows the story title and description.
- When a Story has no description, Story detail shows an empty summary
  affordance that opens the Story editor.
- Story detail provides actions to read, edit, or delete the story.
- Delete shows a confirmation dialog before removing the story and returning to
  the dashboard.
- Story detail shows Story-level Character cards below the story summary.
- Character cards show the character name and gender, keep even heights in
  multi-column grids, may use content-led height in single-column mobile lists,
  and preview the first three custom properties with long keys and values
  truncated. When more than three custom properties exist, the card shows a
  remaining-count indicator.
- Selecting a Character card opens a read-only detail dialog with the full
  plain-text custom property values.
- Story detail lets users create, edit, and delete Characters from dialogs.
  Create and edit require a non-empty name, support gender selection, and let
  users add, remove, and reorder custom properties.
- Leaving a Character create or edit dialog with unsaved changes asks for
  confirmation before discarding the draft.
- Character delete asks for confirmation before removing the Character.

### Story Reader
- User opens a story from story detail or the example-story empty state and
  lands on the first chapter.
- When a Story has no Intro Chapter, opening the reader shows an empty state
  with an "Add Intro Chapter" action that opens the dedicated Intro Chapter
  creation page. A slim toolbar above the empty state provides text-labelled
  navigation back to Story detail. The empty state uses the heading "No Intro
  Chapter yet", the body "Add an Intro Chapter to give this Story a place to
  begin.", and the primary action "Add Intro Chapter".
- Chapter displays title and content rendered from markdown text. Supported
  markdown includes common markdown plus GFM tables, task lists,
  strikethrough, autolinks, and single-newline breaks. Raw HTML in chapter
  content is not rendered.
- Reader uses a document-first view-only surface aligned with chapter creation
  and editing: a slim sticky toolbar, centered readable document, and no inline
  editing controls in the document body.
- Reader toolbar actions are icon-only controls for opening the parent chapter
  when one exists, opening story details, editing the current chapter, and
  opening the dashboard.
- At the bottom:
  - One or more branches → "What happens next?" followed by clickable
    branch choices
  - No branches → "The End" indicator
  - "Add Branch" action below the branch section
- Forward navigation uses the selected next chapter and appends it to the
  session-local reading path.
- When the current chapter has a parent chapter, Parent Chapter opens that
  parent and trims the session path to that parent when it already exists in the
  path.
- Reader path history is scoped to the current story and resets when opening a
  different story.
- Reader does not edit inline, but the toolbar can open the current chapter for
  editing and the bottom branch section can add a branch from it.
- Reader Appearance controls reading presentation preferences such as font
  family and font size. These preferences apply globally across all stories in
  the current browser because they reflect reader comfort rather than story
  content.
- Reader Appearance applies to the chapter document text, including the chapter
  title and rendered chapter content. App chrome such as the toolbar and branch
  controls keeps the standard TreeTales interface styling.
- Reader Appearance also applies to chapter document text in chapter creation
  and chapter editing, including Write and Preview modes, because those surfaces
  present the same authored chapter document.
- Reader Appearance affects authoring placeholders inside the chapter title and
  content fields so placeholder text uses the same document typography while
  retaining standard muted placeholder styling.
- Reader Appearance does not affect authoring chrome or metadata such as title
  validation messages, toolbar context, mode controls, save/create buttons, or
  word count.
- Readerly is the default reader font. If bundled font assets fail to load, the
  reader remains usable with browser fallback fonts.
- Reader font size is shown to users in points. The default is 14 pt; increase
  and decrease controls step by 1 pt and clamp the range from 10 pt to 24 pt.
- Reader Appearance provides a reset action that returns font family and font
  size to their defaults.
- Reader Appearance controls are available from the reader, chapter creation,
  and chapter editing toolbars. All entry points use the same globally persisted
  Reader Appearance value.
- Reader Appearance changes are not actively synchronized across already-open
  tabs or mounted surfaces; reloading or remounting a surface reads the latest
  stored value.
- Reader font selection uses a compact two-column option list in the Reader
  Appearance panel. The options are Readerly, Sourcerer, Cartisse, NV Charis,
  NV Garamond, NV Jost, NV Bitter, NV Legible Next, and NV Palatium.
- Each font option previews its own label in that font when the font asset is
  available, while remaining selectable if the asset falls back.

### Story Editor
- User opens a story in edit mode from story detail or after creating a story.
- Story editor top navigation returns to the Story detail page. The editor does
  not duplicate Story reading navigation.
- Story editor edits only Story title and description.
- Intro Chapter creation starts from the Story Reader empty state, not from the
  Story editor.
- Once the introductory chapter exists, new chapters are added from an
  existing parent chapter page, not from the top-level story editor.
- Each chapter can be edited (title + content) in a separate form view.
- Chapter editor is only for editing the selected chapter's title and content.
- Chapter creation uses the same document-first writing surface as chapter
  editing: the new chapter's title is edited inline as the document heading,
  and the markdown editor gets most of the available page space.
- Chapter creation collects title and markdown content, lets the user toggle
  between writing and markdown preview in the same document column, creates
  either the intro chapter or a branch linked to the selected parent chapter.
- After Intro Chapter creation from the Story Reader empty state, TreeTales
  opens the Story Reader on the new Intro Chapter.
- After Branch creation, TreeTales opens the new Branch for editing.
- Chapter creation keeps the commit action reachable in a sticky toolbar and
  uses the same Save/Saving action language as chapter editing, but it does not
  bind `Ctrl+S`/`Cmd+S` to the one-time creation action.
- Chapter creation and chapter editing expose an icon-only Writing Assist
  toolbar action. Writing Assist opens a menu with Prompt Builder and a disabled
  Write with LLM option.
- Prompt Builder opens a modal where the author can enter a Rough Plot and copy
  a generated prompt for an external LLM. TreeTales does not call an LLM,
  display generated prose, or change chapter content from this flow.
- Prompt Builder uses separate templates for Intro Chapters and Branches. The
  templates can interpolate the current in-memory chapter title and content,
  the Rough Plot, the story title, and for Branches the immediate Parent Chapter
  title and content.
- Prompt Builder keeps Rough Plot text only for the current page session. Rough
  Plot text is not saved with the Story or Chapter and does not affect
  unsaved-change warnings.
- If copying the generated prompt fails, Prompt Builder shows the generated
  prompt so the author can copy it manually.
- Write with LLM is visible but disabled; direct LLM writing is a future feature.
- Chapter creation uses draft-oriented unavailable and failure states before a
  chapter exists, while the toolbar commit action keeps Save/Saving language
  consistent with chapter editing.
- If the user changes the draft title or content before creating the chapter,
  leaving the chapter creation page asks for confirmation before discarding the
  draft.
- Chapter creation requires a non-empty title but allows empty content, so
  writers can create branch structure before drafting prose.
- Chapter creation uses the same title and content placeholders for intro
  chapters and branches: "Untitled chapter" and "Write this chapter in markdown...".
- Branch creation provides a stable action back to the parent chapter and
  a stable action back to the story editor. Intro Chapter creation provides a
  stable action back to the Story Reader. Parent/story context belongs in the
  toolbar rather than inside the document body.
- Branch creation immediately links the new branch to the selected parent
  chapter.
- Chapter editing keeps the markdown textarea as the source of truth and lets
  the user toggle to a markdown preview without converting the saved content.
- Chapter editing uses a document-first writing surface rather than a standard
  form layout: the selected chapter's title is edited inline as the document
  heading, and the markdown editor gets most of the available page space.
- Chapter editing provides a stable action back to the story editor, alongside
  browser-history Back and Dashboard navigation, so users can return to the
  story structure without depending on how they entered the editor.
- Chapter editing keeps explicit save behaviour. The save action remains
  reachable in a sticky toolbar, shows save state such as unsaved/saving/saved,
  and supports the standard `Ctrl+S`/`Cmd+S` shortcut.
- If the user changes the chapter title or content after the last successful
  load or save, leaving the chapter editor asks for confirmation before
  discarding unsaved changes.
- Chapter editing previews markdown through a Write/Preview mode switch in the
  same document column, not a side-by-side split pane.
- Chapter editing may show lightweight writing metadata such as word count, but
  metadata does not affect saved chapter content.
- Branch editing disables Prompt Builder when the immediate Parent Chapter
  cannot be loaded. Intro Chapter Prompt Builder does not require Parent Chapter
  context.
- A tree view shows the story's branching structure.

### Installable PWA
- On a first mobile browser visit, TreeTales shows an install choice before the
  dashboard with actions to install the PWA or continue to the mobile site.
- Choosing Continue stores that preference in the current browser so future
  mobile visits go straight to the dashboard.
- The install choice is skipped when TreeTales is already running in standalone
  installed-app mode.
- Android Chromium browsers use the browser's native PWA install prompt from
  the install action once `beforeinstallprompt` is available. While that prompt
  is not ready yet, the install action remains pending instead of showing manual
  browser instructions.
- Browsers that do not expose the native install prompt, including iOS browsers,
  show concise Add to Home Screen guidance.
- TreeTales can be installed from Android Chromium as a standalone app when
  served from a secure HTTPS deployment.
- The installed app opens at the story dashboard and uses the same browser-local
  story data as the website.
- The app shell and static assets are cached by a service worker for basic
  repeat-load resilience. Offline data sync across devices is not supported.

### Not Found
- Unknown app paths render a TreeTales-styled not-found state instead of the
  router's generic fallback.
- The not-found state explains that the requested story path is unavailable and
  provides a clear link back to the story dashboard at `/`.

### Branching Rules
- The first chapter created in a story is the introductory chapter (no parents).
- A chapter can only have zero or one parent chapter.
- A chapter can be the parent of zero, one, or multiple other chapters.
- Creating a branch from a parent chapter immediately links the new chapter to
  that parent.
- Cycles are rejected: a chapter cannot be its own ancestor.

## Backlog (Future)
- AI-assisted writing
- Story/chapter export
- Offline sync
- Visual chapter graph
- Reader path history view for longer sessions
