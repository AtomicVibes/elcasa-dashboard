import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

// Run `next build` directly instead of `npm run build` to prevent
// recursive re-triggering when build script is `opennextjs-cloudflare build`.
(config as any).buildCommand = "next build";

export default config;
