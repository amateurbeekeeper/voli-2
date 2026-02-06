# Design system: where it lives and how it fits

The design system is the single source of truth for how the product looks and behaves. It sits **above** environments (local / staging / prod): the same design system is used everywhere; environments only change data and deployment.

---

## The layers (tokens → components → app)

| Layer | What it is | Where it lives |
|-------|------------|----------------|
| **1. Tokens** | Colors, spacing, typography, radius, shadow. Named, semantic values. | `src/index.css` (`@theme { ... }`) and Tailwind config if you extend it. |
| **2. Components** | Reusable UI built *only* on tokens (no one-off hex codes or magic numbers). | `src/components/ui/` (shadcn, plus any custom). |
| **3. Documentation** | Catalog of components and usage so the team and stakeholders can see and approve. | **Storybook** (`npm run storybook`; build: `npm run build-storybook`). |
| **4. App** | Screens and flows that use design-system components only. | `src/` (pages, features). |

Rule: **New UI = use or extend tokens, use or add components in `components/ui`, document in Storybook, then use in the app.** No random inline styles or one-off classes that bypass tokens.

---

## How this fits with local / staging / production

- **Environments** (see [ENVIRONMENTS.md](ENVIRONMENTS.md)) decide *where* the app runs and *which database* it talks to. They do **not** change the design system.
- **Local** – You build and refine the design system (tokens, components, Storybook). Same design system as staging and prod.
- **Staging** – Deployed app + staging DB. Good for showing **flows and integration** to stakeholders. Same design system as prod.
- **Production** – Live app. Same design system.

So: **one design system, three environments.** Staging is where you show stakeholders the real deployed experience (and optional: a deployed Storybook for the component catalog).

---

## Showing stakeholders: app vs design system

| What you want to show | Where |
|------------------------|--------|
| **Full app flows** (login, dashboards, real data) | **Staging** – deploy the app with staging Supabase; share the staging URL. |
| **Component catalog** (buttons, forms, patterns without app logic) | **Storybook** – run locally (`npm run storybook`) or deploy it (e.g. Chromatic, or `build-storybook` to a path like `staging.myapp.com/storybook`). |

So:
- **Staging** = “here’s the real product, with real-ish data, before we ship to prod.” Design system is embedded in that app.
- **Storybook** (local or deployed) = “here’s our design system: every component and variant.” Useful for design reviews and “can we have this button in blue?” without running the full app.

You can do both: share staging for flows, and a deployed Storybook for the design system itself.

---

## Tokens (single source of truth)

Tokens live in **`src/index.css`** under `@theme { }`. Current semantic color tokens include:

- `--color-background`, `--color-foreground`
- `--color-primary`, `--color-primary-foreground`
- `--color-secondary`, `--color-accent`, `--color-destructive`
- `--color-input`, `--color-ring`

Components reference these (e.g. `bg-primary`, `text-primary-foreground`), not raw hex/oklch in the component. When you need a new color or a new semantic role, add a token first, then use it in components.

You can extend the theme with:

- **Spacing** – e.g. a scale (`--spacing-1` … `--spacing-12`) if you want consistency.
- **Radius** – e.g. `--radius-sm`, `--radius-md`, `--radius-lg` for borders/cards.
- **Typography** – font families and sizes if you want them centralized.

Keep tokens **semantic** (e.g. `primary`, `destructive`) rather than “blue” or “red” so the whole look can change in one place (e.g. dark mode or rebrand).

---

## Components and Storybook

- **`src/components/ui/`** – All shared UI (shadcn + custom). These are the only building blocks for app UI; they use tokens and Tailwind only.
- **Stories** – Next to components or in `src/stories/`. Every component (or at least every public variant) should have a story so the design system is visible and testable in Storybook.

When adding a new component:

1. Add it under `components/ui/` (or a clear subfolder).
2. Use theme tokens and existing tokens; no hard-coded colors/spacing.
3. Add a Storybook story (and variants that matter).
4. Use the component in the app; don’t duplicate its look with one-off markup or styles.

---

## Summary

| Question | Answer |
|----------|--------|
| Where does design system thinking come in? | **Tokens** (index.css) → **Components** (components/ui) → **Docs** (Storybook) → **App** (features/pages). Same system in local, staging, and prod. |
| How do we show stakeholders? | **Staging** for the real app and flows; **Storybook** (local or deployed) for the component/design-system catalog. |
| How do we keep it sane? | One source of truth for tokens; all UI through design-system components; document in Storybook; no one-off styles. |

**See also:** [ENVIRONMENTS.md](ENVIRONMENTS.md) (local / staging / prod), [COMMITS_AND_WORKFLOW.md](COMMITS_AND_WORKFLOW.md) (branch/PR/CI), [README](../README.md) (Storybook commands and project layout).
