<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture-rules -->
# Architecture: Cloudflare-compatible Supabase-only

This project is deployed on Cloudflare Workers via OpenNext. The database layer is **Supabase only**.

## Do NOT use
- `sequelize` — removed, Cloudflare-incompatible (`pg-cloudflare`)
- `pg` / `pg-hstore` — removed, Cloudflare-incompatible
- `umzug` — removed, migration tooling
- `dotenv` — removed (Next.js handles `.env.local`)
- `jsonwebtoken` — removed (use `getSupabase().auth.getUser()` instead)

## Database access
- **Single entry point**: `getSupabase()` from `@/app/lib/supabase`
- Lazy singleton — never initialized at module scope
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## API route conventions
- No `export const runtime = 'nodejs'` (all routes run on Edge/Workers)
- Import `getSupabase` from `@/app/lib/supabase`
- Use Supabase `.from()` / `.select()` / `.insert()` / `.update()` / `.delete()` only
- Use `supabase.auth.getUser(token)` for JWT verification instead of `jsonwebtoken`
- Serializers in `@/app/lib/types` map DB snake_case → DTO camelCase

## Removed files
- `app/lib/db.ts`, `app/lib/models.ts`, `app/lib/migrate.ts`
- `types/sequelize.d.ts`, `types/pg.d.ts`
- `migrations/` directory
<!-- END:architecture-rules -->
