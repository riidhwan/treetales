# Typed English Copy Catalog

TreeTales will centralize TreeTales-owned English UI copy, accessibility labels,
TypeScript-owned route metadata, hook display messages, and Prompt Builder
templates in a typed `src/copy/` Copy Catalog organized by feature area. We
chose this over leaving copy scattered in components because copy ownership and
reviewability were becoming unclear, and over adding a full i18n library because
TreeTales does not yet have translated locale bundles or runtime locale
switching requirements.

## Consequences

- Copy modules export nested typed objects and full-sentence functions for
  dynamic text rather than string-key `t()` lookups.
- React components and hooks may import Copy Catalog entries for user-visible
  text; services stay free of UI copy.
- User-authored content and the built-in example Story remain content, not UI
  copy, unless localized seeded content becomes a separate feature.
- Static manifest metadata remains in `public/manifest.json` until TreeTales
  needs a generation step.
- The initial migration may be one explicitly approved larger mechanical PR
  because splitting would create repeated churn across the same copy surfaces.
