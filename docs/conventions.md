# Conventions

## Task and PR Sizing

Before implementation, estimate the requested change size. For tiny changes,
this can be a one-line forecast. For larger changes, include expected files
touched, architectural layers touched, changed-line range, whether the work fits
the normal PR budget, and a split proposal when it does not fit.

Before opening a PR, report the actual review size: changed files,
additions/deletions, architectural layers touched, whether the PR stayed within
the approved budget, and where any large-PR approval is documented. If the
actual size exceeds the approved plan, stop before opening the PR and ask
whether to split or proceed.

GitHub issue and PR bodies are remote reviewer-facing documents. They should
reference only repository paths, GitHub URLs, uploaded images, CI artifacts, or
other resources a reviewer can access from GitHub. Do not cite local-only paths
such as `/tmp/...`, local screenshots, sandbox files, or machine-specific
locations as evidence in issue or PR text.

Non-trivial issues and PRs must include a `Review Size` section. For issues,
include estimated files, estimated changed lines, architectural layers, whether
the work fits the normal PR budget, and the split plan when needed. For PRs,
include changed files, additions/deletions, architectural layers, whether the PR
stayed within the approved budget, and where any large-PR approval is
documented. Tiny changes may use a one-line Review Size summary.

Normal feature PRs should stay within this review budget:

- No more than 800 changed lines, excluding generated files
- No more than 3 architectural layers touched

Test files count toward changed lines because they are review surface. If tests
alone push a PR over budget, say that explicitly and ask whether to keep the
larger PR or split the work. Do not use "mostly tests" as an automatic reason to
exceed the budget.

Generated files, such as `src/routeTree.gen.ts` and
`docs/navigation-flow.md`, are excluded from the changed-line limit. List
generated files separately in the PR description.

Non-logic prose/content blocks may be reported separately from the changed-line
budget when they do not alter control flow, persistence shape, validation,
navigation, permissions, or user obligations. UI copy, accessibility labels,
Prompt Builder templates, legal/provenance wording, and tests count toward the
changed-line budget unless the PR explicitly reports them as content-only and
explains why they are not behaviour-relevant.

Large built-in story content that is reported outside the changed-line budget
still needs focused provenance review. Each Built-in Example Story should name
its source title, author or collector when known, publication year or source,
the basis for U.S. public-domain use, and a short adaptation note.

If a planned change is likely to exceed any of these limits, split the task
before implementation. If implementation reveals that a limit will be exceeded,
stop and ask whether to split the remaining work or continue with an explicitly
larger PR.

Large PRs are allowed only with explicit pre-approval and a stated reason in the
issue or PR. Acceptable reasons include:

- Mechanical rename or migration where splitting would create duplicate churn
- Tightly coupled migration where partial slices would leave confusing dead code
- Emergency fix where delaying is riskier than reviewing a larger PR
- User approval after seeing the estimated size and at least one split option

Before implementing an approved large PR, state the expected size, why it
exceeds the budget, and at least one split alternative. The PR description must
include a "Why this PR exceeds the review budget" section.

Ambiguous approval such as "continue" is not enough to proceed with an
over-budget PR. Ask whether to approve one larger PR despite exceeding the
budget or split into the proposed sub-issues. Proceed as one large PR only after
clear approval such as "approve larger PR."

When a task exceeds the normal PR budget and is not explicitly approved as a
large PR, decompose it into a parent issue plus native sub-issues before
implementation. Each sub-issue should map to one reviewable PR, define its own
scope, out-of-scope items, and verification, and leave `master` buildable,
testable, deployable, and safe for normal users. Implement one sub-issue at a
time unless explicitly asked to do otherwise.

When a feature introduces a new persisted concept or schema change, split by
architectural layer before splitting by user-visible workflow:

1. Domain/docs plus persistence and service foundation, without user-visible UI
2. Hook and UI integration using the committed foundation
3. Follow-up polish or downstream feature integration, only when needed

For UI-only work, split by user-visible workflow instead.

Foundation PRs are allowed when they make a large feature reviewable. They may
add inactive or not-yet-wired domain, persistence, service, or helper code when
all of the following are true:

- The foundation is tested directly
- It does not expose partial user-facing behaviour
- Any production behaviour change is safe no-op plumbing
- The issue or PR names the follow-up sub-issue that will activate it

## TypeScript

Strict mode. `interface` for object shapes, `type` for unions and aliases. Never use `any`. Use `unknown` at system boundaries and narrow explicitly.

Path alias: `@/*` → `src/*`. Always use it for imports outside the current directory.

```typescript
// correct
import { cn } from '@/lib/utils'
import type { Item } from '@/types/item'

// wrong
import { cn } from '../../lib/utils'
```

