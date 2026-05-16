# Browser-local PGlite persistence

TreeTales uses browser-local PGlite persistence, accessed through PGlite's multi-tab worker and plain SQL, for its production Story and Chapter services. The app remains local-only with no backend or cross-device sync; PGlite is chosen to make the persistence model relational and easier to evolve, while accepting the WASM/runtime cost and the fact that browser persistence still sits on local browser storage.

## Considered Options

- Direct IndexedDB APIs: already implemented, but lower-level and less aligned with the relational story/chapter model.
- PGlite with plain SQL: selected for relational constraints, explicit schema, and low abstraction overhead.
- PGlite with an ORM/query builder: deferred until the schema grows enough to justify the extra dependency.

## Consequences

- PGlite runs behind the multi-tab worker to avoid main-thread database work and handle the single-connection constraint across tabs.
- Existing pre-production IndexedDB data does not need an automatic migration path.
- The SQL schema preserves the current **Story** and **Chapter** model, including cascading story deletion, parent clearing on chapter deletion, and at most one **Intro Chapter** per **Story**.
