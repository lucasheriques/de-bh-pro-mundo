import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const envPath = `${packageDir}.env.local`;
const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split("\n") : [];
const existing = lines
  .find((line) => line.startsWith("PRESENTER_KEY="))
  ?.slice("PRESENTER_KEY=".length);
const key = existing || randomBytes(16).toString("hex");

execFileSync("npx", ["convex", "env", "set", "PRESENTER_KEY", key, ...process.argv.slice(2)], {
  cwd: packageDir,
  stdio: ["ignore", "ignore", "inherit"],
});

if (!existing) {
  writeFileSync(envPath, [...lines.filter(Boolean), `PRESENTER_KEY=${key}`, ""].join("\n"));
}
console.log(`PRESENTER_KEY is set on the deployment and stored in ${envPath}`);