Promise failures should be handled at the layer that can show, retry, log, or
otherwise act on the error. Do not use empty `.catch()` callbacks such as
`.catch(() => undefined)` in app TypeScript; if a hook or service owns expected
failures internally, call it with `void` at event-handler boundaries instead.

## Copy Catalog

TreeTales-owned UI copy lives in `src/copy/` as typed English constants. Organize
copy by owning feature area, with `common.ts` for truly shared labels and
commands. Each module should export one nested object named after the area, such
as `storyReaderCopy` or `chapterWritingCopy`, instead of many standalone
constants.

Use catalog functions for dynamic complete sentences so punctuation, ordering,
and future translation boundaries stay in one place:

```typescript
export const storyDetailCopy = {
    deleteDialog: {
        message: (storyTitle: string) =>
            `Delete "${storyTitle}"? This cannot be undone.`,
    },
} as const
```

Accessibility-only text belongs in the Copy Catalog too, including `aria-label`,
icon button labels, close labels, dialog labels, and toolbar landmark labels.
Route/head metadata owned in TypeScript belongs in the catalog. Static
`public/manifest.json` metadata stays static unless the project adds manifest
generation.

Hooks may import catalog copy for display-facing success, failure, and status
messages. Services must not import UI copy; they should return data or errors
that presentation layers turn into user-facing messages. Keep Story, Chapter,
Character, Character Property, and Built-in Example Story starter content out
of the Copy Catalog unless localized seeded content becomes a distinct feature.
Starter Section labels, statuses, and accessibility copy remain UI copy and
belong in `src/copy/`.

Tests should import catalog copy when they need to find controls or states.
Keep literal text expectations only when exact wording is itself the behavior
being protected.

Do not add a `t()`-style string-key lookup, runtime locale switching, translated
bundles, or an i18n dependency until TreeTales has an actual multi-locale
requirement. The Copy Catalog is a centralized ownership boundary for English
copy that keeps future i18n feasible without adding runtime translation
machinery now.

## Components

Functional only. Every component has a `Props` interface named exactly `Props`, placed directly above the function:

```typescript
interface Props {
    value: string
    status: Status
    onChange: (value: string) => void
    onSubmit: () => void
}

export function DataInput({ value, status, onChange, onSubmit }: Props) {
```

- Destructure props in the signature, not inside the body
- Named export (not default)
- For HTML element wrappers, extend from React's own types:
  ```typescript
  interface Props extends Readonly<React.InputHTMLAttributes<HTMLInputElement>> {
      readonly className?: string
  }
  ```
  Keep the interface non-empty when lint would otherwise reject an empty wrapper
  shape; redeclare customized native props such as `className`, `type`, or
  `children` with compatible readonly types.

Use `cn()` from `@/lib/utils` for all conditional class names. Base classes first, overrides last:

```typescript
className={cn(
    'border rounded-[var(--radius)] font-mono text-sm',
    isCorrect && 'border-[var(--correct)] text-[var(--correct)]',
    className
)}
```

Event handler props are named `on[Action]` and typed with explicit payloads:

```typescript
onSelect: (id: string, value: boolean) => void
onFinished: () => void
```

### Feature Component Modules

Every route-composed feature component in `src/components/features/` lives in a
PascalCase feature module directory, even when the module currently contains
only one component:

```text
src/components/features/StoryDashboard/
├── StoryDashboard.tsx
├── StoryDashboard.test.tsx
└── index.ts
```

The module `index.ts` is the public import boundary. Routes, tests, and other
external consumers import the feature through the directory:

```typescript
import { StoryDashboard } from '@/components/features/StoryDashboard'
```

Feature-owned tests, helpers, constants, templates, and private subcomponents
stay inside the owning feature module. Do not leave feature-owned files flat
under `src/components/features/`.

Private subcomponents may live in nested directories when one feature-local
component clearly owns their props or lifecycle. Name the nested directory after
the owning parent component, keep the parent file in its owning directory, and
place the private child files under that same-named directory:

```text
src/components/features/StoryDetail/
├── StoryDetail.tsx
├── StoryDetail/
│   ├── StoryDetailHeader.tsx
│   ├── StoryDetailContent.tsx
│   └── StoryDetailContent/
│       ├── CharacterSection.tsx
│       └── CharacterSection/
│           └── CharacterListContent.tsx
└── index.ts
```

Use this for private sub-sections or workflows, not as a general grouping
mechanism. Route-level feature children are private to the exported feature
component unless they are intentionally imported outside that feature module, so
they belong under the exported feature component's same-named directory.

Nested private directories do not get an `index.ts` by default. Import downward
from the owning parent with a relative path:

```typescript
import { CharacterListContent } from './CharacterSection/CharacterListContent'
```

