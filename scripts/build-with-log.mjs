#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logPath = path.join(root, "logs", "build.log");

fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, `# Build run started ${new Date().toISOString()}\n\n`, "utf8");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const child = spawn("npx", ["nx", "run-many", "-t", "build", "-p", "core-web-app"], {
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
