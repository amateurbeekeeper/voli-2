# Backlog

## Main (next phase, after merge to main)

1. **Nx monorepo** — Restructure repo:
   - `apps/core-web-app` — main web app (current `src/` + Vite app)
   - `libs/design-system` — components + Storybook (current `src/components/ui` + stories)
   - Design system consumed via workspace ref (no npm publish). Build bundled into app.

2. **Docker for each** — Dockerfile for core-web-app, Dockerfile for design-system (Storybook static). Same env locally and in CI.

3. **GitHub Actions per project** — CI pipelines:
   - Web app: lint self, build self, test self (unit, e2e), staging preview on PR, prod on merge.
   - Design system: lint self, build self, test self (unit, Storybook), Storybook staging preview on PR, prod on merge.
   - Project-scoped tests; no standalone test Docker.
   - See [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md).

4. **Render hosting** — Connect Render for staging (PR preview URLs) and prod. Step-by-step in [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md#render-setup-how-to-add-it).

---

## Next (after main)

- Test full flow/flows.
- Figure out what types of tests you really want.

---

## Other

- Create components with AI, tweak manually. Fill out initial component library.
- Connect Supabase.
- Process / working-with-AI / .cursor/rules improvements for workflow.
- Accessibility.