Do not use parent traversal such as `../CharacterCard` from a nested child.
When a nested child imports outside its current directory or ownership subtree,
use the `@/*` path alias. Keep child component `Props` interfaces private; if a
props shape needs to be imported by another file, reconsider whether the child
is still purely private to the parent section. Tests for directly tested nested
children live beside the child file; broader feature tests may import a private
component by its direct file path when they intentionally exercise that internal
presentation boundary.

Shared feature-layer workflows that are intentionally reused by multiple
feature modules live under `src/components/features/shared/<PascalCaseModule>/`.
This path is reserved for named TreeTales workflows, not miscellaneous shared
helpers. If shared code becomes business-agnostic, move it to `ui/`; if it is
business-aware but does not own a feature workflow, consider `domain/`.

Exported feature components should compose feature-local files instead of
building materially different JSX branches through local variables or
`if`/`else` chains. Extract loading, missing, error, empty, unavailable, and
ready states into named components in their own files inside the feature module.
The directory exists to make this split cheap even when a component starts with
only one extracted state file. Small inline conditionals remain acceptable for
attributes, labels, optional one-line adornments, and compact error or success
messages.

Repository linting enforces this boundary for feature `.tsx` files: prop
interfaces must be named exactly `Props`, and a feature component file may not
declare additional `*Props` interfaces. When a second props shape is needed,
move that component into its own file in the same feature module.

## Hooks

Organise the body in this order:

1. `useState` and `useRef` declarations
2. `useMemo` for values derived from props/state
3. `useEffect` blocks
4. Helper functions (callbacks, event handlers)
5. Return object

```typescript
export function useDataList(items: Item[]) {
    // 1 — state
    const [filter, setFilter] = useState('')
    const [filtered, setFiltered] = useState<Item[]>([])
    const hasHydratedRef = useRef(false)

    // 2 — derived
    const sorted = useMemo(() => [...items].sort(byName), [items])

    // 3 — effects
    useEffect(() => { ... }, [filter])

    // 4 — helpers
    const resetFilter = () => { setFilter(''); setFiltered(sorted) }

    // 5 — return
    return { filter, setFilter, filtered, resetFilter, sorted }
}
```

## Utilities (`src/lib/`)

Only pure functions and system-boundary helpers, no internal state. Current
files are:

| File | Responsibility |
|---|---|
| `errors.ts` | Unknown-error normalization for UI messages |
| `sorting.ts` | Deterministic pure sort helpers |
| `utils.ts` | General utilities such as `cn()` |

Recommended file layout:

```
constants → types/interfaces → exported functions → private helpers (no export)
```

All exported functions have a one-line JSDoc comment when the behaviour is non-obvious. Use `export function`, never `export default`.

## Services (`src/services/`)

Services are application-facing story and chapter operations used by hooks,
components, and route adapters. They do not own React state, UI state, or
component navigation.

Services own generated domain fields such as `id`, `createdAt`, and
`updatedAt`. They call repositories with domain records or domain patches and
keep storage-specific details out of component-facing contracts.

Active story and chapter service exports are wired to browser-local IndexedDB
repositories. Compatibility exports stay temporarily for old import paths, but
new production persistence work should target the active service modules and
repository contracts.

Current service-facing files are:

| File | Responsibility |
|---|---|
| `storyService.ts` | Active Story service API |
| `storyDb.ts` | Temporary compatibility re-export for existing Story imports |
| `db.ts` | Temporary compatibility re-export for old IndexedDB imports |
| `chapterService.ts` | Active Chapter service API |
| `chapterDb.ts` | Temporary compatibility re-export for existing Chapter imports |
| `exampleStory.ts` | Built-in example story creation/reuse |
| `types.ts` | Shared records and input contracts |

Production service and IndexedDB repository tests use the fake IndexedDB helper
from `src/test/`. Component and hook tests can keep using fake service
dependencies when the persistence layer is not under test.

## Repositories (`src/repositories/`)

Repositories are persistence adapters. They own storage transactions, schema
setup, schema-specific integrity checks, row-to-domain mapping, and storage
error normalization.

Repository APIs should accept and return domain records or domain patches rather
than exposing storage-shaped rows. Storage-specific names such as `story_id`,
`created_at`, SQL `RETURNING` details, object store names, and index names stay
inside the repository module.

Repositories may perform partial updates and return the persisted domain record
when storage decides whether the record exists and what the final stored value
is. Services still provide generated values such as `updatedAt` in those
patches.

Repositories should not generate domain values such as ids or timestamps.
Services provide those values before calling a repository.

Repositories normalize expected domain-relevant outcomes at the boundary:
missing reads return `undefined`, missing deletes return `false`, and missing
updates return `undefined`. Unexpected storage failures may still throw while
preserving the original cause.

Shared repository contracts live in `src/repositories/types.ts`. Domain records
and service input types remain in `src/services/types.ts` until there is a
separate reason to move them. Storage-specific implementations live under a
provider directory, such as `src/repositories/indexedDb/`, so connection setup,
upgrades, transaction helpers, and provider-specific repositories stay together.

