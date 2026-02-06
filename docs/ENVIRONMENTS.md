# Local, staging & production

We use three environments so we can test safely before production. You can start with **local + production** and add **staging** when you want a “deployed but not prod” place to test.

---

## The three environments

| Environment | What it is | When you use it |
|-------------|------------|------------------|
| **Local** | Your machine (`npm run dev`). Uses `.env` (or `.env.local`). | Day-to-day dev and quick tests. |
| **Staging** | A deployed app + a **staging Supabase project**. Same code as prod, different DB and URL. | Test the real deployed app and real DB without touching prod. |
| **Production** | Live app + **production Supabase project**. | Real users only. |

**Why staging?**  
Local catches most bugs, but some only show up when the app is built and deployed (routing, env at build time, CDN, etc.). Staging gives you a “prod-like” URL and a separate database so you can test that flow before merging to `main` and hitting production.

**Is it worth it?**  
- **Local + production only** is enough for small/solo projects.  
- **Adding staging** is worth it when you want to “see it deployed” and “hit a real DB” before going to prod, and to show you care about release safety. For a portfolio or “how I work” demo, having all three is a strong signal.

---

## Supabase: two projects (staging + production)

Create **two Supabase projects** in the dashboard:

1. **Staging** – e.g. `myapp-staging`. Use this for local (optional) and for the staging deployment.
2. **Production** – e.g. `myapp` or `myapp-prod`. Use this only for the production deployment.

**Local** can point at either:

- **Staging Supabase** – simpler; one “non-prod” project for local + staging.
- **Production Supabase** – not recommended; you can corrupt real data.
- **Supabase local (Docker)** – full local stack; more setup. Optional.

So in practice: **staging DB** for local and staging app, **production DB** only for production app.

---

## Env vars per environment

The app only reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Which backend you hit is decided by which values you set where.

| Where | How |
|-------|-----|
| **Local** | `.env` or `.env.local` with staging (or dev) Supabase URL + anon key. |
| **Staging (deployed)** | Vercel “Preview” (or a “Staging” env) with **staging** Supabase URL + anon key. |
| **Production (deployed)** | Vercel “Production” with **production** Supabase URL + anon key. |

See [.env.example](../.env.example) for a template. Never commit real keys; `.env` is in [.gitignore](../.gitignore).

---

## Vercel: Preview = staging, Production = prod

- **Production** – Deploys from `main`. Use **production** Supabase in Vercel **Production** env vars.
- **Preview** – Deploys from PRs (and optionally from a `staging` branch). Use **staging** Supabase in Vercel **Preview** env vars.

So:

- Every PR gets a preview URL that talks to the **staging** DB.
- Merging to `main` deploys to prod and that build uses the **production** DB.

If you want a single long-lived **staging URL** (e.g. `staging.myapp.com`), you can add a branch `staging` and a second Vercel project that deploys that branch and uses staging Supabase. For most cases, “Preview = staging” is enough.

---

## Summary

| Goal | Setup |
|------|--------|
| **Local** | `.env` with **staging** Supabase; `npm run dev`. |
| **Staging (deployed)** | Vercel Preview env = **staging** Supabase; test on PR preview URLs. |
| **Production** | Vercel Production env = **production** Supabase; deploy from `main`. |

Optional: a dedicated `staging` branch + Vercel project for one fixed staging URL. Start with Preview = staging, add that later if you need it.

**See also:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (design system and stakeholders), [COMMITS_AND_WORKFLOW.md](COMMITS_AND_WORKFLOW.md) (branch/PR/deploy), [README](../README.md) (quick start).
