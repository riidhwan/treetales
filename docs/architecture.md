# Architecture

React 19 + TanStack Start (React Router) + Tailwind CSS v4 + TypeScript strict mode. Client-side only — no server, no backend. Browser-local persistence through a thin service layer.

The app is installable as a basic PWA. `public/manifest.json` owns install
metadata, `public/sw.js` provides the service worker, and `src/pwa.ts` registers
it on the production client. In development, `src/pwa.ts` unregisters local
TreeTales service workers and clears their caches so Vite modules are never
served from stale PWA storage. The service worker caches the app shell and
static assets only; story persistence remains browser-local, with no cross-device
offline sync.

Bundled reader fonts are static app assets. Third-party font notices and license
references must be kept with the bundled assets or in project documentation when
fonts are added, removed, or updated.

Reader Appearance preferences are browser-local UI preferences stored outside
the Story and Chapter persistence model, such as in `localStorage`. They should
not be added to Story or Chapter records unless they become authored story
content.

Prompt Builder is a client-only authoring aid. It uses static feature-owned
prompt templates and browser clipboard access; it does not call an LLM, require
network access, or persist Rough Plot text in Story or Chapter records.

## Layer-First Structure

```
src/
├── routes/           # Thin TanStack Router file routes
├── components/       # See component layers below
├── hooks/            # Feature state/effects extracted from UI components
├── services/         # Application-facing story/chapter operations
├── repositories/     # Persistence adapters and storage-specific mapping
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

`components/` currently has three required sublayers:

| Sublayer | Rule | Examples |
|---|---|---|
| `ui/` | Generic, zero business logic, reusable anywhere | `Alert`, `Button`, `MarkdownContent`, `MarkdownEditor`, `TextArea`, `TextInput` |
| `domain/` | Business-aware, self-contained components shared by more than one feature without owning feature state or service calls | `ReaderAppearanceControl` |
| `features/` | Composite feature UI that wires hooks, services, navigation callbacks, and UI primitives into a full user-facing unit | `StoryDashboard`, `StoryDetail`, `StoryEditor`, `StoryReader` |

`components/domain/` contains business-aware components that are self-contained
enough to be shared by more than one feature without owning feature state or
service calls, such as reusable Reader Appearance controls.

A component that calls feature hooks, owns workflows, or coordinates services
belongs in `features/`. Generic HTML wrappers and styling primitives belong in
`ui/`.

Feature-owned Prompt Builder templates live beside the chapter authoring
feature because they encode TreeTales authoring language, not generic
interpolation behavior. Template placeholders use double braces such as
`{{roughPlot}}`, `{{draftContent}}`, and `{{parentChapterContent}}`.

## Hooks Layer (`src/hooks/`)

Feature hooks own async effects, form state, derived state, confirmation flows,
and service dependency injection for testability. Current hooks are feature
specific:

| File | Responsibility |
|---|---|
| `useStoryDashboard.ts` | Loads story summaries, creates stories/example content, deletes stories, and exposes dashboard form state |
| `useStoryDetail.ts` | Loads one story for the story landing page and deletes it after confirmation |
| `useStoryEditor.ts` | Loads editor data, resolves the intro chapter, and saves story fields |
| `useChapterEditor.ts` | Loads one chapter and saves chapter fields |
| `useChapterCreator.ts` | Loads story or parent chapter context and creates intro chapters or branches from title + content |
| `useStoryReader.ts` | Loads reader data, tracks the selected chapter, and exposes navigation options |

Hooks depend on the service layer through small service interfaces with default
implementations. Tests can pass fake services without touching IndexedDB.

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

Character {
  id: string
  storyId: string     // FK → Story.id
  name: string
  gender: 'male' | 'female'
  properties: CharacterProperty[] // ordered
  createdAt: number
  updatedAt: number
}

CharacterProperty {
  key: string
  value: string
}
```

Chapter content stays a plain `string` in persistence and service contracts. The
reader and chapter authoring views interpret that string as markdown using
common markdown, GFM extensions, and single-newline breaks; raw HTML is not
rendered.

Character properties are stored as an ordered array on the Character record.
They have no identity or lifecycle outside their Character. Character property
keys and values are plain text, not markdown.

## Services Layer (`src/services/`)

Application-facing story and chapter operations. No React state, no component
caching — components call services directly and manage their own loading/error
state. Services own generated domain fields such as `id`, `createdAt`, and
`updatedAt`, then call repositories to persist the requested domain change.

Active story and chapter service exports are wired to browser-local IndexedDB
repositories. Compatibility exports stay in the service tree only until old
imports are migrated to the correctly named service modules.