Current repository files are:

| File | Responsibility |
|---|---|
| `indexedDb/db.ts` | Active IndexedDB connection, upgrade, low-level request helpers, and legacy parent migration |
| `indexedDb/transaction.ts` | Provider-internal IndexedDB transaction lifecycle helper |
| `indexedDb/storyRepository.ts` | Active IndexedDB Story persistence adapter |
| `indexedDb/chapterRepository.ts` | Active IndexedDB Chapter persistence adapter |
| `indexedDb/characterRepository.ts` | Active IndexedDB Character persistence adapter |
| `indexedDb/unitOfWork.ts` | Active IndexedDB unit-of-work boundary for multi-repository writes |

Cross-record persistence effects should stay explicit at the service boundary.
For example, Story deletion may coordinate a Story repository with a Chapter
repository operation such as deleting all Chapters for a Story; it should not
hide Chapter cleanup inside the Story repository.

Multi-repository writes should run inside an explicit storage-specific
unit-of-work boundary so related writes commit or fail together. The active
IndexedDB path uses `createIndexedDbRepositoryUnitOfWork()` for these service
operations. Keep cross-record effects explicit in the service operation and use
transaction-scoped repositories inside the unit of work instead of opening
storage transactions directly from services.

When renaming an app-facing service, prefer adding the correctly named service
module first and leaving the old `*Db.ts` file as a temporary compatibility
re-export. Migrate first-party imports to the correctly named service in the
same slice when the change is mechanical and contained.

IndexedDB repositories may accept an `IDBTransaction` for unit-of-work
operations rather than opening their own database connection. Standalone
operations should open and close their own database connection through the
provider transaction helper, using only the object stores required by the
operation.

## Optional Store (e.g. Zustand)

There is currently no global store. Prefer local component state and feature
hooks until state needs to be shared across unrelated features or routes. If a
store is introduced, follow this shape:

Split state and actions into two interfaces, then combine:

```typescript
interface AppState {
    items: Record<string, Item>
    lastUpdatedAt: Record<string, number>
    _hasHydrated: boolean          // underscore = internal flag
}

interface AppActions {
    updateItem: (id: string, data: Partial<Item>) => void
    setHasHydrated: (v: boolean) => void
}

export type AppStore = AppState & AppActions
```

In components, selectors are always inline lambdas — never select the whole store:

```typescript
const items = useAppStore((s) => s.items)
const updateItem = useAppStore((s) => s.updateItem)
```

If using persistence middleware, set `skipHydration: true` in the persist config; the root route calls `useAppStore.persist.rehydrate()` manually to control timing and prevent flicker.

## Route Files

```typescript
// src/routes/items.$id.tsx
export const Route = createFileRoute('/items/$id')({
    component: ItemRoute,
    loader: async ({ params }) => {
        const item = await getItem(params.id)
        if (!item) throw notFound()
        return item
    },
    validateSearch: (search: Record<string, unknown>) => { ... },
})

function ItemRoute() {
    const item = Route.useLoaderData()
    const { view } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })

    return (
        <ItemPage
            item={item}
            view={view}
            onBack={() => navigate({ search: () => ({}) })}
        />
    )
}

// src/components/features/ItemPage.tsx
export function ItemPage({ item, view, onBack }: Props) {
```

- Loader throws `notFound()` for missing resources — never returns `null`
- `validateSearch` type-guards all URL params; default to `undefined` for missing ones
- Route files export only `Route`; do not export page components, helpers, or types from `src/routes/*`
- Route components may be unexported thin adapters that call `Route.useLoaderData()` / `Route.useSearch()` and pass typed props to page components
- Testable page components live outside `src/routes`, usually in `components/features`; tests render those exported components directly
- Test route wiring separately when needed by importing `Route` and asserting loader/search/params behavior through `Route.options`
- Keep route files thin: routing setup, loaders, params/search validation, and adapter composition only. Move client state into hooks, typed UI into `components/domain` or `components/features`, and pure transforms into `src/lib`.

## Naming

| Thing | Convention |
|---|---|
| Components | `PascalCase` |
| Hooks | `camelCase` prefixed `use` |
| Utilities / helpers | `camelCase` |
| Constants | `UPPER_SNAKE_CASE` |
| Route files | `lowercase.$param.tsx` |
| Internal store flags | `_camelCase` (underscore prefix) |

## Git

Conventional Commits — `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`. Never run `git commit` or `git push` unless explicitly asked. When the user explicitly asks a coding agent to commit and push, treat that as approval that the pre-commit review gate is satisfied unless the user says otherwise.

