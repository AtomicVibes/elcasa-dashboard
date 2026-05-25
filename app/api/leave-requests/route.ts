import { NextResponse } from 'next/server';
import { User, Job, LeaveRequest } from '@/app/lib/models';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

if (!(LeaveRequest as any).sequelize) {
  const m = require('@/app/lib/models') as typeof import('@/app/lib/models');
  [User, Job, LeaveRequest].forEach(M => (M as any).sequelize = m.sequelize);
}

// ─── GET /api/leave-requests ─────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const url    = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');

    const where: Record<string, any> = {};
    if (userId) where.user_id   = Number(userId);
    if (status) where.status    = status;

    const rows = await (LeaveRequest as any).findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [
        { model: User,  as: 'user',   attributes: ['id', 'full_name', 'email'] },
        { model: Job,   as: 'job',    attributes: ['id', 'title'] },
        { model: User,  as: 'reviewer', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['start_date', 'DESC']],
    });

    const payload = (rows as any[]).map((r) => ({
      ...serializeLeave(r),
      user:    r.user    ? { id: r.user.id,    name: r.user.full_name,  email: r.user.email }    : null,
      job:     r.job     ? { id: r.job.id,     title: r.job.title }                             : null,
      reviewer: r.reviewer ? { id: r.reviewer.id, name: r.reviewer.full_name } : null,
    }));

    return NextResponse.json<LeaveRequestDTO[]>(payload);
  } catch (err) {
    console.error('[GET /api/leave-requests]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ─── POST /api/leave-requests ─────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, jobId, type, startDate, endDate, reason } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'userId, startDate, endDate are required' }, { status: 400 });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
    }

    const created = await LeaveRequest.create({
      userId: Number(userId),
      jobId:  jobId  ? Number(jobId)  : null,
      type:   type   ?? 'personal',
      start_date: startDate,
      end_date:   endDate,
      reason:  reason ?? null,
      status:  'pending',
    });

    return NextResponse.json(serializeLeave(created), { status: 201 });
  } catch (err) {
    console.error('[POST /api/leave-requests]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
