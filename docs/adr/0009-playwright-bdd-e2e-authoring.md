# Playwright BDD E2E authoring

TreeTales writes end-to-end tests with `playwright-bdd` feature files and step
definitions while keeping Playwright Test as the runner behind `npm run
test:e2e`. This keeps acceptance scenarios readable in TreeTales product
language without giving up Playwright's browser automation, config, tracing, and
Chromium-only project setup.

## Considered Options

- Plain Playwright specs only: rejected because full E2E coverage should also
  document acceptance scenarios in a readable Gherkin form.
- Separate BDD and non-BDD E2E suites: rejected because it would split the
  repository's E2E contract and make routine verification less predictable.
- Full `playwright-bdd` conversion: selected because the team wants the whole
  E2E layer expressed through feature files, with generated specs kept out of
  git.

## Consequences

- `npm run test:e2e` remains the public E2E command and must generate BDD tests
  before running Playwright.
- Feature files and step definitions are source files; generated Playwright
  specs are build artifacts and must not be committed.
- Feature files should use TreeTales glossary terms and precise UX contract
  language, while selectors, storage details, CSS checks, and browser internals
  stay in step code.
