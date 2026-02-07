# voli-2

**Nx monorepo** with React + TypeScript + Vite: **core-web-app**, **design-system** (Storybook), **Supabase**, **Redux Toolkit**, **styled-components**, and strong **testing** and **CI** setup.

---

## AI development philosophy

We optimize for **AI visibility and autonomy** so the human is never stuck in a loop.

- **All critical information locally.** Logs (CI, deploy, tests) are fetchable into the workspace. When something fails, the AI can read the logs and fix it—no dead ends.
- **No stuck loops.** If CI fails → fetch logs → diagnose → fix → test locally → push again. Same for deploys and tests. The AI can do this without the human manually copying logs or guessing.
- **Less friction = better.** The more the AI can see and do autonomously (fetch logs, run tests, trigger deploys), the less the human has to unblock things.

**Commands that put info where the AI can read it:**

- `npm run ci:fetch-logs` — Pull GitHub Actions run log into `logs/ci-<id>.log` when CI fails.
- `npm run render:fetch-logs` — Pull Render deploy status + build logs after a deploy.
- `npm run render:fetch-logs:runtime` — Pull Render live staging app logs (ad-hoc).
- Local runs (lint, build, test, e2e) write to `logs/` automatically. See [docs/LOGGING.md](docs/LOGGING.md).

This philosophy is encoded in [`.cursor/rules/ai-development-philosophy.mdc`](.cursor/rules/ai-development-philosophy.mdc). Add scripts or integrations whenever a failure mode exists where the AI can't access the logs.

---

## Why tests (and structure) matter

A lot of this project will be written or refactored with AI. **Tests and automation are what keep the project sane.**

- **Unit tests** catch regressions in logic and components.
- **E2E tests** catch regressions in real user flows.
- **Structured commits** keep history readable and automate changelogs.
- **CI** runs the full suite in the cloud so nothing lands broken.

**Rule of thumb:** when adding or changing behavior, add or update the tests first (TDD), or right after. If you're about to commit, run the test suite.

---

## Tech stack

| Area        | Choice                    |
|-------------|---------------------------|
| Monorepo    | Nx                        |
| Framework   | React 19 + Vite 7         |
| Language    | TypeScript                |
| State       | Redux Toolkit             |
| Backend     | Supabase                  |
| UI          | styled-components + tokens|
| Design system | `@voli/design-system` (lib) + Storybook |
| Unit tests  | Vitest + React Testing Library |
| E2E tests   | Playwright                |
| Lint        | ESLint                    |

---

## Project structure

```text
apps/
  core-web-app/        # Main web app (Vite + React, Redux, Supabase)
  core-web-app-e2e/    # Playwright E2E tests
libs/
  design-system/       # UI components, tokens, Storybook
docker/
  web.Dockerfile       # App image (nginx)
  storybook.Dockerfile # Storybook static image (nginx)
  docker-compose.yml   # Run both locally
docs/                  # Project docs
.github/workflows/     # CI and deploy
```

---

## Commands

```bash
npm run dev            # Dev server (core-web-app)
npm run build          # Production build (web app + design-system)
npm run preview        # Preview production build
npm run lint           # ESLint
npm run test           # Unit tests (Vitest, run once)
npm run test:watch     # Unit tests (watch)
npm run test:e2e       # E2E tests (Playwright; starts preview if needed)
npm run test:e2e:ui    # E2E with Playwright UI
npm run suite          # Full suite: lint + test + build (runs on pre-push)
npm run suite:e2e      # Full suite + E2E (use with PREPUSH_FULL=1 git push)
npm run storybook      # Storybook dev
npm run build-storybook
```

**Nx (direct):**

```bash
npx nx run core-web-app:dev
npx nx run core-web-app:build
npx nx run design-system:storybook
npx nx run design-system:build-storybook
```

**Docker:**

```bash
npm run docker:web       # Build web app image
npm run docker:storybook # Build Storybook image
npm run docker:up        # Run both (web:8080, storybook:8081)
npm run docker:verify    # Lint + test + build in container (parity check)
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
docs: update readme with e2e instructions
test(counter): add unit tests for slice
chore(deps): bump react to 19.2
ci: run e2e on pr
```

**Enforced:** [commitlint](https://commitlint.js.org/) runs on every commit (Husky `commit-msg` hook); invalid messages are rejected. **Subject must be lower-case.** **Commit often:** after each logical change or about every 10–15 minutes so history stays clear and rollbacks are easy.

---

## CI/CD

**GitHub Actions** run in the cloud:

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) – On every push and every PR: lint, unit tests, build (web + Storybook), E2E, Docker build. On push to `main`, triggers Render deploy and **waits for success/failure** (requires `RENDER_API_KEY`, `RENDER_CORE_WEB_APP_SERVICE_ID`, `RENDER_SERVICE_ID_STORYBOOK`).
- **Deploy** ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) – Only on push to `main`. Deploys to **Vercel** (requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

For **Render** (Docker services) and deploy flow, see [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md).

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/README.md](docs/README.md) | Index of all docs. |
| [docs/COMMITS_AND_WORKFLOW.md](docs/COMMITS_AND_WORKFLOW.md) | Branch/PR/approval, Conventional Commits, CI/CD, branch protection. |
| [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) | Local, staging, production; Supabase and Vercel. |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens, components, Storybook; stakeholders. |
| [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md) | Full CI/CD layout, Render setup (deploy + wait). |
| [.github/README.md](.github/README.md) | GitHub Actions and deploy setup. |

---

## Local and cloud parity (same env everywhere)

1. **Node version** – Use the version in [`.nvmrc`](.nvmrc) (e.g. `nvm use` or `fnm use`). CI uses the same.
2. **Lockfile** – Commit `package-lock.json` and run `npm ci` in CI and Docker.
3. **Docker** – `npm run docker:verify` runs lint + test + build in a container. `npm run docker:up` runs the web app and Storybook locally.

---

## Design system

Design system lives in **`libs/design-system`**: tokens (`src/styles/tokens.css`) → components (`src/lib`, styled-components) → Storybook. The app consumes it via `@voli/design-system`. See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

---

## Env and Supabase

We use **local**, **staging**, and **production** (see [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md)): local + staging share a **staging Supabase project**; production uses a **production Supabase project**.

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` – use your **staging** project URL for local dev
- `VITE_SUPABASE_ANON_KEY` – staging anon key

Never commit `.env`. For staging/production deployments, set the same vars in Vercel or Render (Preview = staging, Production = prod).

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
