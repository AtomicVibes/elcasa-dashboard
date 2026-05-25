import { NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import { serializeLeave } from '@/app/lib/types';
import type { LeaveRequestDTO } from '@/app/lib/types';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const url    = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        user:user_id (
          id, full_name, email
        ),
        job:job_id (
          id, title
        ),
        reviewer:reviewed_by (
          id, full_name, email
        )
      `)
      .order('start_date', { ascending: false });

    if (userId) query = query.eq('user_id', Number(userId));
    if (status) query = query.eq('status', status);

    const { data: rows, error } = await query;

    if (error) throw error;

    const payload = ((rows as any[]) || []).map((r: any) => ({
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

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { userId, jobId, type, startDate, endDate, reason } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'userId, startDate, endDate are required' }, { status: 400 });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
    }

    const { data: created, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: Number(userId),
        job_id:  jobId  ? Number(jobId)  : null,
        type:    type   ?? 'personal',
        start_date: startDate,
        end_date:   endDate,
        reason:     reason ?? null,
        status:     'pending',
      })
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json(serializeLeave(created), { status: 201 });
  } catch (err) {
    console.error('[POST /api/leave-requests]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
