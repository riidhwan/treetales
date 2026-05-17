# Product Behaviour

## MVP User Flows

### Story Dashboard (Home)
- User arrives at the home page and sees a list of their stories (or an empty state).
- "New Story" button opens a form for title + description.
- After creating a story, user is redirected to the story editor.
- Empty state offers an example story that creates a built-in branching story in
  this browser and opens it in the reader.
- Each story card has: title, description, chapter count, and actions (Read, Edit, Delete).
- Delete shows a confirmation dialog before removing.

### Story Reader
- User opens a story from the dashboard and lands on the first chapter.
- Chapter displays title and content rendered from markdown text. Supported
  markdown includes common markdown plus GFM tables, task lists,
  strikethrough, autolinks, and single-newline breaks. Raw HTML in chapter
  content is not rendered.
- At the bottom:
  - Single next chapter → "Continue" button
  - Multiple next chapters → list of clickable choices
  - No next chapters → "The End" indicator
- Forward navigation uses the selected next chapter and appends it to the
  session-local reading path used for Back navigation.
- When the session path has a previous chapter, Back returns to that chapter and
  trims the latest chapter from the path.
- Reader path history is scoped to the current story and resets when opening a
  different story.
- Reader does not edit inline, but the current chapter page has actions to edit
  the chapter or add a child chapter from it.

### Story Editor
- User opens a story in edit mode from the dashboard.
- Edit story title and description at the top.
- Intro chapter panel below with a clear empty state when no intro exists.
- When a story has no chapters, the editor offers an "Add Intro Chapter"
  action that opens a separate intro chapter creation page.
- Once the introductory chapter exists, new chapters are added from an
  existing parent chapter page, not from the top-level story editor.
- Each chapter can be edited (title + content) in a separate form view.
- Chapter editor is only for editing the selected chapter's title and content.
- Chapter creation uses the same document-first writing surface as chapter
  editing: the new chapter's title is edited inline as the document heading,
  and the markdown editor gets most of the available page space.
- Chapter creation collects title and markdown content, lets the user toggle
  between writing and markdown preview in the same document column, creates
  either the intro chapter or a child linked to the selected parent chapter,
  then opens the new chapter for editing.
- Chapter creation keeps the create action reachable in a sticky toolbar and
  may show lightweight writing metadata such as word count, but it does not bind
  `Ctrl+S`/`Cmd+S` to the one-time create action.
- Chapter creation uses draft-oriented status language before a chapter exists,
  such as empty, not-created, creating, and failure states rather than saved
  states.
- If the user changes the draft title or content before creating the chapter,
  leaving the chapter creation page asks for confirmation before discarding the
  draft.
- Chapter creation requires a non-empty title but allows empty content, so
  writers can create branch structure before drafting prose.
- Chapter creation uses the same title and content placeholders for intro and
  child chapters: "Untitled chapter" and "Write this chapter in markdown...".
- Child chapter creation provides a stable action back to the parent chapter and
  a stable action back to the story editor. Intro chapter creation provides a
  stable action back to the story editor. Parent/story context belongs in the
  toolbar rather than inside the document body.
- Child chapter creation immediately links the new child to the selected parent
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
- Creating a child chapter from a parent chapter immediately links the new
  chapter to that parent.
- Cycles are rejected: a chapter cannot be its own ancestor.

## Backlog (Future)
- AI-assisted writing
- Story/chapter export
- Offline sync
- Visual chapter graph
- Reader path history view for longer sessions
