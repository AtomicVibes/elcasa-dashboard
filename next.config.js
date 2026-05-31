const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const phase = process.env.NEXT_PHASE ?? 'unknown';
  console.warn(
    `[next.config] Supabase env vars missing (phase=${phase}).\n` +
    `  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ set' : '✗ missing'}\n` +
    `  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ set' : '✗ missing'}\n` +
    `  Build will proceed, but pages calling getSupabase() will fail at runtime.`
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
};

module.exports = nextConfig;
