# Built-in example starter provenance

Built-in Example Stories are shown as starter content before they become Saved
Stories. TreeTales will keep built-in examples as starter metadata, create or
reuse an editable Example Story Copy only when a user chooses one, and preserve
that example's Story Provenance on the saved copy so the source context remains
available even if starter definitions change later.

## Considered Options

- Auto-seed examples into the local library: rejected because it pollutes Saved
  Stories before the user chooses them and makes deletion/reappearance rules
  ambiguous.
- Read-only example preview: rejected because it introduces a second story
  lifecycle and permission model.
- Starter metadata with editable local copies: selected because it keeps the
  first-run Library Mode populated while preserving the boundary between
  TreeTales-provided starters and the user's Saved Stories.

## Consequences

- Story Provenance must be persisted on Example Story Copies rather than only
  referenced from the starter definition.
- Choosing the same Built-in Example Story should reuse the existing Example
  Story Copy unless TreeTales later adds a general duplicate-story action.
