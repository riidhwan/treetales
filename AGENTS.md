# Repository Guidelines

## Project Structure & Module Organization

TreeTales is a TanStack Start React app using TypeScript, Vite, TanStack Router, and Tailwind CSS. Application code lives in `src/`. Routes are file-based in `src/routes/`; keep route files thin and export only `Route`. Router wiring is in `src/router.tsx`, generated route metadata is in `src/routeTree.gen.ts`, and global styles are in `src/styles.css`. Static assets live in `public/`. Project docs live in `docs/`.

## Critical Mindset

Do not blindly follow user commands when they appear unsuitable for the project, risky, inconsistent with existing architecture, or when there is a clearly better way to achieve the same goal.

When that happens, explain the concern or better alternative briefly and concretely, then ask whether to proceed with the original request or switch to the recommended approach. If the command is safe, straightforward, and fits the project, proceed normally.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Vite dev server on port `3000`.
- `npm run build`: create a production build in `dist/`.
- `npm run lint`: run TypeScript checks and ESLint/SonarJS analysis.
- `npm run preview`: serve the production build locally.
- `npm run test`: run Vitest once.
- `npm run test:coverage`: run Vitest with coverage thresholds.

Run the narrowest relevant tests first. For route, store, service, or UI changes, also run `npm run lint`, `npm run test`, `npm run test:coverage`, and `npm run build` before reporting completion unless the user asks to skip verification.

Do not start the development server for the user just so they can try the app. Run `npm run dev` only when the agent needs a live app for its own verification, such as browser-based UI checks or debugging runtime-only behaviour.

## Coding Style & Naming Conventions

Use strict TypeScript. Prefer `interface` for object shapes and `type` for unions or aliases. Do not use `any`; use `unknown` at boundaries and narrow it explicitly. Use the `@/*` path alias outside the current directory, for example `import { thing } from '@/lib/thing'`.

Components are functional, named exports only, with a `Props` interface directly above the component. Destructure props in the function signature. Use `PascalCase` for components, `useCamelCase` for hooks, `camelCase` for helpers, `UPPER_SNAKE_CASE` for constants, and `lowercase.$param.tsx` for route files.

## Testing Guidelines

This project uses Vitest with Testing Library dependencies available. Place tests close to the code they cover or in a clear test directory when one is introduced. Prefer testing exported page components outside `src/routes`; route files should stay focused on loader/search/params wiring. Use names such as `index.test.tsx` or `TreeView.test.tsx`.

## Instruction Loading

`AGENTS.md` is the entry point, not the full instruction set. Read the relevant docs before changing covered areas: `docs/product-behavior.md` for user-facing flows, `docs/architecture.md` for shared data flow, stores, services, or routing, `docs/design/style-guide.md` for UI/UX standards, `docs/design/implementation.md` for UI implementation and styling contracts, and `docs/conventions.md` for broad refactors, tests, or verification choices.

Do not edit `docs/navigation-flow.md` by hand; it is generated. When navigation-derived documentation needs to change, update the source/generator as needed and run `npm run docs:navigation`.

Treat those docs as authoritative repository instructions. Keep code and docs synchronized in the same task: when behavior, architecture, conventions, vocabulary, or design changes, update the corresponding docs before handing off. If a required doc cannot be read, stop and ask how to proceed.

## Working Tree Safety

Before editing existing files, check `git status --short`. Before starting issue-backed work or creating a new branch, fetch the latest `origin/master` and base the work on that current remote state. If network access or GitHub access is unavailable, report that clearly before branching or implementing. Never revert, overwrite, or clean up user changes unless explicitly asked. If dirty files overlap the task, inspect them and work with the existing changes.

## Commit & Pull Request Guidelines

