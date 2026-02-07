# Logging

We add **plenty of logging** so we can debug and so **Cursor can see what’s going on**. All logs that matter end up in the **`logs/`** directory (one file per source, overwritten each run so we don’t get millions of files). Cursor can read these to fix things itself.

---

## Log files (where Cursor can look)

| File | What it is | When it’s written |
|------|------------|-------------------|
| **`logs/dev-server.log`** | Terminal output from the Vite dev server. Server output, HMR, errors. | Overwritten each time you run `npm run dev`. |
| **`logs/dev-browser.log`** | **All** browser console output (console.log, console.info, etc.). Live, appended during session. | Cleared when you start `npm run dev`; appended as logs occur. |
| **`logs/lint.log`** | Output from `npm run lint` (ESLint). Errors, warnings. | Overwritten each time you run `npm run lint`. |
| **`logs/build.log`** | Output from `npm run build` (tsc + Vite). Compile errors, build output. | Overwritten each time you run `npm run build`. |
| **`logs/unit-test.log`** | Output from `npm run test` (Vitest unit tests). Results, failures, stack traces. | Overwritten each time you run `npm run test`. |
| **`logs/e2e.log`** | Output from `npm run test:e2e` (Playwright). E2E results and errors. | Overwritten each time you run `npm run test:e2e`. |
| **`logs/ci-<run-id>.log`** | Full GitHub Actions run log (all jobs, all steps). For debugging CI failures. | Written when you run `npm run ci:fetch-logs` (or `ci:fetch-logs <run-id>`). |
| **`logs/render/deploy-*.log`** | Render deploy status + build logs. After a deploy, fetch to see if it passed. | Run `npm run render:fetch-logs`. |
| **`logs/render/runtime-*.log`** | Render live staging app logs (ad-hoc). When staging app misbehaves. | Run `npm run render:fetch-logs:runtime`. |

**CI logs:** When CI fails, run `npm run ci:fetch-logs` to pull the latest run’s log into `logs/ci-<id>.log`. Cursor can read that file to see the full failure and fix it. You can also download the `ci-logs-*` artifact from the Actions run. Requires `gh` CLI and `gh auth login`.

**Render logs:** Set `RENDER_API_KEY` and `RENDER_CORE_WEB_APP_SERVICE_ID` in `.env`. After a deploy, run `npm run render:fetch-logs` to get build status and logs. For live staging app logs, run `npm run render:fetch-logs:runtime`.

Every `npm run lint`, `npm run build`, `npm run test`, and `npm run test:e2e` tees its output to the terminal **and** to the matching log file (overwritten each run). So you can always review what happened, and Cursor can read the right file when something fails and fix it.

Log files in `logs/` can be committed (they're not in .gitignore). When you run lint, build, or tests, you can commit the updated log with the code so the history gives context (e.g. "lint was run, then code was changed"). Reviewers usually look at the full PR diff; log output alongside code can help explain what happened.

---


## Use the app logger (browser)

Import from `@/lib/logger` for structured app logs. In dev, **all** console output (including raw `console.log`) is captured to `logs/dev-browser.log` live.

```ts
import { logger } from "@/lib/logger";

logger.info("User clicked submit", { formId: "login" });
logger.error("Supabase query failed", { error: e.message });
```

Prefer `logger.*` for app behaviour. Raw `console.*` is also captured.

---

## What to log

- Key user actions (e.g. form submit, navigation).
- API / Supabase calls (e.g. “fetching X”, success or error).
- State changes that matter for debugging.
- Errors with context (message + optional data).

Don’t log secrets, tokens, or full request/response bodies.

---

See also: [.cursor/rules/logging.mdc](../.cursor/rules/logging.mdc) (Cursor rule: add logging and read log files when fixing things).
