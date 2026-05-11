# Architecture

React 19 + TanStack Start (React Router) + Tailwind CSS v4 + TypeScript strict mode. Client-side only — no server, no backend. IndexedDB for all persistence via a thin service layer.

## Layer-First Structure

```
src/
├── routes/           # Routing layer (file-based or otherwise)
├── components/       # See component layers below
├── hooks/            # Complex logic extracted into custom hooks (Logic layer)
├── services/         # Data access layer
├── store/            # Global state
├── lib/              # Shared utilities, pure helpers
└── config.ts         # App-level tuneable constants (see below)
```

## `src/config.ts` — Tuneable Constants

`src/config.ts` holds named constants for values that are likely to be adjusted over time or that would otherwise be buried inside a component. When adding a new magic number or threshold, prefer defining it here over inlining it if it meets any of these criteria:

- It controls user-facing behaviour (timing, counts, limits)
- It might need tuning
- It is referenced in more than one place

## Component Layers

`components/` has three sublayers — placement is determined by how much business knowledge a component needs:

| Sublayer | Rule | Examples |
|---|---|---|
| `ui/` | Generic, zero business logic, reusable anywhere | `Button`, `Input` |
| `domain/` | Business-aware but self-contained — knows domain types and concepts | |
| `features/` | Composite — wires domain components and hooks into a full user-facing unit | |

A component that needs to call hooks belongs in `features/`. A component that only receives typed props (even domain types) belongs in `domain/`.

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
  content: string     // plain text (rich text is backlog)
  parentChapterIds: string[]  // chapters that branch TO this one
  createdAt: number
  updatedAt: number
}
```

## Services Layer (`src/services/`)

Thin wrappers around IndexedDB transactions. No state, no caching — components call services directly and manage their own loading/error state.

| File | Responsibility |
|---|---|
| `storyDb.ts` | Story CRUD: create, getAll, getById, update, delete |
| `chapterDb.ts` | Chapter CRUD: create, getById, getByStoryId, update, delete; + getNextChapters(chapterId) |

## IndexedDB Schema

Single database `TreeTales` with two object stores:

- **`stories`** — keyed by `id`
- **`chapters`** — keyed by `id`, indexed on `storyId`

Version bumps happen when adding/modifying stores. See `src/services/db.ts` for the upgrade path.