| File | Responsibility |
|---|---|
| `storyService.ts` | Active Story service API |
| `storyDb.ts` | Temporary compatibility re-export for existing Story imports |
| `db.ts` | Temporary compatibility re-export for old IndexedDB imports |
| `chapterService.ts` | Active Chapter service API |
| `chapterDb.ts` | Temporary compatibility re-export for existing Chapter imports |
| `exampleStory.ts` | Creates or returns the built-in example story and its chapters |
| `types.ts` | Shared service data shapes and create/update input contracts |

Story and chapter services create records with `crypto.randomUUID()` ids and
`Date.now()` timestamps. Updates preserve `createdAt` and refresh `updatedAt`.
Deleting a story deletes all chapters for that story. Deleting a chapter clears
that chapter id from the `parentChapterId` of direct branches in the same story.

Chapter writes enforce basic graph integrity before committing:

- `storyId` must reference an existing story
- non-null `parentChapterId` values must reference a chapter in the same story
- a chapter cannot parent itself
- parent relationships cannot create cycles

## Repositories Layer (`src/repositories/`)

Persistence adapters for browser-local storage. Repositories own storage
transactions, schema-specific constraints, row-to-domain mapping, and storage
error normalization. They do not own React state, component navigation, or
generation of domain values such as ids and timestamps.

Repository APIs should accept and return domain records or domain patches rather
than exposing storage-shaped rows. Storage-specific names such as `story_id`,
`created_at`, or SQL `RETURNING` details stay inside the repository module.
Repositories may perform partial updates and return the persisted domain record
when storage decides whether the record exists and what the final stored value
is. Services still provide generated values such as `updatedAt` in those
patches.

Repositories normalize expected domain-relevant outcomes at the boundary:
missing reads return `undefined`, missing deletes return `false`, and missing
updates return `undefined`. Unexpected storage failures may still throw while
preserving the original cause.

Shared repository contracts live in `src/repositories/types.ts`. Domain records
and service input types remain in `src/services/types.ts` until there is a
separate reason to move them. Storage-specific implementations live under a
provider directory, such as `src/repositories/indexedDb/`, so connection setup,
upgrades, transaction helpers, and provider-specific repositories stay together.

Current storage-specific repository files include:

| File | Responsibility |
|---|---|
| `indexedDb/db.ts` | Active IndexedDB connection, upgrade, transaction helpers, and legacy parent migration |
| `indexedDb/storyRepository.ts` | Active IndexedDB Story persistence adapter |
| `indexedDb/chapterRepository.ts` | Active IndexedDB Chapter persistence adapter with graph validation |
| `indexedDb/characterRepository.ts` | Active IndexedDB Character persistence adapter |
| `indexedDb/unitOfWork.ts` | Active IndexedDB unit-of-work boundary for multi-repository writes |

Cross-record persistence effects should stay explicit at the service boundary.
For example, Story deletion may coordinate a Story repository with a Chapter
repository operation such as deleting all Chapters for a Story; it should not
hide Chapter cleanup inside the Story repository.

Multi-repository writes should run inside an explicit storage-specific
unit-of-work boundary so related writes commit or fail together. The active
IndexedDB path exposes that boundary through
`createIndexedDbRepositoryUnitOfWork()`, which opens one readwrite transaction
and passes transaction-scoped story and chapter repositories to the service
operation.

Cross-repository service operations such as `deleteStory` should use the
unit-of-work boundary rather than opening storage transactions directly. Do not
add temporary repository methods that hide those cross-record effects.

When renaming an app-facing service, prefer adding the correctly named service
module first and leaving the old `*Db.ts` file as a temporary compatibility
re-export. Migrate first-party imports to the correctly named service in the
same slice when the change is mechanical and contained.

## IndexedDB Schema

The active IndexedDB foundation uses the browser database `TreeTales` and
persists stories in the current browser profile. Existing short-lived PGlite
data does not need an automatic migration path.

The schema is owned by the repository layer:

- **`stories`** — keyed by `id`
- **`chapters`** — keyed by `id`
- **`characters`** — keyed by `id`
- Chapter indexes on `storyId` and `parentChapterId`
- Character index on `storyId`

Deleting a story explicitly deletes its chapters through the service
unit-of-work boundary. Deleting a chapter clears direct children's parent
chapter reference instead of deleting descendants. Deleting a Character removes
its embedded custom properties with it. Chapter write validation rejects missing
stories, missing parents, parents from other stories, self-parenting, multiple
intro chapters for one story, and cycles before committing a mutating chapter
operation. Character writes reject missing stories before committing.

Schema setup and forward upgrades live with the IndexedDB repository
implementation. Repository operations may accept a transaction so standalone
operations and unit-of-work operations share the same adapter code.

## Test Helpers (`src/test/`)

Shared test-only helpers live in `src/test/` when they remove repeated setup
across service, hook, route, or component tests. Production service and
IndexedDB repository tests use the fake IndexedDB helper so object stores,
indexes, transactions, and validation can be exercised directly. Keep these
helpers small and specific to test infrastructure; production code should not
import from `src/test/`.
