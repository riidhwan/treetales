# Browser-local IndexedDB persistence

TreeTales uses direct browser-local IndexedDB persistence behind repository and
service boundaries for its production Story and Chapter data. The app remains
local-only with no backend or cross-device sync; IndexedDB is selected because
it keeps dashboard-first persistence lightweight and avoids making a database
engine payload dominate initial story loading.

## Considered Options

- Direct IndexedDB APIs: selected because they are built into the browser,
  already fit the small Story and Chapter model, and are hidden behind the
  repository boundary.
- PGlite with plain SQL: rejected after implementation validation because it
  required an approximately 8.7MB WASM/runtime download before users could use
  production persistence.
- IndexedDB wrapper library: deferred until repository complexity grows enough
  to justify adding another dependency.

## Consequences

- Browser-local persistence remains private to the current browser profile and
  has no automatic cross-device sync.
- The repository boundary is the persistence abstraction; services and UI should
  not call IndexedDB directly.
- Short-lived pre-production PGlite data does not need an automatic migration
  path back to IndexedDB.
- The IndexedDB schema preserves the current **Story** and **Chapter** model,
  including story deletion cleanup, parent clearing on chapter deletion, and at
  most one **Intro Chapter** per **Story**.
