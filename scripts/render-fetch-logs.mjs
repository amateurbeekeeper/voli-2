#!/usr/bin/env node
/**
 * Fetch Render deploy status + build logs, or runtime logs from live staging app.
 * Requires: RENDER_API_KEY, RENDER_CORE_WEB_APP_SERVICE_ID (or RENDER_SERVICE_ID) from env or .env.
 *
 * Usage:
 *   npm run render:fetch-logs           # deploy status + deploy logs (latest)
 *   npm run render:fetch-logs --runtime # runtime logs from live app (ad-hoc)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logsDir = path.join(root, 'logs', 'render');
fs.mkdirSync(logsDir, { recursive: true });

const apiKey = process.env.RENDER_API_KEY;
const serviceId = process.env.RENDER_CORE_WEB_APP_SERVICE_ID || process.env.RENDER_SERVICE_ID;

if (!apiKey || !serviceId) {
  console.error('Need RENDER_API_KEY and RENDER_CORE_WEB_APP_SERVICE_ID (or RENDER_SERVICE_ID) in env (or .env).');
  console.error('Get API key: Render Dashboard → Account Settings → API Keys');
  console.error('Service ID: Render Dashboard → Your Service → URL has .../srv-xxx');
  process.exit(1);
}

const BASE = 'https://api.render.com/v1';
const headers = { Authorization: `Bearer ${apiKey}` };

const isRuntime = process.argv.includes('--runtime');

async function apiGet(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Render API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (isRuntime) {
    // Fetch runtime logs (live app)
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const url = `${BASE}/logs?resourceIds=${serviceId}&startTime=${oneHourAgo}&endTime=${now}&limit=500`;
    try {
      const data = await apiGet(url);
      const lines = (data.logs || data).map((l) => (typeof l === 'string' ? l : l.message || JSON.stringify(l))).join('\n');
      const outPath = path.join(logsDir, `runtime-${timestamp}.log`);
      fs.writeFileSync(outPath, lines || '(no logs in last hour)', 'utf-8');
      console.log(`Saved to ${path.relative(root, outPath)}`);
    } catch (e) {
      console.error('Render runtime logs fetch failed:', e.message);
      process.exit(1);
    }
    return;
  }

  // Deploy status + deploy logs
  try {
    const deploys = await apiGet(`${BASE}/services/${serviceId}/deploys?limit=1`);
    const deploysList = Array.isArray(deploys) ? deploys : deploys.deploys || deploys.items || [];
    const latest = deploysList[0];
    if (!latest) {
      fs.writeFileSync(path.join(logsDir, `deploy-${timestamp}.log`), 'No deploys found\n', 'utf-8');
      console.log('No deploys found');
      return;
    }

    const statusBlock = [
      `Deploy: ${latest.id}`,
      `Status: ${latest.status}`,
      `Created: ${latest.createdAt}`,
      `Finished: ${latest.finishedAt || '(in progress)'}`,
      '',
    ].join('\n');

    // Fetch logs for this deploy (resourceIds can include deploy ID)
    const deployId = latest.id;
    const now = Date.now();
    const created = latest.createdAt ? new Date(latest.createdAt).getTime() : now - 3600000;
    const finished = latest.finishedAt ? new Date(latest.finishedAt).getTime() : now;
    const logUrl = `${BASE}/logs?resourceIds=${deployId}&startTime=${created}&endTime=${finished + 60000}&limit=1000`;
    let logContent = statusBlock;
    try {
      const logData = await apiGet(logUrl);
      const logs = logData.logs || logData;
      const lines = Array.isArray(logs) ? logs.map((l) => (typeof l === 'string' ? l : l.message || JSON.stringify(l))) : [JSON.stringify(logs)];
      logContent += lines.join('\n') || '(no deploy log entries)';
    } catch {
      logContent += '(could not fetch deploy log entries via API)';
    }

    const outPath = path.join(logsDir, `deploy-${timestamp}.log`);
    fs.writeFileSync(outPath, logContent, 'utf-8');
    console.log(`Saved to ${path.relative(root, outPath)}`);
    console.log(`Latest deploy: ${latest.status}`);
  } catch (e) {
    console.error('Render deploy fetch failed:', e.message);
    process.exit(1);
  }
}

main();
