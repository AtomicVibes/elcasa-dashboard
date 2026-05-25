import { NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import { serializeJob } from '@/app/lib/types';
import type { JobDTO } from '@/app/lib/types';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const url       = new URL(request.url);
    const status    = url.searchParams.get('status');
    const customer  = url.searchParams.get('customerId');

    let query = supabase
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
      .order('created_at', { ascending: false });

    if (status)   query = query.eq('status', status);
    if (customer) query = query.eq('customer_id', Number(customer));

    const { data: jobs, error } = await query;

    if (error) throw error;

    const payload: JobDTO[] = ((jobs as any[]) || []).map((j: any) => ({
      ...serializeJob(j, false),
      assignees: (j.assignees || []).map((a: any) => ({
        id:       a.id,
        userId:   a.user_id,
        user:     a.user ? { id: a.user.id, name: a.user.full_name, email: a.user.email } : null,
        roleOnJob: a.role_on_job,
      })),
    })) as JobDTO[];

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { title, description, location, category, budget, expenses, deadline, status, customerId } = body;

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data: created, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description: description ?? null,
        location: location ?? null,
        category: category ?? null,
        budget:    budget    ? String(budget)  : null,
        expenses:  expenses  ? String(expenses) : null,
        deadline:  deadline  ?? null,
        status:    status    ?? 'pending',
        customer_id: customerId ?? null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json(serializeJob(created), { status: 201 });
  } catch (err) {
    console.error('[POST /api/jobs]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
