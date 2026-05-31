import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

// Custom build script: runs `next build`, then copies `middleware.js`
// into `.next/standalone/` — required because Next.js 16 omits it from
// the standalone output, but OpenNext' s copyTracedFiles expects it.
(config as any).buildCommand = "node scripts/build.cjs";

export default config;
