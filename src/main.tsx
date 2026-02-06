// Dev: capture all console output to logs/dev-browser.log (live, appended)
if (import.meta.env.DEV) {
  const LOG = '/__log';
  const send = (level: string, args: unknown[]) => {
    try {
      const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      fetch(LOG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message: msg, data: args.length > 1 ? args[1] : undefined }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  };
  for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    const orig = console[level];
    console[level] = (...args: unknown[]) => {
      orig.apply(console, args);
      send(level, args);
    };
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
