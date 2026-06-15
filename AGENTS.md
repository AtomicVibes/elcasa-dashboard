<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture-rules -->
# Architecture: Cloudflare-compatible Neon Serverless Postgres

This project is deployed on Cloudflare Workers via OpenNext. The database layer is **Neon Serverless Postgres** with **Neon Auth** for authentication.

## Do NOT use
- `supabase` / `@supabase/supabase-js` — not used (remnants only)
- `pg` / `pg-hstore` — Cloudflare-incompatible
- `sequelize` — Cloudflare-incompatible
- `dotenv` — Next.js handles `.env.local`
- `jsonwebtoken` — use `auth.getSession()` from `@neondatabase/auth` instead

## Database access
- **Entry point**: `getDb()` from `@/app/lib/db`
- Uses `@neondatabase/serverless` (HTTP-based serverless driver)
- Singleton lazy pattern via `neon()` tagged template function
- Environment variables: `DATABASE_URL` (Neon pooled connection string)

## Authentication
- **Neon Auth** via `@neondatabase/auth`
- Server instance: `auth` from `@/lib/auth/server` (`createNeonAuth`)
- Client instance: `authClient` from `@/lib/auth/client` (`createAuthClient`)
- API route: `app/api/auth/[...path]/route.ts` — catch-all handler
- Middleware: `middleware.ts` — protects routes with `auth.middleware()`
- Auth pages: `/auth/*` (sign-in, sign-up, etc.)

## API route conventions
- No `export const runtime = 'nodejs'` (all routes run on Edge/Workers)
- Use `getDb()` from `@/app/lib/db` for raw SQL via `@neondatabase/serverless`
- Use `auth.getSession()` from `@/lib/auth/server` for JWT/session verification
- Serializers in `@/app/lib/types` map DB snake_case → DTO camelCase

## Database tables (public schema)
- `users`, `customers`, `jobs`, `job_assignees`, `leave_requests`, `renovation_requests`, `messages`, `files`

## Environment variables (.env.local)
- `DATABASE_URL` — Neon pooled connection
- `DATABASE_URL_UNPOOLED` — Neon direct connection (for migrations)
- `NEON_AUTH_BASE_URL` — Neon Auth base URL
- `NEON_AUTH_COOKIE_SECRET` — Cookie signing secret (32+ chars)
- `NEON_AUTH_JWKS_URL` — JWKS endpoint for token verification
- `NEON_BRANCH` — Current Neon branch name
- `NEON_DATA_API_URL` — Neon Data API endpoint

## Removed files (legacy Supabase)
- `app/lib/supabase.ts` — does not exist; use `getDb()`
- `supabase/storage-rls-policies.sql` — reference only, not active
<!-- END:architecture-rules -->