Routine development happens on topic branches and merges to `master` through pull requests. Direct pushes to `master` are reserved for emergencies. Branch names use lowercase Conventional Commit-style prefixes plus a short kebab-case description: `feat/add-story-outliner`, `fix/chapter-link-validation`, `docs/branch-naming-convention`. For issue-backed work, include the issue number after the prefix: `feat/123-add-story-outliner`. Before starting issue-backed work or creating a new branch, fetch the latest `origin/master`, check the current branch, and base the work on that current remote state. If fetching is unavailable, report that limitation before branching or implementing. Before committing or opening a PR, make sure the branch is fresh and purpose-specific for the current work, not an old branch that has already merged or belongs to another PR. When in doubt, refresh `origin/master` and create a new branch from it before committing. Pull requests must pass the required quality gate checks (lint, tests, coverage, build) before merge. GitHub-native secret scanning and push protection are the secret leak controls for this repo; do not add a third-party secret scanner unless the workflow is intentionally revised.

GitHub Issues are used for task tracking. Before implementation, check for an existing issue or create/draft one unless the change is truly tiny. Use `Closes #N` in PR bodies and commit messages for complete, verified issue-backed work that should close on merge or push. Use `Refs #N` only when the work is related but intentionally leaves the issue open.

If a non-trivial change requires an issue and GitHub issue lookup or creation is
unavailable, stop before implementation for new work and stop before opening a
PR for completed work. Report the blocker to the user; do not continue by
opening an untracked PR. PR bodies should contain real issue references only.
Do not write "None" as a linked-issue substitute when an issue is required, and
do not include agent/tooling failure notes such as failed issue creation
attempts in PR descriptions.

Use the local `github-issues` skill when creating or editing GitHub issues, decomposing work, starting issue-backed work, opening issue-backed PRs, managing blockers, or auditing issue relationships before handoff. The skill owns the operational checklists and issue templates.

Large changes are work that spans multiple features, broad refactors, risky behaviour changes, persistence/data-flow changes, or thousands of lines of code. Use one parent issue for the end goal and native GitHub sub-issues for independently shippable slices. Do not rely only on textual `Refs #N` links when the sub-issue relationship is available. Each sub-issue must leave `master` buildable, testable, deployable, and safe for normal users. For tightly coupled migrations, inactive implementation slices are acceptable. For partial user-facing features that cannot safely ship yet, hide the incomplete behavior behind a feature flag that follows the feature flag rules below. Production behavior must switch in one coherent deployable sub-issue.

Native GitHub relationships are the source of truth for issue structure. Use sub-issues for "part of" relationships and blocked-by/blocking relationships for real sequencing dependencies. Do not encode required hierarchy or blockers only in issue prose, checklists, or `Refs #N` links. If a required native relationship cannot be created, read, or verified through available GitHub tooling, stop and report the limitation instead of silently falling back to text-only links.

Issue descriptions should use a consistent structure. Parent issues describe outcome, context, scope, out-of-scope work, planned slices, dependencies, and completion criteria. Sub-issues and standalone work issues describe outcome, parent context when applicable, related decisions, scope, out-of-scope work, dependencies, and verification. For architecture, persistence, routing, data-flow, feature-flag, or workflow-policy changes, include a `Related Decisions` section that links the applicable ADRs/docs or says `None identified`.

Before starting an existing issue, inspect the target issue, parent issue when present, child/sub-issues when relevant, blocking relationships, linked PRs or branch context when visible, and ADRs/docs linked from the issue graph. State the big picture before editing: parent goal, this issue's slice, blockers, and related ADRs.

Before handing off issue-backed work, audit the issue graph: whether the issue is a parent, sub-issue, or standalone issue; whether required native sub-issue and blocking relationships exist; whether linked ADRs/docs were followed or updated; whether follow-up issues are needed; and whether the parent issue can close, must stay open, or needs updated completion criteria.

Prefer vertical slices over layer-only mega-PRs:

- Add inactive data/model support before switching behaviour
- Introduce service, hook, or component abstractions behind current behaviour
- Add hidden UI, routes, or components before exposing them
- Wire incomplete user-facing behaviour behind a feature flag
- Enable the feature only after the flagged path is complete and verified
- Remove old paths, migration scaffolding, and feature flags as explicit cleanup work

Use branch-by-abstraction for deep internals so old and new implementations can coexist behind a stable interface during migration.

Feature flags are for incomplete user-facing behaviour that must land before it is ready for normal users. Start with lightweight build-time flags, and add a central feature flag module only when the first real flag is needed. Flags are appropriate for new routes, new UI modes, alternate user flows, and risky temporary refactors. They are not appropriate for hiding broken shared code, avoiding tests, long-lived parallel architectures, or security/permission boundaries.

Every feature flag must have an owner issue, default state, reason for existing, enable/removal condition, and cleanup child issue. Do not close a large-change parent issue until temporary flags, old code paths, and migration scaffolding are removed or explicitly moved to follow-up issues.

