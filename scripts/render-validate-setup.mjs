#!/usr/bin/env node
/**
 * Validate Render setup: check .env and optionally test API.
 * Run: npm run render:validate-setup
 */
import 'dotenv/config';

const apiKey = process.env.RENDER_API_KEY;
const coreWebId = process.env.RENDER_CORE_WEB_APP_SERVICE_ID;
const serviceId = process.env.RENDER_SERVICE_ID;
const storybookId = process.env.RENDER_SERVICE_ID_STORYBOOK;

console.log('Render setup check:\n');
console.log('  RENDER_API_KEY:              ', apiKey ? `set (${apiKey.slice(0, 8)}...)` : 'NOT SET');
console.log('  RENDER_CORE_WEB_APP_SERVICE_ID:', coreWebId || 'NOT SET');
console.log('  RENDER_SERVICE_ID:           ', serviceId || '(optional, for fetch-logs)');
console.log('  RENDER_SERVICE_ID_STORYBOOK: ', storybookId || '(GitHub secret only)');
console.log('');

const webId = coreWebId || serviceId;
if (!apiKey || !webId) {
  console.log('Missing: Add to .env (copy from .env.example):');
  if (!apiKey) console.log('  RENDER_API_KEY=<your-key>');
  if (!webId) console.log('  RENDER_CORE_WEB_APP_SERVICE_ID=srv-xxxxx');
  console.log('\nFor GitHub Actions deploy, add repo secrets:');
  console.log('  Settings → Secrets and variables → Actions → New repository secret');
  console.log('  - RENDER_API_KEY');
  console.log('  - RENDER_CORE_WEB_APP_SERVICE_ID');
  console.log('  - RENDER_SERVICE_ID_STORYBOOK');
  process.exit(1);
}

// Test API
console.log('Testing Render API...');
const res = await fetch(`https://api.render.com/v1/services/${webId}`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
if (!res.ok) {
  console.error(`API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const svc = await res.json();
console.log(`OK — service "${svc.service?.name || 'unknown'}" (${webId})`);
console.log('\nLocal fetch-logs will work. For CI deploy, add the 3 secrets to GitHub.');