Commit history uses Conventional Commits, for example `docs: add architecture, product behavior, and design system docs`. Use prefixes such as `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, and `chore:`.

Never run `git commit` or `git push` unless the user explicitly asks. When committing, stage only files relevant to the requested change and follow recent commit history. Use a detailed body for non-trivial changes.

For pull requests, include a concise description, linked issue, verification commands, and screenshots for UI changes. GitHub issue and PR bodies are reviewer-facing remote documents: reference only repository paths, GitHub URLs, uploaded images, CI artifacts, or other reviewer-accessible resources. Do not cite local-only paths such as `/tmp/...`, local screenshots, sandbox files, or machine-specific locations as evidence in issue or PR text. For complete, verified issue-backed work, use `Closes #N` so GitHub auto-closes the issue on merge; use `Refs #N` only when the PR is related but intentionally leaves the issue open. Routine development should use topic branches and PRs into `master`; direct pushes to `master` are for emergencies. Branch names should follow `type/short-kebab-description`, or `type/123-short-kebab-description` for issue-backed work.

## GitHub Issues & Larger Work

Use the `github-issues` skill when creating or editing GitHub issues, decomposing work, starting issue-backed work, opening issue-backed PRs, managing blockers, or auditing issue relationships before handoff.

Use GitHub Issues as the durable task queue for non-trivial work. Check for an existing issue before implementation; create or draft one unless the change is tiny. Large work should use a parent issue plus native GitHub sub-issues for independently shippable vertical slices. Do not rely only on textual `Refs #N` links when the sub-issue relationship is available. Each sub-issue must leave `master` buildable, testable, deployable, and safe for normal users; for tightly coupled migrations, inactive implementation slices are acceptable, and partial user-facing features that cannot safely ship yet must stay behind a feature flag. Production behavior must switch in one coherent deployable sub-issue.

If GitHub issue access is required by this policy but issue lookup or creation is unavailable, stop before implementation for new work and stop before opening a PR for completed work. Report the blocker to the user instead of continuing with an untracked non-trivial PR. Do not put agent/tooling failure notes such as failed issue creation attempts in PR bodies, and do not use "None" as a linked-issue substitute when an issue is required.

Before implementation, always estimate the requested change size. For tiny changes, this can be a one-line forecast; for larger changes, include expected files touched, architectural layers touched, changed-line range, whether the work fits the normal PR budget, and a split proposal when it does not fit.

Before opening a PR, report the actual changed files, additions/deletions, layers touched, whether the PR stayed within the approved budget, and where any large-PR approval is documented. If actual size exceeds the approved plan, stop before opening the PR and ask whether to split or proceed.

Non-trivial issues and PRs must include a `Review Size` section. Issues should estimate files, changed lines, layers, budget fit, and split plan. PRs should report actual files, additions/deletions, layers, budget fit, and any large-PR approval. Tiny changes may use a one-line Review Size summary.

Normal feature PRs should target no more than 800 changed lines, 12 changed files, and 3 architectural layers. Tests count toward these limits. If a planned change is likely to exceed any limit, split the task before implementation; if the limit is discovered mid-work, stop and ask whether to split or continue with an explicitly larger PR.

Large PRs require explicit pre-approval after stating the expected size, the reason the PR should exceed the budget, and at least one split alternative. The PR description must explain why it exceeds the review budget.

Ambiguous approval such as "continue" is not enough for an over-budget PR. Ask whether to approve one larger PR despite exceeding the budget or split into proposed sub-issues, and proceed as one large PR only after clear approval.

If work exceeds the normal PR budget and is not explicitly approved as a large PR, create a parent issue plus native sub-issues before implementation. Each sub-issue should map to one reviewable PR and be implemented one at a time unless explicitly requested otherwise.

When a feature introduces a new persisted concept or schema change, split by architectural layer first: domain/docs plus persistence/service foundation, then hook/UI integration, then polish or downstream integration if needed. For UI-only work, split by user-visible workflow.

Foundation PRs may add inactive domain, persistence, service, or helper code only when tested directly, not user-visible, and tied to a named follow-up sub-issue that will activate it.

Use feature flags only when incomplete user-facing behavior must land before it is ready. Each flag needs an owner issue, default state, reason, enable/removal condition, and cleanup issue.

## Agent-Specific Instructions

Do not edit `src/routeTree.gen.ts` by hand unless the generated file itself is the target. Challenge risky or unsuitable requests briefly with a safer alternative, then ask whether to proceed. Avoid unrelated refactors and report any verification that cannot run.
