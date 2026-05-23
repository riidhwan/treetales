---
name: design-grill
description: Challenge UI/UX plans against the project's owned design guide, ask before inventing visual language, and keep docs/design/style-guide.md, docs/design/implementation.md, and docs/design/decisions synchronized as design and implementation standards settle.
---

# Design Grill

Use this skill when work involves UI/UX, visual design, product surface
language, interaction patterns, design implementation rules, responsive
behavior, content voice, or style-guide evolution.

The goal is not to make every UI task slower. The goal is to prevent unstated
design assumptions from becoming product rules by accident.

## Core Workflow

1. Read repository instructions first, especially `AGENTS.md`.
2. Discover existing design authority before asking the user:
   - `docs/design/style-guide.md`
   - `docs/design/implementation.md`
   - project docs named by repository instructions
   - existing UI code only after docs, to verify current practice
3. If `docs/design/style-guide.md` does not exist, create it lazily when the
   first design decision needs to be recorded. Use
   [STYLE-GUIDE-FORMAT.md](./STYLE-GUIDE-FORMAT.md).
4. If existing design docs already exist, synthesize the first owned
   `docs/design/style-guide.md` from them. Do not copy them wholesale. Preserve
   settled design decisions, trim implementation noise, and ask before seeding
   conflicting rules.
5. If implementation contracts are already documented elsewhere, move or
   summarize them into `docs/design/implementation.md` when establishing a
   project-owned design standard. Keep reusable UI/UX rules in the style guide
   and concrete token, primitive, component, and verification contracts in the
   implementation document. Use
   [IMPLEMENTATION-FORMAT.md](./IMPLEMENTATION-FORMAT.md) when creating it from
   scratch.
6. For UI work covered by the owned style guide, use the guide as the basis and
   proceed.
7. For UI work not covered by the owned style guide, interview the user before
   inventing a new reusable visual or interaction rule.
8. After each settled reusable design decision, update
   `docs/design/style-guide.md` immediately. Do not batch style-guide updates.
9. After each settled implementation contract for tokens, primitives, component
   boundaries, or verification, update `docs/design/implementation.md`
   immediately.
10. Offer a design decision record only when the decision crosses the threshold
   below. Use [DESIGN-DECISION-FORMAT.md](./DESIGN-DECISION-FORMAT.md).
11. After completing an implementation that used this skill, summarize the
    design impact in the final response. Include which existing components or
    primitives were used, whether any new component or generic primitive was
    created, which surface/pattern rules were applied, and whether any design
    docs or implementation contracts changed.

## Asking Rules

Ask one question at a time and wait for the answer before continuing. Every
question must include your recommended answer and the reasoning for it.

When the user asks broadly how to handle styling, layout, UI treatment, or
interaction design, include the concrete recommended treatment by default. Do
not wait for a follow-up before naming the surface, hierarchy, controls,
responsive behavior, and notable states. Keep the answer scoped to the current
decision and avoid recording route-specific implementation details in design
docs unless they establish a reusable rule.

Ask before proceeding when the work introduces or changes:

- a visual pattern not covered by `docs/design/style-guide.md`
- an interaction pattern, workflow structure, or navigation behavior
- a semantic color, typography role, surface type, spacing/radius/elevation
  rule, icon convention, or content voice rule
- a contradiction between owned design docs, project docs, and existing UI code
- a deliberate exception to the style guide
- a recommendation to replace an existing guide rule with a better approach

Proceed without asking when the work is:

- direct application of an existing documented rule
- a bug fix restoring documented behavior
- a small consistency cleanup with no new design decision

If a question can be answered by reading docs or code, read first and ask only
for the unresolved design choice.

## Challenge Behavior

When the user proposes UI work, stress-test it against concrete scenarios:

- Which user workflow owns this surface?
- What object or task should visually dominate?
- Is this a reusable pattern or a one-off layout?
- Does the proposed treatment conflict with existing surface, action, or voice
  rules?
- What happens on mobile, loading, empty, disabled, error, and destructive
  states?
- Does the copy clarify scope, especially for destructive or irreversible
  actions?
- Is the recommendation changing a product rule, or just implementing one?

If a better approach appears to conflict with the guide, say so directly,
explain the trade-off, recommend a path, and ask before changing the rule.

## Style Guide Updates

`docs/design/style-guide.md` is the skill-owned design source of truth. Keep it
concise and rule-like.

Record:

- reusable design principles
- product or experience modes
- semantic visual roles
- surface patterns
- action and control conventions
- interaction-state requirements
- responsive standards
- content voice rules
- open questions

Do not record:

- one-off component implementation details
- exact utility-class recipes unless they express a reusable design rule
- temporary copy
- route-specific layout trivia
- broad component API contracts that belong in `docs/design/implementation.md`

When an implementation contract changes, update
`docs/design/implementation.md` as well as the owned style guide if both are
affected.

## Design Decision Records

Create `docs/design/decisions/000N-slug.md` only when all of these are true:

1. Hard to reverse visually, structurally, or across multiple screens.
2. Surprising without context.
3. The result of a real trade-off between plausible alternatives.
4. Likely to affect multiple screens, workflows, or future UI work.

Skip a decision record for ordinary style-guide additions, applying an
existing pattern, or one-screen layout choices.

Number decisions by scanning `docs/design/decisions/` for the highest existing
number and incrementing by one.
