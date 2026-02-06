#!/usr/bin/env node
/**
 * Usage: node scripts/run-with-log.mjs <logname> <cmd> [args...]
 * Runs the command and tees stdout/stderr to logs/<logname>.log (overwritten each run).
 * Example: node scripts/run-with-log.mjs lint npx eslint .
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const [, , logName, cmd, ...args] = process.argv;
if (!logName || !cmd) {
  console.error("Usage: run-with-log.mjs <logname> <cmd> [args...]");
  process.exit(1);
}

const logPath = path.join(root, "logs", `${logName}.log`);
fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, `# ${logName} run started ${new Date().toISOString()}\n\n`, "utf8");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const child = spawn(cmd, args, {
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
