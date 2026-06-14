import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const rows = await sql`SELECT * FROM leave_requests WHERE id = ${Number(id)}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('leave.get', { id });
    return NextResponse.json<LeaveRequestDTO>(serializeLeave(rows[0]));
  } catch (err) {
    logError('leave.get.error', err);
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

    const allowed = ['status','reviewNote','reason','startDate','endDate'] as const;
    const snakeMap: Record<string, string> = { reviewNote: 'review_note', startDate: 'start_date', endDate: 'end_date' };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as any)) {
        const col = snakeMap[k] ?? k;
        setClauses.push(`${col} = $${idx++}`);
        values.push(body[k]);
      }
    }

    if (!setClauses.find(c => c.startsWith('status'))) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const statusVal = values[setClauses.findIndex(c => c.startsWith('status'))];
    if (!['pending','approved','denied'].includes(statusVal)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    values.push(Number(id));
    const rows = await sql.query(
      `UPDATE leave_requests SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('leave.update', { id, status: body.status });
    return NextResponse.json<LeaveRequestDTO>(serializeLeave(rows[0]));
  } catch (err) {
    logError('leave.update.error', err);
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

    const result = await sql`DELETE FROM leave_requests WHERE id = ${Number(id)} RETURNING id`;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('leave.delete', { id });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    logError('leave.delete.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
