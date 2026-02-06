/**
 * Dev-only: POST /__log writes browser logs to logs/dev-browser.log so Cursor (and humans) can read them.
 * Only active when running `vite` (dev server). Logs are in .gitignore.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
const logFilePath = path.join(dirname, "logs", "dev-browser.log");

function ensureLogDir() {
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

type ConnectMiddleware = (
  req: IncomingMessage & { url?: string; method?: string },
  res: ServerResponse,
  next: () => void
) => void;

export function viteDevLogPlugin() {
  return {
    name: "vite-dev-log",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use: (fn: ConnectMiddleware) => void } }) {
      ensureLogDir();
      server.middlewares.use((req: IncomingMessage & { url?: string; method?: string }, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith("/__log") || req.method !== "POST") {
          next();
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body || "{}");
            const line =
              [
                new Date().toISOString(),
                payload.level ?? "info",
                payload.message ?? "",
                payload.data != null ? JSON.stringify(payload.data) : "",
              ]
                .filter(Boolean)
                .join(" ") + "\n";
            fs.appendFileSync(logFilePath, line);
          } catch {
            // ignore parse errors
          }
          res.statusCode = 204;
          res.end();
        });
      });
    },
  };
}
