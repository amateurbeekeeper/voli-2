# Commit, branch & PR standards

This doc defines how we commit, push, and get code into `main`. The short version: **nothing goes to `main` without a branch, a PR, and an approval.**

---

## The rule: no direct commits to main

- **Do not** commit directly to `main`.
- All work happens in **branches**. One feature (or fix) = one branch.
- To get code into `main`: open a **Pull Request**, get it **approved**, then merge.
- CI must pass on the PR before merge (lint, unit tests, build, E2E).

This keeps `main` stable and gives us a clear history and review step.

---

## Workflow (branch → PR → approve → merge)

1. **Create a branch** from `main` (or from the latest `main`).
   ```bash
   git checkout main && git pull
   git checkout -b feat/your-feature-name
   ```
2. **Do your work** on that branch. Commit often using [Conventional Commits](#commit-format).
3. **Push the branch** and open a **Pull Request** against `main`.
   ```bash
   git push -u origin feat/your-feature-name
   ```
   Then open the PR in GitHub (or your host).
4. **CI runs** on the PR (lint, test, build, E2E). Fix any failures.
5. **Get at least one approval** from someone who can merge (or from the team policy you use).
6. **Merge** when CI is green and the PR is approved. Prefer “squash” or “rebase” so history stays clean.

Use one branch per feature or fix. When that’s merged, start the next from an updated `main`.

---

## Commit format (Conventional Commits)

Every commit message must follow **Conventional Commits** so history and changelogs stay consistent.

**Format:** `type(scope?): description`

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore` | `perf` | `ci`

**Examples:**

| Message | Use when |
|--------|----------|
| `feat(auth): add login form` | New feature |
| `fix(api): handle 404 from Supabase` | Bug fix |
| `docs: add workflow doc` | Docs only |
| `test(counter): add unit tests` | Tests only |
| `chore(deps): bump react` | Deps, tooling, no app change |
| `ci: run E2E on PR` | CI/config change |

**Detailed commit body (required):** Every commit must have a **body**: blank line after the first line, then what changed, why, and any decisions. Commitlint requires a non-empty body. These detailed messages are our decision log (no separate file). Example:

```
feat(auth): add login form

- Add LoginForm component using design system Button and Input.
- Wire to Supabase auth signInWithPassword.
- Decision: no "forgot password" in this PR; follow-up ticket.
```

**Enforcement:** [commitlint](https://commitlint.js.org/) runs on every `git commit` via the Husky `commit-msg` hook (see [.husky/commit-msg](../.husky/commit-msg) and [commitlint.config.js](../commitlint.config.js)). It rejects commits that don’t match the **first line** format or that have an **empty body**. The body is free form but must be present.

**Commit every change (Cursor):** When Cursor makes a code or doc change, it must commit that change (on the current branch) before moving on—change-by-change, not batched. Each commit is one coherent edit with a structured message. For human-made edits, the human commits (or Cursor can suggest).

**Commit structure (enforced):** Commitlint runs on every `git commit` and rejects messages that don’t follow the first-line format or that have an empty body. So every commit (from Cursor or human) must use the structure above.

---

## Pushing standards

- **Push to your branch**, not to `main`. Push after each logical commit or when you want a backup/CI run.
- **Open a PR** when the feature or fix is ready for review (or earlier for draft feedback).
- **Do not** push to `main` from your machine. Branch protection (see below) will block it.

**Full suite on every push:** A pre-push hook (Husky) runs the full suite locally before each push: lint, unit tests, and build. If anything fails, the push is blocked. To include E2E in that check, run:

```bash
PREPUSH_FULL=1 git push
```

CI also runs the full suite (including E2E) on every push to any branch in the cloud.

---

## Is this CI/CD?

- **CI (Continuous Integration)** = the automated checks that run when you push or open a PR (lint, unit tests, build, E2E). Our CI is in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). So: **yes, we use CI.**
- **The branch/PR/approval rule** = our **workflow policy**. It’s not “CI” by itself; it’s how we decide what is allowed into `main`. CI is the gate that must pass before merge.
- **CD (Continuous Deployment)** = after a PR is merged to `main`, we automatically deploy to production. Our CD is in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) (deploys to Vercel). Add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` so the workflow can deploy.

**Flow:** Branch → PR → CI passes → approval → merge to `main` → deploy runs → prod updated.

---

## Enforcing “no direct push to main”

GitHub (or your host) must be configured so that:

- No one can push directly to `main`.
- Changes to `main` only happen via a **Pull Request**.
- At least **one approval** is required before merge.
- **Status checks** (our CI) must pass before merge.

**On GitHub:**

1. Repo → **Settings** → **Branches**.
2. **Add branch protection rule** (or **Add rule** if using rulesets).
3. Branch name pattern: `main` (or `master` if that’s your default).
4. Enable:
   - **Require a pull request before merging** (and set “Require approvals” to at least 1).
   - **Require status checks to pass before merging** and select the CI workflow (e.g. `lint-test-build`, `e2e`).
5. Save.

After this, pushes directly to `main` are rejected; only approved, CI-green PRs can merge.

---

## Summary

| What | Standard |
|------|----------|
| **Where you work** | On a branch (e.g. `feat/thing`), never directly on `main`. |
| **Commit format** | Conventional Commits + required detailed body. Enforced by commitlint (Husky `commit-msg`). |
| **Cursor commits** | After every code/doc change Cursor makes, it commits that change (change-by-change) with a structured message. |
| **Getting into main** | Open PR → CI passes → get approval → merge. |
| **One feature** | One branch, one PR. |
| **CI** | Runs on every push/PR; must pass before merge. |
| **CD** | Merge to `main` → deploy workflow runs → prod updated (Vercel). |

**See also:** [README](../README.md) (commit format, CI/CD), [ENVIRONMENTS.md](ENVIRONMENTS.md) (local/staging/prod), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (tokens, components, Storybook), [.github/README.md](../.github/README.md) (workflows).
