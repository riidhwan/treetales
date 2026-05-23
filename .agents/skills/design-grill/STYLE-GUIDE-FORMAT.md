# Design Style Guide Format

`docs/design/style-guide.md` is the project-owned design guide managed by the
`design-grill` skill. Keep it concise, durable, and useful during UI work.

## Template

```md
# Design Style Guide

{One or two sentences describing the product/interface standard.}

## Source References

- `{path}`: {why this source matters}

## Design Principles

- {Durable product or visual principle.}

## Product / Experience Modes

**{Mode name}**:
{What kind of work this mode supports and what it should prioritize.}

## Visual Foundations

### Color

- {Semantic color role and its intended use.}

### Typography

- {Typography role and its intended use.}

### Spacing, Radius, and Elevation

- {Reusable spacing, containment, radius, or elevation rule.}

### Icons and Imagery

- {Reusable icon or image rule.}

## Surface Patterns

**{Surface name}**:
{When to use it and what it should protect.}

## Actions and Controls

- {Action or control convention.}

## Interaction States

- {Focus, hover, active, disabled, loading, empty, error, or destructive rule.}

## Responsive Rules

- {Responsive behavior that should remain stable across surfaces.}

## Content Voice

- {Vocabulary, tone, labeling, or copy rule.}

## Open Questions

- {Unresolved design choice, phrased as a question.}
```

## Rules

- Prefer stable design language over implementation details.
- Keep rules specific enough for an agent to apply without guessing.
- Link to older or external docs as source references instead of duplicating
  everything.
- Move lengthy implementation contracts to the project's design-system docs.
- Remove an open question once the answer is recorded as a rule or decision.
