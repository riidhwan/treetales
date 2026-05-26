# Character Illustration hybrid storage

TreeTales stores Character Illustration metadata in IndexedDB and stores the
image bytes as origin-private file content. This keeps searchable authored data
inside the existing repository model while avoiding large image blobs inside
Character records or IndexedDB object records. Character Illustration import
defaults to normalized image files for quota-friendly local storage, with an
explicit original-quality option that preserves the uploaded file bytes when the
user chooses exact preservation.

## Considered Options

- IndexedDB-only storage: rejected because large image blobs would make the
  authored-data database heavier to migrate, inspect, and clean up.
- Origin Private File System-only storage: rejected because Character
  Illustrations still need queryable metadata, ordering, and lifecycle
  relationships with Stories and Characters.
- Hybrid IndexedDB metadata plus origin-private file content: selected because
  metadata remains transactional with TreeTales authored data while image bytes
  use file-shaped browser storage.

## Consequences

- The service and repository boundary must coordinate metadata writes, file
  writes, and cleanup so UI code does not call browser storage APIs directly.
- Character and Story deletion must remove both Character Illustration metadata
  and stored image files.
- Future Story export/import must bundle Character Illustration metadata and
  image files together rather than exporting only JSON.
