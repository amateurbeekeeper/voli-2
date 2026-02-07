# Same Node version as .nvmrc and CI — keeps local/cloud identical
FROM node:22-alpine AS base

WORKDIR /app

# Install deps (same as CI: lockfile-only)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Lint + unit test + build (no E2E; E2E needs browser deps, run in CI with playwright)
FROM deps AS verify
COPY . .
RUN npm run lint && npm run test && npm run build

# Optional: serve the built app (for production or "run like prod" locally)
FROM nginx:alpine AS serve
COPY --from=verify /app/dist/apps/core-web-app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
