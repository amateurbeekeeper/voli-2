# Render deploy setup

For CI to deploy to Render and for local `render:fetch-logs` to work.

## 1. Get your Render credentials

1. **API key:** Render Dashboard → Account Settings → [API Keys](https://dashboard.render.com/account/api-keys) → Create API Key
2. **Web service ID:** Open your core-web-app service → URL is `https://dashboard.render.com/web/srv-XXXXX` → the `srv-XXXXX` part is the ID
3. **Storybook service ID:** Same for your Storybook service

## 2. Local use (fetch-logs, deploy-and-wait)

Add to `.env` in the repo root (copy from `.env.example`):

```bash
RENDER_API_KEY=rnd_xxxxxxxxxxxxx
RENDER_CORE_WEB_APP_SERVICE_ID=srv-xxxxxxxxxxxxx
```

Then run:

```bash
npm run render:validate-setup   # Check it works
npm run render:fetch-logs       # Pull deploy logs
```

## 3. GitHub Actions deploy (push to main)

Add these **repo secrets**: Settings → Secrets and variables → Actions → New repository secret

| Secret | Value |
|--------|-------|
| `RENDER_API_KEY` | Your Render API key |
| `RENDER_CORE_WEB_APP_SERVICE_ID` | Web app service ID (srv-xxx) |
| `RENDER_SERVICE_ID_STORYBOOK` | Storybook service ID (srv-xxx) |

Once set, every push to `main` that passes CI will trigger deploys to both services and wait for success/failure.

## 4. Verify

- **Local:** `npm run render:validate-setup` should print "OK — service ..."
- **CI:** Push to main, check Actions → the deploy-render-web and deploy-render-storybook jobs should run and poll until Render reports live or failed
