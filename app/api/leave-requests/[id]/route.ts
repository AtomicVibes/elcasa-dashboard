import { NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: row, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json<LeaveRequestDTO>(serializeLeave(row));
  } catch (err) {
    console.error('[GET /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
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

    const { data: updated, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', Number(id))
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json<LeaveRequestDTO>(serializeLeave(updated));
  } catch (err) {
    console.error('[PATCH /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { error, count } = await supabase
      .from('leave_requests')
      .delete({ count: 'exact' })
      .eq('id', Number(id));

    if (error) throw error;
    if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/leave-requests/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
