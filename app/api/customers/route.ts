import type { NextRequest } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Response.json({ customers }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database connectivity error';

    return Response.json(
      {
        error: 'Failed to fetch customers',
        message,
      },
      { status: 500 },
    );
  }
}
