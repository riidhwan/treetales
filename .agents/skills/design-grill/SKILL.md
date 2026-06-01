---
name: design-grill
description: Challenge UI/UX plans against the project's owned design guide, ask before inventing visual language, and keep docs/design/style-guide.md, docs/design/implementation.md, and docs/design/decisions synchronized as design and implementation standards settle.
---

# Design Grill

Use this skill when work involves UI/UX, visual design, product surface
language, interaction patterns, design implementation rules, responsive
behavior, content voice, or style-guide evolution.

The goal is to prevent unstated design assumptions from becoming product
rules by accident. When a design plan is still forming, relentlessly interview
the user until the plan is explicit enough that later implementation work
does not proceed by mere assumption.

This skill is an interview and design-contract gate first. Loading this skill
does not imply permission to edit product UI, docs, or tests. Implementation
may start only after the user has explicitly accepted the compact
implementation contract produced by this workflow, or after the user has
explicitly said to implement a previously settled contract.

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
6. Build an evidence map before interviewing:
   - Answer every question that can be answered by repository instructions,
     design docs, product docs, architecture docs, existing routes/components,
     tests, or current UI implementation.
   - Cite the local source of each answered point in your working notes or
     response when it affects the recommendation.
   - Do not ask the user to decide facts the codebase or docs already settle.
7. For UI work covered by the owned style guide, still interview before
   implementation. Use the guide to answer settled facts and to form
   recommendations, then ask the user to confirm the remaining judgment calls.
8. For UI work not covered by the owned style guide, interview the user before
   inventing a new reusable visual or interaction rule.
9. After each settled reusable design decision, update
   `docs/design/style-guide.md` immediately. Do not batch style-guide updates.
10. After each settled implementation contract for tokens, primitives, component
   boundaries, or verification, update `docs/design/implementation.md`
   immediately.
11. Offer a design decision record only when the decision crosses the threshold
   below. Use [DESIGN-DECISION-FORMAT.md](./DESIGN-DECISION-FORMAT.md).
12. Before implementation, restate the agreed plan as a compact implementation
    contract only after the full one-topic-at-a-time interview is complete:
    owned workflow, surface hierarchy, visual treatment, interaction states,
    responsive behavior, copy/content rules, reusable components or primitives,
    docs to update, and verification. Mark every item as sourced from docs/code
    or explicitly user-approved. Ask the user to approve this contract before
    editing product files.
13. After completing an implementation that used this skill, summarize the
    design impact in the final response. Include which existing components or
    primitives were used, whether any new component or generic primitive was
    created, which surface/pattern rules were applied, and whether any design
    docs or implementation contracts changed.

## Asking Rules

Ask one question at a time and wait for the answer before continuing. Every
question must include your recommended answer and the reasoning for it. The
recommended answer should be concrete enough that the user can accept it as the
decision, not just a vague direction.

The interview must be a real sequential interview, not a bundled plan approval.
Do not present a multi-bullet list of intended changes and ask the user to
approve all of it. Do not compress unresolved topics into a single "approve
this contract?" question. The contract approval question happens only after the
user has answered each implementation-relevant topic below, or after a topic has
been explicitly marked not applicable with evidence.

Each interview question must use
[INTERVIEW-QUESTION-FORMAT.md](./INTERVIEW-QUESTION-FORMAT.md).

After the user answers, briefly record the decision for that topic and ask the
next unresolved topic question. If the user's answer changes the direction,
adapt later questions to that answer instead of returning to the original plan.
If the user says "agree", "approved", or similar, treat that as approval only
for the current question unless the user explicitly says to approve the whole
remaining interview.

Do not implement while interviewing. Reading files, searching code, and
inspecting current behavior are allowed because they improve the interview.
Editing application code, design docs, tests, generated files, screenshots, or
visual assets is not allowed until the user approves the final implementation
contract. If the user asks for a design-grill pass and an implementation in the
same message, run the interview first and stop at the approval question.

Before asking any question:

- Search or read the relevant docs and code if they can plausibly answer it.
- Convert discovered facts into recommendations rather than asking the user to
  restate them.
- Ask only for unresolved judgment calls, trade-offs, missing product intent,
  or deliberate exceptions.
- If the docs/code conflict, describe the conflict, recommend which authority
  should win, and ask for confirmation.

Keep interviewing until the plan covers all implementation-relevant aspects.
Do not stop after the first answer if later implementation would still require
guessing. When several aspects are tightly coupled, one question may cover them
only if it names those aspects explicitly, explains why they are coupled, and
the user's answer can settle all of them without ambiguity.

The interview must resolve, or explicitly mark as not applicable:

- target user workflow and success criteria
- primary object, task, or information hierarchy
- route/page/region ownership and navigation implications
- reusable pattern versus one-off treatment
- visual surface, density, spacing, radius, elevation, and border treatment
- typography roles and content hierarchy
- semantic color and status treatment
- iconography and control conventions
- input, hover, focus, active, selected, disabled, loading, empty, error,
  success, destructive, and permission-denied states
- responsive behavior across mobile, tablet, desktop, and unusually narrow or
  wide containers
- accessibility expectations beyond defaults, including keyboard flow, focus
  visibility, labels, contrast, and reduced-motion behavior when relevant
- content voice, labels, helper text, and destructive/irreversible copy
- data dependencies, latency expectations, optimistic behavior, and failure
  recovery when they affect the UI
- component or primitive reuse, extension, or creation
- documentation updates and verification steps

When an answer closes several related concerns, summarize the resolved items
and continue with the next unresolved concern as a new question. Do not jump
from that summary straight to the final implementation contract while any item
in the interview checklist remains unresolved.

When the user asks broadly how to handle styling, layout, UI treatment, or
interaction design, include the concrete recommended treatment by default. Do
not wait for a follow-up before naming the surface, hierarchy, controls,
responsive behavior, and notable states. Keep the answer scoped to the current
decision and avoid recording route-specific implementation details in design
docs unless they establish a reusable rule.

Ask before proceeding with the design contract when the work introduces or
changes:

- a visual pattern not covered by `docs/design/style-guide.md`
- an interaction pattern, workflow structure, or navigation behavior
- a semantic color, typography role, surface type, spacing/radius/elevation
  rule, icon convention, or content voice rule
- a contradiction between owned design docs, project docs, and existing UI code
- a deliberate exception to the style guide
- a recommendation to replace an existing guide rule with a better approach

After the interview gate is complete and the compact contract is approved, the
agent may proceed without asking additional design questions when the remaining
work is:

- direct application of an existing documented rule
- a bug fix restoring documented behavior
- a small consistency cleanup with no new design decision

If a question can be answered by reading docs or code, read first and ask only
for the unresolved design choice.

Never let implementation begin with placeholders such as "use the usual
layout," "standard states," "make it consistent," or "handle mobile normally"
unless those terms are backed by specific local docs/code references or have
just been defined in the interview.

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
