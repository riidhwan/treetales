# Architecture

> Add tech stack and deployment target once chosen.

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

## Key Modules

*To be updated*
