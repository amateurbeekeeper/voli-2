/**
 * App logger. In dev: logs to console and sends to the dev server, which writes to logs/dev-browser.log
 * so Cursor (and you) can read browser logs from the repo. In prod: console only (or strip if you prefer).
 */
const isDev = import.meta.env.DEV;
const LOG_ENDPOINT = "/__log";

function sendToDevLog(level: string, message: string, data?: unknown) {
  if (!isDev) return;
  try {
    fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, data }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export const logger = {
  log(message: string, data?: unknown) {
    console.log(message, data ?? "");
    sendToDevLog("log", message, data);
  },
  info(message: string, data?: unknown) {
    console.info(message, data ?? "");
    sendToDevLog("info", message, data);
  },
  warn(message: string, data?: unknown) {
    console.warn(message, data ?? "");
    sendToDevLog("warn", message, data);
  },
  error(message: string, data?: unknown) {
    console.error(message, data ?? "");
    sendToDevLog("error", message, data);
  },
};
