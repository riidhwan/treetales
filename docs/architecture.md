# Architecture

React 19 + TanStack Start (React Router) + Tailwind CSS v4 + TypeScript strict mode. Client-side only — no server, no backend. IndexedDB for all persistence via a thin service layer.

The app is installable as a basic PWA. `public/manifest.json` owns install
metadata, `public/sw.js` provides the service worker, and `src/pwa.ts` registers
it on the production client. In development, `src/pwa.ts` unregisters local
TreeTales service workers and clears their caches so Vite modules are never
served from stale PWA storage. The service worker caches the app shell and
static assets only; story persistence remains browser-local IndexedDB, with no
cross-device offline sync.

## Layer-First Structure

```
src/
├── routes/           # Thin TanStack Router file routes
├── components/       # See component layers below
├── hooks/            # Feature state/effects extracted from UI components
├── services/         # Data access layer
├── lib/              # Shared pure utilities and boundary helpers
├── test/             # Shared test-only helpers
└── styles.css        # Global Tailwind CSS imports and base styles
```

There is currently no `src/store/`. Feature components and hooks own their
loading, form, and error state locally. Add a store only when state is genuinely
shared across unrelated route or feature boundaries.

There is currently no `src/config.ts`. Add one only when tuneable constants are
needed. Until then, keep isolated copy, labels, and one-off layout values close
to the component or module that owns them.

## Optional `src/config.ts` — Tuneable Constants

If introduced, `src/config.ts` should hold named constants for values that are
likely to be adjusted over time or that would otherwise be buried inside a
component. When adding a new magic number or threshold, prefer defining it there
over inlining it if it meets any of these criteria:

- It controls user-facing behaviour (timing, counts, limits)
- It might need tuning
- It is referenced in more than one place

## Component Layers

`components/` currently has two required sublayers:

| Sublayer | Rule | Examples |
|---|---|---|
| `ui/` | Generic, zero business logic, reusable anywhere | `Alert`, `Button`, `MarkdownContent`, `MarkdownEditor`, `TextArea`, `TextInput` |
| `features/` | Composite feature UI that wires hooks, services, navigation callbacks, and UI primitives into a full user-facing unit | `StoryDashboard`, `StoryEditor`, `StoryReader` |

There is currently no `components/domain/`. Add it only when a business-aware
component is self-contained enough to be shared by more than one feature without
owning feature state or service calls.

A component that calls feature hooks, owns workflows, or coordinates services
belongs in `features/`. Generic HTML wrappers and styling primitives belong in
`ui/`.

## Hooks Layer (`src/hooks/`)

Feature hooks own async effects, form state, derived state, confirmation flows,
and service dependency injection for testability. Current hooks are feature
specific:

| File | Responsibility |
|---|---|
| `useStoryDashboard.ts` | Loads story summaries, creates stories/example content, deletes stories, and exposes dashboard form state |
| `useStoryEditor.ts` | Loads editor data, resolves the intro chapter, and saves story fields |
| `useChapterEditor.ts` | Loads one chapter and saves chapter fields |
| `useChapterCreator.ts` | Loads story or parent chapter context and creates intro or child chapters from title + content |
| `useStoryReader.ts` | Loads reader data, tracks the selected chapter, and exposes navigation options |

Hooks depend on the service layer through small service interfaces with default
implementations. Tests can pass fake services without mocking IndexedDB.

## Shared Utilities (`src/lib/`)

`src/lib/` contains pure helpers and system-boundary normalizers:

| File | Responsibility |
|---|---|
| `errors.ts` | Converts unknown thrown values into displayable error messages |
| `sorting.ts` | Shared deterministic sort helpers |
| `utils.ts` | General utility helpers, currently class-name composition via `cn()` |

## Data Model

```
Story {
  id: string          // crypto.randomUUID()
  title: string
  description: string
  createdAt: number   // Date.now()
  updatedAt: number
}

Chapter {
  id: string
  storyId: string     // FK → Story.id
  title: string
  content: string     // markdown text rendered by the UI
  parentChapterId: string | null  // chapter that branches TO this one, or null for the intro
  createdAt: number
  updatedAt: number
}
```

Chapter content stays a plain `string` in IndexedDB and service contracts. The
reader and chapter authoring views interpret that string as markdown using
common markdown, GFM extensions, and single-newline breaks; raw HTML is not
rendered.

## Services Layer (`src/services/`)

Thin wrappers around IndexedDB transactions. No state, no caching — components call services directly and manage their own loading/error state.

| File | Responsibility |
|---|---|
| `storyDb.ts` | Story CRUD: create, getAll, getById, update, delete |
| `chapterDb.ts` | Chapter CRUD: create, getById, getByStoryId, getIntroChapterByStoryId, update, delete; + getNextChapters(chapterId) |
| `exampleStory.ts` | Creates or returns the built-in example story and its chapters |
| `types.ts` | Shared service data shapes and create/update input contracts |
| `db.ts` | IndexedDB schema constants, upgrade path, typed request helpers, and transaction helpers |

Story and chapter records are created with `crypto.randomUUID()` ids and
`Date.now()` timestamps. Updates preserve `createdAt` and refresh `updatedAt`.
Deleting a story deletes all chapters for that story. Deleting a chapter clears
that chapter id from the `parentChapterId` of direct child chapters in the same
story.

Chapter writes enforce basic graph integrity before committing:

- `storyId` must reference an existing story
- non-null `parentChapterId` values must reference a chapter in the same story
- a chapter cannot parent itself
- parent relationships cannot create cycles

## IndexedDB Schema

Single database `TreeTales` with two object stores:

- **`stories`** — keyed by `id`
- **`chapters`** — keyed by `id`, indexed on `storyId` and on
  `parentChapterId` for next-chapter lookups

Version bumps happen when adding/modifying stores. See `src/services/db.ts` for the upgrade path.

## Test Helpers (`src/test/`)

Shared test-only helpers live in `src/test/` when they remove repeated setup
across service, hook, route, or component tests. The current helper installs and
resets a fake IndexedDB database for service tests. Keep these helpers small and
specific to test infrastructure; production code should not import from
`src/test/`.
