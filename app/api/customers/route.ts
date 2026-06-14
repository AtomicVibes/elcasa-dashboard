import type { NextRequest } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';

export async function GET(_req: NextRequest) {
  try {
    const sql = getDb();
    const customers = await sql`SELECT * FROM customers ORDER BY created_at DESC`;
    log('customers.list', { count: customers?.length });
    return Response.json({ customers }, { status: 200 });
  } catch (err) {
    logError('customers.list.error', err);
    const message = err instanceof Error ? err.message : 'Database connectivity error';
    return Response.json(
      { error: 'Failed to fetch customers', message },
      { status: 500 },
    );
  }
}