For complete, verified issue-backed work, use `Closes #N` when the commit should close the issue on merge or push. Do not downgrade to `Refs #N` solely because a post-commit review might happen; the explicit commit/push request is the review approval unless the user says otherwise.

When finishing issue-backed work, always consider whether the issue needs a comment summarizing the outcome, verification, remaining risks, blockers, or handoff notes. Do not post outcome or completion comments while the relevant changes are only local and unpushed; wait until the commit/PR is pushed, or draft the comment for manual posting when handing off unpushed work. Comment when it would leave useful durable context; skip it only when the final state is already obvious from the issue, commits, and PR/branch history. If GitHub access is unavailable, include the exact comment text in the final report so it can be posted manually.

For refactors that introduce lint rules, shared primitives, or other durable enforcement, include a final issue checklist item that explicitly confirms the enforcement boundary and whether the issue should close or split follow-up cleanup into a new issue.

Issue labels stay intentionally small:

| Group | Labels |
|---|---|
| Type | `bug`, `enhancement`, `documentation`, `refactor`, `maintenance` |
| Size | `size:quick`, `size:planned`, `size:epic` |
| Area | `area:ui`, `area:data`, `area:api`, `area:tests`, `area:docs` |

Treat the workflow itself as improvable. If a task reveals unclear issue criteria, missing templates, repeated manual steps, weak labels, or better task-splitting practices, mention the improvement to the user so the workflow can be updated intentionally.

## Linting

**Always run `npm run lint` before considering a task complete.** It runs TypeScript checks and ESLint/SonarJS analysis. Fix any errors it surfaces; warnings from genuinely unused-but-kept props (`_prefixed`) are acceptable.

## Testing

**Always check whether unit tests and/or E2E tests are needed before and after every implementation — do not wait to be asked.** Before editing, use the task shape to decide the likely test level. After editing, re-check the actual change and add or update tests when the final behavior requires more coverage than originally expected. Write unit tests when new code has non-obvious threshold values, branching logic, or derived state that could silently regress. Write E2E tests when the change affects visual layout, positioning, CSS properties that jsdom cannot verify, route-to-route flows, persisted browser state, or real-browser keyboard/focus behavior. If unsure, ask.

**Bug fixes must include a regression test.** The test documents the invariant and prevents the same issue from reappearing silently.

