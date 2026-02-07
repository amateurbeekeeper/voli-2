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

You need **two Web Services** (one for the app, one for Storybook). Both use Docker and the same repo.

**Account:** [render.com](https://render.com) → sign up (GitHub login works). Connect the `voli-2` repo when prompted.

---

### Service 1: Web app (core-web-app)

1. **New → Web Service** → select repo `voli-2`.
2. **Configure:**
   - **Name:** e.g. `voli-2` or `voli-2-web`
   - **Region:** pick one
   - **Branch:** `main`
   - **Environment:** **Docker**
   - **Dockerfile path:** `docker/web.Dockerfile`
   - **Docker context:** root (leave default; Render builds from repo root).
3. **Preview environments:** Settings → **Preview Environments** → enable **Auto-Deploy Previews** for **Pull Requests**. Save.
4. **Env vars (if you use Supabase):** Environment → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`  
   You can set different values for Preview vs Production.
5. **Create Web Service.** Prod: `https://<service-name>.onrender.com`. PRs get a preview URL like `https://<service-name>-pr-123.onrender.com`.

---

### Service 2: Storybook (design-system)

1. **New → Web Service** → same repo `voli-2`.
2. **Configure:**
   - **Name:** e.g. `voli-2-storybook`
   - **Region:** same as web app (optional)
   - **Branch:** `main`
   - **Environment:** **Docker**
   - **Dockerfile path:** `docker/storybook.Dockerfile`
   - **Docker context:** root
3. **Preview environments:** Enable **Auto-Deploy Previews** for **Pull Requests**. Save.
4. **Create Web Service.** No env vars needed unless you add them later.

---

### What you don’t need to provide yet

- **No API keys for “Render in CI”** — Render will build and deploy from GitHub (watch repo + branch). Our GitHub Actions already run lint/test/build and Docker build; they don’t push to Render. Deploys are triggered by Render when you push or open a PR.
- **Secrets** — Only add Supabase (or other) env vars in the Render dashboard for the **web app** service if the app needs them at build or runtime.

When you’re ready to wire Render, create the two services above; if you hit a snag (e.g. Dockerfile path, branch, or env vars), share what you see and we can adjust.

---

### Linking Render to GitHub Actions (deploy only when CI passes)

CI is wired so that **after** lint, test, build, and E2E pass on a **push to main**, it triggers a Render deploy via the Render API, then **waits until the deploy completes**. If Render reports success → Actions run is green. If Render deploy fails → Actions run fails. No more fire-and-forget: the CI status reflects the actual deploy outcome.

**What you add in GitHub:**

1. Repo → **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - **`RENDER_API_KEY`** — Render Dashboard → Account Settings → API Keys → create key
   - **`RENDER_CORE_WEB_APP_SERVICE_ID`** — Web app: Render Dashboard → your web service → URL has `.../srv-xxx`
   - **`RENDER_SERVICE_ID_STORYBOOK`** — Storybook: same, from the Storybook service

Once those are set, every **push to main** that passes CI will trigger deploys for both services. The deploy job polls Render every 15s until status is `live` or `failed`. PRs do not trigger deploys; only `main` (or `master`).

**Local/debug:** Run `npm run render:deploy-and-wait` with `RENDER_CORE_WEB_APP_SERVICE_ID` set to test the web app. Use `npm run render:fetch-logs` to pull deploy logs (add `RENDER_API_KEY` and `RENDER_CORE_WEB_APP_SERVICE_ID` to `.env`).

**Overlapping deploys:** If Render says "Another deploy started. To avoid canceling active deploys…", go to each service → **Settings** → **Overlapping Deploy Policy**. Use **Queue deploys** so a new trigger waits for the current deploy to finish. If you use CI to trigger deploys, turn **off** Auto-Deploy on Render so only CI triggers; otherwise you get double deploys and cancellations.

**“One [preview] for every branch”**

- **Prod:** One deploy for `main` (triggered by Actions when CI passes, as above).
- **Previews:** In the Render dashboard, for each service turn on **Preview Environments** and set them to **Pull Requests**. Then every **pull request** gets its own preview URL (e.g. `voli-2-web-pr-42.onrender.com`). So you get one preview per branch that has a PR. Render doesn’t create a separate preview for every branch push without a PR; previews are per pull request.

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
