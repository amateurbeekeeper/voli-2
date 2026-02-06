# CI/CD Pipeline (full layout)

Nx monorepo with web app + design system (workspace lib, no npm publish). Tests are project-scoped: each project runs its own tests (web: unit, e2e; design-system: unit, Storybook tests). 

---

## Repo structure (target)

```
voli-2/
├── apps/
│   └── web/                    # Main web app (Vite + React)
├── libs/
│   └── design-system/          # Components + Storybook (workspace lib, bundled into app)
├── docker/
│   ├── web.Dockerfile          # App image (build + nginx)
│   ├── storybook.Dockerfile    # Storybook static image (build + nginx)
│   └── docker-compose.yml      # Local dev, app, storybook
├── .github/
│   └── workflows/
│       ├── web-app.yml         # CI/CD for web app
│       └── design-system.yml   # CI/CD for design system (Storybook)
└── ...
```

---

## Test model (project-scoped)

Tests live in and belong to their project. 

| Project        | Test types              | Commands (e.g.)                    |
|----------------|-------------------------|------------------------------------|
| **web**        | unit, e2e               | `nx run web:test:unit`, `nx run web:test:e2e` |
| **design-system** | unit, Storybook tests | `nx run design-system:test:unit`, `nx run design-system:test:storybook` |

---

## Web app CI/CD (GitHub Actions)

**Assumption:** Design system is built and stable (built first or cached). Web app consumes it via workspace ref.

### Pipeline steps (in order)

1. **Lint self** — `nx run web:lint`
2. **Build self** — `nx run web:build` (design-system built as dep if needed)
3. **Test self** — run each type in sequence:
   - `nx run web:test:unit`
   - `nx run web:test:e2e` (or whatever e2e target; lock in unit + e2e for now)
4. **Staging preview** (on PR) — Build app Docker image, deploy to staging → live URL to view and test
5. **Prod deploy** (on merge to main) — Deploy built app to prod

### Triggers

- Push to branch: steps 1–3
- PR opened/updated (→ main): steps 1–4 (staging preview)
- PR merged to main: step 5 (prod)

---

## Design system CI/CD (GitHub Actions)

Same pattern: lint, build, test self, staging preview, prod on merge.

### Pipeline steps (in order)

1. **Lint self** — `nx run design-system:lint`
2. **Build self** — `nx run design-system:build` + `nx run design-system:build-storybook`
3. **Test self** — run tests associated with the design library:
   - `nx run design-system:test:unit` (component/unit tests)
   - `nx run design-system:test:storybook` (Storybook interaction/visual tests if present)
4. **Staging preview** (on PR) — Build Storybook Docker image, deploy → live Storybook URL
5. **Prod deploy** (on merge to main) — Deploy Storybook to prod (or keep staging-only)

### Triggers

- Push to branch: steps 1–3
- PR opened/updated (→ main): steps 1–4 (staging Storybook preview)
- PR merged to main: step 5 (prod Storybook)

---


## Flow summary

| Event                    | Web app                              | Design system                                   |
|--------------------------|--------------------------------------|-------------------------------------------------|
| Push to branch           | Lint, build, test (unit, e2e)        | Lint, build, test (unit, storybook)             |
| PR opened/updated        | Same + staging app preview URL       | Same + staging Storybook preview URL            |
| PR merged to main        | Deploy to prod                       | Deploy Storybook to prod                        |

---

## Docker images (deploy only)

### `web.Dockerfile` (app)
- Stage 1: Node — `nx build web` (builds design-system as dep, then app)
- Stage 2: nginx — copy `dist/apps/web`, serve on 80

### `storybook.Dockerfile` (Storybook)
- Stage 1: Node — `nx run design-system:build-storybook`
- Stage 2: nginx — copy `storybook-static`, serve on 80

---

## The missing piece: deployment platform

**GitHub Actions does not host your app.** It runs jobs (lint, test, build, push). The thing that actually puts your app live and gives you URLs is a **deployment platform**.

You must connect one of these (or similar):

| Platform   | What it does                                   | Free tier |
|------------|-------------------------------------------------|-----------|
| **Railway**| Runs your Docker image, gives you a URL         | Yes       |
| **Render** | Same; preview envs per PR, prod from main       | Yes       |
| **Fly.io** | Same; you run `fly deploy` from CI              | Yes       |
| **Vercel** | Hosts static/Node apps (less Docker-native)     | Yes       |

**Flow:** GitHub Actions builds the Docker image, pushes to a registry (GHCR, Docker Hub), then triggers the platform to pull and run it—or the platform watches the repo and builds itself. Either way, **the platform is what serves traffic and gives you staging/prod URLs.**

---

## Render setup (how to add it)

1. **Create account:** [render.com](https://render.com) → sign up (GitHub login works).

2. **New Web Service:**
   - Dashboard → New + → Web Service
   - Connect your GitHub repo (authorize Render if needed)
   - Choose the `voli-2` repo

3. **Configure the service:**
   - **Name:** `voli-2` (or whatever)
   - **Region:** pick closest to you
   - **Branch:** `main` (prod deploys from here)

   **Option A – Static Site (simplest):**
   - **Environment:** Static Site
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist`

   **Option B – Docker:**
   - **Environment:** Docker
   - Render uses your root `Dockerfile`. Ensure it exposes port 80 (your `serve` stage does).
   - If the build stage runs lint/test and they fail, the deploy fails (which is good).

4. **Enable preview environments (PR links):**
   - Service → Settings → scroll to **Preview Environments**
   - Enable **Auto-Deploy Previews**
   - Choose: **Pull Requests** (each PR gets a URL)
   - Save

5. **Env vars (if needed):**
   - Service → Environment → add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.
   - Use different values for Preview vs Production if needed

6. **Deploy:**
   - Click **Create Web Service**. Render builds and deploys.
   - Prod URL: `https://voli-2.onrender.com` (or your custom domain)
   - PR URL: `https://voli-2-pr-42.onrender.com` (or similar)

Render will auto-deploy on pushes to `main` and on new/updated PRs. No GitHub Actions deploy step needed unless you want to gate deploys behind CI passing.

---

## Platform options (where containers run)

| Platform     | Staging        | Prod   |
|-------------|----------------|--------|
| **Railway** | Auto from PR   | Auto from main |
| **Render**  | Preview envs   | Prod service   |
| **Fly.io**  | `fly deploy` per branch | `fly deploy` from main |

---

## Logs and debugging CI failures

- **Every CI run** uploads the full run log as an artifact (`ci-logs-<run-id>`). Download from Actions → run → Artifacts.
- **Fetch into workspace:** Run `npm run ci:fetch-logs` (or `ci:fetch-logs <run-id>`) to pull the latest run's log into `logs/ci-<run-id>.log`. Requires `gh` CLI + `gh auth login`. Cursor can then read that file to see the full failure and fix it. (TODO: update this to put those logs in a sub folder called deployment or ci/cd or something)

---

## Design system (no npm)

- Lives in `libs/design-system`
- Web app depends on it: `"@voli/design-system": "workspace:*"`
- At build time: Nx builds lib, app bundles it in
- Deployed app always has design system from same commit
