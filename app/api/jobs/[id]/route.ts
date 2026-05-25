import { NextResponse } from 'next/server';
import { Job, Customer, JobAssignee } from '@/app/lib/models';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

if (!(Job as any).sequelize) {
  const m = require('@/app/lib/models') as typeof import('@/app/lib/models');
  (Job as any).sequelize       = m.sequelize;
  (Customer as any).sequelize  = m.sequelize;
  (JobAssignee as any).sequelize = m.sequelize;
}

async function getJobWithAssignees(jobId: number): Promise<any & { assignees?: any[] }> {
  const job = await Job.findByPk(jobId, {
    include: [{
      model: Customer,
      as: 'customer',
      attributes: ['id', 'full_name', 'email'],
    }],
  });
  if (!job) return null;

  const assignees = await JobAssignee.findAll({
    where: { job_id: jobId },
    include: [{ model: (require('@/app/lib/models') as any).User, as: 'user', attributes: ['id','full_name','email'] }],
  });
  return { ...job.toJSON(), assignees };
}

// ─── GET /api/jobs/[id] ──────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data    = await getJobWithAssignees(Number(id));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    console.error('[GET /api/jobs/:id]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ─── PATCH /api/jobs/[id] ────────────────────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body    = await request.json();

    const allowed = ['title','description','location','category','budget','expenses','deadline','status','customerId'] as const;
    const updates: Record<string, any> = {};
    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as any)) {
        const col = k === 'customerId' ? 'customer_id' : k;
        updates[col] = body[k];
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    const [updated] = await Job.update(updates, {
      where: { id: Number(id) },
      returning: true,
    } as any);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = await getJobWithAssignees(Number(id));
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    console.error('[PATCH /api/jobs/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── DELETE /api/jobs/[id] ───────────────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const count   = await Job.destroy({ where: { id: Number(id) } });
    if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/jobs/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
