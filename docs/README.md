# Documentation index

All project docs in one place. Start with the [main README](../README.md) for setup and commands.

| Doc | What it covers |
|-----|----------------|
| [COMMITS_AND_WORKFLOW.md](COMMITS_AND_WORKFLOW.md) | Branch/PR/approval, Conventional Commits, golden rule (commit after every task), required detailed commit body. |
| [CI_CD_PIPELINE.md](CI_CD_PIPELINE.md) | Full CI/CD layout, project-scoped tests (web + design-system), Render setup, deployment platform as missing piece, logs. |
| [LOGGING.md](LOGGING.md) | All logs: browser console (live), dev server, CI (`ci:fetch-logs`), Render (`render:fetch-logs`, `render:fetch-logs:runtime`). Cursor can read them. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | LuxKit tokens, styled-components, Storybook. No Tailwind/shadcn. |
| [LUXURY_ESCAPES_FRONTEND_AND_DESIGN_SYSTEM_SPEC.md](LUXURY_ESCAPES_FRONTEND_AND_DESIGN_SYSTEM_SPEC.md) | LuxKit spec: tokens, primitives, styled-components, no npm publish. |
| [ENVIRONMENTS.md](ENVIRONMENTS.md) | Local, staging, production. Supabase projects, env vars. |
| [CURSOR_AND_WORKSPACE.md](CURSOR_AND_WORKSPACE.md) | Cursor rules, terminals, optional workspace/Codespaces. |

**AI development philosophy** (README + `.cursor/rules/ai-development-philosophy.mdc`): Maximize visibility, minimize friction, no stuck loops. All logs locally; Cursor fetches and reads them to fix things.

**Next phase** ([BACKLOG.md](../BACKLOG.md)): Nx monorepo (core-web-app, design-system), Docker for each, GitHub Actions per project, Render hosting.

GitHub Actions and workflows: [.github/README.md](../.github/README.md).
