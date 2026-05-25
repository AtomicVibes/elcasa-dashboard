import { NextResponse } from 'next/server';
import { Job }  from '@/app/lib/models';
import { Customer } from '@/app/lib/models';
import { JobAssignee } from '@/app/lib/models';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

// ─── GET /api/jobs ──────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const url       = new URL(request.url);
    const status    = url.searchParams.get('status');
    const customer  = url.searchParams.get('customerId');

    const where: Record<string, any> = {};
    if (status)       where.status        = status;
    if (customer)     where.customer_id   = Number(customer);

    const jobs = await (Job as any).findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'full_name', 'email'],
      }],
      order: [['created_at', 'DESC']],
    });

    const payload: JobDTO[] = [];
    for (const j of jobs as any[]) {
      const assignees = await (JobAssignee as any).findAll({
        where: { job_id: j.id },
        include: [{ model: (require('@/app/lib/models') as any).User, as: 'user', attributes: ['id','full_name','email'] }],
      });
      payload.push({
        ...serializeJob(j, false),
        assignees: assignees.map((a: any) => ({
          id:     a.id,
          userId: a.user_id,
          user:   { id: a.user?.id, name: a.user?.full_name, email: a.user?.email },
          roleOnJob: a.role_on_job,
        })),
      } as JobDTO);
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ─── POST /api/jobs ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, location, category, budget, expenses, deadline, status, customerId } = body;

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const created = await Job.create({
      title, description: description ?? null, location: location ?? null,
      category: category ?? null,
      budget:    budget    ? String(budget)  : null,
      expenses:  expenses  ? String(expenses) : null,
      deadline:  deadline  ?? null,
      status:    status    ?? 'pending',
      customerId: customerId ?? null,
    });

    return NextResponse.json(serializeJob(created), { status: 201 });
  } catch (err) {
    console.error('[POST /api/jobs]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
