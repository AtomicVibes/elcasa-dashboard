// Post-build step for OpenNext/Cloudflare + Next.js 16
//
// Next.js 16 generates .next/server/middleware.js but does NOT
// include it in the standalone output.  OpenNext's copyTracedFiles
// finds the middleware.js.nft.json trace file, processes it, then
// checks for the actual JS — which is missing → build FAILS.
//
// This script runs next build, then copies the missing file into
// the standalone directory so the bundler can trace it.

const { execSync } = require("child_process");
const { copyFileSync, existsSync, mkdirSync } = require("fs");
const { join, resolve } = require("path");

const ROOT = resolve(__dirname, "..");

// ── Step 1: Run Next.js build ─────────────────────────────────────
console.log("\n[Build] Running next build...\n");
execSync("npx next build", { cwd: ROOT, stdio: "inherit" });

// ── Step 2: Copy middleware.js into standalone output ──────────────
const SRC = join(ROOT, ".next", "server", "middleware.js");
const DEST_DIR = join(ROOT, ".next", "standalone", ".next", "server");
const DEST = join(DEST_DIR, "middleware.js");

if (existsSync(SRC)) {
  if (!existsSync(DEST_DIR)) {
    mkdirSync(DEST_DIR, { recursive: true });
  }
  copyFileSync(SRC, DEST);
  console.log("[Build] ✓ Copied middleware.js → .next/standalone/.next/server/middleware.js");
} else {
  console.warn("[Build] ⚠ .next/server/middleware.js not found (no middleware configured?)");
}
