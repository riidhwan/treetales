# Design Decision Format

Design decision records live in `docs/design/decisions/` and use sequential
numbering: `0001-slug.md`, `0002-slug.md`, and so on.

Create this directory lazily, only when the first qualifying decision is
needed.

## Template

```md
# {Short title}

## Context

{What design problem or conflict forced a decision?}

## Decision

{What did we choose?}

## Alternatives Considered

- {Alternative}: {why it was not chosen}

## Consequences

- {Important positive or negative effect}

## Status

Accepted
```

## When to Create One

Create a design decision record only when the decision is:

- hard to reverse visually, structurally, or across multiple screens
- surprising without context
- the result of a real trade-off between plausible alternatives
- likely to affect multiple screens, workflows, or future UI work

If the decision is an ordinary reusable rule, put it in
`docs/design/style-guide.md` instead.
