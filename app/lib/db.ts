import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (sql) return sql;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      sql = neon('postgresql://placeholder/neondb');
      return sql;
    }
    throw new Error('DATABASE_URL env var not set. Get it from Neon Console → Connection Details.');
  }

  sql = neon(databaseUrl);
  return sql;
}
