# Design Implementation Format

`docs/design/implementation.md` is the project-owned implementation companion
to `docs/design/style-guide.md`. Keep it concrete, current, and focused on how
the design language becomes code.

## Template

```md
# Design Implementation

{One or two sentences describing how this project implements the design
standard.}

## Approach

- {Framework, styling approach, and abstraction posture.}

## Tokens and Assets

- {Semantic token, asset, font, icon, or theme implementation contract.}

## Component Layers

- `{path}`: {ownership rule}

## Primitives

**{Primitive name}**:
{When to use it, what it owns, and what callers own.}

## Implementation Rules

- {Concrete code rule for applying the design standard.}

## Verification

- {Checks required for UI/styling/design implementation changes.}
```

## Rules

- Keep reusable UI/UX decisions in `docs/design/style-guide.md`.
- Keep concrete tokens, primitives, component boundaries, asset usage, and
  verification contracts here.
- Prefer repository paths and ownership rules over broad component-library theory.
- Link to product, architecture, or coding-convention docs when they own a rule.
