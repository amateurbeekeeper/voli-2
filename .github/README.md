# GitHub Actions & repo automation

CI and automation for this repo live here.

## Workflows

| File | What it does |
|------|----------------|
| [workflows/ci.yml](workflows/ci.yml) | Runs the **full suite** (lint, unit tests, build, E2E) on **every push to any branch** and every PR targeting `main`/`master`. |
| [workflows/deploy.yml](workflows/deploy.yml) | Runs **only on push to `main`/`master`** (i.e. after a merge). Deploys to **production** (Vercel). |

**Flow:** Branch → PR → CI passes → approval → merge to `main` → deploy workflow runs → prod is updated.

**Deploy setup:** Add these repo secrets in **Settings → Secrets and variables → Actions** so [workflows/deploy.yml](workflows/deploy.yml) can deploy to Vercel:

- `VERCEL_TOKEN` – [Vercel token](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` – Team or user ID (from Vercel project settings or `vercel link` + `.vercel/project.json`)
- `VERCEL_PROJECT_ID` – Project ID (same place)

If you use Netlify, Cloudflare Pages, or another host, replace the deploy step in `deploy.yml` with their action or a script that uploads `dist/` after a build step.

## Local: full suite on every push (with optional E2E flag)

Before each push, a **pre-push hook** (Husky) runs the full suite locally so you don’t push broken code:

- **Default:** `lint` + unit `test` + `build` (script: `npm run suite`).
- **With E2E:** `PREPUSH_FULL=1 git push` runs the same plus Playwright E2E (`npm run suite:e2e`).

Pre-commit runs a quick check (`lint` + `test` only). Hooks live in [`.husky/`](../.husky/).

**See also:** [docs/COMMITS_AND_WORKFLOW.md](../docs/COMMITS_AND_WORKFLOW.md) (branch/PR/CI/CD), [docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md) (local/staging/prod), [README](../README.md).
