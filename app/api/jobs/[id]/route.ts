import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

async function getJobWithAssignees(jobId: number): Promise<any | null> {
  const sql = getDb();

  const rows = await sql`
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
    WHERE j.id = ${jobId}
    GROUP BY j.id, c.id
  `;

  return rows.length > 0 ? rows[0] : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data   = await getJobWithAssignees(Number(id));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    log('jobs.get', { id });
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    logError('jobs.get.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body  = await request.json();

    const allowed = ['title','description','location','category','budget','expenses','deadline','status','customerId'] as const;
    const camelToSnake: Record<string, string> = { customerId: 'customer_id' };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as any)) {
        const col = camelToSnake[k] ?? k;
        setClauses.push(`${col} = $${idx++}`);
        values.push(body[k]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    values.push(Number(id));
    await sql.query(
      `UPDATE jobs SET ${setClauses.join(', ')} WHERE id = $${idx}`,
      values,
    );

    const data = await getJobWithAssignees(Number(id));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    log('jobs.update', { id });
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    logError('jobs.update.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const result = await sql`DELETE FROM jobs WHERE id = ${Number(id)} RETURNING id`;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('jobs.delete', { id });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    logError('jobs.delete.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
