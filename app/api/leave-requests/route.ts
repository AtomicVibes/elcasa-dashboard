import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');

    let query = `
      SELECT
        lr.*,
        row_to_json(u.*) AS "user",
        row_to_json(j.*) AS job,
        row_to_json(r.*) AS reviewer
      FROM leave_requests lr
      LEFT JOIN users u ON u.id = lr.user_id
      LEFT JOIN jobs j ON j.id = lr.job_id
      LEFT JOIN users r ON r.id = lr.reviewed_by
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (userId) {
      conditions.push(`lr.user_id = $${params.length + 1}`);
      params.push(Number(userId));
    }
    if (status) {
      conditions.push(`lr.status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY lr.start_date DESC';

    const rows = await sql.query(query, params);

    const payload = ((rows as any[]) || []).map((r: any) => ({
      ...serializeLeave(r),
      user:     r.user     ? { id: r.user.id,    name: r.user.full_name,  email: r.user.email }    : null,
      job:      r.job      ? { id: r.job.id,     title: r.job.title }                             : null,
      reviewer: r.reviewer ? { id: r.reviewer.id, name: r.reviewer.full_name }                    : null,
    }));

    log('leave.list', { count: payload.length, userId, status });
    return NextResponse.json<LeaveRequestDTO[]>(payload);
  } catch (err) {
    logError('leave.list.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { userId, jobId, type, startDate, endDate, reason } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'userId, startDate, endDate are required' }, { status: 400 });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
    }

    const created = await sql`
      INSERT INTO leave_requests (user_id, job_id, type, start_date, end_date, reason, status)
      VALUES (${Number(userId)}, ${jobId ? Number(jobId) : null}, ${type ?? 'personal'}, ${startDate}, ${endDate}, ${reason ?? null}, 'pending')
      RETURNING *
    `;

    log('leave.create', { id: created[0]?.id, userId });
    return NextResponse.json(serializeLeave(created[0]), { status: 201 });
  } catch (err) {
    logError('leave.create.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
