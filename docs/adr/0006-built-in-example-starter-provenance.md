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
- Example Story Copy identity and Story Provenance should live on the Saved
  Story record because they share the Story lifecycle. A separate provenance or
  copy-metadata store would add lifecycle joins without an independent domain
  lifecycle.
- Story Provenance should persist structured source facts and the user-visible
  provenance wording captured when the Example Story Copy is created. The
  structured facts preserve future audit and richer display options, while the
  captured wording prevents later copy changes from rewriting historical local
  copies.
- Structured Story Provenance should allow one or more Source Works even though
  each initial Built-in Example Story uses one Source Work.
- Example Story Copy reuse should match on the persisted Built-in Example Story
  identity, not on local Story ids, titles, descriptions, or provenance wording.
  Legacy fixed ids from the previous single-example flow should not become the
  matching strategy for the new starter catalog.
- Existing local copies of the previous Lantern Road example should remain
  ordinary Saved Stories. They should not be retroactively marked as Example
  Story Copies because Lantern Road is not part of the initial Source Work
  backed starter catalog.
- Later changes to a Built-in Example Story definition must not merge into,
  repair, replace, or otherwise rewrite an existing Example Story Copy.
- Choosing the same Built-in Example Story should reuse the existing Example
  Story Copy unless TreeTales later adds a general duplicate-story action.
- Deleting an Example Story Copy removes the local relationship to its Built-in
  Example Story. Choosing that Built-in Example Story later should create a
  fresh Example Story Copy from the then-current starter definition.
