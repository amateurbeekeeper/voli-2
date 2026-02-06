# CI/CD Pipeline (full layout)

Nx monorepo with web app + design system (workspace lib, no npm publish). Docker everywhere. Staging on PR, prod on merge to main.

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
│   ├── docker-compose.yml      # Local dev, app, storybook
│   └── nginx/
│       ├── app.conf            # SPA routing for app
│       └── storybook.conf      # Storybook static
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Full pipeline
└── ...
```

---

## 1. Local development

### App (with design system bundled)
```bash
# Option A: Native (faster)
nx serve web

# Option B: Docker (same as CI)
docker compose -f docker/docker-compose.yml up web-dev
```

### Storybook (design system docs)
```bash
# Option A: Native
nx run design-system:storybook

# Option B: Docker
docker compose -f docker/docker-compose.yml up storybook-dev
```

### Tests (unit + Storybook)
```bash
# Native
nx run-many -t test

# Docker (same as CI)
docker compose -f docker/docker-compose.yml run --rm test
```

---

## 2. CI pipeline (GitHub Actions)

**Triggers:** Push to any branch, PR to `main` or `staging`

### Job 1: Lint
- Checkout
- `docker build -f docker/test.Dockerfile -t voli-test .` (or use Node directly)
- `docker run --rm voli-test npm run lint`

### Job 2: Test
- Same image
- `docker run --rm voli-test npm run test -- --run`
- (If Storybook has interaction/visual tests: `npm run test:storybook` or Chromatic)

### Job 3: Build app
- Build design-system lib (or Nx builds it as dep)
- Build web app
- Output: `dist/apps/web` (or equivalent)

### Job 4: Build Storybook
- Build Storybook static: `nx run design-system:build-storybook`
- Output: `dist/storybook-static` (or equivalent)

### Job 5 (conditional): Deploy staging (on PR)
- **If PR targets `main` or `staging`:**
  - Build app Docker image
  - Build Storybook Docker image
  - Push images to registry (GHCR, Docker Hub, or platform registry)
  - Deploy to staging:
    - App → `staging-app.yourapp.com` (or platform URL)
    - Storybook → `staging-storybook.yourapp.com`
- Use platform (Railway, Render, Fly.io) or your own infra to run containers

### Job 6 (conditional): Deploy prod (on merge to main)
- **Only when PR merged to `main`:**
  - Same build steps
  - Deploy to prod:
    - App → `app.yourapp.com` or `yourapp.com`
    - Storybook → `storybook.yourapp.com` (optional; could be staging-only)

---

## 3. Flow summary

| Event | What runs | Deploy |
|-------|-----------|--------|
| Push to feature branch | Lint, test, build app, build Storybook | — |
| PR opened/updated (→ main or staging) | Same + deploy to staging | App + Storybook staging URLs |
| PR merged to main | Same + deploy to prod | App + Storybook prod |

---

## 4. Docker images

### `web.Dockerfile` (app)
- Stage 1: Node — `nx build web` (builds design-system as dep, then app)
- Stage 2: nginx — copy `dist/apps/web` into nginx, serve on 80

### `storybook.Dockerfile` (Storybook)
- Stage 1: Node — `nx run design-system:build-storybook`
- Stage 2: nginx — copy `storybook-static` into nginx, serve on 80

### `test.Dockerfile` (CI + local test)
- Node image, copy repo, `npm ci`
- CMD: `npm run test -- --run` (or `nx run-many -t test`)
- Used for lint + test in CI; same image locally for parity

---

## 5. Platform options (where containers run)

| Platform | Staging | Prod | Notes |
|----------|---------|------|-------|
| **Railway** | Auto from PR | Auto from main | Connect repo, set Dockerfile per service |
| **Render** | Preview envs per PR | Prod service | Similar |
| **Fly.io** | `fly deploy` per branch | `fly deploy` from main | More manual, flexible |
| **Self-hosted** | Your server | Your server | You run `docker pull` + `docker run`; need reverse proxy |

---

## 6. Branch strategy

- `main` — prod
- `staging` — optional; staging deploys can be PR previews only
- Feature branches — `feat/...`, `fix/...` — PR → staging deploy, then merge → prod

---

## 7. Design system (no npm)

- Lives in `libs/design-system`
- Web app depends on it: `"@voli/design-system": "workspace:*"`
- At build time: Nx builds lib, app bundles it in
- Deployed app always has latest design system from same commit; no separate publish
