---
name: github-issues
description: Use when creating or editing GitHub issues, decomposing work into parent issues and sub-issues, starting issue-backed work, opening issue-backed PRs, managing blocking relationships, or auditing issue relationships before handoff.
---

# GitHub Issues

Use this skill for issue creation, issue decomposition, issue-backed implementation, PRs for issue-backed work, native sub-issue relationships, native blocking relationships, and final relationship audits.

## Core Rules

- GitHub-native relationships are the source of truth.
- Use native sub-issues for work that is part of a larger goal.
- Use native blocked-by/blocking relationships for real sequencing dependencies.
- Do not substitute issue-body prose, checklists, or `Refs #N` links for native relationships when native relationships are needed.
- If a required native relationship cannot be created, read, or verified through available GitHub tooling, stop and report the limitation. Include the exact relationship that must be created manually.
- Link ADRs and relevant docs from issues when they constrain the work. If none apply, say `None identified`.
- Keep each sub-issue independently reviewable and able to leave `master` buildable, testable, deployable, and safe for normal users.

## Choose a Mode

### Creation or Decomposition

Use when the user asks to create issues, break work down, plan a larger change, or add blockers.

1. Decide whether the work is standalone or needs a parent issue.
2. Use a parent issue for an initiative, migration, feature set, broad refactor, risky behaviour change, persistence/data-flow change, or architectural change.
3. Use native sub-issues for independently shippable slices. Keep tiny same-PR tasks as checklist items.
4. Use native blocking relationships only for hard dependencies, not preference ordering.
5. Add ADRs/docs in `Related Decisions` where applicable.
6. Verify the issue graph after creation: parent/sub-issue links and blocked-by/blocking links.

### Issue Work

Use when the user asks to implement, fix, review, branch, commit, push, or open a PR for an existing issue.

Before implementation:

1. Inspect the target issue body, labels, state, comments, and checklist.
2. Inspect the parent issue, if any.
3. Inspect child/sub-issues if the target is a parent or belongs to a parent.
4. Inspect native blocked-by/blocking relationships.
5. Inspect linked PRs, branches, and recent commit context when visible.
6. Read ADRs explicitly linked from the issue, parent issue, comments, or PR.
7. If no ADR is linked but the work touches architecture, persistence, routing, data flow, feature flags, or workflow policy, inspect `docs/adr/` and decide whether any apply.
8. Read relevant repository docs named by `AGENTS.md` for the area being changed.
9. State the big picture before editing: parent goal, this issue's slice, blockers, and related ADRs.

Do not start implementation if a blocking issue is unresolved and the current work cannot safely proceed.

## Relationship Rules

Use sub-issues for "part of" relationships:

- Parent: end goal, context, constraints, completion criteria.
- Sub-issue: an independently reviewable work slice.

Use blocked-by/blocking for "must happen first" relationships:

- A sub-issue can be blocked by a sibling sub-issue.
- A standalone issue can block or be blocked by another standalone issue.
- A parent can have dependency notes, but native blocking relationships should still identify the issues that create the dependency.

Use both relationships when both are true.

## Templates

### Parent Issue

```markdown
## Outcome

What should be true when the whole initiative is done.

## Context

Why this matters, relevant constraints, and links to ADRs/docs.

## Scope

What is included.

## Out of Scope

What is intentionally excluded.

## Slices

Native sub-issues are the source of truth. Use this section only to explain the planned decomposition.

## Dependencies

Native blocked-by/blocking relationships are the source of truth. Summarize only when helpful.

## Review Size

Estimated files:
Estimated changed lines:
Architectural layers:
Fits normal PR budget:
Split plan:

## Completion Criteria

What must be true before closing the parent.
```

### Sub-Issue or Standalone Work Issue

```markdown
## Outcome

What this slice changes.

## Parent Context

Parent issue and the larger goal in one or two sentences. Use `Not applicable` for standalone issues.

## Related Decisions

Linked ADRs/docs that constrain the work, or `None identified`.

## Scope

What this issue includes.

## Out of Scope

What this issue must not touch.

## Dependencies

Native blocked-by/blocking relationships are the source of truth. Summarize only when helpful.

## Review Size

Estimated files:
Estimated changed lines:
Architectural layers:
Fits normal PR budget:
Split plan:

## Verification

Commands, checks, or review evidence expected before completion.
```

## Handoff Audit

Before reporting completion for issue-backed work, check and state:

- Whether the issue is a parent, sub-issue, or standalone issue.
- Whether all required native sub-issue relationships exist.
- Whether all required native blocked-by/blocking relationships exist.
- Whether linked ADRs/docs were followed or updated.
- Whether any follow-up issue is needed.
- Whether the parent issue can close, must stay open, or needs updated completion criteria.

Do not post issue completion comments while changes are only local and unpushed. Draft the exact comment for the user when useful.
