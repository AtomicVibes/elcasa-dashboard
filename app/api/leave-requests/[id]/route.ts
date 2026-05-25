import { NextResponse } from 'next/server';
import { LeaveRequest } from '@/app/lib/models';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

if (!(LeaveRequest as any).sequelize) {
  (LeaveRequest as any).sequelize = (require('@/app/lib/models') as any).sequelize;
}

// ─── GET /api/leave-requests/[id] ────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row     = await (LeaveRequest as any).findByPk(Number(id));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json<LeaveRequestDTO>(serializeLeave(row));
  } catch (err) {
    console.error('[GET /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ─── PATCH /api/leave-requests/[id] ──────────────────────────────────────────
// Used to approve/deny a leave request by a manager
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body    = await request.json();

    const allowed = ['status','reviewNote','reason','startDate','endDate'] as const;
    const updates: Record<string, any> = {};
    const snakeMap: Record<string, string> = { reviewNote: 'review_note', startDate: 'start_date', endDate: 'end_date' };
    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as any)) {
        updates[snakeMap[k as string] ?? k] = body[k];
      }
    }

    if (!updates.status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    if (!['pending','approved','denied'].includes(updates.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [updated] = await LeaveRequest.update(updates, {
      where: { id: Number(id) },
      returning: true,
    } as any);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json<LeaveRequestDTO>(serializeLeave(updated));
  } catch (err) {
    console.error('[PATCH /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ─── DELETE /api/leave-requests/[id] ─────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const count   = await LeaveRequest.destroy({ where: { id: Number(id) } });
    if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
