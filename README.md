# voli-2

React + TypeScript + Vite app with **Storybook**, **Supabase**, **Redux Toolkit**, **shadcn/ui**, and a strong **testing** and **CI** setup.

---

## Why tests (and structure) matter

A lot of this project will be written or refactored with AI. **Tests and automation are what keep the project sane.**

- **Unit tests** catch regressions in logic and components.
- **E2E tests** catch regressions in real user flows.
- **Structured commits** keep history readable and automate changelogs.
- **CI** runs the full suite in the cloud so nothing lands broken.

**Rule of thumb:** when adding or changing behavior, add or update the tests first (TDD), or right after. If you’re about to commit, run the test suite.

---

## Tech stack

| Area        | Choice              |
|------------|---------------------|
| Framework  | React 19 + Vite 7   |
| Language   | TypeScript          |
| State      | Redux Toolkit       |
| Backend    | Supabase            |
| UI         | shadcn/ui + Tailwind|
| Component dev / design system | Storybook + `src/components/ui` |
| Unit tests | Vitest + React Testing Library |
| E2E tests  | Playwright          |
| Lint       | ESLint              |

---

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run test         # Unit tests (Vitest, run once)
npm run test:watch   # Unit tests (watch)
npm run test:e2e     # E2E tests (Playwright; starts preview if needed)
npm run test:e2e:ui  # E2E with Playwright UI
npm run suite        # Full suite: lint + test + build (runs on pre-push)
npm run suite:e2e    # Full suite + E2E (use with PREPUSH_FULL=1 git push)
npm run storybook    # Storybook dev
npm run build-storybook
```

---

## Commit format & workflow (branch → PR → approve)

We **do not** commit directly to `main`. Work in a branch, open a PR, get approval, then merge. One feature per branch. Full rules (commit format, push standards, how this relates to CI/CD, and how to set up branch protection): **[docs/COMMITS_AND_WORKFLOW.md](docs/COMMITS_AND_WORKFLOW.md)**.

## Commit format (Conventional Commits)

All commits follow **Conventional Commits** so history stays consistent and tools can generate changelogs.

**Format:** `type(scope?): description`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**

```text
feat(auth): add login form
fix(api): handle 404 from Supabase
docs: update README with E2E instructions
test(counter): add unit tests for slice
chore(deps): bump react to 19.2
ci: run E2E on PR
```

**Enforced:** [commitlint](https://commitlint.js.org/) runs on every commit (Husky `commit-msg` hook); invalid messages are rejected. **Commit often:** after each logical change or about every 10–15 minutes so history stays clear and rollbacks are easy.

---

## CI/CD

**GitHub Actions** run in the cloud:

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) – On every push and every PR: lint, unit tests, build, E2E.
- **Deploy** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) – **Only on push to `main`** (after a merge). Automatically deploys to **production** (Vercel).

So: merge to `main` → deploy workflow runs → prod is updated. See [`.github/README.md`](.github/README.md) for workflow details and the **repo secrets** needed for deploy (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/README.md](docs/README.md) | Index of all docs. |
| [docs/COMMITS_AND_WORKFLOW.md](docs/COMMITS_AND_WORKFLOW.md) | Branch/PR/approval, Conventional Commits, CI/CD, branch protection. |
| [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) | Local, staging, production; Supabase and Vercel. |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens, components, Storybook; stakeholders. |
| [.github/README.md](.github/README.md) | GitHub Actions and deploy setup. |

---

## Project layout

```text
src/
  components/ui/   # Design system (shadcn + custom)
  lib/             # Utils, Supabase client
  store/           # Redux store and slices
  test/            # Vitest setup
  stories/         # Storybook stories
e2e/               # Playwright E2E tests
docs/              # All project docs (see Documentation above)
.husky/            # Pre-commit / pre-push hooks
.storybook/        # Storybook config
.github/workflows/ # CI and deploy
Dockerfile         # Docker verify + optional serve
```

---

## Local and cloud parity (same env everywhere)

So local and CI/cloud behave the same:

1. **Node version** – Use the version in [`.nvmrc`](.nvmrc) (e.g. `nvm use` or `fnm use`). CI should use the same version.
2. **Lockfile** – Commit `package-lock.json` and run `npm ci` in CI (and in Docker) so everyone gets the same dependency tree.
3. **Optional: Docker** – Run the same lint + unit test + build inside a container so your machine matches the cloud.

**Is Docker worth it for React?** For a static React app, Docker doesn’t change how the app runs in production (you’re still serving static files). It’s useful for **parity**: same Node, same OS layer, same steps. That way “works in Docker locally” means “will work in CI/cloud.” When you add a backend (e.g. Supabase Edge Functions or a Node API), Docker helps even more for running that the same locally and in production.

**Commands:**

```bash
# Use Node from .nvmrc (recommended)
nvm use   # or: fnm use

# “Exactly what CI does” in a container (lint + unit test + build)
npm run docker:verify

# Run the built app in a container (optional)
docker build --target serve -t voli-2-app .
docker run -p 8080:80 voli-2-app
# Open http://localhost:8080
```

E2E (Playwright) is not run inside this Docker image (it needs browser binaries). Run E2E locally with `npm run test:e2e` and in CI with the same command after the workflow installs Playwright browsers.

---

## Design system

One source of truth for look and feel: **tokens** (`src/index.css` `@theme`) → **components** (`src/components/ui`) → **Storybook** (docs and dev). Same design system in local, staging, and prod. For where this thinking fits (and how to show stakeholders staging vs the component catalog), see [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

## Env and Supabase

We use **local**, **staging**, and **production** (see [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)): local + staging share a **staging Supabase project**; production uses a **production Supabase project**. You can start with local + prod only and add staging when you want a deployed “pre-prod” environment.

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` – use your **staging** project URL for local dev
- `VITE_SUPABASE_ANON_KEY` – staging anon key

Never commit `.env`. For staging/production deployments, set the same vars in Vercel (Preview = staging, Production = prod).

---

## Quick start

```bash
nvm use               # or fnm use — match Node to .nvmrc
cp .env.example .env  # add your Supabase keys
npm install
npm run dev
```

Run tests before pushing: `npm run test && npm run test:e2e` (or `npm run suite:e2e` for the full suite including E2E).

For all docs and details, see [docs/README.md](docs/README.md).
