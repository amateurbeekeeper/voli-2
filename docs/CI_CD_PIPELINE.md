# CI/CD Pipeline (full layout)

Nx monorepo with web app + design system (workspace lib, no npm publish). Tests are project-scoped: each project runs its own tests (web: unit, e2e; design-system: unit, Storybook tests). No separate standalone test Docker—tests run as part of each project's pipeline.

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

Tests live in and belong to their project. No separate "test container"—each project runs its own.

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

## No separate test Docker

There is no standalone `test.Dockerfile` or generic test container. Tests run as part of each project:

- **Web app:** Run `web:lint`, `web:build`, `web:test:unit`, `web:test:e2e` in the same job (Node in GH Actions or in the web build Docker context if you want env parity).
- **Design system:** Run `design-system:lint`, `design-system:build`, `design-system:test:unit`, `design-system:test:storybook` in the same job.

Docker is used for **deployable artifacts** (app image, Storybook image), not for a separate test runner. If you want local/CI parity, each project can define its own build+test in a shared Node image or in the project’s Docker build stage, but tests stay scoped to the project.

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

## Platform options (where containers run)

| Platform     | Staging        | Prod   |
|-------------|----------------|--------|
| **Railway** | Auto from PR   | Auto from main |
| **Render**  | Preview envs   | Prod service   |
| **Fly.io**  | `fly deploy` per branch | `fly deploy` from main |

---

## Design system (no npm)

- Lives in `libs/design-system`
- Web app depends on it: `"@voli/design-system": "workspace:*"`
- At build time: Nx builds lib, app bundles it in
- Deployed app always has design system from same commit
