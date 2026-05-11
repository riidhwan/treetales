# Product Behaviour

## MVP User Flows

### Story Dashboard (Home)
- User arrives at the home page and sees a list of their stories (or an empty state).
- "New Story" button opens a form for title + description.
- After creating a story, user is redirected to the story editor.
- Each story card has: title, description, chapter count, and actions (Read, Edit, Delete).
- Delete shows a confirmation dialog before removing.

### Story Reader
- User opens a story from the dashboard and lands on the first chapter.
- Chapter displays title and content.
- At the bottom:
  - Single next chapter → "Continue" button
  - Multiple next chapters → list of clickable choices
  - No next chapters → "The End" indicator
- Breadcrumb trail shows reading path; user can go back to previous chapters.
- Reader is read-only — no editing in this view.

### Story Editor
- User opens a story in edit mode from the dashboard.
- Edit story title and description at the top.
- Chapter list below with "Add Chapter" button.
- Each chapter can be edited (title + content) in a separate form view.
- Chapter editor includes a branch-linker: checkboxes to select which chapters lead TO this chapter.
- A tree view shows the story's branching structure.

### Branching Rules
- The first chapter created in a story is the introductory chapter (no parents).
- A chapter can have zero, one, or multiple parent chapters.
- A chapter can be the parent of zero, one, or multiple other chapters.
- Cycles are rejected: a chapter cannot be its own ancestor.

## Backlog (Future)
- AI-assisted writing
- Rich text editing
- Story/chapter export
- PWA / offline sync
- Visual chapter graph
