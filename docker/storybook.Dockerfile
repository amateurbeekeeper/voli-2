# Storybook static image: build design-system Storybook, serve with nginx
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npx nx run design-system:build-storybook

FROM nginx:alpine AS serve
COPY --from=build /app/libs/design-system/storybook-static /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
