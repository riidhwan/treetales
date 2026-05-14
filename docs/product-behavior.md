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
- Chapter displays title and content.
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
- Reader is read-only — no editing in this view.

### Story Editor
- User opens a story in edit mode from the dashboard.
- Edit story title and description at the top.
- Intro chapter panel below with a clear empty state when no intro exists.
- When a story has no chapters, the editor offers an "Add Intro Chapter"
  action that creates the introductory chapter.
- Once the introductory chapter exists, new chapters are added from an
  existing parent chapter page, not from the top-level story editor.
- Each chapter can be edited (title + content) in a separate form view.
- Chapter editor shows the chapter's outgoing child chapters and includes an
  "Add Child Chapter" action that creates a child linked to the current chapter.
- A tree view shows the story's branching structure.

### Installable PWA
- TreeTales can be installed from Android Chrome as a standalone app when served
  from a secure HTTPS deployment.
- The installed app opens at the story dashboard and uses the same browser-local
  IndexedDB story data as the website.
- The app shell and static assets are cached by a service worker for basic
  repeat-load resilience. Offline data sync across devices is not supported.

### Branching Rules
- The first chapter created in a story is the introductory chapter (no parents).
- A chapter can only have zero or one parent chapter.
- A chapter can be the parent of zero, one, or multiple other chapters.
- Creating a child chapter from a parent chapter immediately links the new
  chapter to that parent.
- Cycles are rejected: a chapter cannot be its own ancestor.

## Backlog (Future)
- AI-assisted writing
- Rich text editing
- Story/chapter export
- Offline sync
- Visual chapter graph
- Reader path history view for longer sessions
