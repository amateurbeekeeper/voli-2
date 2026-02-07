#!/usr/bin/env node
/**
 * Trigger a Render deploy via API and wait until it completes (success or failure).
 * Fails the process if the deploy fails on Render.
 *
 * Requires: RENDER_API_KEY, RENDER_CORE_WEB_APP_SERVICE_ID or RENDER_SERVICE_ID (env or GitHub Actions secrets).
 *
 * Usage:
 *   node scripts/render-deploy-and-wait.mjs [serviceId]
 *   RENDER_CORE_WEB_APP_SERVICE_ID=srv-xxx node scripts/render-deploy-and-wait.mjs
 */
const serviceId = process.argv[2] || process.env.RENDER_CORE_WEB_APP_SERVICE_ID || process.env.RENDER_SERVICE_ID;
const apiKey = process.env.RENDER_API_KEY;

if (!apiKey || !serviceId) {
  console.log('RENDER_API_KEY or service ID not set — skipping deploy (set GitHub secrets to enable).');
  process.exit(0);
}

const BASE = 'https://api.render.com/v1';
const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};

// Terminal statuses: live = success, others = failure
const SUCCESS = 'live';
const FAILURE = new Set(['build_failed', 'canceled', 'deactivated', 'failed']);

async function apiGet(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Render API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiPost(url, body = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Render API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log(`Triggering deploy for service ${serviceId}...`);

  const deploy = await apiPost(`${BASE}/services/${serviceId}/deploys`);
  const deployId = deploy.id;
  if (!deployId) {
    console.error('No deploy ID in response:', deploy);
    process.exit(1);
  }

  console.log(`Deploy ${deployId} started. Polling for completion...`);

  const pollIntervalMs = 15000; // 15s - Render builds can take 10-20 min
  const maxWaitMs = 30 * 60 * 1000; // 30 min timeout
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const d = await apiGet(`${BASE}/services/${serviceId}/deploys/${deployId}`);
    const status = d.status || d.deploy?.status;

    console.log(`  [${new Date().toISOString()}] Status: ${status}`);

    if (status === SUCCESS) {
      console.log('Deploy succeeded.');
      process.exit(0);
    }

    if (FAILURE.has(status)) {
      console.error(`Deploy failed with status: ${status}`);
      process.exit(1);
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  console.error('Deploy did not complete within 30 minutes.');
  process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