Tests are co-located in `__tests__/` folders. Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()` for timer-dependent logic. Use `renderHook` from RTL for hook tests.

Shared test-only helpers that are reused across multiple areas live in
`src/test/`. Keep them small and framework-specific only when the helper exists
to remove repeated setup code, such as fake browser APIs or test database
cleanup.

### Coverage

`npm run test:coverage` enforces global Vitest thresholds of 99.5% lines, 99.5% statements, 99.5% functions, and 99.5% branches. Branch-heavy logic should include focused tests for meaningful paths instead of relying on the global total.

Coverage excludes generated code, route files, test-only helpers in `src/test/**`, and static data files. These files are validated through schema, route/component tests, generation workflows, or by the tests that use the helpers, and counting them would make the coverage signal noisier. Do not exclude low-coverage files only to raise totals when they contain real behavior; add focused tests or document why the file is a thin runtime wrapper.

### Unit Test Standard

Unit tests should prove behavior through public interfaces and observable outcomes. They are allowed to know the contract of the unit under test, but not its private implementation.

- Test the invariant, not the implementation detail. A harmless refactor should not break the test.
- Prefer focused tests with one clear behavioral reason to fail.
- Use Arrange / Act / Assert structure when it improves clarity.
- Cover the happy path, important branches, boundary values, empty/error states, and regression cases.
- Use small deterministic fixtures or builder helpers. Avoid large opaque fixtures that hide the behavior under test.
- Keep the unit boundary explicit. Mock external services, browser/storage/network boundaries, expensive collaborators, and framework plumbing; do not mock the logic being tested.
- Await async behavior explicitly with Testing Library or Vitest async helpers. Do not rely on incidental timing.
- Reset mocks, timers, stores, local storage, and module/global state between tests.

Standards by unit type:

- Pure utilities: use table tests for meaningful input classes and edge cases. Assert exact outputs and thrown errors.
- Hooks: use `renderHook`, wrap state changes in `act`, use fake timers for time-dependent behavior, and assert returned state/actions instead of hook internals.
- Components: use Testing Library queries by role, label, and visible text first. Use `user-event` for user flows, reserve `fireEvent` for low-level events that `user-event` cannot express, and assert visible UI or callback outcomes.
- Stores and services: reset persisted or module state in `beforeEach`; assert state transitions, returned values, and externally visible side effects.
- Repositories: test storage mapping, persistence side effects, transaction behavior, and normalized missing-record outcomes through the repository contract. Keep service tests focused on app-facing semantics such as generated ids/timestamps and delegation behavior; do not duplicate every repository persistence assertion at the service layer.
- Routes and loaders: test loader/search behavior separately from page rendering where practical; route component tests may mock router plumbing but should still assert page-level behavior.

Avoid:

- Snapshot-only unit tests.
- "Renders without crashing" tests with no behavioral assertion.
- Over-mocking, especially mocking the unit under test.
- Assertions coupled to private state, CSS class names, or implementation-only call order.
- Real timers, arbitrary sleeps, or unbounded retries for timer-dependent logic.
- Shared mutable fixtures that are not rebuilt or reset for each test.
- Broad integration tests mislabeled as unit tests when a narrower unit test would be clearer.
- Testing layout, computed CSS, or pixel-level behavior in jsdom. Use Playwright for browser-rendered behavior.

Unit test audit checklist:

- Each test documents a user, business, or code invariant.
- Each test has one clear reason to fail.
- Bug fixes include a regression test that fails without the fix.
- Branching logic, derived state, thresholds, and error/empty states are covered.
- Async work is awaited explicitly.
- Mocks are scoped to external boundaries and reset between tests.
- Fake timers are restored with `vi.useRealTimers()`.
- Store, storage, module, and global state cannot leak into the next test.
- Component tests prefer accessible queries; `data-testid` is used only when accessible queries are unsuitable.
- jsdom limitations are respected; browser layout and visual regressions are covered by E2E tests.

### Mock Patterns

Use `vi.hoisted()` for mock values referenced inside `vi.mock()` factories; wrap real module functions in `vi.fn()` when per-test overrides are needed:

```typescript
vi.mock('@/lib/foo', async (orig) => {
    const a = await orig()
    return { ...a, fn: vi.fn(a.fn) }
})
```

### Route Component Tests

Route files export only `Route`, so do not export route components just to test
them. Render exported page or feature components outside `src/routes` for UI
behavior. Test route wiring separately only when the route owns meaningful
loader, params, or search behavior:

```typescript
import { describe, expect, it } from 'vitest'

import { Route } from './stories.$storyId.read'

interface ReaderSearch {
    readonly chapterId?: string
}

describe('story reader route', () => {
    it('normalizes search params', () => {
        const validateSearch = Route.options.validateSearch

        expect(validateSearch).toBeTypeOf('function')

        if (typeof validateSearch !== 'function') {
            throw new TypeError('Route validateSearch is not configured')
        }

        const validateReaderSearch = validateSearch as (
            search: Record<string, unknown>,
        ) => ReaderSearch

        expect(validateReaderSearch({ chapterId: 'chapter-1' })).toEqual({
            chapterId: 'chapter-1',
        })
        expect(validateReaderSearch({ chapterId: 1 })).toEqual({
            chapterId: undefined,
        })
    })
})
```

### E2E Tests

Live in `e2e/`, run with `npm run test:e2e`. Use `playwright-bdd`
feature files and step definitions on top of Playwright + Chromium only. Keep
E2E tests focused on user-observable browser behavior that cannot be proven as
clearly or cheaply with unit/component tests.

`npm run test:e2e` is the single public E2E command. It generates BDD-backed
Playwright tests before running Playwright, so contributors do not need a
separate BDD command for routine verification. Commit feature files, step
definitions, and small support helpers; do not commit generated Playwright
specs.

Recommended BDD layout:

```text
e2e/
├── features/
│   ├── document-mode.feature
│   └── system-mode.feature
├── steps/
│   ├── document-mode.steps.ts
│   └── system-mode.steps.ts
└── support/
    └── app.ts
```

Organize feature files by TreeTales experience mode rather than by the current
test implementation file. Keep step definitions local to the owning experience
mode at first. Add shared helpers under `e2e/support/` only after setup repeats
across modes.

Feature files should use the glossary in `CONTEXT.md`, such as Story, Chapter,
Chapter Document, Reader Appearance, Library Mode, Document Mode, Management
Mode, and System Mode. They may use precise UX contract terms when those terms
are the clearest acceptance criteria, such as "inner scroll container" or
"inside the viewport". Keep selectors, route regexes, `localStorage` keys, CSS
property names, generated URL parsing, and browser event internals inside step
definitions or support helpers.

Good feature-step language:

```gherkin
Then the Chapter Document has no inner scroll container
And typing near the bottom keeps my writing position stable
```

Avoid feature-step language that exposes implementation details directly:

```gherkin
Then section "Chapter document" has CSS overflow-y "hidden"
And window.scrollY stays unchanged
```

For browser-controlled platform UI such as PWA installation, keep assertions
indirect and app-owned: assert TreeTales captures and calls
`beforeinstallprompt` from a user action, and use manual/device smoke tests for
the native Android install sheet itself.

Every task must explicitly check whether E2E coverage is needed twice:

- Before implementation: decide from the task shape whether E2E is expected, likely unnecessary, or a judgment call.
- After implementation: re-check the actual diff, affected behavior, and bug risk before declaring verification complete.

Record the decision in the issue, PR notes, or final handoff when the answer is not obvious.

Use this decision matrix:

| Task shape | E2E expectation |
|---|---|
| Critical user journey, route-to-route flow, or first-run path | Must include one representative E2E happy path or update an existing one |
| Regression that only appears in a real browser, route integration, persisted storage, keyboard/focus behavior, layout, computed CSS, or screenshots | Must include an E2E regression test |
| New user-facing flow, feature flag that changes navigation/interaction, or risky route/store/service integration | Should include focused E2E coverage for the main path and highest-risk failure mode |
| Pure logic, hooks, services, derived state, validation, data transforms, or branch-heavy behavior | Prefer unit/component tests; add E2E only for the browser-level contract |
| Copy-only, docs-only, metadata-only, or isolated styling with no layout risk | Usually no E2E needed; document the reason if the task is issue-backed |

Best practices:

- Test through visible behavior: roles, labels, text, route changes, persisted state that survives reload, focus movement, or screenshots.
- Keep each spec small, deterministic, and tied to one user or regression invariant.
- Prefer role/name selectors. Use `data-testid` when accessible selectors are unstable or the element has no meaningful accessible surface.
- Seed state through stable routes, query params, localStorage init scripts, or small test collections instead of repeating long setup flows.
- Use explicit readiness checks: visible UI, loaded route state, `expect(...).toBeVisible()`, or `document.fonts.ready` before screenshots.
- Scope screenshot assertions to the smallest meaningful element or region.
- Keep visual tolerances explicit and small when asserting geometry.
- Reuse helpers only after the same setup appears in multiple specs.
- Keep Gherkin scenarios focused on one acceptance or regression invariant.
- Put browser setup, selectors, storage details, and low-level assertions in
  step definitions rather than in feature text.

Avoid:

- Duplicating unit/component coverage in slower browser tests.
- Broad "everything works" flows with many unrelated assertions.
- Assertions against CSS class names, private implementation state, incidental DOM structure, or internal function calls.
- Arbitrary sleeps, real network dependence, random data, or unbounded retries.
- Snapshot or screenshot updates without reviewing the rendered diff.
- Full-page screenshots when a component or region screenshot would protect the invariant better.
- Adding browser projects beyond Chromium unless the task explicitly expands browser support.
- Building a broad global step catalog before multiple feature files need the
  same phrase or helper.

Standard setup:

```typescript
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/items/42?view=detail')
    await page.waitForSelector('[data-testid="item-card"]')
    await page.evaluate(() => document.fonts.ready)
})

// Alignment assertion
test('elements align vertically', async ({ page }) => {
    const a = await page.locator('[data-testid="..."] input').first().boundingBox()
    const b = await page.locator('[data-testid="..."] span').first().boundingBox()
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(2)
})

// Screenshot regression
test('renders correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="..."]')).toHaveScreenshot('name.png')
})
```

Maintenance:

- Update baselines with `npx playwright test --update-snapshots` only after confirming the visual change is intentional.
- Commit new or updated PNG snapshots alongside the code change that requires them.
- Remove or rewrite E2E tests when the protected behavior no longer exists.
- Keep the `data-testid` inventory below updated when adding, renaming, or removing test IDs.
- If E2E setup becomes repetitive across specs, add a small local helper in `e2e/` rather than hiding behavior in global fixtures.
- Keep the suite lean enough that `npm run test:e2e` remains practical for routine verification.

Key gotchas:
- `reuseExistingServer: !process.env.CI` — kill the dev server before running tests after code changes, or Playwright reuses the stale one.
- `@playwright/test` is the test runner; `playwright` is the browser library — they are separate packages.
- If Playwright reports a missing browser executable, run `npx playwright install chromium`.
- For tests that need deterministic order, mock `Math.random` in `page.addInitScript` and account for all random calls consumed by initial shuffling.
- Validate carefully before using Playwright fake clocks; timer control can change input/submission behavior.

E2E audit checklist:

- The test protects a user journey, browser-only behavior, visual/layout contract, or integration invariant.
- The same behavior cannot be tested more clearly as a unit/component test.
- The setup is deterministic and does not depend on arbitrary timing or external network state.
- Selectors describe user-facing semantics where possible; `data-testid` is used for stable non-semantic targets.
- Screenshots are scoped, reviewed, and updated only for intentional changes.
- Bug fixes include a regression test at the lowest reliable level, with E2E used for real-browser or full-app regressions.
- The suite remains maintainable: no long unrelated flows, no stale snapshots, and no orphaned test IDs.
