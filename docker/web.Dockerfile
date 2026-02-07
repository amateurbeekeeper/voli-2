# Web app image: build core-web-app, serve with nginx
# Same Node as .nvmrc and CI
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npx nx run core-web-app:build

FROM nginx:alpine AS serve
COPY --from=build /app/dist/apps/core-web-app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
