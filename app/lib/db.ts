// app/lib/db.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central DB config consumed by Sequelize initialisation in models.ts.
//
// Runtime behaviour
// ─────────────────────────────────────────────────────────────────────────────
// • dotenv must be loaded before the first import of this module so that
//   process.env values are available when Sequelize is constructed.
// • sequelizeInstance in models.ts is module-scoped and only set once; repeated
//   HMR reloads in Next.js dev mode return the existing instance, preventing
//   connection-pool exhaustion.
// • The Postgres `pg` driver must be installed (`npm install pg`); `pg-hstore`
//   is a transitive peer-dependency required for JSONB/HStore mapping.
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import { join } from 'path';

// Load environment from multiple levels so both local and nested contexts work.
// .env.local overrides .env; called without side-effect suppression so every
// subsequent call is a harmless no-op.
dotenv.config({ path: '.env.local' });
dotenv.config();    // .env

export const dbConfig = {
  host:     process.env.DB_HOST   ?? 'localhost',
  port:     parseInt(process.env.DB_PORT ?? '5432',   10),
  user:     process.env.DB_USER   ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME   ?? 'fusionadevs_renovation',
};

// Helper: build a Postgres connection-string for adapters that accept URLs.
// Prefer connect-time SSL when NODE_TLS_REJECT_UNAUTHORIZED=0 (typical for
// local Docker / self-signed setups).
export function getConnectionUrl(): string {
  const { host, port, user, password, database } = dbConfig;
  const ssl     = process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ? '?sslmode=require' : '';
  const encoded = encodeURIComponent;
  return `postgres://${encoded(user)}:${encoded(password)}@${host}:${port}/${database}${ssl}`;
}

export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}
