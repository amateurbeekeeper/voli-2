#!/usr/bin/env node
/**
 * Runs the dev server and writes all terminal output to logs/dev-server.log (overwritten each run).
 * Cursor can read that file to see server-side logs and fix things. You still see output in the terminal.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logPath = path.join(root, "logs", "dev-server.log");

const logsDir = path.dirname(logPath);
fs.mkdirSync(logsDir, { recursive: true });
// Overwrite dev-server and dev-browser logs each run so Cursor sees only this session
fs.writeFileSync(logPath, `# Dev server started ${new Date().toISOString()}\n\n`, "utf8");
const browserLogPath = path.join(logsDir, "dev-browser.log");
fs.writeFileSync(browserLogPath, `# Browser log (this session) ${new Date().toISOString()}\n\n`, "utf8");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const child = spawn("npx", ["vite"], {
  cwd: root,
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
});

function tee(data, isStderr) {
  const out = process[isStderr ? "stderr" : "stdout"];
  out.write(data);
  logStream.write(data);
}

child.stdout.on("data", (d) => tee(d, false));
child.stderr.on("data", (d) => tee(d, true));
child.on("close", (code) => {
  logStream.end();
  process.exit(code ?? 0);
});
child.on("error", (err) => {
  logStream.write(String(err));
  logStream.end();
  process.exit(1);
});
