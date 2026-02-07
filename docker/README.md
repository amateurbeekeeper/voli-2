# Docker

- **web.Dockerfile** — Builds `core-web-app`, serves with nginx on port 80.
- **storybook.Dockerfile** — Builds design-system Storybook static site, serves with nginx on port 80.
- **docker-compose.yml** — Runs both images locally.

## Commands (from repo root)

```bash
# Build and run web app only
npm run docker:web
docker run -p 8080:80 voli-2-web

# Build and run Storybook only
npm run docker:storybook
docker run -p 8081:80 voli-2-storybook

# Build and run both
npm run docker:up
# Web app: http://localhost:8080  |  Storybook: http://localhost:8081
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) builds both images on every push/PR to verify they build; images are not pushed to a registry unless you add a deploy step.
