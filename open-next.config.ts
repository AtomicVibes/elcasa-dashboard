import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

// Tell OpenNext to run `next build` directly instead of `npm run build`,
// preventing recursive re-triggering when `build` script includes `opennextjs-cloudflare build`.
(config as any).buildCommand = "next build";

export default config;
