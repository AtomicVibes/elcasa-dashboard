import { NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

async function getJobWithAssignees(jobId: number): Promise<any | null> {
  const supabase = getSupabase();

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customer_id (
        id, full_name, email
      ),
      assignees:job_assignees (
        id,
        user_id,
        role_on_job,
        user:user_id (
          id, full_name, email
        )
      )
    `)
    .eq('id', jobId)
    .single();

  if (error || !job) return null;
  return job;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data   = await getJobWithAssignees(Number(id));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    console.error('[GET /api/jobs/:id]', err);
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

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', Number(id));

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      throw error;
    }

    const data = await getJobWithAssignees(Number(id));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json<JobDTO>(serializeJob(data) as JobDTO);
  } catch (err) {
    console.error('[PATCH /api/jobs/:id]', err);
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
      .from('jobs')
      .delete({ count: 'exact' })
      .eq('id', Number(id));

    if (error) throw error;
    if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/jobs/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
