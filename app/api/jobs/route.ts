import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const url      = new URL(request.url);
    const status   = url.searchParams.get('status');
    const customer = url.searchParams.get('customerId');

    let query = `
      SELECT
        j.*,
        row_to_json(c.*) AS customer,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ja.id,
              'user_id', ja.user_id,
              'role_on_job', ja.role_on_job,
              'user', CASE WHEN u.id IS NOT NULL THEN json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) ELSE NULL END
            )
          ) FILTER (WHERE ja.id IS NOT NULL),
          '[]'::json
        ) AS assignees
      FROM jobs j
      LEFT JOIN customers c ON c.id = j.customer_id
      LEFT JOIN job_assignees ja ON ja.job_id = j.id
      LEFT JOIN users u ON u.id = ja.user_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push(`j.status = $${params.length + 1}`);
      params.push(status);
    }
    if (customer) {
      conditions.push(`j.customer_id = $${params.length + 1}`);
      params.push(Number(customer));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY j.id, c.id ORDER BY j.created_at DESC';

    const rows = await sql.query(query, params);
    log('jobs.list', { count: rows?.length, status, customer });

    const payload: JobDTO[] = (rows || []).map((j: any) => ({
      ...serializeJob(j, false),
      assignees: (j.assignees || []).map((a: any) => ({
        id:       a.id,
        userId:   a.user_id,
        user:     a.user ? { id: a.user.id, name: a.user.full_name, email: a.user.email } : null,
        roleOnJob: a.role_on_job,
      })),
    })) as JobDTO[];

    return NextResponse.json(payload);
  } catch (err) {
    logError('jobs.list.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { title, description, location, category, budget, expenses, deadline, status, customerId } = body;

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const created = await sql`
      INSERT INTO jobs (title, description, location, category, budget, expenses, deadline, status, customer_id)
      VALUES (${title}, ${description ?? null}, ${location ?? null}, ${category ?? null}, ${budget ? String(budget) : null}, ${expenses ? String(expenses) : null}, ${deadline ?? null}, ${status ?? 'pending'}, ${customerId ?? null})
      RETURNING *
    `;

    log('jobs.create', { id: created[0]?.id, title });
    return NextResponse.json(serializeJob(created[0]), { status: 201 });
  } catch (err) {
    logError('jobs.create.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
