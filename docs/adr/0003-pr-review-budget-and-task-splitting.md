# PR Review Budget and Task Splitting

TreeTales uses an explicit PR review budget so contributors split work before it becomes too large to review confidently. Normal feature PRs target no more than 800 changed lines and 3 architectural layers; larger work must either be decomposed into issue-backed reviewable slices or receive explicit pre-approval with a documented reason and split alternative.

## Consequences

- Agents must estimate change size before implementation and compare actual PR size before opening a PR.
- Tests count toward review size because they are part of the review surface.
- New persisted concepts should usually split by architectural layer first: domain/docs plus persistence/service foundation, then hook/UI integration, then follow-up polish or downstream integration.
- Foundation PRs may be inactive when they are directly tested, not user-visible, and tied to a named follow-up sub-issue.
