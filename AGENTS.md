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

## Coding Style & Naming Conventions

Use strict TypeScript. Prefer `interface` for object shapes and `type` for unions or aliases. Do not use `any`; use `unknown` at boundaries and narrow it explicitly. Use the `@/*` path alias outside the current directory, for example `import { thing } from '@/lib/thing'`.

Components are functional, named exports only, with a `Props` interface directly above the component. Destructure props in the function signature. Use `PascalCase` for components, `useCamelCase` for hooks, `camelCase` for helpers, `UPPER_SNAKE_CASE` for constants, and `lowercase.$param.tsx` for route files.

## Testing Guidelines

This project uses Vitest with Testing Library dependencies available. Place tests close to the code they cover or in a clear test directory when one is introduced. Prefer testing exported page components outside `src/routes`; route files should stay focused on loader/search/params wiring. Use names such as `index.test.tsx` or `TreeView.test.tsx`.

## Instruction Loading

`AGENTS.md` is the entry point, not the full instruction set. Read the relevant docs before changing covered areas: `docs/product-behavior.md` for user-facing flows, `docs/architecture.md` for shared data flow, stores, services, or routing, `docs/design-system.md` for UI and styling, and `docs/conventions.md` for broad refactors, tests, or verification choices.

Treat those docs as authoritative repository instructions. Keep code and docs synchronized in the same task: when behavior, architecture, conventions, vocabulary, or design changes, update the corresponding docs before handing off. If a required doc cannot be read, stop and ask how to proceed.

## Working Tree Safety

Before editing existing files, check `git status --short`. Before starting issue-backed work or creating a new branch, fetch the latest `origin/master` and base the work on that current remote state. If network access or GitHub access is unavailable, report that clearly before branching or implementing. Never revert, overwrite, or clean up user changes unless explicitly asked. If dirty files overlap the task, inspect them and work with the existing changes.

## Commit & Pull Request Guidelines

Commit history uses Conventional Commits, for example `docs: add architecture, product behavior, and design system docs`. Use prefixes such as `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, and `chore:`.

Never run `git commit` or `git push` unless the user explicitly asks. When committing, stage only files relevant to the requested change and follow recent commit history. Use a detailed body for non-trivial changes.

For pull requests, include a concise description, linked issue, verification commands, and screenshots for UI changes. For complete, verified issue-backed work, use `Closes #N` so GitHub auto-closes the issue on merge; use `Refs #N` only when the PR is related but intentionally leaves the issue open. Routine development should use topic branches and PRs into `master`; direct pushes to `master` are for emergencies. Branch names should follow `type/short-kebab-description`, or `type/123-short-kebab-description` for issue-backed work.

## GitHub Issues & Larger Work

Use GitHub Issues as the durable task queue for non-trivial work. Check for an existing issue before implementation; create or draft one unless the change is tiny. Large work should use a parent issue plus native GitHub sub-issues for independently shippable vertical slices. Do not rely only on textual `Refs #N` links when the sub-issue relationship is available. Each sub-issue must leave `master` buildable, testable, deployable, and safe for normal users; for tightly coupled migrations, inactive implementation slices are acceptable, and partial user-facing features that cannot safely ship yet must stay behind a feature flag. Production behavior must switch in one coherent deployable sub-issue.

Use feature flags only when incomplete user-facing behavior must land before it is ready. Each flag needs an owner issue, default state, reason, enable/removal condition, and cleanup issue.

## Agent-Specific Instructions

Do not edit `src/routeTree.gen.ts` by hand unless the generated file itself is the target. Challenge risky or unsuitable requests briefly with a safer alternative, then ask whether to proceed. Avoid unrelated refactors and report any verification that cannot run.
